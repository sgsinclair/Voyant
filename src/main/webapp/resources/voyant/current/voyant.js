/* This file created by JSCacher. Last modified: Wed Jun 17 21:35:50 EDT 2015 */
function Bubblelines(config) {
	this.container = config.container;
	this.externalClickHandler = config.clickHandler;
	
	this.INTERVAL = 50; // milliseconds between each redraw
	this.DISMISS_DELAY = 2500; // milliseconds before tooltip auto hides
	this.UNIFORM_LINE_LENGTH = true; // should all document lines be the same length?
	this.SEPARATE_LINES_FOR_TERMS = false; // draw a separate line for each term?
	
	// these 2 get set in the code
	this.MAX_LABEL_WIDTH = 0;
	this.MAX_LINE_WIDTH = 0;
	
	this.DRAW_TITLES = true; // where to draw the document titles for each graph; gets set to false if the corpus has only 1 document
	this.DRAW_SHORT_TITLES = false; // whether to use the docIndex for the title or not; gets set to true if the window is small enough
	
	this.MIN_GRAPH_SEPARATION = 50; // vertical separation between graphs
	this.graphSeparation = 50;
	
	this.yIndex = 0; // for tracking yIndex during the drawing process
	
	this.mouseOver = false; // is the mouse over the canvas
	this.intervalId = null;
	this.clearToolTipId = null;
	this.overBubbles = [];
	this.lastClickedBubbles = {};
	this.dragInfo = null;
	this.canvas = null;
	this.ctx = null;
	this.maxDocLength = 2;
	this.maxFreq = {term: null, value: 0};
	this.maxRadius = 0;
	this.selectedDocs = new Ext.util.MixedCollection();
	
	/**
	 * The cache of docs. Each has the following properties:
	 * @param {String} id
	 * @param {String} title
	 * @param {Integer} index
	 * @param {Integer} totalTokens
	 * @param {Object} terms Stores the terms for this doc
	 * @param {Object} freqCounts Used for tool tip display
	 * @param {Float} height The height of the graph for this doc
	 * @param {Float} titleWidth The width of the title
	 * @param {Float} lineLength The length of the graph line for this doc
	 */
	this.cache = new Ext.util.MixedCollection();
	
	this.currentTerms = {}; // tracks what terms we're currently showing

	this.initialized = false;
}

Bubblelines.prototype = {
	constructor: Bubblelines,
	
	initializeCanvas: function() {
//		if (this.getCorpus().getSize() == 1) {
//			this.DRAW_TITLES = false;
//		}
//		
//		this.filterDocuments();
		
		this.selectedDocs.each(this.findLongestDocument, this);
		
//		var docIds = this.getApiParamValue('docId');
//		if (typeof docIds == 'string') docIds = [docIds];
//		this.getTopToolbar().findByType('documentSelector')[0].populate(docIds);
		
		if (this.maxDocLength <= 1) {
//			Ext.Msg.alert('Bubblelines', this.localize('corpusTooSmall'));
		} else {
			var container = this.container;
			var height = container.getHeight();//Math.max(this.selectedDocs.getCount() * this.graphSeparation + 15, container.ownerCt.getHeight());
			var width = container.getWidth();
			this.DRAW_SHORT_TITLES = width < 500;
			var id = Ext.id('bubblelines');
			container.add({
				xtype: 'container',
				width: width,
				height: height,
				html: '<canvas id="'+id+'" width="'+width+'" height="'+height+'"></canvas>',
				border: false,
	        	listeners: {
	        		afterrender: {
	        			fn: function(cnt) {
	    					this.canvas = document.getElementById(id);
	        				this.ctx = this.canvas.getContext('2d');
	        				this.canvas.addEventListener('click', this.clickHandler.bind(this), false);
	        				this.canvas.addEventListener('mousedown', this.mouseDownHandler.bind(this), false);
	        				this.canvas.addEventListener('mouseup', this.mouseUpHandler.bind(this), false);
	        				this.canvas.addEventListener('mousemove', this.moveHandler.bind(this), false);
	        				this.canvas.addEventListener('mouseenter', this.mouseEnterHandler.bind(this), false);
	        				this.canvas.addEventListener('mouseleave', this.mouseLeaveHandler.bind(this), false);
	        				            				
//	        				this.findLongestDocumentTitle();
//	        				
//	        				var padding = 75;
//            				if (this.DRAW_SHORT_TITLES) padding = 50;
//            				this.setMaxLineWidth(width - this.MAX_LABEL_WIDTH - padding);
	        			},
	        			single: true,
	        			scope: this
	        		}
	        	}
			});
			container.doLayout();
			this.initialized = true;
		}
	},
	
	doLayout: function() {
		if (this.initialized) {
			var width = this.container.getWidth();
			
			// width related calculations
			this.DRAW_SHORT_TITLES = width < 500;
			this.setTitleWidthsAndMaxTitleWidth();
			
			var children = Ext.DomQuery.jsSelect('div:not(div[class*=term])', this.container.el.dom);
			for (var i = 0; i < children.length; i++) {
				var child = Ext.fly(children[i]);
				child.setWidth(width);
			}
			this.canvas.width = width;
			
			var padding = 75;
			if (this.DRAW_SHORT_TITLES) padding = 50;
			this.setMaxLineWidth(width - this.MAX_LABEL_WIDTH - padding);
			this.setLineLengths();
			
			this.recache();
			
			// height related calculations
			this.setCanvasHeight();
			
			this.drawGraph();
		}
	},
	
	addDocToCache: function(doc) {
		this.cacheBubbles(doc);
		this.calculateBubbleRadii(doc);
		doc.lineLength = 600;
		doc.freqCounts = {}; // used for tool tip display
		if (this.cache.containsKey(doc.id) === false) {
			this.cache.add(doc);
		} else {
			this.cache.replace(doc.id, doc);
		}
		this.cache.sort('index', 'ASC');
	},
	
	addTermsToDoc: function(termsObj, docId) {
		var term;
		// only one key
		for (var key in termsObj) {
			term = key;
		}
		this.currentTerms[term] = true;
		
		var doc = this.cache.get(docId);
		Ext.apply(doc.terms, termsObj);
		var maxFreqChanged = this.cacheBubbles(doc);
		if (maxFreqChanged) {
			this.recache();
		} else {
			this.calculateBubbleRadii(doc);
		}
	},
	
	cacheBubbles: function(doc) {
		var maxFreqChanged = false;
		for (var term in doc.terms) {
			var termInfo = doc.terms[term];
			var bins = termInfo.distributions.length;
			var spacing = doc.lineLength / bins;
			
			var cachedPositions = [];
			var tokenPos = 0;
			var maxDistribution = 0;
			var xIndex = 0;
			for (var i = 0; i < bins; i++) {
				var d = termInfo.distributions[i];
				if (d > maxDistribution) {
					maxDistribution = d;
				}
				
				cachedPositions.push({id: Ext.id(null, 'bub'), x: xIndex, freq: d, radius: 0, bin: i, tokenPositions: termInfo.positions.slice(tokenPos, tokenPos+=d)});
				xIndex += spacing;
			}
			
			doc.terms[term].maxDistribution = maxDistribution;
			doc.terms[term].pos = cachedPositions;
			
			if (maxDistribution > this.maxFreq.value) {
				maxFreqChanged = true;
				this.setMaxFreq({term: term, value: maxDistribution});
			}
		}
		return maxFreqChanged;
	},
	
	calculateBubbleRadii: function(doc, newTerm) {
		var maxFreqLog = Math.log(this.maxFreq.value);
		var minFreq = Math.log(2) / 2;
//		this.cache.each(function(doc) {
			for (var t in doc.terms) {
				var term = doc.terms[t];
				if (term) {
					if (newTerm == null || t == newTerm) {
						for (var i = 0; i < term.pos.length; i++) {
							var bubble = term.pos[i];
							if (bubble.freq > 0) {
								var freqLog = Math.max(Math.log(bubble.freq), minFreq);
								var radius = freqLog / maxFreqLog * this.maxRadius;
								bubble.radius = radius;
							} else {
								bubble.radius = 0;
							}
						}
					}
				}
			}
//		}, this);
	},
	
	
	recache: function() {
		function doCache(doc) {
			this.cacheBubbles(doc);
			this.calculateBubbleRadii(doc);
		}
		
		this.cache.each(doCache, this);
	},
	
	/**
	 * Get the total height of the all the graphs
	 */
	getTotalHeight: function() {
		var totalHeight = this.maxRadius;
		this.cache.each(function(doc, index, length) {
			totalHeight += doc.height;
		}, this);
		return totalHeight;
	},
	

	/**
	 * Set the height for the canvas and associated elements
	 */
	setCanvasHeight: function() {
		this.calculateGraphHeights();
		var height = this.getTotalHeight();
		var container = this.container.dom;
		if (container !== undefined) {
			var children = Ext.DomQuery.jsSelect('div', container);
			for (var i = 0; i < children.length; i++) {
				var child = Ext.fly(children[i]);
				child.setHeight(height);
			}
		}
		this.canvas.height = height;
	},
	
	/**
	 * Set max line width as well as maxRadius
	 */
	setMaxLineWidth: function(width) {
		this.maxRadius = width / 30;
		this.MAX_LINE_WIDTH = width - this.maxRadius / 2;
	},
	
	/**
	 * Calculate graph heights, based on maxRadius
	 */
	calculateGraphHeights: function() {
		var graphSeparation = this.maxRadius * 0.5;
		if (this.SEPARATE_LINES_FOR_TERMS) {
			var terms = [];
			for (var term in this.currentTerms) {
				terms.push(term);
			}
			this.cache.each(function(doc, index, length) {
				var height = this.maxRadius * terms.length;
				for (var i = 0; i < terms.length; i++) {
					if (!doc.terms[terms[i]]) {
						height -= this.maxRadius;
					}
				}
				if (height == 0) height = this.maxRadius;
				
				doc.height = height + graphSeparation;
			}, this);
		} else {
			var height = Math.max(this.maxRadius, this.MIN_GRAPH_SEPARATION);
			this.cache.each(function(doc, index, length) {
				doc.height = height + graphSeparation;
			}, this);
		}
	},
	
	findLongestDocument: function(doc) {
		var twt = doc.getTotalWordTokens();
		if (twt > this.maxDocLength) {
			this.maxDocLength = twt;
		}
	},
	
	getTitleWidth: function(doc) {
		var title = doc.title;
		if (this.DRAW_SHORT_TITLES) {
			var index = this.cache.indexOf(doc);
			title = (index+1)+')';
		}
		this.ctx.textBaseline = 'top';
		this.ctx.font = 'bold 12px Verdana';
		var width = this.ctx.measureText(title).width;
		return width;
	},
	
	setTitleWidthsAndMaxTitleWidth: function() {
		function doTitle(doc, index) {
			var width = this.getTitleWidth(doc);
			doc.titleWidth = width;
			if (width > this.MAX_LABEL_WIDTH) {
				this.MAX_LABEL_WIDTH = width;
			}
		}
		this.cache.each(doTitle, this);
	},
	
	setLineLengths: function() {
		function doLength(doc, index) {
			var lineLength;
			if (this.UNIFORM_LINE_LENGTH) {
				lineLength = this.MAX_LINE_WIDTH;
			} else {
				var percentage = Math.log(doc.getTotalWordTokens()) / Math.log(this.maxDocLength);
				lineLength = percentage * this.MAX_LINE_WIDTH;
			}
			doc.lineLength = lineLength;
		}
		
		this.cache.each(doLength, this);
	},
	
	drawGraph: function(includeLegend) {
		if (this.intervalId != null) clearInterval(this.intervalId);
		
		if (this.mouseOver) {
			this.intervalId = setInterval(this.doDraw.bind(this, [includeLegend]), this.INTERVAL);
		} else {
			setTimeout(this.doDraw.bind(this, [includeLegend]), 5);
		}
	},
	
	doDraw: function(includeLegend) {
		this.clearCanvas();
		this.yIndex = this.maxRadius;
		if (includeLegend === true) this.yIndex += 30;
		this.cache.each(this.drawDocument, this);
		if (includeLegend === true) this.drawLegend();
		else this.drawToolTip();
		this.doDrag();
	},
	
	drawDocument: function(doc, index, totalDocs) {
		var lineLength = doc.lineLength;
		var titleIndent = this.MAX_LABEL_WIDTH - doc.titleWidth;
		
		var xIndex = 5;
		
		this.ctx.textBaseline = 'top';
		this.ctx.font = 'bold 12px Verdana';
		
		if (this.dragInfo != null && this.dragInfo.oldIndex == index) {
			this.ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
			xIndex += titleIndent;
			this.ctx.fillText(doc.title, xIndex, this.yIndex);
			if (this.SEPARATE_LINES_FOR_TERMS) {
				this.yIndex += doc.height;
			}
		} else {			
			// draw label
			if (this.DRAW_TITLES) {
				xIndex += titleIndent;
//				var c = this.getColor(this.getApplication().getCorpus().getDocument(doc.id).getIndex());
//				this.ctx.strokeStyle = 'rgba('+c[0]+', '+c[1]+', '+c[2]+', 1.0)';
//				this.ctx.lineWidth = 2;
//				this.ctx.beginPath();
//				this.ctx.moveTo(xIndex, this.yIndex+12);
//				this.ctx.lineTo(this.MAX_LABEL_WIDTH, this.yIndex+12);
//				this.ctx.stroke();
				
				this.ctx.fillStyle = 'rgba(128, 128, 128, 1.0)';
				var title = doc.title;
				if (this.DRAW_SHORT_TITLES) title = (index+1)+')';
				this.ctx.fillText(title, xIndex, this.yIndex);
			}
			
//			this.ctx.fillStyle = 'rgba(0, 0, 128, 1.0)';
//			this.ctx.fillRect(0, this.yIndex-this.maxRadius*0.75, 250, 2);
			
			// shift down slightly to vertically align line and bubbles with label
			this.yIndex += 4;
			
			// draw line
			var that = this;
			function drawLine() {
				xIndex = that.MAX_LABEL_WIDTH + that.maxRadius;
				that.ctx.strokeStyle = 'rgba(128, 128, 128, 1.0)';
				that.ctx.fillStyle = 'rgba(128, 128, 128, 1.0)';
				that.ctx.lineWidth = 0.25;
				
				that.ctx.beginPath();
				that.ctx.moveTo(xIndex, that.yIndex-6);
				that.ctx.lineTo(xIndex, that.yIndex+6);
				that.ctx.stroke();
				
				that.ctx.beginPath();
				that.ctx.moveTo(xIndex, that.yIndex);
				that.ctx.lineTo(xIndex + lineLength, that.yIndex);
				that.ctx.stroke();
				
				that.ctx.beginPath();
				that.ctx.moveTo(xIndex + lineLength, that.yIndex-6);
				that.ctx.lineTo(xIndex + lineLength, that.yIndex+6);
				that.ctx.stroke();
			}
			
//			var filter = this.getApiParamValue('typeFilter');
			var filter = [];
			for (var term in this.currentTerms) {
				filter.push(term);
			}
			
			if (!this.SEPARATE_LINES_FOR_TERMS) {
				drawLine();
			} else if (filter == null || filter.length == 0) {
				drawLine();
			}
			
			// draw bubbles
			var pi2 = Math.PI * 2;
			
			var freqTotal = 0;
			doc.freqCounts = {};
			var terms = doc.terms;
			var checkClickedBubbles = this.lastClickedBubbles[index] != null;
			var termsDrawn = 0;
			for (var t in terms) {
//				if (filter.indexOf(t) != -1) {
					var info = terms[t];
					if (info) {
						termsDrawn++;
						if (this.SEPARATE_LINES_FOR_TERMS) {
							drawLine();
						}
						
						var freqForType = 0;
						
						var c = info.color.join(',');
						this.ctx.strokeStyle = 'rgba('+c+', 1)';
						this.ctx.fillStyle = 'rgba('+c+', 0.35)';
						this.ctx.lineWidth = 0.25;
						
						freqTotal += info.rawFreq;
						freqForType += info.rawFreq;
						
						var checkCurrentType = checkClickedBubbles && this.lastClickedBubbles[index][t];
						
						for (var i = 0; i < info.pos.length; i++) {
							var b = info.pos[i];
							if (b.radius > 0) {
								var doClickedBubble = false;
								if (checkCurrentType && this.lastClickedBubbles[index][t] == b.id) {
									this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
									this.ctx.fillStyle = 'rgba('+c+', 0.5)';
									this.ctx.lineWidth = 1;
									doClickedBubble = true;
								}
								
								this.ctx.beginPath();
								this.ctx.arc(b.x+xIndex, this.yIndex, b.radius, 0, pi2, true);
								this.ctx.closePath();
								this.ctx.fill();
								this.ctx.stroke();
								
								if (doClickedBubble) {
									this.ctx.strokeStyle = 'rgba('+c+', 1)';
									this.ctx.fillStyle = 'rgba('+c+', 0.35)';
									this.ctx.lineWidth = 0.25;
								}
							}
						}
						doc.freqCounts[t] = freqForType;
						
						if (this.SEPARATE_LINES_FOR_TERMS) {
							this.ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
							this.ctx.font = '10px Verdana';
							this.ctx.fillText(freqForType, xIndex + lineLength + 5, this.yIndex-4);
							
							this.yIndex += this.maxRadius;
						}
					}
//				}
			}
			
			if (this.SEPARATE_LINES_FOR_TERMS && termsDrawn == 0) {
				drawLine();
				
				this.ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
				this.ctx.font = '10px Verdana';
				this.ctx.fillText(0, xIndex + lineLength + 5, this.yIndex-4);
				
				this.yIndex += this.maxRadius;
			}
			
			xIndex += lineLength;
			
			if (!this.SEPARATE_LINES_FOR_TERMS) {
				this.ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
				this.ctx.font = '10px Verdana';
				this.ctx.fillText(freqTotal, xIndex + 5, this.yIndex-4);
			}
		}
		
		if (!this.SEPARATE_LINES_FOR_TERMS) {
			this.yIndex += doc.height;
		} else {
			this.yIndex += this.maxRadius * 0.5;
		}
		
		// undo previous shift
		this.yIndex -= 4;
		
//		this.ctx.fillStyle = 'rgba(128, 0, 0, 1.0)';
//		this.ctx.fillRect(0, this.yIndex-this.maxRadius*0.75, 350, 2);
	},
	
	drawLegend: function() {
		var x = this.MAX_LABEL_WIDTH + this.maxRadius;
		var y = 5;
		this.ctx.textBaseline = 'top';
		this.ctx.font = '16px serif';
		this.typeStore.each(function(record) {
			var color = record.get('color').join(',');
			this.ctx.fillStyle = 'rgb('+color+')';
			var type = record.get('type');
			this.ctx.fillText(type, x, y);
			var width = this.ctx.measureText(type).width;
			x += width + 8;
		}, this);
	},
	
	drawToolTip: function() {
		if (this.overBubbles.length > 0) {
			this.ctx.lineWidth = 0.5;
			this.ctx.fillStyle = 'rgba(224, 224, 224, 0.8)';
			this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
			
			var x = this.overBubbles[0].x;
			var y = this.overBubbles[0].y;
			var width = 110;
			if (x + width > this.canvas.width) {
				x -= width;
			}
			var height;
			var summary = this.overBubbles[0].label == null;
			if (summary) {
				var doc = this.cache.get(this.overBubbles[0].docIndex);
				var count = 1;
				for (var t in doc.freqCounts) {
					count++;
				}
				height = count * 16;// + 10;
				if (y + height > this.canvas.height) {
					y -= height;
				}
				this.ctx.fillRect(x, y, width, height);
				this.ctx.strokeRect(x, y, width, height);
				x += 10;
				y += 10;
				this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
				this.ctx.font = '10px Verdana';
//				var total = 0;
				for (var t in doc.freqCounts) {
					var freq = doc.freqCounts[t];
//					total += freq;
					this.ctx.fillText(t+': '+freq, x, y, 90);
					y += 16;
				}
//				this.ctx.fillText(this.localize('total')+': '+total, x, y, 90);
				
			} else {
				height = this.overBubbles.length * 16 + 10;
				if (y + height > this.canvas.height) {
					y -= height;
				}
				this.ctx.fillRect(x, y, width, height);
				this.ctx.strokeRect(x, y, width, height);
				x += 10;
				y += 10;
				this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
				this.ctx.font = '10px Verdana';
				for (var i = 0; i < this.overBubbles.length; i++) {
					var b = this.overBubbles[i];
					this.ctx.fillText(b.label+': '+b.freq, x, y, 90);
					y += 16;
				}
			}
			
			if (this.clearToolTipId == null) {
				this.clearToolTipId = setTimeout(this.clearToolTip.bind(this), this.DISMISS_DELAY);
			}
		}
	},
	
	clearToolTip: function() {
		this.overBubbles = [];
		clearTimeout(this.clearToolTipId);
		this.clearToolTipId = null;
	},

	// TODO remove this
	reloadTypeData: function() {
		this.cache.clear();
		this.store.removeAll();
		var types = this.getApiParamValue('type');
		if (types.length == 0) {
			this.cacheDocuments();
			this.drawGraph();
		}
		for (var i = 0; i < types.length; i++) {
    		var type = types[i];
    		this.store.load({params: {type: type}, add: true});
    	}
	},
	
	mouseEnterHandler: function(event) {
		this.mouseOver = true;
		this.drawGraph();
	},
	
	mouseLeaveHandler: function(event) {
		this.mouseOver = false;
		if (this.intervalId != null) clearInterval(this.intervalId);
		// draw once to remove any popup
		this.overBubbles = [];
		this.drawGraph();
	},
	
	moveHandler: function(event) {
		this.clearToolTip();
		
		this.overBubbles = [];
		var x = event.layerX - this.MAX_LABEL_WIDTH;
		var y = event.layerY;
		
		var docHeight = this.maxRadius*0.25; // where the first graph actually starts
		
		var docIndex = -1;
		this.cache.each(function(doc, index, length) {
			if (y < docHeight) {
				return false;
			} else {
				docHeight += doc.height;
				if (y < docHeight) {
					docIndex = index;
					return false;
				}
			}
		}, this);
		
		if (this.dragInfo != null) {
			this.dragInfo.x = event.layerX;
			this.dragInfo.y = y;

			if (docIndex >= this.cache.getCount()) {
				docIndex = this.cache.getCount()-1;
			} else if (docIndex < 0) {
				if (y + this.maxRadius > this.canvas.height) {
					docIndex = this.cache.getCount()-1;
				} else {
					docIndex = 0;
				}
			}
			
			this.dragInfo.newIndex = docIndex;
			document.body.style.cursor = 'move';
		} else {
			if (docIndex >= 0 && docIndex < this.cache.getCount()) {
				if (x >= 0) {
					var showPointer = false;
					x -= this.maxRadius; // re-adjust x to the start of the doc line 
					var hits = [];
					var doc = this.cache.get(docIndex);
					if (x >= doc.lineLength) {
						this.overBubbles = [{
							docIndex: docIndex,
							x: event.layerX+10,
							y: event.layerY+10
						}];
					} else {
						// TODO bins
						var spacing = doc.lineLength / 50;// this.getApiParamValue('bins');
						var xIndex = Math.round(x / spacing);
						var prevDocHeight = this.maxRadius;
						if (docIndex > 0) {
							prevDocHeight = docHeight - (this.cache.get(docIndex).height - this.maxRadius*0.75);
						}
						var yIndex = Math.round((y - prevDocHeight) / this.maxRadius);
						
						var count = 0;
						for (var t in doc.terms) {
							if (this.currentTerms[t] !== undefined) {
								var type = doc.terms[t];
								if (type) {
									if (this.SEPARATE_LINES_FOR_TERMS && count == yIndex || !this.SEPARATE_LINES_FOR_TERMS) {
										if (type.pos[xIndex] && type.pos[xIndex].radius > 0) {
											showPointer = true;
											this.overBubbles.push({
												label: t,
												type: type,
												docId: doc.id,
												docIndex: docIndex,
												xIndex: xIndex,
												yIndex: yIndex,
												freq: type.pos[xIndex].freq,
												id: type.pos[xIndex].id,
												tokenPositions: type.pos[xIndex].tokenPositions,
												x: event.layerX+10,
												y: event.layerY+10
											});
										}
									}
								} else if (this.SEPARATE_LINES_FOR_TERMS) count--;
								count++;
							}
						}
					}
					if (showPointer) {
						document.body.style.cursor = 'pointer';
					} else {
						document.body.style.cursor = 'auto';
					}
				} else {
					document.body.style.cursor = 'move';
				}
			} else {
				document.body.style.cursor = 'auto';
			}
		}
	},
	
	mouseDownHandler: function(event) {
		var x = event.layerX;
		var y = event.layerY;
		if (x < this.MAX_LABEL_WIDTH) {
			
			var docHeight = this.maxRadius*0.25;
			var docIndex = -1;
			this.cache.each(function(doc, index, length) {
				if (y < docHeight) {
					return false;
				} else {
					docHeight += doc.height;
					if (y < docHeight) {
						docIndex = index;
						return false;
					}
				}
			}, this);

			if (docIndex >= 0 && docIndex < this.cache.getCount()) {
				var xOffset = x - 5;
				var yOffset = 5;
				this.dragInfo = {
					oldIndex: docIndex,
					newIndex: docIndex,
					xOffset: xOffset,
					yOffset: yOffset,
					x: x,
					y: y
				};
			}
		}
	},
	
	mouseUpHandler: function(event) {
		this.dragInfo = null;
	},
	
	doDrag: function() {
		if (this.dragInfo != null) {
			var ordering = {};
			for (var i = 0; i < this.cache.getCount(); i++) {
				if (i < this.dragInfo.oldIndex && i < this.dragInfo.newIndex) {
					ordering[i] = i;
				} else if (i < this.dragInfo.oldIndex && i >= this.dragInfo.newIndex) {
					ordering[i] = i + 1;
				} else if (i == this.dragInfo.oldIndex) {
					ordering[i] = this.dragInfo.newIndex;
				} else if (i > this.dragInfo.oldIndex && i > this.dragInfo.newIndex) {
					ordering[i] = i;
				} else if (i > this.dragInfo.oldIndex && i <= this.dragInfo.newIndex) {
					ordering[i] = i - 1;
				}
			}
			this.dragInfo.oldIndex = this.dragInfo.newIndex;
			
			this.cache.reorder(ordering);
			
			var doc = this.cache.get(this.dragInfo.oldIndex);
			this.ctx.fillStyle = 'rgba(128, 128, 128, 1)';
			this.ctx.textBaseline = 'top';
			this.ctx.font = 'bold 12px Verdana';

			this.ctx.fillText(doc.title, this.dragInfo.x - this.dragInfo.xOffset, this.dragInfo.y - this.dragInfo.yOffset);
		}
	},
	
	clickHandler: function(event) {
		this.lastClickedBubbles = {};
		if (this.overBubbles.length > 0 && this.overBubbles[0].label) {
			var hits = [];
			var tokenPositions = [];
			var termData = [];
			for (var i = 0; i < this.overBubbles.length; i++) {
				var b = this.overBubbles[i];
				
				termData.push({term: b.label, docIndex: b.docIndex, docId: b.docId, tokenPositions: b.tokenPositions});
				
				if (this.lastClickedBubbles[b.docIndex] == null) {
					this.lastClickedBubbles[b.docIndex] = {};
				}
				this.lastClickedBubbles[b.docIndex][b.label] = b.id;
				hits.push(b.docId+':'+b.label);
				tokenPositions.push(b.tokenPositions);
			}
			tokenPositions = Ext.flatten(tokenPositions);
			tokenPositions.sort();
			
			if (this.externalClickHandler !== undefined) {
				this.externalClickHandler(termData);
			}
		}
		this.overBubbles = [];
	},
	
	setMaxFreq: function(maxObj) {
		if (maxObj == null) {
			maxObj = this.findMaxFreq();
		}
		this.maxFreq = maxObj;
	},
	
	findMaxFreq: function() {
		var max = {term: '', value: 0};
		this.cache.each(function(doc) {
			for (var t in doc.terms) {
				var maxDistribution = doc.terms[t].maxDistribution;
				if (maxDistribution > max.value) {
					max = {term: t, value: maxDistribution};
				}
			}
		}, this);
		return max;
	},
	
	getNewColor: function() {
		var color = null;
		for (var i = 0; i < this.colors.length; i++) {
			color = this.colors[i];
			var match = this.typeStore.findExact('color', color);
			if (match == -1) break;
			else color = null;
		}
		if (color == null) color = [128, 128, 128];
		return color;
	},
	
	removeAllTerms: function() {
		this.cache.each(function(doc) {
			doc.terms = {};
		}, this);
		this.currentTerms = {};
	},
	
	removeTerm: function(term) {
//		var types = this.store.query('type', type);
//		types.each(function(type) {
//			this.store.remove(type);
//		}, this);
		
		delete this.currentTerms[term];
		
//		var types = this.getApiParamValue('type');
//		types = types.remove(type);
//		this.setApiParams({type: types});
		
		var getNewMax = false;
		this.cache.each(function(doc) {
			for (var t in doc.terms) {
				if (t == term) {
					if (this.maxFreq.term == term) {
						this.maxFreq = {term: null, value: 0};
						getNewMax = true;
					}
					delete doc.terms[t];
				}
			}
		}, this);
		
		for (var i in this.lastClickedBubbles) {
			var lcTypes = this.lastClickedBubbles[i];
			for (var lcType in lcTypes) {
				if (lcType == term) {
					delete this.lastClickedBubbles[i][lcType];
				}
			}
			
		}
		
		if (getNewMax) {
			this.setMaxFreq();
			this.calculateBubbleRadii();
			this.drawGraph();
		}
	},
	
	clearCanvas: function() {
		this.canvas.width = this.canvas.width;
	}
};
/*
 * Author: Andrew MacDonald
 * Licensed for use under the GNU General Public License
 * http://creativecommons.org/licenses/GPL/2.0/
 */

function Cirrus(config) {
    var that = this;
    this.config = config;
    var canvasId = Ext.id(null, 'cirrusCanvas');
    if (this.config.containerId == null) {
        alert('You must provide a valid container ID!');
        return;
    }
    var containerId = '#'+this.config.containerId;
    var wordController = null;
    var resizeTimer = null;
    
    this.clear = function() {
        this.canvas.width = this.canvas.width;
    }
    
    this.addWords = function(words) {
    	debugger
        wordController.addWords(words);
    }
    
    this.arrangeWords = function() {
        wordController.arrangeWords();
    }

    this.clearAll = function() {
        wordController.setWords([]);
        wordController.grid = [];
        this.clear();
    }

    this.resizeWords = function() {
        that.setCanvasDimensions();
        wordController.resetWordCoordinates();
        wordController.calculateSizeAdjustment();
        wordController.resizeWords();
        wordController.arrangeWords();
        resizeTimer = null;
    }

    this.setCanvasDimensions = function() {
        var container = $(containerId)[0];
        var width = Math.max(container.offsetWidth, container.clientWidth);
        var height = Math.max(container.offsetHeight, container.clientHeight);
        this.canvas.width = width;
        this.canvas.height = height;
    }

    function hex2RGB(hex) {
        hex = hex.charAt(0) == '#' ? hex.substring(1,7) : hex;
        var rgb = [];
        rgb.push(parseInt(hex.substring(0, 2), 16));
        rgb.push(parseInt(hex.substring(2, 4), 16));
        rgb.push(parseInt(hex.substring(4, 6), 16));
        return rgb;
    }
    
    function init() {
        
        if ($('#'+that.config.containerId).length == 0) {
            alert('You must provide a valid container ID!');
            return;
        }
        
        // create the canvas
        that.canvas = document.createElement('canvas');
        that.canvas.setAttribute('id', canvasId);
        that.canvas.setAttribute('tabIndex', 1);
        that.setCanvasDimensions();
        $(containerId).append(that.canvas);
        canvasId = '#'+canvasId;
        
        that.context = that.canvas.getContext('2d');
        var isLocal = false; // should we call the server for words or use local ones?
        that.wordData = new Array(); // the word data to input into the app
        that.useFadeEffect = true; // should we use a fade effect for displaying words?
        that.colors = [[116,116,181], [139,163,83], [189,157,60], [171,75,75], [174,61,155]];
        wordController = new WordController(that);
        
        for (var key in that.config) {
            if (key == 'words') that.wordData = that.config[key];
            if (key == 'layout') {
                if (that.config[key] == 'circle') wordController.layout = wordController.CIRCLE;
                else if (that.config[key] == 'square') wordController.layout = wordController.SQUARE;
            }
            if (key == 'colors') {
                // expects an array of hex colors
                if ($.isArray(that.config[key]) && that.config[key].length > 0) {
                    that.colors = [];
                    for (var c in that.config[key]) {
                        that.colors.push(hex2RGB(that.config[key][c]));
                    }
                }
            }
            if (key == 'background') {
                $(canvasId).css("background-color", that.config[key]);
            }
            if (key == 'fade') {
                if (that.config[key] == 'true') that.useFadeEffect = true;
                else if (that.config[key] == 'false') that.useFadeEffect = false;
            }
            if (key == 'smoothness') {
                wordController.wordsToArrange = Math.max(1, Math.min(20, parseInt(that.config[key]))); // set to value between 1-20
            }
        }
        
        if (isLocal && testData) {
            var cnt = 0;
            for (var key in testData) {
                that.wordData.push({word: key, size: testData[key] / 13, label: key});
                cnt++;
                if (cnt == 100) break;
            }
        }
        
        if (that.wordData.length > 0) {
            that.clear();
            wordController.addWords(that.wordData);
            wordController.arrangeWords();
        }
        
        $(window).resize(function() {
            if (resizeTimer != null) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(that.resizeWords, 1000);
        });

        $(canvasId).keypress(function(event) {
            if (event.which == 114) wordController.arrangeWords(); // r was pressed
        });
        
        $(canvasId).click(function(event) {
            var matchingWord = wordController.handleWordClick(event);
            if (matchingWord !== undefined) {
	            if (that.config.clickHandler) {
	            	that.config.clickHandler({term: matchingWord.text, value: matchingWord.value});
	            }
            }
        });
        
        $(canvasId).mouseover(function(event) {
        	wordController.startUpdates();
        });
        $(canvasId).mouseout(function(event) {
        	wordController.stopUpdates();
        });
        
        $(canvasId).mousemove(function(event) {
            wordController.handleMouseMove(event);
        });
    }
    
    $(document).ready(init);
}

/**
 * The word object.  Stores various properties related to diplaying the word.
 * @author Andrew
 */
function Word(_text, _origSize, _color, _rolloverText, _value) {
    this.height = 0;					// the height of the label
    this.width = 0;						// the width of the label
    this.rotation = 0; 					// rotation of the label, in radians
    this.relativeSize = 0;				// the size relative to the largest and smallest word sizes
    this.mask = null;					// a 2 dimensional array containing the local xy co-ordinates of opaque pixels
    this.size = 0;						// the largest of either the height or width, used in the circle layout
    
    /* Init */
    this.text = _text;					// the actual word
    this.color = _color;				// the color of the label
    this.origSize = _origSize;			// the original size (used when re-calculating relative sizes of words)
    this.rolloverText = _rolloverText;	// the text to show on rollover
    this.value = _value || 0;			// a value associated with the word (can be anything)
    this.x = 0;							// the x co-ordinate
    this.y = 0;							// the y co-ordinate
    this.tx = 0;						// the translation value for x
    this.ty = 0;						// the translation value for y
    this.fontFamily = 'Arial';			// the font family
    this.fontSize = 12;					// the font family
    this.alpha = 1;						// alpha of the label
    this.live = false;					// true if the word should be displayed
    this.isOver = false;				// true if the mouse if over the word
    
    this.draw = function(ctx) {
        ctx.save();
        ctx.fillStyle = 'rgba('+this.color[0]+','+this.color[1]+','+this.color[2]+','+this.alpha+')';
        ctx.textBaseline = 'alphabetic';
        ctx.font = this.fontSize + 'px '+ this.fontFamily;
        ctx.translate(this.x + this.tx, this.y + this.ty);
        ctx.rotate(this.rotation);
        ctx.fillText(this.text, 0, 0);
        ctx.restore();
    }
}

function WordController(parentApp) {
    var that = this;
    
    var app = parentApp;
    
    var myFont = 'Impact';
    
    this.CIRCLE = 0; // circle layout
    
    this.ratio = 1; // the width to height ratio
    
    var _layout = this.CIRCLE; // what layout to use
    this.getLayout = function() {
        return _layout;
    }
    this.setLayout = function(value) {
        _layout = value;
    }
    
    this.UPDATE_RATE = 25; // update frequency in milliseconds
    this.COARSENESS = 5; // how many pixels do we skip when creating the mask?
//    if ($.browser.webkit) this.COARSENESS = 3; 
    this.grid = new Array(); // a multidimensional array ([x][y]), holding co-ords for words
    var timer_i = 0;
    var timer; // timer used to incrementally call the arrange method
    this.doingArrange = false;
    this.wordsToArrange = 5; // how many words to arrange for each call to the arrange method
    var overWord = null; // what word is the user mousing over?
    var overX = 0; // position of the mouse when over a word
    var overY = 0;
    
    var _words = new Array(); // the list of word objects
    this.getWords = function() {
        return _words;
    }
    this.setWords = function(value) {
        _words = value;
    }
    
    this.sizeAdjustment = 100; // amount to multiply a word's relative size by
    
    this.minFontSize = 12;
    
    // for tracking sizes in word data
    this.largestWordSize = 0;
    this.smallestWordSize = 10000;
    
    var _uniqueWords = new Object(); // stores words as properties, making sure we don't have duplicates
    
    /**
     * Creates a word object and adds it to the list.
     * If the size value is outside the current max/min value, returns true (meaning we have to resize all the words).
     * @param	word
     * @param	size
     * @param	color
     * @param	label
     * @param	value
     * @return
     */
    function addWord(word, size, color, label, value) {
        var sizeChanged = false;
        if (_uniqueWords[word] == null) {
            _uniqueWords[word] = true;
            
            if (size > that.largestWordSize) {
                that.largestWordSize = size;
                sizeChanged = true;
            }
            if (size < that.smallestWordSize) {
                that.smallestWordSize = size * 0.8; // set the smallest size a bit smaller than the actual smallest size; this will insure all words are legible.
                sizeChanged = true;
            }
            var wordObj = new Word(word, size, color, label, value);
            _words.push(wordObj);
        }
        return sizeChanged;
    }
    
    /**
     * Adds an array of objects with the following properties: word, size, color, label, value.
     * @param	words
     */
    this.addWords = function(newWords) {
        var sizeChanged = false;
        for (var i = 0; i < newWords.length; i++) {
            var wordObj = newWords[i];
            
            var color;
            if (typeof(wordObj.color) == undefined || wordObj.color == null || wordObj.color == '') {
                color = app.colors[Math.floor(Math.random() * (app.colors.length))];
            } else color = wordObj.color;
            
            var size;
            if (typeof(wordObj.size) == undefined || wordObj.size == null || wordObj.size == '') {
                size = Math.floor(Math.random() * 40);
            } else size = parseFloat(wordObj.size);
            
            sizeChanged = addWord(wordObj.word, size, color, wordObj.label, wordObj.value) || sizeChanged;
        }
        sortWords();
        
        this.setRelativeSizes();
        this.calculateSizeAdjustment();
        if (sizeChanged) this.resizeWords();
        else createAllGraphics();
    }
    
    this.resetWordCoordinates = function() {
        app.clear();
        clearTimeout(timer);
        for (var i = 0; i < _words.length; i++) {
            var word = _words[i];
            word.x = 0;
            word.y = 0;
            word.tx = 0;
            word.ty = 0;
        }
    }
    
    this.calculateSizeAdjustment = function() {
    	this.ratio = app.canvas.width / app.canvas.height;
        var stageArea = app.canvas.width * app.canvas.height;
        if (stageArea < 100000) this.minFontSize = 8;
        else this.minFontSize = 12;
        var pixelsPerWord = stageArea / _words.length;
        var totalWordsSize = 0;
        for (var i = 0; i < _words.length; i++) {
            var word = _words[i];
            var wordArea = calculateWordArea(word);
            totalWordsSize += wordArea;
        }
        this.sizeAdjustment = stageArea / totalWordsSize;
    }
    
    function calculateWordArea(word) {
        var baseSize = Math.log(word.relativeSize * 10) * Math.LOG10E; // take the relativeSize (0.1 to 1.0), multiply by 10, then get the base-10 log of it
        var height = (baseSize + word.relativeSize) / 2; // find the average between relativeSize and the log
        var width = 0; //(baseSize / 1.5) * word.text.length;
        for (var i = 0; i < word.text.length; i++ ) {
            var letter = word.text.charAt(i);
            if (letter == 'f' || letter == 'i' || letter == 'j' || letter == 'l' || letter == 'r' || letter == 't') width += baseSize / 3;
            else if (letter == 'm' || letter == 'w') width += baseSize / (4 / 3);
            else width += baseSize / 1.9;
        }
        var wordArea = height * width;
        return wordArea;
    }
    
    // based on post from http://stackoverflow.com/questions/1134586/how-can-you-find-the-height-of-text-on-an-html-canvas
    // not really working yet
    function measureTextHeight(label) {
        app.context.fillStyle = 'rgb(255,255,255)';
        app.context.fillRect(label.x, label.y, label.width, label.height);
        label.draw(app.context);
        var imageData = app.context.getImageData(label.x, label.y, label.width, label.height);
        var first = false;
        var last = false;
        var y = label.height;
        var x = 0;
        while (!last && y) {
            y--;
            for (x = 0; x < label.width; x++) {
                var pixel = getPixel(x, y, imageData);
                if (pixel[0] != 255 || pixel[1] != 255 || pixel[2] != 255) {
                    last = y;
                    break;
                }
            }
        }
        while (y) {
            y--;
            for (x = 0; x < label.width; x++) {
                var pixel = getPixel(x, y, imageData);
                if (pixel[0] != 255 || pixel[1] != 255 || pixel[2] != 255) {
                    first = y;
                    break;
                }
            }
            if (first != y) {
                return last - first;
            }
        }
        return 0;
    }
    
    function measureDimensions(word) {
        app.context.save();
        app.context.textBaseline = 'alphabetic';
        app.context.font = word.fontSize + 'px '+ word.fontFamily;
        word.width = app.context.measureText(word.text).width;
        word.height = Math.ceil(app.context.measureText('m').width * 1.15); // initial estimate (make it bigger for when we actually measure the height)
        app.context.restore();
    }
    
    // returns an array [r, g, b, a]
    function getPixel(x, y, imageData) {
        var index = (x + y * imageData.width) * 4;
        return [imageData.data[index], imageData.data[index+1], imageData.data[index+2], imageData.data[index+3]];
    }
    
    function setPixel(imageData, x, y, r, g, b, a) {
        var index = (x + y * imageData.width) * 4;
        imageData.data[index] = r;
        imageData.data[index+1] = g;
        imageData.data[index+2] = b;
        imageData.data[index+3] = a;
    }
    
    function findNewRelativeSize(word, areaMultiplier) {
        var area = calculateWordArea(word) * areaMultiplier;
        // given the area = (x+6)*(2*x/3*y), solve for x
        var newRelativeSize = (Math.sqrt(6) * Math.sqrt(6 * Math.pow(word.text.length, 2) + area * word.text.length) - 6 * word.text.length) / (2 * word.text.length);
        return newRelativeSize;
    }
    
    /**
     * Determines the relative size for each word.
     * Call after all/new words are added and before createAllGraphics.
     */
    this.setRelativeSizes = function() {
    	for (var i = 0; i < _words.length; i++) {
            var word = _words[i];
            word.relativeSize = mapValue(word.origSize, this.smallestWordSize, this.largestWordSize, 0.1, 1);
        }
    }
    
    /**
     * Re-adds words using new adjusted sizes.
     * Run after the largestWordSize and/or smallestWordSize have changed.
     * Need to run manually, since it's intensive.
     */
    this.resizeWords = function() {
        app.clear();
        createAllGraphics();
        sortWords();
    }
    
    /**
     * Sort the word list by size, largest first.
     */
    function sortWords() {
        _words.sort(function(a, b) {
            if (a.origSize > b.origSize) return -1;
            else if (a.origSize < b.origSize) return 1;
            else return 0;
        });
    }
    
    /**
     * Creates the Label that gets displayed on the stage.
     * Randomly selects an angle from possible values.
     * Calculates the mask of the word (used in hit detection).
     * @param	wordObj
     */

    function createWordGraphics(wordObj) {
        var adjustedSize = findNewRelativeSize(wordObj, that.sizeAdjustment);
        wordObj.fontSize = adjustedSize > that.minFontSize ? adjustedSize : that.minFontSize;
        wordObj.fontFamily = myFont;
        
        measureDimensions(wordObj);
        // these values are needed for accurate x and y co-ordinates after rotating the word
        wordObj.tx = 0;
        wordObj.ty = wordObj.height;
        //~ var trueHeight = measureTextHeight(wordObj);
        //~ console.log(wordObj.height, trueHeight);
        //~ wordObj.height = trueHeight;
        
        var angle = 0;
        
        /*
        if (false) {
//        if (!$.browser.opera) {
            // opera can't render rotated text
//            if (wordObj.text.match(/\s/) == null) {
                if (Math.random() > 0.66) {
                    var tempHeight = wordObj.height;
                    var tempWidth = wordObj.width;
                    wordObj.height = tempWidth;
                    wordObj.width = tempHeight;
                    if (Math.round(Math.random()) == 0) {
                        angle = 90;
                        wordObj.ty = 0;
                    } else {
                        angle = -90;
                        wordObj.ty = wordObj.height;
                        wordObj.tx = wordObj.width;
                    }
                }
//            }
        }
        */
        

        wordObj.size = Math.max(wordObj.height, wordObj.width);
        wordObj.rotation = degreesToRadians(angle);
        
        // find the pixels that aren't transparent and store them as the mask
        app.context.fillStyle = app.canvas.style.backgroundColor;
        app.context.fillRect(0, 0, app.canvas.width, app.canvas.height);
        wordObj.draw(app.context);
        var imageData = app.context.getImageData(wordObj.x, wordObj.y, wordObj.width, wordObj.height);
        var mask = new Array();
        for (var x = 0; x < wordObj.width; x++) {
            var xm = Math.floor(x / that.COARSENESS) * that.COARSENESS;
            if (mask[xm] == null) mask[xm] = {};
            for (var y = 0; y < wordObj.height; y++) {
                var ym = Math.floor(y / that.COARSENESS) * that.COARSENESS;
                var pixel = getPixel(x, y, imageData);
                var pixelColor = 'rgb('+pixel[0]+', '+pixel[1]+', '+pixel[2]+')';
                if (pixelColor != app.canvas.style.backgroundColor) {
                    mask[xm][ym] = true;
                }
                if (mask[xm][ym]) {
                    y = ym + that.COARSENESS; // there's a match, so skip ahead
                    continue;
                }
            }
        }
        wordObj.mask = mask;
    }
    
    /**
     * Helper method which runs createWordGraphics for all the words.
     */
    function createAllGraphics() {
    	for (var i = 0; i < _words.length; i++) {
            createWordGraphics(_words[i]);
        }
    }
    
    /**
     * Arrange the words on the stage using the chosen layout scheme.
     */
    this.arrangeWords = function() {
//    	console.profile();
        clearTimeout(timer);
        app.clear(); // reset canvas
        
        this.toggleLoadingText();

        if (_words.length > 0) {
            
            this.grid = [];
            timer_i = 0; // used as the increment for the word list
      
            function doArrange() {                
                // common variables between the layout schemes
                var x;
                var y;
                var word;
                var breakOut;
                var fail;
                var wordCount = this.wordsToArrange - 1;
                var appCanvasWidth = app.canvas.width;
                var appCanvasHeight = app.canvas.height;
                var halfWidth = appCanvasWidth * 0.5;
                var halfHeight = appCanvasHeight * 0.5;
                var dd = 0.05;

                do {
                    word = _words[timer_i];
                    if (word !== undefined) {
	                    var a = Math.random() * Math.PI; // angle?
	                    var d = Math.random() * (word.size * 0.25); // diameter?
	                    var da = (Math.random() - 0.5) * 0.5;
	                    var halfWordWidth = word.width * 0.5;
	                    var halfWordHeight = word.height * 0.5;
	
	                    while (true) {
	                        x = Math.floor((halfWidth + (Math.cos(a) * d * this.ratio) - halfWordWidth) / this.COARSENESS) * this.COARSENESS;
	                        y = Math.floor((halfHeight + (Math.sin(a) * d) - halfWordHeight) / this.COARSENESS) * this.COARSENESS;
	
	                        fail = false;
	                        if (x + halfWordWidth >= appCanvasWidth || y + halfWordHeight >= appCanvasHeight) {
	                            fail = true;
	                        } else {
	                        	fail = hitTest(x, y, word.height, word.width, word.mask);
	                        }
	                        if (!fail) {
	                            break;
	                        }
	                        a += da;
	                        d += dd;
	                    }
	
	                    finalizeWord(x, y, word);
	                    if (app.useFadeEffect) {
	                    	word.alpha = 0;
		                    for (var w = 0; w < timer_i; w++) {
		                        var wrd = _words[w];
		                        if (wrd.alpha < 1) fadeWord(wrd);
		                    }
	                    } else {
	                    	word.alpha = 1;
	                    	word.draw(app.context);
	                    }
                    }
                    timer_i++;
                    if (timer_i >= _words.length) {
                        clearTimeout(timer);
//                        console.profileEnd();
                        this.doingArrange = false;
                        
                        this.toggleLoadingText(false);                               
                        
                        drawWords();
                        
                        break;
                    }
                } while (wordCount--);
            }
            
            /**
             * Test the mask of a word against the overall grid to see if they intersect.
             * @param	x
             * @param	y
             * @param	h
             * @param	w
             * @param	mask
             * @return
             */
            function hitTest(x, y, h, w, mask) {
                for (var xt = 0; xt <= w; xt += this.COARSENESS) {
                    for (var yt = 0; yt <= h; yt += this.COARSENESS) {
                        if (mask[xt] && mask[xt][yt] && this.grid[xt + x] != null && this.grid[xt + x][yt + y] != null) {
                            return true;
                        }
                    }
                }
                return false;
            }
            
            /**
             * Set the new position of the word, and make it visible.
             * @param	x
             * @param	y
             * @param	word
             * @param   drawIt
             */
            function finalizeWord(x, y, word, drawIt) {
                set_grid(x, y, word);

                word.x = x;
                word.y = y;

                word.live = true;
                if (drawIt) {
                	/*
                    if ($.browser.webkit) {
                        // cover the canvas with a transparent rectangle
                        // forces webkit to show the words
                        app.context.fillStyle = 'rgba(0,0,0,0)';
                        app.context.fillRect(0, 0, app.canvas.width, app.canvas.height);
                    }
                    */
                    word.draw(app.context);
                }
            }
            
            function fadeWord(word) {
                word.alpha += 0.25;
//                if ($.browser.webkit) {
                    // cover the canvas with a transparent rectangle
                    // forces webkit to show the words
//                    app.context.fillStyle = 'rgba(0,0,0,0)';
//                    app.context.fillRect(0, 0, app.canvas.width, app.canvas.height);
//               }
                word.draw(app.context);
            }

            /**
             * Mark the spots on the grid where the word is located.
             * @param	x
             * @param	y
             * @param	word
             */
            function set_grid(x, y, word) {
                for (var xt = 0; xt < word.width; xt += this.COARSENESS) {
                    for (var yt = 0; yt < word.height; yt += this.COARSENESS) {
                        if (word.mask[xt] && word.mask[xt][yt]) {
                            if (!this.grid[xt + x]) this.grid[xt + x] = [];
                            this.grid[xt + x][yt + y] = word;
                        }
                    }
                }
            }
            
            doArrange = doArrange.createDelegate(this);
            hitTest = hitTest.createDelegate(this);
            finalizeWord = finalizeWord.createDelegate(this);
            fadeWord = fadeWord.createDelegate(this);
            set_grid = set_grid.createDelegate(this);
            this.doingArrange = true;
            
//            if ($.browser.mozilla) {
//                // FF needs more time to perform each layout run
//                timer = setInterval(doArrange, 250);
//            } else {
                timer = setInterval(doArrange, 50);
//            }
            
        } else {
            alert("Error: There are no words to arrange.");
        }
    }
    
    this.toggleLoadingText = function(show) {
        app.context.save();
        
        if (show) app.context.fillStyle = 'black';
        else app.context.fillStyle = app.canvas.style.backgroundColor;
        
        app.context.textBaseline = 'top';
        app.context.font = '10px Arial';
        var offset = app.context.measureText('Loading').width + 10;
        app.context.fillText('Loading', app.canvas.width - offset, 10);
        
        app.context.restore();
    }
    
    this.startUpdates = function() {
    	timer = setInterval(drawWords, that.UPDATE_RATE);
    }
    
    this.stopUpdates = function() {
    	if (overWord != null) {
	    	// remove existing tooltip
	    	overWord = null;
	    	drawWords();
    	}
    	clearTimeout(timer);
    }
    
    function drawWords() {
        app.clear();
        var i = _words.length;
        while(i--) {
        	var word = _words[i];
            word.alpha = 1;
            if (word.live) word.draw(app.context);
        }
        var $canvasEl = $(app.canvas);
        if (overWord != null) {
        	// add pointer cursor
        	$canvasEl.css('cursor', 'pointer');
        	
            // draw the tooltip
            app.context.save();
            app.context.textBaseline = 'alphabetic';
            app.context.font = '12px Arial';
            
            var wordWidth = app.context.measureText(overWord.text).width;
            var valueWidth = app.context.measureText(overWord.value).width;
            var maxWidth = wordWidth > valueWidth ? wordWidth : valueWidth;
            maxWidth += 20;
            
            var x = overX + 15;
            var y = overY + 25;
            var appWidth = $canvasEl.width();
            var appHeight = $canvasEl.height();
            if (x + maxWidth >= appWidth) {
            	x -= maxWidth;
            }
            if (y + 40 >= appHeight) {
            	y -= 40;
            }
            
            app.context.fillStyle = 'rgba(255,255,255,0.9)';
            app.context.strokeStyle = 'rgba(100,100,100,0.9)';
            app.context.translate(x, y);
            app.context.fillRect(0, 0, maxWidth, 40);
            app.context.strokeRect(0, 0, maxWidth, 40);
            app.context.fillStyle = 'rgba(0,0,0,0.9)';
            app.context.fillText(overWord.text+':', 8, 18);
            app.context.fillText(overWord.value, 8, 30);
            app.context.restore();
        } else {
        	$canvasEl.css('cursor', 'default');
        }
    }
    
    /**
     * Checks to see if the mouse is currently over a word.
     * @param	event
     */
    this.handleMouseMove = function(event) {
        if (!this.doingArrange) {
        	var i = _words.length;
            while(i--) {
                _words[i].isOver = false;
            }
            var offset = $(app.canvas).offset();
            var remainder = (event.pageX - offset.left) % this.COARSENESS;
            var x = (event.pageX - offset.left) - remainder;
            remainder = (event.pageY - offset.top) % this.COARSENESS;
            var y = (event.pageY - offset.top) - remainder;
            overWord = this.findWordByCoords(x, y);
            if (overWord != null) {
                overWord.isOver = true;
                overX = x;
                overY = y;
            }
        }
    }
    
    /**
     * Checks to see if a word was clicked on, and then sends out the corresponding event.
     * @param	event
     * @return
     */
    this.handleWordClick = function(event) {
        var offset = $(app.canvas).offset();
        var remainder = (event.pageX - offset.left) % this.COARSENESS;
        var x = (event.pageX - offset.left) - remainder;
        remainder = (event.pageY - offset.top) % this.COARSENESS;
        var y = (event.pageY - offset.top) - remainder;
        var matchingWord = this.findWordByCoords(x, y);
        
        if (matchingWord != null) {
            return {text: matchingWord.text, value: matchingWord.value};
        }
    }
    
    /**
     * Returns the word which occupies the co-ordinates that were passed in.
     * @param	x
     * @param	y
     * @return
     */
    this.findWordByCoords = function(x, y) {
        var matchingWord = null;
        if (this.grid[x] !=  null) {
            if (this.grid[x][y] != null) {
                matchingWord = this.grid[x][y];
            } else if (this.grid[x][y + this.COARSENESS] != null) {
                matchingWord = this.grid[x][y + this.COARSENESS];
            }
        }
        if (matchingWord == null && this.grid[x + this.COARSENESS] != null) {
            if (this.grid[x + this.COARSENESS][y] != null) {
                matchingWord = this.grid[x + this.COARSENESS][y];
            } else if (this.grid [x + this.COARSENESS][y + this.COARSENESS] != null) {
                matchingWord = this.grid[x + this.COARSENESS][y + this.COARSENESS];
            }
        }
        
        return matchingWord;
    }
    
    /**
     * Convert an angle in degrees to radians.
     * @param	degrees
     * @return
     */
    function degreesToRadians(degrees) {
        var radians = degrees * (Math.PI / 180);
        return radians;
    }
    
    /**
     * Convenience function to map a variable from one coordinate space to another (from processing).
     */
    function mapValue(value, istart, istop, ostart, ostop) {
        return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
    }
    
}

// from Ext
Function.prototype.createDelegate = function(obj, args, appendArgs){
    var method = this;
    return function() {
        var callArgs = args || arguments;
        if (appendArgs === true){
            callArgs = Array.prototype.slice.call(arguments, 0);
            callArgs = callArgs.concat(args);
        }else if (typeof appendArgs=="number"){
            callArgs = Array.prototype.slice.call(arguments, 0); // copy arguments first
            var applyArgs = [appendArgs, 0].concat(args); // create method call params
            Array.prototype.splice.apply(callArgs, applyArgs); // splice them in
        }
        return method.apply(obj || window, callArgs);
    };
}
Ext.define('Voyant.util.Api', {
	constructor: function(config) {
		var apis = [];
		if (!this.isApplication) {
			var app = this.getApplication();
			this.addParentApi(apis, Ext.ClassManager.getClass(app)); // gather class params
			if (app.getApiParams) {
				apis.push(this.getApplication().getApiParams()); // now add instance params, last
			}
		}

		this.addParentApi(apis, Ext.ClassManager.getClass(this)); // add params from this class and parents
		
		this.api = {};
		apis.forEach(function(a) {
			for (key in a) {
				this.api[key] = {initial: a[key], value: a[key]} // overwrite previous entries
			}
		}, this)
		
    	var queryParams = Ext.Object.fromQueryString(document.location.search);
    	for (var key in queryParams) {
    		if (this.api[key]) {
    			this.setApiParam(key, queryParams[key]);
    		}
    	}
	},
	addParentApi: function(apis, clz) {
		if (clz.api) {apis.splice(0,0, clz.api)} // add to front
		if (clz.superclass) {this.addParentApi(apis, clz.superclass.self)}
	},
	getApiParam: function(key, defaultValue) {
		return this.api[key]!==undefined ? this.api[key].value : defaultValue
	},
	getApiParams: function(keys, keepEmpty) {
		keys = keys || Object.keys(this.api);
		var api = {};
		if (Ext.isString(keys)) {keys=[keys]}
		keys.forEach(function(key) {
			var val = this.getApiParam(key);
			if (keepEmpty || !Ext.isEmpty(val)) {api[key]=val;}

		}, this);
		return api;
	},
	
	getModifiedApiParams: function() {
		var api = {};
		for (var key in this.api) {
			if (this.api[key].initial!=this.api[key].value) {
				api[key]=this.api[key].value
			}
		}
		return api
	},
	
	setApiParams: function(config) {
		for (var key in config) {this.setApiParam(key, config[key])}
	},
	
	setApiParam: function(key, value) {
		if (this.api && this.api[key]) {this.api[key].value=value;}
	}
});
/**
 * This is a test
 * 
 * @author Stéfan Sinclair
 * @since 4.0
 * @class Voyant.util.Localization
 */
Ext.define('Voyant.util.Localization', {
	statics: {
		DEFAULT_LANGUAGE: 'en',
		LANGUAGE: 'en'
	},
	
    languageStore: Ext.create('Ext.data.ArrayStore', {
        fields: ['code', 'language'],
        data : [
                ['en', 'English']
        ]
    }),
	
	getLanguage: function(code) {
		var record = this.languageStore.findRecord(code.length==2 ? 'code' : 'language', code);
		if (record) {return record.get(code.length==2 ? 'language' : 'code');}
	},
	
	/**
	 * This is a test
	 */
	localize: function(key, config) {
		return this._localizeObject(this, key, config);
	},
	
	_localizeObject: function(object, key, config) {

		var val = this._localizeClass(Ext.ClassManager.getClass(object), key, config);
		if (val) {return val;}
		if (object.mixins) { // look at mixins first
			for (mixin in object.mixins) {
				var val = this._localizeClass(Ext.ClassManager.getClass(object.mixins[mixin]), key, config);
				if (val) {return val;}
			}
		}
		if (object.superclass) { // then superclasses
			val =  this._localizeObject(object.superclass, key, config);
			if (val) {return val;}
		}
		return config && config['default']!=undefined ? config['default'] : '['+key+']';
	},
	
	_localizeClass: function(clazz, key, config) {
		if (clazz && clazz.i18n && clazz.i18n[key]) {
			var use = false;
			if (clazz.i18n[key][Voyant.util.Localization.LANGUAGE]) {
				use = clazz.i18n[key][Voyant.util.Localization.LANGUAGE];
			}
			else if (clazz.i18n[key][Voyant.util.Localization.DEFAULT_LANGUAGE]) {
				use = clazz.i18n[key][Voyant.util.Localization.DEFAULT_LANGUAGE];
			}
			if (use) {
				if (use.isTemplate) { // template
					return use.apply(config);
				}
				return use; // string
			}
			return config && config['default']!=undefined ? config['default'] : '['+key+']'; // no language key found, so just return the key
		}
		return false
	}
	
});

Ext.define('Voyant.util.Deferrable', {
	deferredStack : [],

	releaseAllDeferred : function() {
		this.deferredStack = [];
	},

	getDeferredCount : function() {
		return this.deferredStack.length;
	},
	
	getDeferred: function(transferable) {

		var deferred = jQuery.Deferred();
		
		// transfer methods to the promise
		var promise = this.getPromiseFromDeferred(deferred);

		if (transferable && transferable.transfer) {
			transferable.transfer(transferable, promise)
		}
		
		if (!promise.show && window.show) {promise.show=show}

		this.deferredStack.push(deferred);
		
		var me = this;
		promise.always(function() {
			me.deferredStack.pop();
		});
			
		return deferred;
	},
	
	getPromiseFromDeferred: function(dfd) {
		return typeof dfd.promise === "object" ? dfd.promise : dfd.promise();
	},
	
	getDeferredNestedPromise: function(promise, args, transferable) {
		var callee = arguments.callee.caller; // TODO: is callee.caller in terms of nested functions?
		var dfd = Voyant.application.getDeferred(transferable);
		promise.then(function(promised) {
			dfd.resolve(callee.apply(promised, args))
		}).fail(function() {
			dfd.reject.apply(this, arguments)
		});
		return dfd.promise;
	}
});

Ext.define("Voyant.util.DetailedError", {
	extend: "Ext.Error",
	mixins: ['Voyant.util.Localization'],
	config: {
		msg: undefined,
		error: undefined,
		details: undefined
	},
	statics: {
		i18n: {
			error: {en: "Error"}
		}
	},
	constructor: function(config) {
		this.setMsg(config.msg);
		this.setError(config.error);
		this.setDetails(config.details);
		this.callParent(arguments);
//		debugger
//		this.show();
	},
	
	show: function(config) {
		if (window.showError) {showError.call(this);}
		else {this.showMsg(config)}
	},
	
	showMsg: function(config) {
		config = config || {};
		Ext.applyIf(config, {
			message: this.getMsg()+"<p class='error'>\n"+this.getError()+"… "+
				"<a href='#' onclick=\"window.open('').document.write(unescape('<pre>"+escape(this.getDetails())+"</pre>')); return false;\">more</a></p>",
			title: this.localize("error"),
		    buttons: Ext.Msg.OK,
		    icon: Ext.MessageBox.ERROR,
		    autoScroll: true
		});
		Ext.Msg.show(config);
	}
})

Ext.define("Voyant.util.ResponseError", {
	extend: "Voyant.util.DetailedError",
	config: {
		response: undefined
	},
	constructor: function(config) {
		this.setResponse(config.response);
		Ext.applyIf(config, {
			msg: config.response.statusText, // hopefully already set by creator
			error: config.response.responseText.split(/(\r\n|\r|\n)/).shift(), // show first line of response
			details: config.response.responseText
		})
		this.callParent(arguments);
	}
	
})

Ext.define('Voyant.util.SparkLine', {
	/**
	 * Gets a Google spark line.
	 * 
	 * @param {Array} values An array of numerical values.
	 * @param {Integer} stretch The width to stretch the spark line towards (currently unused).
	 * @return {String} The image(s) of the spark line.
	 */
	getSparkLine : function(values, stretch) {
		if (values.length < 2) {
			return '';
		}
		var min = Number.MAX_VALUE;
		var max = Number.MIN_VALUE;
		var hasDecimal = false;
		for ( var i = 0; i < values.length; i++) {
			if (values[i] < min) {
				min = values[i];
			}
			if (values[i] > max) {
				max = values[i];
			}
			if (!hasDecimal
					&& values[i].toString().indexOf('.') > -1) {
				hasDecimal = true;
			}
		}
		var dif = (max - min).toString();
		var multiplier = 1;
		var divider = 1;

		var newvalues = [];
		if (hasDecimal) {
			var multiplier = 100;
			var ind = dif.indexOf(".") + 1;
			for ( var i = ind; i < dif.length; i++) {
				if (dif.charAt(i) == '0') {
					multiplier *= 10;
				} else {
					break;
				}
			}
			for ( var i = 0; i < values.length; i++) {
				newvalues[i] = parseInt(values[i] * multiplier);
			}
			max = parseInt(max * multiplier);
			min = parseInt(min * multiplier);

		} else {
			var divider = 1;
			for ( var i = dif.length - 1; i > -1; i--) {
				if (dif.charAt(i) == '0') {
					divider *= 10;
				} else {
					break;
				}
			}
			if (divider != 1) {
				for ( var i = 0; i < values.length; i++) {
					newvalues[i] = values[i] / divider;
				}
				max /= divider;
				min /= divider;
			} else {
				newvalues = values;
			}
		}

		var valLen = (max.toString().length > min.toString().length ? max
				.toString().length
				: min.toString().length) + 1;
		var valuesPerImage = Math.floor(1800 / valLen);
		var baseUrl = 'http://chart.apis.google.com/chart?cht=ls&amp;chco=0077CC&amp;chls=1,0,0&amp;chds='+ min + ',' + max;
		var images = Math.ceil(values.length / valuesPerImage);
		var counter = 0;
		var response = '';
		var wid;
		if (values.length < 5) {
			wid = 5;
		} else if (values.length < 10) {
			wid = 4;
		} else if (values.length < 20) {
			wid = 3;
		} else if (values.length < 50) {
			wid = 2;
		} else {
			wid = 1;
		}

		/*
		 * if (stretch) { wid =
		 * Math.ceil(stretch/values.length); if (wid>5) {wid=5;} }
		 */

		for ( var i = 0; i < images; i++) {
			var vals = newvalues.slice(counter,
					counter += valuesPerImage);
			response += "<img style='margin: 0; padding: 0;' border='0' src='"
					+ baseUrl
					+ '&amp;chs='
					+ (wid * vals.length)
					+ 'x15&amp;chd=t:'
					+ vals.join(',') + "' alt='' class='chart-";
			if (images == 1) {
				response += 'full';
			} else {
				if (i > 0 && i + 1 < images) {
					response + 'middle';
				} else if (i == 0) {
					response += 'left';
				} else {
					response += 'right';
				}
			}
			response += "' />";
		}
		return response;
	}
});
Ext.define('Voyant.util.Toolable', {
	requires: ['Voyant.util.Localization'],
	statics: {
		i18n: {
			maximizeTip: {en: 'Open this tool in a new window'},
			plusTip: {en: 'Click to choose another tool for this panel location (this will replace the current tool).'},
			saveTip: {en: 'Export a URL, an embeddable tool, data or a bibliographic reference.'},
			gearTip: {en: 'Define options for this tool.'},
			helpTip: {en: 'No tool-specific help is currently available. Click this icon to visit the <a href="http://docs.voyant-tools.org/" target="_blank">Voyant Tools Documentation</a> site.'},
			exportTitle: {en: "Export"},
			exportViewUrl: {en: 'a URL for this view (tools and data)'},
			exportViewFieldset: {en: 'Export View (Tools and Data)'},
			exportViewHtmlEmbed: {en: "an HTML snippet for embedding this view in another web page"},
			exportViewHtmlEmbed: {en: "an HTML snippet for embedding this view in another web page"},
			exportViewEmbedTitle: {en: "Embed HTML Snippet"},
			exportViewEmbedMessage: {en: "You can copy and paste the HTML snippet from the box below into another web page. Note that some content management systems (like WordPress) may need a special plugin to handle &lt;iframe&gt; tags."},
			exportBiblioTitle: {en: "Export Bibliographic Reference"},
			exportViewBiblio: {en: "a bibliographic reference for this view"},
			exportGridCurrent: {en: "Export Current Data"},
			exportGridCurrentHtml: {en: "export current data as HTML"},
			exportGridCurrentJson: {en: "export current data as JSON"},
			exportGridCurrentTsv: {en: "export current data as tab separated values (text)"},
			'export': {en: 'Export'},
			exportTitle: {en: 'Export'},
			confirmTitle: {en: 'Confirm'},
			cancelTitle: {en: 'Cancel'},
			exportError: {en: "Export Error"},
			exportNoFunction: {en: "An export function has been defined by is not availble."},
			exportDataHtmlMessage: {en: "Copy the data below, they can be pasted into an HTML page or used as XML."},
			exportDataTsvMessage: {en: "Copy data below, they can be pasted into a spreadsheet or text file."},
			exportDataJsonMessage: {en: "Copy the data below, they can be used in other web-based applications."},
    		exportPng: {en: "export a PNG image of this visualization"},
			exportDataTitle: {en: "Export Data"},
			exportVizTitle: {en: "Export Visualization"},
			exportPngTitle: {en: "Export PNG"},
    		exportSvg: {en: "export the SVG of this visualization"},
			exportPngMessage: {en: "<p>This is a thumbnail of the PNG image, right-click or ctrl-click on the image to save a full-size copy on your hard drive.</p><p>Alternatively, copy the HTML code below.</p>"},
			exportSvgTitle: {en: "Export SVG"},
			exportSvgMessage: {en: "<p>This is a thumbnail of the SVG image, right-click or ctrl-click on the image to save a full-size copy on your hard drive.</p><p>Alternatively, copy the SVG code below.</p>"}
		}
	},
	constructor: function(config) {
		config = config || {};
		var me = this;
		var moreTools = undefined;
		var parent = this.up('component');
		if (config.moreTools) {
			moreTools = [];
			config.moreTools.forEach(function(xtype) {
				 if (xtype && xtype!=this.xtype) {
					moreTools.push(this.getMenuItemFromXtype(xtype));
				 }

			}, this)
		}
		else if (parent && parent.getInitialConfig('moreTools')) {
			moreTools = [];
			 parent.getInitialConfig('moreTools').forEach(function(xtype) {
				 if (xtype && xtype!=this.xtype) {
					moreTools.push(this.getMenuItemFromXtype(xtype));
				 }

			}, this)
		}
		if (moreTools && this.getApplication().getMoreTools) {
			moreTools.push("-");
		}
		if (this.getApplication().getMoreTools) {
			moreTools = moreTools || [];
			var app = this.getApplication();
			var tools = app.getMoreTools();
			tools.forEach(function(category) {
				var categories = [];
				category.items.forEach(function(subcategory) {
					var subcategories = [];
					subcategory.items.forEach(function(xtype) {
						subcategories.push(this.getMenuItemFromXtype(xtype))
					}, this)
					categories.push({
						text: app.localize(subcategory.i18n),
						glyph: subcategory.glyph,
						menu: {items: subcategories}
					})
				}, this);
				moreTools.push({
					text: app.localize(category.i18n),
					glyph: category.glyph,
					menu: {items: categories}
				})
			}, this);
		}			

		var exportItems = undefined;
		var toolsMap = {
//				maximize: {
//					glyph: 'xf08e@FontAwesome',
//					fn: this.maximizeToolClick
//				},
				save: {
					glyph: 'xf08e@FontAwesome',
					fn: this.exportToolClick,
					items: exportItems
				},
				plus: moreTools ? {
					glyph: 'xf17a@FontAwesome',
					items: moreTools
				} : undefined,
				gear: this.showOptionsClick || this.getOptions ? {
					glyph: 'xf205@FontAwesome',
					fn: this.showOptionsClick ? this.showOptionsClick : function(panel) {
						if (panel.isXType("voyanttabpanel")) {panel = panel.getActiveTab()}
						// we're here because the panel hasn't overridden the click function
						Ext.create('Ext.window.Window', {
							title: panel.localize("exportTitle"),
							modal: true,
			            	panel: panel,
							items: {
								xtype: 'form',
								items: panel.getOptions(),
								buttons: [{
					            	text: panel.localize("confirmTitle"),
									glyph: 'xf00c@FontAwesome',
					            	flex: 1,
					            	panel: panel,
					        		handler: function(btn) {
					        			var values = btn.up('form').getValues();
					        			
					        			// set api values (all of them, not just global ones)
					        			this.setApiParams(values);

					        			var app = this.getApplication();
					        			var corpus = app.getCorpus();
					        			
					        			// treat stopwords differently since they can be set globally
					        			if (values['stopList'] != undefined && values['stopListGlobal'] != undefined && values.stopListGlobal) {
					        				
					        				// set the api value for the app
					        				if (app.setApiParams) {
					        					app.setApiParams({stopList: values.stopList})
					        				}
					        				
					        				// tell the panels, including this one
					        				var panels = app.getViewport().query("panel,chart");
					        				for (var i=0; i<panels.length; i++) {
					        					if (panels[i].setApiParams) {
					        						panels[i].setApiParams({stopList: values.stopList});
					        					}
					        				}
					        				
					        				// trigger a reloading of the app
					        				if (corpus) {app.dispatchEvent("loadedCorpus", this, corpus);}
					        			}
					        			
					        			// otherwise dispatch changes to this tool and reload corpus
					        			else {
					        				if (corpus) {this.fireEvent("loadedCorpus", this, corpus);}
					        			}
					        			btn.up('window').close();
					        		},
					        		scope: panel
					            }, {
					            	text: panel.localize("cancelTitle"),
					                glyph: 'xf00d@FontAwesome',
					        		flex: 1,
					        		handler: function(btn) {
					        			btn.up('window').close();
					        		}
								}]
							},
							bodyPadding: 5
						}).show()
					}
				} : undefined,
				help: {
					glyph: 'xf128@FontAwesome',
					fn: this.helpToolClick
				}
		}
		var tools = [];
		
		// check to see if there are tool objects configured
		if (config.includeTools) {
			for (var tool in config.includeTools) {
				if (typeof config.includeTools[tool] == "object") {
					tools.push(config.includeTools[tool])
				}
			}
		}
		
		
		for (var tool in toolsMap) {
			if (config.includeTools && !config.includeTools[tool] || !toolsMap[tool]) {continue;}
			tools.push({
				type: tool,
				tooltip: this.localize(tool+"Tip"),
				callback: toolsMap[tool].fn,
				xtype: 'toolmenu',
				glyph: toolsMap[tool].glyph,
				items: toolsMap[tool].items
			})
		}
		
		Ext.apply(this, {
			tools: tools
		})
		this.on("afterrender", function() {
			var header = this.getHeader();
			if (header) {
				var el = header.getEl();
				el.on("mouseover", function() {
					this.getHeader().getTools().forEach(function(tool) {
						tool.show();
					})
				}, this);
				el.on("mouseout", function() {
					this.getHeader().getTools().forEach(function(tool) {
						if (tool.type!='help' && tool.type.indexOf('collapse')==-1) {tool.hide();}
					})
				}, this);
				header.getTools().forEach(function(tool,i) {
					if (tool.type!='help') {tool.hide();}
				});
			}
		}, this)
	},
	getMenuItemFromXtype: function(xtype) {
		var xt = xtype;
		var config = this.getApplication().getToolConfigFromToolXtype(xtype);
		if (config && config.tooltip) {
			delete config.tooltip // don't use this for now since it causes problems in the menu
		}
		return Ext.apply(Ext.clone(config), {
			xtype: 'menuitem',
			text: config.title,
			textAlign: 'left',
			handler: function() {this.replacePanel(config.xtype)},
			scope: this
		})
	},
	maximizeToolClick: function(panel) {
		var name = Ext.getClass(panel).getName();
		var parts = name.split(".");
		url = panel.getBaseUrl()+"tool/"+parts[parts.length-1]+"/";
		params = panel.getModifiedApiParams();
		if (!params.corpus && panel.getCorpus && panel.getCorpus()) {
			params.corpus = panel.getCorpus().getId();
		}
		if (params) {url += "?"+Ext.Object.toQueryString(params);}
		panel.openUrl(url);
	},
	exportToolClick: function(panel) {
		if (panel.isXType('voyanttabpanel')) {panel = panel.getActiveTab()}
		var items = [{
	       		xtype: 'radio',
	       		name: 'export',
	       		inputValue: 'url',
	       		boxLabel: "<a href='"+panel.getExportUrl.call(panel)+"' target='_blank'>"+panel.localize('exportViewUrl')+"</a>",
	       		checked: true,
	       		listeners: {
	       			afterrender: function() {
	       				this.boxLabelEl.on("click", function() {
	       					this.up('window').close()
	       				}, this)
	       			}
	       		}
		},{
	       xtype: 'fieldset',
	       collapsible: true,
	       collapsed: true,
	       title: panel.localize('exportViewFieldset'),
	       items: [{
	       		xtype: 'radio',
	       		name: 'export',
	       		inputValue: 'embed',
	       		boxLabel: panel.localize('exportViewHtmlEmbed')
	       	},{
	       		xtype: 'radio',
	       		name: 'export',
	       		inputValue: 'biblio',
	       		boxLabel: panel.localize('exportViewBiblio')
	       	}]
		}]
		if (panel.isXType('grid')) {
			items.push({
		       xtype: 'fieldset',
		       collapsible: true,
		       collapsed: true,
		       title: panel.localize('exportGridCurrent'),
	    	   items: [{
		       		xtype: 'radio',
		       		name: 'export',
		       		inputValue: 'gridCurrentHtml',
		       		boxLabel: panel.localize('exportGridCurrentHtml')
	    	   },{
		       		xtype: 'radio',
		       		name: 'export',
		       		inputValue: 'gridCurrentTsv',
		       		boxLabel: panel.localize('exportGridCurrentTsv')
	    	  	},{
		       		xtype: 'radio',
		       		name: 'export',
		       		inputValue: 'gridCurrentJson',
		       		boxLabel: panel.localize('exportGridCurrentJson')
	    	   }]
			})
		}
		if ((!panel.getExportVisualization || panel.getExportVisualization()) && (panel.down("chart") || panel.getTargetEl().dom.querySelector("canvas") || panel.getTargetEl().dom.querySelector("svg"))) {
			var formats = [{
				xtype: 'radio',
				name: 'export',
				inputValue: 'png',
				boxLabel: panel.localize('exportPng')
	    	}];
			if (panel.getTargetEl().dom.querySelector("svg")) {
				formats.push({
					xtype: 'radio',
					name: 'export',
					inputValue: 'svg',
					boxLabel: panel.localize('exportSvg')
				})
			}
			items.push({
			       xtype: 'fieldset',
			       collapsible: true,
			       collapsed: true,
			       title: panel.localize('exportVizTitle'),
		    	   items: formats
	    	});
		}
		Ext.create('Ext.window.Window', {
			title: panel.localize("exportTitle"),
			modal: true,
			items: {
				xtype: 'form',
				items: items,
				buttons: [{
	            	text: panel.localize("exportTitle"),
					glyph: 'xf08e@FontAwesome',
	            	flex: 1,
	            	panel: panel,
	        		handler: function(btn) {
	        			var form = btn.up('form');
	        			var fn = 'export'+Ext.String.capitalize(form.getValues()['export']);
	        			if (Ext.isFunction(panel[fn])) {
	        				panel[fn].call(panel, panel, form)
	        			}
	        			else {
	        				Ext.Msg.show({
	        				    title: panel.localize('exportError'),
	        				    message: panel.localize('exportNoFunction'),
	        				    buttons: Ext.Msg.OK,
	        				    icon: Ext.Msg.ERROR
	        				});
	        			}
	        			btn.up('window').close();
	        		},
	        		scope: panel
	            }, {
	            	text: panel.localize("cancelTitle"),
	                glyph: 'xf00d@FontAwesome',
	        		flex: 1,
	        		handler: function(btn) {
	        			btn.up('window').close();
	        		}
				}]
			},
			bodyPadding: 5
		}).show()
	},
	exportSvg: function(img) {
		var svg = this.getTargetEl().dom.querySelector("svg");
		if (svg) {
			var html = d3.select(svg)
				.attr("version", 1.1)
				.attr("xmlns", "http://www.w3.org/2000/svg")
				.node().parentNode.innerHTML
			Ext.Msg.show({
			    title: this.localize('exportSvgTitle'),
			    message: '<img src="'+'data:image/svg+xml;base64,'+ btoa(html)+'" style="float: right; max-width: 200px; max-height: 200px; border: thin dotted #ccc;"/>'+this.localize('exportSvgMessage'),
			    buttons: Ext.Msg.OK,
			    icon: Ext.Msg.INFO,
			    prompt: true,
		        multiline: true,
		        value: html
			});		
		}
	},
	exportPngData: function(img) {
		Ext.Msg.show({
		    title: this.localize('exportPngTitle'),
		    message: '<img src="'+img+'" style="float: right; max-width: 200px; max-height: 200px; border: thin dotted #ccc;"/>'+this.localize('exportPngMessage'),
		    buttons: Ext.Msg.OK,
		    icon: Ext.Msg.INFO,
		    prompt: true,
	        multiline: true,
	        value: '<img src="'+img+'" />'
		});		
	},
	exportPng: function() {
		var img;
		var chart = this.down('chart'); // first try finding a chart
		if (chart) {
			return this.exportPngData(this.down('chart').getImage().data);
		}

		var canvas = this.getTargetEl().dom.querySelector("canvas"); // next try finding a canvas
		if (canvas) {
			return this.exportPngData(canvas.toDataURL("image/png"));
		}
		
		
		var svg = this.getTargetEl().dom.querySelector("svg"); // finally try finding an SVG
		if (svg) {
			var html = d3.select(svg)
				.attr("version", 1.1)
				.attr("xmlns", "http://www.w3.org/2000/svg")
				.node().parentNode.innerHTML;
			  img = 'data:image/svg+xml;base64,'+ btoa(html);
			  
			  var canvas = Ext.DomHelper.createDom({tag:'canvas',width: svg.offsetWidth,height:svg.offsetHeight}),
			  context = canvas.getContext("2d"), me=this;
			  
			  var image = new Image;
			  image.src = img;
			  image.panel = this;
			  image.onload = function() {
				  context.drawImage(image, 0, 0);
				  img = canvas.toDataURL("image/png");
				  return this.panel.exportPngData.call(this.panel, img);
			  };
		}
	},
	exportUrl: function() {
		this.openUrl(this.getExportUrl());
	},
	exportEmbed: function() {
		Ext.Msg.show({
		    title: this.localize('exportViewEmbedTitle'),
		    message: this.localize('exportViewEmbedMessage'),
		    buttons: Ext.Msg.OK,
		    icon: Ext.Msg.INFO,
		    prompt: true,
	        multiline: true,
	        value: "<!--	Exported from Voyant Tools: http://voyant-tools.org/.\n"+
	        	"Please note that this is an early version and the API may change.\n"+
	        	"Feel free to change the height and width values below: -->\n"+
	        	"<iframe style='width: 100%; height: 800px' src='"+this.getExportUrl()+"'></iframe>"
		});
	},
	exportBiblio: function() {
		var date = new Date();
		Ext.Msg.show({
		    title: this.localize('exportBiblioTitle'),
		    message: '<fieldset><legend>MLA</legend>'+
	    	'Sinclair, Stéfan and Geoffrey Rockwell. '+(this.isXType('voyantheader') ? '' : '"'+this.localize('title')+'." ')+
	    	'<i>Voyant Tools</i>. '+Ext.Date.format(date,'Y')+'. Web. '+Ext.Date.format(date,'j M Y')+'. &lt;http://voyant-tools.org&gt;.</fieldset>'+
	    	'<br >'+
	    	'<fieldset><legend>Chicago</legend>'+
	    	'Stéfan Sinclair and Geoffrey Rockwell, '+(this.isXType('voyantheader') ? '' : '"'+this.localize('title')+'", ')+
	    	'<i>Voyant Tools</i>, accessed '+Ext.Date.format(date,'F j, Y')+', http://voyant-tools.org.</fieldset>'+
	    	'<br >'+
	    	'<fieldset><legend>APA</legend>'+
	    	'Sinclair, S. &amp; G. Rockwell. ('+Ext.Date.format(date,'Y')+"). "+(this.isXType('voyantheader') ? '' : this.localize('title')+'. ')+
	    	'<i>Voyant Tools</i>. Retrieved '+Ext.Date.format(date,'F j, Y')+', from http://voyant-tools.org</fieldset>',
		    buttons: Ext.Msg.OK,
		    icon: Ext.Msg.INFO
		});
	},
	exportGridCurrentJson: function(grid, form) {
		var store = grid.getStore();
		var fields = store.getFields();
		var value = "<table>\n\t<thead>\n\t\t<tr>\n";
		var visibleColumns = grid.getColumnManager().headerCt.getVisibleGridColumns();
		values = [];

		function jsonCollector(row) {
			var val = {};
			visibleColumns.forEach(function (column) {
				val[column.text] = row.get(column.dataIndex);
			});
			values.push(val);
		}

		if (store.buffered) {
			store.data.forEach(jsonCollector);
		} else {
			store.each(jsonCollector);
		}

		Ext.Msg.show({
		    title: this.localize('exportDataTitle'),
		    message: this.localize('exportDataJsonMessage'),
		    buttons: Ext.Msg.OK,
		    icon: Ext.Msg.INFO,
		    prompt: true,
	        multiline: true,
	        value: Ext.encode(values)
		});
	},
	exportGridCurrentTsv: function(grid, form) {
		var store = grid.getStore();
		var fields = store.getFields();
		var visibleColumns = grid.getColumnManager().headerCt.getVisibleGridColumns();
		var fields = [];
		visibleColumns.forEach(function(column) {
			fields.push(column.text);
		})
		var value = fields.join("\t")+"\n";

		function tsvCollector(row) {
			cells = [];
			visibleColumns.forEach(function (column) {
				var val = row.get(column.dataIndex);
				if (Ext.isString(val)) {
					val = val.replace(/\s+/g, ' '); // get rid of multiple whitespace (including newlines and tabs)
				}
				cells.push(val)
			});
			value += cells.join("\t") + "\n";
		}

		if (store.buffered) {
			store.data.forEach(tsvCollector);
		} else {
			store.each(tsvCollector);
		}

		Ext.Msg.show({
		    title: this.localize('exportDataTitle'),
		    message: this.localize('exportDataTsvMessage'),
		    buttons: Ext.Msg.OK,
		    icon: Ext.Msg.INFO,
		    prompt: true,
	        multiline: true,
	        value: value
		});
	},
	exportGridCurrentHtml: function(grid, form) {
		var store = grid.getStore();
		var fields = store.getFields();
		var value = "<table>\n\t<thead>\n\t\t<tr>\n";
		var visibleColumns = grid.getColumnManager().headerCt.getVisibleGridColumns();
		visibleColumns.forEach(function(column) {
			value+="\t\t\t<td>"+column.text+"</td>\n";
		});

		value+="\t\t</tr>\n\t</thead>\n\t<tbody>\n";

		function htmlCollector(row) {
			value += "\t\t<tr>\n";
			visibleColumns.forEach(function (column) {
				var val = row.get(column.dataIndex);
				if (Ext.isString(val)) {
					val = val.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&lg;');
				}
				value += "\t\t\t<td>" + val + "</td>\n";
			});
			value += "\t\t</tr>\n";
		}

		if (store.buffered) {
			store.data.forEach(htmlCollector);
		} else {
			store.each(htmlCollector);
		}

		value+="\t</tbody>\n</table>";
		Ext.Msg.show({
		    title: this.localize('exportDataTitle'),
		    message: this.localize('exportDataHtmlMessage'),
		    buttons: Ext.Msg.OK,
		    icon: Ext.Msg.INFO,
		    prompt: true,
	        multiline: true,
	        value: value
		});
	},
	getExportUrl: function() {
		var api = this.getModifiedApiParams();
		if (!this.isXType('voyantheader')) {api.view=Ext.getClassName(this).split(".").pop()}
		return this.getApplication().getBaseUrl()+'?corpus='+this.getApplication().getCorpus().getId()+"&"+Ext.Object.toQueryString(api);
	},
	helpToolClick: function(panel) {
		if (panel.isXType('voyanttabpanel')) {panel = panel.getActiveTab()}
		var help = panel.localize('help', {"default": false}) || panel.localize('helpTip');
		if (help==panel._localizeClass(Ext.ClassManager.get("Voyant.util.Toolable"), "helpTip")) {
			panel.openUrl( "http://docs.voyant-tools.org/");
		}
		else {
			Ext.Msg.alert(panel.localize('title'), help)
		}
	},
	replacePanel: function(xtype) {
		var corpus = this.getApplication().getCorpus();
		var config = this.getInitialConfig();
		var parent;
		if (this.isXType('voyantheader') && this.getApplication().getViewComponent) {
			parent = this.getApplication().getViewComponent();
			parent.removeAll(true);
			var newTool = parent.add({xtype: xtype});
			if (corpus) {
				this.getApplication().dispatchEvent("loadedCorpus", parent, corpus);
			}
		}
		else {
			parent = this.isXType('voyantheader') && this.getApplication().getViewComponent ? this.getApplication().getViewComponent() : this.up("component");
			parent.remove(this, true);
			var newTool = parent.add({xtype: xtype});
			if (parent.isXType("voyanttabpanel")) {
				parent.setActiveTab(newTool)
			}
			if (corpus) {
				newTool.fireEvent("loadedCorpus", newTool, corpus)
			}
		}
	}
});

// from http://www.sencha.com/forum/showthread.php?281658-add-dropdown-menu-to-panel-tool&p=1054579&viewfull=1#post1054579
// and http://www.sencha.com/forum/showthread.php?281953-Glyphs-in-panel-tool&p=1068934&viewfull=1#post1068934

Ext.define('Voyant.util.ToolMenu', {
    extend: 'Ext.panel.Tool',
    alias: 'widget.toolmenu',
    renderTpl: ['<div class="x-menu-tool-hover">' + '</div>'+
            '<tpl if="glyph">' + 
            '<span id="{id}-toolEl" class="{baseCls}-glyph {childElCls}" role="presentation" style="font-family: {glyphFontFamily}">&#{glyph}</span>' + 
            '<tpl else>' + 
            '<img id="{id}-toolEl" src="{blank}" class="{baseCls}-img {baseCls}-{type}' + '{childElCls}" role="presentation"/>' + 
            '</tpl>'],
    privates: {
        onClick: function() {
            var me = this,
            returnValue = me.callParent(arguments);


            if (returnValue && me.items) {
                if (!me.toolMenu) {
                    me.toolMenu = new Ext.menu.Menu({
                        items: me.items
                    });
                }
                me.toolMenu.showAt(0, 0);
                me.toolMenu.showAt(me.getX() + me.getWidth() - me.toolMenu.getWidth(), me.getY() + me.getHeight() + 10);
            }


            return returnValue;
        },
        onDestroy: function() {
            Ext.destroyMembers(this, 'toolMenu'); //destructor
            this.callParent();
        }
    },   
	initComponent: function() {
	    var me = this;
	    me.callParent(arguments);
	
	    var glyph, glyphParts, glyphFontFamily;
	    glyph = me.glyph || 'xf12e@FontAwesome';
	
	    if (glyph) {
	        if (typeof glyph === 'string') {
	            glyphParts = glyph.split('@');
	            glyph = glyphParts[0];
	            glyphFontFamily = glyphParts[1];
	        } else {
	            glyphFontFamily = 'FontAwesome';
	        }
	
	
	        Ext.applyIf(me.renderData, {
	            baseCls: me.baseCls,
	            blank: Ext.BLANK_IMAGE_URL,
	            type: me.type,
	            glyph: glyph,
	            glyphFontFamily: glyphFontFamily
	        });
	    }
	}

});

Ext.define("Voyant.util.Transferable", {
	transferable: ['transfer'],
	transfer: function(source, destination) {
		if (source.transferable) {
			for (var i=0;i<source.transferable.length;i++) {
				var member = source.transferable[i];
				destination[member] = Ext.bind(source[member], destination);
			}
		}
		if (source.mixins) {
			for (mixin in source.mixins) {
				this.transfer(source.mixins[mixin], destination)
			}
		}
	}
})
Ext.define("Voyant.util.Variants", {
	extend: 'Ext.Base',
	constructor: function(variants) {
		this.variants = variants;
		this.map = {};
		this.variants.forEach(function(variant, index) {
			variant.forEach(function(v) {
				this.map[v]=index;
			}, this)
		}, this)
	},
	getVariants: function(terms) {
		var variants = [];
		if (Ext.isString(terms)) {terms = [terms]}
		if (Ext.isArray(terms)) {
			terms.forEach(function(term) {
				if (this.map[term]!=undefined) {
					variants.push.apply(variants, this.variants[this.map[term]]);
				}
			}, this)
		}
		return variants
	}
})
Ext.define('Voyant.data.model.AnalysisToken', {
    extend: 'Ext.data.Model',
    idProperty: 'term',
    fields: [
         {name: 'term'},
         {name: 'rawFreq', type: 'int'},
         {name: 'relativeFreq', type: 'number'},
         {name: 'cluster', type: 'int'},
         {name: 'clusterCenter', type: 'boolean'},
         {name: 'vector'}
    ]
});
Ext.define('Voyant.data.model.Context', {
    extend: 'Ext.data.Model',
    fields: [
             {name: 'id'},
             {name: 'docIndex', 'type': 'int'},
             {name: 'docId'},
             {name: 'left'},
             {name: 'keyword'},
             {name: 'term'},
             {name: 'right'}
        ]
});
Ext.define('Voyant.data.model.CorpusCollocate', {
    extend: 'Ext.data.Model',
    fields: [
             {name: 'term'},
             {name: 'rawFreq', type: 'int'},
             {name: 'contextTerm'},
             {name: 'contextTermRawFreq', type: 'int'}
    ],
    
    getTerm: function() {return this.getKeyword()},
    getRawFreq: function() {return this.getKeywordRawFreq()},
    getKeyword: function() {return this.get('term');},
    getKeywordRawFreq: function() {return this.get('rawFreq');},
    getContextTerm: function() {return this.get('contextTerm');},
    getContextTermRawFreq: function() {return this.get('contextTermRawFreq');}
});
Ext.define('Voyant.data.model.CorpusTerm', {
    extend: 'Ext.data.Model',
    fields: [
             {name: 'id'},
             {name: 'rawFreq', type: 'int'},
             {name: 'relativeFreq', type: 'float'},
             {name: 'relativePeakedness', type: 'float'},
             {name: 'relativeSkewness', type: 'float'},
             {name: 'distributions'},
             {name: 'typeTokenRatio-lexical', type: 'float', calculate:  function(data) {
        	 	return data['typesCount-lexical']/data['tokensCount-lexical'];
             }}
    ],
    
    getTerm: function() {
    	return this.get('term');
    }
});
Ext.define('Voyant.data.model.CorpusNgram', {
    extend: 'Ext.data.Model',
    fields: [
             {name: 'term'},
             {name: 'length', type: 'int'},
             {name: 'rawFreq', type: 'int'},
             {name: 'distributions'}
        ],
    getTerm: function() {return this.get('term');}
});
Ext.define('Voyant.data.model.Dimension', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'percentage', type: 'number'}
    ]
});
Ext.define('Voyant.data.model.Document', {
    extend: 'Ext.data.Model',
    //requires: ['Voyant.data.store.DocumentTerms'],
    fields: [
             {name: 'corpus'},
             {name: 'id'},
             {name: 'index', type: 'int'},
             {name: 'tokensCount-lexical', type: 'int'},
             {name: 'typesCount-lexical', type: 'int'},
             {name: 'typeTokenRatio-lexical', type: 'float', calculate:  function(data) {
        	 	return data['typesCount-lexical']/data['tokensCount-lexical'];
             }},
             {name: 'title'},
             {name: 'language', convert: function(data) {return Ext.isEmpty(data) ? '' : data;}}
    ],
    
    getDocumentTerms: function(config) {
    	config = config || {};
    	Ext.apply(config, {
    		docId: this.get('id')
    	});
    	return this.get('corpus').getDocumentTerms(config);
    },
    
    getIndex: function() {
    	return this.get('index');
    },
    
    getFullLabel: function() {
    	return this.getTitle(); // TODO: complete full label
    },
    
    getTitle: function() {
    	return this.get('title');
    },
    
    getTruncated: function(string, max) {
  		if (string.length > max) {
				// maybe a file or URL?
				var slash = string.lastIndexOf("/");
				if (slash>-1) {
					string = string.substr(slash+1);
				}
				
				if (string.length>max) {
					var space = string.indexOf(" ", max-5);
					if (space < 0 || space > max) {
						space = max;
					}
					string = string.substring(0, space) + "…";
				}
		}
  		return string
    	
    },
    
    getShortTitle: function() {
     	var title = this.getTitle();
     	title = title.replace(/\.(html?|txt|xml|docx?|pdf|rtf|\/)$/,'');
     	title = title.replace(/^(the|a|le|l'|un|une)\s/,'');
     	return this.getTruncated(title, 25);
    },
    
    getTinyTitle: function() {
    	return this.getTruncated(this.getShortTitle(), 10);
    },
    
    getShortLabel: function() {
    	return (parseInt(this.getIndex())+1) + ') ' + this.getShortTitle();
    },
    
    getTinyLabel: function() {
    	return (parseInt(this.getIndex())+1) + ') ' + this.getTinyTitle();
    },
    
    getCorpusId: function() {
    	return this.get('corpus');
    },
    
    isPlainText: function() {
    	if (this.get("extra.Content-Type") && new RegExp("plain","i").test(this.get("extra.Content-Type"))) {
    		return true
    	}
    	return false;
    }
    
});
Ext.define('Voyant.data.model.DocumentQueryMatch', {
    extend: 'Ext.data.Model',
    fields: [
             {name: 'id'},
             {name: 'count', 'type': 'int'},
             {name: 'query'},
             {name: 'distributions'}
        ],
    getCount: function() {return this.get('count')},
    getDistributions: function() {return this.get("distributions")}
});
Ext.define('Voyant.data.model.DocumentTerm', {
    extend: 'Ext.data.Model',
    fields: [
             {name: 'id'},
             {name: 'term'},
             {name: 'docIndex', 'type': 'int'},
             {name: 'docId'},
             {name: 'rawFreq', type: 'int'},
             {name: 'relativeFreq', type: 'float'},
             {name: 'tfidf', type: 'float'},
             {name: 'zscore', type: 'float'},
             {name: 'zscoreRatio', type: 'float'},
             {name: 'distributions'}
        ],
    getTerm: function() {return this.get('term');},
    getDocIndex: function() {return this.get('docIndex')}
});
Ext.define('Voyant.data.model.PrincipalComponent', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'eigenValue', type: 'number'},
        {name: 'eigenVectors'}
    ]
});
Ext.define('Voyant.data.model.StatisticalAnalysis', {
    extend: 'Ext.data.Model',
    requires: ['Voyant.data.model.PrincipalComponent', 'Voyant.data.model.Dimension', 'Voyant.data.model.AnalysisToken'],
    fields: [
         {name: 'id'}
//         ,{name: 'dimensions', reference: 'Voyant.data.model.Dimension'}
//         ,{name: 'tokens', reference: 'Voyant.data.model.AnalysisToken'}
    ]
    
	// alternative access methods to "reference" or "hasMany"
	,getPrincipalComponents: function() {
		var pcs = [];
		this.data.principalComponents.forEach(function(pc) {
			pcs.push(Ext.create('Voyant.data.model.PrincipalComponent', pc));
		});
		return pcs;
	}
	,getDimensions: function() {
		var dimensions = [];
		this.data.dimensions.forEach(function(dim) {
			dimensions.push(Ext.create('Voyant.data.model.Dimension', dim));
		});
		return dimensions;
	}
	,getTokens: function() {
		var tokens = [];
		this.data.tokens.forEach(function(tok) {
			tokens.push(Ext.create('Voyant.data.model.AnalysisToken', tok));
		});
		return tokens;
	}


//    ,hasMany: [{
//    	name: 'dimensions', model: 'Voyant.data.model.Dimension'
//    },{
//    	name: 'tokens', model: 'Voyant.data.model.AnalysisToken'
//    }]
});
Ext.define('Voyant.data.model.Token', {
    extend: 'Ext.data.Model',
    fields: [
             {name: 'id'},
             {name: 'docId'},
             {name: 'docIndex', type: 'int'},
             {name: 'token'},
             {name: 'rawFreq'},
             {name: 'tokenType'},
             {name: 'position', type: 'int'},
             {name: 'startOffset', type: 'int'},
             {name: 'endOffset', type: 'int'}
        ],
    statics: {
    	getInfoFromElement: function(arg) {
    		if (arg && arg.getId) {
    			var parts = arg.getId().split("_");
    			return {
    				docIndex: parts[1],
    				position: parts[2]
    			}
    		}
    	}
    },
	isWord: function() {
		return this.getTokenType()=='lexical' // maybe something else later?
	},
	getTokenType: function() {
		return this.get("tokenType")
	},
	getId: function() {
		return ["",this.getDocIndex(),this.getPosition()].join("_");
	},
	getDocIndex: function() {
		return this.get("docIndex")
	},
	getDocId: function() {
		return this.get("docId")
	},
	getTerm: function() {
		return this.get("term")
	},
	getTermWithLineSpacing: function(isPlainText) {
		var term = this.getTerm().replace(/<\/?\w+\b.*?>/g, "<br /><br />").replace(/>\s+</g,"><").replace(/<br \/><br \/>(<br \/>)+/g,"<br \/><br \/>");
		if (isPlainText) {term = term.replace(/(\r\n|\r|\n)\s*/g,"<br />")}
		return term
	},
	getPosition: function() {
		return this.get("position")
	},
	getDocumentRawFreq: function() {
		return this.get("rawFreq")
	}
});
Ext.define('Voyant.data.store.CAAnalysis', {
	extend: 'Ext.data.Store',
	//mixins: ['Voyant.util.Transferable','Voyant.notebook.util.Embeddable'],
    model: 'Voyant.data.model.StatisticalAnalysis',
	config: {
		corpus: undefined
	},
	
	constructor : function(config) {
		
		config = config || {};
		
		// create proxy in constructor so we can set the Trombone URL
		Ext.apply(config, {
			proxy: {
				type: 'ajax',
				url: Voyant.application.getTromboneUrl(),
				extraParams: {
					tool: 'corpus.CA',
					corpus: config && config.corpus ? (Ext.isString(config.corpus) ? config.corpus : config.corpus.getId()) : undefined,
					withDistributions: true
		         },
		         reader: {
		             type: 'json',
		             rootProperty: 'correspondenceAnalysis',
		             totalProperty: 'correspondenceAnalysis.totalTerms'
		         },
		         simpleSortMode: true
			 }
		});
		
		this.callParent([config]);

	},
	
	setCorpus: function(corpus) {
		if (corpus) {
			this.getProxy().setExtraParam('corpus', Ext.isString(corpus) ? corpus : corpus.getId());
		}
		this.callParent(arguments);
	}
});

Ext.define('Voyant.data.store.Contexts', {
	extend: 'Ext.data.Store',
	//mixins: ['Voyant.util.Transferable','Voyant.notebook.util.Embeddable'],
    model: 'Voyant.data.model.Context',
//    transferable: ['setCorpus'],
//    embeddable: ['Voyant.panel.CorpusTerms','Voyant.panel.Cirrus'],
	config: {
		corpus: undefined
	},
	constructor : function(config) {
		
		config = config || {};
		
		// create proxy in constructor so we can set the Trombone URL
		Ext.apply(config, {
		     proxy: {
		         type: 'ajax',
		         url: Voyant.application.getTromboneUrl(),
		         extraParams: {
		        	 tool: 'corpus.DocumentContexts',
		        	 corpus: config && config.corpus ? (Ext.isString(config.corpus) ? config.corpus : config.corpus.getId()) : undefined,
		        	 stripTags: config.stripTags
		         },
		         reader: {
		             type: 'json',
		             rootProperty: 'documentContexts.contexts'
		         },
		         simpleSortMode: true
		     }
		})
		
//    	this.mixins['Voyant.notebook.util.Embeddable'].constructor.apply(this, arguments);
		this.callParent([config]);

	},
	
	setCorpus: function(corpus) {
		if (corpus) {
			this.getProxy().setExtraParam('corpus', Ext.isString(corpus) ? corpus : corpus.getId());
		}
		this.callParent(arguments);
	}

});

Ext.define('Voyant.data.store.CorpusCollocates', {
	extend: 'Ext.data.BufferedStore',
	//mixins: ['Voyant.util.Transferable','Voyant.notebook.util.Embeddable'],
    model: 'Voyant.data.model.CorpusCollocate',
//    transferable: ['setCorpus'],
//    embeddable: ['Voyant.panel.CorpusTerms','Voyant.panel.Cirrus'],
	config: {
		corpus: undefined
	},
	constructor : function(config) {
		
		config = config || {};
		
		// create proxy in constructor so we can set the Trombone URL
		Ext.apply(config, {
			pagePurgeCount: 0,
			pageSize: 100,
			leadingBufferZone: 100,
			remoteSort: true,
			autoLoad: false, // needs to be false until there's a corpus
		     proxy: { // TODO: configure proxy to handle error
		         type: 'ajax',
		         url: Voyant.application.getTromboneUrl(),
		         extraParams: {
		        	 tool: 'corpus.CorpusCollocates',
		        	 corpus: config && config.corpus ? (Ext.isString(config.corpus) ? config.corpus : config.corpus.getId()) : undefined
		         },
		         reader: {
		             type: 'json',
		             rootProperty: 'corpusCollocates.collocates',
		             totalProperty: 'corpusCollocates.total'
		         },
		         simpleSortMode: true
		     }
		})
		
//    	this.mixins['Voyant.notebook.util.Embeddable'].constructor.apply(this, arguments);
		this.callParent([config]);

	},
	
	setCorpus: function(corpus) {
		if (corpus) {
			this.getProxy().setExtraParam('corpus', Ext.isString(corpus) ? corpus : corpus.getId());
		}
		this.callParent(arguments);
	}

});

Ext.define("Voyant.data.proxy.CorpusTerms", {
	extend: 'Ext.data.proxy.Ajax',
	constructor: function(config) {
		config = config || {};
		Ext.apply(config, {
            extraParams: Ext.apply(config.extraParams || {}, {
				 tool: 'corpus.CorpusTerms'
			})
		});
		Ext.applyIf(config, {
			url: Voyant.application.getTromboneUrl()
		})
		this.callParent([config]);
	},
	reader: {
	    type: 'json',
	    rootProperty: 'corpusTerms.terms',
	    totalProperty: 'corpusTerms.total'
	},
    simpleSortMode: true
})

Ext.define('Voyant.data.store.CorpusTerms', {
	extend: 'Ext.data.BufferedStore',
	// mixins: ['Voyant.util.Transferable','Voyant.notebook.util.Embeddable'],
    model: 'Voyant.data.model.CorpusTerm',
    transferable: ['setCorpus'],
    // requires: ['Voyant.panel.CorpusTerms','Voyant.panel.Cirrus'],
    // embeddable: ['Voyant.panel.CorpusTerms','Voyant.panel.Cirrus'],
	config: {
		corpus: undefined
	},
	constructor : function(config) {
		
		config = config || {};
		
		Ext.applyIf(config, {
			pagePurgeCount: 0,
			pageSize: 100,
			leadingBufferZone: 100,
			remoteSort: true,
			autoLoad: false, // needs to be false until there's a corpus
		    proxy: Ext.create("Voyant.data.proxy.CorpusTerms")
		})

    	//this.mixins['Voyant.notebook.util.Embeddable'].constructor.apply(this, arguments);
		this.callParent([config]);
		
		if (config && config.corpus) {
			if (config.corpus.then) {
				var dfd = Voyant.application.getDeferred(this);
				var me = this;
				config.corpus.then(function(corpus) {
					me.setCorpus(corpus);
					if (me.getAutoLoad()) {
						me.load({
							callback: function() {
								dfd.resolve(me);
							}
						})
					}
					else {
						dfd.resolve(me);
					}
				});
				var promise = Voyant.application.getPromiseFromDeferred(dfd);
				return promise;
			}
			else {
				this.setCorpus(config.corpus);
			}
		}


	},
	
	setCorpus: function(corpus) {
		if (corpus) {
			this.getProxy().setExtraParam('corpus', Ext.isString(corpus) ? corpus : corpus.getId());
		}
		this.callParent(arguments);
	}

});

Ext.define('Voyant.data.store.DocumentQueryMatches', {
	extend: 'Ext.data.Store',
    model: 'Voyant.data.model.DocumentQueryMatch',
	config: {
		corpus: undefined
	},
	constructor : function(config) {
		
		config = config || {};
		
		// create proxy in constructor so we can set the Trombone URL
		Ext.applyIf(config, {
			autoLoad: false,
		     proxy: {
		         type: 'ajax',
		         url: Voyant.application.getTromboneUrl(),
		         extraParams: {
		        	 tool: 'corpus.DocumentsFinder',
		        	 corpus: config && config.corpus ? (Ext.isString(config.corpus) ? config.corpus : config.corpus.getId()) : undefined
		         },
		         reader: {
		             type: 'json',
		             rootProperty: 'documentsFinder.queries'
		         }
		     }
		})
		
		this.callParent([config]);

		if (config && config.corpus) {
			this.setCorpus(config.corpus);
		}
	},
	
	setCorpus: function(corpus) {
		if (corpus) {
			this.getProxy().setExtraParam('corpus', Ext.isString(corpus) ? corpus : corpus.getId());
		}
		this.callParent(arguments);
	}

});

Ext.define('Voyant.data.store.DocumentTerms', {
	extend: 'Ext.data.BufferedStore',
	//mixins: ['Voyant.util.Transferable','Voyant.notebook.util.Embeddable'],
    model: 'Voyant.data.model.DocumentTerm',
    transferable: ['setCorpus'],
    //requires: ['Voyant.panel.DocumentTerms','Voyant.panel.Cirrus'],
    //embeddable: ['Voyant.panel.DocumentTerms','Voyant.panel.Cirrus'],
	config: {
		corpus: undefined
	},
	constructor : function(config) {
		
		config = config || {};
		
		// create proxy in constructor so we can set the Trombone URL
		Ext.applyIf(config, {
			pagePurgeCount: 0,
			pageSize: 100,
			leadingBufferZone: 100,
			remoteSort: true,
		     proxy: {
		         type: 'ajax',
		         url: Voyant.application.getTromboneUrl(),
		         extraParams: {
		        	 tool: 'corpus.DocumentTerms',
		        	 corpus: config && config.corpus ? (Ext.isString(config.corpus) ? config.corpus : config.corpus.getId()) : undefined
		         },
		         reader: {
		             type: 'json',
		             rootProperty: 'documentTerms.terms',
		             totalProperty: 'documentTerms.total'
		         },
		         simpleSortMode: true
		     }
		})
		
    	//this.mixins['Voyant.notebook.util.Embeddable'].constructor.apply(this, arguments);
		this.callParent([config]);

		if (config && config.corpus) {
			if (config.corpus.then) {
				var dfd = Voyant.application.getDeferred(this);
				var me = this;
				config.corpus.then(function(corpus) {
					me.setCorpus(corpus);
					dfd.resolve(me);
				});
				var promise = Voyant.application.getPromiseFromDeferred(dfd);
				return promise;
			}
			else {
				this.setCorpus(config.corpus);
			}
		}
	},
	
	setCorpus: function(corpus) {
		if (corpus) {
			this.getProxy().setExtraParam('corpus', Ext.isString(corpus) ? corpus : corpus.getId());
			this.load();
		}
		this.callParent(arguments);
	}

});

Ext.define("Voyant.data.store.Documents", {
	extend: "Ext.data.BufferedStore",
	model: "Voyant.data.model.Document",
	// mixins: ['Voyant.util.Transferable','Voyant.notebook.util.Embeddable'],
    // embeddable: ['Voyant.panel.Documents'],
	config: {
		corpus: undefined
	},
    statics: {
    	i18n: {
    		failedGetDocuments: {en: 'Failed attempt to get documents.'}
    	}
    },
	sorters: {
        property: 'index',
        direction: 'ASC'
	},
	remoteSort: true,
	constructor : function(config) {
		// create proxy in constructor so we can set the Trombone URL
		Ext.apply(config, {
			pagePurgeCount: 0,
			pageSize: 1000,
			leadingBufferZone: 100,
		     proxy: {
		         type: 'ajax',
		         url: Voyant.application.getTromboneUrl(),
		         extraParams: {
		        	 tool: 'corpus.DocumentsMetadata',
		        	 corpus: config && config.corpus ? (Ext.isString(config.corpus) ? config.corpus : config.corpus.getId()) : undefined
		         },
		         reader: {
		             type: 'json',
		             rootProperty: 'documentsMetadata.documents',
		             totalProperty: 'documentsMetadata.total'
		         },
		         simpleSortMode: true
		     },
	         listeners: {
	        	 load: function(store, records, successful, opts) {
	        		 if (successful) {
		        		 var corpus = store.getCorpus();
		        		 records.forEach(function(record) {
		        			 record.set('corpus', corpus);
		        		 });
	        		 }
	        	 }
	         }
		});
    	//this.mixins['Voyant.notebook.util.Embeddable'].constructor.apply(this, arguments);
		this.callParent([config]);
		
		if (config && config.corpus) {
			if (config.corpus.then) {
				var dfd = Voyant.application.getDeferred(this);
				var me = this;
				config.corpus.then(function(corpus) {
					me.setCorpus(corpus);
					dfd.resolve(me);
				});
				var promise = Voyant.application.getPromiseFromDeferred(dfd);
				return promise;
			}
			else {
				this.setCorpus(config.corpus);
			}
		}

	},
	setCorpus: function(corpus) {
		if (corpus) {
			this.getProxy().setExtraParam('corpus', Ext.isString(corpus) ? corpus : corpus.getId());
		}
		this.callParent(arguments);
	},
	
	getDocument: function(config) {
		if (this.getCorpus().getDocumentsCount()!=this.getTotalCount()) {
			var dfd = Voyant.application.getDeferred();
			var me = this;
			this.load({
			    scope: this,
			    callback: function(records, operation, success) {
			    	if (success) {dfd.resolve(this.getDocument(config))}
			    	else {
						Voyant.application.showResponseError(this.localize('failedGetDocuments'), response);
						dfd.reject(); // don't send error since we've already shown it
			    	}
			    }
			});
			return dfd.promise();
		}
		return Ext.isNumber(config) ? this.getAt(config) : this.getById(config);
	}
})
Ext.define('Voyant.data.store.PCAAnalysis', {
	extend: 'Ext.data.Store',
	// mixins: ['Voyant.util.Transferable','Voyant.notebook.util.Embeddable'],
    model: 'Voyant.data.model.StatisticalAnalysis',
	config: {
		corpus: undefined
	},
	
	constructor : function(config) {
		
		config = config || {};
		
		// create proxy in constructor so we can set the Trombone URL
		Ext.apply(config, {
			proxy: {
				type: 'ajax',
				url: Voyant.application.getTromboneUrl(),
				extraParams: {
					tool: 'corpus.PCA',
					corpus: config && config.corpus ? (Ext.isString(config.corpus) ? config.corpus : config.corpus.getId()) : undefined,
					withDistributions: true
		         },
		         reader: {
		             type: 'json',
		             rootProperty: 'pcaAnalysis',
		             totalProperty: 'pcaAnalysis.totalTerms'
		         },
		         simpleSortMode: true
			 }
		});
		
		this.callParent([config]);

	},
	
	setCorpus: function(corpus) {
		if (corpus) {
			this.getProxy().setExtraParam('corpus', Ext.isString(corpus) ? corpus : corpus.getId());
		}
		this.callParent(arguments);
	}
});

Ext.define('Voyant.data.store.CorpusNgrams', {
	extend: 'Ext.data.BufferedStore',
    model: 'Voyant.data.model.CorpusNgram',
    config: {
    	corpus: undefined
    },
	constructor : function(config) {
		
		config = config || {};
		
		// create proxy in constructor so we can set the Trombone URL
		Ext.applyIf(config, {
			pagePurgeCount: 0,
			pageSize: 100,
			leadingBufferZone: 100,
			remoteSort: true,
		     proxy: {
		         type: 'ajax',
		         url: Voyant.application.getTromboneUrl(),
		         extraParams: {
		        	 tool: 'corpus.CorpusNgrams',
		        	 corpus: config && config.corpus ? (Ext.isString(config.corpus) ? config.corpus : config.corpus.getId()) : undefined
		         },
		         reader: {
		             type: 'json',
		             rootProperty: 'corpusNgrams.ngrams',
		             totalProperty: 'corpusNgrams.total'
		         },
		         simpleSortMode: true
		     }
		})
		
    	//this.mixins['Voyant.notebook.util.Embeddable'].constructor.apply(this, arguments);
		this.callParent([config]);

		if (config && config.corpus) {
			if (config.corpus.then) {
				var dfd = Voyant.application.getDeferred(this);
				var me = this;
				config.corpus.then(function(corpus) {
					me.setCorpus(corpus);
					dfd.resolve(me);
				});
				var promise = Voyant.application.getPromiseFromDeferred(dfd);
				return promise;
			}
			else {
				this.setCorpus(config.corpus);
			}
		}
	},
	
	setCorpus: function(corpus) {
		if (corpus) {
			this.getProxy().setExtraParam('corpus', Ext.isString(corpus) ? corpus : corpus.getId());
		}
		this.callParent(arguments);
	}

});

Ext.define('Voyant.data.store.Tokens', {
	extend: 'Ext.data.Store',
	// mixins: ['Voyant.util.Transferable','Voyant.notebook.util.Embeddable'],
    model: 'Voyant.data.model.Token',
//    transferable: ['setCorpus'],
//    embeddable: ['Voyant.panel.CorpusTerms','Voyant.panel.Cirrus'],
	config: {
		corpus: undefined
	},
	constructor : function(config) {
		
		config = config || {};
		
		// create proxy in constructor so we can set the Trombone URL
		Ext.apply(config, {
		     proxy: {
		         type: 'ajax',
		         url: Voyant.application.getTromboneUrl(),
		         extraParams: {
		        	 tool: 'corpus.DocumentTokens',
		        	 corpus: config && config.corpus ? (Ext.isString(config.corpus) ? config.corpus : config.corpus.getId()) : undefined,
		        	 stripTags: config.stripTags
		         },
		         reader: {
		             type: 'json',
		             rootProperty: 'documentTokens.tokens',
		             totalProperty: 'documentTokens.total'
		         },
		         simpleSortMode: true
		     }
		})
		
//    	this.mixins['Voyant.notebook.util.Embeddable'].constructor.apply(this, arguments);
		this.callParent([config]);

	},
	
	setCorpus: function(corpus) {
		if (corpus) {
			this.getProxy().setExtraParam('corpus', Ext.isString(corpus) ? corpus : corpus.getId());
		}
		this.callParent(arguments);
	}

});

var Corpus = function(source, config) {
	return Ext.create("Voyant.data.model.Corpus", source, config);
}

Ext.define('Voyant.data.model.Corpus', {
	alternateClassName: ["Corpus"],
    mixins: [/*'Voyant.notebook.util.Embeddable','Voyant.util.Transferable',*/'Voyant.util.Localization'],
    transferable: ['show',/*'embed','embedSummary',*/'getSize','getId','getDocument','getDocuments','getCorpusTerms','getDocumentsCount','getWordTokensCount','getWordTypesCount','getDocumentTerms'],
    //embeddable: ['Voyant.panel.Summary','Voyant.panel.Cirrus','Voyant.panel.Documents','Voyant.panel.CorpusTerms'],
	requires: ['Voyant.util.ResponseError','Voyant.data.store.CorpusTerms','Voyant.data.store.Documents'/*,'Voyant.panel.Documents'*/],
    extend: 'Ext.data.Model',
    config: {
    	documentsStore: undefined
    },
    statics: {
    	i18n: {
    		failedCreateCorpus: {en: 'Failed attempt to create a Corpus.'},
			thisCorpus: {en: 'This corpus'},
			isEmpty: {en: 'is empty'},
			hasNdocuments: {
				en: new Ext.Template("has {count} documents")
			},
			has1document: {en: "has 1 document"},
			widthNwordsAndNTypes: {
				en: new Ext.Template("with {words} <span class='info-tip' data-qtip='every occurrence of every word (like multiple occurrences of \"the\") is counted'>total words</span> and {types} <span class='info-tip' data-qtip='multiple occurrences of words (like \"the\") are counted once'>unique word forms</span>")
			},
			yearAgo: {
				en: new Ext.Template("about a year ago")
			},
			yearsAgo: {
				en: new Ext.Template("about {count} years ago")
			},
			monthAgo: {
				en: new Ext.Template("about a month ago")
			},
			monthsAgo: {
				en: new Ext.Template("about {count} months ago")
			},
			dayAgo: {
				en: new Ext.Template("about a day ago")
			},
			daysAgo: {
				en: new Ext.Template("about {count} days ago")
			},
			hourAgo: {
				en: new Ext.Template("about an hour ago")
			},
			hoursAgo: {
				en: new Ext.Template("about {count} hours ago")
			},
			minuteAgo: {
				en: new Ext.Template("about a minute ago")
			},
			minutesAgo: {
				en: new Ext.Template("about {count} minutes ago")
			},
			secondAgo: {
				en: new Ext.Template("about a second ago")
			},
			secondsAgo: {
				en: new Ext.Template("{count} seconds ago")
			},
			now: {
				en: 'now'
			}
    	}
    },
    
    fields: [
         {name: 'documentsCount', type: 'int'},
         {name: 'lexicalTokensCount', type: 'int'},
         {name: 'lexicalTypesCount', type: 'int'},
         {name: 'createdTime', type: 'int'},
         {name: 'createdDate', type: 'date', dateFormat: 'c'}
    ],

    /**
     * Create a new Corpus.
     * @param {Mixed} [source] The source document(s) as a text string, a URL, or an Array of text strings and URLs.
     * @param {Object} [config] Configuration options for creating the {@link Corpus}.
     */
	constructor : function(source, config) {
				
		this.callParent([config]); // only send config, not source
    	//this.mixins['Voyant.notebook.util.Embeddable'].constructor.apply(this);

		if (source) {
			
			config = config || {};
			Ext.apply(config, {tool: 'corpus.CorpusMetadata'})

			if (Ext.isString(source) || Ext.isArray(source)) {
				config.input = source;
			}
			else if (Ext.isObject(source)) {Ext.apply(config, source)}

			var dfd = Voyant.application.getDeferred(this);
			var me = this;	
//			config.input="http://asdfasfa/"
			
			$.ajax({
				  type: "POST",
				  url: Voyant.application.getTromboneUrl(),
				  data: config,
				  dataType: "json"
				}).done(function(data) {
					me.set(data.corpus.metadata)
					var store = Ext.create("Voyant.data.store.Documents", {corpus: me});
					me.setDocumentsStore(store);
					store.load({
						params: {
							limit: 1000
						},
						callback: function(records, st, success) {
							me.setDocumentsStore(this);
							dfd.resolve(me);
						},
						scope: store
				})
				}).fail(function(response) {
					Voyant.application.showResponseError(me.localize('failedCreateCorpus'), response);
					dfd.reject(); // don't send error since we've already shown it
				});
			
			return Voyant.application.getPromiseFromDeferred(dfd);

		}
	},
	
	getId: function() {
		// overrides the getId() function from the model to handle promises
    	return this.then ? Voyant.application.getDeferredNestedPromise(this, arguments) : this.get('id');		
	},
	
	getCorpusTerms: function(config) {
		return Ext.create("Voyant.data.store.CorpusTerms", Ext.apply(config || {}, {corpus: this}));
	},
	
	getCorpusCollocates: function(config) {
		return Ext.create("Voyant.data.store.CorpusCollocates", Ext.apply(config || {}, {corpus: this}));
	},
	
	getDocumentQueryMatches: function(config) {
		// not expected to be called before corpus is defined
		return Ext.create("Voyant.data.store.DocumentQueryMatches", Ext.apply(config || {}, {corpus: this}));
	},
	
	getDocumentTerms: function(config) {
		return Ext.create("Voyant.data.store.DocumentTerms", Ext.apply(config || {}, {corpus: this}));
	},
	
	getDocuments: function(config) {
		return this.getDocumentsStore() ? this.getDocumentsStore() : Ext.create("Voyant.data.store.Documents", Ext.apply(config || {}, {corpus: this}));
		//this.then ? Voyant.application.getDeferredNestedPromise(this, arguments) : this.getDocumentsStore();
	},
	
	getDocument: function(config) {
		return this.then ? Voyant.application.getDeferredNestedPromise(this, arguments) : this.getDocumentsStore().getDocument(config);
	},
	
	getDocumentsCount: function() {
		return this.then ? Voyant.application.getDeferredNestedPromise(this, arguments) : this.get('documentsCount');
	},
	
	getWordTokensCount: function() {
    	return this.then ? Voyant.application.getDeferredNestedPromise(this, arguments) : this.get('lexicalTokensCount');
	},
	
	getWordTypesCount: function() {
    	return this.then ? Voyant.application.getDeferredNestedPromise(this, arguments) : this.get('lexicalTypesCount');
	},
	
	getCreatedTime: function() {
    	return this.then ? Voyant.application.getDeferredNestedPromise(this, arguments) : this.get('createdTime');		
	},

    show: function(config) {
    	return this.then ?  Voyant.application.getDeferredNestedPromise(this, arguments) : this.getShow().show();
    },
    
    getShow: function(config) {
    	if (this.then) {
    		return Voyant.application.getDeferredNestedPromise(this, arguments);
    	}

		var size = this.getDocumentsCount();
		var message = this.localize('thisCorpus');
		if (size==0) {message += ' '+this.localize('isEmpty')+'.';}
		else {
			message+=' ';
			if (size>1) {
				message+=this.localize('hasNdocuments', {count: Ext.util.Format.number(size,"0,000")});
			}
			else {
				message+=this.localize('has1document');
			}
			message+=' '+this.localize('widthNwordsAndNTypes', {words: Ext.util.Format.number(this.getWordTokensCount(),"0,000"), types: Ext.util.Format.number(this.getWordTypesCount(),"0,000")})+'.'
			message+=" Created "
			var createdDate = this.get('createdDate');
			var now = new Date();
			if (Ext.Array.each([
		    				['year', Ext.Date.YEAR],
		    				['month', Ext.Date.MONTH],
		    				['day', Ext.Date.DAY],
		    				['hour', Ext.Date.HOUR],
		    				['minute', Ext.Date.MINUTE],
		    				['second', Ext.Date.SECOND]
		    	], function(time) {
        			if (Ext.Date.diff(createdDate, now, time[1])>(time[0]=='second' ? 1 : 0)) {
        				var count = Ext.Date.diff(createdDate, now, time[1]);
        				message+="<span class='info-tip' data-qtip='"+Ext.Date.format(createdDate, "Y-m-d, H:i:s")+"'>";
        				if (count==1) {message+=this.localize(time[0]+'Ago', {count: count, date: createdDate})}
        				else {message+=this.localize(time[0]+'sAgo', {count: count, date: createdDate})}
        				message+="</span>";
        				return false
        			}
				}, this
			)===true) { // if array returns true, none of the conditions matched, so say now
				message+=this.localize('now');
			}
			message+='.';
			
			message+='';
		}
		return message;
    }
    
    

});
Ext.define('Voyant.widget.StopListOption', {
    extend: 'Ext.container.Container',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.stoplistoption',
    layout: 'hbox',
    statics: {
    	i18n: {
    		label: {en: "Stopwords:"},
    		editList: {en: "Edit List"},
    		noEditAutoTitle: {en: "Edit Stoplist Error"},
    		noEditAutoMessage: {en: 'The auto-detected stoplist cannot be edited, please select a specifc stoplist such as the "New User-Defined List".'},
    		auto: {en: "Auto-detect"},
    		'new': {en: "New User-Defined List"},
    		en: {en: "English"},
    		de: {en: "German"},
    		es: {en: "Spanish"},
    		fr: {en: "French"},
    		hu: {en: "Hungarian"},
    		it: {en: "Italian"},
    		no: {en: "Norwegian"},
    		se: {en: "Swedish"},
    		mu: {en: "Multilingual"},
    		ok: {en: "Save"},
    		cancel: {en: "Cancel"},
    		editStopListTitle: {en: "Edit Stoplist"},
    		editStopListMessage: {en: "This is the stoplist, one term per line."},
    		applyGlobally: {en: "apply globally"}
    	}
    },
    initComponent: function(config) {
    	var me = this;
    	var value = this.up('window').panel.getApiParam('stopList');
        var data = [{name : this.localize('en'),   value: 'stop.en.taporware.txt'},
               {name : this.localize('de'),   value: 'stop.de.german.txt'},
               {name : this.localize('es'),   value: 'stop.es.spanish.txt'},
               {name : this.localize('fr'),   value: 'stop.fr.veronis.txt'},
               {name : this.localize('hu'),   value: 'stop.hu.hungarian.txt'},
               {name : this.localize('it'),   value: 'stop.it.italian.txt'},
               {name : this.localize('no'),   value: 'stop.no.norwegian.txt'},
               {name : this.localize('se'),   value: 'stop.se.swedish-long.txt'},
               {name : this.localize('mu'),   value: 'stop.mu.multi.txt'}]
    	data.sort(function(a,b) { // sort by label
    		return a.name < b.name ? -1 : 1;
    	})
    	data.splice(0, 0, {name : this.localize('auto'),   value: 'auto'}, {name : this.localize('new'),   value: 'new'})
    	
    	Ext.apply(me, {
	    		items: [{
	    	        xtype: 'combo',
	    	        queryMode: 'local',
	    	        value: value,
	    	        triggerAction: 'all',
	    	        editable: true,
	    	        fieldLabel: this.localize('label'),
	    	        labelAlign: 'right',
	    	        name: 'stopList',
	    	        displayField: 'name',
	    	        valueField: 'value',
	    	        store: {
	    	            fields: ['name', 'value'],
	    	            data: data
	    	        }
	    		}, {width: 10}, {xtype: 'tbspacer'}, {
	    			xtype: 'button',
	    			text: this.localize('editList'),
	    			handler: this.editList,
	    			scope: this
	    		}, {width: 10}, {
	    			xtype: 'checkbox',
	    			name: 'stopListGlobal',
	    			checked: true,
	    			boxLabel: this.localize('applyGlobally')
	    		}]
    	})
        me.callParent(arguments);
    },
    
    editList: function() {
    	var win = this.up('window');
    	var panel = win.panel;
    	var value = this.down('combo').getValue();
    	var corpusId = panel.getApplication && panel.getApplication().getCorpus ? panel.getApplication().getCorpus().getId() : undefined;
    	if (value=='auto' && !corpusId) {
    		Ext.Msg.show({
			    title: this.localize('noEditAutoTitle'),
			    message: this.localize('noEditAutoMessage'),
			    buttons: Ext.Msg.OK,
			    icon: Ext.Msg.ERROR
			});
    		return
    	}
    	Ext.Ajax.request({
    	    url: panel.getTromboneUrl(),
    	    params: {
        		tool: 'resource.KeywordsManager',
    			stopList: value,
    			corpus: corpusId
    	    },
    	    success: function(response){
    	    	var json = Ext.util.JSON.decode(response.responseText);
    	    	var keywords = json.keywords.keywords.sort().join("\n");
    			Ext.Msg.show({
	    		    title: this.localize('editStopListTitle'),
	    		    message: this.localize('editStopListMessage'),
	    		    buttons: Ext.Msg.OKCANCEL,
	    		    buttonText: {
	    		        ok: this.localize('ok'),
	    		        cancel: this.localize('cancel')
	    		    },
	    		    icon: Ext.Msg.INFO,
	    		    prompt: true,
	    	        multiline: true,
	    	        value: keywords,
	    	        original: keywords,
	    	        fn: function(btn,value,stoplist) {
	    	        	if (btn=='ok' && stoplist.original!=value) {
	    	        		var combo = this.down('combo')
	    	        		if (Ext.String.trim(value).length==0) {
	    	        			combo.setValue('empty');
	    	        		}
	    	        		else {
	    	        	    	Ext.Ajax.request({
	    	        	    	    url: panel.getTromboneUrl(),
	    	        	    	    params: {
	    	        	        		tool: 'resource.StoredResource',
	    	        	    			storeResource: value,
	    	        	    			corpus: corpusId
	    	        	    	    },
	    	        	    	    combo: combo,
	    	        	    	    success: function(response, req) {
	    	        	    	    	var json = Ext.util.JSON.decode(response.responseText);
	    	        	    	    	var store = req.combo.getStore();
	    	        	    	    	var value = 'keywords-'+json.storedResource.id;
	    	        	    	    	store.add({name: 'Added '+Ext.Date.format(new Date(),'M j, g:i:s a'), value: value});
	    	        	    	    	req.combo.setValue(value)
	    	        	    	    	req.combo.updateLayout()
	    	        	    	    },
	    	        	    	    scope: this
	    	        	    	})
	    	        		}
	    	        	}
	    	        },
	    	        scope: this
    			})
    	    },
    	    scope: this
    	});
    	
//    	$.getJSON( this.up('window').panel.getTromboneUrl(), {
//    		tool: 'resource.KeywordsManager',
//			stopList: this.down('combo').getValue()
//    	}).done(function(data) {
//    		deb
//    		this.unmask();
//    	}).fail(function() {
//    		debugger
//    	})
//		Ext.Msg.show({
//		    title: this.localize('exportDataTitle'),
//		    message: this.localize('exportDataHtmlMessage'),
//		    buttons: Ext.Msg.OK,
//		    icon: Ext.Msg.INFO,
//		    prompt: true,
//	        multiline: true,
//	        value: '',
//	        listeners: {
//	        	render: function() {
//	        		debugger
//	        	}
//	        }
//		});
    }
})
Ext.define('Voyant.widget.QuerySearchField', {
    extend: 'Ext.form.field.Text',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.querysearchfield',
	statics: {
		i18n: {
			querySearch: {en: 'Search'},
			querySearchTip: {en: '<div>Search syntax (press enter/return to trigger a search):</div><ul style="margin-top: 3px; margin-bottom: 3px;"><li><b>coat</b>: match exact term <i>coat</i></li><li><b>coat*</b>: match terms that start with <i>coat</i> as one term</li><li><b>^coat*</b>: match terms that start with <i>coat</i> as separate terms (coat, coats, etc.)</li><li><b>coat,jacket</b>: match each term separated by commas as separate terms</li><li><b>coat|jacket</b>: match terms separate by pipe as a single term</li><li><b>&quot;winter coat&quot;</b>: <i>winter coat</i> as a phrase</li><li><b>&quot;coat mittens&quot;~5</b>: <i>coat</i> near <i>mittens</i> (within 5 words)</li><li><b>^coat*,jacket|parka,&quot;coat mittens&quot;~5</b>: combine syntaxes</li></ul>'}
		}
	},
    triggers: {
    	/*
        clear: {
            weight: 0,
            cls: 'fa-trigger form-fa-clear-trigger',
            hidden: true,
            handler: 'onClearClick',
            scope: 'this'
        },
        search: {
            weight: 1,
            cls: 'fa-trigger form-fa-search-trigger',
            handler: 'onSearchClick',
            scope: 'this'
        },*/
        help: {
            weight: 2,
            cls: 'fa-trigger form-fa-help-trigger',
            handler: 'onHelpClick',
            scope: 'this'
        }
    },

    initComponent: function() {
        var me = this;

        Ext.apply(me, {
        	listeners: {
    		   render: function(c) {
    		      Ext.QuickTips.register({
    		        target: c.triggers.help.getEl(),
    		        text: c.localize('querySearchTip'),
    		        enabled: true,
    		        showDelay: 20,
    		        trackMouse: true,
    		        autoShow: true
    		      });
    		    },
    		    scope: me
    		},
//            labelWidth: 50,
//            fieldLabel: me.localize('querySearch'),
            width: 120,
            emptyText: me.localize('querySearch')

        })

        me.callParent(arguments);
        me.on('specialkey', function(f, e){
            if (e.getKey() == e.ENTER) {
                me.doSearch();
            }
        });

    },

    onClearClick : function(){
        this.setValue('');
    	this.findParentByType("panel").fireEvent("query", this, undefined);
        //this.getTrigger('clear').hide();
        this.updateLayout();
    },

    onHelpClick : function(){
    	Ext.Msg.show({
    	    title: this.localize('querySearch'),
    	    message: this.localize('querySearchTip'),
    	    buttons: Ext.Msg.OK,
    	    icon: Ext.Msg.INFO
    	});
    },
    
    doSearch: function() {
        var value = this.getValue();
    	this.findParentByType("panel").fireEvent("query", this, value.length==0 ? undefined : value);
    	/*
    	if (value) {
            this.getTrigger('clear').show();
    	}
    	else {
            this.getTrigger('clear').hide();
    	}
    	*/
        this.updateLayout();
    }
});
Ext.define('Voyant.widget.TotalPropertyStatus', {
    extend: 'Ext.Component',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.totalpropertystatus',
	statics: {
		i18n: {
    		totalPropertyStatus: {en: '{count:number("0,000")}'}
		}
	},
    initComponent: function() {
        var me = this;
        Ext.applyIf(me, {
            tpl: this.localize('totalPropertyStatus'),
            itemId: 'totalpropertystatus',
            style: 'margin-right:5px',
            listeners: {
            	afterrender: function(cmp) {
            		var grid = cmp.up('grid')
            		if (grid) {
            			var store = grid.getStore();
            			cmp.updateStatus(store.getTotalCount()); // make sure we set this in case of lazy render
            			grid.getStore().on("totalcountchange", cmp.updateStatus, cmp) // bind changes to update
            		}
            	}
            }
        })
        me.callParent(arguments);
    },
    updateStatus: function(count) {
    	this.update({count: count})
    }
});

Ext.define('Voyant.panel.Panel', {
	mixins: ['Voyant.util.Localization','Voyant.util.Api','Voyant.util.Toolable',/*'Voyant.notebook.util.Embeddable',*/'Voyant.util.DetailedError','Voyant.widget.QuerySearchField','Voyant.widget.StopListOption','Voyant.widget.TotalPropertyStatus'],
	statics: {
		i18n: {
			term: {en: "Term"},
			rawFreq: {en: "Count"},
			relativeFreq: {en: 'Relative'},
			trend: {en: "Trend"},
			colon: {en: ': '},
			loading: {en: 'Loading'}
		}
	},
	constructor: function(config) {
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
//		this.mixins['Voyant.notebook.util.Embeddable'].constructor.apply(this, arguments);
		this.mixins['Voyant.util.Toolable'].constructor.apply(this, arguments);
		if (!this.glyph) {
			this.glyph = Ext.ClassManager.getClass(this).glyph
		}
	},
	
	getApplication: function() {
		return Voyant.application;
	},
	
	getBaseUrl: function() {
		return this.getApplication().getBaseUrl();
	},
	
	openUrl: function(url) {
		var win = window.open(url);
		if (!win) { // popup blocked
			Ext.Msg.show({
				title: "Popup Blocked",
				buttonText: {ok: "Close"},
				icon: Ext.MessageBox.INFO,
				message: "A popup window was blocked. <a href='"+url+"' target='_blank' class='link'>Click here</a> to open the new window.",
				buttons: Ext.Msg.OK
			});
		}
	},
	
	getTromboneUrl: function() {
		return this.getApplication().getTromboneUrl();
	},
	
	dispatchEvent: function() {
		var application = this.getApplication();
		application.dispatchEvent.apply(application, arguments);
	},
	
	showError: function(config) {
		this.getApplication().showError.apply(this, arguments)
	}
});

Ext.define('Voyant.panel.VoyantTabPanel', {
	extend: 'Ext.tab.Panel',
	alias: 'widget.voyanttabpanel',
	mixins: ['Voyant.panel.Panel'],
	statics: {
		i18n: {
		}
	},
	constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
	},
	initComponent: function() {
    	this.callParent(arguments);
	},
	listeners: {
		tabchange: function(panel, newTab) {
			this.tools = [];
			this.getHeader().tools = [];
			this.query("toolmenu").forEach(function(toolMenu) {
				toolMenu.destroy();
			})
			this.addTool(newTab.tools)
		},
		afterrender: function(panel) {
			this.fireEvent("tabchange", this, this.getActiveTab())
		}
	},
	showOptionsClick: function(panel) {
		debugger
		var tab = panel.getActiveTab();
		if (tab.showOptionsClick) {
			tab.showOptionsClick.apply(tab, arguments)
		}
	}
});
// assuming Bubblelines library is loaded by containing page (via voyant.jsp)
Ext.define('Voyant.panel.Bubblelines', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.bubblelines',
    statics: {
    	i18n: {
    		title: {en: 'Bubblelines'},
			type : {en: 'Visualization'},
			findTerm : {en: 'Find Term'},
			clearTerms : {en: 'Clear Terms'},
			removeTerm : {en: 'Remove Term'},
			showTerm : {en: 'Show Term'},
			hideTerm : {en: 'Hide Term'},
			granularity : {en: 'Granularity'},
			separateLines : {en: 'Separate Lines for Terms'},
			total : {en: 'Total'},
			corpusTooSmall : {en: 'The provided corpus is too small for this tool.'},
			help: {en: "Bubblelines visualizes the frequency and repetition of  a term's use in a corpus. Each document in the corpus is represented as a horizontal line and divided into segments of equal lengths. Each term is represented as a bubble, the size of the bubble indicates its frequency in the corresponding segment of text. The larger the bubble's radius the more frequently the term occurs."},
			adaptedFrom: {en: ''}
    	},
    	api: {
    		/**
    		 * @property bins How many "bins" to separate a document into.
    		 * @type Integer
    		 */
    		bins: 50,
        	/**
        	 * @property query A string to search for in a document.
        	 * @type String
        	 */
    		query: null,
    		/**
    		 * @property stopList The stop list to use to filter results.
    		 * Choose from a pre-defined list, or enter a comma separated list of words, or enter an URL to a list of stop words in plain text (one per line).
    		 * @type String
    		 */
    		stopList: 'auto',
    		/**
    		 * @property docId The document ID to restrict results to.
    		 * @type String
    		 */
    		docId: undefined,
    		/**
    		 * @property docIndex The document index to restrict results to.
    		 * @type Integer
    		 */
    		docIndex: undefined,
    		/**
    		 * @property maxDocs The maximum number of documents to show.
    		 * @type Integer
    		 */
    		maxDocs: 50
    	},
    	glyph: 'xf06e@FontAwesome'
	},
	config: {
		corpus: undefined,
		docTermStore: undefined,
		docStore: undefined
	},
	
	selectedDocs: undefined,
	processedDocs: new Ext.util.MixedCollection(),
	
	bubblelines: null, // the viz itself
	
	termTpl: new Ext.XTemplate(
		'<tpl for=".">',
			'<div class="term" style="color: rgb({color});float: left;padding: 3px;margin: 2px;">{term}</div>',
		'</tpl>'
	),
	termStore: new Ext.data.ArrayStore({
        fields: ['term', 'color'],
        listeners: {
        	load: function(store, records, successful, options) {
        		var termsView = this.down('#termsView');
        		for (var i = 0; i < records.length; i++) {
        			var r = records[i];
        			termsView.select(r, true);
        		}
        	},
        	scope: this
        } 
    }),
    
    constructor: function() {
    	Ext.apply(this, {
    		title: this.localize('title')
    	});
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
    	this.on('loadedCorpus', function(src, corpus) {
    		this.setCorpus(corpus);
    		this.getDocStore().getProxy().setExtraParam('corpus', corpus.getId());
    		if (this.isVisible()) {
        		this.getDocStore().load();
    		}
    		this.getDocTermStore().getProxy().setExtraParam('corpus', corpus.getId());
    	}, this);
    	
        this.on('activate', function() { // load after tab activate (if we're in a tab panel)
			if (this.getCorpus()) {				
				Ext.Function.defer(function() {this.getDocStore().load()}, 100, this);
			}
    	}, this);
        
        
        this.on('query', function(src, query) {
    		if (query !== undefined && query != '') {
    			this.getDocTermsFromQuery(query);
    		}
    	}, this);
    	
    	this.on('termsClicked', function(src, terms) {
    		if (src !== this) {
	    		var queryTerms = [];
	    		terms.forEach(function(term) {
	    			if (term.term) {queryTerms.push(term.term);}
	    		});
	    		this.getDocTermsFromQuery(queryTerms);
    		}
		}, this);
    	
    	this.on('documentTermsClicked', function(src, terms) {
    		var queryTerms = [];
    		terms.forEach(function(term) {
    			if (term.getTerm()) {queryTerms.push(term.getTerm());}
    		});
    		this.getDocTermsFromQuery(queryTerms);
    	}, this);
    	
    	this.down('#granularity').setValue(parseInt(this.getApiParam('bins')));
    },
    
    initComponent: function() {
    	var docStore = Ext.create("Ext.data.Store", {
			model: "Voyant.data.model.Document",
    		autoLoad: false,
    		remoteSort: false,
    		proxy: {
				type: 'ajax',
				url: Voyant.application.getTromboneUrl(),
				extraParams: {
					tool: 'corpus.DocumentsMetadata'
				},
				reader: {
					type: 'json',
					rootProperty: 'documentsMetadata.documents',
					totalProperty: 'documentsMetadata.total'
				},
				simpleSortMode: true
   		     },
   		     listeners: {
   		    	load: function(store, records, successful, options) {
   					this.processDocuments(records);
   					this.processedDocs.each(function(doc) {
   						this.bubblelines.addDocToCache(doc);
   					}, this);
   					// get the top 5 corpus terms
   					this.loadFromCorpusTerms(this.getCorpus().getCorpusTerms({autoload: false}));
   				},
   				scope: this
   		     }
    	});
    	this.setDocStore(docStore);
    	
    	var docTermStore = Ext.create("Ext.data.Store", {
			model: "Voyant.data.model.DocumentTerm",
    		autoLoad: false,
    		remoteSort: false,
    		proxy: {
				type: 'ajax',
				url: Voyant.application.getTromboneUrl(),
				extraParams: {
					tool: 'corpus.DocumentTerms',
					withDistributions: 'raw',
					withPositions: true
				},
				reader: {
					type: 'json',
		            rootProperty: 'documentTerms.terms',
		            totalProperty: 'documentTerms.total'
				},
				simpleSortMode: true
   		     },
   		     listeners: {
   		    	 load: function(store, records, successful, options) {
   		    		records.forEach(function(record) {
   		    			var termData = this.processTerms(record);
   		    			var docId = record.get('docId');
   		    			var term = record.get('term');
   		    			var termObj = {};
   		    			termObj[term] = termData;
   		    			this.bubblelines.addTermsToDoc(termObj, docId);
   		    		}, this);
   		    		this.bubblelines.doLayout();

//   					this.processDocuments();
//   					if (this.maxFreqChanged) {
//   						this.calculateBubbleRadii();
//   					} else {
//   						this.calculateBubbleRadii(options.params.type);
//   					}
//   					this.bubblelines.setCanvasHeight();
//   					this.bubblelines.drawGraph();
   				},
   				scope: this
   		     }
    	});
    	this.setDocTermStore(docTermStore);
    	
    	Ext.apply(this, {
    		dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                items: [{
                	xtype: 'querysearchfield'
                },{
	            	xtype: 'button',
	            	text: this.localize('clearTerms'),
	            	handler: function() {
	            		this.down('#termsView').getSelectionModel().deselectAll(true);
	            		this.termStore.removeAll();
	            		this.setApiParams({query: null});
	            		this.bubblelines.removeAllTerms();
	            		this.bubblelines.drawGraph();
	            	},
	            	scope: this
	            },
	//            '-',{
	//            	xtype: 'documentSelector',
	//            	listeners: {
	//            		documentsSelected: function(docIds) {
	//            			this.setApiParams({docId: docIds});
	//            			
	//            			this.filterDocuments();
	//            			
	//            			var container = Ext.getCmp('canvasParent');
	//            			var height = Math.max(this.selectedDocs.getCount() * this.graphSeparation + 15, container.ownerCt.getHeight());
	//        				var width = container.ownerCt.getWidth();
	//        				this.canvas.height = height;
	//            			
	//            			this.selectedDocs.each(this.bubblelines.findLongestDocument, this);
	//            			this.selectedDocs.each(this.bubblelines.findLongestDocumentTitle, this);
	//        				this.bubblelines.setMaxLineWidth(width - this.MAX_LABEL_WIDTH - 75);    
	//            			
	//            			this.reloadTermsData();
	//            		},
	//            		scope: this
	//            	}
	//            }
	            ,'-',{
	            	xtype: 'slider',
	            	itemId: 'granularity',
	            	fieldLabel: this.localize('granularity'),
	            	labelAlign: 'right',
	            	labelWidth: 70,
	            	width: 120,
	            	increment: 10,
	            	minValue: 10,
	            	maxValue: 300,
	            	listeners: {
	            		changecomplete: function(slider, newvalue) {
	            			this.setApiParams({bins: newvalue});
	            			this.reloadTermsData();
	            		},
	            		scope: this
	            	}
	            },'-',{
	            	xtype: 'checkbox',
	            	boxLabel: this.localize('separateLines'),
	            	boxLabelAlign: 'before',
	            	checked: false,
	            	handler: function(checkbox, checked) {
	            		this.bubblelines.SEPARATE_LINES_FOR_TERMS = checked;
	            		this.bubblelines.lastClickedBubbles = {};
	            		this.bubblelines.setCanvasHeight();
	    				this.bubblelines.drawGraph();
	            	},
	            	scope: this
	            	
	            }]
    		}],
            border: false,
            layout: 'fit',
            items: {
            	layout: {
            		type: 'vbox',
            		align: 'stretch'
            	},
            	defaults: {border: false},
	            items: [{
	            	height: 30,
	            	itemId: 'termsView',
	            	xtype: 'dataview',
	            	store: this.termStore,
	            	tpl: this.termTpl,
	            	itemSelector: 'div.term',
	            	overItemCls: 'over',
	            	selectedItemCls: 'selected',
	            	focusCls: '',
	            	listeners: {
	            		beforeitemclick: function(dv, record, item, index, event, opts) {
	            			event.preventDefault();
	            			event.stopPropagation();
	            			dv.fireEvent('itemcontextmenu', dv, record, item, index, event, opts);
	            			return false;
	            		},
	            		selectionchange: function(selModel, selections) {
	            			var dv = this.down('#termsView');
	            			var terms = [];
	            			
	            			var allTerms = dv.el.query('div[class*=term]');
	            			for (i = 0; i < allTerms.length; i++) {
	            				Ext.fly(allTerms[i]).addCls('unselected');
	            			}
	            			
	            			var i, rec;
	            			for (i = 0; i < selections.length; i++) {
	            				rec = selections[i];
	            				terms.push(rec.get('term'));
	            				Ext.fly(dv.getNode(rec)).removeCls('unselected');
	            			}
	            			
	            			for (i in this.lastClickedBubbles) {
	            				var lcTerms = this.lastClickedBubbles[i];
	            				for (term in lcTerms) {
	            					if (terms.indexOf(type) == -1) {
	            						delete this.lastClickedBubbles[i][term];
	            					}
	            				}
	            				
	            			}
	            			this.setApiParams({typeFilter: terms});
	            			this.bubblelines.setCanvasHeight();
	            			this.bubblelines.drawGraph();
	            		},
	            		itemcontextmenu: function(dv, record, el, index, event) {
	            			event.preventDefault();
	            			event.stopPropagation();
	            			var isSelected = dv.isSelected(el);
	            			var menu = new Ext.menu.Menu({
	            				floating: true,
	            				items: [
//	            				{
//	            					text: isSelected ? this.localize('hideTerm') : this.localize('showTerm'),
//	            					handler: function() {
//	            						if (isSelected) {
//	            							dv.deselect(record);
//	            						} else {
//	            							dv.select(record, true);
//	            						}
//	            					},
//	            					scope: this
//	            				},
	            				{
	            					text: this.localize('removeTerm'),
	            					handler: function() {
	            						dv.deselect(index);
	            						var term = this.termStore.getAt(index).get('term');
	            						this.termStore.removeAt(index);
	            						dv.refresh();
	            						
	            						this.bubblelines.removeTerm(term);
	            						this.bubblelines.setCanvasHeight();
	            						this.bubblelines.drawGraph();
	            					},
	            					scope: this
	            				}]
	            			});
	            			menu.showAt(event.getXY());
	            		},
	            		scope: this
	            	}
	            },{
	            	flex: 1,
	            	xtype: 'container',
	            	autoEl: 'div',
	            	itemId: 'canvasParent',
	            	layout: 'fit',
	            	overflowY: 'auto',
	            	overflowX: 'hidden'
	            }],
	            listeners: {
	            	render: function(component) {
	            		var canvasParent = this.down('#canvasParent');
	                	this.bubblelines = new Bubblelines({
	                		container: canvasParent,
	                		clickHandler: this.bubbleClickHandler.bind(this)
	                	});
	            	},
            		afterlayout: function(container) {
            			if (this.bubblelines.initialized === false) {
            				this.bubblelines.initializeCanvas();
            			}
            		},
	        		resize: function(cnt, width, height) {
	        			this.bubblelines.doLayout();
	        		},
            		scope: this
            	}
            }
		});
    	
    	this.callParent(arguments);
    },
    
    loadFromCorpusTerms: function(corpusTerms) {
		corpusTerms.load({
		    callback: function(records, operation, success) {
		    	var query = this.getApiParam('query') || [];
				if (typeof query == 'string') query = [query];
		    	records.forEach(function(record, index) {
					query.push(record.get('term'));
				}, this);
		    	this.getDocTermsFromQuery(query);
		    },
		    scope: this,
		    params: {
		    	limit: 5,
		    	stopList: 'auto'
		    }
    	});
    },
    
    /**
     * Get the results for the query(s) for each of the corpus documents.
     * @param query {String|Array}
     */
    getDocTermsFromQuery: function(query) {
    	if (query) {this.setApiParam("query", query);} // make sure it's set for subsequent calls
    	var corpus = this.getCorpus();
    	if (corpus && this.isVisible()) {
        	var docs = this.getCorpus().getDocuments();
        	var len = docs.getCount();
//        	var maxDocs = parseInt(this.getApiParam('maxDocs'))
//        	if (len > maxDocs) {len = maxDocs}
//        	debugger
        	for (var i = 0; i < len; i++) {
        		var doc = docs.getAt(i);
    	    	this.setApiParams({query: query, docIndex: undefined, docId: doc.getId()});
    			this.getDocTermStore().load({params: this.getApiParams()});
        	}
    	}
	},
    
	reloadTermsData: function() {
		var terms = [];
		for (var term in this.bubblelines.currentTerms) {
			terms.push(term);
		}
		this.getDocTermsFromQuery(terms);
	},
	
    filterDocuments: function() {
		var docIds = this.getApiParam('docId');
		if (docIds == '') {
			docIds = [];
			this.getCorpus().getDocuments().each(function(item, index) {
				docIds.push(item.getId());
			});
			this.setApiParams({docId: docIds});
		}
		if (typeof docIds == 'string') docIds = [docIds];
		
		if (docIds == null) {
			this.selectedDocs = this.getCorpus().getDocuments().clone();
			var count = this.selectedDocs.getCount();
			if (count > 10) {
				for (var i = 10; i < count; i++) {
					this.selectedDocs.removeAt(10);
				}
			}
			docIds = [];
			this.selectedDocs.eachKey(function(docId, doc) {
				docIds.push(docId);
			}, this);
			this.setApiParams({docId: docIds});
		} else {
			this.selectedDocs = this.getCorpus().getDocuments().filterBy(function(doc, docId) {
				return docIds.indexOf(docId) != -1;
			}, this);
		}
	},
	
	processDocuments: function(docs) {
		docs.forEach(this.processDocument, this);
	},
	
	processDocument: function(doc) {
		var docId = doc.getId();
		if (!this.processedDocs.containsKey(docId)) {
			var title = doc.getShortTitle();
			title = title.replace('&hellip;', '...');
			var index = doc.get('index');
			var totalTokens = doc.get('tokensCount-lexical');
		
			this.processedDocs.add(docId, {
				id: docId,
				index: index,
				title: title,
				totalTokens: totalTokens,
				terms: {}
			});
		}
	},
	
	processTerms: function(termRecord) {
		var termObj;
		var term = termRecord.get('term');
		var rawFreq = termRecord.get('rawFreq');
		var positions = termRecord.get('positions');
		if (rawFreq > 0) {
			var color = this.getApplication().getColorForTerm(term);
			if (this.termStore.find('term', term) === -1) {
				this.termStore.loadData([[term, color]], true);
			}
			var distributions = termRecord.get('distributions');
			termObj = {positions: positions, distributions: distributions, rawFreq: rawFreq, color: color};
		} else {
			termObj = false;
		}
		
		return termObj;
	},
	
	bubbleClickHandler: function(data) {
		this.getApplication().dispatchEvent('termsClicked', this, data);
	}
});

// assuming Cirrus library is loaded by containing page (via voyant.jsp)
Ext.define('Voyant.panel.Cirrus', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.cirrus',
    statics: {
    	i18n: {
    		title: {en: "Cirrus"},
    		helpTip: {en: "<p>Cirrus provides a wordcloud view of the most frequently occurring words in the corpus or document – this provides a convenient (though reductive) overview of the content. Features include</p><ul><li>term frequency appears when hovering over words</li><li>clicking on terms may produce results in other tools if any are displayed</li></ul>"},
    		reset: {en: 'reset'}
    	},
    	api: { // stopList inherited from app
    		limit: 50,
    		terms: undefined,
    		docId: undefined,
    		docIndex: undefined
    	},
		glyph: 'xf06e@FontAwesome'
    },
    
    config: {
    	mode: undefined,
    	options: {
    		xtype: 'stoplistoption'
    	},
    	corpus: undefined
    },

    MODE_CORPUS: 'corpus',
    MODE_DOCUMENT: 'mode_document',
    
    layout: 'fit',
    
    constructor: function(config) {

    	Ext.apply(this, {
    		title: this.localize('title'),
    		dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                items: ['->',{
                    text: this.localize('reset'),
                    hidden: true,
                    itemId: 'reset',
                    handler: function(btn) {
                    	btn.hide();
                    	var corpus = this.getCorpus();
                    	if (corpus) {this.loadFromCorpus(corpus);}
                    },
                    scope: this
                }]
    		}]
    	});

        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);

    	if (config.embedded) {
    		var cls = Ext.getClass(config.embedded).getName();
    		if (cls=="Voyant.data.store.CorpusTerms") {
    	    	this.loadFromCorpusTerms(config.embedded);
    		}
    		if (cls=="Voyant.data.model.Corpus") {
    	    	this.loadFromCorpusTerms(config.embedded.getCorpusTerms());
    		}
    	}
    },
    
    listeners: {
    	resize: function(panel, width, height) {
    		if (this.cirrus) {
    			this.cirrus.resizeWords();
    		}
    	},
    	
    	loadedCorpus: function(src, corpus) {
    		this.loadFromCorpus(corpus);
    	},
    	
    	documentsClicked: function(src, documents, corpus) {
    		if (documents) {
    			var doc = documents[0];
    			this.setApiParam('docId', doc.getId());
        		this.loadFromDocumentTerms(documents[0].getDocumentTerms({autoload: false, corpus: corpus}));
    		}
    	},
    	
    	ensureCorpusView: function(src, corpus) {
    		if (this.getMode() != this.MODE_CORPUS) {this.loadFromCorpus(corpus);}
    	}
    },
    
    loadFromCorpus: function(corpus) {    	
		this.setCorpus(corpus);
		this.setApiParams({docId: undefined, docIndex: undefined})
		this.loadFromCorpusTerms(corpus.getCorpusTerms({autoload: false}));
    },
    
    loadFromDocumentTerms: function(documentTerms) {
    	documentTerms.load({
		    callback: function(records, operation, success) {
		    	this.setMode(this.MODE_DOCUMENT);
		    	this.loadFromTermsRecords(records)
		    },
		    scope: this,
		    params: this.getApiParams()
    	});
    	this.down("#reset").show();
    },
    
    loadFromCorpusTerms: function(corpusTerms) {
		corpusTerms.load({
		    callback: function(records, operation, success) {
		    	this.setMode(this.MODE_CORPUS);
		    	this.loadFromTermsRecords(records)
		    },
		    scope: this,
		    params: this.getApiParams()
    	});
    },
    
    loadFromTermsRecords: function(records) {
    	var terms = [];
    	records.forEach(function(record) {
    		terms.push({word: record.get('term'), size: record.get('rawFreq'), value: record.get('rawFreq')});
    	});
    	this.buildFromTerms(terms)
    },
    
    buildFromTerms: function(terms) {
    	if (this.rendered && terms) {
    		var me = this;
    		var target = this.getLayout().getRenderTarget();
    		if (this.cirrus) {
    			target.update(""); // clear
    		}
    	    this.cirrus = new Cirrus({
    	        containerId: this.getLayout().getRenderTarget().dom.id,
    	        clickHandler: function(data) {
    	        	me.getApplication().dispatchEvent('termsClicked', me, [data]);
    	        },
    	        words: terms
    	    });   
    	}
    	else {
    		Ext.defer(this.buidlFromTerms, 50, this);
    	}
    }
    
})
Ext.define('Voyant.panel.CollocatesGraph', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.collocatesgraph',
    statics: {
    	i18n: {
    		title: {en: "Links"},
    		helpTip: {en: "<p>Collocates graph shows a network graph of higher frequency terms that appear in proximity. Keywords are shown in blue and collocates (words in proximity) are showing in orange. Features include:<ul><li>hovering over keywords shows their frequency in the corpus</li><li>hovering over collocates shows their frequency in proximity (not their total frequency)</li><li>double-clicking on any word fetches more results</li><li>a search box for queries (hover over the magnifying icon for help with the syntax)</li></ul>"},
    		clearTerms: {en: "clear terms"},
    		releaseToRemove: {en: "Release to remove this term"},
    		cleaning: {en: "Cleaning"}
    	},
    	api: {
    		query: undefined,
    		mode: undefined,
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
    	graphHeight: undefined,
    	graphWidth: undefined,
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
                	text: me.localize('clearTerms'),
                	handler: function() {
                		this.updateNodesAndLinks({},{})
                	},
                	scope: me
                }]
            }]
        });
        
        this.on("loadedCorpus", function(src, corpus) {
			this.setCorpus(corpus);
			if (this.isVisible()) {
				this.initLoad();
			}
        }, this);
        
        this.on('activate', function() { // load after tab activate (if we're in a tab panel)
    					if (this.getCorpus()) {
    						Ext.Function.defer(this.initLoad, 100, this);
    					}
    		    	}, this);
        
        this.on("query", function(src, query) {this.loadFromQuery(query);}, this);
        
        this.on("resize", function(panel, width, height) {
        	// a bit heavy handed, but nodes seem to keep their position, so it's actually fairly smooth
        	this.initGraph();
        	this.updateNodesAndLinks();
		}, this);
        
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
    	});
    	corpusCollocates.load({
    		params: this.getApiParams(),
    		callback: function(records, operations, success) {
    			if (success) {
    				this.loadFromCorpusCollocateRecords(records);
    			}
    		},
    		scope: this
    	});
    },
    
    loadFromCorpusTermRecords: function(corpusTerms) {
    	if (Ext.isArray(corpusTerms) && corpusTerms.length>0) {
    		var terms = [];
    		corpusTerms.forEach(function(corpusTerm) {
    			terms.push(corpusTerm.getTerm());
    		});
    		this.loadFromCorpusTermStringsArray(terms);
    	}
    },
    
    loadFromCorpusTermStringsArray: function(corpusTermStringsArray) {
    	var corpusCollocates = this.getCorpus().getCorpusCollocates({autoLoad: false});
    	this.setApiParams({
    		query: corpusTermStringsArray,
    		mode: 'corpus'
    	});
    	corpusCollocates.load({
    		params: this.getApiParams(),
    		callback: function(records, operations, success) {
    			if (success) {
    				this.loadFromCorpusCollocateRecords(records);
    			}
    		},
    		scope: this
    	});
    },
    
    loadFromCorpusCollocateRecords: function(records) {
    	if (Ext.isArray(records)) {
    		var thisNodes = this.getNodes() || {};
    		var thisLinks = this.getLinks() || {};
    		var start = this.getApiParam('limit');
    		records.forEach(function(corpusCollocate) {
    			
    			var keywordNode = {term: corpusCollocate.getKeyword(), type: 'keyword', value: corpusCollocate.getKeywordRawFreq(), start: start};
    			var keywordNodeKey = [keywordNode.term,keywordNode.type].join(";")
    			if (thisNodes[keywordNodeKey]) {/*thisNodes[keywordNodeKey].value+=keywordNode.value;*/}
    			else {thisNodes[keywordNodeKey]=keywordNode;}
    			
    			var contextNode = {term: corpusCollocate.getContextTerm(), type: 'context', value: corpusCollocate.getContextTermRawFreq(), start: 0};
    			var contextNodeKey = [contextNode.term,contextNode.type].join(";")
    			if (thisNodes[contextNodeKey]) {/*thisNodes[contextNodeKey].value+=contextNode.value;*/}
    			else {thisNodes[contextNodeKey]=contextNode;}
    			
    			var linkKey = [keywordNodeKey,contextNodeKey].join("--");
    			if (!thisLinks[linkKey]) {thisLinks[linkKey]={source:thisNodes[keywordNodeKey],target:thisNodes[contextNodeKey]};}
    			
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
    	this.setGraphWidth(width);
    	this.setGraphHeight(height);
    	this.setNode(svg.selectAll(".node"));
    	this.setLink(svg.selectAll(".link"));
    	
//    	this.start();
    },
    
    start: function() {
  	  var me = this;
  	  var force = this.getForce();
    	var drag = force.drag();
    	drag.on("dragstart", this.dragstart)
    	drag.on("drag", function(d) {me.drag.call(me, d)})
    	drag.on("dragend", function(d) {if (me.isOffCanvas(d)) {d.fixed = false; d3.select(this).classed("fixed", false);} me.dragend.call(me, d)})
    	
    	  link = this.getLink().data(force.links(), function(d) { return d.source.term+d.source.type + "-" + d.target.term+d.source.type; });
    	  link.enter().insert("line", ".node").attr("class", "link");
    	  link.exit().remove();
    	  this.setLink(link);
    	  
    	  node = this.getNode().data(force.nodes(), function(d) { return d.term+d.type;});
//    	  node.enter().append("g").attr("class", function(d) { return "node " + d.id; }).attr("dx", 12).attr("dy", ".35em").call(this.getForce().drag)
    	  
    	  var keywordValues = force.nodes().filter(function(d) {return d.type=='keyword';}).map(function(d) {return d.value;});
    	  var contextTermValues = force.nodes().filter(function(d) {return d.type=='context';}).map(function(d) {return d.value;});
    	  var range = [8,20];
    	  var keywordFontSize = d3.scale.linear().domain([d3.min(keywordValues),d3.max(keywordValues)]).range(range);
    	  var contextFontSize = d3.scale.linear().domain([d3.min(contextTermValues),d3.max(contextTermValues)]).range(range);

    	  var corpusColours = this.getCorpusColours();
    	  node.enter()
    	  	.append("text")
    	  		.attr("class", function(d) { return "node " + d.type; })
    	  		.attr("text-anchor", "middle")
    	  		.style("fill", function(d) {return corpusColours(d.type=='keyword' ? 1 : 2);})
    	  		.attr("dx", 12).attr("dy", ".35em")
    	  		.text(function(d) { return d.term; })
    	  		.style("font-size", function(d) { return (d.type=='context' ? contextFontSize(d.value) : keywordFontSize(d.value))+"pt"; })
    	  		.on("dblclick", function() {
    	  			me.dragstart.apply(this, arguments); // freeze the word
    	  			me.itemdblclick.apply(me, arguments);} // load more words
    	  		)
    	  		.on("click", this.itemclick)
    	  		.on("mouseover", function(d) {
    	  			this.textContent=d.term+" ("+d.value+")";
    	  			d.wasfixed = d.fixed;
    	  			me.itemclick.apply(this, arguments);
    	  		})
    	  		.on("mouseout", function(d,a,b,c) {
    	  			this.textContent=d.term;
    	  			d3.select(this).classed("fixed", d.fixed = d.wasfixed);
    			})
    	  		.call(drag);
    	  node.exit().remove();
    	  this.setNode(node);
    	  force.start();
    },
    
    isOffCanvas: function(d) {
    	return d.x < 0 || d.y < 0 || d.x > this.getGraphWidth() || d.y > this.getGraphHeight();
    },
    
    drag: function(d,a,b,c) {
    	if (this.isMasked()) {
    		if (!this.isOffCanvas(d)) {
    			this.unmask();
    		}
    	}
    	else if (this.isOffCanvas(d)) {
    		this.mask(this.localize("releaseToRemove"))
    	}
    },
    dragstart: function(d) {
    	d.wasfixed=true;
    	d3.select(this).classed("fixed", d.fixed = true );
    },
    dragend: function(d) {
    	if (this.isOffCanvas(d)) {
    		this.unmask();
    		this.mask("cleaning");
    		delete this.getNodes()[d.term+";"+d.type]
    		this.prune();
    		this.updateNodesAndLinks();
    		this.unmask();
    	}
    },
    
    prune: function() {
		var thisNodes = this.getNodes() || {};
		var thisLinks = this.getLinks() || {};
		var keys = Object.keys(this.getLinks());
		var possibleOrphans = [];
		var validNodes = {}
		var pruned = 0;
		for (var i=0, len=keys.length; i<len; i++) {
			parts = keys[i].split("--");
			if (!thisNodes[parts[0]] || !thisNodes[parts[1]]) {
				delete thisLinks[keys[i]]
				pruned++;
				possibleOrphans.push(parts[0], parts[1])
			}
			else {
				validNodes[parts[0]]=true
				validNodes[parts[1]]=true
			}
		}
		if (pruned>0) {
			for (var i=0, len=possibleOrphans.length; i<len; i++) {
				if (!validNodes[possibleOrphans[i]]) {
					delete thisNodes[possibleOrphans[i]]
				}
			}
			this.prune();
		}
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
    	    		var start = this.getApiParam('limit');
	    			var keywordNode = d;
    	    		d.start+=limit;
	    			var keywordNodeKey = [keywordNode.term,keywordNode.type].join(";");
    	    		records.forEach(function(corpusCollocate) {
    	    			
    	    			var contextNode = {term: corpusCollocate.getContextTerm(), type: 'context', value: corpusCollocate.getContextTermRawFreq(), start: 0};
    	    			var contextNodeKey = [contextNode.term,contextNode.type].join(";");
    	    			if (thisNodes[contextNodeKey]) {/*thisNodes[contextNodeKey].value+=contextNode.value;*/}
    	    			else {thisNodes[contextNodeKey]=contextNode;}
    	    			
    	    			var linkKey = [keywordNodeKey,contextNodeKey].join("--");
    	    			if (!thisLinks[linkKey]) {thisLinks[linkKey]={source:thisNodes[keywordNodeKey],target:thisNodes[contextNodeKey]};}
    	    			
    	    		});
    	    		
    	    		this.updateNodesAndLinks(thisNodes, thisLinks);
    	    		
    			}
    		},
    		scope: this
    	});
    },
    
    updateNodesAndLinks: function(nodes, links) {
    	nodes = nodes || this.getNodes() || {};
    	links = links || this.getLinks() || {};
		this.setNodes(nodes);
		this.setLinks(links);
		this.getForce().nodes($.map(nodes, function(v) { return v; }));
		this.getForce().links($.map(links, function(v) { return v; }));
		this.start();
    }
    
});
Ext.define('Voyant.panel.Contexts', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	requires: ['Voyant.data.store.Contexts'],
	alias: 'widget.contexts',
    statics: {
    	i18n: {
    		title: {en: "Contexts"},
    		emptyText: {en: "No matching results."},
    		document: {en: "Document"},
    		documentTip: {en: "The document of the occurrence."},
    		helpTip: {en: "The Keywords in Context tool shows each occurrence of a keyword with a bit of surounding text (the context). It can be useful for studying more closely how terms are used in different contexts. Features include:</p><ul><li>reordering document, by keyword or by left or right context</li><li>a search box for queries (hover over the magnifying icon for help with the syntax)</li></ul>"},
    		termTip: {en: "The keyword for the context."},
    		left: {en: "Left"},
    		leftTip: {en: "Context to the left of the keyword."},
    		right: {en: "Right"},
    		rightTip: {en: "Context to the right of the keyword."},
    		context: {en: "context"},
    		expand: {en: "expand"},
    		corpus: {en: "corpus"},
    		corpusTip: {en: "Reset to corpus mode (contexts from all documents)."}
    	},
    	api: {
    		query: undefined,
    		docId: undefined,
    		docIndex: undefined,
    		stopList: 'auto',
    		context: 5,
    		expand: 50
    	},
		glyph: 'xf0ce@FontAwesome'
    },
    constructor: function() {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
        var me = this;

        Ext.apply(me, { 
    		title: this.localize('title'),
    		emptyText: this.localize("emptyText"),
            store : Ext.create("Voyant.data.store.Contexts", {
            	stripTags: "all",
            	remoteSort: false,
            	sortOnLoad: true,
            	sorters: {
                    property: 'position',
                    direction: 'ASC'
            	}
            }),
    		selModel: Ext.create('Ext.selection.RowModel', {
                listeners: {
                    selectionchange: {
                    	fn: function(sm, selections) {
                    		this.getApplication().dispatchEvent('termLocationClicked', this, selections);
                    	},
                    	scope: this
                    }
                }
            }),
            plugins: [{ // the expander slider assumes there's only one plugin, needs to be updated if changed
                ptype: 'rowexpander',
                rowBodyTpl : new Ext.XTemplate('')
            }],
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                items: [{
                    xtype: 'querysearchfield'
                }, {
                    xtype: 'totalpropertystatus'
                }, this.localize('context'), {
                	xtype: 'slider',
                	minValue: 5,
                	value: 5,
                	maxValue: 50,
                	increment: 5,
                	width: 50,
                	listeners: {
                		render: function(slider) {
                			slider.setValue(me.getApiParam('context'))
                		},
                		changecomplete: function(slider, newValue) {
                			me.setApiParam("context", slider.getValue());
           		        	me.getStore().loadPage(1, {params: me.getApiParams()});
                		}
                	}
                }, this.localize('expand'), {
                	xtype: 'slider',
                	minValue: 5,
                	value: 5,
                	maxValue: 500,
                	increment: 10,
                	width: 50,
                	listeners: {
                		render: function(slider) {
                			slider.setValue(me.getApiParam('expand'))
                		},
                		changecomplete: function(slider, newValue) {
                			me.setApiParam('expand', newValue);
                			var view = me.getView();
                			var recordsExpanded = me.plugins[0].recordsExpanded;
                			var store = view.getStore();
                			for (id in recordsExpanded) {
                				if (recordsExpanded[id]) {
                					var record = store.getByInternalId(id);
                					var row = view.getRow(record);
                					var expandRow = row.parentNode.childNodes[1]
                					view.fireEvent("expandbody", row, record, expandRow, {force: true})
                				}
                			}
                		}
                	}
                },{
                	text: this.localize('corpus'),
                	tooltip: this.localize("corpusTip"),
                	itemId: 'corpus',
                	handler: function(btn) {
                		btn.hide()
                		this.setApiParams({docIndex: undefined, docId: undefined});
                		this.getStore().load({params: this.getApiParams()})
                	},
                	hidden: true,
                	scope: this
                }]
            }], 
    		columns: [{
    			text: this.localize("document"),
    			toolTip: this.localize("documentTip"),
                width: 'autoSize',
        		dataIndex: 'docIndex',
                sortable: false,
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                	return store.getCorpus().getDocument(value).getTinyLabel();
                }
            },{
    			text: this.localize("left"),
    			tooltip: this.localize("leftTip"),
    			align: 'right',
        		dataIndex: 'left',
                sortable: true,
                flex: 1
            },{
    			text: this.localize("term"),
    			tooltip: this.localize("termTip"),
        		dataIndex: 'term',
                sortable: true,
                width: 'autoSize'
            },{
    			text: this.localize("right"),
    			tooltip: this.localize("rightTip"),
        		dataIndex: 'right',
                sortable: true,
                flex: 1
            }],
            listeners: {
            	documentSegmentTermClicked: {
	           		 fn: function(src, documentSegmentTerm) {
	           			 if (!documentSegmentTerm.term) {return}
	           			 params = {query: documentSegmentTerm.term};
	           			 if (documentSegmentTerm.docId) {
	           				 params.docId = documentSegmentTerm.docId
	           			 }
	           			 else {
	           				 // default to first document
	           				 params.docIndex = documentSegmentTerm.docIndex ?  documentSegmentTerm.docIndex : 0
	           			 }
	           			 this.setApiParams(params);
	       	        	if (this.isVisible()) {
	       		        	this.getStore().loadPage(1, {params: this.getApiParams()});
	       	        	}
	           		 },
	           		 scope: this
            	},
	           	 documentIndexTermsClicked: {
	           		 fn: function(src, documentIndexTerms) {
	           			// this isn't quite right, since we want every term associated with a docIndex, but for now it will do
	           			var queriesHash = {};
	           			var queries = [];
	           			var docIndexHash = {};
	           			var docIndex = [];
	           			documentIndexTerms.forEach(function(item) {
	           				if (!queriesHash[item.term]) {
	           					queries.push(item.term);
	           					queriesHash[item.term]=true;
	           				}
	           				if (!docIndexHash[item.docIndex]) {
	           					docIndex.push(item.docIndex);
	           					docIndexHash[item.docIndex]=true;
	           				}
	           			});
	       	        	this.setApiParams({
	       	        		docId: undefined,
	       	        		docIndex: docIndex,
	       	        		query: queries
	       	        	});
	       	        	this.down("#corpus").show()
	       	        	if (this.isVisible()) {
	       		        	this.getStore().loadPage(1, {params: this.getApiParams()});
	       	        	}
	           		 },
	           		 scope: this
	           	 },
                 afterrender: function(me) {
                	 me.getView().on('expandbody', function( rowNode, record, expandRow, eOpts ) {
                		 if (expandRow.innerText=="" || (eOpts && eOpts.force)) {
                	            var store = Ext.create("Voyant.data.store.Contexts", {
                	            	stripTags: "all",
                	            	corpus: me.getStore().getCorpus()
                	            })
                	            var data = record.getData()
                	            store.load({
                	            	params: {
                    	            	query: data.query,
                    	            	docIndex: data.docIndex,
                    	            	position: data.position,
                    	            	limit: 1,
                    	            	context: me.getApiParam('expand')
                	            	},
                	                callback: function(records, operation, success) {
                	                	if (success && records.length==1) {
                	                		data = records[0].getData()
                	                		operation.expandRow.firstElementChild.firstElementChild.innerHTML = data.left + " <span class='word keyword'>" + data.middle + "</span> " + data.right
                	                	}
                	                },
                	                expandRow : expandRow
                	            })
                	            
                		 }
                	 }) 
                 }

            }
        });
        
        me.on("loadedCorpus", function(src, corpus) {
        	this.getStore().setCorpus(corpus);
//        	if (this.getApiParam("query")) {
        		var corpusTerms = Ext.create("Voyant.data.store.CorpusTerms", {corpus: corpus});
        		corpusTerms.load({
        		    callback: function(records, operation, success) {
        		    	if (success && records.length>0) {
        		    		this.setApiParam("query", records[0].getTerm());
        		    		this.getStore().load({params: this.getApiParams()});
        		    	}
        		    },
        		    scope: me,
        		    params: {
        				limit: 1,
        				stopList: this.getApiParam("stopList")
        			}
            	});
 //       	}
//            	this.getStore().load({params: this.getApiParams()});
        });
        
        me.on("query", function(src, query) {
        	this.setApiParam('query', query);
        	this.getStore().load({params: this.getApiParams()});
        }, me);
        
        me.on("documentTermsClicked", function(src, documentTerms) {
        	var documentIndexTerms = [];
        	documentTerms.forEach(function(documentTerm) {
        		documentIndexTerms.push({
        			term: documentTerm.getTerm(),
        			docIndex: documentTerm.getDocIndex()
        		});
        	});
        	this.fireEvent("documentIndexTermsClicked", this, documentIndexTerms);
        });
        
        me.on("termsClicked", function(src, terms) {
        	var documentIndexTerms = [];
        	if (Ext.isString(terms)) {terms = [terms]}
        	terms.forEach(function(term) {
        		if (term.docIndex !== undefined) {
            		documentIndexTerms.push({
            			term: term.term,
            			docIndex: term.docIndex
            		});
        		}
        	});
        	if (documentIndexTerms.length > 0) {
        		this.fireEvent("documentIndexTermsClicked", this, documentIndexTerms);
        	}
        });

        me.callParent(arguments);
        
     }
     
})
Ext.define('Voyant.panel.CorpusCollocates', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.corpuscollocates',
	config: {
		corpus: undefined
	},
    statics: {
    	i18n: {
    		title: {en: "Collocates"},
    		emptyText: {en: "No matching results."},
    		helpTip: {en: "<p>Corpus Collocates is a table view of which terms appear more frequently in proximity to keywords across the entire corpus. Features include:</p><ul><li>reordering by keyword, collocate word, collocate word count</li><li>a search box for queries (hover over the magnifying icon for help with the syntax)</li></ul>"},
    		term: {en: "Term"},
    		termTip: {en: "This is the keyword term around which collocate (context) terms are counted."},
    		termRawFreq: {en: "Count (keyword)"},
    		termRawFreqTip: {en: "The number of times the keyword term occurs in the corpus."},
    		contextTerm: {en: "Collocate"},
    		contextTermTip: {en: "This is the collocate (context) term that occurs near the keyword term."},
    		contextTermRawFreq: {en: "Count (context)"},
    		contextTermRawFreqTip: {en: "The number of times this collocate occurs near the keyword term in the corpus."},
    		matchingTerms: {en: '{count}'}
    		
    		/*,
    		matchingTerms: {en: 'Matching terms: {count}'},
    		termTip: {en: "The term in a single, specific document."},
    		rawFreqTip: {en: "The count (raw frequency) of this term in this document."},
    		relativeFreqTip: {en: "The relative frequency (per million) of this term in each document."},
    		trendTip: {en: 'This is a sparkline graph that represents the distribution of the term within linear segments of the document (by default 10 segments of equal size).'},
    		tfidf: {en: 'Significance'},
    		tfidfTip: {en: 'The significance is measured here using an TF-IDF score, a common way of expressing how important a term is in a document relative to the rest of the corpus.'}
			*/
    	},
    	api: {
    		stopList: 'auto',
    		context: 5,
    		query: undefined,
    		docId: undefined,
    		docIndex: undefined
    	},
		glyph: 'xf0ce@FontAwesome'
    },
    constructor: function(config) {
    	
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		var store = this.getStore();
    		store.setCorpus(corpus);
    		if (this.isVisible()) {
    			this.loadFromApis();
    		}
    		
    	});
    	
    	if (config.embedded) {
//    		var cls = Ext.getClass(config.embedded).getName();
//    		if (cls=="Voyant.data.store.DocumentTerms" || cls=="Voyant.data.model.Document") {
//    			this.fireEvent('loadedCorpus', this, config.embedded.getCorpus())
//    		}
    	}
    	else if (config.corpus) {
    		this.fireEvent('loadedCorpus', this, config.corpus)
    	}
    	
    	this.on("corpusTermsClicked", function(src, terms) {
    		if (this.getStore().getCorpus()) { // make sure we have a corpus
        		var query = [];
        		terms.forEach(function(term) {
        			query.push(term.get("term"));
        		})
        		this.setApiParams({
        			query: query,
        			docId: undefined,
        			docIndex: undefined
        		});
        		if (this.isVisible()) {
            		this.getStore().loadPage(1, {params: this.getApiParams()});
        		}
    		}
    	});
    	
    	this.on("documentsClicked", function(src, documents) {
    		var docIds = [];
    		documents.forEach(function(doc) {docIds.push(doc.get('id'))});
    		this.setApiParams({
    			docId: docIds,
    			docid: undefined,
    			query: undefined
    		})
    		if (this.isVisible()) {
        		this.getStore().loadPage(1, {params: this.getApiParams()});
    		}
    	});
    	
    	this.on("activate", function() { // load after tab activate (if we're in a tab panel)
    		if (this.getStore().getCorpus()) {this.loadFromApis()}
    	}, this)
    	
    	this.on("query", function(src, query) {
    		this.setApiParam("query", query);
    		this.getStore().getProxy().setExtraParam("query", query);
    		this.loadFromApis();
    	}, this)
    },
    
    loadFromApis: function() {
    	if (this.getStore().getCorpus()) {
    		if (this.getApiParam('query')) {
    			this.getStore().loadPage(1, {params: this.getApiParams()});
    		}
    		else {
				var corpusTerms = this.getStore().getCorpus().getCorpusTerms({
					leadingBufferZone: 0,
					autoLoad: false
				});
        		corpusTerms.load({
        		    callback: function(records, operation, success) {
        		    	if (success) {
        		    		var terms = [];
        		    		records.forEach(function(term) {
        		    			terms.push(term.getTerm());
        		    		})
        		    		this.getStore().getProxy().setExtraParam("query", terms);
        		    		this.setApiParam('query', terms);
        		    		this.loadFromApis();
        		    	}
        		    },
        		    scope: this,
        		    params: {
        				limit: 10,
        				stopList: this.getApiParam("stopList")
        			}
            	});

    		}
    	}
    },
    
    initComponent: function() {
        var me = this;

        var store = Ext.create("Voyant.data.store.CorpusCollocates");
        
        Ext.apply(me, {
    		title: this.localize('title'),
    		emptyText: this.localize("emptyText"),
            store : store,
    		selModel: Ext.create('Ext.selection.CheckboxModel', {
                listeners: {
                    selectionchange: {
                    	fn: function(sm, selections) {
                    		var terms = [];
                    		var context = this.getApiParam("context")
                    		selections.forEach(function(selection) {
                    			terms.push('"'+selection.getKeyword()+" "+selection.getContextTerm()+'"~'+context)
                    		})
                    		this.getApplication().dispatchEvent('termsClicked', this, terms);
                    	},
                    	scope: this
                    }
                }
            }),
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                items: [{
                    xtype: 'querysearchfield'
                }, {
                    xtype: 'totalpropertystatus'
                }]
            }],
    		columns: [{
    			text: this.localize("term"),
        		dataIndex: 'term',
            	tooltip: this.localize("termTip"),
                sortable: true,
                flex: 1
            },{
    			text: this.localize("rawFreq"),
        		dataIndex: 'rawFreq',
            	tooltip: this.localize("termRawFreqTip"),
                sortable: true,
                width: 'autoSize',
                hidden: true
            },{
            	text: this.localize("contextTerm"),
            	dataIndex: 'contextTerm',
            	tooltip: this.localize("contextTermTip"),
            	flex: 1,
            	sortable: true
            },{
            	text: this.localize("contextTermRawFreq"),
            	tooltip: this.localize("contextTermRawFreqTip"),
            	dataIndex: 'contextTermRawFreq',
            	width: 'autoSize',
            	sortable: true
            }/*,{
                xtype: 'widgetcolumn',
                text: this.localize("trend"),
                tooltip: this.localize('trendTip'),
                width: 120,
                dataIndex: 'distributions',
                widget: {
                    xtype: 'sparklineline'
                }
            }*/],
            
            listeners: {
            	termsClicked: {
            		fn: function(src, terms) {
                		if (this.getStore().getCorpus()) { // make sure we have a corpus
                    		var queryTerms = [];
                    		terms.forEach(function(term) {
                    			if (term.term) {queryTerms.push(term.term);}
                    		});
                    		if (queryTerms) {
                    			this.setApiParams({
                    				docIndex: undefined,
                    				docId: undefined,
                    				query: queryTerms
                    			});
                        		if (this.isVisible()) {
                            		if (this.isVisible()) {
                                		this.getStore().loadPage(1, {params: this.getApiParams()});
                            		}
                        		}
                    		}
                		}
                	},
                	scope: this
            	}
            }
        });

        me.callParent(arguments);
        
        me.getStore().getProxy().setExtraParam("withDistributions", true);
        
    }
    
})
Ext.define('Voyant.panel.CorpusCreator', {
	extend: 'Ext.form.Panel',
	requires: ['Ext.form.field.File'],
	requires: ['Voyant.data.model.Corpus'],
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.corpuscreator',
    statics: {
    	i18n: {
    		title: {en: "Add Texts"},
    		helpTip: {en: "This tool allows you to create a corpus in one of three ways:<ol><li>by typing or pasting text into the text box and clicking <i>Reveal</i>; if each line in the text box is a URL, text is fetched from those URLs, otherwise the contents are treated as a single document</li><li>click the <i>Open</i> button to open an existing corpus</li><li>click the <i>Upload</i> button to upload one or more files from you computer (you can select multiple files by using the Ctrl and/or Shift keys)</li></ul>"},
    		gearTip: {en: "Options"},
    		gearWinTitle: {en: "Options"},
    		inputFormat: {en: "Input Format"},
    		xpathDocuments: {en: "XPath to Documents"},
    		xpathContent: {en: "XPath to Content"},
    		xpathTitle: {en: "XPath to Title"},
    		xpathAuthor: {en: "XPath to Author"},
    		emptyInput: {en: "Type in one or more URLs on separate lines or paste in a full text."},
    		uploadingCorpus: {en: "Uploading corpus…"},
    		fileTypesWarning: {en: "File Types Warning"},
    		fileTypesMessage: {en: "You have one or more files with incompatible or unrecognized file extensions that may cause problems."},
    		badFiles: {en: "incompatible (likely error): "},
    		unknownFiles: {en: "unrecognized (possible error): "},
    		sureContinue: {en: "Are you sure you wish to continue?"},
    		reveal: {en: "Reveal"},
    		ok: {en: "OK"},
    		cancel: {en: "Cancel"}
    	},
    	api: {
    		inputFormat: undefined,
    		xmlDocumentsXpath: undefined,
    		xmlContentXpath: undefined,
    		xmlTitleXpath: undefined,
    		xmlAuthorXpath: undefined
    	}
    },
    config: {
    	
    },
    
    constructor: function(config) {
        this.callParent(arguments);
        config = config || {};
        
    	this.mixins['Voyant.panel.Panel'].constructor.call(this, Ext.apply(config, {includeTools: {gear: true, help: true}}));
    	
    },
    
    initComponent: function() {
        var me = this;

        Ext.apply(me, {
    		title: this.localize('title'),
    		width: 800,
    		frame: true,
    		padding: 10,
    		style: {
    		    borderColor: '#aaa',
    		    borderStyle: 'solid'
    		},
    		frameHeader: true,
    		layout: {
    			type: 'vbox',
    			align: 'middle'
    		},
	    	dockedItems: [{
	    		xtype: 'toolbar',
                dock: 'bottom',
    	    	buttonAlign: 'right',
    	    	defaultButtonUI : 'default',
	    		items: [{
	    			text: 'Open',
                    glyph: 'xf115@FontAwesome', // not visible
	    			tooltip: 'Select an exsting corpus',
	    			handler: function() {
	    				Ext.create('Ext.window.Window', {
	    				    title: 'Open an Existing Corpus',
	    				    layout: 'fit',
	    				    modal: true,
	    				    items: {  // Let's put an empty grid in just to illustrate fit layout
	    				        xtype: 'form',
	    				        margin: '5,5,5,5',
	    				        items: {
	    				            xtype:'combo',
	    				            labelWidth: 150,
	    				            fieldLabel:'Choose a corpus:',
	    				            name:'corpus',
	    				            queryMode:'local',
	    				            store:[['shakespeare',"Shakespeare's Plays"],['austen',"Austen's Novels"]],
	    				            
	    				            forceSelection:true
	    				        },
	    				        buttons: [
	    				        	{
	    				        		text: 'Open',
	    			                    glyph: 'xf00c@FontAwesome',
	    				        		handler: function(btn) {
	    				        			var form = btn.up('form').getForm();
	    				        			var corpus = btn.up('form').getForm().getValues().corpus;
	    				        			if (corpus!='') {
	    				        				me.loadCorpus({corpus: corpus});
		    				        			btn.up('window').close();
	    				        			}
	    				        			else {
	    				    	        		Ext.Msg.show({
	    				    	        		    title:'Select a Corpus',
	    				    	        		    message: 'Please be sure to select a corpus.',
	    				    	        		    buttons: Ext.Msg.OK,
	    				    	        		    icon: Ext.Msg.ERROR
	    				    	        		});
	    				        			}
	    				        		},
	    				        		flex: 1
	    				            },{
	    				        		text: 'Cancel',
	    			                    glyph: 'xf00d@FontAwesome',
	    				        		flex: 1,
	    				        		handler: function(btn) {
	    				        			btn.up('window').close();
	    				        		}
	    				        	}
	    				        ]
	    				    }
	    				}).show();
	    			}
	    		},{
    	        	xtype: 'filefield',
                    glyph: 'xf093@FontAwesome',
    	        	name: 'upload',
        	    	buttonOnly: true,
        	    	hideLabel: true,
        	    	buttonText: 'Upload',
        	    	tooltip: 'test',
        	    	listeners: {
        	    		render: function(filefield) {
        	    			filefield.fileInputEl.dom.setAttribute('multiple', true);
        	    		      Ext.QuickTips.register({
        	      		        target: filefield.getEl(),
        	      		        text: 'Upload one or more documents from your computer',
        	      		        enabled: true,
        	      		        showDelay: 20,
        	      		        trackMouse: true,
        	      		        autoShow: true
        	      		      });
        	            },
        	            change: function(filefield, value) {
        	            	if (value) {
            	            	var form = filefield.up('form').getForm();
            	            	if (form.isValid()) {
            	            		var files = filefield.fileInputEl.dom.files;
            	            		var badFilesRe = /\.(png|gif|jpe?g|xls|mp[234a]|mpeg|exe|wmv|avi|ppt|mpg|tif|wav|mov|psd|wma|ai|bmp|pps|aif|pub|dwg|indd|swf|asf|mbd|dmg|flv)$/i;
            	            		var goodFilesRe = /\.(txt|pdf|html?|xml|docx?|rtf|pages|odt|zip|jar|tar|gz|ar|cpio|bzip2|bz2|gzip)$/i;
            	            		var badFiles = [];
            	            		var unknownFiles = [];
            	            		for (var i = 0, len = files.length; i<len; i++) {
            	            			var filename = files[i].name;
            	            			if (badFilesRe.test(filename)) {
            	            				badFiles.push(filename.split("/").pop());
            	            			}
            	            			else if (!goodFilesRe.test(filename)) {
            	            				unknownFiles.push(filename.split("/").pop());
            	            			}
            	            		}
            	            		if (badFiles.length>0 || unknownFiles.length>0) {
            	            			var file = filefield;
            	            			Ext.Msg.show({
            	            				title: me.localize("fileTypesWarning"),
            	            				icon: Ext.MessageBox.ERROR,
            	            				message: me.localize('fileTypesMessage')+'<ul>' +
            	            					(badFiles.length > 0 ? ('<li>'+me.localize("badFiles") + badFiles.slice(0, 5).join(", ") + (badFiles.length>5 ? '…' : '') + '</li>') : '') +
            	            					(unknownFiles.length>0 ? ('<li>' +me.localize("unknownFiles") + unknownFiles.slice(0, 5).join(", ") + (unknownFiles.length>5 ? '…' : '') +'</li>') : '')+
            	            					'</ul>'+me.localize('sureContinue'),
            	            				buttons: Ext.Msg.YESNO,
            	            				fn: function(btn) {
            	            			        if (btn === 'yes') {
            	            			        	me.loadForm(form);
            	            			        }
            	            			        else {
            	            			        	file.reset(); // make sure we can trigger a change next time
            	            			        	file.fileInputEl.dom.setAttribute('multiple', true);
            	            			        }
            	            			    },
            	            				scope: form
            	            			});
            	            		}
            	            		else {
            	            			me.loadForm(form);
            	            		}
            	            	}
        	            	}
        	            }
        	    	}
	    		},'->',{
	    	    	xtype: 'button',
	    	    	scale: 'large',
                    glyph: 'xf00c@FontAwesome',
	    	    	text: this.localize('reveal'),
	    	    	handler: function(btn) {
	    	        	var input = btn.up('form').down('#input').getValue();
	    	        	if (input !== '') {
	    	        		me.loadCorpus({input: input});
	    	        	}
	    	        	else {
	    	        		Ext.Msg.show({
	    	        		    title:'No Text Provided',
	    	        		    message: 'Please provide text in the text box (or choose open or upload).',
	    	        		    buttons: Ext.Msg.OK,
	    	        		    icon: Ext.Msg.ERROR
	    	        		});
	    	        	}
	    	    	}
	    	    }]
	    	}],
	    	items: {
    	    	xtype: 'textareafield',
    	    	width: 800,
    	    	height: 100,
    	    	itemId: 'input',
    	    	emptyText: this.localize('emptyInput')
	    	}    
        });
        
        me.callParent(arguments);
    },
    
    loadForm: function(form) {
    	var params = {tool: 'corpus.CorpusCreator'};
    	var apiParams = this.getApiParams();
    	delete apiParams.view;
    	delete apiParams.stopList;
    	Ext.apply(params, apiParams);
    	
    	var view = this.getApplication().getViewport();
		view.mask(this.localize('uploadingCorpus'));
		form.submit({
			url: this.getTromboneUrl(),
			params: params,
			failure: function(form, action) { // we always fail because of content-type
            	view.unmask();
				if (action.result) {
					this.loadCorpus({corpus: action.result.stepEnabledCorpusCreator.storedId});
				}
			},
			scope: this
		});
    },
   
    loadCorpus: function(params) {
		var app = this.getApplication();
    	var view = app.getViewport();
		view.mask();
		new Corpus(params).then(function(corpus) {
			view.unmask();
			app.dispatchEvent('loadedCorpus', app, corpus);
		}).fail(function(message, response) {
			view.unmask();
			app.showErrorResponse({message: message}, response);
		});
    },
    
    showOptionsClick: function(panel) {
    	var me = panel;
    	if (me.optionsWin === undefined) {
    		me.optionsWin = Ext.create('Ext.window.Window', {
    			title: me.localize('gearWinTitle'),
    			closeAction: 'hide',
    			height: 225,
    			width: 500,
    			layout: 'fit',
    			bodyPadding: 10,
    			items: [{
    				xtype: 'form',
    				defaultType: 'textfield',
    				fieldDefaults: {
    					labelAlign: 'right',
    					labelWidth: 160
    				},
    				items: [{
    					fieldLabel: me.localize('xpathDocuments'),
    					name: 'xmlDocumentsXpath'
    				},{
    					fieldLabel: me.localize('xpathContent'),
    					name: 'xmlContentXpath'
    				},{
    					fieldLabel: me.localize('xpathAuthor'),
    					name: 'xmlAuthorXpath'
    				},{
    					fieldLabel: me.localize('xpathTitle'),
    					name: 'xmlTitleXpath'
    				}]
    			}],
    			buttons: [{
    				text: me.localize('ok'),
    				handler: function(button, event) {
    					var win = button.findParentByType('window');
    					var form = win.down('form');
    					var params = form.getValues();
    					me.setApiParams(params);
    					win.hide();
    				}
    			},{
    				text: me.localize('cancel'),
    				handler: function(button, event) {
    					button.findParentByType('window').hide();
    				}
    			}]
    		});
    	}
    	me.optionsWin.show();
    }
    
});
Ext.define('Voyant.panel.Phrases', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.phrases',
	config: {
		corpus: undefined
	},
    statics: {
    	i18n: {
    		title: {en: "Phrases"},
    		emptyText: {en: "No matching results."},
    		helpTip: {en: "<p>Corpus Phrases is a table view of repeating phrases in the entire corpus.<!-- Features include:</p><ul><li>reordering by keyword, collocate word, collocate word count</li><li>a search box for queries (hover over the magnifying icon for help with the syntax)</li></ul>-->"},
    		term: {en: "Term"},
    		termTip: {en: "This is the keyword phrase (this is a generalized form, it may appear slightly differently for each occurrence)."},
    		termRawFreq: {en: "Count"},
    		termRawFreqTip: {en: "The number of times the phrase occurs in the corpus."},
    		matchingTerms: {en: '{count}'},
    		length: {en: "Length"},
    		lengthTip: {en: "The upper and lower bounds of phrase lengths (how many words in each phrase)."},
    		overlap: {en: "Overlap"},
    		overlapTip: {en: "overlap tip"},
    		overlapMenu: {en: "Choose an overlap filter:"},
    		overlapNone: {en: "none (keep all)"},
    		overlapLength: {en: "prioritize longest phrases"},
    		overlapFreq: {en: "prioritize most frequent phrases"}
    	},
    	api: {
    		stopList: 'auto',
    		query: undefined,
    		docId: undefined,
    		docIndex: undefined,
    		sort: 'length',
    		dir: 'desc',
    		minLength: 2,
    		maxLength: 50,
    		overlapFilter: 'length'
    	},
		glyph: 'xf0ce@FontAwesome'
    },
    constructor: function(config) {
    	
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		var store = this.getStore();
    		store.setCorpus(corpus);
    		if (this.isVisible()) {
    			this.loadFromApis();
    		}
    		
    	});
    	
    	if (config.embedded) {
//    		var cls = Ext.getClass(config.embedded).getName();
//    		if (cls=="Voyant.data.store.DocumentTerms" || cls=="Voyant.data.model.Document") {
//    			this.fireEvent('loadedCorpus', this, config.embedded.getCorpus())
//    		}
    	}
    	else if (config.corpus) {
    		this.fireEvent('loadedCorpus', this, config.corpus)
    	}
    	
    	this.on("corpusTermsClicked", function(src, terms) {
    		if (this.getStore().getCorpus()) { // make sure we have a corpus
        		var query = [];
        		terms.forEach(function(term) {
        			query.push(term.get("term"));
        		})
        		this.setApiParams({
        			query: query,
        			docId: undefined,
        			docIndex: undefined
        		});
        		if (this.isVisible()) {
            		this.getStore().load({params: this.getApiParams()});
        		}
    		}
    	});
    	
    	this.on("activate", function() { // load after tab activate (if we're in a tab panel)
    		if (this.getStore().getCorpus()) {this.loadFromApis()}
    	}, this)
    	
    	this.on("query", function(src, query) {
    		this.setApiParam("query", query);
    		this.getStore().getProxy().setExtraParam("query", query);
    		this.loadFromApis();
    	}, this)
    },
    
    loadFromApis: function() {
    	if (this.getStore().getCorpus()) {
    			this.getStore().load({params: this.getApiParams()});
    	}
    },
    
    initComponent: function() {
        var me = this;

        var store = Ext.create("Voyant.data.store.CorpusNgrams", {
        	autoLoad: false
        });
        me.on("sortchange", function( ct, column, direction, eOpts ) {
        	this.setApiParam('sort', column.dataIndex);
        	this.setApiParam('dir', direction);
        	var api = this.getApiParams(["stopList", "query", "docId", "docIndex", "sort", "dir", "minLength", "maxLength", "overlapFilter"]);
        	var proxy = this.getStore().getProxy();
        	for (var key in api) {proxy.setExtraParam(key, api[key]);}
        }, me)
        
        Ext.apply(me, {
    		title: this.localize('title'),
    		emptyText: this.localize("emptyText"),
            store : store,
    		selModel: Ext.create('Ext.selection.CheckboxModel', {
                listeners: {
                    selectionchange: {
                    	fn: function(sm, selections) {
                    		var terms = [];
                    		var context = this.getApiParam("context")
                    		selections.forEach(function(selection) {
                    			terms.push('"'+selection.getTerm()+'"')
                    		})
                    		this.getApplication().dispatchEvent('termsClicked', this, terms);
                    	},
                    	scope: this
                    }
                }
            }),
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                items: [{
                    xtype: 'querysearchfield'
                }, {
                    xtype: 'totalpropertystatus'
                }, '-', {
                	text: me.localize('length'),
                	tooltip: 'test',
                	xtype: 'label'
                }, {
                	xtype: 'slider',
                	minValue: 2,
                	values: [2, 30],
                	maxValue: 30,
                	increment: 1,
                	width: 75,
                	tooltip: this.localize("lengthTip"),
                	listeners: {
                		render: {
                			fn: function(slider) {
                				var values = slider.getValues();
                				slider.setValue(0, parseInt(this.getApiParam("minLength", values[0])))
                				slider.setValue(1, parseInt(this.getApiParam("maxLength", values[1])))
	                		},
	                		scope: me
                		},
                		changecomplete: {
                			fn: function(slider, newValue) {
                				var values = slider.getValues();
                				this.setApiParam("minLength", parseInt(values[0]));
                				this.setApiParam("maxLength", parseInt(values[1]));
                        		this.getStore().load({params: this.getApiParams()});
                    		},
                    		scope: me
                		}
                	}
                }, '-', {
                    xtype: 'button',
                    text: this.localize('overlap'),
                    tooltip: this.localize('overlapTip'),
                    menu: {
                    	items: [
                           '<b class="menu-title">'+this.localize('overlapMenu')+'</b>',
                           {
                               text: this.localize("overlapNone"),
                               checked: true,
                               group: 'overlap',
                               checkHandler: function() {
                            	   this.setApiParam('overlapFilter', 'none')
                            	   this.getStore().load({params: this.getApiParams()})
                               },
                               scope: this
                           }, {
                               text: this.localize("overlapLength"),
                               checked: false,
                               group: 'overlap',
                               checkHandler: function() {
                            	   this.setApiParam('overlapFilter', 'length')
                            	   this.getStore().load({params: this.getApiParams()})
                               },
                               scope: this
                           }, {
                               text: this.localize("overlapFreq"),
                               checked: false,
                               group: 'overlap',
                               checkHandler: function() {
                            	   this.setApiParam('overlapFilter', 'rawfreq')
                            	   this.getStore().load({params: this.getApiParams()})
                               },
                               scope: this
                           }
	                   ]
                    }
                }]
            }],
    		columns: [{
    			text: this.localize("term"),
        		dataIndex: 'term',
            	tooltip: this.localize("termTip"),
                sortable: true,
                flex: 1
            },{
    			text: this.localize("rawFreq"),
        		dataIndex: 'rawFreq',
            	tooltip: this.localize("termRawFreqTip"),
                sortable: true,
                width: 'autoSize'
            },{
            	text: this.localize("length"),
            	dataIndex: 'length',
            	tooltip: this.localize("lengthTip"),
            	sortable: true,
                width: 'autoSize'
            },{
                xtype: 'widgetcolumn',
                text: this.localize("trend"),
                tooltip: this.localize('trendTip'),
                width: 120,
                dataIndex: 'distributions',
                widget: {
                    xtype: 'sparklineline'
                }
            }],
            
            listeners: {
            	termsClicked: {
            		fn: function(src, terms) {
                		if (this.getStore().getCorpus()) { // make sure we have a corpus
                    		var queryTerms = [];
                    		terms.forEach(function(term) {
                    			if (term.term) {queryTerms.push(term.term);}
                    		});
                    		if (queryTerms) {
                    			this.setApiParams({
                    				docIndex: undefined,
                    				docId: undefined,
                    				query: queryTerms
                    			});
                        		if (this.isVisible()) {
                            		if (this.isVisible()) {
                                		this.getStore().loadPage(1, {params: this.getApiParams()});
                            		}
                        		}
                    		}
                		}
                	},
                	scope: this
            	}
            }
        });

        me.callParent(arguments);
        
        me.getStore().getProxy().setExtraParam("withDistributions", true);
        
    }
    
})
Ext.define('Voyant.panel.CorpusTerms', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.corpusterms',
    statics: {
    	i18n: {
    		title: {en: "Corpus Terms"},
    		emptyText: {en: "No matching results."},
    		helpTip: {en: "<p>Corpus Terms is a table view of terms that appear in the entire corpus. Features include:</p><ul><li>reordering by <i>term</i> and <i>count</i> (click on the column headers)</li><li>a sparkline graph of the term frequency trends across the corpus (if the corpus has multiple documents) or across the document (if the corpus has only one document)</li><li>additional columns available (relative frequency, distribution peakedness and skew) by clicking on the arrow that appears when hovering over a header</li><li>a search box for queries (hover over the magnifying icon for help with the syntax)</li></ul>"},
    		matchingTerms: {en: 'Matching terms: {count}'},
    		termTip: {en: "The term in the corpus."},
    		rawFreqTip: {en: "The total count (raw frequency) of this term in the entire corpus."},
    		relativeFreqTip: {en: "The relative frequency (per million) of this term in the entire corpus"/*, also expressed as a percentage*/+"."},
    		relativePeakedness: {en: "Peakedness"},
    		relativePeakednessTip: {en: "This is a statistical measure of how much the relative frequencies of a term in a corpus are bunched up into peaks (regions with higher values where the rest are lower)."},
    		relativeSkewness: {en: "Skew"},
    		relativeSkewnessTip: {en: "This is a statistical measure of the symmetry of the relative frequencies of a term across the corpus."},
    		trendTip: {en: "This represents the trend of the relative frequencies for each term in each document in the corpus."}
    	},
    	api: {
    		stopList: 'auto',
    		query: undefined
    	},
		glyph: 'xf0ce@FontAwesome'
    },
    config: {
    	options: {
    		xtype: 'stoplistoption'
    	}
    },
    constructor: function(config) {
    	
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		var store = this.getStore();
    		store.setCorpus(corpus);
    		store.getProxy().setExtraParam('corpus', corpus.getId())
    		this.fireEvent("apiChange", this);
    	});
    	
    	this.on("query", function(src, query) {
    		this.setApiParam('query', query);
    		this.fireEvent("apiChange", this);
    		this.store.loadPage(1)
    	}, this);
    	
    	this.on("apiChange", function() {
    		var api = this.getApiParams(['stopList','query']);
        	var proxy = this.getStore().getProxy();
        	for (var key in api) {proxy.setExtraParam(key, api[key]);}
        	this.getStore().loadPage(1);
    	}, this)
    	
    	if (config.embedded) {
    		var cls = Ext.getClass(config.embedded).getName();
    		if (cls=="Voyant.data.store.CorpusTerms") {
    			this.fireEvent('loadedCorpus', this, config.embedded.getCorpus())
    		}
    		if (cls=="Voyant.data.model.Corpus") {
        		this.fireEvent('loadedCorpus', this, config.embedded)
    		}
    	}
    	else if (config.corpus) {
    		this.fireEvent('loadedCorpus', this, config.corpus)
    	}

    },
    
    initComponent: function() {
        var me = this;

        var store = Ext.create("Voyant.data.store.CorpusTerms");
        store.getProxy().setExtraParam("withDistributions", "relative");
        
        Ext.apply(me, {
    		title: this.localize('title'),
    		emptyText: this.localize("emptyText"),
            store : store,
    		selModel: Ext.create('Ext.selection.CheckboxModel', {
                pruneRemoved: false,
                listeners: {
                    selectionchange: {
                    	fn: function(sm, selections) {
                    		if (selections && selections.length>0) {
                        		this.getApplication().dispatchEvent('corpusTermsClicked', this, selections);
                    		}
                    	},
                    	scope: this
                    }
                },
                mode: 'SIMPLE'
            }),
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                items: [{
                    xtype: 'querysearchfield'
                }, {
                    xtype: 'totalpropertystatus'
                }]
            }],

    		columns: [{
                xtype: 'rownumberer',
                width: 'autoSize',
                sortable: false
            },{
    			text: this.localize("term"),
            	tooltip: this.localize("termTip"),
        		dataIndex: 'term',
        		flex: 1,
                sortable: true
            },{
            	text: this.localize("rawFreq"),
            	tooltip: this.localize("rawFreqTip"),
            	dataIndex: 'rawFreq',
                width: 'autoSize',
            	sortable: true
            },{
            	text: this.localize("relativeFreq"),
            	tooltip: this.localize("relativeFreqTip"),
            	dataIndex: 'relativeFreq',
            	renderer: function(val) {
            		var percent = val*100;
            		return Ext.util.Format.number(val*1000000, "0,000")/* + " (%"+
            			(val*100 <  .1 ? "<0.1" : Ext.util.Format.number(val*100, "0.0"))+")"*/
            	},
                width: 'autoSize',
                hidden: true,
            	sortable: true
            },{
            	text: this.localize("relativePeakedness"),
            	tooltip: this.localize("relativePeakednessTip"),
            	dataIndex: 'relativePeakedness',
            	renderer: Ext.util.Format.numberRenderer("0,000.0"),
                width: 'autoSize',
                hidden: true,
            	sortable: true
            },{
            	text: this.localize("relativeSkewness"),
            	tooltip: this.localize("relativeSkewnessTip"),
            	dataIndex: 'relativeSkewness',
            	renderer: Ext.util.Format.numberRenderer("0,000.0"),
                width: 'autoSize',
                hidden: true,
            	sortable: true
            },{
                xtype: 'widgetcolumn',
                text: this.localize("trend"),
                tooltip: this.localize("trendTip"),
                flex: 1,
                dataIndex: 'distributions',
                widget: {
                    xtype: 'sparklineline',
                    tipTpl: new Ext.XTemplate('{[this.getDocumentTitle(values.x,values.y)]}', {
                    	getDocumentTitle: function(docIndex, relativeFreq) {
                    		return this.panel.store.getCorpus().getDocument(docIndex).getTitle()+"<br>relative frequency: "+Ext.util.Format.number(relativeFreq*1000000, "0,000")
                    	},
                    	panel: me 
                    })
                }
            }]
        });

        me.callParent(arguments);
        
    },
    
    load: function() {
    	if (this.rendered) {
    		this.store.loadPage(1)
    	}
    	else {
			Ext.defer(this.load, 100, this);
    	}
    }
})

Ext.define('Voyant.panel.DocumentTerms', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	requires: ['Voyant.data.store.DocumentTerms'],
	alias: 'widget.documentterms',
	config: {
		corpus: undefined
	},
    statics: {
    	i18n: {
    		title: {en: "Document Terms"},
    		emptyText: {en: "No matching results."},
    		helpTip: {en: "<p>Document Terms is a table view of terms that appear in each document. Features include:</p><ul><li>reordering by <i>Term</i>, <i>Count</i> (raw frequency), and <i>Relative</i> frequency (click on the column headers)</li><li>a sparkline graph of the distribution of term frequencies across the documents</li><li>additional columns available (<i>Significance</i> or TF-IDF) by clicking on the arrow that appears when hovering over a header</li><li>a search box for queries (hover over the magnifying icon for help with the syntax)</li></ul>"},
    		matchingTerms: {en: 'Matching terms: {count}'},
    		termTip: {en: "The term in a single, specific document."},
    		rawFreqTip: {en: "The count (raw frequency) of this term in this document."},
    		relativeFreqTip: {en: "The relative frequency (per million) of this term in each document."},
    		trendTip: {en: 'This is a sparkline graph that represents the distribution of the term within linear segments of the document (by default 10 segments of equal size).'},
    		tfidf: {en: 'Significance'},
    		tfidfTip: {en: 'The significance is measured here using an TF-IDF score, a common way of expressing how important a term is in a document relative to the rest of the corpus.'}
    	},
    	api: {
    		stopList: 'auto',
    		query: undefined,
    		docId: undefined,
    		docIndex: undefined
    	},
		glyph: 'xf0ce@FontAwesome'
    },
    constructor: function(config) {
    	
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		var store = this.getStore();
    		store.setCorpus(corpus);
    	});
    	
    	if (config.embedded) {
    		console.warn(config.embedded.then)
    		var cls = Ext.getClass(config.embedded).getName();
    		if (cls=="Voyant.data.store.DocumentTerms" || cls=="Voyant.data.model.Document") {
    			this.fireEvent('loadedCorpus', this, config.embedded.getCorpus())
    		}
    	}
    	else if (config.corpus) {
    		this.fireEvent('loadedCorpus', this, config.corpus)
    	}
    	
    	this.on("query", function(src, query) {
    		this.fireEvent("corpusTermsClicked", src, [query])
    	}, this);
    	
    	this.on("corpusTermsClicked", function(src, terms) {
    		if (this.getStore().getCorpus()) { // make sure we have a corpus
        		var query = [];
        		terms.forEach(function(term) {
        			query.push(Ext.isString(term) ? term : term.get("term"));
        		})
        		this.setApiParams({
        			query: query,
        			docId: undefined,
        			docIndex: undefined
        		});
        		if (this.isVisible()) {
            		this.getStore().loadPage(1, {params: this.getApiParams()});
        		}
    		}
    	});
    	
    	this.on("documentsClicked", function(src, documents) {
    		var docIds = [];
    		documents.forEach(function(doc) {docIds.push(doc.get('id'));});
    		this.setApiParams({
    			docId: docIds,
    			query: undefined
    		});
    		if (this.isVisible()) {
        		this.getStore().loadPage(1, {params: this.getApiParams()});
    		}
    	});
    	
    	this.on("activate", function() { // load after tab activate (if we're in a tab panel)
    		if (this.getStore().getCorpus()) {this.getStore().loadPage(1, {params: this.getApiParams()})}
    	}, this);
    },
    
    initComponent: function() {
        var me = this;

        var store = Ext.create("Voyant.data.store.DocumentTerms");
        
        Ext.apply(me, {
    		title: this.localize('title'),
    		emptyText: this.localize("emptyText"),
            store : store,
    		selModel: Ext.create('Ext.selection.CheckboxModel', {
                listeners: {
                    selectionchange: {
                    	fn: function(sm, selections) {
                    		this.getApplication().dispatchEvent('documentTermsClicked', this, selections);
                    	},
                    	scope: this
                    }
                },
                pruneRemoved: false,
    			mode: 'SIMPLE'
            }),
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                items: [{
                    xtype: 'querysearchfield'
                }, {
                    xtype: 'totalpropertystatus'
                }]
            }],
    		columns: [{
    			text: '#',
    			width: 30,
        		dataIndex: 'docIndex',
                sortable: true,
                renderer: function(v) {return v+1;} // 0-based to 1-based
            },{
    			text: this.localize("term"),
        		dataIndex: 'term',
            	tooltip: this.localize("termTip"),
                sortable: true,
                flex: 1
            },{
            	text: this.localize("rawFreq"),
            	dataIndex: 'rawFreq',
            	tooltip: this.localize("rawFreqTip"),
            	width: 'autoSize',
            	sortable: true
            },{
            	text: this.localize("relativeFreq"),
            	tooltip: this.localize("relativeFreqTip"),
            	dataIndex: 'relativeFreq',
            	width: 'autoSize',
            	sortable: true,
            	renderer: Ext.util.Format.numberRenderer('0,000')
            },{
            	text: this.localize("tfidf"),
            	tooltip: this.localize("tfidfTip"),
            	dataIndex: 'tfidf',
            	width: 'autoSize',
            	sortable: true,
            	hidden: true,
            	renderer: Ext.util.Format.numberRenderer('0,000.000')
            },{
                xtype: 'widgetcolumn',
                text: this.localize("trend"),
                tooltip: this.localize('trendTip'),
                flex: 1,
                dataIndex: 'distributions',
                widget: {
                    xtype: 'sparklineline'
                }
            }],
            
            listeners: {
            	termsClicked: {
            		fn: function(src, terms) {
                		if (this.getStore().getCorpus()) { // make sure we have a corpus
                    		var queryTerms = [];
                    		terms.forEach(function(term) {
                    			if (term.term) {queryTerms.push(term.term);}
                    		});
                    		if (queryTerms) {
                    			this.setApiParams({
                    				docIndex: undefined,
                    				docId: undefined,
                    				query: queryTerms
                    			});
                        		if (this.isVisible()) {
                            		if (this.isVisible()) {
                                		this.getStore().loadPage(1, {params: this.getApiParams()});
                            		}
                        		}
                    		}
                		}
                	},
                	scope: this
            	}
            }
        });

        me.callParent(arguments);
        
        me.getStore().getProxy().setExtraParam("withDistributions", true);
        
    }
    
})

Ext.define('Voyant.panel.Documents', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'/*,'Voyant.util.Localization'*/],
	alias: 'widget.documents',
    statics: {
    	i18n: {
    		title: {en: "Documents"},
    		emptyText: {en: "No matching results."},
    		helpTip: {en: "<p>Documents is a table view of the documents in the corpus. Features include:</p><ul><li>reordering by <i>Title</i>, <i>Words</i> count (tokens), word forms count (<i>Types</i>), and <i>Ratio</i> (Types/Tokens Ratio) (click on the column headers)</li><li>a search box for queries (by default in the full-text, title and author fields &mdash; hover over the magnifying icon for help with the syntax)</li></ul>"},
    		id: {en: "ID"},
    		documentTitle: {en: "Title"},
    		documentAuthor: {en: "Author"},
    		tokensCountLexical: {en: "Words"},
    		typesCountLexical: {en: "Types"},
    		typeTokenRatioLexical: {en: "Ratio"},
    		language: {en: "Language"},
    		matchingDocuments: {en: "Matching documents: {count}"}
    	},
		glyph: 'xf0ce@FontAwesome'
    },

    constructor: function(config) {
    	
    	var store = Ext.create("Voyant.data.store.Documents", {
    	    selModel: {pruneRemoved: false}
    	});
    	
    	
    	Ext.apply(this, {
    		title: this.localize('title'),
    		emptyText: this.localize("emptyText"),
	    	columns:[
	    	   {
	    	        xtype: 'rownumberer',
	    	        width: 30,
	    	        sortable: false
	    	    },{
	    	        text: this.localize('documentTitle'),
	    	        dataIndex: 'title',
	    	        sortable: true,
	    	        flex: 3
	    	    },{
	    	        text: this.localize('documentAuthor'),
	    	        dataIndex: 'author',
	    	        sortable: true,
	    	        hidden: true,
	    	        flex: 2
	    	    },{
	    	        text: this.localize('tokensCountLexical'),
	    	        dataIndex: 'tokensCount-lexical',
	    	        renderer: Ext.util.Format.numberRenderer('0,000'),
	    	        sortable: true,
	    	        width: 'autoSize'
	    	    },{
	    	        text: this.localize('typesCountLexical'),
	    	        dataIndex: 'typesCount-lexical',
	    	        renderer: Ext.util.Format.numberRenderer('0,000'),
	    	        width: 'autoSize'
	    	    },{
	    	        text: this.localize('typeTokenRatioLexical'),
	    	        dataIndex: 'typeTokenRatio-lexical',
	    	        renderer: function(val) {return Ext.util.Format.percent(val)},
	    	        width: 'autoSize'
	    	    },{
	    	        text: this.localize('language'),
	    	        dataIndex: 'language',
	    	        hidden: true,
	    	        renderer: function(val, metaData, record, rowIndex, colIndex, store, view) {return view.ownerCt.getLanguage(val);},
	    	        width: 'autoSize'
	    	    }
	    	],
	    	
	        store: store,
	    	
	    	selModel: Ext.create('Ext.selection.RowModel', {
                listeners: {
                    selectionchange: {
                    	fn: function(sm, selections) {
                    		this.getApplication().dispatchEvent('documentsClicked', this, selections, this.getStore().getCorpus());
                    	},
                    	scope: this
                    }
                }
            }),
            
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                items: [{
                    xtype: 'querysearchfield'
                }, {
                    xtype: 'totalpropertystatus'
                }]
            }]
    	});
    	
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
        
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		this.store.setCorpus(corpus);
    		this.store.loadPage(1, {params: this.getApiParams()});
    	})
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('query', function(src, query) {
    		this.setApiParam('query', query);
    		this.store.loadPage(1, {params: this.getApiParams()});
    	})
    	
    	if (config.embedded) {
    		debugger
        	if (Ext.getClass(config.embedded).getName() == "Voyant.data.model.Corpus") {
        		config.corpus = config.embedded
        	}
        	else if (Ext.getClass(config.embedded).getName() == "Voyant.data.store.Documents") {
        		this.store.setRecords(config.embedded.getData())
        		config.corpus = config.embedded.getCorpus()
        	}
    		
    	}
    	
    	// if we have a corpus, load it
    	if (config.corpus) {
    		this.fireEvent('loadedCorpus', this, config.corpus)
    	}
    }
})
Ext.define('Voyant.panel.DocumentsFinder', {
	extend: 'Ext.grid.Panel',
	require: ['Voyant.data.store.DocumentQueryMatches','Ext.grid.plugin.CellEditing'],
	mixins: ['Voyant.panel.Panel'/*,'Voyant.util.Localization'*/],
	alias: 'widget.documentsfinder',
    statics: {
    	i18n: {
    		title: {en: "Documents Finder"},
    		emptyText: {en: "No matching results."},
    		operator: {en: "Operator"},
    		field: {en: "Field"},
    		query: {en: "Query"},
    		count: {en: "Count"},
    		emptyQuery: {en: 'type query here'},
    		titleField: {en: 'title'},
    		authorField: {en: 'author'},
    		pubDateField: {en: "publication date"},
    		publisherField: {en: "publisher"},
    		pubPlaceField: {en: "publication location"},
    		advancedField: {en: '<i>advanced query</i>'},
    		textField: {en: 'text (default)'},
    		loading: {en: 'loading corpus'},
    		unsuccessfulQuery: {en: "Unable to complete query."},
    		addRow: {en: 'Add Row'},
    		deleteRowTip: {en: 'Click to delete this row'},
    		noMatches: {'en': new Ext.Template('No matches (out of {0} documents).', {compiled: true})},
    		queryMatches: {en: new Ext.Template("A total of {0} matching documents (out of {1}).", {compiled: true})},
    		exportNewCorpus: {en: "New Corpus"},
    		exportNewCorpusTip: {en: "Create a new corpus from matching documents (button will be disabled if there are no matches)."}
    	}
    },
    
    config: {
    	corpus: undefined
    },

    constructor: function(config) {
    	
        this.cellEditing = Ext.create("Ext.grid.plugin.CellEditing", {
            clicksToEdit: 1
        });

        this.cellEditing.on('edit', this.onEditComplete, this);
    	
    	var me = this;
    	
    	Ext.apply(this, {
    		title: this.localize('title'),
    		emptyText: this.localize("emptyText"),
    		plugins: [this.cellEditing],
    		bbar: [
    		       {
                       text: this.localize('addRow'),
                       glyph: 'xf055@FontAwesome',
                       handler: this.addRow,
                       scope: this
    		       },{
                       text: this.localize('exportNewCorpus'),
                       disabled: true,
                       glyph: 'xf08e@FontAwesome',
                       tooltip: this.localize('exportNewCorpusTip'),
                       handler: function() {
                    	   var query = this.getQueryFromStore();
                    	   if (query) {
                    		   this.setLoading(true);
	   	               			var documentQueryMatches = this.getCorpus().getDocumentQueryMatches();
		            			documentQueryMatches.load({
		            				params: {query: query, createNewCorpus: true},
		            				callback: function(records, operation, success) {
		                     		   this.setLoading(false);
		            					if (success) {
		            						var corpus = operation.getProxy().getReader().rawData.documentsFinder.corpus;
		            						var url = this.getBaseUrl()+'?corpus='+corpus;
		                         		   Ext.Msg.alert({
		                        			   title: this.localize('title'),
		                        			   message: "<a href='"+url+"' target='_blank'>New Corpus</a>"
		                        		   })
		            					}
		            					else {
		            						Ext.create("Voyant.util.ResponseError", {
		            							msg: this.localize("unsuccessfulQuery"),
		            							response: operation.getError().response
		            						}).show();
		            					}
		            				},
		            				scope: this
		            			})
                    		   
                    	   }
                    	   else {
                    		   Ext.Msg.alert({
                    			   title: this.localize('title'),
                    			   message: this.localize('noMatches')
                    		   })
                    	   }
                       },
                       scope: this,
                       cls: 'exportBtn'
    		       },{
    		    	   xtype: 'tbtext',
    		    	   name: 'status',
    		    	   cls: 'status'
    		       }
    		],
	    	columns:[
 	    	    {
	    	        text: this.localize('query'),
	    	        dataIndex: 'query',
	    	        renderer: function(value) {
	    	        	return Ext.isEmpty(value) ? '<span class="placeholder">'+me.localize('emptyQuery') + '</span>' : value;
	    	        },
	    	        editor: true,
	    	        minWidth: 150,
	    	        maxWidth: 300
	    	    },{
	    	        text: this.localize('field'),
	    	        dataIndex: 'field',
	    	        editor: {
	    	        	xtype: 'combo',
	                    typeAhead: true,
	                    triggerAction: 'all',
	                    forceSelection: true,
	                    value: '',
	                    valueField: 'value',
	                    listeners: {
	                    	change:function() {
	                    	  if (Ext.isEmpty(this.getValue())) {
		                    	    this.reset();
		                    	  }
		                    	}
	                    },
	                    store: new Ext.data.Store({
	                        fields: ['text','value'],
	                		data: [[this.localize('textField'),'text'],[this.localize('advancedField'),'advanced']]
	                    })
	    	        },
	    	        width: 150,
                    renderer: function(v) {return Ext.isEmpty(v) ? '' : me.localize(v+"Field")}
	    	    },{
	    	        text: this.localize('operator'),
	    	        dataIndex: 'operator',
	    	        editor: {
	    	        	xtype: 'combo',
	                    forceSelection: true,
	                    store: new Ext.data.Store({
	                        autoDestroy: true,
	                        fields: ['text','value'],
	                        displayField:  'text',
	                        valueField: 'value',
	                		data: [{text:'AND',value:'+'},{text:'OR',value:''}]
	                    })
	    	        },
	    	        minWidth: 75,
	    	        maxWidth: 75
	    	    },{
	    	        text: this.localize('count'),
	    	        dataIndex: 'count',
	    	        renderer: function(value, metadata, record) {
	    	        	return Ext.isEmpty(record.get('query')) ? '' : Ext.util.Format.number(value, '0,000')
	    	        },
	    	        minWidth: 100,
	    	        maxWidth: 100
	    	    },{
	    	    	xtype: 'actioncolumn',
	                width: 25,
	                sortable: false,
	                menuDisabled: true,
	                width: 25,
	                getGlyph: 'xf014@FontAwesome',
	                tooltip: this.localize('deleteQueryTip'),
	                menuDisabled: true,
	                sortable: false,
	                handler: this.removeRow,
	                scope: this
	    	    }
	    	],
	    	
	    	store: new Ext.data.Store({
                // destroy the store if the grid is destroyed
                autoDestroy: true,
                fields: ['id','operator','field','query','count'],
	    		data: [['','','','',0]]
            })
      	});
    			
        this.callParent(arguments);
        
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
        
  
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		this.setCorpus(corpus);
    		var docs = corpus.getDocuments();
    		if (docs && docs.getCount()>0) {
    			var doc = docs.getDocument(0);
    			var records = [];
    			["title","author","pubDate","publisher","pubPlace"].forEach(function(field) {
    				if (!Ext.isEmpty(doc.get(field))) {
    					records.push([this.localize(field+'Field'),field])
    				}
    			}, this);
    			if (records) {
    				var editor = this.getColumnManager().getHeaderByDataIndex("field").getEditor();
    				var store = editor.getStore();
    				store.each(function(record) {
    					records.push([record.get('text'), record.get('value')]);
    				}, this);
    				editor.setStore(Ext.create("Ext.data.Store",{
    					fields: ['text','value'],
    					data: records
    				}))
    			}
    			this.updateStatus(0);
    			this.setLoading(false);
    		}
    	})
    	
    },
    
    removeRow:function(grid, rowIndex) {
    	this.getStore().removeAt(rowIndex);
    	if (this.getStore().getCount()==0) {this.addRow();}
    	this.updateAggregate();
    },
    
    addRow: function() {
    	this.store.loadData([['','','','',0]], true);
    },
    
    onEditComplete: function(editor, context) {
    	
    	
    	var query = this.getQueryFromRecord(context.record);
		if (Ext.isEmpty(query)) {
			context.record.set('count','');
			this.updateAggregate();
		}
		else {
			var cell = context.view.getCell(context.record, this.getColumnManager().getHeaderByDataIndex("count"));
			cell.mask("loading");
			var documentQueryMatches = this.getCorpus().getDocumentQueryMatches();
			documentQueryMatches.load({
				params: {
					query: query
				},
				callback: function(records, operation, success) {
					cell.unmask();
					if (success) {
						context.record.set('count', records.length==0 ? 0 : records[0].get('count'))
					}
					else {
						Ext.create("Voyant.util.ResponseError", {
							msg: this.localize("unsuccessfulQuery"),
							response: operation.getError().response
						}).show();
						context.record.set('count',0);
					}
					this.updateAggregate();
				},
				scope: this
			})
		}

    },
    
    getQueryFromRecord: function(record) {
		if (Ext.isEmpty(record) || Ext.isEmpty(record.get('query'))) {return ""}
		var query = record.get('query').trim();
		if (Ext.isEmpty(query)) {return ""}
		var field = record.get('field');
		return Ext.isEmpty(field ? field.trim() : field) ? query : field+":"+query
    },
    
    getQueryFromStore: function() {
    	var query = "";
 		this.getStore().each(function(record) {
 			var q = this.getQueryFromRecord(record);
 			if (!Ext.isEmpty(q)) {
 				if (!Ext.isEmpty(query)) {
 					var op = record.get('operator');
 					query += op== 'AND' ? ' + ' : ' | '
 				}
 				query+=q
 			}
 		}, this)
 		console.warn(query)
 		return query;
    },
    
    updateAggregate: function() {
    	var count = this.getStore().sum('count');
    	if (!count || typeof count == 'string') {
    		this.updateStatus(0);
    	}
    	else if (count==1) {
    		var count = this.getStore().getAt(0).get('count');
    		this.updateStatus(this.getStore().getAt(0).get('count'))
    	}
    	else {
    		
    		var query = this.getQueryFromStore();
    		if (!Ext.isEmpty(query)) {
            	if (!this.status) {this.status=this.down("[cls~=status]")} // make sure we have status for masking
    			this.status.mask(this.localize("loading"));
    			var documentQueryMatches = this.getCorpus().getDocumentQueryMatches();
    			documentQueryMatches.load({
    				params: {query: query},
    				callback: function(records, operation, success) {
    					debugger
    					this.status.unmask();
    					if (success) {
    						this.updateStatus(records[0].get('count'));
    					}
    					else {
    						Ext.create("Voyant.util.ResponseError", {
    							msg: this.localize("unsuccessfulQuery"),
    							response: operation.getError().response
    						}).show();
    						this.updateStatus(0);
    					}
    				},
    				scope: this
    			})
    		}
    	}
    },
    
    updateStatus: function(count) {
    	if (!this.status) {this.status=this.down("[cls~=status]")}
    	if (!this.exportBtn) {this.exportBtn=this.down("[cls~=exportBtn]")}
    	if (count==0) {
        	this.status.update(this.localize('noMatches', [this.getCorpus().getDocumentsCount()]))
    	}
    	else {
    		this.status.update(this.localize('queryMatches', [count,this.getCorpus().getDocumentsCount()]))
    	}
    	this.exportBtn.setDisabled(count==0);
    	
    }
    
})
/**
 * Marked splines are multi-series splines displaying smooth curves across multiple
 * categories. Markers are placed at each connected point to clearly depict their position.
 */
Ext.define('Voyant.panel.Dummy', {
    extend: 'Ext.Panel',
    xtype: 'dummy',


    width: 650,

    initComponent: function() {
        var me = this;

        this.myDataStore = Ext.create('Ext.data.JsonStore', {
            fields: ['theta', 'sin', 'cos', 'tan' ],
            data: [
                { theta: 0, sin: 0.00, cos: 1.00, tan: 0.00 },
                { theta: 10, sin: 0.17, cos: 0.98, tan: 0.18 },
                { theta: 20, sin: 0.34, cos: 0.94, tan: 0.36 },
                { theta: 30, sin: 0.50, cos: 0.87, tan: 0.58 },
                { theta: 40, sin: 0.64, cos: 0.77, tan: 0.84 },
                { theta: 50, sin: 0.77, cos: 0.64, tan: 1.19 },
                { theta: 60, sin: 0.87, cos: 0.50, tan: 1.73 },
                { theta: 70, sin: 0.94, cos: 0.34, tan: 2.75 },
                { theta: 80, sin: 0.98, cos: 0.17, tan: 5.67 },
                { theta: 90, sin: 1.00, cos: 0.00, tan: false },
                { theta: 100, sin: 0.98, cos: -0.17, tan: -5.67 },
                { theta: 110, sin: 0.94, cos: -0.34, tan: -2.75 },
                { theta: 120, sin: 0.87, cos: -0.50, tan: -1.73 },
                { theta: 130, sin: 0.77, cos: -0.64, tan: -1.19 },
                { theta: 140, sin: 0.64, cos: -0.77, tan: -0.84 },
                { theta: 150, sin: 0.50, cos: -0.87, tan: -0.58 },
                { theta: 160, sin: 0.34, cos: -0.94, tan: -0.36 },
                { theta: 170, sin: 0.17, cos: -0.98, tan: -0.18 },
                { theta: 180, sin: 0.00, cos: -1.00, tan: 0.00 },
                { theta: 190, sin: -0.17, cos: -0.98, tan: 0.18 },
                { theta: 200, sin: -0.34, cos: -0.94, tan: 0.36 },
                { theta: 210, sin: -0.50, cos: -0.87, tan: 0.58 },
                { theta: 220, sin: -0.64, cos: -0.77, tan: 0.84 },
                { theta: 230, sin: -0.77, cos: -0.64, tan: 1.19 },
                { theta: 240, sin: -0.87, cos: -0.50, tan: 1.73 },
                { theta: 250, sin: -0.94, cos: -0.34, tan: 2.75 },
                { theta: 260, sin: -0.98, cos: -0.17, tan: 5.67 },
                { theta: 270, sin: -1.00, cos: 0.00, tan: false },
                { theta: 280, sin: -0.98, cos: 0.17, tan: -5.67 },
                { theta: 290, sin: -0.94, cos: 0.34, tan: -2.75 },
                { theta: 300, sin: -0.87, cos: 0.50, tan: -1.73 },
                { theta: 310, sin: -0.77, cos: 0.64, tan: -1.19 },
                { theta: 320, sin: -0.64, cos: 0.77, tan: -0.84 },
                { theta: 330, sin: -0.50, cos: 0.87, tan: -0.58 },
                { theta: 340, sin: -0.34, cos: 0.94, tan: -0.36 },
                { theta: 350, sin: -0.17, cos: 0.98, tan: -0.18 },
                { theta: 360, sin: 0.00, cos: 1.00, tan: 0.00 }
            ]
        });

        me.items = [{
            xtype: 'cartesian',
            width: '100%',
            height: 500,
            store: this.myDataStore,
            insetPadding: {
                top: 40,
                right: 40,
                bottom: 20,
                left: 20
            },
            legend: {
                docked: 'right'
            },
            sprites: [{
                type: 'text',
                text: 'Line Charts - Marked Spline',
                fontSize: 22,
                width: 100,
                height: 30,
                x: 40, // the sprite x position
                y: 20  // the sprite y position
            }],
            axes: [{
                type: 'numeric',
                fields: ['sin', 'cos', 'tan' ],
                position: 'left',
                grid: true,
                renderer: function(v) {
                    return Ext.util.Format.number(v, '0.0');
                }
            }, {
                type: 'category',
                title: 'Theta',
                fields: 'theta',
                position: 'bottom',
                style: {
                    textPadding: 0 // remove extra padding between labels to make sure no labels are skipped
                },
                grid: true,
                label: {
                    rotate: {
                        degrees: -45
                    }
                }
            }],
            series: [{
                type: 'line',
                axis: 'left',
                xField: 'theta',
                yField: 'sin',
                smooth: true,
                style: {
                    lineWidth: 4
                },
                marker: {
                    radius: 4
                },
                highlight: {
                    fillStyle: '#000',
                    radius: 5,
                    lineWidth: 2,
                    strokeStyle: '#fff'
                }
            }, {
                type: 'line',
                axis: 'left',
                xField: 'theta',
                yField: 'cos',
                smooth: true,
                style: {
                    lineWidth: 4
                },
                marker: {
                    radius: 4
                },
                highlight: {
                    fillStyle: '#000',
                    radius: 5,
                    lineWidth: 2,
                    strokeStyle: '#fff'
                }
            }, {
                type: 'line',
                axis: 'left',
                xField: 'theta',
                yField: 'tan',
                smooth: true,
                style: {
                    lineWidth: 4
                },
                marker: {
                    radius: 4
                },
                highlight: {
                    fillStyle: '#000',
                    radius: 5,
                    lineWidth: 2,
                    strokeStyle: '#fff'
                }
            }]
        }];

        this.callParent();
    }
});
Ext.define('Voyant.panel.Reader', {
	extend: 'Ext.panel.Panel',
	requires: ['Voyant.data.store.Tokens'],
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.reader',
    statics: {
    	i18n: {
    		title: {en: "Reader"},
    		helpTip: {en: "<p>The Reader tool provides a view of text from the corpus. Features include:</p><ul><li>frequency information appears when hovering over a word</li><li>distribution information appears in a graph at the bottom when clicking on a word</li><li>a bar graph at the bottom indicates the relative size of each document in the corpus</li><li>a search box for queries (hover over the magnifying icon for help with the syntax)</li></ul>"},
    		documentFrequency: {en: "document frequency:"}
    	},
    	api: {
    		start: 0,
    		limit: 1000,
    		skipToDocId: undefined
    	},
    	glyph: 'xf0f6@FontAwesome'
	},
    config: {
    	corpus: undefined,
    	tokensStore: undefined,
    	documentsStore: undefined,
    	documentTermsStore: undefined,
    	exportVisualization: false
    },
    innerContainer: null, // set after render
    
    cls: 'voyant-reader',
    
    layout: 'fit',
    
    items: {
    	layout: 'border',
    	items: [{
	    	bodyPadding: 10,
	    	region: 'center',
	    	border: false,
	    	autoScroll: true,
	    	html: '<div class="readerContainer"></div>'
	    },{
	    	region: 'south',
	    	height: 40,
	    	split: {
	    		size: 2
	    	},
	    	splitterResize: true,
	    	border: false,
	    	layout: {
	    		type: 'hbox'
	    	}
	    }]
    },
    
    constructor: function() {
    	Ext.apply(this, {
    		title: this.localize('title')
    	});
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
    	var tokensStore = Ext.create("Voyant.data.store.Tokens");
    	tokensStore.on("load", function(s, records, success) {
    		if (success) {
	    		var contents = "";
	    		var documentFrequency = this.localize("documentFrequency");
	    		var isPlainText = false;
	    		var docIndex = -1;
	    		var isLastNewLine = false
	    		records.forEach(function(record) {
	    			if (record.getPosition()==0) {
	    				contents+="<h3>"+this.getDocumentsStore().getById(record.getDocId()).getFullLabel()+"</h3>";
	    			}
	    			if (record.getDocIndex()!=docIndex) {
	    				isPlainText = this.getDocumentsStore().getById(record.getDocId()).isPlainText();
	    				docIndex = record.getDocIndex();
	    			}
	    			if (record.isWord()) {
	    				isLastNewLine = false;
	    				contents += "<span class='word' id='"+ record.getId() + "' data-qtip='"+documentFrequency+" "+record.getDocumentRawFreq()+"'>"+ record.getTerm() + "</span>";
	    			}
	    			else {
	    				var newContents = record.getTermWithLineSpacing(isPlainText);
	    				var isNewLine = newContents.indexOf("<br />")==0
	    				if (isLastNewLine && (isNewLine || newContents.trim().length==0)) {}
	    				else {
	    					contents += newContents;
	    					isLastNewLine = isNewLine;
	    				}
	    			}
	    		}, this);
	    		this.updateText(contents, true);
	    		
	    		var keyword = this.down('querysearchfield').getValue();
	    		if (keyword != '') {
	    			this.highlightKeywords(keyword);
	    		}
    		}
    	}, this);
    	this.setTokensStore(tokensStore);
    	
    	this.on("query", function(src, query) {
    		this.loadQueryTerms([query]);
    	}, this);
    	
    	this.setDocumentTermsStore(Ext.create("Ext.data.Store", {
			model: "Voyant.data.model.DocumentTerm",
    		autoLoad: false,
    		remoteSort: false,
    		proxy: {
				type: 'ajax',
				url: Voyant.application.getTromboneUrl(),
				extraParams: {
					tool: 'corpus.DocumentTerms',
					withDistributions: true,
					// TODO handle positions
					withPositions: true,
					bins: 25
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
   		    		 var term; // store last accessed term
   		    		 store.each(function(r) {
   		    			 var graphData = [];
   		    			 var dist = r.get('distributions');
   		    			 var docId = r.get('docId');
   		    			 var docIndex = r.get('docIndex');
   		    			 term = r.get('term');
   		    			 for (var i = 0; i < dist.length; i++) {
   		    				 var bin = i;//docIndex * dist.length + i;
   		    				 var val = dist[i];
   		    				 if (val > maxValue) maxValue = val;
   		    				 graphData.push([docId, docIndex, bin, val, term]);
   		    			 }
   		    			 graphDatas[docIndex] = graphData;
   		    		 }, this);
   		    		 
   		    		 this.highlightKeywords(term);
   		    		 this.down('querysearchfield').setValue(term);
   		    		 
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
   		    	 scope: this
   		     }
    	}));
    	
    	this.on("afterrender", function() {
    		var centerPanel = this.down('panel[region="center"]');
    		this.innerContainer = centerPanel.getLayout().getRenderTarget();
    		
    		// scroll listener
    		centerPanel.body.on("scroll", function(event, target) {
    			var cmp = this.items.getAt(0);
    			var body = cmp.body;
    			var dom = body.dom;
    			if (dom.scrollTop+dom.offsetHeight>dom.scrollHeight/2) { // more than half-way down
    				var readerContainer = this.innerContainer.first();
    				var last = readerContainer.last();
    				if (last.hasCls("loading")==false) {
    					while(last) {
    						if (last.hasCls("word")) {
    	    					var mask = last.insertSibling("<div class='loading'>"+this.localize('loading')+"</div>", 'after', false).mask();
    	    					var info = Voyant.data.model.Token.getInfoFromElement(last);
    	    					last.destroy();
    	    					var doc = this.getDocumentsStore().getAt(info.docIndex);
    	    					var id = doc.getId();
    	    					this.setApiParams({'skipToDocId': id, start: info.position});
    							this.load();
    							break;
    						}
    						last.destroy(); // remove non word
    						last = readerContainer.last();
    					}
    				}
    			}
    		}, this);
    		
    		// click listener
    		centerPanel.body.on("click", function(event, target) {
    			target = Ext.get(target);
    			if (target.hasCls('word')) {
    				var info = Voyant.data.model.Token.getInfoFromElement(target);
    				var term = target.getHtml();
    				var data = [{
    					term: term,
    					docIndex: info.docIndex
    				}];
    				this.getApplication().dispatchEvent('termsClicked', this, data);
    			}
    		}, this);
    		
    		if (this.getCorpus()) {this.load();}
    	}, this);
    	
    	Ext.apply(this, {
    		// TODO clearing search loads default document terms into chart but probably shouldn't
    		dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                items: [{
                    xtype: 'querysearchfield'
                }]
    		}],
    		listeners: {
    			loadedCorpus: function(src, corpus) {
    				this.setCorpus(corpus);
    	    		this.getTokensStore().setCorpus(corpus);
    	    		this.getDocumentTermsStore().getProxy().setExtraParam('corpus', corpus.getId());
    	    		
    	    		var docs = corpus.getDocuments();
    	    		this.setDocumentsStore(docs);
    	    		var container = this.down('panel[region="south"]');
    	    		
    	    		this.generateChart(corpus, container);
    	    		
    	    		if (this.rendered) {
    	    			this.load();
    	    		}
    			},
            	termsClicked: function(src, terms) {
            		var queryTerms = [];
            		terms.forEach(function(term) {
            			if (term.term) {queryTerms.push(term.term);}
            		});
            		this.loadQueryTerms(queryTerms);
        		},
        		corpusTermsClicked: function(src, terms) {
        			var queryTerms = [];
            		terms.forEach(function(term) {
            			if (term.getTerm()) {queryTerms.push(term.getTerm());}
            		});
            		this.loadQueryTerms(queryTerms);
        		},
        		documentTermsClicked: function(src, terms) {
        			var queryTerms = [];
            		terms.forEach(function(term) {
            			if (term.getTerm()) {queryTerms.push(term.getTerm());}
            		});
            		this.loadQueryTerms(queryTerms);
        		},
        		documentsClicked: function(src, documents, corpus) {
        			if (documents) {
            			var doc = documents[0];
            			this.setApiParams({'skipToDocId': doc.getId(), start: 0});
						this.load(true);
            		}
        		},
        		termLocationClicked: function(src, terms) {
    				if (terms[0] !== undefined) {
    					var term = terms[0];
    					var docIndex = term.get('docIndex');
    					var position = term.get('position');
    					var bufferPosition = position - (this.getApiParam('limit')/2);
    					var doc = this.getCorpus().getDocument(docIndex);
    					this.setApiParams({'skipToDocId': doc.getId(), start: bufferPosition < 0 ? 0 : bufferPosition});
    					this.load(true, {
    						callback: function() {
    							var el = this.body.dom.querySelector("#_" + docIndex + "_" + position);
    							if (el) {
    								el.scrollIntoView()
    							}
    							this.highlightKeywords(term.get('term'), false)
    						},
    						scope: this
    					});
    				};
        		},
        		scope: this
    		}
    	});
    	
        this.callParent(arguments);
    },
    
    loadQueryTerms: function(queryTerms) {
    	if (queryTerms && queryTerms.length > 0) {
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
    },
    
    generateChart: function(corpus, container) {
    	function getColor(index, alpha) {
    		var colors = [[116,116,181], [139,163,83], [189,157,60], [171,75,75], [174,61,155]];
    		var c = colors[index % colors.length];
    		return 'rgba('+c[0]+','+c[1]+','+c[2]+','+alpha+')';
    	}
    	
    	function map(value, istart, istop, ostart, ostop) {
			return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
		}
    	
    	function addChart(docInfo, reader) {
    		var index = docInfo.index;
    		var fraction = docInfo.fraction;
    		var height = docInfo.relativeHeight;
    		var bColor = getColor(index, 0.3);
    		var sColor = getColor(index, 1.0);
    		var chart = container.add({
    			xtype: 'cartesian',
    	    	flex: fraction,
    	    	height: '100%',
    	    	insetPadding: 0,
    	    	background: {
    	    		type: 'linear',
    	    		degrees: 90,
    	    		stops: [{
    	    			offset: 0,
    	    			color: bColor
    	    		},{
    	    			offset: height,
    	    			color: bColor
    	    		},{
    	    			offset: height,
    	    			color: 'white'
    	    		},{
    	    			offset: 1,
    	    			color: 'white'
    	    		}]
    	    	},
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
                    	corpus: corpus,
                        trackMouse: true,
                        style: 'background: #fff',
                        showDelay: 0,
                        dismissDelay: 500,
                        hideDelay: 5,
                        renderer: function(storeItem, item) {
                            this.setHtml(corpus.getDocument(storeItem.get('docIndex')).getTitle()+"<br>"+storeItem.get('term') + ': ' + storeItem.get('distribution'));
                        }
                    }
        		}],
    	    	store: Ext.create('Ext.data.ArrayStore', {
            		fields: ['docId', 'docIndex', 'bin', 'distribution', 'term'],
            		data: []
            	})
    		});
    		
    		// hack to deal with itemclick bug
    		chart.body.on('click', function(event, target) {
    			var el = Ext.get(target);
    			var x = event.getX();
    			var box = el.getBox();
    			var fraction = (x - box.x) / box.width;
    			var chartContainer = el.parent('.x-panel');
    			var containerParent = chartContainer.parent();
    			var children = Ext.toArray(containerParent.dom.children);
    			var docIndex = children.indexOf(chartContainer.dom);
    			var doc = this.getDocumentsStore().getAt(docIndex);
    			this.getApplication().dispatchEvent('documentsClicked', this, [doc]);
    		}, reader);
    	}
    	
    	container.removeAll();
    	
    	var docs = corpus.getDocuments();
    	var docsCount = docs.getTotalCount();
    	if (docsCount<50) {
    		
    	
	    	var tokensTotal = corpus.getWordTokensCount();
	    	var docInfos = [];
	    	var docMinSize = 1000000;
	    	var docMaxSize = -1;
	//		for (var i = 0; i < docs.getTotalCount(); i++) {
			for (var i = 0; i < docs.getCount(); i++) {
				var d = docs.getAt(i);
				var docIndex = d.get('index');
				var count = d.get('tokensCount-lexical');
				if (count < docMinSize) docMinSize = count;
				if (count > docMaxSize) docMaxSize = count;
				var fraction = count / tokensTotal;
				docInfos.push({
					index: docIndex,
					count: count,
					fraction: fraction
				});
			}
			
			for (var i = 0; i < docInfos.length; i++) {
				var d = docInfos[i];
				d.relativeHeight = d.count==docMaxSize ? 1 : map(d.count, docMinSize, docMaxSize, 0, 1);
				addChart(d, this);
			}
    	}
    },
    
    highlightKeywords: function(query, doScroll) {
		if (!Ext.isArray(query)) query = [query];
		
		this.innerContainer.first().select('span[class*=keyword]').removeCls('keyword');
		
		var spans = [];
		var caseInsensitiveQuery = new RegExp('^'+query[0]+'$', 'i');
		var nodes = this.innerContainer.first().select('span.word');
		nodes.each(function(el, compEl, index) {
			if (el.dom.firstChild && el.dom.firstChild.nodeValue.match(caseInsensitiveQuery)) {
				el.addCls('keyword');
				spans.push(el.dom);
			}
		});
		
//		if (doScroll && spans[0] !== undefined) {
//			Ext.get(nodes[0]).scrollIntoView(reader).frame("ff0000", 1, { duration: 2 });
//		}
	},
    
    load: function(doClear, config) {
    	if (doClear) {
    		this.innerContainer.first().destroy(); // clear everything
    		this.innerContainer.setHtml('<div class="readerContainer"><div class="loading">'+this.localize('loading')+'</div></div>');
			this.innerContainer.first().first().mask();
    	}
    	this.getTokensStore().load(Ext.apply(config || {}, {
    		params: Ext.apply(this.getApiParams(), {
    			stripTags: 'blocksOnly'
    		})
    	}))
    },
    
    updateText: function(contents) {
    	var last = this.innerContainer.first().last();
    	if (last && last.isMasked()) {last.destroy();}
    	this.innerContainer.first().insertHtml('beforeEnd', contents);
    },
    
    updateChart: function() {
    	
    }
});

Ext.define('Voyant.panel.ScatterPlot', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	requires: ['Ext.chart.CartesianChart'],
	alias: 'widget.scatterplot',
	config: {
		corpus: undefined,
		options: {
    		xtype: 'stoplistoption'
    	}
	},
    statics: {
    	i18n: {
			title: {en: "ScatterPlot"},
			analysis: {en: "Analysis"},
			ca: {en: "Correspondence Analysis"},
			pca: {en: "Principal Components Analysis"},
			rawFreq: {en: "Raw Frequency"},
			relFreq: {en: "Relative Frequency"},
			terms: {en: "Terms"},
			term: {en: "Term"},
			numTerms: {en: "Terms Count"},
			addTerm: {en: "Add Term"},
			clusters: {en: "Clusters"},
			dimensions: {en: "Dimensions"},
			remove: {en: "Remove"},
			removeTerm: {en: 'Remove <b>{0}</b>'},
			nearby: {en: "Nearby"},
			nearbyTerm: {en: 'Nearby <b>{0}</b>'},
			pcTitle: {en: 'Percentage of Total Variation Explained by Each Component'},
			pc: {en: 'PC'},
			caTitle: {en :'Percentage of Total Assocation Explained by Each Dimension'},
			dimension: {en :'Dimension'},
			xAxis: {en :'X Axis'},
			yAxis: {en :'Y Axis'},
			fill: {en :'Fill'},
			loading: {en: "Loading"},
			helpTip: {en: "<p>ScatterPlot displays the correspondance of word use in a corpus. This visualization relies on a statistical analysis that takes the word’s correspondance from each document (where each document represents a dimension) and reduces it to a three dimensional space to easily visualize the data through a scatterplot.</p>"},
			tokenFreqTip: {en: '<b>{0}</b><br/><b>Raw Frequency</b><br/>{1}</b><br/><b>Relative Frequency</b><br/>{2}</b>'},
			docFreqTip: {en: '<b>{0}</b><br/><b>Word Count</b><br/>{1}</b>'}
    	},
    	api: {
    		analysis: 'ca',
    		limit: 50,
    		dimensions: 3,
    		bins: 10,
    		clusters: 3,
    		stopList: 'auto',
    		target: undefined,
    		query: undefined
    	},
		glyph: 'xf06e@FontAwesome'
    },
    
    tokenFreqTipTemplate: null,
    docFreqTipTemplate: null,
    caStore: null,
    pcaStore: null,
    termStore: Ext.create('Ext.data.JsonStore', {
		fields: [
			{name: 'term'},
			{name: 'rawFreq', type: 'int'},
			{name: 'relativeFreq', type: 'number'},
			{name: 'coordinates', mapping : 'vector'}
		],
		sorters: [{property: 'rawFreq', direction: 'DESC'}]
	}),
	newTerm: null,
	termsTimeout: null,
    chartMenu: null,
    
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
        Ext.apply(this, {
        	title: this.localize('title'),
        	caStore: Ext.create('Voyant.data.store.CAAnalysis'),
        	pcaStore: Ext.create('Voyant.data.store.PCAAnalysis'),
        	termStore: this.termStore,
        	chartMenu: Ext.create('Ext.menu.Menu', {
        		items: [
        			{text: this.localize('remove'), itemId: 'remove'},
        			{text: this.localize('nearby'), itemId: 'nearby'}
        		],
        		listeners: {
        			hide: function() {
        				var series = this.down('#chart').getSeries();
        				series[0].enableToolTips();
        				series[1].enableToolTips();
        			},
        			scope: this
        		}
        	}),
        	layout: 'border',
        	autoDestroy: true,
        	items: [{
        		itemId: 'chartParent',
        		region: 'center',
        		layout: 'fit',
        		tbar: [{
            		text: this.localize('analysis'),
            		itemId: 'analysis',
            		glyph: 'xf1ec@FontAwesome',
        			menu: {
    					items: [
    					    {text: this.localize('pca'), itemId: 'analysis_pca', group:'analysis', xtype: 'menucheckitem'},
    					    {text: this.localize('ca'), itemId: 'analysis_ca', group:'analysis', xtype: 'menucheckitem'}
    					],
    					listeners: {
    						click: function(menu, item) {
    							if (item !== undefined) {
    								if (item.text === this.localize('pca')) {
    									this.setApiParam('analysis', 'pca');
    								} else {
    									this.setApiParam('analysis', 'ca');
    									if (this.getCorpus().getDocumentsCount() == 3) {
    	//									this.setApiParam('dimensions', 2);
    	//									this.dimsButton.menu.items.get(0).setChecked(true); // need 1-2 docs or 4+ docs for 3 dimensions
    									}
    								}
    								this.loadFromApis(true);
    							}
    						},
    						scope: this
    					}
        			}
            	},{
            		text: this.localize('clusters'),
            		itemId: 'clusters',
            		glyph: 'xf192@FontAwesome',
            		menu: {
            			items: [
            			    {text: '1', itemId: 'clusters_1', group: 'clusters', xtype: 'menucheckitem'},
            			    {text: '2', itemId: 'clusters_2', group: 'clusters', xtype: 'menucheckitem'},
            			    {text: '3', itemId: 'clusters_3', group: 'clusters', xtype: 'menucheckitem'},
            			    {text: '4', itemId: 'clusters_4', group: 'clusters', xtype: 'menucheckitem'},
            			    {text: '5', itemId: 'clusters_5', group: 'clusters', xtype: 'menucheckitem'}
            			],
    					listeners: {
    						click: function(menu, item) {
    							if (item !== undefined) {
    								this.setApiParam('clusters', parseInt(item.text));
    								this.loadFromApis(true);
    							}
    						},
    						scope: this
    					}
            		}
            	},{
            		text: this.localize('dimensions'),
            		itemId: 'dimensions',
            		glyph: 'xf1b2@FontAwesome',
            		menu: {
            			items: [
            			    {text: '2', itemId: 'dimensions_2', group: 'dimensions', xtype: 'menucheckitem'},
            			    {text: '3', itemId: 'dimensions_3', group: 'dimensions', xtype: 'menucheckitem'}
            			],
    					listeners: {
    						click: function(menu, item) {
    							if (item !== undefined) {
    								this.setApiParam('dimensions', parseInt(item.text));
    								this.loadFromApis(true);
    							}
    						},
    						scope: this
    					}
            		}
            	}]
        	},{
        		itemId: 'terms',
        		xtype: 'grid',
        		title: 'Terms',
        		region: 'east',
        		width: '40%',
        		split: true,
        		collapsible: true,
        		border: true,
        		dockedItems: [{
                    dock: 'top',
                    xtype: 'toolbar',
                    items: [{
                		fieldLabel: this.localize('numTerms'),
                		labelAlign: 'right',
                		labelWidth: 100,
                		itemId: 'limit',
                		xtype: 'combo',
                		width: 180,
                		store: Ext.create('Ext.data.ArrayStore', {
                			fields: ['count'],
                			data: [[10],[20],[30],[40],[50],[60],[70],[80],[90],[100]]
                		}),
                		displayField: 'count',
                		valueField: 'count',
                		queryMode: 'local',
                		editable: true,
                		allowBlank: false,
                		validator: function(val) {
                			return val.match(/\D/) === null;
                		},
                		listeners: {
    						change: function(combo, newVal, oldVal) {
    							function doLoad() {
    								var val = Math.min(parseInt(newVal), 10000);
    								this.setApiParam('limit', val);
									this.loadFromApis();
    							}
    							if (combo.isValid() && oldVal !== null) {
    								if (this.termsTimeout !== null) {
    									clearTimeout(this.termsTimeout);
    								}
    								this.termsTimeout = setTimeout(doLoad.bind(this), 500);
    							}
    						},
    						scope: this
    					}
                	},{xtype: 'tbseparator'},{
                        xtype: 'button',
                        text: this.localize('nearby'),
                        glyph: 'xf0b2@FontAwesome',
                        handler: function() {
                        	var sel = this.down('#terms').getSelection()[0];
                        	if (sel !== undefined) {
	                        	var term = sel.get('term');
	                        	this.getNearbyForTerm(term);
                        	}
                        },
                        scope: this
                    },{
                        xtype: 'button',
                        text: this.localize('remove'),
                        glyph: 'xf068@FontAwesome',
                        handler: function() {
                        	var sel = this.down('#terms').getSelection()[0];
                        	if (sel !== undefined) {
	                        	var term = sel.get('term');
	                        	this.removeTerm(term);
                        	}
                        },
                        scope: this
                    },{
                    	xtype: 'textfield',
                    	emptyText: this.localize('addTerm'),
                    	triggers: {
                            clear: {
                                weight: 0,
                                cls: Ext.baseCSSPrefix + 'form-clear-trigger',
                                hidden: true,
                                handler: function(){
                                    this.setValue('');
                                	this.findParentByType('panel').fireEvent('query', this, undefined);
                                    this.getTrigger('clear').hide();
                                    this.updateLayout();
                                }
                            },
                            search: {
                                weight: 1,
                                cls: Ext.baseCSSPrefix + 'form-search-trigger',
                                handler: function(){
                                    var value = this.getValue();
                                	this.findParentByType('panel').fireEvent('query', this, value);
                                	if (value) {
                                        this.getTrigger('clear').show();
                                	} else {
                                        this.getTrigger('clear').hide();
                                	}
                                    this.updateLayout();
                                }
                            }
                        },
                        listeners: {
                        	specialkey: function(field, event) {
                        		if (event.getKey() === event.ENTER) {
                                    this.triggers.search.onClick();
                                }
                        	}
                        }
                    }]
                }],
        		columns: [{
        			text: this.localize('term'),
    				dataIndex: 'term',
    				flex: 1,
                    sortable: true
    			},{
    				text: this.localize('rawFreq'),
    				dataIndex: 'rawFreq',
    				width: 'autoSize',
                    sortable: true
    			},{
    				text: this.localize('relFreq'),
    				dataIndex: 'relativeFreq',
    				width: 'autoSize',
                    sortable: true,
                    hidden: true
    			}],
    			selModel: Ext.create('Ext.selection.RowModel', {
                    listeners: {
                        selectionchange: {
                        	fn: function(sm, selections) {
//                        		this.getApplication().dispatchEvent('corpusTermsClicked', this, selections);
                        		var sel = selections[0];
                        		if (sel !== undefined) {
	                        		var term = sel.get('term');
	                        		this.selectTerm(term);
                        		}
                        	},
                        	scope: this
                        }
                    },
                    mode: 'SINGLE'
                }),
        		store: this.termStore,
        		listeners: {
        			query: function(component, value) {
    					if (value !== undefined && this.termStore.findExact('term', value) === -1) {
	                		this.newTerm = value;
	                		this.loadFromApis();
    					} else {
    						this.newTerm = null;
    					}
        			},
        			scope: this
        		}
        	}]
        });
        
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		function setCheckItemFromApi(apiParamName) {
    			var value = this.getApiParam(apiParamName);
    			var menu = this.queryById('chartParent').getDockedItems('toolbar')[0].down('#'+apiParamName);
    			menu.down('#'+apiParamName+'_'+value).setChecked(true);
    		}
    		var setCheckBound = setCheckItemFromApi.bind(this);
    		setCheckBound('analysis');
//    		setCheckBound('limit');
    		setCheckBound('clusters');
    		setCheckBound('dimensions');
    		
    		this.setCorpus(corpus);
    		this.caStore.setCorpus(corpus);
    		this.pcaStore.setCorpus(corpus);
    		this.loadFromApis();
    	}, this);
        
        this.caStore.on('load', function(store, records) {
        	this.buildChart(store);
        }, this);
        this.pcaStore.on('load', function(store, records) {
        	this.buildChart(store);
        }, this);
        
    	this.tokenFreqTipTemplate = new Ext.Template(this.localize('tokenFreqTip'));
    	this.docFreqTipTemplate = new Ext.Template(this.localize('docFreqTip'));
        
    	this.callParent(arguments);
    },
    
    buildChart: function(store) {
    	var that = this; // needed for tooltip renderer
    	
    	var oldChart = this.queryById('chart');
    	if (oldChart !== null) {
    		this.queryById('chartParent').remove(oldChart);
    	}
    	
    	var rec = store.getAt(0);
        var numDims = this.getApiParam('dimensions');
        
    	var summary = '';    	
    	if (this.getApiParam('analysis') == 'pca') {
    		// calculate the percentage of original data represented by the dominant principal components
			var pcs = rec.getPrincipalComponents();
			var eigenTotal = 0;
			for (var i = 0; i < pcs.length; i++) {
				var pc = pcs[i];
				eigenTotal += parseFloat(pc.get('eigenValue'));
			}
			summary = this.localize('pcTitle')+'\n';
			var pcMapping = ['xAxis', 'yAxis', 'fill'];
			for (var i = 0; i < pcs.length; i++) {
				if (i >= numDims) break;
				
				var pc = pcs[i];
				var eigenValue = parseFloat(pc.get('eigenValue'));
				var percentage = eigenValue / eigenTotal * 100;
				summary += this.localize('pc')+' '+(i+1)+' ('+this.localize(pcMapping[i])+'): '+Math.round(percentage*100)/100+'%\n';
			}
    	} else {
    		summary = this.localize('caTitle')+'\n';
    		var pcMapping = ['xAxis', 'yAxis', 'fill'];
    		
    		var dimensions = rec.getDimensions();
    		for (var i = 0; i < dimensions.length; i++) {
    			if (i >= numDims) break;
    			
    			var percentage = parseFloat(dimensions[i]['data']);
    			summary += this.localize('dimension')+' '+(i+1)+' ('+this.localize(pcMapping[i])+'): '+Math.round(percentage*100)/100+'%\n';
    		}
    	}
        
        var maxFreq = 0;
        var minFreq = Number.MAX_VALUE;
        var maxFill = 0;
        var minFill = Number.MAX_VALUE;
                
        this.termStore.removeAll();
        
        var tokens = rec.getTokens();
        var termData = [];
        var docData = [];
        tokens.forEach(function(token) {
        	var freq = token.get('rawFreq');
        	var isDoc = token.get('category') === 'part';
        	if (!isDoc) {
	        	if (freq > maxFreq) maxFreq = freq;
	        	if (freq < minFreq) minFreq = freq;
	        	
	        	if (this.termStore.findExact('term', token.get('term') === -1)) {
	        		this.termStore.addSorted(token);
	        	}
        	}
        	if (numDims === 3) {
				var z = token.get('vector')[2];
				if (z < minFill) minFill = z;
				if (z > maxFill) maxFill = z;
			}
        	var tokenData = {term: token.get('term'), rawFreq: freq, relativeFreq: token.get('relativeFreq'), cluster: token.get('cluster'), x: token.get('vector')[0], y: token.get('vector')[1], z: token.get('vector')[2], isDoc: isDoc};
        	if (isDoc) {
        		docData.push(tokenData);
        	} else {
        		termData.push(tokenData);
        	}
        }, this);
        
        var newCount = this.termStore.getCount();
        this.queryById('limit').setRawValue(newCount);
        this.setApiParam('limit', newCount);
        
        
    	var termSeriesStore = Ext.create('Ext.data.JsonStore', {
    		fields: ['term', 'x', 'y', 'z', 'rawFreq', 'relativeFreq', 'cluster', 'isDoc'],
    		data: termData
    	});
    	var docSeriesStore = Ext.create('Ext.data.JsonStore', {
    		fields: ['term', 'x', 'y', 'z', 'rawFreq', 'relativeFreq', 'cluster', 'isDoc'],
    		data: docData
    	});
    	
    	var config = {
        	itemId: 'chart',
        	xtype: 'cartesian',
        	interactions: ['crosszoom','panzoom','itemhighlight'],
        	plugins: {
                ptype: 'chartitemevents'
            },
        	axes: [{
        		type: 'numeric',
        		position: 'bottom',
        		fields: ['x']
        	},{
        		type: 'numeric',
        		position: 'left',
        		fields: ['y']
        	}],
        	sprites: [{
        		type: 'text',
        		text: summary,
        		x: 70,
        		y: 70
        	}],
        	innerPadding: {top: 25, right: 25, bottom: 25, left: 25},
        	series: [{
        		type: 'customScatter',
        		xField: 'x',
        		yField: 'y',
        		store: termSeriesStore,
        		label: {
        			field: 'term',
        			display: 'over'
        		},
        		tooltip: {
        			trackMouse: true,
        			style: 'background: #fff',
        			renderer: function (storeItem, item) {
        				this.setHtml(that.tokenFreqTipTemplate.apply([storeItem.get('term'),storeItem.get('rawFreq'),storeItem.get('relativeFreq')]));
        			}
        		},
        		marker: {
        		    type: 'circle'
        		},
        		highlight: {
        			fillStyle: 'yellow',
                    strokeStyle: 'black'
        		},
        		renderer: function (sprite, config, rendererData, index) {
    				var store = rendererData.store;
    				var item = store.getAt(index);
    				if (item !== null) {
	    				var clusterIndex = item.get('cluster');
	    				var scatterplot = this.getParent().up('scatterplot');
	    				
	    				if (clusterIndex === -1) {
	    					// no clusters were specified in initial call
	    					clusterIndex = 0;
	    				}
	    				
	    				var a = 0.65;
	    				if (numDims === 3) {
	    					a = scatterplot.interpolate(item.get('z'), minFill, maxFill, 0, 1);
	    				}
	    				var color = scatterplot.getApplication().getColor(clusterIndex);
	    				config.fillStyle = 'rgba('+color.join(',')+','+a+')';
	    				config.strokeStyle = 'rgba('+color.join(',')+',1)';
	    				
	    				var freq = item.get('rawFreq');
	    				var radius = scatterplot.interpolate(freq, minFreq, maxFreq, 2, 20);
	    				config.radius = radius;
    				}
    			}
        	},{
        		type: 'customScatter',
        		xField: 'x',
        		yField: 'y',
        		store: docSeriesStore,
        		label: {
        			field: 'term',
        			display: 'over'
        		},
        		tooltip: {
        			trackMouse: true,
        			style: 'background: #fff',
        			renderer: function (storeItem, item) {
        				this.setHtml(that.docFreqTipTemplate.apply([storeItem.get('term'),storeItem.get('rawFreq')]));
        			}
        		},
        		marker: {
        		    type: 'diamond'
        		},
        		highlight: {
        			fillStyle: 'yellow',
                    strokeStyle: 'black'
        		},
        		renderer: function (sprite, config, rendererData, index) {
    				var store = rendererData.store;
    				var item = store.getAt(index);
    				if (item !== null) {
	    				var clusterIndex = item.get('cluster');
	    				var scatterplot = this.getParent().up('scatterplot');
	    				
	    				if (clusterIndex === -1) {
	    					// no clusters were specified in initial call
	    					clusterIndex = 0;
	    				}
	    				
	    				var a = 0.65;
	    				if (numDims === 3) {
	    					a = scatterplot.interpolate(item.get('z'), minFill, maxFill, 0, 1);
	    				}
	    				var color = scatterplot.getApplication().getColor(6);
	    				config.fillStyle = 'rgba('+color.join(',')+','+a+')';
	    				config.strokeStyle = 'rgba('+color.join(',')+',1)';

	    				config.radius = 5;
    				}
    			}
        	}],
        	listeners: {
        		itemclick: function(chart, item, event) {
        			var data = item.record.data;
        			var record = Ext.create('Voyant.data.model.CorpusTerm', data);
            		this.getApplication().dispatchEvent('corpusTermsClicked', this, [record]);
        		},
        		render: function(chart) {
        			chart.body.on('contextmenu', function(event, target) {
	        			event.preventDefault();
	        			
		            	var xy = event.getXY();
		            	var parentXY = Ext.fly(target).getXY();
		            	var x = xy[0] - parentXY[0];
		            	var y = xy[1] - parentXY[1];
		            	var chartItem = this.down('#chart').getItemForPoint(x,y);
		            	if (chartItem != null && chartItem.record.get('isDoc') != true) {
		            		var series = this.down('#chart').getSeries();
		            		series[0].disableToolTips();
		            		series[1].disableToolTips();
		            		
		            		var term = chartItem.record.get('term');
		            		
		            		var text = (new Ext.Template(this.localize('removeTerm'))).apply([term]);
		            		this.chartMenu.queryById('remove').setText(text);
		            		text = (new Ext.Template(this.localize('nearbyTerm'))).apply([term]);
		            		this.chartMenu.queryById('nearby').setText(text);
		            		
		            		this.chartMenu.on('click', function(menu, item) {
		            			if (item !== undefined) {
		            				var term = chartItem.record.get('term');
			            			if (item.text === this.localize('remove')) {
			            				this.removeTerm(term);
			            			} else {
			            				this.getNearbyForTerm(term);
			            			}
		            			}
		            		}, this, {single: true});
		            		this.chartMenu.showAt(xy);
		            	}
		            }, this);
        		},
        		scope: this
        	}
        };
    	
    	var chart = Ext.create('Ext.chart.CartesianChart', config);
    	this.queryById('chartParent').insert(0, chart);
    	
    	if (this.newTerm !== null) {
        	this.selectTerm(this.newTerm);
        	this.newTerm = null;
        }
    },
    
    selectTerm: function(term) {
    	var series = this.down('#chart').getSeries()[0];
    	var index = series.getStore().findExact('term', term);
    	if (index !== -1) {
    		var record = series.getStore().getAt(index);
    		var sprite = series.getSprites()[0];
    		// constructing series item, like in the chart series source
    		var item = {
				series: series,
                category: series.getItemInstancing() ? 'items' : 'markers',
                index: index,
                record: record,
                field: series.getYField(),
                sprite: sprite
    		};
    		
    		series.setHighlightItem(item);
    	}
    },
    
    getCurrentTerms: function() {
    	var terms = [];
    	this.termStore.each(function(r) {
    		if (!r.get('isDoc')) {
    			terms.push(r.get('term'));
    		}
    	});
    	return terms;
    },
    
    getNearbyForTerm: function(term) {
    	var limit = Math.max(2000, Math.round(this.getCorpus().getWordTokensCount() / 100));
		this.setApiParams({limit: limit, target: term});
		this.loadFromApis();
		this.setApiParam('target', undefined);
    },
    
    removeTerm: function(term) {
    	var series = this.down('#chart').getSeries()[0];
    	var index = series.getStore().findExact('term', term);
    	series.getStore().removeAt(index);
    	
    	index = this.termStore.findExact('term', term);
    	this.termStore.removeAt(index);
    	
    	var newCount = this.termStore.getCount();
        this.queryById('limit').setRawValue(newCount);
    },
    
    loadFromApis: function(keepCurrentTerms) {
    	var chart = this.down('#chart');
    	if (chart !== null) {
    		chart.mask(this.localize('loading'));
    	}
    	var params = {};
    	var terms = this.getCurrentTerms();
    	if (this.newTerm !== null) {
    		terms.push(this.newTerm);
    		this.setApiParam('limit', terms.length);
    	}
    	if (terms.length > 0) {
    		if (this.newTerm !== null || keepCurrentTerms) {
    			params.query = terms.join(',');
    		}
    		params.term = terms;
    	}
    	Ext.apply(params, this.getApiParams());
//    	delete params.stopList;
    	if (params.analysis === 'pca') {
    		this.pcaStore.load({
	    		params: params
	    	});
    	} else {
	    	this.caStore.load({
	    		params: params
	    	});
    	}
    },
    
    interpolate: function(lambda, minSrc, maxSrc, minDst, maxDst) {
        return minDst + (maxDst - minDst) * Math.max(0, Math.min(1, (lambda - minSrc) / (maxSrc - minSrc)));
    }
});

/**
 * Adds tool tip disabling.
 */
Ext.define('Ext.chart.series.CustomScatter', {
	extend: 'Ext.chart.series.Scatter',
	
	alias: 'series.customScatter',
    type: 'customScatter',
    seriesType: 'scatterSeries',
	
	tipsDisabled: false,
	
	enableToolTips: function() {
		this.tipsDisabled = false;
	},
	
	disableToolTips: function() {
		this.tipsDisabled = true;
	},
	
    showTip: function (item, xy) {
    	if (this.tipsDisabled) {
    		return;
    	}
    	
    	this.callParent(arguments);
    }
});
Ext.define('Voyant.panel.Summary', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel', 'Voyant.util.SparkLine'],
	alias: 'widget.summary',
    statics: {
    	i18n: {
    		title: {en: "Summary"},
    		helpTip: {en: "<p>The <i>Summary</i> tool provides general information about the corpus. Many elements in the tool are links that trigger other views. Features include:</p><ul><li>total words (tokens) and word forms (types) and age of the corpus</li><li>most frequent terms in the corpus</li><li>for corpora with more than one documen<ul><li>documents ordered by length and vocabulary density</li><li>distinctive words for each document (by TF-IDF score)</li></ul></li></ul>"},
    		corpusType: {en: '<tpl for="types"><a href="#" onclick="return false" class="corpus-type keyword" voyant:recordId="{id}">{type}</a> ({val})<tpl if="xindex &lt; len">, </tpl></tpl>'},
    		documentType: {en: '<tpl for="types"><a href="#" onclick="return false" class="document-type keyword" voyant:recordId="{id}" voyant:val="{docId}:{type}">{type}</a> ({val})<tpl if="xindex &lt; len">, </tpl></tpl>'},
    		mostFrequentWords: {en: 'Most <b>frequent words</b> in the corpus: '},
    		docsLength: {en: '<ul><tpl for="docs"><li><a href="#" onclick="return false" class="document-id" voyant:val="{id}">{title}</a> ({totalWordTokens})</li></tpl></ul>'},
    		docsLengthLongest: {en: '<b>Longest documents</b> (by words {0})'},
    		docsLengthShortest: {en: 'Shortest documents'},
    		docsLengthAll: {en: 'Documents ordered by number of words ({0})'},
    		docsDensity: {en: '<ul><tpl for="docs"><li><a href="#" onclick="return false" class="document-id" voyant:val="{id}">{title}</a> ({wordDensity})</li></tpl></ul>'},
    		docsDensityHighest: {en: 'Highest <b>vocabulary density</b> ({0})'},
    		docsDensityLowest: {en: 'Lowest density'},
    		docsDensityAll: {en: 'Documents ordered by vocabulary density ({0})'},
    		distinctiveWords: {en: '<b>Distinctive words</b> (compared to the rest of the corpus): '},
    		moreDistinctiveWords: {en: '<a href="#" onclick="return false">Next {0} of {1} remaining</a>'},
    		seeAll: {en: 'All&hellip;'},
    		more: {en: 'More&hellip;'}
    	},
    	api: {
    		stopList: 'auto',
    		start: 0,
    		limit: 5,
    		// The maximum number of documents to show distinctive words for.
    		numberOfDocumentsForDistinctiveWords: 5
    	},
		glyph: 'xf1ea@FontAwesome'
    },
    config: {
    	corpus: undefined
    },
    autoScroll: true,
    cls: 'corpus-summary',
    
    corpusTermsStore: null,
    docsStore: null,
    documentTermsStore: null,
    
    summaryListParent: null,
    
    constructor: function(config ) {

    	Ext.apply(this, {
    		title: this.localize('title')
    	});

        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		
    		this.setCorpus(corpus);
    		
    		this.corpusTermsStore = corpus.getCorpusTerms();
    		
    		// create a local version of the store (avoiding buffered and remoteSort issues)
    		this.docStore = Ext.create("Ext.data.Store", {
    			model: "Voyant.data.model.Document",
        		autoLoad: false,
        		remoteSort: false,
        		corpus: this.getCorpus(),
        		proxy: {
					type: 'ajax',
					url: Voyant.application.getTromboneUrl(),
					extraParams: {
						tool: 'corpus.DocumentsMetadata',
						corpus: this.getCorpus().getId()
					},
					reader: {
						type: 'json',
						rootProperty: 'documentsMetadata.documents',
						totalProperty: 'documentsMetadata.total'
					},
					simpleSortMode: true
	   		     },
	   	         listeners: {
	   	        	 load: function(store, records, successful, opts) {
	   	        		 var corpus = this.getCorpus();
	   	        		 records.forEach(function(record) {
	   	        			 record.set('corpus', corpus);
	   	        		 });
	   	        	 },
	   	        	 scope: this
	   	         }
        	});
    		
    		this.documentTermsStore = Ext.create("Ext.data.Store", {
    			model: "Voyant.data.model.DocumentTerm",
        		autoLoad: false,
        		remoteSort: false,
        		corpus: this.getCorpus(),
        		proxy: {
					type: 'ajax',
					url: Voyant.application.getTromboneUrl(),
					extraParams: {
						tool: 'corpus.DocumentTerms',
						corpus: this.getCorpus().getId()
					},
					reader: {
						type: 'json',
			            rootProperty: 'documentTerms.terms',
			            totalProperty: 'documentTerms.total'
					},
					simpleSortMode: true
	   		     }
        	});
    		
    		if (this.rendered) {
    			var el = this.getLayout().getRenderTarget();
    			el.update('');
    			this.summaryListParent = Ext.dom.Helper.append(el, '<ul></ul>');
    			Ext.dom.Helper.append(this.summaryListParent, '<li>'+corpus.getShow()+'</li>');
    			
    			var size = corpus.getDocumentsCount();
    			
    			if (size>1) {this.showLongestDocuments();}
    			if (size>1) {this.showMostDenseDocuments();}
    			this.showMostFrequentWords();
    			if (size>1) {this.showDistinctiveWords();}
    			
    			var params = Ext.apply({}, {
    	    		limit: null
    	    	}, this.getApiParams());
    	    	this.docStore.load({
    				params: params
    			});
    	    	
    	    	this.addLinksHandler();
    		}
    		else {
    			Ext.defer(this.fireEvent, 100, this);
    		}

    	});
    	
    	this.on('activate', function() {
    		if (this.getCorpus()) {
        		this.dispatchEvent('ensureCorpusView', this, this.getCorpus());
    		}
		}, this);

    	// if we need to embed this, do so
    	if (config.embedded) {
    		var cls = Ext.getClass(config.embedded).getName();
    		if (cls=="Voyant.data.model.Corpus") {
    			config.corpus = config.embedded;
    		}
    	}
    	
    	// if we have a corpus, load it
    	if (config && config.corpus) {
    		this.fireEvent('loadedCorpus', this, config.corpus);
    	}
    },
    
    showLongestDocuments: function() {
    	var parent = Ext.dom.Helper.append(this.summaryListParent, '<li></li>');
    	this.docStore.on('load', function(store, records, success) {
    		var count = store.getTotalCount();
    		if (count > 1) {
    			store.sort('index', 'ASC');
    			var lengths = [];
    			store.each(function(r) {
    				lengths.push(r.get('tokensCount-lexical'));
    			});
    			
    			store.sort('tokensCount-lexical', 'DESC');
    			
    			var data = {
    				shortest: store.getRange(count-2,count).reverse(),
    				longest: store.getRange(0,1),
    				all: store.getRange(0,count)
    			};
    			
    			for (var k in data) {
    				if (k) {
    					var items = data[k];
    					for (var i=0;i<items.length;i++) {
    						var doc = items[i];
    						data[k][i] = {
    							title: doc.getShortTitle(),
    							id: doc.get('id'),
    							totalWordTokens: Ext.util.Format.number(doc.get('tokensCount-lexical'),'0,000'),
    							docsLen: items.length
    						};
    					}
    				}
    			}
    			
    			var tpl = new Ext.XTemplate(this.localize('docsLength'));
    			var out = '';
    			if (count>5) {
    				out += new Ext.Template(this.localize('docsLengthLongest')).applyTemplate([this.getSparkLine(lengths)]) + this.localize('colon') + tpl.apply({docs: data.longest});
    				out += this.localize('docsLengthShortest') + this.localize('colon') + tpl.apply({docs: data.shortest});
    				out += "<a href='#' onclick='return false' class='corpus-documents corpus-documents-length'>"+this.localize('seeAll')+'</a>';
    			}
    			else {
    				out += new Ext.Template(this.localize('docsLengthAll')).apply([this.getSparkLine(lengths)]) + this.localize('colon') + tpl.apply({docs: data.all});
    			}
    			Ext.dom.Helper.append(parent, out);
    		} else {
    			
    		}

		}, this);
    },
    
    showMostDenseDocuments: function() {
    	var parent = Ext.dom.Helper.append(this.summaryListParent, '<li></li>');
    	this.docStore.on('load', function(store, records, success) {
    		var count = store.getTotalCount();
    		if (count > 1) {
    			store.sort('index', 'ASC');
    			var densities = [];
    			store.each(function(r) {
    				densities.push(r.get('typeTokenRatio-lexical'));
    			});
    			
    			store.sort('typeTokenRatio-lexical', 'DESC');
    			
    			var data = {
    				lowest: store.getRange(count-2,count).reverse(),
    				highest: store.getRange(0,1),
    				all: store.getRange(0,count)
    			};
    			
    			for (var k in data) {
    				if (k) {
    					var items = data[k];
    					for (var i=0;i<items.length;i++) {
    						var doc = items[i];
    						data[k][i] = {
    							title: doc.getShortTitle(),
    							id: doc.get('id'),
    							wordDensity: Ext.util.Format.number(doc.get('typeTokenRatio-lexical'),'0.000'),
    							docsLen: items.length
    						};
    					}
    				}
    			}
    			
    			var tpl = new Ext.XTemplate(this.localize('docsDensity'));
    			var out = '';
    			if (count>5) {
    				out += new Ext.Template(this.localize('docsDensityHighest')).applyTemplate([this.getSparkLine(densities)]) + this.localize('colon') + tpl.apply({docs: data.highest});
    				out += this.localize('docsDensityLowest') + this.localize('colon') + tpl.apply({docs: data.lowest});
    				out += "<a href='#' onclick='return false' class='corpus-documents corpus-documents-density'>"+this.localize('seeAll')+'</a>';
    			}
    			else {
    				out += new Ext.Template(this.localize('docsDensityAll')).applyTemplate([this.getSparkLine(densities)])  + this.localize('colon') + tpl.apply({docs: data.all});
    			}
    			
    			Ext.dom.Helper.append(parent, out);
    		}
    	}, this);
    },
    
    showMostFrequentWords: function() {
    	var parent = Ext.dom.Helper.append(this.summaryListParent, '<li></li>');
    	var params = this.getApiParams();
		this.corpusTermsStore.load({
			params: params,
			scope: this,
			callback: function(records) {
				var out = this.localize('mostFrequentWords');
				var data = [];
				var len = records.length;
				records.forEach(function(r, index, array) {
					data.push({
						id: r.getId(),
						type: r.getTerm(),
						val: Ext.util.Format.number(r.get('rawFreq'),'0,000'),
						len: len
					});
				});
				out += new Ext.XTemplate(this.localize('corpusType')).applyTemplate({types: data})+'.';
				Ext.dom.Helper.append(parent, out);
			}
		});
    },
    
    showDistinctiveWords: function() {
    	var disParent = Ext.dom.Helper.append(this.summaryListParent, '<li>'+this.localize('distinctiveWords')+'<ol></ol></li>', true);
    	var listParent = disParent.first('ol');
    	
    	this.docStore.on('load', function(store, records, success) {
    		var count = store.getTotalCount();
    		if (count > 1) {
    			store.sort('index', 'ASC');
    			var len = this.getApiParam('numberOfDocumentsForDistinctiveWords');
    			store.each(function(item, index, length) {
    				Ext.dom.Helper.append(listParent, {tag: 'li', 'voyant:index': String(index), cls: (index>len-1 ? 'x-hidden' : ''), html: '<a href="#" onclick="return false" class="document-id document-id-distinctive" voyant:val="'+item.get('id')+'">'+item.getShortTitle()+'</a>'});
    			}, this);
    			
    			if (count > len) {
    				var tpl = new Ext.Template(this.localize('moreDistinctiveWords'));
					var remaining = count-len;
					var more = Ext.dom.Helper.append(this.summaryListParent, {tag: 'div', html: tpl.apply([len>remaining ? remaining : len,remaining])}, true);
					more.addListener('click', function() {
						var hidden = listParent.select('li[class="x-hidden"]');
						var item;
						for (i=0;i<hidden.getCount();i++) {
							if (i==len) {break;}
							item = hidden.item(i).removeCls('x-hidden');
						}
						this.showDistinctiveWordsStep(hidden.item(0));
						var remaining = hidden.getCount()-len;
						if (remaining>0) {
							more.update(tpl.apply([len>remaining ? remaining : len,remaining]));
						}
						else {more.remove();}
					}, this);
    			}
    			
    			this.showDistinctiveWordsStep(listParent.first('li'));
    		}
    	}, this);
    },
    
    showDistinctiveWordsStep: function(el) {
    	var index = Number(el.getAttribute('index','voyant'));
		this.documentTermsStore.load({
			addRecords: true,
			params: {
				docIndex: index,
				limit: 5,
				sort: 'TFIDF',
				dir: 'DESC'
			},
			scope: this,
			callback: function(records, operation, success) {
				var data = [];
				if (records) { // TODO: why wouldn't we have records here?
					var len = records.length;
					records.forEach(function(r, index, array) {
						data.push({
							id: r.getId(),
							type: r.getTerm(),
							val: Ext.util.Format.number(r.get('rawFreq'),'0,000'),
							docId: r.get('docId'),
							len: len
						});
					});
					Ext.dom.Helper.append(el, this.localize('colon')+new Ext.XTemplate(this.localize('documentType')).apply({types: data})+'.');
					
					var nextEl = el.next('li');
					if (nextEl && !nextEl.hasCls('x-hidden')) {
						this.showDistinctiveWordsStep(nextEl);
					}
				}
			}
		});
    },
    
    addLinksHandler: function() {
    	this.body.addListener('click', function(e) {
			var target = e.getTarget(null, null, true);
			if (target && target.dom.tagName == 'A') {
				var params = {};
				if (target.hasCls('corpus-documents')) {
					if (target.hasCls('corpus-documents-length')) {
						params.sortBy = 'totalWordTokens';
					} else if (target.hasCls('corpus-documents-density')) {
						params.sortBy = 'wordDensity';
					}
					params.sortDirection = 'DESC';
//					this.dispatchEvent('CorpusGridBootstrap', this, params);
				} else if (target.hasCls('document-id')) {
//					if (target.hasCls('document-id-distinctive')) {
//						Ext.apply(params, {sortBy: 'relativeFreqCorpusDelta', sortDirection: 'DESC'});
//					}
//					if (target.hasCls('document-id-density')) {
//						Ext.apply(params, {sortBy: 'wordDensity', sortDirection: 'DESC'});
//					}
					
					var docId = target.getAttribute('val', 'voyant');
					var doc = this.docStore.getById(docId);
					this.dispatchEvent('documentsClicked', this, [doc]);
				} else if (target.hasCls('corpus-type')) {
				    var recordId = target.getAttribute('recordId', 'voyant');
					var record = this.corpusTermsStore.getById(recordId);
					this.dispatchEvent('corpusTermsClicked', this, [record]);
				} else if (target.hasCls('corpus-types')) {
					params.query = '';
					if (target.hasCls('corpus-types-peaks')) {
						Ext.apply(params, {sortBy: 'RELATIVEDISTRIBUTIONKURTOSIS', sortDirection: 'DESC', extendedSortZscoreMinimum: 1});
					}
					else {
						Ext.apply(params, {sortBy: 'rawFreq', sortDirection: 'DESC', extendedSortZscoreMinimum: null});
					}
//					this.dispatchEvent('CorpusTypeFrequenciesRequest', this, params, {type: 'whitelist', tools: 'voyeurCorpusTypeFrequenciesGrid'});
				} else if (target.hasCls('document-type')) {
					var recordId = target.getAttribute('recordId', 'voyant');
					var record = this.documentTermsStore.getById(recordId);
					this.dispatchEvent('documentTermsClicked', this, [record]);
				}
			}
		}, this);
    }
});


// for mysterious reasons, Ext.require loads the scripts but produces a blank page, so use loadScript instead
/*
var twicPath = Ext.Loader.getPath("resources")+"/twic/current"
Ext.Loader.loadScript(twicPath+"/css/twic.css")
Ext.Loader.loadScript(twicPath+"/lib/queue.min.js")
Ext.Loader.loadScript(twicPath+"/lib/textFlow.js")
Ext.Loader.loadScript(twicPath+"/lib/svg_helper_functions.js")
Ext.Loader.loadScript(twicPath+"/lib/class_syntax.js")
Ext.Loader.loadScript(twicPath+"/js/twic_level.js")
Ext.Loader.loadScript(twicPath+"/js/twic_panel.js")
Ext.Loader.loadScript(twicPath+"/js/twic_datashape.js")
*/


Ext.define('Voyant.panel.TopicContexts', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.topiccontexts',
    statics: {
    	i18n: {
    		title: {en: "Topic Contexts"},
    		helpTip: {en: "Topic Contexts"},
    		reset: {en: 'reset'}
    	},
    	api: {
    	},
		glyph: 'xf06e@FontAwesome'
    },
    
    constructor: function(config) {

    	Ext.apply(this, {
    		title: this.localize('title'),
    		cls: 'twic_body'
    	});

        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);

    },
    
    listeners: {
    	loadedCorpus: function(src, corpus) {		
    		this.loadFromCorpus(corpus);
    	}
    	
    },
    
    loadFromCorpus: function(corpus) {
    	var url = Ext.Loader.getPath("resources")+"/twic/current/data/input/json"
        var twicLevel = TWiC.Level.prototype.Instance();
        twicLevel.LoadJSON(url+"/twic_corpusinfo.json", url+"/twic_corpusmap.json");
        var panel = this;

        // Once JSON has loaded, create and start the level
        twicLevel.m_queue.await(function(){

            // Create components
            var graphViews = [];
            var infoViews = [];
            var divName = "dickinson"; // NOTE: This needs to be added to twic_corpusinfo.json from serverside

            // Topic bar setup
            var topicBar = new TWiC.TopicBar({x:0, y:635}, // Position
                                             {width:1280, height:165}, // Size
                                             divName, // Name
                                             twicLevel, []); // Level and linked view(s)
            infoViews.push(topicBar);

            // Document info bar setup
            var docBar = new TWiC.DocumentBar({"x":1055, "y":0}, // Position
                                              {"width":225, "height":635}, // Size
                                              divName,  // Name
                                              twicLevel, []); // Level and linked view(s)
            infoViews.push(docBar);

            // Graph setup
            var corpusClusterView = new TWiC.CorpusClusterView({ "x":0, "y":0 }, // Position
                                                               { "width":1055, "height":635}, // Size
                                                               divName, // Name
                                                               twicLevel, [topicBar, docBar]); // Level and linked view(s)
            graphViews.push(corpusClusterView);

            // Link the corpus cluster view to the topic bar as well
            topicBar.m_linkedViews.push(corpusClusterView);

            var body = panel.getLayout().getRenderTarget();

            // Initialize the level
            twicLevel.Initialize([0,0], // Position
                                 {width: body.getWidth(), height: body.getHeight()}, // Size
                                 divName, // Name
                                 graphViews, infoViews, // TWiC graph and information panels
                                 '#'+body.getId()
            );

            // Startup the level
            twicLevel.Start();
        }.bind(twicLevel));

    }
    
})
 Ext.define('Voyant.panel.Trends', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	requires: ['Ext.chart.CartesianChart','Voyant.data.store.Documents'],

	alias: 'widget.trends',
	config: {
		corpus: undefined
	},
    statics: {
    	i18n: {
    		title: {en: "Trends"},
    		helpTip: {en: "<p><i>Trends</i> shows a line graph of the relative frequencies across the corpus (for multiple documents) or within a document. Features include</p><ul><li>a search box for queries (hover over the magnifying icon for help with the syntax)</li></ul>"},
    		freqsModeTip: {en: "Determines if frequencies are expressed as raw counts or as relative counts (per document or segment)."},
    		rawFrequencies: {en: 'raw frequencies'},
    		relativeFrequencies: {en: 'relative frequencies'},
    		raw: {en: 'raw'},
    		relative: {en: 'relative'},
    		segments: {en: 'document segments'},
    		documents: {en: 'documents'}
    	},
    	api: {
    		limit: 5,
    		stopList: 'auto',
    		query: undefined,
    		withDistributions: 'relative',
    		docIndex: undefined,
    		docId: undefined,
    		mode: undefined
    	},
		glyph: 'xf201@FontAwesome'
    },
    
    MODE_CORPUS: 'corpus',
    MODE_DOCUMENT: 'document',
    
    layout: 'fit',
    
    constructor: function(config) {

    	this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);

    	if (config.embedded) {
    		var cls = Ext.getClass(config.embedded).getName();
    		if (cls=="Voyant.data.store.CorpusTerms") {
    	    	this.loadFromCorpusTerms(config.embedded);
    		}
    		if (cls=="Voyant.data.model.Corpus") {
    	    	this.loadFromCorpusTerms(config.embedded.getCorpusTerms());
    		}
    	}
    	
    	this.on("loadedCorpus", function(src, corpus) {
    		this.setCorpus(corpus);
    		if (corpus.getDocumentsCount()==1 && this.getApiParam("mode")!=this.MODE_DOCUMENT) {
    			this.setApiParam("mode", this.MODE_DOCUMENT)
    		}
    		if (this.isVisible()) {
        		this.loadFromCorpus(corpus);
    		}
    	});
    	
    	this.on("documentsClicked", function(src, documents) {
    		if (this.getCorpus()) {
    			if (documents.length==1) {
    				this.loadFromDocument(documents[0]);
    			}
    		}
    	})
    	
    	this.on("query", function(src, query) {
    		if (Ext.isString(query)) {this.fireEvent("termsClicked", src, [query])}
    	}, this)

    	this.on("termsClicked", function(src, terms) {
    		if (this.getCorpus()) { // make sure we have a corpus
        		var queryTerms = [];
        		terms.forEach(function(term) {
        			if (Ext.isString(term)) {queryTerms.push(term)}
        			else if (term.term) {queryTerms.push(term.term);}
        			else if (term.getTerm) {queryTerms.push(term.getTerm());}
        		});
        		if (queryTerms) {
        			
            		if (this.getApiParam('mode')!=this.MODE_CORPUS && this.getCorpus().getDocumentsCount()>1) {
            			this.setApiParams({
            				'mode': this.MODE_CORPUS,
            				'docIndex': undefined,
            				'docId': undefined
            			});
            		}
        			this.setApiParams({
        				query: queryTerms
        			});
            		if (this.isVisible()) {
                		this.loadFromCorpus(this.getCorpus());
            		}
        		}
    		}
    	})

    	this.on("documentTermsClicked", function(src, terms) {
    		if (this.getCorpus()) { // make sure we have a corpus
	    		this.setApiParam('mode', 'document');
    			if (terms[0] && terms[0].get('distributions') !== undefined) {
    				this.loadFromRecords(terms); // load anyway, even if not visible - no server request required
    			}
    			else {
    				this.fireEvent("termsClicked", src, terms)
    			}
    		}
    	})
    	this.on("corpusTermsClicked", function(src, terms) {
    		if (this.getCorpus()) { // make sure we have a corpus
    			if (terms[0] && terms[0].get('distributions') !== undefined && this.getCorpus().getDocumentsCount()>1) {
    				this.loadFromRecords(terms); // load anyway, even if not visible - no server request required
    			}
    			else {
    				this.fireEvent("termsClicked", src, terms)
    			}
    		}
    	})
    	
    	this.on("activate", function() { // tab activation
    		if (this.getCorpus()) {
				this.loadFromCorpus(this.getCorpus())
    		}
    	}, this)
    	
    	this.on("ensureCorpusView", function(src, corpus) {
    		if (this.getApiParam('mode')!=this.MODE_CORPUS && corpus.getDocumentsCount()>1) {
    			this.setApiParam('docId', undefined);
    			this.loadFromCorpus(corpus);
    		}
    	}, this);

    	
    },
    
    initComponent: function() {
        var me = this;
    	Ext.apply(this, {
    		title: this.localize('title'),
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                items: [{
                    	xtype: 'querysearchfield'
                	},{
		                xtype: 'button',
		                text: this.localize('relative'),
		                tooltip: this.localize('freqsModeTip'),
		                menu: {
		                	items: [
		                       {
		                           text: this.localize("relativeFrequencies"),
		                           checked: true,
		                           group: 'freqsMode',
		                           checkHandler: function(item) {
		                        	   item.up('button').setText(this.localize('raw'));
		                        	   this.setApiParam('withDistributions', 'relative');
		                        	   this.reloadFromChart();
		                           },
		                           scope: this
		                       }, {
		                           text: this.localize("rawFrequencies"),
		                           checked: false,
		                           group: 'freqsMode',
		                           checkHandler: function(item) {
		                        	   item.up('button').setText(this.localize('raw'));
		                        	   this.setApiParam('withDistributions', 'raw');
		                        	   this.reloadFromChart();
		                           },
		                           scope: this
		                       }
		                   ]
		                }
                }]
            }]
        }) 
        me.callParent(arguments);
    	 
    },
    
    loadFromDocument: function(document) {

    	if (document.then) {
    		var me = this;
    		document.then(function(document) {me.loadFromDocument(document)})
    	}
    	else {
    		var ids = [];
    		if (Ext.getClassName(document)=="Voyant.data.model.Document") {
        		this.setApiParams({
        			docIndex: undefined,
        			query: undefined,
        			docId: document.getId(),
        			mode: this.MODE_DOCUMENT
        		})
        		if (this.isVisible()) {
                	this.loadFromDocumentTerms();
        		}
    		}
    	}
    },
    
    loadFromDocumentTerms: function(documentTerms) {
    	if (this.getCorpus()) {
        	documentTerms = documentTerms || this.getCorpus().getDocumentTerms({autoLoad: false});
    		documentTerms.load({
    		    callback: function(records, operation, success) {
    		    	if (success) {
    		    		this.setApiParam('mode', 'document');
    		    		this.loadFromRecords(records);
    		    	}
    		    	else {
    					Voyant.application.showResponseError(this.localize('failedGetDocumentTerms'), operation);
    		    	}
    		    },
    		    scope: this,
    		    params: this.getApiParams(['limit','stopList','query','docId','withDistributions'])
        	});
    	}
    },
    
    loadFromCorpus: function(corpus) {
		this.setCorpus(corpus);
		if (this.getApiParam("docId")) {
			this.loadFromDocumentTerms();
		}
		else if (corpus.getDocumentsCount()==1) {
			this.loadFromDocument(corpus.getDocument(0));
		}
		else {
    		this.loadFromCorpusTerms(corpus.getCorpusTerms());
		}
	},

    loadFromCorpusTerms: function(corpusTerms) {
		corpusTerms.load({
		    callback: function(records, operation, success) {
		    	if (success) {
			    	this.setApiParam('mode', this.MODE_CORPUS);
			    	this.loadFromRecords(records);
		    	}
		    	else {
					Voyant.application.showResponseError(this.localize('failedGetCorpusTerms'), operation);
		    	}
		    },
		    scope: this,
		    params: this.getApiParams(['limit','stopList','query','withDistributions'])
    	});
    },
    
    loadFromRecords: function(records) {
    	var mode = this.getApiParam('mode');
    	var terms = [];
    	var fields = ['index'];
    	var series = [];
    	var max = 0;
    	records.forEach(function(record, index) {
    		var term = record.get('term');
    		record.get('distributions').forEach(function(r, i) {
    			if (!terms[i]) {
    				terms[i] = {"index": i}
    			}
    			terms[i]["_"+index] = r;
    			if (r>max) {max=r}
    		}, this);
    		fields.push("_"+index);
        	series.push({
    			type: 'line',
    			title: term,
    			xField: 'index',
    			yField: '_'+index,
                style: {
                    lineWidth: 2
                },
                marker: {
                    radius: 3
                },
                highlight: true,
                smooth: true,
                tooltip: {
                    trackMouse: true,
                    style: 'background: #fff',
                    renderer: function(storeItem, item) {
                    	var html = "<i>"+item.series.getTitle()+"</i>: "+storeItem.get(item.series.getYField());
                    	if (mode==this.panel.MODE_CORPUS) {
                    		var corpus = this.panel.getCorpus();
                    		if (corpus && corpus.getDocumentsCount() == storeItem.store.getCount()) {
                    			html += '<br/><i>'+this.panel.getCorpus().getDocument(item.index).getShortTitle()+"</i>";
                    		}
                    	}
                    	this.setHtml(html);
                    },
                    panel: this
                },
                listeners: {
                	itemclick: {
        	        	fn: this.handleClickedItem,
        	        	scope: this
                	}
                }
    		})
    	}, this);
    	
    	var store = Ext.create('Ext.data.JsonStore', {
    		fields: fields,
    		data: terms
    	});
    	fields.shift();
    	
    	var me = this;
    	this.buildChart({
        	store: store,
        	series: series,
        	axes: [{
        		type: 'numeric',
        		position: 'left',
        		majorTickSteps: this.getApiParam('withDistributions') =='raw' && max < 20 ? max : undefined,
//                minimum: 0,
                increment: 1,
        		title: {
        			text: this.localize(mode==this.MODE_DOCUMENT || this.getApiParam('withDistributions') =='raw' ? 'rawFrequencies' : 'relativeFrequencies')
        		}
        	}, {
        		type: 'category',
        		position: 'bottom',
        		fields: ['index'],
        		title: {
            		text: this.localize(mode==this.MODE_DOCUMENT ? 'segments' : 'documents')
        		},
                label   : {
                    rotate:{degrees:-30},
                    textAlign: 'end'

               },
        		renderer: function(label, data) {
        			return mode==me.MODE_DOCUMENT ? parseInt(label)+1 : me.getCorpus().getDocument(label).getTinyTitle()
        		}
        	}]
    	});

    },
    
    reloadFromChart: function() {
    	var chart = this.down('chart');
    	if (chart) {
    		var terms = [];
    		chart.series.forEach(function(serie) {
    			terms.push(serie.getTitle())
    		})
    		this.fireEvent("termsClicked", this, terms);
    	}
    },
    
    buildChart: function(config) {
    	config.axes.forEach(function(axis) {
    		Ext.applyIf(axis, {
        		style: {opacity: .2},
        		label: {opacity: .5}
    		})
    		Ext.applyIf(axis.title, {
    			fontSize: 12
    		})
    	})
    	Ext.applyIf(config, {
    	    plugins: {
    	        ptype: 'chartitemevents',
    	        moveEvents: true
    	    },
    		legend: {docked:'top'},
    		interactions: ['itemhighlight','panzoom'],
    		innerPadding: {top: 5, right: 5, bottom: 5, left: 5},
    		border: false,
    	    bodyBorder: false/*,
    	    listeners: {
    	    	// FIXME: this is a work-around because item clicking is broken in EXTJS 5.0.1 (so all hover events currently trigger event)
    	        itemhighlight: {
    	        	fn: function (item) {
    	        		if (!this.isLastClickedItem(item)) {
    	            		if (this.deferredHandleClickedItem) {
    	            			clearTimeout(this.deferredHandleClickedItem);
    	            		}
        	        		this.deferredHandleClickedItem = Ext.defer(this.handleClickedItem, 250, this, arguments);
    	            		
    	            	}
    	        	},
    	        	scope: this
    	        }
    	    }*/
    	});
    	
    	// remove existing chart
    	this.query('chart').forEach(function(chart) {this.remove(chart)}, this);

		var chart = Ext.create("Ext.chart.CartesianChart", config);
    	this.add(chart);
    },
    
    clearChart: function() {
    	// we need a way of updating data instead of this brute-force approach
    	this.query('chart').forEach(function(chart) {this.remove(chart)}, this);
    },
    
    handleClickedItem: function(chart, item) {
        	var mode = this.getApiParam("mode");
        	if (mode===this.MODE_DOCUMENT) {
        		var docId = this.getApiParam("docId");
        		if (docId) {
            		this.dispatchEvent("documentIndexTermsClicked", this, [{
            			term: item.series.getTitle(),
            			docId: docId
            		}]);
        		}
        	}
        	else if (mode==this.MODE_CORPUS) {
        		this.dispatchEvent("documentIndexTermsClicked", this, [{
        			term: item.series.getTitle(),
        			docIndex: item.index
        		}]);
        	}
    },
    
    isLastClickedItem: function(item) {
    	return this.lastClickedItem && this.lastClickedItem.term==item.term && this.lastClickedItem.index==item.index
    }
})
Ext.define('Voyant.panel.VoyantFooter', {
	extend: 'Ext.container.Container',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.voyantfooter',
    statics: {
    	i18n: {
       		voyantLink: {en: '<a href="http://docs.voyant-tools.org/" target="_blank">Voyant Tools</a>'},
       		privacy: {en: 'Privacy'},
       		privacyMsg: {en: "The developers of Voyant Tools gather data from the site about what tools are invoked and with what parameters (IP addresses are also logged in order to be able to identify multiple requests during a same session). In addition, Voyant Tools uses Google Analytics (see &lt;a href=\"http://www.google.ca/intl/en/policies/privacy/\" target=\"_blank\"&gt;Google&apos;s Privacy Policy&lt;/a&gt; and the &lt;em&gt;Log Information&lt;/em&gt; section in particular). Locally logged data and Google Analytics data will be used by the development team in order to debug and improve the tools, as well as to understand how researchers are using them. This data may also be used for research purposes in anonymous and aggregate forms. Please note that texts submitted to Voyant Tools are stored in order to allow persistent access during a work session and between work sessions. If you have questions about the data being collected and how it is being used, or to request that a corpus be removed, please contact &lt;a href=\"http://stefansinclair.name/contact/\"&gt;Stéfan Sinclair&lt;/a&gt;."}
    	}
    },
	height: 18,
	cls: 'x-tab-bar-default voyant-footer',
	listeners: {
		boxready: function(container, width, height) {
			var parts = [
				container.localize('voyantLink'),
				", <a href='http://stefansinclair.name/'>St&eacute;fan Sinclair</a> &amp; <a href='http://geoffreyrockwell.com'>Geoffrey Rockwell</a>",
				" (&copy;"+ new Date().getFullYear() +")",
				" <a href='http://docs.voyant-tools.org/privacy/' target='top' data-qtip='"+container.localize('privacyMsg')+"'>"+container.localize('privacy')+"</a>",
				" v. "+Voyant.application.getVersion() + " ("+Voyant.application.getBuild()+")"
			];
			var footer = '';
			var footerWidth = 0;
			var partWidth;
			var el = container.getEl();
			for (var i=0;i<parts.length;i++) {
				partWidth = el.getTextWidth(parts[i].replace(/<.+?>/g, ""));
				if (footerWidth+partWidth < width) {
					footer += parts[i];
					footerWidth += partWidth;
				}
			}
			container.update(footer);
		}
	}
});
Ext.define('Voyant.panel.VoyantHeader', {
	extend: 'Ext.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.voyantheader',
    statics: {
    	i18n: {
    		title: {en: "Voyant Tools"}
    	}
    },
    constructor: function(config) {
    	Ext.apply(this, {
    		id: 'voyantheader',
    		title: '',
    		layout : 'fit',
    		html: '<div id="logo-container"></div>',
    		collapseMode : undefined,
			collapsible: true,
			animCollapse: false,
			titleCollapse: false,
			floatable: false,
			header: true,
			hideCollapseTool: true,
			listeners: {
				collapse: this.onCollapse
			},
			titleAlign: 'center'
    	});
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.call(this, Ext.apply(config, {
    		moreTools: ['corpusset','scatterplot']
    	}));
    },
    
    onCollapse: function(panel) {
    	// the title may be in flux when collapsing, so call defer setting of title
    	Ext.defer(function() {this.setTitle(this.localize('title'))}, 10, panel)
    }
});

Ext.define('Voyant.panel.CorpusSet', {
	extend: 'Ext.panel.Panel',
    requires: ['Voyant.panel.VoyantTabPanel','Voyant.panel.Cirrus', 'Voyant.panel.Summary', 'Voyant.panel.CorpusTerms', 'Voyant.panel.Reader', 'Voyant.panel.Documents', 'Voyant.panel.Trends', 'Voyant.panel.Contexts', 'Voyant.panel.DocumentTerms','Voyant.panel.CorpusCollocates','Voyant.panel.CollocatesGraph'],
	mixins: ['Voyant.panel.Panel'],
    alias: 'widget.corpusset',
	statics: {
		i18n: {
			title: {en: "Corpus View"},
			helpTip: {en: "This is the default, general-purpose corpus view."}
		},
		glyph: 'xf17a@FontAwesome'
	},
	constructor: function(config) {
        this.callParent(arguments);
	},
	layout: 'border',
	items: [{
        region: 'center',
        flex: 3,
        layout: 'fit',
        xtype: 'voyanttabpanel',
    	tabBarHeaderPosition: 0,
        items: [{
	        xtype: 'reader'
        }/*,{
        	xtype: 'scatterplot'
        }*/]
    }, {
    	region: 'west',
    	flex: 3,
    	layout: 'fit',
        moreTools: ['cirrus','corpusterms'],
        xtype: 'voyanttabpanel',
    	split: {width: 5},
    	tabBarHeaderPosition: 0,
    	items: [{
	    	xtype: 'cirrus'
    		
    	},{
	    	xtype: 'corpusterms'
    	}]
    }, /* {
    	region: 'west',
    	flex: 3,
    	layout: 'fit',
        moreTools: ['cirrus','corpusterms'],
    	split: {width: 5},
    	items: {
	    	xtype: 'cirrus'
    	}
    }, */{
    	region: 'east',
    	flex: 3,
    	layout: 'fit',
        xtype: 'voyanttabpanel',
    	split: {width: 5},
    	tabBarHeaderPosition: 0,
    	moreTools: ['trends','collocatesgraph','corpuscollocates'],
        items: [{
	    	xtype: 'trends'
        },{
	    	xtype: 'collocatesgraph'
        },{
	    	xtype: 'corpuscollocates'
        }]
    }, {
    	region: 'south',
    	flex: 2,
    	split: {width: 5},
    	layout: 'border',
//    	layout: {
//    		type: 'hbox',
//    		align: 'stretch'
//    	},
    	items: [{
				layout: 'fit',
				region: 'center',
    			flex: 1,
    	        xtype: 'voyanttabpanel',
    	    	split: {width: 5},
    	    	tabBarHeaderPosition: 0,
    			moreTools: ['summary','documents','phrases'],
    			items: [{
	    			xtype: 'summary'
    			},{
	    			xtype: 'documents'
    			},{
	    			xtype: 'phrases'
    			}]
    		},{
				layout: 'fit',
				region: 'east',
    			flex: 1,
    	        xtype: 'voyanttabpanel',
    	    	split: {width: 5},
    	    	tabBarHeaderPosition: 0,
    			moreTools: ['contexts','documentterms'],
    			items: [{
	    			xtype: 'contexts'
    			},{
	    			xtype: 'bubblelines'
    			}]
    	}]
    }],
    listeners: {
    	loadedCorpus: function(src, corpus) {
    		if (corpus.getDocumentsCount()>30) {
    			var bubblelines = this.down('bubblelines');
    			if (bubblelines) {
    				bubblelines.up('voyanttabpanel').remove(bubblelines)
    			}
    		}
    	}
    }
})
Ext.define('Voyant.VoyantApp', {
	
    extend: 'Ext.app.Application',
	mixins: ['Voyant.util.Deferrable','Voyant.util.Localization'],
	requires: ['Voyant.util.ResponseError'],
    
    name: 'VoyantApp',
    
    statics: {
    	i18n: {
    		error: {en: 'Error'},
			serverResponseError: {en: 'The server error reponse:'}
    	}
    },
    
    config: {
    	baseUrl: undefined,
    	tromboneUrl: undefined
    },
    
    constructor: function(config) {
    	
    	this.setBaseUrl(this.config.baseUrl);
    	
    	// set the Trombone URL from the baseURL // TODO: maybe allow this to be overridden
		this.setTromboneUrl(this.config.baseUrl+'trombone');

    	// set the application for the Corpus so that we can use a simple constructor
		Voyant.application = this;
		
		// call the parent constructor
        this.callParent(arguments);
        
    },
    
    getTools: function() {
    	return [{type: 'maximize'},{type: 'help'}]
    },
    
    launch: function() {
    	var me = this;
		this.callParent(arguments);
		var params = Ext.Object.fromQueryString(document.location.search);
		if (params && params.debug && params.debug=='true') { return}
		var viewport = this.getViewport();
		viewport.mask();
		Ext.create('Ext.window.Window', {
		    title: 'Voyant Tools 2.0 Preview Release',
		    width: 825,
		    layout: 'fit',
		    modal: true,
		    layout: 'vbox',
		    items: [{
		    	width: 800,
		    	margin: '10 5 3 10',
			    html: "<h2 style='text-align: center;'>Welcome to this Preview Release of Voyant Tools 2.0!</h2>"+
			    "<p>We've tried to make things usable in order to give a glimpse of what's to come, "+
			    "but this is an early preview release with lots of missing goodies and a whole bunch of bugs. "+
			    "Please kick the tires and let us know if you have suggestions on <a href='https://github.com/sgsinclair/Voyant/issues'>Github</a> or <a href='http://twitter.com/voyanttools'>Twitter</a>."+
			    "<ul>"+
		    	"<li>some new features and functionality:<ul>"+
		    		"<li>flexible search (wildcards, phrases, proximity) – hover over help icon in search boxes for more details</li>"+
			    	"<li>new <i>Phrases</i> tool for analyzing repeating n-grams</li>"+
		    		"<li>better cross-platform and device support (all tools in HTML5, no Flash or Java Applets)</li>"+
		    		"<li>much better support for larger corpora</li>"+
		    		"<li>vastly improved performance throughout (corpus reader and collocates are notable examples)</li>"+
		    	"</ul><li>some things not yet fully implemented:<ul>"+
			    	"<li>full list of tools and skins from 1.0</li>"+
			    	"<li>adding and reordering documents (new in 2.0)</li>"+
			    	"<li>N-Gram support (term sequences) (new in 2.0)</li>"+
			    	"<!--<li>part-of-speech tagging and lemmatization (new in 2.0)</li>-->"+
		    	"</ul></li></ul>"+
		    	"<p>It's best to assume that this preview release may be incompatible with future releases and that "+
		    	"any stored corpora will no longer be available after your session. Of course, you can keep using "+
		    	"<a href='http://voyant-tools.org'>Voyant Tools 1.0</a> "+
		    	"if you want persistence (normal persistence will be avilable with the full release of Voyant Tools 2.0). Have fun and please give us your <a href='http://twitter.com/voyanttools'>feeback</a>!</p>"
		    }, {
		    	xtype: 'button',
                glyph: 'xf00c@FontAwesome',
		    	width: '100%',
		    	scale: 'medium',
		    	text: 'Continue',
		    	handler: function(btn) {
		    		btn.up('window').close();
		    	}
		    }],
		    listeners: {
		    	close: function(panel) {
		    		viewport.unmask();
		    	}
		    }
		}).show();

    },
    
    tromboneCall: function(config) {
    	var config = config ? config : {};
    	Ext.applyIf(config, {
    		url: this.getTromboneUrl()
    	});
    	if (!config.success && !config.failure && !config.callback) {
        	Ext.applyIf(config, {
        		url: this.getTromboneUrl(),
        	    scope: this,
        	    callback: function(response, success, options) {
        	    	this.dispatchEvent(config.tool+"Loaded", response, success, options)
        	    }
        	});
    	};
    	Ext.Ajax.request(config);
    },
    
    getViewport: function() {
    	return Ext.ComponentQuery.query('viewport')[0];
    },

    dispatchEvent: function(eventName, src) {
    	var viewport = this.getViewport();
		var panels = viewport.query("panel,chart");
		var isHeard = false;

		// tell the app
		if (this.hasListener && this.hasListener(eventName)) {
			this.fireEvent.apply(this, arguments);
			isHeard = true
		}
		
		// tell the panels, except the current one
		for (var i=0; i<panels.length; i++) {
			if (panels[i].hasListener && panels[i].hasListener(eventName)) {
				if (src && src.getId && panels[i].getId && src.getId()==panels[i].getId()) {
					continue; // don't send to self
				}
				isHeard = true;
				panels[i].fireEvent.apply(panels[i], arguments);
			}
		}
		
		if (!isHeard) {
			if (console) {console.info("Unhandled event: "+eventName, arguments)}
		}
    },
    
	showResponseError: function(config, response) {
		this.showError(Ext.create("Voyant.util.ResponseError", {msg: (Ext.isString(config) ? config : config.msg), response: response}))
	},
	
	showError: function(config) {
		if (config instanceof Voyant.util.ResponseError) {
			var response = config.getResponse();
			Ext.apply(config, {
				message: config.getMsg()+" "+this.localize('serverResponseError')+
					"<pre class='error'>\n"+response.responseText.substring(0,response.responseText.indexOf("\n\t"))+"… "+
					"<a href='#' onclick=\"window.open('').document.write(unescape('<pre>"+escape(response.responseText)+"</pre>')); return false;\">more</a></pre>"
			})
		}
		Ext.applyIf(config, {
			title: this.localize("error"),
		    buttons: Ext.Msg.OK,
		    icon: Ext.MessageBox.ERROR,
		    autoScroll: true
		})
		Ext.Msg.show(config);
	},
	
	getToolConfigFromToolXtype: function(xtype) {
		cls = Ext.ClassManager.getByAlias("widget."+xtype);		
		return {
			xtype: xtype,
			title: this._localizeClass(cls, "title"),
			tooltip: { // this needs to be an object for compatibility (other configs can be changed)
				text: this._localizeClass(cls, "helpTip")
			},
			glyph: cls && cls.glyph ? cls.glyph : 'xf12e@FontAwesome'
		};
	},
	
	/**
	 * A universal palette of colors for use with terms and documents.
	 */
	colors: [[0, 0, 255], [51, 197, 51], [255, 0, 255], [121, 51, 255], [28, 255, 255], [255, 174, 0], [30, 177, 255], [182, 242, 58], [255, 0, 164], [51, 102, 153], [34, 111, 52], [155, 20, 104], [109, 43, 157], [128, 130, 33], [111, 76, 10], [119, 115, 165], [61, 177, 169], [202, 135, 115], [194, 169, 204], [181, 212, 228], [182, 197, 174], [255, 197, 197], [228, 200, 124], [197, 179, 159]],
	
	rgbToHex: function(a) {
		return "#" + ((1 << 24) + (a[0] << 16) + (a[1] << 8) + a[2]).toString(16).slice(1);
	},
	
	/**
	 * Gets the whole color palette.
	 * @param {Boolean} [returnHex] True to return a hexadecimal representation of each color (optional, defaults to rgb values).
	 * @return {Array} The color palette.
	 */
	getColorPalette: function(returnHex) {
		if (returnHex) {
			var colors = [];
			for (var i = 0; i < this.colors.length; i++) {
				colors.push(this.rgbToHex(this.colors[i]));
			}
			return colors;
		} else {
			return this.colors;
		}
	},
	
	/**
	 * Gets a particular color from the palette.
	 * @param {Integer} index The index of the color to get.
	 * @param {Boolean} [returnHex] True to return a hexadecimal representation of the color (optional, defaults to rgb values).
	 * @return {Mixed} The requested color, either a hex string or array of rgb values.
	 */
	getColor: function(index, returnHex) {
		if (returnHex) {
			return this.rgbToHex(this.colors[index]);
		} else {
			return this.colors[index];
		}
	},
	
	/**
	 * For tracking associations between a term and a color, to ensure consistent coloring across tools.
	 */
	colorTermAssociations: new Ext.util.MixedCollection(),
	
	/**
	 * Gets the color associated with the term.  Creates a new association if none exists.
	 * @param {String} term The term to get the color for.
	 * @param {Boolean} [returnHex] True to return a hexadecimal representation of the color (optional, defaults to rgb values).
	 * @return {Mixed} The requested color, either a hex string or array of rgb values.
	 */
	getColorForTerm: function(term, returnHex) {
		if (term.indexOf(':') != -1) {
			term = term.split(':')[1];
		}
		var color = this.colorTermAssociations.get(term);
		if (color == null) {
			var index = this.colorTermAssociations.getCount() % this.colors.length;
			color = this.colors[index];
			this.colorTermAssociations.add(term, color);
		}
		if (returnHex) {
			color = this.rgbToHex(color);
		}
		return color;
	}
    
});
Ext.define('Voyant.VoyantCorpusApp', {
	
    extend: 'Voyant.VoyantApp',
    
    name: 'VoyantCorpusApp',

    requires: ['Voyant.panel.CorpusSet','Voyant.data.model.Corpus','Voyant.panel.VoyantHeader', 'Voyant.panel.VoyantFooter', 'Voyant.panel.CorpusCreator', 'Voyant.panel.Cirrus', 'Voyant.panel.Summary', 'Voyant.panel.CorpusTerms', 'Voyant.panel.Reader', 'Voyant.panel.Documents', 'Voyant.panel.Trends', 'Voyant.panel.Contexts', 'Voyant.panel.DocumentTerms','Voyant.panel.CorpusCollocates','Voyant.panel.CollocatesGraph','Voyant.panel.Phrases','Voyant.panel.ScatterPlot','Voyant.panel.TopicContexts'],
    
    statics: {
    	i18n: {
    		fetchingCorpus: {en: 'Fetching your corpus'},
    		moreToolsScale: {en: 'Tools by Scale'},
    		moreToolsScaleCorpus: {en: 'Corpus Tools'},
    		moreToolsScaleDocument: {en: 'Document Tools'},
    		moreToolsType: {en: 'Tools by Type'},
    		moreToolsTypeViz: {en: 'Visualization Tools'},
    		moreToolsTypeGrid: {en: 'Grid Tools'},
    		moreToolsTypeOther: {en: 'Other Tools'}
    	}
    },
    
    config: {
    	corpus: undefined,
    	moreTools: [{
    		i18n: 'moreToolsScale',
    		glyph: 'xf07d@FontAwesome',
    		items: [{
    			i18n: 'moreToolsScaleCorpus',
    			glyph: 'xf111@FontAwesome',
    			items: ['cirrus','corpusterms','corpuscollocates','phrases','documents','summary','trends','scatterplot']
    		},{
    			i18n: 'moreToolsScaleDocument',
    			glyph: 'xf10c@FontAwesome',
    			items: ['cirrus','contexts','documentterms','reader','trends']
    		}]
    	},{
    		i18n: 'moreToolsType',
    		glyph: 'xf12e@FontAwesome',
    		items: [{
    			i18n: 'moreToolsTypeViz',
    			glyph: 'xf06e@FontAwesome',
    			items: ['cirrus','collocatesgraph','trends','scatterplot']
    		},{
    			i18n: 'moreToolsTypeGrid',
    			glyph: 'xf0ce@FontAwesome',
    			items: ['corpusterms','corpuscollocates','phrases','contexts','documentterms','documents']
    		},{
    			i18n: 'moreToolsTypeOther',
    			glyph: 'xf035@FontAwesome',
    			items: ['reader','summary']
    		}]
    	}]
    },
    
    launch: function() {
		this.callParent(arguments);

		// check parameters to see if we can load a corpus 
    	var queryParams = Ext.Object.fromQueryString(document.location.search);

    	if (queryParams.corpus || queryParams.input) {
    		var me = this;
    		var view = me.getViewport()
    		view.mask(this.localize("fetchingCorpus"));
    		new Corpus(queryParams).then(function(corpus) {
    			view.unmask();
    			me.dispatchEvent('loadedCorpus', this, corpus);
    		}).fail(function(message, response) {
    			view.unmask();
    			//me.showErrorResponse({message: message}, response);
    		});
    	}
    },
    
    listeners: {
    	loadedCorpus: function(src, corpus) {
    		this.setCorpus(corpus);
    	}
    }

});
Ext.define('Voyant.VoyantDefaultApp', {
	extend : 'Voyant.VoyantCorpusApp',
	mixins: ['Voyant.util.Api'],
	name : 'VoyantDefaultApp',
	constructor: function() {
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
        this.callParent(arguments);
	},
	statics: {
		i18n: {
			'noViewErrorTitle': {en: "View Error"},
			'noViewErrorTpl': {en: 'No view was found with the name "{view}". You can <a href="{url}">try with the default view</a> instead'}
		},
		api: {
			view: 'corpusset',
			stopList: 'auto'
		}
	},
	
	listeners: {
    	loadedCorpus: function(src, corpus) {
    		this.viewport.down('voyantheader').collapse();
    		this.viewport.down('#toolsContainer').setActiveItem(1);
    		
    		if (window.history.pushState) {
    			// add the corpusId to the url
    			var corpusId = corpus.getId();
        		var queryParams = Ext.Object.fromQueryString(document.location.search);
        		
    			var url = this.getBaseUrl()+'?corpus='+corpusId;
    			for (var key in queryParams) {
    				if (key !== 'corpus') {
    					url += '&'+key+'='+queryParams[key];
    				}
    			}
    			window.history.pushState({
    				corpus: corpusId
    			}, 'Corpus: '+corpusId, url);
    		}
    	}
	},
	getViewComponent: function() {
		return this.viewport.down('#toolsContainer-main')
	},
	launch: function() {
		var view = this.getApiParam('view', 'CorpusSet');
		var xtype = view.toLowerCase();
		if (!Ext.ClassManager.getByAlias("widget."+xtype)) {
			var url = document.location.href.replace(/view=.*?&/,'');
			Ext.Msg.show({
			    title: this.localize('noViewErrorTitle'),
			    message: new Ext.Template(this.localize('noViewErrorTpl')).apply({view: view, url: url}),
			    buttons: Ext.Msg.OK,
			    icon: Ext.Msg.ERROR
			});
			return;
		}
		var SPLIT_SIZE = 5;
		this.viewport = Ext.create('Ext.container.Viewport', {
		    layout: 'border',
		    items: [{
		    	xtype: 'voyantheader',
		    	region: 'north'
		    },{
		        region: 'south',
		        xtype: 'voyantfooter'
		    },{
		    	region: 'center',
		    	layout: 'card',
		    	itemId: 'toolsContainer',
				activeItem: 0,
				items: [{
					xtype : 'container',
					layout: {
		                type: 'hbox',
		                pack: 'center'
		            },
					items: {
						xtype: 'corpuscreator'
					}
				},{
					layout: 'fit',
					itemId: 'toolsContainer-main',
					items: {
						xtype: xtype
					}
				}]
		    }]
		});
		this.callParent(arguments);
	}
});
