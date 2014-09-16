Ext.define('Voyant.panel.CollocatesGraph', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.collocatesgraph',
    statics: {
    	i18n: {
    		title: {en: "Collocates Graph"}
    	},
    	api: {
    		limit: 5,
    		stopList: 'auto',
    		terms: undefined
    	}
    },
    
    config: {
    	corpus: undefined,
    	node: undefined,
    	link: undefined,
    	nodes: undefined,
    	links: undefined,
    	force: undefined
    },

    constructor: function(config) {

        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);

    },
    
    initComponent: function() {
        var me = this;

        Ext.apply(me, {
    		title: this.localize('title'),
    		listeners: {
    			loadedCorpus: {
    				fn: function(src, corpus) {
	    				this.setCorpus(corpus);
	    				this.initGraph();
	    				return
	    				var corpusTerms = corpus.getCorpusTerms({
	    					leadingBufferZone: 0,
	    					autoLoad: false
	    				});
	            		corpusTerms.load({
	            		    callback: function(records, operation, success) {
	            		    	if (success && records.length>0) {
//	            		    		this.setApiParam("query", records[0].getTerm());
//	            		    		this.getStore().load({params: this.getApiParams()});
	            		    	}
	            		    },
	            		    scope: me,
	            		    params: {
	            				limit: 5,
	            				stopList: this.getApiParam("stopList")
	            			}
	                	});
	    			},
	    			scope: this
    			}
    		}
        })
        
        me.callParent(arguments);

    },
    
    initGraph: function() {
    	var el = this.getLayout().getRenderTarget();
    	el.update(""); // clear
    	var height = el.getHeight();
    	var width = el.getWidth();
    	this.setNodes([]);
    	this.setLinks([]);
    	this.setForce(d3.layout.force()
	        .nodes(this.getNodes())
	        .links(this.getLinks())
	        .charge(-400)
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
    	this.setLink(svg.selectAll(".link"))
    	
    	var a = {id: "a"}, b = {id: "b"}, c = {id: "c"};
    	this.getNodes().push(a,b,c);
    	this.getLinks().push({source: a, target: b}, {source: a, target: c}, {source: b, target: c});
    	
    	this.start();
    },
    
    start: function() {
    	var force = this.getForce();
    	var drag = force.drag().on("dragstart", this.dragstart);
    	
    	  link = this.getLink().data(force.links(), function(d) { return d.source.id + "-" + d.target.id; });
    	  link.enter().insert("line", ".node").attr("class", "link");
    	  link.exit().remove();
    	  this.setLink(link);
    	  node = this.getNode().data(force.nodes(), function(d) { return d.id;});
//    	  node.enter().append("g").attr("class", function(d) { return "node " + d.id; }).attr("dx", 12).attr("dy", ".35em").call(this.getForce().drag)
    	  node.enter().
    	  	append("text")
    	  		.attr("class", function(d) { return "node " + d.id; })
    	  		.attr("dx", 12).attr("dy", ".35em")
    	  		.text(function(d) { return d.id })
    	  		.on("dblclick", this.dblclick)
    	  		.call(drag)
//    	  node.enter().append("g").attr("class", function(d) { return "node " + d.id; }).attr("r", 8);
//    	  node.exit()
//    	  node.enter().append("text").attr("class", function(d) { return "node " + d.id; }).attr("dx", 12).attr("dy", ".35em").text(function(d) { return "test"; d.name });
    	  node.exit().remove();
    	  this.setNode(node);
    	  force.start();
    },
    
    dragstart: function(d) {
    	d3.select(this).classed("fixed", d.fixed = true);
    },
    dblclick: function(d) {
    	d3.select(this).classed("fixed", d.fixed = false);
    }
    
})