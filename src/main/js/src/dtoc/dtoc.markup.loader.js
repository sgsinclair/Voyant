// all the tag loading and parsing logic happens here
// makes use of getCorpus(), getApplicationi(), MarkupBase.savedTags, MarkupBase.curatedTags
Ext.define('Voyant.panel.DToC.MarkupLoader', {
	
	TAG_SNIPPET_WORD_LENGTH: 10,
	ignoredPrefixes: ['rdf','cw'], // ignore tags with these prefixes (cw used by cwrc-writer docs) 
	
	doLoadAllTags: function() {
		var dfd = new Ext.Deferred();
		
		var currDocIndex = 0;
		var me = this;
		function doLoad(index) {
			if (index < me.getCorpus().getDocumentsCount()) {
				currDocIndex++;
				var doc = me.getCorpus().getDocument(index);
				// check to see if this doc was specified as the index (via the cwrc interface)
				if (doc.get('extra.isDtocIndex') === 'true') {
					doLoad(currDocIndex);
				} else {
					var id = doc.getId();
					me._doLoadTags(id, function() {
						dfd.update(id);
						doLoad(currDocIndex);
					});
				}
			} else {
				dfd.resolve();
				me._storeTags();
			}
		}
		
		if (this.curatedTags != null) {
			var curId = this.getApplication().getApiParam('curatorId');
			if (curId !== undefined) {
				this.getApplication().getStoredResource('curatedtags-'+curId+'-'+this.getCorpus().getId()).then(function(value) {
					this.savedTags = value;
					dfd.resolve();
				}, function() {
					doLoad(currDocIndex);
				}, null, this);
			} else {
				doLoad(currDocIndex);
			}
		} else {
			this.getApplication().getStoredResource('tags-'+this.getCorpus().getId()).then(function(value) {
				this.savedTags = value;
				dfd.resolve();
			}, function() {
				doLoad(currDocIndex);
			}, null, this);
		}
		
		return dfd;
	},
	
	_doLoadTags: function(docId, callback) {
		Ext.Ajax.request({
			url: this.getTromboneUrl(),
			params: {
				tool: 'corpus.DocumentTokens',
				corpus: this.getCorpus().getId(),
				docId: docId,
				template: 'docTokens2textPlusTokenIds',
				outputFormat: 'xml',
				limit: 0
			}
        }).then(function(response) {
        	var xml = response.responseXML;
        	if (xml != null) {
            	var tagData = this._parseTags(xml, docId, this.curatedTags);
            	this.savedTags[docId] = tagData;
        	} else {
        	    if (window.console) {
        	        console.warn('error loading xml for: '+docId);
        	    }
        	}
        	
			if (callback) callback();
        }, null, null, this);
	},
	
	_storeTags: function() {
		var rId = this.getCorpus().getId();
		if (this.curatedTags != null) {
			var cId = this.getApplication().getApiParam('curatorId');
			if (cId === undefined) return;
			rId = 'curatedtags-'+cId+'-'+rId;
		} else {
			rId = 'tags-'+rId;
		}
		
		this.getApplication().storeResource(rId, this.savedTags);
	},
	
	/**
	 * Parses the tags in an xml document and gathers metadata.
	 * @param {Document} xml The xml document.
	 * @param {String} docId The id for the document.
	 * @param {Object} [customTagSet] An object containing a set of tags to look for, in the same format as curatedTags
	 * @returns {Object} The tag metadata.
	 */
	_parseTags: function(xml, docId, customTagSet) {
		var docBody = xml.documentElement;
		
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
				
				if (this.ignoredPrefixes.indexOf(tag.prefix) !== -1) continue;
				
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
				returnData = produceTagData.call(this, tags);
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
						Ext.apply(returnData, produceTagData.call(this, results, cTag.label));
					}
				}
			}
			
			// process header
			var head = docBody.querySelectorAll('head').item(0);
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
				            console.warn('bad ID', id);
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
				console.warn('parse error');
			}
			return {};
		}
	}
	
});