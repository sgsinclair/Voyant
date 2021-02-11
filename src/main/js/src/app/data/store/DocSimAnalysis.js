Ext.define('Voyant.data.store.DocSimAnalysisMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: 'Voyant.data.model.StatisticalAnalysis',
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.DocumentSimilarity',
			'proxy.reader.rootProperty': 'documentSimilarity',
			'proxy.reader.totalProperty': 'documentSimilarity.total'
		}])
		config.proxy.extraParams.withDistributions = true;
	}
});

Ext.define('Voyant.data.store.DocSimAnalysis', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.DocSimAnalysisMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.DocSimAnalysisMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.DocSimAnalysisBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.DocSimAnalysisMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.DocSimAnalysisMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});