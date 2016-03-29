Ext.define('Voyant.data.store.CorpusTermsMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: 'Voyant.data.model.CorpusTerm',
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.CorpusTerms',
			'proxy.reader.rootProperty': 'corpusTerms.terms',
			'proxy.reader.totalProperty': 'corpusTerms.total'
		}])
	}
});

Ext.define('Voyant.data.store.CorpusTerms', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.CorpusTermsMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.CorpusTermsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.CorpusTermsBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.CorpusTermsMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.CorpusTermsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});
