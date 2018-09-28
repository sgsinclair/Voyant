Ext.define('Voyant.panel.Loom', {
    extend: 'Ext.panel.Panel',
    mixins: ['Voyant.panel.Panel'],
    alias: 'widget.loom',
    statics: {
        i18n: {
        	title: "Loom",
        	controls: "Controls",
        	frequenciesGroup: "Frequencies",
        	coverageGroup: "Coverage",
        	distributionsGroup: "Distribution",
        	termsGroup: "Terms",
        	inDocumentsLabel: "in documents",
        	inDocumentsLabelTip: "each term must be present in the number of documents defined by this range",
        	spanSomeLabel: "some documents",
        	spanSomeLabelTip: "each term must be present in at least one document defined by this range",
        	spanAllLabel: "all documents",
        	spanAllLabelTip: "each term must be present in all documents defined by this range",
        	spanOnlyLabel: "only documents",
        	spanOnlyLabelTip: "each term must be present in only the documents defined by this range",
        	rawFreqLabel: "raw frequency",
        	rawFreqLabelTip: "raw term frequencies for the term must be between these values (inclusively)",
        	rawFreqPercentileLabel: "raw frequency percentile",
        	rawFreqPercentileLabelTip: "raw term frequencies for the term must be between these percentile values (inclusively), this is useful for saying something like terms in the top 90th percentile which will provide 10% of words regardless of the variation in values.",
        	distributionsStdDevLabel: "standard deviation of distributions",
        	distributionsStdDevLabelTip: "the standard deviation of term distribution scores must be between the defined range of values (lower will be for values that are more consistent, higher will be for values that have greater variability)",
        	distributionsStdDevPercentileLabel: "percentile of standard deviations of distributions",
        	distributionsStdDevPercentileLabelTip: "the percentile of standard deviations of distributions must be between the defined range of values (lower will be for values that are more consistent, higher will be for values that have greater variability)",
        	termsLengthLabel: "term length",
        	termsLengthLabelTip: "the length (number of characters) of the term (word)",
        	termsLengthPercentileLabel: "term length percentile",
        	termsLengthPercentileLabelTip: "the percentile of the length (number of characters) of the term (word)",
        	distributionIncreasesLabel: "increases in distribution values",
        	distributionIncreasesLabelTip: "the number of increases of the distribution values must be between the defined range (inclusively)",
        	distributionConsecutiveIncreasesLabel: "consecutive decreases in distribution values",
        	distributionConsecutiveIncreasesLabelTip: "the number of consecutive decreases of the distribution values must be between the defined range (inclusively)",
        	distributionDecreasesLabel: "decreases in distribution values",
        	distributionDecreasesLabelTip: "the number of decreases of the distribution values must be between the defined range (inclusively)",
        	distributionConsecutiveDecreasesLabel: "consecutive decreases in distribution values",
        	distributionConsecutiveDecreasesLabelTip: "the number of consecutive decreases of the distribution values must be between the defined range (inclusively)",
        },
        api: {
            limit: 500,
            stopList: 'auto',
            inDocuments: undefined,
            spanSome: undefined,
            spanAll: undefined,
            spanOnly: undefined,
            termLength: undefined,
            rawFreq: undefined,
            rawFreqPercentile: undefined,
            distributionIncreases: undefined,
            distributionDecreases: undefined,
            distributionConsecutiveIncreases: undefined,
            distributionConsecutiveDecreases: undefined
        },
        glyph: 'xf1e0@FontAwesome'
    },
    
    config: {
    	store: undefined,
    	terms: undefined,
    	controls: undefined
    },


    constructor: function(config) {
        this.callParent(arguments);
        this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
        
    initComponent: function() {
    	
        this.mixins['Voyant.util.Api'].constructor.apply(this, arguments); // we need api
        
    	var controls = new Ext.util.MixedCollection({
    		allowFunctions: true
    	});
    	controls.addAll({
    		inDocuments: new Voyant.util.LoomControl({
	    		group: 'coverage',
	    		name: 'inDocuments',
	    		initControl: function(store) {
	    			this.setMin(1);
	    			this.setMax(store.getAt(0).getDistributions().length);
	        	},
	        	validateRecord: function(record) {
	        		var count = record.getDistributions().filter(function(val) {return val>0}).length;
	        		return count >= this.getLow() && count <= this.getHigh();
	        	}
    		}),
    		spanSome :new Voyant.util.LoomControl({
	    		group: 'coverage',
	    		name: 'spanSome',
	    		offsetTipText: true,
	    		initControl: function(store) {
	    			this.setMax(store.getAt(0).getDistributions().length-1);
	        	},
	        	validateRecord: function(record) {
	        		var low = this.getLow(), high = this.getHigh(), vals = record.getDistributions();
	        		for (var i=low; i<high+1; i++) {
	        			if (vals[i]>0) {return true}
	        		}
	        		return false;
	        	}
    		}),
    		spanAll :new Voyant.util.LoomControl({
	    		group: 'coverage',
	    		name: 'spanAll',
	    		offsetTipText: true,
	    		initControl: function(store) {
	    			this.setMax(store.getAt(0).getDistributions().length-1);
	        	},
	        	validateRecord: function(record) {
	        		var low = this.getLow(), high = this.getHigh(), vals = record.getDistributions();
	        		for (var i=low; i<high+1; i++) {
	        			if (vals[i]==0) {return false}
	        		}
	        		return true;
	        	}
    		}),
    		spanOnly :new Voyant.util.LoomControl({
	    		group: 'coverage',
	    		name: 'spanOnly',
	    		offsetTipText: true,
	    		initControl: function(store) {
	    			this.setMax(store.getAt(0).getDistributions().length-1);
	        	},
	        	validateRecord: function(record) {
	        		var low = this.getLow(), high = this.getHigh(), vals = record.getDistributions();
	        		for (var i=0; i<vals.length; i++) {
	        			if (i<low || i>high) {
	        				if (vals[i]>0) {return false}
	        			} else {
	        				if (vals[i]==0) {return false}
	        			}
	        		}
	        		return true;
	        	}
    		}),
    		rawFreq :new Voyant.util.LoomControl({
	    		group: 'frequencies',
	    		name: 'rawFreq',
	    		offsetTipText: true,
	    		initControl: function(store) {
	    			var vals = store.getRange().map(function(r) {return r.get('rawFreq')});
	    			this.setMin(Ext.Array.min(vals))
	    			this.setMax(Ext.Array.max(vals))
	        	},
	        	validateRecord: function(record) {
	        		var low = this.getLow(), high = this.getHigh(), val = record.get("rawFreq");
	        		return val>=low && val <= high;
	        	}
    		}),
    		rawFreqPercentile :new Voyant.util.LoomControl({
	    		group: 'frequencies',
	    		name: 'rawFreqPercentile',
	    		min: 0,
	    		max: 100,
	    		initControl: function(store) {
	    			this.vals = store.getRange().map(function(r) {return r.get('rawFreq')});
	    			this.vals.sort(function (a, b) {  return a - b;  });
	        	},
	        	validateRecord: function(record) {
	        		var low = this.getLow(), high = this.getHigh(),
	        			ind = Ext.Array.indexOf(this.vals, record.get("rawFreq")),
	        			val = Math.round(ind*100/this.vals.length)
	        		return val>=low && val <= high;
	        	}
    		}),
    		distributionsStdDev :new Voyant.util.LoomControl({
	    		group: 'frequencies',
	    		name: 'distributionsStdDev',
	    		initControl: function(store) {
	    			var allvals = Ext.Array.flatten(store.getRange().map(function(r) {return r.getDistributions()}));
	    			// we'll scale to all available distributions, otherwise we're not making similar comparisons
	    			var scale = d3.scaleLinear().domain([d3.min(allvals),d3.max(allvals)]).range([0,100]);
	    			store.each(function(record) {
	    				if (record.get("distributionsStdDev")===undefined) {
	    					// https://derickbailey.com/2014/09/21/calculating-standard-deviation-with-array-map-and-array-reduce-in-javascript/
	    					// https://gist.github.com/Daniel-Hug/7273430
		    				var vals = record.getDistributions();
		    				var scaledVals = vals.map(function(v) {return scale(v)});
		    				var avg = Ext.Array.mean(scaledVals);
							var squareDiffs = vals.map(function(value){
								    var diff = value - avg;
								    var sqrDiff = diff * diff;
								    return sqrDiff;
							});
							var avgSquareDiff = Ext.Array.mean(squareDiffs);
							var stdDev = Math.sqrt(avgSquareDiff);
							record.set("distributionsStdDev", stdDev);
	    				}
	    			})
	    			var vals = store.getRange().map(function(r) {return r.get('distributionsStdDev')});
	    			this.setMin(Ext.Array.min(vals))
	    			this.setMax(Ext.Array.max(vals))
	        	},
	        	validateRecord: function(record) {
	        		var low = this.getLow(), high = this.getHigh(),
	        			val = record.get("distributionsStdDev");
	        		return val>=low && val <= high;
	        	}
    		}),
    		distributionsStdDevPercentile :new Voyant.util.LoomControl({
	    		group: 'frequencies',
	    		name: 'distributionsStdDevPercentile',
	    		min: 0,
	    		max: 100,
	    		initControl: function(store) {
	    			this.vals = store.getRange().map(function(r) {return r.get('distributionsStdDev')});
	    			this.vals.sort(function (a, b) {  return a - b;  });
	        	},
	        	validateRecord: function(record) {
	        		var low = this.getLow(), high = this.getHigh(),
        				ind = Ext.Array.indexOf(this.vals, record.get("distributionsStdDev")),
        				val = Math.round(ind*100/this.vals.length)
        			return val>=low && val <= high;
	        	}
    		}),
    		termsLength :new Voyant.util.LoomControl({
	    		group: 'terms',
	    		name: 'termsLength',
	    		offsetTipText: true,
	    		initControl: function(store) {
	    			var vals = store.getRange().map(function(r) {return r.get('term').length});
	    			this.setMin(Ext.Array.min(vals))
	    			this.setMax(Ext.Array.max(vals))
	        	},
	        	validateRecord: function(record) {
	        		var low = this.getLow(), high = this.getHigh(), val = record.get("term").length;
	        		return val>=low && val <= high;
	        	}
    		}),
    		termsLengthPercentile :new Voyant.util.LoomControl({
	    		group: 'terms',
	    		name: 'termsLengthPercentile',
	    		min: 0,
	    		max: 100,
	    		initControl: function(store) {
	    			this.vals = store.getRange().map(function(r) {return r.get('term').length});
	    			this.vals.sort(function (a, b) {  return a - b;  });
	        	},
	        	validateRecord: function(record) {
	        		var low = this.getLow(), high = this.getHigh(),
        				ind = Ext.Array.indexOf(this.vals, record.get("term").length),
        				val = Math.round(ind*100/this.vals.length)
        			return val>=low && val <= high;
	        	}
    		}),
    		distributionIncreases :new Voyant.util.LoomControl({
	    		group: 'distributions',
	    		name: 'distributionIncreases',
	    		initControl: function(store) {
	    			this.setMax(store.getAt(0).getDistributions().length);
	        	},
	        	validateRecord: function(record) {
	        		var low = this.getLow(), high = this.getHigh(), vals = record.getDistributions();
	        		var increases = 0;
	        		for (var i=1;i<vals.length;i++) {
	        			if (vals[i]>vals[i-1]) {
	        				increases++;
	        				if (increases>high) {return false}
	        			}
	        		}
	        		return increases>=low;
	        	}
    		}),
    		distributionConsecutiveIncreases :new Voyant.util.LoomControl({
	    		group: 'distributions',
	    		name: 'distributionConsecutiveIncreases',
	    		initControl: function(store) {
	    			this.setMax(store.getAt(0).getDistributions().length);
	        	},
	        	validateRecord: function(record) {
	        		var low = this.getLow(), high = this.getHigh(), vals = record.getDistributions();
	        		var increases = 0;
	        		for (var i=1;i<vals.length;i++) {
	        			if (vals[i]>vals[i-1]) {
	        				increases++;
	        				if (increases>high) {return false}
	        			} else {
	        				increases=0;
	        			}
	        		}
	        		return increases>=low;
	        	}
    		}),
    		distributionDecreases :new Voyant.util.LoomControl({
	    		group: 'distributions',
	    		name: 'distributionDecreases',
	    		initControl: function(store) {
	    			this.setMax(store.getAt(0).getDistributions().length);
	        	},
	        	validateRecord: function(record) {
	        		var low = this.getLow(), high = this.getHigh(), vals = record.getDistributions();
	        		var decreases = 0;
	        		for (var i=1;i<vals.length;i++) {
	        			if (vals[i]<vals[i-1]) {
	        				decreases++;
	        				if (decreases>high) {return false}
	        			}
	        		}
	        		return decreases>=low;
	        	}
    		}),
    		distributionConsecutiveDecreases :new Voyant.util.LoomControl({
	    		group: 'distributions',
	    		name: 'distributionConsecutiveDecreases',
	    		initControl: function(store) {
	    			this.setMax(store.getAt(0).getDistributions().length);
	        	},
	        	validateRecord: function(record) {
	        		var low = this.getLow(), high = this.getHigh(), vals = record.getDistributions();
	        		var decreases = 0;
	        		for (var i=1;i<vals.length;i++) {
	        			if (vals[i]<vals[i-1]) {
	        				decreases++;
	        				if (decreases>high) {return false}
	        			} else {
	        				decreases = 0;
	        			}
	        		}
	        		return decreases>=low;
	        	}
    		})
    	});

    	controls.each(function(control) {
    		var val = this.getApiParam(control.getName()), vals = (val || "").split(",");
    		control.setEnabled(val!==undefined);
    		if (vals.length==2) {
    			control.setLow(parseInt(vals[0]))
    			control.setHigh(parseInt(vals[1]))
    		}
    		control.on("change", function(control) {
    			if (control.getEnabled()) {
    				this.setApiParam(control.getName(), control.getLow()+","+control.getHigh());
    			} else {
    				this.setApiParam(control.getName(), undefined);
    			}
    			this.filterRecords();
    		}, this);
    	}, this);
    	this.setControls(controls);
    	
    	var tbitem = [{
    		text: this.localize("presetsGroup"),
    		menu: {
    			items: [{
    				text: this.localize('presetHighFreq'),
    				handler: function() {
    					{}
    				},
    				scope: this
    			},{
    				text: this.localize('presetHighFreqLonger'),
    				handler: function() {
    					{termLengthPercentile: 75}
    				},
    				scope: this
    			},{
    				text: this.localize('presetSingleDoc'),
    				handler: function() {
    					{spanOnly: "1,1"}
    				},
    				scope: this
    			},{
    				text: this.localize('presetIncreaseDistributions'),
    				handler: function() {
    					{distributionIncreases: "8,10"}
    				},
    				scope: this
    			},{
    				text: this.localize('presetDecreaseDistributions'),
    				handler: function() {
    					{spanOnly: "8,10"}
    				},
    				scope: this
    			},{
    				text: this.localize('presetDistributionsNearStart'),
    				handler: function() {
    					{spanOnly: "1,1"}
    				},
    				scope: this
    			},{
    				text: this.localize('presetDistributionsNearEnd'),
    				handler: function() {
    					{spanOnly: "1,1"}
    				},
    				scope: this
    			},{
    				text: this.localize('presetDistributionsSporadic'),
    				handler: function() {
    					{spanOnly: "1,1"}
    				},
    				scope: this
    			}]
    		}
    	}, {
    		xtype: 'tbspacer'
    	}];
    	var tbitems = ["frequencies","coverage","distributions","terms"].map(function(group) {
    		tbitems.append({
    			text: this.localize(group+"Group"),
    			menu: {
    				items: controls.filterBy(function(control) {return control.getGroup()==group}).getRange().map(function(control) {
    					return {
    						xtype: 'menucheckitem',
    						checked: control.getEnabled(),
							text: this.localize(control.getName()+"Label"),
							tooltip: this.localize(control.getName()+"LabelTip"),
							listeners: {
								beforerender: function(cmp) {
									cmp.setChecked(control.getEnabled());
									control.on("change", function() {
										cmp.setChecked(control.getEnabled());
									})
								},
								click: function(cmp) {
									control.setEnabled(cmp.checked)
									cmp.getMenu().setDisabled(!cmp.checked)
									if (cmp.checked) {cmp.getMenu().show();}
									else {cmp.getMenu().hide()}
								}
    						},
							menu: {
								disabled: !control.getEnabled(),
								items: {
									xtype: 'multislider',
									width: 100,
									minValue: control.getMin() || 0,
									maxValue: control.getMax() || 0,
									values: [(control.getLow() || 0), (control.getHigh() || 0)],
									tipText: function(t) {
										return control.getOffsetTipText() ? t.value+1 : t.value;
									},
									listeners: {
    									beforerender: function(slider) {
    										slider.updateFromControl(control);
    										control.on("change", function() {
    											slider.updateFromControl(control);
    										})
    									},
    									changecomplete: function(slider) {
    										control.setValues(slider.getValues());
    									}
									},
									updateFromControl: function(control) {
										this.setMinValue(control.getMin() || 0);
										this.setMaxValue(control.getMax());
										this.setValue(0, control.getLow() || 0)
										this.setValue(1, control.getHigh()===undefined ? (control.getMax() || 0) : control.getHigh())
									}
								}
							}
    					}
    				}, this)
    			}
    		});
    	}, this);
    	
        Ext.apply(this, {
            title: this.localize('title'),
            layout: {
            	type: 'hbox',
            	align: 'stretch'
            },
            listeners: {
            	afterrender: function() {
            		var terms = this.getComponent("terms"), threads = this.getComponent("threads");
            		
            		// this is a quick and dirty implementation to mirror actions in the terms panel to the threads panel,
            		// but it should probably redone locally to the threads logic and using the tips
            		terms.on("termHovered", function(src, term) {
            			var thick = threads.getTargetEl().dom.querySelector("path[term="+term+"]");
            			if (thick) {
                			var fadeIt = function(node, time) {
                				opacity = node.getAttribute("opacity");
                				if (opacity>0) {
                					opacity-=.01;
                					node.setAttribute("opacity", opacity)
                					time=time/2
                					Ext.defer(fadeIt, time, this, [node, time]);
                				}
                			}   
                			thick.setAttribute("opacity", 1);
                			fadeIt(thick, 1000);
            			}
            		})
            	}
            },
            items: [{
            	itemId: 'terms',
            	width: 100,
            	layout: 'fit',
            	listeners: {
            		filterchange: function(store) {
            			var el = this.getTargetEl(), width = el.getWidth(), height = el.getHeight(), len = store.getCount();
            			terms = store.getRange().map(function(r,i) {
            				return {
            					term: r.getTerm(),
            					col: Voyant.application.getColorForTerm(r.getTerm(), true),
            					x: width/2,
            					y: i*height/len
            				}
            			});
            			terms.sort(function(a, b) {return a.term.localeCompare(b.term)});
            			
            			// attempts to use fisheye code failed with larger number or words http://bl.ocks.org/jczaplew/8603055

            			
            			
          			  var svg = d3.select(el.dom).append("svg")
      			    .attr("width", width)
      			    .attr("height", height)
      			  .append("g")
      			    .attr("transform", "translate(-.5,-.5)");
          			  
          			var textHeight = Math.ceil(height/terms.length);
        			  var text = svg.selectAll("ytext")
      			    .data(terms)
      			  .enter().append("text")
      			    .text(function(d,i){return d.term})
      			    .attr("class", "ytext") 
      			    .attr("text-anchor", "middle")
    			  	.attr("x", width/2)
    			  	.attr("y", function(t, i) {return textHeight*i})
      			    .attr("fill", function(d) {return Voyant.application.getColorForTerm(d.term, true)})

            			var textHeight = Math.ceil(height/terms.length);

            			
            			var fisheye = d3.fisheye.circular()
	            		    .radius(50)
	            		    .distortion(2);
            			
            			yFisheye = d3.fisheye.scale(d3.scaleIdentity).domain([0, height]);
            			
            			var me = this;
            			svg.on("mousemove", function() {
            				var mouse = d3.mouse(this);
            					currentItem = Math.round(mouse[1]*terms.length/height),
            					currentItem = Math.min(currentItem, terms.length-1);
            				fisheye.focus(mouse[1]);
            				yFisheye.focus(mouse[1]);
            				
            			var nodes = text.nodes();
            			if (nodes[currentItem]) {
                			me.fireEvent("termHovered", me, nodes[currentItem].textContent)
            			}
            			
            			var fs = 14, y=Math.max(mouse[1],fs), fo=1;
            			d3.select(nodes[currentItem])
            				.attr("y", function(d) { return y })
            				.attr("font-size", fs)
            				.attr("fill-opacity", fo)
            				
            			var yin = undefined;
            			for (var i=currentItem-1;i>-1;i--) {
            				if (fs>=8) {
            					y-=fs
            					fs-=.5
            				} else {
            					if (yin==undefined) {
            						yin = y/i
            					}
            					y-=yin;
            				}
            				if (fo>.1) {fo-=.05}
                			d3.select(nodes[i])
            				.attr("y", function(d) { return y })
            				.attr("font-size", fs)
            				.attr("fill-opacity", fo)
            			}
            			
            			fs = 14, y=Math.max(mouse[1],fs), fo=1, yin=undefined;
            			

            			for (var i=currentItem+1,len=terms.length;i<len;i++) {
            				if (fs>=8) {
            					y+=fs
            					fs-=.5
            				} else {
            					if (yin==undefined) {
            						yin = (height-y)/(len-i)
            					}
            					y+=yin;
            				}
            				if (fo>.1) {fo-=.05}
                			d3.select(nodes[i])
            				.attr("y", function(d) { return y })
            				.attr("font-size", fs)
            				.attr("fill-opacity", fo)
            			}

            			})

            		}
            	}
            },{
            	itemId: 'threads',
//                html: '<canvas></canvas>',
                layout: 'fit',
                flex: 1,
                listeners: {
//                	boxready: function() {
//                		this.body.down("canvas").dom.width=this.getTargetEl().getWidth();
//                		this.body.down("canvas").dom.height=this.getTargetEl().getHeight();
//                	},
            		filterchange: function(store) {
            			var el = this.getTargetEl(), width = el.getWidth(), height = el.getHeight();
            			el.setHtml(" "); // empty
            			terms = store.getRange().map(function(r) {return {
            				term: r.getTerm(),
            				vals: r.getDistributions()
            			}})
            			var svg = d3.select(el.dom).append("svg")
            		      .attr("width", el.getWidth())
            		      .attr("height", el.getHeight());
            			
            			if (terms.length==0) {
            				return this.up("panel").toastInfo("No hits")
            			}
            			
            			var xincrement = width/terms[0].vals.length;
            			var yscale = d3.scaleLinear()
            				.domain([
            					Ext.Array.min(terms.map(function(t) {return Ext.Array.min(t.vals)})),
            					Ext.Array.max(terms.map(function(t) {return Ext.Array.max(t.vals)}))])
            				.range([0, height-2]);
            			
            			var valueline = d3.line()
            				.curve(d3.curveCardinal)
	            		    .x(function(d, i) { return (xincrement/2)+(xincrement*i)})
	            		    .y(function(d) { return height-1-yscale(d)});
            			
        			    var tooltip = svg.append("g")
        			    	.attr("opacity", 0);
        			    
        			    var tooltipbox = tooltip.append("rect")
        			    	.attr("fill", "white")
        			    	.attr("text-anchor", "middle")
        			    	.attr("alignment-baseline", "middle")
        			    	.attr("stroke", "rgba(0,0,0,.05)")
        			    	.attr("class", "rect")
        			    	.attr("x", 100)
        			    	.attr("y", 100)
        			    	.attr("width", 70)
        			    	.attr("height", 16)
        			    	.attr("opacity", 1)
        			    	
        			    var tooltiptext = tooltip
        			    	.append("text")
        			    	.attr("text-anchor", "middle")
        			    	.attr("alignment-baseline", "middle")
        			    	.attr("x", 100)
        			    	.attr("y", 100)
//        			    	.attr("width", 100)
//        			    	.attr("height", 12)
        			    	.text("testing")

            			terms.forEach(function(term) {
            				var color = Voyant.application.getColorForTerm(term.term, true)
            				
            				// draw a first line, always visible
            				svg.append("path")
            			      .datum(term.vals)
						      .attr("fill", "none")
						      .attr("stroke", color)
						      .attr("opacity", .5)
						      .attr("stroke-linejoin", "round")
						      .attr("stroke-linecap", "round")
						      .attr("stroke-width", 1)
						      .attr("class", "line")
            			      .attr("d", valueline)

            				
            			    // draw a second line to make it easier to hover (line width 1 is harder to find)
            				svg.append("path")
            			      .datum(term.vals)
						      .attr("fill", "none")
						      .attr("stroke", color)
						      .attr("opacity", 0)
						      .attr("stroke-width", 3)
						      .attr("class", "line")
            			      .attr("term", term.term)
            			      .attr("d", valueline)
						      .on('mouseover', function() { // on mouse out hide line, circles and text
						    	  d3.select(this)
						    	  	.attr("opacity", 1);
						    	  
						    	  var coords = d3.mouse(this);
						    	  
						    	  tooltip
						    	  	.attr("opacity", 1)
						    	  	
						    	  tooltipbox
						    	  	.attr("x", coords[0]-35)
						    	  	.attr("y", coords[1] -8+ (coords[1]>height/2 ? -18 : 18))
							    	 
						    	  tooltiptext
							    	  	.text(term.term)
							    	  	.attr("fill", color)
							    	  	.attr("x", coords[0])
							    	  	.attr("y", coords[1] + (coords[1]>height/2 ? -18 : 18))

						      })
						      .on('mouseout', function() { // on mouse out hide line, circles and text
						    	  d3.select(this)
						    	  	.attr("opacity", 0);
						    	  tooltip.attr("opacity", 0)
						      })
						      
						      tooltip.raise(); // make sure this is at top level for legibility

            			}, this)
            		}

                }
            }],
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                items: [{
                	text: this.localize("controls"),
                	tooltip: this.localize("controlsTip"),
                	menu: {
                    	items: tbitems
                	}
                }]
              }]
        });
        
        this.on('loadedCorpus', function(src, corpus) {
        	var store = corpus.getDocumentsCount()==1 ? corpus.getDocumentTerms() : corpus.getCorpusTerms();
        	store.on("load", function() {
        	    this.updateControlsFromStore();
		    	this.filterRecords();
        	}, this);
        	store.on("filterchange", function() {
        		this.getComponent("terms").fireEventArgs("filterchange", arguments);
        		this.getComponent("threads").fireEventArgs("filterchange", arguments);
        		
        	}, this);
        	this.setStore(store);
        	params = this.getApiParams();
        	Ext.apply(params, {
        		withDistributions: true
        	});
        	store.load({
    		    callback: function(records, operation, success) {
    		    	this.filterRecords();
    		    },
    		    scope: this,
    		    params: params
        	});

        }, this);
        
        this.callParent(arguments);
    },
    
    filterRecords: function() {
    	var store = this.getStore();
    	store.clearFilter();
    	store.filterBy(function(record) {
    		return Ext.Array.every(this.getControls().getRange(), function(control) {
    			return control.getEnabled()==false || control.getValidateRecord().call(control, record);
    		}, this);
    	}, this)
    },
    
    updateControlsFromStore: function() {
    	var store = this.getStore();
    	this.getControls().each(function(control) {
    		control.suspendEvent("change");
    		control.initControl.call(this, store);
    		if (control.getMin()===undefined) {control.setMin(0);}
    		if (control.getLow()==undefined) {control.setLow(control.getMin())}
    		if (control.getMax()===undefined) {control.setMax(1);} // shouldn't happen
    		if (control.getHigh()==undefined) {control.setHigh(control.getMax())}
    		control.resumeEvent("change");
    		control.fireEvent("change", control);
    	})
    },
    
    revalidate: function() {
    	var canvas = this.body.down('canvas').dom, ctx = canvas.getContext("2d");
    	ctx.clearRect(0,0,canvas.width,canvas.height);

    	var controls = this.query('loomcontrol');
    	
    	var loomTermRecords = new Voyant.panel.LoomTermRecords();
    	this.getStore().each(function(record) {
    		var vals = record.getDistributions().map(function(v) {return true;})
    		Ext.Array.each(controls, function(control) {
    			if (control.getChecked()) {
    				if (control.validateRecord) {
    					var newvals = control.validateRecord.call(this, control.getField(), record, record.getDistributions());
//    					console.warn(control.getName(), newvals)
    					if (Ext.isBoolean(newvals) && !newvals) {
    						vals = false;
    						return false;
    					} else if (Ext.isArray(newvals)) {
        					for (var i=0; i<vals.length; i++) {
        						vals[i] = vals[i] && newvals[i];
        					}
        					return Ext.Array.some(vals, function(v) {return v})
    					}
    				}
    			}
    		});
    		if (Ext.isArray(vals) && Ext.Array.some(vals, function(v) {return v})) {
    			loomTermRecords.add(record);
    		}
    	})
    	
    	loomTermRecords.update(canvas, ctx);
    }
    
});

Ext.define('Voyant.panel.LoomTermRecords', {
	config: {
		termRecords: []
	},
	constructor: function(config) {
		this.setTermRecords([])
	    this.callParent(arguments);
	},
	add: function(record) {
		this.getTermRecords().push(new Voyant.panel.LoomTermRecord(record));
	},
	update: function(canvas, ctx) {
		var min = Ext.Array.min(this.getTermRecords().map(function(r) {return Ext.Array.min(r.getValues())}))
		var max = Ext.Array.max(this.getTermRecords().map(function(r) {return Ext.Array.max(r.getValues())}))
		this.getTermRecords().forEach(function(r) {
			r.update(canvas, ctx, min, max)
		})
	}
})

Ext.define('Voyant.panel.LoomTermRecord', {
	config: {
		record: undefined,
		values: undefined,
		term: undefined,
		texts: undefined
	},
	constructor: function(config) {
		this.setRecord(config);
		this.setValues(config.getDistributions());
		var term = config.getTerm();
		this.setTerm(term);
		this.setTexts(config.getDistributions().map(function(v) {
			return new Ext.draw.sprite.Text({
				type: 'text',
				text: term
			})
		}))
	    this.callParent(arguments);
	},
	update: function(canvas, ctx, min, max) {
		var values = this.getValues(), columnWidth = canvas.offsetWidth/(values.length),
			height = canvas.offsetHeight, term = this.getTerm();
		this.getTexts().forEach(function(text, i) {
			var y = values[i]*height/max;
		    ctx.fillText(term, (columnWidth/2)+(i*columnWidth), height-y);
		})
	}
})

Ext.define('Voyant.util.LoomControl', {
    extend: 'Ext.Base',
    mixins: ['Ext.mixin.Observable'],
    constructor: function(config) {
    	this.mixins.observable.constructor.call(this, config);
        this.callParent(arguments);
    },
    config: {
    	group: undefined,
    	name: undefined,
    	enabled: false,
    	min: undefined,
    	max: undefined,
    	low: undefined,
    	high: undefined,
    	initControls: Ext.emptyFn,
    	validateRecord: Ext.emptyFn,
		offsetTipText: false
    },
    setMin: function() {
    	this.callParent(arguments);
    	this.fireEvent("change", this);
    },
    setMax: function() {
    	this.callParent(arguments);
    	this.fireEvent("change", this);
    },
    setLow: function() {
    	this.callParent(arguments);
    	this.fireEvent("change", this);
    },
    setHigh: function() {
    	this.callParent(arguments);
    	this.fireEvent("change", this);
    },
    setValues: function(low, high) {
    	this.suspendEvent("change");
    	if (Ext.isArray(low)) {
        	this.setLow(low[0]);
        	this.setHigh(low[1]);
    	} else {
        	this.setLow(low);
        	this.setHigh(high);
    	}
    	this.resumeEvent("change");
    	this.fireEvent("change", this);
    },
    setEnabled: function() {
    	this.callParent(arguments);
    	this.fireEvent("change", this);
    }
    
})