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
		return this.getApplication().getWidget(widget);
	},
	
	getRenderTo: function() {
		if (Voyant.utils.Show) {
			var el = Voyant.utils.Show.TARGET.insertHtml('beforeEnd',"<div></div>");
			return el;
		}
	}
})