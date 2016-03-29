Ext.define('Voyant.data.store.PCAAnalysisMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: 'Voyant.data.model.StatisticalAnalysis',
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.PCA',
			'proxy.reader.rootProperty': 'pcaAnalysis',
			'proxy.reader.totalProperty': 'pcaAnalysis.totalTerms'
		}])
		config.proxy.extraParams.withDistributions = true;
	}
});

Ext.define('Voyant.data.store.PCAAnalysis', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.PCAAnalysisMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.PCAAnalysisMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.PCAAnalysisBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.PCAAnalysisMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.PCAAnalysisMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});