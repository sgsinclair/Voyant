/**
 * This is a test
 * 
 * @author Stéfan Sinclair
 * @since 4.0
 * @class Voyant.util.Localization
 */
Ext.define('Voyant.util.Localization', {
	statics: {
		DEFAULT_LANGUAGE: 'en',
		LANGUAGE: 'en'
	},
	
    languageStore: Ext.create('Ext.data.ArrayStore', {
        fields: ['code', 'language'],
        data : [
                ['en', 'English']
        ]
    }),
	
	getLanguage: function(code) {
		var record = this.languageStore.findRecord(code.length==2 ? 'code' : 'language', code);
		if (record) {return record.get(code.length==2 ? 'language' : 'code');}
	},
	
	/**
	 * This is a test
	 */
	localize: function(key, config) {
		return this._localizeObject(this, key, config);
	},
	
	_localizeObject: function(object, key, config) {

		var val = this._localizeClass(Ext.ClassManager.getClass(object), key, config);
		if (val) {return val;}
		if (object.mixins) { // look at mixins first
			for (mixin in object.mixins) {
				var val = this._localizeClass(Ext.ClassManager.getClass(object.mixins[mixin]), key, config);
				if (val) {return val;}
			}
		}
		if (object.superclass) { // then superclasses
			val =  this._localizeObject(object.superclass, key, config);
			if (val) {return val;}
		}
		return '['+key+']';
	},
	
	_localizeClass: function(clazz, key, config) {
		if (clazz && clazz.i18n && clazz.i18n[key]) {
			var use = false;
			if (clazz.i18n[key][Voyant.util.Localization.LANGUAGE]) {
				use = clazz.i18n[key][Voyant.util.Localization.LANGUAGE];
			}
			else if (clazz.i18n[key][Voyant.util.Localization.DEFAULT_LANGUAGE]) {
				use = clazz.i18n[key][Voyant.util.Localization.DEFAULT_LANGUAGE];
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
