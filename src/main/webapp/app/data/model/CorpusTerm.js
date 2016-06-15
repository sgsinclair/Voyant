/**
 * Corpus Term
 */
Ext.define('Voyant.data.model.CorpusTerm', {
    extend: 'Ext.data.Model',
    idProperty: 'term', // should be unique
    fields: [
             {name: 'id'},
             {name: 'rawFreq', type: 'int'},
             {name: 'inDocumentsCount', type: 'int'},
             {name: 'relativeFreq', type: 'float'},
             {name: 'relativePeakedness', type: 'float'},
             {name: 'relativeSkewness', type: 'float'},
             {name: 'distributions'},
             {name: 'typeTokenRatio-lexical', type: 'float', calculate:  function(data) {
        	 	return data['typesCount-lexical']/data['tokensCount-lexical'];
             }}
    ],
    
    /**
     * Get the term.
     * @returns {String} Returns the term.
     */
    getTerm: function() {
    	return this.get('term');
    },
    
    /**
     * Get the term's raw frequency.
     * @returns {Number} Returns the term's frequency.
     */
	getRawFreq: function() {
		return parseInt(this.get('rawFreq'));
	},
	
	getInDocumentsCount: function() {
		return parseInt(this.get('inDocumentsCount'));
	},
	
	getDistributions: function() {
		return this.get('distributions');
	},
	
	/**
	 * Show a one line summary of this term.
	 */
	show: function(config) {
		show(this.getString(config))
	},
	
	getString: function() {
		return this.getTerm()+": "+this.getRawFreq();
	}
});