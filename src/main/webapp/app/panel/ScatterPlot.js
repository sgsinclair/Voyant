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
    		analysis: {en: "Analysis"},
    		ca: {en: "Correspondence Analysis"},
    		pca: {en: "Principal Components Analysis"},
    		freqType: {en: "Frequency Type"},
    		rawFreq: {en: "Raw Frequency"},
    		relFreq: {en: "Relative Frequency"},
    		terms: {en: "Terms"},
    		clusters: {en: "Clusters"},
    		helpTip: {en: "<p>ScatterPlot displays the correspondance of word use in a corpus. This visualization relies on a statistical analysis that takes the word’s correspondance from each document (where each document represents a dimension) and reduces it to a three dimensional space to easily visualize the data through a scatterplot.</p>"},
    		freqTip: {en: '<b>{0}</b><br/><b>Raw Frequency</b><br/>{1}</b><br/><b>Relative Frequency</b><br/>{2}</b>'}
    	},
    	api: {
    		analysis: 'ca',
    		limit: 50,
    		dimensions: 3,
    		bins: 10,
    		clusters: 3,
    		freqType: 'raw',
    		stopList: 'auto'
    	},
		glyph: 'xf06e@FontAwesome'
    },
    
    freqTipTemplate: null,
    
    layout: 'center',
    
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
        var store = Ext.create("Voyant.data.store.StatisticalAnalysis");
        
        var analysis = 'ca';//this.getApiParam('analysis');
        var numTerms = 20;//this.getApiParam('limit');
        var freqType = 'raw';//this.getApiParam('freqType');
        var clusters = 3;//this.getApiParam('clusters');
        
        Ext.apply(this, {
        	title: this.localize('title'),
        	store: store,
        	tbar: [{
        		text: this.localize('analysis'),
        		disabled: true,
    			menu: {
					items: [
					    {text: this.localize('pca'), checked:analysis==='pca', group:'analysis', xtype: 'menucheckitem'},
					    {text: this.localize('ca'), checked:analysis==='ca', group:'analysis', xtype: 'menucheckitem'}
					],
					listeners: {
						click: function(menu, item) {
							if (item !== undefined) {
								if (item.text === this.localize('pca')) {
									this.setApiParam('analysis', 'pca');
								} else {
									this.setApiParam('analysis', 'ca');
									if (this.getCorpus().getSize() == 3) {
	//									this.setApiParam('dimensions', 2);
	//									this.dimsButton.menu.items.get(0).setChecked(true); // need 1-2 docs or 4+ docs for 3 dimensions
									}
								}
								this.loadFromApis();
							}
						},
						scope: this
					}
    			}
        	},{
        		text: this.localize('freqType'),
        		disabled: true,
        		menu: {
        			items: [
        			    {text: this.localize('rawFreq'), checked:freqType==='raw', group:'freqType', xtype: 'menucheckitem'},
        			    {text: this.localize('relFreq'), checked:freqType==='relative', group:'freqType', xtype: 'menucheckitem'}
        			],
					listeners: {
						click: function(menu, item) {
							if (item !== undefined) {
								if (item.text === this.localize('rawFreq')) {
									this.setApiParam('freqType', 'raw');
								} else {
									this.setApiParam('freqType', 'relative');
								}
								this.loadFromApis();
							}
						},
						scope: this
					}
        		}
        	},{
        		text: this.localize('terms'),
        		menu: {
        			items: [
        			    {text: '10', checked:numTerms===10, group: 'terms', xtype: 'menucheckitem'},
        			    {text: '20', checked:numTerms===20, group: 'terms', xtype: 'menucheckitem'},
	        			{text: '30', checked:numTerms===30, group: 'terms', xtype: 'menucheckitem'},
	        			{text: '40', checked:numTerms===40, group: 'terms', xtype: 'menucheckitem'},
	        			{text: '50', checked:numTerms===50, group: 'terms', xtype: 'menucheckitem'},
	        			{text: '60', checked:numTerms===60, group: 'terms', xtype: 'menucheckitem'},
	        			{text: '70', checked:numTerms===70, group: 'terms', xtype: 'menucheckitem'},
	        			{text: '80', checked:numTerms===80, group: 'terms', xtype: 'menucheckitem'},
	        			{text: '90', checked:numTerms===90, group: 'terms', xtype: 'menucheckitem'},
	        			{text: '100', checked:numTerms===100, group: 'terms', xtype: 'menucheckitem'}
        			],
					listeners: {
						click: function(menu, item) {
							if (item !== undefined) {
								this.setApiParam('limit', parseInt(item.text));
								this.loadFromApis();
							}
						},
						scope: this
					}
        		}
        	},{
        		text: this.localize('clusters'),
        		menu: {
        			items: [
        			    {text: '1', checked:clusters===1, group: 'clusters', xtype: 'menucheckitem'},
        			    {text: '2', checked:clusters===2, group: 'clusters', xtype: 'menucheckitem'},
        			    {text: '3', checked:clusters===3, group: 'clusters', xtype: 'menucheckitem'},
        			    {text: '4', checked:clusters===4, group: 'clusters', xtype: 'menucheckitem'},
        			    {text: '5', checked:clusters===5, group: 'clusters', xtype: 'menucheckitem'}
        			],
					listeners: {
						click: function(menu, item) {
							if (item !== undefined) {
								this.setApiParam('clusters', parseInt(item.text));
								this.loadFromApis();
							}
						},
						scope: this
					}
        		}
        	}]
        });
        
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		this.store.setCorpus(corpus);
    		this.loadFromApis();
    	}, this);
        
        this.store.on('load', function(store, records) {
        	this.buildChart(store);
        }, this);
        
    	this.freqTipTemplate = new Ext.Template(this.localize('freqTip'));
        
        this.on('add', function(panel) {
        	// TODO move this to a layout function (placing in afterlayout causes infinite loop)
        	var chart = this.down('#chart');
        	if (chart !== null) {
	        	var size = Math.min(panel.body.getHeight(), panel.body.getWidth());
	        	chart.setSize(size, size).redraw();
	        	
//	        	chart.body.on('click', function(event, target) {
//	            	var xy = event.getXY();
//	            	var parentXY = Ext.fly(target).getXY();
//	            	var x = xy[0] - parentXY[0];
//	            	var y = xy[1] - parentXY[1];
//	            	var item = this.down('#chart').getItemForPoint(x,y);
//	            	if (item != null) {
//	            		var data = item.record.data;
//	            		var record = Ext.create('Voyant.data.model.CorpusTerm', data);
//	            		this.getApplication().dispatchEvent('corpusTermsClicked', this, [record]);
//	            	}
//	            }, this);
        	}
        }, this);
        
    	this.callParent(arguments);
    },
    
    buildChart: function(store) {
    	var that = this; // needed for tooltip renderer
    	
    	var oldChart = this.queryById('chart');
    	if (oldChart !== null) {
    		oldChart.remove();
    	}
    	
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
        	data.push({term: token.get('@term'), rawFreq: freq, relativeFreq: token.get('@relativeFreq'), cluster: token.get('@cluster'), x: token.get('vector')[0], y: token.get('vector')[1]});
        });
        
    	var newStore = Ext.create('Ext.data.JsonStore', {
    		fields: ['term', 'x', 'y', 'rawFreq', 'cluster'],
    		data: data
    	});
    	
    	var config = {
        	itemId: 'chart',
        	xtype: 'cartesian',
        	store: newStore,
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
        				this.setHtml(that.freqTipTemplate.apply([storeItem.get('term'),storeItem.get('rawFreq'),storeItem.get('relativeFreq')]));
        			}
        		},
        		renderer: function (sprite, config, rendererData, index) {
    				var store = rendererData.store;
    				var item = store.getAt(index);
    				var clusterIndex = parseInt(item.get('cluster'), 10);
    				var scatterplot = this.getParent().up('scatterplot');
    				
    				if (clusterIndex === -1) {
    					// no clusters were specified in initial call
    					clusterIndex = 0;
    				}
    				
    				var color = scatterplot.getApplication().getColor(clusterIndex);
    				config.fillStyle = 'rgba('+color.join(',')+',0.5)';
    				config.strokeStyle = 'rgba('+color.join(',')+',1)';
    				
    				var freq = parseInt(item.get('rawFreq'), 10);
    				var radius = scatterplot.interpolate(freq, minFreq, maxFreq, 2, 20);
    				config.radius = radius;
    			}
        	}]
        };
    	
    	var chart = Ext.create("Ext.chart.CartesianChart", config);
    	this.add(chart);
    },
    
    loadFromApis: function() {
    	var params = {};
    	Ext.apply(params, this.getApiParams());
    	this.store.load({
    		params: params
    	});
    },
    
    interpolate: function(lambda, minSrc, maxSrc, minDst, maxDst) {
        return minDst + (maxDst - minDst) * Math.max(0, Math.min(1, (lambda - minSrc) / (maxSrc - minSrc)));
    }
});