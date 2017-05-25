Ext.define('Voyant.VoyantToolApp', {
	extend : 'Voyant.VoyantCorpusApp',
	name : 'VoyantToolApp',
	statics: {
		api: {
			minimal: undefined,
			embeddedApiId: undefined
		}
	},
	launch: function() {
		var items = [], me = this;
		if (!this.getApiParam('minimal')) {
			items.push({
		        region: 'south',
		        xtype: 'voyantfooter'
		    })
		};
		items.push({
	        region: 'center',
	        layout: 'fit',
	        itemId: 'toolcontainer',
	        items: {
		        xtype: this.getApiParam('embeddedApiId') ? 'container' : this.getTool()
	        },
	        listeners: {
	        	afterrender: function(container) {
	        		if (me.getApiParam('embeddedApiId')) {
	    				var dfd = me.getDeferred(this);
	    	    		container.mask(this.localize('loadingConfiguration'));
	        	    	Ext.Ajax.request({
	        	    	    url: me.getTromboneUrl(),
	        	    	    params: {
	        	        		tool: 'resource.StoredResource',
	        	        		retrieveResourceId: this.getApiParam('embeddedApiId')
	        	    	    }
	        	    	}).then(function(response) {
	    					dfd.resolve();
	    	    	    	var json = Ext.util.JSON.decode(response.responseText);
	        	    		var configString = decodeURIComponent(json.storedResource.resource);
	        	    		var config = Ext.decode(configString);
	        	    		config.xtype = me.getTool();
	        	    		var tool = Ext.create(config);
	        	    		tool.setApiParams(config);
	        	    		container.unmask();
	        	    		container.remove(container.down('container'));
	        	    		container.add(tool);
	        	    		if (config.corpus) {
	        	    			me.loadCorpusFromParams(config);
	        	    		}
	        	    	}).otherwise(function(response) {
	        	    		if (me.getTargetEl) {
	            				Voyant.notebook.util.Show.TARGET = me.getTargetEl();
	            				showError(response);
	        	    		}
	        	    		Voyant.application.showError(response);
	        	    		dfd.reject();
	        	    	})
	    			}
	        	},
	        	scope: this
	        }
	    });
		Ext.create('Ext.container.Viewport', {
		    layout: 'border',
		    items: items
		});
		this.callParent(arguments);
	}
});