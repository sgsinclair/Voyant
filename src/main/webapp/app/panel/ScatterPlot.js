Ext.define('Voyant.panel.ScatterPlot', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	requires: ['Ext.chart.CartesianChart'],
	alias: 'widget.scatterplot',
	config: {
		corpus: undefined
	},
    statics: {
    	i18n: {
    		title: {en: "ScatterPlot"},
    		helpTip: {en: "<p>ScatterPlot displays the correspondance of word use in a corpus. This visualization relies on a statistical analysis that takes the word’s correspondance from each document (where each document represents a dimension) and reduces it to a three dimensional space to easily visualize the data through a scatterplot.</p>"}
    	},
    	api: {
    		stopList: 'auto'
    	},
		glyph: 'xf06e@FontAwesome'
    },
    
    layout: 'fit',
    
    constructor: function(config) {
    	Ext.apply(this, {
    		title: this.localize('title')
    	});
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
    	
        var store = Ext.create("Voyant.data.store.StatisticalAnalysis");
        Ext.apply(this, {
        	store: store
        });
        var rec = store.getAt(0);
        var tokens = rec.getTokens();
        var dimensions = rec.getDimensions();
        
        var data = [];
        tokens.forEach(function(token) {
        	data.push({term: token.get('term'), rawFreq: token.get('rawFreq'), cluster: token.get('cluster'), x: token.get('vector')[0], y: token.get('vector')[1]});
        });
        
    	var store = Ext.create('Ext.data.JsonStore', {
    		fields: ['term', 'x', 'y', 'rawFreq', 'cluster'],
    		data: data
    	});
        
        this.items = [{
        	itemId: 'chart',
        	xtype: 'cartesian',
        	store: store,
        	interactions: 'itemhighlight',
        	axes: [{
        		type: 'numeric',
        		position: 'bottom',
        		fields: ['x']
        	},{
        		type: 'numeric',
        		position: 'left',
        		fields: ['y']
        	}],
        	series: [{
        		type: 'scatter',
        		xField: 'x',
        		yField: 'y',
        		label: {
        			field: 'term',
        			display: 'over'
        		},
        		tooltip: {
        			trackMouse: true,
        			style: 'background: #fff',
        			renderer: function (storeItem, item) {
        				this.setHtml(storeItem.get('term')+': '+storeItem.get('rawFreq'));
        			}
        		},
        		renderer: function (sprite, config, rendererData, index) {
    				var store = rendererData.store;
    				var item = store.getAt(index);
    				var cluster = parseInt(item.get('cluster'), 10);
    				var app = this.getParent().up('scatterplot').getApplication();
    				var color = app.getColor(cluster);
    				// TODO config.radius
    				config.fillStyle = 'rgb('+color.join(',')+')'; 
    			}
        	}]
        }];
        
        this.on('boxready', function(panel) {
        	var size = Math.min(panel.getHeight(), panel.getWidth());
        	console.log(size);
        	this.down('#chart').setSize(size, size).redraw();
        }, this);
        
    	this.callParent(arguments);
    }
});