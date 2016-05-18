Ext.define('Voyant.VoyantCorpusApp', {
	
    extend: 'Voyant.VoyantApp',
    
    name: 'VoyantCorpusApp',

    requires: ['Voyant.panel.CorpusSet','Voyant.data.model.Corpus','Voyant.panel.VoyantHeader', 'Voyant.panel.VoyantFooter', 'Voyant.panel.CorpusCreator', 'Voyant.panel.Cirrus', 'Voyant.panel.Summary', 'Voyant.panel.CorpusTerms', 'Voyant.panel.Reader', 'Voyant.panel.Documents', 'Voyant.panel.Trends', 'Voyant.panel.Contexts', 'Voyant.panel.DocumentTerms','Voyant.panel.CorpusCollocates','Voyant.panel.CollocatesGraph','Voyant.panel.Phrases','Voyant.panel.ScatterPlot','Voyant.panel.TopicContexts','Voyant.panel.TermsRadio'],
    
    statics: {
    	i18n: {
    	}
    },
    
	constructor: function() {
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
        this.callParent(arguments);
	},
	
    config: {
    	corpus: undefined,
    	moreTools: [{
			i18n: 'moreToolsScaleCorpus',
			glyph: 'xf065@FontAwesome',
			items: ['cirrus','corpusterms','bubblelines','corpuscollocates','microsearch','streamgraph','phrases','documents','summary','trends','scatterplot','termsradio','wordtree']
    	},{
			i18n: 'moreToolsScaleDocument',
			glyph: 'xf066@FontAwesome',
			items: ['bubbles','cirrus','contexts','documentterms','reader','textualarc','trends','knots']
    	},{
			i18n: 'moreToolsTypeViz',
			glyph: 'xf06e@FontAwesome',
			items: ['cirrus','bubblelines','bubbles','collocatesgraph','knots','microsearch','streamgraph','scatterplot','textualarc','trends','termsradio','wordtree']
		},{
			i18n: 'moreToolsTypeGrid',
			glyph: 'xf0ce@FontAwesome',
			items: ['corpusterms','corpuscollocates','phrases','contexts','documentterms','documents']
		},{
			i18n: 'moreToolsTypeOther',
			glyph: 'xf035@FontAwesome',
			items: ['reader','summary']
    	}]
    },
    
    launch: function() {
		this.callParent(arguments);

    	if (this.hasQueryToLoad()) {
        	var queryParams = Ext.Object.fromQueryString(document.location.search);
        	if (!queryParams.corpus && this.getCorpusId && this.getCorpusId()) {
        		queryParams.corpus = this.getCorpusId();
        	}
        	this.loadCorpusFromParams(queryParams)
    	}
    },
    
    loadCorpusFromParams: function(params) {
		var me = this;
		var view = me.getViewport()
		view.mask(this.localize("fetchingCorpus"));
		if (params.archive) { // fix a few URLs we know about
			if (Ext.isString(params.archive)) {params.archive=[params.archive]}
			params.archive = params.archive.map(function(archive) {
				return archive.replace('/blogs.sub.uni-hamburg.de/hup/lhn/', '/wikis.sub.uni-hamburg.de/lhn/index.php/')
					.replace('/hup.sub.uni-hamburg.de/', '/wikis.sub.uni-hamburg.de/')
			})
		}
		
		this.validateCorpusLoadParams(params);

		new Voyant.data.model.Corpus(params).then(function(corpus) {
			view.unmask();
			me.setCorpus(corpus);
			if (me.validateCorpusAccess()) {
				me.dispatchEvent('loadedCorpus', this, corpus);
			}
		}).otherwise(function() {
			view.unmask();
		})
    },
    
    validateCorpusLoadParams: function(params) {
    	// leave untouched by default, this can be overridden
    },
    
    validateCorpusAccess: function() {
		var me = this, view = me.getViewport(), corpus = this.getCorpus();
		if (corpus && corpus.requiresPassword() && !me.getViewport().query("panel").every(function(panel) {
			return !panel.isConsumptive
		})) {
			var noPasswordAccess = corpus.getNoPasswordAccess();
			var buttons = [
			       { text: 'Validate' }
			]
			if (noPasswordAccess=='NONCONSUMPTIVE') {
				buttons.push({text: 'Limited'})
			}
			var passWin = Ext.create('Ext.window.Window', {
	            title: me.localize('passwordRequiredTitle'),
			    layout: 'fit',
			    items: {
			    	padding: 10,
	                flex: 1,
	                width: 300,
	                layout: {
	                    type: 'vbox',
	                    align: 'stretch'
	                },
	                items: [
	                    {
	                        html: '<p>'+me.localize('passwordRequiredMessage')+'</p>' + (noPasswordAccess=='NONCONSUMPTIVE' ? '<p>'+me.localize('nonConsumptiveMessage')+"</p>" : "")+'</p>'
	                    },{
	                    	xtype: 'textfield',
	                    	fieldLabel: me.localize('password')
	                    }
	                ],
	                bbar: {
	//                	ui: 'footer',
	                	layout: {pack: 'center'},
	                	items: [{
	                    	text: me.localize('passwordValidateButton'),
	                    	ui: 'default',
	                    	handler: function() {
	                    		var password = passWin.query("textfield")[0].getValue().trim();
	                    		if (password.length==0) {
	                    			me.showError({
	                    				message: me.localize('noPasswordGiven')
	                    			})
	                    			return;
	                    		}
	                    		passWin.mask();
	                    		Ext.Ajax.request({
	                    			  url: me.getTromboneUrl(),
	                    			  params: {
	                    				  corpus: corpus.getId(),
	                    				  passwordForSession: password
	                    			  },
	                    			  method: 'POST',
	                    			  success: function(result, request) {
	                    				  passWin.unmask();
	                    				  var access = result.responseText;
	                    				  if (access=="ADMIN" || access=="ACCESS") {
			                    			    passWin.close();
			                    			    view.unmask();
					            				me.dispatchEvent('loadedCorpus', this, corpus);
	                    				  }
	                    				  else {
	  		                    			me.showError({
			                    				message: me.localize('badPassword')
			                    			})
	                    				  }
	                    			  },
	                    			  failure: function(result, request) {
	                    				  passWin.unmask();
	  		                    			me.showError({
			                    				message: me.localize('passwordValidationError')
			                    			})
	                    			  } 
	                    		});
	                    	}
	                    },{
	                    	text: me.localize('nonConsumptiveButton'),
	                    	handler: function() {
	                    		passWin.mask();
	                    		Ext.Ajax.request({
	                    			  url: me.getTromboneUrl(),
	                    			  params: {
	                    				  corpus: corpus.getId(),
	                    				  passwordForSessionRemove: true
	                    			  },
	                    			  method: 'POST',
	                    			  callback: function(result, request) { // do this even if request fails
	                    				  passWin.unmask();
	                    				  passWin.close();
	                    				  view.unmask();
	                    				  me.dispatchEvent('loadedCorpus', me, corpus);
	                    			  }
	                    		});
	                    	}
	                    }]
	                }
	            }
			}).show();
			return false;
		} else {
			return true
		}
    },
    
    hasQueryToLoad: function(params) {
    	if (!params) {
    		params = Ext.Object.fromQueryString(document.location.search);
    	}
    	return params.corpus || params.input || (this.getCorpusId && this.getCorpusId()); // TODO: should this include "archive" from V1?
    },
    
    listeners: {
    	loadedCorpus: function(src, corpus) {
    		this.setCorpus(corpus);
    		this.on("unhandledEvent", function(src, eventName, data) {
				var url = this.getBaseUrl() + '?corpus='+corpus.getId();
				var api = this.getModifiedApiParams() || {}; // use application, not tool
				delete api.view; // make sure we show default view
				if (eventName=='termsClicked') {
					api.query=data;
				}
				else if (eventName=='documentsClicked') {
					var docIndex = [];
					if (data.forEach) {
						data.forEach(function(doc) {
							docIndex.push(doc.getIndex())
						})
					}
					api.docIndex=docIndex
				}
				else if (eventName=='corpusTermsClicked') {
					if (data.map) {
						api.query = data.map(function(corpusTerm) {return corpusTerm.getTerm()});
					}
				}
				else if (eventName=='documentTermsClicked') {
					if (data.map) {
						api.query = data.map(function(documentTerm) {return documentTerm.getTerm()});
						api.docIndex = data.map(function(documentTerm) {return documentTerm.getDocIndex()});
					}
				}
				else {
					if (console) {console.warn("Unhandled event: "+eventName, data)}
					return;
				}
				url += "&"+Ext.Object.toQueryString(api)
				this.openUrl(url)
			})
    	}
    }

});