Ext.define('Voyant.data.model.CorpusFacet', {
    extend: 'Ext.data.Model',
    idProperty: 'label',
    fields: [
             {name: 'facet'},
             {name: 'label'},
             {name: 'inDocumentsCount', type: 'int'}
    ],
    getLabel: function() {
    	return this.get('label')
    },
    getFacet: function() {
    	return this.get('facet')
    },
	getInDocumentsCount: function() {
		return this.get('inDocumentsCount')
	}
});