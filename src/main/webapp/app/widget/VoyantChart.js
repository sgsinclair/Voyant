Ext.define('Voyant.widget.VoyantChart', {
    extend: 'Ext.chart.CartesianChart',
    mixins: ['Voyant.util.Localization','Voyant.util.Api'],
    alias: 'widget.voyantchart',
    statics: {
    	i18n: {
    	},
    	api: {
    		chartJson: undefined
    	}
    },
    constructor: function(config) {
    	config = config || {};
    	var me = this;
    	this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
    	if (this.getApiParam('chartJson')) {
    		var json = JSON.parse(this.getApiParam('chartJson'));
    		Ext.apply(config, json);
    	}
    	this.callParent(arguments)
    },
    initComponent: function(config) {
    	this.callParent(arguments)
    }

})