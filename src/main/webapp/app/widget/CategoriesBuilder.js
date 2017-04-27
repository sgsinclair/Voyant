Ext.define('Voyant.widget.CategoriesBuilder', {
    extend: 'Ext.window.Window',
    requires: ['Voyant.widget.FontFamilyOption'],
    mixins: ['Voyant.util.Localization','Voyant.util.Api','Voyant.util.CategoriesManager'],
    alias: 'widget.categoriesbuilder',
    statics: {
    	i18n: {
    		title: 'Categories Builder',
    		terms: 'Terms',
    		term: 'Term',
    		rawFreq: 'Count',
    		relativeFreq: 'Relative',
    		categories: 'Categories',
    		addCategory: 'Add Category',
    		removeCategory: 'Remove Category',
    		removeTerms: 'Remove Selected Terms',
    		categoryName: 'Category Name',
    		add: 'Add',
    		cancel: 'Cancel',
    		exists: 'Category already exists',
    		confirmRemove: 'Are you sure you want to remove the category?',
    		done: 'Done',
    		features: 'Features',
    		category: 'Category',
    		color: 'Color',
    		font: 'Font'
    	},
    	api: {
    		stopList: 'auto',
    		query: undefined
    	},
    	features: {
        	color: {
        		xtype: 'colorfield',
        		format: '#hex6'
        	},
        	font: {
        		xtype: 'combobox',
        		queryMode: 'local',
        		displayField: 'name',
        		valueField: 'value',
        		store: {
        			fields: ['name', 'value'],
        			data: Voyant.widget.FontFamilyOption.fonts
        		}
        	}
        }
    },
    config: {
    	corpus: undefined,
    	categoriesManager: undefined,
    	categoryWin: undefined,
    	parentPanel: undefined
    },
    
    // window defaults
    modal: true,
	height: 250,
	width: 500,

    constructor: function(config) {
    	config = config || {};
    	
    	if (config.panel) {
    		this.panel = config.panel;
    	}
    	
    	var categoriesManager = config.categoriesManager ? config.categoriesManager : Ext.create('Voyant.util.CategoriesManager');
    	this.setCategoriesManager(categoriesManager);
    	
    	this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
    	this.callParent(arguments);
    },
    
    initComponent: function() {
    	Ext.apply(this, {
    		title: this.localize('title'),
    		layout: 'card',
    		items: [{
	    		layout: 'border',
	    		items: [{
	    			title: this.localize('terms'),
	    			split: true,
	    			width: 250,
	    			region: 'west',
	    			layout: 'fit',
	    			items: {
	    				itemId: 'terms',
	    				xtype: 'grid',
	    				store: Ext.create('Voyant.data.store.CorpusTermsBuffered', {
	    		        	parentPanel: this
	    		        }),
	    				viewConfig: {
	    					plugins: {
	    						ptype: 'gridviewdragdrop',
	    						ddGroup: 'terms',
	    						copy: true,
	    						enableDrop: false, // can't drop on grid with buffered store
	    						dragZone: {
	    							getDragText: function() {
	    								var text = '';
	    								this.dragData.records.forEach(function(d) {
	    									text += d.get('term')+', ';
	    								});
	    								return text.substr(0, text.length-2);
	    							}
	    						}
	    					}
	    				},
	    				selModel: {
	    	    			mode: 'MULTI'
	    	    		},
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
			            	text: this.localize('relativeFreq'),
			            	dataIndex: 'relativeFreq',
			            	renderer: function(val) {
			            		return Ext.util.Format.number(val*1000000, "0,000");
			            	},
			                width: 'autoSize',
			                hidden: true,
			            	sortable: true
			            }],
			            dockedItems: [{
			                dock: 'bottom',
			                xtype: 'toolbar',
			                overflowHandler: 'scroller',
			                items: [{
			                    xtype: 'querysearchfield'
			                }]
			            }],
			            listeners: {
			            	query: function(src, query) {
			            		this.setApiParam('query', query);
			            		var store = this.queryById('terms').getStore();
			            		store.removeAll();
			            		store.load();
			            	},
			            	scope: this
			            }
	    			}
	    		},{
	    			title: this.localize('categories'),
	    			itemId: 'categories',
	    			region: 'center',
	    			xtype: 'panel',
	    			layout: {
	    				type: 'hbox',
	    				align: 'stretch'
	    			},
	    			scrollable: 'x',
	    			dockedItems: [{
	                    dock: 'bottom',
	                    xtype: 'toolbar',
	                    overflowHandler: 'scroller',
	                    items: [{
	                    	text: this.localize('addCategory'),
	                    	handler: function() {
	                    		this.getCategoryWin().show();
	                    	},
	                    	scope: this
	                    },{
	                    	text: this.localize('removeTerms'),
	                    	handler: function() {
	                    		this.queryById('categories').query('grid').forEach(function(grid) {
	                    			grid.getStore().remove(grid.getSelection());
	                    		}, this);
	                    	},
	                    	scope: this
	                    }]
	    			}],
	    			items: []
	    		}]
    		},{
    			layout: 'fit',
    			itemId: 'features',
    			title: this.localize('features'),
    			xtype: 'grid',
    			
    			scrollable: 'y',
    			store: Ext.create('Ext.data.JsonStore', {
	    			fields: ['category']
	    		}),
    			columns: [{
    				text: this.localize('category'),
    				dataIndex: 'category',
    				sortable: false,
    				hideable: false,
    				flex: 1
    			}]
    		}],
    		buttons: [{
    			text: this.localize('features'),
    			handler: function(btn) {
    				var layout = btn.up('panel').getLayout();
    				if (layout.getNext()) {
    					layout.next();
    					btn.setText(this.localize('categories'));
    				} else {
    					layout.prev();
    					btn.setText(this.localize('features'));
    				}
    			},
    			scope: this
    		},{
				text: this.localize('done'),
				handler: function(btn) {
					btn.up('window').close();
				}
			}]
    	});
    	
    	this.setCategoryWin(Ext.create('Ext.window.Window', {
    		title: this.localize('addCategory'),
    		modal: true,
    		closeAction: 'hide',
    		layout: 'fit',
    		items: {
    			xtype: 'form',
    			width: 300,
    			defaults: {
    				labelAlign: 'right'
    			},
	    		items: [{
	    			xtype: 'textfield',
	    			fieldLabel: this.localize('categoryName'),
	    			name: 'categoryName',
	    			allowBlank: false,
	    			validator: function(val) {
	    				return this.getCategoriesManager().getCategoryTerms(val) === undefined ? true : this.localize('exists');
	    			}.bind(this),
	    			enableKeyEvents: true,
	    			listeners: {
	    				keypress: function(field, evt) {
	    					if (evt.getKeyName() === Ext.event.Event.ENTER) {
	    						
	    					}
	    				},
	    				scope: this
	    			}
	    		}],
	    		buttons: [{
	    			text: this.localize('cancel'),
	    			handler: function(btn) {
	    				btn.up('window').close();
	    			}
	    		},{
	    			text: this.localize('add'),
	    			handler: function(btn) {
	    				var form = btn.up('form');
	    				if (form.isValid()) {
	    					var name = form.getValues()['categoryName'];
	    					this.addCategory(name);
	    					btn.up('window').close();
	    				}
	    			},
	    			scope: this
	    		}]
    		},
    		listeners: {
    			show: function(win) {
    				var form = win.down('form').getForm();
    				form.reset();
					form.clearInvalid();
    			}
    		}
    	}));

    	this.on('afterrender', function(builder) {
    		builder.on('loadedCorpus', function(src, corpus) {
    			this.setCorpus(corpus);
	    		var terms = this.queryById('terms');
	    		terms.getStore().load();
    		}, builder);
    		
    		if (this.panel) {
    			this.panel.on('loadedCorpus', function(src, corpus) {
    				builder.fireEvent('loadedCorpus', src, corpus);
    			}, builder);
    			if (this.panel.getCorpus && this.panel.getCorpus()) {builder.fireEvent('loadedCorpus', builder, this.panel.getCorpus());}
    			else if (this.panel.getStore && this.panel.getStore() && this.panel.getStore().getCorpus && this.panel.getStore().getCorpus()) {
    				builder.fireEvent('loadedCorpus', builder, this.panel.getStore().getCorpus());
    			}
    		} else {
    			if (window.console) {
    				console.warn('couldn\'t find parent panel for CategoriesBuilder');
    			}
    		}
    		
    		this.buildCategories();
    		
    		this.addFeature('font');
    		this.addFeature('color');
    	}, this);
    	
    	this.on('beforeclose', function(component) {
    		// build colorTermAssociations from the categories
    		var app = this.panel.getApplication();
			var catman = this.getCategoriesManager();
			for (var category in catman.getCategories()) {
				var color = catman.getCategoryFeature(category, 'color');
				if (color !== undefined) {
					var rgb = app.hexToRgb(color);
					var terms = catman.getCategoryTerms(category);
					for (var i = 0; i < terms.length; i++) {
						app.colorTermAssociations.replace(terms[i], rgb);
					}
				}
			}
//			app.saveCategoriesForCorpus(app.getCorpus().getId());
    	}, this);
    	
    	this.callParent(arguments);
    },
    
    addCategory: function(name) {
    	var features = this.queryById('features');
    	features.getStore().loadRawData([{category: name}], true);
    	
    	var catParent = this.queryById('categories');
    	
    	var color;
    	var termsData = [];
    	var catman = this.getCategoriesManager();
    	var terms = catman.getCategoryTerms(name);
    	if (terms === undefined) {
    		catman.addCategory(name);
    		catman.addFeature('color');
    	
	    	var index = catParent.query('grid').length;
	    	color = this.panel.getApplication().getColor(index, true);
	    	catman.setCategoryFeature(name, 'color', color);
    	} else {
    		for (var i = 0; i < terms.length; i++) {
    			termsData.push({term: terms[i]});
    		}
    		color = catman.getCategoryFeature(name, 'color');
    	}
    	
    	return catParent.add({
    		xtype: 'grid',
    		category: name,
    		title: name,
//    		header: {
//    			items: [{
//    				xtype: 'colorbutton',
//    				format: '#hex6',
//    				value: color,
//    				width: 30,
//    				height: 15,
//    				listeners: {
//    					change: function(btn, color, pcolor) {
//    						this.getCategoriesManager().setCategoryFeature(name, 'color', color);
//    					},
//    					afterrender: function(btn) {
//    						var popup = btn.getPopup();
//    						popup.listeners = {
//    							focusleave: function(sel, evt) {
//    								sel.close(); // fix for conflict between selector and parent modal window, when you click outside of the selector
//    							}
//    						};
//    					},
//    					scope: this
//    				}
//    			}]
//    		},
    		frame: true,
    		width: 150,
    		margin: '10 0 10 10',
    		layout: 'fit',
    		tools: [{
    			type: 'close',
    			tooltip: this.localize('removeCategory'),
    			callback: function(panel) {
    				Ext.Msg.confirm(this.localize('removeCategory'), this.localize('confirmRemove'), function(btn) {
    					if (btn === 'yes') {
    						this.removeCategory(name);
    					}
    				}, this);
    			},
    			scope: this
    		}],
    		
    		store: Ext.create('Ext.data.JsonStore', {
    			data: termsData,
    			fields: ['term']
    		}),
    		viewConfig: {
	    		plugins: {
	    			ptype: 'gridviewdragdrop',
					ddGroup: 'terms',
					dragZone: {
						getDragText: function() {
							var text = '';
							this.dragData.records.forEach(function(d) {
								text += d.get('term')+', ';
							});
							return text.substr(0, text.length-2);
						}
					}
	    		}
    		},
    		selModel: {
    			mode: 'MULTI'
    		},
    		columns: [{
        		dataIndex: 'term',
        		flex: 1,
                sortable: true
            }],
    		listeners: {
    			drop: function(node, data) {
    				data.view.getSelectionModel().deselectAll();
    				this.getSelectionModel().deselectAll();
    				
    				var categories = this.up('categoriesbuilder').getCategoriesManager();
    				var terms = [];
    				for (var i = 0; i < data.records.length; i++) {
    					terms.push(data.records[i].get('term'));
    				}
    				categories.addTerms(name, terms);
    				
    				var source = data.view.up('grid');
    				if (source.category) {
    					categories.removeTerms(source.category, terms);
    				}
    			}
    		}
    	});
    },
    
    removeCategory: function(name) {
    	var categoriesParent = this.queryById('categories');
    	var panel = categoriesParent.queryBy(function(cmp) {
    		if (cmp.category && cmp.category == name) {
    			return true;
    		}
    		return false;
    	});
    	categoriesParent.remove(panel[0]);
    	
    	var featuresStore = this.queryById('features').getStore();
    	featuresStore.removeAt(featuresStore.findExact('category', name));
    	
		this.getCategoriesManager().removeCategory(name);
    },
    
    addFeature: function(name) {
		this.getCategoriesManager().addFeature(name);
		this.buildFeatures();
    },
    
    buildFeatures: function() {
    	var fields = ['category'];
		var columns = [{
			sortable: false,
			text: this.localize('category'),
			dataIndex: 'category',
			flex: 1
		}];
		
		var features = this.getCategoriesManager().getFeatures();
		var featuresConfig = Ext.ClassManager.getClass(this).features;
		
		for (var feature in features) {
			fields.push(feature);
			
			var widgetConfig = Ext.apply({
				feature: feature,
				listeners: {
					change: function(cmp, newvalue) {
						if (cmp.rendered) {
							var rowIndex = cmp.up('gridview').indexOf(cmp.el.up('table'));
							var category = cmp.up('grid').getStore().getAt(rowIndex).get('category');
							this.getCategoriesManager().setCategoryFeature(category, cmp.feature, newvalue);
						}
					},
					scope: this
				}
			}, featuresConfig[feature]);
			
			columns.push({
				sortable: false,
				hideable: false,
				text: this.localize(feature),
				dataIndex: feature,
				flex: 0.5,
				xtype: 'widgetcolumn',
				widget: widgetConfig
			});
		}
		
		var store = Ext.create('Ext.data.JsonStore', {
			fields: fields
		});
		this.queryById('features').reconfigure(store, columns);
    },
    
    buildCategories: function() {
    	var cats = this.getCategoriesManager().getCategories();
    	for (var key in cats) {
    		this.addCategory(key);
    	}
    }
});