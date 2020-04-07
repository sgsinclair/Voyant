/**
 * A utility for storing palettes and associations between terms and colors.
 */
Ext.define('Voyant.util.Colors', {

	config: {
		/**
		 * Palettes for use with terms and documents.
		 * @private
		 */
		palettes: undefined,
		/**
		 * For tracking associations between a term and a color, to ensure consistent coloring across tools.
		 * @private
		 */
		colorTermAssociations: undefined
	},

	constructor: function(config) {
		this.setPalettes({
			'default': [[0, 0, 255], [51, 197, 51], [255, 0, 255], [121, 51, 255], [28, 255, 255], [255, 174, 0], [30, 177, 255], [182, 242, 58], [255, 0, 164], [51, 102, 153], [34, 111, 52], [155, 20, 104], [109, 43, 157], [128, 130, 33], [111, 76, 10], [119, 115, 165], [61, 177, 169], [202, 135, 115], [194, 169, 204], [181, 212, 228], [182, 197, 174], [255, 197, 197], [228, 200, 124], [197, 179, 159]]
		});

		this.setColorTermAssociations(new Ext.util.MixedCollection());

		// palettes
		if (d3 !== undefined) {
			var cat10 = d3.scaleOrdinal(d3.schemeCategory10).range().map(function(val) { return this.hexToRgb(val); }, this);
			var cat20a = d3.scaleOrdinal(d3.schemeCategory20).range().map(function(val) { return this.hexToRgb(val); }, this);
			var cat20b = d3.scaleOrdinal(d3.schemeCategory20b).range().map(function(val) { return this.hexToRgb(val); }, this);
			var cat20c = d3.scaleOrdinal(d3.schemeCategory20c).range().map(function(val) { return this.hexToRgb(val); }, this);
			this.addColorPalette('d3_cat10', cat10);
			this.addColorPalette('d3_cat20a', cat20a);
			this.addColorPalette('d3_cat20b', cat20b);
			this.addColorPalette('d3_cat20c', cat20c);
		}
        
        var extjs = Ext.create('Ext.chart.theme.Base').getColors().map(function(val) { return this.hexToRgb(val); }, this);
        this.addColorPalette('extjs', extjs);
	},

	rgbToHex: function(a) {
		return "#" + ((1 << 24) + (a[0] << 16) + (a[1] << 8) + a[2]).toString(16).slice(1);
	},
	
	hexToRgb: function(hex) {
	    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
	        return r + r + g + g + b + b;
	    });

	    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    return result ? [
	        parseInt(result[1], 16),
	        parseInt(result[2], 16),
	        parseInt(result[3], 16)
	    ] : null;
	},

	/**
	 * Adds a new palette to the list.
	 * @param key {String} The palette name.
	 * @param values {Array} The array of colors. Format: [[r,g,b],[r,g,b],....]
	 */
	addColorPalette: function(key, values) {
		this.getPalettes()[key] = values;
	},

	/**
	 * Gets the whole color palette.
	 * @param {String} [key] The key of the palette to return.
	 * @param {Boolean} [returnHex] True to return a hexadecimal representation of each color (optional, defaults to rgb values).
	 * @return {Array} The color palette.
	 * @private
	 */
	getColorPalette: function(key, returnHex) {
		var paletteKey = key || 'default';
		var palette = this.getPalettes()[paletteKey];
		if (palette === undefined) {
			palette = [];
		}
		if (returnHex) {
			var colors = [];
			for (var i = 0; i < palette.length; i++) {
				colors.push(this.rgbToHex(palette[i]));
			}
			return colors;
		} else {
			return palette;
		}
	},

	/**
	 * Gets a particular color from the palette.
	 * @param {String} key The palette key.
	 * @param {Integer} index The index of the color to get.
	 * @param {Boolean} [returnHex] True to return a hexadecimal representation of the color (optional, defaults to rgb values).
	 * @return {Mixed} The requested color, either a hex string or array of rgb values.
	 * @private
	 */
	getColor: function(key, index, returnHex) {
		var paletteKey = key || 'default';
		var palette = this.getPalettes()[paletteKey];
		if (index >= palette.length) {
			index = index % palette.length;
		}
		if (returnHex) {
			return this.rgbToHex(palette[index]);
		} else {
			return palette[index];
		}
	},

	/**
	 * Gets the color associated with the term.  Creates a new association if none exists.
	 * @param {String} key The palette key.
	 * @param {String} term The term to get the color for.
	 * @param {Boolean} [returnHex] True to return a hexadecimal representation of the color (optional, defaults to rgb values).
	 * @return {Mixed} The requested color, either a hex string or array of rgb values.
	 * @private
	 */
	getColorForTerm: function(key, term, returnHex) {
		var paletteKey = key || 'default';
		var palette = this.getPalettes()[paletteKey];

		if (term.indexOf(':') != -1) {
			term = term.split(':')[1];
		}
		var color = this.getColorTermAssociations().get(term);
		if (color == null) {
			var index = this.getColorTermAssociations().getCount() % palette.length;
			color = palette[index];
			this.getColorTermAssociations().add(term, color);
		}
		if (returnHex) {
			color = this.rgbToHex(color);
		}
		return color;
	}
})
