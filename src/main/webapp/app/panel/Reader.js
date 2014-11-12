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
    	documentsStore: undefined,
    	documentTermsStore: undefined
    },
    
    layout: 'border',
    
    items: [{
    	bodyPadding: 10,
    	region: 'center',
    	border: false,
    	height: 'auto',
    	autoScroll: true
    },{
    	region: 'south',
    	border: false,
    	layout: {
    		type: 'hbox'
    	}
    }],
    constructor: function() {
    	Ext.apply(this, {
    		title: this.localize('title')
    	});
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
    	var me = this;
    	
    	var tokensStore = Ext.create("Voyant.data.store.Tokens");
    	tokensStore.on("load", function(s, records, success) {
    		if (success) {
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
    		}
    	}, me);
    	me.setTokensStore(tokensStore);
    	
    	me.setDocumentTermsStore(Ext.create("Ext.data.Store", {
			model: "Voyant.data.model.DocumentTerm",
    		autoLoad: false,
    		remoteSort: false,
    		proxy: {
				type: 'ajax',
				url: Voyant.application.getTromboneUrl(),
				extraParams: {
					tool: 'corpus.DocumentTerms',
					withDistributions: true,
					// TODO offsets and positions not implemented yet
					withPositions: true,
					withOffsets: true,
					// TODO bins not properly set?
					bins: 50
				},
				reader: {
					type: 'json',
		            rootProperty: 'documentTerms.terms',
		            totalProperty: 'documentTerms.total'
				},
				simpleSortMode: true
   		     },
   		     listeners: {
   		    	 load: function(store, records, successful, opts) {
   		    		 store.sort('docIndex', 'ASC');
   		    		 var graphDatas = {};
   		    		 var maxValue = 0;
   		    		 store.each(function(r) {
   		    			 var graphData = [];
   		    			 var dist = r.get('distributions');
   		    			 var docId = r.get('docId');
   		    			 var docIndex = r.get('docIndex');
   		    			 var term = r.get('term');
   		    			 for (var i = 0; i < dist.length; i++) {
   		    				 var bin = i;//docIndex * dist.length + i;
   		    				 var val = dist[i];
   		    				 if (val > maxValue) maxValue = val;
   		    				 graphData.push([docId, docIndex, bin, val, term]);
   		    			 }
   		    			 graphDatas[docIndex] = graphData;
   		    		 }, this);
   		    		 
   		    		 var graphs = this.query('cartesian');
   		    		 for (var i = 0; i < graphs.length; i++) {
   		    			 var graph = graphs[i];
   		    			 var data = graphDatas[i];
   		    			 if (data !== undefined) {
   		    				 graph.getAxes()[0].setMaximum(maxValue);
 		    				 graph.getStore().loadData(data);
   		    			 } else {
   		    				 graph.getStore().removeAll();
   		    			 }
   		    		 }
   		    	 },
   		    	 scope: me
   		     }
    	}));
    	
    	me.on("loadedCorpus", function(src, corpus) {
    		this.getTokensStore().setCorpus(corpus);
    		this.getDocumentTermsStore().getProxy().setExtraParam('corpus', corpus.getId());
    		
    		var docs = corpus.getDocuments();
    		this.setDocumentsStore(docs);
    		var container = this.down('panel[region="south"]');
    		
    		this.generateChart(corpus, container);
    		
    		if (this.rendered) {
    			this.load();
    		}
    	}, me);
    	me.on("afterrender", function() {
    		// scroll listener
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
    	    					var mask = last.insertSibling("<div class='loading'>"+this.localize('loading')+"</div>", 'after', false).mask();
    	    					var info = Voyant.data.model.Token.getInfoFromElement(last);
    	    					last.destroy();
//								console.warn(info.docIndex);
    	    					var doc = this.getDocumentsStore().getAt(info.docIndex);
    	    					var id = doc.getId();
//    	    					console.warn(info.docIndex, doc, id);
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
    		
    		// click listener
    		this.items.getAt(0).body.on("click", function(event, target) {
    			target = Ext.get(target);
    			if (target.hasCls('word')) {
    				var info = Voyant.data.model.Token.getInfoFromElement(target);
    				var term = target.getHtml();
    				var data = [{
    					term: term
    				}];
    				this.getApplication().dispatchEvent('termsClicked', this, data);
    			}
    		}, this);
    		
    		if (this.getCorpus()) {this.load();}
    	}, me);
    	
    	Ext.apply(me, {
    		listeners: {
            	termsClicked: {
            		fn: function(src, terms) {
                		var queryTerms = [];
                		terms.forEach(function(term) {
                			if (term.term) {queryTerms.push(term.term);}
                		});
                		if (queryTerms) {
                			this.getDocumentTermsStore().load({
            					params: {
            						query: queryTerms,
                    				docIndex: undefined,
                    				docId: undefined,
                    				page: undefined,
                    				start: undefined,
                    				limit: undefined
                    			}
                			});
                		}
            		}
            	}
    		}
    	});
    	
        me.callParent(arguments);
    },
    
    generateChart: function(corpus, container) {
    	function getColor(index, alpha) {
    		var colors = [[116,116,181], [139,163,83], [189,157,60], [171,75,75], [174,61,155]];
    		var c = colors[index % colors.length];
    		return 'rgba('+c[0]+','+c[1]+','+c[2]+','+alpha+')';
    	}
    	
    	function addChart(flex, index) {
    		var bColor = getColor(index, 0.5);
    		var sColor = getColor(index, 1.0);
    		container.add({
    			xtype: 'cartesian',
    	    	flex: flex,
    	    	height: 50,
    	    	insetPadding: 0,
    	    	background: bColor,
    	    	axes: [{
    	    		type: 'numeric',
    	    		position: 'left',
    	    		fields: 'distribution',
    	    		hidden: true
    	    	},{
    				type: 'category',
    				position: 'bottom',
    				fields: 'bin',
    				hidden: true
        		}],
        		series: [{
        			type: 'line',
        			xField: 'bin',
        			yField: 'distribution',
        			style: {
        				lineWidth: 2,
        				strokeStyle: sColor
        			},
                    tooltip: {
                        trackMouse: true,
                        style: 'background: #fff',
                        showDelay: 0,
                        dismissDelay: 500,
                        hideDelay: 5,
                        renderer: function(storeItem, item) {
                            this.setHtml(storeItem.get('term') + ': ' + storeItem.get('distribution'));
                        }
                    }
        		}],
    	    	store: Ext.create('Ext.data.ArrayStore', {
            		fields: ['docId', 'docIndex', 'bin', 'distribution', 'term'],
            		data: []
            	})
    		});
    	}
    	
    	container.removeAll();
    	
    	// calculate divisions in background "gradient"
    	var docs = corpus.getDocuments();
    	var tokensTotal = corpus.getWordTokensCount();
    	var currTokensCount = 0;
    	var gradientStops = [];
    	var lastOffset = 0;
		for (var i = 0; i < docs.getTotalCount(); i++) {
			var d = docs.getAt(i);
			var docIndex = d.get('index');
			var count = d.get('tokensCount-lexical');
			currTokensCount += count;
//			var color = getColor(docIndex, 0.5);
//			console.log(docIndex, color);
			
			var currOffset = count / tokensTotal;
			
			addChart(currOffset, docIndex);
			
			lastOffset = currOffset;
		}
    },
    
    load: function() {
    	this.getTokensStore().load({
    		params: Ext.apply(this.getApiParams(), {
    			stripTags: 'blocksOnly'
    		})
    	});
    },
    
    updateText: function(contents) {
    	var target = this.items.getAt(0).getLayout().getRenderTarget();
    	var last = target.last();
    	if (last && last.isMasked()) {last.destroy();}
		target.insertHtml('beforeEnd', contents);
    },
    
    updateChart: function() {
    	
    }
});