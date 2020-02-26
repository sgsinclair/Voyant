Ext.define('Voyant.panel.WordWall', {
    extend: 'Ext.panel.Panel',
    mixins: ['Voyant.panel.Panel','Voyant.util.DiacriticsRemover'],
    alias: 'widget.wordwall',
    statics: {
        i18n: {
            timing: 'Timing',
            forces: 'Forces',
            segment: 'Segment'
        },
        api: {
            limit: 150,
            stopList: 'auto'
        },
        glyph: 'xf1e0@FontAwesome'
    },
    
    config: {
        visId: undefined,
        visParent: undefined,

        // word wall
        simulation: undefined, // force layout
        nodes: undefined, // svg nodes
        tempNodes: undefined, // used to calculate text size and bounding boxes
        zoom: undefined,

        // line and bar charts
        lineX: undefined,
        lineY: undefined,
        chartLine: undefined,
        barX: undefined,
        barY: undefined,

        docTermsStore: undefined,

        currentTerm: undefined,

        terms: undefined,
        segments: undefined,

        filterOutUniqueTerms: true, // whether to remove terms that don't appear in all segments

        currentSegment: undefined, // the current segment index
        segmentTermsQueue: [], // stores the segment term positions, received from the web worker, then used to update term positions

        segmentDelay: 5000, // delay before displaying new segment data
        segmentDelayTimer: undefined,
        
        // simulation: undefined, // for running the sim normally, i.e. not in a webworker
        webWorker: undefined,
        isSimulating: false, // are we running a webworker simulation?
        
        transitionTime: 2000, // time to transition between old and new nodes
        isTransitioning: false, // are we transitioning between nodes?
        

        minFreq: undefined,
        maxFreq: undefined,
        letterDistribution: undefined, // used to arrange words alphabetically along the x axis
        
        frequencyScale: undefined,

        xForceStrength: 0.2,
        yForceStrength: 0.1,
        
        chargeStrength: -75,
        chargeDistance: 100,

        minFontSize: 7,
        maxFontSize: 60
    },

    count: 0,

    MIN_TERMS: 10,
    MAX_TERMS: 2000,
    
    MIN_SCALING: 1,
    MAX_SCALING: 20,
    
    debugMsg: true,

    constructor: function(config) {
        this.mixins['Voyant.util.DiacriticsRemover'].constructor.apply(this, arguments);

        this.setVisId(Ext.id(null, 'wordwall_'));

        this.callParent(arguments);
        this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
        Ext.apply(this, {
            title: this.localize('title'),
            layout: 'fit',
            items: [{
                itemId: 'wall',
                xtype: 'container',
                html: '<svg id="'+this.getVisId()+'"><g class="wordWall"/><g class="lineChart"/><g class="barChart"/></svg>'
            }],
            listeners: {
                resize: this.handleResize,
                scope: this
            },
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                items: [this.localize('terms'),{
                    width: 50,
                    xtype: 'slider',
                    minValue: this.MIN_TERMS,
                    maxValue: this.MAX_TERMS,
                    increment: 10,
                    listeners: {
                        render: function(slider) {
                            slider.setValue(this.getApiParam('limit'));
                        },
                        changecomplete: function(slider, newValue) {
                            this.setApiParam('limit', slider.getValue());
                            this.initLoad();
                        },
                        scope: this
                    }
                },{
                    xtype: 'button',
                    text: this.localize('timing'),
                    menu: {
                        width: 250,
                        defaults: {
                            labelAlign: 'right',
                            labelWidth: 120
                        },
                        items: [{
                            xtype: 'slider',
                            fieldLabel: this.localize('delay'),
                            minValue: 1,
                            maxValue: 60,
                            increment: 1,
                            listeners: {
                                render: function(slider) {
                                    slider.setValue(this.getSegmentDelay()/1000);
                                },
                                changecomplete: function(slider, newValue) {
                                    this.setSegmentDelay(slider.getValue()*1000);
                                    this.restartSegmentTimer();
                                },
                                scope: this
                            }
                        },{
                            xtype: 'slider',
                            fieldLabel: this.localize('transition'),
                            minValue: 100,
                            maxValue: 5000,
                            increment: 1,
                            listeners: {
                                render: function(slider) {
                                    slider.setValue(this.getTransitionTime());
                                },
                                changecomplete: function(slider, newValue) {
                                    this.setTransitionTime(slider.getValue());
                                },
                                scope: this
                            }
                        }]
                    }
                },{
                    xtype: 'button',
                    text: this.localize('forces'),
                    menu: {
                        width: 250,
                        defaults: {
                            labelAlign: 'right',
                            labelWidth: 120
                        },
                        items: [{
                            xtype: 'slider',
                            fieldLabel: this.localize('xStrength'),
                            minValue: 0,
                            maxValue: 1000,
                            increment: 10,
                            listeners: {
                                render: function(slider) {
                                    slider.setValue(this.getXForceStrength()*1000);
                                },
                                changecomplete: function(slider, newValue) {
                                    this.setXForceStrength(slider.getValue()/1000);
                                },
                                scope: this
                            }
                        },{
                            xtype: 'slider',
                            fieldLabel: this.localize('yStrength'),
                            minValue: 0,
                            maxValue: 1000,
                            increment: 10,
                            listeners: {
                                render: function(slider) {
                                    slider.setValue(this.getYForceStrength()*1000);
                                },
                                changecomplete: function(slider, newValue) {
                                    this.setYForceStrength(slider.getValue()/1000);
                                },
                                scope: this
                            }
                        },{
                            xtype: 'slider',
                            fieldLabel: this.localize('chargeStrength'),
                            minValue: -1000,
                            maxValue: 1000,
                            increment: 10,
                            listeners: {
                                render: function(slider) {
                                    slider.setValue(this.getChargeStrength());
                                },
                                changecomplete: function(slider, newValue) {
                                    this.setChargeStrength(slider.getValue());
                                },
                                scope: this
                            }
                        },{
                            xtype: 'slider',
                            fieldLabel: this.localize('chargeDistance'),
                            minValue: 0,
                            maxValue: 1000,
                            increment: 10,
                            listeners: {
                                render: function(slider) {
                                    slider.setValue(this.getChargeDistance());
                                },
                                changecomplete: function(slider, newValue) {
                                    this.setChargeDistance(slider.getValue());
                                },
                                scope: this
                            }
                        }]
                    }
                },{
                    xtype: 'progress',
                    text: this.localize('segment'),
                    itemId: 'segmentProgress',
                    width: 100
                },{
                    xtype: 'button',
                    text: this.localize('stop'),
                    handler: function(b) {
                        if (b.getText() === this.localize('stop')) {
                            clearInterval(this.getSegmentDelayTimer());
                            b.setText(this.localize('start'))
                        } else {
                            this.restartSegmentTimer();
                            b.setText(this.localize('stop'));
                        }
                    },
                    scope: this
                },{
                    itemId: 'status',
                    xtype: 'tbtext',
                    text: ''
                }]
            }]
        });
        
        this.on('boxready', function() {
            this.initVis();
            this.handleResize();
        }, this);

        this.on('loadedCorpus', function(src, corpus) {
            this.setDocTermsStore(corpus.getDocumentTerms({
    			proxy: {
	    			extraParams: {
						withDistributions: true
					}
    			},
				listeners: {
	   		    	 load: function(store, records, successful, options) {
                        // store the distributions for each
	   		    		records.forEach(function(record) {
                            var term = record.getTerm();
                            var match = this.getTerms().find(function(t) { return t.term === term; });
                            if (match.docFreqs === undefined) {
                                match.docFreqs = [];
                            }
                            match.docFreqs[record.getDocIndex()] = record.getDistributions();
                        }, this);

                        this.getLineY().domain([
                            d3.min(this.getTerms(), function(c) {
                                return d3.min(c.docFreqs, function(d) {
                                    return d3.min(d);
                                });
                            }),
                            d3.max(this.getTerms(), function(c) {
                                return d3.max(c.docFreqs, function(d) {
                                    return d3.max(d);
                                });
                            })
                        ]);

                        // this.updateChartLines();
	   				},
	   				scope: this
	   		     }
            }));
            
            if (this.isVisible()) {
                this.initLoad();
            }
        }, this);
        
        this.callParent(arguments);
    },

    initVis: function() {
        this.setVisParent(d3.select('#'+this.getVisId()));

        this.setSimulation(
            d3.forceSimulation()
            .on('tick', function() {
                this.getNodes().attr('transform', function(d) {
                    var width = this.getVisWidth();
                    var height = this.getVisHeight();
                    // constrain to window
                    d.x = Math.max(0, Math.min(width-d.bbox.width, d.x));
                    d.y = Math.max(d.bbox.height*0.5, Math.min(height-d.bbox.height, d.y));
                    
                    return 'translate('+d.x+','+d.y+')';
                }.bind(this))
            }.bind(this))
        );

        var g = this.getVisParent().select('g.wordWall');
        this.setNodes(g.append('g').attr('class', 'nodes').selectAll('.node'));
        this.setTempNodes(g.append('g').attr('class', 'tempNodes').selectAll('text'));

        this.setLineX(d3.scaleLinear());
        this.setLineY(d3.scaleLinear());
        this.setChartLine(
            d3.line()
                // .curve(d3.curveBasis)
                .x(function(d, index) {
                    return this.getLineX()(index);
                }.bind(this))
                .y(function(d, index) {
                    return this.getLineY()(d);
                }.bind(this))
        );

        this.setBarX(d3.scaleLinear());
        this.setBarY(d3.scaleLinear());

        if (this.getWebWorker() === undefined) {
            this.setWebWorker(new Worker(this.getBaseUrl()+'resources/d3/WordWallWorker.js'));
            this.getWebWorker().onmessage = this.handleWebWorkerMessage.bind(this);
        }
    },

    initLoad: function() {
        this.count = 0;

        var params = this.getApiParams();
        params.tool = 'corpus.CorpusSegmentTerms';
        
        Ext.Ajax.request({
            url: this.getTromboneUrl(),
            params: params,
            success: function(response) {
                var data = Ext.decode(response.responseText);
                var segs = data.corpusSegmentTerms.segments.map(function(d, i) {
                    return {
                        index: d['start-docIndex'],
                        count: d['end-position']-d['start-position']
                    }
                });
                if (this.debugMsg) console.log(segs);
                this.setSegments(segs);

                var terms = data.corpusSegmentTerms.terms;
                if (this.getFilterOutUniqueTerms()) {
                    terms = terms.filter(function(el, index) { return el.rawFreqs.indexOf(0) == -1 });
                }

                this.setTerms(terms);
                
                var docIds = [];
                this.getCorpus().getDocuments().each(function(doc) {
                    docIds.push(doc.getId());
                });
                var query = terms.map(function(t) { return t.term; });
                var bins = 10;
                this.getDocTermsStore().load({params: {
                    docId: docIds,
                    query: query,
                    widthDistributions: true,
                    bins: bins,
                    limit: docIds.length * query.length
                }});

                this.getLineX().domain([0, this.getSegments().length*bins]);
                
                this.getBarX().domain([0, this.getSegments().length]);
                this.getBarY().domain([0, d3.max(this.getSegments(), function(d) { return d.count; })]);

                // already done in handleResize
                // this.updateChartBars();

                this.handleResize();

                this.getNextSegment();
                this.restartSegmentTimer();
            },
            failure: function(response) {
                if (this.debugMsg) console.log('failed', response);
            },
            scope: this
        })
    },

    // show the chart line for the currentTerm
    updateCurrentTerm: function(term) {
        var chart = this.getVisParent().select('g.lineChart');
        chart.selectAll('.termLine path')
            .style('stroke', '#000')
            .style('stroke-width', 1)
            .style('stroke-opacity', 0);
        
        if (term !== undefined) {
            var chartTerm = chart.selectAll('.termLine').filter(function(d) { return d.id === term.id; });
            chartTerm.select('path')
                .style('stroke', '#000')
                .style('stroke-width', 1)
                .style('stroke-opacity', 1);
        }
    },

    updateChartLines: function() {
        if (this.getTerms() !== undefined) {
            var terms = this.getVisParent().select('g.lineChart').selectAll('.termLine')
                .data(this.getTerms());
            
            var termsEnter = terms.enter()
                .append('g')
                    .attr('class', 'termLine')
                    .append('path')
                        .attr('class', function(d) { return 'line '+d.term; })
                        .style('stroke', '#000')
                        .style('stroke-width', 1)
                        .style('stroke-opacity', 0)
                        .style('fill', 'none');
                    
            var allTerms = termsEnter.merge(terms);

            allTerms.select('path').attr('d', function(d) { return this.getChartLine()(d.docFreqs.reduce(function(a,b) { return a.concat(b); })); }.bind(this))
            
            terms.exit().remove(); // shouldn't be necessary
        }
    },

    updateChartBars: function(docs) {
        if (this.getSegments() !== undefined) {
            var segs = this.getVisParent().select('g.barChart').selectAll('.docBar').data(this.getSegments());

            var segsEnter = segs.enter()
                .append('rect')
                    .attr('class', 'docBar')
                    .style('stroke', 'none')
                    .style('fill', '#000')
                    .style('fill-opacity', 0.1);

            var allSegs = segsEnter.merge(segs);
            
            allSegs
                .attr('x', function(d) { return this.getBarX()(d.index); }.bind(this))
                .attr('y', function(d) { return this.getBarY()(d.count); }.bind(this))
                .attr('width', function(d) {
                    return this.getBarX()(d.index+1) - this.getBarX()(d.index);
                }.bind(this))
                .attr('height', function(d) {
                    return this.getBarY()(0) - this.getBarY()(d.count);
                }.bind(this));

            segs.exit().remove();
        }
    },

    handleResize: function() {
        var parent = Ext.get(this.getVisId()).parent('.x-container');
        var totalWidth = parent.getWidth();
        var totalHeight = parent.getHeight();

        var wallHeight = Math.round(totalHeight*0.85);
        var lineHeight = totalHeight-wallHeight;

        this.getVisParent().attr('width', totalWidth).attr('height', totalHeight);
        this.getVisParent().select('g.wordWall').attr('width', totalWidth).attr('height', wallHeight);
        this.getVisParent().select('g.lineChart').attr('width', totalWidth).attr('height', lineHeight).attr('transform', 'translate(0, '+wallHeight+')');
        this.getVisParent().select('g.barChart').attr('width', totalWidth).attr('height', lineHeight).attr('transform', 'translate(0, '+wallHeight+')');

        var paddingW = Math.min(15, totalWidth*0.1);
        var paddingH = Math.min(15, lineHeight*0.1);
        if (this.getLineX() !== undefined) this.getLineX().rangeRound([paddingW, totalWidth-paddingW]);
        if (this.getLineY() !== undefined) this.getLineY().rangeRound([lineHeight-paddingH, paddingH]);
        if (this.getBarX() !== undefined) this.getBarX().rangeRound([paddingW, totalWidth-paddingW]);
        if (this.getBarY() !== undefined) this.getBarY().rangeRound([lineHeight-paddingH, paddingH]);
        
        // this.updateChartLines();
        // this.updateChartBars();
    },


    /**
     * word wall methods
     */

    restartSegmentTimer: function() {
        clearInterval(this.getSegmentDelayTimer());

        this.setSegmentDelayTimer(setInterval(function() {
            this.getNextSegment();
        }.bind(this), this.getSegmentDelay()));
    },

    getNextSegment: function() {
        var index = this.getCurrentSegment();
        if (index === undefined) {
            index = 0;
        } else {
            index++;
            if (index >= this.getSegments().length) {
                index = 0;
            }
        }
        this.setCurrentSegment(index);
        if (this.debugMsg) console.log('getNextSegment', index);
    },

    updateCurrentSegment: function(value) {
        var progress = (value+1) / this.getSegments().length;
        this.down('#segmentProgress').setValue(progress);
        this.processTermsForSegment(value);
    },

    processTermsForSegment: function(segmentIndex) {
        var min = Number.MAX_VALUE;
        var max = Number.MIN_VALUE;
        var letterDistMap = {a:0,b:0,c:0,d:0,e:0,f:0,g:0,h:0,i:0,j:0,k:0,l:0,m:0,n:0,o:0,p:0,q:0,r:0,s:0,t:0,u:0,v:0,w:0,x:0,y:0,z:0};

        this.getTerms().forEach(function(d) {
            d.id = this.idGet(d.term);
            // d.value = d.rawFreqs.reduce(function(sum, value) {
            //     return sum+value;
            // });
            d.value = d.rawFreqs[segmentIndex];
            if (d.value > 0) {
                if (d.value < min) {
                    min = d.value;
                }
                if (d.value > max) {
                    max = d.value;
                }

                d.title = d.term+' ('+d.value+')';

                var firstLetter = this.removeDiacritics(d.term.charAt(0)).toLowerCase();
                d.letter = firstLetter;
                if (letterDistMap[firstLetter] === undefined) {
                    letterDistMap[firstLetter] = 0;
                }
                letterDistMap[firstLetter]++;
            }
        }, this);

        var filteredTerms = this.getTerms().filter(function(d) {
            return d.value > 0;
        });

        this.setMinFreq(min);
        this.setMaxFreq(max);

        var letterDist = [];
        for (var letter in letterDistMap) {
            var count = letterDistMap[letter];
            var percent = count / this.getTerms().length;
            letterDist.push({letter: letter, percent: percent});
        }
        letterDist.sort(function(a, b) {
            if (a.letter < b.letter) return -1;
            if (a.letter > b.letter) return 1;
            return 0;
        });
        this.setLetterDistribution(letterDist);

        this.restartSimulation(filteredTerms);
    },

    // determine each node's font size and bounding box and store them for later use
    calculateNodeSizes: function(terms) {
        var nodes = this.getTempNodes().data(terms, function(d) { return d.id; });
        
        var fontSizer = function(value) {
            var t = Math.min(1, terms.length / this.MAX_TERMS);
            var exponent = t*2+1;
            value = this.getFrequencyScale()(value);
            var val = d3.scalePow().exponent(exponent).domain([0, 1]).range([this.getMinFontSize(), this.getMaxFontSize()])(value);
            return val;
        }.bind(this);

        var bboxTotal = 0;

        nodes.enter().append('text')
            .attr('fill-opacity', 0)
            .attr('font-family', function(d) { return 'Arial'; })//return me.getApplication().getFeatureForTerm('font', d.term); })
            .attr('font-size', function(d) {
                var fontSize = fontSizer(d.value);
                d.fontSize = fontSize;
                return fontSize;
            })
            .text(function(d) { return d.term; })
            .each(function(d) {
                // store the values on the data object
                var bbox = this.getBBox();
                d.bbox = {};
                d.bbox.x = bbox.x;
                d.bbox.y = bbox.y;
                d.bbox.width = bbox.width;
                d.bbox.height = bbox.height;

                bboxTotal += bbox.width*bbox.height;
            })
            .remove(); // remove the temp text element

        var width = this.getVisWidth();
        var height = this.getVisHeight();

        // adapt font size to available space
        var availableSpace = width*height;
        if (bboxTotal > availableSpace*0.6) {
            this.setMaxFontSize(this.getMaxFontSize()*0.9);
            this.setMinFontSize(this.getMinFontSize()*0.9);
            this.calculateNodeSizes(terms);
        } else if (bboxTotal < availableSpace*0.5) {
            this.setMaxFontSize(this.getMaxFontSize()*1.1);
            this.setMinFontSize(this.getMinFontSize()*1.1);
            this.calculateNodeSizes(terms);
        }
    },

    // https://bl.ocks.org/mbostock/0adcc447925ffae87975a3a81628a196
    restartSimulation: function(terms) {
        this.calculateNodeSizes(terms);
        
        // starting positions
        terms.forEach(function(d) {
            if (d.x === undefined) {
                d.x = this.getXPosition(d);
                d.y = this.getYPosition(d);
            }
        }, this);

        var nodesUpdate = this.getNodes().data(terms, function(d) { return d.id; });

        nodesUpdate.exit().transition().duration(this.getTransitionTime()).attr('fill-opacity', 0).remove();

        var nodesEnter = nodesUpdate.enter()
            .append('g')
                .attr('class', 'node')
                .attr('id', function(d) { return d.id; })
                .attr('transform', function(d) {
                    console.log('adding', d.term)
                    return 'translate('+d.x+','+d.y+')';
                })
                .attr('fill-opacity', 0);

        nodesEnter.on('mouseover', function(d) {
            this.setCurrentTerm(d);
        }.bind(this));
        nodesEnter.on('mouseout', function(d) {
            this.setCurrentTerm(undefined);
        }.bind(this));

        nodesEnter
            .append('title')
                .text(function(d) { return d.title; });

        nodesEnter
            .append('text')
                .attr('font-family', function(d) { return 'Arial'; })//return me.getApplication().getFeatureForTerm('font', d.term); })
                .attr('font-size', function(d) { return d.fontSize; })
                .attr('fill', function(d) { return this.getApplication().getFeatureForTerm('color', d.term); }.bind(this))
                .style('cursor', 'pointer')
                .style('user-select', 'none')
                .attr('dominant-baseline', 'middle')
                .text(function(d) { return d.term; })

        nodesEnter.transition().duration(this.getTransitionTime()).attr('fill-opacity', 1);

        var allNodes = nodesEnter.merge(nodesUpdate);

        allNodes.select('text').transition().duration(this.getTransitionTime()).attr('font-size', function(d) { return d.fontSize; });

        this.setNodes(allNodes);

        this.getSimulation().nodes(terms);

        this.setForcesForSimulation();
    },

    getVisWidth: function() {
        return parseInt(this.getVisParent().attr('width'));
    },

    getVisHeight: function() {
        return parseInt(this.getVisParent().attr('height'));
    },

    getXPosition: function(d) {
        var width = this.getVisWidth();
        var letterDistribution = this.getLetterDistribution();
        var percentPosition = 0;
        for (var i = 0, len = letterDistribution.length; i < len; i++) {
            var letterData = letterDistribution[i];
            if (letterData.letter === d.letter) {
                percentPosition += letterData.percent/2;
                break;
            }
            percentPosition += letterData.percent;
        }

        var val = width * percentPosition;
        return val;
    },

    getYPosition: function(d) {
        var height = this.getVisHeight();
        var val = height*0.025 + Math.abs(this.getFrequencyScale()(d.value)-1)*(height*0.9);
        return val;
    },

    setForcesForSimulation: function() {
        var sim = this.getSimulation();
        if (sim !== undefined) {
            var minFreq = this.getMinFreq();
            var maxFreq = this.getMaxFreq();
            var xForceStrength = this.getXForceStrength();
            var yForceStrength = this.getYForceStrength();
            var chargeStrength = this.getChargeStrength();
            var chargeDistance = this.getChargeDistance();

            var that = this;
            sim
                .force('x',
                    d3.forceX(function(d) {
                        return that.getXPosition(d);
                    })
                    .strength(function(d) {
                        return d3.scaleLinear().domain([minFreq, maxFreq]).range([xForceStrength, xForceStrength*0.1])(d.value);
                    })
                )
                .force('y',
                    d3.forceY(function(d) {
                        return that.getYPosition(d);
                    })
                    .strength(function(d) {
                        return d3.scaleLinear().domain([minFreq, maxFreq]).range([yForceStrength, yForceStrength*0.1])(d.value);
                    })
                )
                .force('charge',
                    d3.forceManyBody().strength(function(d) {
                        return d3.scaleLinear().domain([minFreq, maxFreq]).range([chargeStrength, chargeStrength*10])(d.value);
                    })
                    .distanceMax(function(d) {
                        return d3.scaleLinear().domain([minFreq, maxFreq]).range([chargeDistance, chargeDistance*3])(d.value);
                    })
                )
                .force('collide',
                    d3.bboxCollide(function(d) {
                        return [[d.bbox.x, d.bbox.y], [d.bbox.x+d.bbox.width, d.bbox.y+d.bbox.height]];
                    }).strength(1).iterations(1)
                );

            sim.alpha(1).restart();
        }
    },

    handleWebWorkerMessage: function(event) {
        switch (event.data.type) {
            case "progress":
                var t = event.data.progress;
                var percent = parseInt(t * 100);
                this.getDockedItems()[1].getComponent('status').update(percent+'%');
                break;
            case "msg":
                if (this.debugMsg) console.log(event.data.msg);
                break;
            case "end":
                if (this.debugMsg) console.timeEnd("runSim");
                // TODO adjust segment delay if it's less than the runSim time
                this.getDockedItems()[1].getComponent('status').update('');
                this.setIsSimulating(false);
                // add new term positions to the end of the queue
                this.getSegmentTermsQueue().push(event.data.nodes);
                break;
        }
    },

    updateNodePositions: function() {
        if (this.getIsTransitioning()) {
            Ext.Function.defer(this.updateNodePositions, 100, this);
        } else {
            this.count++;
            var nodes = this.getSegmentTermsQueue().shift();
            if (this.debugMsg) console.log('queue length', this.getSegmentTermsQueue().length);
            if (nodes === undefined) {
                if (this.debugMsg) console.log('no nodes', this.count);
                if (this.getIsSimulating() === false) {
                    this.getNextSegment();
                }
            } else {
                this.setIsTransitioning(true);
                if (this.getSegmentTermsQueue().length == 0) {
                    this.getNextSegment();
                }
                
                var nodeUpdate = this.getNodes().data(nodes, function(d) { return d.id; });

                nodeUpdate.transition().duration(this.getTransitionTime()).attr('transform', function(d) {
                    var x = d.x;
                    var y = d.y;
                    return 'translate('+x+','+y+')';
                });

                var nodeEnter = nodeUpdate.enter().append('g')
                    .attr('class', 'node')
                    .attr('id', function(d) { return d.id; })
                    .attr('transform', function(d) {
                        var x = d.x;
                        var y = d.y;
                        return 'translate('+x+','+y+')';
                    })
                    .attr('fill-opacity', 0);

                nodeEnter.on('mouseover', function(d) {
                    this.setCurrentTerm(d);
                }.bind(this));
                nodeEnter.on('mouseout', function(d) {
                    this.setCurrentTerm(undefined);
                }.bind(this));

                nodeEnter.append('title').text(function(d) { return d.title; });

                nodeEnter.append('text')
                    .attr('font-family', function(d) { return 'Arial'; })//return me.getApplication().getFeatureForTerm('font', d.term); })
                    .attr('font-size', function(d) { return d.fontSize; })
                    .attr('fill', function(d) { return this.getApplication().getFeatureForTerm('color', d.term); }.bind(this))
                    .style('cursor', 'pointer')
                    .style('user-select', 'none')
                    .attr('dominant-baseline', 'middle')
                    .text(function(d) { return d.term; });

                nodeEnter.transition().duration(this.getTransitionTime()).attr('fill-opacity', 1);

                var allNodes = nodeEnter.merge(nodeUpdate);

                allNodes.select('text').transition().duration(this.getTransitionTime())
                    .attr('font-size', function(d) { return d.fontSize; });

                nodeUpdate.exit().transition().duration(this.getTransitionTime()).attr('fill-opacity', 0).remove();

                setTimeout(function() {
                    this.setIsTransitioning(false);
                }.bind(this), this.getTransitionTime());

                this.setNodes(allNodes);
            }
        }
    },

    updateXForceStrength: function() {
        this.setForcesForSimulation();
    },

    updateYForceStrength: function() {
        this.setForcesForSimulation();
    },

    updateChargeStrength: function() {
        this.setForcesForSimulation();
    },

    updateChargeDistance: function() {
        this.setForcesForSimulation();
    },

    updateMinFreq: function() {
        this.setFrequencyScale(d3.scaleLog().domain([this.getMinFreq(), this.getMaxFreq()]).range([0, 1]));
    },

    updateMaxFreq: function() {
        this.setFrequencyScale(d3.scaleLog().domain([this.getMinFreq(), this.getMaxFreq()]).range([0, 1]));
    },

    idGet: function(term) {
        return term.replace(/\W/g, '_');
    }
});