Ext.define('Voyant.data.store.TokensMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: 'Voyant.data.model.Token',
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.DocumentTokens',
			'proxy.reader.rootProperty': 'documentTokens.tokens',
			'proxy.reader.totalProperty': 'documentTokens.total'
		}])
	}
});

Ext.define('Voyant.data.store.Tokens', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.TokensMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.TokensMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.TokensBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.TokensMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.TokensMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});