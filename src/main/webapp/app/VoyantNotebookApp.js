Ext.define('Voyant.VoyantNotebookApp', {
	extend : 'Voyant.VoyantApp',
	requires: ['Voyant.panel.VoyantFooter','Voyant.notebook.Notebook','Voyant.data.model.Corpus','Voyant.notebook.util.Show'],
	name : 'VoyantNotebookApp',
	launch: function() {
		Ext.create('Ext.container.Viewport', {
		    layout: 'border',
		    items: [{
		    	xtype: 'notebook',
		    	region: 'center'
		    },{
		    	xtype: 'voyantfooter',
		    	region: 'south'
		    }]
		});
		this.callParent(arguments);    	
	}
});