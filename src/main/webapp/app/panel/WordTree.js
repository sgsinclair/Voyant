Ext.define('Voyant.panel.WordTree', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.wordtree',
    statics: {
    	i18n: {
    		title: {en: 'WordTree'}
    	},
    	api: {
    		query: undefined,
    		docId: undefined,
    		docIndex: undefined,
    		stopList: 'auto',
    		context: 5,
    		expand: 50,
    		limit: 5
    	},
		glyph: 'xf1cb@FontAwesome'
    },
    
    config: {
    	corpus: undefined,
    	tree: undefined,
    	kwicStore: undefined
    },
    
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
        var me = this;
        
        Ext.apply(me, {
    		title: this.localize('title')
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
        					prefix.push(r.getLeft().split(/\s+/));
        					hit.push(r.getMiddle());
        					suffix.push(r.getRight().split(/\s+/));
        					id.push(i);
        				}
        				var caseSensitive = false;
        				var fieldNames = ["token", "POS"];
        				var fieldDelim = "/";
        				var distinguishingFieldsArray = ["token", "POS"];
        				this.getTree().setupFromArrays(prefix, hit, suffix, id, caseSensitive, fieldNames, fieldDelim, distinguishingFieldsArray);
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
    		    		this.setApiParam('query', records[0].getTerm());
    		    		this.getKwicStore().load({params: this.getApiParams()});
    		    	}
    		    },
    		    scope: me,
    		    params: {
    				limit: 1,
    				query: this.getApiParam('query'),
    				stopList: this.getApiParam('stopList')
    			}
        	});
        }, this);
        
        this.on('resize', function(panel, width, height) {

		}, this);
        
        this.on('boxready', this.initGraph, this);
        
    	this.mixins['Voyant.panel.Panel'].initComponent.apply(this, arguments);
        me.callParent(arguments);
    },
        
    initGraph: function() {
    	var el = this.getLayout().getRenderTarget();
    	var w = el.getWidth();
    	var h = el.getHeight();
    	
    	var dt = new doubletree.DoubleTree();
    	dt.init('#'+el.getId());
//    		.visWidth(w)
//    		.handlers({alt: null, shift: null});
    	
    	this.setTree(dt);
    	
    	// explicitly set dimensions
//    	el.setWidth(el.getWidth());
//    	el.setHeight(el.getHeight());
    }
});

