Ext.define('Voyant.utils.Localization', {
	statics: {
		DEFAULT_LANGUAGE: 'en',
		LANGUAGE: 'en'
	},
	
	localize: function(key, config) {
		return this._localizeObject(this, key, config);
	},
	
	_localizeObject: function(object, key, config) {

		var val = this._localizeClass(Ext.ClassManager.getClass(object), key, config);
		if (val) {return val;}
		if (object.mixins) {
			for (mixin in object.mixins) {
				var val = this._localizeClass(Ext.ClassManager.getClass(object.mixins[mixin]), key, config);
				if (val) {return val;}
			}
		}
		return '['+key+']';
	},
	
	_localizeClass: function(clazz, key, config) {
		if (clazz.i18n && clazz.i18n[key]) {
			var use = false;
			if (clazz.i18n[key][Voyant.utils.Localization.LANGUAGE]) {
				use = clazz.i18n[key][Voyant.utils.Localization.LANGUAGE];
			}
			else if (clazz.i18n[key][Voyant.utils.Localization.DEFAULT_LANGUAGE]) {
				use = clazz.i18n[key][Voyant.utils.Localization.DEFAULT_LANGUAGE];
			}
			if (use) {
				if (use.isTemplate) { // template
					return use.apply(config);
				}
				return use; // string
			}
			return '['+key+']'; // no language key found, so just return the key
		}
		return false
	}
	
});
