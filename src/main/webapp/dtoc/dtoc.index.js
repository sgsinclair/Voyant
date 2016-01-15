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
    
	treeEditor: null,
	currentChapterFilter: null,
	
	indexIds: {},
	
	_maskEl: null,
    
    constructor: function(config) {
    	
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
						if (r.getData().targetMatches !== true && r.getData().isCrossRef !== true) {
							metadata.tdCls += ' disabled';
						}
						if (r.getData().isCrossRef === true) {
							metadata.tdCls += ' crossRef';
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
						return record.getData().targetMatches === true || record.getData().isCrossRef === true;
					},
					selectionchange: function(sm, nodes) {
						var indexes = [];
						var crossRef = null;
						for (var i = 0; i < nodes.length; i++) {
							var node = nodes[i];
							if (!node.isLeaf()) {
								node.expand();
							}
							if (node.getData().isCrossRef) {
								crossRef = node.getOwnerTree().getRootNode().findChild('indexId', node.getData().targets[0]);
								break;
							} else {
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
						}
						if (crossRef != null) {
							node.getOwnerTree().selectPath(crossRef.getPath());
						} else {
							this.getApplication().dispatchEvent('indexesSelected', this, indexes);
						}
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
			    	
			    	keyupDelay: 150,
			    	lastKeyupTimestamp: undefined,
			    	keyupTimeoutId: undefined,
			    	
			    	listeners: {
			    		keyup: function(field, event) {
			    			clearTimeout(field.initialConfig.keyupTimeoutId);
			    			var currTime = Date.now();
			    			if (currTime - field.initialConfig.lastKeyupTimestamp > field.initialConfig.keyupDelay) {
			    				var value = field.getValue();
			    				if (value == '') {
			    					this.getStore().clearFilter(true);
			    					this.collapseAll();
			    					field.initialConfig.lastKeyupTimestamp = undefined;
			    					return;
			    				} else {
			    					var regex = new RegExp('.*'+value+'.*', 'i');
			    					var nodesToExpand = [];
			    					this.getStore().clearFilter(true);
			    					this.getStore().filterBy(function(r) {
			    						var match = false;
			    						if (r.hasChildNodes()) {
			    							r.eachChild(function(n) {
			    								if (n.get('text').match(regex) !== null) {
			    									match = true;
			    									nodesToExpand.push(r);
			    									return false;
			    								}
			    							}, this);
			    						} else {
			    							match = r.get('text').match(regex) !== null;
			    						}
			    						return match;
			    					});
			    					for (var i = 0; i < nodesToExpand.length; i++) {
			    						nodesToExpand[i].expand();
			    					}
			    				}
			    			} else {
			    				field.initialConfig.keyupTimeoutId = setTimeout(function(){field.fireEvent('keyup', field);}.bind(this), field.initialConfig.keyupDelay);
			    			}
			    			field.initialConfig.lastKeyupTimestamp = currTime;
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
			this.loadIndex();
			this.updateChapterFilter();
		},
		allTagsLoaded: function(src) {
			this.filterIndex();
			
			this.body.unmask();
			
			// re-select previously selected nodes (why?)
//			var sm = this.getSelectionModel();
//			var selNodes = sm.getSelection();
//			sm.clearSelections();
//			sm.select(selNodes, null, true);
		}
	},
	
	loadIndex: function() {
	    this._maskEl = this.body.mask('Processing Index: 0%', 'loadMask');
	    
		this._getIndexXml();
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
				r.data.targetMatches = true;
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
	
	updateIndexProgress: function(progress) {
	    var msgEl = this._maskEl.down('.x-mask-msg-text');
	    if (msgEl) {
	    	msgEl.dom.firstChild.data = 'Processing Index: '+Math.floor(progress*100)+'%';
	    }
	},
	
	updateChapterFilter: function() {
	    var menu = this.getDockedItems('toolbar #chapterFilter')[0].menu;
	    menu.removeAll();
	    
	    var docs = this.getCorpus().getDocuments();
		for (var i = 0, len = this.getCorpus().getDocumentsCount(); i < len; i++) {
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
	        this.getStore().clearFilter();
	        this.getStore().filterBy(function(record, id) {
	            var t = record.getData().targets || [];
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
	
	_getIndexXml: function() {
		Ext.Ajax.request({
			url: Voyant.application.getTromboneUrl(),
			params: {
				tool: 'corpus.DtocIndex',
				corpus: this.getCorpus().getId()
			},
			success: function(response) {
				var json = JSON.parse(response.responseText);
				var indexText = json['org.voyanttools.trombone.tool.corpus.DtocIndex'].index;
				// FIXME remove hack once resolved server side
				indexText = indexText.replace(/&/g, '&amp;');
				
				var parser = new DOMParser();
				var indexDoc = parser.parseFromString(indexText, 'application/xml');
				
				var items = Ext.DomQuery.select('div/list/item', indexDoc);
				if (items.length == 0) {
					this.showError({title: 'DToC Indexer', message:'No index items were found!'});
				} else {
//					var root = this.getRootNode();
					var rootConfig = {
					    text: 'Root',
					    children: []
					};
					this._processIndex(items, rootConfig);
//					this._resolveCrossRefs(rootConfig, rootConfig);
					
//					console.log(JSON.stringify(rootConfig, null, '\t'));
					this.getRootNode().appendChild(rootConfig.children);
					
					this.getApplication().dispatchEvent('indexProcessed', this);
				}
			},
			failure: function(respose) {
				this.showError({title: 'DToC Indexer', message:'Failed to get index.'});
			},
			scope: this
		});
	},

	_processIndex: function(items, parentConfig) {
	    function getTitle(el) {
	        var title = undefined;
	        var children = el.childNodes;
	        for (var i = 0; i < children.length; i++) {
	            var child = children[i];
	            if (child.nodeType === Node.ELEMENT_NODE) {
    	            var name = child.nodeName.toLowerCase();
    	            if (name !== 'item' && name !== 'list') {
    	                title = child.textContent;
    	            }
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
			var itemId = item.getAttribute('xml:id');
			var text = undefined;
			var title = undefined;
			var count = 0;
			var targets = [];
			var subItems = [];
			var childConfig = undefined;
			var isCrossRef = false;
			
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
	                        	if (id.indexOf('ie') === 0) {
	                        		isCrossRef = true;
	                        	}
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
    				leaf: isLeaf,
    				indexId: itemId,
    				isCrossRef: isCrossRef
    			};
    			
    			parentConfig.children.push(childConfig);
    			if (!isLeaf) {
    			    childConfig.children = [];
    			    this._processIndex(subItems, childConfig);//child);
    			}
			}
		}
	},
	
	_resolveCrossRefs: function(rootConfig, parentConfig) {
		if (!parentConfig.leaf) {
			for (var i = 0; i < parentConfig.children.length; i++) {
				var child = parentConfig.children[i];
				if (child.isCrossRef && child.crossed != true) {
					var id = child.targets[0];
					var crossRef = {};
					this._findCrossRefTarget(id, crossRef, rootConfig);
					Ext.apply(child, crossRef);
					child.text = 'CR '+child.text;
					child.crossed = true;
//					child.children = [];  // stop max stack msg
//					child.leaf = true;
				} else {
					this._resolveCrossRefs(rootConfig, child);
				}
			}
		}
	},
	
	_findCrossRefTarget: function(id, crossRef, parent) {
		if (parent.indexId === id) {
			Ext.apply(crossRef, parent);
			return;
		}
		if (!parent.leaf) {
			for (var i = 0; i < parent.children.length; i++) {
				if (crossRef.indexId === undefined) {
					this._findCrossRefTarget(id, crossRef, parent.children[i]);
				} else {
					return;
				}
			}
		}
	},
	
	editNodeLabel: function(node) {
		if (node.getData().editable != false) {
			this.treeEditor.startEdit(node.ui.textNode);
		}
	}
});