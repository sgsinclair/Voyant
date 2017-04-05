Ext.define('Voyant.panel.TermsBerry', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.termsberry',
    statics: {
    	i18n: {
    		tfidf: 'tf-idf',
    		inDocs: 'In Docs'
    	},
    	api: {
    		stopList: 'auto',
    		context: 2,
        	numInitialTerms: 75,
    		query: undefined,
    		docIndex: undefined,
    		docId: undefined
    	},
		glyph: 'xf201@FontAwesome'
    },
    config: {
    	options: [{xtype: 'stoplistoption'}],
    	
    	mode: undefined,
    	
    	collocatesLimit: 1000000, // a very large number so we get all of them
    	scalingFactor: 3,
    	
    	minRawFreq: undefined,
    	maxRawFreq: undefined,
    	maxCollocateValue: undefined,
    	minFillValue: undefined,
    	maxFillValue: undefined,
    	
    	currentData: {},
    	
    	visLayout: undefined,
    	vis: undefined,
    	visInfo: undefined,
    	visId: undefined,
    	
    	tip: undefined
	},
    
	MODE_TOP: 'top',
    MODE_DISTINCT: 'distinct',
    
    MIN_TERMS: 5,
    MAX_TERMS: 500,
    
    MIN_SCALING: 1,
    MAX_SCALING: 5,
    
    MIN_STROKE_OPACITY: 0.1,
	MAX_STROKE_OPACITY: 0.3,
	
    layout: 'fit',
    
    constructor: function(config) {
    	this.setMode(this.MODE_TOP);
    	
    	this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
    	this.setVisId(Ext.id(null, 'termspack_'));
    },
    
    initComponent: function() {
    	Ext.apply(this, {
    		title: this.localize('title'),
    		dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                items: [{
                	xtype: 'button',
                	text: this.localize('strategy'),
                	menu: {
	                	items: [{
	                		xtype: 'menucheckitem',
	                		group: 'strategy',
	                		checked: this.getMode() === this.MODE_TOP,
	                		text: this.localize('topTerms'),
	                		checkHandler: function(item, checked) {
	                			if (checked) {
	                				this.setMode(this.MODE_TOP);
	                				this.doLoad();
	                			}
	                		},
	                		scope: this
	                	},{
	                		xtype: 'menucheckitem',
	                		group: 'strategy',
	                		checked: this.getMode() === this.MODE_DISTINCT,
	                		text: this.localize('distinctTerms'),
	                		checkHandler: function(item, checked) {
	                			if (checked) {
	                				this.setMode(this.MODE_DISTINCT);
	                				this.doLoad();
	                			}
	                		},
	                		scope: this
	                	}]
                	}
                },{
	                fieldLabel: this.localize('numTerms'),
	    			labelWidth: 50,
	    			labelAlign: 'right',
	    			width: 120,
	    			xtype: 'slider',
	            	increment: 1,
	            	minValue: this.MIN_TERMS,
	            	maxValue: this.MAX_TERMS,
	            	listeners: {
	            		afterrender: function(slider) {
	            			slider.setValue(parseInt(this.getApiParam('numInitialTerms')));
	            		},
	            		changecomplete: function(slider, newvalue) {
	            			this.setApiParam("numInitialTerms", newvalue)
	            			this.doLoad();
	            		},
	            		scope: this
	            	}
                },{
	                fieldLabel: this.localize('context'),
	    			labelWidth: 50,
	    			labelAlign: 'right',
	    			width: 120,
	    			xtype: 'slider',
	            	increment: 1,
	            	minValue: 1,
	            	maxValue: 30,
	            	listeners: {
	            		afterrender: function(slider) {
	            			slider.setValue(this.getApiParam('context'));
	            		},
	            		changecomplete: function(slider, newvalue) {
	            			this.setApiParams({context: newvalue});
	            			this.doLoad();
	            		},
	            		scope: this
	            	}
                },{
	                fieldLabel: this.localize('scaling'),
	    			labelWidth: 50,
	    			labelAlign: 'right',
	    			width: 120,
	    			xtype: 'slider',
	            	increment: 1,
	            	minValue: this.MIN_SCALING,
	            	maxValue: this.MAX_SCALING,
	            	listeners: {
	            		afterrender: function(slider) {
	            			slider.setValue(this.getScalingFactor());
	            		},
	            		changecomplete: function(slider, newvalue) {
	            			// use the inverse of the value since it'll make more sense to the user
	            			var value = Math.abs(newvalue-(this.MAX_SCALING+1));
	            			
	            			this.setScalingFactor(value);
	            			
	            			this.getVisLayout().value(function(d) { return Math.pow(d.rawFreq, 1/value); });
	            			
	            			var data = this.processRecordsForVis([]);
	            			this.resetVis();
	            			this.buildVisFromData(data);
	            		},
	            		scope: this
	            	}
                }
                ]
    		}]
    	});
    	
    	this.callParent(arguments);
    },
    
    listeners: {
    	boxready: function() {
			this.initVisLayout();
    	},
    	
    	resize: function(panel, width, height) {
    		if (this.getVisLayout() && this.getCorpus()) {
    			var el = this.getLayout().getRenderTarget();
    	    	width = el.getWidth();
    			height = el.getHeight();
    			
    			el.down('svg').set({width: width, height: height});
    			
    			this.getVisLayout().size([width, height]);
    			
    			var data = this.processRecordsForVis([]);
    			if (data.length > 0) {
	    			this.resetVis();
	    			this.buildVisFromData(data);
    			}
    		}
    	},
    	
    	loadedCorpus: function(src, corpus) {
    		this.doLoad();
    	}
    },
    
    doLoad: function() {
		this.resetVis();
		this.resetMinMax();
		this.setCurrentData({});
    	if (this.getMode() === this.MODE_DISTINCT) {
    		this.getDistinctTerms();
    	} else {
    		this.getTopTerms();
    	}
    },
    
    resetMinMax: function() {
    	this.setMinRawFreq(undefined);
    	this.setMaxRawFreq(undefined);
    	this.setMaxCollocateValue(undefined);
    	this.setMinFillValue(undefined);
    	this.setMaxFillValue(undefined);
    },
    
    resetVis: function() {
    	this.getVis().selectAll('.node').remove();
    },
    
    getTopTerms: function() {
    	this.setApiParams({docId: undefined, docIndex: undefined});
    	this.getCorpus().getCorpusTerms().load({
    		params: {
 				limit: parseInt(this.getApiParam('numInitialTerms')),
 				stopList: this.getApiParam('stopList')
 			},
		    callback: function(records, operation, success) {
		    	if (success) {
		    		this.loadFromRecords(records);
		    	}
		    },
		    scope: this
    	});
    },
    
    getDistinctTerms: function() {
    	var perDocLimit = Math.ceil(parseInt(this.getApiParam('numInitialTerms')) / this.getCorpus().getDocumentsCount()); // ceil ensures there's at least 1 per doc
    	this.getCorpus().getDocumentTerms().load({
			addRecords: true,
			params: {
				limit: parseInt(this.getApiParam('numInitialTerms')),
				perDocLimit: perDocLimit,
				stopList: this.getApiParam('stopList'),
				sort: 'TFIDF',
				dir: 'DESC'
			},
			callback: function(records, operation, success) {
				if (success) {
					this.loadFromRecords(records);
				}
			},
			scope: this
    	});
    },
    
    loadFromRecords: function(records) {
    	if (Ext.isArray(records) && records.length>0) {
    		var maxFreq = this.getMaxRawFreq();
    		var minFreq = this.getMinRawFreq();
    		var minFillVal = this.getMinFillValue();
    		var maxFillVal = this.getMaxFillValue();
    		var terms = [];
    		records.forEach(function(r) {
    			var term = r.getTerm();
    			var rawFreq = r.getRawFreq();
    			var fillVal = this.getMode() === this.MODE_DISTINCT ? r.get('tfidf') : r.getInDocumentsCount();
    			
    			if (maxFreq === undefined || rawFreq > maxFreq) maxFreq = rawFreq;
    			if (minFreq === undefined || rawFreq < minFreq) minFreq = rawFreq;
    			
    			if (maxFillVal === undefined || fillVal > maxFillVal) maxFillVal = fillVal;
    			if (minFillVal === undefined || fillVal < minFillVal) minFillVal = fillVal;
    			
    			this.getCurrentData()[term] = {
    				term: term,
    				rawFreq: rawFreq,
    				relativeFreq: r.get('relativeFreq'),//r.getRelativeFreq(),
    				fillValue: fillVal,
    				collocates: []
    			};
    			
    			terms.push(term);
    		}, this);
    		
    		this.setMaxRawFreq(maxFreq);
    		this.setMinRawFreq(minFreq);
    		this.setMinFillValue(minFillVal);
    		this.setMaxFillValue(maxFillVal);
    		
    		this.loadFromQuery(terms);
    	}
    },
    
    loadFromQuery: function(query) {
    	this.setApiParams({
    		mode: 'corpus'
    	});
    	var params = this.getApiParams();
    	this.getCorpus().getCorpusCollocates().load({
    		params: Ext.apply(Ext.clone(params), {query: query, collocatesWhitelist: query, limit: this.getCollocatesLimit()}),
    		callback: function(records, op, success) {
    			if (success) {
    				this.buildVisFromData(this.processRecordsForVis(records));
    			}
    		},
    		scope: this
    	});
    },
    
    processRecordsForVis: function(records) {
    	var currentTerms = this.getCurrentData();

    	var maxCol = this.getMaxCollocateValue();
    	
    	for (var i=0; i<records.length; i++) {
    		var r = records[i];
    		var term = r.getTerm();
			var contextTerm = r.getContextTerm();
			var contextFreq = r.getContextTermRawFreq();
			
			if (maxCol === undefined || contextFreq > maxCol) {
				maxCol = contextFreq;
			}
			
			if (currentTerms[term] === undefined) {
				// should not be here
			} else {
	    		if (term != contextTerm) {
	    			currentTerms[term].collocates.push({
	    				term: contextTerm, value: contextFreq
	    			});
	    		}
			}
    	}
    	
    	this.setMaxCollocateValue(maxCol);
    	
    	var data = [];
    	for (var term in currentTerms) {
    		if (currentTerms[term].collocates.length > 0) {
    			data.push(currentTerms[term]);
    		}
    	}
    	return data;
    },
    
    buildVisFromData: function(data) {
    	// compute node xy
    	var processedData = this.getVisLayout().nodes({children: data, collocates:[], term: '', rawFreq: 1});
    	// join nodes with data
    	var nodes = this.getVis().selectAll('.node').data(processedData, function(d) { return d.term; } ); // use term as key
    	
    	// update
    	nodes.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
    	nodes.selectAll('circle').attr('r', function(d) { return d.r; });
    	
    	var me = this;
    	
    	var idGet = function(term) {
    		return term.replace(/\W/g, '_'); // remove non-word characters to create valid DOM ids
    	};
    	
    	var collocateFill = d3.scale.pow().exponent(1/3)
			.domain([0,this.getMaxCollocateValue()]).range(['#fff', '#bd3163']);
    	
    	var defaultFill;
    	if (this.getMode() === this.MODE_DISTINCT) {
    		defaultFill = d3.scale.pow().exponent(1/5)
    			.domain([this.getMinFillValue(), this.getMaxFillValue()]).range(['#fff', '#dedede']);
    	} else {
    		defaultFill = d3.scale.linear()
				.domain([this.getMaxFillValue(), this.getMinFillValue()]).range(['#fff', '#dedede']);
    	}
    	
    	// roughly calculate font size based on available area and number of terms
    	var size = this.getVisLayout().size();
    	var layoutRadius = Math.min(size[0], size[1]) / 2;
    	var layoutArea = Math.PI*(layoutRadius*layoutRadius);
    	var totalTerms = nodes[0].length-1;
    	var termArea = layoutArea / totalTerms;
    	var termRadius = Math.sqrt(termArea / Math.PI);
    	var minFontSize = termRadius / 3;
    	var scalingInverse = Math.abs(this.getScalingFactor()-(this.MAX_SCALING+1));
    	scalingInverse = Math.max(1, scalingInverse-1); // substract one to avoid too large fonts
    	var maxFontSize = minFontSize * scalingInverse;

    	var textSizer = d3.scale.linear()//pow().exponent(1/2)
    		.domain([this.getMinRawFreq(),this.getMaxRawFreq()]).range([minFontSize, maxFontSize]);
    	
    	// enter
    	var node = nodes.enter().append('g')
    		.attr('class', 'node')
    		.style('visibility', function(d) { return d.depth > 0 ? 'visible' : 'hidden'; }) // hide root
    		.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
    		.on('click', function(d) {
    			me.dispatchEvent('termsClicked', me, [d.term]);
    		})
    		.on('mouseover', function(d, i) {
    			me.getVis().selectAll('circle')
    				.style('stroke-width', 1)
    				.style('stroke', '#111')
        			.style('fill', function(d) { return defaultFill(d.inDocumentsCount); });
    			
    			d3.select(this).select('circle')
    				.style('fill', '#89e1c2')
    				.style('stroke', '#26926c')
    				.style('stroke-opacity', me.MAX_STROKE_OPACITY);
    			
    			var fillLabel;
    			if (me.getMode() === me.MODE_DISTINCT) {
    				fillLabel = me.localize('tfidf');
    			} else {
    				fillLabel = me.localize('inDocs');
    			}
    			var info = '<b>'+d.term+'</b> ('+d.rawFreq+')<br/>'+fillLabel+': '+d.fillValue;
				var tip = me.getTip();
				tip.update(info);
				tip.show();
				
				for (var i = 0; i < d.collocates.length; i++) {
					var collocate = d.collocates[i];
					var match = me.getVis().selectAll('.node').filter(function(d) { return d.term === collocate.term; })
					match.select('circle')
						.style('fill', function(d) { return collocateFill(collocate.value); })
						.style('stroke', '#bd3163')
						.style('stroke-opacity', me.MAX_STROKE_OPACITY);
					match.select('tspan.value').text(function(d) { return collocate.value; });
				}
			})
			.on('mousemove', function() {
				var container = Ext.get(me.getVisId()).dom;
				var coords = d3.mouse(container);
				coords[1] += 20;
				me.getTip().setPosition(coords);
			})
			.on('mouseout', function() {
				me.getVis().selectAll('circle').style('stroke-opacity', me.MIN_STROKE_OPACITY).style('stroke', '#111')
	    			.style('fill', function(d) { return defaultFill(d.fillValue); });
				me.getVis().selectAll('tspan.value').text('');
				me.getTip().hide();
//				me.getVisInfo().text('');
			});
    	
    	node.append('circle')
    		.attr('id', function(d) { return idGet(d.term); })
			.attr('r', function(d) { return d.r; })
			.style('fill', function(d) { return defaultFill(d.fillValue); })
			.style('stroke', '#111')
			.style('stroke-opacity', me.MIN_STROKE_OPACITY)
			.style('stroke-width', 1);
    	
    	node.append('clipPath').attr('id', function(d) { return 'clip-' + idGet(d.term); })
    		.append('use').attr('xlink:href', function(d) { return '#' + idGet(d.term); });
		
    	var text = node.append('text')
    		.attr('clip-path', function(d) { return 'url(#clip-' + idGet(d.term) + ')'; })
			.style('text-anchor', 'middle')
			.style('cursor', 'default');
		text.append('tspan')
			.attr('class', 'term')
			.style('font-size', function(d) { return textSizer(d.rawFreq); })
			.attr('x', 0)
			.attr('y', function(d) { return textSizer(d.rawFreq)/4; })
			.text(function(d) { return d.term; });
		text.append('tspan')
			.attr('class', 'value')
			.style('font-size', function(d) { return textSizer(d.rawFreq)*0.75; })
			.attr('x', 0)
			.attr('y', function(d) { return textSizer(d.rawFreq)+1; });
		
		// exit
    	nodes.exit().remove();
		
    },
    
    initVisLayout: function() {
    	var el = this.getLayout().getRenderTarget();
		el.update(''); // make sure to clear existing contents (especially for re-layout)
    	var width = el.getWidth();
		var height = el.getHeight();
		
		var me = this;
		this.setVisLayout(
			d3.layout.pack()
				.sort(function(a, b) { return a.rawFreq < b.rawFreq ? 1 : a.rawFreq > b.rawFreq ? -1 : 0; })
				.value(function(d) { return Math.pow(d.rawFreq, 1/me.getScalingFactor()); })
				.size([width, height])
				.padding(1.5)
		);
		
		var svg = d3.select(el.dom).append('svg').attr('id',this.getVisId()).attr('width', width).attr('height', height);
		this.setVis(svg.append('g'));
		
		this.setVisInfo(svg.append('text').attr('x', 10).attr('y', 10));
		
		if (this.getTip() === undefined) {
			this.setTip(Ext.create('Ext.tip.Tip', {}));
		}
    }
});