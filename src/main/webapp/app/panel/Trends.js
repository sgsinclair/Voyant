/**
 * Trends tool, a line graph that shows term distributions.
 * 
 * <iframe src="../?corpus=austen&view=trends" style="max-width: 500px; height: 300px"></iframe>
 * 
 * The typical use is not to instantiate this class directly, but to embed the tool from a corpus.
 * 
 * 		var austen;
 * 		new Corpus("austen").then(function(corpus) {
 * 			austen = corpus;
 * 			austen.embed('Trends'); // simply embed
 * 			austen.embed('Trends', {query: '^lov*'}); // embed with query
 * 		});
 */
Ext.define('Voyant.panel.Trends', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	requires: ['Voyant.data.store.Documents'],
	alias: 'widget.trends',
	config: {
	    /**
	     * @private
	     */
    	options: [{xtype: 'stoplistoption'},{xtype: 'colorpaletteoption'}]
	},
    statics: {
    	i18n: {
    		relativeTitle: "Relative Frequencies",
    		rawTitle: "Raw Frequencies",
    		corpusTitle: "Corpus (Documents)",
    		segmentsTitle: "Document Segments",
    		toggleTip: "Click to toggle the visibility of this series.",
    		reset: "Reset",
    		resetTip: "Reset to initial view.",
    		dblClickItem: "Double-click to drilldown.",
    		drillTerm: "Terms",
    		drillTermTip: "View the distribution of this term within all documents.",
    		drillDocument: "Document",
    		drillDocumentTip: "View the distribution of all current terms within this document."
    	},
    	api: {
    		
    		/**
    		 * @cfg {Number} limit Determine the number of terms to show (larger numbers may make the graph unusable).
    		 */
    		limit: 5,
    		
    		/**
    		 * @cfg {String} stopList A comma-separated list of words, a named list or a URL to a plain text list, one word per line.
    		 * 
    		 *  By default this is set to 'auto' which auto-detects the document's language and loads an appropriate list (if available for that language). Set this to blank to not use the default stopList.
    		 *  
    		 * For more information see the <a href="#!/guide/search">Stopwords documentation</a>.
    		 */
    		stopList: 'auto',
    		
    		/**
    		 * @cfg {String/String[]} query A query or array of queries (queries can be separated by a comma).
    		 * 
    		 * For query syntax, see the <a href="#!/guide/search">search documentation</a>.
    		 */
    		query: undefined,
    		
    		/**
    		 * @cfg {String} withDistributions Determine whether to show "raw" or "relative" frequencies (those are the two valid values).
    		 * 
    		 * The default value is "relative" (unless there's only one document in the corpus, in which case raw frequencies are shown).
    		 */
    		withDistributions: 'relative',
    		
    		/**
    		 * @cfg {Number} bins The number of segments to use.
    		 * 
    		 * The default value will depend on the nature of the corpus:
    		 * 
    		 * - corpus has one document: the default number of bins is 10
    		 * - corpus has multiple documents:
    		 *   - corpus has up to 100 documents: the default number is the size of the corpus
    		 *   - corpus has more than 1000 documents: the default number is 100
    		 */
    		bins: 10,
    		
    		/**
    		 * @cfg {Number/Number[]/String} docIndex The index of one or more documents, as a number, or numbers separated by commas or in an array.
    		 * 
    		 * The first document's index is 0 and so on.
    		 */
    		docIndex: undefined,
    		
    		/**
    		 * @cfg {String/String[]} docId The document ID of one or more documents, as a string, or strings separated by commas or in an array.
    		 */
    		docId: undefined,
    		
    		/**
    		 * @cfg {String} mode Force the mode to be either "corpus" (distribution of terms across documents) or "document" (distribution of terms within a document); usually this is correctly set by default according to whether the corpus has one document ("document") or more than one ("corpus").
    		 */
    		mode: "corpus"
    	},
		glyph: 'xf201@FontAwesome'
    },
    
    layout: 'fit',
    documentTermsStore: undefined,
    segments: undefined,
    
    /**
     * @private
     */
    constructor: function(config) {
    	this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
    	Ext.apply(this, {
    		title: this.localize('title'),
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                items: [{
                    xtype: 'querysearchfield'
                },{
                	itemId: 'reset',
                	text: this.localize("reset"),
                	tooltip: this.localize("resetTip"),
                	handler: function(btn) {
                		this.setApiParams({
                			docIndex: undefined,
                			mode: undefined,
                			query: undefined
                		});
                		// clear query (and trigger redraw)
                		//btn.ownerCt.down("querysearchfield").setValue("");
                		this.loadCorpusTerms();
                	},
                	scope: this
                },{
			    	itemId: 'segmentsSlider',
			    	xtype: 'slider',
			    	fieldLabel: this.localize('segmentsSlider'),
			    	fieldAlign: 'right',
			    	labelWidth: 70,
			    	width: 150,
			    	minValue: 2,
			    	maxValue: 100,
			    	hidden: true,
	            	listeners: {
	            		afterrender: function(slider) {
	            			this.segments = slider;
	            			slider.setValue(parseInt(this.getApiParam("bins")))
	            		},
	            		changecomplete: function(slider, newvalue) {
	            			this.setApiParams({bins: newvalue});
	            			this.loadDocumentTerms();
	            		},
	            		scope: this
	            	}
	    		}]
            }]
    	});
        this.callParent(arguments);
    },
    
    listeners: {
    	loadedCorpus: function(src, corpus) {
    		this.loadCorpusTerms();
    	},
    	termsClicked: function(src, terms) {
    		var queryTerms = [];
    		terms.forEach(function(term) {
    			if (Ext.isString(term)) {queryTerms.push(term);}
    			else if (term.term) {queryTerms.push(term.term);}
    			else if (term.getTerm) {queryTerms.push(term.getTerm());}
    		});
    		this.setApiParam("query", queryTerms && queryTerms.length>0 ? queryTerms : undefined);
    		this.loadCorpusTerms();
    	},
    	corpusTermsClicked: function(src, terms) {
    		this.setApiParam("query", terms.map(function(term) {return term.getTerm()}));
    		this.loadCorpusTerms();
    	},
    	documentSelected: function(src, document) {
			this.setApiParam("docIndex", this.getCorpus().getDocument(document).getIndex());
    		this.loadDocumentTerms();
    	},
    	documentsClicked: function(src, documents) {
    		if (documents.length==1) {
    			this.fireEvent("documentSelected", this, documents[0])
    		}
    	},
    	query: function(src, query) {
			this.fireEvent("termsClicked", this, query)
    	}
    },
    
    loadCorpusTerms: function(params) {
    	// if our corpus only has one document or if we have docIndex d
    	if (
    		this.getCorpus().getDocumentsCount()<2 || // only one document
    		this.getApiParam("mode")=="document" || // in document mode
    		Array.from(this.getApiParam("docIndex") || "").length>0 // we have a docIndex defined
    		) {
    		return this.loadDocumentTerms();
    	}
    	if (!this.getApiParam("query")) {
        	this.getCorpus().getCorpusTerms().load({
        		params: {
        			limit: 5,
        			stopList: this.getApiParam("stopList")
        		},
        		callback: function(records, operation, success) {
        			this.setApiParam("query", records.map(function(r) {return r.getTerm()}))
        			this.loadCorpusTerms();
        		},
        		scope: this
        	})
    		return;
    	}
    	params = params || {};
    	this.segments.hide();
    	var withDistributions = this.getApiParam("withDistributions");
    	Ext.applyIf(params, {
    		bins: this.getCorpus().getDocumentsCount(),
			limit: 1000, // should have query, so no limit 
	    	stopList: "" // automatic queries should be stopped already
    	});
    	var docLabels = this.getCorpus().map(function(doc) {return doc.getTinyTitle()})
    	Ext.applyIf(params, this.getApiParams());
    	this.getCorpus().getCorpusTerms().load({
    		params: params,
    		callback: function(records, operation, success) {
    			var data = [], series = [];
    			records.forEach(function(record, index) {
    	    		var term = record.get('term');
    	    		var color = this.getApplication().getColorForTerm(term, true);
    	    		record.get('distributions').forEach(function(r, i) {
    	    			if (!data[i]) {
    	    				data[i] = {"index": docLabels[i]};
    	    			}
    	    			data[i]["_"+index] = r;
    	    		}, this);
    	        	series.push({
    	    			title: term,
    	    			xField: 'index',
    	    			yField: '_'+index,
    	    			term: term,
    	    			colors: [color],
    	                tooltip: {
    	                    trackMouse: true,
    	                    renderer: function (toolTip, record, ctx) {
    	                    	var html = "<span class='x-legend-item-marker' style='background:"+color+"; left: 2px;'></span> <span style='padding-left: 1.2em; font-weight: bold;'>"+
    	                    		ctx.series.term+"</span>: +"+record.get(ctx.field);
    	                    	if (this.getCorpus().getDocumentsCount()>1) {
    	                    		html+="<br/><i>"+this.getCorpus().getDocument(ctx.index).getShortTitle()+"</i>";
    	                    	}
    	                    	html+="<div style='font-size: smaller'>"+this.localize('dblClickItem')
    	                    	toolTip.setHtml(html);
    	                    },
    	                    scope: this
    	                },
    	    			label: {
    	                   color: color,
    	                   renderer: function(sprite, config, rendererData, index) {
    	                	   return term;
    	                  }
    	                }
    	        	})
    			}, this);

    	    	var store = Ext.create('Ext.data.JsonStore', {
    	    		fields: Object.keys(data[0]),
    	    		data: data
    	    	});

    			this.buildChart({
        			store: store,
        			series: series,
        			axes: [{
                		type: 'numeric',
                		position: 'left',
                		increment: 1,
                		title: {
                			text: this.localize(this.getApiParam("withDistributions")+"Title")
                		}
        			},{
        				type: 'category',
                		position: 'bottom',
                		title: {
                			text: this.localize("corpusTitle")
                		}
                		
        			}]
    			})
    		},
    		scope: this
    	});
  
    },

    loadDocumentTerms: function(params) {
    	if (!this.getApiParam("query")) {
        	this.getCorpus().getCorpusTerms().load({
        		params: {
        			limit: this.getCorpus().getDocumentsCount()<2 ? 5 : 2,
        			stopList: this.getApiParam("stopList")
        		},
        		callback: function(records, operation, success) {
        			this.setApiParam("query", records.map(function(r) {return r.getTerm()}))
        			this.loadDocumentTerms();
        		},
        		scope: this
        	})
    		return;
    	}
    	this.segments.show();
    	this.setApiParam("mode", "document"); // just to be sure
    	params = params || {};
    	var withDistributions = this.getApiParam("withDistributions");
    	Ext.applyIf(params, {
			limit: 0, // always have query, so no limit, no stopList
			sort: 'termasc',
			stopList: undefined
    	});
    	var docLabels = this.getCorpus().map(function(doc) {return doc.getTinyTitle()})
    	var singleDoc;
    	if (this.getCorpus().getDocumentsCount()==1) {
    		singleDoc=this.getCorpus().getDocument(0)
    	}
    	else {
    		singleDoc=this.getCorpus().getDocument(this.getApiParam("docIndex"))
    	}
    	Ext.applyIf(params, this.getApiParams());
    	
    	this.getCorpus().getDocumentTerms().load({
    		params: params,
    		callback: function(records, operation, success) {
    			var data = [], series = [];
    			if (!singleDoc) { // legend is easier to read if sorted by term then doc
        			records.sort(function(a,b) {
        				if (a.getTerm()==b.getTerm()) {
        					return a.getDocIndex() - b.getDocIndex()
        				}
        				return a.getTerm().localeCompare(b.getTerm())
        			})
    			}
    			records.forEach(function(record, index) {
    	    		var term = record.get('term');
    	    		var docIndex = record.get('docIndex');
    	    		var color = singleDoc ? this.getApplication().getColorForTerm(term, true) : this.getApplication().getColor(docIndex, true);
    	    		var docIndex = record.get('docIndex');
    	    		record.get('distributions').forEach(function(r, i) {
    	    			if (!data[i]) {
    	    				data[i] = {docIndex: docIndex, index: (i+1)};
    	    			}
    	    			data[i]["_"+index+"_"+docIndex] = r;
    	    		}, this);
    	        	series.push({
    	    			title: term + (singleDoc ? "" : " ("+(this.getCorpus().getDocument(docIndex).getTinyTitle())+")"),
    	    			xField: 'index',
    	    			yField: '_'+index+"_"+docIndex,
    	    			term: term,
    	    			docIndex: docIndex,
    	    			colors: [color],
    	                tooltip: {
    	                    trackMouse: true,
    	                    renderer: function (toolTip, record, ctx) {
    	                    	var html = "<span class='x-legend-item-marker' style='background:"+color+"; left: 2px;'></span> <span style='padding-left: 1.2em; font-weight: bold;'>"+
    	                    		ctx.series.term+"</span>: +"+record.get(ctx.field)+
    	                    		"<br/><i>"+this.getCorpus().getDocument(docIndex).getShortTitle()+"</i>";
    	                    	toolTip.setHtml(html);
    	                    },
    	                    scope: this
    	                },
    	    			label: {
    	                   color: color,
    	                   renderer: function(text, sprite, config, rendererData, index) {
    	                	   return term
    	                  }
    	                }
    	        	})
    			}, this);
    			
    	    	var store = Ext.create('Ext.data.JsonStore', {
    	    		fields: Object.keys(data[0]),
    	    		data: data
    	    	});

    			this.buildChart({
        			store: store,
        			series: series,
        			axes: [{
                		type: 'numeric',
                		position: 'left',
                		title: {
                			text: this.localize(this.getApiParam("withDistributions")+"Title")
                		}
        			},{
        				type: 'category',
                		position: 'bottom',
                		title: {
                			text: this.localize("segmentsTitle") + (singleDoc ? " ("+singleDoc.getShortTitle()+")" : "")
                		}
                		
        			}]
    			})
    		},
    		scope: this
    	});
  
    },

    
    buildChart: function(config) {
    	config.series.forEach(function(serie) {
    		Ext.applyIf(serie, {
				type: 'line',
    			smooth: true,
    			marker: {
    			    type: 'circle',
    			    radius: 2
    			},
                style: {
                    lineWidth: 1,
                    strokeOpacity: .5
                },
                highlightCfg: {
                	scaling: 2
                },
    			label: {},
                listeners: {
                	itemclick: function(chart,item,event,eOpts ) {
            			if (this.clickTimer) {clearTimeout(this.clickTimer);}
            			if (this.blockClick) {return;} // set by dblclick to avoid menu disappearing
            			this.blockClick = true // block other clicks within a sec
            			Ext.defer(function() {
            				this.blockClick = false;
            			}, 1000, this);
                		if (this.getApiParam("mode")=="document") {
                			var parts = item.field.split("_"),
                				docIndex = parts[2],
                				doc = this.getCorpus().getDocument(docIndex),
                				tokens = doc.get('tokensCount-lexical'),
                				position = parseInt(item.index  * tokens / parseInt(this.getApiParam("bins")))
                			this.dispatchEvent("documentIndexTermsClicked", this, [{
                    			term: item.series.term,
                    			docIndex: parts[2],
                    			position: position
                    		}]);                			
                		} else {
                			if (this.clickTimer) {clearTimeout(this.clickTimer);}
                			var me = this;
                			this.clickTimer = setTimeout(function() {
                    			me.dispatchEvent("documentIndexTermsClicked", me, [{
                        			term: item.series.term,
                        			docIndex: item.index
                        		}]);
                			}, 300)
                			
                		}
                	},
                	itemdblclick: function(chart,item,event,eOpts )  {
            			if (this.clickTimer) {clearTimeout(this.clickTimer);}
            			// block future single clicks to allow menu to appear
            			this.blockClick = true
            			Ext.defer(function() {
            				this.blockClick = false;
            			}, 1000, this);
            			// block future clicks
                		if (this.getApiParam("mode")!="document") {
                			var m = Ext.create('Ext.menu.Menu', {
                				items: [{
                	    				text: this.localize("drillTerm"),
                	    				tooltip: this.localize("drillTermTip"),
//                	    				glyph: 'xf02d@FontAwesome',
                	    				handler: function() {
                	    					this.setApiParams({
                	    						mode: 'document',
                	    						query: item.series.term
                	    					});
                	    					this.loadDocumentTerms();
                	    				},
                	    				scope: this
                					},{
                	    				text: this.localize("drillDocument"),
                	    				tooltip: this.localize("drillDocumentTip"),
//                	    				glyph: 'xf02d@FontAwesome',
                	    				handler: function() {
                	    					this.setApiParams({
                	    						mode: 'document',
                	    						docIndex: item.index
                	    					});
                	    					this.loadDocumentTerms();
                	    				},
                	    				scope: this
                					}],
                					listeners: {
                						hide: function(m) {
                							// defer hiding otherwise click handler not called
                							Ext.defer(function() {this.destroy()}, 200, m)
                						},
                						scope: this
                					}
                			}).showAt(event.pageX, event.pageY) 
                		}
                	},
                	scope: this
                }
    		})
    		Ext.applyIf(serie.label, {
                display: 'over',
                field: 'index',
                fontSize: 11,
                translateY: 9
    		})
    	}, this)
    	Ext.applyIf(config, {
    		animation: true,
    	    plugins: {
    	        ptype: 'chartitemevents',
    	        moveEvents: true
    	    },
    		legend: {
    			docked:'top'
    		},
    		interactions: ['itemhighlight','crosszoom'],
    	    listeners: {}
    	});
    	Ext.applyIf(config.listeners, {
	        itemhighlightchange: function (chart, item) {
	            chart.el.dom.style.cursor = item ? 'pointer' : '';
	        },
	        afterrender : function() {
	        	return // TODO: this seems to cause problems, perhaps not destroying properly?
	        	Ext.defer(function() { // seem to need to defer
		        	Ext.tip.QuickTipManager.register({
		        		target: this.getTargetEl().down(".x-legend-container"),
	                 	text: this.localize("toggleTip")
		        	});
	        	},1, this)
	        	
	        },
	        scope: this
    	})
    	config.axes.forEach(function(axis) {
    		Ext.applyIf(axis, {
    			title: {},
    			label: {}
    		})
    		Ext.applyIf(axis.title, {scaling: .75});
    		Ext.applyIf(axis.label, {scaling: .75});
    		if (axis.type=='category' && this.getApiParam("mode")=="corpus") {
    			var titles = "";
    			config.store.each(function(r) {titles+=r.get("index")})
    			if (titles.length>this.getTargetEl().getWidth()/9) {
            		Ext.applyIf(axis.label, {rotate: {degrees:-30}});
    			}
        		Ext.applyIf(axis, {
        			labelInSpan: true
        		})
    		}
    	}, this)
    	// remove existing chart
    	this.query('chart').forEach(function(chart) {this.remove(chart, true);}, this);
		var chart = Ext.create("Ext.chart.CartesianChart", config);
    	this.add(chart);
    }

 });