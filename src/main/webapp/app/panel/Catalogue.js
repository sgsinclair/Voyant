Ext.define('Voyant.panel.Catalogue', {
	extend: 'Ext.panel.Panel',
	requires: ['Voyant.widget.Facet'],
	mixins: ['Voyant.panel.Panel'],
	
	alias: 'widget.catalogue',
    statics: {
    	i18n: {
    		title: {en: "Catalogue"},
    		helpTip: {en: "<p>The <i>Summary</i> tool provides general information about the corpus. Many elements in the tool are links that trigger other views. Features include:</p><ul><li>total words (tokens) and word forms (types) and age of the corpus</li><li>most frequent terms in the corpus</li><li>for corpora with more than one documen<ul><li>documents ordered by length and vocabulary density</li><li>distinctive words for each document (by TF-IDF score)</li></ul></li></ul>"},
    		"facet.authorTitle": {en: "Authors"},
    		"facet.languageTitle": {en: "Languages"},
    		"facet.titleTitle": {en: "Titles"},
    		"facet.keywordTitle": {en: "Keywords"},
    		"facet.pubDateTitle": {en: "Publication Dates"},
    		"facet.publisherTitle": {en: "Publishers"},
    		"facet.pubPlaceTitle": {en: "Publication Locations"},
    		loadingSnippets: {en: "loading text snippets…"},
    		lexicalTitle: {en: "Terms"},
    		noMatches: {'en': new Ext.Template('No matches (out of {0} documents).', {compiled: true})},
    		queryMatches: {en: new Ext.Template("{0} matching documents (out of {1}).", {compiled: true})},
    		clickToOpenCorpus: {'en': new Ext.Template('Please <a href="{0}" target="_blank" class="link">click here</a> to access your new corpus (since popup windows are blocked).', {compiled: true})},
    		"export": {en: "Export"},
    		exportTip: {en: "Create a new Voyant corpus with the selected documents."},
    		matchingDocuments: {'en': "number of matching documents"},
    		rawFreqs: {'en': "total occurrences (raw frequency)"},
    		exportInProgress: {en: "Preparing your corpus for export…"}
    	},
    	api: {
    		config: undefined,
    		stopList: 'auto',
    		facet: ['facet.title','facet.author','facet.language']
    	},
		glyph: 'xf1ea@FontAwesome'
    },
    config: {
    	corpus: undefined,
    	facets: {},
    	matchingDocIds: [],
    	customResultsHtml: undefined
    },
    
    constructor: function(config) {

    	Ext.apply(this, {
    		title: this.localize('title'),
    		layout: 'hbox',
    		items: [
    		        {
    		        	layout: 'vbox',
    		        	height: '100%',
    		        	align: 'stretch',
    		        	itemId: 'facets',
    		        	defaults: {
    		        		width: 250,
    		        		flex: 1,
    		        		xtype: 'facet',
    		        		margin: 5,
    		        		border: true,
    		        		frame: true
    		        	},
    		        	items: []
    		        },
    		        {
    		        	xtype: 'panel',
    		        	html: '',
    		        	flex: 1,
    		        	itemId: 'results',
    		        	height: '100%',
    		        	align: 'stretch',
    		        	scrollable: true,
    		        	margin: 5,
    		        	getCorpus: function() { // for query search field
    		        		return this.findParentByType('panel').getCorpus();
    		        	},
    		        	listeners: {
    		        		query: function(src, query) {
    		        			this.findParentByType('panel').updateResults(Ext.isString(query) ? [query] : query)
    		        		}
    		        	},
    		        	bbar: [{
    		        		itemId: 'export',
    		        		text: this.localize('export'),
    		        		tooltip: this.localize('exportTip'),
    		        		disabled: true,
    		        		handler: function() {
    		        			this.mask(this.localize("exportInProgress"));
    		        			var catalogue = this;
    		            		Ext.Ajax.request({
    		            			url: this.getApplication().getTromboneUrl(),
    		            			params: {
    		            				corpus: this.getCorpus().getId(),
    		            				tool: 'corpus.CorpusManager',
    		            				keepDocuments: true,
    		            				docId: this.getMatchingDocIds()
    		            			},
    		            		    success: function(response, opts) {
    		            		    	catalogue.unmask();
    		            		    	var json = Ext.JSON.decode(response.responseText);
	                    				var url = catalogue.getBaseUrl()+"?corpus="+json.corpus.id;
	                    				var win = window.open(url);
	                    				if (!win) { // popup blocked
	                    					var msg = Ext.create('Ext.window.MessageBox', {
	                    						makeButton: function(btnIdx) {
	                    					        return new Ext.button.Button({
	                    					            handler: this.btnCallback,
//	                    					            itemId: btnId,
	                    					            scope: this,
	                    					            text: catalogue.localize('cancel'),
	                    					            ui: 'default-toolbar',
	                    					            minWidth: 75
	                    					        });
	                    						}
	                    					}).show({
	                    						title: catalogue.localize('export'),
	                    						buttons: Ext.MessageBox.CANCEL,
	                    						icon: Ext.MessageBox.INFO,
	                    						message: catalogue.localize('clickToOpenCorpus', [url])
	                    					});
	                    					var link = msg.getTargetEl().dom.querySelector("a");
	                    					link.addEventListener("click", function() {
	                    						msg.close()
	                    					})
	                    					Ext.get(link).frame().frame();
	                    				}
    		            		    },
    		            		    failure: function(response, opts) {
    		            		    	catalogue.unmask();
    		            		    	me.showError(response);
    		            		    }
    		            		})

    		        		},
    		        		scope: this
    		        	},{
    		        		xtype: 'querysearchfield',
    		        		width: 200,
    		        		flex: 1
    		        	},{
    		        		itemId: 'status',
    		        		xtype: 'tbtext'
    		        	}]
    		        }]
    	});

        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		this.setCorpus(corpus);
    		this.queryById('status').update(this.localize('noMatches', [corpus.getDocumentsCount()]))
    		this.query("facet").forEach(function(facet) {
    			facet.setCorpus(corpus);
    		});
    		if (!this.getCustomResultsHtml()) {
    			this.setCustomResultsHtml(this.localize('noMatches',  [corpus.getDocumentsCount()]));
    			this.updateResults();
    	    	Ext.Ajax.request({
    	    	    url: this.getTromboneUrl(),
    	    	    params: {
    	        		tool: 'resource.StoredResource',
    	        		verifyResourceId: 'customhtml-'+corpus.getId()
    	    	    },
    	    	    success: function(response, req) {
    	    	    	var json = Ext.util.JSON.decode(response.responseText);
    	    	    	if (json && json.storedResource && json.storedResource.id) {
    	        	    	Ext.Ajax.request({
    	        	    	    url: this.getTromboneUrl(),
    	        	    	    params: {
    	        	        		tool: 'resource.StoredResource',
    	        	        		retrieveResourceId: 'customhtml-'+corpus.getId()
    	        	    	    },
    	        	    	    success: function(response, req) {
    	        	    	    	var json = Ext.util.JSON.decode(response.responseText);
    	        	    	    	if (json && json.storedResource && json.storedResource.resource) {
    	        	    	    		this.setCustomResultsHtml(json.storedResource.resource);
    	        	    	    		this.updateResults()
    	        	    	    	}
    	        	    	    },
    	        	    	    scope: this
    	        	    	})
    	    	    	}
    	    	    },
    	    	    scope: this
    	    	})

    		}
    	});
    	
    	this.on('afterrender', function(panel) {
    		var facets = this.getApiParam('facet');
    		if (Ext.isString(facets)) {facets = facets.split(",")}
    		var facetsCmp = this.queryById('facets');
			var itemTpl = '<span style="font-size: smaller;">(<span class="info-tip" data-qtip="'+panel.localize('matchingDocuments')+'">{inDocumentsCount}</span>)</span> {term}'+'<span style="font-size: smaller;"> (<span class="info-tip" data-qtip="'+panel.localize('rawFreqs')+'">{rawFreq}</span>)</span>'
    		facets.forEach(function(facet) {
    			var title = panel.localize(facet+"Title");
    			if (title=="["+facet+"Title]") {
    				title = facet.replace(/^facet\./,"").replace(/^extra./,"");
    			}
    			var matchingDocumentsLabel = panel.localize('matchingDocuments');
    			var facetCmp = facetsCmp.add({
    				title: title,
        			collapsible: true,
    				facet: facet,
        			columns: [{
        				renderer: function(value, metaData, record) {
        					return '<span style="font-size: smaller;">(<span class="info-tip" data-qtip="'+catalogue.localize('matchingDocuments')+'">'+record.getInDocumentsCount()+"</span>) </span>"+record.getLabel()
        				},
        				flex: 1
        			}],
    				bbar: [{
    					xtype: 'querysearchfield',
    					width: '100%',
    					tokenType: facet.replace("facet.", ""),
//    					inDocumentsCountOnly: true,
    					itemTpl: itemTpl
    				}]
    			})
    			facetCmp.getSelectionModel().on('selectionchange', function(model, selected) {
    				var labels = [];
    				selected.forEach(function(model) {
    					labels.push({facet: model.getFacet(), label: model.getLabel()})
    				})
    				panel.getFacets()[facet] = labels;
    				panel.updateResults();
    			})
    			facetCmp.on('query', function(model, selected) {
    				panel.getFacets()[facetCmp.facet] = [];
    				panel.updateResults();
    			})
    		})
    		var catalogue = this;
    		var facetCmp = facetsCmp.add({
    			title: panel.localize('lexicalTitle'),
    			collapsible: true,
    			store: Ext.create("Voyant.data.store.CorpusTerms", {
    				parentPanel: this,
    				// this isn't being set by the beforeload call in the store, so set it here
    				proxy: {
    					extraParams: {
    	    				stopList: this.getApiParam("stopList")
    					}
    				}
    			}),
    			facet: 'lexical',
    			columns: [{
    				renderer: function(value, metaData, record) {
    					return '<span style="font-size: smaller;">(<span class="info-tip" data-qtip="'+catalogue.localize('matchingDocuments')+'">'+record.getInDocumentsCount()+"</span>) </span>"+record.getTerm()+'<span style="font-size: smaller;"> (<span class="info-tip" data-qtip="'+catalogue.localize('rawFreqs')+'">'+record.getRawFreq()+"</span>)</span>"
    				},
    				flex: 1
    			}],
				bbar: [{
					xtype: 'querysearchfield',
//					width: '100%',
					itemTpl: itemTpl,
					grow: false,
					growMax: 10
				}]
    		})
			facetCmp.getSelectionModel().on('selectionchange', function(model, selected) {
				var labels = [];
				selected.forEach(function(model) {
					labels.push({facet: 'lexical', label: model.getTerm()})
				})
				panel.getFacets()['lexical'] = labels;
				panel.updateResults();
			})
    	})
    	
    },
    
    updateResults: function(queries) {
    	var facets = this.getFacets();
    	if (!queries) {
	    	var queries = [];
	    	for (facet in facets) {
	    		facets[facet].forEach(function(label) {
	        		queries.push(label.facet+":"+label.label);
	    		})
	    	}
	    	if (queries) {
		    	return this.updateResults(queries)
	    	}
    	}
		var results = this.queryById("results").getTargetEl();
		var catalogue = this;
		results.update(this.getCustomResultsHtml() ? this.getCustomResultsHtml() : this.localize('noMatches', [this.getCorpus().getDocumentsCount()]));
		this.queryById('status').update(this.localize('noMatches', [this.getCorpus().getDocumentsCount()]))
		this.queryById('export').setDisabled(true);
    	if (queries && queries.length>0) {
    		this.mask(this.localize("loading"));
    		var documentQueryMatches = this.getCorpus().getDocumentQueryMatches();
    		documentQueryMatches.load({
    			params: {query: queries, includeDocIds: true},
    			callback: function(records, operation, success) {
    				this.unmask();
    				if (records && records.length>0) {
    					this.queryById('status').setHtml(records.length)
    					var list = "<ul>";
    					var matchingDocIds = [];
    					records.forEach(function(record) {
    						record.getDocIds().forEach(function(docId) {
    							matchingDocIds.push(docId);
    							var doc = documentQueryMatches.getCorpus().getDocument(docId);
    							var item = "<li id='"+results.getId()+'_'+docId+"' class='cataloguedoc'>";
    							item += "<i>"+doc.getTitle()+"</i>";
    							for (facet in facets) {
    								if (facets[facet].length==0) {continue;}
    								var labelItems = "";
    								if (facet!='facet.title') {
    									var suffix = facet.replace(/^.+?\./,"");
    									var label = doc.get(suffix);
    									if (label) {
    										var isArray = Ext.isArray(label);
    										if (isArray) {
    											labelItems+="<li>"+suffix+"<ul>"
    										} else {
    											label = [label];
    										}
    										label.forEach(function(l) {
    											var isMatch = false;
    											facets[facet].forEach(function(f) {
    												if (f.label==l) {isMatch=true}
    												else if (f.facet.indexOf('facet')==-1) {
    													f.label.split(/\W+/).forEach(function(part) {
    														if (part.trim().length>0 && l.toLowerCase().indexOf(part.toLowerCase())>-1) {
    															isMatch=true;
    														}
    													})
    												}
    											})
    											labelItems+="<li>"+(isArray ? '' : suffix+": ")+(isMatch ? '<span class="keyword">'+l+'</span>' : l)+"</li>"
    										})
    										if (isArray) {
    											labelItems+="</ul></li>";
    										}
    									}
    								}
    								if (labelItems) {
    									item+="<ul>"+labelItems+"</ul>";
    								}
    							}
    							item += "</li>";
    							list += item;
    						})
    					})
    					list += "</ul>";
    					results.update(list);
    					this.queryById('status').update(this.localize('queryMatches', [matchingDocIds.length,this.getCorpus().getDocumentsCount()]))
    					this.setMatchingDocIds(Ext.Array.clone(matchingDocIds));
    					if (matchingDocIds.length>0) {
    						this.queryById('export').setDisabled(false);
    					}
    					
    					// now try to load some snippets, if need be
    					if (facets['lexical']) {
    						var firstDocIds = matchingDocIds.splice(0,5);
    						this.loadSnippets(firstDocIds, results.first().first());
    						if (matchingDocIds && matchingDocIds.length>0) {
        						this.loadSnippets(matchingDocIds); // load the rest
    						}
    					}
    				}
    			},
    			scope: this
    		})    		
    	}
    },
    
    loadSnippets: function(docIds, elToMask) {
		var results = this.queryById("results").getTargetEl();
    	var facets = this.getFacets();
    	if (facets['lexical']) {
    		var queries = facets['lexical'].map(function(label) {return label.facet+":"+label.label});
    		var contexts = this.getCorpus().getContexts({buffered: false});
    		if (elToMask) {
    			elToMask.mask(this.localize("loadingSnippets"));
    		}
    		contexts.load({
    			method: 'POST',
    			params: {
                	stripTags: "all",
    				query: queries,
    				docId: docIds,
    				perDocLimit: 3,
    				limit: 100,
    				accurateTotalNotNeeded: true
    			},
    			scope: this,
    			callback: function(records, operation, success) {
    				if (elToMask) {
    					elToMask.unmask();
    				}
    				if (success && Ext.isArray(records) && records.length>0) {
    					var snippets = {};
    					records.forEach(function(record) {
    						if (!snippets[record.getDocIndex()]) {snippets[record.getDocIndex()]=[]}
    						snippets[record.getDocIndex()].push(record);
    					})
    					for (docIndex in snippets) {
    						var id = this.getCorpus().getDocument(docIndex).getId();
    						var html = '<li style="list-style-type: none; font-size: smaller;">'+snippets[docIndex].map(function(snippet) {
    							return snippet.getHighlightedContext();
    						}).join(" … ")+'</li>'
    						var docItem = results.down("#"+results.getId()+"_"+id);
    						if (docItem.query("ul")) {
    							html="<ul>"+html+"</ul>";
    						}
    						docItem.insertHtml('beforeEnd', html)
    					}
    				}
    			}
        	})        		
    	}
	
    }
});
