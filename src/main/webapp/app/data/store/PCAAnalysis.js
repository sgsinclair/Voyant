Ext.define('Voyant.data.store.PCAAnalysis', {
	extend: 'Ext.data.Store',
	// mixins: ['Voyant.util.Transferable','Voyant.notebook.util.Embeddable'],
    model: 'Voyant.data.model.StatisticalAnalysis',
	config: {
		corpus: undefined
	},
	
	constructor : function(config) {
		
		config = config || {};
		
		// create proxy in constructor so we can set the Trombone URL
		Ext.apply(config, {
			proxy: {
				type: 'ajax',
				url: Voyant.application.getTromboneUrl(),
				extraParams: {
					tool: 'corpus.PCA',
					corpus: config && config.corpus ? (Ext.isString(config.corpus) ? config.corpus : config.corpus.getId()) : undefined,
					withDistributions: true
		         },
		         reader: {
		             type: 'json',
		             rootProperty: 'pcaAnalysis',
		             totalProperty: 'pcaAnalysis.totalTerms'
		         },
		         simpleSortMode: true
			 }
		});
		
		this.callParent([config]);

	},
	
	setCorpus: function(corpus) {
		if (corpus) {
			this.getProxy().setExtraParam('corpus', Ext.isString(corpus) ? corpus : corpus.getId());
		}
		this.callParent(arguments);
	}
});
