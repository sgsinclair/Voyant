Ext.define('Voyant.util.Api', {
	constructor: function(config) {
		this.api = {} // initialize here to keep it with the instance
		var api = Ext.ClassManager.getClass(this).api;
		for (var key in api) {
			if (Ext.isDefined(api[key])) {
				var val = Ext.isObject(api[key]) ? api[key].value : api[key]
				if (Ext.isDefined(val)) {this.api[key] = val;}
			}
		}
    	var queryParams = Ext.Object.fromQueryString(document.location.search);
    	for (var key in queryParams) {
    		if (this.api[key]!==undefined) {this.setApiParam(key, queryParams[key])}
    	}
	},
	getApiParam: function(key, defaultValue) {
		return this.api[key]!==undefined ? this.api[key] : defaultValue
	},
	getApiParams: function() {
		return this.api
	},
	
	setApiParams: function(config) {
		for (var key in config) {this.setApiParam(key, config[key])}
	},
	
	setApiParam: function(key, value) {
		this.api[key]=value;
	}
});