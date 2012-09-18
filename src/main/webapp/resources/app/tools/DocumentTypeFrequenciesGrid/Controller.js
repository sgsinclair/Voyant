Ext.define('Voyant.tools.DocumentTypeFrequenciesGrid.Controller', {
	extend: 'Ext.app.Controller',
	init: function(app) {
		this.application.on({
			'corpusDocumentSelected': this.corpusDocumentSelectedHandler,
			'corpusDocumentsSelected': this.corpusDocumentSelectedHandler
		});
		
		this.control({
			'documentTypeFrequenciesGrid': {
				selectionchange: this.onSelectionChange
			}
		});
	},

	corpusDocumentSelectedHandler: function(tool, data) {
	},
	
	onSelectionChange: function(model, records, options) {
	}
});