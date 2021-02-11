Ext.define('Voyant.data.store.CorpusFacetsMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: Voyant.data.model.CorpusFacet,
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.CorpusFacets',
			'proxy.reader.rootProperty': 'corpusFacets.facets',
			'proxy.reader.totalProperty': 'corpusFacets.total'
		}])
	}
});

Ext.define('Voyant.data.store.CorpusFacets', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.CorpusFacetsMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.CorpusFacetsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.CorpusFacetsBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.CorpusFacetsMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.CorpusFacetsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});
