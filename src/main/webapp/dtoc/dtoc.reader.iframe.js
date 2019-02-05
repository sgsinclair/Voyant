Ext.define('Voyant.panel.DToC.Reader', {
	extend: 'Ext.panel.Panel',
	requires: ['Ext.ux.IFrame'],
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.dtocReader',
    config: {
    	corpus: undefined
    },
    statics: {
        api: {
        	docId: undefined
        }
    },
    
    toolTipConfig: {
		cls: 'dtcReaderNote',
		showDelay: 50,
		hideDelay: 200,
		draggable: true,
		constrainPosition: true,
		border: false,
		shadow: false,
		padding: 5,
		maxWidth: 400,
		maxHeight: 420,
		scrollable: 'y'
	},
    
    MINIMUM_LIMIT: 1000,
	
	currentDocId: null,
	currentDocLanguage: null,

	linkSelectors: [],
	imageSelectors: [],
	noteSelectors: [],

	loading: false,
	readerContainer: null,
	prevButton: null,
	nextButton: null,
	tokenToolTipsMap: {},
    
    constructor: function(config) {
    	
    	Ext.applyIf(config, {
    		cls: 'dtc-panel',
			height: '100%',
			layout: 'fit',
			items: [{
				id: 'dtcReaderContainer',
				xtype: 'uxiframe'
			}]
		});
    	
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
    	this.addListener('afterrender', function(panel) {
			this.readerContainer = Ext.getCmp('dtcReaderContainer');
			
			// var buttonContainer = Ext.get('dtcReaderButtons');
			
			// this.prevButton = new Ext.Button({
			// 	text: 'Previous Chapter',
			// 	scale: 'medium',
			// 	cls: 'dtc-button',
			// 	style: 'display: inline-block; margin-right: 5px;',
			// 	hidden: true,
			// 	renderTo: buttonContainer,
			// 	handler: this.fetchPreviousDocument,
			// 	scope: this
			// });
			
			
			// this.nextButton = new Ext.Button({
			// 	text: 'Next Chapter',
			// 	scale: 'medium',
			// 	cls: 'dtc-button',
			// 	style: 'display: inline-block; margin-left: 5px;',
			// 	hidden: true,
			// 	renderTo: buttonContainer,
			// 	handler: this.fetchNextDocument,
			// 	scope: this
			// });
            
		}, this);
		
		this.addListener('afterlayout', function(panel, layout) {
			this.resizeReaderComponents();
		}, this);
		
		this.addListener('corpusDocumentSelected', function(src, data) {
			this.fetchDocument(data);
		}, this);
		
		this._doScrollTo = function(src, data, animate) {
			if (this.currentDocId != data.docId) {
				this.setApiParams({docId: data.docId, start: 0});
				
				this.fetchText(function() {
					var dom = this.readerContainer.getBody();
					var scrollTop = data.amount * dom.scrollHeight - (dom.clientHeight * 0.5);
					Ext.fly(this.readerContainer.getBody()).scrollTo('top', scrollTop, animate);
				});
			} else {
				var dom = this.readerContainer.getBody();
				var scrollTop = data.amount * dom.scrollHeight - (dom.clientHeight * 0.5);
				Ext.fly(this.readerContainer.getBody()).scrollTo('top', scrollTop, animate);
			}
		};
		this.addListener('dtcDocModelClick', function(src, data) {
			this._doScrollTo(src, data, true);
		}, this);
		this.addListener('dtcDocModelScroll', function(src, data) {
			this._doScrollTo(src, data, null);
		}, this);
		
		/**
		 * @event TokensResultLoaded
		 * @type listener
		 */
		this.addListener('TokensResultLoaded', function(src, data) {
			var content = "";
			var docs = data.tokens.documents;
			var toks, category;
			for (var i=0;i<docs.length;i++) {
				toks = docs[i].tokens;
				for (var j=0;j<toks.length;j++) {
					category = toks[j]['@category'];
					if (category.indexOf("TAG")>-1) {
						if (toks[j]['@newline']) {
							content+='<br />';
						}
					}
					else {content+=toks[j]['@token'];}
				}
			}
			var el = this.body.last();
			el.update(content);
		}, this);
		
		/**
		 * @event tokenSelected
		 * @type listener
		 */
		this.addListener('tokenSelected', function(src, data) {
			if (this.currentDocId != data.docId) {
				this.setApiParams({docId: data.docId});
				this.fetchText(function() {
					this.scrollToToken(data.tokenId);
				});
			} else {
				this.scrollToToken(data.tokenId);
			}
		}, this);
		
		this.addListener('tagSelected', function(src, data) {
			if (data.docId != this.currentDocId) {
				this.setApiParams({docId: data.docId});
				this.fetchText(function() {
					this.scrollToToken(data.tokenId);
				});
			} else {
				this.scrollToToken(data.tokenId);
			}
		}, this);
		
		this.addListener('annotationSelected', function(src, data) {
			function doSelect(range) {
				if (range) {
					var result = document.evaluate('/'+range.start, this.readerContainer.getBody(), null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
					if (result !== null) {
						Ext.get(result).scrollIntoView(this.readerContainer).frame(this.getApplication().colors.index.dark, 1, { duration: 1000 });
					}
				}
			}
			if (data.docId != this.currentDocId) {
				this.setApiParams({docId: data.docId});
				this.fetchText(doSelect.bind(this, data.range));
			} else {
				doSelect.bind(this, data.range)();
			}
		}, this);
		
		/**
		 * @event documentTypeSelected
		 * @type listener
		 */
		this.addListener('documentTypeSelected', function(src, data) {
			var docInfo = data.docIdType.split(':');
			var docId = docInfo[0];
//			var type = docInfo[1].toLowerCase();
//			this.search.setValue(type);
			if (data.tokenIdStart) {
				this.setApiParams({docId: docId, start: data.tokenIdStart});
				this.fetchText();
			} else {
				
			}
		}, this);
		
		this.addListener('tagsSelected', function(src, tags) {
			this.clearHighlights('tag');
			for (var i = 0; i < tags.length; i++) {
				var docTags = tags[i];
				for (var j = 0; j < docTags.length; j++) {
					var tag = docTags[j];
					this.highlightTag({docId: tag.docId, tokenId: tag.tokenId, type: 'tag'});
				}
			}
		}, this);
		
		this.addListener('indexesSelected', function(src, indexes) {
			this.clearHighlights('index');
			for (var i = 0; i < indexes.length; i++) {
				var index = indexes[i];
				index.type = 'index';
				this.highlightTag(index);
			}
		}, this);
		
		this.addListener('corpusTermsClicked', function(src, terms) {
			if (terms.length === 0) {
				this.clearHighlights('kwic');
			}
		}, this);
		
		this.addListener('documentTermsClicked', function(src, terms) {
			if (terms.length === 0) {
				this.clearHighlights('kwic');
			}
		}, this);
		
		this.addListener('tocUpdated', function(src, data) {
			this.clearHighlights('kwic');
			if (!Ext.isArray(data)) {
				data = [data];
			}
			for (var i = 0; i < data.length; i++) {
				var d = data[i];
				this.highlightTag(d);
			}
		}, this);
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
		}
	},
	
	fetchText: function(callback) {
		var params = this.getApiParams();
		Ext.apply(params, {
			corpus: this.getCorpus().getId(),
			start: 0,
			limit: 0
		});
		Ext.apply(params, {
			tool: 'corpus.DocumentTokens',
			template: 'docTokensPlusStructureDToC',
			outputFormat: 'xml'
		});

		if (!params.docId) {
			params.docId = this.getCorpus().getDocument(0).getId();
		}
		
		this.currentDocId = params.docId;

		this.getApplication().updateWindowHistory();
		
		this.setReaderTitle();
		
		// this.prevButton.hide();
		// this.nextButton.hide();

		var paramsStr = '?';
		for (var key in params) {
			paramsStr += key+'='+params[key]+'&';
		}
		paramsStr = paramsStr.substring(0, paramsStr.length-1);
		var url = this.getTromboneUrl()+paramsStr;

		this.readerContainer.on('load', function() {
			this.loading = false;

			if (this.getApplication().isRegenerations) {
				this.addStylesheetToReader('dtoc/css/tei.css');
			}

			var cssUrl = this.getCorpus().getDocument(params.docId).getCSS();
			if (cssUrl === '') cssUrl = 'https://cwrc.ca/templates/css/tei.css';
			this.addStylesheetToReader(cssUrl);

			var doc = this.readerContainer.getDoc();
            // need to add scroll every time doc is changed
            doc.addEventListener('scroll', function(ev) {
				this.getApplication().dispatchEvent('dtcReaderScroll', this, {el: ev.target.firstElementChild, docId: this.currentDocId});
            }.bind(this));
			
			var index = this.getIndexForDocId(params.docId);
			// if (index > 0) {
			// 	this.prevButton.show();
			// }
			// if (index < this.getCorpus().getDocumentsCount()-1) {
			// 	this.nextButton.show();
			// }

			if (this.getApplication().isRegenerations) {
				this._processRdf();
				this._processLanguage();
				this._processImages();
				this._processLinks();
				
				if (index > 0) {
    				this._processHeader();
    				this._processNotes();
    				this._processBibls();
				} else {
				    this._processCoverPage();
				}
			} else {
				this._processLinks();
				this._processNotes();
				this._processImages();
			}

			this._getSelections();
			
			this.getApplication().dispatchEvent('dtcDocumentLoaded', this, {docId:this.currentDocId});
				
			if (callback) {
				setTimeout(callback.bind(this), 100); // delay so that css has a chance to be applied (needed for scrollToToken)
			}
            
        }, this, {single: true});
		
		this.loading = true;
		this.readerContainer.load(url);
	},
	
	addStylesheetToReader: function(cssUrl) {
		var doc = this.readerContainer.getDoc();
		var cssPi = doc.createProcessingInstruction('xml-stylesheet', 'href="'+cssUrl+'" type="text/css"');
		doc.insertBefore(cssPi, doc.firstChild);
	},

	fetchDocument: function(data) {
		if (this.currentDocId != data.docId) {
			this.setApiParams({docId: data.docId, start: 0});
			
			this.fetchText(function() {
				if (data.tokenId) {
					this.highlightToken(data.tokenId);
				} else {
					this.getApplication().dispatchEvent('dtcReaderScroll', this, {el: this.readerContainer.getBody(), docId: data.docId});
				}
			});
		} else {
			if (data.tokenId) {
				this.highlightToken(data.tokenId);
			} else {
				Ext.fly(this.readerContainer.getBody()).scrollTo('top', 0, false);
			}
		}
	},
	
	fetchPreviousDocument: function() {
		var index = this.getIndexForDocId(this.currentDocId);
		if (index > 0) {
			var data = {docId: this.getCorpus().getDocument(index-1).getId()};
			this.getApplication().dispatchEvent('corpusDocumentSelected', this, data);
			this.fetchDocument(data);
		}
	},
	
	fetchNextDocument: function() {
		var index = this.getIndexForDocId(this.currentDocId);
		if (index < this.getCorpus().getDocumentsCount()) {
			var data = {docId: this.getCorpus().getDocument(index+1).getId()};
			this.getApplication().dispatchEvent('corpusDocumentSelected', this, data);
			this.fetchDocument(data);
		}
	},

	reloadDocument: function() {
		var docId = this.currentDocId;
		this.currentDocId = null;
		this.fetchDocument({docId: docId});
	},
	
	_processRdf: function() {
		var rdf = this.readerContainer.getDoc().querySelectorAll('rdf');
        // rdf.remove();
    },
	
	_processLanguage: function() {
	    var langEl = this.readerContainer.getDoc().querySelector('div[*|lang]');
	    if (langEl != null) {
	        this.currentDocLanguage = langEl.getAttribute('xml:lang').split('-')[0];
	    } else {
	        this.currentDocLanguage = null;
		}
	},
	
	_processCoverPage: function() {
		/* can't use setWidth or setHeight
	    function resizeImage(event, img) {
	        var coverImage = Ext.get(img);
	        var cBox = coverImage.getBox();
	        var rBox = this.readerContainer.iframeEl.getBox();
	        
	        if (cBox.width > rBox.width + 50) {
	            coverImage.setWidth(rBox.width - 100);
	        } else if (cBox.height > rBox.height + 50) {
	            coverImage.setHeight(rBox.height - 50);
	        }
	        // coverImage.show();
	    }
	    
	    var coverImage = Ext.get(this.readerContainer.getDoc().querySelector('graphic'));
	    if (coverImage != null) {
		    var cBox = coverImage.getBox();
		    if (cBox.width === 0) {
		        // coverImage.hide();
		        coverImage.on('load', resizeImage, this);
		    } else {
		        resizeImage.bind(this, null, coverImage)();
		    }
		}
		*/
	},
	
	_processHeader: function() {
		var firstP = Ext.get(Ext.DomQuery.select('#dtcReaderDivWrapper [data-tag=div][type] > [data-tag=p]', this.readerContainer.getBody())[0]);
		if (firstP != null) {
			var firstSpan = firstP.down('span.word');
			if (firstSpan) {
				var text = firstSpan.dom.textContent;
				var dropText = '<span class="dropCap">'+text.substring(0, 1)+'</span>'+text.substring(1);
				firstSpan.update(dropText);
			}
		}
	},
	
	_processNotes: function() {
		this.hideAllNotes(true);
	    this.tokenToolTipsMap = {};
		
		var doc = this.readerContainer.getDoc();
		var notes = [];
		this.noteSelectors.forEach(function(selector) {
			notes = notes.concat(Ext.dom.Query.select(selector, doc, 'select', false));
		});
		notes.forEach(function(note, index) {
			var noteNumber = Ext.DomHelper.insertBefore(note, '<dtocNoteNumber>'+(index+1)+'</dtocNoteNumber>', true);
			var tip = new Ext.ux.DToCToolTip(Ext.apply({
				target: noteNumber,
				title: 'Note '+(index+1),
				html: note.innerHTML,
				listeners: {
				    beforeshow: this.hideAllNotes,
				    scope: this
				}
			}, this.toolTipConfig));
			
			var tokenId = note.getAttribute('tokenid');
			this.tokenToolTipsMap[tokenId] = tip;
		}, this);
	},
	
	_processBibls: function() {
		var bibls = Ext.DomQuery.select('[data-tag=list] > [data-tag=item] > [data-tag=bibl]', this.readerContainer.getBody());
		for (var i = 0; i < bibls.length; i++) {
			var bibl = bibls[i];
			var id = bibl.getAttribute('xml:id');
			if (id != null) {
				var refs = Ext.DomQuery.select('[data-tag=ref][target*='+id+']', this.readerContainer.getBody());
				for (var j = 0; j < refs.length; j++) {
					var ref = refs[j];
					var biblNumber = Ext.DomHelper.insertAfter(ref, '<dtocNoteNumber>'+(i+1)+'</dtocNoteNumber>', true);
					var tip = new Ext.ToolTip(Ext.apply({
						target: biblNumber,
						title: 'Bibl. Ref. '+(i+1),
						html: bibl.textContent
					}, this.toolTipConfig));
					
					var tokenId = ref.getAttribute('tokenid');
					this.tokenToolTipsMap[tokenId] = tip;
					
//					biblNumber.on('click', function(b, e, el, o) {
//						b.scrollIntoView(this.readerContainer.getBody());
//					}.bind(this, [bibl]));
				}
			}
		}
	},
	
	_processImages: function() {
		var doc = this.readerContainer.getDoc();
		var customSs;
		for (var i = 0; i < doc.styleSheets.length; i++) {
			var ss = doc.styleSheets.item(i);
			if (ss.href.indexOf('dtoc/css/custom.css') !== -1) {
				customSs = ss;
			}
		}
		// assign ids to graphic tags and use that for loading image urls through the content/url combo
		var images = [];
		this.imageSelectors.forEach(function(selector) {
			var att = this._getAttributeFromSelector(selector);
			if (att !== null) {
				var hits = Ext.dom.Query.select(selector, doc, 'select', false);
				hits.forEach(function(el) {
					images.push({el: el, att: att});
				});
			}
		}, this);
		images.forEach(function(image) {
			var id = image.el.getAttribute('id');
			if (!id) {
				id = Ext.id(null, 'xml-graphic');
				image.el.setAttribute('id', id);
			}
			var url = image.el.getAttribute(image.att);
			if (customSs) {
				customSs.insertRule('#'+id+' { content: url('+url+')}');
			}
		});
	},
	
	_processLinks: function() {
		var doc = this.readerContainer.getDoc();
		var links = [];
		this.linkSelectors.forEach(function(selector) {
			var att = this._getAttributeFromSelector(selector);
			if (att !== null) {
				var hits = Ext.dom.Query.select(selector, doc, 'select', false);
				hits.forEach(function(el) {
					links.push({el: el, att: att});
				});
			}
		}, this);
		links.forEach(function(link) {
			var url = link.el.getAttribute(link.att);
			if (url.indexOf("http://")===0 || url.indexOf("https://")===0) {
				link.el.addEventListener('click', function(e) {
					window.open(url);
				}, link);
			}
		});
	},

	_getAttributeFromSelector: function(selector) {
		var attName = selector.match(/\[@?([^\t\n\f\s\/>"'\]\=\~\|\^\$\*]+)/);
		if (attName !== null) {
			attName = attName[1];
		}
		return attName;
	},
	
	_getSelections: function() {
		var sels = Ext.getCmp('dtcDocModel').getSelectionsForDoc(this.currentDocId);
		for (var type in sels) {
			var tokenIds = sels[type];
			for (var id in tokenIds) {
				this.highlightTag({docId: this.currentDocId, tokenId: id, type: type});
			}
		}
	},
	
	highlightKeywords: function(query, doScroll) {
		if (!Ext.isArray(query)) query = [query];
		
		var nodes = Ext.DomQuery.select('span[class*=keyword]', this.readerContainer.getBody());
		for (var i=0; i<nodes.length;i++) {
			Ext.get(nodes[i]).removeCls('keyword');
		}
		nodes = [];
		for (var i = 0; i < query.length; i++) {
			nodes = nodes.concat(Ext.DomQuery.select('span.token:nodeValueCaseInsensitive('+query[i]+')', this.readerContainer.getBody()));
		}
		if (nodes.length>0) {			
			for (var i=0; i<nodes.length;i++) {
				Ext.get(nodes[i]).addCls('keyword');
			}
			if (doScroll) Ext.get(nodes[0]).scrollIntoView(this.readerContainer).frame(this.getApplication().color.index.dark, 1, { duration: 1000 });
		}
	},
	
	highlightToken: function(tokenId) {
		var tag = Ext.DomQuery.select('*[tokenid="'+tokenId+'"]', this.readerContainer.getBody())[0];
		if (tag != null) {
			this._doHighlight(tag, 'kwic');
		}
	},
	
	/**
	 * A general highlight function, expects any of the following data properties: id, tokenId, or tag & index.
	 */
	highlightTag: function(data) {
		if (data.docId && data.docId == this.currentDocId) {
			var tag = null;
			if (data.id) {
				tag = Ext.DomQuery.select('*[xml\\:id="'+data.id+'"]', this.readerContainer.getBody())[0];
			} else if (data.tokenId) {
				tag = Ext.DomQuery.select('*[tokenid="'+data.tokenId+'"]', this.readerContainer.getBody())[0];
			} else if (data.tag) {
				tag = Ext.DomQuery.select(data.tag, this.readerContainer.getBody())[data.index];
			} else if (data.xpath) {
				
			} 
			if (tag != null) {
				this._doHighlight(tag, data.type);
			}
		}
	},
	
	_doHighlight: function(tag, type) {
		var type = type || 'index';
		tag.setAttribute('dtocHighlight', type);
	},
	
	hideAllNotes: function(destroy) {
	    for (var id in this.tokenToolTipsMap) {
	        this.tokenToolTipsMap[id].hide();
	        if (destroy === true) {
	            this.tokenToolTipsMap[id].destroy();
	        }
	    }
	},
	
	scrollToToken: function(tokenId) {
		var readerEl = this.readerContainer.getBody();
		var tag = Ext.get(Ext.DomQuery.select('*[tokenid="'+tokenId+'"]', readerEl)[0]);
		
		if (tag) {
		    var isVisible = tag.isVisible(true); // true to check if parents are visible
		    if (!isVisible) {
		        // if the tag has a note parent then reset the tokenId to that of the note
		        var noteParent = tag.parent('note');
		        if (noteParent != null) {
		            tokenId = noteParent.getAttribute('tokenid');
		        }
		    }
		    
    		var tip = this.tokenToolTipsMap[tokenId];
    		if (tip) {
    		    tip.target.scrollIntoView(readerEl);
    		    tag = tip.target; // FIXME showing tip programatically is broken
    		} else {
    		    tag.scrollIntoView(readerEl);
    		}
    		
    		if (false) { // FIXME showing tip programatically is broken
    			setTimeout(function() {
    				tip.show();//At([tip.target.getX(), tip.target.getY()+tip.target.getHeight()]);
    				tip.stayOpen();
    				
    				var tokenid = tag.getAttribute('tokenid');
    				var type = 'index';
    				if (tag.hasCls('tag')) {
    					type = 'tag';
    				} else if (tag.hasCls('kwic')) {
    					type = 'kwic';
    				}
    				// TODO always seems to be null
    				var noteTag = tip.el.down('*[tokenid="'+tokenid+'"]');
    				if (noteTag != null) {
    					this._doHighlight(noteTag, type);
    				}
    			}.bind(this), 500);
    		} else {
				var color = this.getApplication().colors.index.dark;
				var type = tag.getAttribute('dtocHighlight');
    			if (type === 'tag') {
    				color = this.getApplication().colors.tag.dark;
    			} else if (type === 'kwic') {
    				color = this.getApplication().colors.kwic.dark;
                }
    			tag.frame(color, 1, {duration: 1000});
    		}
		}
	},
	
	clearHighlights: function(type) {
		var readerEl = this.readerContainer.getBody();
		var hits = this.readerContainer.getDoc().querySelectorAll('[dtocHighlight]');
		for (var i = 0; i < hits.length; i++) {
			var hit = hits[i];
			if (type === undefined || hit.getAttribute('dtocHighlight') === type) {
				hit.removeAttribute('dtocHighlight');
			}
		}
	},
	
	getSegmentObject: function(segment) {
		var className = segment.className ? segment.className : segment.dom.className;
		var segmentRegex = /segment_(\d+)_(\d+)_(\d+)/;
		var match = segmentRegex.exec(className);
		if (match) {
			return {
				element: segment,
				docIndex: parseInt(match[1]),
				start: parseInt(match[2]),
				lastLimit: parseInt(match[3])
			};
		}
		return {};
	},
	
	getCurrentDocLanguage: function() {
	    return this.currentDocLanguage;
	},
	
	getCurrentDocId: function() {
		return this.currentDocId;
	},
	
	getIndexForDocId: function(docId) {
		return this.getCorpus().getDocument(docId).getIndex();
	},
	
	setReaderTitle: function(docId) {
		docId = docId || this.currentDocId;
		var doc = this.getCorpus().getDocument(docId);
		var titleHtml = '';
		var title = doc.getTitle().normalize();
		var names = '';
		var colon = ': ';
		var authors = doc.get('author');
		titleHtml = "";
		if (authors !== undefined) {
			if (typeof authors === 'string') {
				authors = [authors];
			}
			for (var i = 0; i < authors.length; i++) {
				if (i > 0) {
					if (authors.length > 2) names += ', ';
					if (i == authors.length - 1) {
						names += ' and ';
					}
				}
				names += authors[i];
			}
			if (names === '') {
			    // no authors so get rid of colon
			    colon = '';
			}
			titleHtml += '<span class="author">'+names+'</span>'+colon;
		}
		titleHtml += '<span class="title">'+title+'</span>';
		this.setTitle(titleHtml);
		
		this.resizeReaderComponents();
	},
	
	resizeReaderComponents: function() {
		var parentWidth = this.readerContainer.getEl().getWidth();
		this.readerContainer.getEl().setWidth(parentWidth);
	},
	
	setReaderScroll: function(location) {
		location = location || 'bottom';
		var scrollTop = 0;
		if (location == 'bottom') {
			scrollTop = this.readerContainer.getBody().scrollHeight;
		}
		Ext.fly(this.readerContainer.getBody()).scrollTo('top', scrollTop, false);
	}
});

Ext.override(Ext.Element, {
	scrollIntoView: function(container, hscroll) {
        // use native api to scroll element into the centre of the container
		this.dom.scrollIntoView({behavior: 'auto', block: 'center', inline: 'center'});
    },
    
    frame: function(color, count, obj){
        var me = this,
            dom = me.dom,
            beforeAnim;

        color = color || '#C3DAF9';
        count = count || 1;
        obj = obj || {};

        beforeAnim = function() {
            var el = Ext.fly(dom, '_anim'),
                animScope = this,
                box,
                proxy, proxyAnim;
                
            // OVERRIDE xml elements have no style property
            if (dom.style !== undefined) {
                el.show();
            }
            
            box = el.getBox();

            // OVERRIDE add iframe offset to box
            if (el.dom.ownerDocument !== window.document) {
                var iframeBox = Ext.fly(window.document.querySelector('iframe')).getBox();
                box.x += iframeBox.x;
                box.y += iframeBox.y;
            }

            proxy = Ext.getBody().createChild({
                role: 'presentation',
                id: el.dom.id + '-anim-proxy',
                style: {
                    position : 'absolute',
                    'pointer-events': 'none',
                    'z-index': 35000,
                    border : '0px solid ' + color
                }
            });
            
            proxyAnim = new Ext.fx.Anim({
                target: proxy,
                duration: obj.duration || 1000,
                iterations: count,
                from: {
                    top: box.y,
                    left: box.x,
                    borderWidth: 0,
                    opacity: 1,
                    height: box.height,
                    width: box.width
                },
                to: {
                    top: box.y - 20,
                    left: box.x - 20,
                    borderWidth: 10,
                    opacity: 0,
                    height: box.height + 40,
                    width: box.width + 40
                }
            });
            proxyAnim.on('afteranimate', function() {
                proxy.destroy();
                // kill the no-op element animation created below 
                animScope.end();
            });
        };

        me.animate({
            // See "A Note About Wrapped Animations" at the top of this class: 
            duration: (Math.max(obj.duration, 500) * 2) || 2000,
            listeners: {
                beforeanimate: {
                    fn: beforeAnim
                }
            },
            callback: obj.callback,
            scope: obj.scope
        });
        return me;
    }
});
