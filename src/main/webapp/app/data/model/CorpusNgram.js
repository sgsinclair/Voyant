Ext.define('Voyant.data.model.CorpusNgram', {
    extend: 'Ext.data.Model',
    fields: [
             {name: 'term'},
             {name: 'length', type: 'int'},
             {name: 'rawFreq', type: 'int'},
             {name: 'distributions'}
        ],
    getTerm: function() {return this.get('term');},
});