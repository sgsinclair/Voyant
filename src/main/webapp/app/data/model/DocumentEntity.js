Ext.define('Voyant.data.model.DocumentEntity', {
    extend: 'Ext.data.Model',
    fields: [
             {name: 'term'},
             {name: 'docIndex', 'type': 'int'},
             {name: 'rawFreq', type: 'int'},
             {name: 'type'},
             {name: 'positions'}
        ],
    getTerm: function() {return this.get('term');},
    getDocIndex: function() {return this.get('docIndex')},
    getRawFreq: function() {return this.get('rawFreq')},
    getPositions: function() {return this.get('positions')}
});