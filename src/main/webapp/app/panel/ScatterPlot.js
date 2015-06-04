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
    		target: undefined,
    		query: undefined
    	},
		glyph: 'xf06e@FontAwesome'
    },
    
    tokenFreqTipTemplate: null,
    docFreqTipTemplate: null,
    caStore: null,
    pcaStore: null,
    chartMenu: null,
    
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
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
        	layout: {
        		type: 'hbox',
        		align: 'stretch'
        	},
        	items: [{
        		itemId: 'terms',
        		xtype: 'grid',
        		flex: 1,
        		border: true,
        		columns: [{
        			text: this.localize('terms'),
    				dataIndex: 'term',
    				flex: 1,
                    sortable: true
    			},{
    				text: this.localize('rawFreq'),
    				dataIndex: 'rawFreq',
    				width: 'autoSize',
                    sortable: true
    			},{
    				text: this.localize('relFreq'),
    				dataIndex: 'relativeFreq',
    				width: 'autoSize',
                    sortable: true,
                    hidden: true
    			}],
    			selModel: Ext.create('Ext.selection.RowModel', {
                    listeners: {
                        selectionchange: {
                        	fn: function(sm, selections) {
//                        		this.getApplication().dispatchEvent('corpusTermsClicked', this, selections);
                        		var term = selections[0].get('term');
                        		this.selectTerm(term);
                        	},
                        	scope: this
                        }
                    },
                    mode: 'SINGLE'
                }),
        		store: Ext.create('Ext.data.JsonStore', {
            		fields: [
             		    {name: 'term'},
             		    {name: 'rawFreq', type: 'int'},
             		    {name: 'relativeFreq', type: 'number'},
             		    {name: 'coordinates', mapping : 'vector'}
             		],
             		sorters: [{property: 'rawFreq', direction: 'DESC'}]
                 })
        	}],
        	tbar: [{
        		text: this.localize('analysis'),
        		itemId: 'analysis',
    			menu: {
					items: [
					    {text: this.localize('pca'), itemId: 'analysis_pca', group:'analysis', xtype: 'menucheckitem'},
					    {text: this.localize('ca'), itemId: 'analysis_ca', group:'analysis', xtype: 'menucheckitem'}
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
        		itemId: 'freqType',
        		disabled: true,
        		menu: {
        			items: [
        			    {text: this.localize('rawFreq'), itemId: 'freqType_raw', group:'freqType', xtype: 'menucheckitem'},
        			    {text: this.localize('relFreq'), itemId: 'freqType_relative', group:'freqType', xtype: 'menucheckitem'}
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
        		itemId: 'limit',
        		menu: {
        			items: [
        			    {text: '10', itemId: 'limit_10', group: 'terms', xtype: 'menucheckitem'},
        			    {text: '20', itemId: 'limit_20', group: 'terms', xtype: 'menucheckitem'},
	        			{text: '30', itemId: 'limit_30', group: 'terms', xtype: 'menucheckitem'},
	        			{text: '40', itemId: 'limit_40', group: 'terms', xtype: 'menucheckitem'},
	        			{text: '50', itemId: 'limit_50', group: 'terms', xtype: 'menucheckitem'},
	        			{text: '60', itemId: 'limit_60', group: 'terms', xtype: 'menucheckitem'},
	        			{text: '70', itemId: 'limit_70', group: 'terms', xtype: 'menucheckitem'},
	        			{text: '80', itemId: 'limit_80', group: 'terms', xtype: 'menucheckitem'},
	        			{text: '90', itemId: 'limit_90', group: 'terms', xtype: 'menucheckitem'},
	        			{text: '100', itemId: 'limit_100', group: 'terms', xtype: 'menucheckitem'}
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
        		itemId: 'clusters',
        		menu: {
        			items: [
        			    {text: '1', itemId: 'clusters_1', group: 'clusters', xtype: 'menucheckitem'},
        			    {text: '2', itemId: 'clusters_2', group: 'clusters', xtype: 'menucheckitem'},
        			    {text: '3', itemId: 'clusters_3', group: 'clusters', xtype: 'menucheckitem'},
        			    {text: '4', itemId: 'clusters_4', group: 'clusters', xtype: 'menucheckitem'},
        			    {text: '5', itemId: 'clusters_5', group: 'clusters', xtype: 'menucheckitem'}
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
    		function setCheckItemFromApi(apiParamName) {
    			var value = this.getApiParam(apiParamName);
    			var menu = this.getDockedItems('toolbar')[0].down('#'+apiParamName);
    			menu.down('#'+apiParamName+'_'+value).setChecked(true);
    		}
    		var setCheckBound = setCheckItemFromApi.bind(this);
    		setCheckBound('analysis');
    		setCheckBound('freqType');
    		setCheckBound('limit');
    		setCheckBound('clusters');
    		
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
        
        var termStore = this.queryById('terms').getStore();
        
        var data = [];
        tokens.forEach(function(token) {
        	var freq = token.get('rawFreq');
        	var isDoc = token.get('category') === 'part';
        	if (!isDoc) {
	        	if (freq > maxFreq) maxFreq = freq;
	        	if (freq < minFreq) minFreq = freq;
	        	
	        	if (termStore.findExact('term', token.get('term') === -1)) {
	        		termStore.addSorted(token);
	        	}
        	}
        	var tokenData = {term: token.get('term'), rawFreq: freq, relativeFreq: token.get('relativeFreq'), cluster: token.get('cluster'), x: token.get('vector')[0], y: token.get('vector')[1]};
        	tokenData.isDoc = isDoc;
        	data.push(tokenData);
        }, this);
        
    	var newStore = Ext.create('Ext.data.JsonStore', {
    		fields: ['term', 'x', 'y', 'rawFreq', 'cluster', 'isDoc'],
    		data: data
    	});
    	
    	var config = {
        	itemId: 'chart',
        	xtype: 'cartesian',
        	width: '50%',
        	store: newStore,
        	interactions: ['panzoom','itemhighlight'],
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
    				var clusterIndex = item.get('cluster');
    				var scatterplot = this.getParent().up('scatterplot');
    				
    				if (clusterIndex === -1) {
    					// no clusters were specified in initial call
    					clusterIndex = 0;
    				}
    				
    				var color = scatterplot.getApplication().getColor(clusterIndex);
    				config.fillStyle = 'rgba('+color.join(',')+',0.5)';
    				config.strokeStyle = 'rgba('+color.join(',')+',1)';
    				
    				var freq = item.get('rawFreq');
    				var radius;
    				if (item.get('isDoc')) {
    					radius = 5;
    				} else {
    					radius = scatterplot.interpolate(freq, minFreq, maxFreq, 2, 20);
    				}
    				config.radius = radius;
    			}
        	}],
        	listeners: {
        		itemclick: function(chart, item, event) {
        			var data = item.record.data;
        			var record = Ext.create('Voyant.data.model.CorpusTerm', data);
            		this.getApplication().dispatchEvent('corpusTermsClicked', this, [record]);
        		},
        		render: function(chart) {
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
			            				var terms = this.getCurrentTerms();
										this.setApiParams({limit: limit, target: chartItem.record.get('term'), query: terms});
										this.loadFromApis();
										this.setApiParam('target', undefined);
			            			}
		            			}
		            		}, this, {single: true});
		            		this.chartMenu.showAt(xy);
		            	}
		            }, this);
        		},
        		scope: this
        	}
        };
    	
    	var chart = Ext.create('Ext.chart.CartesianChart', config);
    	this.insert(0, chart);
    },
    
    selectTerm: function(term) {
    	var series = this.down('chart').getSeries()[0];
    	var index = series.getStore().findExact('term', term);
    	if (index !== -1) {
    		var record = series.getStore().getAt(index);
    		var sprite = series.getSprites()[0];
    		// constructing series item, like in the chart series source
    		var item = {
				series: series,
                category: series.getItemInstancing() ? 'items' : 'markers',
                index: index,
                record: record,
                field: series.getYField(),
                sprite: sprite
    		};
    		
    		series.setHighlightItem(item);
    	}
    },
    
    getCurrentTerms: function() {
    	var terms = [];
    	var store = this.queryById('chart').getStore();
    	store.each(function(item) {
    		if (!item.get('isDoc')) {
    			terms.push(item.get('term'));
    		}
    	});
    	return terms;
    },
    
    loadFromApis: function() {
    	var params = {};
    	Ext.apply(params, this.getApiParams());
    	delete params.stopList;
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