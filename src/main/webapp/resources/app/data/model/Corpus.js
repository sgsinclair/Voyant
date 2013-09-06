Ext.define('Voyant.data.model.Corpus', {
    extend: 'Ext.data.Model',
    hasMany: {model: 'Voyant.data.model.Document', name: 'getDocuments', associationKey: 'documents'},
    fields: ['id']
});