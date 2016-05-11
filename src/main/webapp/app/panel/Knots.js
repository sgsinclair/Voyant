// assuming Knots library is loaded by containing page (via voyant.jsp)
Ext.define('Voyant.panel.Knots', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.knots',
    statics: {
    	i18n: {
    	},
    	api: {
    		/**
        	 * @property query A string to search for in a document.
        	 * @type String
    		 * @private
        	 */
    		query: null,
    		/**
    		 * @property stopList The stop list to use to filter results.
    		 * Choose from a pre-defined list, or enter a comma separated list of words, or enter an URL to a list of stop words in plain text (one per line).
    		 * @type String
    		 * @private
    		 */
    		stopList: 'auto',
    		/**
    		 * @property docId The document ID to restrict results to.
    		 * @type String
    		 * @private
    		 */
    		docId: undefined,
    		
    		audio: false
    	},
    	glyph: 'xf06e@FontAwesome'
	},
	config: {
		corpus: undefined,
		docTermStore: undefined,
		tokensStore: undefined,
    	options: {xtype: 'stoplistoption'},
    	refreshInterval: 100,
    	startAngle: 315,
    	angleIncrement: 15,
    	currentTerm: undefined
	},
	
    knots: null,
	
	termTpl: new Ext.XTemplate(
		'<tpl for=".">',
			'<div class="term" style="color: rgb({color});float: left;padding: 3px;margin: 2px;">{term}</div>',
		'</tpl>'
	),
	termStore: new Ext.data.ArrayStore({
        fields: ['term', 'color']
    }),
	
    constructor: function() {
    	var rurl = this.getBaseUrl()+"resources/knots/";
    	Ext.apply(this, {
    		title: this.localize('title'),
    		html: "<audio src='"+rurl+"bone-crack.m4a' preload='auto'></audio>"
    	});
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
    	this.on('loadedCorpus', function(src, corpus) {
    		this.setCorpus(corpus);
    		
    		var firstDoc = corpus.getDocument(0);
    		var pDoc = this.processDocument(firstDoc);
    		this.knots.setCurrentDoc(pDoc);
    		
    		this.setApiParams({docId: firstDoc.getId()});
    		this.getDocTermStore().getProxy().setExtraParam('corpus', corpus.getId());
    		this.getTokensStore().setCorpus(corpus);
    		this.getDocTermStore().load({params: {
		    	limit: 5,
		    	stopList: this.getApiParams('stopList')
		    }});
    	}, this);
    	
        this.on('activate', function() { // load after tab activate (if we're in a tab panel)
			if (this.getCorpus()) {				
				Ext.Function.defer(function() {
					this.getDocTermStore().load({params: {
				    	limit: 5,
				    	stopList: this.getApiParams('stopList')
				    }});
				}, 100, this);
			}
    	}, this);
        
        this.on('query', function(src, query) {
    		if (query !== undefined && query != '') {
    			this.getDocTermsFromQuery(query);
    		}
    	}, this);
        
        this.on('documentSelected', function(src, doc) {
        	
        	var document = this.getCorpus().getDocument(doc)
        	this.setApiParam('docId', document.getId());
        	
        	var terms = this.knots.currentDoc.terms;
        	var termsToKeep = [];
        	for (var t in terms) {
        		termsToKeep.push(t);
        	}
        	
//        	this.termStore.removeAll();
    		this.setApiParams({query: termsToKeep});
    		
    		var limit = termsToKeep.length;
    		if (limit === 0) {
    			limit = 5;
    		}
        	
        	this.knots.setCurrentDoc(this.processDocument(document));
        	
        	this.getDocTermStore().load({params: {
		    	query: termsToKeep,
		    	limit: limit,
		    	stopList: this.getApiParams('stopList')
		    }});
        }, this);
        
        this.on('termsClicked', function(src, terms) {
    		var queryTerms = [];
    		terms.forEach(function(term) {
    			if (Ext.isString(term)) {queryTerms.push(term);}
    			else if (term.term) {queryTerms.push(term.term);}
    			else if (term.getTerm) {queryTerms.push(term.getTerm());}
    		});
    		if (queryTerms.length > 0) {
    			this.getDocTermsFromQuery(queryTerms);
    		}
		}, this);
        
		this.on('corpusTermsClicked', function(src, terms) {
			var queryTerms = [];
    		terms.forEach(function(term) {
    			if (term.getTerm()) {queryTerms.push(term.getTerm());}
    		});
    		this.getDocTermsFromQuery(queryTerms);
		}, this);
		
		this.on('documentTermsClicked', function(src, terms) {
			var queryTerms = [];
    		terms.forEach(function(term) {
    			if (term.getTerm()) {queryTerms.push(term.getTerm());}
    		});
    		this.getDocTermsFromQuery(queryTerms);
		}, this);
    },
    
    initComponent: function() {
    	this.setDocTermStore(Ext.create("Ext.data.Store", {
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
   		    	 beforeload: function(store) {
   		    		 store.getProxy().setExtraParam('docId', this.getApiParam('docId'));
   		    	 },
   		    	 load: function(store, records, successful, options) {
   		    		var termObj = {};
   		    		if (records && records.length>0) {
   	   		    		records.forEach(function(record) {
   	   		    			var termData = this.processTerms(record);
   	   		    			var docId = record.get('docId');
   	   		    			var term = record.get('term');
   	   		    			termObj[term] = termData;
   	   		    		}, this);
   	   		    		this.knots.addTerms(termObj);
   	   		    		this.knots.buildGraph();
   		    		}
   		    		else {
   		    			this.toastInfo({
   		    				html: this.localize("noTermsFound"),
   		    				align: 'bl'
   		    			})
   		    		}
   				},
   				scope: this
   		     }
    	}));
    	
    	this.setTokensStore(Ext.create("Voyant.data.store.Tokens", {
        	stripTags: "all",
        	listeners: {
        		beforeload: function(store) {
  		    		 store.getProxy().setExtraParam('docId', this.getApiParam('docId'));
  		    	},
        		load: function(store, records, successful, options) {
        			var context = '';
        			var currTerm = this.getCurrentTerm();
        			records.forEach(function(record) {
        				if (record.getPosition() == currTerm.tokenId) {
        					context += '<strong>'+record.getTerm()+'</strong>';
        				} else {
        					context += record.getTerm();
        				}
        			});
        			
        			Ext.Msg.show({
        				title: this.localize('context'),
        				message: context,
        				buttons: Ext.Msg.OK,
        			    icon: Ext.Msg.INFO
        			});
        		},
   				scope: this
        	}
        }));
    	
    	Ext.apply(this, {
    		dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
        		enableOverflow: true,
                items: [{
                	xtype: 'querysearchfield'
                },{
	            	text: this.localize('clearTerms'),
	            	glyph: 'xf00d@FontAwesome',
	            	handler: function() {
	            		this.down('#termsView').getSelectionModel().deselectAll(true);
	            		this.termStore.removeAll();
	            		this.setApiParams({query: null});
	            		this.knots.removeAllTerms();
	            		this.knots.drawGraph();
	            	},
	            	scope: this
	            },{
	            	xtype: 'documentselectorbutton',
	            	singleSelect: true
	            },{
					xtype: 'slider',
					itemId: 'speed',
					fieldLabel: this.localize("speed"),
					labelAlign: 'right',
					labelWidth: 50,
					width: 100,
					increment: 50,
					minValue: 0,
					maxValue: 500,
					value: 500-this.getRefreshInterval(),
					listeners: {
						changecomplete: function(slider, newvalue) {
							this.setRefreshInterval(500-newvalue);
							if (this.knots) {this.knots.buildGraph();}
						},
						scope: this
					}
				},{
					xtype: 'slider',
					itemId: 'startAngle',
					fieldLabel: this.localize('startAngle'),
					labelAlign: 'right',
					labelWidth: 35,
					width: 85,
					increment: 15,
					minValue: 0,
					maxValue: 360,
					value: this.getStartAngle(),
					listeners: {
						changecomplete: function(slider, newvalue) {
							this.setStartAngle(newvalue);
							if (this.knots) {this.knots.buildGraph();}
						},
						scope: this
					}
				},{
					xtype: 'slider',
					itemId: 'tangles',
					fieldLabel: this.localize('tangles'),
					labelAlign: 'right',
					labelWidth: 30,
					width: 80,
					increment: 5,
					minValue: 5,
					maxValue: 90,
					value: this.getAngleIncrement(),
					listeners: {
						changecomplete: function(slider, newvalue) {
							this.setAngleIncrement(newvalue);
							if (this.knots) {this.knots.buildGraph();}
						},
						scope: this
					}
				},{
	                xtype: 'checkbox',
	                boxLabel: this.localize('sound'),
	                listeners: {
	                	render: function(cmp) {
	                		cmp.setValue(this.getApiParam("audio")===true ||  this.getApiParam("audio")=="true")
	    		        	Ext.tip.QuickTipManager.register({
	    		        		target: cmp.getEl(),
	   		                 	text: this.localize('soundTip')
	    		        	});
	                		
	                	},
	                    change: function(cmp, val) {
	                    	if (this.knots) {
		                    	this.knots.setAudio(val);
	                    	}
	                    },
	                    scope: this
	                }
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
	            	selectionModel: {
	            		mode: 'SIMPLE'
	            	},
//	            	cls: 'selected', // default selected
	            	focusCls: '',
	            	listeners: {
	            		beforeitemclick: function(dv, record, item, index, event, opts) {
	            			event.preventDefault();
	            			event.stopPropagation();
	            			dv.fireEvent('itemcontextmenu', dv, record, item, index, event, opts);
	            			return false;
	            		},
	            		beforecontainerclick: function() {
	            			// cancel deselect all
	            			event.preventDefault();
	            			event.stopPropagation();
	            			return false;
	            		},
	            		selectionchange: function(selModel, selections) {
	            			var dv = this.down('#termsView');
	            			var terms = [];
	            			
	            			dv.getStore().each(function(r) {
	            				if (selections.indexOf(r) !== -1) {
	            					terms.push(r.get('term'));
	            					Ext.fly(dv.getNodeByRecord(r)).removeCls('unselected').addCls('selected');
	            				} else {
	            					Ext.fly(dv.getNodeByRecord(r)).removeCls('selected').addCls('unselected');
	            				}
	            			});
	            			
	            			this.knots.termsFilter = terms;
	            			this.knots.drawGraph();
	            		},
	            		itemcontextmenu: function(dv, record, el, index, event) {
	            			event.preventDefault();
	            			event.stopPropagation();
	            			var isSelected = dv.isSelected(el);
	            			var menu = new Ext.menu.Menu({
	            				floating: true,
	            				items: [{
	            					text: isSelected ? this.localize('hideTerm') : this.localize('showTerm'),
	            					handler: function() {
	            						if (isSelected) {
	            							dv.deselect(index);
	            						} else {
	            							dv.select(index, true);
	            						}
	            					},
	            					scope: this
	            				},{
	            					text: this.localize('removeTerm'),
	            					handler: function() {
	            						dv.deselect(index);
	            						var term = this.termStore.getAt(index).get('term');
	            						this.termStore.removeAt(index);
	            						dv.refresh();
	            						
	            						this.knots.removeTerm(term);
	            						this.knots.drawGraph();
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
	                	this.knots = new Knots({
	                		container: canvasParent,
	                		clickHandler: this.knotClickHandler.bind(this),
	                		audio: this.getApiParam("audio")===true ||  this.getApiParam("audio")=="true"
	                	});
	            	},
            		afterlayout: function(container) {
            			if (this.knots.initialized === false) {
            				this.knots.initializeCanvas();
            			}
            		},
	        		resize: function(cnt, width, height) {
	        			this.knots.doLayout();
	        		},
            		scope: this
            	}
            }
		});
    	
    	this.callParent(arguments);
    },
    
    updateRefreshInterval: function(value) {
    	if (this.knots) {
    		if (value < 50) {
    			value = 50;
    			this.knots.progressiveDraw = false;
    		} else {
    			this.knots.progressiveDraw = true;
    		}
    		this.knots.refreshInterval = value;
			this.knots.buildGraph(this.knots.drawStep);
    	}
    },
    
    updateStartAngle: function(value) {
    	if (this.knots) {
			this.knots.startAngle = value;
			this.knots.recache();
			this.knots.buildGraph();
    	}
    },
    
    updateAngleIncrement: function(value) {
    	if (this.knots) {
	    	this.knots.angleIncrement = value;
			this.knots.recache();
			this.knots.buildGraph();
    	}
    },
    
    loadFromCorpusTerms: function(corpusTerms) {
    	if (this.knots) { // get rid of existing terms
    		this.knots.removeAllTerms();
    		this.termStore.removeAll(true);
    	}
		corpusTerms.load({
		    callback: function(records, operation, success) {
		    	var query = []; //this.getApiParam('query') || [];
				if (typeof query == 'string') query = [query];
		    	records.forEach(function(record, index) {
					query.push(record.get('term'));
				}, this);
		    	this.getDocTermsFromQuery(query);
		    },
		    scope: this,
		    params: {
		    	limit: 5,
		    	stopList: this.getApiParams('stopList')
		    }
    	});
    },
    
    /**
     * Get the results for the query(s) for each of the corpus documents.
     * @param query {String|Array}
     * @private
     */
    getDocTermsFromQuery: function(query) {
    	if (query) {this.setApiParam("query", query);} // make sure it's set for subsequent calls
    	var corpus = this.getCorpus();
    	if (corpus && this.isVisible()) {
    		this.setApiParams({query: query}); // assumes docId already set
			this.getDocTermStore().load({params: this.getApiParams()});
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
	
	// produce format that knots can use
	processDocument: function(doc) {
		var title = doc.getShortTitle();
		title = title.replace('&hellip;', '...');
	
		return {
			id: doc.getId(),
			index: doc.get('index'),
			title: title,
			totalTokens: doc.get('tokensCount-lexical'),
			terms: {},
			lineLength: undefined
		};
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
				var index = this.termStore.find('term', term);
				this.down('#termsView').select(index, true); // manually select since the store's load listener isn't triggered
			}
			var distributions = termRecord.get('distributions');
			termObj = {term: term, positions: positions, distributions: distributions, rawFreq: rawFreq, color: color};
		} else {
			termObj = false;
		}
		
		return termObj;
	},
	
	knotClickHandler: function(data) {
		this.setCurrentTerm(data);
		var start = data.tokenId - 10;
		if (start < 0) start = 0;
		this.getTokensStore().load({
			start: start,
			limit: 21
		});
		
		data = [data].map(function(item) {return item.term}); // make an array for the event dispatch
		this.getApplication().dispatchEvent('termsClicked', this, data);
	}
});