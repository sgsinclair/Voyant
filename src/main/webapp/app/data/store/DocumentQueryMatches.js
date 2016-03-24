Ext.define('Voyant.data.store.DocumentQueryMatches', {
	extend: 'Ext.data.Store',
    model: 'Voyant.data.model.DocumentQueryMatch',
	config: {
		corpus: undefined
	},
	constructor : function(config) {
		
		config = config || {};
		
		// create proxy in constructor so we can set the Trombone URL
		Ext.applyIf(config, {
			autoLoad: false,
		     proxy: {
		         type: 'ajax',
		         url: Voyant.application.getTromboneUrl(),
		         extraParams: {
		        	 tool: 'corpus.DocumentsFinder',
		        	 corpus: config && config.corpus ? (Ext.isString(config.corpus) ? config.corpus : config.corpus.getId()) : undefined
		         },
		         actionMethods: {read: 'POST'},
		         reader: {
		             type: 'json',
		             rootProperty: 'documentsFinder.queries'
		         }
		     }
		})
		
		this.callParent([config]);

		if (config && config.corpus) {
			this.setCorpus(config.corpus);
		}
	},
	
	setCorpus: function(corpus) {
		if (corpus) {
			this.getProxy().setExtraParam('corpus', Ext.isString(corpus) ? corpus : corpus.getId());
		}
		this.callParent(arguments);
	}

});
