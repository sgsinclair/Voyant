Ext.define('Voyant.tools.DocumentTypeFrequenciesGrid.View', {
	extend: 'Ext.grid.Panel',
	mixins: {
		voyantTool: 'Voyant.Tool'
	},
	alias: 'widget.documentTypeFrequenciesGrid',
	store: 'DocumentTypes',
	
	title: 'Words in Documents',
	columns: [
	    {header: 'Type', dataIndex: 'type'},
	    {header: 'Count', dataIndex: 'rawFreq'}
	],
	
	constructor: function(config) {
		this.mixins.voyantTool.constructor.call(this);
		this.callParent([config]);
	},
	
	initComponent: function() {
		this.callParent();
	}
});