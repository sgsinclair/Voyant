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
	},
	
	getWidget: function(widget) {
		if (Ext.isFunction(widget)) {
			// could be wrong kind of widget, but because of binded calls it's hard to tell
			return widget
		}
		var name = "";
		if (Ext.isString(widget)) {
			if (Ext.isFunction(Voyant.widget[widget])) {
				return Voyant.widget[widget];
			}
			name = widget;
		}
		else {
			name = widget.toString();
		}
		var message = this.localize('widgetNotRecognized', {widget: widget});
		var widgets = [];
		for (widget in Voyant.widget) {
			widgets.push(widget);
		}
		message+=" "+this.localize('knownWidgets')+widgets.join(", ");
		showError(message);
		return false;
	}
});

Ext.onReady(function() {
//	Ext.require("Voyant.controller.Corpus")
})