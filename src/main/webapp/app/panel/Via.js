
// assuming Cirrus library is loaded by containing page (via voyant.jsp)
Ext.define('Voyant.panel.Via', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.via',
    statics: {
    	i18n: {
    		title: "Via",
    		helpTip: "Via is a tool intended to help you explore the semantic clusters of English texts.",
    		visible: "Visible",
    		timedout: "An attempt was made to fetch data but the request took too long. The process may be still ongoing and you could try again in a couple of minutes.",
    		englishOnly: "You seem to have a text in a language other than English. Unfortunately, at the moment, Via only supports texts in English (because of the current way the lemmatization and synonym operations are programmed)."
    	},
    	api: {
    		stopList: 'auto',
    		limit: 100,
    		docIndex: undefined
    	},
		glyph: 'xf06e@FontAwesome'
    },
    
    config: {
    	mode: undefined,
    	options: [
    		{xtype: 'stoplistoption'},
    		{
	    		xtype: 'listeditor',
	    		name: 'whiteList'
    	    },
    	    {xtype: 'categoriesoption'}
    	]
    },
    
    layout: 'fit',
    
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function (config) {
    	Ext.apply(this, {
    		title: this.localize('title'),
    		dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                items: [{
        			xtype: 'corpusdocumentselector',
        			singleSelect: true
        		},{
        			fieldLabel: this.localize('visible'),
        			labelWidth: 40,
        			width: 120,
        			xtype: 'slider',
	            	increment: 10,
	            	minValue: 10,
	            	maxValue: 1000,
	            	listeners: {
	            		afterrender: function(slider) {
	            			slider.setValue(this.getApiParam("limit"))
	            		},
	            		changecomplete: function(slider, newvalue) {
	            			this.setApiParams({limit: newvalue});
	            			this.loadFromCorpus(this.getCorpus());
	            		},
	            		scope: this
	            	}
                }]
    		}]
    	});

    	this.callParent(arguments);
    	
    	
    },
    
    listeners: {
    	resize: function(panel, width, height) {
//    		if (this.getCorpus()) {
//        		this.loadFromCorpus(this.getCorpus())
//    		}
    	},
    	
    	loadedCorpus: function(src, corpus) {
    		var langs = corpus.get("languageCodes");
    		var val = Ext.Array.each(langs, function(lang) {
    			if (lang!='en') {
    				this.showError(this.localize('englishOnly'));
    				return false;
    			}
    		}, this);
    		if (corpus.getWordTokensCount()>100000 && !this.getApiParam("docIndex")) {
    			this.setApiParam("docIndex", 0)
    		}
    		this.loadFromCorpus(corpus);
    	},
    	
    	corpusSelected: function(src, corpus) {
    		this.setApiParam("docIndex", "");
    		this.loadFromCorpus(corpus)
    	},
    	
    	documentSelected: function(src, document) {
    		this.setApiParam("docIndex", document.getIndex());
    		this.loadFromCorpus(this.getCorpus())
    	}
    	
    	
    },
    
    loadFromCorpus: function(corpus) {
    	var me = this;
    	this.mask(this.localize("loading"))
    	var params = this.getApiParams();
    	var a = corpus.loadRelatedWords(params).then(function(relatedWords) {
    		me.unmask()
    		var edges = relatedWords.map(function(item) {return {source: item.getSource(), target: item.getTarget()}})
    		var graph = me.down("voyantnetworkgraph");
    		if (graph) {
    			graph.loadJson({edges: edges});
    		} else {
    			graph = Ext.create("Voyant.widget.VoyantNetworkGraph", {
        			edges: edges,
        			listeners: {
        				nodeclicked: function(src, node) {
        					me.dispatchEvent('termsClicked', me, [node.term]);
        				}
        			}
        		})
        		me.add(graph)
    		}
    	}, function(response) {
    		me.unmask();
    		if (response.timedout) {
    			me.showError(me.localize('timedout'));
    		} else {
        		me.showError(response);
    		}
    	});
    }
});