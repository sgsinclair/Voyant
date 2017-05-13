/**
 * @class VoyantTable
 * A VoyantTable can facilitate working with tabular data structures, as well as
 * displaying results (especially with {@link #embed} and {@link show}). 
 * Here's a simple example showing the Zipf-Law distribution of the top 20 frequency terms.
 * 
 * 	new Corpus("austen").loadCorpusTerms(20).then(function(corpusTerms) {
 * 		var table = new VoyantTable({rowKey: 0}); // use first column as row key
 * 		corpusTerms.each(function(corpusTerm) {
 *			table.addRow([corpusTerm.getTerm(), corpusTerm.getRawFreq()]);
 * 		});
 * 		table.embed("voyantchart"); // graph table as line chart
 * 	});
 */
Ext.define('Voyant.data.table.Table', {
	alternateClassName: ["VoyantTable"],
	mixins: ['Voyant.notebook.util.Embed','Voyant.notebook.util.Show'],
	embeddable: ['Voyant.widget.VoyantTableTransform','Voyant.widget.VoyantChart','Voyant.widget.CodeEditor'],
	config: {
		
		/**
		 * @private
		 */
		rows: [],

		/**
		 * @private
		 */
		headers: [],

		/**
		 * @private
		 */
		headersMap: {},
		
		/**
		 * Specifies that a specific header should serve as row key.
		 * 
		 */
		rowKey: undefined,
		
		/**
		 * @private
		 */
		model: undefined
	},

	constructor: function(config, opts) {

		config = config || {};
		
		if (config.fromBlock) {
			var data = Voyant.notebook.Notebook.getDataFromBlock(config.fromBlock);
			if (data) {
				config.rows = [];
				data.split(/\n+/).forEach(function(line,i) {
					var cells = line.split("\t");
					if (i==0 && !config.noHeaders) {
						config.headers = cells
					} else {
						config.rows.push(cells)
					}
				})
				
			}
		} else if (config.count && Ext.isArray(config.count)) {
			// create counts
			var freqs = {};
			config.count.forEach(function(item) {freqs[item] = freqs[item] ? freqs[item]+1 : 1;});
			// sort counts
			var counts = [];
			for (var key in freqs) {counts.push([key, freqs[key]])}
			counts.sort(function(a,b) {return b[1] - a[1]});
			if (config.limit && counts.length>config.limit) {
				counts.splice(config.limit);
			}
			if (config.orientation && config.orientation=="horizontal") {
				config.headers = counts.map(function(item) {return item[0]});
				config.rows = [counts.map(function(item) {return item[1]})];
			} else {
				config.headers = config.headers ? config.headers : ["Item","Count"];
				config.rows = counts;
			}
		} else if (config.isStore || config.store) {
			var store = config.store ? config.store : config;
			if (opts && opts.headers) {
				config.headers = opts.headers;
			} else {
				// store.getModel() doesn't seem to work (for CorpusTerms at least)
				// so instead we'll try looking at the first record to get headers
				var record = store.getAt(0);
				if (record) { // don't know what to do if this fails?
					config.headers = record.getFields().map(function(field) {return field.getName()});
				}
			}
			
			// now we get rows
			config.rows = [];
			store.each(function(record) {
				var data = record.getData();
				var cells = config.headers.map(function(header) {return data[header]}); // only from headers
				config.rows.push(cells);
			}, this);
		}

				
		// not sure why config isn't working
		this.setRows(Ext.Array.from(Ext.isArray(config) ? config : config.rows));
		this.setHeaders(Ext.Array.from(config.headers));
		this.setRowKey(config.rowKey ? config.rowKey : this.getHeaders()[0]);

		// if we have no headers, use the index as header
		if (this.getHeaders().length==0) {
			var firstRow = this.getRow(0, false);
			if (firstRow) {
				this.setHeaders(firstRow.map(function(cell, i) {return i}));
			}
		}
		
		var headersMap = {};
		this.getHeaders().forEach(function(header, i) {
			headersMap[header] = i;
		});
		this.setHeadersMap(headersMap);
		
		this.callParent();
	},
	addRow: function(row) {
		debugger
		if (Ext.isObject(row)) {
			var len = this.getRows().length;
			for (var key in row) {
				this.updateCell(len, key, row[key])
			}
			
		} else if (Ext.isArray(row)) {
			this.getRows().push(row);
		}
	},
	eachRecord: function(fn, scope) {
		var item, i=0, len=this.getRows().length;
		for (; i<len; i++) {
            item = this.getRecord(i);
			if (fn.call(scope || item, item, i, len) === false) {
                break;
            }			
		}
	},
	eachRow: function(fn, asMap, scope) {
		var item, i=0, len=this.getRows().length;
		for (; i<len; i++) {
            item = this.getRow(i, asMap);
			if (fn.call(scope || item, item, i, len) === false) {
                break;
            }			
		}
	},
	getRow: function(index, asMap) {
		if (asMap) {
			var row = {};
			var headers = this.getHeaders();
			Ext.Array.from(this.getRows()[index]).forEach(function(item, i) {
				row[headers[i] || i] = item;
			}, this);
			return row;
		} else {
			return this.getRows()[index];
		}
	},
	getRecord: function(index) {
		if (this.model) {return new this.model(this.getRow(index, true))}
	},
	mapRows: function(fn, asMap, scope) {
		var rows = [];
		this.eachRow(function(row, i) {
//			if (Object.keys(row).length>0) {
				rows.push(fn.call(scope || this, row, i))
//			}
		}, asMap, this)
		return rows;
	},
	
	/**
	 * Update the cell value at the specified row and column.
	 * 
	 * This will create the row and column as needed. If there's an existing value in the cell,
	 * it will be added to the new value, unless the `replace` argument is set to true.
	 * 
	 * @param {Number/String} row The cell's row.
	 * @param {Number/String} column The cell's column.
	 * @param {Mixed} value The cell's value.
	 * @param {boolean} [replace] Replace the current value (if it exists), otherwise
	 * the value is added to any current value (which is the default behaviour).
	 */
	updateCell: function(row, column, value, replace) {
		var rows = this.getRows();
		var r = Ext.isNumber(row) ? row : this.getRowIndex(row);
		var c = this.getColumnIndex(column);
		if (rows[row]===undefined) {rows[row]=[]}
		if (rows[row][c]===undefined || replace) {rows[row][c]=value}
		else {rows[row][c]+=value}
	},
	
	getRowIndex: function(key) {
		if (Ext.isString(key)) {
			console.error("Implement this"); alert("Unimplemented method: VoyantTable.getRowIndex()");
		}
	},
	
	getColumnIndex: function(column) {
		var headers = this.getHeaders();
		if (Ext.isNumber(column)) {
			if (headers[column]===undefined) {
				headers[column]=column;
				this.getRows().forEach(function(row) {
					row.splice(column, 0, "");
				});
			}
			return column;
		} else if (Ext.isString(column)) {
			if (!this.getHeadersMap()[column]) {
				// we don't have this column yet, so create it and expand rows
				this.getHeaders().push(column);
				this.getHeadersMap()[column] = this.getHeaders().length-1
				this.getRows().forEach(function(row) {
					row.push("")
				});
			}
			return this.getHeadersMap()[column]
		}
	},
	
	embed: function(cmp, config) {
		if (!config && Ext.isObject(cmp)) {
			config = cmp;
			cmp = this.embeddable[0];
		}
		config = config || {};
		
		Ext.apply(config, {
			tableJson: JSON.stringify({
				rowkey: this.getRowKey(),
				headers: this.getHeaders(),
				rows: this.getRows(),
				config: config
			})
		});
		delete config.axes;
		delete config.series;
		
		embed.call(this, cmp, config);
		
	},
	
	toTsv: function(config) {
		var tsv = this.getHeaders().join("\t");
		this.getRows().forEach(function(row, i) {
			if (config && Ext.isNumber(config) && i>config) {return;}
			tsv += "\n"+row.map(function(cell) {return cell.replace(/(\n|\t)/g, "")}).join("\t");
		})
		return tsv;
	},
	
	getString: function(config) {
		config = config || {};
		var table = "<table class='voyant-table' style='"+(config.width ? ' width: '+config.width : '')+"' id='"+(config.id ? config.id : Ext.id())+"'>";
		var headers = this.getHeaders();
		if (headers.length) {
			table+="<thead><tr>";
			for (var i=0, len = headers.length; i<len; i++) {
				table+="<th>"+headers[i]+"</th>";
			}
			table+="</tr></thead>";
		}
		table+="<tbody>";
		for (var i=0, len = Ext.isNumber(config) ? config : this.getRows().length; i<len; i++) {
			table+="<tr>";
			var row = this.getRow(i);
			row.forEach(function(cell) {
				table+="<td>"+cell+"</td>";
			})
			table+="</tr>";
		}
		table+="</tbody></table>";
		return table;
	}
});