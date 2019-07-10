Ext.define("Voyant.notebook.editor.TextEditorWrapper", {
	extend: "Voyant.notebook.editor.EditorWrapper",
	requires: ["Voyant.notebook.editor.TextEditor","Voyant.notebook.editor.button.Edit"],
	alias: "widget.notebooktexteditorwrapper",
	cls: 'notebook-text-wrapper',
	config: {
		content: ''
	},
	minHeight: 85,
	constructor: function(config) {
		Ext.apply(this, {
			items: [{
				xtype: 'notebooktexteditor',
				content: Ext.Array.from(config.input).join("")
			}],
			dockedItems: [{
			    xtype: 'toolbar',
			    dock: 'left',
			    items: [{
				    	xtype: 'notebookwrapperadd'
					}
			    ]
			},{
			    xtype: 'toolbar',
			    dock: 'right',
			    items: [{
			    		xtype: 'notebookwrappercounter',
			    		order: config.order,
			    		name: config.name
			    	},{
		        		xtype: 'notebookwrapperremove'
		        	},{
			        	xtype: 'notebookwrappermoveup'
			        },{
			        	xtype: 'notebookwrappermovedown'
			        }
			    ]
			}]
		});
        this.callParent(arguments);
	},
	
	getContent: function() {
		return this.items.get(0).getContent();
	}
})