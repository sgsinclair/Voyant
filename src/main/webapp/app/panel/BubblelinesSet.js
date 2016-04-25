Ext.define('Voyant.panel.BubblelinesSet', {
	extend: 'Ext.panel.Panel',
    requires: ['Voyant.panel.Bubblelines','Voyant.panel.Contexts', 'Voyant.panel.Reader'],
	mixins: ['Voyant.panel.Panel'],
    alias: 'widget.bubblelinesset',
	statics: {
		i18n: {
		},
		glyph: 'xf17a@FontAwesome'
	},
	constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
	},
	layout: 'vbox',
	header: false,
	items: [{
		width: '100%',
		height: '100%',
    	xtype: 'bubblelines',
    	flex: 5
    },{
    	width: '100%',
    	height: '100%',
    	split: {width: 5},
		layout: 'hbox',
		flex: 4,
        defaults: {
        	width: '100%',
        	height: '100%',
        	flex: 1,
        	frame: true,
        	border: true
        },
        items: [{
        	xtype: 'contexts'
        },{
        	xtype: 'reader'
        }]
    }]
})