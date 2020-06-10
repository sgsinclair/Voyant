Ext.define("Voyant.notebook.editor.button.Export", {
	extend: "Ext.button.Button",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrapperexport',
	statics: {
		i18n: {
			tip: "Export",
			exportTitle: "Export",
			exportOpen: "export content into new window",
			exportDownload: "download file to your machine",
			cancelTitle: "Cancel"
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
			var exportCmp = cmp;
			Ext.create('Ext.window.Window', {
				title: this.localize("exportTitle"),
				modal: true,
				items: {
					xtype: 'form',
					defaultType: 'radio',
					items: [{
			       		inputValue: 'html',
			       		boxLabel: this.localize('exportOpen'),
			       		name: 'export'
					},{
			       		inputValue: 'htmlDownload',
			       		boxLabel: '<a href="#">'+this.localize('exportDownload')+'</a>',
			       		name: 'export',
			       		listeners: {
			       			afterrender: function(cmp) {
			       				var wrapper = exportCmp.up("notebookcodeeditorwrapper");
								var content = wrapper.getContent();
								var fileContent = this.getExportType() === 'output' ? content.output : content.input;
			       				var filename = wrapper.getCellId()+"."+this.getFileExtension(content.mode);
			       	    		var properties = {type: content.mode==="text" || true ? "text/plain" : "text/"+content.mode};
			       	   	    	try {
			       	   	    	  file = new File([fileContent], filename, properties);
			       	   	    	} catch (e) {
			       	   	    	  file = new Blob([fileContent], properties);
			       	   	    	}
			       	    		var url = URL.createObjectURL(file);
			       	    		var a = cmp.boxLabelEl.dom.querySelector("a");
			       	    		a.setAttribute("download", filename);
			       	    		a.setAttribute("href", url);
			       	    		a.addEventListener("click", function() {
			       	    			cmp.up("window").close();
			       	    		})
			       			},
			       			scope: this
			       			
			       		},
			       		handler: function(cmp) {
			       			cmp.boxLabelEl.dom.querySelector("a").click();
			       		}
					}],
					buttons: [{
		            	text: this.localize("exportTitle"),
						glyph: 'xf08e@FontAwesome',
		            	flex: 1,
		        		handler: function(btn) {
		        			var form = btn.up('form');
		        			var val = form.getValues()['export'];
		        			if (val=="html") {
			       				var wrapper = exportCmp.up("notebookcodeeditorwrapper");
								var content = wrapper.getContent();
								var fileContent = this.getExportType() === 'output' ? content.output : content.input;
			       		        var myWindow = window.open();
			       		        myWindow.document.write(fileContent);
			       		        myWindow.document.close();
			       		        myWindow.focus();
		        			}
		        			btn.up('window').close();
		        		},
		        		scope: this
		            }, {
		            	text: this.localize("cancelTitle"),
		                glyph: 'xf00d@FontAwesome',
		        		flex: 1,
		        		handler: function(btn) {
		        			btn.up('window').close();
		        		}
					}]
				},
				bodyPadding: 5
			}).show();
		}
	},
	getFileExtension(mode) {
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