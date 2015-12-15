Ext.define('Voyant.panel.Streamgraph', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.streamgraph',
    statics: {
    	i18n: {
    		title: {en: 'Streamgraph'},
    		clearTerms : {en: 'Clear Terms'},
    		granularity : {en: 'Granularity'}
    	},
    	api: {
    		limit: 5,
    		stopList: 'auto',
    		query: undefined,
    		withDistributions: 'raw',
    		bins: 50,
    		docIndex: undefined,
    		docId: undefined
    	},
		glyph: 'xf1cb@FontAwesome'
    },
    
    config: {
    	corpus: undefined,
    	visLayout: undefined,
    	vis: undefined,
    	mode: undefined
    },
    
    graphMargin: {top: 0, right: 0, bottom: 0, left: 0},
    
    MODE_CORPUS: 'corpus',
    MODE_DOCUMENT: 'document',
    
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
        var me = this;
        
        Ext.apply(me, {
    		title: this.localize('title'),
    		tbar: new Ext.Toolbar({
				items: {
					xtype: 'legend',
					store: new Ext.data.JsonStore({
						fields: ['name', 'mark']
					}),
					listeners: {
						itemclick: function(view, record, el, index) {
							var term = record.get('name');
//							if (this.isTermSelected(term)) {
//								this.doTermDeselect(term);
//							} else {
//								this.doTermSelect(term);
//							}
						},
						scope: this
					}
				}
			}),
			bbar: new Ext.Toolbar({
				items: [
//				{
//                	xtype: 'querysearchfield'
//                },
                {
	            	xtype: 'button',
	            	text: this.localize('clearTerms'),
	            	handler: function() {
	            		
	            	},
	            	scope: this
	            },
	            '-',{
	            	xtype: 'documentselector',
	            	itemId: 'docSelector',
	            	singleSelect: true
	            }
	            ,'-',{
	            	xtype: 'slider',
	            	itemId: 'granularity',
	            	fieldLabel: this.localize('granularity'),
	            	labelAlign: 'right',
	            	labelWidth: 70,
	            	width: 150,
	            	increment: 10,
	            	minValue: 10,
	            	maxValue: 300,
	            	listeners: {
	            		changecomplete: function(slider, newvalue) {
	            			this.setApiParams({bins: newvalue});
	            			this.loadFromCorpus();
	            		},
	            		scope: this
	            	}
	            }]
			})
        });
        
        this.on('loadedCorpus', function(src, corpus) {
        	this.setCorpus(corpus);
        	this.down('#docSelector').setCorpus(corpus);
    		if (this.isVisible()) {
        		this.loadFromCorpus();
    		}
        }, this);
        
        this.on('documentsSelected', function(src, docIds) {
        	var docId = docIds[0];
        	this.setApiParam('docId', docId);
        	this.loadFromDocumentTerms();
        }, this);
        
        this.on('resize', function(panel, width, height) {

		}, this);
        
        this.on('boxready', this.initGraph, this);
        
    	this.mixins['Voyant.panel.Panel'].initComponent.apply(this, arguments);
        me.callParent(arguments);
    },
    
    loadFromCorpus: function() {
    	var corpus = this.getCorpus();
		if (this.getApiParam('docId') || this.getApiParam('docIndex')) {
			this.loadFromDocumentTerms();
		} else if (corpus.getDocumentsCount() == 1) {
			this.loadFromDocument(corpus.getDocument(0));
		} else {
			this.loadFromCorpusTerms(corpus.getCorpusTerms());
		}
	},

    loadFromCorpusTerms: function(corpusTerms) {
		corpusTerms.load({
		    callback: function(records, operation, success) {
		    	if (success) {
		    		this.setMode(this.MODE_CORPUS);
			    	this.loadFromRecords(records);
		    	} else {
					Voyant.application.showResponseError(this.localize('failedGetCorpusTerms'), operation);
		    	}
		    },
		    scope: this,
		    params: this.getApiParams(['limit','stopList','query','withDistributions'])
    	});
    },
    
    loadFromDocument: function(document) {
    	if (document.then) {
    		var me = this;
    		document.then(function(document) {me.loadFromDocument(document);});
    	} else {
    		var ids = [];
    		if (Ext.getClassName(document)=="Voyant.data.model.Document") {
        		this.setApiParams({
        			docIndex: undefined,
        			query: undefined,
        			docId: document.getId()
        		});
        		if (this.isVisible()) {
                	this.loadFromDocumentTerms();
        		}
    		}
    	}
    },
    
    loadFromDocumentTerms: function(documentTerms) {
    	if (this.getCorpus()) {
        	documentTerms = documentTerms || this.getCorpus().getDocumentTerms({autoLoad: false});
    		documentTerms.load({
    		    callback: function(records, operation, success) {
    		    	if (success) {
    		    		this.setMode(this.MODE_DOCUMENT);
    		    		this.loadFromRecords(records);
    		    	}
    		    	else {
    					Voyant.application.showResponseError(this.localize('failedGetDocumentTerms'), operation);
    		    	}
    		    },
    		    scope: this,
    		    params: this.getApiParams(['docId','docIndex','limit','stopList','query','docId','withDistributions','bins'])
        	});
    	}
    },
    
    loadFromRecords: function(records) {
    	var color = d3.scale.category10();
    	
    	var legendStore = this.down('[xtype=legend]').getStore();
    	var legendData = [];
    	var layers = [];
    	records.forEach(function(record, index) {
    		var termLayer = [];
    		record.get('distributions').forEach(function(r, i) {
    			termLayer.push({x: i, y: r});
    		}, this);
    		layers.push(termLayer);
    		legendData.push({name: record.get('term'), mark: color(index)});
    	}, this);
    	
    	legendStore.loadData(legendData);
    	
    	var processedLayers = this.getVisLayout()(layers);
    	
    	var steps;
    	if (this.getMode() === this.MODE_DOCUMENT) {
    		steps = this.getApiParam('bins')-1;
    	} else {
    		steps = this.getCorpus().getDocumentsCount()-1;
    	}
    	var width = this.body.down('svg').getWidth() - this.graphMargin.left - this.graphMargin.right;
    	var x = d3.scale.linear().domain([0, steps]).range([0, width]);
    	
    	var max = d3.max(processedLayers, function(layer) {
    		return d3.max(layer, function(d) { return d.y0 + d.y; });
    	});
    	
    	var height = this.body.down('svg').getHeight() - this.graphMargin.top - this.graphMargin.bottom;
    	var y = d3.scale.linear().domain([0, max]).range([height, 0]);
    	
    	var area = d3.svg.area()
	    	.x(function(d) { return x(d.x); })
			.y0(function(d) { return y(d.y0); })
			.y1(function(d) { return y(d.y0 + d.y); });
    	
//    	var xAxis = d3.svg.axis().scale(x).orient('bottom');
//    	
//    	var yAxis = d3.svg.axis().scale(y).orient('left');
    	
    	var sel = this.getVis().selectAll('path');
    	
    	if (sel.size() === 0) {
    		sel.data(processedLayers).enter().append('path')
	    		.attr('d', function(d) { return area(d); })
	    		.style('fill', function(d, i) { return color(i); });
//	    		.append('title').text(function (d) { return d.key; });
    	} else {
    		sel.data(processedLayers).attr('d', function(d) { return area(d); });
    	}
    	
    	
//    	this.getVis().append('g')
//    		.attr('class', 'axis axis--x')
//    		.attr('transform', 'translate(0,'+height+')')
//    		.call(xAxis);
//    	this.getVis().append('g')
//			.attr('class', 'axis axis--y')
//			.attr('transform', 'translate('+this.graphMargin.left+',0)')
//			.call(yAxis);
    },
    
    initGraph: function() {
    	if (this.getVisLayout() === undefined) {
	    	var el = this.getLayout().getRenderTarget();
	    	var padding = 0;
	    	var width = el.getWidth()-padding;
			var height = el.getHeight()-padding;
	    	this.setVisLayout(
				d3.layout.stack()
					.offset('silhouette')
//					.values(function(d) {
//						return d.values;
//					})
			);
			
			this.setVis(d3.select(el.dom).append('svg').attr('id','streamGraph')
					.attr('width', width).attr('height', height).attr('transform', 'translate('+(padding/2)+','+(padding/2)+')')
			);
    	}
    }
});

