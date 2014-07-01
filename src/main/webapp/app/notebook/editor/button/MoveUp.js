Ext.define("Voyant.notebook.editor.button.MoveUp", {
	extend: "Ext.button.Button",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrappermoveup',
	statics: {
		i18n: {
			tip: {
				en: "Move Up"
			}
		}
	},
	constructor: function(config) {
    	Ext.apply(this, {
    		text: this.localize('tip')
    	})
        this.callParent(arguments);
	},
	glyph: 'xf0aa@FontAwesome',
	textAlign: 'left',
	listeners: {
		click: function() {
        	this.findParentByType('notebook').fireEvent("notebookWrapperMoveUp", this.findParentByType("notebookeditorwrapper"));
		}
	}
})