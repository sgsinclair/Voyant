Ext.define('Voyant.panel.Reader', {
	extend: 'Ext.panel.Panel',
	requires: ['Voyant.data.store.Tokens'],
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.reader',
    statics: {
    	i18n: {
    		title: {en: "Reader"},
    		documentFrequency: {en: "document frequency:"}
    	},
    	api: {
    		start: 0,
    		limit: 1000
    	}
    },
    config: {
    	corpus: undefined,
    	tokensStore: undefined,
    	documentsStore: undefined,
    	documentTermsStore: undefined
    },
    
    cls: 'voyant-reader',
    
    layout: 'border',
    
    items: [{
    	bodyPadding: 10,
    	region: 'center',
    	border: false,
    	height: 'auto',
    	autoScroll: true
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
    }],
    
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
	    		records.forEach(function(record) {
	    			if (record.getPosition()==0) {
	    				contents+="<h3>"+this.getDocumentsStore().getById(record.getDocId()).getFullLabel()+"</h3>";
	    			}
	    			if (record.getDocIndex()!=docIndex) {
	    				isPlainText = this.getDocumentsStore().getById(record.getDocId()).isPlainText();
	    				docIndex = record.getDocIndex();
	    			}
	    			if (record.isWord()) {
	    				contents += "<span class='word' id='"+ record.getId() + "' data-qtip='"+documentFrequency+" "+record.getDocumentRawFreq()+"'>"+ record.getTerm() + "</span>";
	    			}
	    			else {
	    				contents += record.getTermWithLineSpacing(isPlainText);
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
					// TODO offsets and positions not implemented yet
					withPositions: true,
					withOffsets: true,
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
    		// scroll listener
    		this.items.getAt(0).body.on("scroll", function() {
    			var cmp = this.items.getAt(0);
    			var body = cmp.body;
    			var dom = body.dom;
    			if (dom.scrollTop+dom.offsetHeight>dom.scrollHeight/2) { // more than half-way down
    				var target = cmp.getLayout().getRenderTarget();
    				var last = target.last();
    				if (last.hasCls("loading")==false) {
    					while(last) {
    						if (last.hasCls("word")) {
    	    					var mask = last.insertSibling("<div class='loading'>"+this.localize('loading')+"</div>", 'after', false).mask();
    	    					var info = Voyant.data.model.Token.getInfoFromElement(last);
    	    					last.destroy();
//								console.warn(info.docIndex);
    	    					var doc = this.getDocumentsStore().getAt(info.docIndex);
    	    					var id = doc.getId();
//    	    					console.warn(info.docIndex, doc, id);
    	    					this.setApiParams({'skipToDocId': id, start: info.position});
    							this.load();
    							break;
    						}
    						last.destroy(); // remove non word
    						last = target.last();
    					}
    				}
    			}
    		}, this);
    		
    		// click listener
    		this.items.getAt(0).body.on("click", function(event, target) {
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
    					var doc = this.getCorpus().getDocument(docIndex);
    					this.setApiParams({'skipToDocId': doc.getId(), start: position});
    					this.load(true);
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
    	
    	function addChart(docInfo) {
    		var index = docInfo.index;
    		var fraction = docInfo.fraction;
    		var height = docInfo.relativeHeight;
    		var bColor = getColor(index, 0.3);
    		var sColor = getColor(index, 1.0);
    		container.add({
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
                        trackMouse: true,
                        style: 'background: #fff',
                        showDelay: 0,
                        dismissDelay: 500,
                        hideDelay: 5,
                        renderer: function(storeItem, item) {
                            this.setHtml(storeItem.get('term') + ': ' + storeItem.get('distribution'));
                        }
                    }
        		}],
    	    	store: Ext.create('Ext.data.ArrayStore', {
            		fields: ['docId', 'docIndex', 'bin', 'distribution', 'term'],
            		data: []
            	})
    		});
    	}
    	
    	container.removeAll();
    	
    	var docs = corpus.getDocuments();
    	var tokensTotal = corpus.getWordTokensCount();
    	var docInfos = [];
    	var docMinSize = 1000000;
    	var docMaxSize = -1;
		for (var i = 0; i < docs.getTotalCount(); i++) {
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
			addChart(d);
		}
    },
    
    highlightKeywords: function(query, doScroll) {
		if (!Ext.isArray(query)) query = [query];
		
		var target = this.items.getAt(0).getLayout().getRenderTarget();
		
		target.select('span[class*=keyword]').removeCls('keyword');
		
		var spans = [];
		var caseInsensitiveQuery = new RegExp('^'+query[0]+'$', 'i');
		var nodes = target.select('span.word');
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
    
    load: function(doClear) {
    	if (doClear) {
    		var target = this.items.getAt(0).getLayout().getRenderTarget();
			target.setHtml("<div class='loading'>"+this.localize('loading')+"</div>"); // clear everything
			target.first().mask();
    	}
    	this.getTokensStore().load({
    		params: Ext.apply(this.getApiParams(), {
    			stripTags: 'blocksOnly'
    		})
    	});
    },
    
    updateText: function(contents) {
    	var target = this.items.getAt(0).getLayout().getRenderTarget();
    	var last = target.last();
    	if (last && last.isMasked()) {last.destroy();}
		target.insertHtml('beforeEnd', contents);
    },
    
    updateChart: function() {
    	
    }
});