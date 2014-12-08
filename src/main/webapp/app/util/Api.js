Ext.define('Voyant.util.Api', {
	constructor: function(config) {
		this.api = {};
		Ext.apply(this.api, Ext.ClassManager.getClass(this).superclass.self.api);
		Ext.apply(this.api, Ext.ClassManager.getClass(this).api);
    	var queryParams = Ext.Object.fromQueryString(document.location.search);
    	for (var key in this.api) {
    		if (key in queryParams) {
    			this.setApiParam(key, queryParams[key]);
    		}
    	}
	},
	getApiParam: function(key, defaultValue) {
		return this.api[key]!==undefined ? this.api[key] : defaultValue
	},
	getApiParams: function(keys, keepEmpty) {
		if (keys) {
			var api = {};
			if (Ext.isString(keys)) {keys=[keys]}
			keys.forEach(function(key) {
				var val = this.getApiParam(key);
				if (keepEmpty || !Ext.isEmpty(val)) {api[key]=val;}

			}, this);
			return api;
		}
		else {
			return this.api
		}
	},
	
	setApiParams: function(config) {
		for (var key in config) {this.setApiParam(key, config[key])}
	},
	
	setApiParam: function(key, value) {
		this.api[key]=value;
	}
});