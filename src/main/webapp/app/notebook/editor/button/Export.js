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
    	Ext.apply(this, {
    		toolTip: this.localize('tip')
    	})
        this.callParent(arguments);
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
			       				var filename = wrapper.getCellId()+"."+(content.mode == "text" ? "txt" : content.mode);
			       	    		var properties = {type: content.mode=="text" || true ? "text/plain" : "text/"+content.mode};
			       	   	    	try {
			       	   	    	  file = new File([content.input], filename, properties);
			       	   	    	} catch (e) {
			       	   	    	  file = new Blob([content.input], properties);
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
			       		        var myWindow = window.open();
			       		        myWindow.document.write(content.input);
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
	}
})