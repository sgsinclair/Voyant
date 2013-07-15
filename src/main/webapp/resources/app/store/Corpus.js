/**
 * The Corpus class is a fundamental building block since you can use it to load
 * a new corpus or retrieve an existing corpus and then perform analytic
 * functions on it (retrieve documents, terms, contexts, etc.).
 * 
 * ## Creating a New Corpus
 * 
 * The `Corpus` function is in the global namespace, so creating a new Corpus
 * with a string document can be as easy as this:
 * 
 * 		var corpus = new Corpus("Hello World");
 * 
 * When the first argument is a `String`, it will be interpreted either as a
 * literal string or as a URL, so this works as well to load a corpus from a
 * URL:
 * 
 * 		var corpus = new Corpus("http://stefansinclair.name/");
 * 
 * If the first argument is an `Array`, each of the elements will be treated as a
 * separate document, so you could create a new corpus with two documents like
 * this:
 * 
 * 		var corpus = new Corpus(["Hello World!", "http://stefansinclair.name/"]);
 * 
 * It's possible to specify some parameters for corpus creation in a second `Object`
 * argument. See the configuration documentation for more details.
 * For instance, we could specify that our document is an RSS feed and that
 * each item in the feed should be treated separately:
 * 
 * 		var corpus = new Corpus("http://stefansinclair.name/", {
 * 			inputFormat: 'RSS2', // document format
 * 			splitDocuments: true // create a document for each item
 * 		});
 * 
 * ## Retrieving an Existing Corpus
 * 
 * Because Voyant does extensive cacheing of data, it's usually best for a Notebook
 * to "recreate" a corpus instead of using a hand-coded Corpus ID that has been generated from
 * a previous operation (in most cases, a specified input source will be recognized
 * and the existing corpus will be returned). A further advantage of this approach
 * is that a corpus can be recreated if the sources are still available.
 * 
 * ## The Corpus Constructor
 * 
 * Corpus creation is asynchronous (it returns a value before the call to the
 * server is complete). The documented functions defined for Corpus are aware of
 * this and can be called seamlessly:
 * 		
 * 		// the show() method actually waits for the Corpus to be created
 * 		new Corpus("http://stefansinclair.name/").show();
 * 
 * However, it should be noted that most functions of `Corpus` won't be available
 * until the creation is completed. You any or all of `done()`, `fail()` and `always()`:
 * 
 * 		new Corpus("http://stefansinclair.name/").
 * 			.done(function(corpus) {
 * 				// now corpus has all of its functions available
 * 			})
 * 			.fail(function(error) {
 * 				// handle an error
 * 			})
 * 			.always(function() {
 * 				// do this regardless of success or failure
 * 			}
 * 
 * @author Stéfan Sinclair
 * @since 4.0
 */
Ext.define('Voyant.store.Corpus', {
	
	/**
	 * @cfg {String} inputFormat
	 * Specify the format for the input document(s). In most cases, this *should not be set*
	 * since Voyant has heuristics to guess at the document format. One exception is to 
	 * specify a particular kind of XML file, such as `RSS2` or `TEI`.
	 * 
	 * Valid values include: `ARCHIVE`, `ATOM`, `COMRPRESSED` `HTML`, `MSWORD`, `MSWORDX`, `ODT`, `PAGES`, `PDF`, `RSS`, `RSS2`, `RTF`, `TEI`, `TEICORPUS`, `XML`
	 */
	inputFormat : null,
	

	/**
	 * @cfg {Boolean} splitDocuments
	 * Determines if parts of an XML document should be combined into one document or separated
	 * into individual documents.
	 */
	splitDocuments: null,
	
	requires: ['Voyant.store.Document','Voyant.widget.CorpusGrid'],
	alternateClassName: ["Corpus"],
    extend: 'Ext.data.Store',
    mixins: ['Voyant.utils.Embeddable','Voyant.utils.Transferable','Voyant.utils.Localization'],
    model: 'Voyant.model.Corpus',
    transferable: ['getDocuments','getSize','getTokensCount','getTypesCount','getId','getTerms','getContexts','embed'],
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
					Voyant.utils.deferredManager.release()
					if (success) {
						dfd.resolve(this)
					}
					else {
						// the proxy should show the error
						dfd.fail(this.localize('failedCreateCorpus'));
					}
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
	
	/**
	 * Show  a very brief overview of this Corpus including the number of documents, total words (tokens) and unique words (types).
	 */
	show: function() {
		var size = this.getSize();
		var message = this.localize('thisCorpus');
		if (size==0) {message += ' '+this.localize('isEmpty')+'.';}
		else {
			message+=' ';
			if (size>1) {
				message+=this.localize('hasNdocuments', {count: Ext.util.Format.number(size,"0,000")})
			}
			else {
				message+=this.localize('has1document')			
			}
			message+=' '+this.localize('widthNwordsAndNTypes', {words: Ext.util.Format.number(this.getTokensCount(),"0,000"), types: Ext.util.Format.number(this.getTypesCount(),"0,000")})+'.'
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
		return this.getDocuments().sum('tokensCount-'+(mode ? mode : 'lexical'));
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
		return this.getDocuments().sum('typesCount-'+(mode ? mode : 'lexical'));
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
	
	getContexts: function(config) {
		config = config || {};
		if (this.promise) {
			if (this.state()=='resolved') {
				Ext.merge(config, {corpus: this.getId()});
				return this.corpus.getContexts(config);
			}
			return new Ext.create("Voyant.store.Contexts", config, this);
		}
		Ext.merge(config, {corpus: this.getId()});
		return new Ext.create("Voyant.store.Contexts", config);
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
			
			// just one argument with a configuration, so swap
			if (Ext.isObject(widget) && !config) {
				config = widget;
				widget = Voyant.widget.CorpusGrid;
			}
			
			widget = widget || Voyant.widget.CorpusGrid;
			widget = this.getWidget(widget);
			config = config || {};
			Ext.applyIf(config, {renderTo: this.getRenderTo(), height: 350, store: this.getSize() > 0 ? this.getDocuments() : Ext.create("Voyant.store.Document")})
			if (widget) {Ext.create(widget, config)}
		}
	},
	
	getEntities: function(config) {
		// todo: add handling of entities to config
		return this.getTerms(config);
	}
	
	
	
});