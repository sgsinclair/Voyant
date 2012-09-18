Ext.define('Voyant.tools.DocumentTypeFrequenciesGrid.View', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.documentTypeFrequenciesGrid',
	store: 'DocumentTypes',
	
	title: 'Words in Documents',
	columns: [
	    {header: 'Type', dataIndex: 'type'},
	    {header: 'Count', dataIndex: 'rawFreq'}
	],
	
	initComponent: function() {
		this.callParent();
	}
});