Ext.define('Voyant.widget.VoyantChart', {
    extend: 'Ext.chart.CartesianChart',
    mixins: ['Voyant.util.Localization','Voyant.util.Api','Voyant.notebook.util.Embed'],
    alias: 'widget.voyantchart',
    statics: {
    	i18n: {
    	},
    	api: {
    		tableJson: undefined
    	}
    },
    constructor: function(config) {
    	config = config || {};
    	var me = this;
    	this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
    	if (!config.noEmbed) {
        	this.mixins['Voyant.notebook.util.Embed'].constructor.apply(this, arguments);
    	}
    	if (this.getApiParam('tableJson')) {
    		Ext.apply(config, this.getConfigFromTableJson());
    	}
    	this.callParent(arguments)
    	
    	me.on("reconfigure", function() {
        	if (this.getApiParam('tableJson')) {
        		var config = this.getConfigFromTableJson();
        		var newChart = Ext.create('Voyant.widget.VoyantChart', config);
        		var container = this.up("container");
        		container.remove(this);
        		container.add(newChart)
        	}
    	})
    },
    initComponent: function(config) {
    	this.callParent(arguments)
    },
    
    getConfigFromTableJson: function() {
    	var jsonString = this.getApiParam('tableJson');
    	if (!jsonString) {return {}};
    	
		var json = JSON.parse(jsonString);
		
		json.headers = json.headers.map(function(header) {return header})
		// if we have only one column add a second column with a counter (as category)
		if (json.headers.length==1) {
			json.headers.push(1);
			json.rowKey = 1;
			json.rows.forEach(function(row, i) {if (row) {row.push(i)}})
		}
		
		// data
		var data = [];
		if (!json.rowKey) {json.rowKey=json.headers[0];}
		json.rows.forEach(function(row, i) {
			if (row) {
				var map = {};
				map[json.rowKey] = i;
				row = row.forEach(function(cell, j) {
					map[json.headers[j]] = cell
				})
				data.push(map);
			}
		})

		// start chart
		if (!json.config) {json.config = {}}
		var chart = {
			store: {
		        fields: Object.keys(data[0]),
		        data: data
			},
	        axes: Ext.isArray(json.config.axes) ? json.config.axes : [{},{}],
	        series: []
		}

		// axes
		if (!json.config.axes) {json.config.axes = [{},{}]}
		chart.axes.forEach(function(axis, i) {
			if (Ext.isObject(json.config.axes)) {
				Ext.apply(axis, json.config.axes);
			} else if (Ext.isArray(json.config.axes)) {
				Ext.apply(axis, json.config.axes[i]);
			}
			Ext.applyIf(axis, {
	        	type: i==0 ? 'numeric' : 'category',
	        	position: i==0 ? 'left' : 'bottom'
	        });
		})

		// series
		for (var i=0, len=json.headers.length; i<len;i++) {
			if (json.headers[i]==json.rowKey) {continue;} // don't chart the row key, that's the x axis 
			var cfg = {};
			if (json.config.series) {
				if (Ext.isObject(json.config.series)) {
					Ext.apply(cfg, json.config.series);
				} else if (Ext.isArray(json.config.series)) {
					Ext.apply(cfg, json.config.series[chart.series.length]);
				}
			}
			Ext.applyIf(cfg, {
		        type: 'line',
		        xField: json.rowKey,
		        yField: json.headers[i],
		        marker: {
		        	radius: 2
		        },
		        highlightCfg: {
	                scaling: 2
	            },
	            tooltip: {
	            	trackMouse: true,
	            	renderer: function (tooltip, record, item) {
	                    tooltip.setHtml(record.get(item.series.getYField())+": "+record.get(item.series.getYField()));
	                }
	            }
			});
			chart.series.push(cfg);
		}
		
		return chart;
    	
    }

})