Ext.define('Voyant.panel.Dummy', {
    extend: 'Ext.Panel',
    xtype: 'dummy',
	autoScroll: true,
    initComponent: function() {
        var me = this;
        
        var columns = 3;
        
        Ext.apply(this, {
    		xtype: 'tabpanel',
    		items: [{
                title: 'Tab 1',
                icon: null,
                glyph: 42,
                html: "one"
            }, {
                title: 'Tab 2',
                icon: null,
                glyph: 70,
                html: "two"
            }]
        })
        
        this.callParent();
    }
});