Ext.define('Voyant.VoyantToolApp', {
	extend : 'Voyant.VoyantCorpusApp',
	name : 'VoyantToolApp',
	statics: {
		api: {
			minimal: undefined
		}
	},
	launch: function() {
		var items = [];
		if (!this.getApiParam('minimal')) {
			items.push({
		        region: 'south',
		        xtype: 'voyantfooter'
		    })
		};
		items.push({
	        region: 'center',
	        layout: 'fit',
	        items: {
		        xtype: this.getTool()
	        }
	    });
		Ext.create('Ext.container.Viewport', {
		    layout: 'border',
		    items: items
		});
		this.callParent(arguments);
	}
});