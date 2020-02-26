Ext.define("Voyant.notebook.editor.button.MoveUp", {
	extend: "Ext.Button",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrappermoveup',
	statics: {
		i18n: {
		}
	},
	constructor: function(config) {
    	Ext.apply(this, {
    		tooltip: this.localize('tip')
    	})
        this.callParent(arguments);
	},
	glyph: 'xf062@FontAwesome',
	textAlign: 'left',
	listeners: {
		click: function() {
        	this.findParentByType('notebook').fireEvent("notebookWrapperMoveUp", this.findParentByType("notebookeditorwrapper"));
		}
	}
})