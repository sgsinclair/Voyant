Ext.define("Voyant.notebook.editor.TextEditorWrapper", {
	extend: "Voyant.notebook.editor.EditorWrapper",
	requires: ["Voyant.notebook.editor.TextEditor","Voyant.notebook.editor.button.Edit"],
	alias: "widget.notebooktexteditorwrapper",
	cls: 'notebook-text-wrapper',
	config: {
		content: ''
	},
	minHeight: 85,
	dockedItems: [{
	    xtype: 'toolbar',
	    dock: 'left',
	    items: [
			{
		    	xtype: 'notebookwrappermovement'
		    },' ',{
		    	xtype: 'notebookwrapperadd'
			}
	    ]
	}],
	constructor: function(config) {
		Ext.apply(this, {
			items: [{
				xtype: 'notebooktexteditor',
				content: config.content
			}]
		});
        this.callParent(arguments);
	},
	
	getContent: function() {
		return this.items.get(0).getContent();
	}
})