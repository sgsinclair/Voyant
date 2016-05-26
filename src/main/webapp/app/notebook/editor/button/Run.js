Ext.define("Voyant.notebook.editor.button.Run", {
	extend: "Ext.button.Button",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrapperrun',
	statics: {
		i18n: {
			tip: {
				en: "Run the script in this block (Shift-Enter)"
			}
		}
	},
	glyph: 'xf144@FontAwesome'
})