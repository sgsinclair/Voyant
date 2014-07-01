Ext.define('Voyant.util.Deferrable', {
	deferredStack : [],

	releaseAllDeferred : function() {
		this.deferredStack = [];
	},

	getDeferredCount : function() {
		return this.deferredStack.length;
	},
	
	getDeferred: function(transferable) {

		var deferred = jQuery.Deferred();
		
		// transfer methods to the promise
		var promise = this.getPromiseFromDeferred(deferred);

		if (transferable && transferable.transfer) {
			transferable.transfer(transferable, promise)
		}
		
		if (!promise.show && window.show) {promise.show=show}

		this.deferredStack.push(deferred);
		
		var me = this;
		promise.always(function() {
			me.deferredStack.pop();
		});
			
		return deferred;
	},
	
	getPromiseFromDeferred: function(dfd) {
		return typeof dfd.promise === "object" ? dfd.promise : dfd.promise();
	},
	
	getDeferredNestedPromise: function(promise, args, transferable) {
		var callee = arguments.callee.caller; // TODO: is callee.caller in terms of nested functions?
		var dfd = Voyant.application.getDeferred(transferable);
		promise.then(function(promised) {
			dfd.resolve(callee.apply(promised, args))
		}).fail(function() {
			dfd.reject.apply(this, arguments)
		});
		return dfd.promise;
	}
});
