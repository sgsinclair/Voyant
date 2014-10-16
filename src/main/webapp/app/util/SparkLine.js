Ext.define('Voyant.util.SparkLine', {
	/**
	 * Gets a Google spark line.
	 * 
	 * @param {Array} values An array of numerical values.
	 * @param {Integer} stretch The width to stretch the spark line towards (currently unused).
	 * @return {String} The image(s) of the spark line.
	 */
	getSparkLine : function(values, stretch) {
		if (values.length < 2) {
			return '';
		}
		var min = Number.MAX_VALUE;
		var max = Number.MIN_VALUE;
		var hasDecimal = false;
		for ( var i = 0; i < values.length; i++) {
			if (values[i] < min) {
				min = values[i];
			}
			if (values[i] > max) {
				max = values[i];
			}
			if (!hasDecimal
					&& values[i].toString().indexOf('.') > -1) {
				hasDecimal = true;
			}
		}
		var dif = (max - min).toString();
		var multiplier = 1;
		var divider = 1;

		var newvalues = [];
		if (hasDecimal) {
			var multiplier = 100;
			var ind = dif.indexOf(".") + 1;
			for ( var i = ind; i < dif.length; i++) {
				if (dif.charAt(i) == '0') {
					multiplier *= 10;
				} else {
					break;
				}
			}
			for ( var i = 0; i < values.length; i++) {
				newvalues[i] = parseInt(values[i] * multiplier);
			}
			max = parseInt(max * multiplier);
			min = parseInt(min * multiplier);

		} else {
			var divider = 1;
			for ( var i = dif.length - 1; i > -1; i--) {
				if (dif.charAt(i) == '0') {
					divider *= 10;
				} else {
					break;
				}
			}
			if (divider != 1) {
				for ( var i = 0; i < values.length; i++) {
					newvalues[i] = values[i] / divider;
				}
				max /= divider;
				min /= divider;
			} else {
				newvalues = values;
			}
		}

		var valLen = (max.toString().length > min.toString().length ? max
				.toString().length
				: min.toString().length) + 1;
		var valuesPerImage = Math.floor(1800 / valLen);
		var baseUrl = 'http://chart.apis.google.com/chart?cht=ls&amp;chco=0077CC&amp;chls=1,0,0&amp;chds='+ min + ',' + max;
		var images = Math.ceil(values.length / valuesPerImage);
		var counter = 0;
		var response = '';
		var wid;
		if (values.length < 5) {
			wid = 5;
		} else if (values.length < 10) {
			wid = 4;
		} else if (values.length < 20) {
			wid = 3;
		} else if (values.length < 50) {
			wid = 2;
		} else {
			wid = 1;
		}

		/*
		 * if (stretch) { wid =
		 * Math.ceil(stretch/values.length); if (wid>5) {wid=5;} }
		 */

		for ( var i = 0; i < images; i++) {
			var vals = newvalues.slice(counter,
					counter += valuesPerImage);
			response += "<img style='margin: 0; padding: 0;' border='0' src='"
					+ baseUrl
					+ '&amp;chs='
					+ (wid * vals.length)
					+ 'x15&amp;chd=t:'
					+ vals.join(',') + "' alt='' class='chart-";
			if (images == 1) {
				response += 'full';
			} else {
				if (i > 0 && i + 1 < images) {
					response + 'middle';
				} else if (i == 0) {
					response += 'left';
				} else {
					response += 'right';
				}
			}
			response += "' />";
		}
		return response;
	}
});