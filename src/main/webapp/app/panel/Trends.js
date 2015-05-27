 Ext.define('Voyant.panel.Trends', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	requires: ['Ext.chart.CartesianChart','Voyant.data.store.Documents'],

	alias: 'widget.trends',
	config: {
		corpus: undefined
	},
    statics: {
    	i18n: {
    		title: {en: "Trends"},
    		helpTip: {en: "<p><i>Trends</i> shows a line graph of the relative frequencies across the corpus (for multiple documents) or within a document. Features include</p><ul><li>a search box for queries (hover over the magnifying icon for help with the syntax)</li></ul>"},
    		rawFrequencies: {en: 'raw frequencies'},
    		relativeFrequencies: {en: 'relative frequencies'},
    		segments: {en: 'document segments'},
    		documents: {en: 'documents'}
    	},
    	api: {
    		limit: 5,
    		stopList: 'auto',
    		query: undefined,
    		freqsMode: 'relativeFreqs',
    		docIndex: undefined,
    		docId: undefined,
    		mode: undefined
    	},
		glyph: 'xf201@FontAwesome'
    },
    
    MODE_CORPUS: 'corpus',
    MODE_DOCUMENT: 'document',
    
    layout: 'fit',
    
    constructor: function(config) {

    	Ext.apply(this, {
    		title: this.localize('title'),
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                items: [{
                    xtype: 'querysearchfield'
                }, {
                    xtype: 'component',
                    itemId: 'status',
                    tpl: this.localize('matchingTerms'),
                    style: 'margin-right:5px'
                }]
            }]
        })
    	
    	this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);

    	if (config.embedded) {
    		var cls = Ext.getClass(config.embedded).getName();
    		if (cls=="Voyant.data.store.CorpusTerms") {
    	    	this.loadFromCorpusTerms(config.embedded);
    		}
    		if (cls=="Voyant.data.model.Corpus") {
    	    	this.loadFromCorpusTerms(config.embedded.getCorpusTerms());
    		}
    	}
    	
    	this.on("loadedCorpus", function(src, corpus) {
    		this.setCorpus(corpus);
    		if (this.isVisible()) {
        		this.loadFromCorpus(corpus);
    		}
    	});
    	
    	this.on("documentsClicked", function(src, documents) {
    		if (this.getCorpus()) {
    			if (documents.length==1) {
    				this.loadFromDocument(documents[0]);
    			}
    		}
    	})
    	
    	this.on("query", function(src, query) {
    		if (Ext.isString(query)) {this.fireEvent("termsClicked", src, [query])}
    	}, this)

    	this.on("termsClicked", function(src, terms) {
    		if (this.getCorpus()) { // make sure we have a corpus
        		var queryTerms = [];
        		terms.forEach(function(term) {
        			if (Ext.isString(term)) {queryTerms.push(term)}
        			else if (term.term) {queryTerms.push(term.term);}
        			else if (term.getTerm) {queryTerms.push(term.getTerm());}
        		});
        		if (queryTerms) {
        			this.setApiParams({
//        				docIndex: undefined,
//        				docId: undefined,
//        				mode: this.MODE_CORPUS,
        				query: queryTerms
        			});
            		if (this.isVisible()) {
                		this.loadFromCorpus(this.getCorpus());
            		}
        		}
    		}
    	})

    	this.on("documentTermsClicked", function(src, terms) {
    		if (this.getCorpus()) { // make sure we have a corpus
	    		this.setApiParam('mode', 'document');
    			if (terms[0] && terms[0].get('distributions') !== undefined) {
    				this.loadFromRecords(terms); // load anyway, even if not visible - no server request required
    			}
    			else {
    				this.fireEvent("termsClicked", src, terms)
    			}
    		}
    	})
    	this.on("corpusTermsClicked", function(src, terms) {
    		if (this.getCorpus()) { // make sure we have a corpus
    			if (terms[0] && terms[0].get('distributions') !== undefined) {
    				this.loadFromRecords(terms); // load anyway, even if not visible - no server request required
    			}
    			else {
    				this.fireEvent("termsClicked", src, terms)
    			}
    		}
    	})
    	
    	this.on("activate", function() { // tab activation
    		if (this.getCorpus()) {
				this.loadFromCorpus(this.getCorpus())
    		}
    	}, this)
    	
    	this.on("ensureCorpusView", function(src, corpus) {
    		if (this.getApiParam('mode')!=this.MODE_CORPUS && corpus.getDocumentsCount()>1) {
    			this.setApiParam('docId', undefined);
    			this.loadFromCorpus(corpus);
    		}
    	}, this);

    	
    },
    
    loadFromDocument: function(document) {

    	if (document.then) {
    		var me = this;
    		document.then(function(document) {me.loadFromDocument(document)})
    	}
    	else {
    		var ids = [];
    		if (Ext.getClassName(document)=="Voyant.data.model.Document") {
        		this.setApiParams({
        			docIndex: undefined,
        			query: undefined,
        			docId: document.getId(),
        			mode: this.MODE_DOCUMENT
        		})
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
    		    		this.setApiParam('mode', 'document');
    		    		this.loadFromRecords(records);
    		    	}
    		    	else {
    					Voyant.application.showResponseError(this.localize('failedGetDocumentTerms'), operation);
    		    	}
    		    },
    		    scope: this,
    		    params: Ext.apply(this.getApiParams(['limit','stopList','query','docId']), {
    		    	withDistributions: true
    		    })
        	});
    	}
    },
    
    loadFromCorpus: function(corpus) {
		this.setCorpus(corpus);
		if (this.getApiParam("docId")) {
			this.loadFromDocumentTerms();
		}
		else if (corpus.getDocumentsCount()==1) {
			this.loadFromDocument(corpus.getDocument(0));
		}
		else {
    		this.loadFromCorpusTerms(corpus.getCorpusTerms());
		}
	},

    loadFromCorpusTerms: function(corpusTerms) {
		corpusTerms.load({
		    callback: function(records, operation, success) {
		    	if (success) {
			    	this.setApiParam('mode', this.MODE_CORPUS);
			    	this.loadFromRecords(records);
		    	}
		    	else {
					Voyant.application.showResponseError(this.localize('failedGetCorpusTerms'), operation);
		    	}
		    },
		    scope: this,
		    params: Ext.apply(this.getApiParams(['limit','stopList','query']) || {}, {
		    	withDistributions: 'relative'
		    })
    	});
    },
    
    loadFromRecords: function(records) {
    	var mode = this.getApiParam('mode');
    	var terms = [];
    	var fields = ['index'];
    	var series = [];
    	records.forEach(function(record, index) {
    		var term = record.get('term');
    		record.get('distributions').forEach(function(r, i) {
    			if (!terms[i]) {
    				terms[i] = {"index": i}
    			}
    			terms[i]["_"+index] = r;
    		}, this);
    		fields.push("_"+index);
        	series.push({
    			type: 'line',
    			title: term,
    			xField: 'index',
    			yField: '_'+index,
                style: {
                    lineWidth: 2
                },
                marker: {
                    radius: 3
                },
                highlight: true,
                smooth: true,
                tooltip: {
                    trackMouse: true,
                    style: 'background: #fff',
                    renderer: function(storeItem, item) {
                    	var html = "<i>"+item.series.getTitle()+"</i>: "+storeItem.get(item.series.getYField());
                    	if (mode==this.panel.MODE_CORPUS) {
                    		var corpus = this.panel.getCorpus();
                    		if (corpus && corpus.getDocumentsCount() == storeItem.store.getCount()) {
                    			html += '<br/><i>'+this.panel.getCorpus().getDocument(item.index).getShortTitle()+"</i>";
                    		}
                    	}
                    	this.setHtml(html);
                    },
                    panel: this
                },
                listeners: {
                	itemclick: {
        	        	fn: this.handleClickedItem,
        	        	scope: this
                	}
                }
    		})
    	}, this);
    	
    	
    	var store = Ext.create('Ext.data.JsonStore', {
    		fields: fields,
    		data: terms
    	});
    	fields.shift();
    	
    	this.buildChart({
        	store: store,
        	series: series,
        	axes: [{
        		type: 'numeric',
        		position: 'left',
                minimum: 0,
        		title: {
        			text: this.localize(mode==this.MODE_DOCUMENT || this.getApiParam('freqsMode') =='rawFreqs' ? 'rawFrequencies' : 'relativeFrequencies')
        		}
        	}, {
        		type: 'category',
        		position: 'bottom',
        		fields: ['index'],
        		title: {
            		text: this.localize(mode==this.MODE_DOCUMENT ? 'segments' : 'documents')
        		},
        		renderer: function(label, data) {
        			return mode==this.MODE_DOCUMENT ? parseInt(label)+1 : label
        		}
        	}]
    	});

    },
    
    buildChart: function(config) {
    	config.axes.forEach(function(axis) {
    		Ext.applyIf(axis, {
        		style: {opacity: .2},
        		label: {opacity: .5}
    		})
    		Ext.applyIf(axis.title, {
    			fontSize: 12
    		})
    	})
    	Ext.applyIf(config, {
    	    plugins: {
    	        ptype: 'chartitemevents',
    	        moveEvents: true
    	    },
    		legend: {docked:'top'},
    		interactions: ['itemhighlight','panzoom'],
    		innerPadding: {top: 5, right: 5, bottom: 5, left: 5},
    		border: false,
    	    bodyBorder: false/*,
    	    listeners: {
    	    	// FIXME: this is a work-around because item clicking is broken in EXTJS 5.0.1 (so all hover events currently trigger event)
    	        itemhighlight: {
    	        	fn: function (item) {
    	        		if (!this.isLastClickedItem(item)) {
    	            		if (this.deferredHandleClickedItem) {
    	            			clearTimeout(this.deferredHandleClickedItem);
    	            		}
        	        		this.deferredHandleClickedItem = Ext.defer(this.handleClickedItem, 250, this, arguments);
    	            		
    	            	}
    	        	},
    	        	scope: this
    	        }
    	    }*/
    	});
    	
    	// remove existing chart
    	this.query('chart').forEach(function(chart) {this.remove(chart)}, this);

		var chart = Ext.create("Ext.chart.CartesianChart", config);
    	this.add(chart);
    },
    
    clearChart: function() {
    	// we need a way of updating data instead of this brute-force approach
    	this.query('chart').forEach(function(chart) {this.remove(chart)}, this);
    },
    
    handleClickedItem: function(chart, item) {
        	var mode = this.getApiParam("mode");
        	if (mode===this.MODE_DOCUMENT) {
        		var docId = this.getApiParam("docId");
        		if (docId) {
            		this.dispatchEvent("documentIndexTermsClicked", this, [{
            			term: item.series.getTitle(),
            			docId: docId
            		}]);
        		}
        	}
        	else if (mode==this.MODE_CORPUS) {
        		this.dispatchEvent("documentIndexTermsClicked", this, [{
        			term: item.series.getTitle(),
        			docIndex: item.index
        		}]);
        	}
    },
    
    isLastClickedItem: function(item) {
    	return this.lastClickedItem && this.lastClickedItem.term==item.term && this.lastClickedItem.index==item.index
    }
})