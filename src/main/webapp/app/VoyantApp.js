Ext.define('Voyant.VoyantApp', {
	
    extend: 'Ext.app.Application',
	mixins: ['Voyant.util.Deferrable','Voyant.util.Localization','Voyant.util.Api','Voyant.util.CategoriesManager'],
	requires: ['Voyant.util.ResponseError'],
    
    name: 'VoyantApp',
    
    statics: {
    	i18n: {
    	},
    	api: {
    		palette: 'default',
    		lang: undefined,
    		debug: undefined
    	}
    },
    
    config: {
    	baseUrl: undefined,
    	tromboneUrl: undefined
    },
    
    constructor: function(config) {
    	
    	this.setBaseUrl(this.config.baseUrl);
    	
    	// set the Trombone URL from the baseURL // TODO: maybe allow this to be overridden
		this.setTromboneUrl(this.config.baseUrl+'trombone');
		
    	// set the application for the Corpus so that we can use a simple constructor
		Voyant.application = this;
		
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
		
		this.mixins['Voyant.util.CategoriesManager'].constructor.apply(this, arguments);
		this.addFeature('color');
		this.addFeature('font', '"Palatino Linotype", "Book Antiqua", Palatino, serif');
		
		// call the parent constructor
        this.callParent(arguments);
        
        // palettes
        var cat10 = d3.scale.category10().range().map(function(val) { return this.hexToRgb(val); }, this);
        var cat20a = d3.scale.category20().range().map(function(val) { return this.hexToRgb(val); }, this);
        var cat20b = d3.scale.category20b().range().map(function(val) { return this.hexToRgb(val); }, this);
        var cat20c = d3.scale.category20c().range().map(function(val) { return this.hexToRgb(val); }, this);
        this.addColorPalette('d3_cat10', cat10);
        this.addColorPalette('d3_cat20a', cat20a);
        this.addColorPalette('d3_cat20b', cat20b);
        this.addColorPalette('d3_cat20c', cat20c);
        
        var extjs = Ext.create('Ext.chart.theme.Base').getColors().map(function(val) { return this.hexToRgb(val); }, this);
        this.addColorPalette('extjs', extjs);
    },
    
    getRelativeUrl: function() {
    	var url = window.location.pathname.substring(this.getBaseUrl().length);
    	var relative = "";
    	for (var i=0, len=url.split("/").length-1; i<len; i++) {
    		relative+="../"
    	}
    	return relative;
    },
    
    getTools: function() {
    	return [{type: 'maximize'},{type: 'help'}]
    },
    
    launch: function() {
    	Ext.tip.QuickTipManager.init();
    	Ext.apply(Ext.tip.QuickTipManager.getQuickTip(), {
    	    showDelay: 50 // shorten the delay before showing
    	});
		this.callParent(arguments);
    },
    
    tromboneCall: function(config) {
    	var config = config ? config : {};
    	Ext.applyIf(config, {
    		url: this.getTromboneUrl()
    	});
    	if (!config.success && !config.failure && !config.callback) {
        	Ext.applyIf(config, {
        		url: this.getTromboneUrl(),
        	    scope: this,
        	    callback: function(response, success, options) {
        	    	this.dispatchEvent(config.tool+"Loaded", response, success, options)
        	    }
        	});
    	};
    	Ext.Ajax.request(config);
    },
    
    getViewport: function() {
    	return Ext.ComponentQuery.query('viewport')[0];
    },

    dispatchEvent: function(eventName, src) {
    	var viewport = this.getViewport();
		var panels = viewport.query("panel,chart");
		var isHeard = false;

		// tell the app
		if (this.hasListener && this.hasListener(eventName)) {
			this.fireEvent.apply(this, arguments);
			isHeard = true
		}
		
		// tell the panels, except the current one
		for (var i=0; i<panels.length; i++) {
			if (panels[i].hasListener && panels[i].hasListener(eventName)) {
				if (src && src.getId && panels[i].getId && src.getId()==panels[i].getId()) {
					continue; // don't send to self
				}
				isHeard = true;
				panels[i].fireEvent.apply(panels[i], arguments);
			}
		}
		
		if (!isHeard) {
			// let the application know that we have an unhandledEvent
			var args = ["unhandledEvent", src, eventName];
			for (var i=2; i<arguments.length; i++) {args.push(arguments[i])}
			this.fireEvent.apply(this, args);
		}
    },
    
	showResponseError: function(config, response) {
		this.showError(Ext.create("Voyant.util.ResponseError", {msg: (Ext.isString(config) ? config : config.msg), response: response}))
	},
	
	showError: function(config, response) {
		if (config instanceof Voyant.util.ResponseError) {
			config = {
				message: config.getMsg()+"<p class='error'>\n"+config.getError()+" … "+
					"<a href='#' onclick=\"window.open('').document.write(unescape('<pre>"+escape(config.getDetails())+"</pre>')); return false;\">more</a></p>"
			}
		} else {
			if (Ext.isString(config)) {
				config = {message: config}
			} else if (Ext.isObject(config)) {
				if (config.responseText) {
					// rebundle as error (without nice message)
					return this.showResponseError(config.statusText, config);
				}
			}
			// maybe handle other forms
		}
		

		Ext.applyIf(config, {
			title: this.localize("error"),
		    buttons: Ext.Msg.OK,
		    icon: Ext.MessageBox.ERROR,
		    autoScroll: true
		})
		Ext.Msg.show(config);
	},
	
	getToolConfigFromToolXtype: function(xtype) {
		cls = Ext.ClassManager.getByAlias("widget."+xtype);		
		return {
			xtype: xtype,
			title: this._localizeClass(cls, "title"),
			tooltip: { // this needs to be an object for compatibility (other configs can be changed)
				text: this._localizeClass(cls, "helpTip")
			},
			glyph: cls && cls.glyph ? cls.glyph : 'xf12e@FontAwesome'
		};
	},
	
	/**
	 * Palettes for use with terms and documents.
	 * @private
	 */
	palettes: {
		'default': [[0, 0, 255], [51, 197, 51], [255, 0, 255], [121, 51, 255], [28, 255, 255], [255, 174, 0], [30, 177, 255], [182, 242, 58], [255, 0, 164], [51, 102, 153], [34, 111, 52], [155, 20, 104], [109, 43, 157], [128, 130, 33], [111, 76, 10], [119, 115, 165], [61, 177, 169], [202, 135, 115], [194, 169, 204], [181, 212, 228], [182, 197, 174], [255, 197, 197], [228, 200, 124], [197, 179, 159]]
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
	 * @param values {Array} The array of colors. Format: [[,g,b],[r,g,b],....]
	 */
	addColorPalette: function(key, values) {
		this.palettes[key] = values;
	},
	
	/**
	 * Gets the whole color palette.
	 * @param {String} [key] The key of the palette to return, defaults to the "palette" api param value.
	 * @param {Boolean} [returnHex] True to return a hexadecimal representation of each color (optional, defaults to rgb values).
	 * @return {Array} The color palette.
	 * @private
	 */
	getColorPalette: function(key, returnHex) {
		var paletteKey = key || this.getApiParam('palette') || 'default';
		var palette = this.palettes[paletteKey];
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
	 * @param {Integer} index The index of the color to get.
	 * @param {Boolean} [returnHex] True to return a hexadecimal representation of the color (optional, defaults to rgb values).
	 * @return {Mixed} The requested color, either a hex string or array of rgb values.
	 * @private
	 */
	getColor: function(index, returnHex) {
		var paletteKey = this.getApiParam('palette') || 'default';
		var palette = this.palettes[paletteKey];
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
	 * For tracking associations between a term and a color, to ensure consistent coloring across tools.
	 * @private
	 */
	colorTermAssociations: new Ext.util.MixedCollection(),
	
	/**
	 * Gets the color associated with the term.  Creates a new association if none exists.
	 * @param {String} term The term to get the color for.
	 * @param {Boolean} [returnHex] True to return a hexadecimal representation of the color (optional, defaults to rgb values).
	 * @return {Mixed} The requested color, either a hex string or array of rgb values.
	 * @private
	 */
	getColorForTerm: function(term, returnHex) {
		if (term.indexOf(':') != -1) {
			term = term.split(':')[1];
		}
		var color = this.colorTermAssociations.get(term);
		if (color == null) {
			var paletteKey = this.getApiParam('palette') || 'default';
			var palette = this.palettes[paletteKey];
			
			var index = this.colorTermAssociations.getCount() % palette.length;
			color = palette[index];
			this.colorTermAssociations.add(term, color);
		}
		if (returnHex) {
			color = this.rgbToHex(color);
		}
		return color;
	},

	/**
	 * Opens a URL in a new window (handling the case when popup windows aren't allowed).
	 * @param {String} url The URL to open.
	 * @private
	 */
	openUrl: function(url) {
		var win = window.open(url);
		if (!win) { // popup blocked
			Ext.Msg.show({
				title: "Popup Blocked",
				buttonText: {ok: "Close"},
				icon: Ext.MessageBox.INFO,
				message: "A popup window was blocked. <a href='"+url+"' target='_blank' class='link'>Click here</a> to open the new window.",
				buttons: Ext.Msg.OK
			});
		}
	}

    
});