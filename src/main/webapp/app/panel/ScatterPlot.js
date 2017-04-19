Ext.define('Voyant.panel.ScatterPlot', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	requires: ['Ext.chart.CartesianChart'],
	alias: 'widget.scatterplot',
    statics: {
    	i18n: {
    		tsne: 't-SNE',
    		terms: 'Terms',
    		reload: 'Reload',
    		options: 'Options',
    		input: 'Input',
    		output: 'Output',
    		perplexity: 'Perplexity',
    		iterations: 'Iterations',
    		analyzing: 'Analyzing',
    		plotting: 'Plotting'
    	},
    	api: {
    		docId: undefined,
    		analysis: 'ca',
    		limit: 50,
    		dimensions: 3,
    		bins: 10,
    		clusters: 3,
    		perplexity: 15,
    		iterations: 1500,
    		comparisonType: 'relative',
    		stopList: 'auto',
    		target: undefined,
    		term: undefined,
    		query: undefined,
    		label: ['summary', 'docs', 'terms']
    	},
		glyph: 'xf06e@FontAwesome'
    },
	config: {
		options: {
    		xtype: 'stoplistoption'
    	},
    	caStore: null,
    	pcaStore: null,
    	tsneStore: null,
    	docSimStore: null,
    	termStore: null,
    	chartMenu: null,
    	newTerm: null,
    	termsTimeout: null,
    	highlightData: {x: 0, y: 0, r: 0},
        highlightTask: null
	},
    
    tokenFreqTipTemplate: null,
    docFreqTipTemplate: null,
    
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
    	this.setCaStore(Ext.create('Voyant.data.store.CAAnalysis', {
    		listeners: {load: this.maskAndBuildChart, scope: this}
    	}));
    	this.setPcaStore(Ext.create('Voyant.data.store.PCAAnalysis', {
    		listeners: {load: this.maskAndBuildChart, scope: this}
    	}));
    	this.setTsneStore(Ext.create('Voyant.data.store.TSNEAnalysis', {
    		listeners: {load: this.maskAndBuildChart, scope: this}
    	}));
    	this.setDocSimStore(Ext.create('Voyant.data.store.DocSimAnalysis', {
    		listeners: {load: this.maskAndBuildChart, scope: this}
    	}));
    	this.setTermStore(Ext.create('Ext.data.JsonStore', {
			fields: [
				{name: 'term'},
				{name: 'rawFreq', type: 'int'},
				{name: 'relativeFreq', type: 'number'},
				{name: 'coordinates', mapping : 'vector'},
				{name: 'category'}
			],
			sorters: [{property: 'rawFreq', direction: 'DESC'}],
			groupField: 'category'
		}));
    	
    	this.setChartMenu(Ext.create('Ext.menu.Menu', {
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
    	}));
    	
    	this.tokenFreqTipTemplate = new Ext.Template(this.localize('tokenFreqTip'));
    	this.docFreqTipTemplate = new Ext.Template(this.localize('docFreqTip'));
    	
        Ext.apply(this, {
        	title: this.localize('title'),
        	layout: 'border',
        	autoDestroy: true,
        	items: [{
    			itemId: 'chartParent',
    			region: 'center',
    			layout: 'fit',
        		tbar: {
        			overflowHandler: 'scroller',
        			items: [{
        				xtype: 'querysearchfield',
        				itemId: 'filterTerms',
        				width: 150
        			},{
                		text: this.localize('labels'),
                		itemId: 'labels',
                		glyph: 'xf02b@FontAwesome',
                		menu: {
                			items: [
                			    {text: this.localize("summaryLabel"), itemId: 'summary', xtype: 'menucheckitem'},
                			    {text: this.localize("docsLabel"), itemId: 'docs', xtype: 'menucheckitem'},
                			    {text: this.localize("termsLabel"), itemId: 'terms', xtype: 'menucheckitem'}
                			],
        					listeners: {
        						afterrender: function(menu) {
        							var labels = this.getApiParam('label');
        							menu.items.each(function(item) {
        								item.setChecked(labels.indexOf(item.getItemId())>-1)
        							})
        						},
        						click: function(menu, item) {
        							var labels = this.getApiParam("label");
        							var label = item.getItemId();
        							if (Ext.isString(labels)) {labels = [labels]}
        							if (item.checked && labels.indexOf(label)==-1) {
        								labels.push(label)
        							} else if (!item.checked && labels.indexOf(label)>-1) {
        								labels = labels.filter(function(item) {return item!=label})
        							}
        							this.setApiParam("label", labels);
        							this.doLabels();
        							this.queryById('chart').redraw();
        						},
        						scope: this
        					}
                		}
                	}]
        			
        		},
        		listeners: {
        			query: function(component, value) {
        				this.getTermStore().filter([{property: 'term', value: value, anyMatch: true}]);
        				this.filterChart(value);
        			},
        			scope: this
        		}
    		},{
    			itemId: 'optionsPanel',
        		title: this.localize('options'),
        		region: 'west',
        		split: true,
        		collapsible: true,
        		collapseMode: 'header',
        		width: 135,
        		scrollable: 'y',
        		layout: {
        			type: 'vbox',
        			align: 'stretch'
        		},
        		defaults: {
        			xtype: 'button',
        			margin: '5',
        			labelAlign: 'top'
        		},
        		items: [{
        			xtype: 'label',
        			text: this.localize('input')
        		},{
    				xtype: 'documentselectorbutton'
    			},{
	            	text: this.localize('freqsMode'),
	            	itemId: 'comparisonType',
					glyph: 'xf201@FontAwesome',
				    tooltip: this.localize('freqsModeTip'),
				    menu: {
				    	items: [
			               {text: this.localize("rawFrequencies"), itemId: 'comparisonType_raw', group: 'freqsMode', xtype: 'menucheckitem'},
			               {text: this.localize("relativeFrequencies"), itemId: 'comparisonType_relative', group: 'freqsMode', xtype: 'menucheckitem'},
			               {text: this.localize("tfidf"), itemId: 'comparisonType_tfidf', group: 'freqsMode', xtype: 'menucheckitem'}
			            ],
       					listeners: {
    						click: function(menu, item) {
    							if (item !== undefined) {
    								var type = item.getItemId().split('_')[1];
    								if (type !== this.getApiParam('comparisonType')) {
	    								this.setApiParam('comparisonType', type);
	    								this.loadFromApis(true);
    								}
    							}
    						},
    						scope: this
    				    }
				    }
        		},{
        			fieldLabel: this.localize('numTerms'),
        			itemId: 'limit',
        			xtype: 'numberfield',
        			minValue: 5,
        			listeners: {
        				change: function(numb, newValue, oldValue) {
        					function doLoad() {
        						this.setApiParam('limit', newValue);
            					this.loadFromApis();
							}
							if (oldValue !== null) {
								if (this.getTermsTimeout() !== null) {
									clearTimeout(this.getTermsTimeout());
								}
								if (numb.isValid()) {
									this.setTermsTimeout(setTimeout(doLoad.bind(this), 500));
								}
							}
        				},
        				scope: this
        			}
        		},{
        			xtype: 'container',
        			html: '<hr style="border: none; border-top: 1px solid #cfcfcf;"/>'
        		},{
        			xtype: 'label',
        			text: this.localize('output')
        		},{
            		text: this.localize('analysis'),
            		itemId: 'analysis',
            		glyph: 'xf1ec@FontAwesome',
                    overflowHandler: 'scroller',
        			menu: {
    					items: [
    					    {text: this.localize('pca'), itemId: 'analysis_pca', group:'analysis', xtype: 'menucheckitem'},
    					    {text: this.localize('ca'), itemId: 'analysis_ca', group:'analysis', xtype: 'menucheckitem'},
    					    {text: this.localize('tsne'), itemId: 'analysis_tsne', group:'analysis', xtype: 'menucheckitem'},
    					    {text: this.localize('docSim'), itemId: 'analysis_docSim', group:'analysis', xtype: 'menucheckitem'}
    					],
    					listeners: {
    						click: function(menu, item) {
    							if (item !== undefined) {
    								var analysis = item.getItemId().split('_')[1];
    								if (analysis !== this.getApiParam('analysis')) {
    									this.doAnalysisChange(analysis);
    									this.loadFromApis(true);
    								}
    							}
    						},
    						scope: this
    					}
        			}
	            },{
	            	fieldLabel: this.localize('perplexity'),
	            	itemId: 'perplexity',
	            	xtype: 'slider',
	            	minValue: 5,
	            	maxValue: 100,
	            	increment: 1,
	            	listeners: {
	            		changecomplete: function(slider, newValue) {
	            			this.setApiParam('perplexity', newValue);
	            			this.loadFromApis(true);
	            		},
	            		scope: this
	            	}
	            },{
	            	fieldLabel: this.localize('iterations'),
	            	itemId: 'iterations',
	            	xtype: 'slider',
	            	minValue: 100,
	            	maxValue: 5000,
	            	increment: 100,
	            	listeners: {
	            		changecomplete: function(slider, newValue) {
	            			this.setApiParam('iterations', newValue);
	            			this.loadFromApis(true);
	            		},
	            		scope: this
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
    								var clusters = parseInt(item.getItemId().split('_')[1]);
    								if (clusters !== this.getApiParam('clusters')) {
        								this.setApiParam('clusters', clusters);
        								this.loadFromApis(true);
    								}
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
    								var dims = parseInt(item.getItemId().split('_')[1]);
    								if (dims !== this.getApiParam('dimensions')) {
        								if (dims == 3 && this.getApiParam('analysis') == 'ca' && this.getCorpus().getDocumentsCount() == 3) {
        									dims = 2;
        									// TODO add info message 'Because of the nature of Correspondence Analysis, you can only use 2 dimensions with 3 documents.'
        									return false;
        								}
        								
        								this.setApiParam('dimensions', dims);
        								this.loadFromApis(true);
    								}
    							}
    						},
    						scope: this
    					}
            		}
        		},{
        			itemId: 'reloadButton',
        			text: this.localize('reload'),
        			glyph: 'xf021@FontAwesome',
        			handler: function() {
        				this.loadFromApis();
        			},
        			scope: this
        		}]
        	},{
        		itemId: 'termsGrid',
        		xtype: 'grid',
        		title: this.localize('terms'),
        		region: 'east',
        		width: 250,
        		split: true,
        		collapsible: true,
        		collapseMode: 'header',
        		forceFit: true,
        		features: [{
        			ftype: 'grouping',
        			hideGroupedHeader: true,
                    enableGroupingMenu: false
        		}],
        		bbar: {
                    overflowHandler: 'scroller',
        			items: [{
        				itemId: 'nearbyButton',
                        xtype: 'button',
                        text: this.localize('nearby'),
                        glyph: 'xf0b2@FontAwesome',
                        flex: 1,
                        handler: function(btn) {
                        	var sel = btn.up('panel').getSelection()[0];
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
                    	itemId: 'removeButton',
                        xtype: 'button',
                        text: this.localize('remove'),
                        glyph: 'xf068@FontAwesome',
                        flex: 1,
                        handler: function(btn) {
                        	var sel = btn.up('panel').getSelection()[0];
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
        		tbar: {
                    overflowHandler: 'scroller',
                    items: [{
                    	xtype: 'querysearchfield',
                    	itemId: 'addTerms',
//                    	emptyText: this.localize('addTerm'),
                    	flex: 1
                    }]
                },
        		columns: [{
        			text: this.localize('term'),
    				dataIndex: 'term',
    				flex: 1,
                    sortable: true
    			},{
    				text: this.localize('rawFreq'),
    				dataIndex: 'rawFreq',
    				flex: 0.75,
    				minWidth: 70,
                    sortable: true
    			},{
    				text: this.localize('relFreq'),
    				dataIndex: 'relativeFreq',
    				flex: 0.75,
    				minWidth: 70,
                    sortable: true,
                    hidden: true
    			}],
    			selModel: {
    				type: 'rowmodel',
    				mode: 'SINGLE',
    				allowDeselect: true,
    				toggleOnClick: true,
                    listeners: {
                        selectionchange: {
                        	fn: function(sm, selections) {
//                        		this.getApplication().dispatchEvent('corpusTermsClicked', this, selections);
                        		var sel = selections[0];
                        		if (sel !== undefined) {
	                        		var term = sel.get('term');
	                        		var isDoc = sel.get('category') === 'doc';
	                        		this.selectTerm(term, isDoc);
	                        		
	                        		if (isDoc) {
	                        			this.queryById('nearbyButton').disable();
	                        			this.queryById('removeButton').disable();
	                        		} else {
	                        			this.queryById('nearbyButton').enable();
	                        			this.queryById('removeButton').enable();
	                        		}
                        		} else {
                        			this.selectTerm();
                        		}
                        	},
                        	scope: this
                        }
                    }
                },
        		store: this.getTermStore(),
        		listeners: {
        			expand: function(panel) {
        				panel.getView().refresh();
        			},
        			query: function(component, value) {
        				if (value.length > 0 && this.getTermStore().findExact('term', value[0]) === -1) {
	                		this.setNewTerm(value);
	                		this.loadFromApis();
    					} else {
    						this.setNewTerm(null);
    					}
        			},
        			scope: this
        		}
        	}]
        });
        
        this.on('boxready', function(component, width, height) {
			if (width < 400) {
				this.queryById('optionsPanel').collapse();
				this.queryById('termsGrid').collapse();
			}
		}, this);
        
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		function setCheckItemFromApi(apiParamName) {
    			var value = this.getApiParam(apiParamName);
    			var menu = this.queryById(apiParamName);
    			var item = menu.down('#'+apiParamName+'_'+value);
    			item.setChecked(true);
    		}
    		var setCheckBound = setCheckItemFromApi.bind(this);
    		
    		setCheckBound('analysis');
    		this.doAnalysisChange(this.getApiParam('analysis'));
    		
    		setCheckBound('comparisonType');
    		setCheckBound('clusters');

    		this.queryById('perplexity').setValue(this.getApiParam('perplexity'));
    		this.queryById('iterations').setValue(this.getApiParam('iterations'));
    		
    		if (corpus.getDocumentsCount() == 3) {
    			this.setApiParam('dimensions', 2);
    		}
    		setCheckBound('dimensions');

    		this.getCaStore().setCorpus(corpus);
    		this.getPcaStore().setCorpus(corpus);
    		this.getDocSimStore().setCorpus(corpus);
    		this.loadFromApis();
    	}, this);
    	
    	this.on('documentsSelected', function(src, docIds) {
    		this.setApiParam('docId', docIds);
    		this.loadFromApis();
    	}, this);
        
    	this.callParent(arguments);
    },
    
    doAnalysisChange: function(analysis) {
    	this.setApiParam('analysis', analysis);
		this.queryById('nearbyButton').setDisabled(analysis === 'tsne');
		this.queryById('reloadButton').setVisible(analysis === 'tsne');
		this.queryById('perplexity').setVisible(analysis === 'tsne');
		this.queryById('iterations').setVisible(analysis === 'tsne');
		if (analysis === 'ca') {
			if (this.getCorpus().getDocumentsCount() == 3) {
				this.setApiParam('dimensions', 2);
				this.queryById('dimensions').menu.items.get(0).setChecked(true); // need 1-2 docs or 4+ docs for 3 dimensions
			}
		}
    },
    
    maskAndBuildChart: function(store) {
    	this.queryById('chartParent').mask(this.localize('plotting'));
    	Ext.defer(this.buildChart, 50, this, [store]);
    },
    
    buildChart: function(store) {
    	var that = this; // needed for tooltip renderer
    	
    	var oldChart = this.queryById('chart');
    	if (oldChart !== null) {
    		this.queryById('chartParent').remove(oldChart);
    	}
    	
    	this.queryById('termsGrid').getSelectionModel().deselectAll();
    	
    	var rec = store.getAt(0);
        var numDims = this.getApiParam('dimensions');
        
    	var summary = '';    	
    	if (this.getApiParam('analysis') === 'pca') {
    		// calculate the percentage of original data represented by the dominant principal components
			var pcs = rec.getPrincipalComponents();
			var eigenTotal = 0;
			for (var i = 0; i < pcs.length; i++) {
				var pc = pcs[i];
				eigenTotal += parseFloat(pc.get('eigenValue'));
			}
			if (eigenTotal == 0) {
				// do nothing
			} else {
				summary = this.localize('pcTitle')+'\n';
				var pcMapping = ['xAxis', 'yAxis', 'fill'];
				for (var i = 0; i < pcs.length; i++) {
					if (i >= numDims) break;
					
					var eigenValue = pcs[i].get('eigenValue');
					var percentage = eigenValue / eigenTotal * 100;
					summary += this.localize('pc')+' '+(i+1)+' ('+this.localize(pcMapping[i])+'): '+Math.round(percentage*100)/100+'%\n';
				}
			}
    	} else if (this.getApiParam('analysis') === 'tsne') {
    		
    	} else {
    		summary = this.localize('caTitle')+'\n';
    		var pcMapping = ['xAxis', 'yAxis', 'fill'];
    		
    		var dimensions = rec.getDimensions();
    		for (var i = 0; i < dimensions.length; i++) {
    			if (i >= numDims) break;
    			
    			var percentage = dimensions[i].get('percentage');
    			summary += this.localize('dimension')+' '+(i+1)+' ('+this.localize(pcMapping[i])+'): '+Math.round(percentage*100)/100+'%\n';
    		}
    	}
        
        var maxFreq = 0;
        var minFreq = Number.MAX_VALUE;
        var maxFill = 0;
        var minFill = Number.MAX_VALUE;
        
        
        if (this.getApiParam('analysis') !== 'docSim') { // docSim doesn't return terms so keep the current ones
	        this.getTermStore().removeAll();
        }
	        
        var tokens = rec.getTokens();
        var termData = [];
        var docData = [];
        tokens.forEach(function(token) {
        	var freq = token.get('rawFreq');
        	var category = token.get('category');
        	if (category === undefined) {
        		category = 'term'; // some analyses don't define categories
        		token.set('category', 'term');
        	}
        	var isTerm = category === 'term';
        	if (isTerm) {
	        	if (freq > maxFreq) maxFreq = freq;
	        	if (freq < minFreq) minFreq = freq;
        	}
        	if (this.getTermStore().findExact('term', token.get('term') === -1)) {
        		this.getTermStore().addSorted(token);
        	}
        	if (numDims === 3) {
				var z = token.get('vector')[2];
				if (z !== undefined) {
					if (z < minFill) minFill = z;
					if (z > maxFill) maxFill = z;
				}
			}
        	var tokenData = {
        		x: token.get('vector')[0], y: token.get('vector')[1], z: token.get('vector')[2],
    			term: token.get('term'), rawFreq: freq, relativeFreq: token.get('relativeFreq'), cluster: token.get('cluster'), category: category,
    			disabled: false
        	};
        	if (!isTerm) {
        		if (token.get('category') === 'bin') {
        			tokenData.term = tokenData.title = "Bin "+token.get('docIndex');
        		} else {
	        		tokenData.docIndex = token.get('docIndex');
	        		var doc = this.getCorpus().getDocument(tokenData.docIndex);
	        		if (doc !== null) {
		        		tokenData.term = doc.getShortTitle();
		        		tokenData.title = doc.getTitle();
	        		}
        		}
        		docData.push(tokenData);
        	} else {
        		termData.push(tokenData);
        	}
        }, this);
        
        var newCount = this.getTermStore().getCount();
        this.queryById('limit').setRawValue(newCount);
        this.setApiParam('limit', newCount);
        
        
    	var termSeriesStore = Ext.create('Ext.data.JsonStore', {
    		fields: ['term', 'x', 'y', 'z', 'rawFreq', 'relativeFreq', 'cluster', 'category', 'docIndex', 'disabled'],
    		data: termData
    	});
    	var docSeriesStore = Ext.create('Ext.data.JsonStore', {
    		fields: ['term', 'x', 'y', 'z', 'rawFreq', 'relativeFreq', 'cluster', 'category', 'docIndex', 'disabled'],
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
        		fields: ['x'],
        		label: {
                    rotate:{degrees:-30}
            	}
        	},{
        		type: 'numeric',
        		position: 'left',
        		fields: ['y']
        	}],
        	sprites: [{
        		type: 'text',
        		text: summary,
        		x: 70,
        		y: 70
        	}],
        	innerPadding: {top: 25, right: 25, bottom: 25, left: 25},
        	series: [{
        		type: 'customScatter',
        		xField: 'x',
        		yField: 'y',
        		store: termSeriesStore,
        		label: {
        			font: '14px Helvetica',
        			field: 'term',
        			display: 'over'
        		},
        		tooltip: {
        			trackMouse: true,
        			style: 'background: #fff',
        			renderer: function (toolTip, record, ctx) {
        				toolTip.setHtml(that.tokenFreqTipTemplate.apply([record.get('term'),record.get('rawFreq'),record.get('relativeFreq')]));
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
	    				var scatterplot = that;
	    				
	    				if (clusterIndex === -1) {
	    					// no clusters were specified in initial call
	    					clusterIndex = 0;
	    				}
	    				
	    				var fillAlpha = 0.65;
	    				var strokeAlpha = 1;
	    				if (item.get('disabled') === true) {
	    					fillAlpha = 0.1;
	    					strokeAlpha = 0.1;
	    				} else if (numDims === 3 && item.get('z')) {
	    					fillAlpha = scatterplot.interpolate(item.get('z'), minFill, maxFill, 0, 1);
	    				}
	    				var color = scatterplot.getApplication().getColor(clusterIndex);
	    				config.fillStyle = 'rgba('+color.join(',')+','+fillAlpha+')';
	    				config.strokeStyle = 'rgba('+color.join(',')+','+strokeAlpha+')';
	    				
	    				var freq = item.get('rawFreq');
	    				var radius = scatterplot.interpolate(freq, minFreq, maxFreq, 2, 20);
	    				config.radius = radius;
    				}
    			},
    			scope: this
        	},{
        		type: 'customScatter',
        		xField: 'x',
        		yField: 'y',
        		store: docSeriesStore,
        		label: {
        			font: '14px Helvetica',
        			field: 'term',
        			display: 'over',
        			color: this.getDefaultDocColor(true)
        		},
        		tooltip: {
        			trackMouse: true,
        			style: 'background: #fff',
        			renderer: function (toolTip, record, ctx) {
        				toolTip.setHtml(that.docFreqTipTemplate.apply([record.get('title'),record.get('rawFreq')]));
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
	    				var scatterplot = that;
	    				
	    				var color;
	    				if (clusterIndex === -1 || scatterplot.getApiParam('analysis') !== 'docSim') {
	    					color = scatterplot.getDefaultDocColor();
	    				} else {
	    					color = scatterplot.getApplication().getColor(clusterIndex);	
	    				}
	    				
	    				var a = 0.65;
	    				if (numDims === 3 && item.get('z')) {
	    					a = scatterplot.interpolate(item.get('z'), minFill, maxFill, 0, 1);
	    				}
	    				
	    				config.fillStyle = 'rgba('+color.join(',')+','+a+')';
	    				config.strokeStyle = 'rgba('+color.join(',')+',1)';
	    				config.radius = 5;
    				}
    			},
    			scope: this
        		
        		
        	}],
        	listeners: {
        		itemclick: function(chart, item, event) {
        			var data = item.record.data;
        			if (data.category === 'doc') {
        				var record = this.getCorpus().getDocument(data.docIndex);
	            		this.getApplication().dispatchEvent('documentsClicked', this, [record]);
        			} else if (data.category === 'term') {
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
		            	if (chartItem != null && chartItem.record.get('category') === 'term') {
		            		var series = this.down('#chart').getSeries();
		            		series[0].disableToolTips();
		            		series[1].disableToolTips();
		            		
		            		var term = chartItem.record.get('term');
		            		
		            		var text = (new Ext.Template(this.localize('removeTerm'))).apply([term]);
		            		this.getChartMenu().queryById('remove').setText(text);
		            		text = (new Ext.Template(this.localize('nearbyTerm'))).apply([term]);
		            		var nearby = this.getChartMenu().queryById('nearby');
		            		nearby.setText(text);
		            		nearby.setDisabled(this.getApiParam('analysis') === 'tsne');
		            		
		            		this.getChartMenu().on('click', function(menu, item) {
		            			if (item !== undefined) {
		            				var term = chartItem.record.get('term');
			            			if (item.getItemId() === 'nearby') {
			            				this.getNearbyForTerm(term);
			            			} else {
			            				this.removeTerm(term);
			            			}
		            			}
		            		}, this, {single: true});
		            		this.getChartMenu().showAt(xy);
		            	}
		            }, this);
        		},
        		scope: this
        	}
        };
    	
    	var chart = Ext.create('Ext.chart.CartesianChart', config);
    	this.queryById('chartParent').insert(0, chart);
    	
    	this.queryById('chartParent').unmask();
    	
    	this.doLabels();
    	
    	if (this.getNewTerm() !== null) {
        	this.selectTerm(this.getNewTerm()[0]);
        	this.setNewTerm(null);
        }
    },
    
    getDefaultDocColor: function(returnHex) {
    	var color = this.getApplication().getColor(6, returnHex);
    	return color;
    },
    
    doLabels: function() {
    	var chart = this.queryById('chart');
    	var series = chart.getSeries();
    	var summary = chart.getSurface('chart').getItems()[0];
    	var labels = this.getApiParam("label");
    	if (labels.indexOf("summary")>-1) {summary.show();}
    	else {summary.hide();}
    	if (labels.indexOf("terms")>-1) {series[0].getLabel().show();}
    	else {series[0].getLabel().hide();}
    	if (labels.indexOf("docs")>-1) {series[1].getLabel().show();}
    	else {series[1].getLabel().hide();}
    },
    
    selectTerm: function(term, isDoc) {
    	var chart = this.down('#chart');
    	if (chart !== null) {
	    	if (term === undefined) {
				chart.getSeries()[0].setHighlightItem(null);
				chart.getSeries()[1].setHighlightItem(null);
	    	} else {
		    	var series, index;
		    	if (isDoc === true) {
		    		series = chart.getSeries()[1];
			    	index = series.getStore().findExact('title', term);
		    	} else {
			    	series = chart.getSeries()[0];
			    	index = series.getStore().findExact('term', term);
		    	}
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
		    		if (isDoc) {
		    			chart.getSeries()[0].setHighlightItem(null);
		    		} else {
		    			chart.getSeries()[1].setHighlightItem(null);
		    		}
		    		
		    		var point = this.getPointFromIndex(series, index);
		    		this.setHighlightData({x: point[0], y: point[1], r: 50});
		    		
		    		if (this.getHighlightTask() == null) {
		    			this.setHighlightTask(Ext.TaskManager.newTask({
		        			run: this.doHighlight,
		        			scope: this,
		        			interval: 25,
		        			repeat: this.getHighlightData().r
		        		}));
		    		}
		    		this.getHighlightTask().restart();
		    	}
	    	}
    	}
    },
    
    getPointFromIndex: function(series, index) {
		var sprite = series.getSprites()[0];
		if (sprite.surfaceMatrix !== null) {
			var matrix = sprite.attr.matrix.clone().prependMatrix(sprite.surfaceMatrix);
			var dataX = sprite.attr.dataX[index];
			var dataY = sprite.attr.dataY[index];
			return matrix.transformPoint([dataX, dataY]);
		} else {
			return [0,0];
		}
    },
    
    doHighlight: function() {
    	var chart = this.down('#chart');
    	if (this.getHighlightData().r > 0) {
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
					radius: this.getHighlightData().r,
					x: this.getHighlightData().x,
					y: this.getHighlightData().y
				});
			} else {
				highlight.setAttributes({
					x: this.getHighlightData().x,
					y: this.getHighlightData().y,
					radius: this.getHighlightData().r
				});
				this.getHighlightData().r -= 1.5;
				if (this.getHighlightData().r <= 0) {
					this.getHighlightData().r = 0;
					surf.remove(highlight, true);
				}
			}
			chart.redraw();
    	}
    },
    
    filterChart: function(query) {
    	if (Ext.isString(query)) query = [query];
    	var reQueries = [];
    	for (var i = 0; i < query.length; i++) {
    		var re = new RegExp(query[i]);
    		reQueries.push(re);
    	}
    	
    	// filter terms
    	var chart = this.queryById('chart');
    	var series0 = chart.getSeries()[0];
    	var label0 = series0.getLabel();
    	series0.getStore().each(function(item) {
    		var match = false;
    		if (reQueries.length == 0) match = true;
    		else {
	    		for (var i = 0; i < reQueries.length; i++) {
	    			match = match || reQueries[i].test(item.get('term'));
	    			if (match) break;
	    		}
    		}
    		item.set('disabled', !match);
    		var index = item.store.indexOf(item);
    		label0.setAttributesFor(index, {hidden: !match});
    	}, this);

		chart.redraw();
    },
    
    getCurrentTerms: function() {
    	var terms = [];
    	this.getTermStore().each(function(r) {
    		if (r.get('category') === 'term') {
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
    	
    	index = this.getTermStore().findExact('term', term);
    	this.getTermStore().removeAt(index);
    	
    	var newCount = this.getTermStore().getCount();
        this.queryById('limit').setRawValue(newCount);
    },
    
    loadFromApis: function(keepCurrentTerms) {
    	this.queryById('chartParent').mask(this.localize('analyzing'));
    	
    	var params = {};
    	var terms = this.getCurrentTerms();
    	if (this.getNewTerm() !== null) {
    		terms = terms.concat(this.getNewTerm());
    		this.setApiParam('limit', terms.length);
    	}
    	if (terms.length > 0) {
    		if (this.getNewTerm() !== null || keepCurrentTerms) {
    			params.query = terms.join(',');
    		}
//    		params.term = terms;
    	}
    	Ext.apply(params, this.getApiParams());
    	if (params.target != null) {
    		params.term = terms;
    	}

    	if (params.analysis === 'pca') {
    		this.getPcaStore().load({
	    		params: params
	    	});
    	} else if (params.analysis === 'tsne'){
    		this.getTsneStore().load({
	    		params: params
	    	});
    	} else if (params.analysis === 'docSim'){
    		this.getDocSimStore().load({
	    		params: params
	    	});
    	} else {
    		this.getCaStore().load({
	    		params: params
	    	});
    	}
    },
    
    interpolate: function(lambda, minSrc, maxSrc, minDst, maxDst) {
        return minDst + (maxDst - minDst) * Math.max(0, Math.min(1, (lambda - minSrc) / (maxSrc - minSrc)));
    }
});

/*
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