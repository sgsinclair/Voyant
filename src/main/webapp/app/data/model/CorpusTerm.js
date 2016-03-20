Ext.define('Voyant.data.model.CorpusTerm', {
    extend: 'Ext.data.Model',
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
    
    getTerm: function() {
    	return this.get('term');
    },
	getRawFreq: function() {
		return parseInt(this.get('rawFreq'));
	},
	getInDocumentsCount: function() {
		return parseInt(this.get('inDocumentsCount'));
	}
});