Ext.define('Voyant.panel.CorpusTerms', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	requires: ['Ext.ux.form.SearchField'],
	alias: 'widget.corpusterms',
    statics: {
    	i18n: {
    		title: {en: "Corpus Terms"},
    		matchingTerms: {en: 'Matching terms: {count}'},
    		rawFreqTip: {en: "The total count (raw frequency) of this term in the entire corpus."}
    	},
    	api: {
    		stopList: 'auto',
    		query: undefined
    	}
    },
    constructor: function(config) {
    	
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
    	var api = Ext.apply(this.getApiParams(['stopList','query']), {
    		withDistributions: 'relative'
    	});
    	var proxy = this.getStore().getProxy();
    	for (var key in api) {proxy.setExtraParam(key, api[key]);}
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		var store = this.getStore();
    		store.setCorpus(corpus);
    		store.getProxy().setExtraParam('corpus', corpus.getId())
    		store.load();
    	})
    	
    	if (config.embedded) {
    		var cls = Ext.getClass(config.embedded).getName();
    		if (cls=="Voyant.data.store.CorpusTerms") {
    			this.fireEvent('loadedCorpus', this, config.embedded.getCorpus())
    		}
    		if (cls=="Voyant.data.model.Corpus") {
        		this.fireEvent('loadedCorpus', this, config.embedded)
    		}
    	}
    	else if (config.corpus) {
    		this.fireEvent('loadedCorpus', this, config.corpus)
    	}

    },
    
    initComponent: function() {
        var me = this;

        var store = Ext.create("Voyant.data.store.CorpusTerms");
        store.on("totalcountchange", function() {
        	this.down('#status').update({count: this.getStore().getTotalCount()});;
        }, me);
        
        Ext.apply(me, {
    		title: this.localize('title'),
            store : store,
    		selModel: Ext.create('Ext.selection.CheckboxModel', {
                pruneRemoved: false,
                listeners: {
                    selectionchange: {
                    	fn: function(sm, selections) {
                    		this.getApplication().dispatchEvent('corpusTermsClicked', this, selections);
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
                xtype: 'rownumberer',
                width: 'autoSize',
                sortable: false
            },{
    			text: this.localize("term"),
        		dataIndex: 'term',
                width: 125,
                sortable: true
            },{
            	text: this.localize("rawFreq"),
            	dataIndex: 'rawFreq',
                width: 'autoSize',
            	sortable: true,
            },{
                xtype: 'widgetcolumn',
                text: this.localize("trend"),
                width: 150,
                dataIndex: 'distributions',
                widget: {
                    xtype: 'sparklineline'
                }
            }]
        });

        me.callParent(arguments);
        
    },
    
    load: function() {
    	if (this.rendered) {
    		this.store.loadPage(1)
    	}
    	else {
			Ext.defer(this.load, 100, this);
    	}
    }
})