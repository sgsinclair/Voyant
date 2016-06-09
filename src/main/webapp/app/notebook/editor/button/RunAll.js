Ext.define("Voyant.notebook.editor.button.RunAll", {
	extend: "Ext.button.Button",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrapperrunall',
	statics: {
		i18n: {
			tip: "Run all code blocks below."
		}
	},
	glyph: 'xf04e@FontAwesome',
	constructor: function(config) {
		config = config || {};
		config.tooltip = this.localize('tip');
		this.callParent(arguments);
	}
})