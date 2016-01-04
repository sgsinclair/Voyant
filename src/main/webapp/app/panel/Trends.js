 Ext.define('Voyant.panel.Trends', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	requires: ['Ext.chart.CartesianChart','Voyant.data.store.Documents'],

	alias: 'widget.trends',
	config: {
    	options: {xtype: 'stoplistoption'},
		corpus: undefined
	},
    statics: {
    	i18n: {
    		title: {en: "Trends"},
    		helpTip: {en: "<p><i>Trends</i> shows a line graph of the relative frequencies across the corpus (for multiple documents) or within a document. Features include</p><ul><li>a search box for queries (hover over the magnifying icon for help with the syntax)</li></ul>"},
    		freqsMode: {en: "Frequencies"},
    		freqsModeTip: {en: "Determines if frequencies are expressed as raw counts or as relative counts (per document or segment)."},
    		options: {en: "Options"},
    		rawFrequencies: {en: 'Raw Frequencies'},
    		relativeFrequencies: {en: 'Relative Frequencies'},
    		
    		raw: {en: 'Raw'},
    		relative: {en: 'Relative'},
    		segmentsSlider: {en: 'Segments'},
    		segments: {en: 'Document Segments'},
    		documents: {en: 'Documents'}
    	},
    	api: {
    		limit: 5,
    		stopList: 'auto',
    		query: undefined,
    		withDistributions: 'relative',
    		bins: 10,
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
    		if (corpus.getDocumentsCount()==1 && this.getApiParam("mode")!=this.MODE_DOCUMENT) {
    			this.setMode(this.MODE_DOCUMENT);
    			this.setApiParams({withDistributions: 'raw'});
    			this.down('#raw').setChecked(true);
    		}
    		if (this.isVisible()) {
        		this.loadFromCorpus(corpus);
    		}
    	});
    	
    	this.on("corpusSelected", function(src, corpus) {
    		if (src.isXType("corpusdocumentselector")) {
    			this.setMode(this.MODE_CORPUS);
    			this.setApiParams({docId: undefined, docIndex: undefined})
        		this.loadFromCorpus(corpus);
    		}
    	});
    	
    	this.on("documentSelected", function(src, document) {
    		if (this.getCorpus()) {
    			this.loadFromDocument(this.getCorpus().getDocument(document))
    		}
    	});
    	
    	this.on("query", function(src, query) {
    		if (Ext.isString(query)) {this.fireEvent("termsClicked", src, [query]);}
    	}, this);

    	this.on("termsClicked", function(src, terms) {
    		if (this.getCorpus()) { // make sure we have a corpus
        		var queryTerms = [];
        		terms.forEach(function(term) {
        			if (Ext.isString(term)) {queryTerms.push(term);}
        			else if (term.term) {queryTerms.push(term.term);}
        			else if (term.getTerm) {queryTerms.push(term.getTerm());}
        		});
        		if (queryTerms) {
        			
            		if (this.getApiParam('mode')!=this.MODE_CORPUS && this.getCorpus().getDocumentsCount()>1) {
            			this.setMode(this.MODE_CORPUS);
            			this.setApiParams({
            				'docIndex': undefined,
            				'docId': undefined
            			});
            		}
        			this.setApiParams({
        				query: queryTerms
        			});
            		if (this.isVisible()) {
                		this.loadFromCorpus(this.getCorpus());
            		}
        		}
    		}
    	});

    	this.on("documentTermsClicked", function(src, terms) {
    		if (this.getCorpus()) { // make sure we have a corpus
    			this.setMode(this.MODE_DOCUMENT);
    			if (terms[0] && terms[0].get('distributions') !== undefined) {
    				this.loadFromRecords(terms); // load anyway, even if not visible - no server request required
    			}
    			else {
    				this.fireEvent("termsClicked", src, terms);
    			}
    		}
    	});
    	this.on("corpusTermsClicked", function(src, terms) {
    		if (this.getCorpus()) { // make sure we have a corpus
    			if (terms[0] && terms[0].get('distributions') !== undefined && this.getCorpus().getDocumentsCount()>1) {
    				this.loadFromRecords(terms); // load anyway, even if not visible - no server request required
    			}
    			else {
    				this.fireEvent("termsClicked", src, terms);
    			}
    		}
    	});
    	
    	this.on("activate", function() { // tab activation
    		if (this.getCorpus()) {
				this.loadFromCorpus(this.getCorpus());
    		}
    	}, this);
    	
    	this.on("ensureCorpusView", function(src, corpus) {
    		if (this.getApiParam('mode')!=this.MODE_CORPUS && corpus.getDocumentsCount()>1) {
    			this.setApiParam('docId', undefined);
    			this.loadFromCorpus(corpus);
    		}
    	}, this);

    	
    },
    
    initComponent: function() {
        var me = this;
    	Ext.apply(this, {
    		title: this.localize('title'),
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
        		enableOverflow: true,
                items: [{
                    	xtype: 'querysearchfield'
                	},{
						xtype: 'corpusdocumentselector',
						singleSelect: true
					},{
					    text: this.localize('freqsMode'),
    					glyph: 'xf201@FontAwesome',
					    tooltip: this.localize('freqsModeTip'),
					    menu: {
					    	items: [
					           {
					               text: this.localize("relativeFrequencies"),
					               checked: true,
					               itemId: 'relative',
					               group: 'freqsMode',
					               checkHandler: function(item, checked) {
					            	   if (checked) {
					                	   this.setApiParam('withDistributions', 'relative');
					                	   this.reloadFromChart();
					            	   }
					               },
					               scope: this
					           }, {
					               text: this.localize("rawFrequencies"),
					               checked: false,
					               itemId: 'raw',
					               group: 'freqsMode',
					               checkHandler: function(item, checked) {
					            	   if (checked) {
					                	   this.setApiParam('withDistributions', 'raw');
					                	   this.reloadFromChart();
					            	   }
					               },
					               scope: this
					           }
					       ]
					    }
					},{
    			    	itemId: 'segmentsSlider',
    			    	xtype: 'slider',
    			    	fieldLabel: this.localize('segmentsSlider'),
    			    	fieldAlign: 'right',
    			    	labelWidth: 70,
    			    	width: 150,
    			    	minValue: 2,
    			    	maxValue: 100,
    	            	listeners: {
    	            		afterrender: function(slider) {
    	            			slider.setValue(parseInt(this.getApiParam("bins")))
    	            		},
    	            		changecomplete: function(slider, newvalue) {
    	            			this.setApiParams({bins: newvalue});
    	            			this.reloadFromChart();
    	            		},
    	            		scope: this
    	            	}
		    		}]
            }]
        });
        me.callParent(arguments);
    	 
    },
    
    loadFromDocument: function(document) {

    	if (document.then) {
    		var me = this;
    		document.then(function(document) {me.loadFromDocument(document);});
    	}
    	else {
    		var params = {
    			docIndex: undefined,
    			query: undefined,
    			docId: undefined
    		}
    		if (Ext.isNumber(document)) {params.docIndex=document}
    		else if (Ext.isString(document)) {params.docId=document}
    		else if (Ext.getClassName(document)=="Voyant.data.model.Document") {params.docId=document.getId()}
			this.setMode(this.MODE_DOCUMENT);
    		this.setApiParams(params);
    		if (this.isVisible()) {
            	this.loadFromDocumentTerms();
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
    		    params: this.getApiParams(['limit','stopList','query','docId','withDistributions','bins'])
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
		    callback: function(records, operation, success) { // not called in EXT JS 6.0.0
		    	if (success) {
	    			this.setMode(this.MODE_CORPUS);
			    	this.loadFromRecords(records);
		    	}
		    	else {
					Voyant.application.showResponseError(this.localize('failedGetCorpusTerms'), operation);
		    	}
		    },
		    scope: this,
		    params: this.getApiParams(['limit','stopList','query','withDistributions',"bins"])
    	});
    },
    
    loadFromRecords: function(records) {
    	var mode = this.getApiParam('mode');
    	var terms = [];
    	var fields = ['index'];
    	var series = [];
    	var max = 0;
    	records.forEach(function(record, index) {
    		var term = record.get('term');
    		record.get('distributions').forEach(function(r, i) {
    			if (!terms[i]) {
    				terms[i] = {"index": i};
    			}
    			terms[i]["_"+index] = r;
    			if (r>max) {max=r;}
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
    		});
    	}, this);
    	
    	var store = Ext.create('Ext.data.JsonStore', {
    		fields: fields,
    		data: terms
    	});
    	fields.shift();
    	
    	var me = this;
    	this.buildChart({
        	store: store,
        	series: series,
        	axes: [{
        		type: 'numeric',
        		position: 'left',
        		majorTickSteps: this.getApiParam('withDistributions') =='raw' && max < 20 ? max : undefined,
//                minimum: 0,
                increment: 1,
        		title: {
        			text: this.localize(this.getApiParam('withDistributions') =='raw' ? 'rawFrequencies' : 'relativeFrequencies')
        		}
        	}, {
        		type: 'category',
        		position: 'bottom',
        		fields: ['index'],
        		title: {
            		text: this.localize(mode==this.MODE_DOCUMENT ? 'segments' : 'documents')
        		},
                label   : {
                    rotate:{degrees:-30},
                    textAlign: 'end'

               },
        		renderer: function(label, data) {
        			return mode==me.MODE_DOCUMENT ? parseInt(label)+1 : me.getCorpus().getDocument(label).getTinyTitle();
        		}
        	}]
    	});

    },
    
    reloadFromChart: function() {
    	var chart = this.down('chart');
    	if (chart) {
    		var terms = [];
    		chart.series.forEach(function(serie) {
    			terms.push(serie.getTitle());
    		});
    		this.fireEvent("termsClicked", this, terms);
    	}
    },
    
    buildChart: function(config) {
    	config.axes.forEach(function(axis) {
    		Ext.applyIf(axis, {
        		style: {opacity: .2},
        		label: {opacity: .5}
    		});
    		Ext.applyIf(axis.title, {
    			fontSize: 12
    		});
    	});
    	Ext.applyIf(config, {
    	    plugins: {
    	        ptype: 'chartitemevents',
    	        moveEvents: true
    	    },
    		legend: {docked:'top'},
    		interactions: ['itemhighlight','panzoom'],
    		innerPadding: {top: 5, right: 5, bottom: 5, left: 5},
    		border: false,
    	    bodyBorder: false
    	});
    	
    	// remove existing chart
    	this.query('chart').forEach(function(chart) {this.remove(chart);}, this);

		var chart = Ext.create("Ext.chart.CartesianChart", config);
    	this.add(chart);
    },
    
    clearChart: function() {
    	// we need a way of updating data instead of this brute-force approach
    	this.query('chart').forEach(function(chart) {this.remove(chart);}, this);
    },
    
    handleClickedItem: function(chart, item) {
        	var mode = this.getApiParam("mode");
        	if (mode===this.MODE_DOCUMENT) {
        		var docId = this.getApiParam("docId");
        		if (docId) {
        			var doc = this.getCorpus().getDocument(docId);
        			var tokens = doc.get('tokensCount-lexical');
        			var bins = this.getApiParam('bins');
        			var position = item.index / bins * tokens;
            		this.dispatchEvent("documentIndexTermsClicked", this, [{
            			term: item.series.getTitle(),
            			docId: docId,
            			position: position
            		}]);
        		}
        	}
        	else if (mode==this.MODE_CORPUS) {
        		var doc = this.getCorpus().getDocument(item.index);
        		this.dispatchEvent("documentIndexTermsClicked", this, [{
        			term: item.series.getTitle(),
        			docIndex: item.index,
        			docId: doc.getId()
        		}]);
        	}
    },
    
    isLastClickedItem: function(item) {
    	return this.lastClickedItem && this.lastClickedItem.term==item.term && this.lastClickedItem.index==item.index;
    },
    
    setMode: function(mode) {
    	this.setApiParams({mode: mode});
    	var mode = this.getApiParam("mode");    	
    	var menu = this.queryById("segmentsSlider");
    	menu.setHidden(mode==this.MODE_CORPUS)
    }
    
});