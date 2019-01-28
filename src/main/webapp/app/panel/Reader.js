Ext.define('Voyant.panel.Reader', {
	extend: 'Ext.panel.Panel',
	requires: ['Voyant.data.store.Tokens'],
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.reader',
	isConsumptive: true,
    statics: {
    	i18n: {
    	},
    	api: {
    		start: 0,
    		limit: 1000,
    		skipToDocId: undefined,
    		query: undefined
    	},
    	glyph: 'xf0f6@FontAwesome'
	},
    config: {
    	innerContainer: undefined,
    	tokensStore: undefined,
    	documentsStore: undefined,
    	documentTermsStore: undefined,
    	exportVisualization: false,
    	lastScrollTop: 0,
		scrollIntoView: false,
		insertWhere: 'beforeEnd',
    	lastLocationUpdate: new Date()
    },
    
    SCROLL_UP: -1,
    SCROLL_EQ: 0,
    SCROLL_DOWN: 1,
    
	LOCATION_UPDATE_FREQ: 100,
	
	INITIAL_LIMIT: 1000, // need to keep track since limit can be changed when scrolling,
    
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function(config) {
    	var tokensStore = Ext.create("Voyant.data.store.Tokens", {
    		parentTool: this,
    		proxy: {
    			extraParams: {
    				forTool: 'reader'
    			}
    		}
    	})
    	var me = this;
    	tokensStore.on("beforeload", function(store) {
    		return me.hasCorpusAccess(store.getCorpus());
    	})
    	tokensStore.on("load", function(s, records, success) {
    		if (success) {
	    		var contents = "";
	    		var documentFrequency = this.localize("documentFrequency");
	    		var isPlainText = false;
	    		var docIndex = -1;
	    		var isLastNewLine = false;
	    		records.forEach(function(record) {
	    			if (record.getPosition()==0) {
	    				contents+="<h3>"+this.getDocumentsStore().getById(record.getDocId()).getFullLabel()+"</h3>";
	    			}
	    			if (record.getDocIndex()!=docIndex) {
	    				isPlainText = this.getDocumentsStore().getById(record.getDocId()).isPlainText();
	    				docIndex = record.getDocIndex();
	    			}
	    			if (record.isWord()) {
	    				isLastNewLine = false;
	    				contents += "<span class='word' id='"+ record.getId() + "' data-qtip='"+documentFrequency+" "+record.getDocumentRawFreq()+"'>"+ record.getTerm() + "</span>";
	    			}
	    			else {
	    				var newContents = record.getTermWithLineSpacing(isPlainText);
	    				var isNewLine = newContents.indexOf("<br />")==0;
	    				if (isLastNewLine && (isNewLine || newContents.trim().length==0)) {}
	    				else {
	    					contents += newContents;
	    					isLastNewLine = isNewLine;
	    				}
	    			}
	    		}, this);
	    		this.updateText(contents);
	    		
	    		var keyword = this.down('querysearchfield').getValue();
	    		if (keyword != '') {
//	    			this.highlightKeywords(keyword);
	    		}
    		}
    	}, this);
    	this.setTokensStore(tokensStore);
    	
    	this.on("query", function(src, queries) {
    		this.loadQueryTerms(queries);
    	}, this);
    	
    	this.setDocumentTermsStore(Ext.create("Ext.data.Store", {
			model: "Voyant.data.model.DocumentTerm",
    		autoLoad: false,
    		remoteSort: false,
    		proxy: {
				type: 'ajax',
				url: Voyant.application.getTromboneUrl(),
				extraParams: {
					tool: 'corpus.DocumentTerms',
					withDistributions: true,
					// TODO handle positions
					withPositions: true,
					bins: 25,
					forTool: 'reader'
				},
				reader: {
					type: 'json',
		            rootProperty: 'documentTerms.terms',
		            totalProperty: 'documentTerms.total'
				},
				simpleSortMode: true
   		    },
   		    listeners: {
   		    load: function(store, records, successful, opts) {
   		    		store.sort('docIndex', 'ASC');
   		    		var term; // store last accessed term
   		    		store.each(function(r) {
   		    			term = r.get('term');
   		    		}, this);
   		    		 
   		    		this.highlightKeywords(term);
//   		    		 this.down('querysearchfield').setValue(term);
   		    	},
   		    	scope: this
   		    }
    	}));
    	
    	this.on("afterrender", function() {
    		var centerPanel = this.down('panel[region="center"]');
    		this.setInnerContainer(centerPanel.getLayout().getRenderTarget());
    		
    		// scroll listener
    		centerPanel.body.on("scroll", function(event, target) {
    			var scrollDir = this.getLastScrollTop() < target.scrollTop ? this.SCROLL_DOWN
    								: this.getLastScrollTop() > target.scrollTop ? this.SCROLL_UP
									: this.SCROLL_EQ;
    			
    			// scroll up
    			if (scrollDir == this.SCROLL_UP && target.scrollTop < 1) {
    				this.fetchPrevious(true);
    			// scroll down
    			} else if (scrollDir == this.SCROLL_DOWN && target.scrollHeight - target.scrollTop < target.offsetHeight*1.5) {//target.scrollTop+target.offsetHeight>target.scrollHeight/2) { // more than half-way down
    				this.fetchNext(false);
    			} else {
    				var amount;
    				if (target.scrollTop == 0) {
    					amount = 0;
    				} else if (target.scrollHeight - target.scrollTop == target.clientHeight) {
    					amount = 1;
    				} else {
    					amount = (target.scrollTop + target.clientHeight * 0.5) / target.scrollHeight;
    				}
					
					var now = new Date();
        			if (now - this.getLastLocationUpdate() > this.LOCATION_UPDATE_FREQ || amount == 0 || amount == 1) {
        				this.updateLocationMarker(amount, scrollDir);
        			}
    			}
    			this.setLastScrollTop(target.scrollTop);
    		}, this);
    		
    		// click listener
    		centerPanel.body.on("click", function(event, target) {
    			target = Ext.get(target);
    			if (target.hasCls('word')) {
    				var info = Voyant.data.model.Token.getInfoFromElement(target);
    				var term = target.getHtml();
    				var data = [{
    					term: term,
    					docIndex: info.docIndex
    				}];
    				this.loadQueryTerms([term]);
    				this.getApplication().dispatchEvent('termsClicked', this, data);
    			}
    		}, this);
    		
    		if (this.getCorpus()) {
    			this.load();
	    		var query = this.getApiParam('query');
	    		if (query) {
	    			this.loadQueryTerms(Ext.isString(query) ? [query] : query);
	    		}
    		}
			this.on("loadedCorpus", function() {
    			this.load(true); // make sure to clear in case we're replacing the corpus
	    		var query = this.getApiParam('query');
	    		if (query) {
	    			this.loadQueryTerms(Ext.isString(query) ? [query] : query);
	    		}
			}, this);
    	}, this);
    	
    	Ext.apply(this, {
    		title: this.localize('title'),
    		cls: 'voyant-reader',
    	    layout: 'fit',
    	    items: {
    	    	layout: 'border',
    	    	items: [{
    		    	bodyPadding: 10,
    		    	region: 'center',
    		    	border: false,
    		    	autoScroll: true,
    		    	html: '<div class="readerContainer"></div>'
    		    },{
					xtype: 'readergraph',
    		    	region: 'south',
    		    	height: 40,
    		    	split: {
    		    		size: 2
    		    	},
    		    	splitterResize: true,
					border: false,
					listeners: {
						documentRelativePositionSelected: function(src, data) {
							var doc = this.getDocumentsStore().getAt(data.docIndex);
							var totalTokens = doc.get('tokensCount-lexical');
							var position = Math.floor(totalTokens * data.fraction);
							var bufferPosition = position - (this.getApiParam('limit')/2);
							this.setApiParams({'skipToDocId': doc.getId(), start: bufferPosition < 0 ? 0 : bufferPosition});
							this.load(true);
						},
						scope: this
					}
    		    }]
    	    },
    		// TODO clearing search loads default document terms into chart but probably shouldn't
    		dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                items: [{
                	glyph: 'xf060@FontAwesome',
            		handler: function() {
            			this.fetchPrevious(true);
            		},
            		scope: this
            	},{
            		glyph: 'xf061@FontAwesome',
            		handler: function() {
            			this.fetchNext(true);
            		},
            		scope: this
            	},{xtype: 'tbseparator'},{
                    xtype: 'querysearchfield'
                }]
    		}],
    		listeners: {
    			loadedCorpus: function(src, corpus) {
    	    		this.getTokensStore().setCorpus(corpus);
    	    		this.getDocumentTermsStore().getProxy().setExtraParam('corpus', corpus.getId());
    	    		
    	    		var docs = corpus.getDocuments();
    	    		this.setDocumentsStore(docs);
    	    		
    	    		if (this.rendered) {
    	    			this.load();
        	    		if (this.hasCorpusAccess(corpus)==false) {
        	    			this.mask(this.localize("limitedAccess"), 'mask-no-spinner')
        	    		}
        	    		var query = this.getApiParam('query');
        	    		if (query) {
        	    			this.loadQueryTerms(Ext.isString(query) ? [query] : query);
        	    		}
    	    		}
    	    		
    			},
            	termsClicked: function(src, terms) {
            		var queryTerms = [];
            		terms.forEach(function(term) {
            			if (Ext.isString(term)) {queryTerms.push(term);}
            			else if (term.term) {queryTerms.push(term.term);}
            			else if (term.getTerm) {queryTerms.push(term.getTerm());}
            		});
            		if (queryTerms.length > 0) {
            			this.loadQueryTerms(queryTerms);
            		}
        		},
        		corpusTermsClicked: function(src, terms) {
        			var queryTerms = [];
            		terms.forEach(function(term) {
            			if (term.getTerm()) {queryTerms.push(term.getTerm());}
            		});
            		this.loadQueryTerms(queryTerms);
        		},
        		documentTermsClicked: function(src, terms) {
        			var queryTerms = [];
            		terms.forEach(function(term) {
            			if (term.getTerm()) {queryTerms.push(term.getTerm());}
            		});
            		this.loadQueryTerms(queryTerms);
        		},
        		documentSelected: function(src, document) {
        			var corpus = this.getTokensStore().getCorpus();
        			var doc = corpus.getDocument(document);
        			this.setApiParams({'skipToDocId': doc.getId(), start: 0});
					this.load(true);
        		},
        		documentsClicked: function(src, documents, corpus) {
        			if (documents.length > 0) {
            			var doc = documents[0];
            			this.setApiParams({'skipToDocId': doc.getId(), start: 0});
						this.load(true);
            		}
        		},
        		termLocationClicked: function(src, terms) {
    				if (terms[0] !== undefined) {
    					var term = terms[0];
    					var docIndex = term.get('docIndex');
    					var position = term.get('position');
    					var bufferPosition = position - (this.getApiParam('limit')/2);
    					var doc = this.getCorpus().getDocument(docIndex);
    					this.setApiParams({'skipToDocId': doc.getId(), start: bufferPosition < 0 ? 0 : bufferPosition});
    					this.load(true, {
    						callback: function() {
    							var el = this.body.dom.querySelector("#_" + docIndex + "_" + position);
    							if (el) {
    								el.scrollIntoView();
    							}
    							this.highlightKeywords(term.get('term'), false);
    						},
    						scope: this
    					});
    				};
        		},
        		documentIndexTermsClicked: function(src, terms) {
        			if (terms[0] !== undefined) {
    					var term = terms[0];
    					var termRec = Ext.create('Voyant.data.model.Token', term);
    					this.fireEvent('termLocationClicked', this, [termRec]);
        			}
        		},
        		scope: this
    		}
    	});
    	
        this.callParent(arguments);
    },
    
    loadQueryTerms: function(queryTerms) {
    	if (queryTerms && queryTerms.length > 0) {
			this.getDocumentTermsStore().load({
				params: {
					query: queryTerms/*,
    				docIndex: undefined,
    				docId: undefined,
    				page: undefined,
    				start: undefined,
    				limit: undefined*/
    			}
			});
			this.down('readergraph').loadQueryTerms(queryTerms);
		}
    },
    
    highlightKeywords: function(query, doScroll) {
		if (!Ext.isArray(query)) query = [query];
		
		this.getInnerContainer().first().select('span[class*=keyword]').removeCls('keyword');
		
		var spans = [];
		var caseInsensitiveQuery = new RegExp('^'+query[0]+'$', 'i');
		var nodes = this.getInnerContainer().first().select('span.word');
		nodes.each(function(el, compEl, index) {
			if (el.dom.firstChild && el.dom.firstChild.nodeValue.match(caseInsensitiveQuery)) {
				el.addCls('keyword');
				spans.push(el.dom);
			}
		});
		
//		if (doScroll && spans[0] !== undefined) {
//			Ext.get(nodes[0]).scrollIntoView(reader).frame("ff0000", 1, { duration: 2 });
//		}
	},
    
	fetchPrevious: function(scroll) {
		var readerContainer = this.getInnerContainer().first();
		var first = readerContainer.first('.word');
		if (first != null && first.hasCls("loading")===false) {
			while(first) {
				if (first.hasCls("word")) {
					var info = Voyant.data.model.Token.getInfoFromElement(first);
					var docIndex = info.docIndex;
					var start = info.position;
					var doc = this.getDocumentsStore().getAt(docIndex);    						
					var limit = this.getApiParam('limit');
					var getPrevDoc = false;
					if (docIndex === 0 && start === 0) {
						var scrollContainer = this.down('panel[region="center"]').body;
						var scrollNeeded = first.getScrollIntoViewXY(scrollContainer, scrollContainer.dom.scrollTop, scrollContainer.dom.scrollLeft);
						if (scrollNeeded.y != 0) {
							first.dom.scrollIntoView();
						}
						first.frame("red");
						break;
					}
					if (docIndex > 0 && start === 0) {
						getPrevDoc = true;
						docIndex--;
						doc = this.getDocumentsStore().getAt(docIndex);
						var totalTokens = doc.get('tokensCount-lexical');
						start = totalTokens-limit;
						if (start < 0) {
							start = 0;
							this.setApiParam('limit', totalTokens);
						}
					} else {
						limit--; // subtract one to limit for the word we're removing. need to do this to account for non-lexical tokens before/after first word.
						start -= limit;
					}
					if (start < 0) start = 0;
					
					var mask = first.insertSibling("<div class='loading'>"+this.localize('loading')+"</div>", 'before', false).mask();
					if (!getPrevDoc) {
						first.destroy();
					}
					
					var id = doc.getId();
					this.setApiParams({'skipToDocId': id, start: start});
					this.setInsertWhere('afterBegin')
					this.setScrollIntoView(scroll);
					this.load();
					this.setApiParam('limit', this.INITIAL_LIMIT);
					break;
				}
				first.destroy(); // remove non word
				first = readerContainer.first();
			}
		}
	},
	
	fetchNext: function(scroll) {
		var readerContainer = this.getInnerContainer().first();
		var last = readerContainer.last();
		if (last.hasCls("loading")===false) {
			while(last) {
				if (last.hasCls("word")) {
					var info = Voyant.data.model.Token.getInfoFromElement(last);
					var docIndex = info.docIndex;
					var start = info.position;
					var doc = this.getDocumentsStore().getAt(info.docIndex);
					var id = doc.getId();
					
					var totalTokens = doc.get('tokensCount-lexical');
					if (start + this.getApiParam('limit') >= totalTokens && docIndex == this.getCorpus().getDocumentsCount()-1) {
						var limit = totalTokens - start;
						if (limit <= 1) {
							last.dom.scrollIntoView();
							last.frame("red")
							break;
						} else {
							this.setApiParam('limit', limit);
						}
					}
					
					// remove any text after the last word
					var nextSib = last.dom.nextSibling;
					while(nextSib) {
						var oldNext = nextSib;
						nextSib = nextSib.nextSibling;
						oldNext.parentNode.removeChild(oldNext);
					}
					
					var mask = last.insertSibling("<div class='loading'>"+this.localize('loading')+"</div>", 'after', false).mask();
					last.destroy();
					this.setApiParams({'skipToDocId': id, start: info.position});
					this.setInsertWhere('beforeEnd');
					this.setScrollIntoView(scroll);
					this.load(); // callback not working on buffered store
					this.setApiParam('limit', this.INITIAL_LIMIT);
					break;
				}
				last.destroy(); // remove non word
				last = readerContainer.last();
			}
		}
	},
	
    load: function(doClear, config) {
    	if (doClear) {
    		this.getInnerContainer().first().destroy(); // clear everything
    		this.getInnerContainer().setHtml('<div class="readerContainer"><div class="loading">'+this.localize('loading')+'</div></div>');
			this.getInnerContainer().first().first().mask();
		}
    	this.getTokensStore().load(Ext.apply(config || {}, {
    		params: Ext.apply(this.getApiParams(), {
    			stripTags: 'blocksOnly',
    			stopList: '' // token requests shouldn't have stopList
    		})
    	}));
    },
    
    updateText: function(contents) {
    	var loadingMask = this.getInnerContainer().down('.loading');
    	if (loadingMask) loadingMask.destroy();
    	// FIXME: something is weird here in tool/Reader mode, this.getInnerContainer() seems empty but this.getInnerContainer().first() gets the canvas?!?
    	var inserted = this.getInnerContainer().first().insertHtml(this.getInsertWhere()/* where is this defined? */, contents, true); // return Element, not dom
    	if (inserted && this.getScrollIntoView()) {
    		inserted.dom.scrollIntoView(); // use dom
    		// we can't rely on the returned element because it can be a transient fly element, but the id is right in a deferred call
    		Ext.Function.defer(function() {
    			var el = Ext.get(inserted.id); // re-get el
    			if (el) {el.frame("red")}
    		}, 100);
    	}
    	var target = this.down('panel[region="center"]').body.dom;
    	var amount;
		if (target.scrollTop == 0) {
			amount = 0;
		} else if (target.scrollHeight - target.scrollTop == target.clientHeight) {
			amount = 1;
		} else {
			amount = (target.scrollTop + target.clientHeight * 0.5) / target.scrollHeight;
		}
    	this.updateLocationMarker(amount);
	},
	
	updateLocationMarker: function(amount, scrollDir) {
		var readerWords = Ext.DomQuery.select('.word', this.getInnerContainer().down('.readerContainer', true));
		var firstWord = readerWords[0];
		var lastWord = readerWords[readerWords.length-1];
		if (firstWord !== undefined && lastWord !== undefined) {
			var corpus = this.getCorpus();
			var partialFirstDoc = false;
			
			var info1 = Voyant.data.model.Token.getInfoFromElement(Ext.get(firstWord));
			var info2 = Voyant.data.model.Token.getInfoFromElement(Ext.get(lastWord));
			if (info1.position !== 0) {
				partialFirstDoc = true;
			}

			var docTokens = {};
			var totalTokens = 0;
			var currIndex = info1.docIndex;
			while (currIndex <= info2.docIndex) {
				var tokens = corpus.getDocument(currIndex).get('tokensCount-lexical');
				if (currIndex === info2.docIndex) {
					tokens = info2.position; // only count tokens up until last displayed word
				}
				if (currIndex === info1.docIndex) {
					tokens -= info1.position; // subtract missing tokens, if any
				}
				totalTokens += tokens;
				docTokens[currIndex] = tokens;
				currIndex++;
			}
			
			var tokenPos = Math.round(totalTokens * amount);
			var docIndex = 0;
			var currToken = 0;
			for (var i = info1.docIndex; i <= info2.docIndex; i++) {
				docIndex = i;
				currToken += docTokens[i];
				if (currToken >= tokenPos) {
					break;
				}
			}
			var remains = (currToken - tokenPos);
			var tokenPosInDoc = docTokens[docIndex] - remains;
			
			if (partialFirstDoc && docIndex === info1.docIndex) {
				tokenPosInDoc += info1.position;
			}
				
			var fraction = tokenPosInDoc / corpus.getDocument(docIndex).get('tokensCount-lexical');

			this.down('readergraph').moveLocationMarker(docIndex, fraction, scrollDir);
		}
	},
    
    updateChart: function() {
    	
    }
});
