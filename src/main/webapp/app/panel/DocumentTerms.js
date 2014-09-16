Ext.define('Voyant.panel.DocumentTerms', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.documentterms',
	config: {
		corpus: undefined
	},
    statics: {
    	i18n: {
    		title: {en: "Document Terms"},
    		matchingTerms: {en: 'Matching terms: {count}'},
    		termTip: {en: "The term in a single, specific document."},
    		rawFreqTip: {en: "The count (raw frequency) of this term in this document."},
    		relativeFreqTip: {en: "The relative frequency (per million) of this term in each document."},
    		trendTip: {en: 'This is a sparkline graph that represents the distribution of the term within linear segments of the document (by default 10 segments of equal size).'}
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
    		if (this.getStore().getCorpus()) {this.getStore().loadPage(1, {params: this.getApiParams()})}
    	}, this)
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
                }
            }),
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                items: [{
                    width: 170,
                    fieldLabel: 'Search',
                    labelWidth: 50,
                    xtype: 'searchfield',
                    store: store
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
                width: 125
            },{
            	text: this.localize("rawFreq"),
            	dataIndex: 'rawFreq',
            	tooltip: this.localize("rawFreqTip"),
            	width: 'autoSize',
            	sortable: true,
            },{
            	text: this.localize("relativeFreq"),
            	tooltip: this.localize("relativeFreqTip"),
            	dataIndex: 'relativeFreq',
            	width: 'autoSize',
            	sortable: true,
            	renderer: Ext.util.Format.numberRenderer('0,000')
            },{
                xtype: 'widgetcolumn',
                text: this.localize("trend"),
                tooltip: this.localize('trendTip'),
                width: 120,
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