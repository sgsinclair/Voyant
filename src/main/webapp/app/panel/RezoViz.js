Ext.define('Voyant.panel.RezoViz', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.rezoviz',
    statics: {
    	i18n: {
    		title: {en: 'RezoViz'},
    		categories: {en: 'Categories'},
    		people: {en: 'People'},
    		locations: {en: 'Locations'},
    		organizations: {en: 'Organizations'},
    		reload: {en: 'Reload'},
    		minEdgeCount: {en: 'Min. Edge Count'},
    		repulsion: {en: 'Repulsion'},
    		stiffness: {en: 'Stiffness'},
    		friction: {en: 'Friction'},
    		noEntities: {en: 'No entities to graph.'},
    		noEntitiesForEdgeCount: {en: 'No entities were found. Would you like to reduce the minimum edge count to improve results?'},
    		loadingEntities: {en: 'Loading entities…'}
    	},
    	api: {
    		query: undefined,
    		limit: 25,
    		stopList: 'auto',
    		type: ['organization','location','person'],
    		minEdgeCount: 2
    	},
		glyph: 'xf1cb@FontAwesome'
    },
    
    config: {
    	corpus: undefined,
    	network: undefined, // the vis network graph
    	nodesStore: undefined, // used by combo
    	nodesDataSet: undefined, // used by vis
    	edgesDataSet: undefined, // used by vis
    	isNetworkBounded: true
    },

    categorizedNodeOptions: {
    	location: {
    		font: {
    			color: 'green'
    		}
    	},
    	person: {
    		font: {
    			color: 'maroon'
    		}
    	},
    	organization: {
    		font: {
    			color: 'purple'
    		}
    	}
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
        
        this.setNodesStore(Ext.create('Ext.data.Store', {
        	fields: ['id', 'term', 'type', 'rawFreq'],
        	sortOnLoad: true,
        	sorters: 'term'
        }));
        
        Ext.apply(me, {
    		title: this.localize('title'),
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
        		enableOverflow: true,
                items: [{
                    xtype: 'combo',
                    queryMode: 'local',
                    valueField: 'term',
                    displayField: 'term',
                    store: this.getNodesStore(),
                    listeners: {
						select: function(combo, record) {
							this.getNetwork().selectNodes([record.get('id')]);
						},
						scope: this
                    }
                },{
                	xtype: 'button',
	                text: this.localize('categories'),
	                menu: {
	                	items: [{
	                		xtype: 'menucheckitem',
	                		text: this.localize('people'),
	                		itemId: 'person',
	                		checked: true
	                	},{
	                		xtype: 'menucheckitem',
	                		text: this.localize('locations'),
	                		itemId: 'location',
	                		checked: true
	                	},{
	                		xtype: 'menucheckitem',
	                		text: this.localize('organizations'),
	                		itemId: 'organization',
	                		checked: true
	                	},{
	                		xtype: 'button',
	                		text: this.localize('reload'),
	                		style: 'margin: 5px;',
	                		handler: this.categoriesHandler,
	                		scope: this
	                	}]
	                }
                },{
					xtype: 'numberfield',
					itemId: 'minEdgeCount',
					fieldLabel: this.localize('minEdgeCount'),
					labelAlign: 'right',
					labelWidth: 120,
					width: 170,
					maxValue: 10,
					minValue: 1,
					allowDecimals: false,
					allowExponential: false,
					allowOnlyWhitespace: false,
					listeners: {
						render: function(field) {
							field.setRawValue(this.getApiParam('minEdgeCount'));
						},
						change: function(field, newVal) {
							if (field.isValid()) {
								this.setApiParam('minEdgeCount', newVal);
								this.getEntities();
							}
						},
						scope: this
					}
                },{ xtype: 'tbseparator' },{
                	xtype: 'slider',
                	fieldLabel: this.localize('repulsion'),
                	labelAlign: 'right',
                	labelWidth: 70,
                	width: 150,
                	value: 100,
                	increment: 10,
                	minValue: 0,
                	maxValue: 500,
                	listeners: {
                		changecomplete: function(slider, val) {
                			this.getNetwork().physics.options.repulsion.nodeDistance = val;
                			this.getNetwork().startSimulation();
                		},
                		scope: this
                	}
                },{
                	xtype: 'slider',
                	fieldLabel: this.localize('stiffness'),
                	labelAlign: 'right',
                	labelWidth: 70,
                	width: 150,
                	value: 4,
                	increment: 1,
                	minValue: 0,
                	maxValue: 10,
                	listeners: {
                		changecomplete: function(slider, val) {
                			val /= 100;
                			this.getNetwork().physics.options.repulsion.springConstant = val;
                			this.getNetwork().startSimulation();
                		},
                		scope: this
                	}
                },{
                	xtype: 'slider',
                	fieldLabel: this.localize('friction'),
                	labelAlign: 'right',
                	labelWidth: 55,
                	width: 150,
                	value: 9,
                	increment: 10,
                	minValue: 0,
                	maxValue: 100,
                	listeners: {
                		changecomplete: function(slider, val) {
                			val /= 100;
                			this.getNetwork().physics.options.repulsion.damping = val;
                			this.getNetwork().startSimulation();
                		},
                		scope: this
                	}
                }]
            }]
        });
        
        this.on('loadedCorpus', function(src, corpus) {
        	this.setCorpus(corpus);
        	if (corpus.getDocumentsCount()==1) {
        		this.setApiParam("minEdgeCount", 1);
        	}
        	this.getEntities();
        }, this);
        
        this.on('resize', function(panel, width, height) {

		}, this);
        
    	this.mixins['Voyant.panel.Panel'].initComponent.apply(this, arguments);
        me.callParent(arguments);
    },
    
    getEntities: function() {
    	var corpusId = this.getCorpus().getId();
    	var el = this.getLayout().getRenderTarget();
    	el.mask(this.localize('loadingEntities'));
    	Ext.Ajax.request({
    		url: this.getApplication().getTromboneUrl(),
    		method: 'POST',
    		params: {
    			tool: 'corpus.EntityCollocationsGraph',
    			type: this.getApiParam('type'),
    			limit: this.getApiParam('limit'),
    			minEdgeCount: this.getApiParam("minEdgeCount"),
    			corpus: corpusId
    		},
    		success: function(response) {
    			el.unmask();
    			var obj = Ext.decode(response.responseText);
    			if (obj.entityCollocationsGraph.edges.length==0) {
    				this.showError({msg: this.localize('noEntities')});
    				Ext.Msg.confirm(this.localize('error'), this.localize('noEntitiesForEdgeCount'), function(button) {
    					if (button === 'yes') {
    						var newEdgeCount = Math.max(1, this.getApiParam('minEdgeCount')-1);
    						this.queryById('minEdgeCount').setRawValue(newEdgeCount);
    						this.setApiParam('minEdgeCount', newEdgeCount);
    						this.getEntities();
    					}
    				}, this);
    			}
    			else {
        			this.processEntities(obj.entityCollocationsGraph);
        			this.initGraph();
    			}
    		},
    		scope: this
    	});
    },
    
    processEntities: function(entityParent) {
    	var nodes = entityParent.nodes;
    	var edges = entityParent.edges;
    	
    	// we need to calculate the font size because the scaling option doesn't seem to work as advertised
    	var extent = d3.extent(nodes, function(node) {return node.rawFreq;});
    	var min = extent[0];
    	var max = extent[1];    	
    	var scaleFont = d3.scale.linear()
                    .domain([min, max])
                    .range([10, 24]);
    	
    	var visNodes = [];
    	for (var i = 0; i < nodes.length; i++) {
    		var n = nodes[i];
    		n.id = i;
    		visNodes.push({id: i, label: n.term, value: nodes[i].rawFreq, font: {size: scaleFont(n.rawFreq), color: this.categorizedNodeOptions[n.type].font.color}, type: n.type, rawFreq: n.rawFreq, title: n.term + (n.rawFreq ? ' ('+n.rawFreq+')':'')});
    	}
    	
    	this.getNodesStore().loadData(nodes);
    	
    	var visEdges = [];
    	for (var i = 0; i < edges.length; i++) {
    		var link = edges[i].nodes;
    		visEdges.push({from: link[0], to: link[1], title: edges[i].count, value: 200*edges[i].count});
    	}
    	
    	this.setNodesDataSet(new vis.DataSet(visNodes));
    	this.setEdgesDataSet(new vis.DataSet(visEdges));
    },
    
    initGraph: function() {
    	var el = this.getLayout().getRenderTarget();
    	el.update(''); // clear
    	
    	// explicitly set dimensions
    	el.setWidth(el.getWidth());
    	el.setHeight(el.getHeight());

    	var options = {
			interaction: {
    			hover: true,
    			hoverConnectedEdges: true,
    			multiselect: false
    		},
    		physics: {
    			solver: 'repulsion',
    			repulsion: {
    				centralGravity: 0.1
    			}
    		},
    		nodes: this.nodeOptions,
    		edges: this.edgeOptions
    	};
    	
    	
    	var network = new vis.Network(el.dom, {
    		nodes: this.getNodesDataSet(),
    		edges: this.getEdgesDataSet()
    	}, options);

    	if (this.getIsNetworkBounded()) {
	    	network.on('beforeDrawing', function (ctx) {
	    		var el = this.getLayout().getRenderTarget();
	    		var width = el.getWidth();
	    		var height = el.getHeight();
	    		
	    	    var nodePositions = network.getPositions();
	    	    for (var id in nodePositions) {
	    	    	var node = nodePositions[id];
	    	    	var xy = network.canvasToDOM(node);
	    	    	var boundedX = Math.max(0, Math.min(width, xy.x));
	    	    	var boundedY = Math.max(0, Math.min(height, xy.y));
	    	    	var bXY = network.DOMtoCanvas({x: boundedX, y: boundedY});
	    	    	network.body.nodes[id].x = bXY.x;
	    	    	network.body.nodes[id].y = bXY.y;
	    	    }
	    	}.bind(this));
    	}
    	
    	network.on('selectNode', function(params) {
    		var node = params.nodes[0];
    		this.doNodeSelect(node);
    	}.bind(this));
    	network.on('deselectNode', function(params) {
    		network.unselectAll(); // need this due to our custom selecting code
    		
    		var node = params.nodes[0];
    		if (node !== undefined) {
    			// select clicked node after deselection is finished
    			setTimeout(this.doNodeSelect.bind(this), 5, node);
    		}
    	}.bind(this));
    	network.on('selectEdge', function(params) {
    		// prevent edge selection
    		network.unselectAll();
    	});
    	
    	this.setNetwork(network);
    },
    
    doNodeSelect: function(node) {
		var term = this.getNodesDataSet().get(node).label;
		this.dispatchEvent("termsClicked", this, [term]);
    	var network = this.getNetwork();
		var nodes = network.getConnectedNodes(node);
		nodes.push(node);
		var edges = network.getConnectedEdges(node);
		
		// custom selection to avoid selecting edges between the secondary/connected nodes
		network.unselectAll();
		for (var i = 0; i < nodes.length; i++) {
			var n = nodes[i];
			var nodeObj = network.body.nodes[n];
			network.selectionHandler.selectObject(nodeObj, false);
		}
		for (var i = 0; i < edges.length; i++) {
			var e = edges[i];
			var edgeObj = network.body.edges[e];
			network.selectionHandler.selectObject(edgeObj, false);
		}
		
		network.redraw(); // need to force redraw if coming from deselect
    },
    
    categoriesHandler: function(item) {
    	var categories = [];
    	item.up('menu').items.each(function(checkitem) {
    		if (checkitem.checked) {
    			categories.push(checkitem.itemId);
    		}
    	});
    	
    	this.setApiParam('type', categories);
    	this.getEntities();
    },
    
    map: function(value, istart, istop, ostart, ostop) {
		return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
	}
});