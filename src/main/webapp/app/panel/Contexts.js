Ext.define('Voyant.panel.Contexts', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	requires: ['Voyant.data.store.Contexts'],
	alias: 'widget.contexts',
    statics: {
    	i18n: {
    		title: {en: "Keywords in Context"}
    	},
    	api: {
    		query: undefined,
    		docId: undefined,
    		docIndex: undefined,
    		stopList: 'auto'
    	}
    },
    constructor: function() {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
        var me = this;

        Ext.apply(me, {
    		title: this.localize('title'),
            store : Ext.create("Voyant.data.store.Contexts", {stripTags: true}),
    		selModel: Ext.create('Ext.selection.RowModel', {
                listeners: {
                    selectionchange: {
                    	fn: function(sm, selections) {
                    		this.getApplication().dispatchEvent('termLocationClicked', this, selections);
                    	},
                    	scope: this
                    }
                }
            }),
    		columns: [{
    			text: '#',
    			width: 30,
        		dataIndex: 'docIndex',
                sortable: true,
                renderer: function(v) {return v+1;} // 0-based to 1-based
            },{
    			text: this.localize("left"),
        		dataIndex: 'left',
                sortable: true
            },{
    			text: this.localize("term"),
        		dataIndex: 'term',
                sortable: true
            },{
    			text: this.localize("right"),
        		dataIndex: 'right',
                sortable: true
            }]
        });
        
        me.on("loadedCorpus", function(src, corpus) {
        	this.getStore().setCorpus(corpus);
        	if (!this.getApiParam("query")) {
        		var corpusTerms = Ext.create("Voyant.data.store.CorpusTerms", {corpus: corpus});
        		corpusTerms.load({
        		    callback: function(records, operation, success) {
        		    	if (success && records.length>0) {
        		    		this.setApiParam("query", records[0].getTerm());
        		    		this.getStore().load({params: this.getApiParams()});
        		    	}
        		    },
        		    scope: me,
        		    params: {
        				limit: 1,
        				stopList: this.getApiParam("stopList")
        			}
            	});
        	}
        });
        
        me.on("documentTermsClicked", function(src, documentTerms) {
        	var queries = [];
        	documentTerms.forEach(function(documentTerm) {
        		queries.put(documentTerm.getTerm())
        	})
        	this.setApiParams({
        		docId: undefined,
        		docIndex: undefined,
        		query: queries
        	})
        	this.getStore().loadPage(1, {params: this.getApiParams()});
        });

        me.callParent(arguments);
        
     }
})