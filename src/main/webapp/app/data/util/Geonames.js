Ext.define('Voyant.data.util.Geonames', {
    mixins: ['Voyant.util.Localization'],
	config: {
		data: {},
		queries: undefined,
		corpus: undefined
	},
	constructor: function(config, opts) {
		config = config || {};
		this.callParent([config]);
		this.setCorpus(config.corpus);
	},
	load: function(params) {
		this.setData({});
		var dfd = Voyant.application.getDeferred(this);
		var me = this, localParams = {
			corpus: this.getCorpus().getAliasOrId(),
			queries: this.getQueries(),
			tool: 'corpus.Geonames'
		};
		Ext.apply(localParams, params || {});
		
		Ext.Ajax.request({
			url: Voyant.application.getTromboneUrl(),
			params: localParams,
			scope: this
		}).then(function(response) {
			var data = Ext.JSON.decode(response.responseText);
			if (data && data.geonames) {
				me.setData(data.geonames);
				dfd.resolve(me);
			}
		}, function(response){
			Voyant.application.showResponseError(me.localize('failedToFetchGeonames'), response);
		});
		return dfd.promise;
	},
	eachCity: function(fn, scope) {
		var cities = this.getData().cities, orderedCities = [];
		for (var id in cities) { // create a sortable list with id
			orderedCities.push(Ext.apply(cities[id], {id: id}))
		}
		orderedCities.sort(function(c1, c2) { // order by rawFreq (count)
			return c1.rawFreq == c2.rawFreq ? c1.label - c2.label : c2.rawFreq - c1.rawFreq;
		});
		orderedCities.forEach(function(city) {fn.call(scope, city);});
	},
	eachConnection: function(fn, scope) {
		var connections = this.getData().connectionCounts, cities = this.getData().cities; orderedConnections = [];
		for (var id in connections) { // create a sortable list with id
			var parts = id.split("-");
			orderedConnections.push({
				source: Ext.apply({id: parts[0]}, cities[parts[0]]),
				target: Ext.apply({id: parts[1]}, cities[parts[1]]),
				rawFreq: connections[id]
			});
		}
		orderedConnections.sort(function(c1, c2) { // order by rawFreq (count)
			return c2.rawFreq - c1.rawFreq;
		});
		orderedConnections.forEach(function(connection) {fn.call(scope, connection)});
	},
	eachConnectionOccurrence: function(fn, scope) {
		var cities = this.getData().cities;
		this.getData().connections.connections.forEach(function(occurrence) {
			Ext.apply(occurrence.source, cities[occurrence.source.id]);
			Ext.apply(occurrence.target, cities[occurrence.target.id]);
			fn.call(scope, occurrence);
		});
	}
});