Ext.define("Voyant.notebook.editor.button.Add", {
	extend: "Ext.Button",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrapperadd',
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
	glyph: 'xf067@FontAwesome',
	textAlign: 'left',
	listeners: {
		click: function(btn, e) {
        	this.findParentByType('notebook').fireEvent("notebookWrapperAdd", this.findParentByType("notebookeditorwrapper"), e);
		}
	}
})