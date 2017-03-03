Ext.define('Voyant.panel.CorpusCollocates', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.corpuscollocates',
    statics: {
    	i18n: {
    	},
    	api: {
    		stopList: 'auto',
    		context: 5,
    		query: undefined,
    		docId: undefined,
    		docIndex: undefined,
    		sort: 'contextTermRawFreq'
    	},
		glyph: 'xf0ce@FontAwesome'
    },
    config: {
    	options: {xtype: 'stoplistoption'}
    },
    constructor: function(config) {
    	
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		if (this.isVisible()) {
    			this.loadFromApis();
    		}
    	});
    	
    	if (config.embedded) {
//    		var cls = Ext.getClass(config.embedded).getName();
//    		if (cls=="Voyant.data.store.DocumentTerms" || cls=="Voyant.data.model.Document") {
//    			this.fireEvent('loadedCorpus', this, config.embedded.getCorpus())
//    		}
    	}
    	else if (config.corpus) {
    		this.fireEvent('loadedCorpus', this, config.corpus)
    	}
    	
    	this.on("corpusTermsClicked", function(src, terms) {
    		if (this.getStore().getCorpus()) { // make sure we have a corpus
        		var query = [];
        		terms.forEach(function(term) {
        			query.push(term.get("term"));
        		})
        		this.setApiParams({
        			query: query,
        			docId: undefined,
        			docIndex: undefined
        		});
        		if (this.isVisible()) {
            		this.getStore().clearAndLoad({params: this.getApiParams()});
        		}
    		}
    	});
    	
    	this.on("documentsClicked", function(src, documents) {
    		var docIds = [];
    		documents.forEach(function(doc) {docIds.push(doc.get('id'))});
    		this.setApiParams({
    			docId: docIds,
    			docid: undefined,
    			query: undefined
    		})
    		if (this.isVisible()) {
        		this.getStore().clearAndLoad({params: this.getApiParams()});
    		}
    	});
    	
    	this.on("activate", function() { // load after tab activate (if we're in a tab panel)
    		if (this.getStore().getCorpus()) {this.loadFromApis()}
    	}, this)
    	
    	this.on("query", function(src, query) {
    		this.setApiParam("query", query);
    		this.getStore().getProxy().setExtraParam("query", query);
    		this.loadFromApis();
    	}, this)
    },
    
    loadFromApis: function() {
    	if (this.getStore().getCorpus()) {
    		if (this.getApiParam('query')) {
    			this.getStore().clearAndLoad({params: this.getApiParams()});
    		}
    		else {
				var corpusTerms = this.getStore().getCorpus().getCorpusTerms({
					leadingBufferZone: 0,
					autoLoad: false
				});
        		corpusTerms.load({
        		    callback: function(records, operation, success) {
        		    	if (success) {
        		    		var terms = [];
        		    		records.forEach(function(term) {
        		    			terms.push(term.getTerm());
        		    		})
        		    		this.getStore().getProxy().setExtraParam("query", terms);
        		    		this.setApiParam('query', terms);
        		    		this.loadFromApis();
        		    	}
        		    },
        		    scope: this,
        		    params: {
        				limit: 10,
        				stopList: this.getApiParam("stopList")
        			}
            	});

    		}
    	}
    },
    
    initComponent: function() {
        var me = this;

        var store = Ext.create("Voyant.data.store.CorpusCollocatesBuffered", {parentPanel: this});
        
        Ext.apply(me, {
    		title: this.localize('title'),
    		emptyText: this.localize("emptyText"),
            store : store,
    		selModel: Ext.create('Ext.selection.CheckboxModel', {
                listeners: {
                    selectionchange: {
                    	fn: function(sm, selections) {
                    		var terms = [];
                    		var context = this.getApiParam("context")
                    		selections.forEach(function(selection) {
                    			terms.push('"'+selection.getKeyword()+" "+selection.getContextTerm()+'"~'+context)
                    		})
                    		this.getApplication().dispatchEvent('termsClicked', this, terms);
                    	},
                    	scope: this
                    }
                }
            }),
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
        		enableOverflow: true,
                items: [{
                    xtype: 'querysearchfield'
                }, {
                    xtype: 'totalpropertystatus'
                }, this.localize('context'), {
                	xtype: 'slider',
                	minValue: 1,
                	value: 5,
                	maxValue: 30,
                	increment: 2,
                	width: 50,
                	listeners: {
                		render: function(slider) {
                			slider.setValue(me.getApiParam('context'))
                		},
                		changecomplete: function(slider, newValue) {
                			me.setApiParam("context", slider.getValue());
           		        	me.getStore().clearAndLoad({params: me.getApiParams()});
                		}
                	}
                }]
            }],
    		columns: [{
    			text: this.localize("term"),
        		dataIndex: 'term',
            	tooltip: this.localize("termTip"),
                sortable: true,
                flex: 1
            },{
    			text: this.localize("rawFreq"),
        		dataIndex: 'rawFreq',
            	tooltip: this.localize("termRawFreqTip"),
                sortable: true,
                width: 'autoSize',
                hidden: true
            },{
            	text: this.localize("contextTerm"),
            	dataIndex: 'contextTerm',
            	tooltip: this.localize("contextTermTip"),
            	flex: 1,
            	sortable: true
            },{
            	text: this.localize("contextTermRawFreq"),
            	tooltip: this.localize("contextTermRawFreqTip"),
            	dataIndex: 'contextTermRawFreq',
            	width: 'autoSize',
            	sortable: true
            }/*,{
                xtype: 'widgetcolumn',
                text: this.localize("trend"),
                tooltip: this.localize('trendTip'),
                width: 120,
                dataIndex: 'distributions',
                widget: {
                    xtype: 'sparklineline'
                }
            }*/],
            
            listeners: {
            	termsClicked: {
            		fn: function(src, terms) {
                		if (this.getStore().getCorpus()) { // make sure we have a corpus
                    		var queryTerms = [];
                    		terms.forEach(function(term) {
                    			if (Ext.isString(term)) {queryTerms.push(term);}
                    			else if (term.term) {queryTerms.push(term.term);}
                    			else if (term.getTerm) {queryTerms.push(term.getTerm());}
                    		});
                    		if (queryTerms.length > 0) {
                    			this.setApiParams({
                    				docIndex: undefined,
                    				docId: undefined,
                    				query: queryTerms
                    			});
                        		if (this.isVisible()) {
                            		if (this.isVisible()) {
                                		this.getStore().clearAndLoad({params: this.getApiParams()});
                            		}
                        		}
                    		}
                		}
                	},
                	scope: this
            	}
            }
        });

        me.callParent(arguments);
        
        me.getStore().getProxy().setExtraParam("withDistributions", true);
        
    }
    
})