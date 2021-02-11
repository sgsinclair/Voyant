Ext.define('Voyant.panel.DToC.MarkupBase', {
	
	mixins: ['Voyant.panel.DToC.MarkupLoader'],
	constructor: function(config) {
		this.mixins['Voyant.panel.DToC.MarkupLoader'].constructor.apply(this, arguments);
	},
	
	savedTags: {}, // saved metadata for tags, organized by document 
	curatedTags: null, // curated tags list
	tagTotals: {}, // tracks tag freq counts for entire corpus
	
	_maskEl: null,
	
	loadAllTags: function(useMask) {
		var me = this;
		if (this.getCorpus() !== undefined) {
			if (useMask) {
				this._maskEl = this.body.mask('Processing Tags', 'loadMask');
			}
			this.doLoadAllTags().then(function() {
				me._updateTagTotals();
				me.getApplication().dispatchEvent('allTagsLoaded', me);
			}, function() {
				if (window.console) console.warn('loading tags failed!');
			}, function(docId) {
			    var docIndex = me.getCorpus().getDocument(docId).getIndex();
			    var progress = docIndex / me.getCorpus().getDocumentsCount();
			    me._updateProgress(progress);
			}).always(function() {
				if (useMask) {
					me.body.unmask();
					me._maskEl = null;
				}
			});
		} else {
			this.on('loadedCorpus', function(src, corpus) {
				this.setCorpus(corpus);
				this.loadAllTags(useMask);
			}, this, {single: true});
		}
	},
	
	_updateTagTotals: function() {
		// add tag freqs to totals
		for (var docId in this.savedTags) {
			var docData = this.savedTags[docId];
			for (var tagName in docData) {
				var tagData = docData[tagName];
				if (tagData != null) {
					if (this.tagTotals[tagName] == null) {
						this.tagTotals[tagName] = {
						    freq: tagData.length,
						    label: tagData[0].label,
						    type: tagData[0].type
						};
					} else {
						this.tagTotals[tagName].freq += tagData.length;
					}
				}
			};
		}
		
		var data = [];
		for (var tag in this.tagTotals) {
//			var index = this.store.findExact('tagName', tag);
			var match = null;
			this.store.each(function(r) {
				if (r.get('tagName') === tag) {
					match = r;
					return false;
				}
			});
			var tagTotalsEntry = this.tagTotals[tag];
			var freq = tagTotalsEntry.freq || 1;
			if (tag == 'pb' || tag == 'docAuthor') {
//				console.log(tag, match);
			}
			if (match === null) {
				data.push({
					tagName: tag,
					label: tagTotalsEntry.label || tag,
					freq: freq,
					type: tagTotalsEntry.type
				});
			} else {
				var record = match;
				try {
					record.set('freq', freq);
					record.commit();
				} catch (e) {
//					console.log(record, e);
				}
			}
		}
		this.store.loadData(data, true);
		this.store.sort('label', 'ASC');
	},
	
	/**
	 * Converts store data to json that can be loaded by the store.
	 */
	exportTagData: function() {
		var jsonData = [];
		this.store.each(function(rec) {
			var data = rec.data;
			if (data.tagName !== '') {
    			if (data.label === '') {
    			    data.label = data.tagName;
    			}
    			delete data.freq;
				delete data.id;
				if (data.usage) {
					if (data.usage === null) {
						delete data.usage;
					}
				} else if (this.curatedTags !== null) {
					// need to pull in curatedTag usage info when moving from default to curator mode
					var curatedTag = this.curatedTags[data.tagName];
					if (curatedTag && curatedTag.usage) {
						data.usage = curatedTag.usage;
					}
				}
    			jsonData.push(data);
			}
		}, this);
		return jsonData;
	},
	
	_updateProgress: function(progress) {
	    if (this._maskEl != null) {
	    	this._maskEl.down('.x-mask-msg-text').dom.firstChild.data = 'Processing Tags: '+Math.floor(progress*100)+'%';
	    } else if (this.getApplication().useIndex) {
	    	Ext.getCmp('dtcIndex').updateIndexProgress(progress);
	    }
	},
	
	showHitsForTags: Ext.emptyFn, // need to override this
	
	clearSelections: function() {
		this.getSelectionModel().deselectAll(true);
	}
});

Ext.define('Voyant.panel.DToC.Markup', {
	extend: 'Ext.grid.Panel',
	requires: [],
	mixins: ['Voyant.panel.DToC.MarkupBase', 'Voyant.panel.Panel'],
	alias: 'widget.dtocMarkup',
    config: {
    	corpus: undefined,
    	tokensStore: undefined
    },
    statics: {
    	i18n: {
    		title:"Tags"
    	},
        api: {
        }
    },
    
    currentChapterFilter: null,
    
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	this.mixins['Voyant.panel.DToC.MarkupBase'].constructor.apply(this, arguments);

    },
    initComponent: function() {
        var me = this;
        
        // TODO what is this used for?
        me.setTokensStore(Ext.create("Voyant.data.store.Tokens", {
        	stripTags: 'NONE',
        	listeners: {
        		load: function(store, records, success) {
        			console.log(store, records);
        		},
        		scope: me
        	}
        }));
        
        var tagStore = Ext.create('Ext.data.JsonStore', {
    		fields: [
				{name: 'tagName', allowBlank: false},
				{name: 'label', allowBlank: false},
				{name: 'freq', type: 'int'},
				{name: 'type'},
				{name: 'usage'}
			],
			sortInfo: {field: 'label', direction: 'ASC'}
	    });
        
        Ext.apply(me, {
    		title: me.localize('title'),
            store : tagStore,
            deferRowRender: true,
            viewConfig: {
            	markDirty: false
            },
    		selModel: Ext.create('Ext.selection.RowModel', {
    			mode: 'MULTI',
                listeners: {
                    selectionchange: {
                    	fn: function(sm, selections) {
                    	    this.getApplication().showMultiSelectMsg(this);
                    	    
                    		this.handleSelections(selections);
                    	},
                    	scope: this
                    }
                }
            }),
            dockedItems: [{
                dock: 'top',
                xtype: 'toolbar',
                items: [{
			    	xtype: 'textfield',
			    	itemId: 'filter',
			    	emptyText: 'Filter',
			    	width: 120,
			    	enableKeyEvents: true,
			    	listeners: {
			    		keyup: this.textFilterHandler,
			    		scope: this
			    	}
			    }, '->', {
                    text: 'Filter by Chapter',
                    itemId: 'markupChapterFilter',
                    menu: {
                        items: [],
                        plain: true,
                        showSeparator: false,
                        listeners: {
                            click:  function(menu, item) {
                            	this.doChapterFilter(item.initialConfig.docId, true);
                            },
                            scope: this
                        }
                    }
                }]
            }],
            hideHeaders: true,
    		columns: [
    		    {header: 'Label', dataIndex: 'label', flex: 1},
    		    {header: 'Freq', dataIndex: 'freq', align: 'right'}
    		]
        });
        
        me.callParent(arguments);
    },
    
    handleSelections: function(selections) {
	    var docIdFilter;
	    this.down('#markupChapterFilter').getMenu().items.each(function(item) {
	        if (item.checked) {
	            docIdFilter = item.initialConfig.docId;
	            return false;
	        }
	        return true;
	    });
		var tags = [];
		for (var i = 0; i < selections.length; i++) {
			var sel = selections[i].data;
			if (docIdFilter !== undefined) {
			    var tagData = this.savedTags[docIdFilter][sel.tagName];
                if (tagData != null) {
                    tags.push(tagData);
                }
			} else {
    			for (var docId in this.savedTags) {
    				var tagData = this.savedTags[docId][sel.tagName];
    				if (tagData != null) {
    					tags.push(tagData);
    				}
    			}
			}
		}
		this.getApplication().dispatchEvent('tagsSelected', this, tags);
	},
    
	updateChapterFilter: function() {
		// TODO take possible curation into account
	    var menu = this.down('#markupChapterFilter').getMenu();
	    menu.removeAll();
	    
	    var docs = this.getCorpus().getDocuments();
		for (var i = 0, len = this.getCorpus().getDocumentsCount(); i < len; i++) {
			var doc = docs.getAt(i);
			// check to see if this doc was specified as the index (via the cwrc interface)
			if (doc.get('extra.isDtocIndex') === 'true') {
				continue;
			}
    		menu.add({
	            xtype: 'menucheckitem',
	            docId: doc.getId(),
	            group: 'markupchapters',
	            text: doc.getShortTitle()
	        });
		}
	},
	
	textFilterHandler: function() {
		var value = this.down('#filter').getValue();
		if (value == '') {
			this.getStore().clearFilter();
		} else {
			var regex = new RegExp('.*'+value+'.*', 'i');
			this.getStore().filterBy(function(r) {
				return r.get('label').match(regex) !== null;
			});
		}
	},
	
	doChapterFilter: function(docId, local) {
	    if (docId === this.currentChapterFilter) {
	        docId = null;
	    }
	    
		var menuItem;
		this.down('#markupChapterFilter').getMenu().items.each(function(item) {
			if (item.initialConfig.docId === docId) {
				menuItem = item;
			} else {
				item.setChecked(false);
			}
		}, this);
		
		var textFilter = this.down('#filter').getValue();
		var regex = new RegExp('.*'+textFilter+'.*', 'i');
		
		if (docId === null) {
			this.currentChapterFilter = null;
			this.getStore().clearFilter();
			this.getStore().each(function(record) {
				var freqTotal = this.tagTotals[record.get('tagName')].freq;
				record.set('freq', freqTotal);
			}, this);
			if (textFilter != '') {
				this.textFilterHandler();
			}
			docId = null;
		} else {
			menuItem.setChecked(true);
			this.currentChapterFilter = docId;
	        var docTags = this.savedTags[docId];
	        this.getStore().clearFilter();
	        this.getStore().filterBy(function(record, id) {
				var tagName = record.get('tagName');
				var tagObj = docTags[tagName];
				if (tagObj != undefined && tagObj != null) {
				    record.set('freq', tagObj.length);
				    if (textFilter != '') {
				    	return record.get('label').match(regex) !== null;
				    }
				    return true;
				}
				return false;
	        }, this);
		}
		if (local) {
			this.getApplication().dispatchEvent('chapterFilterSelected', this, docId);
		}
	},
	
	listeners: {
		loadedCorpus: function(src, corpus) {
			this.setCorpus(corpus);
			this.updateChapterFilter();
		},
		indexProcessed: function() {
			this.loadAllTags(false);
		},
		chapterFilterSelected: function(src, docId) {
			this.doChapterFilter(docId, false);
		}
	}
});