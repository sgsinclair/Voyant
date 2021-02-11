Ext.define('Voyant.panel.ScatterSet', {
	extend: 'Ext.panel.Panel',
    requires: ['Voyant.panel.ScatterPlot','Voyant.panel.Documents', 'Voyant.panel.Trends', 'Voyant.panel.Contexts'],
	mixins: ['Voyant.panel.Panel'],
    alias: 'widget.scatterset',
	statics: {
		i18n: {
		},
		glyph: 'xf17a@FontAwesome'
	},
	constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
	},
	layout: 'hbox',
	header: false,
	items: [{
    	flex: 3,
    	height: '100%',
        xtype: 'scatterplot'
    },{
    	split: {width: 5},
        flex: 1,
    	height: '100%',
        layout: 'vbox',
        defaults: {
        	width: '100%',
        	flex: 1
        },
        items: [{
        	xtype: 'documents',
        	collapsible: true
        },{
        	xtype: 'trends',
        	collapsible: true
        },{
        	xtype: 'contexts',
        	collapsible: true
        }]
    }]
})