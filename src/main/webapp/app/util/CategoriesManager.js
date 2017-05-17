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
	
	getExportData: function() {
		return {
			categories: this.getCategories(),
			features: this.getFeatures()
		};
	}
});
