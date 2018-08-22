Ext.define('Voyant.panel.Mixer', {
    extend: 'Ext.panel.Panel',
    mixins: ['Voyant.panel.Panel'],
    alias: 'widget.mixer',
    statics: {
        i18n: {
        },
        api: {
            limit: 500,
            stopList: 'auto',
            coverage: undefined,
            coverageSpan: undefined,
            termLength: undefined
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
    		coverage: new Voyant.util.MixerControl({
	    		group: 'coverage',
	    		name: 'coverage',
	    		enabled: this.getApiParam('coverage')!==undefined,
	    		low: this.getApiParam('coverage')===undefined ? undefined : parseInt(this.getApiParam('coverage').split(",")[0]),
	    		high: this.getApiParam('coverage')===undefined ? undefined : parseInt(this.getApiParam('coverage').split(",")[1]),
	    		initControl: function(store) {
	    			this.setMax(store.getAt(0).getDistributions().length);
	        	},
	        	validateRecord: function(record) {
	        		var count = Ext.Array.sum(record.getDistributions().map(function(val) {return val===0 ? 0 : 1}));
	        		return count >= this.getLow() && count <= this.getHigh();
	        	}
    		})
    	})
    	controls.each(function(control) {
    		control.on("change", function(control) {
    			if (control.getEnabled()) {
    				this.setApiParam(control.getName(), control.getLow()+","+control.getHigh());
    			} else {
    				this.setApiParam(control.getName(), undefined);
    			}
    		}, this);
    	}, this);
    	this.setControls(controls);
    	
    	var tbitems = ["coverage"].map(function(group) {
    		return {
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
    		}
    	}, this);
    	
        Ext.apply(this, {
            title: this.localize('title'),
            layout: {
            	type: 'hbox',
            	align: 'stretch'
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
            			
            			// based on http://bl.ocks.org/jczaplew/8603055
            			/*
            			(function chart() {
            			      var boxes = terms.length,
            			      rowLen = 1,
            			      xSteps =  d3.range(0, width, width/terms.length), 
            			      ySteps =  d3.range(0, height, height/terms.length),
            			      boxSteps = d3.range(boxes*boxes);

            			     //set scale and origin focus
            			  var xFisheye = d3.fisheye.scale(d3.scaleIdentity).domain([0, width]).focus(width/2),
            			      yFisheye = d3.fisheye.scale(d3.scaleIdentity).domain([0, height]).focus(height/2);
            			      fontSizeFisheye = d3.fisheye.scale(d3.scaleLog).domain([3,150]).range([8,15]).focus(12),
            			      fontOpacityFisheye = d3.fisheye.scale(d3.scaleLog).domain([8,50]).range([0,1]).focus(1);

            			  var svg = d3.select(el.dom).append("svg")
            			    .attr("width", width)
            			    .attr("height", height)
            			  .append("g")
            			    .attr("transform", "translate(-.5,-.5)");

            			  svg.append("rect")
            			    .attr("class", "background")
            			    .attr("width", width)
            			    .attr("height", height); 
            			  
            			  var boxTest = svg.selectAll(".yrect")
            			    .data(terms)
            			  .enter().append("rect") 
            			    .attr("class", "yrect")
            			    .style("fill",function(d,i) {
            			    	return "rgba(255,255,255,1)"
            			      return d.col;
            			    })   
            			    .style("stroke",function(d,i) {
            			    	return "rgba(255,255,255,1)"
            			      return d.col;
            			    })   
            			    .attr("id", function(d, i) {
            			      return i;
            			    });
            			          
            			  var yText = svg.selectAll("ytext")
            			    .data(terms)
            			  .enter().append("text")
            			    .text(function(d,i){return d.term})
            			    .attr("class", "ytext") 
            			    .attr("text-anchor", "middle")
            			    .attr("fill", function(d) {return Voyant.application.getColorForTerm(d.term, true)})

            			       
            			  redraw();
            			  reset();
            			  
            			  var currentRow = -1;

            			  svg.on("mousemove", function() {
            			    var mouse = d3.mouse(this);
            			    currentRow = Math.round(mouse[1]*terms.length/height);
            			    
//            			    xFisheye.focus(mouse[0]); 
//            			    yFisheye.focus(mouse[1]); 
//            			    redraw();
            			  });

            			  svg.on("mouseout", function() {
            			    reset();
            			  });

            			  function redraw() { 
            			    yText
            			      .attr("x", function(d, i) {
            			        return xFisheye(xSteps[i%rowLen]) + (xFisheye(xSteps[(i+1)%rowLen] || width) - xFisheye(xSteps[i%rowLen]))/2;
            			      })
            			      .attr("y", function(d, i) {
            			        var rowNum = Math.floor(i/rowLen);
            			        return yFisheye(ySteps[rowNum]) + (yFisheye(ySteps[rowNum+1] || height) - yFisheye(ySteps[rowNum]))/2;
            			      })
            			      .style("font-size",function(d,i){ 
            			         var rowNum = Math.floor(i/rowLen);
            			         var xx = (xFisheye(xSteps[(i+1)%rowLen] || width) - xFisheye(xSteps[(i)%rowLen]));
            			         var yy = (yFisheye(ySteps[rowNum+1]|| height) - yFisheye(ySteps[rowNum]));
            			         var minDim = d3.min([xx,yy]);
            			         return fontSizeFisheye(minDim);
            			      })  
            			      .style("fill-opacity",function(d,i){
            			    	  return 1
            			         var rowNum = Math.floor(i/rowLen);
            			         var xx = (xFisheye(xSteps[(i+1)%rowLen] || width) - xFisheye(xSteps[(i)%rowLen]));
            			         var yy = (yFisheye(ySteps[rowNum+1] || height) - yFisheye(ySteps[rowNum])); 
            			         var minDim = d3.min([xx,yy]);
            			         console.warn(yy,fontOpacityFisheye(yy))
            			         return fontOpacityFisheye(yy);
            			      })
            			      .attr("dy",function(d,i){ 
            			         var rowNum = ((i % terms.length) > 0) ? (i %  terms.length) : 1 ;
            			         var yy = (yFisheye(ySteps[rowNum]) - yFisheye(ySteps[rowNum-1]));
            			         return (fontSizeFisheye(yy)/2);
            			      });

            			     boxTest
            			      .attr("x", function(d,i) {
            			        return xFisheye(xSteps[i%rowLen]);
            			      }) 
            			     .attr("y", function(d,i) {
            			        var rowNum = Math.floor(i/rowLen);
            			        return yFisheye(ySteps[rowNum-1] || 0) + (yFisheye(ySteps[rowNum]) - yFisheye(ySteps[rowNum-1] || 0));
            			      })
            			     .attr("width", function(d,i) {
            			        var rowNum = Math.floor(i/rowLen);
            			        return (xFisheye(xSteps[(i+1)%rowLen] || width) - xFisheye(xSteps[i%rowLen]));
            			      })   
            			     .attr("height", function(d,i) {
            			        var rowNum = Math.floor(i/rowLen);
            			        return (yFisheye(ySteps[rowNum+1]|| height) - yFisheye(ySteps[rowNum]));
            			      });
            			          
            			    }

            			  function reset() {
            			    d3.selectAll(".yrect")
            			      .attr("height", function(d, i) {
            			        return height/ terms.length;
            			      })
            			      .attr("y", function(d, i) {
            			        return i * (height/ terms.length);
            			      });

            			    svg.selectAll(".ytext")
            			      .attr("x", function(d, i) {
            			        return width/2;
            			      })
            			      .attr("y", function(d, i) {
            			    	  return i*height/terms.length
            			        return (i *  terms.length) + 10;
            			      })
            			      .style("font-size",function(d,i){ 
            			         return 12;
            			      })  
            			      .style("fill-opacity",function(d,i){
            			         return 1;
            			      });
            			  }
            			})();
            			*/
            			
            			
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


//          			  var svg = d3.select(el.dom).append("svg")
//            		      .attr("width", el.getWidth())
//            		      .attr("height", el.getHeight());
//            			
            			var textHeight = Math.ceil(height/terms.length);
//            			text = svg.selectAll("text")
//            				.data(terms)
//            			  	.enter()
//            			  	.append("text")
//            			  	.text(function(t) {return t.term})
//            			  	.attr("width", width)
//            			  	.attr("text-anchor", "middle")
//            			    .attr("fill", function(d) {return Voyant.application.getColorForTerm(d.term, true)})
//            			  	.attr("x", width/2)
//            			  	.attr("y", function(t, i) {return textHeight*i});
            			
            			var fisheye = d3.fisheye.circular()
	            		    .radius(50)
	            		    .distortion(2);
            			
            			yFisheye = d3.fisheye.scale(d3.scaleIdentity).domain([0, height]);
            			
            			svg.on("mousemove", function() {
            				var mouse = d3.mouse(this);
            					currentItem = Math.round(mouse[1]*terms.length/height),
            					currentItem = Math.min(currentItem, terms.length-1);
            				fisheye.focus(mouse[1]);
            				yFisheye.focus(mouse[1]);
            				
            			var nodes = text.nodes();
            			
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
            				            			
            			/*
        				text///.each(function(d,i) {return d})
         				   .attr("y", function(d) { return yFisheye(d.y) })
         				   .attr("font-size", function(d) {return 1})
         				   */
            			})

            		}
            	}
            },{
            	itemId: 'waves',
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
                items: tbitems
              }/*,{
                dock: 'left',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                items: [{
                	xtype: 'mixercontrol',
                	name: 'coverage',
                	initControl: function(control, field, store) {
                		field.setMaxValue(store.getAt(0).getDistributions().length);
                	},
                	validateRecord: function(field, record, vals) {
                		var count = Ext.Array.sum(vals.map(function(val) {return val===0 ? 0 : 1}));
                		return count >= field.getValue(0) && count <= field.getValue(1);
                	}
                },{
                	xtype: 'mixercontrol',
                	name: 'coverageSpan',
                	initControl: function(control, field, store) {
                		field.setMaxValue(store.getAt(0).getDistributions().length);
                	},
                	validateRecord: function(field, record, vals) {
                		var min = field.getValue(0), max = field.getValue(1);
                		for (var i=min; i<max+1; i++) {
                			if (vals[i]>0) {
                				return true;
                			}
                		}
                		return false;
                	}
                },{
                	xtype: 'mixercontrol',
                	name: 'earliestlatest',
                	initControl: function(control, field, store) {
                		field.setMaxValue(store.getAt(0).getDistributions().length);
                	},
                	validateRecord: function(field, record, vals) {
                		var min = field.getValue(0), max = field.getValue(1);
                		for (var i=0; i<min; i++) {
                			if (vals[i]>0) {return false}
                		}
                		for (var i=max; i<vals.length; i++) {
                			if (vals[i]>0) {return false}
                		}
                		return true;
                	}
                },{
                	menu: {
                		defaults: {
                			xtype: 'mixercontrol'
                		},
                		items: [{
                			xtype: 'mixercontrol',
                			name: 'rawFreq',
                			initControl: function(control, field, store) {
                				field.setMinValue(store.min('rawFreq'));
                        		field.setMaxValue(store.max('rawFreq'));
                        	},
                        	validateRecord: function(field, record, vals) {
                        		var val = record.get('rawFreq');
                        		return val >= field.getValue(0) && val <= field.getValue(1);
                        	}
                		}]
                	}
                },{
                	fieldLabel: this.localize('percentile'),
                	xtype: 'multislider'
                },{
                	fieldLabel: this.localize('skew'),
                	xtype: 'multislider'
                },{
                	fieldLabel: this.localize('peekedness'),
                	xtype: 'multislider'
                },{
                	fieldLabel: this.localize('variance'),
                	xtype: 'multislider'
                },{
                	fieldLabel: this.localize('increases'),
                	xtype: 'multislider'
                },{
                	fieldLabel: this.localize('decreases'),
                	xtype: 'multislider'
                },{
                	xtype: 'mixercontrol',
                	name: 'termLength',
                	initControl: function(control, field, store) {
                		var min = 1, max = 1;
                		store.each(function(record) {
                			var len = record.getTerm().length;
                			if (len>max) {max=len;}
                		})
                		field.setMaxValue(max);
                	},
                	validateRecord: function(field, record, vals) {
                		var min = field.getValue(0), max = field.getValue(1), len = record.getTerm().length;
                		return len>=min && len <=max;
                	}
                }]
            },{
                dock: 'bottom',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                items: [{
                	fieldLabel: this.localize('segments'),
                	xtype: 'slider'
                },{
                	fieldLabel: this.localize('limit'),
                	xtype: 'slider'
                }]
            }*/]
        });
        
        this.on('loadedCorpus', function(src, corpus) {
        	var store = corpus.getDocumentsCount()==1 ? corpus.getDocumentTerms() : corpus.getCorpusTerms();
        	store.on("load", function() {
        	    this.updateControlsFromStore();
		    	this.filterRecords();
        	}, this);
        	store.on("filterchange", function() {
        		this.getComponent("terms").fireEventArgs("filterchange", arguments);
        		this.getComponent("waves").fireEventArgs("filterchange", arguments);
        		
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
    		return Ext.Array.each(this.getControls().getRange(), function(control) {
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

    	var controls = this.query('mixercontrol');
    	
    	var mixerTermRecords = new Voyant.panel.MixerTermRecords();
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
    			mixerTermRecords.add(record);
    		}
    	})
    	
    	mixerTermRecords.update(canvas, ctx);
    }
    
});

Ext.define('Voyant.panel.MixerTermRecords', {
	config: {
		termRecords: []
	},
	constructor: function(config) {
		this.setTermRecords([])
	    this.callParent(arguments);
	},
	add: function(record) {
		this.getTermRecords().push(new Voyant.panel.MixerTermRecord(record));
	},
	update: function(canvas, ctx) {
		var min = Ext.Array.min(this.getTermRecords().map(function(r) {return Ext.Array.min(r.getValues())}))
		var max = Ext.Array.max(this.getTermRecords().map(function(r) {return Ext.Array.max(r.getValues())}))
		this.getTermRecords().forEach(function(r) {
			r.update(canvas, ctx, min, max)
		})
	}
})

Ext.define('Voyant.panel.MixerTermRecord', {
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

Ext.define('Voyant.util.MixerControl', {
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
    	validateRecord: Ext.emptyFn
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
/*
Ext.define('Voyant.widget.MixerControl', {
    extend: 'Ext.container.Container',
	mixins: ['Voyant.util.Localization','Voyant.util.Api'],
    alias: 'widget.mixercontrol',
    layout: 'hbox',
    statics: {
        i18n: {
        	coverageLabel: "coverage",
        	coverageLabelTip: ""
        }
    },
    config: {
    	field: undefined,
    	checked: true,
    	name: undefined
    },
    constructor: function(config) {
        this.callParent(arguments);
    },
    initComponent: function() {
    	var me = this;
    	Ext.apply(this, {
    		title: this.localize('title'),
    		listeners: {
    			afterrender: function() {
    				this.setField(this.getComponent("field"));
    			},
    			scope: this
    		},
    		items: [{
    			xtype: 'checkbox',
    			checked: true,
    			listeners: {
    				change: function(c, checked) {
    					me.getComponent('field').setDisabled(!checked)
    					me.up('mixer').revalidate();
    				}
    			}
    		}, {xtype: 'tbspacer'}, {
    			xtype: this.getField() || 'multislider',
    			itemId: 'field',
    			values: [0,0], // provide two values to ensure multislider
    			width: 60,
    			listeners: {
    				changecomplete: function(cmp, val) {
//    					debugger
//    					me.getComponent('label').el.down(".label").dom.innerHTML="("+ (cmp.getValues ? cmp.getValues().join("-") : cmp.getValue()) + ") ";
    					me.up('mixer').revalidate();
    				}
    			}
    		},{xtype: 'tbspacer'}, {
    			itemId: 'label',
    			width: 150,
    			html: " <span class='label'>&nbsp;</span> <span data-qtip=\"test\">"+this.localize(this.getName()+"Label")+"</span>"
    		}]
    	})
    	this.callParent(arguments);
    }
})
*/