Ext.define('Voyant.data.model.Context', {
    extend: 'Ext.data.Model',
    fields: [
             {name: 'id'},
             {name: 'docIndex', 'type': 'int'},
             {name: 'docId'},
             {name: 'left'},
             {name: 'keyword'},
             {name: 'term'},
             {name: 'right'},
        ]
});