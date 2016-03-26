Ext.define('Voyant.VoyantCorpusApp', {
	
    extend: 'Voyant.VoyantApp',
    
    name: 'VoyantCorpusApp',

    requires: ['Voyant.panel.CorpusSet','Voyant.data.model.Corpus','Voyant.panel.VoyantHeader', 'Voyant.panel.VoyantFooter', 'Voyant.panel.CorpusCreator', 'Voyant.panel.Cirrus', 'Voyant.panel.Summary', 'Voyant.panel.CorpusTerms', 'Voyant.panel.Reader', 'Voyant.panel.Documents', 'Voyant.panel.Trends', 'Voyant.panel.Contexts', 'Voyant.panel.DocumentTerms','Voyant.panel.CorpusCollocates','Voyant.panel.CollocatesGraph','Voyant.panel.Phrases','Voyant.panel.ScatterPlot','Voyant.panel.TopicContexts','Voyant.panel.TermsRadio'],
    
    statics: {
    	i18n: {
    		fetchingCorpus: {en: 'Fetching your corpus'},
    		moreToolsScale: {en: 'Tools by Scale'},
    		moreToolsScaleCorpus: {en: 'Corpus Tools'},
    		moreToolsScaleDocument: {en: 'Document Tools'},
    		moreToolsType: {en: 'Tools by Type'},
    		moreToolsTypeViz: {en: 'Visualization Tools'},
    		moreToolsTypeGrid: {en: 'Grid Tools'},
    		moreToolsTypeOther: {en: 'Other Tools'},
    		passwordRequiredTitle: {en: "Access Code Required"},
    		passwordRequiredMessage: {en: "This corpus requires an access code."},
    		nonConsumptiveMessage: {en: "Alternatively, you can click on the <i>Limited Access</i> button to continue with limited functionality (generally speaking, this non-consumpive access allows you to explore derivative data from the corpus without allowing you to read text from the corpus)."},
    		nonConsumptiveButton: {en: "Limited Access"}, 
    		passwordValidateButton: {en: "Validate"},
    		password: {en: "access code"},
    		noPasswordGiven: {en: "Please provide an access code."},
    		badPassword: {en: "Sorry, that doesn't seem to be a valid access code."},
    		passwordValidationError: {en: "Sorry, an unexpected error occurred while trying to validate your access code."}
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
			items: ['cirrus','corpusterms','bubblelines','corpuscollocates','documentsimilarity','streamgraph','phrases','documents','summary','trends','scatterplot','termsradio']
    	},{
			i18n: 'moreToolsScaleDocument',
			glyph: 'xf066@FontAwesome',
			items: ['cirrus','contexts','documentterms','reader','trends','knots']
    	},{
			i18n: 'moreToolsTypeViz',
			glyph: 'xf06e@FontAwesome',
			items: ['cirrus','bubblelines','collocatesgraph','knots','trends','streamgraph','documentsimilarity','scatterplot','termsradio']
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
        	this.loadCorpusFromParams(queryParams)
    	}
    },
    
    loadCorpusFromParams: function(params) {
		var me = this;
		var view = me.getViewport()
		view.mask(this.localize("fetchingCorpus"));
		
		new Corpus(params).then(function(corpus) {
			if (corpus.requiresPassword()) {
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
//	                    	ui: 'footer',
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
//				passWin.show();
				
			}
			else {
				view.unmask();
				me.dispatchEvent('loadedCorpus', this, corpus);
			}
		}).fail(function(message, response) {
			debugger
			view.unmask();
			//me.showErrorResponse({message: message}, response);
		});
    },
    
    hasQueryToLoad: function(params) {
    	if (!params) {
    		params = Ext.Object.fromQueryString(document.location.search);
    	}
    	return params.corpus || params.input; // TODO: should this include "archive" from V1?
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
				}
				url += "&"+Ext.Object.toQueryString(api)
				this.openUrl(url)
			})
    	}
    }

});