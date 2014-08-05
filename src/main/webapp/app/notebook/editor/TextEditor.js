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
				    	{ name: 'paragraph', items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', 'Blockquote', 'JustifyLeft', 'JustifyCenter', 'JustifyRight' ] },
				    	{ name: 'colors', items: [ 'TextColor', 'BGColor' ] },
				    	{ name: 'styles', items: [ 'Styles', 'Format' ] },
				    	{ name: 'links', items: [ 'Link', 'Unlink'] },
				    	{ name: 'insert', items: [ 'Image', 'Table' ] },
				    	{ name: 'document', items: [ 'Source' ] }
		    ],
//		    height: 150,
			allowedContent: true,
//			resize_enabled: false,
			toolbarCanCollapse: true
		},
		editor: undefined
	},
	statics: {
		i18n: {
			emptyText: {en: "(Click here to edit.)"}
		}
	},
	border: false,
	constructor: function(config) {
		Ext.apply(this, {
			html: '<div contenteditable="true">'+(config.content ? config.content : this.localize("emptyText"))+"</div>"
		});
        this.callParent(arguments);
	},
	listeners: {
		boxready: function() {
			var me = this;
			this.getEl().set({contenteditable: true});
			var editor = CKEDITOR.inline( Ext.getDom(this.getEl()), this.getCkeditorConfig() );
			editor.on("focus", function(evt, ed) {
				me.findParentByType("notebookeditorwrapper").setIsEditing(true);
			})
			editor.on("blur", function(evt, ed) {
				me.findParentByType("notebookeditorwrapper").setIsEditing(false).getEl().fireEvent("mouseout");
			})
			
			var lastHeight = this.getHeight();
			editor.on("change", function(evt, ed) {
				if (lastHeight!=me.getHeight()) {
					me.ownerCt.fireEvent("editorresize",me);
					lastHeight = me.getHeight();
					me.setContent(ed.getValue())
				}
			})
			this.setEditor(editor);
		}
	},
	
	getContent: function() {
		var editor = this.getEditor();
		return editor ? this.getEditor().getData() : "";
	}
})