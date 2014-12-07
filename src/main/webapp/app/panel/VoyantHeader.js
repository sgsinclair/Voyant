Ext.define('Voyant.panel.VoyantHeader', {
	extend: 'Ext.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.voyantheader',
    statics: {
    	i18n: {
    		title: {en: "Voyant Tools"}
    	}
    },
    constructor: function(config) {
    	Ext.apply(this, {
    		id: 'voyantheader',
    		title: '',
    		layout : 'fit',
    		html: '<div id="logo-container"></div>',
    		collapseMode : undefined,
			collapsible: true,
			animCollapse: false,
			titleCollapse: false,
			floatable: false,
			header: true,
			hideCollapseTool: true,
			listeners: {
				collapse: this.onCollapse
			},
			titleAlign: 'center'
    	});
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.call(this, Ext.apply(config, {
    		moreTools: ['corpusset']
    	}));
    },
    
    onCollapse: function(panel) {
    	panel.setTitle(this.localize('title'));
    }
});
