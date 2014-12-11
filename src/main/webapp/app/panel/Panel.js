Ext.define('Voyant.panel.Panel', {
	mixins: ['Voyant.util.Localization','Voyant.util.Api','Voyant.util.Toolable',/*'Voyant.notebook.util.Embeddable',*/'Voyant.util.DetailedError','Voyant.util.QuerySearchField','Voyant.widget.StopListOption'],
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
//		this.mixins['Voyant.notebook.util.Embeddable'].constructor.apply(this, arguments);
		this.mixins['Voyant.util.Toolable'].constructor.apply(this, arguments);
	},
	
	getApplication: function() {
		return Voyant.application
	},
	
	getBaseUrl: function() {
		return this.getApplication().getBaseUrl();
	},
	
	openUrl: function(url) {
		var win = window.open(url);
		if (!win) { // popup blocked
			Ext.Msg.show({
				title: "Popup Blocked",
				buttonText: {ok: "Close"},
				icon: Ext.MessageBox.INFO,
				message: "A popup window was blocked. <a href='"+url+"' target='_blank' class='link'>Click here</a> to open the new window.",
				buttons: Ext.Msg.OK,
			});
		}
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