Ext.define("Voyant.data.store.Documents", {
	extend: "Ext.data.BufferedStore",
	model: "Voyant.data.model.Document",
	// mixins: ['Voyant.util.Transferable','Voyant.notebook.util.Embeddable'],
    // embeddable: ['Voyant.panel.Documents'],
	config: {
		corpus: undefined
	},
    statics: {
    	i18n: {
    		failedGetDocuments: {en: 'Failed attempt to get documents.'}
    	}
    },
	sorters: {
        property: 'index',
        direction: 'ASC'
	},
	remoteSort: true,
	constructor : function(config) {
		// create proxy in constructor so we can set the Trombone URL
		Ext.apply(config, {
			pagePurgeCount: 0,
			pageSize: 1000,
			leadingBufferZone: 100,
		     proxy: {
		         type: 'ajax',
		         url: Voyant.application.getTromboneUrl(),
		         extraParams: {
		        	 tool: 'corpus.DocumentsMetadata',
		        	 corpus: config && config.corpus ? (Ext.isString(config.corpus) ? config.corpus : config.corpus.getId()) : undefined
		         },
		         reader: {
		             type: 'json',
		             rootProperty: 'documentsMetadata.documents',
		             totalProperty: 'documentsMetadata.total'
		         },
		         simpleSortMode: true
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
	         }
		});
    	//this.mixins['Voyant.notebook.util.Embeddable'].constructor.apply(this, arguments);
		this.callParent([config]);
		
		if (config && config.corpus) {
			if (config.corpus.then) {
				var dfd = Voyant.application.getDeferred(this);
				var me = this;
				config.corpus.then(function(corpus) {
					me.setCorpus(corpus);
					dfd.resolve(me);
				});
				var promise = Voyant.application.getPromiseFromDeferred(dfd);
				return promise;
			}
			else {
				this.setCorpus(config.corpus);
			}
		}

	},
	setCorpus: function(corpus) {
		if (corpus) {
			this.getProxy().setExtraParam('corpus', Ext.isString(corpus) ? corpus : corpus.getId());
		}
		this.callParent(arguments);
	},
	
	getDocument: function(config) {
		if (this.getCorpus().getDocumentsCount()!=this.getTotalCount()) {
			var dfd = Voyant.application.getDeferred();
			var me = this;
			this.load({
			    scope: this,
			    callback: function(records, operation, success) {
			    	if (success) {dfd.resolve(this.getDocument(config))}
			    	else {
						Voyant.application.showResponseError(this.localize('failedGetDocuments'), response);
						dfd.reject(); // don't send error since we've already shown it
			    	}
			    }
			});
			return dfd.promise();
		}
		return Ext.isNumber(config) ? this.getAt(config) : this.getById(config);
	}
})