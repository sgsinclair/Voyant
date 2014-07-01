Ext.define("Voyant.notebook.util.Embeddable", {
	mixins: ['Voyant.util.Localization'],
	statics: {
		i18n: {
			widgetNotRecognized: {
				en: new Ext.Template('"{widget}" is not a recognized Voyant widget.')
			},
			knownWidgets: {
				en: 'Known widgets: '
			}
		}
	},
	transferable: ['getEmbeddable','getEmbedTo','embed'],
	
	constructor: function() {

		if (this.embeddable) {
			for (var i=0; i<this.embeddable.length; i++) {
				var embeddable = this.embeddable[i];
				
				// create a new function and prepend the embeddable argument
				var functionName = "embed"+embeddable.substring(embeddable.lastIndexOf(".")+1);
				var me = this;
				var embeddableFunction = function(config) {
					var embeddable = arguments.callee.embeddable;
					if (this.then) {
						this.then(function() {
							me.embed(embeddable, config);
						})
					}
					else {
						this.embed(embeddable, config)
					}
				};
				embeddableFunction.embeddable = embeddable;
				this[functionName] = embeddableFunction;
				this.transferable.push(functionName);
			}
		}
	},
	
	getEmbeddable: function(embeddable) {

		if (Ext.isFunction(embeddable)) {
			// could be wrong kind of widget, but because of binded calls it's hard to tell
			return embeddable;
		}

		var name = "";
		if (Ext.isString(embeddable)) {
			var emb = Ext.ClassManager.get(embeddable);
			if (emb) {return emb;}
			emb = Ext.ClassManager.get("Voyant.panel."+embeddable);
			if (emb) {return emb;}
		}

		var message = this.localize('widgetNotRecognized', {widget: embeddable.toString()});
		message+=" "+this.localize('knownWidgets')+this.embeddable.join(", ");
		showError(message);
		return false;
	},
	
	getEmbedTo: function() {
		if (Voyant.notebook.util.Show) {
			return Voyant.notebook.util.Show.TARGET.insertHtml('beforeEnd',"<div></div>");
		}
	},
	
	embed: function(cmp, config) {
		if (this.then) {
			return Voyant.application.getDeferredNestedPromise(this, arguments);
		}
		else {
			
			// just one argument with a configuration, so swap and use the first embeddable as default
			if (Ext.isObject(cmp) && !config) {
				config = cmp;
				cmp = this.embeddable[0];
			}
			
			cmp = cmp ? cmp : (this.embeddable ? this.embeddable[0] : undefined);
			cmp = this.getEmbeddable(cmp);
			
			if (cmp) {
				// create a deferral so that a notebook remains in working state until the embeddable is rendered
				var dfd = Voyant.application.getDeferred();
				config = config || {};
				Ext.applyIf(config, {
					renderTo: this.getEmbedTo(),
					height: 350,
					listeners: {
						afterrender: function() {
							dfd.resolve();
						}
					},
					embedded: this
				})
				Ext.create(cmp, config)
			}
		}
	}
	/*,
	
	embed: function(cmp, config) {
		if (this.promise) {
			var me = this;
			$.when(this.promise).done(function() {
				me.embed(cmp, config)
			});
		}
		else {

			// just one argument with a configuration, so swap and use the first embeddable as default
			if (Ext.isObject(cmp) && !config) {
				config = cmp;
				cmp = this.embeddable[0];
			}
			
			cmp = cmp ? cmp : this.embeddable[0];
			cmp = this.getEmbeddable(cmp);
			
			if (cmp) {
				// create a deferral so that a notebook remains in working state until the embeddable is rendered
				var dfd = Voyant.application.getDeferred();
				config = config || {};
				Ext.applyIf(config, {
					renderTo: this.getEmbedTo(),
					height: 350,
					listeners: {
						afterrender: function() {
							dfd.resolve();
						}
					},
					embedded: this
				})
				Ext.create(cmp, config)
			}
			
		}
	}*/
	
	
})