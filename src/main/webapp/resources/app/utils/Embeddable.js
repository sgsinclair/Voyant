Ext.define("Voyant.utils.Embeddable", {
	transferable: ['getWidget','getRenderTo'],
	
	/**
	 * Get a Voyant widget class for embedding.
	 * 
	 * @param {String/Function} 
	 * @returns {Voyant.widget.Widget} a Voyant widget that can be embedded.
	 */
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
		var message = '"'+widget+'" is not a recognized Voyant widget.';
		var widgets = [];
		for (widget in Voyant.widget) {
			widgets.push(widget);
		}
		message+=" Known widgets: "+widgets.join(", ");
		showError(message);
		return false;
	},
	
	/**
	 * Get a new element in which to embed a widget.
	 */
	getRenderTo: function() {
		if (Voyant.utils.Show) {
			var el = Voyant.utils.Show.TARGET.insertHtml('beforeEnd',"<div></div>");
			return el;
		}
	}
})