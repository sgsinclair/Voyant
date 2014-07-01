Ext.define('Voyant.data.model.DocumentTerm', {
    extend: 'Ext.data.Model',
    fields: [
             {name: 'id'},
             {name: 'docIndex', 'type': 'int'},
             {name: 'docId'},
             {name: 'rawFreq', type: 'int'},
             {name: 'relativeFreq', type: 'float'},
             {name: 'distributions'}
        ]
});