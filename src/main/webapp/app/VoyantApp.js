Ext.define('Voyant.VoyantApp', {
	
    extend: 'Ext.app.Application',
	mixins: ['Voyant.util.Deferrable','Voyant.util.Localization','Voyant.util.Api','Voyant.util.Colors'],
	requires: ['Voyant.util.ResponseError'],
    
    name: 'VoyantApp',
    
    statics: {
    	i18n: {
    	},
    	api: {
			palette: 'default',
			categories: 'auto',
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

		this.mixins['Voyant.util.Colors'].constructor.apply(this, arguments);
		
		// ES6 mixin
		Object.assign(this, Spyral.CategoriesManager);
		
		this.addFeature('color');
		this.addFeature('font', '"Palatino Linotype", "Book Antiqua", Palatino, serif');
		
		// call the parent constructor
		this.callParent(arguments);
		
		// override Voyant.util.Colors methods to add palette api param
		var _getColor = this.getColor;
		this.getColor = function(index, returnHex) {
			return _getColor.apply(this, [this.getApiParam('palette'), index, returnHex]);
		}
		var _getColorForTerm = this.getColorForTerm;
		this.getColorForTerm = function(term, returnHex) {
			return _getColorForTerm.apply(this, [this.getApiParam('palette'), term, returnHex]);
		}
    },
    getBaseUrl: function() {
    	var baseUrl = this.callParent();
    	return baseUrl.indexOf("//")==0 ? location.protocol+baseUrl : baseUrl;
    },
    
    getBaseUrlFull: function() {
    	return window.location.origin+this.getBaseUrl(); // maybe doesn't work in all browsers?
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
				} else if (config.statusText) {
					return this.showResponseError(config.statusText, config)
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