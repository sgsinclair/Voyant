Ext.define("Voyant.notebook.editor.button.MoveDown", {
	extend: "Ext.button.Button",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrappermovedown',
	statics: {
		i18n: {
			tip: {
				en: "Move Down"
			}
		}
	},
	constructor: function(config) {
    	Ext.apply(this, {
    		text: this.localize('tip')
    	})
        this.callParent(arguments);
	},
	glyph: 'xf0ab@FontAwesome',
	textAlign: 'left',
	listeners: {
		click: function() {
        	this.findParentByType('notebook').fireEvent("notebookWrapperMoveDown", this.findParentByType("notebookeditorwrapper"));
		}
	}
})