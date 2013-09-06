Ext.define("Voyant.utils.Embeddable", {
	mixins: ['Voyant.utils.Localization'],
	statics: {
		i18n: {
			widgetNotRecognized: {
				en: new Ext.Template('"{widget}" is not a recognized Voyant widget.')
			},
			knownWidgets: {
				en: 'Known widgets: '
			}
		}
	},
	transferable: ['getWidget','getRenderTo'],
	
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
	},
	
	getRenderTo: function() {
		if (Voyant.utils.Show) {
			var el = Voyant.utils.Show.TARGET.insertHtml('beforeEnd',"<div></div>");
			return el;
		}
	}
})