Ext.define('Voyant.model.Document', {
    extend: 'Ext.data.Model',
    fields: ['id', 'wordTokensCount', 'wordTypesCount', 'docsCount'],
    belongsTo: 'Voyant.model.Corpus'
});