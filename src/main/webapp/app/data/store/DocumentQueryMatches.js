Ext.define('Voyant.data.store.DocumentQueryMatchesMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: 'Voyant.data.model.DocumentQueryMatch',
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.DocumentsFinder',
			'proxy.reader.rootProperty': 'documentsFinder.queries',
			'proxy.reader.totalProperty': undefined
		}])
	}
});

Ext.define('Voyant.data.store.DocumentQueryMatches', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.DocumentQueryMatchesMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.DocumentQueryMatchesMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.DocumentQueryMatchesBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.DocumentQueryMatchesMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.DocumentQueryMatchesMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});
