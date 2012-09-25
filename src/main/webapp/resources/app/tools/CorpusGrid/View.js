Ext.define('Voyant.tools.CorpusGrid.View', {
	extend: 'Ext.grid.Panel',
	mixins: {
		voyantTool: 'Voyant.Tool'
	},
	alias: 'widget.corpusGrid',
	store: 'Documents',
	
	title: 'Corpus',
	columns: [
	    {header: 'Title', dataIndex: 'shortTitle'},
	    {header: 'Total Words', dataIndex: 'totalTokens'}
	],
	
	constructor: function(config) {
		this.mixins.voyantTool.constructor.call(this);
		this.callParent([config]);
	},
	
	initComponent: function() {
		// check if global store exists, otherwise use local store
		var store = Ext.getStore(this.store);
		if (store == undefined) {
			this.store = Ext.create('Voyant.store.Documents');
		}
		this.callParent();
	}
});