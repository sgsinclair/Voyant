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
		// check if global store exists, otherwise use local store
		var store = Ext.getStore(this.store);
		if (store == undefined) {
			this.store = Ext.create('Voyant.store.DocumentTypes');
		}
		this.callParent();
	}
});