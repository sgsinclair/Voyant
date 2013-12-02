/**
 * Document docs
 * 
 * @author Stéfan Sinclair
 * @since 4.0
 * @class Voyant.data.Document
*/
Ext.define('Voyant.data.Document', {
    extend: 'Ext.data.Store',
    model: 'Voyant.data.model.Document',
    mixins: ['Voyant.utils.Embeddable','Voyant.utils.Transferable','Voyant.utils.Localization'],
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