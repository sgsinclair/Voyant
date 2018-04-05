Ext.define('Voyant.data.util.Geonames', {
    mixins: ['Voyant.util.Localization'],
	config: {
		data: {},
		queries: undefined,
		corpus: undefined,
		isIncrementalLoadingOccurrences: false
	},
	constructor: function(config, opts) {
		config = config || {};
		this.callParent([config]);
		this.setCorpus(config.corpus);
	},
	load: function(params) {
		var dfd = Voyant.application.getDeferred(this);
		var me = this, localParams = {
			corpus: this.getCorpus().getAliasOrId(),
			queries: this.getQueries(),
			tool: 'corpus.Geonames',
			limit: 200
		};
		Ext.apply(localParams, params || {});
		
		if (!params.noOverwrite) {
			me.setData({});
		}

		Ext.Ajax.request({
			url: Voyant.application.getTromboneUrl(),
			params: localParams,
			scope: this
		}).then(function(response) {
			var data = Ext.JSON.decode(response.responseText);
			
			/*
			new Voyant.widget.ProgressMonitor({
				progress: {
					id: 'test',
					completion: 0.1,
					code: 'launch',
					status: 'LAUNCH',
					message: "launching launching"
				},
				failure: function(responseOrProgress) {
					debugger;
				},
				scope: me
			});*/

			if (data && data.geonames) {
				if (!params.noOverwrite) {
					me.setData(data.geonames);
				}
				dfd.resolve(data);
			}
		}, function(response){
			Voyant.application.showResponseError(me.localize('failedToFetchGeonames'), response);
		});
		return dfd.promise;
	},
	getCitiesCount: function() {
		return Object.keys(this.getData().cities.cities).length;
	},
	getTotalCitiesCount: function() {
		return this.getData().cities.total;
	},
	hasMoreCities: function() {
		return this.getCitiesCount()<this.getTotalCitiesCount();
	},
	eachCity: function(fn, scope, max) {
		var cities = this.getData().cities.cities, orderedCities = [];
		for (var id in cities) { // create a sortable list with id
			orderedCities.push(Ext.apply(cities[id], {id: id}))
		}
		orderedCities.sort(function(c1, c2) { // order by rawFreq (count)
			return c1.rawFreq == c2.rawFreq ? c1.label - c2.label : c2.rawFreq - c1.rawFreq;
		});
		if (max && orderedCities.length>max) {orderedCities = orderedCities.slice(0,max)}
		orderedCities.forEach(function(city) {fn.call(scope, city);});
	},
	getConnectionsCount: function() {
		return Object.keys(this.getData().connectionCounts.connectionCounts).length;
	},
	getTotalConnectionsCount: function() {
		return this.getData().connectionCounts.total;
	},
	eachConnection: function(fn, scope, max) {
		var connections = this.getData().connectionCounts.connectionCounts, cities = this.getData().cities.cities; orderedConnections = [];
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
		if (max && orderedConnections.length>max) {orderedConnections = orderedConnections.slice(0, max)}
		orderedConnections.forEach(function(connection) {fn.call(scope, connection)});
	},
	getConnectionOccurrence: function(index) {
		if (!this.getData().cities) {return undefined;}
		var connections = this.getData().connections, cities = this.getData().cities.cities;
		if (!this.getIsIncrementalLoadingOccurrences() && connections.connections.length<connections.total && index+100>connections.connections.length) {
			this.setIsIncrementalLoadingOccurrences(true);
			var me = this;
			this.load({
				start: connections.connections.length,
				noOverwrite: true,
				suppressCities: true,
				suppressConnections: true
			}).then(function(data) {
				me.setIsIncrementalLoadingOccurrences(false);
				connections.connections = connections.connections.concat(data.geonames.connections.connections);
			})
		}
		if (connections && connections.connections[index]) {
			var occurrence = connections.connections[index];
			occurrence.index = index;
			Ext.apply(occurrence.source, cities[occurrence.source.id]);
			Ext.apply(occurrence.target, cities[occurrence.target.id]);
			return occurrence;
		}
		return null;
	},
    getAllConnectionOccurrences: function(sourceId, targetId) {
        // TODO return all occurences of connection with given source and target, including those not loaded yet
        var occurences = [];
        for (var i = 0; i < this.getTotalConnectionsCount(); i++) {
            var occurence = this.getConnectionOccurrence(i);
            if (occurence && occurence.target.id == targetId && occurence.source.id == sourceId) {
                occurences.push(occurence);
            }
        }
        return occurences
    }
});