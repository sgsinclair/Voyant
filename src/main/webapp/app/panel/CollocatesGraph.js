Ext.define('Voyant.panel.CollocatesGraph', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.collocatesgraph',
    statics: {
    	i18n: {
    	},
    	api: {
    		query: undefined,
    		mode: undefined,
    		limit: 5,
    		stopList: 'auto',
    		terms: undefined,
    		context: 5,
    		centralize: undefined
    	},
		glyph: 'xf1e0@FontAwesome'
    },
    
    config: {
    	node: undefined,
    	link: undefined,
    	
    	nodeDataSet: undefined,
    	edgeDataSet: undefined,
    	network: undefined,
    	contextMenu: undefined,
    	
    	force: undefined,
    	graphHeight: undefined,
    	graphWidth: undefined,
    	corpusColours: d3.scale.category10(), // TODO unused
    	
    	graphMode: undefined,
    	
    	stabilizationTask: undefined // stop simulation if it's run for too long
    },

    DEFAULT_MODE: 0,
    CENTRALIZED_MODE: 1,
    
    nodeOptions: {
    	defaultNode: {
			shape: 'box',
			color: {
				border: 'rgba(0,0,0,0.1)',
				background: 'rgba(255,255,255,1)'
			},
			scaling: {
				label: {
					min: 10,
					max: 30,
					maxVisible: 50,
					drawThreshold: 6
				}
			}
    	},
    	centralizedNode: {
    		shape: 'text',
    		scaling: {
				label: {
					min: 6,
					max: 30,
					maxVisible: 50,
					drawThreshold: 1
				}
			}
    	}
	},
	edgeOptions: {
		defaultEdge: {
			color: {
				color: 'rgba(0,0,0,0.1)',
				highlight: 'black',
				hover: 'red'
			},
			labelHighlightBold: false,
			scaling: {
				min: 1,
				max: 15
			},
			length: undefined
		},
		centralizedEdge: {
			scaling: {
				min: 1,
				max: 1
			},
			length: 150
		}
	},
	highlightOptions: {
		font: {
			color: 'white'
		},
		color: {
			background: 'black',
			hover: {
				border: '#CB157F',
				background: '#EB42A5'
			}
		}
	},
	physicsOptions: {
		defaultPhysics: {
			barnesHut: {
				gravitationalConstant: -1500,
				centralGravity: 6,
				damping: 0.5,
				avoidOverlap: 0.5,
				springConstant: 0.04
			}
		},
		centralizedPhysics: {
			barnesHut: {
				gravitationalConstant: -1500,
				centralGravity: 1,
				damping: 1,
				avoidOverlap: 0.01,
				springConstant: 0.2
			}
		}
	},
	
	stablizationMaxTime: 5000, // milliseconds that stabilization should run for
	
	keywordColor: 'green',
	contextColor: 'maroon',
    
    constructor: function(config) {

        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);

    	this.setNodeDataSet(new vis.DataSet());
    	this.setEdgeDataSet(new vis.DataSet());
    	
    	this.setGraphMode(this.DEFAULT_MODE);
    	
    	this.setStabilizationTask(Ext.TaskManager.newTask({
    		run: function() {
    			this.getNetwork().stopSimulation();
    		},
    		scope: this,
    		interval: this.stablizationMaxTime,
    		repeat: 1,
    		fireOnStart: false
    	}));
    	
    },
    
    initComponent: function() {
    	
        var me = this;

        Ext.apply(me, {
    		title: this.localize('title'),
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                items: [{
                   xtype: 'querysearchfield'
                },{
                	text: me.localize('clearTerms'),
					glyph: 'xf014@FontAwesome',
                	handler: function() {
                		this.getNodeDataSet().clear();
                		this.getEdgeDataSet().clear();
                		
                		this.setGraphMode(this.DEFAULT_MODE);
                	},
                	scope: me
                },this.localize('context'),{
                	xtype: 'slider',
                	itemId: 'contextSlider',
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
                    			if (this.getGraphMode() === this.DEFAULT_MODE) {
	                    			var terms = this.getNodeDataSet().map(function(node) { return node.label; });
	                				if (terms.length > 0) {
	                					this.getNodeDataSet().clear();
	                					this.loadFromQuery(terms);
	                				}
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
				text: 'Fetch Collocates',
				style: 'margin: 5px;',
				handler: function(b, e) {
					var n = this.getNetwork().getSelectedNodes();
		    		if (n[0] != null) {
		    			var data = this.getNodeDataSet().get(n[0]);
		    			this.itemdblclick(data);
		    		}
				},
				scope: this
			},{
				xtype: 'button',
				text: 'Centralize',
				style: 'margin: 5px;',
				handler: function(b, e) {
					var n = this.getNetwork().getSelectedNodes();
		    		if (n[0] != null) {
		    			this.doCentralize(n[0]);
                		this.getContextMenu().hide();
		    		}
				},
				scope: this
			},{
				xtype: 'button',
				text: 'Remove',
				style: 'margin: 5px;',
				handler: function(b, e) {
					var n = this.getNetwork().getSelectedNodes();
					if (n[0] != null) {
						this.getNodeDataSet().remove(n[0]);
						b.up('menu').hide();
						this.forceUpdate();
					}
				},
				scope: this
			}]
		}));
        
        this.on("loadedCorpus", function(src, corpus) {
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
		}, this);
        
        me.callParent(arguments);

    },
    
    initLoad: function() {
		this.initGraph();
		
		if (this.getApiParam('centralize')) {
			this.setGraphMode(this.CENTRALIZED_MODE);
			var term = this.getApiParam('centralize');
			this.getNodeDataSet().update({
				id: term,
				label: term,
				title: term+' ('+1+')',
				type: 'keyword',
				value: 1,
				start: 0,
				font: {color: this.keywordColor}
			});
			this.doCentralize(term);
		} else {
			var limit = 3;
			var query = this.getApiParam('query');
			if (query !== undefined) {
				limit = query.split(',').length;
			}
			this.getCorpus().getCorpusTerms({autoLoad: false}).load({
				params: {
					limit: limit,
					query: query,
					stopList: this.getApiParam("stopList")
				},
			    callback: function(records, operation, success) {
			    	if (success) {
			    		this.loadFromCorpusTermRecords(records);
			    	}
			    },
			    scope: this
	    	});
		}
    },
    
    loadFromQuery: function(query) {
    	this.setApiParams({
    		mode: 'corpus'
    	});
    	var params = this.getApiParams();
    	(Ext.isString(query) ? [query] : query).forEach(function(q) {
        	this.getCorpus().getCorpusCollocates({autoLoad: false}).load({
        		params: Ext.apply(Ext.clone(params), {query: q}),
        		callback: function(records, operations, success) {
        			if (success) {
        				this.loadFromCorpusCollocateRecords(records);
        			}
        		},
        		scope: this
        	});
    	}, this);
    },
    
    loadFromCorpusTermRecords: function(corpusTerms) {
    	if (Ext.isArray(corpusTerms) && corpusTerms.length>0) {
    		var terms = [];
    		corpusTerms.forEach(function(corpusTerm) {
    			terms.push(corpusTerm.getTerm());
    		});
    		this.loadFromQuery(terms);
    	}
    },
    
    loadFromCorpusCollocateRecords: function(records, keywordId) {
    	if (Ext.isArray(records)) {
    		var start = this.getApiParam('limit');
    		var nodeDS = this.getNodeDataSet();
    		var edgeDS = this.getEdgeDataSet();
    		var existingKeys = {};
    		nodeDS.forEach(function(item) {
    			existingKeys[item.id] = true;
    		});
    		var newNodes = [];
    		var newEdges = [];
    		
    		records.forEach(function(corpusCollocate, index) {
    			var term = corpusCollocate.getTerm();
    			var contextTerm = corpusCollocate.getContextTerm();
    			var termFreq = corpusCollocate.getKeywordRawFreq();
    			var contextFreq = corpusCollocate.getContextTermRawFreq();
    			
    			var termValue = termFreq;
    			var contextValue = contextFreq;
    			if (this.getGraphMode() === this.CENTRALIZED_MODE) {
    				termValue = 0;
    				contextValue = Math.log(contextFreq);
    			}
    			
    			if (index == 0) { // only process keyword once
    				if (keywordId === undefined) keywordId = term;
	    			if (existingKeys[keywordId] !== undefined) {
	    				nodeDS.update({
	    					id: keywordId,
	    					value: termValue,
	    					title: term+' ('+termFreq+')',
	    					type: 'keyword',
	    					font: {color: this.keywordColor}
	    				});
	    			} else {
	    				existingKeys[keywordId] = true;
	    				newNodes.push({
		    				id: term,
	    					label: term,
	    					title: term+' ('+termFreq+')',
	    					type: 'keyword',
	    					value: termValue,
	    					start: start,
	    					font: {color: this.keywordColor}
						});
	    			}
				}
    			
    			if (term != contextTerm) {
	    			var contextNodeKey = contextTerm;
	    			if (existingKeys[contextNodeKey] !== undefined) {
	    			} else {
	    				existingKeys[contextNodeKey] = true; 
	    				newNodes.push({
    	    				id: contextTerm,
        					label: contextTerm,
        					title: contextTerm+' ('+contextFreq+')',
        					type: 'context',
        					value: contextValue,
        					start: 0,
        					font: {color: this.contextColor}
    					});
	    			}
	    			
	    			var existingLink = null;
	    			edgeDS.forEach(function(item) {
	    				if ((item.from == keywordId && item.to == contextNodeKey) || (item.from == contextNodeKey && item.to == keywordId)) {
	    					existingLink = item;
	    				}
	    			});
	    			
	    			var linkValue = corpusCollocate.getContextTermRawFreq();
	    			if (existingLink === null) {
	    				newEdges.push({from: keywordId, to: contextNodeKey, value: linkValue});
	    			} else if (existingLink.value < linkValue) {
    					edgeDS.update({id: existingLink.id, value: linkValue});
	    			}
    			}
    		}, this);
    		
    		nodeDS.add(newNodes);
    		edgeDS.add(newEdges);
    		
    		this.forceUpdate();
    		
    		this.getNetwork().fit();
    	}
    },
    
    doCentralize: function(node) {
    	var centralizeLimit = 150;
		var centerNodeSize = 75;
		
		var data = this.getNodeDataSet().get(node);
		data.fixed = true;
		data.shape = 'circle';
		data.scaling = {
			min: centerNodeSize,
			max: centerNodeSize
			,label: {
				min: centerNodeSize,
				max: centerNodeSize
			}
		};
		
		
		this.getNodeDataSet().clear();
		this.getEdgeDataSet().clear();
		this.getNodeDataSet().add(data);
		
		this.setGraphMode(this.CENTRALIZED_MODE);
		
		var limit = this.getApiParam('limit');
		this.setApiParam('limit', centralizeLimit);
		this.itemdblclick(data);
		this.setApiParam('limit', limit);
    },
    
    applyGraphMode: function(mode) {
    	mode = mode === undefined ? this.DEFAULT_MODE : mode;
    	var network = this.getNetwork();
    	if (network !== undefined) {
	    	if (mode === this.DEFAULT_MODE) {
	    		network.setOptions({
	    			physics: this.physicsOptions.defaultPhysics,
	    			nodes: this.nodeOptions.defaultNode,
	    			edges: this.edgeOptions.defaultEdge
	    		});
	    	} else if (mode === this.CENTRALIZED_MODE) {
	    		network.setOptions({
	    			physics: this.physicsOptions.centralizedPhysics,
	    			nodes: this.nodeOptions.centralizedNode,
	    			edges: this.edgeOptions.centralizedEdge
	    		});
	    	}
    	}
    	
    	return mode;
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
	    		}
	    	};
	    	
	    	var network = new vis.Network(el.dom, {
	    		nodes: this.getNodeDataSet(),
	    		edges: this.getEdgeDataSet()
	    	}, options);
	    	this.setNetwork(network);
	    	
	    	this.setGraphMode();
	    	
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
	    	    		this.forceUpdate();
	    	    		this.unmask();
	    	    	} else {
	    	    		this.getNodeDataSet().update({id: n, fixed: true});
	    	    	}
	    		}
	    	}.bind(this));
	    	
	    	network.on('click', function(params) {
	    		this.getContextMenu().hide();
	    		if (params) {
	    			var nodes = this.getNodeDataSet();
	    			if (params.nodes && params.nodes.length>0) {
		    			this.dispatchEvent("termsClicked", this, [nodes.get(params.nodes[0]).label])
		    		} else if (params.edges && params.edges.length>0) {
		    			var edge = this.getEdgeDataSet().get(params.edges[0]);
		    			this.dispatchEvent("termsClicked", this, ['"'+nodes.get(edge.from).label+' '+nodes.get(edge.to).label+'"~'+this.getApiParam('context')])
		    		}
	    		}
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
	    	
	    	network.on('startStabilizing', function() {
	    		this.getStabilizationTask().restart();
	    	}.bind(this));
	    	
	    	network.on('stabilized', function() {
	    		this.getStabilizationTask().stop();
	    		this.getNetwork().fit({
	    			animation: {
	    				duration: 500,
	    				easing: 'linear'
	    			}
	    		});
	    	}.bind(this));
	    	
	    	network.on('resize', function(params) {
	    		this.getNetwork().fit({
	    			animation: {
	    				duration: 500,
	    				easing: 'linear'
	    			}
	    		});
	    	}.bind(this));
    	}
    },
    
    forceUpdate: function() {
    	// force visjs to apply scaling
    	var ids = this.getNodeDataSet().map(function(item) {
			return {id: item.id};
		});
		this.getNodeDataSet().update(ids);
		ids = this.getEdgeDataSet().map(function(edge) {
			return {id: edge.id};
		});
		this.getEdgeDataSet().update(ids);
    },
    
    isOffCanvas: function(d) {
    	return d.x < 0 || d.y < 0 || d.x > this.getGraphWidth() || d.y > this.getGraphHeight();
    },

    itemdblclick: function(d) {
    	var limit = this.getApiParam('limit');
    	var corpusCollocates = this.getCorpus().getCorpusCollocates({autoLoad: false});
    	corpusCollocates.load({
    		params: Ext.apply(this.getApiParams(), {query: d.id, start: d.start, limit: limit}),
    		callback: function(records, operation, success) {
    			if (success) {
    	    		this.getNodeDataSet().update({id: d.id, start: d.start+limit});
    	    		
	    			var keywordNodeKey = d.id;
	    			
    	    		this.loadFromCorpusCollocateRecords(records, keywordNodeKey);
    			}
    		},
    		scope: this
    	});
    }
    
});