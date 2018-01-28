Ext.define('Voyant.panel.WordWall', {
    extend: 'Ext.panel.Panel',
    mixins: ['Voyant.panel.Panel','Voyant.util.DiacriticsRemover'],
    alias: 'widget.wordwall',
    statics: {
        i18n: {
            title: 'Wall of Words',
            terms: 'Terms',
            scaling: 'Scaling',
            xStrength: 'X Strength',
            yStrength: 'Y Strength',
            chargeStrength: 'Charge Strength',
            chargeDistance: 'Charge Distance',
            delay: 'Fetch Delay',
            transition: 'Transition Speed',
            stop: 'Stop',
            start: 'Start'
        },
        api: {
            limit: 500,
            stopList: 'auto'
        },
        glyph: 'xf1e0@FontAwesome'
    },
    
    config: {
        visId: undefined,
        vis: undefined,
        simulation: undefined, // force layout
        nodes: undefined, // svg nodes
        tempNodes: undefined, // used to calculate text size and bounding boxes
        zoom: undefined,

        terms: undefined,
        segments: undefined,

        filterOutUniqueTerms: true, // whether to remove terms that don't appear in all segments

        currentSegment: undefined,
        segmentTerms: undefined,
        segmentTermsQueue: [],

        segmentDelay: 5000, // delay before displaying new segment data
        segmentDelayTimer: undefined,
        
        webWorker: undefined,
        isSimulating: false, // are we running a webworker simulation?
        
        transitionTime: 2000, // time to transition between old and new nodes
        isTransitioning: false, // are we transitioning between nodes?
        

        minFreq: undefined,
        maxFreq: undefined,
        letterDistribution: undefined,
        
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
    
    debugMsg: false,

    constructor: function(config) {
        this.mixins['Voyant.util.DiacriticsRemover'].constructor.apply(this, arguments);

        this.setVisId(Ext.id(null, 'wordwall_'));

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
                },this.localize('delay'),{
                    width: 50,
                    xtype: 'slider',
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
                },this.localize('transition'),{
                    width: 50,
                    xtype: 'slider',
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
                },this.localize('xStrength'),{
                    width: 50,
                    xtype: 'slider',
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
                },this.localize('yStrength'),{
                    width: 50,
                    xtype: 'slider',
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
                },this.localize('chargeStrength'),{
                    width: 50,
                    xtype: 'slider',
                    minValue: -1000,
                    maxValue: 0,
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
                },this.localize('chargeDistance'),{
                    width: 50,
                    xtype: 'slider',
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
        
        this.on('loadedCorpus', function(src, corpus) {
            if (this.isVisible()) {
                this.initLoad();
            }
        }, this);
        
        this.on('resize', function(panel, width, height) {
            var vis = Ext.get(this.getVisId());
            if (vis) {
                var el = this.body;//this.getLayout().getRenderTarget();
                var elHeight = el.getHeight();
                var elWidth = el.getWidth();
                
                vis.el.dom.setAttribute('width', elWidth);
                vis.el.dom.setAttribute('height', elHeight);
//                this.getSimulation()
//                    .force('x', d3.forceX(elWidth/2))
//                    .force('y', d3.forceY(elHeight/2));
            }
        }, this);
        
        this.callParent(arguments);
    },
    
    initVis: function() {
        var el = this.getLayout().getRenderTarget();
        el.update('');
        var width = el.getWidth();
        var height = el.getHeight();

        var svg = d3.select(el.dom).append('svg').attr('id',this.getVisId()).attr('class', 'wordWall').attr('width', width).attr('height', height);
        var g = svg.append('g');
        this.setVis(g);
        
        this.setNodes(g.append('g').attr('class', 'nodes').selectAll('.node'));

        this.setTempNodes(g.append('g').attr('class', 'tempNodes').selectAll('text'));

        if (this.getWebWorker() === undefined) {
            this.setWebWorker(new Worker(this.getBaseUrl()+'resources/d3/WordWallWorker.js'));
            this.getWebWorker().onmessage = this.handleWebWorkerMessage.bind(this);
        }
    },

    initLoad: function() {
        this.initVis();
        
        this.count = 0;

        var params = this.getApiParams();
        params.tool = 'corpus.CorpusSegmentTerms';
        
        Ext.Ajax.request({
            url: this.getTromboneUrl(),
            params: params,
            success: function(response) {
                var data = Ext.decode(response.responseText);
                this.setSegments(data.corpusSegmentTerms.segments);

                var terms = data.corpusSegmentTerms.terms;
                if (this.getFilterOutUniqueTerms()) {
                    terms = terms.filter(function(el, index) { return el.rawFreqs.indexOf(0) == -1 });
                }

                this.setTerms(terms);
                
                this.setCurrentSegment(this.getSegments().length);
                this.getNextSegment();

                this.restartSegmentTimer();
            },
            failure: function(response) {
                if (this.debugMsg) console.log('failed', response);
            },
            scope: this
        })
    },

    restartSegmentTimer: function() {
        clearInterval(this.getSegmentDelayTimer());

        this.setSegmentDelayTimer(setInterval(function() {
            this.updateNodePositions();
        }.bind(this), this.getSegmentDelay()));
    },

    getNextSegment: function() {
        var index = this.getCurrentSegment();
        index++;
        if (index >= this.getSegments().length) {
            index = 0;
        }
        this.setCurrentSegment(index);
        if (this.debugMsg) console.log('getNextSegment', index);
        this.processTermsForSegment(this.getCurrentSegment());
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

        this.setSegmentTerms(this.getTerms().filter(function(d) {
            return d.value > 0;
        }));

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

        this.calculateNodeSizes(this.getSegmentTerms());
        this.runSimulation(this.getSegmentTerms());
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
                var bbox = this.getBBox();
                d.bbox = {};
                d.bbox.x = bbox.x;
                d.bbox.y = bbox.y;
                d.bbox.width = bbox.width;
                d.bbox.height = bbox.height;

                bboxTotal += bbox.width*bbox.height;
            })
            .remove();

        var el = this.getLayout().getRenderTarget();
        var width = el.getWidth();
        var height = el.getHeight();

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

    runSimulation: function(terms) {
        this.setIsSimulating(true);

        var el = this.getLayout().getRenderTarget();
        var width = el.getWidth();
        var height = el.getHeight();

        // pass all the info to the worker
        if (this.debugMsg) console.time("runSim");
        this.getWebWorker().postMessage({
            terms: terms,
            width: width,
            height: height,
            minFreq: this.getMinFreq(),
            maxFreq: this.getMaxFreq(),
            xForceStrength: this.getXForceStrength(),
            yForceStrength: this.getYForceStrength(),
            chargeDistance: this.getChargeDistance(),
            chargeStrength: this.getChargeStrength(),
            letterDistribution: this.getLetterDistribution()
        });
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

                nodeEnter.append('title').text(function(d) { return d.title; });

                nodeEnter.append('text')
                    .attr('font-family', function(d) { return 'Arial'; })//return me.getApplication().getFeatureForTerm('font', d.term); })
                    .attr('font-size', function(d) { return d.fontSize; })
                    .attr('fill', function(d) { return this.getApplication().getFeatureForTerm('color', d.term); }.bind(this))
                    .style('cursor', 'pointer')
                    .style('user-select', 'none')
                    .attr('alignment-baseline', 'middle')
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

    updateMinFreq: function() {
        this.setFrequencyScale(d3.scaleLog().domain([this.getMinFreq(), this.getMaxFreq()]).range([0, 1]));
    },

    updateMaxFreq: function() {
        this.setFrequencyScale(d3.scaleLog().domain([this.getMinFreq(), this.getMaxFreq()]).range([0, 1]));
    },

    zoomToFit: function(paddingPercent, transitionDuration) {
    	var bounds = this.getVis().node().getBBox();
    	var width = bounds.width;
    	var height = bounds.height;
    	var midX = bounds.x + width/2;
    	var midY = bounds.y + height/2;
    	var svg = this.getVis().node().parentElement;
    	var fullWidth = svg.clientWidth;
    	var fullHeight = svg.clientHeight;
    	var scale = (paddingPercent || 0.8) / Math.max(width/fullWidth, height/fullHeight);
    	var translate = [fullWidth/2 - scale*midX, fullHeight/2 - scale*midY];
 
    	d3.select(svg)
    		.transition()
    		.duration(transitionDuration || 500)
    		.call(this.getZoom().transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale));
    },
    
    idGet: function(term) {
        return term.replace(/\W/g, '_');
    }
    
});