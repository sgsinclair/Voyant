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
		
		controllers: ['document.Grid', 'documentTypes.Grid'],
		
		requires: [
			'Voyant.view.document.Grid',
			'Voyant.view.documentTypes.Grid'
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