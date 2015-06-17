Ext.define('Voyant.panel.Contexts', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	requires: ['Voyant.data.store.Contexts'],
	alias: 'widget.contexts',
    statics: {
    	i18n: {
    		title: {en: "Contexts"},
    		document: {en: "Document"},
    		documentTip: {en: "The document of the occurrence."},
    		helpTip: {en: "The Keywords in Context tool shows each occurrence of a keyword with a bit of surounding text (the context). It can be useful for studying more closely how terms are used in different contexts. Features include:</p><ul><li>reordering document, by keyword or by left or right context</li><li>a search box for queries (hover over the magnifying icon for help with the syntax)</li></ul>"},
    		termTip: {en: "The keyword for the context."},
    		left: {en: "Left"},
    		leftTip: {en: "Context to the left of the keyword."},
    		right: {en: "Right"},
    		rightTip: {en: "Context to the right of the keyword."},
    		context: {en: "context"},
    		expand: {en: "expand"}
    	},
    	api: {
    		query: undefined,
    		docId: undefined,
    		docIndex: undefined,
    		stopList: 'auto',
    		context: 5,
    		expand: 50
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
            plugins: [{ // the expander slider assumes there's only one plugin, needs to be updated if changed
                ptype: 'rowexpander',
                rowBodyTpl : new Ext.XTemplate('')
            }],
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                items: [{
                    xtype: 'querysearchfield'
                }, {
                    xtype: 'totalpropertystatus'
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
                		changecomplete: function(slider, newValue) {
                			me.setApiParam("context", slider.getValue());
           		        	me.getStore().loadPage(1, {params: me.getApiParams()});
                		}
                	}
                }, this.localize('expand'), {
                	xtype: 'slider',
                	minValue: 5,
                	value: 5,
                	maxValue: 500,
                	increment: 10,
                	width: 50,
                	listeners: {
                		render: function(slider) {
                			slider.setValue(me.getApiParam('expand'))
                		},
                		changecomplete: function(slider, newValue) {
                			me.setApiParam('expand', newValue);
                			var view = me.getView();
                			var recordsExpanded = me.plugins[0].recordsExpanded;
                			var store = view.getStore();
                			for (id in recordsExpanded) {
                				if (recordsExpanded[id]) {
                					var record = store.getByInternalId(id);
                					var row = view.getRow(record);
                					var expandRow = row.parentNode.childNodes[1]
                					view.fireEvent("expandbody", row, record, expandRow, {force: true})
                				}
                			}
                		}
                	}
                }]
            }], 
    		columns: [{
    			text: this.localize("document"),
    			toolTip: this.localize("documentTip"),
                width: 'autoSize',
        		dataIndex: 'docIndex',
                sortable: false,
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                	return store.getCorpus().getDocument(value).getTinyLabel();
                }
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
	           	 },
                 afterrender: function(me) {
                	 me.getView().on('expandbody', function( rowNode, record, expandRow, eOpts ) {
                		 if (expandRow.innerText=="" || (eOpts && eOpts.force)) {
                	            var store = Ext.create("Voyant.data.store.Contexts", {
                	            	stripTags: "all",
                	            	corpus: me.getStore().getCorpus()
                	            })
                	            var data = record.getData()
                	            store.load({
                	            	params: {
                    	            	query: data.query,
                    	            	docIndex: data.docIndex,
                    	            	position: data.position,
                    	            	limit: 1,
                    	            	context: me.getApiParam('expand')
                	            	},
                	                callback: function(records, operation, success) {
                	                	if (success && records.length==1) {
                	                		data = records[0].getData()
                	                		operation.expandRow.firstElementChild.firstElementChild.innerHTML = data.left + " <span class='word keyword'>" + data.middle + "</span> " + data.right
                	                	}
                	                },
                	                expandRow : expandRow
                	            })
                	            
                		 }
                	 }) 
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