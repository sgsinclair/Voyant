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
    		limit: 5
    	},
		glyph: 'xf1cb@FontAwesome'
    },
    
    config: {
    	corpus: undefined,
    	tree: undefined,
    	kwicStore: undefined,
    	options: {xtype: 'stoplistoption'}
    },
    
    doubleClickDelay: 300,
    lastClick: 1,
    
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
                enableOverflow: true,
                items: [{
                	xtype: 'querysearchfield'
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
        				var prefix = [], hit = [], suffix = [], id = [];
        				for (var i = 0; i < records.length; i++) {
        					var r = records[i];
        					//prefix.push([r.getLeft().trim().replace(/\s+/g, ' ')]);
        					prefix.push(r.getLeft().trim().split(/\s+/));
        					hit.push(r.getMiddle());
        					//suffix.push([r.getRight().trim().replace(/\s+/g, ' ')]);
        					suffix.push(r.getRight().trim().split(/\s+/));
        					id.push(i);
        				}
        				var caseSensitive = false;
        				var fieldNames = ["token", "POS"];
        				var fieldDelim = "/";
        				var distinguishingFieldsArray = ["token", "POS"];
        				this.getTree().setupFromArrays(prefix, hit, suffix, id, caseSensitive, fieldNames, fieldDelim, distinguishingFieldsArray);
        				
        				if (!this.getTree().succeeded()) {
        					this.toastInfo({
       		    				html: this.localize("emptyText"),
       		    				align: 'bl'
       		    			});
        				}
        			}
        		},
        		scope: this
        	}
        }));
        
        this.on('loadedCorpus', function(src, corpus) {
        	this.setCorpus(corpus);
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

		}, this);
        
        this.on('boxready', this.initGraph, this);
        
        this.callParent(arguments);
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
    	if (this.lastClick && now-this.lastClick<this.doubleClickDelay) {
    		this.lastClick=1;
    		var terms = [], parent = node;
        	while (parent != null) {
        		terms.push(parent.name);
        		parent = parent.parent;
        	}
        	this.getApplication().dispatchEvent('termsClicked', this, [terms.reverse().join(" ")]);
    	} else {
    		this.lastClick = now;
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

