Ext.define('Voyant.data.model.DocumentQueryMatch', {
    extend: 'Ext.data.Model',
    fields: [
             {name: 'id'},
             {name: 'count', 'type': 'int'},
             {name: 'query'},
             {name: 'distributions'}
        ],
    getCount: function() {return this.get('count')},
    getDistributions: function() {return this.get("distributions")},
    getDocIds: function() {return this.get("docIds")}
});