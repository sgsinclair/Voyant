Ext.define('Voyant.data.model.CorpusCollocate', {
    extend: 'Ext.data.Model',
    fields: [
             {name: 'term'},
             {name: 'rawFreq', type: 'int'},
             {name: 'contextTerm'},
             {name: 'contextTermRawFreq', type: 'int'}
    ],
    
    getKeyword: function() {return this.get('keyword');},
    getKeywordRawFreq: function() {return this.get('keywordRawFreq');},
    getContextTerm: function() {return this.get('contextTerm');},
    getContextTermRawFreq: function() {return this.get('contextTermRawFreq');}
});