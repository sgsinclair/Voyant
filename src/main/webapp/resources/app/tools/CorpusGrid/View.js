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
		this.callParent();
	}
});