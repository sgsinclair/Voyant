Ext.define("Voyant.notebook.editor.button.MoveDown", {
	extend: "Ext.Button",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrappermovedown',
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
	glyph: 'xf063@FontAwesome',
	textAlign: 'left',
	listeners: {
		click: function() {
        	this.findParentByType('notebook').fireEvent("notebookWrapperMoveDown", this.findParentByType("notebookeditorwrapper"));
		}
	}
})