Ext.define('Voyant.panel.CollocatesGraph', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.collocatesgraph',
    statics: {
    	i18n: {
    		title: {en: "Links"},
    		helpTip: {en: "<p>Collocates graph shows a network graph of higher frequency terms that appear in proximity. Keywords are shown in blue and collocates (words in proximity) are showing in orange. Features include:<ul><li>hovering over keywords shows their frequency in the corpus</li><li>hovering over collocates shows their frequency in proximity (not their total frequency)</li><li>double-clicking on any word fetches more results</li><li>a search box for queries (hover over the magnifying icon for help with the syntax)</li></ul>"},
    		clearTerms: {en: "Clear Terms"},
    		releaseToRemove: {en: "Release to remove this term"},
    		cleaning: {en: "Cleaning"},
    		context: {en: "Context"}
    	},
    	api: {
    		query: undefined,
    		mode: undefined,
    		limit: 15,
    		stopList: 'auto',
    		terms: undefined,
    		context: 5
    	},
		glyph: 'xf1cb@FontAwesome'
    },
    
    config: {
    	corpus: undefined,
    	node: undefined,
    	link: undefined,
    	
    	nodeDataSet: new vis.DataSet(),
    	edgeDataSet: new vis.DataSet(),
    	network: undefined,
    	contextMenu: undefined,
    	
    	force: undefined,
    	graphHeight: undefined,
    	graphWidth: undefined,
    	corpusColours: d3.scale.category10()
    },

    nodeOptions: {
		shape: 'box',
		color: {
			border: 'rgba(0,0,0,0.1)',
			background: 'rgba(255,255,255,1)'
		},
		scaling:{
            label: {
              min: 8,
              max: 20
            }
          }
	},
	edgeOptions: {
		color: {
			color: 'rgba(0,0,0,0.1)',
			highlight: 'black',
			hover: 'red'
		},
		labelHighlightBold: false
	},
	highlightOptions: {
		font: {
			color: 'white'
		},
		color: {
			background: 'black'/*,
			hover: {
				border: '#CB157F',
				background: '#EB42A5'
			}*/
		}
	},
    
    constructor: function(config) {

        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);

    },
    
    initComponent: function() {
    	
        var me = this;

        Ext.apply(me, {
    		title: this.localize('title'),
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                items: [{
                    xtype: 'querysearchfield'
                },{
                	text: me.localize('clearTerms'),
                	handler: function() {
                		this.getNodeDataSet().clear();
                	},
                	scope: me
                },this.localize('context'),{
                	xtype: 'slider',
                	minValue: 3,
                	value: 5,
                	maxValue: 30,
                	increment: 2,
                	width: 50,
                	listeners: {
                		render: function(slider) {
                			slider.setValue(me.getApiParam('context'));
                		},
                		changecomplete: {
                			fn: function(slider, newValue) {
                    			this.setApiParam("context", slider.getValue());
                    			var terms = this.getNodeDataSet().map(function(node) { return node.label; });
                				if (terms.length > 0) {
                					this.getNodeDataSet().clear();
                					this.loadFromQuery(terms);
                				}
                    		},
                    		scope: me
                		}
                	}
                }]
            }]
        });
        
        this.setContextMenu(Ext.create('Ext.menu.Menu', {
			renderTo: Ext.getBody(),
			items: [{
				text: '',
				itemId: 'label',
				disabled: true
			},{
		        xtype: 'menuseparator'
			},{
				xtype: 'menucheckitem',
				text: 'Fixed',
				itemId: 'fixed',
				listeners: {
					checkchange: function(c, checked, e) {
						var n = this.getNetwork().getSelectedNodes();
						if (n[0] != null) {
							this.getNodeDataSet().update({id: n[0], fixed: checked});
						}
					},
					scope: this
				}
			},{
				xtype: 'button',
				text: 'Remove',
				style: 'margin: 5px;',
				handler: function(b, e) {
					var n = this.getNetwork().getSelectedNodes();
					if (n[0] != null) {
						this.getNodeDataSet().remove(n[0]);
						b.up('menu').hide();
					}
				},
				scope: this
			}]
		}));
        
        this.on("loadedCorpus", function(src, corpus) {
			this.setCorpus(corpus);
			if (this.isVisible()) {
				this.initLoad();
			}
        }, this);
        
        this.on('activate', function() { // load after tab activate (if we're in a tab panel)
    					if (this.getCorpus()) {
    						Ext.Function.defer(this.initLoad, 100, this);
    					}
    		    	}, this);
        
        this.on("query", function(src, query) {this.loadFromQuery(query);}, this);
        
        this.on("resize", function(panel, width, height) {
        	var el = this.getLayout().getRenderTarget();
        	
        	var docked = this.getDockedItems();
        	var dHeight = 0;
        	for (var i = 0; i < docked.length; i++) {
        		dHeight += docked[i].getHeight();
        	}
        	
        	var elHeight = height - dHeight;
        	
        	el.setHeight(elHeight);
        	el.setWidth(el.getWidth());
        	this.setGraphHeight(el.getHeight());
        	this.setGraphWidth(el.getWidth());
        	
        	if (this.getNetwork() !== undefined) {
        		this.getNetwork().fit();
        	}
		}, this);
        
    	this.mixins['Voyant.panel.Panel'].initComponent.apply(this, arguments);
        me.callParent(arguments);

    },
    
    initLoad: function() {
    	if (this.getCorpus()) {
    		this.initGraph();
    		var corpusTerms = this.getCorpus().getCorpusTerms({
    			leadingBufferZone: 0,
    			autoLoad: false
    		});
    		corpusTerms.load({
    		    callback: function(records, operation, success) {
    		    	if (success) {
    		    		this.loadFromCorpusTermRecords(records);
    		    	}
    		    },
    		    scope: this,
    		    params: {
    				limit: 10,
    				stopList: this.getApiParam("stopList")
    			}
        	});
    	}
    },
    
    loadFromQuery: function(query) {
    	var corpusCollocates = this.getCorpus().getCorpusCollocates({autoLoad: false});
    	this.setApiParams({
    		query: query,
    		mode: 'corpus'
    	});
    	corpusCollocates.load({
    		params: this.getApiParams(),
    		callback: function(records, operations, success) {
    			if (success) {
    				this.loadFromCorpusCollocateRecords(records);
    			}
    		},
    		scope: this
    	});
    },
    
    loadFromCorpusTermRecords: function(corpusTerms) {
    	if (Ext.isArray(corpusTerms) && corpusTerms.length>0) {
    		var terms = [];
    		corpusTerms.forEach(function(corpusTerm) {
    			terms.push(corpusTerm.getTerm());
    		});
    		this.loadFromCorpusTermStringsArray(terms);
    	}
    },
    
    loadFromCorpusTermStringsArray: function(corpusTermStringsArray) {
    	var corpusCollocates = this.getCorpus().getCorpusCollocates({autoLoad: false});
    	this.setApiParams({
    		query: corpusTermStringsArray,
    		mode: 'corpus'
    	});
    	corpusCollocates.load({
    		params: this.getApiParams(),
    		callback: function(records, operations, success) {
    			if (success) {
    				this.loadFromCorpusCollocateRecords(records);
    			}
    		},
    		scope: this
    	});
    },
    
    loadFromCorpusCollocateRecords: function(records) {
    	if (Ext.isArray(records)) {
    		var nodeDS = this.getNodeDataSet();
    		var edgeDS = this.getEdgeDataSet();
    		var start = this.getApiParam('limit');
    		records.forEach(function(corpusCollocate) {
    			if (corpusCollocate.getContextTerm() != corpusCollocate.getTerm()) {
	    			var keywordNode = {label: corpusCollocate.getKeyword(), title: corpusCollocate.getKeyword()+' ('+corpusCollocate.getKeywordRawFreq()+')', type: 'keyword', value: corpusCollocate.getKeywordRawFreq(), start: start};
	    			var keywordNodeKey = [keywordNode.label,keywordNode.type].join(";");
	    			keywordNode.id = keywordNodeKey;
	    			
	    			var existingNode = nodeDS.get(keywordNodeKey);
	    			if (existingNode != null) {
	    			} else {
	    				nodeDS.add(keywordNode);
	    			}
	    			
	    			var contextNode = {label: corpusCollocate.getContextTerm(), title: corpusCollocate.getContextTerm()+' ('+corpusCollocate.getContextTermRawFreq()+')', type: 'context', value: corpusCollocate.getContextTermRawFreq(), start: 0};
	    			var contextNodeKey = [contextNode.label,contextNode.type].join(";");
	    			contextNode.id = contextNodeKey;
	    			
	    			existingNode = nodeDS.get(contextNodeKey);
	    			if (existingNode != null) {
	    			} else {
	    				nodeDS.add(contextNode);
	    			}
	    			
	    			var linkKey = [keywordNodeKey,contextNodeKey].join("--");
	    			
	    			existingNode = edgeDS.get(linkKey);
	    			if (existingNode != null) {
	    			} else {
	    				edgeDS.add({id: linkKey, from: keywordNodeKey, to: contextNodeKey});
	    			}
    			}
    		});
    		
    		var min = Number.MAX_VALUE;
    		var max = -1;
    		nodeDS.forEach(function(item) {
    			if (item.value > max) max = item.value;
    			if (item.value < min) min = item.value;
    		});
    		console.log(min, max);
    		nodeDS.setOptions({
    			scaling: {
    				min: min,
    				max: max,
    				label: true
    			}
//    			,customScalingFunction: function(min, max, total, value) {
//					if (max === min) {
//						return 0.5;
//					} else {
//						var scale = 1 / (max - min);
//						return Math.max(0, (value - min) * scale);
//					}
//				}
    		});
    		
    		
//    		this.getNetwork().redraw();
    		this.getNetwork().fit();
    	}
    },
    
    initGraph: function() {
    	var el = this.getLayout().getRenderTarget();
    	el.setWidth(el.getWidth());
    	el.setHeight(el.getHeight());
    	this.setGraphHeight(el.getHeight());
    	this.setGraphWidth(el.getWidth());
    	
    	if (this.getNetwork() === undefined) {
	    	var options = {
	    		autoResize: true,
				interaction: {
	    			hover: true,
	    			hoverConnectedEdges: true,
	    			multiselect: false
	    		},
	    		physics: {
					barnesHut: {
					}
	    		},
	    		nodes: this.nodeOptions,
	    		edges: this.edgeOptions
	    	};
	    	
	    	
	    	var network = new vis.Network(el.dom, {
	    		nodes: this.getNodeDataSet(),
	    		edges: this.getEdgeDataSet()
	    	}, options);
	
	    	
	    	this.setNetwork(network);
	    	
	    	this.getNodeDataSet().on('remove', function(e, props, sender) {
	    		var key = props.items[0];
	    		var deadEdges = this.getEdgeDataSet().get({
	    			filter: function(item) {
	    				return item.from == key || item.to == key;
	    			}
	    		});
	    		this.getEdgeDataSet().remove(deadEdges);
	    		var orphans = [];
	    		this.getNodeDataSet().forEach(function(node) {
	    			var match = this.getEdgeDataSet().get({
		    			filter: function(item) {
		    				return item.from == node.id || item.to == node.id;
		    			}
		    		});
	    			if (match.length == 0) {
	    				orphans.push(node.id);
	    			}
	    		}.bind(this));
	    		this.getNodeDataSet().remove(orphans);
	    	}.bind(this));
	    	
	    	network.on('dragStart', function(params) {
	    		var n = params.nodes[0];
	    		if (n != null) {
	    			this.getNodeDataSet().update({id: n, fixed: false});
	    		}
	    	}.bind(this));
	    	
	    	network.on('dragging', function(params) {
	    		var n = params.nodes[0];
	    		if (n != null) {
		    		if (this.isMasked()) {
			    		if (!this.isOffCanvas(params.pointer.DOM)) {
			    			this.unmask();
			    		}
			    	}
			    	else if (this.isOffCanvas(params.pointer.DOM)) {
			    		this.mask(this.localize("releaseToRemove"));
			    	}
	    		}
	    	}.bind(this));
	    	
	    	network.on('dragEnd', function(params) {
	    		var n = params.nodes[0];
	    		if (n != null) {
	    			if (this.isOffCanvas(params.pointer.DOM)) {
	    	    		this.unmask();
	    	    		this.mask("cleaning");
	    	    		this.getNodeDataSet().remove(n);
	    	    		this.unmask();
	    	    	} else {
	    	    		this.getNodeDataSet().update({id: n, fixed: true});
	    	    	}
	    		}
	    	}.bind(this));
	    	
	    	network.on('click', function(params) {
	    		this.getContextMenu().hide();
	    	}.bind(this));
	    	
	    	network.on('doubleClick', function(params) {
	    		var n = params.nodes[0];
	    		if (n != null) {
	    			var data = this.getNodeDataSet().get(n);
	    			this.itemdblclick(data);
	    		}
	    	}.bind(this));
	    	
	    	network.on('oncontext', function(params) {
	    		params.event.preventDefault();
	    		var n = this.getNetwork().getNodeAt(params.pointer.DOM);
	    		if (n != null) {
	    			this.getNetwork().selectNodes([n]);
	    			var data = this.getNodeDataSet().get(n);
	    			var menu = this.getContextMenu();
	    			menu.queryById('label').setText(data.label);
	    			menu.queryById('fixed').setChecked(data.fixed);
	    			menu.showAt(params.event.pageX, params.event.pageY);
	    		}
	    	}.bind(this));
    	}
    },
    
    start: function() {
  	  var me = this;
  	  var force = this.getForce();
    	var drag = force.drag();
    	drag.on("dragstart", this.dragstart)
    	drag.on("drag", function(d) {me.drag.call(me, d)})
    	drag.on("dragend", function(d) {if (me.isOffCanvas(d)) {d.fixed = false; d3.select(this).classed("fixed", false);} me.dragend.call(me, d)})
    	
    	  link = this.getLink().data(force.links(), function(d) { return d.source.term+d.source.type + "-" + d.target.term+d.source.type; });
    	  link.enter().insert("line", ".node").attr("class", "link");
    	  link.exit().remove();
    	  this.setLink(link);
    	  
    	  node = this.getNode().data(force.nodes(), function(d) { return d.term+d.type;});
//    	  node.enter().append("g").attr("class", function(d) { return "node " + d.id; }).attr("dx", 12).attr("dy", ".35em").call(this.getForce().drag)
    	  
    	  var keywordValues = force.nodes().filter(function(d) {return d.type=='keyword';}).map(function(d) {return d.value;});
    	  var contextTermValues = force.nodes().filter(function(d) {return d.type=='context';}).map(function(d) {return d.value;});
    	  var range = [8,20];
    	  var kmin = d3.min(keywordValues);
    	  var kmax = d3.max(keywordValues);
    	  var cmin = d3.min(contextTermValues);
    	  var cmax = d3.max(contextTermValues);
    	  
    	  var fontSize = d3.scale.linear().domain([(kmin < cmin ? kmin : cmin), (kmax > cmax ? kmax : cmax)]).range(range);

    	  var corpusColours = this.getCorpusColours();
    	  node.enter()
    	  	.append("text")
    	  		.attr("class", function(d) { return "node " + d.type; })
    	  		.attr("text-anchor", "middle")
    	  		.style("fill", function(d) {return corpusColours(d.type=='keyword' ? 1 : 2);})
    	  		.attr("dx", 12).attr("dy", ".35em")
    	  		.text(function(d) { return d.term; })
    	  		.style("font-size", function(d) { return (fontSize(d.value))+"pt"; })
    	  		.on("dblclick", function() {
    	  			me.dragstart.apply(this, arguments); // freeze the word
    	  			me.itemdblclick.apply(me, arguments);} // load more words
    	  		)
    	  		.on("click", this.itemclick)
    	  		.on("mouseover", function(d) {
    	  			this.textContent=d.term+" ("+d.value+")";
    	  			d.wasfixed = d.fixed;
    	  			me.itemclick.apply(this, arguments);
    	  		})
    	  		.on("mouseout", function(d,a,b,c) {
    	  			this.textContent=d.term;
    	  			d3.select(this).classed("fixed", d.fixed = d.wasfixed);
    			})
    	  		.call(drag);
    	  node.exit().remove();
    	  this.setNode(node);
    	  force.start();
    },
    
    isOffCanvas: function(d) {
    	return d.x < 0 || d.y < 0 || d.x > this.getGraphWidth() || d.y > this.getGraphHeight();
    },

    itemdblclick: function(d) {
    	var limit = 10;
    	var corpusCollocates = this.getCorpus().getCorpusCollocates({autoLoad: false});
    	corpusCollocates.load({
    		params: Ext.apply(this.getApiParams(), {query: d.label, start: d.start, limit: limit}),
    		callback: function(records, operation, success) {
    			if (success) {
    	    		var nodeDS = this.getNodeDataSet();
    	    		var edgeDS = this.getEdgeDataSet();
    	    		
    	    		var start = this.getApiParam('limit');
	    			var keywordNode = d;
    	    		d.start+=limit;
	    			var keywordNodeKey = [keywordNode.label,keywordNode.type].join(";");
	    			
    	    		records.forEach(function(corpusCollocate) {
    	    			if (corpusCollocate.getContextTerm() != corpusCollocate.getTerm()) {
	    	    			var contextNode = {label: corpusCollocate.getContextTerm(), type: 'context', value: corpusCollocate.getContextTermRawFreq(), start: 0};
	    	    			var contextNodeKey = [contextNode.label,contextNode.type].join(";");
	    	    			contextNode.id = contextNodeKey;
	    	    			
	    	    			var existingNode = nodeDS.get(contextNodeKey);
	    	    			if (existingNode != null) {
	    	    			} else {
	    	    				nodeDS.add(contextNode);
	    	    			}
	    	    			
	    	    			var linkKey = [keywordNodeKey,contextNodeKey].join("--");
	    	    			
	    	    			existingNode = edgeDS.get(linkKey);
	    	    			if (existingNode != null) {
	    	    			} else {
	    	    				edgeDS.add({id: linkKey, from: keywordNodeKey, to: contextNodeKey});
	    	    			}  	    			
    	    			}
    	    		});
    			}
    		},
    		scope: this
    	});
    }
    
});