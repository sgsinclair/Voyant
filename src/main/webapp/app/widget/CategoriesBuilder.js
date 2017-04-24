Ext.define('Voyant.widget.CategoriesBuilder', {
    extend: 'Ext.container.Container',
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
    		confirmRemove: 'Are you sure you want to remove the category?'
    	},
    	api: {
    		stopList: 'auto',
    		query: undefined
    	}
    },
    config: {
    	corpus: undefined,
    	categoriesManager: undefined,
    	categoryWin: undefined,
    	parentPanel: undefined
    },

    constructor: function(config) {
    	config = config || {};
    	var categoriesManager = config.categoriesManager ? config.categoriesManager : Ext.create('Voyant.util.CategoriesManager');
    	this.setCategoriesManager(categoriesManager);
    	
    	this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
    	this.callParent(arguments);
    },
    
    initComponent: function() {
    	Ext.apply(this, {
    		title: this.localize('title'),
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
	    				return this.getCategoriesManager().getTermsForCategory(val) === undefined ? true : this.localize('exists');
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
    		
    		var panel = builder.findParentBy(function(clz) {
    			return clz.mixins['Voyant.panel.Panel'];
    		});
    		if (panel == null) {
    			panel = builder.up('window').panel;
    		}
    		if (panel) {
    			this.setParentPanel(panel);
    			panel.on('loadedCorpus', function(src, corpus) {
    				builder.fireEvent('loadedCorpus', src, corpus);
    			}, builder);
    			if (panel.getCorpus && panel.getCorpus()) {builder.fireEvent('loadedCorpus', builder, panel.getCorpus());}
    			else if (panel.getStore && panel.getStore() && panel.getStore().getCorpus && panel.getStore().getCorpus()) {
    				builder.fireEvent('loadedCorpus', builder, panel.getStore().getCorpus());
    			}
    		} else {
    			if (window.console) {
    				console.warn('couldn\'t find parent panel for CategoriesBuilder');
    			}
    		}
    		
    		this.buildCategories();
    	}, this);
    	
    	this.callParent(arguments);
    },
    
    addCategory: function(name) {
    	var catParent = this.queryById('categories');
    	
    	var color;
    	var termsData = [];
    	var catman = this.getCategoriesManager();
    	var terms = catman.getTermsForCategory(name);
    	if (terms === undefined) {
    		catman.addCategory(name);
    		catman.addAttribute('color');
    	
	    	var index = catParent.query('grid').length;
	    	color = this.getParentPanel().getApplication().getColor(index, true);
	    	catman.setCategoryAttribute(name, 'color', color);
    	} else {
    		for (var i = 0; i < terms.length; i++) {
    			termsData.push({term: terms[i]});
    		}
    		color = catman.getCategoryAttribute(name, 'color');
    	}
    	
    	return catParent.add({
    		title: name,
    		header: {
    			items: [{
    				xtype: 'colorbutton',
    				format: '#hex6',
    				value: color,
    				width: 30,
    				height: 15,
    				listeners: {
    					change: function(btn, color, pcolor) {
    						this.getCategoriesManager().setCategoryAttribute(name, 'color', color);
    					},
    					afterrender: function(btn) {
    						var popup = btn.getPopup();
    						popup.listeners = {
    							focusleave: function(sel, evt) {
    								sel.close(); // fix for conflict between selector and parent modal window, when you click outside of the selector
    							}
    						};
    					},
    					scope: this
    				}
    			}]
    		},
    		xtype: 'panel',
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
    						this.queryById('categories').remove(panel);
    	    				this.getCategoriesManager().removeCategory(name);
    					}
    				}, this);
    			},
    			scope: this
    		}],
    		items: [{
	    		xtype: 'grid',
	    		category: name,
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
    		}]
    	});
    },
    
    buildCategories: function() {
    	var cats = this.getCategoriesManager().getCategories();
    	for (var key in cats) {
    		this.addCategory(key);
    	}
    }
});