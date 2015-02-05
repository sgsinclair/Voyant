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
    		helpTip: {en: "<p>ScatterPlot displays the correspondance of word use in a corpus. This visualization relies on a statistical analysis that takes the word’s correspondance from each document (where each document represents a dimension) and reduces it to a three dimensional space to easily visualize the data through a scatterplot.</p>"},
    		freqTip: {en: '<b>{0}</b><br/><b>Raw Frequency</b><br/>{1}</b><br/><b>Relative Frequency</b><br/>{2}</b>'}
    	},
    	api: {
    		stopList: 'auto'
    	},
		glyph: 'xf06e@FontAwesome'
    },
    
    layout: 'center',
    
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
        
        var maxFreq = 0;
        var minFreq = 100000000;
        
        var data = [];
        tokens.forEach(function(token) {
        	var freq = token.get('rawFreq');
        	if (freq > maxFreq) maxFreq = freq;
        	if (freq < minFreq) minFreq = freq;
        	data.push({term: token.get('term'), rawFreq: freq, relativeFreq: token.get('relativeFreq'), cluster: token.get('cluster'), x: token.get('vector')[0], y: token.get('vector')[1]});
        });
        
    	var store = Ext.create('Ext.data.JsonStore', {
    		fields: ['term', 'x', 'y', 'rawFreq', 'cluster'],
    		data: data
    	});
        
    	var freqTipTemplate = new Ext.Template(this.localize('freqTip'));
    	
        this.items = [{
        	itemId: 'chart',
        	xtype: 'cartesian',
        	store: store,
        	interactions: ['crosszoom','itemhighlight'],
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
        				this.setHtml(freqTipTemplate.apply([storeItem.get('term'),storeItem.get('rawFreq'),storeItem.get('relativeFreq')]));
        			}
        		},
        		renderer: function (sprite, config, rendererData, index) {
    				var store = rendererData.store;
    				var item = store.getAt(index);
    				var clusterIndex = parseInt(item.get('cluster'), 10);
    				var scatterplot = this.getParent().up('scatterplot');
    				
    				var color = scatterplot.getApplication().getColor(clusterIndex);
    				config.fillStyle = 'rgba('+color.join(',')+',0.5)';
    				config.strokeStyle = 'rgba('+color.join(',')+',1)';
    				
    				var freq = parseInt(item.get('rawFreq'), 10);
    				var radius = scatterplot.interpolate(freq, minFreq, maxFreq, 2, 20);
    				config.radius = radius;
    			}
        	}]
        }];
        
        this.on('boxready', function(panel) {
        	// TODO move this to a layout function (placing in afterlayout causes infinite loop)
        	var size = Math.min(panel.body.getHeight(), panel.body.getWidth());
        	this.down('#chart').setSize(size, size).redraw();
        	
        	this.down('#chart').body.on('click', function(event, target) {
            	var xy = event.getXY();
            	var parentXY = Ext.fly(target).getXY();
            	var x = xy[0] - parentXY[0];
            	var y = xy[1] - parentXY[1];
            	var item = this.down('#chart').getItemForPoint(x,y);
            	if (item != null) {
            		var data = item.record.data;
            		var record = Ext.create('Voyant.data.model.CorpusTerm', data);
            		this.getApplication().dispatchEvent('corpusTermsClicked', this, [record]);
            	}
            }, this);
        }, this);
        
    	this.callParent(arguments);
    },
    
    interpolate: function(lambda, minSrc, maxSrc, minDst, maxDst) {
        return minDst + (maxDst - minDst) * Math.max(0, Math.min(1, (lambda - minSrc) / (maxSrc - minSrc)));
    }
});