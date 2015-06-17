
Ext.define('Voyant.panel.VoyantTabPanel', {
	extend: 'Ext.tab.Panel',
	alias: 'widget.voyanttabpanel',
	mixins: ['Voyant.panel.Panel'],
	statics: {
		i18n: {
		}
	},
	constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
	},
	initComponent: function() {
    	this.callParent(arguments);
	},
	listeners: {
		tabchange: function(panel, newTab) {
			this.tools = [];
			this.getHeader().tools = [];
			this.query("toolmenu").forEach(function(toolMenu) {
				toolMenu.destroy();
			})
			this.addTool(newTab.tools)
		},
		afterrender: function(panel) {
			this.fireEvent("tabchange", this, this.getActiveTab())
		}
	},
	showOptionsClick: function(panel) {
		debugger
		var tab = panel.getActiveTab();
		if (tab.showOptionsClick) {
			tab.showOptionsClick.apply(tab, arguments)
		}
	}
});