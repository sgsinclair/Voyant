Ext.define('Voyant.data.store.RelatedTermsMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: 'Voyant.data.model.RelatedTerm',
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.SemanticGraph',
			'proxy.reader.rootProperty': 'semanticGraph.edges',
			'proxy.reader.totalProperty': 'semanticGraph.total'
		}])
	}
});

Ext.define('Voyant.data.store.RelatedTerms', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.RelatedTermsMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.RelatedTermsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.RelatedTermsBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.RelatedTermsMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.RelatedTermsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});