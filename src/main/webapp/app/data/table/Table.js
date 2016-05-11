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
	mixins: ['Voyant.notebook.util.Embed'],
	embeddable: ['Voyant.widget.VoyantChart'],
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

	constructor: function(config) {

		config = config || {};
		
		// not sure why config isn't working
		this.rows = Ext.Array.from(Ext.isArray(config) ? config : config.rows);
		this.headers = Ext.Array.from(config.headers);
		this.rowKey = config.rowKey;
		
		if (config.isStore) {
			this.model = config.getModel();
			if (config.getCount()>0) {
				this.headers = Object.keys(config.getAt(0).data);
			}
			config.each(function(item) {
				this.addRow(item.data);
			}, this)
		}
		this.callParent();
	},
	addRow: function(row) {
		if (Ext.isObject(row)) {
			this.rows.push(this.headers.map(function(key) {return row[key]}))
		} else if (Ext.isArray(row)) {
			this.rows.push(row);
		}
	},
	eachRecord: function(fn, scope) {
		var item, i=0, len=this.rows.length;
		for (; i<len; i++) {
            item = this.getRecord(i);
			if (fn.call(scope || item, item, i, len) === false) {
                break;
            }			
		}
	},
	eachRow: function(fn, asMap, scope) {
		var item, i=0, len=this.rows.length;
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
			Ext.Array.from(this.rows[index]).forEach(function(item, i) {
				row[this.headers[i] || i] = item;
			}, this);
			return row;
		} else {
			return this.rows[index];
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
		if (this.rows[row]===undefined) {this.rows[row]=[]}
		if (this.rows[row][column]===undefined || replace) {this.rows[row][column]=value}
		else {this.rows[row][column]+=value}
	},
	embed: function(cmp, config) {
		if (Ext.isObject(cmp) && !config) {
			config = cmp;
			cmp = this.embeddabled[0];
		}
		config = config || {};
		chart = {};

		var data = this.mapRows(function(row, i) {
			return this.rowKey===undefined ? Ext.apply(row, {"row-index": i}) : row;
		}, true, this)
		
		// determine columns/headers/fields
		var fields = Ext.Array.merge(this.rowKey===undefined ? ["row-index"] : [], this.headers);
		if (this.headers.length==0) {
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
					xField: this.rowKey===undefined ? 'row-index' : this.rowKey,
					yField: i
				})
			})
			delete config.series;
		} else {
			var series = [];
			for (var i=0, len=fields.length; i<len;i++) {
				
				// skip if this is the row key
				if (i===this.rowKey || (this.rowKey==undefined && i+1==len)) {continue;}
				
				series.push({
			        type: 'line',
			        xField: this.rowKey===undefined ? 'row-index' : this.rowKey,
			        yField: i
				})
			}
			Ext.apply(chart, {
				series: series
			});
		}
		if (config.title) {
			chart.title = config.title;
		}
		console.warn(chart)
		Ext.apply(config, {
			chartJson: JSON.stringify(chart)
		})
		embed(cmp, config);
	}
})