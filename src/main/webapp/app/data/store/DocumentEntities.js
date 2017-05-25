Ext.define('Voyant.data.store.DocumentEntitiesMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: 'Voyant.data.model.DocumentEntity',
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.DocumentEntities',
			'proxy.reader.rootProperty': 'documentEntities.entities',
			'proxy.reader.totalProperty': 'documentEntities.total'
		}])
	}
});

Ext.define('Voyant.data.store.DocumentEntities', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.DocumentEntitiesMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.DocumentEntitiesMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.DocumentEntitiesBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.DocumentEntitiesMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.DocumentEntitiesMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});
