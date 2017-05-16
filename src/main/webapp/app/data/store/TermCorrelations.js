Ext.define('Voyant.data.store.TermCorrelationsMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: 'Voyant.data.model.TermCorrelation',
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.CorpusTermCorrelations',
			'proxy.reader.rootProperty': 'termCorrelations.correlations',
			'proxy.reader.totalProperty': 'termCorrelations.total'
		}])
	}
});

Ext.define('Voyant.data.store.TermCorrelations', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.TermCorrelationsMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.TermCorrelationsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.TermCorrelationsBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.TermCorrelationsMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.TermCorrelationsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});