Ext.define('Voyant.panel.ScatterPlot', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	requires: ['Ext.chart.CartesianChart'],
	alias: 'widget.scatterplot',
	config: {
		corpus: undefined,
		options: {
    		xtype: 'stoplistoption'
    	}
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
    		term: {en: "Term"},
    		addTerm: {en: "Add Term"},
    		clusters: {en: "Clusters"},
    		dimensions: {en: "Dimensions"},
    		remove: {en: "Remove"},
    		removeTerm: {en: 'Remove <b>{0}</b>'},
    		nearby: {en: "Nearby"},
    		nearbyTerm: {en: 'Nearby <b>{0}</b>'},
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
    		stopList: undefined,
    		target: undefined,
    		query: undefined
    	},
		glyph: 'xf06e@FontAwesome'
    },
    
    tokenFreqTipTemplate: null,
    docFreqTipTemplate: null,
    caStore: null,
    pcaStore: null,
    termStore: Ext.create('Ext.data.JsonStore', {
		fields: [
			{name: 'term'},
			{name: 'rawFreq', type: 'int'},
			{name: 'relativeFreq', type: 'number'},
			{name: 'coordinates', mapping : 'vector'}
		],
		sorters: [{property: 'rawFreq', direction: 'DESC'}]
	}),
	newTerm: null,
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
        	termStore: this.termStore,
        	chartMenu: Ext.create('Ext.menu.Menu', {
        		items: [
        			{text: this.localize('remove'), itemId: 'remove'},
        			{text: this.localize('nearby'), itemId: 'nearby'}
        		],
        		listeners: {
        			hide: function() {
        				this.down('#chart').getSeries()[0].enableToolTips();
        			},
        			scope: this
        		}
        	}),
        	layout: 'border',
        	autoDestroy: true,
        	items: [{
        		itemId: 'chartParent',
        		region: 'center',
        		layout: 'fit',
        		tbar: [{
            		text: this.localize('analysis'),
            		itemId: 'analysis',
            		glyph: 'xf1ec@FontAwesome',
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
            	},
//            	{
//            		text: this.localize('freqType'),
//            		itemId: 'freqType',
//            		disabled: true,
//            		menu: {
//            			items: [
//            			    {text: this.localize('rawFreq'), itemId: 'freqType_raw', group:'freqType', xtype: 'menucheckitem'},
//            			    {text: this.localize('relFreq'), itemId: 'freqType_relative', group:'freqType', xtype: 'menucheckitem'}
//            			],
//    					listeners: {
//    						click: function(menu, item) {
//    							if (item !== undefined) {
//    								if (item.text === this.localize('rawFreq')) {
//    									this.setApiParam('freqType', 'raw');
//    								} else {
//    									this.setApiParam('freqType', 'relative');
//    								}
//    								this.loadFromApis();
//    							}
//    						},
//    						scope: this
//    					}
//            		}
//            	},
            	{
            		text: this.localize('terms'),
            		itemId: 'limit',
            		glyph: 'xf0f6@FontAwesome',
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
            		glyph: 'xf192@FontAwesome',
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
            	},{
            		text: this.localize('dimensions'),
            		itemId: 'dimensions',
            		glyph: 'xf1b2@FontAwesome',
            		menu: {
            			items: [
            			    {text: '2', itemId: 'dimensions_2', group: 'dimensions', xtype: 'menucheckitem'},
            			    {text: '3', itemId: 'dimensions_3', group: 'dimensions', xtype: 'menucheckitem'}
            			],
    					listeners: {
    						click: function(menu, item) {
    							if (item !== undefined) {
    								this.setApiParam('dimensions', parseInt(item.text));
    								this.loadFromApis();
    							}
    						},
    						scope: this
    					}
            		}
            	}]
        	},{
        		itemId: 'terms',
        		xtype: 'grid',
        		title: 'Terms',
        		region: 'east',
        		width: '40%',
        		split: true,
        		collapsible: true,
        		border: true,
        		dockedItems: [{
                    dock: 'top',
                    xtype: 'toolbar',
                    items: [{
                        xtype: 'button',
                        text: this.localize('nearby'),
                        glyph: 'xf0b2@FontAwesome',
                        handler: function() {
                        	var sel = this.down('#terms').getSelection()[0];
                        	if (sel !== undefined) {
	                        	var term = sel.get('term');
	                        	this.getNearbyForTerm(term);
                        	}
                        },
                        scope: this
                    },{
                        xtype: 'button',
                        text: this.localize('remove'),
                        glyph: 'xf068@FontAwesome',
                        handler: function() {
                        	var sel = this.down('#terms').getSelection()[0];
                        	if (sel !== undefined) {
	                        	var term = sel.get('term');
	                        	this.removeTerm(term);
                        	}
                        },
                        scope: this
                    },{
                    	xtype: 'textfield',
                    	emptyText: this.localize('addTerm'),
                    	triggers: {
                            clear: {
                                weight: 0,
                                cls: Ext.baseCSSPrefix + 'form-clear-trigger',
                                hidden: true,
                                handler: function(){
                                    this.setValue('');
                                	this.findParentByType('panel').fireEvent('query', this, undefined);
                                    this.getTrigger('clear').hide();
                                    this.updateLayout();
                                }
                            },
                            search: {
                                weight: 1,
                                cls: Ext.baseCSSPrefix + 'form-search-trigger',
                                handler: function(){
                                    var value = this.getValue();
                                	this.findParentByType('panel').fireEvent('query', this, value);
                                	if (value) {
                                        this.getTrigger('clear').show();
                                	} else {
                                        this.getTrigger('clear').hide();
                                	}
                                    this.updateLayout();
                                }
                            }
                        },
                        listeners: {
                        	specialkey: function(field, event) {
                        		if (event.getKey() === event.ENTER) {
                                    this.triggers.search.onClick();
                                }
                        	}
                        }
                    }]
                }],
        		columns: [{
        			text: this.localize('term'),
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
                        		var sel = selections[0];
                        		if (sel !== undefined) {
	                        		var term = sel.get('term');
	                        		this.selectTerm(term);
                        		}
                        	},
                        	scope: this
                        }
                    },
                    mode: 'SINGLE'
                }),
        		store: this.termStore,
        		listeners: {
        			query: function(component, value) {
    					if (value !== undefined && this.termStore.findExact('term', value) === -1) {
	                		this.newTerm = value;
	                		this.loadFromApis();
    					} else {
    						this.newTerm = null;
    					}
        			},
        			scope: this
        		}
        	}]
        });
        
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		function setCheckItemFromApi(apiParamName) {
    			var value = this.getApiParam(apiParamName);
    			var menu = this.queryById('chartParent').getDockedItems('toolbar')[0].down('#'+apiParamName);
    			menu.down('#'+apiParamName+'_'+value).setChecked(true);
    		}
    		var setCheckBound = setCheckItemFromApi.bind(this);
    		setCheckBound('analysis');
    		setCheckBound('limit');
    		setCheckBound('clusters');
    		setCheckBound('dimensions');
    		
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
    		this.queryById('chartParent').remove(oldChart);
    	}
    	
    	var rec = store.getAt(0);
        var tokens = rec.getTokens();
//        var dimensions = rec.getDimensions();
        
        var maxFreq = 0;
        var minFreq = Number.MAX_VALUE;
        var maxFill = 0;
        var minFill = Number.MAX_VALUE;
        var dims = this.getApiParam('dimensions');
        
        if (this.newTerm !== null) {
        	// TODO highlight new term
        	this.newTerm = null;
        }
        
        var data = [];
        tokens.forEach(function(token) {
        	var freq = token.get('rawFreq');
        	var isDoc = token.get('category') === 'part';
        	if (!isDoc) {
	        	if (freq > maxFreq) maxFreq = freq;
	        	if (freq < minFreq) minFreq = freq;
	        	
	        	if (this.termStore.findExact('term', token.get('term') === -1)) {
	        		this.termStore.addSorted(token);
	        	}
        	}
        	if (dims === 3) {
				var z = token.get('vector')[2];
				if (z < minFill) minFill = z;
				if (z > maxFill) maxFill = z;
			}
        	var tokenData = {term: token.get('term'), rawFreq: freq, relativeFreq: token.get('relativeFreq'), cluster: token.get('cluster'), x: token.get('vector')[0], z: token.get('vector')[2], y: token.get('vector')[1]};
        	tokenData.isDoc = isDoc;
        	data.push(tokenData);
        }, this);
        
    	var newStore = Ext.create('Ext.data.JsonStore', {
    		fields: ['term', 'x', 'y', 'z', 'rawFreq', 'cluster', 'isDoc'],
    		data: data
    	});
    	
    	var config = {
        	itemId: 'chart',
        	xtype: 'cartesian',
        	store: newStore,
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
        	series: [{
        		type: 'customScatter',
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
    				if (item !== null) {
	    				var clusterIndex = item.get('cluster');
	    				var scatterplot = this.getParent().up('scatterplot');
	    				
	    				if (clusterIndex === -1) {
	    					// no clusters were specified in initial call
	    					clusterIndex = 0;
	    				}
	    				
	    				var a = 0.65;
	    				if (dims === 3) {
	    					a = scatterplot.interpolate(item.get('z'), minFill, maxFill, 0, 1);
	    				}
	    				var color = scatterplot.getApplication().getColor(clusterIndex);
	    				config.fillStyle = 'rgba('+color.join(',')+','+a+')';
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
		            		this.down('#chart').getSeries()[0].disableToolTips();
		            		
		            		var term = chartItem.record.get('term');
		            		
		            		var text = (new Ext.Template(this.localize('removeTerm'))).apply([term]);
		            		this.chartMenu.queryById('remove').setText(text);
		            		text = (new Ext.Template(this.localize('nearbyTerm'))).apply([term]);
		            		this.chartMenu.queryById('nearby').setText(text);
		            		
		            		this.chartMenu.on('click', function(menu, item) {
		            			if (item !== undefined) {
		            				var term = chartItem.record.get('term');
			            			if (item.text === this.localize('remove')) {
			            				this.removeTerm(term);
			            			} else {
			            				this.getNearbyForTerm(term);
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
    	this.queryById('chartParent').insert(0, chart);
    },
    
    selectTerm: function(term) {
    	var series = this.down('#chart').getSeries()[0];
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
    	this.termStore.each(function(r) {
    		if (!r.get('isDoc')) {
    			terms.push(r.get('term'));
    		}
    	});
    	return terms;
    },
    
    getNearbyForTerm: function(term) {
    	var limit = Math.max(2000, Math.round(this.getCorpus().getWordTokensCount() / 100));
		this.setApiParams({limit: limit, target: term});
		this.loadFromApis();
		this.setApiParam('target', undefined);
    },
    
    removeTerm: function(term) {
    	var series = this.down('#chart').getSeries()[0];
    	var index = series.getStore().findExact('term', term);
    	series.getStore().removeAt(index);
    	
    	index = this.termStore.findExact('term', term);
    	this.termStore.removeAt(index);
    },
    
    loadFromApis: function() {
    	var params = {};
    	var terms = this.getCurrentTerms();
    	if (this.newTerm !== null) {
    		terms.push(this.newTerm);
    		this.setApiParam('limit', terms.length);
    	}
    	if (terms.length > 0) {
    		if (this.newTerm !== null) {
    			params.query = terms.join(',');
    		}
    		params.term = terms;
    	}
    	Ext.apply(params, this.getApiParams());
//    	delete params.stopList;
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