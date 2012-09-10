Ext.Loader.setConfig({
	enabled: true,
	paths: {
		'Voyant': 'resources/app'
	}
});
Ext.require('Voyant.Application');

Ext.onReady(function() {
	Voyant.application = Ext.create('Voyant.Application', {
		name: 'Voyant',
		appFolder: 'resources/app',
		
		models: ['Corpus', 'Document'],
		stores: ['Corpus', 'Documents'],
		
		requires: 'Voyant.view.document.Grid',
		
		launch: function() {
			Ext.create('Ext.container.Viewport', {
				items: {
					xtype: 'documentgrid'
				}
			});
		}
	});
});