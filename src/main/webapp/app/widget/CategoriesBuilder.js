Ext.define('Voyant.widget.CategoriesOption', {
	extend: 'Ext.container.Container',
	mixins: ['Voyant.util.Localization'],
	alias: 'widget.categoriesoption',
	statics: {
		i18n: {
		}
	},
	config: {
		builderWin: undefined
	},
	initComponent: function() {
		var value = this.up('window').panel.getApiParam('categories');
    	var data = value ? [{name: value, value: value}] : [];
		
		Ext.apply(this, {
    		layout: 'hbox',
    		items: [{
    			xtype: 'combo',
    			queryMode: 'local',
    			triggerAction: 'all',
    			fieldLabel: this.localize('categories'),
    			labelAlign: 'right',
    			displayField: 'name',
    			valueField: 'value',
    			store: {
    				fields: ['name', 'value'],
    				data: data
    			},
    			name: 'categories',
    			value: value
    		}, {width: 10}, {xtype: 'tbspacer'}, {
    			xtype: 'button',
    			text: this.localize('edit'),
    			ui: 'default-toolbar',
    			handler: function() {
    				if (this.getBuilderWin() === undefined) {
    					var panel = this.up('window').panel;
    					var win = Ext.create('Voyant.widget.CategoriesBuilder', {
    						panel: panel,
    						height: panel.getApplication().getViewport().getHeight()*0.75,
    						width: panel.getApplication().getViewport().getWidth()*0.75
    					});
    					win.on('close', function(win) {
    						var id = win.getCategoriesId();
    						if (id !== undefined) {
	    						var combo = this.down('combo');
								var name = id;
								combo.getStore().add({name: name, value: id});
								combo.setValue(id);
								
								this.up('window').panel.setApiParam('categories', id);
    						}
    					}, this);
    					this.setBuilderWin(win);
    				}
    				
    				var categoriesId = this.down('combo').getValue();
    				this.getBuilderWin().setCategoriesId(categoriesId);
					this.getBuilderWin().show();
    			},
    			scope: this
    		}]
    	});
		
		this.callParent(arguments);
	}
});

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
    		save: 'Save',
    		features: 'Features',
    		category: 'Category',
    		
    		color: 'Color',
    		font: 'Font',
    		orientation: 'Orientation'
    	},
    	api: {
    		stopList: 'auto',
    		query: undefined
    	},
    	features: {
        	color: {
        		xtype: 'colorfield',
        		format: '#hex6'
//        		,listeners: {
//        			render: function(field) {
//        				field.on('change', function(field, color) {
//        					field.inputEl.setStyle('background-color', color);
//        				});
//        			}
//        		}
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
        	},
        	orientation: {
        		xtype: 'combobox',
        		queryMode: 'local',
        		displayField: 'name',
        		valueField: 'value',
        		store: {
        			fields: ['name', 'value'],
        			data: [{name: 'Horizontal', value: 0}, {name: 'Vertical', value: 90}]
        		}
        	}
        }
    },
    config: {
    	corpus: undefined,
    	categoriesManager: undefined,
    	builderWin: undefined,
    	addCategoryWin: undefined,
    	categoriesId: undefined
    },
    
    // window defaults
    closeAction: 'hide',
    modal: true,
	height: 250,
	width: 500,

    constructor: function(config) {
    	config = config || {};
    	
    	if (config.panel) {
    		this.panel = config.panel;
    		this.app = this.panel.getApplication();
    	} else {
    		if (window.console) {
    			console.warn('can\'t find panel!');
    		}
    	}
    	
    	this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
    	this.callParent(arguments);
    },
    
    initComponent: function() {
    	Ext.apply(this, {
    		header: false,
    		layout: 'fit',
    		onEsc: Ext.emptyFn,
    		items: {
	    		xtype: 'tabpanel',
	    		title: this.localize('title'),
	    		tabBarHeaderPosition: 1,
	    		items: [{
		    		layout: 'border',
		    		title: this.localize('categories'),
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
		    								text = text.substr(0, text.length-2);
		    								if (text.length > 20) {
		    									text = text.substr(0, 20) + '...';
		    								}
		    								return text;
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
		                    		this.getAddCategoryWin().show();
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
	    		}]
    		},
    		buttons: [{
				text: this.localize('cancel'),
				handler: function(btn) {
					this.setCategoriesId(undefined);
					btn.up('window').close();
				},
				scope: this
			},{
				text: this.localize('save'),
				handler: function(btn) {
					this.processFeatures();
					this.app.setColorTermsFromCategoryFeatures();
					this.app.saveCategoryData().then(function(id) {
						this.setCategoriesId(id);
						btn.up('window').close();
					}, function() {
						this.setCategoriesId(undefined);
						btn.up('window').close();
					}, null, this);
				},
				scope: this
			}],
			listeners: {
				show: function() {
					// check to see if the widget value is different from the API
					if (this.getCategoriesId() && this.getCategoriesId()!=this.getApiParam("categories")) {
		    			this.app.loadCategoryData(this.getCategoriesId()).then(function(data) {
							this.buildCategories();
							this.buildFeatures();
						}, null, null, this);
					} else {
						this.buildCategories();
						this.buildFeatures();
					}					
					this.down('tabpanel').setActiveTab(0);
				},
				afterrender: function(builder) {
					builder.on('loadedCorpus', function(src, corpus) {
		    			this.setCorpus(corpus);
			    		var terms = this.queryById('terms');
			    		terms.getStore().load();
		    		}, builder);
		    		
					this.panel.on('loadedCorpus', function(src, corpus) {
	    				builder.fireEvent('loadedCorpus', src, corpus);
	    			}, builder);
	    			if (this.panel.getCorpus && this.panel.getCorpus()) {builder.fireEvent('loadedCorpus', builder, this.panel.getCorpus());}
	    			else if (this.panel.getStore && this.panel.getStore() && this.panel.getStore().getCorpus && this.panel.getStore().getCorpus()) {
	    				builder.fireEvent('loadedCorpus', builder, this.panel.getStore().getCorpus());
	    			}
				},
				scope: this
			}
    	});
    	
    	this.setAddCategoryWin(Ext.create('Ext.window.Window', {
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
	    				return this.app.getCategoryTerms(val) === undefined ? true : this.localize('exists');
	    			}.bind(this),
	    			enableKeyEvents: true,
	    			listeners: {
	    				keypress: function(field, evt) {
	    					if (evt.getKey() === Ext.event.Event.ENTER) {
	    						field.up('form').queryById('addCategoryButton').click();
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
	    			itemId: 'addCategoryButton',
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
    	
    	this.callParent(arguments);
    },
    
    addCategory: function(name) {
    	this.app.addCategory(name);
    	
    	this.queryById('features').getStore().add({category: name});

    	var termsData = [];
    	var terms = this.app.getCategoryTerms(name);
    	if (terms !== undefined) {
    		for (var i = 0; i < terms.length; i++) {
    			termsData.push({term: terms[i]});
    		}
    	}
    	
    	var grid = this.queryById('categories').add({
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
//    						this.app.setCategoryFeature(name, 'color', color);
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
    			beforedrop: function(node, data) {
    				// remove duplicates
    				var app = this.up('categoriesbuilder').app;
    				for (var i = data.records.length-1; i >= 0; i--) {
    					var term = data.records[i].get('term');
    					if (app.getCategoryForTerm(term) !== undefined) {
    						data.records.splice(i, 1);
    					}
    				}
    			},
    			drop: function(node, data) {
    				data.view.getSelectionModel().deselectAll();
    				this.getSelectionModel().deselectAll();
    				
    				var app = this.up('categoriesbuilder').app;
    				var terms = [];
    				for (var i = 0; i < data.records.length; i++) {
    					var term = data.records[i].get('term');
    					if (app.getCategoryForTerm(term) === undefined) {
    						terms.push(term);
    					}
    				}
    				app.addTerms(name, terms);
    				
    				var source = data.view.up('grid');
    				if (source.category) {
    					app.removeTerms(source.category, terms);
    				}
    			}
    		}
    	});
    	
    	var titleEditor = new Ext.Editor({
    		updateEl: true,
    		alignment: 'l-l',
    		autoSize: {
    			width: 'boundEl'
    		},
    		field: {
    			xtype: 'textfield',
    			allowBlank: false,
    			validator: function(val) {
    				return this.app.getCategoryTerms(val) === undefined || val ===  grid.getTitle() ? true : this.localize('exists');
    			}.bind(this)
    		},
    		listeners: {
    			complete: function(ed, newvalue, oldvalue) {
    				this.app.renameCategory(oldvalue, newvalue);
    				this.buildFeatures();
    			},
    			scope: this
    		}
    	});
    	
    	grid.header.getTitle().textEl.on('dblclick', function(e, t) {
    		titleEditor.startEdit(t);
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
    	
		this.app.removeCategory(name);
    },
    
    addFeature: function(name) {
		this.app.addFeature(name);
		this.buildFeatures();
    },
    
    buildFeatures: function() {
    	this.queryById('features').getStore().removeAll();
    	
    	var fields = ['category'];
		var columns = [{
			sortable: false,
			text: this.localize('category'),
			dataIndex: 'category',
			flex: 1
		}];
		var data = [];
		
		for (var category in this.app.getCategories()) {
			data.push({category: category});
		}
		
		var features = this.app.getFeatures();
		var featuresConfigs = Ext.ClassManager.getClass(this).features;
		
		for (var feature in features) {
			fields.push(feature);
			
			var featureConfig = featuresConfigs[feature];
			var widgetConfig = Ext.applyIf({
				feature: feature,
				listeners: {
					change: function(cmp, newvalue) {
						if (cmp.rendered) {
							var rowIndex = cmp.up('gridview').indexOf(cmp.el.up('table'));
							var record = cmp.up('grid').getStore().getAt(rowIndex);
							if (record) {
								record.set(cmp.feature, newvalue);
							} else {
								if (window.console) {
									console.warn('no record for', rowIndex, cmp);
								}
							}
						}
					},
					scope: this
				}
			}, featureConfig);
			if (featureConfig.listeners) {
				Ext.applyIf(widgetConfig.listeners, featureConfig.listeners);
			}
			
			columns.push({
				sortable: false,
				hideable: false,
				text: this.localize(feature),
				dataIndex: feature,
				flex: 0.5,
				xtype: 'widgetcolumn',
				widget: widgetConfig
			});
			
			for (var category in this.app.getCategories()) {
				var value = this.app.getCategoryFeature(category, feature);
				for (var i = 0; i < data.length; i++) {
					if (data[i].category == category) {
						data[i][feature] = value;
						break;
					}
				}
			}
		}
		
		var store = Ext.create('Ext.data.JsonStore', {
			fields: fields,
			data: data
		});
		this.queryById('features').reconfigure(store, columns);
    },
	
	processFeatures: function() {
		var store = this.queryById('features').getStore();
		var features = Object.keys(this.app.getFeatures());
		store.each(function(record) {
			var category = record.get('category');
			features.forEach(function(feature) {
				var featureValue = record.get(feature);
				if (featureValue !== undefined) {
					this.app.setCategoryFeature(category, feature, featureValue);
				}
			}, this)
		}, this)
	},

    buildCategories: function() {

    	this.queryById('categories').removeAll();
    	
    	var cats = this.app.getCategories();
    	for (var key in cats) {
    		this.addCategory(key);
    	}
    }
});