Ext.define('Voyant.util.Api', {
	constructor: function(config) {
		var apis = [];
		if (!this.isApplication) {
			var app = this.getApplication();
			this.addParentApi(apis, Ext.ClassManager.getClass(app)); // gather class params
			if (app.getApiParams) {
				apis.splice(0, 0, this.getApplication().getApiParams()); // now add instance params
			}
		}
		this.addParentApi(apis, Ext.ClassManager.getClass(this)); // add params from this class and parents
		
		this.api = {};
		apis.forEach(function(a) {
			for (key in a) {
				this.api[key] = {initial: a[key], value: a[key]} // overwrite previous entries
			}
		}, this)
		
    	var queryParams = Ext.Object.fromQueryString(document.location.search);
    	for (var key in queryParams) {
    		if (this.api[key]) {
    			this.setApiParam(key, queryParams[key]);
    		}
    	}
	},
	addParentApi: function(apis, clz) {
		if (clz.api) {apis.splice(0,0, clz.api)} // add to front
		if (clz.superclass) {this.addParentApi(apis, clz.superclass.self)}
	},
	getApiParam: function(key, defaultValue) {
		return this.api[key]!==undefined ? this.api[key].value : defaultValue
	},
	getApiParams: function(keys, keepEmpty) {
		keys = keys || Object.keys(this.api);
		var api = {};
		if (Ext.isString(keys)) {keys=[keys]}
		keys.forEach(function(key) {
			var val = this.getApiParam(key);
			if (keepEmpty || !Ext.isEmpty(val)) {api[key]=val;}

		}, this);
		return api;
	},
	
	getModifiedApiParams: function() {
		var api = {};
		for (var key in this.api) {
			if (this.api[key].initial!=this.api[key].value) {
				api[key]=this.api[key].value
			}
		}
		return api
	},
	
	setApiParams: function(config) {
		for (var key in config) {this.setApiParam(key, config[key])}
	},
	
	setApiParam: function(key, value) {
		if (this.api[key]) {this.api[key].value=value;}
	}
});