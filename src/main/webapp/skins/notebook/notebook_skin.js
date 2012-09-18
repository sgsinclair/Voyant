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
		stores: ['Corpus', 'Documents', 'DocumentTypes'],
		controllers: [
		    'Voyant.tools.DocumentGrid.Controller',
		    'Voyant.tools.DocumentTypesGrid.Controller'
		],
		// temp fix since views config is broken in 4.1.1
		requires: [
		    'Voyant.tools.DocumentGrid.View',
		    'Voyant.tools.DocumentTypesGrid.View'
		],
		
		launch: function() {
			Ext.create('Ext.container.Viewport', {
				layout: 'border',
				items: [{
					region: 'center',
					xtype: 'documentGrid'
				},{
					region: 'east',
					xtype: 'documentTypesGrid',
					split: true
				}]
			});
		}
	});
});