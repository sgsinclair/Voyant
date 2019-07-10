const Spyral = window.Spyral || {};

{

	class Load {
		static trombone(config, params) {
			let  url = new URL(config && config.trombone ? config.trombone : this.baseUrl+"trombone");
			let all = {...config,...params};
			for (var key in all) {
				if (all[key]===undefined) {delete all[key]}
			}
			let searchParams = Object.keys(all).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(all[key])).join("&")
			let opt = {};
			if (searchParams.length<800 || ("method" in all && all["method"]=="GET")) {
				for (var key in all) {url.searchParams.set(key, all[key]);}
			} else {
				opt = {
					method: 'POST',
					headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
					body: searchParams
				}
			}
			return fetch(url, opt).then(response => {
				if (response.ok) {
					return response.json()
				}
				else {
					return response.text().then(text => {
						if (Voyant && Voyant.util && Voyant.util.DetailedError) {
							new Voyant.util.DetailedError({
								msg: "",
								error: text.split(/(\r\n|\r|\n)/).shift(),
								details: text
							}).showMsg();
						} else {
							alert(text.split(/(\r\n|\r|\n)/).shift())
							if (window.console) {console.error(text)}
						}
						throw Error(text);
					});
				}
			})
			
			
		}
				
		static load(urlToFetch, config) {
			let  url = new URL(config && config.trombone ? config.trombone : this.baseUrl+"trombone");
			url.searchParams.set("fetchData", urlToFetch);
			return fetch(url).then(response => {
				if (response.ok) {
					return response;
				}
				else {
					return response.text().then(text => {
						if (Voyant && Voyant.util && Voyant.util.DetailedError) {
							new Voyant.util.DetailedError({
								error: text.split(/(\r\n|\r|\n)/).shift(),
								details: text
							}).showMsg();
						} else {
							alert(text.split(/(\r\n|\r|\n)/).shift())
							if (window.console) {console.error(text)}
						}
						throw Error(text);
					});
				}
			}).catch(err => {throw err})
		}
	
		static html(url) {
			return this.text(url).then(text => new DOMParser().parseFromString(text, 'text/html'));
		}
		static xml(url) {
			return this.text(url).then(text => new DOMParser().parseFromString(text, 'text/xml'));
		}
		static json(url) {
			return this.load(url).then(response => response.json());
		}
		static text(url) {
			return this.load(url).then(response => response.text());
		}
		static corpus(config) {
			return Spyral.Corpus.load(config);
		}

	}

	class Util {
		static id(len) {
			len = len || 8;
			// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
			return Math.random().toString(36).substring(2, 2+len) + Math.random().toString(36).substring(2, 2+len)
		}
		static toString(contents, config) {
			if (contents.constructor === Array || contents.constructor===Object) {
				contents = JSON.stringify(contents);
				if (contents.length>500) {
					contents = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'+contents.substring(0,500)+" <a href=''>+</a><div style='display: none'>"+contents.substring(501)+"</div>";
				}
			}
			return contents.toString();
		}
		static more(before, more, after) {
			return before + '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'+contents.substring(0,500)+" <a href=''>+</a><div style='display: none'>"+contents.substring(501)+"</div>";

		}
	}
	
	class Metadata {
		constructor(config) {
			['title', 'author', 'description', 'keywords', 'modified', 'created', 'language', 'license'].forEach(key => {
				this[key] = undefined;
			})
			this.version = "0.1"; // may be changed by config
			if (config instanceof HTMLDocument) {
				config.querySelectorAll("meta").forEach(function(meta) {
					var name =  meta.getAttribute("name");
					if (name && this.hasOwnProperty(name)) {
						var content = meta.getAttribute("content");
						if (content) {
							this[name] = content;
						}
					}
				}, this);
			} else {
				this.set(config);
			}
			if (!this.created) {this.setDateNow("created")}
		}
		set(config) {
			for (var key in config) {
				if (this.hasOwnProperty(key)) {
					this[key] = config[key];
				}
			}
		}
		setDateNow(field) {
			this[field] = new Date().toISOString();
		}
		shortDate(field) {
			return this[field] ? (new Date(Date.parse(this[field])).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })) : undefined;
		}
		getHeaders() {
			var quotes = /"/g, newlines = /(\r\n|\r|\n)/g, tags = /<\/?\w+.*?>/g,
				headers = "<title>"+(this.title || "").replace(tags,"")+"</title>\n"
			for (var key in this) {
				if (this[key]) {
					headers+='<meta name="'+key+'" content="'+this[key].replace(quotes, "&quot;").replace(newlines, " ")+'">';
				}
			}
			return headers;
		}
	}
	
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
			return Spyral.Load.trombone(config, {
				tool: "corpus.DocumentTokens",
				corpus: this.corpusid
			}).then(data => data.documentTokens.tokens)
		}

		words(config) {
			return Spyral.Load.trombone(config, {
				tool: "corpus.DocumentTokens",
				noOthers: true,
				corpus: this.corpusid
			}).then(data => data.documentTokens.tokens)
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
	
	class Table {
		constructor(data, config, ...other) {

			this._rows = [];
			this._headers = {};
			this._rowKeyColumnIndex = 0;
			
			// we have a configuration object followed by values: create({headers: []}, 1,2,3) …
			if (data && typeof data == "object" && (typeof config == "string" || typeof config == "number" || Array.isArray(config))) {
				data.rows = [config].concat(other);
				config = undefined;
			}
			
			// we have a simple variable set of arguments: create(1,2,3) …
			if (Array.from(arguments).every(a => a!==undefined && !Array.isArray(a) && typeof a != "object")) {
				data = [data,config].concat(other);
				config = undefined;
			}
			
			// first check if we have a string that might be delimited data
			if (data && (typeof data == "string" || typeof data =="number")) {
				if (typeof data == "number") {data = String(data)} // convert to string for split
				let rows = [];
				let format = config && "format" in config ? config.format : undefined;
				data.split(/(\r\n|[\n\v\f\r\x85\u2028\u2029])+/g).forEach((line,i) => {
					if (line.trim().length>0) {
						let values;
						if ((format && format=="tsv") || line.indexOf("\t")>-1) {
							values = line.split(/\t/);
						} else if ((format && format=="csv") || line.indexOf(",")>-1) {
							values = parseCsvLine(line)
						} else {
							values = [line]
						}
					
						// if we can't find any config information for headers then we try to guess
						// if the first line doesn't have any numbers - this heuristic may be questionable
						if (i==0 && values.every(v => isNaN(v)) && 
							((typeof config != "object") || (typeof config == "object" && !("hasHeaders" in config) && !("headers" in config)))) {
							this.setHeaders(values);
						} else {
							rows.push(values.map(v => isNaN(v) ? v : Number(v)))
						}
					}
				})
				data = rows;
			}

			if (data && Array.isArray(data)) {
				if (config) {
					if (Array.isArray(config)) {
						this.setHeaders(config);
					} else if (typeof config == "object") {
						if ("headers" in config) {
							this.setHeaders(config.headers)
						} else if ("hasHeaders" in config && config.hasHeaders) {
							this.setHeaders(data.shift())
						}
					}
				}

				if (config && "count" in config && config.count) {
					let freqs = Spyral.Table.counts(data);
					if (config.count=="vertical" || ("orientation" in config && config.orientation=="vertical")) {
						for (let item in freqs) {
							this.addRow(item, freqs[item])
						}
						this.rowSort((a,b) => Spyral.Table.cmp(b[1],a[1]))
					} else {
						this._headers = []; // reset and use the terms as headers
						this.addRow(freqs)
						this.columnSort((a,b) => Spyral.Table.cmp(this.cell(0,b),this.cell(0,a)))
					}
				} else {
					this.addRows(data);
				}
			} else if (data && typeof data == "object") {
				if ("headers" in data && Array.isArray(data.headers)) {
					this.setHeaders(data.headers);
				} else if ("hasHeaders" in data && "rows" in data) {
					this.setHeaders(data.rows.shift())
				}
				if ("rows" in data && Array.isArray(data.rows)) {
					this.addRows(data.rows)
				}
				if ("rowKeyColumn" in data) {
					if (typeof data.rowKeyColumn == "number") {
						if (data.rowKeyColumn < this.columns()) {
							this._rowKeyColumnIndex = data.rowKeyColumn;
						} else {
							throw new Error("The rowKeyColumn value is higher than the number headers designated: "+data.rowKeyColum);
						}
					} else if (typeof data.rowKeyColumn == "string") {
						if (data.rowKeyColumn in this._headers) {
							this._rowKeyColumnIndex = this._headers[data.rowKeyColumn];
						} else {
							throw new Error("Unable to find column designated by rowKeyColumn: "+data.rowKeyColumn);
						}
					}
				}
			}
		}
		
		setHeaders(data) {
			if (data && Array.isArray(data)) {
				data.forEach(h => this.addColumn(h), this);
			} else if (typeof data == "object") {
				if (this.columns()==0 || Object.keys(data).length==this.columns()) {
					this._headers = data;
				} else {
					throw new Error("The number of columns don't match: ");
				}
			} else {
				throw new Error("Unrecognized argument for headers, it should be an array or an object."+data)
			}
			return this;
		}
		
		addRows(data) {
			data.forEach(row => this.addRow(row), this);
			return this;
		}
		
		addRow(data, ...other) {
			
			// we have multiple arguments, so call again as an array
			if (other.length>0) {
				return this.addRow([data].concat(other))
			}

			this.setRow(this.rows(), data, true);
			return this;
		}
		
		setRow(ind, data, create) {

			let rowIndex = this.getRowIndex(ind, create);
			if (rowIndex>=this.rows() && !create) {
				throw new Error("Attempt to set row values for a row that does note exist: "+ind+". Maybe use addRow() instead?");
			}
			
			// we have a simple array, so we'll just push to the rows
			if (data && Array.isArray(data)) {
				if (data.length>this.columns()) {
					if (create) {
						for (let i = this.columns(); i<data.length; i++) {
							this.addColumn();
						}
					} else {
						throw new Error("The row that you've created contains more columns than the current table. Maybe use addColunm() first?")
					}
				}
				data.forEach((d,i) => this.setCell(rowIndex, i, d), this);
			}
			
			// we have an object so we'll use the headers
			else if (typeof data == "object") {
				for (let column in data) {
					if (!this.hasColumn(column)) {
					}
					this.setCell(rowIndex, column, data[column]);
				}
			}
			
			else if (this.columns()<2 && create) { // hopefully some scalar value
				if (this.columns()==0) {
					this.addColumn(); // create first column if it doesn't exist
				}
				this.setCell(rowIndex,0,data);
			} else {
				throw new Error("setRow() expects an array or an object, maybe setCell()?")
			}
			
			return this;

		}
		
		setColumn(ind, data, create) {

			let columnIndex = this.getColumnIndex(ind, create);
			if (columnIndex>=this.columns() && !create) {
				throw new Error("Attempt to set column values for a column that does note exist: "+ind+". Maybe use addColumn() instead?");
			}
			
			// we have a simple array, so we'll just push to the rows
			if (data && Array.isArray(data)) {
				data.forEach((d,i) => this.setCell(i, columnIndex, d, create), this);
			}
			
			// we have an object so we'll use the headers
			else if (typeof data == "object") {
				for (let row in data) {
					this.setCell(row, columnIndex, data[column], create);
				}
			}
			
			// hope we have a scalar value to assign to the first row
			else {
				this.setCell(0,columnIndex,data, create);
			}
			
			return this;

		}

		
		
		updateCell(row, column, value, overwrite) {
			let rowIndex = this.getRowIndex(row, true);
			let columnIndex = this.getColumnIndex(column, true);
			let val = this.cell(rowIndex, columnIndex);
			this._rows[rowIndex][columnIndex] = val && !overwrite ? val+value : value;
			return this;
		}
		
		cell(rowInd, colInd) {
			return this._rows[this.getRowIndex(rowInd)][this.getColumnIndex(colInd)];
		}

		setCell(row, column, value) {
			this.updateCell(row,column,value,true);
			return this;
		}
			
		getRowIndex(ind, create) {
			if (typeof ind == "number") {
				if (ind < this._rows.length) {
					return ind;
				} else if (create) {
					this._rows[ind] = Array(this.columns());
					return ind;
				}
				throw new Error("The requested row does not exist: "+ind)
			} else if (typeof ind == "string") {
				let row = this._rows.findIndex(r => r[this._rowKeyColumnIndex] === ind, this);
				if (row>-1) {return row;}
				else if (create) {
					let arr = Array(this.columns());
					arr[this._rowKeyColumnIndex] = ind;
					this.addRow(arr);
					return this.rows();
				}
				else {
					throw new Error("Unable to find the row named "+ind);
				}
			}
			throw new Error("Please provide a valid row (number or named row)");
		}
		
		getColumnIndex(ind, create) {
			if (typeof ind == "number") {
				if (ind < this.columns()) {
					return ind;
				} else if (create) {
					this.addColumn(ind)
					return ind;
				}
				throw new Error("The requested column does not exist: "+ind)
			} else if (typeof ind == "string") {
				if (ind in this._headers) {
					return this._headers[ind];
				} else if (create) {
					this.addColumn({header: ind});
					return this._headers[ind];
				}
				throw new Error("Unable to find column named "+ind);
			}
			throw new Error("Please provide a valid column (number or named column)");
		}
		
		addColumn(config, ind) {
		
			// determine col
			let col = this.columns(); // default
			if (config && typeof config == "string") {col=config}
			else if (config && (typeof config == "object") && ("header" in config)) {col = config.header}
			else if (ind!==undefined) {col=ind}

			// check if it exists
			if (col in this._headers) {
				throw new Error("This column exists already: "+config.header)
			}
			
			// add column
			let colIndex = this.columns();
			this._headers[col] = colIndex;
			
			// determine data
			let data = [];
			if (config && typeof config == "object" && "rows" in config) {data=config.rows}
			else if (Array.isArray(config)) {data = config;}
			
			// add data to each row
			this._rows.forEach((r,i) => r[colIndex] = data[i])
			return this;
		}
		
		/**
		 * This function returns different values depending on the arguments provided.
		 * When there are no arguments, it returns the number of rows in this table.
		 * When the first argument is the boolean value `true` all rows are returned.
		 * When the first argument is a an array then the rows corresponding to the row
		 * indices or names are returned. When all arguments except are numbers or strings
		 * then each of those is returned. 
		 */
		rows(inds, config, ...other) {
		
			// return length
			if (inds==undefined) {
				return this._rows.length;
			}
			
			let rows = [];
			let asObj = (config && typeof config == "object" && config.asObj) ||
				(other.length>0 && typeof other[other.length-1] == "object" && other[other.length-1].asObj);
			
			// return all
			if (typeof inds == "boolean" && inds) {
				rows = this._rows.map((r,i) => this.row(i, asObj))
			}
			
			// return specified rows
			else if (Array.isArray(inds)) {
				rows = inds.map(ind => this.row(ind));
			}
			
			// return specified rows as varargs
			else if (typeof inds == "number" || typeof inds == "string") {
				[inds, config, ...other].every(i => {
					if (typeof i == "number" || typeof i == "string") {
						rows.push(this.row(i, asObj));
						return true
					} else {
						return false
					}
				})
				if (other.length>0) { // when config is in last position
					if (typeof other[other.length-1] == "object") {
						config = other[other.length-1]
					}
				}
			}
			
			// zip if requested
			if (config && typeof config == "object" && "zip" in config && config.zip) {
				if (rows.length<2) {throw new Error("Only one row available, can't zip")}
				return zip(rows);
			}
			else {
				return rows;
			}
		}
		
		row(ind, asObj) {
			let row = this._rows[this.getRowIndex(ind)];
			if (asObj) {
				let obj = {};
				for (let key in this._headers) {
					obj[key] = row[this._headers[key]]
				}
				return obj;
			} else {
				return row;
			}
		}
		
		/**
		 * This function returns different values depending on the arguments provided.
		 * When there are no arguments, it returns the number of rows in this table.
		 * When the first argument is the boolean value `true` all rows are returned.
		 * When the first argument is a number a slice of the rows is returned and if
		 * the second argument is a number it is treated as the length of the slice to
		 * return (note that it isn't the `end` index like with Array.slice()).
		 */
		columns(inds, config, ...other) {
		
			// return length
			if (inds==undefined) {
				return Object.keys(this._headers).length;
			}
			
			let columns = [];
			let asObj = (config && typeof config == "object" && config.asObj) ||
				(other.length>0 && typeof other[other.length-1] == "object" && other[other.length-1].asObj);
			
			// return all columns
			if (typeof inds == "boolean" && inds) {
				for (let i=0, len=this.columns(); i<len; i++) {
					columns.push(this.column(i, asObj));
				}
			}
			
			// return specified columns
			else if (Array.isArray(inds)) {
				inds.forEach(i => columns.push(this.column(i, asObj)), this);
			}
			
			else if (typeof inds == "number" || typeof inds == "string") {
				[inds, config, ...other].every(i => {
					if (typeof i == "number" || typeof i == "string") {
						columns.push(column(ind, asObj));
						return true
					} else {
						return false
					}
				})
				if (other.length>0) { // when config is in last position
					if (typeof other[other.length-1] == "object") {
						config = other[other.length-1]
					}
				}
			}
			
			if (config && typeof config == "object" && "zip" in config && config.zip) {
				if (columns.length<2) {throw new Error("Only one column available, can't zip")}
				return zip(columns);
			}
			else {
				return columns;
			}
		}
		
		column(ind, asObj) {
			let column = this.getColumnIndex(ind);
			let data = this._rows.forEach(r => r[column]);
			if (asObj) {
				let obj = {};
				this._rows.forEach(r => {
					obj[r[this._rowKeyColumnIndex]] = r[column];
				})
				return obj;
			} else {
				return this._rows.map(r => r[column]);
			}
		}
		
		header(ind) {
			let keys = Object.keys(this._headers);
			let i = this.getColumnIndex(ind);
			return keys[keys.findIndex(k => i==this._headers[k])]
		}
		
		headers(inds, ...other) {
			
			// return length
			if (inds==undefined) {
				return this._headers.length;
			}

			let headers = [];
			
			// return all
			if (typeof inds == "boolean" && inds) {
				inds = Array(Object.keys(this._headers).length).fill().map((_,i) => i);
			}
			
			// return specified rows
			if (Array.isArray(inds)) {
				return inds.map(i => this.header(i));
			}
			
			// return specified rows as varargs
			else if (typeof inds == "number" || typeof inds == "string") {
				return [inds, ...other].map(i => this.header(i));
			}
		}

		hasColumn(ind) {
			return ind in this._headers;
		}
		
		forEach(fn) {
			this._rows.forEach((r,i) => fn(r,i));
		}
		
		rowMin(ind) {
			return Math.min.apply(null, this.row(ind));
		}
		
		rowMax(ind) {
			return Math.max.apply(null, this.row(ind));
		}
		
		columnMin(ind) {
			return Math.min.apply(null, this.column(ind));
		}
		
		columnMax(ind) {
			return Math.max.apply(null, this.column(ind));
		}
		
		rowSum(ind) {
			return sum(this.row(ind));
		}
		
		columnSum(ind) {
			return sum(this.column(ind));
		}

		rowMean(ind) {
			return mean(this.row(ind));
		}
		
		columnMean(ind) {
			return mean(this.column(ind));
		}
		
		rowCounts(ind) {
			return Spyral.Table.counts(this.row(ind));
		}
		
		columnCounts(ind) {
			return Spyral.Table.counts(this.column(ind));
		}
		
		rowRollingMean(ind, neighbors, overwrite) {
			let means = rollingMean(this.row(ind), neighbors);
			if (overwrite) {
				this.setRow(ind, means);
			}
			return means;
		}
		
		columnRollingMean(ind, neighbors, overwrite) {
			let means = rollingMean(this.column(ind), neighbors);
			if (overwrite) {
				this.setColumn(ind, means);
			}
			return means;
		}
		
		rowVariance(ind) {
			return variance(this.row(ind));
		}
		
		columnVariance(ind) {
			return variance(this.column(ind));
		}
		
		rowStandardDeviation(ind) {
			return standardDeviation(this.row(ind));
		}
		
		columnStandardDeviation(ind) {
			return standardDeviation(this.column(ind));
		}
		
		rowZScores(ind) {
			return zScores(this.row(ind));
		}
		
		columnZScores(ind) {
			return zScores(this.column(ind));
		}
		
		rowSort(inds, config) {

			// no inds, use all columns
			if (inds===undefined) {
				inds = Array(this.columns()).fill().map((_,i) => i)
			}

			// wrap a single index as array
			if (typeof inds == "string" || typeof inds == "number") {
				inds = [inds];
			}

			if (Array.isArray(inds)) {
				return this.rowSort((a,b) => {
					let ind;
					for (let i=0, len=inds.length; i<len; i++) {
						ind = this.getColumnIndex(inds[i]);
						if (a!=b) {
							if (typeof a[ind] == "string" && typeof b[ind] == "string") {
								return a[ind].localeCompare(b[ind]);
							} else {
								return a[ind]-b[ind];
							}
						}
					}
					return 0;
				}, config)
			}

			if (typeof inds == "function") {
				this._rows.sort((a,b) => {
					if (config && "asObject" in config && config.asObject) {
						let c = {};
						for (let k in this._headers) {
							c[k] = a[this._headers[k]]
						}
						let d = {};
						for (let k in this._headers) {
							d[k] = b[this._headers[k]]
						}
						return inds.apply(this, [c,d]);
					} else {
						return inds.apply(this, [a,b]);
					}
				});
				if (config && "reverse" in config && config.reverse) {
					this._rows.reverse(); // in place
				}
			}
			
			return this;
		}
		
		columnSort(inds, config) {

			// no inds, use all columns
			if (inds===undefined) {
				inds = Array(this.columns()).fill().map((_,i) => i);
			}

			// wrap a single index as array
			if (typeof inds == "string" || typeof inds == "number") {
				inds = [inds];
			}
			
			if (Array.isArray(inds)) {
				
				// convert to column names
				let headers = inds.map(ind => this.header(ind));
				
				// make sure we have all columns
				Object.keys(this._headers).forEach(h => {
					if (!headers.includes(h)) {headers.push(h)}
				});
				
				// sort names alphabetically
				headers.sort((a,b) => a.localeCompare(b))
				
				// reorder by columns
				this._rows = this._rows.map((_,i) => headers.map(h => this.cell(i,h)));
				this._headers = {};
				headers.forEach((h,i) => this._headers[h]=i)
				
			}
			
			if (typeof inds == "function") {
				let headers = Object.keys(this._headers);
				if (config && "asObject" in headers && headers.asObject) {
					headers = headers.map((h,i) => {
						return {header: h, data: this._rows.map((r,j) => this.cell(i,j))}
					})
				}
				headers.sort((a,b) => {
					return inds.apply(this, [a,b]);
				})
				headers = headers.map(h => typeof h == "object" ? h.header : h); // convert back to string
				
				// make sure we have all keys
				Object.keys(this._headers).forEach(k => {
					if (headers.indexOf(k)==-1) {headers.push(k)}
				})
				
				this._rows = this._rows.map((_,i) => headers.map(h => this.cell(i,h)));
				this._headers = {};
				headers.forEach((h,i) => this._headers[h]=i)
			}
			
		}
		
		chart(target, config) {
			Chart.chart(target, this, config);
		}
		
		toCsv(config) {
			const cell = function(c) {
				let quote = /"/g;
				return typeof c == "string" && (c.indexOf(",")>-1 || c.indexOf('"')>-1) ? '"'+c.replace(quote,'\"')+'"' : c;
			}
			return (config && "noHeaders" in config && config.noHeaders ? "" : this.headers(true).map(h => cell(h)).join(",") + "\n") +
				this._rows.map(row => row.map(c => cell(c)).join(",")).join("\n")
		}
		
		toTsv(config) {
			return config && "noHeaders" in config && config.noHeaders ? "" : this.headers(true).join("\t") + "\n" +
				this._rows.map(row => row.join("\t")).join("\n");
		}
		
		html(target, config) {
			let html = this.toHtml();
			if (typeof target == "function") {
				target(html)
			} else {
				if (typeof target == "string") {
					target = document.querySelector(target);
					if (!target) {
						throw "Unable to find specified target: "+target;
					}
				}
				if (typeof target == "object" && "innerHTML" in target) {
					target.innerHTML = html;
				}
			}
			return this;
		}
		
		toHtml(config) {
			return "<table class='spyral-table'>" +
				((config && "caption" in config && typeof config.caption == "string") ?
						"<caption>"+config.caption+"</caption>" : "") +
				((config && "noHeaders" in config && config.noHeaders) ? "" : ("<thead><tr>"+this.headers(true).map(c => "<th>"+c+"</th>").join("")+"</tr></thead>"))+
				"<tbody>"+
				this._rows.map(row => "<tr>"+row.map(c => "<td>"+(typeof c === "number" ? c.toLocaleString() : c)+"</td>").join("")+"</tr>") +
				"</tbody></table>";
		}
		
		chart(target, config) {
			
			if (!target) {
				target = document.createElement("div");
				document.body.appendChild(target);
			}

			config = config || {};
			config.chart = config.chart || {};
			
			let columnsCount = this.columns();
			let rowsCount = this.rows();
			let headers = this.headers(config.columns ? config.columns : true);
			let isHeadersCategories = headers.every(h => isNaN(h));

			if (isHeadersCategories) {
				Chart.setDefaultChartType(config, "column");
			}
			
			// set categories if not set
			config.xAxis = config.xAxis || {};
			config.xAxis.categories = config.xAxis.categories || headers;
			
			// start filling in series
			config.series = config.series || [];
			
			// one row, so let's take series from rows
			if (rowsCount==1) {
				config.seriesFrom = config.seriesFrom || "rows";
			}
			
			if (config.seriesFrom=="rows") {
				this.rows(config.rows ? config.rows : true).forEach((row, i) => {
					config.series[i] = config.series[i] || {};
					config.series[i].data = headers.map(h => this.cell(i, h));
				})
			} else {
				
			}
			
			return Chart.chart(target, config);
		}
		
		static create(config, data) {
			return new Table(config, data);
		}
		
		static counts(data) {
			let vals = {};
			data.forEach(v => v in vals ? vals[v]++ : vals[v]=1);
			return vals;
		}
		
		static cmp(a, b) {
			return typeof a == "string" && typeof b == "string" ? a.localeCompare(b) : a-b;
		}
		
	}
	
	class Notebook {
		static getPreviousBlock() {
			return Spyral.Notebook.getBlock(-1);
		}
		static getNextBlock() {
			return Spyral.Notebook.getBlock(1);
		}
		static getBlock() {
			if (Voyant && Voyant.notebook) {
				return Voyant.notebook.Notebook.currentNotebook.getBlock.apply(Voyant.notebook.Notebook.currentNotebook, arguments)
			}
		}
		static show(contents, config) {
			var contents = Spyral.Util.toString(contents, config);
			if (contents instanceof Promise) {
				contents.then(c => Voyant.notebook.util.Show.show(c))
			} else {
				Voyant.notebook.util.Show.show(contents);
			}
		}
	}

	Object.assign(Spyral, {Metadata, Util, Load, Corpus, Table, Notebook})
	loadCorpus = function() {return Spyral.Load.corpus.apply(Spyral.Load.Corpus, arguments)}
	createTable = function() {return new Spyral.Table(...arguments)}
}

// declare static fields here since they're not supported by some browsers
Spyral.Load.baseUrl = "http://localhost:8080/voyant/trombone";
