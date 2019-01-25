// assuming Bubblelines library is loaded by containing page (via voyant.jsp)
Ext.define('Voyant.panel.Fountain', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.fountain',
    statics: {
    	i18n: {
    		title: "FountainMeter"
    	},
    	api: {
    		/**
    		 * @property stopList The stop list to use to filter results.
    		 * Choose from a pre-defined list, or enter a comma separated list of words, or enter an URL to a list of stop words in plain text (one per line).
    		 * @type String
    		 * @private
    		 */
    		stopList: 'auto',
    		
    		docIndex: 0,
    		
    		speed: 30,
    		
    		groups: undefined
    			
    	},
    	glyph: 'xf06e@FontAwesome'
	},
	config: {
    	options: {xtype: 'stoplistoption'},
    	audio: false,
    	words: [],
    	groups: {},
    	moveWordsTimeout: undefined
	},
	
	
    constructor: function() {

    	this.mixins['Voyant.util.Localization'].constructor.apply(this, arguments);
    	Ext.apply(this, {
    		title: this.localize('title'),
    		layout: {
    			type: 'hbox',
    			align: 'stretch'
    		},
    		items: [{
        		html: '<svg></svg>',
        		itemId: 'fountain',
        		flex: 2
    		},{
    			flex: 1,
    			layout:  'vbox',
    			items: [{
    				   xtype: 'polar',
    				   itemId: 'gauge',
    				   width: 300,
    				   flex: 1,
    				   store: {
    				       fields: ['mph', 'fuel', 'temp', 'rpm'],
    				       data: [{val: 10}]
    				   },
    				   series: {
    				       type: 'gauge',
    				       colors: this.getApplication().getColorPalette(undefined, true),
    				       angleField: 'val',
    				       donut: 20
    				   }
    				},{
		    			width: 300,
		    			height: 16,
    					items: {
    		    			xtype: 'sparklineline',
        				    itemId: 'gaugsparkline',
    		    			values: [0,1,2,34],
    		    			height: 16,
    		    			width: 300
    					},
		    			listeners: {
		    				afterrender: function(cmp) {
		    					cmp.getTargetEl().setStyle("cursor", "pointer");
			    				cmp.getTargetEl().on("click", function(e, t, eOpts) {
	    					    	clearTimeout(this.getMoveWordsTimeout());
		    						this.getWords().forEach(function(word) {

		    							if (word.svg) {
		    								word.svg.remove();
		    								delete word.svg;
		    							}
		    							word.direction = -1; // reset
		    						})
		    						var pos = Math.floor(e.event.offsetX * this.getWords().length / t.offsetWidth)
		    						this.moveWords(pos);
		    					}, this);
		    				},
		    				scope: this
		    			}
    				}]
    		}],
    		dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                items: [{
	            	xtype: 'documentselectorbutton',
	            	singleSelect: true
	            },{
					xtype: 'slider',
					fieldLabel: this.localize('speed'),
					labelAlign: 'right',
					labelWidth: 40,
					width: 100,
					increment: 1,
					minValue: 1,
					maxValue: 60,
					value: 30,
					listeners: {
	                	render: function(cmp) {
	                		cmp.setValue(parseInt(this.getApiParam("speed")));
	                		if (this.bubbles) {this.bubbles.frameRate(cmp.getValue())}
	                		this.setAudio(cmp.getValue());
	    		        	Ext.tip.QuickTipManager.register({
	    		        		target: cmp.getEl(),
	   		                 	text: this.localize('speedTip')
	    		        	});
	                		
	                	},
	                	beforedestroy: function(cmp) {
	                		Ext.tip.QuickTipManager.unregister(cmp.getEl());
	                	},
	                    changecomplete: function(cmp, val) {
	                    	this.setApiParam('speed', val);
	                		if (this.bubbles) {this.bubbles.frameRate(val)}
	                    },
	                    scope: this
					}
				}]
    		}]
    	});
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
    	this.on('loadedCorpus', function(src, corpus) {
    		this.loadDocument();
    	}, this);
    	
    },
    
    loadDocument: function() {
    	var me = this;
    	var docIndex = parseInt(this.getApiParam('docIndex')) || 0;
    	this.getCorpus().getWordsArray({docIndex: docIndex, stopList: 'auto'}).then(function(words) {

    		// fold to lower case
    		var lcwords = words.map(function(w) {return w.toLowerCase()});
    		
    		// if we don't have any groups of words, form them based on words that are longer than four letters
    		if (me.getApiParam("groups")==undefined) {
    			var group = {};
    			lcwords.forEach(function(w) {
    				if (w.length>5 && !(w in group)) {
    					group[w] = w.length;
    				} 
    			});
    			var maxLen = Math.max.apply(this, Object.values(group))
    			var lenVal = d3.scaleLinear().domain([4,maxLen]).range([.5,1])
    			for (var w in group) {
    				group[w] = lenVal(group[w]); // convert length to val between 0 and 1
    			}
    			me.setGroups({length: {
    				color: me.getApplication().getColorForTerm("length"),
    				terms: group
    			}})
    		}

    		var el = me.getComponent('fountain').getTargetEl();
			var svgEl = el.down("svg");
    		svgEl.set({width: el.getWidth(), height: el.getHeight()});
    		var svgDom = svgEl.dom
    		var svg = d3.select(svgDom);
    		svg.selectAll("*").remove(); // clear
    		
    		// create words and set min height (highest point)
    		var types = {};
    		var groups = me.getGroups();

    		me.setWords(words.slice(0,1000).map(function(w) {
    			var word = new me.FountainWord(w.toLowerCase());
    			if (word.word in types) {types[word.word]++}
    			else {types[word.word]=1;}
    			word.min = parseInt(Math.random()*svgDom.clientHeight*.05);
    			var yshift = Math.sqrt(Math.random()*10)
    			word.yshift = Math.random()*2<1 ? - yshift : yshift;
    			word.jump = svgDom.clientHeight/10
    			word.groupVals = {};
    			for (var g in groups) {
    				if (word.word in groups[g].terms) {
    					word.groupVals[g] = groups[g].terms[word.word]
    				}
    			}
    			return word;
    		}));
    		var max = Math.max.apply(this, Object.values(types));
    		var fontSize = d3.scaleLog().domain([1,Math.max.apply(this, Object.values(types))]).range([4,12]);
    		me.getWords().forEach(function(word) {
    			word.fontSize = fontSize(types[word.word])
    		})
    		me.moveWords();
    	})
    },
    
    FountainWord: function(word) {
    	this.word = word;
    	this.direction = -1;
    },
    
    moveWords: function(until) {

    	var words = this.getWords(),
    		svg = this.getComponent('fountain').getTargetEl().down("svg").dom,
			height = svg.clientHeight,
			width = svg.clientWidth,
			groups = this.getGroups();
		var opacity = d3.scaleLinear().domain([0,height]).range([1,0]);

		var gaugeVals = [];
		var seen = 0;
    	for (var i=0; i<words.length; i++) {
    		seen++;
    		
			// make sure to count group hits for all words since start to current point
			if (Object.keys(words[i].groupVals).length==0) {
				gaugeVals.push(0)
			} else {
				Object.values(words[i].groupVals).forEach(function(val) {
					gaugeVals.push(val);
				});
			}
			
    		if (words[i].direction<0) { // going up
    			
				
    			if (!words[i].svg) {
    	    		var word = d3.select(svg)
    	    			.append("text")
    	    			.text(words[i].word)
    	    			.attr("font-size", words[i].fontSize)
    	    			.attr("text-anchor", "middle")
    	    			.attr("x", width/2)
    	    			.attr("y", height-(Math.random()*height)/5)
    	    			.attr("fill", Object.keys(words[i].groupVals).length==0 ? "black" : this.getApplication().getColorForTerm(Object.keys(words[i].groupVals).shift(), true));
    	    		words[i].ys = [height];
    	    		words[i].svg = word;
    	    		if (!until || i>until) {
    	    			break;
    	    		}
    			} else {
    				var y = parseInt(words[i].svg.attr("y"));
        			var delta = y-words[i].min;
        			var change = delta/5
        			words[i].svg.attr("y", y-change);
        			words[i].svg.attr("x", parseInt(words[i].svg.attr("x"))+words[i].yshift);
        			y = parseInt(words[i].svg.attr("y"))
        			words[i].ys.push(y);
        			if (y<=words[i].min) {
        				words[i].direction = 1;
        			}
    			}
    			
    		} else if (words[i].direction>0) { // going down
    			if (words[i].svg && words[i].ys.length>0) {
        			words[i].svg.attr("y", words[i].ys.pop());
        			words[i].svg.attr("x", parseInt(words[i].svg.attr("x"))+words[i].yshift);
        			words[i].svg.attr("opacity", opacity(parseInt(words[i].svg.attr("y"))));
    				
    			} else {
    				words[i].direction = 0;
    			}
    		} else {
    			if ("svg" in words[i]) {
    				words[i].svg.remove()
    				delete words[i].svg
    			}
    		}
    		
    	}

    	var avg = gaugeVals.length==0 ? 0 : Ext.mean(gaugeVals)*100;
    	var polar = this.down("polar")
    	polar.getStore().getAt(0).set("val", avg)
    	polar.setSprites({
            type: 'text',
            text: Ext.util.Format.number(avg, '%0.0'),
            x: 145,
            y: 240
        });
    	var sparkline = this.down("sparklineline");
    	sparkline.setValues(gaugeVals.length>100 ? this.chunkify(gaugeVals, 100, true).map(function(vals) {return Ext.mean(vals)}) : gaugeVals);
    	sparkline.setWidth(seen*sparkline.ownerCt.getWidth()/words.length)
    	
    	this.setMoveWordsTimeout(Ext.defer(this.moveWords, 100, this));
    },
    
    // https://stackoverflow.com/questions/8188548/splitting-a-js-array-into-n-arrays
    chunkify: function(a, n, balanced) {
        if (n < 2)
            return [a];

        var len = a.length,
                out = [],
                i = 0,
                size;

        if (len % n === 0) {
            size = Math.floor(len / n);
            while (i < len) {
                out.push(a.slice(i, i += size));
            }
        }

        else if (balanced) {
            while (i < len) {
                size = Math.ceil((len - i) / n--);
                out.push(a.slice(i, i += size));
            }
        }

        else {

            n--;
            size = Math.floor(len / n);
            if (len % size === 0)
                size--;
            while (i < size * n) {
                out.push(a.slice(i, i += size));
            }
            out.push(a.slice(size * n));

        }

        return out;    	
    },
    
    initComponent: function() {
    	this.callParent(arguments);
    }
});