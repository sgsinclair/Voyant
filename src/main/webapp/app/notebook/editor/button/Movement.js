Ext.define("Voyant.notebook.editor.button.Movement", {
	extend: "Ext.button.Button",
	mixins: ["Voyant.util.Localization"],
	requires: ["Voyant.notebook.editor.button.MoveUp", "Voyant.notebook.editor.button.MoveDown", "Voyant.notebook.editor.button.Remove"],
	alias: 'widget.notebookwrappermovement',
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
	glyph: 'xf07d@FontAwesome',
	menu: [
		{
        	xtype: 'notebookwrappermoveup'
        },{
        	xtype: 'notebookwrappermovedown'
        },{
        	xtype: 'notebookwrapperremove'
        }
	]
})