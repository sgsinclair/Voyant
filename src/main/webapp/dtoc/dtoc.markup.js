Ext.define('Voyant.panel.DToC.MarkupBase', {
	TAG_SNIPPET_WORD_LENGTH: 10,
	
	savedTags: {}, // saved metadata for tags, organized by document 
	curatedTags: null, // curated tags list
	tagTotals: {}, // tracks tag freq counts for entire corpus
	
	loadAllTags: function() {
		if (this.getCorpus() !== undefined) {
			var currDocIndex = 0;
			
			var me = this;
			function doLoad(index) {
				if (index < me.getCorpus().getDocumentsCount()) {
					currDocIndex++;
					var id = me.getCorpus().getDocument(index).getId();
					me._doLoadTags(id, function() {
						me.updateTagTotals();
						doLoad(currDocIndex);
					});
				} else {
					me.updateTagTotals(true);
					me.getApplication().dispatchEvent('allTagsLoaded', me);
				}
			}
			
			doLoad(currDocIndex);
		} else {
			this.on('loadedCorpus', function(src, corpus) {
				this.setCorpus(corpus);
				this.loadAllTags();
			}, this, {single: true});
		}
	},
	
	_doLoadTags: function(docId, callback) {
		var me = this;
		this.getApplication().getStoredResource('tags-'+me.getCorpus().getId()+'-'+docId).then(function(value) {
	    	me._saveTags(value, docId);
	    	if (callback) callback();
		}, function() {
    		me._getDocumentXml(docId, function(xml) {
    			var tagData = me._parseTags(xml, docId, me.curatedTags);
    			me._saveTags(tagData, docId);
    			me._storeTags(tagData, docId);
    			if (callback) callback();
    		});
		});
	},
	
	updateTagTotals: function(updateSelections) {
//		var sm = this.getComponent('tags').getSelectionModel();
		var selectedTagRecords = [];
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
//				if (updateSelections && sm.isSelected(record)) {
//					selectedTagRecords.push(record);
//				}
			}
		}
		this.store.loadData(data, true);
		this.store.sort('label', 'ASC');
//		if (updateSelections && sm.grid) sm.selectRecords(selectedTagRecords);
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
    			jsonData.push(data);
			}
		}, this);
		return jsonData;
	},
	
	_saveTags: function(data, docId) {
		this.savedTags[docId] = data;

		// add tag freqs to totals
		for (var tagName in data) {
			var tagData = data[tagName];
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
		
		if (this.getApplication().useIndex) {
			this._updateProgress(docId);
		}
	},
	
	_storeTags: function(tags, docId) {
		var rId = 'tags-'+this.getCorpus().getId()+'-'+docId;
		this.getApplication().storeResource(rId, tags);
	},
	
	_updateProgress: function(docId) {
		var dtcIndex = Ext.getCmp('dtcIndex');
	    var totalDocs = this.getCorpus().getDocumentsCount();
	    var docIndex = this.getCorpus().getDocument(docId).getIndex();
	    var progress = docIndex / totalDocs;
	    dtcIndex.updateIndexProgress(progress);
	},
	
	showHitsForTags: Ext.emptyFn, // need to override this
	
	clearSelections: function() {
		this.getSelectionModel().deselectAll(true);
	},
	
	_getDocumentXml: function(docId, callback) {
		var params = {
			tool: 'corpus.DocumentTokens',
			corpus: this.getCorpus().getId(),
			docId: docId,
			template: 'docTokensPlusStructure2html',
			outputFormat: 'xml',
			limit: 0
		};
		Ext.Ajax.request({
           url: this.getTromboneUrl(),
           params: params,
           success: function(response, options) {
				if (callback) callback(response.responseXML);
           },
           scope: this
        });
	},
	
	/**
	 * Parses the tags in an xml document and gathers metadata.
	 * @param {Document} xml The xml document.
	 * @param {String} docId The id for the document.
	 * @param {Object} [customTagSet] An object containing a set of tags to look for, in the same format as curatedTags
	 * @returns The tag metadata.
	 */
	_parseTags: function(xml, docId, customTagSet) {
		var docBody = Ext.DomQuery.jsSelect('div[class="document"]', xml)[0];
		
		var shortRe = new RegExp('(([^\\s]+\\s\\s*){'+this.TAG_SNIPPET_WORD_LENGTH+'})(.*)'); // get first X words
		var prevRe = new RegExp('(.*)(\\s([^\\s]+\\s\\s*){'+Math.floor(this.TAG_SNIPPET_WORD_LENGTH/2)+'})'); // get last X words
		var nextRe = new RegExp('(([^\\s]+\\s\\s*){'+Math.floor(this.TAG_SNIPPET_WORD_LENGTH/2)+'})(.*)');
		
		function getText(tag) {
			var text = tag.textContent;
			text = text.replace(/\s+/g, ' '); // consolidate whitespace
			var shortText = text.replace(shortRe, "$1");
			return {content: shortText, shortened: shortText.length < text.length};
		}
		
		function getSurroundingText(tag) {
			function doGet(currTag, dir, currText) {
				var walker = currTag.ownerDocument.createTreeWalker(currTag.ownerDocument, NodeFilter.SHOW_TEXT, null, false);
				walker.currentNode = currTag;
				if (dir === 'prev') {
					walker.previousNode();
				} else {
					walker.nextNode();
				}
				var node = walker.currentNode;
				if (node != null) {
					var text = node.textContent;
					if (dir === 'prev') {
						currText = text + currText;
					} else {
						currText += text;
					}
					if (currText.length > 30) return currText;
					else return doGet(node, dir, currText);
				} else {
					return currText;
				}
			}
			
			var prevText = doGet(tag, 'prev', '');
			var match = prevText.match(prevRe);
			if (match != null) {
				prevText = match[2];
			}
			var walker = tag.ownerDocument.createTreeWalker(tag.ownerDocument, NodeFilter.SHOW_ALL, null, false);
			walker.currentNode = tag;
			walker.nextSibling();
			tag = walker.currentNode;
			var currText = '';
			if (tag.nodeType === Node.TEXT_NODE) {
				currText = tag.textContent;
			}
			var nextText = doGet(tag, 'next', currText);
			match = nextText.match(nextRe);
			if (match != null) {
				nextText = match[1];
			}
			
			return [prevText, nextText];
		}
		
		function getXPathResults(xpath) {
			try {
//				var result = xml.evaluate(xpath, docBody, null, XPathResult.ANY_TYPE, null);
				var result = Ext.DomQuery.jsSelect(xpath, xml);
				return result;
			} catch(e) {
				return [];
			}
		}
		
		function produceTagData(tags, label) {
			var data = {};
			var tag, nodeName, tokenId, dataObj, text, surrText;
			for (var i = 0; i < tags.length; i++) {
				tag = tags[i];
				nodeName = tag.nodeName;
				tokenId = tag.getAttribute('tokenid');
				if (tokenId == null) {
					// empty tags lack tokenid attribute
				} else {
					dataObj = {
						docId: docId,
						tagName: nodeName,
						label: label || nodeName,
						tokenId: tokenId,
						subtype: tag.getAttribute('subtype'),
						type: 't'
					};
					
					text = getText(tag);
					dataObj.text = text.content;
					
					if (text.shortened == false) {
						surrText = getSurroundingText(tag);
						dataObj.prevText = surrText[0];
						dataObj.nextText = surrText[1];
					} else {
						dataObj.text += '&hellip;';
					}
					
					// FIXME temp fix, title not allowed outside of head in html
					// see similar fix in docTokensPlusStructure2html.xsl
					if (nodeName == 'title') {
						dataObj.tagName = 'xmlTitle';
					} else if (nodeName == 'head') {
	                    dataObj.tagName = 'xmlHead';
	                }
					
					if (data[nodeName] == null) {
						data[nodeName] = [dataObj];
					} else {
						data[nodeName].push(dataObj);
					}
				}
			}

			return data;
		}
		
		if (docBody != null) {
		
			var returnData = {};
			if (customTagSet == null) {
				// no curation so parse all tags
				var tags = Ext.DomQuery.jsSelect('*', docBody);
				returnData = produceTagData(tags);
			} else {
				// find hits for curated tags only
				for (var tag in customTagSet) {
					var cTag = customTagSet[tag];
					if (cTag.type == 'x') {
						var data = {};
						var xpath = cTag.tagName;
						var results = getXPathResults(xpath);
						if (results.length > 0) {
							data[xpath] = [];
							var el, dataObj, text, surrText;
							for (var i = 0; i < results.length; i++) {
								var el = results[i];
								dataObj = {
									docId: docId,
									tagName: xpath,
									label: cTag.label,
									tokenId: el.getAttribute('tokenid'),
									subtype: el.getAttribute('subtype'),
									type: 'x'
								};
								
								text = getText(el);
								dataObj.text = text.content;
								
								if (text.shortened == false) {
									surrText = getSurroundingText(el);
									dataObj.prevText = surrText[0];
									dataObj.nextText = surrText[1];
								} else {
									dataObj.text += '&hellip;';
								}
								data[xpath].push(dataObj);
							}
						}
						Ext.apply(returnData, data);
					} else {
						var results = Ext.DomQuery.jsSelect(cTag.tagName, docBody);
						Ext.apply(returnData, produceTagData(results, cTag.label));
					}
				}
			}
			
			// process header
			var head = docBody.querySelectorAll('xmlHead').item(0);
			if (head) {
			    // special handling for TEI docs
				// TODO save in stored resource
				var authors = head.querySelectorAll('author');
				if (authors.length > 0) {
	    			var authorsArray = [];
	    			for (var i = 0; i < authors.length; i++) {
	    				var author = authors.item(i);
	    				var authorObj = {};
	    				var updateAuthor = false;
	    				
	    				var forename = author.getElementsByTagName('forename').item(0);
	    				var surname = author.getElementsByTagName('surname').item(0);
	    				if (forename !== null) {
	    				    authorObj.forename = forename.textContent;
	    				    updateAuthor = true;
	    				}
	    				if (surname !== null) {
	    				    authorObj.surname = surname.textContent;
	    				    updateAuthor = true;
	    				}
	    				
	    				if (updateAuthor) {
	    				    authorsArray.push(authorObj);
	    				}
	    			}
	    			if (authorsArray.length > 0) {
	    			    this.getCorpus().getDocument(docId).record.set('author', authorsArray);
	    			}
				}
				
				var reader = Ext.getCmp('dtcReader');
				if (reader.currentDocId == docId) {
					reader.setReaderTitle();
				}
			}
			
			if (this.getApplication().useIndex) {
				// find index items
				var dtcIndex = Ext.getCmp('dtcIndex');
				var indexIds = dtcIndex.indexIds;
				var idsToKeep = [];
				for (var id in indexIds) {
				    var hit;
				    if (id.indexOf('ie') == 0) {
				    	// cross reference
				    }
				    try {
				    	if (Ext.isIE) {
				            var result = document.evaluate('//*["'+id+'"=@*[local-name()="id"]]', docBody,
			                    function(prefix){
			                        return {
			                            xml: "http://www.w3.org/XML/1998/namespace"
			                        }[prefix] || null;
			                    },
			                    XPathResult.FIRST_ORDERED_NODE_TYPE
			                );
				            hit = result.singleNodeValue;
				        } else {
				            hit = docBody.querySelectorAll('*[*|id="'+id+'"]').item(0);
				        }
				    } catch (e) {
				        if (window.console) {
				            console.log('bad ID', id);
				        }
				    }
					if (hit) {
						idsToKeep.push(id);
						indexIds[id] = {
							tokenId: hit.getAttribute('tokenid'),
							tag: hit.nodeName,
							docId: docId
						};
						
						var text = getText(hit);
						indexIds[id].text = text.content;
						
						if (text.shortened == false) {
							surrText = getSurroundingText(hit);
							indexIds[id].prevText = surrText[0];
							indexIds[id].nextText = surrText[1];
						} else {
							indexIds[id].text += '&hellip;';
						}
					}
				}
				dtcIndex.filterIndex(idsToKeep);
			}
			
			return returnData;
		} else {
			if (window.console) {
				console.log('parse error');
			}
			return {};
		}
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
				{name: 'type'}
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
	    var menu = this.down('#markupChapterFilter').getMenu();
	    menu.removeAll();
	    
	    var docs = this.getCorpus().getDocuments();
		for (var i = 0, len = this.getCorpus().getDocumentsCount(); i < len; i++) {
    		var doc = docs.getAt(i);
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
		
		if (docId === null || docId === this.currentChapterFilter) {
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
		afterrender: function(container) {
				
		},
		loadedCorpus: function(src, corpus) {
			this.setCorpus(corpus);
//			this.getTokensStore().setCorpus(corpus);
//			this.getTokensStore().load();
			
			this.updateChapterFilter();
			
			if (this.getApplication().useIndex != true) {
				this.loadAllTags();
			}
		},
		indexProcessed: function() {
			this.loadAllTags();
		},
		chapterFilterSelected: function(src, docId) {
			this.doChapterFilter(docId, false);
		}
	}
});