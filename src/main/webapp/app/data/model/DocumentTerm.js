Ext.define('Voyant.data.model.DocumentTerm', {
    extend: 'Ext.data.Model',
    fields: [
             {name: 'id'},
             {name: 'term'},
             {name: 'docIndex', 'type': 'int'},
             {name: 'docId'},
             {name: 'rawFreq', type: 'int'},
             {name: 'relativeFreq', type: 'float'},
             {name: 'tfidf', type: 'float'},
             {name: 'zscore', type: 'float'},
             {name: 'zscoreRatio', type: 'float'},
             {name: 'distributions'}
        ],
    getTerm: function() {return this.get('term');},
    getDocIndex: function() {return this.get('docIndex')},
    getRawFreq: function() {return this.get('rawFreq')},
    getRelativeFreq: function() {return this.get('relativeFreq')},
    getDistributions: function() {return this.get('distributions')}
});