Ext.define('Voyant.util.Toolable', {
	requires: ['Voyant.util.Localization'],
	statics: {
		i18n: {
			maximizeTip: {en: 'Open this tool in a new window'},
			plusTip: {en: 'Choose another tool for this panel location (this will replace the current tool).'},
			saveTip: {en: 'Export a URL, data or a bibliographic reference.'},
			gearTip: {en: 'Define options for this tool.'},
			helpTip: {en: 'No tool-specific help is currently available. Click this icon to visit the <a href="http://docs.voyant-tools.org/" target="_blank">Voyant Tools Documentation</a> site.'}
		}
	},
	constructor: function(config) {
		config = config || {};
		var toolsMap = {
				maximize: this.maximizeToolClick,
				plus: undefined,
				save: undefined,
				gear: undefined,
				help: this.helpToolClick
		}
		var tools = [];
		for (var tool in toolsMap) {
			if (config.includeTools && !config.includeTools[tool]) {continue}
			tools.push({
				type: tool,
				tooltip: this.localize(tool+"Tip"),
				callback: toolsMap[tool]
			})
		}
		Ext.apply(this, {
			tools: tools
		})
	},
	maximizeToolClick: function(panel) {
		var name = Ext.getClass(panel).getName();
		var parts = name.split(".");
		url = panel.getBaseUrl()+"tool/"+parts[parts.length-1]+"/";
		params = panel.getApiParams();
		if (!params.corpus && panel.getCorpus && panel.getCorpus()) {
			params.corpus = panel.getCorpus().getId();
		}
		if (params) {url += "?"+Ext.Object.toQueryString(params);}
		panel.openUrl(url);
	},
	helpToolClick: function(panel) {
		panel.openUrl( "http://docs.voyant-tools.org/");
	}
});