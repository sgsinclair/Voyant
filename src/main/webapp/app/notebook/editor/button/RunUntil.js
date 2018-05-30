Ext.define("Voyant.notebook.editor.button.RunUntil", {
	extend: "Ext.button.Button",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrapperrununtil',
	statics: {
		i18n: {
		}
	},
	glyph: 'xf050@FontAwesome',
	constructor: function(config) {
		config = config || {};
		config.tooltip = this.localize('tip');
		this.callParent(arguments);
	}
})