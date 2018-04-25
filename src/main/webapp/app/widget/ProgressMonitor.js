Ext.define('Voyant.widget.ProgressMonitor', {
	extend: "Ext.Base",
	mixins: ['Voyant.util.Localization'],
	msgbox: undefined,
	statics: {
		i18n: {
			noProgress: "This progress monitor was incorrectly initialized.",
			progress: "Progress",
			badProgress: "Unable to understand the progress report from the server"
		}
	},
	config: {
		progress: undefined,
		scope: undefined,
		success: undefined,
		failure: undefined,
		args: undefined,
		tool: undefined,
		delay: 1000
	},
	constructor: function(config) {
		this.mixins['Voyant.util.Localization'].constructor.apply(this, arguments);
		if (!config || !config.progress || !config.progress.id) {
			return Voyant.application.showError(this.localize("noProgress"))
		}
		this.initConfig(config);
		this.callParent(arguments);
		this.msgbox = Ext.Msg.wait("&nbsp;",this.localize("progress"));
		this.update();
	},

	update: function() {
		var progress = this.getProgress(), scope = this.getScope();
		var msg = scope.localize ? scope.localize(progress.code) : this.localize(progress.code);
		if (msg=="["+progress.code+"]") {msg=progress.message}
		this.msgbox.updateProgress(progress.completion, parseInt(progress.completion*100)+"%", msg); 
		if (progress.status=="LAUNCH" || progress.status=="RUNNING") {
			var me = this;
			Ext.defer(function() {
				Ext.Ajax.request({
				     url: Voyant.application.getTromboneUrl(),
				     params: {
				    	 	tool: "progress.ProgressMonitor",
				    	 	id: progress.id
				     }
				 }).then(function(response, opt) {
					 var data = Ext.decode(response.responseText);
					 if (data && data.progress.progress) {
						 me.setProgress(data.progress.progress);
						 me.update();
					 } else {
						 me.finish(false, me.localize("badProgress"))
					 }
				 }, function(response, opt) {
					 me.finish(false, response);
				 });
			}, this.getDelay(), this)
		} else {
			this.finish(progress.status=="FINISHED", msg);
		}
	},
	
	finish: function(success, response) {
		var callback = success ? this.getSuccess() : this.getFailure();
		var args = this.getArgs(), progress = this.getProgress(), scope = this.getScope();
		this.close();
		if (callback && callback.apply) {
			callback.apply(scope, [success ? args : response || progress]);
		} else {
			Voyant.application.showError(response);
		}
	},
	
	close: function() {
		this.msgbox.close();
		this.destroy();
	}

})