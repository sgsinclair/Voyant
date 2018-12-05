Ext.define('Voyant.panel.Documents', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel','Voyant.util.Downloadable'],
	alias: 'widget.documents',
	isConsumptive: true,
    statics: {
    	i18n: {
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
    	    selModel: {pruneRemoved: false},
    	    proxy: {
    	    	extraParams: {
    	    		forTool: 'documents'
    	    	}
    	    }
    	});
    	
    	var dockedItemsItems = [{
            xtype: 'querysearchfield'
        }, {
            xtype: 'totalpropertystatus'
        }]
    	
    	var me = this;
    	
    	if (!config || config.mode!=this.MODE_EDITING) {
    		dockedItemsItems.push({
            	text: this.localize("modify"),
            	tooltip: this.localize("modifyTip"),
    			glyph: 'xf044@FontAwesome',
    			scope: this,
    			itemId: 'modifyButton',
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
    		}, {
    			text: this.localize('downloadButton'),
		    	glyph: 'xf019@FontAwesome',
    			itemId: 'downloadButton',
    			handler: function() {
    				me.downloadFromCorpusId(me.getStore().getCorpus().getId())
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
	    	        text: this.localize('averageWordsPerSentence'),
	    	        dataIndex: 'averageWordsPerSentence',
	    	        renderer: Ext.util.Format.numberRenderer('0,000.0'),
	            	tooltip: this.localize("averageWordsPerSentenceTip"),
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
	    	
	    	selModel: {
	    		type: 'rowmodel',
	    		mode: 'MULTI',
                listeners: {
                    selectionchange: {
                    	fn: function(sm, selections) {
                    		this.getApplication().dispatchEvent('documentsClicked', this, selections, this.getStore().getCorpus());
                    	},
                    	scope: this
                    }
                }
            },
            
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                items: dockedItemsItems
            }]
    	});
    	
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
        
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {

    		this.store.setCorpus(corpus);
    		if (this.isVisible()) {
        		this.store.load({params: this.getApiParams()});
    		} else {
    			this.on('afterrender', function() {
            		this.store.load({params: this.getApiParams()});
    			}, this);
    		}
    		if (this.hasCorpusAccess(corpus)==false) {
    			this.queryById('modifyButton').hide();
    			this.queryById('downloadButton').hide();
    		}
    		/*
    		var me = this;
    		Ext.Ajax.request({
    			url: this.getApplication().getTromboneUrl(),
    			params: {
    				corpus: corpus.getId(),
    				tool: 'corpus.CorpusManager',
    				getAccess: true
    			},
    		    success: function(response, opts) {
    		        var obj = Ext.decode(response.responseText);
    		        if (obj && obj)
    		        debugger
    		        console.dir(obj);
    		        me
    		    },
    		    failure: function(response, opts) {
    		    	me.showError(response);
    		    }
    		})
    		*/
    	})
    	
    	this.on("activate", function() { // load after tab activate (if we're in a tab panel)
    		if (this.getStore().getCorpus()) {
    			this.getStore().load({params: this.getApiParams()});
    		}
    	}, this);
    	
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
				app.openUrl(app.getBaseUrl()+"?corpus="+obj.corpus.id);
//    			view.mask("Loading new corpus…")
//    			new Voyant.data.model.Corpus({corpus: obj.corpus.id}).then(function(corpus) {
//    				view.unmask();
//    				app.openUrl(app.getBaseUrl()+"/?corpus="+obj.corpus.id)
//    				app.dispatchEvent('loadedCorpus', app, corpus);
//    			}).fail(function(message, response) {
//    				view.unmask();
//    				app.showErrorResponse({message: message}, response);
//    			});
    		}
    	});
    	
    	// close editing window if we're in modal mode, should happen asynchronously while new corpus is created
    	var win = this.up("window");
    	if (win && win.isFloating()) {win.close()}
    }
})