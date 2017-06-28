Ext.define("Voyant.notebook.editor.CodeEditorWrapper", {
	extend: "Voyant.notebook.editor.EditorWrapper",
	requires: ["Voyant.notebook.editor.CodeEditor","Voyant.notebook.editor.button.Run",,"Voyant.notebook.editor.button.RunAll"],
	alias: "widget.notebookcodeeditorwrapper",
	cls: 'notebook-code-wrapper',
	statics: {
		i18n: {
			previousNotRunTitle: "Previous Code Blocks",
			previousNotRun: "There are previous blocks that have not been run (and may be needed for the code in this block). Do you wish to run all code blocks instead?",
			modeCode: "Code",
			modeData: "Data",
			modeJavascript: "Javascript (default)",
			modeJson: "JSON",
			modeText: "Text",
			modeCsv: "CSV (comma-separated values)",
			modeTsv: "TSV (tab-separated values)",
			modeHtml: "HTML",
			modeXml: "XML"
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
			docs: config.docs,
			mode: 'ace/mode/'+(config.mode ? config.mode : 'javascript')
		});
		
		Ext.apply(this, {
			dockedItems: [{
			    xtype: 'toolbar',
			    dock: 'left',
			    defaults: {
			    	textAlign: 'left'
			    },
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
						xtype: 'button',
						glyph: 'xf1c9@FontAwesome',
						tooltip: this.localize('codeModeTip'),
						listeners: {
							click: function() {
								var me = this;
								new Ext.Window({
								    title: 'Resize Me',
								    layout: 'fit',
								    width: 200,
								    items: [{
										xtype: 'form',
										layout: {
											type: 'vbox',
											align: 'stretch'
										},
										bodyPadding: 10,
										items: [{
											xtype: 'fieldset',
											title: this.localize("modeCode"),
											items: {
							                    xtype : 'radiofield',
							                    boxLabel : this.localize('modeJavascript'),
							                    name  : 'codeMode',
							                    inputValue: 'javascript',
							                    flex  : 1													
											}
										},{
											xtype: 'fieldset',
											title: this.localize("modeData"),
											items: [{
												items: {
								                    xtype : 'radiofield',
								                    boxLabel : this.localize('modeJson'),
								                    name  : 'codeMode',
								                    inputValue: 'javascript',
								                    flex  : 1													
												}
											},{
												items: {
								                    xtype : 'radiofield',
								                    boxLabel : this.localize('modeText'),
								                    name  : 'codeMode',
								                    inputValue: 'text',
								                    flex  : 1													
												}
											},/*{
												items: {
								                    xtype : 'radiofield',
								                    boxLabel : this.localize('modeCsv'),
								                    name  : 'codeMode',
								                    inputValue: 'csv',
								                    flex  : 1													
												}
											},{
												items: {
								                    xtype : 'radiofield',
								                    boxLabel : this.localize('modeTsv'),
								                    name  : 'codeMode',
								                    inputValue: 'tsv',
								                    flex  : 1													
												}
											},*/{
												items: {
								                    xtype : 'radiofield',
								                    boxLabel : this.localize('modeHtml'),
								                    name  : 'codeMode',
								                    inputValue: 'html',
								                    flex  : 1													
												}
											},{
												items: {
								                    xtype : 'radiofield',
								                    boxLabel : this.localize('modeXml'),
								                    name  : 'codeMode',
								                    inputValue: 'xml',
								                    flex  : 1													
												}
											}]
										}]
								    }],
								   buttons: [{
								        text: this.localize('ok'),
								        handler: function() {
								        	var win = this.up('window'); values = win.down('form').getForm().getValues();
								        	me.switchModes(values.codeMode);
								        	win.close();
								        }
								    },{
								        text:  this.localize('cancel'),
								        handler: function() {
								        	this.up('window').close();
								        }
								    }]
								}).show();
							},
							scope: this
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
	
	initComponent: function(config) {
		var me = this;
		me.on("afterrender", function() {
			if (this.editor && this.editor.getMode() != 'ace/mode/javavscript') {
				this.switchModes(this.editor.getMode(), true)
			}
			this.getTargetEl().on("resize", function(el) {
				var height = 20;
				me.items.each(function(item) {height+=item.getHeight();})
				me.setSize({height: height});
			})
		}, this);
		me.callParent(arguments);
	},
	
	switchModes: function(mode, light) {
		var runnable = mode.indexOf('javascript')>-1;
		this.down('notebookwrapperrun').setVisible(runnable);
		this.down('notebookwrapperrununtil').setVisible(runnable);
		this.results.setVisible(runnable);
		if (!light) {
			this.editor.switchModes(mode);
		}
	},
	
	run: function(runningAll) {
		if (this.editor.getMode()=='ace/mode/javascript') { // only run JS
			if (runningAll===true) {
				this._run();
			} else {
				var notebook = this.up('notebook');
				Ext.Array.each(notebook.query('notebookcodeeditorwrapper'), function(wrapper) {
					if (wrapper==this) {this._run(); return false;} // break
					if (wrapper.editor && wrapper.editor.getMode() == 'ace/mode/javascript' && wrapper.getIsRun()==false) {
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
		}
	},
	
	_run: function() {
		this.results.show();
		this.results.update(' ');
		this.results.mask('working…');
		var code = this.editor.getValue();
		var success = false;
		try {
			Voyant.notebook.util.Show.TARGET = this.results.getEl(); // this is for output
			Voyant.notebook.Notebook.currentBlock = this; // this is to tie back in to the block
			
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
		
		var panel = this.results.el.down('.x-panel');
		if (panel) {
			var id = panel.id;
			var cmp = Ext.getCmp(id);
			if (cmp) {
				cmp.destroy();
			} else {
				panel.destroy();
			}
		} else {
			this.results.update(' ');
		}
		
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
		var toReturn = {
			input: this.editor.getValue(),
			mode: this.editor.getMode().split("/").pop()
		}
		if (toReturn.mode=='javascript') {
			var el = this.results.getTargetEl(), resultEl = el.dom.cloneNode(true);
			toReturn.output = resultEl.innerHTML;
			if (!resultEl.style.height) {
				toReturn.output = "<div style='height: "+el.getHeight()+"px'>"+toReturn.output+"</div>";
			}
		}
		return toReturn;
	}
})