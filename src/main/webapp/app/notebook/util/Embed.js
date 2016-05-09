Ext.define("Voyant.notebook.util.Embed", {
	transferable: ['embed'],
	embed: function() { // this is for instances
		embed.apply(this, arguments);
	},
	statics: {
		i18n: {},
		embed: function(cmp, config) {
			if (this.then) {
				this.then(function(embedded) {
					embed.call(embedded, cmp, config)
				})
			} else {
				// use the default (first) embeddable panel if no panel is specified
				if (this.embeddable && (!cmp || Ext.isObject(cmp))) {
					// if the first argument is an object, use it as config instead
					if (Ext.isObject(cmp)) {config = cmp;}
					cmp = this.embeddable[0];
				}
				if (Ext.isString(cmp)) {
					cmp = Ext.ClassManager.getByAlias('widget.'+cmp) || Ext.ClassManager.get(cmp);
				}
				if (Ext.isFunction(cmp)) {
					var name = cmp.getName();
					if (this.embeddable && Ext.Array.each(this.embeddable, function(item) {
						return item!=name
					}, this)) {
						Voyant.notebook.util.Embed.showWidgetNotRecognized.call(this);
					} else {
						config = config || {};
						var embeddedParams = {};
						for (key in Ext.ClassManager.get(Ext.getClassName(cmp)).api) {
							if (key in config) {
								embeddedParams[key] = config[key]
							}
						}
						if (!embeddedParams.corpus) {
							if (Ext.getClassName(this)=='Voyant.data.model.Corpus') {
								embeddedParams.corpus = this.getId();
							} else if (this.getCorpus) {
								embeddedParams.corpus = this.getCorpus().getId();
							}
						}
						Ext.applyIf(config, {
							style: 'width: '+(config.width || '90%') + (Ext.isNumber(config.width) ? 'px' : '')+
								'; height: '+(config.height  || '400px') + (Ext.isNumber(config.height) ? 'px' : '')
						});
						delete config.width;
						delete config.height;
						
						if (document.location.search.indexOf("debug=true")>-1) {
							embeddedParams.debug=true
						}
						var embeddedConfigParam = Ext.Object.toQueryString(embeddedParams);
						var tpl = new Ext.XTemplate('<iframe style="'+config.style+'" '+
								'src="'+Voyant.application.getBaseUrl()+"tool/"+name.substring(name.lastIndexOf(".")+1)+'/?{0}"></iframe>');
						if (embeddedConfigParam.length<1950) {
							show(tpl.apply(["minimal=true&"+embeddedConfigParam]));
						} else {
			    	    	Ext.Ajax.request({
			    	    	    url: Voyant.application.getTromboneUrl(),
			    	    	    params: {
			    	        		tool: 'resource.StoredResource',
			    	        		storeResource: embeddedConfigParam
			    	    	    }
			    	    	}).then(function(response) {
		    	    	    	var json = Ext.util.JSON.decode(response.responseText);
								show(tpl.apply(["minimal=true&embeddedConfig="+json.storedResource.id]));
			    	    	}).otherwise(function(response) {
			    	    		showError(response)
			    	    	})
						}
					}
				} else {
					Voyant.notebook.util.Embed.showWidgetNotRecognized.call(this);
				}
			}
		},
		showWidgetNotRecognized: function() {
			var msg = Voyant.notebook.util.Embed.i18n.widgetNotRecognized;
			if (this.embeddable) {
				msg += Voyant.notebook.util.Embed.i18n.tryWidget+'<ul>'+this.embeddable.map(function(cmp) {
					var widget = cmp.substring(cmp.lastIndexOf(".")+1).toLowerCase()
					return "\"<a href='"+Voyant.application.getBaseUrl()+"/docs/#!/guide/"+widget+"' target='voyantdocs'>"+widget+"</a>\""
				}).join(", ")+"</ul>"
			}
			showError(msg)
		}

	}
})

embed = Voyant.notebook.util.Embed.embed