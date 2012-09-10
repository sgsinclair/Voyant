Ext.define('Voyant.controller.documentTypes.Grid', {
	extend: 'Ext.app.Controller',
	init: function(app) {
		this.application.on({
			'corpusDocumentSelected': this.corpusDocumentSelectedHandler,
			'corpusDocumentsSelected': this.corpusDocumentSelectedHandler
		});
		
		this.control({
			'documentTypesGrid': {
				selectionchange: this.onSelectionChange
			}
		});
	},

	corpusDocumentSelectedHandler: function(tool, data) {
	},
	
	onSelectionChange: function(model, records, options) {
	}
});