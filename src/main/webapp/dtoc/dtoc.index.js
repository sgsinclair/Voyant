Ext.define('Voyant.panel.DToC.Index', {
	extend: 'Ext.tree.Panel',
	requires: [],
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.dtocIndex',
    config: {
    	corpus: undefined,
    	indexStore: undefined
    },
    statics: {
        api: {
        }
    },
    
    initialized: false,
	isCurator: false,
	treeEditor: null,
	currentChapterFilter: null,
	
	indexIds: {},
    
    constructor: function(config) {
    	this.isCurator = config.isCurator == null ? false : config.isCurator;
    	
    	var treeStore = Ext.create('Ext.data.TreeStore', {
			batchUpdateMode: 'complete',
			autoLoad: false,
			root: {
				expanded: true,
		    	draggable: false
			}
		});
		
		var treeConfig = {
			itemId: 'dtcTree',
			xtype: 'treepanel',
			baseCls: 'x-plain dtc-tree',
			cls: 'x-tree-noicon',
			useArrows: true,
			lines: false,
			rootVisible: false,
			overflowX: 'hidden',
			overflowY: 'auto',
			hideHeaders: true,
			viewConfig: {
				overflowX: 'hidden',
				overflowY: 'auto'
			},
			columns: {
				items: [{
					xtype: 'treecolumn',
					width: '100%',
					renderer: function(value, metadata) {
						var r = metadata.record;
						if (r.getData().targetMatches !== true) {
							metadata.tdCls += ' disabled';
						}
						value = r.data.text;
						return value;
					}
				}]
			},
			selModel: new Ext.selection.TreeModel({
				mode: 'MULTI',
				listeners: {
					beforeselect: function(sel, record) {
						// cancel if there are no target matches
						return record.getData().targetMatches === true;
					},
					selectionchange: function(sm, nodes) {
						var indexes = [];
						for (var i = 0; i < nodes.length; i++) {
							var node = nodes[i];
							if (!node.isLeaf()) {
								node.expand();
							}
							var t = node.getData().targets;
							for (var j = 0; j < t.length; j++) {
								var id = t[j];
								var data = {};
								var indexObj = this.indexIds[id];
								if (Ext.isObject(indexObj)) {
									Ext.apply(data, indexObj);
									data.label = (node.parentNode.getData().textNoCount ? node.parentNode.getData().textNoCount : '') + ' ' + node.getData().textNoCount;
									indexes.push(data);
								} else {
									if (console) {
										console.log('no targets:',node.data.textNoCount+', id:'+id);
									}
								}
							}
						}
						this.getApplication().dispatchEvent('indexesSelected', this, indexes);
					},
					scope: this
				}
			}),
		    store: treeStore,
			tbar: new Ext.Toolbar({
		    	cls: 'dtc-toolbar',
		    	hideBorders: true,
		    	items: [{
			    	xtype: 'textfield',
			    	itemId: 'filter',
			    	emptyText: 'Filter',
			    	width: 120,
			    	enableKeyEvents: true,
			    	listeners: {
			    		keyup: function(field, event) {
		    				var value = this.getDockedItems('toolbar #filter')[0].getValue();
		    				if (value == '') {
		    					this.collapseAll();
		    					this.getStore().clearFilter();
		    				} else {
		    					var regex = new RegExp('.*'+value+'.*', 'i');
		    					this.getStore().filterBy(function(r) {
		    						return r.get('text').match(regex) !== null;
		    					});
		    				}
			    		},
			    		scope: this
			    	}
			    }, '->', {
			        text: 'Filter by Chapter',
			        itemId: 'chapterFilter',
			        menu: {
	                    items: [],
	                    plain: true,
	                    showSeparator: false,
	                    listeners: {
	                    	click: this.chapterFilterHandler,
	                    	scope: this
	                    }
	                }
			    }]
		    })
		};
		if (config.doInit) {
			treeConfig.listeners.afterrender = {
	    		fn: function() {
	    			this.initTree(config.initData);
	    		},
	    		scope: this,
	    		single: true
	    	};
		}
		if (this.isCurator) {
//			treeConfig.enableDD = true;
//			treeConfig.listeners.beforenodedrop = function(e) {
//				if ((e.dropNode.getData().isDoc && e.point == 'append') || !e.target.getData().isDoc) e.cancel = true;
//			};
//			treeConfig.listeners.dblclick = {
//				fn: this.editNodeLabel,
//				scope: this
//			};
//			treeConfig.listeners.render = {
//				fn: function() {
//					this.treeEditor = new Ext.tree.TreeEditor(this, {
//						allowBlank: false,
//						selectOnFocus: true
//					}, {
//						cancelOnEsc: true,
//						completeOnEnter: true
//					});
//				},
//				scope: this,
//				single: true
//			};
		}
		
		Ext.apply(config, treeConfig);
    	
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
    },
    initComponent: function() {
        var me = this;
        
        me.callParent(arguments);
    },
    
	listeners: {
		afterrender: function(container) {
				
		},
		loadedCorpus: function(src, corpus) {
			this.setCorpus(corpus);
			
			this.initTree();
			this.updateChapterFilter();
		},
		allTagsLoaded: function(src) {
			this.filterIndex();
			
			// re-select previously selected nodes (why?)
//			var sm = this.getSelectionModel();
//			var selNodes = sm.getSelection();
//			sm.clearSelections();
//			sm.select(selNodes, null, true);
		}
	},
	
	loadIndex: function() {
		var index = this.getCorpus().getDocuments().getCount();
		this._getDocumentXml(index);
	},

	clearSelections: function() {
		this.getSelectionModel().deselectAll(true);
	},
	
	filterIndex: function(idsToKeep) {
		if (idsToKeep !== undefined) {
			// mark records we want to keep
			this.getStore().each(function(r) {
				var targets = r.getData().targets || [];
				var match = targets.some(function(n){
					return idsToKeep.indexOf(n) != -1;
				});
				if (match) {
					r.data.targetMatches = true;
					r.eachChild(function(n) {
						n.data.targetMatches = true;
					});
					if (r.getDepth() > 1) {
						r.getRefOwner().data.targetMatches = true;
					}
				}
			}, this);
		} else {
			this.getView().refresh(); // re-run renderer
			
			// do the actual filtering
//			this.getStore().filterBy(function(r) {
//				return r.getData().targetMatches === true;
//			}, this);
		}
	},
	
	updateChapterFilter: function() {
	    var menu = this.getDockedItems('toolbar #chapterFilter')[0].menu;
	    menu.removeAll();
	    
	    var docs = this.getCorpus().getDocuments();
		for (var i = 0, len = docs.getCount(); i < len; i++) {
    		var doc = docs.getAt(i);
    		menu.add({
	            xtype: 'menucheckitem',
	            docId: doc.getId(),
	            group: 'chapters',
	            text: doc.getShortTitle()
	        });
		}
	},
	
	chapterFilterHandler: function(menu, item) {
		if (this.currentChapterFilter !== null && item.getId() === this.currentChapterFilter) {
			this.currentChapterFilter = null;
			item.setChecked(false);
			this.collapseAll();
			this.getStore().clearFilter();
		} else {
			this.currentChapterFilter = item.getId();
	        var docId = item.initialConfig.docId;
	        this.getStore().filterBy(function(node) {
	            var t = node.getData().targets || [];
	            for (var i = 0; i < t.length; i++) {
	                var id = t[i];
	                var indexObj = this.indexIds[id];
	                if (indexObj.docId === docId) {
	                    return true;
	                }
	                return false;
	            }
	        }, this);
		}
	},
	
	_getDocumentXml: function(index) {
		Ext.Ajax.request({
			url: Voyant.application.getTromboneUrl(),
			params: {
				tool: 'corpus.DtocIndex',
				corpus: this.getCorpus().getId()
			},
			success: function(response) {
				var json = JSON.parse(response.responseText);
				var indexText = json['org.voyanttools.trombone.tool.corpus.DtocIndex'].index;
				var parser = new DOMParser();
				var indexDoc = parser.parseFromString(indexText, 'application/xml');
				
				var items = Ext.DomQuery.select('div/list/item', indexDoc);
				if (items.length == 0) {
					this.alertInfo({title: 'DToC Indexer', msg:'No index items were found!'});
				} else {
//					var root = this.getRootNode();
					var rootConfig = {
					    text: 'Root',
					    children: []
					};
					this._processIndex(items, rootConfig);
//					console.log(JSON.stringify(rootConfig, null, '\t'));
					this.getRootNode().appendChild(rootConfig.children);
				}
			},
			failure: function(respose) {
				console.log('failed to get index');
			},
			scope: this
		});
	},

	_processIndex: function(items, parentConfig) {
	    function getTitle(el) {
	        var title = undefined;
	        for (var i = 0; i < el.children.length; i++) {
	            var childEl = el.children[i];
	            var name = childEl.nodeName.toLowerCase();
	            if (name !== 'item' && name !== 'list') {
	                title = childEl.textContent;
	            }
	        }
	        if (title === undefined) {
	            title = '';
	            var next = el.firstChild;
	            while (next.nodeType === Node.TEXT_NODE) {
	                title += next.textContent;
	                next = next.nextSibling;
	            }
	        }
	        title = title.replace(/\s+/g, ' ');
	        title = title.trim();
	        return title;
	    }
	    
	    // find a descendant ref and ensure that there aren't other item tags between it and the original tag
	    function doesRefDescendFromItem(extEl) {
	        var ref = extEl.child('ref');
	        var isDescendant = true;
	        if (ref != null) {
                var parent = ref.parent();
                while (parent != extEl) {
                    if (parent.dom.nodeName.toLowerCase() === 'item') {
                        isDescendant = false;
                        break;
                    }
                    parent = parent.parent();
                }
	        } else {
	            isDescendant = false;
	        }
	        return isDescendant;
	    }
	    
		for (var i = 0; i < items.length; i++) {
			var item = Ext.get(items[i]);
			var text = undefined;
			var title = undefined;
			var count = 0;
			var targets = [];
			var subItems = [];
			var childConfig = undefined;
			
			if (item.down('ref')) {
                var ref = item.down('ref');
                text = getTitle(item.dom);
                var target = ref.getAttribute('target');
                if (target !== null) {
	                var ids = target.split(/\s+/);
	                for (var j = 0; j < ids.length; j++) {
	                    var id = ids[j].replace(/^#/, '');
	                    if (id != '') {
	                        if (id.match(/^[a-z]/i) != null) { // must start with a letter
	                            targets.push(id);
	                            count++;
	                            this.indexIds[id] = true; // set to true for now, dtcMarkup will add further info
	                        }
	                    }
	                }
                }
                title = text + ' ('+count+')';
                parentConfig.count += count;
//              parentNode.setText(parentNode.getData().textNoCount + ' ('+parentNode.getData().count+')');
            }
			
			
			if (item.down('list')) {
			    if (text === undefined) {
			        text = getTitle(item.dom);
			        title = text;
			    }
				subItems = Ext.DomQuery.select('list/item', item.dom);
			}
			
			var isLeaf = subItems.length == 0;
			
			if (text === undefined || title === undefined) {
//			    text = title = '';
//			    var doesIt = doesRefDescendFromItem(item);
//			    console.log(doesIt);
//			    console.log('---');
//			    console.log(item.dom.innerHTML);
//			    console.log('=============');
			} else {
    			childConfig = {
    				cls: 'index',
    				text: title,
    				count: count,
    				textNoCount: text,
    				targets: targets,
    				leaf: isLeaf
    			};
    			
    			parentConfig.children.push(childConfig);
    			if (!isLeaf) {
    			    childConfig.children = [];
    			    this._processIndex(subItems, childConfig);//child);
    			}
			}
		}
	},
	
	editNodeLabel: function(node) {
		if (node.getData().editable != false) {
			this.treeEditor.startEdit(node.ui.textNode);
		}
	},
	
	initTree: function(data) {
		if (!this.initialized) {
			this.loadIndex();
			this.initialized = true;
		}
	}
});