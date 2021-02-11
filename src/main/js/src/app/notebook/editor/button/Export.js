Ext.define("Voyant.notebook.editor.button.Export", {
	extend: "Ext.button.Button",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrapperexport',
	statics: {
		i18n: {
			tip: "Export",
			exportTitle: "Export",
			exportOpen: "Export content into new window",
			exportDownload: "Download file to your machine",
			cancelTitle: "Cancel"
		},
		exportWin: undefined,
		getExportWindow: function(instance) {
			if (this.exportWin === undefined) {
				this.exportWin = Ext.create('Ext.window.Window', {
					title: instance.localize("exportTitle"),
					closeAction: 'hide',
					modal: true,
					bodyPadding: 5,
					layout: {
						type: 'vbox',
						align: 'stretch'
					},
					defaults: {
						xtype: 'button'
					},
					items: [{
						itemId: 'open',
						text: instance.localize('exportOpen'),
						glyph: 'xf08e@FontAwesome'
					},{
						itemId: 'download',
						margin: '5 0 0 0',
						preventDefault: false,
						text: instance.localize('exportDownload'),
						glyph: 'xf019@FontAwesome',
						handler: function(btn) {
							btn.up('window').close();
						}
					}],
					buttons: [{
						text: instance.localize("cancelTitle"),
						glyph: 'xf00d@FontAwesome',
						handler: function(btn) {
							btn.up('window').close();
						}
					}]
				});
			}

			var wrapper = instance.up("notebookcodeeditorwrapper");
			var content = wrapper.getContent();
			var fileContent = instance.getExportType() === 'output' ? content.output : content.input;
			var filename = wrapper.getCellId()+"."+instance.getFileExtension(content.mode);
			var properties = {type: content.mode==="text" || true ? "text/plain" : "text/"+content.mode};
			var file;
			try {
				file = new File([fileContent], filename, properties);
			} catch (e) {
				file = new Blob([fileContent], properties);
			}

			this.exportWin.down('#open').setHandler(function(btn) {
				var myWindow = window.open();
				myWindow.document.write(fileContent);
				myWindow.document.close();
				myWindow.focus();
				btn.up('window').close();
			});

			this.exportWin.addListener('show', function() {
				var url = URL.createObjectURL(file);
				this.exportWin.down('#download').getEl().set({
					download: filename,
					href: url
				});
			}, this, { single: true });

			return this.exportWin;
		}
	},
	constructor: function(config) {
		Ext.apply(config, {
			tooltip: this.localize('tip')
		})
		this.callParent(arguments);
	},
	config: {
		exportType: 'input' // what type of content to include in the export: 'input' or 'output'
	},
	glyph: 'xf08e@FontAwesome',
	listeners: {
		click: function(cmp) {
			Voyant.notebook.editor.button.Export.getExportWindow(cmp).show();
		}
	},
	getFileExtension: function(mode) {
		if (
			mode === 'text' ||
			(mode === 'javascript' && this.getExportType() === 'output') // use txt for javascript results because they could be anything
		) {
			return 'txt';
		} else {
			return mode;
		}
	}
})