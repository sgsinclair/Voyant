Ext.define('Voyant.panel.DToC.ToC', {
	extend: 'Ext.tree.Panel',
	requires: [],
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.dtocToc',
    config: {
    	corpus: undefined
    },
    statics: {
        api: {
        }
    },
    
    initialized: false,
	xpathWin: null,
	isCurator: false,
	titlesMode: null,
	FULL_TITLES: 0,
	MIN_TITLES: 1,
    
    constructor: function(config) {
    	this.isCurator = config.isCurator == null ? false : config.isCurator;
		this.titlesMode = config.titlesMode == null ? this.FULL_TITLES : config.titlesMode;
    	
		var treeStore = Ext.create('Ext.data.TreeStore', {
			fields: ['identifier', 'docId', 'tokenId', 'dtcType'],
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
			baseCls: 'x-plain dtc-tree dtc-panel',
			cls: 'x-tree-noicon',
			useArrows: true,
			lines: false,
			rootVisible: false,
			overflowX: 'hidden',
			overflowY: 'auto',
			viewConfig: {
				overflowX: 'hidden',
				overflowY: 'auto',
				listeners: {
					itemclick: function(view, record, el, index, event) {
						var data = record.getData();
						
						// document
						if (data.isDoc) {
			    			this.showDocument(data.docId);
			    		} else {
						
							switch(data.dtcType) {
							case 'tag':
								var tag = data.tagData;
								var edata = {
									tag: tag.tagName,
									tokenId: tag.tokenId,
									docId: data.docId,
									type: 'tag'
								};
								this.getApplication().dispatchEvent('tagSelected', this, edata);
								break;
							case 'index':
								var index = data.indexData;
								var edata = {
									tag: index.tag,
									tokenId: index.tokenId,
									docId: data.docId,
									type: 'index'
								};
								this.getApplication().dispatchEvent('tagSelected', this, edata);
								break;
							}
			    		}
					},
					scope: this
				}
			},
		    store: treeStore,
		    tools: null,
			tbar: new Ext.Toolbar({
		    	cls: 'dtc-toolbar',
		    	hideBorders: true,
		    	items: [{
			    	xtype: 'textfield',
			    	width: 135,
			    	itemId: 'search',
			    	emptyText: 'Search',
			    	enableKeyEvents: true,
			    	listeners: {
			    		keydown: function(field, event) {
			    			if (event.getCharCode() == 13) {
			    				var query = this.getTopToolbar().getComponent('search').getValue();
			    				this.submitQuery(query);
			    			}
			    		},
			    		scope: this
			    	}
			    }]
		    })
		};
		if (config.doInit) {
			treeConfig.listeners.afterrender = {
	    		fn: function() {
	    			this.initToc(config.initData);
	    		},
	    		scope: this,
	    		single: true
	    	};
		}
		
		if (this.isCurator) {
			treeConfig.plugins = {ptype: 'treeviewdragdrop'};
			treeConfig.listeners.beforedrop = function(targetNode, dropPosition, dragData, event) {
				if ((dragData.getData().isDoc && dropPosition === 'append') || !targetNode.getData().isDoc) return false;
			};
			treeConfig.listeners.nodedrop = {
				fn: function(node, data, overModel, dropPosition) {
					var children = e.tree.getRootNode().childNodes;
					var corpus = this.getCorpus();
					for (var i = 0; i < children.length; i++) {
						var child = children[i];
						child.getData().docIndex = i;
						var doc = corpus.getDocument(child.getData().docId);
						// store the original index
						if (!doc.record.fields.containsKey('origIndex')) {
							doc.record.fields.add(new Ext.data.Field({
								name: 'origIndex', type: 'int'
							}));
							doc.record.set('origIndex', doc.record.get('index'));
						}
						doc.record.set('index', i);
					}
					corpus.getDocuments().sort('ASC', function(a, b) {
						if (a.getIndex() < b.getIndex()) return -1;
						else return 1;
					});
					Ext.getCmp('dtcDocModel').buildProspect();
				},
				scope: this
			};
			treeConfig.listeners.beforeitemdblclick = {
				fn: function(node, evt) {
					return false; // cancel node expand/contract, edit will still happen however
				},
				scope: this
			};
			treeConfig.listeners.itemdblclick = {
				fn: this.editNodeLabel,
				scope: this
			};
			treeConfig.listeners.render = {
				fn: function() {
					this.treeEditor = new Ext.tree.TreeEditor(this.getComponent('dtcTree'), {
						allowBlank: false,
						selectOnFocus: true
					}, {
						cancelOnEsc: true,
						completeOnEnter: true,
						listeners: {
							complete: function(ed, newval, oldval) {
								var docId = ed.editNode.getData().docId;
								var record = this.getCorpus().getDocument(docId).record;
								record.set('title', newval);
								var shortTitle = record.store.fields.get('shortTitle').convert(newval);
								record.set('shortTitle', shortTitle);
							},
							scope: this
						}
					});
				},
				scope: this,
				single: true
			};
		}
		
		Ext.apply(config, treeConfig);
		
        this.callParent(arguments);
        this.mixins['Voyant.panel.Panel'].constructor.apply(this, [Ext.apply(config, {includeTools: {}})]);

    	
    	
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
			this.initToc();
		},
		tagsSelected: function(src, tags) {
			var noSubType = [];
			var tagsByType = {};
			var identifiers = {};
			
			for (var i = 0; i < tags.length; i++) {
				var docTags = tags[i];
				// sort tags by subtype
				for (var j = 0; j < docTags.length; j++) {
					var tagData = docTags[j];
					
					tagData.identifier = this.getIdentifier(tagData, 'TAG');
					identifiers[tagData.identifier] = true;
					
					var index = this.getStore().findBy(function(r) {
						return r.get('identifier') === tagData.identifier;
					});
					
					if (index === -1) {
						if (tagData.subtype != null) {
							if (tagsByType[tagData.subtype] == null) {
								tagsByType[tagData.subtype] = [tagData];
							} else {
								tagsByType[tagData.subtype].push(tagData);
							}
						} else {
							noSubType.push(tagData);
						}
					} else {
//						console.log('exists', tagData.identifier);
					}
				}
			}
			
			this.removeNodes('tag', identifiers);
			
			for (var type in tagsByType) {
				this.addTagsToTree(tagsByType[type], type);
			}
			
			this.addTagsToTree(noSubType);
		},
		indexesSelected: function(src, indexes) {
			this.removeNodes('index');
			this.addIndexesToTree(indexes);
		}
	},
    
    initToc: function(data, forceInit) {
		if (!this.initialized || forceInit === true) {
			if (data) {
				var root = this.getRootNode();
				root.removeAll(true);
				for (var i = 0; i < data.length; i++) {
					var d = data[i];
					var doc = this.getCorpus().getDocument(d.docId);
					var node = root.appendChild(this.createChapterTreeNode(d.text, doc));
//					console.debug(d.text);
					this._createToolTipForChapterNode(node);
				}
			} else {
				this.setChapterTitles();
			}
			this.initialized = true;
		}
	},
	
	getIdentifier: function(data, type) {
		var id = data.docId+'-'+data.tokenId;
		if (type === 'TAG') {
			id += '-'+data.tagName;
		}
		return id;
	},
	
	setChapterTitles: function(modifyCurrent) {
		var root = this.getRootNode();
		
		var docs = this.getCorpus().getDocuments();
		for (var i = 0, len = docs.getCount(); i < len; i++) {
    		var doc = docs.getAt(i);
    		var docNode, title;
			if (this.titlesMode == this.MIN_TITLES) {
				title = doc.getShortTitle().normalize();
				title = title.slice(0, title.length-1);
			} else {
				title = doc.getTitle().normalize();
			}
			if (modifyCurrent) {
				docNode = root.findChild('docId', doc.getId());
				if (docNode) {
					docNode.setText(title);
				}
			} else {
				docNode = root.appendChild(this.createChapterTreeNode(title, doc));
			}
			
//			if (docNode.getData().toolTip == null) {
//				this._createToolTipForChapterNode(docNode);
//			} else {
//				if (this.titlesMode == this.MIN_TITLES) {
//					docNode.getData().toolTip.enable();
//				} else {
//					docNode.getData().toolTip.disable();
//				}
//			}
		}
	},
	
	createChapterTreeNode: function(title, doc) {
		var data = {
			text: title,
			expandable: true,
			draggable: this.isCurator,
			allowChildren: !this.isCurator,
			docId: doc.getId(),
			docIndex: doc.getIndex(),
			isDoc: true,
			listeners: {
				beforeexpand: function(node) {
					if (!node.hasChildNodes()) {
						return false;
					}
				},
				scope: this
			}
		};
		return data;
	},
	
	_createToolTipForChapterNode: function(treeNode) {
		if (treeNode.getData().docId != null) {
			var root = this.getRootNode();
			var doc = this.getCorpus().getDocument(treeNode.getData().docId);
			var docNode = root.findChild('docId', doc.getId());
			if (docNode) {
				var nodeEl = docNode.getUI().getEl().firstChild;
				// TODO destroy tooltip when treenode is removed
				var tip = new Ext.ToolTip(Ext.apply({
					target: nodeEl,
					title: '',
					listeners: {
						show: function(tt) {
							var authors = doc.get('author');
							var names = '';
							for (var i = 0; i < authors.length; i++) {
								var author = authors[i];
								if (i > 0) {
									if (authors.length > 2) names += ', ';
									if (i == authors.length - 1) {
										names += ' and ';
									}
								}
								names += author.forename + ' ' + author.surname;
							}
							tt.body.update('<span class="title">'+doc.get('title').normalize()+'</span>'+
									'<br/><span class="author">'+names+'</span>');
						},
						scope: this
					}
				}, this.toolTipConfig));
				docNode.getData().toolTip = tip;
				
				if (this.titlesMode == this.MIN_TITLES) {
					docNode.getData().toolTip.enable();
				} else {
					docNode.getData().toolTip.disable();
				}
			}
		}
	},
	

	getTitlesMode: function() {
		return this.titlesMode;
	},
	
	setTitlesMode: function(mode) {
		if (mode == this.MIN_TITLES) {
			this.titlesMode = this.MIN_TITLES;
		} else {
			this.titlesMode = this.FULL_TITLES;
		}
		this.setChapterTitles(true);
	},
	
	showDocument: function(docId) {
		this.getApplication().dispatchEvent('corpusDocumentSelected', this, {docId:docId});
	},
	
	submitQuery: function(query) {
		if (query != '') {
			var docIdTypes = [];
			
			var docs = this.getCorpus().getDocuments();
			for (var i = 0, len = docs.getCount(); i < len; i++) {
	    		var doc = docs.getAt(i);
	    		docIdTypes.push(doc.getId()+':'+query);
			}
			
			this.getKwicsForDocIdTypes(docIdTypes);
		}
	},

	getKwicsForDocIdTypes: function(docIdTypes) {
		Ext.Ajax.request({
			url: this.getTromboneUrl(),
			params: {
				tool: 'TypeKwics',
				context: 6,
//				limit: 50,
				sortBy: 'offset',
				sortDirection: 'DESC',
				corpus: this.getCorpus().getId(),
				docIdType: docIdTypes
			},
			success: function(response, options) {
				this.removeNodes('kwic');
				var result = Ext.decode(response.responseText);
				this.addKwicsToTree(result.typeKwics.kwics);
				
//				this.getApplication().dispatchEvent('documentTypesSelected', this, {docIdType:docIdTypes});
			},
			scope: this
		});
	},
	
	addKwicsToTree: function(kwics) {
		var root = this.getRootNode();
		var kwic, type, doc, docId, text, tokenId;
		var kwicsForEvent = [];
		for (var i = 0; i < kwics.length; i++) {
			kwic = kwics[i];
			docId = kwic['@docId'];
			type = kwic['@middle'];
			text = kwic['@left'] + ' <span class="dtc-kwic-highlight">' + type + '</span> ' + kwic['@right'];
			tokenId = kwic['@tokenId'];
			
			kwicsForEvent.push({docId: docId, tokenId: tokenId, type: 'kwic'});
			
			doc = root.findChild('docId', docId);
			doc.appendChild({
				text: text,
				leaf: true,
				cls: 'kwic child',
				editable: false,
				draggable: false,
				tokenId: tokenId,
				kwicData: type,
				docId: docId,
				dtcType: 'kwic',
				listeners: {
					click: function(node, event) {
						var data = {
							tokenId: node.getData().tokenId,
							docId: node.getData().docId,
							docIdType: node.getData().docId+':'+node.getData().kwicData
						};
						this.getApplication().dispatchEvent('tokenSelected', this, data);
					},
					scope: this
				}
			});
//			doc.ui.addClass('hasChildren');
			doc.expand();
		}
		
		this.getApplication().dispatchEvent('tocUpdated', this, kwicsForEvent);
		Ext.defer(this.updateDocModelOutline, 500, this);
	},
	
	addTagsToTree: function(tags, subtype) {
		if (tags.length > 0) {
			var docsToExpand = [];
			
			var root = this.getRootNode();
			
//			var docId = tags[0].docId;
//			var doc = root.findChild('docId', docId);
//			// collapse so we're not doing excess rendering
//			doc.collapse();
			
			if (subtype != null) {
				// TODO get identifier working with subtype
				var subtypeNode = doc.findChild('subtype', subtype);
				if (subtypeNode == null) {
					subtypeNode = doc.appendChild({
						text: '<span class="dtc-tag-highlight">'+tags[0].label+'</span> '+subtype.replace(/_/g, ' ')+' ('+tags.length+')',
						subtype: subtype,
						dtcType: 'tag',
						cls: 'tag child',
						docId: docId,
						editable: false,
						draggable: false,
						leaf: false,
						listeners: {
							click: function(node, event) {
								node.toggle();
							}
						}
					});
				}
			}
			
			var tag;
			for (var i = 0; i < tags.length; i++) {
				tag = tags[i];
				
				var docId = tag.docId;
				var doc = root.findChild('docId', docId);
				doc.collapse();
				if (docsToExpand.indexOf(doc) === -1) {
					docsToExpand.push(doc);
				}
				
				var text = tag.text || '';
				var nodeText = '';
				if (tag.subtype == null) {
					nodeText = '<span class="dtc-tag-highlight">'+tag.label+'</span><br/>';
				}
				if (tag.prevText) {
					nodeText += tag.prevText+'<span class="dtc-tag-highlight">'+text+'</span>'+tag.nextText;
				} else {
					nodeText += text;
				}
				
				var nodeConfig = {
					text: nodeText,
					cls: 'tag'+(tag.subtype == null ? ' child' : ' subtype child'),
					leaf: true,
					editable: false,
					draggable: false,
					identifier: tag.identifier,
					docId: tag.docId,
					tokenId: tag.tokenId,
					dtcType: 'tag',
					tagData: tag
				};
				
				if (subtypeNode) {
					subtypeNode.appendChild(nodeConfig);
				} else {
					doc.appendChild(nodeConfig);
				}
			}
			
			for (var i = 0; i < docsToExpand.length; i++) {
				docsToExpand[i].expand();
			}
			
//			doc.ui.addClass('hasChildren');
//			doc.expand();
			
//			if (subtypeNode) {
//				subtypeNode.expand();
//			}
			Ext.defer(this.updateDocModelOutline, 500, this);
		}
	},
	
	addIndexesToTree: function(indexes) {
		var root = this.getRootNode();
		var index, doc;
		for (var i = 0; i < indexes.length; i++) {
			index = indexes[i];
			
			var text = index.text || '';
			if (index.prevText) {
				text = '<span class="dtc-index-highlight">'+index.label+'</span><br/>'+index.prevText+'<span class="dtc-index-highlight">'+text+'</span>'+index.nextText;
			} else {
				text = '<span class="dtc-index-highlight">'+index.label+'</span><br/>'+text;
			}
			
			doc = root.findChild('docId', index.docId);
			doc.appendChild({
				text: text,
				cls: 'index child',
				leaf: true,
				editable: false,
				draggable: false,
				tokenId: index.tokenId,
				docId: index.docId,
				dtcType: 'index',
				indexData: index
			});
//			doc.ui.addClass('hasChildren');
			doc.expand();
		}
		
		Ext.defer(this.updateDocModelOutline, 500, this);
	},
	
	addTypesToTree: function(types) {
		var root = this.getRootNode();
		var type, doc, docId, word;
		var clearedDocs = {};
		for (var i = 0; i < types.length; i++) {
			type = types[i];
			docId = type['@docId'];
			word = type['@type'];
			doc = root.findChild('docId', docId);
			if (clearedDocs[docId] == null) {
				doc.removeAll(true);
//				doc.ui.removeClass('hasChildren');
				clearedDocs[docId] = true;
			}
			var tokenId;
			for (var j = 0; j < type.tokenIds['int-array'].length; j++) {
				tokenId = type.tokenIds['int-array'][j];
				doc.appendChild({
					text: word,
					leaf: true,
					editable: false,
					draggable: false,
					tokenId: tokenId,
					typeData: word,
					dtcType: 'type',
					docId: docId,
					listeners: {
						click: function(node, event) {
							var data = {
								tokenId: node.getData().tokenId,
								docId: node.getData().docId,
								docIdType: node.getData().docId+':'+node.getData().typeData
							};
							this.getApplication().dispatchEvent('tokenSelected', this, data);
						},
						scope: this
					}
				});
			}
//			doc.ui.addClass('hasChildren');
			doc.expand();
		}
		Ext.getCmp('dtcMarkup').showHitsForTags();
	},
	
	addXPathToTree: function(docId, xpath) {
		var result = Ext.getCmp('dtcReader').getResultsForXPath(docId, xpath);
		if (result) {
			if (result.resultType == XPathResult.UNORDERED_NODE_ITERATOR_TYPE) {
				var root = this.getRootNode();
				var doc = root.findChild('docId', docId);
//				doc.ui.removeClass('hasChildren');
				doc.removeAll(true);
				var tag = result.iterateNext();
				if (tag == null) {
					Ext.MessageBox.show({
						buttons: Ext.Msg.OK,
						icon: Ext.Msg.INFO,
						width: 300,
						height: 150,
						title: 'Info',
						msg: 'There were no matches for the supplied XPath.'
					});
					return;
				}
				while (tag) {
					var tokens = Ext.DomQuery.jsSelect('span[tokenid]', tag);
					var length = Math.min(tokens.length, 14);
					var text = '<span class="dtc-highlight">'+tag.nodeName+'</span>';
					for (var i = 0; i < length; i++) {
						text += ' '+tokens[i].textContent;
					}
					doc.appendChild({
						text: text,
						leaf: true,
						expandable: false,
						editable: false,
						draggable: false,
						tokenId: tag.getAttribute('tokenid'),
						docId: docId,
						dtcType: 'xpath',
						listeners: {
							click: function(node, event) {
								var data = {
									xpath: "//span[@tokenid='"+node.getData().tokenId+"']",
									docId: node.getData().docId
								};
								this.getApplication().dispatchEvent('tagSelected', this, data);
							},
							scope: this
						}
					});
					tag = result.iterateNext();
				}
//				doc.ui.addClass('hasChildren');
				doc.expand();
			} else {
				
			}
			Ext.getCmp('dtcMarkup').showHitsForTags();
		}
	},
	
	clearTree: function() {
		var root = this.getRootNode();
		root.eachChild(function(node) {
//			node.ui.removeClass('hasChildren');
			node.removeAll();
			node.collapse();
		});
	},
	
	removeNodes: function(type, idsToKeep) {
		function doTest(r) {
			if (r.get('dtcType') === type && idsToKeep[r.getData().identifier] !== true) {
				nodesToRemove.push(r);
			}
		}
		
		idsToKeep = idsToKeep === undefined ? {} : idsToKeep;
		
		var store = this.getStore();
		var nodesToRemove = [];
		store.each(doTest);
		
		if (nodesToRemove.length > 0) {
			this.unbindStore();
			for (var i = 0; i < nodesToRemove.length; i++) {
				var node = nodesToRemove[i];
				node.erase();
			}
			this.bindStore(store);
		}
	},
	
	editNodeLabel: function(node) {
		if (node.getData().editable != false) {
			this.treeEditor.startEdit(node.ui.textNode);
		}
	},
	
	getChildrenForDocument: function(docId) {
		var children = [];
		var root = this.getRootNode();
		var docChild = root.findChild('docId', docId);
		if (docChild) {
			var childNodes = docChild.childNodes;
			for (var i = 0, len = childNodes.length; i < len; i++) {
				children.push(childNodes[i].getData());
			}
		}
		return children;
	},
	
	updateDocModelOutline: function() {
//		Ext.getCmp('dtcDocModel').setOutlineDimensions(this.getTokenRange());
	}
});