Ext.define('Voyant.panel.SimpleDocReader', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.simpledocreader',
	isConsumptive: true,
    statics: {
    	i18n: {
    	},
    	api: {
    		docIndex: undefined,
    		docId: undefined
    	},
    	glyph: 'xf0f6@FontAwesome'
	},
    config: {
    },
    
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function(config) {
    	var me = this;
    	Ext.apply(this, {
    		html: '<iframe style="width: 100%; height: 100%; border: none;"></iframe>',
    		dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                items: [{
                	glyph: 'xf060@FontAwesome',
            		handler: this.fetchPrevious,
            		scope: this
            	},{
            		glyph: 'xf061@FontAwesome',
            		handler: this.fetchNext,
            		scope: this
                }]
    		}],
    		listeners: {
    			loadedCorpus: function(src, corpus) {
    				
    				// we can keep the reader blank to begin
    				if (this.getApiParam("autoLoadOnLoadedCorpus", "false")==="true") {return;}
    				
    				this.fireEvent("documentSelected", this, 0);
    				
    			},
        		documentSelected: function(src, document) {
        			this.setApiParams({
        				docIndex: this.getCorpus().getDocument(document).getIndex(),
        				docId: undefined
        			});
        			this.fetch();
        		},
        		scope: this
    		}
    	});
    	
        this.callParent(arguments);
    },
    
	fetchPrevious: function() {
		var doc;
		if (this.getApiParam("docIndex")!==undefined) {doc = this.getCorpus().getDocument(this.getApiParam("docIndex"));}
		else if (this.getApiParam("docId")!==undefined) {doc = this.getCorpus().getDocument(this.getApiParam("docId"));}
		else {doc = this.getCorpus().getDocument(1);}
		if (doc.getIndex()>0) {
			this.setApiParams({docIndex: doc.getIndex()-1, docId: undefined});
			this.fetch();
		} else {
			this.toastInfo(this.localize('noPrevious'))
		}
	},
	
	fetchNext: function() {
		var doc;
		if (this.getApiParam("docIndex")!==undefined) {doc = this.getCorpus().getDocument(this.getApiParam("docIndex"));}
		else if (this.getApiParam("docId")!==undefined) {doc = this.getCorpus().getDocument(this.getApiParam("docId"));}
		else {
			this.setApiParams({docIndex: 0, docId: undefined});
			return this.fetch();
		}
		if (doc.getIndex()<this.getCorpus().getDocumentsCount()-1) {
			this.setApiParams({docIndex: doc.getIndex()+1, docId: undefined});
			this.fetch();
		} else {
			this.toastInfo(this.localize('noNext'))
		}
	},
	
	fetch: function() {
		var doc;
		if (this.getApiParam("docIndex")!==undefined) {doc = this.getCorpus().getDocument(this.getApiParam("docIndex"));}
		else if (this.getApiParam("docId")!==undefined) {doc = this.getCorpus().getDocument(this.getApiParam("docId"));}
		else {doc = this.getCorpus().getDocument(0);}
		var iframe = this.getTargetEl().down("iframe", true);
		iframe.setAttribute("src", "about:blank")
		if (this.getApiParam("originalUrlMetadataKey")) {
			var url = doc.get(this.getApiParam("originalUrlMetadataKey"));
			if (url) {
				iframe.setAttribute("src", url)
				return;
			}
		}
		
		var params = {
			corpus: this.getCorpus().getId(),
			docIndex: doc.getIndex(),
			tool: 'corpus.DocumentTokens',
			template: 'docTokensPlusStructure2html',
			outputFormat: 'html',
			limit: 0
		}
		var url = this.getTromboneUrl() + "?" + Ext.Object.toQueryString(params);
		iframe.setAttribute("src", url);

	}
});
