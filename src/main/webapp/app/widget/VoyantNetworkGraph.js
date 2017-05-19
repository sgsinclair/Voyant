Ext.define('Voyant.widget.VoyantNetworkGraph', {
    extend: 'Ext.panel.Panel',
    mixins: ['Voyant.util.Localization','Voyant.util.Api','Voyant.notebook.util.Embed'],
    embeddable: ['Voyant.widget.VoyantNetworkGraph'],
    alias: 'widget.voyantnetworkgraph',
    statics: {
        i18n: {
        },
        api: {
            jsonData: undefined,
            docId: undefined,
            docIndex: undefined,
            json: undefined
        }
    },
    config: {
        vis: undefined, // svg > g el
        visLayout: undefined, // layout algo
        
        nodeData: undefined,
        edgeData: undefined,
        
        nodeSelection: undefined, // d3 selection for nodes
        edgeSelection: undefined, // d3 selection for edges
        
        currentNode: undefined,
        currentEdge: undefined,
        
        scaleExtent: [0.25, 8],
        
        graphStyle: {
    		node: {
    			normal: {
    				fill: '#c6dbef',
    				stroke: '#6baed6'
    			},
    			highlight: {
    				fill: '#9ecae1',
    				stroke: '#3182bd'
    			}
    		},
    		edge: {
    			normal: {
    				stroke: '#000000',
    				strokeOpacity: 0.25
    			},
    			highlight: {
    				stroke: '#000000',
    				strokeOpacity: 0.5
    			}
    		}
    	}
    },
    constructor: function(config) {
        config = config || {};
        
        this.setNodeData([]);
        this.setEdgeData([]);
        
        this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
        this.callParent(arguments);
        
        var json = {};
        if (this.getApiParam('jsonData')) {
            json = Ext.decode(this.getApiParam('jsonData'));
        } else if (this.getApiParam('json')) {
        	json = this.getApiParam('json');
        } else if (config.json) {
        	json = config.json;
        } else if (config.edges) {
        	json.edges = config.edges;
        	if (config.nodes) {
        		json.nodes = config.nodes;
        	}
        }
        this.loadJson(json);
    },
    initComponent: function(config) {
        this.on('boxready', function(src, corpus) {
            this.initGraph();
            this.refreshGraph();
        }, this);
        
        this.on('resize', function(panel, width, height) {
            var vis = this.body.down('svg');
            if (vis) {
                var el = this.body;
                var elHeight = el.getHeight();
                var elWidth = el.getWidth();
                vis.dom.setAttribute('width', elWidth);
                vis.dom.setAttribute('height', elHeight);
                this.getVisLayout()
                    .force('center', d3.forceCenter(elWidth/2, elHeight/2))
                    .alpha(0.3).restart();
            }
        }, this);
        
        this.callParent(arguments);
    },
    
    processJson: function(json) {
    	if (!json || !json.edges) {
            if (json && json.links) {
                json.edges = json.links;
                delete json.links;
            }
            if (!json || !json.edges) {
                json = json || {};
                json.edges = [];
            }
        }
    	if (!json.nodes) {
    		json.nodes = [];
    	}
        if (json.nodes.length === 0) {
            var wordFreq = {};
            json.edges.forEach(function(edge) {
                ['source', 'target'].forEach(function(loc) {
                	var term = edge[loc];
                    if (term in wordFreq == false) {
                        wordFreq[term] = 1;
                        json.nodes.push({term: term});
                    } else {
                        wordFreq[term]++;
                    }
                    edge.value = 1;
                });
            }, this);
            json.nodes.forEach(function(node) {
                Ext.applyIf(node, {value: wordFreq[node.term]});
            });
        }
        
        return json;
    },
    
    loadJson: function(json) {
    	this.processJson(json);
    	
    	var existingTerms = {};
		this.getNodeData().forEach(function(node) {
			existingTerms[node.term] = true;
		}, this);
		
    	var newNodes = [];
    	var newEdges = [];
    	
    	json.nodes.forEach(function(node) {
            if (existingTerms[node.term] === undefined) {
            	node.id = this.idGet(node.term);
            	newNodes.push(node);
            }
        }, this);
        json.edges.forEach(function(newedge) {
            var sourceId = this.idGet(newedge.source);
            var targetId = this.idGet(newedge.target);
            var edges = this.getEdgeData();
            var exists = false;
            for (var i = 0; i < edges.length; i++) {
            	var edge = edges[i];
            	if ((edge.source.id == sourceId && edge.target.id == targetId) || (edge.target.id == sourceId && edge.source.id == targetId)) {
            		exists = true;
            		break;
            	}
            }
            if (!exists) {
            	newedge.source = sourceId;
            	newedge.target = targetId;
            	newedge.id = sourceId+'-'+targetId;
	            newEdges.push(newedge);
            }
        }, this);
        
        this.setNodeData(this.getNodeData().concat(newNodes));
        this.setEdgeData(this.getEdgeData().concat(newEdges));
        
        this.refreshGraph();
    },
    
    // get a DOM appropriate id
    idGet: function(term) {
    	return term.replace(/\W/g, '_');
    },
    
    updateDataForNode: function(nodeId, dataObj) {
    	var data = this.getNodeData();
		for (var i = 0; i < data.length; i++) {
			if (data[i].id === nodeId) {
				Ext.apply(data[i], dataObj);
				break;
			}
		}
    },
    
    updateDataForEdge: function(edgeId, dataObj) {
    	var data = this.getEdgeData();
		for (var i = 0; i < data.length; i++) {
			if (data[i].id === edgeId) {
				Ext.apply(data[i], dataObj);
				break;
			}
		}
    },
    
    removeNode: function(nodeId) {
    	var data = this.getNodeData();
		for (var i = 0; i < data.length; i++) {
			if (data[i].id === nodeId) {
				data.splice(i, 1);
				break;
			}
		}
		
		data = this.getEdgeData();
		for (var i = data.length-1; i >= 0; i--) {
			if (data[i].source.id === nodeId || data[i].target.id === nodeId) {
				data.splice(i, 1);
			}
		}
		
		this.refreshGraph();
    },
    
    initGraph: function() {
        var el = this.getLayout().getRenderTarget();
        el.update('');
        var width = el.getWidth();
        var height = el.getHeight();
        
        this.setVisLayout(d3.forceSimulation()
    		.force('center', d3.forceCenter(width/2, height/2))
            .force('link', d3.forceLink().id(function(d) { return d.id; }).distance(30).strength(1))
            .force('charge', d3.forceManyBody().strength(-1))
            .force('collide', d3.forceCollide(function(d) { return Math.sqrt(d.bbox.width * d.bbox.height)*2; }))
            .on('tick', function() {
            	 this.getEdgeSelection()
	                .attr('x1', function(d) { return d.source.x; })
	                .attr('y1', function(d) { return d.source.y; })
	                .attr('x2', function(d) { return d.target.x; })
	                .attr('y2', function(d) { return d.target.y; });
	    
            	 this.getNodeSelection()
            	 	.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
	        }.bind(this)
        ));
        
        var svg = d3.select(el.dom).append('svg').attr('width', width).attr('height', height);
        var g = svg.append('g');
        
        svg.call(d3.zoom().scaleExtent(this.getScaleExtent()).on('zoom', function() {
            g.attr('transform', d3.event.transform);
        }));
        
        this.setEdgeSelection(g.append('g').attr('class', 'links').selectAll('.link'));
        this.setNodeSelection(g.append('g').attr('class', 'nodes').selectAll('.node'));
        this.setVis(g);
    },
    
    resetGraph: function() {
	    this.setNodeData([]);
		this.setEdgeData([]);
		this.refreshGraph();
    },
    
    refreshGraph: function() {
    	if (this.getVisLayout() === undefined) return;
    	
        var edgeData = this.getEdgeData();
        var nodeData = this.getNodeData();
        
        var edge = this.getEdgeSelection().data(edgeData, function(d) { return d.id; });
        edge.exit().remove();
        var edgeEnter = edge.enter().append('line')
        	.attr('class', 'link')
        	.attr('id', function(d) { return d.id; })
        	.on('click', function(d) {
        		d3.event.stopImmediatePropagation();
				d3.event.preventDefault();
				this.fireEvent('linkclick', this, d);
        	}.bind(this));
        
        this.setEdgeSelection(edgeEnter.merge(edge));
        
        var node = this.getNodeSelection().data(nodeData, function(d) { return d.id; });
        node.exit().remove();
        var nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr('id', function(d) { return d.id; })
            .style('cursor', 'pointer')
            .on('click', function(d) {
				d3.event.stopImmediatePropagation();
				d3.event.preventDefault();
				this.fireEvent('nodeclick', this, d);
			}.bind(this))
            .call(d3.drag()
                .on('start', function(d) {
                    if (!d3.event.active) this.getVisLayout().alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                    d.fixed = true;
                    this.fireEvent('dragstart', this, d);
            	}.bind(this))
                .on('drag', function(d) {
                    d.fx = d3.event.x;
                    d.fy = d3.event.y;
                    this.fireEvent('drag', this, d);
                }.bind(this))
                .on('end', function(d) {
                	if (!d3.event.active) this.getVisLayout().alphaTarget(0);
                	if (d.fixed != true) {
                		d.fx = null;
                		d.fy = null;
                	}
                	this.fireEvent('dragend', this, d);
                }.bind(this))
            );

        nodeEnter.append('circle').attr('r', 5);
        
        var vals = nodeData.map(function(d) {
            var val = d.value;
            if (d.value == undefined) {
                d.value = val = 1;
            }
            return val;
        });
        vals.sort();

        var fontscale = d3.scaleLog()
            .domain([vals[0], vals[vals.length-1]])
            .range([8, 36]);
                
        nodeEnter.append('text')
            .attr('dx', 0)
            .attr('dy', 0)
            .text(function(d) { return d.term; })
            .attr('font-size', function(d) {return fontscale(d.value)+'px';})
            .attr('text-anchor', 'middle')
            .style('user-select', 'none')
			.attr('alignment-baseline', 'middle')
            .each(function(d) { d.bbox = this.getBBox(); });
        
        this.setNodeSelection(nodeEnter.merge(node));

        this.getVis().selectAll('line').call(this.applyEdgeStyle.bind(this));
        this.getVis().selectAll('circle').call(this.applyNodeStyle.bind(this));
        
        this.getVisLayout().nodes(nodeData);
        this.getVisLayout().force('link').links(edgeData);
        this.getVisLayout().alpha(1).restart();
    },
    
    applyNodeStyle: function(sel, nodeState) {
		var state = nodeState === undefined ? 'normal' : nodeState;
    	sel.style('fill', function(d) { return this.getGraphStyle().node[state].fill; }.bind(this));
    	sel.style('stroke', function(d) { return this.getGraphStyle().node[state].stroke; }.bind(this));
    },
    
    applyEdgeStyle: function(sel, edgeState) {
    	var state = edgeState === undefined ? 'normal' : edgeState;
    	sel.style('stroke', function(d) { return this.getGraphStyle().edge[state].stroke; }.bind(this));
    	sel.style('stroke-opacity', function(d) { return this.getGraphStyle().edge[state].strokeOpacity; }.bind(this));
    }
});