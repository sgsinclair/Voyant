Ext.define('Voyant.view.document.Grid', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.documentGrid',
	store: 'Documents',
	
	title: 'Documents Grid',
	columns: [
	    {header: 'Title', dataIndex: 'shortTitle'},
	    {header: 'Total Words', dataIndex: 'totalTokens'}
	],
	
	initComponent: function() {
		this.callParent();
	}
});