Ext.define('Voyant.panel.DToC.Stats', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.dtocStats',
    statics: {
    	i18n: {
    		title: "Stats",
    		helpTip: "<p>Corpus Terms is a table view of terms that appear in the entire corpus. Features include:</p><ul><li>reordering by <i>term</i> and <i>count</i> (click on the column headers)</li><li>a sparkline graph of the term frequency trends across the corpus (if the corpus has multiple documents) or across the document (if the corpus has only one document)</li><li>additional columns available (relative frequency, distribution peakedness and skew) by clicking on the arrow that appears when hovering over a header</li><li>a search box for queries (hover over the magnifying icon for help with the syntax)</li></ul>",
    		matchingTerms: 'Matching terms: {count}',
    		termTip: "The term in the corpus.",
    		rawFreqTip: "The total count (raw frequency) of this term in the entire corpus.",
    		relativeFreqTip: "The relative frequency (per million) of this term in the entire corpus"/*, also expressed as a percentage*/+".",
    		relativePeakedness: "Peakedness",
    		relativePeakednessTip: "This is a statistical measure of how much the relative frequencies of a term in a corpus are bunched up into peaks (regions with higher values where the rest are lower).",
    		relativeSkewness: "Skew",
    		relativeSkewnessTip: "This is a statistical measure of the symmetry of the relative frequencies of a term across the corpus.",
    		trendTip: "This represents the trend of the relative frequencies for each term in each document in the corpus."
    	},
    	api: {
    		stopList: 'stop.en.taporware.txt',
    		query: undefined
    	}
    },
    config: {
    	options: {
    		xtype: 'stoplistoption'
    	}
    },
    
    corpusStore: null,
    docStore: null,
    
    currentDocId: null,
    
    languageStopListMappings: {
    	'en': 'stop.en.taporware.txt',
    	'fr': 'stop.fr.veronis.txt'
    },
    
    constructor: function(config) {
    	
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    listeners: {
    	loadedCorpus: function(src, corpus) {
    		this.docStore.setCorpus(corpus);
    		this.corpusStore.setCorpus(corpus);
    		this.docStore.getProxy().setExtraParam('corpus', corpus.getId());
    		this.corpusStore.getProxy().setExtraParam('corpus', corpus.getId());
    		this.docStore.getProxy().setExtraParam('stopList', 'auto');
    		this.corpusStore.getProxy().setExtraParam('stopList', 'auto');
    		this.updateChapterFilter(corpus);
    		this.fireEvent('apiChange', this, true);
    	},
    	apiChange: function(src, doLoad) {
    		var api = this.getApiParams(['stopList','query'], true);
        	var proxies = [this.docStore.getProxy(), this.corpusStore.getProxy()];
        	for (var i = 0; i < proxies.length; i++) {
        		var proxy = proxies[i];
	        	for (var key in api) {
	        		proxy.setExtraParam(key, api[key]);
	        	}
        	}
        	if (doLoad) {
        		this.getStore().loadPage(1);
        	}
    	},
    	query: function(src, query) {
    		this.setApiParam('query', query);
    		this.fireEvent('apiChange', this, true);
    	},
    	dtcDocumentLoaded: function(src, docId) {
//    		if (this.getStore() === this.docStore) {
//    			var lang = Ext.getCmp('dtcReader').getCurrentDocLanguage();
//    			var stoplist = this.languageStopListMappings[lang] || 'auto';
//    			this.getStore().getProxy().setExtraParam('stopList', stoplist);
//	    		this.getStore().getProxy().setExtraParam('docId', docId);
//	    		this.getStore().loadPage(1);
//    		}
    	}
    },
    
    initComponent: function() {
        var me = this;

        this.corpusStore = Ext.create('Voyant.data.store.CorpusTerms');
        this.corpusStore.getProxy().setExtraParam('withDistributions', true);
        
        this.docStore = Ext.create('Voyant.data.store.DocumentTerms');
        this.docStore.getProxy().setExtraParam('withDistributions', true);
        
        Ext.apply(me, {
    		title: this.localize('title'),
            store : this.corpusStore,
    		selModel: Ext.create('Ext.selection.RowModel', {
                pruneRemoved: false,
                listeners: {
                    selectionchange: function(sm, selections) {
                        this.getApplication().showMultiSelectMsg(this);
                        
                    	if (this.getStore() === this.corpusStore) {
                    		this.getApplication().dispatchEvent('corpusTermsClicked', this, selections);
                    	} else {
                    		this.getApplication().dispatchEvent('documentTermsClicked', this, selections);
                    	}
                	},
                	scope: this
                },
                mode: 'MULTI'
            }),
            
            tbar: {
		    	cls: 'dtc-toolbar',
		    	hideBorders: true,
		    	items: [{
		    		xtype: 'querysearchfield',
		    		width: 150,
		    		triggers: undefined,
		    		grow: false
		    	},'->', {
                    text: 'Filter by Chapter',
                    itemId: 'chapterFilter',
                    menu: {
                        items: [],
                        plain: true,
                        showSeparator: false,
                        listeners: {
                            click:  this.chapterFilterHandler,
                            scope: this
                        }
                    }
                }]
            },

    		columns: [{
    			text: this.localize("term"),
            	tooltip: this.localize("termTip"),
        		dataIndex: 'term',
        		flex: 1,
                sortable: true
            },{
            	text: this.localize("rawFreq"),
            	tooltip: this.localize("rawFreqTip"),
            	dataIndex: 'rawFreq',
                flex: 1,
            	sortable: true
            },{
            	text: this.localize("relativeFreq"),
            	tooltip: this.localize("relativeFreqTip"),
            	dataIndex: 'relativeFreq',
            	renderer: function(val) {
            		var percent = val*100;
            		return Ext.util.Format.number(val*1000000, "0,000");/* + " (%"+
            			(val*100 <  .1 ? "<0.1" : Ext.util.Format.number(val*100, "0.0"))+")"*/
            	},
                flex: 1,
                hidden: true,
            	sortable: true
            },{
            	text: this.localize("relativePeakedness"),
            	tooltip: this.localize("relativePeakednessTip"),
            	dataIndex: 'relativePeakedness',
            	renderer: Ext.util.Format.numberRenderer("0,000.0"),
                flex: 1,
                hidden: true,
            	sortable: true
            },{
            	text: this.localize("relativeSkewness"),
            	tooltip: this.localize("relativeSkewnessTip"),
            	dataIndex: 'relativeSkewness',
            	renderer: Ext.util.Format.numberRenderer("0,000.0"),
                flex: 1,
                hidden: true,
            	sortable: true
            },{
                xtype: 'widgetcolumn',
                text: this.localize("trend"),
                tooltip: this.localize("trendTip"),
                flex: 1,
                dataIndex: 'distributions',
            	sortable: false,
                widget: {
                    xtype: 'sparklineline'
                }
            }]
        });

        me.callParent(arguments);
        
    },
    
    clearSelections: function() {
    	this.getSelectionModel().deselectAll(true);
    	this.down('querysearchfield').setValue('');
    	this.setApiParam('query', '');
    	this.fireEvent('apiChange', this, true);
    },
    
    updateChapterFilter: function(corpus) {
	    var menu = this.getDockedItems('toolbar #chapterFilter')[0].menu;
	    menu.removeAll();
	    
	    var docs = corpus.getDocuments();
		for (var i = 0, len = corpus.getDocumentsCount(); i < len; i++) {
			var doc = docs.getAt(i);
			// check to see if this doc was specified as the index (via the cwrc interface)
			if (doc.get('extra.isDtocIndex') === 'true') {
				continue;
			}
    		menu.add({
	            xtype: 'menucheckitem',
	            docId: doc.getId(),
	            group: 'chapters',
	            text: doc.getShortTitle()
	        });
		}
	},
    
    chapterFilterHandler: function(menu, item) {
		if (this.currentDocId !== null && item.initialConfig.docId === this.currentDocId) {
			this.currentDocId = null;
			item.setChecked(false);
			this.reconfigure(this.corpusStore);
		} else {
			this.currentDocId = item.initialConfig.docId;
			this.reconfigure(this.docStore);
			this.docStore.getProxy().setExtraParam('docId', this.currentDocId);
		}
		this.getStore().loadPage(1);
	}
});
