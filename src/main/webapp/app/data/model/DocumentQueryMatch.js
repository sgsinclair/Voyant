Ext.define('Voyant.data.model.DocumentQueryMatch', {
    extend: 'Ext.data.Model',
    fields: [
             {name: 'id'},
             {name: 'count', 'type': 'int'},
             {name: 'query'}
        ]
});