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
		this.setHeaders(Ext.Array.from(config.headers));
		this.rowKey = config.rowKey;
		
		if (config.count) {
			// create counts
			var freqs = {};
			config.count.forEach(function(item) {freqs[item] = freqs[item] ? freqs[item]+1 : 1;});
			// sort counts
			var counts = [];
			for (var key in freqs) {counts.push([key, freqs[key]])}
			counts.sort(function(a,b) {return b[1] - a[1]});
			this.setHeaders(counts.map(function(item) {return item[0]}));
			this.rows = [counts.map(function(item) {return item[1]})]
		}
		
		if (config.isStore) {
			this.model = config.getModel();
			if (config.getCount()>0) {
				this.setHeaders(Object.keys(config.getAt(0).data));
			}
			config.each(function(item) {
				this.addRow(item.data);
			}, this)
		}
		this.callParent();
	},
	addRow: function(row) {
		if (Ext.isObject(row)) {
			this.rows.push(this.getHeaders().map(function(key) {return row[key]}))
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
			var headers = this.getHeaders();
			Ext.Array.from(this.rows[index]).forEach(function(item, i) {
				row[headers[i] || i] = item;
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
		if ((Ext.isObject(cmp) || !cmp) && !config) {
			config = cmp;
			// rather than use first embeddable, we'll use a transform grid
			var id = Ext.id();
			var localConfig = {id: id};
			if (Ext.isObject(cmp)) {
				Ext.apply(localConfig, cmp);
			}
			var html = this.getString(localConfig);
			show(html);
			var grid = new Ext.ux.grid.TransformGrid(id, {
				remove: false,
				width: '100%'
			});
			document.getElementById(id).outerHTML="<div id='"+id+"'></div>";
			grid.render(Ext.get(id));
			return this;
		}
		config = config || {};
		chart = {};

		debugger
		var data = this.mapRows(function(row, i) {
			return this.rowKey===undefined ? Ext.apply(row, {"row-index": i}) : row;
		}, true, this)
		
		// determine columns/headers/fields
		var headers = this.getHeaders();
		var fields = Ext.Array.merge(this.rowKey===undefined ? ["row-index"] : [], headers);
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
		for (var i=0, len = this.rows.length; i<len; i++) {
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
})

/**
 * A Grid which creates itself from an existing HTML table element.
 */
Ext.define('Ext.ux.grid.TransformGrid', {
    extend: 'Ext.grid.Panel',

    /**
     * Creates the grid from HTML table element.
     * @param {String/HTMLElement/Ext.Element} table The table element from which this grid will be created -
     * The table MUST have some type of size defined for the grid to fill. The container will be
     * automatically set to position relative if it isn't already.
     * @param {Object} [config] A config object that sets properties on this grid and has two additional (optional)
     * properties: fields and columns which allow for customizing data fields and columns for this grid.
     */
    constructor: function(table, config) {
        config = Ext.apply({}, config);
        table = this.table = Ext.get(table);

        var configFields = config.fields || [],
            configColumns = config.columns || [],
            fields = [],
            cols = [],
            headers = table.query("thead th"),
            i = 0,
            len = headers.length,
            data = table.dom,
            width,
            height,
            store,
            col,
            text,
            name;

        for (; i < len; ++i) {
            col = headers[i];

            text = col.innerHTML;
            name = 'tcol-' + i;

            fields.push(Ext.applyIf(configFields[i] || {}, {
                name: name,
                mapping: 'td:nth(' + (i + 1) + ')/@innerHTML'
            }));

            cols.push(Ext.applyIf(configColumns[i] || {}, {
                text: text,
                dataIndex: name,
                width: col.offsetWidth,
                tooltip: col.title,
                sortable: true
            }));
        }

        if (config.width) {
            width = config.width;
        } else {
            width = table.getWidth() + 1;
        }

        if (config.height) {
            height = config.height;
        }

        Ext.applyIf(config, {
            store: {
                data: data,
                fields: fields,
                proxy: {
                    type: 'memory',
                    reader: {
                        record: 'tbody tr',
                        type: 'xml'
                    }
                }
            },
            columns: cols,
            width: width,
            height: height
        });
        this.callParent([config]);
        
        if (config.remove !== false) {
            // Don't use table.remove() as that destroys the row/cell data in the table in
            // IE6-7 so it cannot be read by the data reader.
            data.parentNode.removeChild(data);
        }
    },

    doDestroy: function() {
        this.table.remove();
        this.tabl = null;
        this.callParent();
    }
});