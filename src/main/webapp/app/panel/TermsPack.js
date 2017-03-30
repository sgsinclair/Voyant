Ext.define('Voyant.panel.TermsPack', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.termspack',
    statics: {
    	i18n: {
    	},
    	api: {
    		stopList: 'auto',
    		limit: 50,
    		query: undefined,
    		docIndex: undefined,
    		docId: undefined
    	},
		glyph: 'xf201@FontAwesome'
    },
    config: {
    	options: [{xtype: 'stoplistoption'}],
    	
    	mode: undefined,
    	
    	initialTerms: undefined,
    	
    	maxCollocateValue: -1,
    	
    	queryQueue: undefined,
    	queryQueueDelay: 10,
    	
    	visLayout: undefined,
    	vis: undefined,
    	visLabel: undefined,
    	visId: undefined,
    	
    	tip: undefined
	},
    
	MODE_CORPUS: 'corpus',
    MODE_DOCUMENT: 'document',
	
    layout: 'fit',
    
    constructor: function(config) {
    	this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
    	this.setVisId(Ext.id(null, 'termspack_'));
    },
    
    initComponent: function() {
    	Ext.apply(this, {
    		title: this.localize('title')
//    		,dockedItems: [{
//                dock: 'bottom',
//                xtype: 'toolbar',
//                overflowHandler: 'scroller',
//                items: [{
//        			xtype: 'corpusdocumentselector',
//        			singleSelect: true
//        		}]
//    		}]
    	});
    	
    	this.callParent(arguments);
    },
    
    listeners: {
    	afterrender: function() {
    		
    	},
    	
    	boxready: function() {
			this.initVisLayout();
    	},
    	
    	resize: function(panel, width, height) {
    		if (this.getVisLayout() && this.getCorpus()) {

    			var el = this.getLayout().getRenderTarget();
    	    	width = el.getWidth();
    			height = el.getHeight();
    			
    			el.down('svg').set({width: width, height: height});
//    			if (this.getTerms()) {
//        			this.getVisLayout().size([width, height]).stop().words(this.getTerms()).start();
//    			}
    		}
    	},
    	
    	loadedCorpus: function(src, corpus) {
    		this.initVisLayout();

    		this.loadFromCorpus(corpus);
    	}
    },
    
    loadFromCorpus: function(corpus) {
    	this.setApiParams({docId: undefined, docIndex: undefined});
    	var corpusTerms = corpus.getCorpusTerms();
    	corpusTerms.load({
    		params: {
 				limit: 5,
 				stopList: this.getApiParam("stopList")
 			},
		    callback: function(records, operation, success) {
		    	if (success) {
		    		var terms = {};
		    		records.forEach(function(r) {
		    			terms[r.getTerm()] = null;
		    		});
		    		this.setInitialTerms(terms);
		    		this.loadFromRecords(records, true);
		    	}
		    },
		    scope: this
    	});
    },
    
    loadFromRecords: function(records, isInitial) {
    	if (Ext.isArray(records) && records.length>0) {
    		var terms = [];
    		records.forEach(function(r) {
    			terms.push(r.getTerm());
    		});
    		
    		if (isInitial) {
				terms.forEach(function(t) {
					this.loadFromQuery(t, true);
				}, this);
    		} else {
	    		this.setQueryQueue(terms);
	    		this.processQueryQueue();
    		}
    	}
    },
    
    processQueryQueue: function() {
    	var queue = this.getQueryQueue();
    	if (queue !== undefined && queue.length > 0) {
    		var query = queue.shift();
    		this.loadFromQuery(query);
    		this.getVisLabel().text(queue.length);
    	} else {
    		this.getVisLabel().text('');
    	}
    },
    
    loadFromQuery: function(query, isInitial) {
    	this.setApiParams({
    		mode: 'corpus'
    	});
    	var params = this.getApiParams();
    	this.getCorpus().getCorpusCollocates().load({
    		params: Ext.apply(Ext.clone(params), {query: query}),
    		callback: function(records, op, success) {
    			if (success) {
	    			if (isInitial) {
	    				var term = records[0].getTerm();
	    				this.getInitialTerms()[term] = records;
	    				
	    				var done = true;
	    				for (var t in this.getInitialTerms()) {
	    					if (this.getInitialTerms()[t] === null) {
	    						done = false;
	    						break;
	    					}
	    				}
	    				
	    				if (done) {
	    					var combinedRecords = [];
	    					for (var key in this.getInitialTerms()) {
	    						combinedRecords = combinedRecords.concat(this.getInitialTerms()[key]);
	    					}
	    					this.addRecordsToVis(combinedRecords, isInitial);
	    					
	    					var queue = [];
	    					for (var i = 0; i < combinedRecords.length; i++) {
	    						var cterm = combinedRecords[i].getContextTerm();
	    						queue.push(cterm);
	    					}
	    					var qq = this.getQueryQueue();
	    					if (qq != undefined) {
	    						queue = qq.concat(queue);
	    					}
	    					this.setQueryQueue(queue);
	    					this.processQueryQueue();
	    					
	    				}
	    			} else {
	    				this.addRecordsToVis(records);
						Ext.defer(this.processQueryQueue, this.getQueryQueueDelay(), this);
	    			}
    			}
    		},
    		scope: this
    	});
    },
    
    addRecordsToVis: function(records, isInitial) {
    	function getRootValue(val) {
    		return Math.pow(val, 1/2);
    	}
    	
    	var currentTerms = {};
    	this.getVis().selectAll('.node').data().forEach(function(d, i) {
    		if (d.term) currentTerms[d.term] = d;
    	});
    	
    	var max = this.getMaxCollocateValue();
    	
    	for (var i=0; i<records.length; i++) {
    		var r = records[i];
    		var term = r.getTerm();
			var contextTerm = r.getContextTerm();
			var termFreq = r.getKeywordRawFreq();
			var contextFreq = r.getContextTermRawFreq();
			
			if (contextFreq > max) {
				max = contextFreq;
			}
			
			if (isInitial) {
	//    		if (i == 0) {
	    			if (currentTerms[term] === undefined) {
	    				currentTerms[term] = {
	    	    			term: term,
	    	    			freq: termFreq,
	    	    			value: getRootValue(termFreq),
	    	    			collocates: []
	    				};
	    			}
	//    		}
	    		if (term != contextTerm) {
	    			if (currentTerms[contextTerm] === undefined) {
	    				currentTerms[contextTerm] = {
	    	    			term: contextTerm,
	    	    			freq: contextFreq,
	    	    			value: getRootValue(contextFreq),
	    	    			collocates: []
	    				};
	    			}
	    			currentTerms[term].collocates.push({
	    				term: contextTerm, value: contextFreq
	    			});
	    		}
			} else {
				if (term != contextTerm && currentTerms[term] && currentTerms[contextTerm]) {
					currentTerms[term].collocates.push({
	    				term: contextTerm, value: contextFreq
	    			});
				}
			}
    	}
    	
    	this.setMaxCollocateValue(max);
    	
    	var data = [];
    	for (var term in currentTerms) {
    		data.push(currentTerms[term]);
    	}
    	
    	// compute node xy
    	var processedData = this.getVisLayout().nodes({children: data, collocates:[], term: null});
    	// join nodes with data
    	var nodes = this.getVis().selectAll('.node').data(processedData, function(d) { return d.term; } ); // use term as key
    	
    	// update
    	nodes//.transition().duration(transDuration)
			.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
    	
    	var me = this;
    	
    	// enter
    	var g = nodes.enter().append('g')
    		.attr('class', 'node')
    		.style('visibility', function(d) { return d.depth > 0 ? 'visible' : 'hidden'; }) // hide root
    		.attr('opacity', 1e-6)
    		.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
    		.on('mouseover', function(d, i) {
    			me.resetCircles();
    			
    			d3.select(this).select('circle').style('fill', '#89e1c2');
    			
				var tip = me.getTip();
				tip.update(d.term+': '+d.collocates.length);
				tip.show();
				
				var fill = d3.scale
					.pow().exponent(1/3)
					.domain([0,me.getMaxCollocateValue()]).range(['#ffffff', '#bd3163']);
				for (var i = 0; i < d.collocates.length; i++) {
					var collocate = d.collocates[i];
					me.getVis().selectAll('.node').filter(function(d) { return d.term === collocate.term; }).select('circle')
						.style('fill', function(d) { return fill(collocate.value); })
						.style('stroke-width', 2);
				}
			})
			.on('mousemove', function() {
				var container = Ext.get(me.getVisId()).dom;
				var coords = d3.mouse(container);
				coords[1] += 40;
				me.getTip().setPosition(coords);
			})
			.on('mouseout', function() {
				me.resetCircles();
				me.getTip().hide();
			});
		g.append('circle')
			.attr('r', function(d) { return d.r; })
			.style('fill', '#ffffff')
			.style('stroke', '#314b8b')
			.style('stroke-width', 1);
		g.append('text')
			.style('text-anchor', 'middle')
			.text(function(d) { return d.term; });
		
		g//.transition().duration(transDuration)
		.attr('opacity', 1);
		
		// exit
    	nodes.exit()//.transition().duration(transDuration)
    	.style('opacity', 1e-6).remove();
		
    },
    
    resetCircles: function() {
    	this.getVis().selectAll('circle').style('fill', '#ffffff').style('stroke-width', 1);
    },
    
    initVisLayout: function() {
    	var el = this.getLayout().getRenderTarget();
		el.update(''); // make sure to clear existing contents (especially for re-layout)
    	var width = el.getWidth();
		var height = el.getHeight();
		
		this.setVisLayout(
			d3.layout.pack()
				.size([width, height])
				.padding(1.5)
		);
		
		var svg = d3.select(el.dom).append('svg').attr('id',this.getVisId()).attr('width', width).attr('height', height);
		this.setVis(svg.append('g'));
		this.setVisLabel(svg.append('text').attr('transform', 'translate(25, 25)'));
		
		if (this.getTip() === undefined) {
			this.setTip(Ext.create('Ext.tip.Tip', {}));
		}
    }
});