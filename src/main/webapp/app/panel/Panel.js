Ext.define('Voyant.panel.Panel', {
	mixins: ['Voyant.util.Localization','Voyant.util.Api','Voyant.notebook.util.Embeddable','Voyant.util.DetailedError'],
	statics: {
		i18n: {
			term: {en: "Term"},
			rawFreq: {en: "Count"},
			relativeFreq: {en: 'Relative'},
			trend: {en: "Trend"},
			colon: {en: ': '},
			loading: {en: 'Loading'}
		}
	},
	constructor: function(config) {
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
		this.mixins['Voyant.notebook.util.Embeddable'].constructor.apply(this, arguments);
	},
	
	initComponent: function(config) {
		this.tools = this.getApplication().getTools();
	},
	
	getApplication: function() {
		return Voyant.application
	},
	
	getBaseUrl: function() {
		return this.getApplication().getBaseUrl();
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
	}
});