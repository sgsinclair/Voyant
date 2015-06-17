Ext.define('Voyant.panel.Phrases', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.phrases',
	config: {
		corpus: undefined
	},
    statics: {
    	i18n: {
    		title: {en: "Phrases"},
    		helpTip: {en: "<p>Corpus Phrases is a table view of repeating phrases in the entire corpus.<!-- Features include:</p><ul><li>reordering by keyword, collocate word, collocate word count</li><li>a search box for queries (hover over the magnifying icon for help with the syntax)</li></ul>-->"},
    		term: {en: "Term"},
    		termTip: {en: "This is the keyword phrase (this is a generalized form, it may appear slightly differently for each occurrence)."},
    		termRawFreq: {en: "Count"},
    		termRawFreqTip: {en: "The number of times the phrase occurs in the corpus."},
    		matchingTerms: {en: '{count}'},
    		length: {en: "Length"},
    		lengthTip: {en: "The upper and lower bounds of phrase lengths (how many words in each phrase)."},
    		overlap: {en: "Overlap"},
    		overlapTip: {en: "overlap tip"},
    		overlapMenu: {en: "Choose an overlap filter:"},
    		overlapNone: {en: "none (keep all)"},
    		overlapLength: {en: "prioritize longest phrases"},
    		overlapFreq: {en: "prioritize most frequent phrases"}
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
    		var store = this.getStore();
    		store.setCorpus(corpus);
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

        var store = Ext.create("Voyant.data.store.CorpusNgrams", {
        	autoLoad: false
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
                           '<b class="menu-title">'+this.localize('overlapMenu')+'</b>',
                           {
                               text: this.localize("overlapNone"),
                               checked: true,
                               group: 'overlap',
                               checkHandler: function() {
                            	   this.setApiParam('overlapFilter', 'none')
                            	   this.getStore().load({params: this.getApiParams()})
                               },
                               scope: this
                           }, {
                               text: this.localize("overlapLength"),
                               checked: false,
                               group: 'overlap',
                               checkHandler: function() {
                            	   this.setApiParam('overlapFilter', 'length')
                            	   this.getStore().load({params: this.getApiParams()})
                               },
                               scope: this
                           }, {
                               text: this.localize("overlapFreq"),
                               checked: false,
                               group: 'overlap',
                               checkHandler: function() {
                            	   this.setApiParam('overlapFilter', 'rawfreq')
                            	   this.getStore().load({params: this.getApiParams()})
                               },
                               scope: this
                           }
	                   ]
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
                    			if (term.term) {queryTerms.push(term.term);}
                    		});
                    		if (queryTerms) {
                    			this.setApiParams({
                    				docIndex: undefined,
                    				docId: undefined,
                    				query: queryTerms
                    			});
                        		if (this.isVisible()) {
                            		if (this.isVisible()) {
                                		this.getStore().loadPage(1, {params: this.getApiParams()});
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