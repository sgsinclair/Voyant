Ext.define('Voyant.panel.Reader', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.reader',
    statics: {
    	i18n: {
    		title: {en: "Reader"}
    	}
    },
    constructor: function() {
    	Ext.apply(this, {
    		title: this.localize('title')
    	})
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    }
})