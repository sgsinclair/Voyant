Ext.define('Voyant.Tool', {
	extend: 'Ext.util.Observable',
	
	constructor: function() {
		// check if global store exists, otherwise use local store
		if (this.store) {
			var store = Ext.getStore(this.store);
			if (store == undefined) {
				this.store = Ext.create('Voyant.store.'+this.store);
			}
		}
		
		this.callParent();
	}
});