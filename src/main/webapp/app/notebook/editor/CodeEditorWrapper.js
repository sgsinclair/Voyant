Ext.define("Voyant.notebook.editor.CodeEditorWrapper", {
	extend: "Voyant.notebook.editor.EditorWrapper",
	requires: ["Voyant.notebook.editor.CodeEditor","Voyant.notebook.editor.button.Run","Voyant.notebook.editor.button.RunAll"],
	alias: "widget.notebookcodeeditorwrapper",
	cls: 'notebook-code-wrapper',
	statics: {
		i18n: {
			runMultiple: "Run multiple cells",
			runUntil: "Run up to here",
			runUntilTip: "Run previous code blocks and this one.",
			runFrom: "Run from here onwards",
			runFromTip: "Run this and following code blocks.",
			codeMode: "select from several formats for this cell",
			codeModeTitle: "Code Mode",
			codeModeTip: "Select from multiple code formats for this cell.",
			configureTip: "Configuration Options",
			autoExecuteOnLoad: "auto-run this cell on page load",
			ok: "OK",
			cancel: "Cancel"
		},
		configWin: undefined,
		getConfigWindow: function(codeEditorInstance) {
			if (this.configWin === undefined) {
				this.configWin = new Ext.Window({
					title: codeEditorInstance.localize('codeModeTitle'),
					closeAction: 'hide',
					layout: 'fit',
					width: 240,
					items: [{
						xtype: 'form',
						layout: {
							type: 'vbox',
							align: 'stretch'
						},
						bodyPadding: 10,
						items: [{
							xtype: 'fieldset',
							title: codeEditorInstance.localize("modeCode"),
							items: [{
								xtype : 'radiofield',
								boxLabel : codeEditorInstance.localize('modeJavascript'),
								name  : 'codeMode',
								inputValue: 'javascript',
								flex  : 1,
								listeners: {
									change: function(cmp, newval, oldval) {
										var autoExecCheck = cmp.up().queryById('autoExecute');
										autoExecCheck.setHidden(!newval);
										if (!newval) {
											autoExecCheck.setValue(false);
										}
									}
								}
							},{
								xtype: 'checkbox',
								boxLabel: codeEditorInstance.localize('autoExecuteOnLoad'),
								name: 'autoExecute',
								itemId: 'autoExecute'
							}]
						},{
							xtype: 'fieldset',
							title: codeEditorInstance.localize("modeData"),
							items: [{
								items: {
									xtype : 'radiofield',
									boxLabel : codeEditorInstance.localize('modeJson'),
									name  : 'codeMode',
									inputValue: 'json',
									flex  : 1
								}
							},{
								items: {
									xtype : 'radiofield',
									boxLabel : codeEditorInstance.localize('modeText'),
									name  : 'codeMode',
									inputValue: 'text',
									flex  : 1
								}
							},/*{
								items: {
									xtype : 'radiofield',
									boxLabel : codeEditorInstance.localize('modeCsv'),
									name  : 'codeMode',
									inputValue: 'csv',
									flex  : 1													
								}
							},{
								items: {
									xtype : 'radiofield',
									boxLabel : codeEditorInstance.localize('modeTsv'),
									name  : 'codeMode',
									inputValue: 'tsv',
									flex  : 1													
								}
							},*/{
								items: {
									xtype : 'radiofield',
									boxLabel : codeEditorInstance.localize('modeHtml'),
									name  : 'codeMode',
									inputValue: 'html',
									flex  : 1
								}
							},{
								items: {
									xtype : 'radiofield',
									boxLabel : codeEditorInstance.localize('modeXml'),
									name  : 'codeMode',
									inputValue: 'xml',
									flex  : 1
								}
							}]
						}]
					}],
					buttons: [{
						text: codeEditorInstance.localize('ok'),
						itemId: 'ok'
					},{
						text:  codeEditorInstance.localize('cancel'),
						handler: function(btn) {
							btn.up('window').close();
						},
						scope: this
					}]
				})
			}

			// set form values
			var mode = codeEditorInstance.getMode();
			this.configWin.down('radiofield[name=codeMode][inputValue="'+mode+'"]').setValue(true);
			this.configWin.down('checkbox#autoExecute').setValue(codeEditorInstance.getAutoExecute());
			// set ok handler
			this.configWin.down('button#ok').setHandler(function(btn) {
				var win = btn.up('window');
				var form = win.down('form');
				if (form.isDirty()) {
					var values = form.getValues();
					codeEditorInstance.switchModes(values.codeMode);
					codeEditorInstance.setAutoExecute(values.autoExecute === 'on');
					codeEditorInstance.down('button#config').toggleCls("autoExecute", values.autoExecute === 'on');
					codeEditorInstance.up('notebook').setIsEdited(true);
				}
				win.close();
			});

			return this.configWin;
		}
	},
	config: {
		isRun: false,
		autoExecute: false,
		mode: 'javascript',
		isWarnedAboutPreviousCells: false,
		expandResults: true
	},
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	height: 130,
	border: false,

	EMPTY_RESULTS_TEXT: ' ', // text to use when clearing results, prior to running code

	constructor: function(config) {
		config.mode = config.mode !== undefined ? config.mode : this.config.mode;
		var runnable = config.mode.indexOf('javascript') > -1;

		this.results = this._getResultsComponent(Ext.Array.from(config.output).join(""));
		this.results.setVisible(runnable);

		this.editor = Ext.create("Voyant.notebook.editor.CodeEditor", {
			content: Ext.Array.from(config.input).join("\n"),
			docs: config.docs,
			mode: 'ace/mode/'+config.mode
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
						hidden: !runnable,
						listeners: {
							click: {
								fn: this.run,
								scope: this
							}
						}
					},{
						glyph: 'xf050@FontAwesome',
						tooltip: this.localize("runMultiple"),
						itemId: 'runMultiple',
//						xtype: 'notebookwrapperrununtil',
						hidden: !runnable,
						listeners: {
							click: {
								fn: function(btn, ev) {
									Ext.create('Ext.menu.Menu', {
										items: [{
						    				text: this.localize("runUntil"),
						    				tooltip: this.localize("runUntilTip"),
						    				glyph: 'xf049@FontAwesome',
						    				handler: function() {
						    					this.up('notebook').runUntil(this);
						    				},
						    				scope: this
										},{
						    				text: this.localize("runFrom"),
						    				tooltip: this.localize("runFromTip"),
						    				glyph: 'xf050@FontAwesome',
						    				handler: function() {
						    					this.up('notebook').runFrom(this);
						    				},
						    				scope: this
										}]
									}).showAt(ev.pageX, ev.pageY)
								},
								scope: this
							}
						}
					},{
						xtype: 'button',
						itemId: 'config',
						glyph: 'xf013@FontAwesome',
						tooltip: this.localize("configureTip"),
						cls: config.autoExecute ? "autoExecute" : "",
						handler: function(btn, ev) {
							Voyant.notebook.editor.CodeEditorWrapper.getConfigWindow(this).show();
						},
						scope: this
					},{
						xtype: "notebookwrapperexport",
						hidden: runnable
					}
			    ]
			},{
			    xtype: 'toolbar',
			    dock: 'right',
			    items: [{
			    		xtype: 'notebookwrappercounter',
			    		order: config.order,
			    		name: config.cellId
			    	},{
		        		xtype: 'notebookwrapperremove'
		        	},{
			        	xtype: 'notebookwrappermoveup'
			        },{
			        	xtype: 'notebookwrappermovedown'
			        }
			    ]
			}],
			items: [this.editor]
		});

		if (config.uiHtml !== undefined) {
			this.items.push(this._getUIComponent(config.uiHtml))
		}
		this.items.push(this.results);
		
        this.callParent(arguments);
        
	},
	
	initComponent: function(config) {
		var me = this;
		me.on("afterrender", function() {
			this.getTargetEl().on("resize", function(el) {
				var height = 20;
				me.items.each(function(item) {height+=item.getHeight();})
				me.setSize({height: height});
			});
		}, this);
		me.callParent(arguments);
	},
	
	switchModes: function(mode) {
		this.setMode(mode);
		this.editor.switchModes(mode);

		var runnable = mode.indexOf('javascript') > -1;
		this.down('notebookwrapperrun').setVisible(runnable);
		this.down('notebookwrapperexport').setVisible(!runnable);
		this.queryById("runMultiple").setVisible(runnable);
		this.results.setVisible(runnable);
	},
	
	/**
	 * Run the code in this editor.
	 * @param {boolean} forceRun True to force the code to run, otherwise a check is performed to see if previous editors have already run.
	 */
	run: function(forceRun) {
		if (this.editor.getMode()==='ace/mode/javascript') { // only run JS
			if (forceRun===true || this.getIsWarnedAboutPreviousCells()) {
				return this._run();
			} else {
				// this code was for checking if previous cells hadn't been run, but it didn't seem worthwhile
				var notebook = this.up('notebook');
				Ext.Array.each(notebook.query('notebookcodeeditorwrapper'), function(wrapper) {
					if (wrapper===this) {this._run(); return false;} // break
					if (wrapper.editor && wrapper.editor.getMode() === 'ace/mode/javascript' && wrapper.getIsRun()===false) {
						Ext.Msg.confirm(this.localize('previousNotRunTitle'), this.localize('previousNotRun'), function(btnId) {
							if (btnId==='yes') {
								notebook.runUntil(this);
							} else {
								this._run();
							}
						}, this);
						this.setIsWarnedAboutPreviousCells(true);
						return false;
					}
				}, this);
			}
		}
	},
	
	_run: function() {
		this.results.show(); // make sure it's visible 
		this.results.update(this.EMPTY_RESULTS_TEXT); // clear out the results
		this.results.mask('working…'); // mask results
		var code = this.editor.getValue();
		Voyant.notebook.util.Show.TARGET = this.results.getResultsEl(); // this is for output
		Voyant.notebook.Notebook.currentBlock = this; // this is to tie back in to the block
		Voyant.notebook.Notebook.currentNotebook.setCurrentBlock(this);
		var result;
		try {
			
			// I'd like to be able to run this in another scope/context, but it
			// doesn't seem possible for the type of code that's being run
			result = eval.call(window, code);
		}
		catch (e) {
			this.results.unmask();
			Voyant.notebook.util.Show.showError(e);
			this.getTargetEl().fireEvent('resize');
			return e;
		}
		this.setIsRun(true);
		if (result!==undefined) {
			if (result.then && result.catch && result.finally) {
				var me = this;
				result.then(function(result) {
					me.results.unmask();
					if (result!==undefined) {
						me._showResult(result);
					}
				}).catch(function(err) {
					me.results.unmask();
					Voyant.notebook.util.Show.showError(err);
				}).finally(function() {
					Ext.defer(function() {this.getTargetEl().fireEvent('resize')}, 50, me);
				})
			} else {
				this.results.unmask();
				this._showResult(result);
				this.getTargetEl().fireEvent('resize');
			}
		} else {
			this.results.unmask();
			this.getTargetEl().fireEvent('resize');
		}
		return result;
	},

	_getResultsComponent: function(html) {
		var me = this;
		return Ext.create('Ext.Container', {
			align: 'stretch',
			cls: 'notebook-code-results',
			layout: {
				type: 'absolute'
			},
			items: [{
				xtype: 'container',
				itemId: 'buttons',
				hidden: true,
				x: 0,
				y: 0,
				items: [{
					xtype: 'toolbar',
					style: { background: 'none', paddingTop: '0px' },
					items: ['->',{
						glyph: 'xf066@FontAwesome',
						tooltip: 'Contract Results',
						handler: function(cmp) {
							if (me.getExpandResults()) {
								me.setExpandResults(false);
								cmp.setTooltip('Expand Results');
								cmp.setGlyph('xf065@FontAwesome');
							} else {
								me.setExpandResults(true);
								cmp.setTooltip('Contract Results');
								cmp.setGlyph('xf066@FontAwesome');
							}
							me._setResultsHeight();
						}
					},{
						xtype: 'notebookwrapperexport',
						exportType: 'output'
					},{
						glyph: 'xf014@FontAwesome',
						tooltip: 'Remove Results',
						handler: function(cmp) {
							me.clearResults();
						}
					}]
				}]
			},{
				xtype: 'component',
				itemId: 'results',
				x: 0,
				y: 0,
				html: html
			}],
			getValue: function() {
				var resultEl = this.getResultsEl().dom.cloneNode(true);
				var output = resultEl.innerHTML;
				if (!resultEl.style.height) {
					output = "<div style='height: "+this.getResultsEl().getHeight()+"px'>"+output+"</div>";
				}
				return output;
			},
			getResultsEl: function() {
				return this.down('#results').getEl();
			},
			// override update method and call it on results child instead
			update: function() {
				var results = this.down('#results');
				results.update.apply(results, arguments);
			},
			listeners: {
				afterrender: function(cmp) {
					cmp.getEl().on('mouseover', function(event, el) {
						cmp.down('#buttons').setVisible(true);
					});
					cmp.getEl().on('mouseout', function(event, el) {
						cmp.down('#buttons').setVisible(false);
					})
				}
			}
		});
	},

	_getUIComponent: function(html) {
		return Ext.create('Ext.Component', {
			align: 'stretch',
			cls: 'notebook-code-ui',
			padding: '20 10',
			html: html,
			getValue: function() {
				const el = this.getTargetEl()
				const resultEl = el.dom.cloneNode(true);
				let output = resultEl.innerHTML;
				return output;
			}
		});
	},

	_showResult: function(result) {
		// check for pre-existing content (such as from highcharts) and if it exists don't update
		if (this.results.getResultsEl().dom.innerHTML === this.EMPTY_RESULTS_TEXT) {
			this.results.update(result.toString ? result.toString() : result);
			this._setResultsHeight();
		}
	},

	_setResultsHeight: function() {
		if (this.getExpandResults()) {
			this.results.setHeight(Math.max(this.results.getResultsEl().getHeight(), 40));
		} else {
			this.results.setHeight(40);
		}
		this.getTargetEl().fireEvent('resize');
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
		this._setResultsHeight();
	},
	
	tryToUnmask: function() {
		if (Spyral && Spyral.promises) {
			Ext.defer(this.tryToUnmask, 20, this);
		}
		if (Voyant.application.getDeferredCount()===0) {
			for (var key in window) {
				if (typeof window[key] == 'object' && window[key] && key!="opener" && window[key].isFulfilled &&  window[key].isFulfilled()) {
					window[key] = window[key].valueOf();
				}
			}
			this.results.unmask();
			if (this.results.getTargetEl().getHtml().trim().length===0) {
				this.results.hide();
			}
			this.getTargetEl().fireEvent('resize');
		}
		else {
			Ext.defer(this.tryToUnmask, 20, this);
		}
	},
	
	getContent: function() {
		var toReturn = {
			input: this.editor.getValue(),
			mode: this.getMode()
		}
		if (toReturn.mode==='javascript') {
			toReturn.output = this.results.getValue();
			var ui = this.down('component[cls="notebook-code-ui"]');
			if (ui !== null) {
				toReturn.ui = ui.getValue();
			}
		}
		return toReturn;
	},
	
	setContentAndMode: function(content, mode, config) {
		debugger
		this.editor.setContent(content);
		this.switchModes(mode || "javascript")
	}
})