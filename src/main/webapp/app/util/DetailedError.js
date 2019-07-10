Ext.define("Voyant.util.DetailedError", {
	extend: "Ext.Error",
	mixins: ['Voyant.util.Localization'],
	config: {
		msg: undefined,
		error: undefined,
		details: undefined
	},
	statics: {
		i18n: {
			error: "Error"
		}
	},
	constructor: function(config) {
		this.setMsg(config.msg);
		this.setError(config.error);
		this.setDetails(config.details);
		this.callParent(arguments);
//		debugger
//		this.show();
	},
	
	show: function(config) {
		if (window.showError) {showError.call(this);}
		else {this.showMsg(config)}
	},
	
	showMsg: function(config) {
		config = config || {};
		Ext.applyIf(config, {
			message: this.getMsg()+"<p class='error'>\n"+this.getError()+"… "+
				"<a href='#' onclick=\"window.open('').document.write(unescape('<pre>"+escape(this.getDetails())+"</pre>')); return false;\">more</a></p>",
			title: this.localize("error"),
		    buttons: Ext.Msg.OK,
		    icon: Ext.MessageBox.ERROR,
		    autoScroll: true
		});
		Ext.Msg.show(config);
	}
})
