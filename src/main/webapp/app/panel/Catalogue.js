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
    		lexicalTitle: {en: "Terms"},
    		noMatches: {'en': new Ext.Template('No matches (out of {0} documents).', {compiled: true})},
    		queryMatches: {en: new Ext.Template("{0} matching documents (out of {1}).", {compiled: true})},
    		clickToOpenCorpus: {'en': new Ext.Template('Please <a href="{0}" target="_blank" class="link">click here</a> to access your new corpus (since popup windows are blocked).', {compiled: true})},
    		"export": {en: "Export"},
    		exportTip: {en: "Create a new Voyant corpus with the selected documents."}
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
    	matchingDocIds: []
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
    		        			this.findParentByType('panel').updateResults([query])
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
	                    						win.close()
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
    		})
    	});
    	
    	this.on('afterrender', function(panel) {
    		var facets = this.getApiParam('facet');
    		if (Ext.isString(facets)) {facets = [facets]}
    		var facetsCmp = this.queryById('facets');
    		facets.forEach(function(facet) {
    			var facetCmp = facetsCmp.add({
    				title: panel.localize(facet+"Title"),
    				facet: facet,
    				bbar: [{
    					xtype: 'querysearchfield',
    					tokenType: facet.replace("facet.", ""),
    					inDocumentsCountOnly: true
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
    		var facetCmp = facetsCmp.add({
    			title: panel.localize('lexicalTitle'),
    			store: Ext.create("Voyant.data.store.CorpusTerms", {parentPanel: this}),
    			facet: 'lexical',
    			columns: [{
    				renderer: function(value, metaData, record) {return "("+record.getRawFreq()+") "+record.getTerm()},
    				flex: 1
    			}],
				bbar: [{
					xtype: 'querysearchfield'
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
		results.update("");
		this.queryById('export').setDisabled(true);
    	if (queries.length>0) {
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
    							var item = "<li>";
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
    					this.setMatchingDocIds(matchingDocIds);
    					if (matchingDocIds.length>0) {
    						this.queryById('export').setDisabled(false);
    					}
    				}
    			},
    			scope: this
    		})    		
    	}
    }
});
