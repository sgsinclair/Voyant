Ext.define('Voyant.data.model.Document', {
    extend: 'Ext.data.Model',
    //requires: ['Voyant.data.store.DocumentTerms'],
    fields: [
             {name: 'corpus'},
             {name: 'id'},
             {name: 'index', type: 'int'},
             {name: 'tokensCount-lexical', type: 'int'},
             {name: 'typesCount-lexical', type: 'int'},
             {name: 'typeTokenRatio-lexical', type: 'float', calculate:  function(data) {
        	 	return data['typesCount-lexical']/data['tokensCount-lexical'];
             }},
             {name: 'lastTokenStartOffset-lexical', type: 'int'},
             {name: 'title'},
             {name: 'language', convert: function(data) {return Ext.isEmpty(data) ? '' : data;}},
             {name: 'sentencesCount', type: 'int'},
             {name: 'averageWordsPerSentence', type: 'float', calculate:  function(data) {
        	 	return data['sentencesCount'] ? data['tokensCount-lexical'] / data['sentencesCount'] : 0;
			 }},
			 {name: 'css', type: 'string'}
    ],
    
    getLexicalTokensCount: function() {
    	return this.get('tokensCount-lexical')
    },
    
    getLexicalTypeTokenRatio: function() {
    	return this.get('typeTokenRatio-lexical')
    },
    
    loadDocumentTerms: function(config) {
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
			var documentTerms = this.getDocumentTerms();
			documentTerms.load({
				params: config,
				callback: function(records, operation, success) {
					if (success) {
						dfd.resolve(documentTerms)
					} else {
						dfd.reject(operation)
					}
				}
			})
			return dfd.promise
		}
    	
    },
    
    loadTokens: function(config) {
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
			var tokens = this.getTokens({});
			tokens.load({
				params: config,
				callback: function(records, operation, success) {
					if (success) {
						dfd.resolve(tokens)
					} else {
						dfd.reject(operation)
					}
				}
			})
			return dfd.promise
		}
    	
    },
    
    getTokens: function(config) {
		if (this.then) {
			return Voyant.application.getDeferredNestedPromise(this, arguments);
		} else {
	    	config = config || {};
	    	Ext.applyIf(config, {
	    		proxy: {}
	    	});
	    	Ext.applyIf(config.proxy, {
	    		extraParams: {}
	    	})
	    	Ext.applyIf(config.proxy.extraParams, {
	    		docIndex: this.get('index')
	    	})
	    	Ext.apply(config, {
	    		docId: this.get('id')
	    	});
	    	return this.get('corpus').getTokens(config);
		}
    },

    getDocumentTerms: function(config) {
		if (this.then) {
			return Voyant.application.getDeferredNestedPromise(this, arguments);
		} else {
	    	config = config || {};
	    	Ext.applyIf(config, {
	    		proxy: {}
	    	});
	    	Ext.applyIf(config.proxy, {
	    		extraParams: {}
	    	})
	    	Ext.applyIf(config.proxy.extraParams, {
	    		docIndex: this.get('index')
	    	})
	    	if (config.corpus) {
	    		return config.corpus.getDocumentTerms(config);
	    	}
	    	return this.get('corpus').getDocumentTerms(config); // FIXME: when does this happen?
		}
    },
    
    getIndex: function() {
    	return this.get('index');
    },
    
    getId: function() {
    	return this.get('id');
    },
    
    getFullLabel: function() {
    	var author = this.getAuthor();
    	return this.getTitle() + (author ? "("+author+")" : ''); // TODO: complete full label
    },
    
    getTitle: function() {
    	var title = this.get('title');
    	if (title === undefined) title = '';
    	title = Ext.isArray(title) ? title.join("; ") : title;
    	title = title.trim().replace(/\s+/g, ' '); // remove excess whitespace
    	return title;
    },
    
    getTruncated: function(string, max) {
  		if (string.length > max) {
				// maybe a file or URL?
				var slash = string.lastIndexOf("/");
				if (slash>-1) {
					string = string.substr(slash+1);
				}
				
				if (string.length>max) {
					var space = string.indexOf(" ", max-5);
					if (space < 0 || space > max) {
						space = max;
					}
					string = string.substring(0, space) + "…";
				}
		}
  		return string;
    	
    },
    
    getShortTitle: function() {
     	var title = this.getTitle();
     	title = title.replace(/\.(html?|txt|xml|docx?|pdf|rtf|\/)$/,'');
     	title = title.replace(/^(the|a|le|l'|un|une)\s/,'');
     	return this.getTruncated(title, 25);
    },
    
    getTinyTitle: function() {
    	return this.getTruncated(this.getShortTitle(), 10);
    },
    
    getShortLabel: function() {
    	var author = this.getAuthor(25);
    	return (parseInt(this.getIndex())+1) + ') <i>' + this.getShortTitle() + "</i>" +(author ? " ("+author+")" : '')
    },
    
    getTinyLabel: function() {
    	return (parseInt(this.getIndex())+1) + ') ' + this.getTinyTitle();
    },
    
    getAuthor: function(max) {
    	var author = this.get('author') || "";
    	author = Ext.isArray(author) ? author.join("; ") : author;
    	author = author.trim().replace(/\s+/g, ' ');
    	return max ? this.getTruncated(author, max) : author;
    },
    
    getCorpusId: function() {
    	return this.get('corpus').getAliasOrId();
    },
    
    isPlainText: function() {
    	if (this.get("extra.Content-Type") && new RegExp("plain","i").test(this.get("extra.Content-Type"))) {
    		return true
    	}
    	return false;
    },
    
    getAverageWordsPerSentence: function() {
    	return this.get("averageWordsPerSentence");
    },
    
    show: function() {
    	show(this.getFullLabel())
    },
    
    getCorpus: function() {
    	return this.get('corpus');
    },
    
    
    getText: function(config) {
		if (this.then) {
			return Voyant.application.getDeferredNestedPromise(this, arguments);
		} else {
			var dfd = Voyant.application.getDeferred(this);
	    	config = config || {};
	    	Ext.apply(config, {
        		tool: 'corpus.DocumentTokens',
        		corpus: this.getCorpusId()
	    	})
	    	this.getTokens(config).then(function(tokens) {
	    		dfd.resolve(tokens);
	    	});
	    	return dfd.promise
		}
    },
    
    getPlainText: function(config) {
		if (this.then) {
			return Voyant.application.getDeferredNestedPromise(this, arguments);
		} else {
	    	config = config || {};
	    	Ext.apply(config, {
    			outputFormat: "text",
    			template: "docTokens2text",
    			noOthers: true
	    	});
			return this.getText();
		}
    	
    },
    
    getLemmasArray: function(config) {
    	config = config || {};
    	config.docId = this.getId();
		return this.getCorpus().getLemmasArray(config);
//		if (this.then) {
//			return Voyant.application.getDeferredNestedPromise(this, arguments);
//		} else {
//	    	config = config || {};
//	    	Ext.apply(config, {
//    			docId: this.getId()
//	    	});
//			return this.getCorpus().getLemmasArray(config);
//		}
    },
    
    getEntities: function(config) {
    	config = config || {};
    	Ext.applyIf(config, {
    		proxy: {}
    	});
    	Ext.applyIf(config.proxy, {
    		extraParams: {}
    	})
    	Ext.applyIf(config.proxy.extraParams, {
    		docIndex: this.get('index')
    	})
		return Ext.create("Voyant.data.store.DocumentEntities", Ext.apply(config, {corpus: this.getCorpus(), docId: this.getId()}));
    },
    
    loadEntities: function(config) {
		var me = this;
		if (this.then) {
			return Voyant.application.getDeferredNestedPromise(this, arguments);
		} else {
			var dfd = Voyant.application.getDeferred(this);
			this.getEntities().load({
				params: config,
				callback: function(records, operation, success) {
					if (success) {
						dfd.resolve(records)
					} else {
						dfd.reject(operation.error.response);
					}
				}
			})
			return dfd.promise
		}
	},
	
	getCSS: function() {
		return this.get('css')
	}
    
});