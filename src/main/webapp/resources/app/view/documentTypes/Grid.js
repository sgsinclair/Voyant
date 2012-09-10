Ext.define('Voyant.view.documentTypes.Grid', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.documentTypesGrid',
	store: 'DocumentTypes',
	
	title: 'Document Type Frequencies Grid',
	columns: [
	    {header: 'Type', dataIndex: 'type'},
	    {header: 'Count', dataIndex: 'rawFreq'}
	],
	
	initComponent: function() {
		this.callParent();
	}
});