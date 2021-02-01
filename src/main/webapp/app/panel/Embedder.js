Ext.define('Voyant.panel.Embedder', {
	extend: 'Ext.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.embedder',
	statics: {
		i18n: {
			title: 'Embedded',
			url: 'URL',
			go: 'Go'
		},
		api: {
			url: undefined
		},
		glyph: 'xf0c1@FontAwesome'
	},
	constructor: function(config) {
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
		this.setApiParam('url', config.url);

        this.callParent(arguments);
		
		this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
	initComponent: function() {
		Ext.apply(this, {
			title: this.localize('title'),
			layout: {
				type: 'fit'
			},
			items: {
				xtype: 'uxiframe',
				src: this.getApiParam('url')
			},
			tbar: [{
				xtype: 'textfield',
				value: this.getApiParam('url'),
				emptyText: this.localize('url'),
				listeners: {
					specialkey: function(field, e){
						if (e.getKey() == e.ENTER) {
							field.up('panel').down('uxiframe').load(field.getValue());
						}
					}
				}
			},{
				xtype: 'button',
				text: this.localize('go'),
				handler: function(btn) {
					var url = btn.prev('textfield').getValue();
					btn.up('panel').down('uxiframe').load(url);
				}
			}]
		});
		
		this.callParent();
	},
	loadUrl: function(url) {
		this.down('uxiframe').load(url);
	}
});