Ext.define("Voyant.notebook.editor.TextEditor", {
	extend: "Ext.Component",
	mixins: ["Voyant.util.Localization"],
	alias: "widget.notebooktexteditor",
	cls: 'notebook-text-editor',
	config: {
		theme: 'ace/theme/chrome',
		mode: 'ace/mode/javascript',
		content: 'test',
		ckeditorConfig : {
			toolbar:  [
				    	{ name: 'basicstyles', items: [ 'Bold', 'Italic', '-', 'RemoveFormat' ] },
				    	{ name: 'paragraph', items: [ 'NumberedList', 'BulletedList', '-', 'Justify', 'Outdent', 'Indent', 'Blockquote', 'JustifyLeft', 'JustifyCenter', 'JustifyRight' ] },
				    	{ name: 'colors', items: [ 'TextColor', 'BGColor' ] },
				    	{ name: 'styles', items: [ 'Styles', 'Format' ] },
				    	{ name: 'links', items: [ 'Link', 'Unlink', 'Anchor'] },
				    	{ name: 'insert', items: [ 'Image', 'Table', 'Iframe' ] },
				    	{ name: 'document', items: [ 'Sourcedialog' ] }
		    ],
		    extraPlugins: 'sourcedialog,iframe,justify,colorbutton',
			allowedContent: true,
			toolbarCanCollapse: true,
			startupFocus: true
		},
		editor: undefined
	},
	statics: {
		i18n: {
			emptyText: "(Click here to edit.)"
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
			this.getTargetEl().on("click", function() {
				if (!cmp.getEditor()) {
					var el = this.getTargetEl();
					el.set({contenteditable: true});
					var editor = CKEDITOR.inline( el.dom, this.getCkeditorConfig() );
					this.findParentByType("notebookeditorwrapper").setIsEditing(true);
					editor.on("blur", function(evt) {
						cmp.setEditor(undefined);
						cmp.findParentByType("notebookeditorwrapper").setIsEditing(false).getEl().fireEvent("mouseout");
						editor.destroy();
						el.set({contenteditable: false});
					})
					this.setEditor(editor);
				}
			}, this)
		}
	},
	
	getContent: function() {
		return this.getTargetEl().dom.innerHTML;
	}
})