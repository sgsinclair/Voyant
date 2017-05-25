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
		editedTimeout: undefined
	},
	statics: {
		i18n: {
			emptyText: "// click here to edit"
		},
		api: {
			content: undefined
		}
	},
	constructor: function(config) {
		this.callParent(arguments)
	},
	listeners: {
		boxready: function() {
			var me = this;
			this.editor = ace.edit(Ext.getDom(this.getEl()));
			this.editor.$blockScrolling = Infinity;
			this.editor.getSession().setUseWorker(true);
			this.editor.setTheme(this.getTheme());
			this.editor.getSession().setMode(this.getMode());
			this.editor.setOptions({minLines: 6, maxLines: this.getMode().indexOf("javascript")>-1 ? Infinity : 10, autoScrollEditorIntoView: true, scrollPastEnd: true});
			this.editor.setHighlightActiveLine(false);
			this.editor.renderer.setShowPrintMargin(false);
			this.editor.renderer.setShowGutter(false);
			this.editor.setValue(this.getContent() ? this.getContent() : this.localize('emptyText'));
			this.editor.clearSelection()
		    this.editor.on("focus", function() {
		    	me.editor.renderer.setShowGutter(true);
		    }, this);
		    var moi = this;
		    this.editor.on("change", function() {
		    	if (me.getIsChangeRegistered()==false) {
		    		me.setIsChangeRegistered(true);
			    	var wrapper = me.up('notebookcodeeditorwrapper');
			    	if (wrapper) {
			    		wrapper.setIsRun(false);
			    		var notebook = wrapper.up(notebook);
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
		    this.editor.on("blur", function() {
		    	me.editor.renderer.setShowGutter(false);
		    });
			this.editor.commands.addCommand({
				name: 'run',
			    bindKey: {win: "Shift-Enter", mac: "Shift-Enter"}, // additional bindings like alt/cmd-enter don't seem to work
			    exec: function(editor) {
			    	var wrapper = me.up('notebookcodeeditorwrapper');
			    	if (wrapper) {
			    		wrapper.run();
			    	}
			    }				
			});
			
			ace.config.loadModule('ace/ext/tern', function () {
	            me.editor.setOptions({
	                /**
	                 * Either `true` or `false` or to enable with custom options pass object that
	                 * has options for tern server: http://ternjs.net/doc/manual.html#server_api
	                 * If `true`, then default options will be used
	                 */
	                enableTern: {
	                    /* http://ternjs.net/doc/manual.html#option_defs */
	                    defs: me.docs ? ['ecma5', me.docs] : [],
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
	                enableSnippets: true,
	                
	                /**
	                 * when using tern, Ace's basic text auto completion is enabled still by deafult.
	                 * This settings affects all modes when using tern, not just javascript.
	                 * For javascript mode the basic auto completion will be added to completion results if tern fails to find completions or if you double tab the hotkey for get completion (default is ctrl+space, so hit ctrl+space twice rapidly to include basic text completions in the result)
	                 */
	                enableBasicAutocompletion: true
	            });
	        });
		}
	},
	
	switchModes: function(mode) {
		this.setMode('ace/mode/'+mode);
		this.editor.getSession().setMode(this.getMode());
		this.editor.setOptions({maxLines: this.getMode().indexOf("javascript")>-1 ? Infinity : 10});

	},
	
	getValue: function() {
		return this.editor.getValue();
	}
})