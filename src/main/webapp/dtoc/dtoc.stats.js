Ext.define('Voyant.panel.DToC.Stats', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.dtocStats',
    statics: {
    	i18n: {
    		title: {en: "Stats"},
    		helpTip: {en: "<p>Corpus Terms is a table view of terms that appear in the entire corpus. Features include:</p><ul><li>reordering by <i>term</i> and <i>count</i> (click on the column headers)</li><li>a sparkline graph of the term frequency trends across the corpus (if the corpus has multiple documents) or across the document (if the corpus has only one document)</li><li>additional columns available (relative frequency, distribution peakedness and skew) by clicking on the arrow that appears when hovering over a header</li><li>a search box for queries (hover over the magnifying icon for help with the syntax)</li></ul>"},
    		matchingTerms: {en: 'Matching terms: {count}'},
    		termTip: {en: "The term in the corpus."},
    		rawFreqTip: {en: "The total count (raw frequency) of this term in the entire corpus."},
    		relativeFreqTip: {en: "The relative frequency (per million) of this term in the entire corpus"/*, also expressed as a percentage*/+"."},
    		relativePeakedness: {en: "Peakedness"},
    		relativePeakednessTip: {en: "This is a statistical measure of how much the relative frequencies of a term in a corpus are bunched up into peaks (regions with higher values where the rest are lower)."},
    		relativeSkewness: {en: "Skew"},
    		relativeSkewnessTip: {en: "This is a statistical measure of the symmetry of the relative frequencies of a term across the corpus."},
    		trendTip: {en: "This represents the trend of the relative frequencies for each term in each document in the corpus."}
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
    		this.fireEvent("apiChange", this);
    	},
    	apiChange: function() {
    		var api = this.getApiParams(['stopList','query']);
        	var proxy = this.getStore().getProxy();
        	for (var key in api) {
        		proxy.setExtraParam(key, api[key]);
        	}
        	this.getStore().loadPage(1);
    	},
    	query: function(src, query) {
    		this.setApiParam('query', query);
    		this.fireEvent("apiChange", this);
    		this.getStore().loadPage(1);
    	},
    	dtcDocumentLoaded: function(src, docId) {
    		if (this.getStore() === this.docStore) {
    			var lang = Ext.getCmp('dtcReader').getCurrentDocLanguage();
    			var stoplist = this.languageStopListMappings[lang] || 'auto';
    			this.getStore().getProxy().setExtraParam('stopList', stoplist);
	    		this.getStore().getProxy().setExtraParam('docId', docId);
	    		this.getStore().loadPage(1);
    		}
    	}
    },
    
    initComponent: function() {
        var me = this;

        this.corpusStore = Ext.create("Voyant.data.store.CorpusTerms");
        this.corpusStore.getProxy().setExtraParam("withDistributions", true);
//        store.on("totalcountchange", function() {
//        	this.down('#status').update({count: this.getStore().getTotalCount()});;
//        }, me);
        
        this.docStore = Ext.create('Voyant.data.store.DocumentTerms');
        this.docStore.getProxy().setExtraParam("withDistributions", true);
        
        Ext.apply(me, {
    		title: this.localize('title'),
            store : this.docStore,
    		selModel: Ext.create('Ext.selection.RowModel', {
                pruneRemoved: false,
                listeners: {
                    selectionchange: {
                    	fn: function(sm, selections) {
                    		this.getApplication().dispatchEvent('corpusTermsClicked', this, selections);
                    	},
                    	scope: this
                    }
                },
                mode: 'MULTI'
            }),
            
            tbar: new Ext.Toolbar({
		    	cls: 'dtc-toolbar',
		    	hideBorders: true,
		    	items: [{
		    		xtype: 'querysearchfield'
		    	}, { xtype: 'tbfill' }, {
		    		text: 'Chapter Stats',
			        itemId: 'statsPicker',
			        menu: {
			        	items: [{text: 'Chapter Stats', type: 'Document'},{text: 'Collection Stats', type: 'Corpus'}],
	                    plain: true,
	                    showSeparator: false,
	                    listeners: {
	                    	click: function(menu, item) {
	                    		var type = item.initialConfig.type;
								if (type === 'Document') {
									this.reconfigure(this.docStore);
									this.queryById('statsPicker').setText('Chapter Stats');
									var docId = Ext.getCmp('dtcReader').getCurrentDocId();
									this.docStore.getProxy().setExtraParam('docId', docId);
								} else {
									this.reconfigure(this.corpusStore);
									this.queryById('statsPicker').setText('Collection Stats');
								}
								this.getStore().loadPage(1);
	                    	},
	                    	scope: this
	                    }
	                }
		    	}]
            }),
            
//            dockedItems: [{
//                dock: 'bottom',
//                xtype: 'toolbar',
//                items: [{
//                    xtype: 'querysearchfield'
//                },{
//                    xtype: 'component',
//                    itemId: 'status',
//                    tpl: this.localize('matchingTerms'),
//                    style: 'margin-right:5px'
//                }]
//            }],

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
            		return Ext.util.Format.number(val*1000000, "0,000")/* + " (%"+
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
                widget: {
                    xtype: 'sparklineline'
                }
            }]
        });

        me.callParent(arguments);
        
    }
});
