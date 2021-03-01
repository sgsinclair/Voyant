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
			var view = me.getViewport()
			view.mask(this.localize("fetchingState"));
			Ext.state.Manager.getProvider().load(stateId).then(function() {
				me.loadState();
			}).always(function() {
				view.unmask();
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

	_getPanelPath: function(panel) {
		var path = '';
		var panelParent = panel;
		while(panelParent !== undefined) {
			var index = this._getPanelIndex(panelParent);
			path = panelParent.getXType()+(index > -1 ? '['+index+']' : '')+'|'+path;
			panelParent = panelParent.up();
		}
		path = path.substring(0, path.length-1); // remove trailing |
		return path;
	},

	_getPanelIndex: function(panel) {
		var xtype = panel.getXType();
		var index = -1;
		var sibs = panel.up() && panel.up().query('> '+xtype);
		if (sibs && sibs.length > 1) {
			index = sibs.indexOf(panel);
		}
		return index;
	},

	saveState: function() {
		var viewport = this.getViewport();
		var panels = viewport.query("panel,chart");
		for (var i=0; i<panels.length; i++) {
			var panel = panels[i];
			if (panel.getId && panel.getModifiedApiParams) {
				for (var key in panel.getModifiedApiParams()) {
					if (key !== 'corpus') {
						var path = this._getPanelPath(panel);
						path = path+'>'+key;
						Ext.state.Manager.set(path, panel.getApiParam(key));
					}
				}
			}
		}
		var stateId = Spyral.Util.id(32);
		Ext.state.Manager.getProvider().save(stateId);
		this.setApiParam('state', stateId);
	},

	loadState: function() {
		var viewport = this.getViewport();
		var panels = viewport.query("panel,chart");
		for (var i=0; i<panels.length; i++) {
			var panel = panels[i];
			if (panel.getApiParams) {
				var state = this.getPanelState(panel);
				for (var key in state) {
					var stateValue = state[key];
					if (stateValue !== undefined && stateValue !== panel.getApiParam(key)) {
						console.log(panel.getId()+' setting: '+key+' > '+stateValue);
						panel.setApiParam(key, stateValue);
					}
				}
			}
		}
	},

	getPanelState: function(panel) {
		var state = {};
		var path = this._getPanelPath(panel);
		for (var key in panel.getApiParams()) {
			var keypath = path+'>'+key;
			var value = Ext.state.Manager.get(keypath);
			if (value !== undefined) {
				state[key] = value;
			}
		}
		return state;
	}

});

Ext.define('Voyant.util.StateStorageProvider', {
	extend: 'Ext.state.Provider',
   
	constructor: function(application) {
		this.callParent(arguments);

		this.application = application;
		this.state = {};
	},
	
	set: function(name, value) {
		this.clear(name);
		if (value != null) {
			this.state[name] = value;
			this.callParent(arguments);
		}
	},

	clear: function(name) {
		delete this.state[name];
		this.callParent(arguments);
	},

	load: function(stateId) {
		var me = this;

		var dfd = new Ext.Deferred();

		if (stateId !== undefined) {
			me.application.getStoredResource(stateId).then(function(resource) {
				Object.assign(me.state, resource);
				dfd.resolve();
			}, function() {
				console.warn('no resource stored for: '+stateId);
				dfd.reject();
			});
		}

		return dfd.promise;
	},

	save: function(stateId) {
		var me = this;

		me.application.storeResource(stateId, me.state).then(function() {
			console.log('state stored: '+stateId)
		}, function() {
			console.warn('error storing: '+stateId);
		})
	}
});
