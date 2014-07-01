Ext.define('Voyant.panel.CorpusTerms', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.corpusterms',
    statics: {
    	i18n: {
    		title: {en: "Corpus Terms"},
    	},
    	api: {
    		stopList: 'auto',
    		query: undefined
    	}
    },
    constructor: function(config) {
    	
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		var store = this.getStore();
    		store.setCorpus(corpus);
    		store.load({
    			params: Ext.apply(this.getApiParams() || {}, {
    				withDistributions: 'relative'
    			})
    		});
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

        Ext.apply(me, {
    		title: this.localize('title'),
            store : Ext.create("Voyant.data.store.CorpusTerms", {
            	proxy: new Ext.data.proxy.Ajax({
		         type: 'ajax',
		         url: Voyant.application.getTromboneUrl(),
		         extraParams: {
		        	 tool: 'corpus.CorpusTerms'
		         },
		         reader: {
		             type: 'json',
		             rootProperty: 'corpusTerms.terms'
		         },
		         simpleSortMode: true
            	})
            }),
    		selModel: Ext.create('Ext.selection.CheckboxModel', {
                listeners: {
                    selectionchange: {
                    	fn: function(sm, selections) {
                    		this.getApplication().dispatchEvent('corpusTermsClicked', this, selections);
                    	},
                    	scope: this
                    }
                }
            }),
    		columns: [{
    			text: this.localize("term"),
        		dataIndex: 'term',
                sortable: true
            },{
            	text: this.localize("rawFreq"),
            	dataIndex: 'rawFreq',
            	width: 100,
            	sortable: true,
            },{
                xtype: 'widgetcolumn',
                text: this.localize("trend"),
                width: 120,
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