Ext.define('Voyant.data.store.DocumentsMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: 'Voyant.data.model.Document',
    statics: {
    	i18n: {
    	}
    },
	sorters: {
        property: 'index',
        direction: 'ASC'
	},
	remoteSort: true,
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.DocumentsMetadata',
			'proxy.reader.rootProperty': 'documentsMetadata.documents',
			'proxy.reader.totalProperty': 'documentsMetadata.total'
		}])
	},
	listeners: {
		 load: function(store, records, successful, opts) {
			 if (successful) {
				 var corpus = store.getCorpus();
				 records.forEach(function(record) {
					 record.set('corpus', corpus);
				 });
			 }
		 }
	},
	getDocument: function(config) {
		return Ext.isNumber(config) ? this.getAt(config) : this.getById(config);
	}
	
});

Ext.define('Voyant.data.store.Documents', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.DocumentsMixin'],
    model: 'Voyant.data.model.Document',
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.DocumentsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.DocumentsBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.DocumentsMixin'],
    model: 'Voyant.data.model.Document',
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.DocumentsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});
