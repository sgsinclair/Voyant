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
        	stopList: 'auto',
        	docId: undefined
        }
    },
    
    initialized: false,
	xpathWin: null,
	isCurator: false,
	internalSelection: false,
	titlesMode: null,
	FULL_TITLES: 0,
	MIN_TITLES: 1,
	
	toolTipConfig: {
		cls: 'dtcReaderNote',
		showDelay: 250,
		hideDelay: 0,
		constrainPosition: true,
		border: false,
		shadow: false,
		padding: 5,
		maxWidth: 400
	},
    
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
			cls: 'dtc-panel',
			bodyCls: 'dtc-tree',
			useArrows: true,
			lines: false,
			rootVisible: false,
			hideHeaders: true,
			scrollable: 'y',
			viewConfig: {
				scrollable: 'y',
				listeners: {
					select: function(view, record, index, opts) {
						if (!this.internalSelection) {
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
								case 'kwic':
									var data = {
										tokenId: data.tokenId,
										docId: data.docId,
										docIdType: data.docId+':'+data.kwicData
									};
									this.getApplication().dispatchEvent('tokenSelected', this, data);
								}
				    		}
						}
					},
					scope: this
				}
			},
		    store: treeStore,
		    tools: null,
			tbar: {
		    	cls: 'dtc-toolbar',
		    	hideBorders: true,
		    	items: [{
		    		xtype: 'querysearchfield',
		    		itemId: 'search',
		    		grow: false,
		    		width: '100%',
//		    		emptyText: "Word Search",
//		    		maxWidth: 155,
		    		triggers: undefined
		    	}]
		    },
		    listeners: {}
		};
		if (config.doInit) {
			treeConfig.listeners.afterrender = {
	    		fn: function() {
	    			this.setCorpus(this.getApplication().getCorpus());
	    			if (this.isCurator) {
	    				this.getApplication().addOrigIndexField();
	    			}
	    			this.initToc(config.initData);
	    		},
	    		scope: this,
	    		single: true
	    	};
		}
		
		if (this.isCurator) {
			treeConfig.plugins = {
		        ptype: 'cellediting',
		        clicksToEdit: 2
		    },
			treeConfig.viewConfig.plugins = {
				ptype: 'treeviewdragdrop',
				enableDrag: true,
				enableDrop: true,
				containerScroll: true
			};
			treeConfig.columns = {
				items: {
					dataIndex: 'text',
					flex: 1,
					editor: {
						xtype: 'textfield',
						allowBlank: false,
						selectOnFocus: true
					}
				}
			};
			treeConfig.listeners.beforeedit = function(ed, context) {
				return context.record.get('editable');
			};
			treeConfig.listeners.edit = {
				fn: function(ed, context) {
					var docId = context.record.get('docId');
					var record = this.getCorpus().getDocument(docId);
					record.set('title', context.value);
				},
				scope: this
			};
			
			treeConfig.viewConfig.listeners.beforedrop = function(targetNode, dragData, overModel, dropPosition, dropHandlers, event) {
				if ((dragData.records[0].getData().isDoc && dropPosition === 'append') || !overModel.getData().isDoc) return false;
			};
			treeConfig.viewConfig.listeners.drop = {
				fn: function(node, data, overModel, dropPosition) {
					var children = this.getRootNode().childNodes;
					var corpus = this.getCorpus();
					for (var i = 0; i < children.length; i++) {
						var child = children[i];
						child.set('docIndex', i);
						var doc = corpus.getDocument(child.getData().docId);
						doc.set('index', i);
					}
					
					corpus.getDocuments().setRemoteSort(false);
					corpus.getDocuments().sort('index', 'ASC');
					corpus.getDocuments().setRemoteSort(true);
					
					Ext.getCmp('dtcDocModel').buildProspect();
				},
				scope: this
			};
//			treeConfig.listeners.beforeitemdblclick = {
//				fn: function(node, evt) {
//					return false; // cancel node expand/contract, edit will still happen however
//				},
//				scope: this
//			};
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
		loadedCorpus: function(src, corpus) {
			this.setCorpus(corpus);
			this.initToc();
		},
		corpusDocumentSelected: function(src, data) {
			if (src != this) {
				var docId = data.docId == null ? this.getCorpus().getDocument(data.docIndex).getId() : data.docId;
				var match = this.getStore().query('docId', docId).first();
				if (match) {
					this.internalSelection = true;
					this.setSelection(match);
					this.internalSelection = false;
				}
			}
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
		},
		corpusTermsClicked: function(src, terms) {
			var query = [];
			terms.forEach(function(term) {
				query.push(term.get("term"));
			});
			if (query.length === 0) {
				this.removeNodes('kwic');
			} else {
				this.getKwics({query: query});
			}
		},
		documentTermsClicked: function(src, terms) {
			var query = [];
			terms.forEach(function(term) {
				query.push(term.get("term"));
			});
			if (query.length === 0) {
				this.removeNodes('kwic');
			} else {
				this.getKwics({query: query, docIndex: terms[0].get('docIndex')});
			}
		},
		query: function(src, query) {
			if (query == '') {
				this.removeNodes('kwic');
			} else {
				this.getKwics({query: query});
			}
		}

	},
    
    initToc: function(data, forceInit) {
		if (!this.initialized || forceInit === true) {
			if (data) {
				var root = this.getRootNode();
				root.removeAll();
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
		for (var i = 0, len = this.getCorpus().getDocumentsCount(); i < len; i++) {
    		var doc = docs.getAt(i);
    		var docNode, title, author;
			if (this.titlesMode == this.MIN_TITLES) {
				title = doc.getShortTitle().normalize();
				title = title.slice(0, title.length-1);
			} else {
				title = doc.getTitle().normalize();
			}
			if (!this.isCurator) {
				author = doc.getAuthor();
				if (author !== undefined && author !== '') {
				    title += '<br/><span class="author">'+author+'</span>';
				}
			}
			if (modifyCurrent) {
				docNode = root.findChild('docId', doc.getId());
				if (docNode) {
					docNode.set('text', title);
				}
			} else {
				docNode = root.appendChild(this.createChapterTreeNode(title, doc));
			}
			
			if (docNode.getData().toolTip == null) {
				this._createToolTipForChapterNode(docNode);
			} else {
				if (this.titlesMode == this.MIN_TITLES) {
					docNode.getData().toolTip.enable();
				} else {
					docNode.getData().toolTip.disable();
				}
			}
		}
	},
	
	createChapterTreeNode: function(title, doc) {
		var data = {
			text: title,
			expandable: true,
			editable: true,
			leaf: true,
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
				var nodeEl = this.getView().getNode(docNode);
				// TODO destroy tooltip when treenode is removed
				var tip = Ext.create('Ext.ToolTip', Ext.apply(this.toolTipConfig, {
					target: nodeEl,
					title: '',
					listeners: {
						show: function(tt) {
							tt.update('<span class="title">'+doc.getTitle()+'</span>'+
									'<br/><span class="author">'+doc.getAuthor()+'</span>');
						},
						scope: this
					}
				}));
				docNode.set('toolTip', tip);
				
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

	getKwics: function(config) {
		var params = {
			tool: 'corpus.DocumentContexts',
			context: 6,
//			limit: 50,
			stripTags: 'all',
			simpleSortMode: true,
			sortBy: 'position',
			sortDirection: 'ASC', // TODO sort direction not implemented on server
			corpus: this.getCorpus().getId()
		};
		Ext.apply(params, config);
		Ext.Ajax.request({
			url: this.getTromboneUrl(),
			params: params,
			success: function(response, options) {
				this.removeNodes('kwic');
				var result = Ext.decode(response.responseText);
				var contexts = result.documentContexts.contexts;
				contexts.sort(function(a,b) {
					var result = a.docIndex - b.docIndex;
					if (result === 0) {
						result = a.position - b.position;
					}
					return result;
				});
				this.addKwicsToTree(contexts);
				
//				this.getApplication().dispatchEvent('documentTypesSelected', this, {docIdType:docIdTypes});
			},
			scope: this
		});
	},
	
	addKwicsToTree: function(kwics) {
		if (kwics.length > 0) {
			var firstChild;
			
			var docsToExpand = [];
			
			var root = this.getRootNode();
			var kwic, type, doc, docIndex, docId, text, tokenId;
			var kwicsForEvent = [];
			for (var i = 0; i < kwics.length; i++) {
				kwic = kwics[i];
				docIndex = kwic.docIndex;
				docId = this.getCorpus().getDocument(docIndex).getId();
				doc = root.findChild('docId', docId);
				if (doc != null) {
					type = kwic.middle;
					text = kwic.left + ' <span class="dtc-kwic-highlight">' + type + '</span> ' + kwic.right;
					
					tokenId = 'word_'+docIndex+'.'+kwic.position;
					
					kwicsForEvent.push({docId: docId, tokenId: tokenId, type: 'kwic'});
					
					doc.collapse();
					if (docsToExpand.indexOf(doc) === -1) {
						docsToExpand.push(doc);
					}
					
					var child = doc.appendChild({
						text: text,
						leaf: true,
						cls: 'kwic child',
						editable: false,
						draggable: false,
						tokenId: tokenId,
						kwicData: type,
						docId: docId,
						dtcType: 'kwic'
					});
					
					if (firstChild === undefined) {
						firstChild = child;
					}
				}
			}
			
			for (var i = 0; i < docsToExpand.length; i++) {
				docsToExpand[i].expand();
			}
			
			if (firstChild !== undefined) {
				this.setSelection(this.getStore().findRecord('id', firstChild.id));
			}
			
			this.getApplication().dispatchEvent('tocUpdated', this, kwicsForEvent);
			Ext.defer(this.updateDocModelOutline, 500, this);
		}
	},
	
	addTagsToTree: function(tags, subtype) {
		if (tags.length > 0) {
			var firstChild;
			
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
				if (doc != null) {
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
						var child = doc.appendChild(nodeConfig);
						if (firstChild === undefined) {
							firstChild = child;
						}
					}
				}
			}
			
			for (var i = 0; i < docsToExpand.length; i++) {
				docsToExpand[i].expand();
			}
			
			if (firstChild !== undefined) {
				this.setSelection(this.getStore().findRecord('id', firstChild.id));
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
		var firstChild;
		for (var i = 0; i < indexes.length; i++) {
			index = indexes[i];
			
			var text = index.text || '';
			if (index.prevText) {
				text = '<span class="dtc-index-highlight">'+index.label+'</span><br/>'+index.prevText+'<span class="dtc-index-highlight">'+text+'</span>'+index.nextText;
			} else {
				text = '<span class="dtc-index-highlight">'+index.label+'</span><br/>'+text;
			}
			
			doc = root.findChild('docId', index.docId);
			if (doc != null) {
				var child = doc.appendChild({
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
				if (firstChild === undefined) {
					firstChild = child;
				}
	//			doc.ui.addClass('hasChildren');
				doc.expand();
			}
		}
		
		if (firstChild !== undefined) {
			this.setSelection(this.getStore().findRecord('id', firstChild.id));
		}
		
		Ext.defer(this.updateDocModelOutline, 500, this);
	},
	
	addXPathToTree: function(docId, xpath) {
		var result = Ext.getCmp('dtcReader').getResultsForXPath(docId, xpath);
		if (result) {
			if (result.resultType == XPathResult.UNORDERED_NODE_ITERATOR_TYPE) {
				var firstChild;
				var root = this.getRootNode();
				var doc = root.findChild('docId', docId);
				if (doc != null) {
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
						var child = doc.appendChild({
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
						if (firstChild === undefined) {
							firstChild = child;
						}
						tag = result.iterateNext();
					}
	//				doc.ui.addClass('hasChildren');
					doc.expand();
				}
			} else {
				
			}
			
			if (firstChild !== undefined) {
				this.setSelection(this.getStore().findRecord('id', firstChild.id));
			}
			
			Ext.getCmp('dtcMarkup').showHitsForTags();
		}
	},
	
	clearTree: function() {
		var root = this.getRootNode();
		root.eachChild(function(node) {
			node.removeAll();
			node.collapse();
			node.set('leaf', true);
		});
		
		this.down('#search').setValue('');
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
			this.unbindStore(); // don't refresh while removing
			for (var i = 0; i < nodesToRemove.length; i++) {
				var node = nodesToRemove[i];
				node.erase();
			}
			this.bindStore(store);
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
	},
	
	/*
	isXPathValid: function(xpath) {
		try {
			var result = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
		} catch (e) {
			return false;
		}
		return true;
	},
	
	showXPathDialog: function(toolEl) {
		if (this.xpathWin == null) {
			this.xpathWin = Ext.create('Ext.window.Window', {
				modal: true,
				title: 'Add XPath',
				width: 300,
				layout: 'form',
				labelAlign: 'right',
				labelWidth: 75,
				items: [{
			    	xtype: 'textfield',
			    	itemId: 'xpath',
			    	fieldLabel: 'XPath'
				},{
					xtype: 'radiogroup',
					itemId: 'apply',
					fieldLabel: 'Add To',
					items: [{
						boxLabel: 'Current Doc',
						name: 'xpathApply',
						checked: true
					},{
						boxLabel: 'All Docs',
						name: 'xpathApply',
						checked: false,
						disabled: true
					}]
				}],
				buttons: [{
					text: 'Ok',
					handler: function() {
						var xpath = this.xpathWin.getComponent('xpath').getValue();
	    				var isValid = this.isXPathValid(xpath);
	    				if (!isValid) {
	    					Ext.MessageBox.show({
	    						buttons: Ext.Msg.OK,
	    						icon: Ext.Msg.ERROR,
	    						width: 300,
	    						height: 150,
	    						title: 'Error',
	    						msg: 'The supplied XPath is not valid.'
	    					});
	    				}
	    				var apply = this.xpathWin.getComponent('apply').getValue();
	    				if (apply.boxLabel == 'Current Doc') {
	    					var docId = Ext.getCmp('dtcReader').getCurrentDocId();
	    					this.addXPathToTree(docId, xpath);
	    				} else {
	    					
	    				}
						this.xpathWin.hide();
					},
					scope: this
				},{
					text: 'Cancel',
					handler: function() {
						this.xpathWin.hide();
					},
					scope: this
				}]
			});
		}
		this.xpathWin.show(toolEl);
	},*/
	
	exportDocNodes: function() {
		var datas = [];
		var children = this.getRootNode().childNodes;
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			var data = child.getData();
			datas.push({
				text: data.text,
				docId: data.docId
			});
		}
		
		return datas;
	}
	
});