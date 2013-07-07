Ext.define('Voyant.model.Corpus', {
    extend: 'Ext.data.Model',
    hasMany: {model: 'Voyant.model.Document', name: 'getDocuments', associationKey: 'documents'},
    fields: ['id']
});