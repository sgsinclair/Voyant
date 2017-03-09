Ext.define('Voyant.panel.Phrases', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.phrases',
    statics: {
    	i18n: {
    	},
    	api: {
    		stopList: 'auto',
    		query: undefined,
    		docId: undefined,
    		docIndex: undefined,
    		sort: 'length',
    		dir: 'desc',
    		minLength: 2,
    		maxLength: 50,
    		overlapFilter: 'length'
    	},
		glyph: 'xf0ce@FontAwesome'
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
            		this.getStore().load({params: this.getApiParams()});
        		}
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
    			this.getStore().load({params: this.getApiParams()});
    	}
    },
    
    initComponent: function() {
        var me = this;

        var store = Ext.create("Voyant.data.store.CorpusNgramsBuffered", {
        	parentPanel: me
        });
        me.on("sortchange", function( ct, column, direction, eOpts ) {
        	this.setApiParam('sort', column.dataIndex);
        	this.setApiParam('dir', direction);
        	var api = this.getApiParams(["stopList", "query", "docId", "docIndex", "sort", "dir", "minLength", "maxLength", "overlapFilter"]);
        	var proxy = this.getStore().getProxy();
        	for (var key in api) {proxy.setExtraParam(key, api[key]);}
        }, me)

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
                    			terms.push('"'+selection.getTerm()+'"')
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
                overflowHandler: 'scroller',
                items: [{
                    xtype: 'querysearchfield'
                }, {
                    xtype: 'totalpropertystatus'
                }, '-', {
                	text: me.localize('length'),
                	tooltip: 'test',
                	xtype: 'label'
                }, {
                	xtype: 'slider',
                	minValue: 2,
                	values: [2, 30],
                	maxValue: 30,
                	increment: 1,
                	width: 75,
                	tooltip: this.localize("lengthTip"),
                	listeners: {
                		render: {
                			fn: function(slider) {
                				var values = slider.getValues();
                				slider.setValue(0, parseInt(this.getApiParam("minLength", values[0])))
                				slider.setValue(1, parseInt(this.getApiParam("maxLength", values[1])))
	                		},
	                		scope: me
                		},
                		changecomplete: {
                			fn: function(slider, newValue) {
                				var values = slider.getValues();
                				this.setApiParam("minLength", parseInt(values[0]));
                				this.setApiParam("maxLength", parseInt(values[1]));
                        		this.getStore().load({params: this.getApiParams()});
                    		},
                    		scope: me
                		}
                	}
                }, '-', {
                    xtype: 'button',
                    text: this.localize('overlap'),
                    tooltip: this.localize('overlapTip'),
                    menu: {
                    	items: [
                           {
                        	   xtype: 'menucheckitem',
                               text: this.localize("overlapNone"),
                               group: 'overlap',
                               inputValue: 'none',
                               checkHandler: function() {
                            	   this.setApiParam('overlapFilter', 'none')
                            	   this.getStore().load({params: this.getApiParams()})
                               },
                               scope: this
                           }, {
                        	   xtype: 'menucheckitem',
                               text: this.localize("overlapLength"),
                               group: 'overlap',
                               inputValue: 'length',
                               checkHandler: function() {
                            	   this.setApiParam('overlapFilter', 'length')
                            	   this.getStore().load({params: this.getApiParams()})
                               },
                               scope: this
                           }, {
                        	   xtype: 'menucheckitem',
                               text: this.localize("overlapFreq"),
                               group: 'overlap',
                               inputValue: 'rawFreq',
                               checkHandler: function() {
                            	   this.setApiParam('overlapFilter', 'rawfreq')
                            	   this.getStore().load({params: this.getApiParams()})
                               },
                               scope: this
                           }
	                   ],
	                   listeners: {
	                	   afterrender: {
	                		   fn: function(menu) {
	                			   var overlapFilter = this.getApiParam('overlapFilter');
	                			   menu.items.each(function(item) {
	                				   if (item.group) {
	                					   item.setChecked(item.inputValue==overlapFilter);
	                				   }
	                			   }, this)
	                		   },
	                		   scope: this
	                	   }
                
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
                width: 'autoSize'
            },{
            	text: this.localize("length"),
            	dataIndex: 'length',
            	tooltip: this.localize("lengthTip"),
            	sortable: true,
                width: 'autoSize'
            },{
                xtype: 'widgetcolumn',
                text: this.localize("trend"),
                tooltip: this.localize('trendTip'),
                width: 120,
                dataIndex: 'distributions',
                widget: {
                    xtype: 'sparklineline'
                }
            }],
            
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