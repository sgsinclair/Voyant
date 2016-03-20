Ext.define("Voyant.data.proxy.CorpusFacets", {
	extend: 'Ext.data.proxy.Ajax',
	constructor: function(config) {
		config = config || {};
		Ext.apply(config, {
            extraParams: Ext.apply(config.extraParams || {}, {
				 tool: 'corpus.CorpusFacets'
			})
		});
		Ext.applyIf(config, {
			url: Voyant.application.getTromboneUrl()
		})
		this.callParent([config]);
	},
	reader: {
	    type: 'json',
	    rootProperty: 'corpusFacets.facets',
	    totalProperty: 'corpusFacets.total'
	},
    simpleSortMode: true
})

Ext.define('Voyant.data.store.CorpusFacets', {
	extend: 'Voyant.data.store.VoyantStore',
    model: 'Voyant.data.model.CorpusFacet',
    transferable: ['setCorpus'],
	config: {
		corpus: undefined
	},
	constructor : function(config) {
		
		config = config || {};
		
		Ext.applyIf(config, {
			pagePurgeCount: 0,
			pageSize: 100,
			leadingBufferZone: 100,
			remoteSort: true,
			autoLoad: false, // needs to be false until there's a corpus
		    proxy: Ext.create("Voyant.data.proxy.CorpusFacets", {
		    	extraParams: {
		    		facet: config.facet
		    	}
		    })
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
