Ext.define('Voyant.panel.Reader', {
	extend: 'Ext.panel.Panel',
	requires: ['Voyant.data.store.Tokens'],
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.reader',
    statics: {
    	i18n: {
    		title: {en: "Reader"},
    		helpTip: {en: "<p>The Reader tool provides a view of text from the corpus. Features include:</p><ul><li>frequency information appears when hovering over a word</li><li>distribution information appears in a graph at the bottom when clicking on a word</li><li>a bar graph at the bottom indicates the relative size of each document in the corpus</li><li>a search box for queries (hover over the magnifying icon for help with the syntax)</li></ul>"},
    		documentFrequency: {en: "document frequency:"}
    	},
    	api: {
    		start: 0,
    		limit: 1000,
    		skipToDocId: undefined
    	},
    	glyph: 'xf0f6@FontAwesome'
	},
    config: {
    	corpus: undefined,
    	tokensStore: undefined,
    	documentsStore: undefined,
    	documentTermsStore: undefined,
    	exportVisualization: false,
    	lastScrollTop: 0,
    	scrollDownwards: true
    },
    
    INITIAL_LIMIT: 1000, // need to keep track since limit can be changed when scrolling
    
    innerContainer: null, // set after render
    
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
	    	region: 'south',
	    	height: 40,
	    	split: {
	    		size: 2
	    	},
	    	splitterResize: true,
	    	border: false,
	    	layout: {
	    		type: 'hbox'
	    	}
	    }]
    },
    
    constructor: function() {
    	Ext.apply(this, {
    		title: this.localize('title')
    	});
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
    	var tokensStore = Ext.create("Voyant.data.store.Tokens");
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
	    		this.updateText(contents, true);
	    		
	    		var keyword = this.down('querysearchfield').getValue();
	    		if (keyword != '') {
	    			this.highlightKeywords(keyword);
	    		}
    		}
    	}, this);
    	this.setTokensStore(tokensStore);
    	
    	this.on("query", function(src, query) {
    		this.loadQueryTerms([query]);
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
					bins: 25
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
   		    		 var graphDatas = {};
   		    		 var maxValue = 0;
   		    		 var term; // store last accessed term
   		    		 store.each(function(r) {
   		    			 var graphData = [];
   		    			 var dist = r.get('distributions');
   		    			 var docId = r.get('docId');
   		    			 var docIndex = r.get('docIndex');
   		    			 term = r.get('term');
   		    			 for (var i = 0; i < dist.length; i++) {
   		    				 var bin = i;//docIndex * dist.length + i;
   		    				 var val = dist[i];
   		    				 if (val > maxValue) maxValue = val;
   		    				 graphData.push([docId, docIndex, bin, val, term]);
   		    			 }
   		    			 graphDatas[docIndex] = graphData;
   		    		 }, this);
   		    		 
   		    		 this.highlightKeywords(term);
   		    		 this.down('querysearchfield').setValue(term);
   		    		 
   		    		 var graphs = this.query('cartesian');
   		    		 for (var i = 0; i < graphs.length; i++) {
   		    			 var graph = graphs[i];
   		    			 var data = graphDatas[i];
   		    			 if (data !== undefined) {
   		    				 graph.getAxes()[0].setMaximum(maxValue);
 		    				 graph.getStore().loadData(data);
   		    			 } else {
   		    				 graph.getStore().removeAll();
   		    			 }
   		    		 }
   		    	 },
   		    	 scope: this
   		     }
    	}));
    	
    	this.on("afterrender", function() {
    		var centerPanel = this.down('panel[region="center"]');
    		this.innerContainer = centerPanel.getLayout().getRenderTarget();
    		
    		// scroll listener
    		centerPanel.body.on("scroll", function(event, target) {
    			var readerContainer = this.innerContainer.first();
    			var downwardsScroll = this.getLastScrollTop() < target.scrollTop;
    			// scroll up
    			if (!downwardsScroll && target.scrollTop < 1) {
    				this.fetchPrevious();
    			// scroll down
    			} else if (downwardsScroll && target.scrollTop+target.offsetHeight>target.scrollHeight/2) { // more than half-way down
    				this.fetchNext();
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
    				this.getApplication().dispatchEvent('termsClicked', this, data);
    			}
    		}, this);
    		
    		if (this.getCorpus()) {this.load();}
    	}, this);
    	
    	Ext.apply(this, {
    		// TODO clearing search loads default document terms into chart but probably shouldn't
    		dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                items: [{
                	glyph: 'xf060@FontAwesome',
            		handler: function() {
            			this.fetchPrevious();
            		},
            		scope: this
            	},{
            		glyph: 'xf061@FontAwesome',
            		handler: function() {
            			this.fetchNext();
            		},
            		scope: this
            	},{xtype: 'tbseparator'},{
                    xtype: 'querysearchfield'
                }]
    		}],
    		listeners: {
    			loadedCorpus: function(src, corpus) {
    				this.setCorpus(corpus);
    	    		this.getTokensStore().setCorpus(corpus);
    	    		this.getDocumentTermsStore().getProxy().setExtraParam('corpus', corpus.getId());
    	    		
    	    		var docs = corpus.getDocuments();
    	    		this.setDocumentsStore(docs);
    	    		var container = this.down('panel[region="south"]');
    	    		
    	    		this.generateChart(corpus, container);
    	    		
    	    		if (this.rendered) {
    	    			this.load();
    	    		}
    			},
            	termsClicked: function(src, terms) {
            		var queryTerms = [];
            		terms.forEach(function(term) {
            			if (term.term) {queryTerms.push(term.term);}
            		});
            		this.loadQueryTerms(queryTerms);
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
        		documentsClicked: function(src, documents, corpus) {
        			if (documents) {
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
        		scope: this
    		}
    	});
    	
        this.callParent(arguments);
    },
    
    loadQueryTerms: function(queryTerms) {
    	if (queryTerms && queryTerms.length > 0) {
			this.getDocumentTermsStore().load({
				params: {
					query: queryTerms,
    				docIndex: undefined,
    				docId: undefined,
    				page: undefined,
    				start: undefined,
    				limit: undefined
    			}
			});
		}
    },
    
    generateChart: function(corpus, container) {
    	function getColor(index, alpha) {
    		var colors = [[116,116,181], [139,163,83], [189,157,60], [171,75,75], [174,61,155]];
    		var c = colors[index % colors.length];
    		return 'rgba('+c[0]+','+c[1]+','+c[2]+','+alpha+')';
    	}
    	
    	function map(value, istart, istop, ostart, ostop) {
			return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
		}
    	
    	function addChart(docInfo, reader) {
    		var index = docInfo.index;
    		var fraction = docInfo.fraction;
    		var height = docInfo.relativeHeight;
    		var bColor = getColor(index, 0.3);
    		var sColor = getColor(index, 1.0);
    		var chart = container.add({
    			xtype: 'cartesian',
    	    	flex: fraction,
    	    	height: '100%',
    	    	insetPadding: 0,
    	    	background: {
    	    		type: 'linear',
    	    		degrees: 90,
    	    		stops: [{
    	    			offset: 0,
    	    			color: bColor
    	    		},{
    	    			offset: height,
    	    			color: bColor
    	    		},{
    	    			offset: height,
    	    			color: 'white'
    	    		},{
    	    			offset: 1,
    	    			color: 'white'
    	    		}]
    	    	},
    	    	axes: [{
    	    		type: 'numeric',
    	    		position: 'left',
    	    		fields: 'distribution',
    	    		hidden: true
    	    	},{
    				type: 'category',
    				position: 'bottom',
    				fields: 'bin',
    				hidden: true
        		}],
        		series: [{
        			type: 'line',
        			xField: 'bin',
        			yField: 'distribution',
        			style: {
        				lineWidth: 2,
        				strokeStyle: sColor
        			},
                    tooltip: {
                    	corpus: corpus,
                        trackMouse: true,
                        style: 'background: #fff',
                        showDelay: 0,
                        dismissDelay: 500,
                        hideDelay: 5,
                        renderer: function(storeItem, item) {
                            this.setHtml(corpus.getDocument(storeItem.get('docIndex')).getTitle()+"<br>"+storeItem.get('term') + ': ' + storeItem.get('distribution'));
                        }
                    }
        		}],
    	    	store: Ext.create('Ext.data.ArrayStore', {
            		fields: ['docId', 'docIndex', 'bin', 'distribution', 'term'],
            		data: []
            	})
    		});
    		
    		// hack to deal with itemclick bug
    		chart.body.on('click', function(event, target) {
    			var el = Ext.get(target);
    			var x = event.getX();
    			var box = el.getBox();
    			var fraction = (x - box.x) / box.width;
    			var chartContainer = el.parent('.x-panel');
    			var containerParent = chartContainer.parent();
    			var children = Ext.toArray(containerParent.dom.children);
    			var docIndex = children.indexOf(chartContainer.dom);
    			var doc = this.getDocumentsStore().getAt(docIndex);
    			this.getApplication().dispatchEvent('documentsClicked', this, [doc]);
    		}, reader);
    	}
    	
    	container.removeAll();
    	
    	var docs = corpus.getDocuments();
    	var docsCount = docs.getTotalCount();
    	if (docsCount<50) {
    		
    	
	    	var tokensTotal = corpus.getWordTokensCount();
	    	var docInfos = [];
	    	var docMinSize = 1000000;
	    	var docMaxSize = -1;
	//		for (var i = 0; i < docs.getTotalCount(); i++) {
			for (var i = 0; i < docs.getCount(); i++) {
				var d = docs.getAt(i);
				var docIndex = d.get('index');
				var count = d.get('tokensCount-lexical');
				if (count < docMinSize) docMinSize = count;
				if (count > docMaxSize) docMaxSize = count;
				var fraction = count / tokensTotal;
				docInfos.push({
					index: docIndex,
					count: count,
					fraction: fraction
				});
			}
			
			for (var i = 0; i < docInfos.length; i++) {
				var d = docInfos[i];
				d.relativeHeight = d.count==docMaxSize ? 1 : map(d.count, docMinSize, docMaxSize, 0, 1);
				addChart(d, this);
			}
    	}
    },
    
    highlightKeywords: function(query, doScroll) {
		if (!Ext.isArray(query)) query = [query];
		
		this.innerContainer.first().select('span[class*=keyword]').removeCls('keyword');
		
		var spans = [];
		var caseInsensitiveQuery = new RegExp('^'+query[0]+'$', 'i');
		var nodes = this.innerContainer.first().select('span.word');
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
    
	fetchPrevious: function() {
		var readerContainer = this.innerContainer.first();
		var first = readerContainer.first('.word');
		if (first != null && first.hasCls("loading")===false) {
			while(first) {
				if (first.hasCls("word")) {
					var info = Voyant.data.model.Token.getInfoFromElement(first);
					var docIndex = parseInt(info.docIndex);
					var start = parseInt(info.position);
					var doc = this.getDocumentsStore().getAt(docIndex);    						
					var limit = this.getApiParam('limit');
					var getPrevDoc = false;
					if (docIndex === 0 && start === 0) {
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
					this.setScrollDownwards(false);
					this.load();
					this.setApiParam('limit', this.INITIAL_LIMIT);
					break;
				}
				first.destroy(); // remove non word
				first = readerContainer.first();
			}
		}
	},
	
	fetchNext: function() {
		var readerContainer = this.innerContainer.first();
		var last = readerContainer.last();
		if (last.hasCls("loading")===false) {
			// store any text that occurs after last word
			var lastText = $(readerContainer.dom).contents().filter(function() {
				return this.nodeType === 3;
			}).last();
			while(last) {
				if (last.hasCls("word")) {
					var info = Voyant.data.model.Token.getInfoFromElement(last);
					var docIndex = parseInt(info.docIndex);
					var start = parseInt(info.position);
					var doc = this.getDocumentsStore().getAt(info.docIndex);
					var id = doc.getId();
					
					var totalTokens = doc.get('tokensCount-lexical');
					if (start + this.getApiParam('limit') >= totalTokens && docIndex == this.getCorpus().getDocumentsCount()-1) {
						var limit = totalTokens - start;
						if (limit <= 1) {
							break;
						} else {
							this.setApiParam('limit', limit);
						}
					}
					
					// remove any text after the last word
					if (last.el.dom.nextSibling === lastText[0]) {
						lastText.remove();
					}
					
					var mask = last.insertSibling("<div class='loading'>"+this.localize('loading')+"</div>", 'after', false).mask();
					last.destroy();
					this.setApiParams({'skipToDocId': id, start: info.position});
					this.setScrollDownwards(true);
					this.load();
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
    		this.innerContainer.first().destroy(); // clear everything
    		this.innerContainer.setHtml('<div class="readerContainer"><div class="loading">'+this.localize('loading')+'</div></div>');
			this.innerContainer.first().first().mask();
    	}
    	this.getTokensStore().load(Ext.apply(config || {}, {
    		params: Ext.apply(this.getApiParams(), {
    			stripTags: 'blocksOnly'
    		})
    	}));
    },
    
    updateText: function(contents) {
    	var loadingMask = this.innerContainer.down('.loading');
    	if (loadingMask) loadingMask.destroy();
    	var where = this.getScrollDownwards() ? 'beforeEnd' : 'afterBegin';
    	this.innerContainer.first().insertHtml(where, contents);
    },
    
    updateChart: function() {
    	
    }
});
