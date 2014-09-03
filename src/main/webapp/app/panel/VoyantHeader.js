Ext.define('Voyant.panel.VoyantHeader', {
	extend: 'Ext.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.voyantheader',
    statics: {
    	i18n: {
    		title: {en: "Voyant Tools"}
    	}
    },
    constructor: function() {
    	Ext.apply(this, {
    		title: this.localize('title')
    	})
        this.callParent(arguments);
    }
});