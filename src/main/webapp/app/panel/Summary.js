Ext.define('Voyant.panel.Summary', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel', 'Voyant.util.SparkLine'],
	alias: 'widget.summary',
    statics: {
    	i18n: {
    		title: {en: "Summary"},
    		helpTip: {en: "<p>The <i>Summary</i> tool provides general information about the corpus. Many elements in the tool are links that trigger other views. Features include:</p><ul><li>total words (tokens) and word forms (types) and age of the corpus</li><li>most frequent terms in the corpus</li><li>for corpora with more than one documen<ul><li>documents ordered by length and vocabulary density</li><li>distinctive words for each document (by TF-IDF score)</li></ul></li></ul>"},
    		corpusType: {en: '<tpl for="types"><a href="#" onclick="return false" class="corpus-type keyword" voyant:recordId="{id}">{type}</a> ({val})<tpl if="xindex &lt; xcount">, </tpl></tpl>'},
    		documentType: {en: '<tpl for="types"><a href="#" onclick="return false" class="document-type keyword" voyant:recordId="{id}" voyant:val="{docId}:{type}">{type}</a> ({val})<tpl if="xindex &lt; xcount">, </tpl></tpl>'},
    		mostFrequentWords: {en: 'Most <b>frequent words</b> in the corpus: '},
    		docsLength: {en: '<b>Document Length</b> ({spark})<ul><li>longest: <tpl for="longestDocs"><a href="#" onclick="return false" class="document-id" voyant:val="{id}">{title}</a> ({totalWordTokens})</a><tpl if="xindex &lt; xcount">; </tpl></tpl></li><li>shortest: <tpl for="shortestDocs"><a href="#" onclick="return false" class="document-id" voyant:val="{id}">{title}</a> ({totalWordTokens})</a><tpl if="xindex &lt; xcount">; </tpl></tpl></li></ul>'},
    		docsDensity: {en: '<b>Vocabulary Density</b> ({spark})<ul><li>highest: <tpl for="highestDocs"><a href="#" onclick="return false" class="document-id" voyant:val="{id}">{title}</a> ({wordDensity})</a><tpl if="xindex &lt; xcount">; </tpl></tpl></li><li>lowest: <tpl for="lowestDocs"><a href="#" onclick="return false" class="document-id" voyant:val="{id}">{title}</a> ({wordDensity})</a><tpl if="xindex &lt; xcount">; </tpl></tpl></li></ul>'},
    		distinctiveWords: {en: '<b>Distinctive words</b> (compared to the rest of the corpus): '},
    		moreDistinctiveWords: {en: '<a href="#" onclick="return false">Next {0} of {1} remaining</a>'},
    		seeAll: {en: 'All&hellip;'},
    		more: {en: 'More&hellip;'},
    		items: {en: "items"}
    	},
    	api: {
    		stopList: 'auto',
    		start: 0,
    		limit: 5,
    		// The maximum number of documents to show distinctive words for.
    		numberOfDocumentsForDistinctiveWords: 10
    	},
		glyph: 'xf1ea@FontAwesome'
    },
    config: {
    	corpus: undefined,
    	options: {xtype: 'stoplistoption'}
    },
    autoScroll: true,
    cls: 'corpus-summary',
    
    corpusTermsStore: null,
    docsStore: null,
    documentTermsStore: null,
    
    summaryListParent: null,
    
    constructor: function(config ) {

    	Ext.apply(this, {
    		title: this.localize('title'),
    		dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
        		enableOverflow: true,
                items: [{
        			fieldLabel: this.localize('items'),
        			labelWidth: 40,
        			width: 120,
        			xtype: 'slider',
	            	increment: 5,
	            	minValue: 5,
	            	maxValue: 59,
	            	listeners: {
	            		afterrender: function(slider) {
	            			slider.setValue(this.getApiParam("visible"))
	            		},
	            		changecomplete: function(slider, newvalue) {
	            			this.setApiParams({limit: newvalue});
	            			this.loadSummary();
	            		},
	            		scope: this
	            	}
                }]
    		}]
    	});

        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		
    		this.setCorpus(corpus);
    		
    		this.corpusTermsStore = corpus.getCorpusTerms();
    		
    		// create a local version of the store (avoiding buffered and remoteSort issues)
    		this.docStore = Ext.create("Ext.data.Store", {
    			model: "Voyant.data.model.Document",
        		autoLoad: false,
        		remoteSort: false,
        		corpus: this.getCorpus(),
        		proxy: {
					type: 'ajax',
					url: Voyant.application.getTromboneUrl(),
					extraParams: {
						tool: 'corpus.DocumentsMetadata',
						corpus: this.getCorpus().getId()
					},
					reader: {
						type: 'json',
						rootProperty: 'documentsMetadata.documents',
						totalProperty: 'documentsMetadata.total'
					},
					simpleSortMode: true
	   		     },
	   	         listeners: {
	   	        	 load: function(store, records, successful, opts) {
	   	        		 var corpus = this.getCorpus();
	   	        		 records.forEach(function(record) {
	   	        			 record.set('corpus', corpus);
	   	        		 });
	   	        	 },
	   	        	 scope: this
	   	         }
        	});
    		
    		this.documentTermsStore = Ext.create("Ext.data.Store", {
    			model: "Voyant.data.model.DocumentTerm",
        		autoLoad: false,
        		remoteSort: false,
        		corpus: this.getCorpus(),
        		proxy: {
					type: 'ajax',
					url: Voyant.application.getTromboneUrl(),
					extraParams: {
						tool: 'corpus.DocumentTerms',
						corpus: this.getCorpus().getId()
					},
					reader: {
						type: 'json',
			            rootProperty: 'documentTerms.terms',
			            totalProperty: 'documentTerms.total'
					},
					simpleSortMode: true
	   		     }
        	});
    		
    		if (this.rendered) {
    			this.loadSummary();
    		}
    		else {
    			Ext.defer(this.fireEvent, 100, this);
    		}

    	});
    	
    	this.on('activate', function() {
    		if (this.getCorpus()) {
        		this.dispatchEvent('ensureCorpusView', this, this.getCorpus());
    		}
		}, this);

    	// if we need to embed this, do so
    	if (config.embedded) {
    		var cls = Ext.getClass(config.embedded).getName();
    		if (cls=="Voyant.data.model.Corpus") {
    			config.corpus = config.embedded;
    		}
    	}
    	
    	// if we have a corpus, load it
    	if (config && config.corpus) {
    		this.fireEvent('loadedCorpus', this, config.corpus);
    	}
    },
    
    loadSummary: function() {
		var el = this.getLayout().getRenderTarget();
		el.update('');
		this.summaryListParent = Ext.dom.Helper.append(el, '<ul></ul>');
		Ext.dom.Helper.append(this.summaryListParent, '<li>'+this.getCorpus().getShow()+'</li>');
		
		var size = this.getCorpus().getDocumentsCount();
		
		if (size>1) {this.showLongestDocuments();}
		if (size>1) {this.showMostDenseDocuments();}
		this.showMostFrequentWords();
		if (size>1) {this.showDistinctiveWords();}
		
		var params = Ext.apply({}, {
    		limit: null
    	}, this.getApiParams());
    	this.docStore.load({
			params: params
		});
    	
    	this.addLinksHandler();
    	
    },
    
    showLongestDocuments: function() {
    	var parent = Ext.dom.Helper.append(this.summaryListParent, '<li></li>');
    	this.docStore.on('load', function(store, records, success) {
    		var count = store.getTotalCount();
    		if (count > 1) {
    			store.sort('index', 'ASC');
    			var lengths = [];
    			store.each(function(r) {
    				lengths.push(r.get('tokensCount-lexical'));
    			});
    			
    			store.sort('tokensCount-lexical', 'DESC');
    			
    			var limit = parseInt(this.getApiParam("limit"));
    			var data = {
    				shortest: store.getRange(count-limit,count).reverse(),
    				longest: store.getRange(0,limit),
    				all: store.getRange(0,count)
    			};
    			
    			for (var k in data) {
    				if (k) {
    					var items = data[k];
    					for (var i=0;i<items.length;i++) {
    						var doc = items[i];
    						data[k][i] = {
    							title: doc.getShortTitle(),
    							id: doc.get('id'),
    							totalWordTokens: Ext.util.Format.number(doc.get('tokensCount-lexical'),'0,000'),
    							docsLen: items.length
    						};
    					}
    				}
    			}
    			
    			out = new Ext.XTemplate(this.localize('docsLength')).apply({spark: this.getSparkLine(lengths), longestDocs: data.longest, shortestDocs: data.shortest});
    			Ext.dom.Helper.append(parent, out);
    		}

		}, this);
    },
    
    showMostDenseDocuments: function() {
    	var parent = Ext.dom.Helper.append(this.summaryListParent, '<li></li>');
    	this.docStore.on('load', function(store, records, success) {
    		var count = store.getTotalCount();
    		if (count > 1) {
    			store.sort('index', 'ASC');
    			var densities = [];
    			store.each(function(r) {
    				densities.push(r.get('typeTokenRatio-lexical'));
    			});
    			
    			store.sort('typeTokenRatio-lexical', 'DESC');
    			
    			var limit = parseInt(this.getApiParam("limit"));
    			var data = {
    				lowest: store.getRange(count-limit,count).reverse(),
    				highest: store.getRange(0,limit),
    				all: store.getRange(0,count)
    			};
    			
    			for (var k in data) {
    				if (k) {
    					var items = data[k];
    					for (var i=0;i<items.length;i++) {
    						var doc = items[i];
    						data[k][i] = {
    							title: doc.getShortTitle(),
    							id: doc.get('id'),
    							wordDensity: Ext.util.Format.number(doc.get('typeTokenRatio-lexical'),'0.000'),
    							docsLen: items.length
    						};
    					}
    				}
    			}
    			
    			out = new Ext.XTemplate(this.localize('docsDensity')).apply({spark: this.getSparkLine(densities), highestDocs: data.highest, lowestDocs: data.lowest});
    			Ext.dom.Helper.append(parent, out);
    		}
    	}, this);
    },
    
    showMostFrequentWords: function() {
    	var parent = Ext.dom.Helper.append(this.summaryListParent, '<li></li>');
    	var params = this.getApiParams();
		this.corpusTermsStore.load({
			params: params,
			scope: this,
			callback: function(records) {
				var out = this.localize('mostFrequentWords');
				var data = [];
				var len = records.length;
				records.forEach(function(r, index, array) {
					data.push({
						id: r.getId(),
						type: r.getTerm(),
						val: Ext.util.Format.number(r.get('rawFreq'),'0,000'),
						len: len
					});
				});
				out += new Ext.XTemplate(this.localize('corpusType')).applyTemplate({types: data})+'.';
				Ext.dom.Helper.append(parent, out);
			}
		});
    },
    
    showDistinctiveWords: function() {
    	var disParent = Ext.dom.Helper.append(this.summaryListParent, '<li id="distinctiveWords">'+this.localize('distinctiveWords')+'<ol></ol></li>', true);
    	this.showMoreDistinctiveWords();
    },
    
    showMoreDistinctiveWords: function() {
    	var list = Ext.dom.Query.selectNode("#distinctiveWords > ol", this.summaryListParent);
    	var count = Ext.dom.Query.select("li:not(.more)", list).length;
    	var numberOfDocumentsForDistinctiveWords = parseInt(this.getApiParam('numberOfDocumentsForDistinctiveWords'));
    	var range = this.getCorpus().getDocumentsStore().getRange(count, count+numberOfDocumentsForDistinctiveWords-1);
    	if (range && Ext.isArray(range)) {
    		var docIndex = [];
    		range.forEach(function(doc) {
    			docIndex.push(doc.getIndex())
    		})
    		if (docIndex.length>0) {
    			this.documentTermsStore.load({
    				addRecords: true,
    				params: {
    					docIndex: docIndex,
    					perDocLimit: parseInt(this.getApiParam("limit")),
    					limit: numberOfDocumentsForDistinctiveWords*parseInt(this.getApiParam("limit")),
    					sort: 'TFIDF',
    					dir: 'DESC'
    				},
    				scope: this,
    				callback: function(records, operation, success) {
    					var docs = {};
    					if (success && records && Ext.isArray(records)) { // TODO: why wouldn't we have records here?
    						records.forEach(function(r, index, array) {
    							var i = r.getDocIndex();
    							if (!(i in docs)) {docs[i]=[]};
    							docs[i].push({
    								id: r.getId(),
    								type: r.getTerm(),
    								val: Ext.util.Format.number(r.get('rawFreq'),'0,000'),
    								docId: r.get('docId')
    							});

    						});
    						docIndex.forEach(function(index) {
    							var doc = this.getCorpus().getDocument(index);
    							len = docs[index].length; // declare for template
    		    				Ext.dom.Helper.append(list, {tag: 'li', 'voyant:index': String(index), html: 
    		    					'<a href="#" onclick="return false" class="document-id document-id-distinctive" voyant:val="'+doc.get('id')+'">'+doc.getShortTitle()+'</a>'+
    		    					this.localize('colon')+ new Ext.XTemplate(this.localize('documentType')).apply({types: docs[index]})+'.'
    		    				});
    						}, this);
    						len = numberOfDocumentsForDistinctiveWords;
    						remaining = this.getCorpus().getDocumentsStore().getTotalCount() - count - docIndex.length;
    						if (remaining>0) {
        	    				var tpl = new Ext.Template(this.localize('moreDistinctiveWords'));
        						var more = Ext.dom.Helper.append(list, {tag: 'li', cls: 'more', html: tpl.apply([len>remaining ? remaining : len,remaining])}, true);
        						more.on("click", function() {
        							more.remove();
        							this.showMoreDistinctiveWords();
        						}, this)
    						}
    					}
    				}
    			});
    		}
    	}
    },
    
    addLinksHandler: function() {
    	this.body.addListener('click', function(e) {
			var target = e.getTarget(null, null, true);
			if (target && target.dom.tagName == 'A') {
				var params = {};
				if (target.hasCls('corpus-documents')) {
					if (target.hasCls('corpus-documents-length')) {
						params.sortBy = 'totalWordTokens';
					} else if (target.hasCls('corpus-documents-density')) {
						params.sortBy = 'wordDensity';
					}
					params.sortDirection = 'DESC';
//					this.dispatchEvent('CorpusGridBootstrap', this, params);
				} else if (target.hasCls('document-id')) {
//					if (target.hasCls('document-id-distinctive')) {
//						Ext.apply(params, {sortBy: 'relativeFreqCorpusDelta', sortDirection: 'DESC'});
//					}
//					if (target.hasCls('document-id-density')) {
//						Ext.apply(params, {sortBy: 'wordDensity', sortDirection: 'DESC'});
//					}
					
					var docId = target.getAttribute('val', 'voyant');
					var doc = this.docStore.getById(docId);
					this.dispatchEvent('documentsClicked', this, [doc]);
				} else if (target.hasCls('corpus-type')) {
				    var recordId = target.getAttribute('recordId', 'voyant');
					var record = this.corpusTermsStore.getById(recordId);
					this.dispatchEvent('corpusTermsClicked', this, [record]);
				} else if (target.hasCls('corpus-types')) {
					params.query = '';
					if (target.hasCls('corpus-types-peaks')) {
						Ext.apply(params, {sortBy: 'RELATIVEDISTRIBUTIONKURTOSIS', sortDirection: 'DESC', extendedSortZscoreMinimum: 1});
					}
					else {
						Ext.apply(params, {sortBy: 'rawFreq', sortDirection: 'DESC', extendedSortZscoreMinimum: null});
					}
//					this.dispatchEvent('CorpusTypeFrequenciesRequest', this, params, {type: 'whitelist', tools: 'voyeurCorpusTypeFrequenciesGrid'});
				} else if (target.hasCls('document-type')) {
					var recordId = target.getAttribute('recordId', 'voyant');
					var record = this.documentTermsStore.getById(recordId);
					this.dispatchEvent('documentTermsClicked', this, [record]);
				}
			}
		}, this);
    }
});
