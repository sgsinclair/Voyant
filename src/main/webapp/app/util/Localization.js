Ext.define('Voyant.util.Localization', {
	statics: {
		DEFAULT_LANGUAGE: 'en',
		LANGUAGE: 'en',
		i18n: {
		}
		
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
		return config && config['default']!=undefined ? config['default'] : '['+key+']';
	},
	
	_localizeClass: function(clazz, key, config) {
		if (clazz && clazz.i18n && clazz.i18n[key]) {
			var use = false;
			if (clazz.i18n[key]) {
				use = clazz.i18n[key];
			}
			/*
			if (config && config.lang && clazz.i18n[key][config.lang]) {
				use = clazz.i18n[key][config.lang];
			}
			else if (clazz.i18n[key][Voyant.util.Localization.LANGUAGE]) {
				use = clazz.i18n[key][Voyant.util.Localization.LANGUAGE];
			}
			else if (clazz.i18n[key][Voyant.util.Localization.DEFAULT_LANGUAGE]) {
				use = clazz.i18n[key][Voyant.util.Localization.DEFAULT_LANGUAGE];
			}
			*/
			if (use) {
				if (use.isTemplate) { // template
					return use.apply(config);
				}
				return use; // string
			}
			return config && config['default']!=undefined ? config['default'] : '['+key+']'; // no language key found, so just return the key
		}
		return false
	},
	
	getLanguageToolMenu: function() {
		var me = this;
		return {
			type: 'language',
			tooltip: this.localize("languageTitle"),
			xtype: 'toolmenu',
	        glyph: 'xf1ab@FontAwesome',
			handler: me.showLanguageOptions,
			scope: me
		} 
	},

	
	showLanguageOptions: function() {
		var me = this;
		var langs = ["ar","bs","cz","en","fr","he","hr","it","ja","sr"].map(function(lang) {
			return {text: this.localize(lang), value: lang}
		}, this);
		langs.sort(function(a,b) {
			return a.text.localeCompare(b.text);
		});
		langs.splice(0,0,{text: this.localize('autoRecommended'), value: ''})
		
		new Ext.window.Window({
			title: this.localize("languageTitle"),
			modal: true,
			items: {
				xtype: 'form',
				items: [{
					xtype: 'combo',
					name: 'lang',
					value: this.getApiParam("lang") || "",
	    	        queryMode: 'local',
	    	        editable: false,
	    	        fieldLabel: this.localize('chooseLanguage'),
	    	        width: 450,
	    	        labelAlign: 'right',
	    	        labelWidth: 150,
	    	        displayField: 'text',
	    	        valueField: 'value',
					store: {
						fields: ['text', 'value'],
						data: langs
					}
				}/*,{
					xtype: 'combo',
					name: 'rtl',
					value: '',
	    	        queryMode: 'local',
	    	        editable: false,
	    	        fieldLabel: this.localize('rtlLabel'),
	    	        labelAlign: 'right',
	    	        displayField: 'text',
	    	        valueField: 'value',
					store: {
						fields: ['text', 'value'],
						data: [{
							text: this.localize('auto'),
							value: ''
						},{
							text: this.localize('yes'),
							value: 'true'
						},{
							text: this.localize('no'),
							value: 'false'
						}]
					}
				}*/],
				buttons: [{
	            	text: this.localize("cancelTitle"),
		            ui: 'default-toolbar',
	                glyph: 'xf00d@FontAwesome',
	        		flex: 1,
	        		handler: function(btn) {
	        			btn.up('window').close();
	        		}
				},{
	            	text: this.localize("confirmTitle"),
					glyph: 'xf00c@FontAwesome',
	            	flex: 1,
	        		handler: function(btn) {
	        			var form = btn.up('form');
	        			if (form.isDirty()) {
	        				var app = me.getApplication();
	        				var params = app.getModifiedApiParams();
	        				if (app.getCorpus()) {
	        					params.corpus = app.getCorpus().getAliasOrId();
	        				} else {
	        					delete params.panels; // we probably don't need this
	        				}
	        				delete params.lang;
//	        				delete params.rtl;
	        				var values = form.getValues();
	        				if (values.lang) {params.lang = values.lang;}
//	        				if (values.rtl) {params.rtl = values.lang;}
	        				location.assign("./?"+Ext.Object.toQueryString(params))
	        			}
	        			btn.up('window').close();
	        		},
	        		scope: me
	            }]
			},
			bodyPadding: 5
		}).show()
	}
	
});
