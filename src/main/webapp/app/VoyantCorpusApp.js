Ext.define('Voyant.VoyantCorpusApp', {
	
    extend: 'Voyant.VoyantApp',
    
    name: 'VoyantCorpusApp',

    requires: ['Voyant.data.model.Corpus'],
    
    statics: {
    	i18n: {
    		fetchingCorpus: {en: 'Fetching your corpus…'}
    	}
    },
    
    launch: function() {
		this.callParent(arguments);

		// check parameters to see if we can load a corpus 
    	var queryParams = Ext.Object.fromQueryString(document.location.search);

    	if (queryParams.corpus || queryParams.input) {
    		var me = this;
    		var view = me.getViewport()
    		view.mask(this.localize("fetchingCorpus"));
    		new Corpus(queryParams).then(function(corpus) {
    			view.unmask();
    			me.dispatchEvent('loadedCorpus', this, corpus);
    		}).fail(function(message, response) {
    			view.unmask();
    			me.showErrorResponse({message: message}, response);
    		});
    	}
    }

});