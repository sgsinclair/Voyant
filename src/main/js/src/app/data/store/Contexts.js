Ext.define('Voyant.data.store.ContextsMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: 'Voyant.data.model.Context',
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.DocumentContexts',
			'proxy.reader.rootProperty': 'documentContexts.contexts',
			'proxy.reader.totalProperty': 'documentContexts.total'
		}])
	}
});

Ext.define('Voyant.data.store.Contexts', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.ContextsMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.ContextsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.ContextsBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.ContextsMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.ContextsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});