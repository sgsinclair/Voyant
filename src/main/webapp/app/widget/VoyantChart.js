Ext.define('Voyant.widget.VoyantChart', {
    extend: 'Ext.chart.CartesianChart',
    mixins: ['Voyant.util.Localization','Voyant.util.Api','Voyant.notebook.util.Embed'],
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
    	if (!config.noEmbed) {
        	this.mixins['Voyant.notebook.util.Embed'].constructor.apply(this, arguments);
    	}
    	if (this.getApiParam('chartJson')) {
    		var json = JSON.parse(this.getApiParam('chartJson'))
    		Ext.apply(config, json);
    	}
    	this.callParent([config])
    	
    	me.on("reconfigure", function() {
        	if (this.getApiParam('chartJson')) {
        		var json = this.getApiParam('chartJson');
        		if (Ext.isString(json)) {
            		json = JSON.parse(this.getApiParam('chartJson'));
            		json.noEmbed = true;
            		this.isConfiguring = true;
            		var newChart = Ext.create('Voyant.widget.VoyantChart', json);
            		var container = this.up("container");
            		container.remove(this);
            		container.add(newChart)
        		}
        	}
    	})
    },
    initComponent: function(config) {
    	this.callParent(arguments)
    }

})