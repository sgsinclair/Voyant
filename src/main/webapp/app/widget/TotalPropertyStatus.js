Ext.define('Voyant.widget.TotalPropertyStatus', {
    extend: 'Ext.Component',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.totalpropertystatus',
	statics: {
		i18n: {
    		totalPropertyStatus: {en: '{count:number("0,000")}'},
		}
	},
    initComponent: function() {
        var me = this;
        Ext.applyIf(me, {
            tpl: this.localize('totalPropertyStatus'),
            itemId: 'totalpropertystatus',
            style: 'margin-right:5px',
            listeners: {
            	afterrender: function(cmp) {
            		var grid = cmp.up('grid')
            		if (grid) {
            			var store = grid.getStore();
            			cmp.updateStatus(store.getTotalCount()); // make sure we set this in case of lazy render
            			grid.getStore().on("totalcountchange", cmp.updateStatus, cmp) // bind changes to update
            		}
            	}
            }
        })
        me.callParent(arguments);
    },
    updateStatus: function(count) {
    	this.update({count: count})
    }
});
