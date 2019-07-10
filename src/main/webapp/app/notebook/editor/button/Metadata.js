Ext.define("Voyant.notebook.editor.button.Metadata", {
	extend: "Ext.button.Button",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrappermetadata',
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
	glyph: 'xf02c@FontAwesome',
	textAlign: 'left',
	listeners: {
		click: function(btn, e) {
        	this.findParentByType('notebook').fireEvent("notebookWrapperMetadata", this.findParentByType("notebookeditorwrapper"), e);
		}
	}
})