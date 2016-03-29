Ext.define('Voyant.data.store.DocumentTermsMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: 'Voyant.data.model.DocumentTerm',
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.DocumentTerms',
			'proxy.reader.rootProperty': 'documentTerms.terms',
			'proxy.reader.totalProperty': 'documentTerms.total'
		}])
	}
});

Ext.define('Voyant.data.store.DocumentTerms', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.DocumentTermsMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.DocumentTermsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.DocumentTermsBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.DocumentTermsMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.DocumentTermsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});
