Ext.define("Voyant.notebook.editor.TextEditor", {
	extend: "Ext.Component",
	mixins: ["Voyant.util.Localization"],
	alias: "widget.notebooktexteditor",
	cls: 'notebook-text-editor',
	config: {
		ckeditorConfig : { // when upgrading ckeditor, remember to copy stopediting and inserthtml4x plugins
			toolbar:  [
				    	{ name: 'basicstyles', items: [ 'Bold', 'Italic', '-', 'RemoveFormat' ] },
				    	{ name: 'paragraph', items: [ 'NumberedList', 'BulletedList', '-', 'Justify', 'Outdent', 'Indent', 'Blockquote', 'JustifyLeft', 'JustifyCenter', 'JustifyRight' ] },
				    	{ name: 'colors', items: [ 'TextColor', 'BGColor' ] },
				    	{ name: 'styles', items: [ 'Styles', 'Format' ] },
				    	{ name: 'links', items: [ 'Link', 'Unlink', 'Anchor'] },
				    	{ name: 'insert', items: [ 'Image', 'Table' ] },
				    	{ name: 'document', items: [ 'inserthtml4x', 'Sourcedialog', 'Stopediting'] }
		    ],
		    
		    extraPlugins: 'stopediting,sourcedialog,justify,colorbutton,inserthtml4x',
//		    removePlugins: 'iframe',
			allowedContent: true,
			toolbarCanCollapse: true,
			startupFocus: true
		},
		editor: undefined,
		isEditRegistered: false,
		currentHeight: 0
	},
	statics: {
		i18n: {
		}
	},
	border: false,
	constructor: function(config) {
		Ext.apply(this, {
			html: config.content ? config.content : this.localize("emptyText")
		});
        this.callParent(arguments);
	},
	listeners: {
		boxready: function(cmp) {
			this.getTargetEl().on("click", function(e, t) {
				if (t.tagName!="A") {
					this.handleClick(cmp);
				}
			}, this);
		},
		removed: function(cmp, container) {
			// properly remove editor
			if (cmp.getEditor()) {
				cmp.getEditor().focusManager.blur(true); //focusManager bug workaround, see: https://dev.ckeditor.com/ticket/16825
				cmp.getEditor().destroy();
			}
		}
	},
	
	handleClick: function(cmp) {
		if (!cmp.getEditor() || (cmp.getEditor() && cmp.getEditor().readOnly)) {
			var el = this.getTargetEl();
			el.set({contenteditable: true});
			this.findParentByType("notebookeditorwrapper").setIsEditing(true);
			if (!cmp.getEditor()) {
				var editor = CKEDITOR.inline( el.dom, this.getCkeditorConfig() );
				editor.on("blur", function(evt) {
//					cmp.setEditor(undefined);
					cmp.findParentByType("notebookeditorwrapper").setIsEditing(false).getEl().fireEvent("mouseout");
//					el.set({contenteditable: false});
					editor.setReadOnly(true);
				})
				editor.on("change", function() {
					var editorHeight = editor.container.$.clientHeight;
					if (editorHeight!=this.getCurrentHeight()) {
						this.findParentByType("notebookeditorwrapper").setHeight(editorHeight);
						this.setCurrentHeight(editor.container.$.clientHeight)
					}
					if (!this.getIsEditRegistered()) {
						this.findParentByType("notebook").setIsEdited(true);
						this.setIsEditRegistered(true);

					} else {
						var me = this; // make sure to allow edits to be auto-saved every 30 seconds
						setTimeout(function() {
							me.setIsEditRegistered(false);
						}, 30000);
					}
				}, this)
				this.setEditor(editor);
			} else {
				cmp.getEditor().setReadOnly(false);
			}
		}
	},
	
	getContent: function() {
		return this.getTargetEl().dom.innerHTML;
	}
})