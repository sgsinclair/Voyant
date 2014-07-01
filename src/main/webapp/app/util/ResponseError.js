Ext.define("Voyant.util.ResponseError", {
	extend: "Ext.Error",
	config: {
		response: undefined,
		msg: undefined
	},
	constructor: function(config) {
		this.setResponse(config.response);
		this.setMsg(config.msg);
		this.callParent(arguments);
		this.show();
	},
	
	show: function() {
		if (window.showError) {showError.call(this);}
	}
})
