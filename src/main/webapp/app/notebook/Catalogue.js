Ext.define('Voyant.notebook.Catalogue', {
	extend: 'Ext.Component',
	requires: [],
	alias: 'widget.notebookcatalogue',
	statics: {
		i18n: {
		}
	},

	window: undefined,
	
	store: undefined,
	template: undefined,

	config: {},

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
				title: 'Notebooks Catalogue',
				width: 700,
				height: 550,
				layout: {
					type: 'vbox'
				},
				closeAction: 'hide',
				items: [{
					xtype: 'toolbar',
					height: 30,
					hidden: true,
					items: [{
						xtype: 'splitbutton',
						text: 'Sort',
						glyph: 'xf161@FontAwesome',
						menu: {
							defaults: {
								xtype: 'menucheckitem',
								group: 'sortfield'
							},
							items: [{
								itemId: 'id',
								text: 'ID'
							},{
								itemId: 'created',
								text: 'Created'
							},{
								itemId: 'modified',
								text: 'Modified',
								checked: true
							},{
								itemId: 'title',
								text: 'Title'
							},{
								itemId: 'author',
								text: 'Author'
							}],
							listeners: {
								click: function(menu, item) {
									var sortDir = menu.up().getGlyph().glyphConfig === 'xf161@FontAwesome' ? 'DESC' : 'ASC';
									var sortField = item.itemId;
									this.store.sort(sortField, sortDir);
									this.window.down('#catalogue').refresh();
								},
								scope: this
							}
						},
						handler: function(but) {
							var sortDir;
							if (but.getGlyph().glyphConfig === 'xf161@FontAwesome') {
								but.setGlyph('xf160@FontAwesome');
								sortDir = 'ASC';
							} else {
								but.setGlyph('xf161@FontAwesome');
								sortDir = 'DESC';
							}
							var sortField = but.menu.down('[checked=true]').itemId;
							this.store.sort(sortField, sortDir);
							this.window.down('#catalogue').refresh();
						},
						scope: this
					}]
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
					selectedItemCls: 'catalogue-notebook-selected'
				}],
				buttons: [{
					text: 'Load Selected Notebook',
					handler: function(but) {
						var record = this.window.down('#catalogue').getSelection()[0]
						if (record !== undefined) {
							this.fireEvent('notebookSelected', this, record.get('id'))
						}
					},
					scope: this
				}]
			})
		}
		this.window.show();
		this.getNotebooks();
	},

	hideWindow: function() {
		if (this.window !== undefined) {
			this.window.close();
		}
	},

	getNotebooks(query, config) {
		this.window.mask('Loading');
		this.window.down('#catalogue').getSelectionModel().deselectAll();
    	var me = this;
		Spyral.Load.trombone({
			tool: 'notebook.GitNotebookManager',
			action: 'catalogue',
			limit: 100,
			noCache: 1
		}).then(function(json) {
			me.window.unmask();
			var notebooks = JSON.parse(json.notebook.data);
			me.store.loadRawData(notebooks);
		}).catch(function(err) {me.window.unmask()});
	}
});
