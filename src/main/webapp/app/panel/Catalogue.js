Ext.define('Voyant.panel.Catalogue', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.catalogue',
    statics: {
    	i18n: {
    		title: {en: "Catalogue"},
    		helpTip: {en: "<p>The <i>Summary</i> tool provides general information about the corpus. Many elements in the tool are links that trigger other views. Features include:</p><ul><li>total words (tokens) and word forms (types) and age of the corpus</li><li>most frequent terms in the corpus</li><li>for corpora with more than one documen<ul><li>documents ordered by length and vocabulary density</li><li>distinctive words for each document (by TF-IDF score)</li></ul></li></ul>"},
    	},
    	api: {
    		config: undefined
    	},
		glyph: 'xf1ea@FontAwesome'
    },
    config: {
    	corpus: undefined
    },
    
    constructor: function(config ) {

    	Ext.apply(this, {
    		title: this.localize('title'),
    		layout: 'hbox',
    		items: [{xtype: 'container', html: 'test1', flex: 1},{xtype: 'container', html: 'test2', flex: 4}]
    	});

        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		
    		this.setCorpus(corpus);
    		
    	});
    	
    }
});
