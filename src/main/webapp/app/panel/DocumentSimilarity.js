Ext.define('Voyant.panel.DocumentSimilarity', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	requires: ['Ext.chart.CartesianChart'],
	alias: 'widget.documentsimilarity',
	config: {
		corpus: undefined,
		options: {
    		xtype: 'stoplistoption'
    	}
	},
    statics: {
    	i18n: {
			title: {en: "Document Similarity"},
			loading: {en: "Loading"},
			helpTip: {en: ""},
			tokenFreqTip: {en: '<b>{0}</b><br/><b>Raw Frequency</b><br/>{1}</b><br/><b>Relative Frequency</b><br/>{2}</b>'},
			docFreqTip: {en: '<b>{0}</b><br/><b>Word Count</b><br/>{1}</b>'},
			noTermSelected: {en: "No term selected."}
    	},
    	api: {
    		limit: 50,
    		dimensions: 3,
    		clusters: 3,
    		stopList: 'auto',
    		docId: undefined
    	},
		glyph: 'xf06e@FontAwesome'
    },
    
    tokenFreqTipTemplate: null,
    docFreqTipTemplate: null,
    chartMenu: null,
    labelsMode: 0, // 0 all labels, 1 word labels, 2 no labels
    
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
        Ext.apply(this, {
        	title: this.localize('title'),
        	docSimStore: Ext.create('Voyant.data.store.DocSimAnalysis'),
        	autoDestroy: true,
        	layout: 'fit',
    		items: {
    			layout: 'fit',
        		itemId: 'chartParent'
    		},
    		bbar: new Ext.Toolbar({
    			items: [{
	            	xtype: 'documentselectorbutton'
	            }]
    		})
        });
        
    	this.on('loadedCorpus', function(src, corpus) {
    		this.setCorpus(corpus);
    		this.docSimStore.setCorpus(corpus);
    		this.loadFromApis();
    	}, this);
    	
    	this.on('documentsSelected', function(src, docIds) {
    		this.setApiParam('docId', docIds);
    		this.loadFromApis();
    	}, this);

        this.docSimStore.on('load', function(store, records) {
        	this.buildChart(store);
        }, this);
        
    	this.tokenFreqTipTemplate = new Ext.Template(this.localize('tokenFreqTip'));
    	this.docFreqTipTemplate = new Ext.Template(this.localize('docFreqTip'));
        
    	this.callParent(arguments);
    },
    
    buildChart: function(store) {
    	var that = this; // needed for tooltip renderer
    	
    	var oldChart = this.queryById('chart');
    	if (oldChart !== null) {
    		this.queryById('chartParent').remove(oldChart);
    	}
    	
    	var rec = store.getAt(0);
        var numDims = 3;//this.getApiParam('dimensions');
        
        var maxFreq = 0;
        var minFreq = Number.MAX_VALUE;
        var maxFill = 0;
        var minFill = Number.MAX_VALUE;
        
        var tokens = rec.getTokens();
        var termData = [];
        var docData = [];
        tokens.forEach(function(token) {
        	var freq = token.get('rawFreq');
        	var isDoc = token.get('category') === 'part';
        	if (!isDoc) {
	        	if (freq > maxFreq) maxFreq = freq;
	        	if (freq < minFreq) minFreq = freq;
        	}
        	if (numDims === 3) {
				var z = token.get('vector')[2];
				if (z < minFill) minFill = z;
				if (z > maxFill) maxFill = z;
			}
        	var tokenData = {term: token.get('term'), rawFreq: freq, relativeFreq: token.get('relativeFreq'), cluster: token.get('cluster'), x: token.get('vector')[0], y: token.get('vector')[1], z: token.get('vector')[2], isDoc: isDoc};
        	if (isDoc) {
        		tokenData.docIndex = token.get('docIndex');
        		var doc = this.getCorpus().getDocument(tokenData.docIndex);
        		tokenData.term = doc.getTinyTitle();
        		tokenData.title = doc.getTitle();
        		docData.push(tokenData);
        	} else {
        		termData.push(tokenData);
        	}
        }, this);
        
    	var termSeriesStore = Ext.create('Ext.data.JsonStore', {
    		fields: ['term', 'x', 'y', 'z', 'rawFreq', 'relativeFreq', 'cluster', 'isDoc', 'docIndex'],
    		data: termData
    	});
    	var docSeriesStore = Ext.create('Ext.data.JsonStore', {
    		fields: ['term', 'x', 'y', 'z', 'rawFreq', 'relativeFreq', 'cluster', 'isDoc', 'docIndex'],
    		data: docData
    	});
    	
    	var config = {
        	itemId: 'chart',
        	xtype: 'cartesian',
        	interactions: ['crosszoom','panzoom','itemhighlight'],
        	plugins: {
                ptype: 'chartitemevents'
            },
        	axes: [{
        		type: 'numeric',
        		position: 'bottom',
        		fields: ['x']
        	},{
        		type: 'numeric',
        		position: 'left',
        		fields: ['y']
        	}],
        	innerPadding: {top: 25, right: 25, bottom: 25, left: 25},
        	series: [{
        		type: 'customScatter',
        		xField: 'x',
        		yField: 'y',
        		store: termSeriesStore,
        		tooltip: {
        			trackMouse: true,
        			style: 'background: #fff',
        			renderer: function (storeItem, item) {
        				this.setHtml(that.tokenFreqTipTemplate.apply([storeItem.get('term'),storeItem.get('rawFreq'),storeItem.get('relativeFreq')]));
        			}
        		},
        		marker: {
        		    type: 'circle'
        		},
        		highlight: {
        			fillStyle: 'yellow',
                    strokeStyle: 'black'
        		},
        		renderer: function (sprite, config, rendererData, index) {
    				var store = rendererData.store;
    				var item = store.getAt(index);
    				if (item !== null) {
	    				var clusterIndex = item.get('cluster');
	    				var scatterplot = this.getParent().up('documentsimilarity');
	    				
	    				if (clusterIndex === -1) {
	    					// no clusters were specified in initial call
	    					clusterIndex = 0;
	    				}
	    				
	    				var a = 0.65;
	    				if (numDims === 3) {
	    					a = scatterplot.interpolate(item.get('z'), minFill, maxFill, 0, 1);
	    				}
	    				var color = scatterplot.getApplication().getColor(clusterIndex);
	    				config.fillStyle = 'rgba('+color.join(',')+','+a+')';
	    				config.strokeStyle = 'rgba('+color.join(',')+',1)';
	    				
	    				var freq = item.get('rawFreq');
	    				var radius = scatterplot.interpolate(freq, minFreq, maxFreq, 2, 20);
	    				config.radius = radius;
    				}
    			}
        	},{
        		type: 'customScatter',
        		xField: 'x',
        		yField: 'y',
        		store: docSeriesStore,
        		tooltip: {
        			trackMouse: true,
        			style: 'background: #fff',
        			renderer: function (storeItem, item) {
        				this.setHtml(that.docFreqTipTemplate.apply([storeItem.get('title'),storeItem.get('rawFreq')]));
        			}
        		},
        		marker: {
        		    type: 'diamond'
        		},
        		highlight: {
        			fillStyle: 'yellow',
                    strokeStyle: 'black'
        		},
        		renderer: function (sprite, config, rendererData, index) {
    				var store = rendererData.store;
    				var item = store.getAt(index);
    				if (item !== null) {
	    				var clusterIndex = item.get('cluster');
	    				var scatterplot = this.getParent().up('documentsimilarity');
	    				
	    				if (clusterIndex === -1) {
	    					// no clusters were specified in initial call
	    					clusterIndex = 0;
	    				}
	    				
	    				var a = 0.65;
	    				if (numDims === 3) {
	    					a = scatterplot.interpolate(item.get('z'), minFill, maxFill, 0, 1);
	    				}
	    				var color = scatterplot.getApplication().getColor(6);
	    				config.fillStyle = 'rgba('+color.join(',')+','+a+')';
	    				config.strokeStyle = 'rgba('+color.join(',')+',1)';

	    				config.radius = 5;
    				}
    			}
        	}],
        	listeners: {
        		itemclick: function(chart, item, event) {
        			var data = item.record.data;
        			if (data.isDoc) {
        				var record = this.getCorpus().getDocument(data.docIndex);
	            		this.getApplication().dispatchEvent('documentsClicked', this, [record]);
        			} else {
	        			var record = Ext.create('Voyant.data.model.CorpusTerm', data);
	            		this.getApplication().dispatchEvent('corpusTermsClicked', this, [record]);
        			}
        		},
        		scope: this
        	}
        };
    	
    	config.series[0].label = {
			field: 'term',
			display: 'over'
		};
		config.series[1].label = {
			field: 'term',
			display: 'over'
		};
    	
    	var chart = Ext.create('Ext.chart.CartesianChart', config);
    	this.queryById('chartParent').insert(0, chart);
    },
    
    loadFromApis: function(keepCurrentTerms) {
    	var chart = this.down('#chart');
    	if (chart !== null) {
    		chart.mask(this.localize('loading'));
    	}
    	var params = {};
    	Ext.apply(params, this.getApiParams());
    	this.docSimStore.load({
			params: params
		});
    },
    
    interpolate: function(lambda, minSrc, maxSrc, minDst, maxDst) {
        return minDst + (maxDst - minDst) * Math.max(0, Math.min(1, (lambda - minSrc) / (maxSrc - minSrc)));
    }
});

/**
 * Adds tool tip disabling.
 */
Ext.define('Ext.chart.series.CustomScatter', {
	extend: 'Ext.chart.series.Scatter',
	
	alias: 'series.customScatter',
    type: 'customScatter',
    seriesType: 'scatterSeries',
	
	tipsDisabled: false,
	
	enableToolTips: function() {
		this.tipsDisabled = false;
	},
	
	disableToolTips: function() {
		this.tipsDisabled = true;
	},
	
    showTip: function (item, xy) {
    	if (this.tipsDisabled) {
    		return;
    	}
    	
    	this.callParent(arguments);
    }
});