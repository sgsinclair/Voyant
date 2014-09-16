Ext.define('Voyant.data.model.CorpusTerm', {
    extend: 'Ext.data.Model',
    fields: [
             {name: 'id'},
             {name: 'rawFreq', type: 'int'},
             {name: 'relativeFreq', type: 'float'},
             {name: 'distributions'},
             {name: 'typeTokenRatio-lexical', type: 'float', calculate:  function(data) {
        	 	return data['typesCount-lexical']/data['tokensCount-lexical'];
             }}
    ],
    
    getTerm: function() {
    	return this.get('term');
    }
});