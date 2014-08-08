Ext.define('Voyant.panel.Documents', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel','Voyant.util.Localization'],
	alias: 'widget.documents',
    statics: {
    	i18n: {
    		title: {en: "Documents"},
    		id: {en: "ID"},
    		documentTitle: {en: "Title"},
    		tokensCountLexical: {en: "Words"},
    		typesCountLexical: {en: "Types"},
    		typeTokenRatioLexical: {en: "Ratio"},
    		language: {en: "Language"}
    	}
    },

    constructor: function(config) {
    	Ext.apply(this, {
    		title: this.localize('title'),
	    	columns:[
	    	   {
	    	        xtype: 'rownumberer',
	    	        width: 30,
	    	        sortable: false
	    	    },{
	    	        text: this.localize('id'),
	    	        dataIndex: 'id',
	    	        hidden: true,
	    	        sortable: false
	    	    },{
	    	        text: this.localize('documentTitle'),
	    	        dataIndex: 'title',
	    	        sortable: true
	    	    },{
	    	        text: this.localize('tokensCountLexical'),
	    	        dataIndex: 'tokensCount-lexical',
	    	        renderer: Ext.util.Format.numberRenderer('0,000'),
	    	        sortable: true
	    	    },{
	    	        text: this.localize('typesCountLexical'),
	    	        dataIndex: 'typesCount-lexical',
	    	        renderer: Ext.util.Format.numberRenderer('0,000')
	    	    },{
	    	        text: this.localize('typeTokenRatioLexical'),
	    	        dataIndex: 'typeTokenRatio-lexical',
	    	        renderer: function(val) {return Ext.util.Format.percent(val)}
	    	    },{
	    	        text: this.localize('language'),
	    	        dataIndex: 'language',
	    	        renderer: function(val, metaData, record, rowIndex, colIndex, store, view) {return view.ownerCt.getLanguage(val);}
	    	    }
	    	],
	    	
	        store: Ext.create("Voyant.data.store.Documents", {
	    	    selModel: {pruneRemoved: false}
	    	}),
	    	
	    	selModel: Ext.create('Ext.selection.RowModel', {
                listeners: {
                    selectionchange: {
                    	fn: function(sm, selections) {
                    		this.getApplication().dispatchEvent('documentsClicked', this, selections);
                    	},
                    	scope: this
                    }
                }
            })
    	});
    	
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
        
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		this.store.setCorpus(corpus);
    		this.store.loadPage(1);
    	})
    	
    	if (config.embedded) {
    		debugger
        	if (Ext.getClass(config.embedded).getName() == "Voyant.data.model.Corpus") {
        		config.corpus = config.embedded
        	}
        	else if (Ext.getClass(config.embedded).getName() == "Voyant.data.store.Documents") {
        		this.store.setRecords(config.embedded.getData())
        		config.corpus = config.embedded.getCorpus()
        	}
    		
    	}
    	
    	// if we have a corpus, load it
    	if (config.corpus) {
    		this.fireEvent('loadedCorpus', this, config.corpus)
    	}
    }
})