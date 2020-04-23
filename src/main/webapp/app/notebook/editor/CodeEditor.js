Ext.define("Voyant.notebook.editor.CodeEditor", {
	extend: "Ext.Component",
	alias: "widget.notebookcodeeditor", 
	mixins: ["Voyant.util.Localization",'Voyant.notebook.util.Embed'],
	embeddable: ["Voyant.notebook.editor.CodeEditor"],
	cls: 'notebook-code-editor',
	config: {
		theme: 'ace/theme/chrome',
		mode: 'ace/mode/javascript',
		content: '',
		docs: undefined,
		isChangeRegistered: false,
		editor: undefined,
		editedTimeout: undefined,
		lines: 0
	},
	statics: {
		i18n: {
		},
		api: {
			content: undefined
		}
	},
	constructor: function(config) {
		this.callParent(arguments);
	},
	listeners: {
		boxready: function() {
			var me = this;
			var editor = ace.edit(Ext.getDom(this.getEl()));
			
			editor.$blockScrolling = Infinity;
			editor.getSession().setUseWorker(true);
			editor.setTheme(this.getTheme());
			editor.getSession().setMode(this.getMode());
			editor.setOptions({
				minLines: 6,
				maxLines: this.getMode().indexOf("javascript")>-1 ? Infinity : 10,
				autoScrollEditorIntoView: true,
				scrollPastEnd: true
			});
			editor.setHighlightActiveLine(false);
			editor.setHighlightGutterLine(false);
			editor.renderer.setShowPrintMargin(false);
//			editor.renderer.setShowGutter(false);
			
			editor.setValue(this.getContent() ? this.getContent() : "" /*this.localize('emptyText')*/);
			editor.clearSelection();

		    editor.on("focus", function() {
				setTimeout(function() {
					me.getEditor().setHighlightGutterLine(true);
				}, 100); // slight delay to avoid selecting a range of text, caused by showing the gutter while mouse is still pressed
		    }, this);
		    editor.on("change", function(ev, editor) {
				var lines = editor.getSession().getScreenLength();
				if (lines!=me.getLines()) {
					me.up('notebookcodeeditorwrapper').setSize({height: lines*editor.renderer.lineHeight+editor.renderer.scrollBar.getWidth()})
					me.setLines(lines);
				}
				if (me.getIsChangeRegistered()==false) {
					me.setIsChangeRegistered(true);
					var wrapper = me.up('notebookcodeeditorwrapper');
					if (wrapper) {
						wrapper.setIsRun(false);
						var notebook = wrapper.up("notebook");
						if (notebook) {notebook.setIsEdited(true);}
					}
				} else {
					if (!me.getEditedTimeout()) { // no timeout, so set it to 30 seconds
						me.setEditedTimeout(setTimeout(function() {
							me.setIsChangeRegistered(false);
						}, 30000));
					}
				}
		    }, this);
		    editor.on("blur", function() {
		    	me.getEditor().setHighlightGutterLine(false);
		    });
			editor.commands.addCommand({
				name: 'run',
			    bindKey: {win: "Shift-Enter", mac: "Shift-Enter"}, // additional bindings like alt/cmd-enter don't seem to work
			    exec: function(editor) {
			    	var wrapper = me.up('notebookcodeeditorwrapper');
			    	if (wrapper) {
			    		wrapper.run();
			    	}
			    }				
			});
			editor.commands.addCommand({
				name: 'rununtil',
			    bindKey: {win: "Command-Shift-Enter", mac: "Command-Shift-Enter"}, // additional bindings like alt/cmd-enter don't seem to work
			    exec: function(editor) {
			    	var wrapper = me.up('notebookcodeeditorwrapper');
			    	var notebook = wrapper.up("notebook");
			    	notebook.runUntil(wrapper);
			    }				
			});
			this.setEditor(editor);

			ace.config.loadModule('ace/ext/tern', function (module) {
				me.getEditor().setOptions({
					/**
					 * Either `true` or `false` or to enable with custom options pass object that
					 * has options for tern server: http://ternjs.net/doc/manual.html#server_api
					 * If `true`, then default options will be used
					 */
					enableTern: {
						/* http://ternjs.net/doc/manual.html#option_defs */
						defs: me.docs ? ['browser', 'ecma5', me.docs] : ['ecma5', 'browser'],
						plugins: {
							doc_comment: {
								fullDocs: true
							}
						},
						/**
						 * (default is true) If web worker is used for tern server.
						 * This is recommended as it offers better performance, but prevents this from working in a local html file due to browser security restrictions
						 */
						useWorker: true
					},
					/**
					 * when using tern, it takes over Ace's built in snippets support.
					 * this setting affects all modes when using tern, not just javascript.
					 */
					enableSnippets: false,
					
					/**
					 * when using tern, Ace's basic text auto completion is enabled still by default.
					 * This settings affects all modes when using tern, not just javascript.
					 * For javascript mode the basic auto completion will be added to completion results if tern fails to find completions or if you double tab the hotkey for get completion (default is ctrl+space, so hit ctrl+space twice rapidly to include basic text completions in the result)
					 */
					enableBasicAutocompletion: false
				});
			});
		},
		removed: function(cmp, container) {
			if (cmp.getEditor()) {
				cmp.getEditor().destroy();
			}
		}
		
	},
	
	switchModes: function(mode) {
		this.setMode('ace/mode/'+mode);
		this.getEditor().getSession().setMode(this.getMode());
		this.getEditor().setOptions({maxLines: this.getMode().indexOf("javascript")>-1 ? Infinity : 10});

	},
	
	getValue: function() {
		return this.getEditor().getValue();
	}
})