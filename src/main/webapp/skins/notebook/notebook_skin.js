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
		    'Voyant.tools.CorpusGrid.Controller',
		    'Voyant.tools.DocumentTypeFrequenciesGrid.Controller'
		],
		// temp fix since views config is broken in 4.1.1
		requires: [
		    'Voyant.tools.CorpusGrid.View',
		    'Voyant.tools.DocumentTypeFrequenciesGrid.View'
		],
		
		launch: function() {
			Ext.create('Ext.container.Viewport', {
				layout: 'border',
				items: [{
					region: 'center',
					xtype: 'corpusGrid'
				},{
					region: 'east',
					xtype: 'documentTypeFrequenciesGrid',
					split: true
				}]
			});
		}
	});
});