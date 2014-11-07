Ext.define('Voyant.panel.Summary', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel', 'Voyant.util.SparkLine'],
	alias: 'widget.summary',
    statics: {
    	i18n: {
    		title: {en: "Summary"},
    		corpusType: {en: '<tpl for="types"><a href="#" onclick="return false" class="corpus-type keyword">{type}</a> ({val})<tpl if="xindex &lt; len">, </tpl></tpl>'},
    		documentType: {en: '<tpl for="types"><a href="#" onclick="return false" class="document-type keyword" voyant:val="{docId}:{type}">{type}</a> ({val})<tpl if="xindex &lt; len">, </tpl></tpl>'},
    		mostFrequentWords: {en: 'Most <b>frequent words</b> in the corpus: '},
    		docsLength: {en: '<ul><tpl for="docs"><li><a href="#" onclick="return false" class="document-id" voyant:val="{id}">{title}</a> ({totalWordTokens})</li></tpl></ul>'},
    		docsLengthLongest: {en: '<b>Longest documents</b> (by words {0})'},
    		docsLengthShortest: {en: 'Shortest documents'},
    		docsLengthAll: {en: 'Documents ordered by number of words ({0})'},
    		docsDensity: {en: '<ul><tpl for="docs"><li><a href="#" onclick="return false" class="document-id" voyant:val="{id}">{title}</a> ({wordDensity})</li></tpl></ul>'},
    		docsDensityHighest: {en: 'Highest <b>vocabulary density</b> ({0})'},
    		docsDensityLowest: {en: 'Lowest density'},
    		docsDensityAll: {en: 'Documents ordered by vocabulary density ({0})'},
    		distinctiveWords: {en: '<b>Distinctive words</b> (compared to the rest of the corpus): '}
    	},
    	api: {
    		stopList: 'auto',
    		start: 0,
    		limit: 5
    	}
    },
    config: {
    	corpus: undefined
    },
    autoScroll: true,
    cls: 'corpus-summary',
    
    docsStore: null,
    documentTermsStore: null,
    
    summaryListParent: null,
    
    constructor: function(config ) {

    	Ext.apply(this, {
    		title: this.localize('title')
    	});

        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		
    		this.setCorpus(corpus);
    		
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
	   	        		 var corpus = this.getCorpus().getId();
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
    			this.summaryListParent = Ext.dom.Helper.append(this.getLayout().getRenderTarget(), '<ul></ul>');
    			Ext.dom.Helper.append(this.summaryListParent, '<li>'+corpus.getShow()+'</li>');
    			
    			this.showLongestDocuments();
    			this.showMostDenseDocuments();
    			this.showMostFrequentWords();
    			this.showDistinctiveWords();
    			
    			var params = Ext.apply({}, {
    	    		limit: null
    	    	}, this.getApiParams());
    	    	this.docStore.load({
    				params: params
    			});
    		}
    		else {
    			Ext.defer(this.fireEvent, 100, this);
    		}

    	});
    	
    	this.on("activate", function() {
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
    
    showLongestDocuments: function() {
    	this.docStore.on('load', function(store, records, success) {
    		var count = store.getTotalCount();
    		if (count > 1) {
    			store.sort('index', 'ASC');
    			var lengths = [];
    			store.each(function(r) {
    				lengths.push(r.get('tokensCount-lexical'));
    			});
    			
    			store.sort('tokensCount-lexical', 'DESC');
    			
    			var data = {
    				shortest: store.getRange(count-2,count).reverse(),
    				longest: store.getRange(0,1),
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
    			
    			var tpl = new Ext.XTemplate(this.localize('docsLength'));
    			var out = '';
    			if (count>5) {
    				out += new Ext.Template(this.localize('docsLengthLongest')) + this.localize('colon') + tpl.apply({docs: data.longest});
    				out += this.localize('docsLengthShortest') + this.localize('colon') + tpl.apply({docs: data.shortest});
    				out += "<a href='#' onclick='return false' class='corpus-documents corpus-documents-length'>"+this.localize('seeAll')+'</a>';
    			}
    			else {
    				out += new Ext.Template(this.localize('docsLengthAll')).apply([this.getSparkLine(lengths)]) + this.localize('colon') + tpl.apply({docs: data.all});
    			}
    			Ext.dom.Helper.append(this.summaryListParent, '<li>'+out+'</li>');
    		} else {
    			
    		}

		}, this);
    },
    
    showMostDenseDocuments: function() {
    	this.docStore.on('load', function(store, records, success) {
    		var count = store.getTotalCount();
    		if (count > 1) {
    			store.sort('index', 'ASC');
    			var densities = [];
    			store.each(function(r) {
    				densities.push(r.get('typeTokenRatio-lexical'));
    			});
    			
    			store.sort('typeTokenRatio-lexical', 'DESC');
    			
    			var data = {
    				lowest: store.getRange(count-2,count).reverse(),
    				highest: store.getRange(0,1),
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
    			
    			var tpl = new Ext.XTemplate(this.localize('docsDensity'));
    			var out = '';
    			if (count>5) {
    				out += new Ext.Template(this.localize('docsDensityHighest')).applyTemplate([this.getSparkLine(densities)]) + this.localize('colon') + tpl.apply({docs: data.highest});
    				out += this.localize('docsDensityLowest') + this.localize('colon') + tpl.apply({docs: data.lowest});
    				out += "<a href='#' onclick='return false' class='corpus-documents corpus-documents-density'>"+this.localize('seeAll')+'</a>';
    			}
    			else {
    				out += new Ext.Template(this.localize('docsDensityAll')).applyTemplate([this.getSparkLine(densities)])  + this.localize('colon') + tpl.apply({docs: data.all});
    			}
    			
    			Ext.dom.Helper.append(this.summaryListParent, '<li>'+out+'</li>');
    		}
    	}, this);
    },
    
    showMostFrequentWords: function() {
    	var corpus = this.getCorpus();
    	var corpusTerms = corpus.getCorpusTerms();
    	var params = this.getApiParams();
		corpusTerms.load({
			scope: this,
			callback: function(records) {
				var message = this.localize('mostFrequentWords');
				var data = [];
				var len = records.length;
				records.forEach(function(r, index, array) {
					data.push({
						type: r.getTerm(),
						val: Ext.util.Format.number(r.get('rawFreq'),'0,000'),
						len: len
					});
				});
				message += new Ext.XTemplate(this.localize('corpusType')).applyTemplate({types: data})+'.';
				Ext.dom.Helper.append(this.summaryListParent, '<li>'+message+'</li>');
			},
			params: params
		});
    },
    
    showDistinctiveWords: function() {
    	var message = this.localize('distinctiveWords');
    	var disParentEl = Ext.dom.Helper.append(this.summaryListParent, '<li>'+message+'<ul></ul></li>');
    	var listParentEl = disParentEl.querySelector('ul');
    	
    	this.docStore.on('load', function(store, records, success) {
    		var count = store.getTotalCount();
    		if (count > 1) {
    			store.sort('index', 'ASC');
    			store.each(function(r) {
    				var listItemEl = Ext.dom.Helper.append(listParentEl, '<li>'+r.getShortTitle()+'</li>');
	    			this.documentTermsStore.load({
	    				params: {
	    					docId: r.getId(),
	    					limit: 5,
	    					sort: 'TFIDF',
	        				dir: 'DESC',
	    				},
	    				scope: this,
						callback: function(records) {
							var data = [];
							var len = records.length;
							records.forEach(function(r, index, array) {
								data.push({
									type: r.getTerm(),
									val: Ext.util.Format.number(r.get('rawFreq'),'0,000'),
									docId: r.get('docId'),
									len: len
								});
							});
							Ext.dom.Helper.append(listItemEl, this.localize('colon')+new Ext.XTemplate(this.localize('documentType')).apply({types: data})+'.');
						}
	    			});
    			}, this);
    		}
    	}, this);
    }
});
