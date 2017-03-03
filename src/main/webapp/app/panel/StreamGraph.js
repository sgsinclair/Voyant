Ext.define('Voyant.panel.StreamGraph', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.streamgraph',
    statics: {
    	i18n: {
    	},
    	api: {
    		limit: 5,
    		stopList: 'auto',
    		query: undefined,
    		withDistributions: 'relative',
    		bins: 50,
    		docIndex: undefined,
    		docId: undefined
    	},
		glyph: 'xf1fe@FontAwesome'
    },
    
    config: {
    	visLayout: undefined,
    	vis: undefined,
    	mode: 'corpus'
    },
    
    graphMargin: {top: 20, right: 60, bottom: 110, left: 80},
    
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
        		enableOverflow: true,
				items: ['->',{
					xtype: 'legend',
					store: new Ext.data.JsonStore({
						fields: ['name', 'mark', 'active']
					}),
					listeners: {
						itemclick: function(view, record, el, index) {
							var isActive = Ext.fly(el.firstElementChild).hasCls('x-legend-inactive');
							record.set('active', isActive);
							var terms = this.getCurrentTerms();
							this.setApiParams({query: terms, limit: terms.length, stopList: undefined});
							this.loadFromCorpus();
						},
						scope: this
					}
				},'->']
			}),
			bbar: {
        		enableOverflow: true,
				items: [{
                	xtype: 'querysearchfield'
                },{
	            	xtype: 'button',
	            	text: this.localize('clearTerms'),
	            	handler: function() {
	            		this.setApiParams({query: undefined});
	            		this.loadFromRecords([])
	            	},
	            	scope: this
	            },{
	            	xtype: 'corpusdocumentselector',
	            	singleSelect: true
	            },{
	            	text: this.localize('freqsMode'),
					glyph: 'xf201@FontAwesome',
				    tooltip: this.localize('freqsModeTip'),
				    menu: {
				    	items: [{
				               text: this.localize('relativeFrequencies'),
				               checked: true,
				               itemId: 'relative',
				               group: 'freqsMode',
				               checkHandler: function(item, checked) {
				            	   if (checked) {
				                	   this.setApiParam('withDistributions', 'relative');
				                	   this.loadFromCorpus();
				            	   }
				               },
				               scope: this
				           }, {
				               text: this.localize('rawFrequencies'),
				               checked: false,
				               itemId: 'raw',
				               group: 'freqsMode',
				               checkHandler: function(item, checked) {
				            	   if (checked) {
				                	   this.setApiParam('withDistributions', 'raw');
				                	   this.loadFromCorpus();
				            	   }
				               },
				               scope: this
			           }]
				    }
	            },{
	            	xtype: 'slider',
	            	itemId: 'segmentsSlider',
	            	fieldLabel: this.localize('segments'),
	            	labelAlign: 'right',
	            	labelWidth: 70,
	            	width: 150,
	            	increment: 10,
	            	minValue: 10,
	            	maxValue: 300,
	            	listeners: {
	            		afterrender: function(slider) {
	            			slider.setValue(this.getApiParam('bins'));
	            		},
	            		changecomplete: function(slider, newvalue) {
	            			this.setApiParams({bins: newvalue});
	            			this.loadFromCorpus();
	            		},
	            		scope: this
	            	}
	            }]
			}
        });
        
        this.on('loadedCorpus', function(src, corpus) {
        	if (this.getCorpus().getDocumentsCount() == 1 && this.getMode() != this.MODE_DOCUMENT) {
				this.setMode(this.MODE_DOCUMENT);
			}
			if (!('bins' in this.getModifiedApiParams())) {
				if (this.getMode() == this.MODE_CORPUS) {
					var count = corpus.getDocumentsCount();
					var binsMax = 100;
					this.setApiParam('bins', count > binsMax ? binsMax : count);
				}
			}
    		if (this.isVisible()) {
    			this.loadFromCorpus();
    		}
        }, this);
        
        this.on('corpusSelected', function(src, corpus) {
    		if (src.isXType('corpusdocumentselector')) {
    			this.setMode(this.MODE_CORPUS);
    			this.setApiParams({docId: undefined, docIndex: undefined});
    			this.setCorpus(corpus);
        		this.loadFromCorpus();
    		}
    	});
        
        this.on('documentSelected', function(src, doc) {
        	var docId = doc.getId();
        	this.setApiParam('docId', docId);
        	this.loadFromDocumentTerms();
        }, this);
        
		this.on('query', function(src, query) {
        	var terms = this.getCurrentTerms();
        	terms.push(query);
        	this.setApiParams({query: terms, limit: terms.length, stopList: undefined});
        	if (this.getMode() === this.MODE_DOCUMENT) {
        		this.loadFromDocumentTerms();
        	} else {
        		this.loadFromCorpusTerms(this.getCorpus().getCorpusTerms());
        	}
        }, this);
		
        this.on('resize', function(panel, width, height) {

		}, this);
        
        this.on('boxready', this.initGraph, this);
        
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
    	var params = this.getApiParams(['limit','stopList','query','withDistributions','bins']);
		// ensure that we're not beyond the number of documents
		if (params.bins && params.bins > this.getCorpus().getDocumentsCount()) {
			params.bins = this.getCorpus().getDocumentsCount();
		}
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
		    params: params
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
    		    params: this.getApiParams(['docId','docIndex','limit','stopList','query','withDistributions','bins'])
        	});
    	}
    },
    
    loadFromRecords: function(records) {
    	var app = this.getApplication();
    	var color = function(name) {
    		return app.getColorForTerm(name, true);
    	};
    	
    	var legendStore = this.down('[xtype=legend]').getStore();
    	var legendData = [];
    	var layers = [];
    	records.forEach(function(record, index) {
    		var termLayer = [];
    		var key = record.getTerm();
    		record.get('distributions').forEach(function(r, i) {
    			termLayer.push({x: i, y: r});
    		}, this);
    		layers.push({name: key, values: termLayer});
    		legendData.push({id: key, name: key, mark: color(key), active: true});
    	}, this);
    	
    	legendStore.loadData(legendData);
    	
    	var processedLayers = this.getVisLayout()(layers);
    	
    	var steps;
    	if (this.getMode() === this.MODE_DOCUMENT) {
    		steps = this.getApiParam('bins');
    	} else {
    		var bins = this.getApiParam('bins');
    		var docsCount = this.getCorpus().getDocumentsCount();
    		steps = bins < docsCount ? bins : docsCount;
    	}
    	steps--;
    	
    	var width = this.body.down('svg').getWidth() - this.graphMargin.left - this.graphMargin.right;
    	var x = d3.scale.linear().domain([0, steps]).range([0, width]);
    	
    	var max = d3.max(processedLayers, function(layer) {
    		return d3.max(layer.values, function(d) { return d.y0 + d.y; });
    	});

    	var height = this.body.down('svg').dom.clientHeight - this.graphMargin.top - this.graphMargin.bottom;
    	var y = d3.scale.linear().domain([0, max]).range([height, 0]);
    	
    	var area = d3.svg.area()
	    	.x(function(d) { return x(d.x); })
			.y0(function(d) { return y(d.y0); })
			.y1(function(d) { return y(d.y0 + d.y); });
    	
    	var xAxis = d3.svg.axis().scale(x).orient('bottom');
    	if (this.getMode() === this.MODE_CORPUS) {
    		var tickvals = [];
    		for (var i = 0; i <= steps; i++) {
    			tickvals.push(i);
    		}
    		xAxis.tickValues(tickvals); // force number of ticks
    		xAxis.tickFormat(''); // hide tick numbers
    	}
    	
    	var yAxis = d3.svg.axis().scale(y).orient('left');
    	
    	// join
    	var paths = this.getVis().selectAll('path').data(processedLayers, function(d) { return d.name; });
    	
    	// update
    	paths.attr('d', function(d) { return area(d.values); }).style('fill', function(d, i) { return color(d.name); });
    	
    	// enter
    	paths.enter().append('path')
		.attr('d', function(d) { return area(d.values); })
		.style('fill', function(d, i) { return color(d.name); })
		.append('title').text(function (d) { return d.name; });
    	
    	// exit
    	paths.exit().remove();
    	
    	this.getVis().selectAll('g.axis').remove();
    	
    	this.getVis().append('g')
    		.attr('class', 'axis x')
    		.attr('transform', 'translate(0,'+height+')')
    		.call(xAxis);
    	
    	var xAxisText;
    	if (this.getMode() === this.MODE_CORPUS) {
    		var stepIncrement = width / steps;
    		var currStep = 0;
    		this.getCorpus().getDocuments().each(function(doc) {
    			this.getVis().select('g.x').append("text")
					.attr('text-anchor', 'end')
					.attr('transform', 'translate('+currStep+', 10) rotate(-45)')
					.text(doc.getTinyTitle());
    			
    			currStep += stepIncrement;
    		}, this);
    		
    		xAxisText = this.localize('documents');
    	} else {
    		xAxisText = this.localize('documentSegments');
    	}
    	this.getVis().select('g.x').append("text")
			.attr('text-anchor', 'middle')
			.attr('transform', 'translate('+width/2+', '+(this.graphMargin.bottom-20)+')')
			.text(xAxisText);
    	
    	this.getVis().append('g')
			.attr('class', 'axis y')
			.attr('transform', 'translate(0,0)')
			.call(yAxis);
    	
    	var yAxisText;
    	if (this.getApiParam('withDistributions') === 'raw') {
    		yAxisText = this.localize('rawFrequencies');
    	} else {
    		yAxisText = this.localize('relativeFrequencies');
    	}
    	this.getVis().select('g.y').append("text")
			.attr('text-anchor', 'middle')
			.attr('transform', 'translate(-'+(this.graphMargin.left-20)+', '+height/2+') rotate(-90)')
			.text(yAxisText);
    },
    
	getCurrentTerms: function() {
    	var terms = [];
    	this.down('[xtype=legend]').getStore().each(function(record) {
    		if (record.get('active')) {
    			terms.push(record.get('name'));
    		}
    	}, this);
    	return terms;
    },
	
    initGraph: function() {
    	if (this.getVisLayout() === undefined) {
	    	var el = this.getLayout().getRenderTarget();
	    	var paddingH = this.graphMargin.left + this.graphMargin.right;
	    	var paddingV = this.graphMargin.top + this.graphMargin.bottom;
	    	var width = el.getWidth()-paddingH;
			var height = el.getHeight()-paddingV;
	    	this.setVisLayout(
				d3.layout.stack()
					.offset('silhouette')
					.values(function(d) {
						return d.values;
					})
			);
			
			this.setVis(d3.select(el.dom).append('svg').attr('id','streamGraph')
					.attr('width', width+paddingH).attr('height', height+paddingV).append('g').attr('transform', 'translate('+this.graphMargin.left+','+this.graphMargin.top+')')
			);
    	}
    }
});

