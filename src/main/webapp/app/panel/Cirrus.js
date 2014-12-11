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
    		title: {en: "Cirrus"},
    		helpTip: {en: "<p>Cirrus provides a wordcloud view of the most frequently occurring words in the corpus or document – this provides a convenient (though reductive) overview of the content. Features include</p><ul><li>term frequency appears when hovering over words</li><li>clicking on terms may produce results in other tools if any are displayed</li></ul>"}
    	},
    	api: {
    		limit: 50,
    		stopList: 'auto',
    		terms: undefined
    	},
		glyph: 'xf06e@FontAwesome'
    },
    
    config: {
    	mode: undefined,
    	options: {
    		xtype: 'stoplistoption'
    	}
    },

    MODE_CORPUS: 'corpus',
    MODE_DOCUMENT: 'mode_document',
    
    layout: 'fit',
    
    constructor: function(config) {

    	Ext.apply(this, {
    		title: this.localize('title')
    	});

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
    	resize: function(panel, width, height) {
    		if (this.cirrus) {
    			this.cirrus.resizeWords();
    		}
    	},
    	
    	loadedCorpus: function(src, corpus) {
    		this.loadFromCorpus(corpus);
    	},
    	
    	documentsClicked: function(src, documents, corpus) {
    		if (documents) {
    			var doc = documents[0];
    			this.setApiParam('docId', doc.getId());
        		this.loadFromDocumentTerms(documents[0].getDocumentTerms({autoload: false, corpus: corpus}));
    		}
    	},
    	
    	ensureCorpusView: function(src, corpus) {
    		if (this.getMode() != this.MODE_CORPUS) {this.loadFromCorpus(corpus);}
    	}
    },
    
    loadFromCorpus: function(corpus) {    	
		this.loadFromCorpusTerms(corpus.getCorpusTerms({autoload: false}));
    },
    
    loadFromDocumentTerms: function(documentTerms) {
    	documentTerms.load({
		    callback: function(records, operation, success) {
		    	this.setMode(this.MODE_DOCUMENT);
		    	this.loadFromTermsRecords(records)
		    },
		    scope: this,
		    params: this.getApiParams()
    	});
    	
    },
    
    loadFromCorpusTerms: function(corpusTerms) {
		corpusTerms.load({
		    callback: function(records, operation, success) {
		    	this.setMode(this.MODE_CORPUS);
		    	this.loadFromTermsRecords(records)
		    },
		    scope: this,
		    params: this.getApiParams()
    	});
    },
    
    loadFromTermsRecords: function(records) {
    	var terms = [];
    	records.forEach(function(record) {
    		terms.push({word: record.get('term'), size: record.get('rawFreq'), value: record.get('rawFreq')});
    	});
    	this.buildFromTerms(terms)
    },
    
    buildFromTerms: function(terms) {
    	if (this.rendered && terms) {
    		var me = this;
    		var target = this.getLayout().getRenderTarget();
    		if (this.cirrus) {
    			target.update(""); // clear
    		}
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