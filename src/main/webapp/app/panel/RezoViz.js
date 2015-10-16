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
    		repulsion: {en: 'Repulsion'},
    		stiffness: {en: 'Stiffness'},
    		friction: {en: 'Friction'}
    	},
    	api: {
    		query: undefined,
    		limit: 15,
    		stopList: 'auto',
    		types:['organization','location','person']
    	},
		glyph: 'xf1cb@FontAwesome'
    },
    
    config: {
    	corpus: undefined,
    	network: undefined, // the vis network graph
    	nodesStore: undefined, // used by combo
    	nodesDataSet: undefined, // used by vis
    	edgesDataSet: undefined, // used by vis
    	highlightedEntity: undefined
    },

    nodeOptions: {
		shape: 'box',
		color: {
			border: '#157fcc',
			background: '#82C3F2',
			highlight: {
				border: '#EA8034',
				background: '#EFA26B',
			},
			hover: {
				border: '#157fcc',
				background: '#82C3F2',
			}
		}
	},
	edgeOptions: {
		color: {
			color: '#157fcc',
			highlight: '#EA8034',
			hover: '#EA8034'
		}
	},
	highlightOptions: {
		color: {
			border: '#CB157F',
			background: '#EB42A5',
			hover: {
				border: '#CB157F',
				background: '#EB42A5'
			}
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
                items: [{
                    xtype: 'combo',
                    queryMode: 'local',
                    valueField: 'term',
                    displayField: 'term',
                    store: this.getNodesStore(),
                    listeners: {
						select: function(combo, record) {
							this.highlightEntity(record.get('id'));
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
                },{ xtype: 'tbseparator' },{
                	xtype: 'slider',
                	fieldLabel: this.localize('repulsion'),
                	labelAlign: 'right',
                	labelWidth: 70,
                	width: 150,
                	value: 2,
                	increment: 1,
                	minValue: 0,
                	maxValue: 10,
                	listeners: {
                		changecomplete: function(slider, val) {
                			val = this.map(val, 0, 10, 0, -20000);
                			this.getNetwork().physics.options.barnesHut.gravitationalConstant = val;
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
                			this.getNetwork().physics.options.barnesHut.springConstant = val;
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
                			this.getNetwork().physics.options.barnesHut.damping = val;
                			this.getNetwork().startSimulation();
                		},
                		scope: this
                	}
                }]
            }]
        });
        
        this.on('loadedCorpus', function(src, corpus) {
        	this.setCorpus(corpus);
        	this.getEntities();
        }, this);
        
        this.on('resize', function(panel, width, height) {

		}, this);
        
    	this.mixins['Voyant.panel.Panel'].initComponent.apply(this, arguments);
        me.callParent(arguments);
    },
    
    getEntities: function() {
    	var corpusId = this.getCorpus().getId();
    	var types = this.getApiParam('types');
    	Ext.Ajax.request({
    		url: this.getApplication().getTromboneUrl(),
    		method: 'GET',
    		params: {
    			tool: 'corpus.EntityCollocationsGraph',
    			type: types,
    			corpus: corpusId
    		},
    		success: function(response) {
    			var obj = Ext.decode(response.responseText);
    			this.processEntities(obj.entityCollocationsGraph);
    			this.initGraph();
    		},
    		scope: this
    	});
    },
    
    processEntities: function(entityParent) {
    	var nodes = entityParent.nodes;
    	var edges = entityParent.edges;
    	
    	var visNodes = [];
    	for (var i = 0; i < nodes.length; i++) {
    		var n = nodes[i];
    		n.id = i;
    		visNodes.push({id: i, label: n.term, type: n.type, rawFreq: n.rawFreq, title: n.term + (n.rawFreq ? ' ('+n.rawFreq+')':'')});
    	}
    	
    	this.getNodesStore().loadData(nodes);
    	
    	var visEdges = [];
    	for (var i = 0; i < edges.length; i++) {
    		var link = edges[i].nodes;
    		visEdges.push({from: link[0], to: link[1]});
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
				barnesHut: {
					gravitationalConstant: -2000,
					centralGravity: 0.3,
					springLength: 95,
					springConstant: 0.04,
					damping: 0.09,
					avoidOverlap: 0
				}
    		},
    		nodes: this.nodeOptions,
    		edges: this.edgeOptions
    	};
    	
    	
    	var network = new vis.Network(el.dom, {
    		nodes: this.getNodesDataSet(),
    		edges: this.getEdgesDataSet()
    	}, options);
    	
//    	network.on('click', function(params) {
//    		
//    	});
//    	network.on('doubleClick', function(params) {
//    		
//    	});
    	network.on('selectNode', function(params) {
    		var node = params.nodes[0];
    		this.doNodeSelect(node);
    	}.bind(this));
    	network.on('deselectNode', function(params) {
    		this.removeHighlight();
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
    	var network = this.getNetwork();
		var nodes = network.getConnectedNodes(node);
		nodes.push(node);
		var edges = network.getConnectedEdges(node);
		
		// custom selection to avoid selecting edges between the secondary/connected nodes
		this.removeHighlight();
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
    
    highlightEntity: function(nodeId) {
    	var network = this.getNetwork();
    	for (var id in network.body.nodes) {
    		if (id == nodeId) {
    			network.body.nodes[id].setOptions(this.highlightOptions);
    			this.setHighlightedEntity(nodeId);
    		} else {
    			network.body.nodes[id].setOptions(this.nodeOptions);
    		}
    	}
    	network.redraw();
    },
    
    removeHighlight: function() {
    	var id = this.getHighlightedEntity();
    	if (id !== undefined) {
    		this.getNetwork().body.nodes[id].setOptions(this.nodeOptions);
    		this.getNetwork().redraw();
    		this.setHighlightedEntity(undefined);
    	}
    },
    
    categoriesHandler: function(item) {
    	var categories = [];
    	item.up('menu').items.each(function(checkitem) {
    		if (checkitem.checked) {
    			categories.push(checkitem.itemId);
    		}
    	});
    	
    	this.setApiParam('types', categories);
    	this.getEntities();
    },
    
    map: function(value, istart, istop, ostart, ostop) {
		return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
	}
});