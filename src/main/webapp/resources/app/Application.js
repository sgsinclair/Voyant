Ext.define('Voyant.Application', {
	extend: 'Ext.app.Application',
	
	baseUrl: null,
	
	setBaseUrl : function(baseUrl) {
		this.baseUrl = baseUrl;
		Ext.BLANK_IMAGE_URL = this.baseUrl + 'lib/extjs-4.1.1/resources/themes/images/default/tree/s.gif';
	},
	
	/**
	 * Gets the base URL for the Voyant application.
	 * @return {String}
	 */
	getBaseUrl : function() {
		return this.baseUrl;
	},
	
	constructor: function(config) {
		this.setBaseUrl(document.location.protocol+'//'+document.location.host+document.location.pathname);
		
		this.callParent(arguments);
	}
});