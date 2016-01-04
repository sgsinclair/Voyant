Ext.define('Voyant.panel.Documents', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'/*,'Voyant.util.Localization'*/],
	alias: 'widget.documents',
    statics: {
    	i18n: {
    		title: {en: "Documents"},
    		emptyText: {en: "No matching results."},
    		helpTip: {en: "<p>Documents is a table view of the documents in the corpus. Features include:</p><ul><li>reordering by <i>Title</i>, <i>Words</i> count (tokens), word forms count (<i>Types</i>), and <i>Ratio</i> (Types/Tokens Ratio) (click on the column headers)</li><li>a search box for queries (by default in the full-text, title and author fields &mdash; hover over the magnifying icon for help with the syntax)</li></ul>"},
    		id: {en: "ID"},
    		documentTitle: {en: "Title"},
    		documentAuthor: {en: "Author"},
    		tokensCountLexical: {en: "Words"},
    		typesCountLexical: {en: "Types"},
    		typeTokenRatioLexical: {en: "Ratio"},
    		language: {en: "Language"},
    		matchingDocuments: {en: "Matching documents: {count}"},
    		error: {en: "Error"},
    		add: {en: "Add"},
    		addTip: {en: "Click here to add new documents to this corpus."},
    		remove: {en: "Remove"},
    		removeTip: {en: "Click here to create a new corpus that excludes selected or filtered (search query) documents."},
    		reorder: {en: "Reorder"},
    		reorderTip: {en: "Click here to create a new corpus based on a reordering of documents (drag and drop rows to reorder)."},
    		keep: {en: "Keep"},
    		keepTip: {en: "Click here to create a new corpus that only includes selected or filtered (search query) documents."},
    		modify: {en: "Modify"},
    		newCorpus: {en: "New Corpus"},
    		modifyTip: {en: "Click this button to create a new corpus by adding new documents, by selecting a subset of documents or by re-ordering documents."},
    		allSelectedError: {en: "You have selected all documents, you must select a subset of documents to remove or keep."},
    		removeSelectedDocuments: {en: "Create a <i>new</i> corpus that removes (does NOT include) the {0:plural('selected document')}?"},
    		removeFilteredDocuments: {en: "Create a <i>new</i> corpus that removes (does NOT include) the {0:plural('filtered document')}?"},
    		keepSelectedDocuments: {en: "Create a <i>new</i> corpus that only keeps the {0:plural('selected document')}?"},
    		keepFilteredDocuments: {en: "Create a <i>new</i> corpus that only keeps the {0:plural('filtered document')}?"},
    		selectOrFilterError: {en: "You need to first select documents by clicking on one or more rows or by performing a search query."},
    		onlyOneError: {en: "Your corpus has only one document, you can't remove or keep documents to create a new corpus."},
    		reorderFilteredError: {en: "You cannot reorder a filtered (after search query) corpus. Please create a new corpus first (with the <i>Remove</i> or <i>Keep</i> button) and then reorder the new corpus."},
    		reorderOriginalError: {en: "Please reorder the corpus first (drag and drop the rows in the table)."},
    		reorderDocuments: {en: "Create a <i>new</i> corpus based on the order shown?"}
    	},
    	api: {
    		query: undefined,
    		docIndex: undefined,
    		docId: undefined
    	},
		glyph: 'xf0ce@FontAwesome'
    },
    
    MODE_EDITING: 'editing',
    MODE_NORMAL: 'normal',
    config: {
    	mode: this.MODE_NORMAL
    },

    constructor: function(config) {
    	
    	var store = Ext.create("Voyant.data.store.Documents", {
    	    selModel: {pruneRemoved: false}
    	});
    	
    	var dockedItemsItems = [{
            xtype: 'querysearchfield'
        }, {
            xtype: 'totalpropertystatus'
        }]
    	
    	if (!config || config.mode!=this.MODE_EDITING) {
    		dockedItemsItems.push({
            	text: this.localize("modify"),
            	tooltip: this.localize("modifyTip"),
    			glyph: 'xf044@FontAwesome',
    			scope: this,
            	handler: function(btn) {
            		var win = Ext.create('Ext.window.Window', {
            		    title: this.localize("title"),
            		    modal: true,
            		    width: "80%",
            		    minWidth: 300,
            		    minHeight: 200,
            		    height: "80%",
            		    layout: 'fit',
            		    frame: true,
            		    border: true,
            		    items: {
            		    	xtype: 'documents',
            		    	mode: this.MODE_EDITING,
            		    	corpus: this.getStore().getCorpus(),
            		    	header: false,
            		    	viewConfig: {
            		            plugins:{
            		                ptype:'gridviewdragdrop'
            		            },
            		            listeners: {
            		            	beforedrop: function(node, data, overModel, dropPosition, dropHandlers) {
            		            		if (this.getStore().getCount()<this.getStore().getCorpus().getDocumentsCount()) {
            		            			var panel = this.up("panel");
            		        				Ext.Msg.show({
            		        				    title: panel.localize('error'),
            		        				    message: panel.localize('reorderFilteredError'),
            		        				    buttons: Ext.Msg.OK,
            		        				    icon: Ext.Msg.ERROR
            		        				});
            		            			return false;
            		            		}
            		            		return true;
            		            	}
            		            }
            		    	}
            		    },
            		    buttons: [{
                			text: this.localize('add'),
                			tooltip: this.localize("addTip"),
                			glyph: 'xf067@FontAwesome',
                			handler: function(btn) {
                				btn.up("window").close();
                				Ext.create('Ext.window.Window', {
                					header: false,
                        		    modal: true,
                        		    layout: 'fit',
                        		    items: {
                        		    	xtype: 'corpuscreator',
                        		    	corpus: this.getStore().getCorpus()
                        		    }
                        		}).show();
                			},
                			scope: this
                		}, {
                			text: this.localize('remove'),
                			tooltip: this.localize("removeTip"),
                			glyph: 'xf05e@FontAwesome',
                			hidden: this.getStore().getCorpus().getDocumentsCount()==1,
                			handler: this.keepRemoveReorderHandler,
                			itemId: 'remove',
                			scope: this
                		}, {
                			text: this.localize('keep'),
                			tooltip: this.localize("keepTip"),
                			glyph: 'xf00c@FontAwesome',
                			hidden: this.getStore().getCorpus().getDocumentsCount()==1,
                			handler: this.keepRemoveReorderHandler,
                			itemId: 'keep',
                			scope: this
                		}, {
                			text: this.localize('reorder'),
                			tooltip: this.localize("reorderTip"),
                			glyph: 'xf0dc@FontAwesome',
                			hidden: this.getStore().getCorpus().getDocumentsCount()==1,
                			handler: this.keepRemoveReorderHandler,
                			itemId: 'reorder',
                			scope: this
                		},{
            		        text: 'Cancel',
                			glyph: 'xf00d@FontAwesome',
            		        handler: function(btn) {
            		        	btn.up("window").close();
            		        }
            		    }]
            		}).show();

            	}
    		})
    	}
    	
    	Ext.apply(this, {
    		title: this.localize('title'),
    		emptyText: this.localize("emptyText"),
	    	columns:[
	    	   {
	    		   xtype: 'rownumberer',
	    	        renderer: function(value, metaData, record) {return record.getIndex()+1},
	    	        sortable: false
	    	    },{
	    	        text: this.localize('documentTitle'),
	    	        dataIndex: 'title',
	    	        sortable: true,
	    	        renderer: function(val, metadata, record) {return record.getTitle();},
	    	        flex: 3
	    	    },{
	    	        text: this.localize('documentAuthor'),
	    	        dataIndex: 'author',
	    	        sortable: true,
	    	        hidden: true,
	    	        renderer: function(val, metadata, record) {return record.getAuthor();},
	    	        flex: 2
	    	    },{
	    	        text: this.localize('tokensCountLexical'),
	    	        dataIndex: 'tokensCount-lexical',
	    	        renderer: Ext.util.Format.numberRenderer('0,000'),
	    	        sortable: true,
	    	        width: 'autoSize'
	    	    },{
	    	        text: this.localize('typesCountLexical'),
	    	        dataIndex: 'typesCount-lexical',
	    	        renderer: Ext.util.Format.numberRenderer('0,000'),
	    	        width: 'autoSize'
	    	    },{
	    	        text: this.localize('typeTokenRatioLexical'),
	    	        dataIndex: 'typeTokenRatio-lexical',
	    	        renderer: function(val) {return Ext.util.Format.percent(val)},
	    	        width: 'autoSize'
	    	    },{
	    	        text: this.localize('language'),
	    	        dataIndex: 'language',
	    	        hidden: true,
	    	        renderer: function(val, metaData, record, rowIndex, colIndex, store, view) {return view.ownerCt.getLanguage(val);},
	    	        width: 'autoSize'
	    	    }
	    	],
	    	
	        store: store,
	    	
	    	selModel: Ext.create('Ext.selection.RowModel', {
	    		mode: 'MULTI',
                listeners: {
                    selectionchange: {
                    	fn: function(sm, selections) {
                    		this.getApplication().dispatchEvent('documentsClicked', this, selections, this.getStore().getCorpus());
                    	},
                    	scope: this
                    }
                }
            }),
            
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
        		enableOverflow: true,
                items: dockedItemsItems
            }]
    	});
    	
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
        
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		this.store.setCorpus(corpus);
    		this.store.load({params: this.getApiParams()});
    	})
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('query', function(src, query) {
    		this.setApiParam('query', query);
    		this.store.load({params: this.getApiParams()});
    	})
    	
    	if (config.embedded) {
        	if (Ext.getClass(config.embedded).getName() == "Voyant.data.model.Corpus") {
        		config.corpus = config.embedded
        	}
        	else if (Ext.getClass(config.embedded).getName() == "Voyant.data.store.Documents") {
        		this.store.setRecords(config.embedded.getData())
        		config.corpus = config.embedded.getCorpus()
        	}
    		
    	}
    	
    	// if we have a corpus, load it
    	if (config.corpus) {
    		this.fireEvent('loadedCorpus', this, config.corpus)
    	}
    },
    
    keepRemoveReorderHandler: function(btn) {
    	// we're not sure which scope we're in, so ensure we're talking about this buttons panel
		var panel = btn.up("window").down("documents");
		var selection = panel.getSelection();
		var docs = panel.getStore().getCorpus().getDocumentsCount();
		var btnMode = btn.getItemId();
		// if reordering, check to make sure that we're not looking at a subset
		if (btnMode=='reorder') {
			if (panel.getStore().getCount()<docs) {
				return Ext.Msg.show({
				    title: this.localize('error'),
				    message: this.localize('reorderFilteredError'),
				    buttons: Ext.Msg.OK,
				    icon: Ext.Msg.ERROR
				});
			}
			else {
				docIndex = [];
				panel.getStore().each(function(doc) {
					docIndex.push(doc.getIndex())
			    }, this);
				for (var i=1; i<docIndex.length; i++) {
					if (docIndex[i-1]>docIndex[i]) {
						return Ext.Msg.confirm(panel.localize('newCorpus'), new Ext.Template(panel.localize(btnMode+'Documents')).applyTemplate([selection.length]), function(confirmBtn){
							if (confirmBtn==='yes') {
								docIndex = [];
								this.getStore().each(function(doc) {
									docIndex.push(doc.getIndex())
							    }, this);
								var params = {docIndex: docIndex};
								params[btnMode+"Documents"] = true;
								this.editCorpus(params)
							}
						}, panel);
					}
				}
				// if we get here it's because nothing's been reordered
				return Ext.Msg.show({
				    title: this.localize('error'),
				    message: this.localize('reorderOriginalError'),
				    buttons: Ext.Msg.OK,
				    icon: Ext.Msg.ERROR
				});
			}
			
		}
		
		if (selection.length>0) {
			if (selection.length==docs) {
				if (docs==1) {
					return Ext.Msg.show({
					    title: this.localize('error'),
					    message: this.localize('onlyOneError'),
					    buttons: Ext.Msg.OK,
					    icon: Ext.Msg.ERROR
					});
				}
				else {
					return Ext.Msg.show({
					    title: this.localize('error'),
					    message: this.localize('allSelectedError'),
					    buttons: Ext.Msg.OK,
					    icon: Ext.Msg.ERROR
					});
				}
			}
			else {
				return Ext.Msg.confirm(this.localize('newCorpus'), new Ext.Template(this.localize(btnMode+'SelectedDocuments')).applyTemplate([selection.length]), function(confirmBtn){
					if (confirmBtn==='yes') {
						docIndex = [];
						selection.forEach(function(doc){
							docIndex.push(doc.getIndex())
						})
						var params = {docIndex: docIndex};
						params[btnMode+"Documents"] = true;
						this.editCorpus(params)
					}
				}, panel);
			}
		}
		else if (panel.getApiParam("query") && panel.getStore().getCount()<docs) {
			return Ext.Msg.confirm(this.localize('newCorpus'), new Ext.Template(this.localize(btnMode+'FilteredDocuments')).applyTemplate([selection.length]), function(confirmBtn){
				if (confirmBtn==='yes') {
					docIndex = [];
					this.getStore().each(function(doc) {
						docIndex.push(doc.getIndex())
				    }, this);
					var params = {docIndex: docIndex};
					params[btnMode+"Documents"] = true;
					this.editCorpus(params)
				}
			}, panel);
		}
		else {
			return Ext.Msg.show({
			    title: this.localize('error'),
			    message: this.localize('selectOrFilterError'),
			    buttons: Ext.Msg.OK,
			    icon: Ext.Msg.ERROR
			});
		}    	
    },
    
    editCorpus: function(params) {
    	
    	Ext.apply(params, {
    		tool: 'corpus.CorpusManager',
    		corpus: this.getStore().getCorpus().getId()
    	})

    	// mask main viewport while we create a new corpus
    	var app = this.getApplication();
    	var view = app.getViewport();
		view.mask(this.localize("Creating new corpus…"));
    	Ext.Ajax.request({
    		url: this.getApplication().getTromboneUrl(),
    		method: 'POST',
    		params: params,
    		success: function(response) {
    			view.unmask();
    			var obj = Ext.decode(response.responseText);
    			view.mask("Loading new corpus…")
    			new Corpus({corpus: obj.corpus.id}).then(function(corpus) {
    				view.unmask();
    				app.dispatchEvent('loadedCorpus', app, corpus);
    			}).fail(function(message, response) {
    				view.unmask();
    				app.showErrorResponse({message: message}, response);
    			});
    		}
    	});
    	
    	// close editing window if we're in modal mode, should happen asynchronously while new corpus is created
    	var win = this.up("window");
    	if (win && win.isFloating()) {win.close()}
    }
})