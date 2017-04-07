Ext.define('Voyant.util.Assignable', {
    transferable: ['assign'],
    /**
     * This is a convenience method for assigning a variable name to this promised object once it's ready.
     * 
     * This method is chainable, so you can call other promise-aware corpus functions.
     * 
     * 		new Corpus("Hello World!").assign("helloworld").show();
     * 
     * This is somewhat equivalent to the nastier:
     * 
     *  	var helloworld;
     *  	new Corpus("Hello World!").then(function(corpus) {
     *  		helloworld = corpus;
     *  		helloworld.show();
     *  	})
     *  
     * Note that when using `assign` in spiral, any references to the name variable should occur in separate, subsequent code blocks. 
     * 
     * 		new Corpus("Hello Voyant!").assign("corpus");
     * 
     * Then use the named variable in a subsequent code block:
     * 
     * 	  corpus.show();
     * 
     *  @param {String} name The variable name to assign to this corpus.
     */
    assign: function(name) {
		if (this.then) {
			return Voyant.application.getDeferredNestedPromise(this, arguments);
		} else {
			if (Ext.isString(name)) {
				window[name] = this;
			} else {
				Voyant.application.showError("The 'assign' method expects a string argument. ("+typeof name+") "+name)
			}
			return this;
		}
	}
})