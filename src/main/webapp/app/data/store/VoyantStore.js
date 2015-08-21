Ext.define('Voyant.data.store.VoyantStore', {
	extend: 'Ext.data.BufferedStore',
	config: {
		parentPanel: undefined
	},
	constructor: function(config) {
		if (config.parentPanel !== undefined) {
			this.setParentPanel(config.parentPanel);
		}
		this.callParent([config]);
		this.on('beforeload', this.applyApiParams, this);
	},
	applyApiParams: function(store, operation) {
		var parent = this.getParentPanel();
		if (parent !== undefined) {
			var params = parent.getApiParams();
			if (operation.params === undefined) operation.params = {};
			for (var key in params) {
				operation.params[key] = params[key];
			}
		}
	}
});