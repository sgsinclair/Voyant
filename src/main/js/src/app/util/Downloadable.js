Ext.define("Voyant.util.Downloadable", {
	mixins: ['Voyant.util.Localization'],
	statics: {
		i18n: {
		},
		api: {
			documentFormat: undefined,
			documentFilename: undefined
		}
	},

	downloadFromCorpusId: function(corpusId) {
		var panel = this;
		Ext.create('Ext.window.Window', {
			title: this.localize('exportTitle'),
			modal: true,
			items: {
				xtype: 'form',
				items: {xtype: 'downloadoptions'},
				listeners: {
					afterrender: function(form) {
						// make sure defaults are set based on panel's API
						form.getForm().setValues(panel.getApiParams(['documentFilename','documentFormat']));
						
					}
				},
				buttons: [{
	            	text: this.localize("cancelButton"),
	                glyph: 'xf00d@FontAwesome',
	        		flex: 1,
		            ui: 'default-toolbar',
	        		handler: function(btn) {
	        			btn.up('window').close();
	        		}
				},{
	            	text: this.localize('downloadButton'),
					glyph: 'xf00c@FontAwesome',
	            	flex: 1,
	        		handler: function(btn) {
	        			var values = btn.up('form').getValues();
	        			panel.setApiParams(values);
	        			panel.openDownloadCorpus(corpusId);
	        			btn.up('window').close();
	        		},
	        		scope: this
	            }]
			},
			bodyPadding: 5
		}).show()
	},
	
    openDownloadCorpus: function(corpusId) {
		var url = this.getTromboneUrl()+"?corpus="+corpusId+"&tool=corpus.CorpusExporter&outputFormat=zip"+
			"&zipFilename=DownloadedVoyantCorpus-"+corpusId+".zip"+
			(this.getApiParam("documentFormat") ? "&documentFormat="+this.getApiParam("documentFormat") : '')+
			(this.getApiParam("documentFilename") ? "&documentFilename="+this.getApiParam("documentFilename") : '')
		this.openUrl(url)
    }
})