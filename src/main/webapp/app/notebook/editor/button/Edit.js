Ext.define("Voyant.notebook.editor.button.Edit", {
	extend: "Ext.button.Button",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrapperedit',
	statics: {
		i18n: {
			tip: {
				en: "Edit"
			}
		}
	},
	constructor: function(config) {
    	Ext.apply(this, {
    		toolTip: this.localize('tip')
    	})
        this.callParent(arguments);
	},
	glyph: 'xf040@FontAwesome',
	listeners: {
		click: function() {
        	this.findParentByType('notebook').fireEvent("notebookWrapperEdit", this.findParentByType("notebookeditorwrapper"));
		}
	}
})