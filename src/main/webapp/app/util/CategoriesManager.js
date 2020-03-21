Ext.define('Voyant.util.CategoriesManager', {
	
	config: {
		categories: undefined,
		features: undefined,
		featureDefaults: undefined
	},
	
	constructor: function(config) {
		this.setCategories({});
		this.setFeatures({});
		this.setFeatureDefaults({});
		
		config = config || {};
		if (config.categories !== undefined) {
			for (var key in config.categories) {
				var terms = config.categories[key];
				this.addTerms(key, terms);
			}
		}
	},
	
	getCategoryTerms: function(name) {
		return this.getCategories()[name];
	},
	
	addCategory: function(name) {
		if (this.getCategories()[name] === undefined) {
			this.getCategories()[name] = [];
		}
	},
	renameCategory: function(oldName, newName) {
		var terms = this.getCategoryTerms(oldName);
		this.addTerms(newName, terms);
		for (var feature in this.getFeatures()) {
			var value = this.getFeatures()[feature][oldName];
			this.setCategoryFeature(newName, feature, value);
		}
		this.removeCategory(oldName);
		
	},
	removeCategory: function(name) {
		delete this.getCategories()[name];
		for (var feature in this.getFeatures()) {
			delete this.getFeatures()[feature][name];
		}
	},
	
	addTerm: function(category, term) {
		this.addTerms(category, [term]);
	},
	addTerms: function(category, terms) {
		if (!Ext.isArray(terms)) {
			terms = [terms];
		}
		if (this.getCategories()[category] === undefined) {
			this.addCategory(category);
		}
		for (var i = 0; i < terms.length; i++) {
			var term = terms[i];
			if (this.getCategories()[category].indexOf(term) === -1) {
				this.getCategories()[category].push(term);
			}
		}
	},
	removeTerm: function(category, term) {
		this.removeTerms(category, [term]);
	},
	removeTerms: function(category, terms) {
		if (!Ext.isArray(terms)) {
			terms = [terms];
		}
		if (this.getCategories()[category] !== undefined) {
			for (var i = 0; i < terms.length; i++) {
				var term = terms[i];
				var index = this.getCategories()[category].indexOf(term);
				if (index !== -1) {
					this.getCategories()[category].splice(index, 1);
				}
			}
		}
	},
	
	getCategoryForTerm: function(term) {
		for (var category in this.getCategories()) {
			if (this.getCategories()[category].indexOf(term) != -1) {
				return category;
			}
		}
		return undefined;
	},
	getFeatureForTerm: function(feature, term) {
		return this.getCategoryFeature(this.getCategoryForTerm(term), feature);
	},
	
	addFeature: function(name, defaultValue) {
		if (this.getFeatures()[name] === undefined) {
			this.getFeatures()[name] = {};
		}
		if (defaultValue !== undefined) {
			this.getFeatureDefaults()[name] = defaultValue;
		}
	},
	removeFeature: function(name) {
		delete this.getFeatures()[name];
		delete this.getFeatureDefaults()[name];
	},
	setCategoryFeature: function(categoryName, featureName, featureValue) {
		if (this.getFeatures()[featureName] === undefined) {
			this.addFeature(featureName);
		}
		this.getFeatures()[featureName][categoryName] = featureValue;
	},
	getCategoryFeature: function(categoryName, featureName) {
		var value = undefined;
		if (this.getFeatures()[featureName] !== undefined) {
			value = this.getFeatures()[featureName][categoryName];
			if (value === undefined) {
				value = this.getFeatureDefaults()[featureName];
				if (Ext.isFunction(value)) {
					value = value();
				}
			}
		}
		return value;
	},
	
	setColorTermAssociations: function() {
        for (var category in this.getCategories()) {
            var color = this.getCategoryFeature(category, 'color');
            if (color !== undefined) {
                var rgb = this.hexToRgb(color);
                var terms = this.getCategoryTerms(category);
                for (var i = 0; i < terms.length; i++) {
                    this.colorTermAssociations.replace(terms[i], rgb);
                }
            }
        }
    },
	
	getCategoryExportData: function() {
		return {
			categories: this.getCategories(),
			features: this.getFeatures()
		};
	},
	
	loadCategoryData: function(id) {
        var dfd = new Ext.Deferred();

        Ext.Ajax.request({
            url: this.getTromboneUrl(),
            params: {
                tool: 'resource.StoredCategories',
                retrieveResourceId: id,
                failQuietly: false,
                corpus: this.getCorpus() ? this.getCorpus().getId() : undefined
            }
        }).then(function(response) {
            var json = Ext.decode(response.responseText);
            var id = json.storedResource.id;
            var value = json.storedResource.resource;
            if (value.length == 0) {
                dfd.reject();
            } else {
                value = Ext.decode(value);
                
                this.setCategories(value.categories);
                this.setFeatures(value.features);
                
                dfd.resolve(value);
            }
        }, function() {
        	this.showError("Unable to load categories data: "+id);
            dfd.reject();
        }, null, this);
        
        return dfd.promise;
    },
    
    saveCategoryData: function(data) {
        data = data || this.getCategoryExportData();
        
        var dfd = new Ext.Deferred();
        
        var dataString = Ext.encode(data);
        Ext.Ajax.request({
            url: this.getTromboneUrl(),
            params: {
                tool: 'resource.StoredResource',
                storeResource: dataString
            }
        }).then(function(response) {
            var json = Ext.util.JSON.decode(response.responseText);
            var id = json.storedResource.id;
            dfd.resolve(id);
        }, function(response) {
            dfd.reject();
        });
        
        return dfd.promise;
    }
});
