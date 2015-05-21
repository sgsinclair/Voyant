Ext.define('Voyant.panel.DocumentTerms', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	requires: ['Voyant.data.store.DocumentTerms'],
	alias: 'widget.documentterms',
	config: {
		corpus: undefined
	},
    statics: {
    	i18n: {
    		title: {en: "Document Terms"},
    		helpTip: {en: "<p>Document Terms is a table view of terms that appear in each document. Features include:</p><ul><li>reordering by <i>Term</i>, <i>Count</i> (raw frequency), and <i>Relative</i> frequency (click on the column headers)</li><li>a sparkline graph of the distribution of term frequencies across the documents</li><li>additional columns available (<i>Significance</i> or TF-IDF) by clicking on the arrow that appears when hovering over a header</li><li>a search box for queries (hover over the magnifying icon for help with the syntax)</li></ul>"},
    		matchingTerms: {en: 'Matching terms: {count}'},
    		termTip: {en: "The term in a single, specific document."},
    		rawFreqTip: {en: "The count (raw frequency) of this term in this document."},
    		relativeFreqTip: {en: "The relative frequency (per million) of this term in each document."},
    		trendTip: {en: 'This is a sparkline graph that represents the distribution of the term within linear segments of the document (by default 10 segments of equal size).'},
    		tfidf: {en: 'Significance'},
    		tfidfTip: {en: 'The significance is measured here using an TF-IDF score, a common way of expressing how important a term is in a document relative to the rest of the corpus.'}
    	},
    	api: {
    		stopList: 'auto',
    		query: undefined,
    		docId: undefined,
    		docIndex: undefined
    	},
		glyph: 'xf0ce@FontAwesome'
    },
    constructor: function(config) {
    	
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		var store = this.getStore();
    		store.setCorpus(corpus);
    	});
    	
    	if (config.embedded) {
    		console.warn(config.embedded.then)
    		var cls = Ext.getClass(config.embedded).getName();
    		if (cls=="Voyant.data.store.DocumentTerms" || cls=="Voyant.data.model.Document") {
    			this.fireEvent('loadedCorpus', this, config.embedded.getCorpus())
    		}
    	}
    	else if (config.corpus) {
    		this.fireEvent('loadedCorpus', this, config.corpus)
    	}
    	
    	this.on("query", function(src, query) {
    		this.fireEvent("corpusTermsClicked", src, [query])
    	}, this);
    	
    	this.on("corpusTermsClicked", function(src, terms) {
    		if (this.getStore().getCorpus()) { // make sure we have a corpus
        		var query = [];
        		terms.forEach(function(term) {
        			query.push(Ext.isString(term) ? term : term.get("term"));
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
    		documents.forEach(function(doc) {docIds.push(doc.get('id'));});
    		this.setApiParams({
    			docId: docIds,
    			query: undefined
    		});
    		if (this.isVisible()) {
        		this.getStore().loadPage(1, {params: this.getApiParams()});
    		}
    	});
    	
    	this.on("activate", function() { // load after tab activate (if we're in a tab panel)
    		if (this.getStore().getCorpus()) {this.getStore().loadPage(1, {params: this.getApiParams()})}
    	}, this);
    },
    
    initComponent: function() {
        var me = this;

        var store = Ext.create("Voyant.data.store.DocumentTerms");
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
                },
                pruneRemoved: false,
    			mode: 'SIMPLE'
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
    			text: '#',
    			width: 30,
        		dataIndex: 'docIndex',
                sortable: true,
                renderer: function(v) {return v+1;} // 0-based to 1-based
            },{
    			text: this.localize("term"),
        		dataIndex: 'term',
            	tooltip: this.localize("termTip"),
                sortable: true,
                flex: 1
            },{
            	text: this.localize("rawFreq"),
            	dataIndex: 'rawFreq',
            	tooltip: this.localize("rawFreqTip"),
            	width: 'autoSize',
            	sortable: true
            },{
            	text: this.localize("relativeFreq"),
            	tooltip: this.localize("relativeFreqTip"),
            	dataIndex: 'relativeFreq',
            	width: 'autoSize',
            	sortable: true,
            	renderer: Ext.util.Format.numberRenderer('0,000')
            },{
            	text: this.localize("tfidf"),
            	tooltip: this.localize("tfidfTip"),
            	dataIndex: 'tfidf',
            	width: 'autoSize',
            	sortable: true,
            	hidden: true,
            	renderer: Ext.util.Format.numberRenderer('0,000.000')
            },{
                xtype: 'widgetcolumn',
                text: this.localize("trend"),
                tooltip: this.localize('trendTip'),
                flex: 1,
                dataIndex: 'distributions',
                widget: {
                    xtype: 'sparklineline'
                }
            }],
            
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
