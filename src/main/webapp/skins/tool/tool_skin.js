Ext.Loader.setConfig({
	enabled: true,
	paths: {
		'Voyant': '../resources/app'
	}
});
Ext.require(['Voyant.Application', 'Voyant.Tool']);

function initTool(tool) {
	var path = Ext.Loader.getPath('Voyant.tools.'+tool+'.View');
	Ext.Loader.loadScript({
		url: path,
		onLoad: function() {
			Ext.require('Voyant.tools.'+tool+'.Controller');
			var toolXtype = Voyant.tools[tool].View.xtype;
			createApplication({
				xtype: toolXtype
			});
		},
		onError: function(error) {
			createApplication({
				html: '<div style="margin: 10px; color: #B23B2E;">The specified tool does not exist.</div>'
			});
		}
	});
	
	function createApplication(toolConfig) {
		Voyant.application = Ext.create('Voyant.Application', {
			name: 'Voyant',
			appFolder: '../resources/app',

			launch: function() {
				Ext.create('Ext.container.Viewport', {
					layout: 'fit',
					items: toolConfig
				});
			}
		});
	}
}