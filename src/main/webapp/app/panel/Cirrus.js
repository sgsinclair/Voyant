// for mysterious reasons, Ext.require loads the scripts but produces a blank page, so use loadScript instead
var cirrushtml5path = Ext.Loader.getPath("resources")+"/cirrus/html5"
Ext.Loader.loadScript(cirrushtml5path+"/Cirrus.js")
Ext.Loader.loadScript(cirrushtml5path+"/Word.js")
Ext.Loader.loadScript(cirrushtml5path+"/WordController.js")

Ext.define('Voyant.panel.Cirrus', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.cirrus',
    statics: {
    	i18n: {
    		title: {en: "Cirrus"}
    	},
    	api: {
    		limit: 50,
    		stopList: 'auto',
    		terms: undefined
    	}
    },
    
    constructor: function(config) {

    	Ext.apply(this, {
    		title: this.localize('title')
    	})

        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);

    	if (config.embedded) {
    		var cls = Ext.getClass(config.embedded).getName();
    		if (cls=="Voyant.data.store.CorpusTerms") {
    	    	this.loadFromCorpusTerms(config.embedded);
    		}
    		if (cls=="Voyant.data.model.Corpus") {
    	    	this.loadFromCorpusTerms(config.embedded.getCorpusTerms());
    		}
    	}

    },
    
    listeners: {
    	loadedCorpus: function(src, corpus) {
    		this.loadFromCorpusTerms(corpus.getCorpusTerms());
    	}
    },
    
    loadFromCorpusTerms: function(corpusTerms) {
    	if (corpusTerms) {this.corpusTerms = corpusTerms}
		this.corpusTerms.load({
		    callback: function(records, operation, success) {
		    	this.loadFromCorpusTermsRecords(records)
		    },
		    scope: this,
		    params: this.getApiParams()
    	});
    },
    
    loadFromCorpusTermsRecords: function(records) {
    	var terms = [];
    	records.forEach(function(record) {
    		terms.push({word: record.get('term'), size: record.get('rawFreq')});
    	});
    	this.buildFromTerms(terms)
    },
    
    buildFromTerms: function(terms) {
    	if (this.rendered) {
    		var me = this;
    	    this.cirrus = new Cirrus({
    	        containerId: this.getLayout().getRenderTarget().dom.id,
    	        clickHandler: function(data) {
    	        	me.getApplication().dispatchEvent('termsClicked', me, [data]);
    	        },
    	        words: terms
    	    });   
    	}
    	else {
    		Ext.defer(this.buidlFromTerms, 50, this);
    	}
    }
    
})