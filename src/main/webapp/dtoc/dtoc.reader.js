Ext.define('Voyant.panel.DToC.Reader', {
	extend: 'Ext.panel.Panel',
	requires: [],
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
	loading: false,
	readerContainer: null,
	prevButton: null,
	nextButton: null,
	tokenToolTipsMap: {},
    
    constructor: function(config) {
    	
    	Ext.applyIf(config, {
    		cls: 'dtc-panel',
			height: '100%',
			html: '<div id="dtcReaderContainer"><div id="dtcReaderDivWrapper"></div><div id="dtcReaderButtons"></div></div>'
		});
    	
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
    	this.addListener('afterrender', function(panel) {
			this.readerContainer = Ext.get('dtcReaderContainer');
			
			var buttonContainer = Ext.get('dtcReaderButtons');
			
			this.prevButton = new Ext.Button({
				text: 'Previous Chapter',
				scale: 'medium',
				cls: 'dtc-button',
				style: 'display: inline-block; margin-right: 5px;',
				hidden: true,
				renderTo: buttonContainer,
				handler: this.fetchPreviousDocument,
				scope: this
			});
			
			
			this.nextButton = new Ext.Button({
				text: 'Next Chapter',
				scale: 'medium',
				cls: 'dtc-button',
				style: 'display: inline-block; margin-left: 5px;',
				hidden: true,
				renderTo: buttonContainer,
				handler: this.fetchNextDocument,
				scope: this
			});
			
			this.readerContainer.addListener('scroll', function(ev) {
				this.getApplication().dispatchEvent('dtcReaderScroll', this, {el: ev.target, docId: this.currentDocId});
			}, this);
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
					var dom = this.readerContainer.dom;
					var scrollTop = data.amount * dom.scrollHeight - (dom.clientHeight * 0.5);
					this.readerContainer.scrollTo('top', scrollTop, animate);
				});
			} else {
				var dom = this.readerContainer.dom;
				var scrollTop = data.amount * dom.scrollHeight - (dom.clientHeight * 0.5);
				this.readerContainer.scrollTo('top', scrollTop, animate);
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
					var result = document.evaluate('/'+range.start, this.readerContainer.dom.firstChild, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
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
			template: 'docTokens2spans',
			outputFormat: 'html'
		});

		if (!params.docId) {
			params.docId = this.getCorpus().getDocument(0).getId();
		}
		
		this.currentDocId = params.docId;
		
		if (window.history.pushState) {
			// add the docId to the url (for proper annotation storage)
			var app = this.getApplication();
			var corpusId = app.getCorpus().getId();
			var docId = params.docId;
			var inkeTags = app.getApiParam('inkeTags');
			var curatorId = app.getApiParam('curatorId');
			var debug = app.getApiParam('debug');
			
			var url = app.getBaseUrl()+'dtoc/';
			url += '?corpus='+corpusId+'&docId='+docId;
			// prioritize curatorId over inkeTags
			if (curatorId !== undefined) {
			    url += '&curatorId='+curatorId;
			} else if (inkeTags !== false) {
                url += '&inkeTags=true';
            }
			if (debug !== undefined) {
			    url += '&debug=true';
			}
			
			window.history.pushState({
				corpus: corpusId,
				docId: docId
			}, 'Doc: '+docId, url);
		}
		
		this.setReaderTitle();
		
		this.prevButton.hide();
		this.nextButton.hide();
		
		var el = Ext.get(Ext.DomQuery.select('#dtcReaderDivWrapper')[0]);
		el.update('');
		
		this.loading = true;
		el.load({
			url: this.getTromboneUrl(),
			params: params,
			callback: function(el, success, response, options) {
				this.loading = false;
				
				var index = this.getIndexForDocId(params.docId);
				
				if (index > 0) {
					this.prevButton.show();
				}
				if (index < this.getCorpus().getDocumentsCount()-1) {
					this.nextButton.show();
				}
				
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
				
				
				this._getSelections();
				
				this.getApplication().dispatchEvent('dtcDocumentLoaded', this, {docId:this.currentDocId});
				
				if (callback) callback.call(this);
			},
			scope: this
		});
	},
	
	fetchDocument: function(data) {
		if (this.currentDocId != data.docId) {
			this.setApiParams({docId: data.docId, start: 0});
			
			this.fetchText(function() {
				if (data.tokenId) {
					this.highlightToken(data.tokenId);
				} else {
					this.getApplication().dispatchEvent('dtcReaderScroll', this, {el: this.readerContainer.dom, docId: data.docId});
				}
			});
		} else {
			if (data.tokenId) {
				this.highlightToken(data.tokenId);
			} else {
				this.readerContainer.scrollTo('top', 0, false);
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
	
	_processRdf: function() {
        var rdf = Ext.get(Ext.DomQuery.select('rdf\\:rdf', this.readerContainer.dom));
        rdf.remove();
    },
	
	_processLanguage: function() {
	    var langEl = Ext.get(Ext.DomQuery.select('div[xml\\:lang]', this.readerContainer.dom)[0]);
	    if (langEl != null) {
	        this.currentDocLanguage = langEl.getAttribute('xml:lang').split('-')[0];
	    } else {
	        this.currentDocLanguage = null;
	    }
	},
	
	_processCoverPage: function() {
	    var parent = Ext.get(Ext.DomQuery.select('#dtcReaderDivWrapper')[0]).first();
	    parent.addCls('coverPage');
	    
	    var firstNote = Ext.get(Ext.DomQuery.select('#dtcReaderDivWrapper [data-tag=note]')[0]);
	    if (firstNote != null) {
	    	firstNote.setStyle('marginLeft', '5em');
	    }
	    
	    function resizeImage(event, img) {
	        var coverImage = Ext.get(img);
	        var cBox = coverImage.getBox();
	        var rBox = this.readerContainer.parent().getBox();
	        
	        if (cBox.width > rBox.width + 50) {
	            coverImage.setWidth(rBox.width - 100);
	        } else if (cBox.height > rBox.height + 50) {
	            coverImage.setHeight(rBox.height - 50);
	        }
	        
	        coverImage.show();
	    }
	    
	    var coverImage = Ext.get(Ext.DomQuery.select('#dtcReaderDivWrapper img')[0]);
	    if (coverImage != null) {
		    var cBox = coverImage.getBox();
		    if (cBox.width === 0) {
		        coverImage.hide();
		        coverImage.on('load', resizeImage, this);
		    } else {
		        resizeImage.bind(this, null, coverImage)();
		    }
	    }
	},
	
	_processHeader: function() {
		var firstP = Ext.get(Ext.DomQuery.select('#dtcReaderDivWrapper [data-tag=div][type] > [data-tag=p]', this.readerContainer.dom)[0]);
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
	    
		var notes = Ext.DomQuery.select('[data-tag=note]', this.readerContainer.dom);
		for (var i = 0; i < notes.length; i++) {
			var note = notes[i];
			var noteNumber = Ext.DomHelper.insertBefore(note, '<span class="noteNumber">'+(i+1)+'</span>', true);
			var tip = new Ext.ux.DToCToolTip(Ext.apply({
				target: noteNumber,
				title: 'Note '+(i+1),
				html: note.innerHTML,
				listeners: {
				    beforeshow: this.hideAllNotes,
				    scope: this
				}
			}, this.toolTipConfig));
			
			var tokenId = note.getAttribute('tokenid');
			this.tokenToolTipsMap[tokenId] = tip;
		}
	},
	
	_processBibls: function() {
		var bibls = Ext.DomQuery.select('[data-tag=list] > [data-tag=item] > [data-tag=bibl]', this.readerContainer.dom);
		for (var i = 0; i < bibls.length; i++) {
			var bibl = bibls[i];
			var id = bibl.getAttribute('xml:id');
			if (id != null) {
				var refs = Ext.DomQuery.select('[data-tag=ref][target*='+id+']', this.readerContainer.dom);
				for (var j = 0; j < refs.length; j++) {
					var ref = refs[j];
					var biblNumber = Ext.DomHelper.insertAfter(ref, '<span class="noteNumber">'+(i+1)+'</span>', true);
					var tip = new Ext.ToolTip(Ext.apply({
						target: biblNumber,
						title: 'Bibl. Ref. '+(i+1),
						html: bibl.textContent
					}, this.toolTipConfig));
					
					var tokenId = ref.getAttribute('tokenid');
					this.tokenToolTipsMap[tokenId] = tip;
					
//					biblNumber.on('click', function(b, e, el, o) {
//						b.scrollIntoView(this.readerContainer.dom);
//					}.bind(this, [bibl]));
				}
			}
		}
	},
	
	_processImages: function() {
		var graphics = Ext.DomQuery.select('[data-tag=graphic]', this.readerContainer.dom);
		for (var i = 0; i < graphics.length; i++) {
			var image = graphics[i];
			var url = image.getAttribute('url');
			if (image.parentElement.getAttribute('data-tag').toLowerCase() == 'figure') {
			    var title = '';
			    var figDesc = Ext.DomQuery.select('[data-tag=graphic] ~ [data-tag=figDesc]', image.parentElement)
			    if (figDesc.length > 0) {
			        title = figDesc[0].textContent;
			    }
			    var img = Ext.DomHelper.insertBefore(image, '<img src="'+url+'" title="'+title+'"/>', true);
			    img.on('load', function(evt, img) {
			        var el = Ext.get(img);
			        el.dom.parentElement.style.width = el.getWidth()+'px';
			    }, this);
			} else {
			    Ext.DomHelper.insertBefore(image, '<img src="'+url+'" />', true);
			}
		}
	},
	
	_processLinks: function() {
		var links = Ext.DomQuery.select('[data-tag=ref][@target]', this.readerContainer.dom);
		for (var i = 0; i < links.length; i++) {
			var link = links[i];
			var url = link.getAttribute('target');
			if (url.indexOf("http://")===0 || url.indexOf("https://")===0) {
				Ext.get(link).wrap({tag: 'a', href: url, target: '_blank'});
			}
		}
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
		
		var nodes = Ext.DomQuery.select('span[class*=keyword]', this.readerContainer.dom);
		for (var i=0; i<nodes.length;i++) {
			Ext.get(nodes[i]).removeCls('keyword');
		}
		nodes = [];
		for (var i = 0; i < query.length; i++) {
			nodes = nodes.concat(Ext.DomQuery.select('span.token:nodeValueCaseInsensitive('+query[i]+')', this.readerContainer.dom));
		}
		if (nodes.length>0) {			
			for (var i=0; i<nodes.length;i++) {
				Ext.get(nodes[i]).addCls('keyword');
			}
			if (doScroll) Ext.get(nodes[0]).scrollIntoView(this.readerContainer).frame(this.getApplication().color.index.dark, 1, { duration: 1000 });
		}
	},
	
	highlightToken: function(tokenId) {
		var tag = Ext.DomQuery.select('*[tokenid="'+tokenId+'"]', this.readerContainer.dom)[0];
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
				tag = Ext.DomQuery.select('*[xml\\:id="'+data.id+'"]', this.readerContainer.dom)[0];
			} else if (data.tokenId) {
				tag = Ext.DomQuery.select('*[tokenid="'+data.tokenId+'"]', this.readerContainer.dom)[0];
			} else if (data.tag) {
				tag = Ext.DomQuery.select(data.tag, this.readerContainer.dom)[data.index];
			} else if (data.xpath) {
				
			} 
			if (tag != null) {
				this._doHighlight(tag, data.type);
			}
		}
	},
	
	_doHighlight: function(tag, type) {
		var type = type || 'index';
		var tagEl = Ext.get(tag);
		tagEl.addCls('dtc-reader-highlight');
		tagEl.addCls(type);
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
		var readerEl = this.readerContainer.dom;
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
    			if (tag.hasCls('tag')) {
    				color = this.getApplication().colors.tag.dark;
    			} else if (tag.hasCls('kwic')) {
    				color = this.getApplication().colors.kwic.dark;
    			}
    			tag.frame(color, 1, {duration: 1000});
    		}
		}
	},
	
	clearHighlights: function(type) {
		var readerEl = this.readerContainer.dom;
		var hits = Ext.DomQuery.jsSelect('*[class*=dtc-reader-highlight]', readerEl);
		for (var i = 0; i < hits.length; i++) {
			var hit = Ext.get(hits[i]);
			if (type == null || hit.hasCls(type)) {
				hit.removeCls('dtc-reader-highlight');
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
		var parentWidth = this.readerContainer.parent().getWidth();
		this.readerContainer.setWidth(parentWidth);
	},
	
	setReaderScroll: function(location) {
		location = location || 'bottom';
		var scrollTop = 0;
		if (location == 'bottom') {
			scrollTop = this.readerContainer.dom.scrollHeight;
		}
		this.readerContainer.scrollTo('top', scrollTop, false);
	}
});

//scroll element into the centre of the container
Ext.override(Ext.Element, {
	scrollIntoView : function(container, hscroll) {
		var c = Ext.getDom(container) || Ext.getBody().dom,
		        el = this.dom,
		        o = this.getOffsetsTo(c),
		    l = o[0] + c.scrollLeft,
		    t = o[1] + c.scrollTop,
		    b = t + el.offsetHeight,
		    r = l + el.offsetWidth,
		        ch = c.clientHeight,
		        ct = parseInt(c.scrollTop, 10),
		        cl = parseInt(c.scrollLeft, 10),
		        cb = ct + ch,
		        cr = cl + c.clientWidth;

	
		// here's the override
		if (el.offsetHeight > ch || t < ct) {
			c.scrollTop = t - ch * 0.5;
		} else if (b > cb) {
			c.scrollTop = b - ch * 0.5;
		}
		
		c.scrollTop = c.scrollTop; // corrects IE, other browsers will ignore
	
		if (hscroll !== false) {
			if (el.offsetWidth > c.clientWidth || l < cl) {
				c.scrollLeft = l;
			} else if (r > cr) {
				c.scrollLeft = r - c.clientWidth;
			}
			c.scrollLeft = c.scrollLeft;
		}
		return this;
	}
});