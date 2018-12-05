Ext.define('Voyant.panel.WordTree', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.wordtree',
    statics: {
    	i18n: {
    	},
    	api: {
    		query: undefined,
    		docId: undefined,
    		docIndex: undefined,
    		stopList: 'auto',
    		context: 10,
    		limit: 100
    	},
		glyph: 'xf0e8@FontAwesome'
    },
    
    config: {
    	tree: undefined,
    	kwicStore: undefined,
    	options: {xtype: 'stoplistoption'},
    	numBranches: 5,
    	lastClick: 1
    },
    
    doubleClickDelay: 300,
    
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
        Ext.apply(this, {
    		title: this.localize('title'),
    		dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                items: [{
                	xtype: 'querysearchfield'
                },
                	'<span data-qtip="'+this.localize('poolTip')+'" class="info-tip">'+this.localize('pool')+"</span>"
                , {
                	xtype: 'slider',
                	itemId: 'poolSlider',
                	minValue: 10,
                	value: 100,
                	maxValue: 1000,
                	increment: 5,
                	width: 50,
                	listeners: {
                		render: function(slider) {
                			slider.setValue(this.getApiParam('limit'));
                		},
                		changecomplete: function(slider, newValue) {
                			this.setApiParam('limit', slider.getValue());
                			this.reload();
                		},
                		scope: this
                	}
                }, 
                	'<span data-qtip="'+this.localize('branchesTip')+'" class="info-tip">'+this.localize('branches')+"</span>"
    			,{
                
                	xtype: 'slider',
                	itemId: 'branchesSlider',
                	minValue: 2,
                	value: 5,
                	maxValue: 15,
                	increment: 1,
                	width: 50,
                	listeners: {
                		render: function(slider) {
                			slider.setValue(this.getNumBranches());
                		},
                		changecomplete: function(slider, newValue) {
                			this.setNumBranches(slider.getValue());
                			this.reload();
                		},
                		scope: this
                	}
                },
            	'<span data-qtip="'+this.localize('contextTip')+'" class="info-tip">'+this.localize('context')+"</span>"
            	, {
                	xtype: 'slider',
                	itemId: 'contextSlider',
                	minValue: 3,
                	value: 10,
                	maxValue: 20,
                	increment: 2,
                	width: 50,
                	listeners: {
                		render: function(slider) {
                			slider.setValue(this.getApiParam('context'));
                		},
                		changecomplete: function(slider, newValue) {
                			this.setApiParam('context', slider.getValue());
                			this.reload();
                		},
                		scope: this
                	}
                }]
    		}]
        });
        
        this.setKwicStore(Ext.create('Voyant.data.store.Contexts', {
        	parentPanel: this,
        	proxy: {
        		extraParams: {
                	stripTags: 'all'            			
        		}
        	},
        	listeners: {
        		load: function(store, records, success, operation) {
        			if (success) {
        				this.parseRecords(records);
        			}
        		},
        		scope: this
        	}
        }));
        
        this.on('loadedCorpus', function(src, corpus) {
        	var corpusTerms = corpus.getCorpusTerms({autoLoad: false});
    		corpusTerms.load({
    		    callback: function(records, operation, success) {
    		    	if (success && records.length>0) {
    		    		var firstTerm = records[0].getTerm();
    		    		this.setRoot(firstTerm);
    		    	}
    		    },
    		    scope: this,
    		    params: {
    				limit: 1,
    				query: this.getApiParam('query'),
    				stopList: this.getApiParam('stopList')
    			}
        	});
        }, this);
        
        this.on('query', function(src, query) {
    		if (query !== undefined && query != '') {
    			this.setRoot(query);
    		}
        }, this);
        
        this.on('termsClicked', function(src, terms) {
        	var queryTerms = [];
    		terms.forEach(function(term) {
    			if (Ext.isString(term)) {queryTerms.push(term);}
    			else if (term.term) {queryTerms.push(term.term);}
    			else if (term.getTerm) {queryTerms.push(term.getTerm());}
    		});
    		this.setRoot(queryTerms);
		}, this);
        
        this.on('documentTermsClicked', function(src, terms) {
    		var queryTerms = [];
    		terms.forEach(function(term) {
    			if (term.getTerm()) {queryTerms.push(term.getTerm());}
    		});
    		this.setRoot(queryTerms);
    	}, this);
        
        this.on('resize', function(panel, width, height) {
        	var tree = this.getTree();
        	if (tree !== undefined) {
        		tree.visWidth(width).visHeight(height);
        		// TODO preserve expanded branches
        		tree.redraw();
        	}
		}, this);
        
        this.on('boxready', this.initGraph, this);
        
        this.callParent(arguments);
    },
    
    parseRecords: function(records) {
    	var parsedRecords = [];
		for (var i = 0; i < records.length; i++) {
			var r = records[i];
			var pr = {
				id: i,
				prefix: r.getLeft().trim().split(/\s+/),
				hit: r.getMiddle(),
				suffix: r.getRight().trim().split(/\s+/)
			};
			parsedRecords.push(pr);
		}
		
		// find top tokens and sort records by them
		var prefixTokenCounts = {};
		var suffixTokenCounts = {};
		for (var i = 0; i < parsedRecords.length; i++) {
			var pr = parsedRecords[i];
			var prefixToken = pr.prefix[pr.prefix.length-1];
			var suffixToken = pr.suffix[0];
			if (prefixTokenCounts[prefixToken]) {
				prefixTokenCounts[prefixToken]++;
			} else {
				prefixTokenCounts[prefixToken] = 1;
			}
			if (suffixTokenCounts[suffixToken]) {
				suffixTokenCounts[suffixToken]++;
			} else {
				suffixTokenCounts[suffixToken] = 1;
			}
		}
		
		var sortableTokens = [];
		for (var i = 0; i < parsedRecords.length; i++) {
			var pr = parsedRecords[i];
			var prefixToken = pr.prefix[pr.prefix.length-1];
			var suffixToken = pr.suffix[0];
			
			sortableTokens.push({
				suffix: suffixToken, suffixCount: suffixTokenCounts[suffixToken],
				prefix: prefixToken, prefixCount: prefixTokenCounts[prefixToken]
			});
			
		}
		
		var prioritizeSuffix = false;
		// multi-sort
		sortableTokens.sort(function(a, b) {
			var s1 = a.suffixCount;
			var s2 = b.suffixCount;
			
			var p1 = a.prefixCount;
			var p2 = b.prefixCount;
			
			if (prioritizeSuffix) {
				if (s1 > s2) return -1;
				if (s1 < s2) return 1;
				if (p1 > p2) return -1;
				if (p1 < p2) return 1;
			} else {
				if (p1 > p2) return -1;
				if (p1 < p2) return 1;
				if (s1 > s2) return -1;
				if (s1 < s2) return 1;
			}
			
			return 0;
		});
		
		var len = Math.min(this.getNumBranches(), sortableTokens.length);
		var topSuffixTokens = [];
		var topPrefixTokens = [];
		for (var i = 0; i < len; i++) {
			topSuffixTokens.push(sortableTokens[i].suffix);
			topPrefixTokens.push(sortableTokens[i].prefix);
		}
		
		// use top tokens to limit results
		var prefixes = [], hits = [], suffixes = [], ids = [];
		for (var i = 0; i < parsedRecords.length; i++) {
			var parsedRecord = parsedRecords[i];
			if (topSuffixTokens.indexOf(parsedRecord.suffix[0]) != -1 || topPrefixTokens.indexOf(parsedRecord.suffix[0]) != -1) {
				prefixes.push(parsedRecord.prefix);
				hits.push(parsedRecord.hit);
				suffixes.push(parsedRecord.suffix);
				ids.push(parsedRecord.id);
			}
		}
		
		var caseSensitive = false;
		var fieldNames = ["token", "POS"];
		var fieldDelim = "/";
		var distinguishingFieldsArray = ["token", "POS"];
		this.getTree().setupFromArrays(prefixes, hits, suffixes, ids, caseSensitive, fieldNames, fieldDelim, distinguishingFieldsArray);
		
		if (!this.getTree().succeeded()) {
			this.toastInfo({
   				html: this.localize("emptyText"),
   				align: 'bl'
   			});
		}
    },
    
    initGraph: function() {
    	var el = this.getLayout().getRenderTarget();
    	var w = el.getWidth();
    	var h = el.getHeight();
    	
    	var dt = new doubletree.DoubleTree();
    	dt.init('#'+el.getId())
    		.visWidth(w).visHeight(h)
    		.handlers({
    			click: this.clickHandler.bind(this)
    		});
    	
    	this.setTree(dt);
    	
    	// explicitly set dimensions
//    	el.setWidth(el.getWidth());
//    	el.setHeight(el.getHeight());
    },
    
    clickHandler: function(node) {
    	var now = new Date().getTime();
    	if (this.getLastClick() && now-this.getLastClick()<this.doubleClickDelay) {
    		this.setLastClick(1);
    		var terms = [], parent = node;
        	while (parent != null) {
        		terms.push(parent.name);
        		parent = parent.parent;
        	}
        	this.getApplication().dispatchEvent('termsClicked', this, [terms.reverse().join(" ")]);
    	} else {
    		this.setLastClick(now);
    	}
    },
    
//    doubleClickHandler: function(node) {
//// dispatch phrase click instead of recentering (which can be done with search)
////    	this.setRoot(node.name);
//    },
//    
    setRoot: function(query) {
    	this.setApiParam('query', this.stripPunctuation(query));
		this.getKwicStore().load({params: this.getApiParams()});
    },
    
    reload: function() {
    	var query = this.getApiParam('query');
    	if (query !== undefined) {
    		this.setRoot(query);
    	}
    },
    
    stripPunctuation: function(value) {
    	if (Ext.isString(value)) return value.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
    	else {
    		var values = [];
    		value.forEach(function(v) {
    			values.push(v.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ''));
    		});
    		return values;
    	}
    	return '';
    }
});

