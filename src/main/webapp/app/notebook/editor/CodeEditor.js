Ext.define("Voyant.notebook.editor.CodeEditor", {
	extend: "Ext.Component",
	alias: "widget.notebookcodeeditor",
	mixins: ["Voyant.util.Localization"],
	cls: 'notebook-code-editor',
	config: {
		theme: 'ace/theme/chrome',
		mode: 'ace/mode/javascript',
		content: ''
	},
	statics: {
		i18n: {
			emptyText: "// click here to edit"
		}
	},
	listeners: {
		boxready: function() {
			var me = this;
			this.editor = ace.edit(Ext.getDom(this.getEl()));
			this.editor.setTheme(this.getTheme());
			this.editor.getSession().setMode(this.getMode());
			this.editor.setOptions({minLines: 6, maxLines: 100});
			this.editor.setHighlightActiveLine(false);
			this.editor.renderer.setShowPrintMargin(false);
			this.editor.renderer.setShowGutter(false);
			this.editor.setValue(this.getContent() ? this.getContent() : this.localize('emptyText'));
			this.editor.clearSelection()
		    this.editor.on("focus", function() {
		    	me.editor.renderer.setShowGutter(true);
		    })
		    this.editor.on("blur", function() {
		    	me.editor.renderer.setShowGutter(false);
		    });
			this.editor.commands.addCommand({
				name: 'run',
			    bindKey: {win: "Shift-Enter", mac: "Shift-Enter"}, // additional bindings like alt/cmd-enter don't seem to work
			    exec: function(editor) {
			    	me.up('notebookcodeeditorwrapper').run();
			    }				
			})
		}
	},
	
	getValue: function() {
		return this.editor.getValue();
	}
})