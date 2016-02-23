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
			rawFreq: {en: "Raw"},
			relFreq: {en: "Relative"},
			terms: {en: "Terms"},
			term: {en: "Term"},
			numTerms: {en: "Terms"},
			addTerm: {en: "Add Term"},
			clusters: {en: "Clusters"},
			dimensions: {en: "Dimensions"},
			labels: {en: "Labels"},
			remove: {en: "Remove"},
			removeTerm: {en: 'Remove <b>{0}</b>'},
			nearby: {en: "Nearby"},
			nearbyTerm: {en: 'Nearby <b>{0}</b>'},
			pcTitle: {en: 'Percentage of Total Variation Explained by Each Component'},
			pc: {en: 'PC'},
			caTitle: {en :'Percentage of Total Assocation Explained by Each Dimension'},
			dimension: {en :'Dimension'},
			xAxis: {en :'X Axis'},
			yAxis: {en :'Y Axis'},
			fill: {en :'Fill'},
			loading: {en: "Loading"},
			helpTip: {en: "<p>ScatterPlot displays the correspondance of word use in a corpus. This visualization relies on a statistical analysis that takes the word’s correspondance from each document (where each document represents a dimension) and reduces it to a three dimensional space to easily visualize the data through a scatterplot.</p>"},
			tokenFreqTip: {en: '<b>{0}</b><br/><b>Raw Frequency</b><br/>{1}</b><br/><b>Relative Frequency</b><br/>{2}</b>'},
			docFreqTip: {en: '<b>{0}</b><br/><b>Word Count</b><br/>{1}</b>'},
			noTermSelected: {en: "No term selected."}
    	},
    	api: {
    		analysis: 'ca',
    		limit: 50,
    		dimensions: 3,
    		bins: 10,
    		clusters: 3,
    		stopList: 'auto',
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
	termsTimeout: null,
    chartMenu: null,
    labelsMode: 0, // 0 all labels, 1 word labels, 2 no labels
    
    highlightData: {x: 0, y: 0, r: 0},
    highlightTask: null,
    
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
        			{text: this.localize('remove'), itemId: 'remove', glyph: 'xf068@FontAwesome'},
        			{text: this.localize('nearby'), itemId: 'nearby', glyph: 'xf0b2@FontAwesome'}
        		],
        		listeners: {
        			hide: function() {
        				var series = this.down('#chart').getSeries();
        				series[0].enableToolTips();
        				series[1].enableToolTips();
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
        		tbar: {
        			enableOverflow: true,
        			items: [{
                		text: this.localize('analysis'),
                		itemId: 'analysis',
                		glyph: 'xf1ec@FontAwesome',
                		enableOverflow: true,
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
        								this.loadFromApis(true);
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
        								this.loadFromApis(true);
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
        								this.loadFromApis(true);
        							}
        						},
        						scope: this
        					}
                		}
                	},{
                		text: this.localize('labels'),
                		itemId: 'labels',
                		glyph: 'xf02b@FontAwesome',
                		handler: function() {
                			this.labelsMode++;
        					if (this.labelsMode > 2) this.labelsMode = 0;
        					this.doLabels();
    					},
    					scope: this
                	}]
        			
        		}
        	},{
        		itemId: 'terms',
        		xtype: 'grid',
 //       		title: 'Terms',
        		region: 'east',
        		width: 225,
        		split: true,
//        		collapsible: true,
//        		border: true,
        		bbar: {
            		enableOverflow: true,
        			items: [{
                        xtype: 'button',
                        text: this.localize('nearby'),
                        glyph: 'xf0b2@FontAwesome',
                        handler: function(btn) {
                        	var sel = this.down('#terms').getSelection()[0];
                        	if (sel === undefined) {
                        		this.toastError({
                        			html: this.localize("noTermSelected"),
                        		     anchor: btn.up("panel").getTargetEl()
                        		 });
                        	}
                        	else {
	                        	var term = sel.get('term');
	                        	this.getNearbyForTerm(term);
                        	}
                        },
                        scope: this
                    },{
                        xtype: 'button',
                        text: this.localize('remove'),
                        glyph: 'xf068@FontAwesome',
                        handler: function(btn) {
                        	var sel = this.down('#terms').getSelection()[0];
                        	if (sel === undefined) {
                        		this.toastError({
                        			html: this.localize("noTermSelected"),
                        		     anchor: btn.up("panel").getTargetEl()
                        		 });
                        	}
                        	else {
	                        	var term = sel.get('term');
	                        	this.removeTerm(term);
                        	}
                        },
                        scope: this
                    }]
        			
        		},
        		dockedItems: [{
                    dock: 'top',
                    xtype: 'toolbar',
            		enableOverflow: true,
                    items: [{
                		fieldLabel: this.localize('numTerms'),
                		labelAlign: 'right',
                		labelWidth: 40,
                		itemId: 'limit',
                		xtype: 'combo',
                		width: 100,
                		store: Ext.create('Ext.data.ArrayStore', {
                			fields: ['count'],
                			data: [[10],[20],[30],[40],[50],[60],[70],[80],[90],[100]]
                		}),
                		displayField: 'count',
                		valueField: 'count',
                		queryMode: 'local',
                		editable: true,
                		allowBlank: false,
                		validator: function(val) {
                			return val.match(/\D/) === null;
                		},
                		listeners: {
    						change: function(combo, newVal, oldVal) {
    							function doLoad() {
    								var val = Math.min(parseInt(newVal), 10000);
    								this.setApiParam('limit', val);
									this.loadFromApis();
    							}
    							if (combo.isValid() && oldVal !== null) {
    								if (this.termsTimeout !== null) {
    									clearTimeout(this.termsTimeout);
    								}
    								this.termsTimeout = setTimeout(doLoad.bind(this), 500);
    							}
    						},
    						scope: this
    					}
                	},{
                    	xtype: 'querysearchfield',
                    	emptyText: this.localize('addTerm'),
                    	width: 90
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
//    		setCheckBound('limit');
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
        var numDims = this.getApiParam('dimensions');
        
    	var summary = '';    	
    	if (this.getApiParam('analysis') == 'pca') {
    		// calculate the percentage of original data represented by the dominant principal components
			var pcs = rec.getPrincipalComponents();
			var eigenTotal = 0;
			for (var i = 0; i < pcs.length; i++) {
				var pc = pcs[i];
				eigenTotal += parseFloat(pc.get('eigenValue'));
			}
			summary = this.localize('pcTitle')+'\n';
			var pcMapping = ['xAxis', 'yAxis', 'fill'];
			for (var i = 0; i < pcs.length; i++) {
				if (i >= numDims) break;
				
				var pc = pcs[i];
				var eigenValue = parseFloat(pc.get('eigenValue'));
				var percentage = eigenValue / eigenTotal * 100;
				summary += this.localize('pc')+' '+(i+1)+' ('+this.localize(pcMapping[i])+'): '+Math.round(percentage*100)/100+'%\n';
			}
    	} else {
    		summary = this.localize('caTitle')+'\n';
    		var pcMapping = ['xAxis', 'yAxis', 'fill'];
    		
    		var dimensions = rec.getDimensions();
    		for (var i = 0; i < dimensions.length; i++) {
    			if (i >= numDims) break;
    			
    			var percentage = parseFloat(dimensions[i]['data']);
    			summary += this.localize('dimension')+' '+(i+1)+' ('+this.localize(pcMapping[i])+'): '+Math.round(percentage*100)/100+'%\n';
    		}
    	}
        
        var maxFreq = 0;
        var minFreq = Number.MAX_VALUE;
        var maxFill = 0;
        var minFill = Number.MAX_VALUE;
                
        this.termStore.removeAll();
        
        var tokens = rec.getTokens();
        var termData = [];
        var docData = [];
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
        
        var newCount = this.termStore.getCount();
        this.queryById('limit').setRawValue(newCount);
        this.setApiParam('limit', newCount);
        
        
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
        	sprites: [{
        		type: 'text',
        		text: summary,
        		hidden: this.labelsMode > 0,
        		x: 70,
        		y: 70
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
	    				var scatterplot = this.getParent().up('scatterplot');
	    				
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
	    				var scatterplot = this.getParent().up('scatterplot');
	    				
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
        		render: function(chart) {
        			chart.body.on('contextmenu', function(event, target) {
	        			event.preventDefault();
	        			
		            	var xy = event.getXY();
		            	var parentXY = Ext.fly(target).getXY();
		            	var x = xy[0] - parentXY[0];
		            	var y = xy[1] - parentXY[1];
		            	var chartItem = this.down('#chart').getItemForPoint(x,y);
		            	if (chartItem != null && chartItem.record.get('isDoc') != true) {
		            		var series = this.down('#chart').getSeries();
		            		series[0].disableToolTips();
		            		series[1].disableToolTips();
		            		
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
    	
    	if (this.labelsMode < 2) {
    		config.series[0].label = {
    			field: 'term',
    			display: 'over'
    		};
    		config.series[1].label = {
    			field: 'term',
    			display: 'over'
    		};
    	}
    	
    	var chart = Ext.create('Ext.chart.CartesianChart', config);
    	this.queryById('chartParent').insert(0, chart);
    	
    	if (this.newTerm !== null) {
        	this.selectTerm(this.newTerm);
        	this.newTerm = null;
        }
    },
    
    doLabels: function() {
    	var chart = this.queryById('chart');
    	var series = chart.getSeries();
    	var summary = chart.getSurface('chart').getItems()[0];
    	switch (this.labelsMode) {
    		case 0:
    			series[0].getLabel().show();
        		series[1].getLabel().show();
        		summary.show();
        		break;
    		case 1:
    			series[0].getLabel().show();
        		series[1].getLabel().show();
    			summary.hide();
    			break;
    		case 2:
    			series[0].getLabel().hide();
        		series[1].getLabel().hide();
        		summary.hide();
    	}
    	chart.redraw();
    },
    
    selectTerm: function(term) {
    	var chart = this.down('#chart');
    	var series = chart.getSeries()[0];
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
    		
    		var point = this.getPointFromIndex(series, index);
    		this.highlightData = {x: point[0], y: point[1], r: 50};
    		
    		if (this.highlightTask == null) {
    			this.highlightTask = Ext.TaskManager.newTask({
        			run: this.doHighlight,
        			scope: this,
        			interval: 25,
        			repeat: this.highlightData.r
        		});
    		}
    		this.highlightTask.restart();
    	}
    },
    
    getPointFromIndex: function(series, index) {
		var sprite = series.getSprites()[0];
		var matrix = sprite.attr.matrix.clone().prependMatrix(sprite.surfaceMatrix);
		var dataX = sprite.attr.dataX[index];
		var dataY = sprite.attr.dataY[index];
		return matrix.transformPoint([dataX, dataY]);
    },
    
    doHighlight: function() {
    	var chart = this.down('#chart');
    	if (this.highlightData.r > 0) {
	    	var surf = chart.getSurface();
			var highlight = null;
			var items = surf.getItems();
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				if (item.id == 'customHighlight') {
					highlight = item;
					break;
				}
			}
			if (highlight == null) {
				surf.add({
					id: 'customHighlight',
					type: 'circle',
					strokeStyle: 'red',
					fillStyle: 'none',
					radius: this.highlightData.r,
					x: this.highlightData.x,
					y: this.highlightData.y
				});
			} else {
				highlight.setAttributes({
					x: this.highlightData.x,
					y: this.highlightData.y,
					radius: this.highlightData.r
				});
				this.highlightData.r -= 1.5;
				if (this.highlightData.r <= 0) {
					this.highlightData.r = 0;
					surf.remove(highlight, true);
				}
			}
			chart.redraw();
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
    	
    	var newCount = this.termStore.getCount();
        this.queryById('limit').setRawValue(newCount);
    },
    
    loadFromApis: function(keepCurrentTerms) {
    	var chart = this.down('#chart');
    	if (chart !== null) {
    		chart.mask(this.localize('loading'));
    	}
    	var params = {};
    	var terms = this.getCurrentTerms();
    	if (this.newTerm !== null) {
    		terms.push(this.newTerm);
    		this.setApiParam('limit', terms.length);
    	}
    	if (terms.length > 0) {
    		if (this.newTerm !== null || keepCurrentTerms) {
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