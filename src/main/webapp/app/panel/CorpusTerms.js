/**
 * Corpus Terms tool, a grid that shows the terms in the corpus.
 * 
 * <iframe src="../?corpus=austen&view=corpusterms" style="max-width: 500px; height: 300px"></iframe>
 * 
 * The typical use is not to instantiate this class directly, but to embed the tool from a corpus.
 * 
 * 		var austen;
 * 		new Corpus("austen").then(function(corpus) {
 * 			austen = corpus;
 * 			austen.embed('CorpusTerms'); // simply embed
 * 			austen.embed('CorpusTerms', {query: '^lov*'}); // embed with query
 * 		});
 */
Ext.define('Voyant.panel.CorpusTerms', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.corpusterms',
    statics: {
    	i18n: {
    	},
    	api: {
    		
    		/**
    		 * @cfg {String} stopList A comma-separated list of words, a named list or a URL to a plain text list, one word per line.
    		 * 
    		 *  By default this is set to 'auto' which auto-detects the document's language and loads an appropriate list (if available for that language). Set this to blank to not use the default stopList.
    		 *  
    		 * For more information see the <a href="#!/guide/search">Stopwords documentation</a>.
    		 */
    		stopList: 'auto',
    		
    		/**
    		 * @cfg {String/String[]} query A query or array of queries (queries can be separated by a comma).
    		 * 
    		 * For query syntax, see the <a href="#!/guide/search">search documentation</a>.
    		 */
    		query: undefined,
    		
    		/**
    		 * @cfg {Number} maxBins The maximum number of bins to use for distributions in Trend.
    		 * 
    		 * By default this is set to 100 (in other words, if there are more than 100 documents in the corpus, they will be forced into 100 bins).
    		 * Higher values are possible but it can cause performance issues and necessitate more data transfer (values for each one of the bins for each one of the terms).
    		 * @cfg
    		 */
    		maxBins: 100,
    		
    		/**
    		 * @cfg {String} comparisonCorpus An existing corpus to be used for comparison purposes.
    		 * 
    		 * None of the columns visible by default use comparisonCorpus so this is an advanced parameter used when the "Comparison" column is shown.
    		 * The comparison column shows the relative frequency of the term in the corpus compared to the relative frequency of the same term in a comparison corpus.
    		 */
    		comparisonCorpus: undefined
    	},
		glyph: 'xf0ce@FontAwesome'
    },
    config: {
    	/**
    	 * @private
    	 */
    	options: [{
    		xtype: 'stoplistoption'
    	},{
    		xtype: 'corpusselector',
    		name: 'comparisonCorpus',
    		fieldLabel: 'comparison corpus'
    	}]
    },
	/**
	 * @private
	 */
    constructor: function(config) {
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
        var me = this;

        var store = Ext.create("Voyant.data.store.CorpusTermsBuffered", {
        	parentPanel: this,
        	proxy: {
        		extraParams: {
        			withDistributions: 'relative'
        		}
        	}
        });
        
        Ext.apply(me, {
    		title: this.localize('title'),
    		emptyText: this.localize("emptyText"),
            store : store,
    		selModel: Ext.create('Ext.selection.CheckboxModel', {
                pruneRemoved: false,
                listeners: {
                    selectionchange: {
                    	fn: function(sm, selections) {
                    		if (selections && selections.length>0) {
                        		this.getApplication().dispatchEvent('corpusTermsClicked', this, selections);
                    		}
                    	},
                    	scope: this
                    }
                },
                mode: 'SIMPLE'
            }),
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                items: [{
                    xtype: 'querysearchfield'
                }, {
                    xtype: 'totalpropertystatus'
                }]
            }],

    		columns: [{
                xtype: 'rownumberer',
                width: 'autoSize',
                sortable: false
            },{
    			text: this.localize("term"),
            	tooltip: this.localize("termTip"),
        		dataIndex: 'term',
        		flex: 1,
                sortable: true
            },{
            	text: this.localize("rawFreq"),
            	tooltip: this.localize("rawFreqTip"),
            	dataIndex: 'rawFreq',
                width: 'autoSize',
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
                width: 'autoSize',
                hidden: true,
            	sortable: true
            },{
            	text: this.localize("relativePeakedness"),
            	tooltip: this.localize("relativePeakednessTip"),
            	dataIndex: 'relativePeakedness',
            	renderer: Ext.util.Format.numberRenderer("0,000.0"),
                width: 'autoSize',
                hidden: true,
            	sortable: true
            },{
            	text: this.localize("relativeSkewness"),
            	tooltip: this.localize("relativeSkewnessTip"),
            	dataIndex: 'relativeSkewness',
            	renderer: Ext.util.Format.numberRenderer("0,000.0"),
                width: 'autoSize',
                hidden: true,
            	sortable: true
            },{
            	text: this.localize("corpusComparisonDifference"),
            	tooltip: this.localize("corpusComparisonDifferenceTip"),
            	dataIndex: 'relativeSkewness',
            	renderer: Ext.util.Format.numberRenderer("0,000.0"),
                width: 'autoSize',
                hidden: !this.getApiParam('comparisonCorpus'),
            	sortable: true,
            	listeners: {
            		show: function(ct, column, eopts) {
            			if (!me.getApiParam('comparisonCorpus')) {
            				me.showError(me.localize('noCorpusComparison'))
            			}
            		}
            	}
            },{
                xtype: 'widgetcolumn',
                text: this.localize("trend"),
                tooltip: this.localize("trendTip"),
                flex: 1,
                dataIndex: 'distributions',
                widget: {
                    xtype: 'sparklineline',
                    tipTpl: new Ext.XTemplate('{[this.getDocumentTitle(values.x,values.y)]}', {
                    	getDocumentTitle: function(docIndex, relativeFreq) {
                    		return this.panel.store.getCorpus().getDocument(docIndex).getTitle()+"<br>relative frequency: "+Ext.util.Format.number(relativeFreq*1000000, "0,000")
                    	},
                    	panel: me 
                    })
                }
            }]
        });
        
    	me.on('loadedCorpus', function(src, corpus) {
//    		this.setApiParam('query', undefined);
    		if (corpus.getDocumentsCount()>100) {
    			this.getStore().getProxy().setExtraParam('bins', this.getApiParam('maxBins'));
    		}
    		this.getStore().load()
    	}, me);
    	
    	me.on("query", function(src, query) {
    		this.setApiParam('query', query);
    		this.getStore().removeAll();
    		this.getStore().load();
    	}, me);


        me.callParent(arguments);
        
    }
})
