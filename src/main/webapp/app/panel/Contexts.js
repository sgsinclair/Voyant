Ext.define('Voyant.panel.Contexts', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	requires: ['Voyant.data.store.Contexts'],
	alias: 'widget.contexts',
    statics: {
    	i18n: {
    		title: {en: "Keywords in Context"},
    		termTip: {en: "The keyword for the context."},
    		left: {en: "Left"},
    		leftTip: {en: "Context to the left of the keyword."},
    		right: {en: "Right"},
    		rightTip: {en: "Context to the right of the keyword."}
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
            store : Ext.create("Voyant.data.store.Contexts", {stripTags: "all"}),
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
    			tooltip: this.localize("leftTip"),
    			align: 'right',
        		dataIndex: 'left',
                sortable: true,
                flex: 1
            },{
    			text: this.localize("term"),
    			tooltip: this.localize("termTip"),
        		dataIndex: 'term',
                sortable: true,
                width: 'autoSize'
            },{
    			text: this.localize("right"),
    			tooltip: this.localize("rightTip"),
        		dataIndex: 'right',
                sortable: true,
                flex: 1
            }],
            listeners: {
	           	 documentIndexTermsClicked: {
	           		 fn: function(src, documentIndexTerms) {
	           			// this isn't quite right, since we want every term associated with a docIndex, but for now it will do
	           			var queriesHash = {};
	           			var queries = [];
	           			var docIndexHash = {};
	           			var docIndex = [];
	           			documentIndexTerms.forEach(function(item) {
	           				if (!queriesHash[item.term]) {
	           					queries.push(item.term);
	           					queriesHash[item.term]=true;
	           				}
	           				if (!docIndexHash[item.docIndex]) {
	           					docIndex.push(item.docIndex);
	           					docIndexHash[item.docIndex]=true;
	           				}
	           			})
	       	        	this.setApiParams({
	       	        		docId: undefined,
	       	        		docIndex: docIndex,
	       	        		query: queries
	       	        	})
	       	        	if (this.isVisible()) {
	       		        	this.getStore().loadPage(1, {params: this.getApiParams()});
	       	        	}
	           		 },
	           		 scope: this
	           	 }
            }
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
        	var documentIndexTerms = [];
        	documentTerms.forEach(function(documentTerm) {
        		documentIndexTerms.push({
        			term: documentTerm.getTerm(),
        			docIndex: documentTerm.getDocIndex()
        		})
        	})
        	this.fireEvent("documentIndexTermsClicked", this, documentIndexTerms);
        });

        me.callParent(arguments);
        
     }
     
})