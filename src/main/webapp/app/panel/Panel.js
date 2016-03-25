Ext.define('Voyant.panel.Panel', {
	mixins: ['Voyant.util.Localization','Voyant.util.Api','Voyant.util.Toolable',/*'Voyant.notebook.util.Embeddable',*/'Voyant.util.DetailedError','Voyant.widget.QuerySearchField','Voyant.widget.StopListOption','Voyant.widget.TotalPropertyStatus'],
	alias: 'widget.voyantpanel',
	statics: {
		i18n: {
			term: {en: "Term"},
			rawFreq: {en: "Count"},
			relativeFreq: {en: 'Relative'},
			trend: {en: "Trend"},
			colon: {en: ': '},
			loading: {en: 'Loading'},
			error: {en: "Error"},
			info: {en: "Information"}
		}
	},
	constructor: function(config) {
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
//		this.mixins['Voyant.notebook.util.Embeddable'].constructor.apply(this, arguments);
		this.mixins['Voyant.util.Toolable'].constructor.apply(this, arguments);
		if (!this.glyph) {
			this.glyph = Ext.ClassManager.getClass(this).glyph
		}
	},
	
	getApplication: function() {
		return Voyant.application;
	},
	
	getBaseUrl: function() {
		return this.getApplication().getBaseUrl();
	},
	
	openUrl: function(url) {
		this.getApplication.openUrl.apply(this, arguments);
	},
	
	getTromboneUrl: function() {
		return this.getApplication().getTromboneUrl();
	},
	
	dispatchEvent: function() {
		var application = this.getApplication();
		application.dispatchEvent.apply(application, arguments);
	},
	
	showError: function(config) {
		this.getApplication().showError.apply(this, arguments)
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