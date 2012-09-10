Ext.define('Voyant.model.Corpus', {
	extend: 'Ext.data.Model',
	fields: [
		{name: 'id', mapping: '@id'},
		{name: 'lastModified', mapping: '@lastModified'},
		{name: 'totalWordTokens', type: 'int', mapping: '@totalWordTokens'},
		{name: 'totalWordTypes', type: 'int', mapping: '@totalWordTypes'},
		{name: 'docsCount', type: 'int', mapping: 'documents', convert: function(val, record) {
			return val.length;
		}}
	],
	hasMany: {model: 'Document', name: 'documents'}
});