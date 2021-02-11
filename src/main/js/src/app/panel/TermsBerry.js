Ext.define('Voyant.panel.TermsBerry', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.termsberry',
    statics: {
    	i18n: {
    	},
    	api: {
    		stopList: 'auto',
    		context: 2,
        	numInitialTerms: 75,
    		query: undefined,
    		docIndex: undefined,
    		docId: undefined,
    		categories: undefined
    	},
		glyph: 'xf1db@FontAwesome'
    },
    config: {
    	options: [{xtype: 'stoplistoption'},{xtype: 'categoriesoption'}],
    	
    	mode: undefined,
    	
    	scalingFactor: 3,
    	
    	minRawFreq: undefined,
    	maxRawFreq: undefined,
    	maxCollocateValue: undefined,
    	minFillValue: undefined,
    	maxFillValue: undefined,
    	
    	currentData: {},
    	blacklist: {},
    	
    	visLayout: undefined,
    	vis: undefined,
    	visInfo: undefined,
    	visId: undefined,
    	
    	currentNode: undefined,
    	
    	tip: undefined,
    	contextMenu: undefined
	},
    
	MODE_TOP: 'top',
    MODE_DISTINCT: 'distinct',
    
    MIN_TERMS: 5,
    MAX_TERMS: 500,
    
    COLLOCATES_LIMIT: 1000000, // a very large number so we get all of them
    
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
                   xtype: 'querysearchfield',
                   clearOnQuery: true
                },{
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
	            			this.setApiParam("numInitialTerms", newvalue);
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
	            			this.reload();
	            		},
	            		scope: this
	            	}
                }
                ]
    		}]
    	});
    	
    	this.setContextMenu(Ext.create('Ext.menu.Menu', {
			renderTo: Ext.getBody(),
			items: [{
				xtype: 'box',
				itemId: 'label',
				margin: '5px 0px 5px 5px',
				html: ''
			},{
		        xtype: 'menuseparator'
			},{
				xtype: 'button',
				text: 'Remove',
				style: 'margin: 5px;',
				handler: function(b, e) {
					var node = this.getCurrentNode();
					if (node !== undefined) {
						delete this.getCurrentData()[node.data.term];
						this.getBlacklist()[node.data.term] = true;
						this.setCurrentNode(undefined);
					}
					this.getContextMenu().hide();
					this.reload();
				},
				scope: this
			}]
		}));
    	
    	this.on('query', function(src, query) {
    		if (query.length > 0) {
    			this.doLoad(query);
    		}
		}, this);
    	
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
    			
    			this.reload();
    		}
    	},
    	
    	loadedCorpus: function(src, corpus) {
    		if (this.isVisible()) {
        		this.doLoad();
    		}
    	},
    	activate: function() {
    		if (this.getCorpus()) {
    			this.doLoad();
    		}
    	}
    },
    
    doLoad: function(query) {
		this.resetVis();
		if (query === undefined) {
			this.resetMinMax();
			this.setCurrentData({});
		}
    	if (this.getMode() === this.MODE_DISTINCT) {
    		this.getDistinctTerms(query);
    	} else {
    		this.getTopTerms(query);
    	}
    },
    
    reload: function() {
    	var data = this.processCollocates([]);
		if (data.length > 0) {
			this.resetVis();
			this.buildVisFromData(data);
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
    	var vis = this.getVis();
    	if (vis) {
        	vis.selectAll('.node').remove();
    	}
    },
    
    getTopTerms: function(query) {
    	var limit = parseInt(this.getApiParam('numInitialTerms'));
    	var stopList = this.getApiParam('stopList');
    	if (query !== undefined) {
    		limit = undefined;
    		stopList = undefined;
    	}
    	this.getCorpus().getCorpusTerms().load({
    		params: {
    			query: query,
 				limit: limit,
 				stopList: stopList
 			},
		    callback: function(records, operation, success) {
		    	if (success) {
		    		this.loadFromRecords(records);
		    	}
		    },
		    scope: this
    	});
    },
    
    getDistinctTerms: function(query) {
    	var limit = parseInt(this.getApiParam('numInitialTerms'));
    	var stopList = this.getApiParam('stopList');
    	if (query !== undefined) {
    		limit = undefined;
    		stopList = undefined;
    	}
    	var perDocLimit = Math.ceil(parseInt(this.getApiParam('numInitialTerms')) / this.getCorpus().getDocumentsCount()); // ceil ensures there's at least 1 per doc
    	this.getCorpus().getDocumentTerms().load({
			params: {
				query: query,
				limit: limit,
				perDocLimit: perDocLimit,
				stopList: stopList,
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
    
    loadFromQuery: function(query) {
    	this.getCorpus().getCorpusTerms().load({
    		params: {
 				query: query
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
    			if (!this.getBlacklist()[term]) {
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
    			}
    		}, this);
    		
    		this.setMaxRawFreq(maxFreq);
    		this.setMinRawFreq(minFreq);
    		this.setMinFillValue(minFillVal);
    		this.setMaxFillValue(maxFillVal);
    		
    		this.getCollocatesForQuery(terms);
    	}
    },
    
    getCollocatesForQuery: function(query) {
    	var whitelist = [];
    	for (var term in this.getCurrentData()) {
    		whitelist.push(term);
    	}
    	 
    	this.setApiParams({
    		mode: 'corpus'
    	});
    	var params = this.getApiParams();
    	this.getCorpus().getCorpusCollocates().load({
    		params: Ext.apply(Ext.clone(params), {query: query, collocatesWhitelist: whitelist, limit: this.COLLOCATES_LIMIT}),
    		callback: function(records, op, success) {
    			if (success) {
    				this.buildVisFromData(this.processCollocates(records));
    			}
    		},
    		scope: this
    	});
    },
    
    processCollocates: function(records) {
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
//    		if (currentTerms[term].collocates.length > 0) {
    			data.push(currentTerms[term]);
//    		}
    	}
    	return data;
    },
    
    buildVisFromData: function(data) {
    	var me = this;
    	
    	if (!this.getVis()) {return;} // not initialized
    	
    	var rootId = '$$$root$$$';
    	data.push({term: rootId, collocates:[], rawFreq:1});
    	var root = d3.stratify()
    		.id(function(d) { return d.term; })
    		.parentId(function(d) {
    			if (d.term !== rootId) return rootId;
				else return '';
			})(data)
			.sort(function(a, b) { return a.rawFreq < b.rawFreq ? 1 : a.rawFreq > b.rawFreq ? -1 : 0; })
			.sum(function(d) { return Math.pow(d.rawFreq, 1/me.getScalingFactor()); });
    	this.getVisLayout()(root);
    	
    	// join nodes with data
    	var nodes = this.getVis().selectAll('.node').data(root.descendants());
    	
    	// update
    	nodes.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
    	nodes.selectAll('circle').attr('r', function(d) { return d.r; });
    	
    	var idGet = function(term) {
    		return term.replace(/\W/g, '_'); // remove non-word characters to create valid DOM ids
    	};
    	
    	var collocateFill = d3.scalePow().exponent(1/3)
			.domain([0,this.getMaxCollocateValue()]).range(['#fff', '#bd3163']);
    	
    	var defaultFill;
    	if (this.getMode() === this.MODE_DISTINCT) {
    		defaultFill = d3.scalePow().exponent(1/5)
    			.domain([this.getMinFillValue(), this.getMaxFillValue()]).range(['#dedede', '#fff']);
    	} else {
    		defaultFill = d3.scaleLinear()
				.domain([this.getMaxFillValue(), this.getMinFillValue()]).range(['#dedede', '#fff']);
    	}
    	
    	// roughly calculate font size based on available area and number of terms
    	var size = this.getVisLayout().size();
    	var layoutRadius = Math.min(size[0], size[1]) / 2;
    	var layoutArea = Math.PI*(layoutRadius*layoutRadius);
    	var totalTerms = data.length;
    	var termArea = layoutArea / totalTerms;
    	var termRadius = Math.sqrt(termArea / Math.PI);
    	var minFontSize = termRadius / 3;
    	var scalingInverse = Math.abs(this.getScalingFactor()-(this.MAX_SCALING+1));
    	scalingInverse = Math.max(1, scalingInverse-1); // substract one to avoid too large fonts
    	var maxFontSize = minFontSize * scalingInverse;

    	var textSizer = d3.scaleLinear()//pow().exponent(1/2)
    		.domain([this.getMinRawFreq(),this.getMaxRawFreq()]).range([minFontSize, maxFontSize]);
    	
    	// enter
    	var node = nodes.enter().append('g')
    		.attr('class', 'node')
    		.style('visibility', function(d) { return d.depth > 0 ? 'visible' : 'hidden'; }) // hide root
    		.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
    		.on('click', function(d) {
    			me.dispatchEvent('termsClicked', me, [d.data.term]);
    		})
    		.on('mouseover', function(d, i) {
    			me.setCurrentNode(d);
    			
    			me.getVis().selectAll('circle')
    				.style('stroke-width', 1)
    				.style('stroke', '#111')
        			.style('fill', function(d) { return defaultFill(d.data.fillValue); });
    			
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
    			
    			if (!me.getContextMenu().isVisible()) {
	    			var info = '<b>'+d.data.term+'</b> ('+d.data.rawFreq+')<br/>'+fillLabel+': '+d.data.fillValue;
					var tip = me.getTip();
					tip.update(info);
					tip.show();
    			}
				
				for (var i = 0; i < d.data.collocates.length; i++) {
					var collocate = d.data.collocates[i];
					var match = me.getVis().selectAll('.node').filter(function(d) { return d.data.term === collocate.term; });
					match.select('circle')
						.style('fill', function(d) { return collocateFill(collocate.value); })
						.style('stroke', '#bd3163')
						.style('stroke-opacity', me.MAX_STROKE_OPACITY);
					match.select('tspan.value').text(function(d) { return collocate.value; });
				}
			})
			.on('mousemove', function() {
				me.getTip().setPosition(d3.event.pageX+5, d3.event.pageY-50);
			})
			.on('mouseout', function() {
				if (!me.getContextMenu().isVisible()) {
					me.setCurrentNode(undefined);
				}
				
				me.getVis().selectAll('circle').style('stroke-opacity', me.MIN_STROKE_OPACITY).style('stroke', '#111')
	    			.style('fill', function(d) { return defaultFill(d.data.fillValue); });
				me.getVis().selectAll('tspan.value').text('');
				me.getTip().hide();
//				me.getVisInfo().text('');
			})
			.on('contextmenu', function(d, i) {
				d3.event.preventDefault();
				me.getTip().hide();
				var menu = me.getContextMenu();
				menu.queryById('label').setHtml(d.data.term);
				menu.showAt(d3.event.pageX+5, d3.event.pageY-50);
			});
    	
    	node.append('circle')
    		.attr('id', function(d) {
    			return idGet(d.data.term);
			})
			.attr('r', function(d) { return d.r; })
			.style('fill', function(d) { return defaultFill(d.data.fillValue); })
			.style('stroke', '#111')
			.style('stroke-opacity', me.MIN_STROKE_OPACITY)
			.style('stroke-width', 1);
    	
    	node.append('clipPath').attr('id', function(d) { return 'clip-' + idGet(d.data.term); })
    		.append('use').attr('xlink:href', function(d) { return '#' + idGet(d.data.term); });
		
    	var text = node.append('text')
    		.attr('clip-path', function(d) { return 'url(#clip-' + idGet(d.data.term) + ')'; })
    		.style('font-family', function(d) { return me.getApplication().getCategoriesManager().getFeatureForTerm('font', d.data.term); })
			.style('text-anchor', 'middle')
			.style('cursor', 'default');
		text.append('tspan')
			.attr('class', 'term')
			.attr('font-size', function(d) { return textSizer(d.data.rawFreq); })
			.attr('x', 0)
			.attr('y', function(d) { return textSizer(d.data.rawFreq)/4; })
			.text(function(d) { return d.data.term; });
		text.append('tspan')
			.attr('class', 'value')
			.attr('font-size', function(d) { return textSizer(d.data.rawFreq)*0.75; })
			.attr('x', 0)
			.attr('y', function(d) { return textSizer(d.data.rawFreq)+1; });
		
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
			d3.pack().size([width, height]).padding(1.5)
		);
		
		var svg = d3.select(el.dom).append('svg').attr('id',this.getVisId()).attr('width', width).attr('height', height);
		this.setVis(svg.append('g'));
		
		this.setVisInfo(svg.append('text').attr('x', 10).attr('y', 10));
		
		if (this.getTip() === undefined) {
			this.setTip(Ext.create('Ext.tip.Tip', {}));
		}
    }
});