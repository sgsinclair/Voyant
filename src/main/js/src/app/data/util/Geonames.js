Ext.define('Voyant.data.util.Geonames', {
    mixins: ['Voyant.util.Localization'],
    statics: {
    		i18n: {
    		}
    },

	config: {
		data: {},
		queries: undefined,
		corpus: undefined,
		isIncrementalLoadingOccurrences: false,
		previousParams: {}
	},
	constructor: function(config, opts) {
		config = config || {};
		this.callParent([config]);
		this.setCorpus(config.corpus);
	},
	load: function(params, dfd) {
		this.setPreviousParams(params);
		dfd = dfd || Voyant.application.getDeferred(this);
		var me = this, localParams = {
			corpus: this.getCorpus().getAliasOrId(),
			queries: this.getQueries(),
			tool: 'corpus.Dreamscape',
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
			if (data && data.dreamscape && data.dreamscape.progress) {
				new Voyant.widget.ProgressMonitor({
					progress: data.dreamscape.progress,
					maxMillisSinceStart: 1000*60*60, // an hour (!)
					tool: 'corpus.Dreamscape',
					success: function() {
						me.load.call(me, params, dfd);
					},
					failure: function(responseOrProgress) {
						Voyant.application.showResponseError(me.localize("failedToFetchGeonames"), responseOrProgress);
					},
					scope: me
				});
			}
			if (data && data.dreamscape && !data.dreamscape.progress) {
				if (!params.noOverwrite) {
					me.setData(data.dreamscape);
				}
				dfd.resolve(data);
			}
		}, function(response) {
			Voyant.application.showResponseError(me.localize('failedToFetchGeonames'), response);
		});
		return dfd.promise;
	},
	getCitiesCount: function() {
		return Object.keys(this.getData().locations.locations).length;
	},
	getTotalCitiesCount: function() {
		return this.getData().locations.total;
	},
	hasMoreCities: function() {
		return this.getCitiesCount()<this.getTotalCitiesCount();
	},
	eachCity: function(fn, scope, max) {
		var locations = this.getData().locations.locations, orderedLocations = [];
		for (var id in locations) { // create a sortable list with id
			orderedLocations.push(Ext.apply(locations[id], {id: id}))
		}
		orderedLocations.sort(function(c1, c2) { // order by rawFreq (count)
			return c1.rawFreq == c2.rawFreq ? c1.label - c2.label : c2.rawFreq - c1.rawFreq;
		});
		if (max && orderedLocations.length>max) {orderedLocations = orderedLocations.slice(0,max)}
		orderedLocations.forEach(function(location) {fn.call(scope, location);});
	},
	getConnectionsCount: function() {
		return this.getData().connections.connections.length;
	},
	getTotalConnectionsCount: function() {
		return this.getData().connections.total;
	},
	eachConnection: function(fn, scope, max) {
		var connections = this.getData().connections.connections,
			locations = this.getData().locations.locations;
			orderedConnections = [];
		for (var i=0, len=connections.length; i<len; i++) {
			fn.call(scope, {
				source: Ext.apply({id: connections[i].source}, locations[connections[i].source]),
				target: Ext.apply({id: connections[i].target}, locations[connections[i].target]),
				rawFreq: connections[i].rawFreq
			});
			if (i>max) {break;}
		}
	},
	getConnectionOccurrence: function(index) {
		if (!this.getData().locations) {return undefined;}
		var connectionOccurrencesData = this.getData().connectionOccurrences,
			connectionOccurrences = connectionOccurrencesData.connectionOccurrences;
			locations = this.getData().locations.locations;
		if (!this.getIsIncrementalLoadingOccurrences() && connectionOccurrences.length<connectionOccurrencesData.total && index+100>connectionOccurrences.length) {
			this.setIsIncrementalLoadingOccurrences(true);
			var me = this;
			var params = {};
			Ext.apply(params, this.getPreviousParams);
			Ext.apply(params, {
				start: connectionOccurrences.length,
				noOverwrite: true,
				suppressLocations: true,
				suppressConnections: true
			});
			this.load(params).then(function(data) {
				me.setIsIncrementalLoadingOccurrences(false);
				me.getData().connectionOccurrences.connectionOccurrences = connectionOccurrences.concat(data.dreamscape.connectionOccurrences.connectionOccurrences);
			})
		}
		if (connectionOccurrences && connectionOccurrences[index]) {
			var occurrence = connectionOccurrences[index];
			occurrence.index = index;
			Ext.apply(occurrence.source, locations[occurrence.source.location]);
			Ext.apply(occurrence.target, locations[occurrence.target.location]);
			return occurrence;
		}
		return null;
	},
    getAllConnectionOccurrences: function(sourceId, targetId) {
    	debugger
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