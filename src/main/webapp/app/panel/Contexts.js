Ext.define('Voyant.panel.Contexts', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	requires: ['Voyant.data.store.Contexts'],
	alias: 'widget.contexts',
    statics: {
    	i18n: {
    		title: {en: "Contexts"},
    		helpTip: {en: "The Keywords in Context tool shows each occurrence of a keyword with a bit of surounding text (the context). It can be useful for studying more closely how terms are used in different contexts. Features include:</p><ul><li>reordering document, by keyword or by left or right context</li><li>a search box for queries (hover over the magnifying icon for help with the syntax)</li></ul>"},
    		termTip: {en: "The keyword for the context."},
    		left: {en: "Left"},
    		leftTip: {en: "Context to the left of the keyword."},
    		right: {en: "Right"},
    		rightTip: {en: "Context to the right of the keyword."},
    		context: {en: "context"}
    	},
    	api: {
    		query: undefined,
    		docId: undefined,
    		docIndex: undefined,
    		stopList: 'auto',
    		context: 5
    	},
		glyph: 'xf0ce@FontAwesome'
    },
    constructor: function() {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
        var me = this;

        Ext.apply(me, {
    		title: this.localize('title'),
            store : Ext.create("Voyant.data.store.Contexts", {
            	stripTags: "all",
            	remoteSort: false,
            	sortOnLoad: true,
            	sorters: {
                    property: 'position',
                    direction: 'ASC'
            	}
            }),
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
                }, this.localize('context'), {
                	xtype: 'slider',
                	minValue: 5,
                	value: 5,
                	maxValue: 50,
                	increment: 5,
                	width: 50,
                	listeners: {
                		render: function(slider) {
                			slider.setValue(me.getApiParam('context'))
                		},
                		dragend: function(slider, newValue) {
                			me.setApiParam("context", slider.getValue());
           		        	me.getStore().loadPage(1, {params: me.getApiParams()});
                		}
                	}
                }]
            }],
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
            	documentSegmentTermClicked: {
	           		 fn: function(src, documentSegmentTerm) {
	           			 if (!documentSegmentTerm.term) {return}
	           			 params = {query: documentSegmentTerm.term};
	           			 if (documentSegmentTerm.docId) {
	           				 params.docId = documentSegmentTerm.docId
	           			 }
	           			 else {
	           				 // default to first document
	           				 params.docIndex = documentSegmentTerm.docIndex ?  documentSegmentTerm.docIndex : 0
	           			 }
	           			 this.setApiParams(params);
	       	        	if (this.isVisible()) {
	       		        	this.getStore().loadPage(1, {params: this.getApiParams()});
	       	        	}
	           		 },
	           		 scope: this
            	},
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
	           			});
	       	        	this.setApiParams({
	       	        		docId: undefined,
	       	        		docIndex: docIndex,
	       	        		query: queries
	       	        	});
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
//        	if (this.getApiParam("query")) {
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
 //       	}
//            	this.getStore().load({params: this.getApiParams()});
        });
        
        me.on("query", function(src, query) {
        	this.setApiParam('query', query);
        	this.getStore().load({params: this.getApiParams()});
        }, me);
        
        me.on("documentTermsClicked", function(src, documentTerms) {
        	var documentIndexTerms = [];
        	documentTerms.forEach(function(documentTerm) {
        		documentIndexTerms.push({
        			term: documentTerm.getTerm(),
        			docIndex: documentTerm.getDocIndex()
        		});
        	});
        	this.fireEvent("documentIndexTermsClicked", this, documentIndexTerms);
        });
        
        me.on("termsClicked", function(src, terms) {
        	var documentIndexTerms = [];
        	if (Ext.isString(terms)) {terms = [terms]}
        	terms.forEach(function(term) {
        		if (term.docIndex !== undefined) {
            		documentIndexTerms.push({
            			term: term.term,
            			docIndex: term.docIndex
            		});
        		}
        	});
        	if (documentIndexTerms.length > 0) {
        		this.fireEvent("documentIndexTermsClicked", this, documentIndexTerms);
        	}
        });

        me.callParent(arguments);
        
     }
     
})