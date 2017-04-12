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
	embeddable: ['Voyant.widget.VoyantTableTransform','Voyant.widget.VoyantChart'],
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
				
		// not sure why config isn't working
		this.setRows(Ext.Array.from(Ext.isArray(config) ? config : config.rows));
		this.setHeaders(Ext.Array.from(config.headers));
		this.setRowKey(config.rowKey ? config.rowKey : this.getHeaders()[0]);
		
		if (config.count && Ext.isArray(config.count)) {
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
				this.setHeaders(counts.map(function(item) {return item[0]}));
				this.setRows([counts.map(function(item) {return item[1]})]);
			} else {
				this.setHeaders(config.headers ? config.headers : ["Item","Count"]);
				this.setRowKey(config.rowKey ? config.rowKey : this.getHeaders()[0]);
				this.setRows(counts);
			}
		}
		
		if (config.isStore || config.store) {
			var store = config.store ? config.store : config;
			
			if (opts && opts.headers) {
				this.setHeaders(opts.headers);
			} else {
				// store.getModel() doesn't seem to work (for CorpusTerms at least)
				// so instead we'll try looking at the first record to get headers
				var record = store.getAt(0);
				if (record) { // don't know what to do if this fails?
					this.setHeaders(record.getFields().map(function(field) {return field.getName()}))
				}
			}
			
			// now we get rows
			store.each(function(record) {
				this.addRow(record.getData());
			}, this);
			debugger
		}
		this.callParent();
	},
	addRow: function(row) {
		if (Ext.isObject(row)) {
			this.getRows().push(this.getHeaders().map(function(key) {return row[key]}))
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
		if (rows[row]===undefined) {rows[row]=[]}
		if (rows[row][column]===undefined || replace) {rows[row][column]=value}
		else {rows[row][column]+=value}
	},
	
	embed: function(cmp, config) {
		if ((Ext.isObject(cmp) || !cmp) && !config) {
			config = cmp || {};

			return embed.call(this, this.embeddable[0], Ext.apply(config, {
				tableJson: JSON.stringify({
					rowkey: this.getRowKey(),
					headers: this.getHeaders(),
					rows: this.getRows()
				})
			}));

		}
		config = config || {};
		chart = {};
		
		// build data
		var rowKey = this.getRowKey();
		var data = this.mapRows(function(row, i) {
			return rowKey===undefined ? Ext.apply(row, {"row-index": i}) : row;
		}, true, this)
		
		// set chart store
		Ext.apply(chart, {
			store: {
		        fields: this.getHeaders(),
		        data: data
		    }
		});
		
		// set chart axes
		if (config.axes) {
			Ext.apply(chart, {axes: config.axes});
			var positions = ["left", "bottom"]
			chart.axes.forEach(function(axis, i) {
				Ext.applyIf(axis, {
			        type: i==0 ? 'numeric' : 'category',
			        position: i==0 ? "left" : "bottom"
				})
			})
			delete config.axes;
		} else {
			Ext.apply(chart, {
				axes:  [{
			        type: 'numeric',
			        position: 'left'
			    }, {
			        type: 'category', // row numbers (discrete)
			        position: 'bottom'
			    }]
			})
		}
		
		// set chart series
		var series = [];
		for (var i=0, len=chart.store.fields.length; i<len;i++) {
			if (chart.store.fields[i]==rowKey) {continue;}
			var cfg = {};
			if (config.series) {
				if (Ext.isObject(config.series)) {
					Ext.apply(cfg, config.series);
				} else if (Ext.isArray(config.series)) {
					Ext.apply(cfg, config.series[series.length]);
				}
			}
			Ext.applyIf(cfg, {
		        type: 'line',
		        xField: rowKey,
		        yField: chart.store.fields[i],
		        marker: {
		        	radius: 2
		        },
		        highlightCfg: {
	                scaling: 2
	            },
	            tooltip: {
	            	trackMouse: true,
	            	renderer: function (tooltip, record, item) {
	                    tooltip.setHtml(record.get(item.series.getYField())+": "+record.get(item.series.getYField()));
	                }
	            }
			});
			series.push(cfg);
		}
		Ext.apply(chart, {
			series: series
		});

		/*
		
		// determine columns/headers/fields
		var headers = this.getHeaders();
		var fields = Ext.Array.merge(rowKey===undefined ? ["row-index"] : [], headers);
		if (headers.length==0) {
			var max = Ext.Array.max(this.mapRows(function(row) {return row ? row.length : 0}));
			for (var i=0;i<max;i++) {fields.push(fields.length)}
		}

		Ext.apply(chart, {
			store: {
		        fields: fields,
		        data: data
		    }
		})
		
		if (config.axes) {
			Ext.apply(chart, {axes: config.axes});
			var positions = ["left", "bottom"]
			chart.axes.forEach(function(axis, i) {
				Ext.applyIf(axis, {
			        type: 'numeric',
			        position: positions[i]
				})
			})
			delete config.axes;
		} else {
			Ext.apply(chart, {
				axes:  [{
			        type: 'numeric',
			        position: 'left'
			    }, {
			        type: 'category', // row numbers (discrete)
			        position: 'bottom'
			    }]
			})
		}
		
		if (config.series) {
			Ext.apply(chart, {series: config.series});
			
			chart.series.forEach(function(axis, i) {
				Ext.applyIf(axis, {
					type: 'line',
					xField: rowKey===undefined ? 'row-index' : rowKey,
					yField: i
				})
			})
			delete config.series;
		} else {
			var series = [];
			debugger
			for (var i=0, len=fields.length; i<len;i++) {
				
				// skip if this is the row key
				if (i===rowKey || (rowKey==undefined && i+1==len)) {continue;}
				
				series.push({
			        type: 'line',
			        xField: rowKey===undefined ? 'row-index' : rowKey,
			        yField: i
				})
			}
			Ext.apply(chart, {
				series: series
			});
		}
		*/
		if (config.title) {
			chart.title = config.title;
		}
		Ext.apply(config, {
			chartJson: JSON.stringify(chart)
		})
		embed.call(this, cmp, config);
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
		for (var i=0, len = this.getRows().length; i<len; i++) {
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