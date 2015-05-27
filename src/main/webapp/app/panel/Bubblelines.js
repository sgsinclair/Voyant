// assuming Bubblelines library is loaded by containing page (via voyant.jsp)
Ext.define('Voyant.panel.Bubblelines', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.bubblelines',
    statics: {
    	i18n: {
    		title: {en: 'Bubblelines'},
			type : {en: 'Visualization'},
			findTerm : {en: 'Find Term'},
			clearTerms : {en: 'Clear Terms'},
			removeTerm : {en: 'Remove Term'},
			showTerm : {en: 'Show Term'},
			hideTerm : {en: 'Hide Term'},
			granularity : {en: 'Granularity'},
			separateLines : {en: 'Separate Lines for Terms'},
			total : {en: 'Total'},
			corpusTooSmall : {en: 'The provided corpus is too small for this tool.'},
			help: {en: "Bubblelines visualizes the frequency and repetition of  a term's use in a corpus. Each document in the corpus is represented as a horizontal line and divided into segments of equal lengths. Each term is represented as a bubble, the size of the bubble indicates its frequency in the corresponding segment of text. The larger the bubble's radius the more frequently the term occurs."},
			adaptedFrom: {en: ''}
    	},
    	api: {
    		/**
    		 * @property bins How many "bins" to separate a document into.
    		 * @type Integer
    		 */
    		bins: 50,
        	/**
        	 * @property query A string to search for in a document.
        	 * @type String
        	 */
    		query: null,
    		/**
    		 * @property stopList The stop list to use to filter results.
    		 * Choose from a pre-defined list, or enter a comma separated list of words, or enter an URL to a list of stop words in plain text (one per line).
    		 * @type String
    		 */
    		stopList: 'auto',
    		/**
    		 * @property docId The document ID to restrict results to.
    		 * @type String
    		 */
    		docId: undefined,
    		/**
    		 * @property docIndex The document index to restrict results to.
    		 * @type Integer
    		 */
    		docIndex: undefined
    	},
    	glyph: 'xf06e@FontAwesome'
	},
	config: {
		corpus: undefined,
		docTermStore: undefined,
		docStore: undefined
	},
	
	selectedDocs: undefined,
	processedDocs: new Ext.util.MixedCollection(),
	
	bubblelines: null, // the viz itself
	
	termTpl: new Ext.XTemplate(
		'<tpl for=".">',
			'<div class="term" style="color: rgb({color});float: left;padding: 3px;margin: 2px;">{term}</div>',
		'</tpl>'
	),
	termStore: new Ext.data.ArrayStore({
        fields: ['term', 'color'],
        listeners: {
        	load: function(store, records, successful, options) {
        		var termsView = this.down('#termsView');
        		for (var i = 0; i < records.length; i++) {
        			var r = records[i];
        			termsView.select(r, true);
        		}
        	},
        	scope: this
        } 
    }),
    
    constructor: function() {
    	Ext.apply(this, {
    		title: this.localize('title')
    	});
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
    	this.on('loadedCorpus', function(src, corpus) {
    		this.setCorpus(corpus);
    		this.getDocStore().getProxy().setExtraParam('corpus', corpus.getId());
    		if (this.isVisible()) {
        		this.getDocStore().load();
    		}
    		this.getDocTermStore().getProxy().setExtraParam('corpus', corpus.getId());
    	}, this);
    	
        this.on('activate', function() { // load after tab activate (if we're in a tab panel)
			if (this.getCorpus()) {				
				Ext.Function.defer(function() {this.getDocStore().load()}, 100, this);
			}
    	}, this);
        
        
        this.on('query', function(src, query) {
    		if (query !== undefined && query != '') {
    			this.getDocTermsFromQuery(query);
    		}
    	}, this);
    	
    	this.on('termsClicked', function(src, terms) {
    		if (src !== this) {
	    		var queryTerms = [];
	    		terms.forEach(function(term) {
	    			if (term.term) {queryTerms.push(term.term);}
	    		});
	    		this.getDocTermsFromQuery(queryTerms);
    		}
		}, this);
    	
    	this.on('documentTermsClicked', function(src, terms) {
    		var queryTerms = [];
    		terms.forEach(function(term) {
    			if (term.getTerm()) {queryTerms.push(term.getTerm());}
    		});
    		this.getDocTermsFromQuery(queryTerms);
    	}, this);
    	
    	this.down('#granularity').setValue(parseInt(this.getApiParam('bins')));
    },
    
    initComponent: function() {
    	var docStore = Ext.create("Ext.data.Store", {
			model: "Voyant.data.model.Document",
    		autoLoad: false,
    		remoteSort: false,
    		proxy: {
				type: 'ajax',
				url: Voyant.application.getTromboneUrl(),
				extraParams: {
					tool: 'corpus.DocumentsMetadata'
				},
				reader: {
					type: 'json',
					rootProperty: 'documentsMetadata.documents',
					totalProperty: 'documentsMetadata.total'
				},
				simpleSortMode: true
   		     },
   		     listeners: {
   		    	load: function(store, records, successful, options) {
   					this.processDocuments(records);
   					this.processedDocs.each(function(doc) {
   						this.bubblelines.addDocToCache(doc);
   					}, this);
   					// get the top 5 corpus terms
   					this.loadFromCorpusTerms(this.getCorpus().getCorpusTerms({autoload: false}));
   				},
   				scope: this
   		     }
    	});
    	this.setDocStore(docStore);
    	
    	var docTermStore = Ext.create("Ext.data.Store", {
			model: "Voyant.data.model.DocumentTerm",
    		autoLoad: false,
    		remoteSort: false,
    		proxy: {
				type: 'ajax',
				url: Voyant.application.getTromboneUrl(),
				extraParams: {
					tool: 'corpus.DocumentTerms',
					withDistributions: 'raw',
					withPositions: true
				},
				reader: {
					type: 'json',
		            rootProperty: 'documentTerms.terms',
		            totalProperty: 'documentTerms.total'
				},
				simpleSortMode: true
   		     },
   		     listeners: {
   		    	 load: function(store, records, successful, options) {
   		    		records.forEach(function(record) {
   		    			var termData = this.processTerms(record);
   		    			var docId = record.get('docId');
   		    			var term = record.get('term');
   		    			var termObj = {};
   		    			termObj[term] = termData;
   		    			this.bubblelines.addTermsToDoc(termObj, docId);
   		    		}, this);
   		    		this.bubblelines.doLayout();

//   					this.processDocuments();
//   					if (this.maxFreqChanged) {
//   						this.calculateBubbleRadii();
//   					} else {
//   						this.calculateBubbleRadii(options.params.type);
//   					}
//   					this.bubblelines.setCanvasHeight();
//   					this.bubblelines.drawGraph();
   				},
   				scope: this
   		     }
    	});
    	this.setDocTermStore(docTermStore);
    	
    	Ext.apply(this, {
    		dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                items: [{
                	xtype: 'querysearchfield'
                },{
	            	xtype: 'button',
	            	text: this.localize('clearTerms'),
	            	handler: function() {
	            		this.down('#termsView').getSelectionModel().deselectAll(true);
	            		this.termStore.removeAll();
	            		this.setApiParams({query: null});
	            		this.bubblelines.removeAllTerms();
	            		this.bubblelines.drawGraph();
	            	},
	            	scope: this
	            },
	//            '-',{
	//            	xtype: 'documentSelector',
	//            	listeners: {
	//            		documentsSelected: function(docIds) {
	//            			this.setApiParams({docId: docIds});
	//            			
	//            			this.filterDocuments();
	//            			
	//            			var container = Ext.getCmp('canvasParent');
	//            			var height = Math.max(this.selectedDocs.getCount() * this.graphSeparation + 15, container.ownerCt.getHeight());
	//        				var width = container.ownerCt.getWidth();
	//        				this.canvas.height = height;
	//            			
	//            			this.selectedDocs.each(this.bubblelines.findLongestDocument, this);
	//            			this.selectedDocs.each(this.bubblelines.findLongestDocumentTitle, this);
	//        				this.bubblelines.setMaxLineWidth(width - this.MAX_LABEL_WIDTH - 75);    
	//            			
	//            			this.reloadTermsData();
	//            		},
	//            		scope: this
	//            	}
	//            }
	            ,'-',{
	            	xtype: 'slider',
	            	itemId: 'granularity',
	            	fieldLabel: this.localize('granularity'),
	            	labelAlign: 'right',
	            	labelWidth: 70,
	            	width: 200,
	            	increment: 10,
	            	minValue: 10,
	            	maxValue: 300,
	            	listeners: {
	            		changecomplete: function(slider, newvalue) {
	            			this.setApiParams({bins: newvalue});
	            			this.reloadTermsData();
	            		},
	            		scope: this
	            	}
	            },'-',{
	            	xtype: 'checkbox',
	            	boxLabel: this.localize('separateLines'),
	            	boxLabelAlign: 'before',
	            	checked: false,
	            	handler: function(checkbox, checked) {
	            		this.bubblelines.SEPARATE_LINES_FOR_TERMS = checked;
	            		this.bubblelines.lastClickedBubbles = {};
	            		this.bubblelines.setCanvasHeight();
	    				this.bubblelines.drawGraph();
	            	},
	            	scope: this
	            	
	            }]
    		}],
            border: false,
            layout: 'fit',
            items: {
            	layout: {
            		type: 'vbox',
            		align: 'stretch'
            	},
            	defaults: {border: false},
	            items: [{
	            	height: 30,
	            	itemId: 'termsView',
	            	xtype: 'dataview',
	            	store: this.termStore,
	            	tpl: this.termTpl,
	            	itemSelector: 'div.term',
	            	overItemCls: 'over',
	            	selectedItemCls: 'selected',
	            	focusCls: '',
	            	listeners: {
	            		beforeitemclick: function(dv, record, item, index, event, opts) {
	            			event.preventDefault();
	            			event.stopPropagation();
	            			dv.fireEvent('itemcontextmenu', dv, record, item, index, event, opts);
	            			return false;
	            		},
	            		selectionchange: function(selModel, selections) {
	            			var dv = this.down('#termsView');
	            			var terms = [];
	            			
	            			var allTerms = dv.el.query('div[class*=term]');
	            			for (i = 0; i < allTerms.length; i++) {
	            				Ext.fly(allTerms[i]).addCls('unselected');
	            			}
	            			
	            			var i, rec;
	            			for (i = 0; i < selections.length; i++) {
	            				rec = selections[i];
	            				terms.push(rec.get('term'));
	            				Ext.fly(dv.getNode(rec)).removeCls('unselected');
	            			}
	            			
	            			for (i in this.lastClickedBubbles) {
	            				var lcTerms = this.lastClickedBubbles[i];
	            				for (term in lcTerms) {
	            					if (terms.indexOf(type) == -1) {
	            						delete this.lastClickedBubbles[i][term];
	            					}
	            				}
	            				
	            			}
	            			this.setApiParams({typeFilter: terms});
	            			this.bubblelines.setCanvasHeight();
	            			this.bubblelines.drawGraph();
	            		},
	            		itemcontextmenu: function(dv, record, el, index, event) {
	            			event.preventDefault();
	            			event.stopPropagation();
	            			var isSelected = dv.isSelected(el);
	            			var menu = new Ext.menu.Menu({
	            				floating: true,
	            				items: [
//	            				{
//	            					text: isSelected ? this.localize('hideTerm') : this.localize('showTerm'),
//	            					handler: function() {
//	            						if (isSelected) {
//	            							dv.deselect(record);
//	            						} else {
//	            							dv.select(record, true);
//	            						}
//	            					},
//	            					scope: this
//	            				},
	            				{
	            					text: this.localize('removeTerm'),
	            					handler: function() {
	            						dv.deselect(index);
	            						var term = this.termStore.getAt(index).get('term');
	            						this.termStore.removeAt(index);
	            						dv.refresh();
	            						
	            						this.bubblelines.removeTerm(term);
	            						this.bubblelines.setCanvasHeight();
	            						this.bubblelines.drawGraph();
	            					},
	            					scope: this
	            				}]
	            			});
	            			menu.showAt(event.getXY());
	            		},
	            		scope: this
	            	}
	            },{
	            	flex: 1,
	            	xtype: 'container',
	            	autoEl: 'div',
	            	itemId: 'canvasParent',
	            	layout: 'fit',
	            	overflowY: 'auto',
	            	overflowX: 'hidden'
	            }],
	            listeners: {
	            	render: function(component) {
	            		var canvasParent = this.down('#canvasParent');
	                	this.bubblelines = new Bubblelines({
	                		container: canvasParent,
	                		clickHandler: this.bubbleClickHandler.bind(this)
	                	});
	            	},
            		afterlayout: function(container) {
            			if (this.bubblelines.initialized === false) {
            				this.bubblelines.initializeCanvas();
            			}
            		},
	        		resize: function(cnt, width, height) {
	        			this.bubblelines.doLayout();
	        		},
            		scope: this
            	}
            }
		});
    	
    	this.callParent(arguments);
    },
    
    loadFromCorpusTerms: function(corpusTerms) {
		corpusTerms.load({
		    callback: function(records, operation, success) {
		    	var query = this.getApiParam('query') || [];
				if (typeof query == 'string') query = [query];
		    	records.forEach(function(record, index) {
					query.push(record.get('term'));
				}, this);
		    	this.getDocTermsFromQuery(query);
		    },
		    scope: this,
		    params: {
		    	limit: 5,
		    	stopList: 'auto'
		    }
    	});
    },
    
    /**
     * Get the results for the query(s) for each of the corpus documents.
     * @param query {String|Array}
     */
    getDocTermsFromQuery: function(query) {
    	if (query) {this.setApiParam("query", query);} // make sure it's set for subsequent calls
    	var corpus = this.getCorpus();
    	if (corpus && this.isVisible()) {
        	var docs = this.getCorpus().getDocuments();
        	for (var i = 0, len = docs.getCount(); i < len; i++) {
        		var doc = docs.getAt(i);
    	    	this.setApiParams({query: query, docIndex: undefined, docId: doc.getId()});
    			this.getDocTermStore().load({params: this.getApiParams()});
        	}
    	}
	},
    
	reloadTermsData: function() {
		var terms = [];
		for (var term in this.bubblelines.currentTerms) {
			terms.push(term);
		}
		this.getDocTermsFromQuery(terms);
	},
	
    filterDocuments: function() {
		var docIds = this.getApiParam('docId');
		if (docIds == '') {
			docIds = [];
			this.getCorpus().getDocuments().each(function(item, index) {
				docIds.push(item.getId());
			});
			this.setApiParams({docId: docIds});
		}
		if (typeof docIds == 'string') docIds = [docIds];
		
		if (docIds == null) {
			this.selectedDocs = this.getCorpus().getDocuments().clone();
			var count = this.selectedDocs.getCount();
			if (count > 10) {
				for (var i = 10; i < count; i++) {
					this.selectedDocs.removeAt(10);
				}
			}
			docIds = [];
			this.selectedDocs.eachKey(function(docId, doc) {
				docIds.push(docId);
			}, this);
			this.setApiParams({docId: docIds});
		} else {
			this.selectedDocs = this.getCorpus().getDocuments().filterBy(function(doc, docId) {
				return docIds.indexOf(docId) != -1;
			}, this);
		}
	},
	
	processDocuments: function(docs) {
		docs.forEach(this.processDocument, this);
	},
	
	processDocument: function(doc) {
		var docId = doc.getId();
		if (!this.processedDocs.containsKey(docId)) {
			var title = doc.getShortTitle();
			title = title.replace('&hellip;', '...');
			var index = doc.get('index');
			var totalTokens = doc.get('tokensCount-lexical');
		
			this.processedDocs.add(docId, {
				id: docId,
				index: index,
				title: title,
				totalTokens: totalTokens,
				terms: {}
			});
		}
	},
	
	processTerms: function(termRecord) {
		var termObj;
		var term = termRecord.get('term');
		var rawFreq = termRecord.get('rawFreq');
		var positions = termRecord.get('positions');
		if (rawFreq > 0) {
			var color = this.getApplication().getColorForTerm(term);
			if (this.termStore.find('term', term) === -1) {
				this.termStore.loadData([[term, color]], true);
			}
			var distributions = termRecord.get('distributions');
			termObj = {positions: positions, distributions: distributions, rawFreq: rawFreq, color: color};
		} else {
			termObj = false;
		}
		
		return termObj;
	},
	
	bubbleClickHandler: function(data) {
		this.getApplication().dispatchEvent('termsClicked', this, data);
	}
});