/**
 * @class Corpus
 * Testin
 */
Ext.define('Voyant.data.model.Corpus', {
	alternateClassName: ["Corpus"],
    mixins: ['Voyant.notebook.util.Embed','Voyant.notebook.util.Show','Voyant.util.Transferable','Voyant.util.Localization'],
    transferable: ['loadCorpusTerms'],
//    transferable: ['getSize','getId','getDocument','getDocuments','getCorpusTerms','getDocumentsCount','getWordTokensCount','getWordTypesCount','getDocumentTerms'],
    embeddable: ['Voyant.panel.Summary','Voyant.panel.Cirrus','Voyant.panel.Documents','Voyant.panel.CorpusTerms'],
	requires: ['Voyant.util.ResponseError','Voyant.data.store.CorpusTerms','Voyant.data.store.Documents'/*,'Voyant.panel.Documents'*/],
    extend: 'Ext.data.Model',
    config: {
    	
    	/**
    	 * @cfg {String} corpus The ID of a previously created corpus.
    	 * 
    	 * A corpus ID can be used to try to retrieve a corpus that has been previously created.
    	 * 
    	 * This is especially useful if the input sources are long strings, local files, or content
    	 * that's otherwise difficult or impossible to recreate.
    	 * 
    	 * Note that it's possible to also specify input sources as a fall-back if the corpus
    	 * is no longer available in Voyant.
    	 * 
    	 * 		new Corpus({
    	 * 			corpus: "some.long.corpus.id.generated.by.voyant",
    	 * 			input: "http://hermeneuti.ca/" // use this as a fallback 
    	 * 		});
    	 */
    	
    	/**
    	 * @cfg {String/String[]} input Input sources for the corpus.
    	 * 
    	 * The input sources can be either normal text or URLs (starting with `http`):
    	 * 
    	 * 		input: "Hello Voyant!" // one document with this string
    	 * 
    	 * 		input: ["Hello Voyant!", "How are you?"] // two documents with these strings
    	 * 
    	 * 		input: "http://hermeneuti.ca/" // one document from URL
    	 * 
    	 * 		input: ["Hello Voyant!", "http://hermeneuti.ca/"] // two documents, one from string and one from URL
    	 */
    	
    	documentsStore: undefined
    },
    statics: {
    	i18n: {}
    },
    fields: [
         {name: 'documentsCount', type: 'int'},
         {name: 'lexicalTokensCount', type: 'int'},
         {name: 'lexicalTypesCount', type: 'int'},
         {name: 'createdTime', type: 'int'},
         {name: 'createdDate', type: 'date', dateFormat: 'c'}
    ],
    
	/**
     * Create a promise for a new Corpus with relevant data loaded.
     * 
     * The typical usage is to chain the returned promise with {@link Ext.promise.Promise#then then} and
     * provide a function that receives the Corpus as an argument.
     * 
     * 	var corpus;
     * 	new Corpus("Hello Voyant!").then(function(data) {
     * 		corpus = data;
     * 	});
     * 
     * The following scenarios are possible for the config argument:
     * 
     * - a string that looks like a corpus ID (not a URL and no spaces): treated as a {@link #corpus} config
     * - a string that doesn't look like a corpus ID: treated as an {@link #input} config
     * - an array of strings: treated as an array of {@link #input} config values
     * - an object: treated a normal config object
     * 
     * As such, these two constructions do the same thing:
     * 
     * 	new Corpus("Hello World!");
     * 	new Corpus({input: "Hello World!"});
     * 
     * @param {String/String[]/Object} config The source document(s) as a text string, a URL, an array of text strings and URLs, or a config object.
	 * @returns {Ext.promise.Promise} *Important*: This doesn't immediately return a Corpus but a promise to return a Corpus when it's finished loading
	 * (you should normally chain the promise with {@link Ext.promise.Promise#then then} and provide a function that receives the
	 * Corpus as an argument, as per the example above).
	 */
	constructor : function(config) {
		
		config = config || {};
				
		this.callParent([]); // only send config, not source
		if (config) {
			
			if (Ext.isString(config) || Ext.isArray(config)) {
				if (Ext.isString(config) && /\s/.test(config)==false && config.indexOf(":")==-1) {
					config = {corpus: config};
				} else {
					config = {input: config};
				}
			}

			Ext.apply(config, {tool: 'corpus.CorpusMetadata'})

			var dfd = Voyant.application.getDeferred(this);
			var me = this;
			
			var promise = Ext.Ajax.request({
				url: Voyant.application.getTromboneUrl(),
				params: config
			}).then(function(response) {
				me.set(Ext.JSON.decode(response.responseText).corpus.metadata);
				return me
			}).otherwise(function(response){
				Voyant.application.showResponseError(me.localize('failedCreateCorpus'), response);
			}).then(function(corpus) {
				if (!('docsLimit' in config) || (config.docsLimit!==false && config.docsLimit>0)) {
					me.getDocuments().load({
						params: {
							limit: ('docsLimit' in config) ? config.docsLimit : me.getDocumentsCount()
						},
						callback: function(records, operation, success) {
							if (success) {
								me.setDocumentsStore(this);
								dfd.resolve(corpus)
							} else {
								dfd.reject(operation)
							}
						}
					})
				} else {
					dfd.resolve(corpus)
				}
			})
			return dfd.promise
		}
	},
	
	getId: function() {
		// overrides the getId() function from the model to handle promises
    	return this.then ? Voyant.application.getDeferredNestedPromise(this, arguments) : this.get('id');		
	},
	
	
	/**
     * Create a promise for {@link Voyant.data.store.CorpusTerms Corpus Terms}.
     * 
     * The typical usage is to chain the returned promise with {@link Ext.promise.Promise#then then} and
     * provide a function that receives the {@link Voyant.data.store.CorpusTerms Corpus Terms} as an argument.
     * 
     * 	new Corpus("Hello Voyant!").loadCorpusTerms().then(function(corpusTerms) {
     * 		corpusTerms.show();
     * 	});
     * 
     * @param {Number/Object} config
     * 
     * - when this is a number, it's the maximum number of corpus terms to load (see {@link Voyant.data.store.CorpusTerms#limit})
     * - otherwise this is a regular config object
     * 
	 * @returns {Ext.promise.Promise} *Important*: This doesn't immediately return corpus terms but a promise to return a corpus terms when they're finished loading
	 * (you should normally chain the promise with {@link Ext.promise.Promise#then then} and provide a function that receives the
	 * corpus terms as an argument, as per the example above).
	 */
	loadCorpusTerms: function(config) {
		if (this.then) {
			return Voyant.application.getDeferredNestedPromise(this, arguments);
		} else {
			var dfd = Voyant.application.getDeferred(this);
			config = config || {};
			if (Ext.isNumber(config)) {
				config = {limit: config};
			}
			Ext.applyIf(config, {
				limit: 0
			})
			var corpusTerms = this.getCorpusTerms();
			corpusTerms.load({
				params: config,
				callback: function(records, operation, success) {
					if (success) {
						dfd.resolve(corpusTerms)
					} else {
						dfd.reject(operation)
					}
				}
			})
			return dfd.promise
		}
	},
	
	getCorpusTerms: function(config) {
		return Ext.create("Voyant.data.store.CorpusTerms", Ext.apply(config || {}, {corpus: this}));
	},
	
	getCorpusCollocates: function(config) {
		return Ext.create("Voyant.data.store.CorpusCollocates", Ext.apply(config || {}, {corpus: this}));
	},
	
	getDocumentQueryMatches: function(config) {
		// not expected to be called before corpus is defined
		return Ext.create("Voyant.data.store.DocumentQueryMatches", Ext.apply(config || {}, {corpus: this}));
	},
	
	getDocumentTerms: function(config) {
		return Ext.create("Voyant.data.store.DocumentTerms", Ext.apply(config || {}, {corpus: this}));
	},
	
	getContexts: function(config) {
		return Ext.create("Voyant.data.store.Contexts", Ext.apply(config || {}, {corpus: this}));
	},
	
	getDocuments: function(config) {
		return this.getDocumentsStore() ? this.getDocumentsStore() : Ext.create("Voyant.data.store.Documents", Ext.apply(config || {}, {corpus: this}));
		//this.then ? Voyant.application.getDeferredNestedPromise(this, arguments) : this.getDocumentsStore();
	},
	
	getDocument: function(config) {
		if (this.getDocumentsStore()) {
			if (config instanceof Voyant.data.model.Document) {
				return config;
			}
			else if (Ext.isNumeric(config)) {
				return this.getDocumentsStore().getAt(parseInt(config))
			}
			else if (Ext.isString(config)) {
				return this.getDocumentsStore().getById(config)
			}
		}
		return this.then ? Voyant.application.getDeferredNestedPromise(this, arguments) : this.getDocumentsStore().getDocument(config);
	},
	
	getDocumentsCount: function() {
		return this.then ? Voyant.application.getDeferredNestedPromise(this, arguments) : this.get('documentsCount');
	},
	
	getWordTokensCount: function() {
    	return this.then ? Voyant.application.getDeferredNestedPromise(this, arguments) : this.get('lexicalTokensCount');
	},
	
	getWordTypesCount: function() {
    	return this.then ? Voyant.application.getDeferredNestedPromise(this, arguments) : this.get('lexicalTypesCount');
	},
	
	getCreatedTime: function() {
    	return this.then ? Voyant.application.getDeferredNestedPromise(this, arguments) : this.get('createdTime');		
	},
	
	requiresPassword: function() {
		var noPasswordAccess = this.getNoPasswordAccess();
		return noPasswordAccess=='NONE' || noPasswordAccess=='NONCONSUMPTIVE';
	},
	
	getNoPasswordAccess: function() {
		// overrides the getId() function from the model to handle promises
    	return this.then ? Voyant.application.getDeferredNestedPromise(this, arguments) : this.get('noPasswordAccess');		
	},
	
	/**
	 * Shows a one-line summary of this corpus.
	 * 
	 * 	new Corpus("Hello World!").then(function(corpus) {corpus.show(true);});
	 * 
	 * @params {boolean} [withID] Includes the corpus ID in parentheses at the end, if true.
	 */
	show: function(config) {
		if (this.then) {
			return Voyant.application.getDeferredNestedPromise(this, arguments);
		} else {
			show(this.toString(config))
		}
	},

    toString: function(config) {
		var size = this.getDocumentsCount();
		var message = this.localize('thisCorpus');
		if (size==0) {message += ' '+this.localize('isEmpty')+'.';}
		else {
			message+=' ';
			if (size>1) {
				message+=new Ext.XTemplate(this.localize('hasNdocuments')).apply({count: Ext.util.Format.number(size,"0,000")});
			}
			else {
				message+=this.localize('has1document');
			}
			message+=' '+new Ext.XTemplate(this.localize('widthNwordsAndNTypes')).apply({words: Ext.util.Format.number(this.getWordTokensCount(),"0,000"), types: Ext.util.Format.number(this.getWordTypesCount(),"0,000")})+'.'
			message+=" Created "
			var createdDate = this.get('createdDate');
			var now = new Date();
			if (Ext.Array.each([
		    				['year', Ext.Date.YEAR],
		    				['month', Ext.Date.MONTH],
		    				['day', Ext.Date.DAY],
		    				['hour', Ext.Date.HOUR],
		    				['minute', Ext.Date.MINUTE],
		    				['second', Ext.Date.SECOND]
		    	], function(time) {
        			if (Ext.Date.diff(createdDate, now, time[1])>(time[0]=='second' ? 1 : 0)) {
        				var count = Ext.Date.diff(createdDate, now, time[1]);
        				message+="<span class='info-tip' data-qtip='"+Ext.Date.format(createdDate, "Y-m-d, H:i:s")+"'>";
        				if (count==1) {message+=new Ext.XTemplate(this.localize(time[0]+'Ago')).apply({count: count, date: createdDate})}
        				else {message+=new Ext.XTemplate(this.localize(time[0]+'sAgo')).apply({count: count, date: createdDate})}
        				message+="</span>";
        				return false
        			}
				}, this
			)===true) { // if array returns true, none of the conditions matched, so say now
				message+=this.localize('now');
			}
			message+='.';
			
			message+='';
		}
		if (config===true) {message+=' ('+this.getId()+")";}
		return message;
    }
    
    

});