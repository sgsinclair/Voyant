Ext.define('Voyant.data.store.CAAnalysisMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
	embeddable: ['Voyant.panel.ScatterPlot'],
    model: 'Voyant.data.model.StatisticalAnalysis',
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.CA',
			'proxy.reader.rootProperty': 'correspondenceAnalysis',
			'proxy.reader.totalProperty': 'correspondenceAnalysis.totalTerms'
		}])
		config.proxy.extraParams.withDistributions = true;
	}
});

Ext.define('Voyant.data.store.CAAnalysis', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.CAAnalysisMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.CAAnalysisMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.CAAnalysisBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.CAAnalysisMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.CAAnalysisMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});