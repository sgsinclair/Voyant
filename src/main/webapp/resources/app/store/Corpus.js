Ext.define('Voyant.store.Corpus', {
	requires: ['Voyant.store.Document','Voyant.widget.CorpusGrid'],
    extend: 'Ext.data.Store',
    mixins: ['Voyant.utils.Embeddable','Voyant.utils.Transferable'],
    model: 'Voyant.model.Corpus',
    transferable: ['getDocuments','getSize','getTokensCount','getTypesCount','getId','getTerms','embed'],
    proxy: {
    	actionMethods: {read: 'POST'}, // ensure that we're posting if we have longer input
    	type: 'ajax',
    	url: Voyant.TROMBONE_URL,
    	reader: {
    		type: 'json',
    		root: 'corpusSummary',
    		listeners: {
    			exception: function(reader, response, error, eOpts) {
    				debugger
    			}
    		}
    	},
		listeners: {
			exception: function(reader, response, error, eOpts) {
				debugger
				showError("Failed attempt to create a Corpus", response.responseText);
			}
		}
    },
	constructor : function(source, config) {
		this.callParent([config])
		var dfd = Voyant.utils.deferredManager.getDeferred();
		var params = {tool: ['CorpusCreator','CorpusSummary']};
		if (Ext.isString(source) || Ext.isArray(source)) {
			params.input = source;
		}
		this.load({
			params: Ext.merge(params, config),
			callback: function(records, operation, success, a, b, c) {
				if (success) {
					dfd.resolve(this)
				}
				else {
					// the proxy should show the error
					dfd.fail("Failed attempt to create a Corpus");
				}
				Voyant.utils.deferredManager.release()
			},
			scope: this
		});
		var promise = dfd.promise();
		promise.corpus = this;
		promise.show = window.show;
		this.transfer(this, promise);
//		debugger
//		var methods = ['getDocuments','getSize','getTokensCount','getTypesCount','getId','getTerms','embed','getWidget']
//		for (var i=0;i<methods.length;i++) {
//			promise[methods[i]] = this[methods[i]];
//		}
		return promise;
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
		var message = "This corpus";
		if (size==0) {message += ' is empty.';}
		else {
			message+=' has '+size+' document';
			if (size>1) {message+='s'}
			message+=' with '+this.getTokensCount()+ ' total words and '+this.getTypesCount()+' unique word forms';
			message+='.';
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
		return this==null ? 0 : this.first().getDocuments().getCount();
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
			Ext.applyIf(config, {renderTo: this.getRenderTo(), store: this.getDocuments()})
			if (widget) {Ext.create(widget, config)}
		}
	},
	
	getEntities: function(config) {
		// todo: add handling of entities to config
		return this.getTerms(config);
	}
	
	
	
});