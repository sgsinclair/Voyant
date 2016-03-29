Ext.define('Voyant.data.store.CorpusNgramsMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: 'Voyant.data.model.CorpusNgram',
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.CorpusNgrams',
			'proxy.reader.rootProperty': 'corpusNgrams.ngrams',
			'proxy.reader.totalProperty': 'corpusNgrams.total'
		}])
	}
});

Ext.define('Voyant.data.store.CorpusNgrams', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.CorpusNgramsMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.CorpusNgramsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.CorpusNgramsBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.CorpusNgramsMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.CorpusNgramsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});
