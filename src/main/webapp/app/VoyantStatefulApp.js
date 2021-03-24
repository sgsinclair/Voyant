Ext.define('Voyant.VoyantStatefulApp', {
	extend: 'Voyant.VoyantCorpusApp',
	name: 'VoyantStatefulApp',
	mixins: ['Voyant.util.Storage'],
	
	statics: {
		i18n: {
			fetchingState: 'Fetching State'
		},
		api: {
			state: undefined
		}
	},

	constructor: function() {
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);

		Ext.state.Manager.setProvider(new Voyant.util.StateStorageProvider(this));

		this.callParent(arguments);
	},

	launch: function(config) {
		var me = this;
		var args = arguments;

		var stateId = this.getApiParam('state');
		if (stateId !== undefined) {
			this.fetchState(stateId).always(function() {
				// hack based on: https://stackoverflow.com/a/11522394
				var caller = arguments.callee.caller;
				caller.$owner = me.superclass.superclass;
				caller.$name = 'launch';
				me.callParent(args);
			});
		} else {
			this.callParent(arguments);
		}
	},

	fetchState: function(stateId) {
		var me = this;
		
		var view = this.getViewport()
		view.mask(this.localize("fetchingState"));
		
		return Ext.state.Manager.getProvider().load(stateId).then(function() {
			me.setPanelsFromState();
		}).always(function() {
			view.unmask();
		});
	},

	saveState: function(modifiedOnly) {
		modifiedOnly = modifiedOnly === undefined ? false : modifiedOnly;
		
		var PARAMS_TO_IGNORE = ['corpus'];

		var panels = this.getViewport().query("panel,chart");
		for (var i=0; i<panels.length; i++) {
			var panel = panels[i];
			if (panel.api) {
				var stateObject = {};
				var path = panel.getPath();

				var params = modifiedOnly ? panel.getModifiedApiParams() : panel.getApiParams();
				for (var key in params) {
					if (PARAMS_TO_IGNORE.indexOf(key) === -1) {
						stateObject[key] = params[key];
					}
				}

				var state = panel.getState();
				for (var key in state) {
					stateObject[key] = state[key];
				}

				Ext.state.Manager.set(path, stateObject);
			}
		}

		var stateId = Spyral.Util.id(32);
		Ext.state.Manager.getProvider().save(stateId);
		this.setApiParam('state', stateId);
	},

	setPanelsFromState: function() {
		var panels = this.getViewport().query("panel,chart");
		for (var i=0; i<panels.length; i++) {
			var panel = panels[i];
			if (panel.api) {
				var state = this.getStateForPanel(panel);
				var apiParams = panel.getApiParams();
				for (var key in apiParams) {
					if (state[key] !== undefined) {
						// console.log(panel.getId()+' setting: '+key+' > '+state[key]);
						panel.setApiParam(key, state[key]);
					}
				}
				if (panel.applyState) {
					panel.applyState(state);
				} else {
					console.log('panel has no applyState: ', panel);
				}
			}
		}
	},

	getStateForPanel: function(panel) {
		var state = {};
		var path = panel.getPath();
		var stateObject = Ext.state.Manager.get(path);
		return stateObject;
		// var apiParams = panel.getApiParams();
		// for (var key in apiParams) {
		// 	var apiValue = apiParams[key];
			
		// 	var keypath = path+'>'+key;
		// 	var stateValue = Ext.state.Manager.get(keypath);

		// 	if (apiValue !== stateValue) {
		// 		console.log('mismatch for '+keypath);
		// 	}
		// 	if (apiValue !== undefined) {
		// 		state[key] = apiValue;
		// 	}
		// }
		// return state;
	}

});

Ext.define('Voyant.util.StateStorageProvider', {
	extend: 'Ext.state.Provider',
   
	constructor: function(application) {
		this.callParent(arguments);

		this.application = application;
		this.state = {};
	},
	
	// get: function(key, defaultValue) {
	// 	var value = this.callParent(arguments);
	// 	console.log('state get: '+key+' - '+value);
	// 	return value;
	// },

	// set: function(key, value) {
	// 	if (value != null) {
	// 		this.state[key] = value;
	// 		console.log('state set: '+key+' - '+value);
	// 		this.fireEvent('statechange', this, key, value);
	// 	}
	// },

	// clear: function(key) {
	// 	console.log('state clear: '+key);
	// 	delete this.state[key];
	// 	this.fireEvent('statechange', this, key, null);
	// },

	load: function(stateResourceId) {
		var me = this;

		var dfd = new Ext.Deferred();

		if (stateResourceId !== undefined) {
			me.application.getStoredResource(stateResourceId).then(function(resource) {
				var decodedState = {};
				for (var key in resource) {
					decodedState[key] = me.decodeValue(resource[key]);
				}
				Object.assign(me.state, decodedState);
				console.log('load state', me.state);
				dfd.resolve();
			}, function() {
				console.warn('no resource stored for: '+stateResourceId);
				dfd.reject();
			});
		}

		return dfd.promise;
	},

	save: function(stateResourceId) {
		var me = this;

		var state = {};
		for (var key in me.state) {
			state[key] = me.encodeValue(me.state[key]);
		}
		console.log('save state', state);

		me.application.storeResource(stateResourceId, state).then(function() {
			console.log('state stored: '+stateResourceId)
		}, function() {
			console.warn('error storing: '+stateResourceId);
		})
	}
});
