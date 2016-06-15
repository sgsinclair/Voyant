Ext.define('Voyant.panel.Panel', {
	mixins: ['Voyant.util.Localization','Voyant.util.Api','Voyant.util.Toolable','Voyant.util.DetailedError'],
	requires: ['Voyant.widget.QuerySearchField','Voyant.widget.StopListOption','Voyant.widget.TotalPropertyStatus'],
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
	constructor: function(config) {
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
//		this.mixins['Voyant.notebook.util.Embeddable'].constructor.apply(this, arguments);
		this.mixins['Voyant.util.Toolable'].constructor.apply(this, arguments);
		if (!this.glyph) {
			this.glyph = Ext.ClassManager.getClass(this).glyph
		}
		
		this.on("afterrender", function() {
			if (this.getApiParam('subtitle') && this.getTitle()) {
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
	
	showError: function(config) {
		this.getApplication().showError(config)
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
	}
	
});