Ext.define('Voyant.VoyantCorpusApp', {
	
    extend: 'Voyant.VoyantApp',
    
    name: 'VoyantCorpusApp',

    requires: ['Voyant.data.model.Corpus','Voyant.panel.VoyantHeader', 'Voyant.panel.VoyantFooter', 'Voyant.panel.CorpusCreator', 'Voyant.panel.Cirrus', 'Voyant.panel.Summary', 'Voyant.panel.CorpusTerms', 'Voyant.panel.Reader', 'Voyant.panel.Documents', 'Voyant.panel.Trends', 'Voyant.panel.Contexts', 'Voyant.panel.DocumentTerms','Voyant.panel.CorpusCollocates','Voyant.panel.CollocatesGraph'],
    
    statics: {
    	i18n: {
    		fetchingCorpus: {en: 'Fetching your corpus…'}
    	}
    },
    
    config: {
    	corpus: undefined,
    	moreTools: {
    		scale: {
        		corpus: ['cirrus','corpusterms','corpuscollocates','documents','summary','trends'],
        		document: ['cirrus','contexts','documentterms','reader','trends'],
    		},
    		type: {
        		grid: ['corpusterms','corpuscollocates','contexts','documentterms','documents'],
        		viz: ['cirrus','collocatesgraph','trends'],
        		other: ['reader']
    		}
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
    },
    
    listeners: {
    	loadedCorpus: function(src, corpus) {
    		this.setCorpus(corpus);
    	}
    }

});