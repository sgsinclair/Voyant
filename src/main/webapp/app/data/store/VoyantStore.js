Ext.define('Voyant.data.store.VoyantStore', {
	config: {
		corpus: undefined,
		parentPanel: undefined
	},
	constructor: function(config, extras) {
		config = config || {};
		Ext.applyIf(config, {
			remoteSort: true,
			autoLoad: false,
			listeners: {
				beforeload: this.applyApiParams
			},
			scope: this,
			// define buffered configuration even if ignored when this isn't a buffered store
			pagePurgeCount : 0, // don't purge any data
			pageSize : 100, // each request is more intenstive, so do fewer of them then default
			leadingBufferZone : 200 // stay two pages ahead
		});
		config.proxy = config.proxy || {};
		Ext.applyIf(config.proxy, {
			type: 'ajax',
			url: Voyant.application.getTromboneUrl(),
			actionMethods: {read: 'POST'},
			reader: {
				type: 'json',
				rootProperty: extras['proxy.reader.rootProperty'],
				totalProperty: extras['proxy.reader.totalProperty']
			},
			simpleSortMode: true
		})
		config.proxy.extraParams = config.proxy.extraParams || {};
		Ext.applyIf(config.proxy.extraParams, {
			tool: extras['proxy.extraParams.tool']
		});
		
		if (config.parentPanel !== undefined) {
			this.setParentPanel(config.parentPanel);
			config.parentPanel.on("loadedCorpus", function(src, corpus) {
				this.setCorpus(corpus);
			}, this);
		}
		
		Ext.apply(this, config);
	},
	applyApiParams: function(store, operation) {
		var parent = this.getParentPanel();
		if (parent !== undefined) {
			var params = parent.getApiParams();
			operation = operation ? (operation===1 ? {} : operation) : {};
			operation.params = operation.params || {};
			for (var key in params) {
				operation.params[key] = params[key];
			}
		}
	},
	setCorpus: function(corpus) {
		if (corpus && this.getProxy && this.getProxy()) {
			this.getProxy().setExtraParam('corpus', Ext.isString(corpus) ? corpus : corpus.getId());
		}
		this.callParent(arguments);
	}
});