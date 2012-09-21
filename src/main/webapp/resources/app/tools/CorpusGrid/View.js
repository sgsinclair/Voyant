Ext.define('Voyant.tools.CorpusGrid.View', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.corpusGrid',
	store: 'Documents',
	
	title: 'Corpus',
	columns: [
	    {header: 'Title', dataIndex: 'shortTitle'},
	    {header: 'Total Words', dataIndex: 'totalTokens'}
	],
	
	initComponent: function() {
		// check if global store exists, otherwise use local store
		var store = Ext.getStore(this.store);
		if (store == undefined) {
			this.store = Ext.create('Voyant.store.Documents');
		}
		this.callParent();
	}
});