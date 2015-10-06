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
    		reload: {en: 'Reload'}
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
    	edgesDataSet: undefined // used by vis
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
    
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
        var me = this;
        
        this.setNodesStore(Ext.create('Ext.data.Store', {
        	fields: ['id', 'term', 'type', 'rawFreq']
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
                }]
            }]
        });
        
        this.on('loadedCorpus', function(src, corpus) {
        	this.setCorpus(corpus);
        	this.getEntities();
        }, this);
        
        this.on('query', function(src, query) {
//        	this.loadFromQuery(query);
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
    		visNodes.push({id: i, label: n.term, type: n.type, rawFreq: n.rawFreq});
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
    		
    	}.bind(this));
    	network.on('deselectNode', function(params) {
    		network.unselectAll(); // need this due to our custom selecting code
    	});
    	network.on('selectEdge', function(params) {
    		// prevent edge selection
    		network.unselectAll();
    	});
    	
    	this.setNetwork(network);
    },
    
    highlightEntity: function(nodeId) {
    	var network = this.getNetwork();
    	for (var id in network.body.nodes) {
    		if (id == nodeId) {
    			network.body.nodes[id].setOptions({
    	    		color: '#E92B9A'
    	    	});
    		} else {
    			network.body.nodes[id].setOptions(this.nodeOptions);
    		}
    	}
    	network.redraw();
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
    }
});