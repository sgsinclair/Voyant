Ext.define("Voyant.notebook.editor.TextEditor", {
	extend: "Ext.Component",
	mixins: ["Voyant.util.Localization"],
	alias: "widget.notebooktexteditor",
	cls: 'notebook-text-editor',
	config: {
		ckeditorConfig : { // when upgrading ckeditor, remember to copy stopediting plugin
			toolbar:  [
				    	{ name: 'basicstyles', items: [ 'Bold', 'Italic', '-', 'RemoveFormat' ] },
				    	{ name: 'paragraph', items: [ 'NumberedList', 'BulletedList', '-', 'Justify', 'Outdent', 'Indent', 'Blockquote', 'JustifyLeft', 'JustifyCenter', 'JustifyRight' ] },
				    	{ name: 'colors', items: [ 'TextColor', 'BGColor' ] },
				    	{ name: 'styles', items: [ 'Styles', 'Format' ] },
				    	{ name: 'links', items: [ 'Link', 'Unlink', 'Anchor'] },
				    	{ name: 'insert', items: [ 'Image', 'Table', 'Iframe' ] },
				    	{ name: 'document', items: [ 'Sourcedialog', 'Stopediting'] }
		    ],
		    extraPlugins: 'stopediting,sourcedialog,iframe,justify,colorbutton',
			allowedContent: true,
			toolbarCanCollapse: true,
			startupFocus: true
		},
		editor: undefined,
		isEditRegistered: false
	},
	statics: {
		i18n: {
			emptyText: "(Click here to edit.)",
			enableEditingTitle: "Enable Editing?",
			enableEditing: "By default editing is disable, do you wish to enable editing now?"
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
					if (!this.getIsEditRegistered()) {
						this.findParentByType("notebook").setIsEdited(true);
						this.setIsEditRegistered(true);
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