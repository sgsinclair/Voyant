Ext.define('Voyant.panel.CollocatesSet', {
	extend: 'Ext.panel.Panel',
    requires: ['Voyant.panel.ScatterPlot','Voyant.panel.Documents', 'Voyant.panel.Trends', 'Voyant.panel.Contexts'],
	mixins: ['Voyant.panel.Panel'],
    alias: 'widget.collocatesset',
	statics: {
		i18n: {
			title: {en: "Scatter"},
			helpTip: {en: "This is a specialized view for working with scatterplots."}
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
		layout: 'hbox',
		align: 'stretch',
		width: '100%',
		height: '100%',
		flex: 2,
        defaults: {
        	width: '100%',
        	height: '100%',
        	flex: 1,
        	frame: true,
        	border: true
        },
        items: [{
        	xtype: 'corpusterms'
        },{
        	xtype: 'documentterms'
        },{
        	xtype: 'corpuscollocates'
        }]
    },{
    	width: '100%',
    	height: '100%',
    	split: {width: 5},
		layout: 'hbox',
		flex: 3,
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
        	xtype: 'collocatesgraph'
        }]
    }]
})