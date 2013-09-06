Ext.define('Voyant.Application', {
	extend: 'Ext.app.Application',
	requires: ['Voyant.data.Corpus','Voyant.widget.Cirrus','Voyant.widget.CorpusTermsGrid','Voyant.widget.ContextsGrid'],
	mixins: ['Voyant.utils.Localization'],
	statics: {
		i18n: {}
	},
	baseUrl: null,
	
	setBaseUrl : function(baseUrl) {
		this.baseUrl = baseUrl;
		Ext.BLANK_IMAGE_URL = this.baseUrl + '../resources/lib/extjs/current/resources/themes/images/default/tree/s.gif';
	},
	
	getBaseUrl : function() {
		return this.baseUrl;
	},
	
	constructor: function(config) {
		this.setBaseUrl(document.location.protocol+'//'+document.location.host+document.location.pathname);
		this.callParent(arguments);
	}
});

Ext.onReady(function() {
//	Ext.require("Voyant.controller.Corpus")
})