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
    	this.callParent(arguments)
    	
    },
    initComponent: function(config) {
    	config = config || {};
    	this.on("afterrender", function() {
        	if (config && "tableJson" in config) {
        		Ext.apply(this, this.getConfigFromTableJson(config.tableJson));
        	}
        	else if (this.getApiParam('tableJson')) {
        		var chart = this.getConfigFromTableJson();
        		this.setAxes(chart.axes);
        		this.setSeries(chart.series);
        		this.setLegend(chart.legend);
        		this.setStore(chart.store);
        		this.redraw();
        	}
    	}, this)
    	this.callParent(arguments)
    },
    
    getConfigFromTableJson: function(jsonString) {
    	jsonString = jsonString || this.getApiParam('tableJson');
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
	        series: [],
    		legend: json.config.noLegend || Object.keys(data[0]).length<3 ? undefined : {docked:'top'}

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
	        	position: i==0 ? 'left' : 'bottom',
	        	label: i==0 ? {} : {rotation: {degrees:-30}}
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