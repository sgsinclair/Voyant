Ext.define('Voyant.data.model.CorpusCollocate', {
    extend: 'Ext.data.Model',
    fields: [
             {name: 'term'},
             {name: 'rawFreq', type: 'int'},
             {name: 'contextTerm'},
             {name: 'contextTermRawFreq', type: 'int'}
    ],
    
    getTerm: function() {return this.getKeyword()},
    getRawFreq: function() {return this.getKeywordRawFreq()},
    getKeyword: function() {return this.get('term');},
    getKeywordRawFreq: function() {return this.get('rawFreq');},
    getContextTerm: function() {return this.get('contextTerm');},
    getContextTermRawFreq: function() {return this.get('contextTermRawFreq');}
});