Ext.define('Voyant.panel.Summary', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.summary',
    statics: {
    	i18n: {
    		title: {en: "Summary"}
    	}
    },
    config: {
    	corpus: undefined
    },
    constructor: function(config ) {

    	Ext.apply(this, {
    		title: this.localize('title')
    	})

        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		
    		this.setCorpus(corpus);
    		
    		// TODO: complete the summary
    		if (this.rendered) {
    			this.getLayout().getRenderTarget().update(corpus.getShow());
    		}
    		else {
    			Ext.defer(this.fireEvent, 100, this);
    		}

    	})
    	
    	this.on("activate", function() {
        		if (this.getCorpus()) {
            		this.dispatchEvent('ensureCorpusView', this, this.getCorpus())
        		}
    		}, this)

    	// if we need to embed this, do so
    	if (config.embedded) {
    		var cls = Ext.getClass(config.embedded).getName();
    		if (cls=="Voyant.data.model.Corpus") {
    			config.corpus = config.embedded;
    		}
    	}
    	
    	// if we have a corpus, load it
    	if (config && config.corpus) {
    		this.fireEvent('loadedCorpus', this, config.corpus)
    	}
    }
})