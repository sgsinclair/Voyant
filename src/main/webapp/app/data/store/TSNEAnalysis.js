Ext.define('Voyant.data.store.TSNEAnalysisMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: 'Voyant.data.model.StatisticalAnalysis',
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.TSNE',
			'proxy.reader.rootProperty': 'tsneAnalysis',
			'proxy.reader.totalProperty': 'tsneAnalysis.totalTerms'
		}])
		config.proxy.extraParams.withDistributions = true;
		config.proxy.extraParams.noCache = 1;
	}
});

Ext.define('Voyant.data.store.TSNEAnalysis', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.TSNEAnalysisMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.TSNEAnalysisMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.TSNEAnalysisBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.TSNEAnalysisMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.TSNEAnalysisMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});