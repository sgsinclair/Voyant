Ext.define('Voyant.notebook.Catalogue', {
	extend: 'Ext.Component',
	requires: ['Voyant.widget.Facet','Voyant.data.store.NotebookFacets'],
    mixins: ['Voyant.util.Localization'],
	alias: 'widget.notebookcatalogue',
	statics: {
		i18n: {
			title: 'Notebooks Catalogue',
			browse: 'Browse Notebooks',
			keywords: 'Keywords',
			author: 'Author',
			language: 'Language',
			license: 'License',
			search: 'Search',
			noResults: 'No matching notebooks',
			suggested: 'Suggested Notebooks',
			load: 'Load Selected Notebook'
		}
	},

	window: undefined,
	
	store: undefined,
	template: undefined,

	config: {
		facets: {}
	},

	constructor: function() {
		this.store = Ext.create('Ext.data.JsonStore', {
			fields: [
				{name: 'id'},
				{name: 'author'},
				{name: 'title'},
				{name: 'description'},
				{name: 'keywords'},
				{name: 'language'},
				{name: 'license'},
				{name: 'created', type: 'date'},
				{name: 'modified', type: 'date'},
				{name: 'version'}
			]
		});
		this.template = new Ext.XTemplate(
			'<tpl for=".">',
				'<div class="catalogue-notebook">',
					'<div class="id">{id}</div>',
					'<div class="title nowrap" title="{title}">{title}</div>',
					'<div class="author nowrap"><i class="fa fa-user" aria-hidden="true"></i> {author}</div>',
					'<div class="dates"><span class="date"><i class="fa fa-clock-o" aria-hidden="true"></i> {[Ext.Date.format(values.modified, "M j Y")]}</span></div>',
				'</div>',
			'</tpl>'
		);
		this.callParent(arguments);
	},

	initComponent: function(config) {
		this.callParent(arguments);
	},

	showWindow: function() {
		if (this.window === undefined) {
			this.window = Ext.create('Ext.window.Window', {
				title: this.localize('title'),
				width: 800,
				height: 675,
				modal: true,
				layout: 'border',
				items: [{
					xtype: 'panel',
					region: 'center',
					flex: 2,
					border: true,
					layout: {
						type: 'vbox',
						align: 'stretch'
					},
					items: [{
						xtype: 'toolbar',
						height: 30,
						layout: {
							type: 'hbox',
							pack: 'center'
						},
						items: [{xtype:'tbspacer', flex: .1},{
							xtype: 'textfield',
							itemId: 'queryfield',
							emptyText: this.localize('search'),
							flex: .8,
							enableKeyEvents: true,
							triggers: {
								search: {
									cls: 'fa-trigger form-fa-search-trigger',
									handler: function(cmp) {
										// var query = cmp.getValue();
										// if (query.trim().length > 0) {
										// 	this.getNotebooks([query]);
										// }
										this.getNotebooks();
									},
									scope: this
								}
							},
							listeners: {
								keyup: function(cmp, e) {
									if (e.getCharCode() === 13) {
										this.getNotebooks();
									}
								},
								scope: this
							}
						},{xtype:'tbspacer', flex: .1}]
					},{
						xtype: 'dataview',
						flex: 1,
						width: '100%',
						padding: 10,
						scrollable: 'vertical',
						itemId: 'catalogue',
						store: this.store,
						tpl: this.template,
						itemSelector: 'div.catalogue-notebook',
						overItemCls: 'catalogue-notebook-over',
						selectedItemCls: 'catalogue-notebook-selected',
						listeners: {
							itemdblclick: function(view, record, el) {
								this.fireEvent('notebookSelected', this, record.get('id'));
							},
							scope: this
						}
					}]
				},{
					xtype: 'panel',
					region: 'west',
					collapsible: true,
					title: this.localize('browse'),
					flex: 1,
					itemId: 'facets',
					layout: {
						type: 'accordion',
						animate: false,
						multi: true,
						align: 'stretch',
						hideCollapseTool: true
					},
					defaults: {
						xtype: 'facet',
						flex: 1
					},
					items: [{
						title: this.localize('keywords'),
						facet: 'facet.keywords',
						store: Ext.create('Voyant.data.store.NotebookFacets', {
							facet: 'facet.keywords'
						})
					},{
						title: this.localize('author'),
						facet: 'facet.author',
						store: Ext.create('Voyant.data.store.NotebookFacets', {
							facet: 'facet.author'
						})
					},{
						title: this.localize('language'),
						facet: 'facet.language',
						store: Ext.create('Voyant.data.store.NotebookFacets', {
							facet: 'facet.language'
						})
					},{
						title: this.localize('license'),
						facet: 'facet.license',
						store: Ext.create('Voyant.data.store.NotebookFacets', {
							facet: 'facet.license'
						})
					}]
				},{
					xtype: 'panel',
					region: 'east',
					collapsible: true,
					collapsed: true,
					title: this.localize('suggested'),
					flex: 1,
					items: [{

					}]
				}],
				closeAction: 'hide',
				buttons: [{
					text: this.localize('load'),
					handler: function(but) {
						var record = this.window.down('#catalogue').getSelection()[0]
						if (record !== undefined) {
							this.fireEvent('notebookSelected', this, record.get('id'))
						}
					},
					scope: this
				}]
			});
			this.window.query('#facets > facet').forEach(function(facetCmp) {
				facetCmp.getSelectionModel().on('selectionchange', this._handleFacetSelection.bind(this, facetCmp.facet))
				facetCmp.getStore().load();
			}, this);
		} else {
			// reset
			this.setFacets({});
			this.window.query('#facets > facet').forEach(function(facetCmp) {
				facetCmp.getSelectionModel().deselectAll();
			});
			this.window.down('#queryfield').setValue('');
			this.window.down('#catalogue').getSelectionModel().deselectAll();
			this.store.removeAll();
		}

		this.window.show();
	},

	hideWindow: function() {
		if (this.window !== undefined) {
			this.window.close();
		}
	},

	_handleFacetSelection: function(facet, model, selected) {
		var labels = [];
		selected.forEach(function(model) {
			labels.push({facet: facet, label: model.getLabel ? model.getLabel() : model.getTerm()})
		})
		this.getFacets()[facet] = labels;
		this.getNotebooks();
	},

	getNotebooks: function(queries) {
    	if (!queries) {
	    	queries = [];
			var facets = this.getFacets();
	    	for (facet in facets) {
	    		facets[facet].forEach(function(label) {
	        		queries.push(label.facet+":"+label.label);
	    		})
	    	}
			var queryfieldstring = this.window.down('#queryfield').getValue();
			if (queryfieldstring.trim().length > 0) {
				queries.push(queryfieldstring);
			}
			return this.getNotebooks(queries);
    	}
		if (queries.length === 0) {
			this.window.down('#catalogue').getSelectionModel().deselectAll();
			this.store.removeAll();
			return;
		}

		this.window.down('#catalogue').mask('Loading');
		this.window.down('#catalogue').getSelectionModel().deselectAll();

		var me = this;
		Spyral.Load.trombone({
			tool: 'notebook.NotebookFinder',
			query: queries,
			noCache: 1
		}).then(function(json) {
			me.window.down('#catalogue').unmask();
			me.store.loadRawData(json.catalogue.notebooks);
			me.store.sort('modified', 'DESC');
		}).catch(function(err) {
			me.window.unmask()
		});
	}
});
