Ext.define('Voyant.panel.CollocatesGraph', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.collocatesgraph',
    statics: {
    	i18n: {
    		title: {en: "Collocates Graph"}
    	},
    	api: {
    		limit: 15,
    		stopList: 'auto',
    		terms: undefined
    	},
		glyph: 'xf1cb@FontAwesome'
    },
    
    config: {
    	corpus: undefined,
    	node: undefined,
    	link: undefined,
    	nodes: undefined,
    	links: undefined,
    	force: undefined,
    	corpusColours: d3.scale.category10()
    },

    constructor: function(config) {

        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);

    },
    
    initComponent: function() {
    	
        var me = this;

        Ext.apply(me, {
    		title: this.localize('title'),
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                items: [{
                    xtype: 'querysearchfield'
                    	
                }, {
                    xtype: 'component',
                    itemId: 'status',
                    tpl: this.localize('matchingTerms'),
                    style: 'margin-right:5px'
                }]
            }],
            listeners: {
    			loadedCorpus: {
    				fn: function(src, corpus) {
	    				this.setCorpus(corpus);
	    				if (this.isVisible()) {
	    					this.initLoad();
	    				}
	    			},
	    			scope: this
    			},
    			query: {
    				fn: function(src, query) {this.loadFromQuery(query);},
    				scope: this
    			},
    			activate: {
    				fn: function() { // load after tab activate (if we're in a tab panel)
    					if (this.getCorpus()) {
    						Ext.Function.defer(this.initLoad, 100, this);
    					}
    		    	},
    		    	scope: this
    			}, 
    			resize: {
    				fn: function(panel, width, height) {
    					var el = this.getLayout().getRenderTarget();
    					var svg = el.down('svg');
    					svg.set({
    						width: el.getWidth(),
    						height: el.getHeight()
    					});
    				},
    				scope: this
    			}
    		}
        });
        
    	this.mixins['Voyant.panel.Panel'].initComponent.apply(this, arguments);
        me.callParent(arguments);

    },
    
    initLoad: function() {
    	if (this.getCorpus()) {
    		this.initGraph();
    		var corpusTerms = this.getCorpus().getCorpusTerms({
    			leadingBufferZone: 0,
    			autoLoad: false
    		});
    		corpusTerms.load({
    		    callback: function(records, operation, success) {
    		    	if (success) {
    		    		this.loadFromCorpusTermRecords(records);
    		    	}
    		    },
    		    scope: this,
    		    params: {
    				limit: 10,
    				stopList: this.getApiParam("stopList")
    			}
        	});
    	}
    },
    
    loadFromQuery: function(query) {
    	var corpusCollocates = this.getCorpus().getCorpusCollocates({autoLoad: false});
    	this.setApiParams({
    		query: query,
    		mode: 'corpus'
    	})
    	corpusCollocates.load({
    		params: this.getApiParams(),
    		callback: function(records, operations, success) {
    			if (success) {
    				this.loadFromCorpusCollocateRecords(records);
    			}
    		},
    		scope: this
    	})
    },
    
    loadFromCorpusTermRecords: function(corpusTerms) {
    	if (Ext.isArray(corpusTerms) && corpusTerms.length>0) {
    		var terms = [];
    		corpusTerms.forEach(function(corpusTerm) {
    			terms.push(corpusTerm.getTerm())
    		});
    		this.loadFromCorpusTermStringsArray(terms)
    	}
    },
    
    loadFromCorpusTermStringsArray: function(corpusTermStringsArray) {
    	var corpusCollocates = this.getCorpus().getCorpusCollocates({autoLoad: false});
    	this.setApiParams({
    		query: corpusTermStringsArray,
    		mode: 'corpus'
    	})
    	corpusCollocates.load({
    		params: this.getApiParams(),
    		callback: function(records, operations, success) {
    			if (success) {
    				this.loadFromCorpusCollocateRecords(records);
    			}
    		},
    		scope: this
    	})
    },
    
    loadFromCorpusCollocateRecords: function(records) {
    	if (Ext.isArray(records)) {
    		var thisNodes = this.getNodes() || {};
    		var thisLinks = this.getLinks() || {};
    		var start = this.getApiParam('limit')
    		records.forEach(function(corpusCollocate) {
    			
    			var keywordNode = {term: corpusCollocate.getKeyword(), type: 'keyword', value: corpusCollocate.getKeywordRawFreq(), start: start};
    			var keywordNodeKey = [keywordNode.term,keywordNode.type].join(";")
    			if (thisNodes[keywordNodeKey]) {thisNodes[keywordNodeKey].value+=keywordNode.value}
    			else {thisNodes[keywordNodeKey]=keywordNode}
    			
    			var contextNode = {term: corpusCollocate.getContextTerm(), type: 'context', value: corpusCollocate.getContextTermRawFreq(), start: 0};
    			var contextNodeKey = [contextNode.term,contextNode.type].join(";")
    			if (thisNodes[contextNodeKey]) {thisNodes[contextNodeKey].value+=contextNode.value}
    			else {thisNodes[contextNodeKey]=contextNode}
    			
    			var linkKey = [keywordNodeKey,contextNodeKey].join("--");
    			if (!thisLinks[linkKey]) {thisLinks[linkKey]={source:thisNodes[keywordNodeKey],target:thisNodes[contextNodeKey]}}
    			
    		});
    		
    		this.updateNodesAndLinks(thisNodes, thisLinks);
    	}
    },
    
    initGraph: function() {
    	var el = this.getLayout().getRenderTarget();
    	el.update(""); // clear
    	var height = el.getHeight();
    	var width = el.getWidth();
    	this.setForce(d3.layout.force()
	        .nodes([])
	        .links([])
	        .charge(-50)
	        .linkDistance(120)
	        .size([width, height])
	        .on("tick", function() {
				  link.attr("x1", function(d) { return d.source.x; })
				      .attr("y1", function(d) { return d.source.y; })
				      .attr("x2", function(d) { return d.target.x; })
				      .attr("y2", function(d) { return d.target.y; });
          		node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	        }));
    	
    	var svg = d3.select(el.dom).append("svg")
	        .attr("width", width)
	        .attr("height", height);
    	this.setNode(svg.selectAll(".node"));
    	this.setLink(svg.selectAll(".link"));
    	
//    	this.start();
    },
    
    start: function() {
    	var force = this.getForce();
    	var drag = force.drag().on("dragstart", this.dragstart);
    	
    	  link = this.getLink().data(force.links(), function(d) { return d.source.term+d.source.type + "-" + d.target.term+d.source.type; });
    	  link.enter().insert("line", ".node").attr("class", "link");
    	  link.exit().remove();
    	  this.setLink(link);
    	  
    	  node = this.getNode().data(force.nodes(), function(d) { return d.term+d.type;});
//    	  node.enter().append("g").attr("class", function(d) { return "node " + d.id; }).attr("dx", 12).attr("dy", ".35em").call(this.getForce().drag)
    	  
    	  var keywordValues = force.nodes().filter(function(d) {return d.type=='keyword';}).map(function(d) {return d.value});
    	  var contextTermValues = force.nodes().filter(function(d) {return d.type=='context';}).map(function(d) {return d.value});
    	  var range = [8,20];
    	  var keywordFontSize = d3.scale.linear().domain([d3.min(keywordValues),d3.max(keywordValues)]).range(range);
    	  var contextFontSize = d3.scale.linear().domain([d3.min(contextTermValues),d3.max(contextTermValues)]).range(range);

    	  var me = this;
    	  var corpusColours = this.getCorpusColours();
    	  node.enter()
    	  	.append("text")
    	  		.attr("class", function(d) { return "node " + d.type; })
    	  		.attr("text-anchor", "middle")
    	  		.style("fill", function(d) {return corpusColours(d.type=='keyword' ? 1 : 2)})
    	  		.attr("dx", 12).attr("dy", ".35em")
    	  		.text(function(d) { return d.term })
    	  		.style("font-size", function(d) { return (d.type=='context' ? contextFontSize(d.value) : keywordFontSize(d.value))+"pt"; })
    	  		.on("dblclick", function() {
    	  			me.dragstart.apply(this, arguments); // freeze the word
    	  			me.itemdblclick.apply(me, arguments)} // load more words
    	  		)
    	  		.on("click", this.itemclick)
    	  		.on("mouseover", function(d) {
    	  			this.textContent=d.term+" ("+d.value+")"
    	  			d.wasfixed = d.fixed;
    	  			me.itemclick.apply(this, arguments);
    	  		})
    	  		.on("mouseout", function(d) {
    	  			this.textContent=d.term
    	  			d3.select(this).classed("fixed", d.fixed = d.wasfixed);
    			})
    	  		.call(drag);
    	  node.exit().remove();
    	  this.setNode(node);
    	  force.start();
    },
    
    dragstart: function(d) {
    	d.wasfixed=true;
    	d3.select(this).classed("fixed", d.fixed = true );
    },
    itemclick: function(d) {
//    	d3.select(this).classed("fixed", d.fixed = false);
    },
    itemdblclick: function(d) {
    	var limit = 10;
    	var corpusCollocates = this.getCorpus().getCorpusCollocates({autoLoad: false});
    	corpusCollocates.load({
    		params: Ext.apply(this.getApiParams(), {query: d.term, start: d.start, limit: limit}),
    		callback: function(records, operation, success) {
    			if (success) {
    	    		var thisNodes = this.getNodes() || {};
    	    		var thisLinks = this.getLinks() || {};
    	    		var start = this.getApiParam('limit')
	    			var keywordNode = d;
    	    		d.start+=limit;
	    			var keywordNodeKey = [keywordNode.term,keywordNode.type].join(";")
    	    		records.forEach(function(corpusCollocate) {
    	    			
    	    			var contextNode = {term: corpusCollocate.getContextTerm(), type: 'context', value: corpusCollocate.getContextTermRawFreq(), start: 0};
    	    			var contextNodeKey = [contextNode.term,contextNode.type].join(";")
    	    			if (thisNodes[contextNodeKey]) {thisNodes[contextNodeKey].value+=contextNode.value}
    	    			else {thisNodes[contextNodeKey]=contextNode}
    	    			
    	    			var linkKey = [keywordNodeKey,contextNodeKey].join("--");
    	    			if (!thisLinks[linkKey]) {thisLinks[linkKey]={source:thisNodes[keywordNodeKey],target:thisNodes[contextNodeKey]}}
    	    			
    	    		});
    	    		
    	    		this.updateNodesAndLinks(thisNodes, thisLinks);
    	    		
    			}
    		},
    		scope: this
    	})
    },
    
    updateNodesAndLinks: function(nodes, links) {
		this.setNodes(nodes);
		this.setLinks(links);
		this.getForce().nodes($.map(nodes, function(v) { return v; }));
		this.getForce().links($.map(links, function(v) { return v; }));
		this.start();
    }
    
})