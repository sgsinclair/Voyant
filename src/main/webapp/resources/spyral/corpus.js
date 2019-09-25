// assumes Spyral has already been declared (by spyral.js)

{
	class Corpus {
		constructor(id) {
			this.corpusid = id;
		}
		id() {
			return this.corpusid;
		}
		metadata(config, params) {
			return Spyral.Load.trombone(config, {
				tool: this._isDocumentsMode(config) ? "corpus.DocumentsMetadata" : "corpus.CorpusMetadata",
				corpus: this.corpusid
			})
			.then(data => this._isDocumentsMode(config) ? data.documentsMetadata.documents : data.corpus.metadata)
		}
		
		summary(config) {
			return this.metadata().then(data => {
				// TODO: make this a template
				return `This corpus (${data.alias ? data.alias : data.id}) has ${data.documentsCount.toLocaleString()} documents with ${data.lexicalTokensCount.toLocaleString()} total words and ${data.lexicalTypesCount.toLocaleString()} unique word forms.`
			})
		}
		
		titles(config) {
			return Spyral.Load.trombone(config, {
				tool: "corpus.DocumentsMetadata",
				corpus: this.corpusid
			})
			.then(data => data.documentsMetadata.documents.map(doc => doc.title))
		}
		
		text(config) {
			return this.texts(config).then(data => data.join("\n"))
		}
		
		texts(config) {
			return Spyral.Load.trombone(config, {
				tool: "corpus.CorpusTexts",
				corpus: this.corpusid
			}).then(data => data.texts.texts)
		}
		
		terms(config) {
			return Spyral.Load.trombone(config, {
				tool: this._isDocumentsMode(config) ? "corpus.DocumentTerms" : "corpus.CorpusTerms",
				corpus: this.corpusid
			}).then(data => this._isDocumentsMode(config) ? data.documentTerms.terms : data.corpusTerms.terms)
		}
		
		tokens(config) {
			config = config || {};
			// by default DocumentTokens limits to 50 which probably isn't expected
			return Spyral.Load.trombone(config, {
				tool: "corpus.DocumentTokens",
				corpus: this.corpusid
			}).then(data => data.documentTokens.tokens)
		}

		words(config) {
			config = config || {};
			// by default DocumentTokens limits to 50 which probably isn't expected
			if (!("limit" in config)) {config.limit=0;}
			return Spyral.Load.trombone(config, {
				tool: "corpus.DocumentTokens",
				noOthers: true,
				corpus: this.corpusid
			}).then(data => data.documentTokens.tokens.map(term => term.term))
		}
		
		contexts(config) {
			if ((!config || !config.query) && console) {console.warn("No query provided for contexts request.")}
			return Spyral.Load.trombone(config, {
				tool: "corpus.DocumentContexts",
				corpus: this.corpusid
			}).then(data => data.documentContexts.contexts)
		}
		
		collocates(config) {
			if ((!config || !config.query) && console) {console.warn("No query provided for collocates request.")}
			return Spyral.Load.trombone(config, {
				tool: "corpus.CorpusCollocates",
				corpus: this.corpusid
			}).then(data => data.corpusCollocates.collocates)
		}

		phrases(config) {
			return Spyral.Load.trombone(config, {
				tool: this._isDocumentsMode(config) ? "corpus.DocumentNgrams" : "corpus.CorpusNgrams",
				corpus: this.corpusid
			}).then(data => this._isDocumentsMode(config) ? data.documentNgrams.ngrams : data.corpusNgrams.ngrams)
		}
		
		correlations(config) {
			if ((!config || !config.query) && console) {
				console.warn("No query provided for correlations request.")
				if (!this._isDocumentsMode(config)) {
					throw new Error("Unable to run correlations for a corpus without a query.")
				}
			}
			return Spyral.Load.trombone(config, {
				tool: this._isDocumentsMode(config) ? "corpus.DocumentTermCorrelations" : "corpus.CorpusTermCorrelations",
				corpus: this.corpusid
			}).then(data => data.termCorrelations.correlations)
		}
		
		tool(tool, config) {
			config = config || {}
			let out='<iframe ';

			// construct attributes of iframe
			let defaultAttributes = {
				width: undefined,
				height: undefined,
				style: "width: 90%; height: 400px;"
			}
			for (let attr in defaultAttributes) {
				var val = config[attr] || defaultAttributes[attr];
				if (val) {
					out+=' '+attr+'="'+val+'"';
				}
			}

			// construct src URL
			var url = new URL((config && config.voyantUrl ? config.voyantUrl : Spyral.Load.baseUrl) + "tool/"+tool+"/");
			url.searchParams.append("corpus", this.corpusid);
			
			// add API values from config (some may be ignored)
			Object.keys(config || {}).forEach(key => {
				if (key!="input" && !(key in defaultAttributes)) {
					url.searchParams.append(key, config[key])
				}
			});
			return out+' src="'+url+'"></iframe>'
		}

		htmltool(html, tool, config) {
			return new Promise((resolve,reject) => {
				this.tool(undefined, tool, config).then(out => resolve(html`${out}`));
			});
		}
		
		toString() {
			return this.summary()
		}
		
		_isDocumentsMode(config) {
			return config && ((config.mode && config.mode=="documents") || config.documents);
		}

		static load(config) {
			var promise =  new Promise(function(resolve, reject) {
				if (config instanceof Corpus) {
					resolve(config);
				} else if (typeof config == "string" && config.length>0 && /\W/.test(config)==false) {
					resolve(new Corpus(config))
				} else if (typeof config == "object" && config.corpus) {
					resolve(new Corpus(config.corpus))
				} else {
					if (typeof config == "string") {config = {input: config}}
					if (config && config.input) {
						Spyral.Load.trombone(config, {tool: "corpus.CorpusMetadata"})
						.then(data => resolve(new Corpus(data.corpus.metadata.id)))
					}
				}
			});
			
			["id","metadata","summary","titles","text","texts","terms","tokens","words","contexts","collocates","phrases","correlations","tool"].forEach(name => {
				promise[name] = function() {
					var args = arguments
					return promise.then(corpus => {return corpus[name].apply(corpus, args)})
				}
			})
			promise.assign = function(name) {
				this.then(corpus => {window[name] = corpus; return corpus})
			}
			return promise;
		}
	}
	Object.assign(Spyral, {Corpus})

	loadCorpus = function() {return Spyral.Load.corpus.apply(Spyral.Load.Corpus, arguments)}

}