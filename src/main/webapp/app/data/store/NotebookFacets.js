Ext.define('Voyant.data.model.NotebookFacet', {
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

Ext.define('Voyant.data.store.NotebookFacetsMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: Voyant.data.model.NotebookFacet,
	constructor : function(config) {
		if (config.facet) {
			if (config.proxy === undefined) {
				config.proxy = {};
			}
			if (config.proxy.extraParams === undefined) {
				config.proxy.extraParams = {};
			}
			config.proxy.extraParams.facet = config.facet;
			config.proxy.extraParams.noCache = 1;
			delete config.facet;
		}
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'notebook.CatalogueFacets',
			'proxy.reader.rootProperty': 'catalogue.facets',
			'proxy.reader.totalProperty': 'catalogue.total'
		}])
	}
});

Ext.define('Voyant.data.store.NotebookFacets', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.NotebookFacetsMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.NotebookFacetsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.NotebookFacetsBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.NotebookFacetsMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.NotebookFacetsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});
