Ext.define('Voyant.VoyantToolApp', {
	extend : 'Voyant.VoyantCorpusApp',
	name : 'VoyantToolApp',
	launch: function() {
		Ext.create('Ext.container.Viewport', {
		    layout: 'border',
		    items: [{
		        region: 'south',
		        xtype: 'voyantfooter'
		    }, {
		        region: 'center',
		        layout: 'fit',
		        items: {
			        xtype: this.getTool()
		        }
		    }]
		});
		this.callParent(arguments);
	}
});