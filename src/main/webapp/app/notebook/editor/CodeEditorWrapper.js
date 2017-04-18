Ext.define("Voyant.notebook.editor.CodeEditorWrapper", {
	extend: "Voyant.notebook.editor.EditorWrapper",
	requires: ["Voyant.notebook.editor.CodeEditor","Voyant.notebook.editor.button.Run",,"Voyant.notebook.editor.button.RunAll"],
	alias: "widget.notebookcodeeditorwrapper",
	cls: 'notebook-code-wrapper',
	statics: {
		i18n: {
			previousNotRunTitle: "Previous Code Blocks",
			previousNotRun: "There are previous blocks that have not been run (and may be needed for the code in this block). Do you wish to run all code blocks instead?"
		}
	},
	config: {
		isRun: false
	},
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	height: 130,
	border: false,
	constructor: function(config) {

		this.results = Ext.create('Ext.Component', {
			align: 'stretch',
			cls: 'notebook-code-results',
			html: Ext.Array.from(config.output).join("")
		});
		
		this.editor = Ext.create("Voyant.notebook.editor.CodeEditor", {
			content: Ext.Array.from(config.input).join("\n"),
			docs: config.docs
		});
		
		Ext.apply(this, {
			dockedItems: [{
			    xtype: 'toolbar',
			    dock: 'left',
			    items: [
					{
						xtype: 'notebookwrapperadd'
					},{
						xtype: 'notebookwrapperrun',
						listeners: {
							click: {
								fn: this.run,
								scope: this
							}
						}
					},{
						xtype: 'notebookwrapperrununtil',
						listeners: {
							click: {
								fn: function() {
									this.up('notebook').runAllCode(this)
								},
								scope: this
							}
						}
					},{
						
						xtype: 'notebookwrapperrunall',
						listeners: {
							click: {
								fn: function() {
									this.up('notebook').runAllCode()
								},
								scope: this
							}
						}
					}
			    ]
			},{
			    xtype: 'toolbar',
			    dock: 'right',
			    items: [{
			    		xtype: 'notebookwrappercounter',
			    		order: config.order
			    	},{
		        		xtype: 'notebookwrapperremove'
		        	},{
			        	xtype: 'notebookwrappermoveup'
			        },{
			        	xtype: 'notebookwrappermovedown'
			        }
			    ]
			}],
			items: [this.editor, this.results]
		});
		
        this.callParent(arguments);

	},
	
	initComponent: function() {
		var me = this;
		me.on("afterrender", function(){
			this.getTargetEl().on("resize", function(el) {
				var height = 20;
				me.items.each(function(item) {height+=item.getHeight();})
				me.setSize({height: height});
			})
		}, this);
		me.callParent(arguments);
	},
	
	run: function(runningAll) {
		if (runningAll===true) {
			this._run();
		} else {
			var notebook = this.up('notebook');
			Ext.Array.each(notebook.query('notebookcodeeditorwrapper'), function(wrapper) {
				if (wrapper==this) {this._run(); return false;} // break
				if (wrapper.getIsRun()==false) {
					Ext.Msg.confirm(this.localize('previousNotRunTitle'), this.localize('previousNotRun'), function(btnId) {
						if (btnId=='yes') {
							notebook.runAllCode();
						} else {
							this._run();
						}
					}, this)
				}
			}, this);
		}
	},
	
	_run: function() {
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
		this.setIsRun(true);
		return success;
	},
	
	clearResults: function() {
		this.results.show();
		this.results.update(' ');
		this.getTargetEl().fireEvent('resize');
	},
	
	tryToUnmask: function() {
		if (Voyant.application.getDeferredCount()==0) {
			for (var key in window) {
				if (typeof window[key] == 'object' && window[key] && key!="opener" && window[key].isFulfilled &&  window[key].isFulfilled()) {
					window[key] = window[key].valueOf();
				}
			}
			this.results.unmask();
			this.getTargetEl().fireEvent('resize');
		}
		else {
			Ext.defer(this.tryToUnmask, 20, this);
		}
	},
	
	getContent: function() {
		var el = this.results.getTargetEl(), resultEl = el.dom.cloneNode(true);
		var html = resultEl.innerHTML;
		if (!resultEl.style.height) {
			html = "<div style='height: "+el.getHeight()+"px'>"+html+"</div>";
		}
		return {
			input: this.editor.getValue(),
			output: html
		}
	}
})