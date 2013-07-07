Ext.define('Voyant.store.Document', {
    extend: 'Ext.data.Store',
    model: 'Voyant.model.Document',
    proxy: {
    	type: 'ajax',
    	url: Voyant.TROMBONE_URL,
    	reader: {
    		type: 'json',
    		documentIds: 'documentIds',
    		root: 'corpusSummary.corpus'
    	}
    }
});