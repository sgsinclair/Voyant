Ext.define('Voyant.panel.Catalogue', {
	extend: 'Ext.panel.Panel',
	requires: ['Voyant.widget.Facet'],
	mixins: ['Voyant.panel.Panel','Voyant.util.Downloadable'],
	
	alias: 'widget.catalogue',
    statics: {
    	i18n: {
    	},
    	api: {
    		config: undefined,
    		stopList: 'auto',
    		facet: ['facet.title','facet.author','facet.language']
    	},
		glyph: 'xf1ea@FontAwesome'
    },
    config: {
    	facets: {},
    	matchingDocIds: [],
    	customResultsHtml: undefined
    },
    
    constructor: function(config) {
    	config = config || {};

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
    		        		frame: true,
    		            	includeTools: {
    		            		close: {
    		            			type: 'close',
    		                		tooltip: this.localize('closeFacetTip'),
    		                		callback: function(facetCmp) {
    		                			delete this.facets[facetCmp.facet]; // remove from facets map
    		                			facetCmp.destroy(); // remove this facet
    		                			this.updateResults();
    		                		},
    		                		scope: this
    		            		},
    		            		add: {
    		            			type: 'plus',
    		                		tooltip: this.localize('plusFacetTip'),
    		                		callback: function() {
    		                			this.addFacet();
    		                		},
    		                		scope: this
    		            		}
    		            	}
    		        	},
    		        	items: []
    		        },
    		        {
    		        	xtype: 'panel',
    		        	html: config.customResultsHtml || '',
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
    		        		itemId: 'sendToVoyant',
    		        		text: this.localize('sendToVoyantButton'),
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
	                    				catalogue.openUrl(url);
    		            		    },
    		            		    failure: function(response, opts) {
    		            		    	catalogue.unmask();
    		            		    	me.showResponseError("Unable to export corpus: "+catalogue.getCorpus().getId(), response);
    		            		    }
    		            		})

    		        		},
    		        		scope: this
    		        	},{
    		        		itemId: 'export',
    		        		text: this.localize('downloadButton'),
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
    		            		    	catalogue.downloadFromCorpusId(json.corpus.id);
    		            		    },
    		            		    failure: function(response, opts) {
    		            		    	catalogue.unmask();
    		            		    	me.showResponseError("Unable to export corpus: "+catalogue.getCorpus().getId(), response);
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
    		        }, {
    		        	xtype: 'reader',
    		        	flex: 1,
    		        	height: '100%',
    		        	align: 'stretch'
    		        }]
    	});

        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		this.queryById('status').update(new Ext.XTemplate(this.localize('noMatches')).apply([corpus.getDocumentsCount()]))
    		if (!this.getCustomResultsHtml()) {
    			this.setCustomResultsHtml(new Ext.XTemplate(this.localize('noMatches')).apply([corpus.getDocumentsCount()]));
    			this.updateResults();
    	    	Ext.Ajax.request({
    	    	    url: this.getTromboneUrl(),
    	    	    params: {
    	        		tool: 'resource.StoredResource',
    	        		verifyResourceId: 'customhtml-'+corpus.getAliasOrId()
    	    	    },
    	    	    success: function(response, req) {
    	    	    	var json = Ext.util.JSON.decode(response.responseText);
    	    	    	if (json && json.storedResource && json.storedResource.id) {
    	        	    	Ext.Ajax.request({
    	        	    	    url: this.getTromboneUrl(),
    	        	    	    params: {
    	        	        		tool: 'resource.StoredResource',
    	        	        		retrieveResourceId: 'customhtml-'+corpus.getAliasOrId()
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
    		
    		var facetsCmp = this.queryById('facets');
			this.addFacet({
				facet: 'lexical',
    			includeTools: {add: {
        			type: 'plus',
            		tooltip: this.localize('plusFacetTip'),
            		callback: function() {
            			this.addFacet();
            		},
            		scope: this
        		}},
				store: new Voyant.data.store.CorpusTerms({
					parentPanel: this,
    				proxy: {
    					extraParams: {
    	    				stopList: this.getApiParam("stopList")
    					}
    				}
				})
			}, facetsCmp)
    		
    		var facets = this.getApiParam('facet');
    		if (Ext.isString(facets)) {facets = facets.split(",")}
    		facets.forEach(function(facet) {
    			this.addFacet({facet: facet}, facetsCmp)
    			/*
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
    			})*/
    		}, this);
			

			
    		/*
			facetCmp.getSelectionModel().on('selectionchange', function(model, selected) {
				var labels = [];
				selected.forEach(function(model) {
					labels.push({facet: 'lexical', label: model.getTerm()})
				})
				panel.getFacets()['lexical'] = labels;
				panel.updateResults();
			})*/
    	})
    	
    },
    
    addFacet: function(config, facetsCmp) {
    	if (!config) {
    		// select first, then add
    		return this.selectFacet(function(facet) {
    			this.addFacet({facet: facet})
    		})
    	}
		facetsCmp = facetsCmp || this.queryById('facets');
    	var facet = config.facet,
    		itemTpl = '<span style="font-size: smaller;">(<span class="info-tip" data-qtip="'+this.localize('matchingDocuments')+'">{inDocumentsCount}</span>)</span> {term}'+'<span style="font-size: smaller;"> (<span class="info-tip" data-qtip="'+this.localize('rawFreqs')+'">{rawFreq}</span>)</span>'

		var title = this.localize(facet+"Title");
		if (title=="["+facet+"Title]") {
			title = facet.replace(/^facet\./,"").replace(/^extra./,"");
		}
		var matchingDocumentsLabel = this.localize('matchingDocuments');
		
		Ext.applyIf(config, {
			title: title,
			collapsible: true,
			facet: facet,
			columns: [{
				renderer: function(value, metaData, record) {
					return '<span style="font-size: smaller;">(<span class="info-tip" data-qtip="'+this.localize('matchingDocuments')+'">'+record.getInDocumentsCount()+"</span>) </span>"+
						(record.getLabel ? record.getLabel() : record.getTerm()+'<span style="font-size: smaller;"> (<span class="info-tip" data-qtip="'+this.localize('rawFreqs')+'">'+record.getRawFreq()+"</span>)</span>")
				},
				flex: 1
			}],
			bbar: [{
				xtype: 'querysearchfield',
				width: '100%',
				tokenType: facet.replace("facet.", ""),
				itemTpl: itemTpl
			}],
			corpus: this.getCorpus()
		})
		
		var facetCmp = facetsCmp.add(config);
		
		facetCmp.getSelectionModel().on('selectionchange', function(model, selected) {
			var labels = [];
			selected.forEach(function(model) {
				labels.push({facet: facetCmp.facet, label: model.getLabel ? model.getLabel() : model.getTerm()})
			})
			this.getFacets()[facet] = labels;
			this.updateResults();
		}, this)
		facetCmp.on('query', function(model, selected) {
			this.getFacets()[facetCmp.facet] = [];
			this.updateResults();
		}, this)
    	return facetCmp;
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
		results.update(this.getCustomResultsHtml() ? this.getCustomResultsHtml() : new Ext.XTemplate(this.localize('noMatches')).apply([this.getCorpus().getDocumentsCount()]));
		this.queryById('status').update(new Ext.XTemplate(this.localize('noMatches')).apply([this.getCorpus().getDocumentsCount()]))
		this.queryById('sendToVoyant').setDisabled(true);
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
    							item += "<a href='#' class='cataloguedoctitle' data='"+docId+"'>"+doc.getTitle()+"</a>";
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
    											labelItems+="<li>"+(isArray ? '' : suffix.replace('extra.','')+": ")+(isMatch ? '<span class="keyword">'+l+'</span>' : l)+"</li>"
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
    					var me = this;
    					var lnks = results.query(".cataloguedoctitle");
    					lnks.forEach(function(lnk) {
    						Ext.get(lnk).on("click", function(e,el) {
    							this.dispatchEvent("documentSelected", me, el.getAttribute("data"));
    						}, me)
    					});
    					if (lnks.length==1) {
    						this.dispatchEvent("documentSelected", me, lnks[0].getAttribute("data"));
    					}
    					this.queryById('status').update(new Ext.XTemplate(this.localize('queryMatches')).apply([matchingDocIds.length,this.getCorpus().getDocumentsCount()]))
    					this.setMatchingDocIds(Ext.Array.clone(matchingDocIds));
    					if (matchingDocIds.length>0) {
    						this.queryById('export').setDisabled(false);
    						this.queryById('sendToVoyant').setDisabled(false);
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
	
    },
    
    selectFacet: function(callback) {
    	if (!this.facetsSelectionStore) {
    		var keys = {};
    		this.getCorpus().getDocuments().each(function(doc) {
    			for (var key in doc.getData()) {
    				if (key!="corpus" && key.indexOf("parent")!==0 && key.indexOf("-lexical")=="-1") {
        				keys[key] = true
    				}
    			}
    		});
    		keys = Object.keys(keys);
    		keys.sort();
    		this.facetsSelectionStore = Ext.create('Ext.data.ArrayStore', {
    		    fields: ['text'],
    		    data: keys.map(function(key) {return [key]})
    		});
    	}
    	
    	var existingFacets = {};
    	this.queryById('facets').items.each(function(cmp) {
    		existingFacets[cmp.facet]=true;
    	})

    	this.facetsSelectionStore.filterBy(function(record) {
    		return !("facet."+record.get('text') in existingFacets)
    	})
    	
		var win = Ext.create('Ext.window.Window', {
			title: this.localize("selectFacet"),
			modal: true,
			items: {
				xtype: 'form',
				width: 300,
				items: {
					xtype: 'combo',
					store: this.facetsSelectionStore,
					forceSelection: true,
					width: 300
				},
				buttons: [{
	            	text: this.localize("cancel"),
		            ui: 'default-toolbar',
	                glyph: 'xf00d@FontAwesome',
	        		flex: 1,
	        		handler: function(btn) {
	        			btn.up('window').close();
	        		}
				},{
	            	text: this.localize("select"),
					glyph: 'xf00c@FontAwesome',
	            	flex: 1,
	        		handler: function(btn) {
	        			var facet = btn.up('window').down('combo').getValue();
	        			if (!facet) {
	        				return this.showError(this.localize('selectValidFacet'));
	        			} else {
	        				callback.call(this, "facet."+facet);
		        			btn.up('window').close();
	        			}
	        		},
	        		scope: this
	            }]
			},
			bodyPadding: 5
		}).show()
    }
    
});
