Ext.define("Voyant.notebook.util.Embed", {
	transferable: ['embed'],
	embed: function() { // this is for instances
		embed.apply(this, arguments);
	},
	constructor: function(config) {
		var me = this;
	},
	statics: {
		i18n: {},
		api: {
			embeddedParameters: undefined,
			embeddedConfig: undefined
		},
		embed: function(cmp, config) {
			if (this.then) {
				this.then(function(embedded) {
					embed.call(embedded, cmp, config)
				})
			} else if (Ext.isArray(cmp)) {
				Voyant.notebook.util.Show.SINGLE_LINE_MODE=true;
				show("<table><tr>");
				cmp.forEach(function(embeddable) {
					show("<td>");
					if (Ext.isArray(embeddable)) {
						if (embeddable[0].embeddable) {
							embeddable[0].embed.apply(embeddable[0], embeddable.slice(1))
						} else {
							embed.apply(this, embeddable)
						}
					} else {
						embed.apply(this, embeddable);
					}
					show("</td>")
					
				})
//				for (var i=0; i<arguments.length; i++) {
//					var unit = arguments[i];
//					show("<td>")
//					unit[0].embed.call(unit[0], unit[1], unit[2]);
//					show("</td>")
//				}
				show("</tr></table>")
				Voyant.notebook.util.Show.SINGLE_LINE_MODE=false;
				return
			} else {
				// use the default (first) embeddable panel if no panel is specified
				if (this.embeddable && (!cmp || Ext.isObject(cmp))) {
					// if the first argument is an object, use it as config instead
					if (Ext.isObject(cmp)) {config = cmp;}
					cmp = this.embeddable[0];
				}
				if (Ext.isString(cmp)) {
					cmp = Ext.ClassManager.getByAlias('widget.'+cmp.toLowerCase()) || Ext.ClassManager.get(cmp);
				}
				var isEmbedded = false;
				if (Ext.isFunction(cmp)) {
					var name = cmp.getName();
					if (this.embeddable && Ext.Array.each(this.embeddable, function(item) {
							if (item==name) {
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
										var corpus = this.getCorpus();
										if (corpus) {
											embeddedParams.corpus = this.getCorpus().getId();
										}
									}
								}
								Ext.applyIf(config, {
									style: 'width: '+(config.width || '90%') + (Ext.isNumber(config.width) ? 'px' : '')+
										'; height: '+(config.height  || '400px') + (Ext.isNumber(config.height) ? 'px' : '')
								});
								delete config.width;
								delete config.height;
								
								var corpus = embeddedParams.corpus;
								delete embeddedParams.corpus;
								
		    	    	    	Ext.applyIf(embeddedParams, Voyant.application.getModifiedApiParams());
								
		    	    	    	
								var embeddedConfigParamEncodded = Ext.encode(embeddedParams);
								var embeddedConfigParam = encodeURIComponent(embeddedConfigParamEncodded);

								var iframeId = Ext.id();
								var url = Voyant.application.getBaseUrlFull()+"tool/"+name.substring(name.lastIndexOf(".")+1)+'/?';
								if (true || embeddedConfigParam.length>1800) {
									show('<iframe style="'+config.style+'" id="'+iframeId+'" name="'+iframeId+'"></iframe>');
									var dfd = Voyant.application.getDeferred(this);
					    	    	Ext.Ajax.request({
					    	    	    url: Voyant.application.getTromboneUrl(),
					    	    	    params: {
					    	        		tool: 'resource.StoredResource',
					    	        		storeResource: embeddedConfigParam
					    	    	    }
					    	    	}).then(function(response) {
				    	    	    	var json = Ext.util.JSON.decode(response.responseText);
				    	    	    	var params = {
				    	    	    		minimal: true,
				    	    	    		embeddedApiId: json.storedResource.id
				    	    	    	}
				    	    	    	if (corpus) {
				    	    	    		params.corpus = corpus;
				    	    	    	}
				    	    	    	Ext.applyIf(params, Voyant.application.getModifiedApiParams());
				    	    	    	document.getElementById(iframeId).setAttribute("src",url+Ext.Object.toQueryString(params));
										dfd.resolve();
					    	    	}).otherwise(function(response) {
					    	    		showError(response);
					    	    		dfd.reject();
					    	    	})
								} else {
									show('<iframe src="'+url+embeddedConfigParam+'" style="'+config.style+'" id="'+iframeId+'" name="'+iframeId+'"></iframe>');
								}
								isEmbedded = true;
								return false;
							}
						}, this)===true) {
						Voyant.notebook.util.Embed.showWidgetNotRecognized.call(this);
					}
					if (!isEmbedded) {
						var embedded = Ext.create(cmp, config);
						embedded.embed(config);
						isEmbedded = true;
					}
				}
				if (!isEmbedded) {
					
					Voyant.notebook.util.Embed.showWidgetNotRecognized.call(this);
				}
			}
		},
		showWidgetNotRecognized: function() {
			var msg = Voyant.notebook.util.Embed.i18n.widgetNotRecognized;
			if (this.embeddable) {
				msg += Voyant.notebook.util.Embed.i18n.tryWidget+'<ul>'+this.embeddable.map(function(cmp) {
					var widget = cmp.substring(cmp.lastIndexOf(".")+1).toLowerCase()
					return "\"<a href='../../docs/#!/guide/"+widget+"' target='voyantdocs'>"+widget+"</a>\""
				}).join(", ")+"</ul>"
			}
			showError(msg)
		}

	}
})

embed = Voyant.notebook.util.Embed.embed