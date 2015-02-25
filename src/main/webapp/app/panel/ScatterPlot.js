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
    		remove: {en: "Remove"},
    		nearby: {en: "Nearby"},
    		helpTip: {en: "<p>ScatterPlot displays the correspondance of word use in a corpus. This visualization relies on a statistical analysis that takes the word’s correspondance from each document (where each document represents a dimension) and reduces it to a three dimensional space to easily visualize the data through a scatterplot.</p>"},
    		tokenFreqTip: {en: '<b>{0}</b><br/><b>Raw Frequency</b><br/>{1}</b><br/><b>Relative Frequency</b><br/>{2}</b>'},
    		docFreqTip: {en: '<b>{0}</b><br/><b>Word Count</b><br/>{1}</b>'}
    	},
    	api: {
    		analysis: 'ca',
    		limit: 50,
    		dimensions: 3,
    		bins: 10,
    		clusters: 3,
    		freqType: 'raw',
    		stopList: 'auto',
    		target: undefined
    	},
		glyph: 'xf06e@FontAwesome'
    },
    
    tokenFreqTipTemplate: null,
    docFreqTipTemplate: null,
    
    caStore: null,
    pcaStore: null,
    
    chartMenu: null,
    
    layout: 'center',
    
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
        var analysis = 'ca';//this.getApiParam('analysis');
        var numTerms = 50;//this.getApiParam('limit');
        var freqType = 'raw';//this.getApiParam('freqType');
        var clusters = 3;//this.getApiParam('clusters');
        
        Ext.apply(this, {
        	title: this.localize('title'),
        	caStore: Ext.create('Voyant.data.store.CAAnalysis'),
        	pcaStore: Ext.create('Voyant.data.store.PCAAnalysis'),
        	chartMenu: Ext.create('Ext.menu.Menu', {
        		items: [
        			//{text: this.localize('remove')},
        			{text: this.localize('nearby')}
        		]
        	}),
        	tbar: [{
        		text: this.localize('analysis'),
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
									if (this.getCorpus().getDocumentsCount() == 3) {
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
    		this.setCorpus(corpus);
    		this.caStore.setCorpus(corpus);
    		this.pcaStore.setCorpus(corpus);
    		this.loadFromApis();
    	}, this);
        
        this.caStore.on('load', function(store, records) {
        	this.buildChart(store);
        }, this);
        this.pcaStore.on('load', function(store, records) {
        	this.buildChart(store);
        }, this);
        
    	this.tokenFreqTipTemplate = new Ext.Template(this.localize('tokenFreqTip'));
    	this.docFreqTipTemplate = new Ext.Template(this.localize('docFreqTip'));
        
        this.on('add', function(panel) {
        	var chart = this.down('#chart');
        	if (chart !== null) {
	        	var size = Math.min(panel.body.getHeight(), panel.body.getWidth());
	        	// TODO set chart size after parent resize, without trigger infinite layout loop
	        	chart.setSize(size, size).redraw();
	        	
	        	chart.on('render', function(chart) {
	        		chart.body.on('click', function(event, target) {
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
	        		chart.body.on('contextmenu', function(event, target) {
	        			event.preventDefault();
	        			
		            	var xy = event.getXY();
		            	var parentXY = Ext.fly(target).getXY();
		            	var x = xy[0] - parentXY[0];
		            	var y = xy[1] - parentXY[1];
		            	var chartItem = this.down('#chart').getItemForPoint(x,y);
		            	if (chartItem != null) {
		            		this.chartMenu.on('click', function(menu, item) {
		            			if (item !== undefined) {
			            			if (item.text === this.localize('remove')) {
			            				
			            			} else {
			            				var limit = Math.max(2000, Math.round(this.getCorpus().getWordTokensCount() / 100));
										this.setApiParams({limit: limit, target: chartItem.record.get('term')});
										this.loadFromApis();
										this.setApiParam('target', undefined);
			            			}
		            			}
		            		}, this, {single: true});
		            		this.chartMenu.showAt(xy);
		            	}
		            }, this);
	        	}, this);
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
//        var dimensions = rec.getDimensions();
        
        var maxFreq = 0;
        var minFreq = Number.MAX_VALUE;
        
        var data = [];
        tokens.forEach(function(token) {
        	var freq = parseInt(token.get('@rawFreq'), 10);
        	var isDoc = token.get('@category') === 'part';
        	if (!isDoc) {
	        	if (freq > maxFreq) maxFreq = freq;
	        	if (freq < minFreq) minFreq = freq;
        	}
        	var tokenData = {term: token.get('@term'), rawFreq: freq, relativeFreq: token.get('@relativeFreq'), cluster: token.get('@cluster'), x: token.get('vector')[0], y: token.get('vector')[1]};
        	tokenData.isDoc = isDoc;
        	data.push(tokenData);
        });
        
    	var newStore = Ext.create('Ext.data.JsonStore', {
    		fields: ['term', 'x', 'y', 'rawFreq', 'cluster', 'isDoc'],
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
        				if (storeItem.get('isDoc')) {
        					this.setHtml(that.docFreqTipTemplate.apply([storeItem.get('term'),storeItem.get('rawFreq')]));
        				} else {
        					this.setHtml(that.tokenFreqTipTemplate.apply([storeItem.get('term'),storeItem.get('rawFreq'),storeItem.get('relativeFreq')]));
        				}
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
    				
    				var freq = item.get('rawFreq');
    				var radius = scatterplot.interpolate(freq, minFreq, maxFreq, 2, 20);
    				config.radius = radius;
    			}
        	}]
        };
    	
    	var chart = Ext.create('Ext.chart.CartesianChart', config);
    	this.add(chart);
    },
    
    loadFromApis: function() {
    	var params = {};
    	Ext.apply(params, this.getApiParams());
    	if (params.analysis === 'pca') {
    		this.pcaStore.load({
	    		params: params
	    	});
    	} else {
	    	this.caStore.load({
	    		params: params
	    	});
    	}
    },
    
    interpolate: function(lambda, minSrc, maxSrc, minDst, maxDst) {
        return minDst + (maxDst - minDst) * Math.max(0, Math.min(1, (lambda - minSrc) / (maxSrc - minSrc)));
    }
});