Ext.define('Voyant.model.Table', {
	constructor: function(rows, headers) {
		this.headers = headers ? headers : [];
		this.rows = [];
		this.addRows(rows);
	}

	,addRows : function(rows) {
		if (rows instanceof Array) {
			for (var i=0, len=rows.length; i<len; i++) {
				this.addRow(rows[i])
			}
		}
	}
	
	,addRow : function(row) {
		
		// convert to array
		if (!(row instanceof Array)) {row = [this.validateCell(row)];}

		var cells = [];
		for (var i=0, len=row.length; i<len; i++) {
			cells.push(this.validateCell(row[i]))
		}
		this.rows.push(cells);
		
		// ensure that our headers array is correct
		if (cells.length>this.headers.length) {this.headers.length=cells.length}
	}

	,addColumn : function(rows, header) {
		
		// create the new header
		this.headers.push(header);
		
		// ensure that we have initiated all rows
		for (var i=0, len=rows.length-this.rows.length; i<len; i++) {
			this.rows.push(new Array(this.headers.length));
		}
		
		// append each value
		for (var i=0, len=rows.length; i<len; i++) {
			
			// ensure we have the right number of cells in this row
			this.rows[i].length = this.headers.length;
			
			// assign value
			this.rows[i][this.headers.length-1] = rows[i];
		}
	}
	
	,validateCell : function(cell) {
		var to = typeof cell;
		// table cells, by our definition, only contain simple native data types (no arrays etc.)
		if (to=="string" || to=="number" || to=="boolean") {return cell}
		Ext.log("Value is not a simple data type (string, number, boolean) and will be set to undefined: "+cell);
		return undefined;
	}
	
	,getColumnIndex : function(header) {
		if (typeof header == "number") {return header;}
		else if (typeof header == "string") {
			for (var i=0, header=this.headers.length; i<len; i++) {
				if (header==this.headers[i]) {
					return i;
				}
			}
		}
		Ext.log("Unable to locate requested column header: "+header);
		return 0;
	}
	
	,getFrequenciesTable : function(config) {
		config = config ? config : {};
		var bins = config.bins ? config.bins : 0;
		var header = config.header ? config.header : 0;
		var index = this.getColumnIndex(header);
		var counts = {};
		for (var i=0, len=this.rows.length; i<len; i++) {
			var item = this.rows[i][index];
			if (counts[item]) {
				counts[item][0]++;
				if (bins) {counts[item][1].push(i)};
			}
			else {
				counts[item] = [1, bins ? [i] : []]
			}
		}
		
		var rows = [];
		for (var item in counts) {
			
			// initialize array with zeros
			var b[] = [];
			for (var i=0, len=bins; i<len; i++) {b[i]=0;}
			
			// calculate bins
			for (var i=0, len=counts[item][1].length; i<len; i++) {
				b[Math.round(counts[item][1][i] * bins / this.rows.length)]++;
			}
			
			// add a row
			rows.push([item, counts[item][0], counts[item][0] / this.rows.length, b])
		}
		return new Voyant.model.Table(rows, ['item','raw','relative','bins'])
	}
	
	,statics : {
		getFrequenciesTable : function(source, config) {

			// treat source as a header
			if (Voyant.model.Table.prototype.isPrototypeOf(source)) {
				return source.getFrequenciesTable(config);
			}
			
			// treat source as array
			if (Ext.isArray(source)) {
				var table = new Voyant.model.Table(source);
				return table.getFrequenciesTable(config);
			}

			Ext.log("Unable to find any data to count: "+source);
			return new Voyant.model.Table().getFrequenciesTable()
		}
	}
	
});