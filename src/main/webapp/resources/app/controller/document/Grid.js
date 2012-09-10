Ext.define('Voyant.controller.document.Grid', {
	extend: 'Ext.app.Controller',
	init: function(app) {
		this.control({
			'documentGrid': {
				selectionchange: this.onSelectionChange
			}
		});
	},

	onSelectionChange: function(model, records, options) {
		if (records.length == 1) {
			this.application.fireEvent('corpusDocumentSelected', this, {record: records[0]});
		} else if (records.length > 1) {
			this.application.fireEvent('corpusDocumentsSelected', this, {record: records});
		}
	}
});