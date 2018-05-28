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
    	options: [{xtype: 'stoplistoption'},
    		{
    			name: 'bins',
		    	xtype: 'slider',
		    	labelAlign: 'right',
		    	width: 200,
		    	minValue: 2,
		    	maxValue: 100,
	        	listeners: {
	        		afterrender: function(slider) {
	        			var trends = slider.up("window").panel;
	        			slider.setFieldLabel(trends.localize("segmentsSlider"));
	        		}
	        	}    		
    		},{
                xtype: 'radiogroup',
		    	labelAlign: 'right',
                columns: 3,
                vertical: true,
                name: 'withDistributions',
                items: [{
                    boxLabel: 'raw',
                    name: 'withDistributions',
                    inputValue: 'raw'
                },{
                    boxLabel: 'relative',
                    name: 'withDistributions',
                    inputValue: 'relative',
                    style: 'margin-left: 1em;'
                }],
	        	listeners: {
	        		afterrender: function(radiogroup) {
	        			var panel = this.up("window").panel;
	        			this.setFieldLabel("frequencies");
	        			var val = panel.getApiParam("withDistributions");
	        			radiogroup.getBoxes().forEach(function(item) {
	        				item.setBoxLabel(panel.localize(item.inputValue));
	        				item.checked = item.inputValue==val;
	        			});
	        			this.setValue({withDistributions: val});
	        		}
	        	}
    		},{xtype: 'colorpaletteoption'}]
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
    		drillDocumentTip: "View the distribution of all current terms within this document.",
    		noResults: "No Results",
    		segment: "segment:",
    		display: "Display",
    		labels: "Show Labels",
    		area: "Area",
    		bar: "Columns",
    		line: "Line",
    		stacked: "Stacked Bar",
    		barline: "Line + Stacked Bar"
    		
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
    		mode: "corpus",
    		
    		chartType: 'barline',
    		
    		labels: false
    	},
		glyph: 'xf201@FontAwesome'
    },
    
    layout: 'fit',
    documentTermsStore: undefined,
    //segments: undefined,
    
    /**
     * @private
     */
    constructor: function(config) {
    	this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments); // we need api
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
                		this.loadCorpusTerms();
                	},
                	scope: this
				},{
					text: this.localize('display'),
					tooltip: this.localize('displayTip'),
					glyph: 'xf013@FontAwesome',
					menu: {
						listeners: {
							afterrender: function(menu) {
								var val = this.getApiParam("chartType");
								menu.items.each(function(item) {
									if (item.getItemId()==val) {
										item.addCls(item.activeCls);
									}
								})
							},
							scope: this
						},
	                    defaults: {
	                        xtype: 'menuitem',
	                        handler: function(item, checked) {
	                        	if (item.xtype=="menucheckitem") { // labels
		                        	this.setApiParam("labels", item.checked);
	                        	} else {
		                        	this.setApiParam("chartType", item.getItemId());
	                        	}
	                        	this.loadCorpusTerms();
	                        },
	                        scope: this
	                    },
	                    items: [{
	                    	xtype: 'menucheckitem',
	                    	text: this.localize('labels'),
	                        tooltip: this.localize('labelsTip'),
	                        checked: this.getApiParam("labels")===true || this.getApiParam("labels")=="true"
	                    },'-',{
	                        itemId: 'area',
	                        text: this.localize('area'),
	                        tooltip: this.localize('areaTip'),
	                        glyph: 'xe76b@Sencha-Examples'
	                    },{
	                        itemId: 'bar',
	                        text: this.localize('bar'),
	                        tooltip: this.localize('barTip'),
	                        glyph: 'xe768@Sencha-Examples'
	                    },{
	                        itemId: 'line',
	                        text: this.localize('line'),
	                        tooltip: this.localize('lineTip'),
	                        glyph: 'xe773@Sencha-Examples'
	                    },{
	                        itemId: 'stacked',
	                        text: this.localize('stacked'),
	                        tooltip: this.localize('stackedTip'),
	                        glyph: 'xe6c8@Sencha-Examples'
	                    },{
	                        itemId: 'barline',
	                        text: this.localize('barline'),
	                        tooltip: this.localize('barlineTip'),
	                        glyph: 'xe779@Sencha-Examples'
	                    }]
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
    	//this.segments.hide();
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
    			var data = [], series = [], chartType = this.getApiParam('chartType');
    			records.forEach(function(record, index) {
    	    		var term = record.get('term'), docIndex = record.get("docIndex");
    	    		var color = this.getApplication().getColorForTerm(term, true);
    	    		record.get('distributions').forEach(function(r, i) {
    	    			if (!data[i]) {
    	    				data[i] = {"index": docLabels[i]};
    	    			}
    	    			data[i]["_"+index] = r;
    	    			data[i]["term"+index] = term;
    	    		}, this);
    	    		
    	    		
    	    		if (chartType!='bar') {
    	    			var kinds = chartType=='barline' ? ["bar","line"] : [chartType];
    	    			kinds.forEach(function(kind) {
    	    	        	series.push({
    	    	        		type: kind=='stacked' ? 'bar' : kind,
    	    	    			title: term,
    	    	    			xField: 'index',
    	    	    			yField: '_'+index,
    	    	    			term: term,
    	    	    			colors: [color],
    	    	    			label: chartType=='barline' && kind=='bar' ? {
    	    	    				display: 'none'
    	    	    			} : {
    	    	    				field: "term"+index
    	    	    			}
    	    	        	})
    	    			}, this);
    	    		}
    			}, this);
    			
    			var terms = records.map(function(r) {return r.getTerm()})
    			var colors = terms.map(function(term) {
	    			return  this.getApplication().getColorForTerm(term, true);
	    		}, this);
	    		if (chartType=='bar') {
		    		series.push({
		    			type:'bar',
		    			title: terms,
			    		colors: colors,
		    			xField: 'index',
		    			yField: data.length>0 ? Object.keys(data[0]).filter(function(field) {return field.charAt(0)=="_"}) : undefined,
    	    			label: {
    	    				field: records.map(function(r,i) {return "term"+i;})
    	    			}
		    		})
	    		}
	    		
    	    	var store = Ext.create('Ext.data.JsonStore', {
    	    		fields: data.length>0 ? Object.keys(data[0]) : undefined,
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
    
    getItemToolTip: function (toolTip, record, ctx) {
    	
    	var parts = ctx.field.split("_"),
    		docIndex = parts.length==2 ? ctx.index : parts[2],
    		pos = parseInt(parts[1]),
    		title = ctx.series.getTitle(),
    		term = Ext.isArray(title) ? title[pos] : title,
    		colors = ctx.series.getColors(),
    		color = colors.length==1 ? colors[0] : colors[pos];
        var html = "<span class='x-legend-item-marker' style='background:"+color+
        		"; left: 2px;'></span> <span style='padding-left: 1.2em; font-weight: bold;'>"+
        		term+"</span>: +"+record.get(ctx.field)+
    			"<br/><i>"+this.getCorpus().getDocument(docIndex).getShortTitle()+"</i>"
		if (this.getApiParam("mode")=="corpus") {
    		html+="<div style='font-size: smaller'>"+this.localize('dblClickItem')
		} else {
			html+="<br/>"+this.localize('segment')+" "+(ctx.index+1)
		}
    	toolTip.setHtml(html);
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
    	//this.segments.show();
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
    			var data = [], series = [],  chartType = this.getApiParam('chartType');
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
    	    			data[i]["term"+index] = term;
    	    		}, this);

    	    		if (chartType!='bar') {
    	    			var kinds = chartType=='barline' ? ["bar","line"] : [chartType];
    	    			kinds.forEach(function(kind) {
    	    	        	series.push({
    	    	        		type: kind=='stacked' ? 'bar' : kind,
    	    	    			title: singleDoc ? term : (docIndex+1)+") "+term,
    	    	    			xField: 'index',
    	    	    			yField: '_'+index+"_"+docIndex,
    	    	    			term: term,
    	    	    			colors: [color],
    	    	    			label: chartType=='barline' && kind=='bar' ? {
    	    	    				display: 'none'
    	    	    			} : {
    	    	    				field: "term"+index
    	    	    			}
    	    	        	})
    	    			}, this);
    	    		}
    	    		
    			}, this);
    			
	    		if (chartType=='bar') {
	    			var isOneTerm = Ext.Array.unique(records.map(function(r) {return r.getTerm()})).length;
	    			var terms = records.map(function(r) {return (1+r.get("docIndex"))	+") "+r.getTerm()})
	    			var colors = records.map(function(r) {
		    			return  isOneTerm ? this.getApplication().getColor(r.get("docIndex"), true) : this.getApplication().getColorForTerm(r.getTerm(), true);
		    		}, this);

		    		series.push({
		    			type:'bar',
		    			title: terms.length>0 ? terms : this.localize("noResults"),
			    		colors: colors,
		    			xField: 'index',
		    			yField: data.length>0 ? Object.keys(data[0]).filter(function(field) {return field.charAt(0)=="_"}) : undefined,
		    			label: {
		    				field: terms
		    			}
		    		})
	    		}

    			
    	    	var store = Ext.create('Ext.data.JsonStore', {
    	    		fields: data.length>0 ? Object.keys(data[0]) : undefined,
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
    	var chartType = this.getApiParam('chartType'), labels = false;
    	if (this.getApiParam("labels")===true || this.getApiParam("labels")=="true") {labels=true}
    	
    	Ext.applyIf(config, {
    		cls: this.getApiParam("mode")
    	});

    	config.series.forEach(function(serie) {
    		Ext.applyIf(serie, {
				stacked: serie.type=='bar' ? false : true,
				showInLegend: chartType=='barline' && serie.type=='line' ? false : true,
    			smooth: true,
    			showMarkers: serie.type=='bar' ? false : true,
    			marker: chartType=='barline' && serie.type=='line' ? null : {
    			    type: 'circle',
    			    radius: 2
    			},
                style: {
                    lineWidth: 1,
                    fillOpacity: chartType=='barline' && serie.type=='bar' ? .01 : 1,
                    strokeOpacity: chartType=='barline' && serie.type=='bar' ? .1 : 1
                },
                highlight: true,
                highlightCfg: {
                	scaling: serie.type=="bar" ? 1.1 : 2
                },
    			label: {
//    				display: 'none'
    			},
    			tooltip: {
                    trackMouse: true,
                    renderer: this.getItemToolTip,
                    scope: this
    			},
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
                translateY: chartType=='line' ? 9 : undefined
    		});
    		if (!labels) {serie.label.display="none";} // hide label 
    	}, this)
    	Ext.applyIf(config, {
    		animation: true,
    	    plugins: {
    	        ptype: 'chartitemevents',
    	        moveEvents: true
    	    },
    		legend: {
    			docked:'top',
    			listeners: {
    				itemclick: function(legend, record, dom, index) {
    					// make sure to hide related series
    					if (legend.getStore().getCount()<legend.chart.series.length && this.getApiParam("chartType")=="barline") {
        					var term = record.get("name"), disabled = record.get("disabled");
        					legend.chart.series.forEach(function(serie) {
        						if (serie.getTitle()==term) {
        							serie.setHidden(disabled);
        							
        						}
        					})
        					legend.chart.redraw(); // not working?
    					}
    				},
    				scope: this
    			}
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
    		if (axis.type=='category') {
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
    	
    	// create new chart
		var chart = Ext.create("Ext.chart.CartesianChart", config);
    	this.add(chart);
    },
    
    reloadFromChart: function() {
    	var chart = this.down('chart');
    	if (chart) {
    		var terms = [];
    		chart.series.forEach(function(serie) {
    			terms.push(serie.getTitle());
    		});
    		this.fireEvent("termsClicked", this, terms);
    	}
    }


 });