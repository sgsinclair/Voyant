Ext.define('Voyant.VoyantApp', {
	
    extend: 'Ext.app.Application',
	mixins: ['Voyant.util.Deferrable','Voyant.util.Localization'],
	requires: ['Voyant.util.ResponseError'],
    
    name: 'VoyantApp',
    
    statics: {
    	i18n: {
    		error: {en: 'Error'},
			serverResponseError: {en: 'The server error reponse:'}
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
		
		// call the parent constructor
        this.callParent(arguments);
        
    },
    
    getTools: function() {
    	return [{type: 'maximize'},{type: 'help'}]
    },
    
    launch: function() {
    	var me = this;
		this.callParent(arguments);
		var params = Ext.Object.fromQueryString(document.location.search);
		if (params && params.debug && params.debug=='true') { return}
		var viewport = this.getViewport();
		viewport.mask();
		Ext.create('Ext.window.Window', {
		    title: 'Voyant Tools 2.0 Preview Release',
		    width: 825,
		    layout: 'fit',
		    modal: true,
		    layout: 'vbox',
		    items: [{
		    	width: 800,
		    	margin: '10 5 3 10',
			    html: "<h2 style='text-align: center;'>Welcome to this Preview Release of Voyant Tools 2.0!</h2>"+
			    "<p>We've tried to make things usable in order to give a glimpse of what's to come, "+
			    "but this is an early preview release with lots of missing goodies and a whole bunch of bugs. "+
			    "Please kick the tires and let us know if you have suggestions on <a href='https://github.com/sgsinclair/Voyant/issues'>Github</a> or <a href='http://twitter.com/voyanttools'>Twitter</a>."+
			    "<ul>"+
		    	"<li>some new features and functionality:<ul>"+
		    		"<li>flexible search (wildcards, phrases, proximity) – hover over search boxes for more details</li>"+
		    		"<li>better cross-platform and device support (all tools in HTML5, no Flash or Java Applets)</li>"+
		    		"<li>much better support for larger corpora</li>"+
		    		"<li>vastly improved performance throughout (corpus reader and collocates are notable examples)</li>"+
		    	"</ul><li>some things not yet fully implemented:<ul>"+
			    	"<li>full list of tools and skins from 1.0</li>"+
			    	"<li>panel/tool-level help, options, and exporting</li>"+
			    	"<li>adding and reordering documents (new in 2.0)</li>"+
			    	"<li>N-Gram support (term sequences) (new in 2.0)</li>"+
			    	"<!--<li>part-of-speech tagging and lemmatization (new in 2.0)</li>-->"+
		    	"</ul></li></ul>"+
		    	"<p>It's best to assume that this preview release may be incompatible with future releases and that "+
		    	"any stored corpora will no longer be available after your session. Of course, you can keep using "+
		    	"<a href='http://voyant-tools.org'>Voyant Tools 1.0</a> "+
		    	"if you want persistence (normal persistence will be avilable with the full release of Voyant Tools 2.0). Have fun and please give us your <a href='http://twitter.com/voyanttools'>feeback</a>!</p>"
		    }, {
		    	xtype: 'button',
                glyph: 'xf00c@FontAwesome',
		    	width: '100%',
		    	scale: 'medium',
		    	text: 'Continue',
		    	handler: function(btn) {
		    		btn.up('window').close();
		    	}
		    }],
		    listeners: {
		    	close: function(panel) {
		    		viewport.unmask();
		    	}
		    }
		}).show();

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

    dispatchEvent: function(eventName) {
    	var viewport = this.getViewport();
		var panels = viewport.query("panel,chart");
		var isHeard = false;

		// tell the app
		if (this.hasListener && this.hasListener(eventName)) {
			this.fireEvent.apply(this, arguments);
			isHeard = true
		}
		
		// tell the panels
		for (var i=0; i<panels.length; i++) {
			if (panels[i].hasListener && panels[i].hasListener(eventName)) {
				isHeard = true;
				panels[i].fireEvent.apply(panels[i], arguments);
			}
		}
		
		if (!isHeard) {
			if (console) {console.info("Unhandled event: "+eventName, arguments)}
		}
    },
    
	showResponseError: function(config, response) {
		this.showError(Ext.create("Voyant.util.ResponseError", {msg: (Ext.isString(config) ? config : config.msg), response: response}))
	},
	
	showError: function(config) {
		if (config instanceof Voyant.util.ResponseError) {
			var response = config.getResponse();
			Ext.apply(config, {
				message: config.getMsg()+" "+this.localize('serverResponseError')+
					"<pre class='error'>\n"+response.responseText.substring(0,response.responseText.indexOf("\n\t"))+"… "+
					"<a href='#' onclick=\"window.open('').document.write(unescape('<pre>"+escape(response.responseText)+"</pre>')); return false;\">more</a></pre>"
			})
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
	 * A universal palette of colors for use with terms and documents.
	 */
	colors: [[0, 0, 255], [51, 197, 51], [255, 0, 255], [121, 51, 255], [28, 255, 255], [255, 174, 0], [30, 177, 255], [182, 242, 58], [255, 0, 164], [51, 102, 153], [34, 111, 52], [155, 20, 104], [109, 43, 157], [128, 130, 33], [111, 76, 10], [119, 115, 165], [61, 177, 169], [202, 135, 115], [194, 169, 204], [181, 212, 228], [182, 197, 174], [255, 197, 197], [228, 200, 124], [197, 179, 159]],
	
	rgbToHex: function(a) {
		return "#" + ((1 << 24) + (a[0] << 16) + (a[1] << 8) + a[2]).toString(16).slice(1);
	},
	
	/**
	 * Gets the whole color palette.
	 * @param {Boolean} [returnHex] True to return a hexadecimal representation of each color (optional, defaults to rgb values).
	 * @return {Array} The color palette.
	 */
	getColorPalette: function(returnHex) {
		if (returnHex) {
			var colors = [];
			for (var i = 0; i < this.colors.length; i++) {
				colors.push(this.rgbToHex(this.colors[i]));
			}
			return colors;
		} else {
			return this.colors;
		}
	},
	
	/**
	 * Gets a particular color from the palette.
	 * @param {Integer} index The index of the color to get.
	 * @param {Boolean} [returnHex] True to return a hexadecimal representation of the color (optional, defaults to rgb values).
	 * @return {Mixed} The requested color, either a hex string or array of rgb values.
	 */
	getColor: function(index, returnHex) {
		if (returnHex) {
			return this.rgbToHex(this.colors[index]);
		} else {
			return this.colors[index];
		}
	},
	
	/**
	 * For tracking associations between a term and a color, to ensure consistent coloring across tools.
	 */
	colorTermAssociations: new Ext.util.MixedCollection(),
	
	/**
	 * Gets the color associated with the term.  Creates a new association if none exists.
	 * @param {String} term The term to get the color for.
	 * @param {Boolean} [returnHex] True to return a hexadecimal representation of the color (optional, defaults to rgb values).
	 * @return {Mixed} The requested color, either a hex string or array of rgb values.
	 */
	getColorForTerm: function(term, returnHex) {
		if (term.indexOf(':') != -1) {
			term = term.split(':')[1];
		}
		var color = this.colorTermAssociations.get(term);
		if (color == null) {
			var index = this.colorTermAssociations.getCount() % this.colors.length;
			color = this.colors[index];
			this.colorTermAssociations.add(term, color);
		}
		if (returnHex) {
			color = this.rgbToHex(color);
		}
		return color;
	}
    
});