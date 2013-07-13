Ext.define('Voyant.store.Corpus', {
	requires: ['Voyant.store.Document','Voyant.widget.CorpusGrid'],
    extend: 'Ext.data.Store',
    mixins: ['Voyant.utils.Embeddable','Voyant.utils.Transferable','Voyant.utils.Localization'],
    model: 'Voyant.model.Corpus',
    transferable: ['getDocuments','getSize','getTokensCount','getTypesCount','getId','getTerms','embed'],
    statics: {
    	i18n: {
    		failedCreateCorpus: {en: 'Failed attempt to create a Corpus.'},
			thisCorpus: {en: 'This corpus'},
			isEmpty: {en: 'is empty'},
			hasNdocuments: {
				en: new Ext.Template("has {count} documents")
			},
			has1document: {en: "has 1 document"},
			widthNwordsAndNTypes: {
				en: new Ext.Template("with {words} total words and {types} unique word forms")
			},
    	}
    },
    proxy: {
    	actionMethods: {read: 'POST'}, // ensure that we're posting if we have longer input
    	type: 'ajax',
    	url: Voyant.TROMBONE_URL,
    	reader: {
    		type: 'json',
    		root: 'corpusSummary'
    	}
    },
	constructor : function(source, config) {
		this.callParent([config])
		var dfd = Voyant.utils.deferredManager.getDeferred();
		var params = {tool: ['CorpusCreator','CorpusSummary']};
		if (Ext.isString(source) || Ext.isArray(source)) {
			params.input = source;
		}
		
		// make sure to set the proxy exception handler because we don't get the full responseText otherwise
		this.proxy.on('exception', function(reader, response, error, eOpts) {
			showError(this.localize('failedCreateCorpus'), response.responseText);
		}, this);
		
		if (source) {			
			this.load({
				params: Ext.merge(params, config),
				callback: function(records, operation, success, a, b, c) {
					if (success) {
						dfd.resolve(this)
					}
					else {
						// the proxy should show the error
						dfd.fail(this.localize('failedCreateCorpus'));
					}
					Voyant.utils.deferredManager.release()
				},
				scope: this
			});
			var promise = dfd.promise();
			promise.corpus = this;
			promise.show = window.show;
			this.transfer(this, promise);
			return promise;
		}
//		debugger
//		var methods = ['getDocuments','getSize','getTokensCount','getTypesCount','getId','getTerms','embed','getWidget']
//		for (var i=0;i<methods.length;i++) {
//			promise[methods[i]] = this[methods[i]];
//		}
	},
	
	getDocuments: function() {
		if (this.promise) {
			var newdfd = $.Deferred();
			var newpromise = newdfd.promise();
			$.when(this).done(function(corpus) {
				newdfd.resolve(corpus.getDocuments())
			})
			newpromise.show = Number.prototype.show
			return newpromise;
		}		
		return this.first().getDocuments();
	},
	
	show: function() {
		var size = this.getSize();
		var message = this.localize('thisCorpus');
		if (size==0) {message += ' '+this.localize('isEmpty')+'.';}
		else {
			message+=' ';
			if (size>1) {
				message+=this.localize('hasNdocuments', {count: size})
			}
			else {
				message+=this.localize('has1document')			
			}
			message+=' '+this.localize('widthNwordsAndNTypes', {words: this.getTokensCount(), types: this.getTypesCount()})+'.'
		}
		message.show();
	},
	
	getTokensCount: function(mode) {
		if (this.promise) {
			var newdfd = $.Deferred();
			var newpromise = newdfd.promise();
			$.when(this).done(function(corpus) {
				newdfd.resolve(corpus.getTokensCount(mode))
			})
			newpromise.show = Number.prototype.show
			return newpromise;
		}		
		return this.getDocuments().sum('typesCount-'+(mode ? mode : 'lexical'));
	},
	
	getTypesCount: function(mode) {
		if (this.promise) {
			var newdfd = $.Deferred();
			var newpromise = newdfd.promise();
			$.when(this).done(function(corpus) {
				newdfd.resolve(corpus.getTypesCount(mode))
			})
			newpromise.show = Number.prototype.show
			return newpromise;
		}		
		return this.getDocuments().sum('tokensCount-'+(mode ? mode : 'lexical'));
	},
	
	getSize : function() {
		if (this.promise) {
			var newdfd = $.Deferred();
			$.when(this).done(function(corpus) {
				newdfd.resolve(corpus.getSize())
			})
			var newpromise = newdfd.promise();
			newpromise.show = Number.prototype.show
			return newpromise;
		}			
		return this==null || this.getCount()==0 ? 0 : this.first().getDocuments().getCount();
	},
	
	getTerms: function(config) {
		config = config || {};
		if (this.promise) {
			if (this.state()=='resolved') {
				Ext.merge(config, {corpus: this.getId()});
				return this.corpus.getTerms(config);
			}
			return new Ext.create("Voyant.store.CorpusTerms", config, this);
		}
		Ext.merge(config, {corpus: this.getId()});
		return new Ext.create("Voyant.store.CorpusTerms", config);
	},
	
	getId: function() {
		if (this.promise) {
			if (this.state()=='resolved') {
				return this.corpus.getId();
			}
			else {
				var newdfd = $.Deferred();
				$.when(this)
					.done(function(corpus) {newdfd.resolve(corpus.getId())})
				var newpromise = newdfd.promise();
				newpromise.show = String.prototype.show
				return newpromise;
			}
		}
		return this.first().get("id");
	},
	
	embed: function(widget, config) {
		if (this.promise) {
			$.when(this).done(function(corpus) {corpus.embed(widget,config)})		
		}
		else {
			widget = widget || Voyant.widget.CorpusGrid;
			widget = this.getWidget(widget);
			config = config || {};
			Ext.applyIf(config, {renderTo: this.getRenderTo(), store: this.getSize() > 0 ? this.getDocuments() : Ext.create("Voyant.store.Document")})
			if (widget) {Ext.create(widget, config)}
		}
	},
	
	getEntities: function(config) {
		// todo: add handling of entities to config
		return this.getTerms(config);
	}
	
	
	
});