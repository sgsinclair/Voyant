Ext.define('Voyant.data.store.CorpusTermsMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: Voyant.data.model.CorpusTerm,
//    statics: {
//    	i18n: {
//    		getString: "This store has {0} terms with a total of {1} occurrences."
//    	}
//    },
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.CorpusTerms',
			'proxy.reader.rootProperty': 'corpusTerms.terms',
			'proxy.reader.totalProperty': 'corpusTerms.total'
		}])
	},

	show: function(config) {
		show(this.getString(config))
	}

});

/**
 * Corpus Terms store.
 */
Ext.define('Voyant.data.store.CorpusTerms', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.CorpusTermsMixin'],
    model: Voyant.data.model.CorpusTerm,
	
	/**
	 * @method each
	 * Iterate over each {@link Voyant.data.model.CorpusTerm corpus term} in this store.
	 * 
	 * 	new Corpus("Hello Voyant!").loadCorpusTerms().then(function(corpusTerms) {
	 * 		corpusTerms.each(function(corpusTerm) {
	 * 			corpusTerm.show();
	 * 		});
	 * 	});
	 * 
	 * @param {function} function The function to call for each corpus term.
	 */
	
	/**
	 * @method show
	 * Shows a one line summary of the corpus terms.
	 * 
	 * 	new Corpus("Hello Voyant!").loadCorpusTerms().then(function(corpusTerms) {
	 * 		corpusTerms.show();
	 * 	});
	 */
	
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.CorpusTermsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	},
	
	getString: function(config) {
		return new Ext.XTemplate(this.localize("getString")).apply([this.getCount(), this.sum("rawFreq")])
	}


});

Ext.define('Voyant.data.store.CorpusTermsBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.CorpusTermsMixin'],
    model: Voyant.data.model.CorpusTerm,
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.CorpusTermsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});
