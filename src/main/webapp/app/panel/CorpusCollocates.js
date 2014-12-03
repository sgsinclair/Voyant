Ext.define('Voyant.panel.CorpusCollocates', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.corpuscollocates',
	config: {
		corpus: undefined
	},
    statics: {
    	i18n: {
    		title: {en: "Collocates"},
    		term: {en: "Term"},
    		termTip: {en: "This is the keyword term around which collocate (context) terms are counted."},
    		termRawFreq: {en: "Count (keyword)"},
    		termRawFreqTip: {en: "The number of times the keyword term occurs in the corpus."},
    		contextTerm: {en: "Collocate"},
    		contextTermTip: {en: "This is the collocate (context) term that occurs near the keyword term."},
    		contextTermRawFreq: {en: "Count (context)"},
    		contextTermRawFreqTip: {en: "The number of times this collocate occurs near the keyword term in the corpus."},
    		matchingTerms: {en: 'Matching terms: {count}'}
    		
    		/*,
    		matchingTerms: {en: 'Matching terms: {count}'},
    		termTip: {en: "The term in a single, specific document."},
    		rawFreqTip: {en: "The count (raw frequency) of this term in this document."},
    		relativeFreqTip: {en: "The relative frequency (per million) of this term in each document."},
    		trendTip: {en: 'This is a sparkline graph that represents the distribution of the term within linear segments of the document (by default 10 segments of equal size).'},
    		tfidf: {en: 'Significance'},
    		tfidfTip: {en: 'The significance is measured here using an TF-IDF score, a common way of expressing how important a term is in a document relative to the rest of the corpus.'}
			*/
    	},
    	api: {
    		stopList: 'auto',
    		query: undefined,
    		docId: undefined,
    		docIndex: undefined
    	}
    },
    constructor: function(config) {
    	
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		var store = this.getStore();
    		store.setCorpus(corpus);
    		if (this.isVisible()) {
    			this.loadFromApis();
    		}
    		
    	});
    	
    	if (config.embedded) {
//    		var cls = Ext.getClass(config.embedded).getName();
//    		if (cls=="Voyant.data.store.DocumentTerms" || cls=="Voyant.data.model.Document") {
//    			this.fireEvent('loadedCorpus', this, config.embedded.getCorpus())
//    		}
    	}
    	else if (config.corpus) {
    		this.fireEvent('loadedCorpus', this, config.corpus)
    	}
    	
    	this.on("corpusTermsClicked", function(src, terms) {
    		if (this.getStore().getCorpus()) { // make sure we have a corpus
        		var query = [];
        		terms.forEach(function(term) {
        			query.push(term.get("term"));
        		})
        		this.setApiParams({
        			query: query,
        			docId: undefined,
        			docIndex: undefined
        		});
        		if (this.isVisible()) {
            		this.getStore().loadPage(1, {params: this.getApiParams()});
        		}
    		}
    	});
    	
    	this.on("documentsClicked", function(src, documents) {
    		var docIds = [];
    		documents.forEach(function(doc) {docIds.push(doc.get('id'))});
    		this.setApiParams({
    			docId: docIds,
    			docid: undefined,
    			query: undefined
    		})
    		if (this.isVisible()) {
        		this.getStore().loadPage(1, {params: this.getApiParams()});
    		}
    	});
    	
    	this.on("activate", function() { // load after tab activate (if we're in a tab panel)
    		if (this.getStore().getCorpus()) {this.loadFromApis()}
    	}, this)
    	
    	this.on("query", function(src, query) {
    		this.setApiParam("query", query);
    		this.getStore().getProxy().setExtraParam("query", query);
    		this.loadFromApis();
    	}, this)
    },
    
    loadFromApis: function() {
    	if (this.getStore().getCorpus()) {
    		if (this.getApiParam('query')) {
    			this.getStore().loadPage(1, {params: this.getApiParams()});
    		}
    		else {
				var corpusTerms = this.getStore().getCorpus().getCorpusTerms({
					leadingBufferZone: 0,
					autoLoad: false
				});
        		corpusTerms.load({
        		    callback: function(records, operation, success) {
        		    	if (success) {
        		    		var terms = [];
        		    		records.forEach(function(term) {
        		    			terms.push(term.getTerm());
        		    		})
        		    		this.getStore().getProxy().setExtraParam("query", terms);
        		    		this.setApiParam('query', terms);
        		    		this.loadFromApis();
        		    	}
        		    },
        		    scope: this,
        		    params: {
        				limit: 10,
        				stopList: this.getApiParam("stopList")
        			}
            	});

    		}
    	}
    },
    
    initComponent: function() {
        var me = this;

        var store = Ext.create("Voyant.data.store.CorpusCollocates");
        store.on("totalcountchange", function() {
        	this.down('#status').update({count: this.getStore().getTotalCount()});;
        }, me);
        
        Ext.apply(me, {
    		title: this.localize('title'),
            store : store,
    		selModel: Ext.create('Ext.selection.CheckboxModel', {
                listeners: {
                    selectionchange: {
                    	fn: function(sm, selections) {
                    		this.getApplication().dispatchEvent('documentTermsClicked', this, selections);
                    	},
                    	scope: this
                    }
                }
            }),
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
            }],
    		columns: [{
    			text: this.localize("term"),
        		dataIndex: 'term',
            	tooltip: this.localize("termTip"),
                sortable: true,
                width: 'autoSize'
            },{
    			text: this.localize("rawFreq"),
        		dataIndex: 'rawFreq',
            	tooltip: this.localize("termRawFreqTip"),
                sortable: true,
                width: 'autoSize',
                hidden: true
            },{
            	text: this.localize("contextTerm"),
            	dataIndex: 'contextTerm',
            	tooltip: this.localize("contextTermTip"),
            	width: 'autoSize',
            	sortable: true
            },{
            	text: this.localize("contextTermRawFreq"),
            	tooltip: this.localize("contextTermRawFreqTip"),
            	dataIndex: 'contextTermRawFreq',
            	width: 'autoSize',
            	sortable: true
            }/*,{
                xtype: 'widgetcolumn',
                text: this.localize("trend"),
                tooltip: this.localize('trendTip'),
                width: 120,
                dataIndex: 'distributions',
                widget: {
                    xtype: 'sparklineline'
                }
            }*/],
            
            listeners: {
            	termsClicked: {
            		fn: function(src, terms) {
                		if (this.getStore().getCorpus()) { // make sure we have a corpus
                    		var queryTerms = [];
                    		terms.forEach(function(term) {
                    			if (term.term) {queryTerms.push(term.term);}
                    		});
                    		if (queryTerms) {
                    			this.setApiParams({
                    				docIndex: undefined,
                    				docId: undefined,
                    				query: queryTerms
                    			});
                        		if (this.isVisible()) {
                            		if (this.isVisible()) {
                                		this.getStore().loadPage(1, {params: this.getApiParams()});
                            		}
                        		}
                    		}
                		}
                	},
                	scope: this
            	}
            }
        });

        me.callParent(arguments);
        
        me.getStore().getProxy().setExtraParam("withDistributions", true);
        
    }
    
})