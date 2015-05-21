Ext.define('Voyant.data.store.CorpusCollocates', {
	extend: 'Ext.data.BufferedStore',
	//mixins: ['Voyant.util.Transferable','Voyant.notebook.util.Embeddable'],
    model: 'Voyant.data.model.CorpusCollocate',
//    transferable: ['setCorpus'],
//    embeddable: ['Voyant.panel.CorpusTerms','Voyant.panel.Cirrus'],
	config: {
		corpus: undefined
	},
	constructor : function(config) {
		
		config = config || {};
		
		// create proxy in constructor so we can set the Trombone URL
		Ext.apply(config, {
			pagePurgeCount: 0,
			pageSize: 100,
			leadingBufferZone: 100,
			remoteSort: true,
			autoLoad: false, // needs to be false until there's a corpus
		     proxy: { // TODO: configure proxy to handle error
		         type: 'ajax',
		         url: Voyant.application.getTromboneUrl(),
		         extraParams: {
		        	 tool: 'corpus.CorpusCollocates',
		        	 corpus: config && config.corpus ? (Ext.isString(config.corpus) ? config.corpus : config.corpus.getId()) : undefined
		         },
		         reader: {
		             type: 'json',
		             rootProperty: 'corpusCollocates.collocates',
		             totalPropery: 'corpusCollocates.total'
		         },
		         simpleSortMode: true
		     },
	         reader: {
	             type: 'json',
	             rootProperty: 'corpusCollocates.collocates',
	             totalPropery: 'corpusCollocates.total'
	         }

		})
		
//    	this.mixins['Voyant.notebook.util.Embeddable'].constructor.apply(this, arguments);
		this.callParent([config]);

	},
	
	setCorpus: function(corpus) {
		if (corpus) {
			this.getProxy().setExtraParam('corpus', Ext.isString(corpus) ? corpus : corpus.getId());
		}
		this.callParent(arguments);
	}

});
