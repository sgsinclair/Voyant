Ext.define('Voyant.panel.Panel', {
	mixins: ['Voyant.util.Localization','Voyant.util.Api','Voyant.util.Toolable','Voyant.util.DetailedError'],
	requires: ['Voyant.widget.QuerySearchField','Voyant.widget.StopListOption','Voyant.widget.CategoriesOption','Voyant.widget.TotalPropertyStatus'],
	alias: 'widget.voyantpanel',
	statics: {
		i18n: {
		},
		config: {
			corpusValidated: false
		},
		api: {
			corpus: undefined,
			input: undefined,
			inputFormat: undefined,
			subtitle: undefined
		}
	},
	config: {
		corpus: undefined
	},
	constructor: function(config) {
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
		this.mixins['Voyant.util.Toolable'].constructor.apply(this, arguments);
		if (!this.glyph) {
			this.glyph = Ext.ClassManager.getClass(this).glyph
		}
		
		this.on("afterrender", function() {
			if (this.getXType()!='facet' && this.getApiParam('subtitle') && this.getTitle()) {
				this.setTitle(this.getTitle()+" <i style='font-size: smaller;'>"+this.getApiParam('subtitle')+"</i>")
			}
			if (this.isXType("grid")) {
				this.getSelectionModel().on("selectionchange", function(store, records) {
//					console.warn(records, this.selectedRecordsToRemember)
//					this.selectedRecordsToRemember = records;
				}, this);
				this.getStore().on("beforeload", function() {
					this.selectedRecordsToRemember = this.getSelection();
				}, this)
				this.getStore().on("load", function(store, records) {
					if (Ext.Array.from(this.selectedRecordsToRemember).length>0) {
						// combine contents of store with contents of remembered items, filtering out duplicates
						var seen = {}
						var mergedRecords = Ext.Array.merge(this.selectedRecordsToRemember, records).filter(function(item) {
							if (!(item.getId() in seen)) {
								seen[item.getId()]=true;
								return true
							} else {
								return false;
							}
						});
						if (store.isBufferedStore) {
							if (store.currentPage==1) {
								store.data.addAll(mergedRecords);
								store.totalCount = mergedRecords.length;
								store.fireEvent('refresh', store);
							}
						} else {
							store.loadRecords(mergedRecords);
							this.getSelectionModel().select(this.selectedRecordsToRemember);
							store.fireEvent('refresh', store);
							this.selectedRecordsToRemember = [];
						}
					}
				}, this);
			}
		}, this);
		
		this.on({
			loadedCorpus: {
				fn: function(src, corpus) {
					this.setCorpus(corpus);
				},
				priority: 999, // very high priority
				scope: this
			}
		});
	},
	
	getApplication: function() {
		return Voyant.application;
	},
	
	getBaseUrl: function() {
		return this.getApplication().getBaseUrl();
	},
	
	openUrl: function(url) {
		this.getApplication().openUrl.apply(this, arguments);
	},
	
	getTromboneUrl: function() {
		return this.getApplication().getTromboneUrl();
	},
	
	dispatchEvent: function() {
		var application = this.getApplication();
		application.dispatchEvent.apply(application, arguments);
	},
	
	showError: function(config, response) {
		Ext.applyIf(config, {
			title: this.localize("error")+" ("+this.localize("title")+")"
		})
		this.getApplication().showError(config, response)
	},
	
	showResponseError: function(config, response) {
		this.getApplication().showResponseError(config, response)
	},
	
	toastError: function(config) {
		if (Ext.isString(config)) {
			config = {html: config}
		}
		Ext.applyIf(config, {
			glyph: 'xf071@FontAwesome',
			title: this.localize("error")
		})
		this.toast(config);
	},
	
	toastInfo: function(config) {
		if (Ext.isString(config)) {
			config = {html: config}
		}
		Ext.applyIf(config, {
			glyph: 'xf05a@FontAwesome',
			title: this.localize("info")
		})
		this.toast(config);
	},
	
	toast: function(config) {
		if (Ext.isString(config)) {
			config = {html: config}
		}
		Ext.applyIf(config, {
			 slideInDuration: 500,
			 shadow: true,
			 align: 'b',
			 anchor: this.getTargetEl()			
		})
		Ext.toast(config);
	},

	/**
	 * Checks to see if we have access to this corpus, first by checking the application's
	 * access setting for the corpus, then by checking the corpus setting.
	 * 
	 * Assumes we're only calling this from a non-consumptive tool.
	 */
	hasCorpusAccess: function(corpus) {
		var app = this.getApplication();
		if (app) {
			var corpusAccess = app.getCorpusAccess();
			if (corpusAccess=='ADMIN' || corpusAccess=='ACCESS') {return true;}
		}
		if (!corpus) {
			if (this.getCorpus) {
				corpus = this.getCorpus();
			}
			if (!corpus && app.getCorpus) {
				corpus = app.getCorpus();
			}
		}
		if (corpus) {
			return corpus.getNoPasswordAccess()!='NONCONSUMPTIVE' && corpus.getNoPasswordAccess()!='NONE';
		}
		return false; // don't know if we ever get here
	}
	
});