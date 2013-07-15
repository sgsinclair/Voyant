Ext.define('Voyant.utils.DeferredManager', {
	stack : [],
	getDeferred: function() {
		var deferred = $.Deferred();
		deferred.release = Ext.bind(this.release, this)
		this.stack.push(deferred);
		return deferred;
	},
	release : function(deferred) {
		this.stack.pop();
	},
	releaseAll : function() {
		this.stack = [];
	},
	getCount : function() {
		return this.stack.length;
	}
});

Voyant.utils.deferredManager = Ext.create('Voyant.utils.DeferredManager');