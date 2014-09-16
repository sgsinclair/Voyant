Ext.define('Voyant.panel.Reader', {
	extend: 'Ext.panel.Panel',
	requires: ['Voyant.data.store.Tokens'],
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.reader',
    statics: {
    	i18n: {
    		title: {en: "Reader"},
    		documentFrequency: {en: "document frequency:"}
    	},
    	api: {
    		start: 0,
    		limit: 1000
    	}
    },
    config: {
    	corpus: undefined,
    	tokensStore: undefined,
    	documentsStore: undefined
    },
    
    layout: 'border',
    
    items: [{
    	bodyPadding: 10,
    	region: 'center',
    	border: false,
    	height: 'auto',
    	autoScroll: true
    },{
    	html: 'down',
    	region: 'south',
    	border: false,
    	height: 30
    }],
    constructor: function() {
    	Ext.apply(this, {
    		title: this.localize('title')
    	})
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
    	var me = this;
    	var tokensStore = Ext.create("Voyant.data.store.Tokens");
    	tokensStore.on("load", function(s, records) {
    		var contents = "";
    		var documentFrequency = this.localize("documentFrequency");
    		records.forEach(function(record) {
    			if (record.getPosition()==0) {
    				contents+="<h3>"+this.getDocumentsStore().getById(record.getDocId()).getFullLabel()+"</h3>";
    			}
    			if (record.isWord()) {
    				contents += "<span class='word' id='"+ record.getId() + "' data-qtip='"+documentFrequency+" "+record.getDocumentRawFreq()+"'>"+ record.getTerm() + "</span>";
    			}
    			else {
    				contents += record.getTermWithLineSpacing();
    			}
    		}, this);
    		this.updateText(contents, true);
    	}, me);
    	me.setTokensStore(tokensStore)
    	me.on("loadedCorpus", function(src, corpus) {
    		this.getTokensStore().setCorpus(corpus);
    		this.setDocumentsStore(corpus.getDocuments());
    		if (this.rendered) {
    			this.load();
    		}
    	}, me);
    	me.on("afterrender", function() {
    		this.items.getAt(0).body.on("scroll", function() {
    			var cmp = this.items.getAt(0);
    			var body = cmp.body;
    			var dom = body.dom;
    			if (dom.scrollTop+dom.offsetHeight>dom.scrollHeight/2) { // more than half-way down
    				var target = cmp.getLayout().getRenderTarget();
    				var last = target.last();
    				if (last.hasCls("loading")==false) {
    					while(last) {
    						if (last.hasCls("word")) {
    	    					var mask = last.insertSibling("<div class='loading'>loading</div>", 'after', false).mask();
    	    					var info = Voyant.data.model.Token.getInfoFromElement(last);
    	    					last.destroy();
								console.warn(info.docIndex)
    	    					var doc = this.getDocumentsStore().getAt(info.docIndex);
    	    					var id = doc.getId();
    	    					console.warn(info.docIndex, doc, id);
    	    					this.setApiParams({'skipToDocId': id, start: info.position});
    							this.load();
    							break;
    						}
    						last.destroy(); // remove non word
    						last = target.last();
    					}
    				}
    			}
    		}, this);
    		if (this.getCorpus()) {this.load()}
    	}, me)
        me.callParent(arguments);
    },
    
    load: function() {
    	this.getTokensStore().load({
    		params: Ext.apply(this.getApiParams(), {
    			stripTags: 'blocksOnly'
    		})
    	})
    },
    
    updateText: function(contents) {
    	var target = this.items.getAt(0).getLayout().getRenderTarget();
    	var last = target.last();
    	if (last && last.isMasked()) {last.destroy();}
		target.insertHtml('beforeEnd',contents);
    }
})