Ext.define('Voyant.data.store.CorpusCollocatesMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: 'Voyant.data.model.CorpusCollocate',
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.CorpusCollocates',
			'proxy.reader.rootProperty': 'corpusCollocates.collocates',
			'proxy.reader.totalProperty': 'corpusCollocates.total'
		}])
	}
});

Ext.define('Voyant.data.store.CorpusCollocates', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.CorpusCollocatesMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.CorpusCollocatesMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.CorpusCollocatesBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.CorpusCollocatesMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.CorpusCollocatesMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});