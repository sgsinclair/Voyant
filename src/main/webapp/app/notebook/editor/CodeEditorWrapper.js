Ext.define("Voyant.notebook.editor.CodeEditorWrapper", {
	extend: "Voyant.notebook.editor.EditorWrapper",
	requires: ["Voyant.notebook.editor.CodeEditor","Voyant.notebook.editor.button.Run"],
	alias: "widget.notebookcodeeditorwrapper",
	cls: 'notebook-code-wrapper',
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	height: 130,
	border: false,
	constructor: function(config) {
		
		this.results = Ext.create('Ext.Component', {
			align: 'stretch',
			cls: 'notebook-code-results'
		});
		
		this.editor = Ext.create("Voyant.notebook.editor.CodeEditor", {
			content: config.content			
		})
		
		Ext.apply(this, {
			dockedItems: [{
			    xtype: 'toolbar',
			    dock: 'left',
			    items: [
					{
						xtype: 'notebookwrapperrun',
						listeners: {
							click: {
								fn: this.run,
								scope: this
							}
						}
					}
//					,' ',{
//						xtype: 'notebookwrappermovement'
//					},' ',{
//						xtype: 'notebookwrapperadd'
//					}
			    ]
			}],
			items: [this.editor, this.results]
		});
        this.callParent(arguments);
	},
	
	run: function() {
		this.results.show();
		this.results.update(' ');
		this.results.mask('working…');
		var code = this.editor.getValue();
		var success = false;
		try {
			Voyant.notebook.util.Show.TARGET = this.results.getEl();
			
			// I'd like to be able to run this in another scope/context, but it
			// doesn't seem possible for the type of code that's being run
			eval.call(window, code);
			
			Ext.defer(this.tryToUnmask, 20, this);
		}
		catch (e) {
			this.results.unmask();
			Voyant.application.releaseAllDeferred();
			Voyant.notebook.util.Show.showError(e);
		}
		return success;
	},
	
	tryToUnmask: function() {
		if (Voyant.application.getDeferredCount()==0) {
			for (var key in window) {
				if (typeof window[key] == 'object' && window[key] && window[key].isFulfilled &&  window[key].isFulfilled()) {
					window[key] = window[key].valueOf();
				}
			}
			this.results.unmask();
			if (this.results.getEl().dom.textContent.trim().length==0) {
//				this.results.hide();
			}
			this.fireEvent('editorresize'); 
		}
		else {
			Ext.defer(this.tryToUnmask, 20, this);
		}
	},
	
	getContent: function() {
		return this.editor.getValue();
	}
})