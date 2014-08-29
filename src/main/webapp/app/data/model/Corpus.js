var Corpus = function(source, config) {
	return Ext.create("Voyant.data.model.Corpus", source, config);
}

Ext.define('Voyant.data.model.Corpus', {
	alternateClassName: ["Corpus"],
    mixins: ['Voyant.notebook.util.Embeddable','Voyant.util.Transferable','Voyant.util.Localization'],
    transferable: ['show',/*'embed','embedSummary',*/'getSize','getId','getDocument','getDocuments','getCorpusTerms','getDocumentsCount','getWordTokensCount','getWordTypesCount','getDocumentTerms'],
    embeddable: ['Voyant.panel.Summary','Voyant.panel.Cirrus','Voyant.panel.Documents','Voyant.panel.CorpusTerms'],
	requires: ['Voyant.util.ResponseError','Voyant.data.store.CorpusTerms','Voyant.data.store.Documents','Voyant.panel.Documents'],
    extend: 'Ext.data.Model',
    config: {
    	documentsStore: undefined
    },
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
				en: new Ext.Template("with {words} <span class='info-tip' data-qtip='every occurrence of every word (like multiple occurrences of \"the\") is counted'>total words</span> and {types} <span class='info-tip' data-qtip='multiple occurrences of words (like \"the\") are counted once'>unique word forms</span>")
			},
			yearAgo: {
				en: new Ext.Template("about a year ago")
			},
			yearsAgo: {
				en: new Ext.Template("about {count} years ago")
			},
			monthAgo: {
				en: new Ext.Template("about a month ago")
			},
			monthsAgo: {
				en: new Ext.Template("about {count} months ago")
			},
			dayAgo: {
				en: new Ext.Template("about a day ago")
			},
			daysAgo: {
				en: new Ext.Template("about {count} days ago")
			},
			hourAgo: {
				en: new Ext.Template("about an hour ago")
			},
			hoursAgo: {
				en: new Ext.Template("about {count} hours ago")
			},
			minuteAgo: {
				en: new Ext.Template("about a minute ago")
			},
			minutesAgo: {
				en: new Ext.Template("about {count} minutes ago")
			},
			secondAgo: {
				en: new Ext.Template("about a second ago")
			},
			secondsAgo: {
				en: new Ext.Template("{count} seconds ago")
			},
			now: {
				en: 'now'
			}
    	}
    },
    
    fields: [
         {name: 'documentsCount', type: 'int'},
         {name: 'lexicalTokensCount', type: 'int'},
         {name: 'lexicalTypesCount', type: 'int'},
         {name: 'createdTime', type: 'int'},
         {name: 'createdDate', type: 'date', dateFormat: 'c'}
    ],

    /**
     * Create a new Corpus.
     * @param {Mixed} [source] The source document(s) as a text string, a URL, or an Array of text strings and URLs.
     * @param {Object} [config] Configuration options for creating the {@link Corpus}.
     */
	constructor : function(source, config) {
				
		this.callParent([config]); // only send config, not source
    	this.mixins['Voyant.notebook.util.Embeddable'].constructor.apply(this);

		if (source) {
			
			config = config || {};
			Ext.apply(config, {tool: 'corpus.CorpusMetadata'})

			if (Ext.isString(source) || Ext.isArray(source)) {
				config.input = source;
			}
			else if (Ext.isObject(source)) {Ext.apply(config, source)}

			var dfd = Voyant.application.getDeferred(this);
			var me = this;	
//			config.input="http://asdfasfa/"
			$.getJSON(Voyant.application.getTromboneUrl(), config).done(function(data) {
				me.set(data.corpus.metadata)
				var store = Ext.create("Voyant.data.store.Documents", {corpus: me});
				me.setDocumentsStore(store);
				store.load({
					params: {
						limit: 1000
					},
					callback: function(records, st, success) {
						me.setDocumentsStore(this);
						dfd.resolve(me);
					},
					scope: store
				})
			}).fail(function(response) {
				Voyant.application.showResponseError(me.localize('failedCreateCorpus'), response);
				dfd.reject(); // don't send error since we've already shown it
			});
			
			return Voyant.application.getPromiseFromDeferred(dfd);

		}
	},
	
	getId: function() {
		// overrides the getId() function from the model to handle promises
    	return this.then ? Voyant.application.getDeferredNestedPromise(this, arguments) : this.get('id');		
	},
	
	getCorpusTerms: function(config) {
		return Ext.create("Voyant.data.store.CorpusTerms", Ext.apply(config || {}, {corpus: this}));
	},
	
	getDocumentQueryMatches: function(config) {
		// not expected to be called before corpus is defined
		return Ext.create("Voyant.data.store.DocumentQueryMatches", Ext.apply(config || {}, {corpus: this}));
	},
	
	getDocumentTerms: function(config) {
		return Ext.create("Voyant.data.store.DocumentTerms", Ext.apply(config || {}, {corpus: this}));
	},
	
	getDocuments: function(config) {
		return this.getDocumentsStore() ? this.getDocumentsStore() : Ext.create("Voyant.data.store.Documents", Ext.apply(config || {}, {corpus: this}));
		//this.then ? Voyant.application.getDeferredNestedPromise(this, arguments) : this.getDocumentsStore();
	},
	
	getDocument: function(config) {
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

    show: function(config) {
    	return this.then ?  Voyant.application.getDeferredNestedPromise(this, arguments) : this.getShow().show();
    },
    
    getShow: function(config) {
    	if (this.then) {
    		return Voyant.application.getDeferredNestedPromise(this, arguments);
    	}

		var size = this.getDocumentsCount();
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
			message+=' '+this.localize('widthNwordsAndNTypes', {words: Ext.util.Format.number(this.getWordTokensCount(),"0,000"), types: Ext.util.Format.number(this.getWordTypesCount(),"0,000")})+'.'
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
        				if (count==1) {message+=this.localize(time[0]+'Ago', {count: count, date: createdDate})}
        				else {message+=this.localize(time[0]+'sAgo', {count: count, date: createdDate})}
        				message+="</span>";
        				return false
        			}
				}, this
			)===true) { // if array returns true, none of the conditions matched, so say now
				message+=this.localize('now');
			}
			message+='.';
		}
		return message;
    }
    
    

});