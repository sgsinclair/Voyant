/* This file created by JSCacher. Last modified: Sat Jun 11 16:36:35 EDT 2016 */
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
	this.termsFilter = []; // tracks the subset of terms
	this.bubbleSpacing = 50;

	this.initialized = false;
}

Bubblelines.prototype = {
	constructor: Bubblelines,
	
	initializeCanvas: function() {
		var container = this.container;
		var height = container.getHeight();
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
        				            				
//        				this.findLongestDocumentTitle();
//        				
//        				var padding = 75;
//        				if (this.DRAW_SHORT_TITLES) padding = 50;
//        				this.setMaxLineWidth(width - this.MAX_LABEL_WIDTH - padding);
        			},
        			single: true,
        			scope: this
        		}
        	}
		});
		container.updateLayout();
		this.initialized = true;
	},
	
	doBubblelinesLayout: function() {
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
		if (this.canvas) {
			this.canvas.height = height;
		}
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
			var terms = this.termsFilter;
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
		if (!doc.hidden) {
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
	//			var filter = [];
	//			for (var term in this.currentTerms) {
	//				filter.push(term);
	//			}
				
				if (!this.SEPARATE_LINES_FOR_TERMS) {
					drawLine();
				} else if (this.termsFilter == null || this.termsFilter.length === 0) {
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
					if (this.termsFilter.indexOf(t) !== -1) {
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
					}
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
		}
	},
	
	drawLegend: function() { // obsolete code?
		var x = this.MAX_LABEL_WIDTH + this.maxRadius;
		var y = 5;
		this.ctx.textBaseline = 'top';
		this.ctx.font = '16px serif';
		if (this.typeStore) {
			this.typeStore.each(function(record) {
				var color = record.get('color').join(',');
				this.ctx.fillStyle = 'rgb('+color+')';
				var type = record.get('type');
				this.ctx.fillText(type, x, y);
				var width = this.ctx.measureText(type).width;
				x += width + 8;
			}, this);
		}
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
						var spacing = doc.lineLength / this.bubbleSpacing;
						var xIndex = Math.round(x / spacing);
						var prevDocHeight = this.maxRadius;
						if (docIndex > 0) {
							prevDocHeight = docHeight - (this.cache.get(docIndex).height - this.maxRadius*0.75);
						}
						var yIndex = Math.round((y - prevDocHeight) / this.maxRadius);
						
						var count = 0;
						for (var t in doc.terms) {
							if (this.termsFilter.indexOf(t) !== -1) {
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
		this.termsFilter = [];
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
function Knots(config) {
	this.container = config.container;
	this.externalClickHandler = config.clickHandler;
	
	this.MAX_LINE_LENGTH = 0;
	this.LINE_SIZE = 2.5;
	
	this.progressiveDraw = true;
	this.progDrawDone = false;
	this.drawStep = 0;
	
	this.mouseOver = false;
	this.refreshInterval = 100;
	this.forceRedraw = false;
	this.lastDrawTime = new Date().getTime();
	this.intervalId = null;
	this.startAngle = 315;
	this.angleIncrement = 15;
	
	this.canvas = null;
	this.ctx = null;
	this.currentDoc = null;
	this.maxDocLength = 0;
	
	this.offset = {x: 0, y: 0};

	this.termsFilter = [];
	
	this.initialized = false;
	
	this.audio = config.audio;
	
}


Knots.prototype = {
	constructor: Knots,
	
	initializeCanvas: function() {
		var container = this.container;
		var height = container.getHeight()-5;
		var width = container.getWidth();
		this.MAX_LINE_LENGTH = Math.sqrt((width * width) + (height * height));
		
		var id = Ext.id('knots');
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
        			},
        			single: true,
        			scope: this
        		}
        	}
		});
		container.updateLayout();
		this.initialized = true;
	},
	
	doLayout: function() {
		if (this.initialized) {
			var width = this.container.getWidth();
			var height = this.container.getHeight()-5;
			this.canvas.width = width;
			this.canvas.height = height;
			this.recache();
			this.buildGraph();
		}
	},
	
	buildGraph: function(drawStep) {
		if (this.intervalId != null) {
			this.progDrawDone = false;
			clearInterval(this.intervalId);
		}
		this.forceRedraw = true;

		this.drawStep = drawStep || 0;
		
		for (var t in this.currentDoc.terms) {
			var term = this.currentDoc.terms[t];
			term.done = false;
		}
		
		if (!this.progressiveDraw) {
			this.doDraw(false);
		} else {
			this.intervalId = setInterval(this.doDraw.createDelegate(this, [false]), 50);
		}
	},
	
	drawGraph: function(includeLegend) {
		if (this.intervalId != null) {
			this.progDrawDone = false;
			clearInterval(this.intervalId);
		}
		this.forceRedraw = true;
		
		if (!this.progressiveDraw) {
			this.doDraw(false, includeLegend);
		} else {
			this.intervalId = setInterval(this.doDraw.createDelegate(this, [includeLegend]), 50);
		}
	},
	
	doDraw: function(includeLegend) {
		var time = new Date().getTime();
		if (this.forceRedraw || time - this.lastDrawTime >= this.refreshInterval) {
			this.forceRedraw = false;
			
			this.clearCanvas();
			
			this.ctx.save();
			this.ctx.translate(this.offset.x, this.offset.y);
			
			this.drawDocument(this.currentDoc);
			
			// animate the origin
	//		this.originOpacity -= 0.01;
	//		if (this.originOpacity < 0) {
	//			this.originOpacity = 1.0;
	//		}
			this.originOpacity = 0.5;
			this.originColor = '128,128,128';
			this.ctx.lineWidth = Math.abs(this.originOpacity - 1) * 15;
			this.ctx.fillStyle = 'rgba('+this.originColor+',1.0)';
			this.ctx.strokeStyle = 'rgba('+this.originColor+','+this.originOpacity+')';
			this.ctx.beginPath();
			this.ctx.arc(0, 0, this.LINE_SIZE*2, 0, Math.PI*2, true);
			this.ctx.closePath();
			this.ctx.fill();
			
			if (!includeLegend) this.ctx.stroke();
			this.ctx.restore();
			this.ctx.lineWidth = 1;
			
			if (includeLegend === true) {
				this.drawLegend();
			}
			
			this.lastDrawTime = new Date().getTime();
			
			// test to see if each doc term is done
			if (this.progressiveDraw) {
				var done = true;
				for (var t in this.currentDoc.terms) {
					done = done && this.currentDoc.terms[t].done;
				}
				this.progDrawDone = done;
				if (done) {
					clearInterval(this.intervalId);
					this.intervalId = null;
					this.muteTerms();
				} else {
					this.drawStep++;
				}
			}
		}
	},
	
	setAudio: function(audio) {
		this.audio = audio;
		if (!audio) {this.muteTerms();}
	},
	
	muteTerms: function() {
		for (t in this.currentDoc.terms) {
			if (this.currentDoc.terms[t].audio) {
				this.currentDoc.terms[t].audio.gainNode.gain.value=0;
			}
		}
	},
	
	drawDocument: function(doc) {
		var terms = doc.terms;
		
		for (var t in terms) {
			if (this.termsFilter.indexOf(t) != -1) {
				var info = terms[t];
				var prevXY = [[0,0],[0,0]];
				if (this.progressiveDraw) {
					var length = this.drawStep + 1;
					if (info.pos.length <= this.drawStep) {
						info.done = true;
						length = info.pos.length;
						if (terms[t].audio) {terms[t].audio.gainNode.gain.value=0};
					} else {
						if (this.audio && terms[t].audio) {terms[t].audio.gainNode.gain.value=.1;}
						setTimeout(function() {
							if (terms[t]) {terms[t].audio.gainNode.gain.value=0;}
						}, this.refreshInterval*.75)
						info.done = false;
					}
					for (var i = 0; i < length; i++) {
						var xy = info.pos[i];
						this.drawPolygon(xy, prevXY, info.color);
						prevXY = [[xy.polygon[0][3], xy.polygon[1][3]], [xy.polygon[0][2], xy.polygon[1][2]]];
					}
				} else {
					for (var i = 0; i < info.pos.length; i++) {
						var xy = info.pos[i];
						this.drawPolygon(xy, prevXY, info.color);
						prevXY = [[xy.polygon[0][3], xy.polygon[1][3]], [xy.polygon[0][2], xy.polygon[1][2]]];
					}
				}
			}
		}
	},
	
	drawPolygon: function(xy, prevXY, color) {
		var polyX = xy.polygon[0];
		var polyY = xy.polygon[1];
		
		// connect to previous polygon to make smoother turns
		this.ctx.beginPath();
		this.ctx.moveTo(prevXY[0][0], prevXY[0][1]);
		this.ctx.lineTo(polyX[0], polyY[0]);
		this.ctx.lineTo(polyX[1], polyY[1]);
		this.ctx.lineTo(prevXY[1][0], prevXY[1][1]);
		this.ctx.closePath();
		
		this.ctx.fillStyle = 'rgba('+color+', 0.6)';
		this.ctx.fill();

		// draw the current polygon
		this.ctx.beginPath();
		this.ctx.moveTo(polyX[0], polyY[0]);
		this.ctx.lineTo(polyX[1], polyY[1]);
		this.ctx.lineTo(polyX[2], polyY[2]);
		this.ctx.lineTo(polyX[3], polyY[3]);
		this.ctx.closePath();

		if (xy.over) this.ctx.fillStyle = 'rgba('+color+', 1.0)';
		this.ctx.fill();
	},
	
	drawLegend: function() {
		var x = 5;
		var y = 5;
		this.ctx.textBaseline = 'top';
		this.ctx.font = '16px serif';
		this.termStore.each(function(record) {
			var color = record.get('color');
			this.ctx.fillStyle = 'rgb('+color+')';
			var term = record.get('term');
			this.ctx.fillText(term, x, y);
			var width = this.ctx.measureText(term).width;
			x += width + 8;
		}, this);
	},
	
	setCurrentDoc: function(doc) {
		this.currentDoc = doc;
		this.cacheDocument(doc);
	},
	
	addTerms: function(termsObj) {
		Ext.apply(this.currentDoc.terms, termsObj);
		this.recache();
	},
	
	removeTerm: function(term) {
		if (this.currentDoc.terms[term].audio) {this.currentDoc.terms[term].audio.oscillator.stop();}
		delete this.currentDoc.terms[term];
		this.recache();
	},
	
	removeAllTerms: function() {
		for (term in this.currentDoc.terms) {
			if (this.currentDoc.terms[term].audio) {
				this.currentDoc.terms[term].audio.oscillator.stop();
			}
		}
		this.currentDoc.terms = {};
		this.recache();
	},
	
	recache: function() {
		this.MAX_LINE_LENGTH = Math.sqrt((this.canvas.width * this.canvas.width) + (this.canvas.height * this.canvas.height));
		this.cacheDocument(this.currentDoc);
		this.determineGraphSizeAndPosition();
	},
	
	cacheDocument: function(doc) {
		var lineLength = this.MAX_LINE_LENGTH;
		
		this.currentDoc.lineLength = lineLength;
		
		var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		
		for (var term in this.currentDoc.terms) {
			if (audioCtx && !this.currentDoc.terms[term].audio) {
				var oscillator = audioCtx.createOscillator();
				var gainNode = audioCtx.createGain();
				oscillator.connect(gainNode);
				gainNode.connect(audioCtx.destination);
				oscillator.frequency.value = (Math.random()*500)+150; // value in hertz
				oscillator.start();
				gainNode.gain.value = 0;
				this.currentDoc.terms[term].audio = {oscillator: oscillator, gainNode: gainNode}
			} 
			this.cacheTurns(this.currentDoc.terms[term], lineLength);
		}
	},
	
	cacheTurns: function(info, lineLength) {
		var rawFreq = info.rawFreq;
		if (rawFreq > 0) {
			var doc = this.currentDoc;
			
			var term = info.term;
			var color = info.color;

			var cachedPositions = [];
			
			var tokenIds = info.positions;
			var lastTokenId = tokenIds[tokenIds.length-1];
			
			var angle = this.startAngle;
			var angleIncrement = this.angleIncrement;
			var prevX = 0;
			var prevY = 0;
			var x = 0;
			var y = 0;
			var prevLength = 0;
			
			for (var i = 0; i < tokenIds.length; i++) {
				var o = tokenIds[i];
				
				var length = o / lastTokenId * lineLength;
				var segment = length - prevLength;
				
				prevX = x;
				prevY = y;
				
				var newPoint = this.findEndPoint([x, y], segment, angle);
				x = newPoint[0];
				y = newPoint[1];
				
				var polygon = this.getPolygonFromLine([prevX, prevY], [x, y], angle, this.LINE_SIZE);
				
				cachedPositions.push({tokenId: o, polygon: polygon, over: false});
				
				prevLength = length;
				angle += angleIncrement;
			}
			
//			doc.terms[term] = {pos: cachedPositions, rawFreq: rawFreq, color: color, done: false};
			doc.terms[term].pos = cachedPositions;
			doc.terms[term].done = false;
		}
	},
	
	findEndPoint: function(point, length, angle) {
		var radians = this.degreesToRadians(angle);
		var x2 = point[0] + (length * Math.cos(radians));
		var y2 = point[1] + (length * Math.sin(radians));
		return [x2, y2];
	},
	
	determineGraphSizeAndPosition: function() {		
		var bb = this.findBoundingBoxForGraph();

		// find the size ratio between the graph and the canvas
		var width = bb.maxX - bb.minX;
		var height = bb.maxY - bb.minY;
		var widthRatio = this.canvas.width / width;
		var heightRatio = this.canvas.height / height;
		var ratio = Math.min(widthRatio, heightRatio);
		ratio -= 0.05; // create some space around the borders
		
		width *= ratio;
		height *= ratio;
		
		this.offset.x = Math.abs(bb.minX * ratio - (this.canvas.width / 2 - width / 2));
		this.offset.y = Math.abs(bb.minY * ratio - (this.canvas.height / 2 - height / 2));
		
		this.MAX_LINE_LENGTH = Math.sqrt((this.canvas.width * this.canvas.width) + (this.canvas.height * this.canvas.height)) * ratio;
		this.cacheDocument(this.currentDoc);
	},
	
	findBoundingBoxForGraph: function() {
		var minX = null;
		var maxX = null;
		var minY = null;
		var maxY = null;
		for (var t in this.currentDoc.terms) {
			var pos = this.currentDoc.terms[t].pos;
			for (var i = 0; i < pos.length; i++) {
				var polygon = pos[i].polygon;
				var bb = this.getBoundingBox(polygon[0], polygon[1]);
				if (minX == null || bb[0] < minX) minX = bb[0];
				if (maxX == null || bb[2] > maxX) maxX = bb[2];
				if (minY == null || bb[1] < minY) minY = bb[1];
				if (maxY == null || bb[3] > maxY) maxY = bb[3];
			}
		}
		
		return {minX: minX, minY: minY, maxX: maxX, maxY: maxY};
	},
	
	getBoundingBox: function(polyX, polyY) {
		var minX = Math.min(polyX[0], polyX[2]);
		var maxX = Math.max(polyX[0], polyX[2])
		var minY = Math.min(polyY[0], polyY[2]);
		var maxY = Math.max(polyY[0], polyY[2]);
		return [minX, minY, maxX, maxY];
	},
	
	degreesToRadians: function(d) {
		return d * (Math.PI / 180);
	},
	
	clickHandler: function(event) {
		var x = event.layerX - this.offset.x;
		var y = event.layerY - this.offset.y;
		var hit = null;
		var tokenId = 0;
		for (var t in this.currentDoc.terms) {
			if (this.termsFilter.indexOf(t) != -1) {
				var pos = this.currentDoc.terms[t].pos;
				for (var i = 0; i < pos.length; i++) {
					var polygon = pos[i].polygon;
					var test = this.isPointInPolygon(polygon[0], polygon[1], x, y);
					if (test) {
						hit = t;
						tokenId = pos[i].tokenId;
						break;
					}
				}
			}
		}

		if (hit) {
			if (this.externalClickHandler !== undefined) {
				this.externalClickHandler({term: hit, tokenId: tokenId});
			}
		}
	},
	
	moveHandler: function(event) {
		var x = event.layerX - this.offset.x;
		var y = event.layerY - this.offset.y;
		if (this.dragInfo != null) {
			document.body.style.cursor = 'move';
			this.dragInfo.lastX = this.dragInfo.x;
			this.dragInfo.lastY = this.dragInfo.y;
			this.dragInfo.x = event.layerX;
			this.dragInfo.y = event.layerY;
			var xDiff = this.dragInfo.x - this.dragInfo.lastX;
			var yDiff = this.dragInfo.y - this.dragInfo.lastY;
			this.offset.x += xDiff;
			this.offset.y += yDiff;
		} else {
			this.mouseOver = false;
			for (var t in this.currentDoc.terms) {
				if (this.termsFilter.indexOf(t) != -1) {
					var pos = this.currentDoc.terms[t].pos;
					for (var i = 0; i < pos.length; i++) {
						if (!this.mouseOver) {
							var polygon = pos[i].polygon;
							var test = this.isPointInPolygon(polygon[0], polygon[1], x, y);
							if (test) {
								this.currentDoc.terms[t].pos[i].over = true;
								this.mouseOver = true;
							} else {
								this.currentDoc.terms[t].pos[i].over = false;
							}
						} else {
							this.currentDoc.terms[t].pos[i].over = false;
						}
					}
				}
			}
			if (this.mouseOver) {
				document.body.style.cursor = 'pointer';
				if (!this.progressiveDraw || (this.progressiveDraw && this.progDrawDone)) {
					clearInterval(this.intervalId);
					this.intervalId = setInterval(this.doDraw.createDelegate(this, [false]), 50);
				}
			} else {
				document.body.style.cursor = 'auto';
				if (!this.progressiveDraw || (this.progressiveDraw && this.progDrawDone)) {
					clearInterval(this.intervalId);
					this.doDraw(false);
				}
			}
		}
	},
	
	mouseDownHandler: function(event) {
		var x = event.layerX;
		var y = event.layerY;
		this.dragInfo = {
			lastX: x,
			lastY: y,
			x: x,
			y: y
		};
	},
	
	mouseUpHandler: function(event) {
		this.dragInfo = null;
	},
	
	getPolygonFromLine: function(point1, point2, angle, size) {
		var perpDown = angle + 90;
		var perpUp = angle - 90;
		
		var p1 = this.findEndPoint(point1, size, perpDown);
		var p2 = this.findEndPoint(point1, size, perpUp);
		var p3 = this.findEndPoint(point2, size, perpUp);
		var p4 = this.findEndPoint(point2, size, perpDown);
		
		var polyX = [p1[0], p2[0], p3[0], p4[0]];
		var polyY = [p1[1], p2[1], p3[1], p4[1]];
		return [polyX, polyY];
	},
	
	// from http://alienryderflex.com/polygon/
	isPointInPolygon: function(polyX, polyY, x, y) {
		var i = 0;
		var j = 3; // number of polygon sides minus 1
		var oddNodes = false;
		for (i = 0; i < 4; i++) {
			if ((polyY[i] < y && polyY[j] >= y) ||
				(polyY[j] < y && polyY[i] >= y)) {
				if (polyX[i] + (y - polyY[i]) / (polyY[j] - polyY[i]) * (polyX[j] - polyX[i]) < x) {
					oddNodes = !oddNodes;
				}
			}
			j = i;
		}
		return oddNodes;
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
    };
    
    this.addWords = function(words) {
        wordController.addWords(words);
    };
    
    this.arrangeWords = function() {
        wordController.arrangeWords();
    };

    this.clearAll = function() {
        wordController.setWords([]);
        wordController.grid = [];
        this.clear();
    };

    this.resizeWords = function() {
        that.setCanvasDimensions();
        wordController.resetWordCoordinates();
        wordController.calculateSizeAdjustment();
        wordController.resizeWords();
        wordController.arrangeWords();
        resizeTimer = null;
    };

    this.setCanvasDimensions = function() {
        var container = $(containerId)[0];
        var width = Math.max(container.offsetWidth, container.clientWidth);
        var height = Math.max(container.offsetHeight, container.clientHeight);
        this.canvas.width = width;
        this.canvas.height = height;
    };

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
    };
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
    };
    this.setLayout = function(value) {
        _layout = value;
    };
    
    this.HORIZONTAL = 0;
    this.MIXED = 1; // horizontal and vertical
    
    var _wordOrientation = this.MIXED;
    this.getWordOrientation = function() {
        return _wordOrientation;
    };
    this.setWordOrientation = function(value) {
    	_wordOrientation = value;
    };
    
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
        
        if (that.getWordOrientation() === that.MIXED) {
	        if (wordObj.text.match(/\s/) == null) {
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
			}
        }
        
        

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
/**
 * Voyant changes & additions:
 * - height setter, height no longer calculated based on content
 * - replaced tree.size with tree.nodeSize
 * - pointer cursor for node
 * - rect now behind text, made opaque to block paths obscuring text
 * - branch length based on text length on per node basis
 * - click handler
 * - zoom fixes
 */

/*
 * (This is the new BSD license.) Copyright (c) 2012-2014, Chris Culy All rights
 * reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met: *
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer. * Redistributions in binary
 * form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided
 * with the distribution. * Neither the name of the Chris Culy nor the names of
 * its contributors may be used to endorse or promote products from this
 * software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY Chris Culy ``AS IS'' AND ANY OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
 * EVENT SHALL Chris Culy BE LIABLE FOR ANY, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; OF USE, DATA, OR PROFITS; OR
 * BUSINESS INTERRUPTION) HOWEVER CAUSED AND ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
"use strict";
/**
 * @namespace doubletree All of the functionality is in the doubletree namespace
 */
var doubletree = {};

(function() {

// TBD what about visWidth? to be fixed visWidth is really width and width
// is really just the width of one side of the doubletree

/**
 * @class doubletree.DoubleTree This is the class for the DoubleTree
 *        visualization
 */
doubletree.DoubleTree = function() {
	var containers = []; // nominally for allowing the same tree in
							// multiple places, but not tested and probably
							// doesn't work right (e.g. for search)
	// defaults. see below for getter/setters
	var visWidth = 600;
	var visHt = 400; // calculated, not settable
	var prefixesOnRight = false; // true for right to left writing systems
	var filters = {
		"left" : [],
		"right" : []
	};
	var handlers = {
		"alt" : noOp,
		"shift" : noOp,
		"click" : noOp
	};
	var showTokenExtra = true;
	var scaleLabels = true;
	var sortFun = doubletree.sortByStrFld("token");
	var nodeText = doubletree.tokenText; // default
	var tokenExtraText = function(info) {
		return doubletree.fieldText(info, "POS");
	};
	var rectColor = function(info) {
		return "rgba(255,255,255,1)";
	};
	var rectBorderColor = function(info) {
		return "rgba(255,255,255,1)";
	};
	var continuationColor = function(info) {
		return "red";
	}
	var basicStyles = {
		"node" : {
			"fill" : "white",
			"stroke" : "steelblue",
			"stroke-width" : "1.5px"
		},
		"branch" : {
			"stroke" : "#aaa",
			"stroke-width" : "1.5px"
		}
	};

	var succeeded = false; // did we succeed in building a DoubleTree? we
							// need this flag, since we no longer return
							// true/false from setupFromX (since we do
							// chaining)

	var dispatch = d3.dispatch("idsUpdated");
	dispatch.on("idsUpdated", function() {
		if (this == leftTree) {
			rtTree.setIds(leftTree.continuationIDs);
			rtTree.updateContinuations();
		} else if (this == rtTree) {
			leftTree.setIds(rtTree.continuationIDs);
			leftTree.updateContinuations();
		}
	});

	var leftTrie, rtTrie, leftTree, rtTree;
	var visibleIDs; // the ids of the results that are showing

	// tmp, until we can do sizing right. the font sizes are specified in
	// doubletree.css and manually copied here
	var kFontSize = 14; // normal
	var kBigFontSize = 1.15 * kFontSize; // for found text and
											// continuations (was 18) NB:
											// this is 0.05 bigger than in
											// doubletree.css
	var kMinFontSize = 8; // smallest that we'll scale to
	var textScale;

	/** @exports mine as doubletree.DoubleTree */
	/** @ignore */
	function mine(selection) {
		// generate container and data independent part of chart here, using
		// `width` and `height` etc

		selection.each(function(d, i) {
			// generate chart here; `d` is the data and `this` is the
			// element
			// really, storing containers. Use updateData and redraw to
			// really do the generation
			containers.push(this[i]);
		});

	}

	/**
	 * initialize the visualization in one or more html containers
	 * <p>
	 * 
	 * @param containerPattern
	 *            CSS selector for the containers
	 */
	mine.init = function(containerPattern) {
		d3.select(d3.selectAll(containerPattern)).call(this);
		return mine;
	}

	/**
	 * redraw the visualization
	 */
	mine.redraw = function() {
		mine.setupFromTries(leftTrie, rtTrie);

		return mine;
	}

	/**
	 * set up the visualization using 2 {@link doubletree.Trie}s
	 * 
	 * @param leftOne
	 *            the left {@link doubletree.Trie}
	 * @param rtOne
	 *            the right {@link doubletree.Trie}
	 */
	mine.setupFromTries = function(leftOne, rtOne) {
		leftTrie = leftOne.getUniqRoot();
		rtTrie = rtOne.getUniqRoot();

		var leftTrieTree = leftTrie.toTree(filters.left);
		var rtTrieTree = rtTrie.toTree(filters.right);

		var copyIDs = true;
		if (Object.keys(rtTrieTree.pruned).length > 0) {
			new_pruneTree(rtTrieTree, rtTrieTree.pruned, copyIDs);
			new_pruneTree(leftTrieTree, rtTrieTree.pruned, copyIDs);
			copyIDs = false;
		}

		if (Object.keys(leftTrieTree.pruned).length > 0) {
			new_pruneTree(leftTrieTree, leftTrieTree.pruned, copyIDs);
			new_pruneTree(rtTrieTree, leftTrieTree.pruned, copyIDs);
		}

		// combine the info's from the two trees
		var newInfo = {}; // rtTrieTree.info;

		for ( var k in rtTrieTree.info) {
			if (k != "continuations" && k != "ids" && k != "count") {
				newInfo[k] = rtTrieTree.info[k];
			}
		}

		newInfo["right continuations"] = rtTrieTree.info.continuations;
		newInfo["left continuations"] = leftTrieTree.info.continuations;

		newInfo.ids = {};
		addTo(newInfo.ids, rtTrieTree.info.ids);
		addTo(newInfo.ids, leftTrieTree.info.ids);
		newInfo.count = Object.keys(newInfo.ids).length;
		visibleIDs = Object.keys(newInfo.ids);

		if (rtTrieTree.info.origIDs || leftTrieTree.info.origIDs) {
			newInfo.origIDs = {};
			addTo(newInfo.origIDs, rtTrieTree.info.origIDs);
			addTo(newInfo.origIDs, leftTrieTree.info.origIDs);
			newInfo.origCount = Object.keys(newInfo.origIDs).length;
		}

		rtTrieTree.info = newInfo;
		leftTrieTree.info = newInfo;

		var maxChildren = Math.max(leftTrieTree.maxChildren,
				rtTrieTree.maxChildren);
		if (isNaN(maxChildren) || maxChildren == 0) {
			succeeded = false;
			return mine;
		}

		if (scaleLabels) {
			textScale = d3.scale.log().range([ kMinFontSize, kFontSize ]);
		} else {
			textScale = function() {
				return kFontSize;
			}
			textScale.domain = function() {
			};
		}

		var minCount = Math.min(leftTrieTree.minCount, rtTrieTree.minCount);
		textScale.domain([ minCount, leftTrieTree.info.count ]);

		// TBD ?? margin, width, height, duplicated in Tree
		var margin = {
			top : 20,
			right : 20,
			bottom : 20,
			left : 20
		};
		var width = visWidth - margin.right - margin.left;
		var height = visHt - margin.top - margin.bottom;

		containers[0].forEach(function(d, i) {
			var thisContainer = d;
			var thisVis;

			function zoom() {
			    var scale = d3.event.scale,
			        translation = d3.event.translate;
//			        tbound = -h * scale,
//			        bbound = h * scale,
//			        lbound = (-w + m[1]) * scale,
//			        rbound = (w - m[3]) * scale;
			    // limit translation to thresholds
//			    translation = [
//			        Math.max(Math.min(translation[0], rbound), lbound),
//			        Math.max(Math.min(translation[1], bbound), tbound)
//			    ];
			    
			    d3.select(thisContainer).select("svg > g").attr("transform", "translate(" + translation + ")" + " scale(" + scale + ")");
			}

			var tmp = d3.select(thisContainer).select("svg");
			if (tmp[0][0] == null) {
				thisVis = d3
					.select(thisContainer)
					.append("svg")
					.attr("width", width + margin.right + margin.left)
					.attr("height", height + margin.top + margin.bottom)
					.attr("cursor", "move")
					.call(d3.behavior.zoom().scaleExtent([1,1]).on("zoom", zoom));

				thisVis.append("g"); // container for both trees

			} else {
				thisVis = tmp;
				thisVis
					.attr("width", width + margin.right + margin.left)
					.attr("height", height + margin.top + margin.bottom);
				thisVis.selectAll("g *").remove(); // clear
													// previous
			}

			leftTree = new doubletree.Tree(thisVis.select("g"),
					visWidth, visHt, leftTrieTree, true,
					sortFun, dispatch, textScale, showTokenExtra,
					nodeText, tokenExtraText, rectColor,
					rectBorderColor, continuationColor, basicStyles);
			rtTree = new doubletree.Tree(thisVis.select("g"),
					visWidth, visHt, rtTrieTree, false,
					sortFun, dispatch, textScale, showTokenExtra,
					nodeText, tokenExtraText, rectColor,
					rectBorderColor, continuationColor, basicStyles);
		});

		leftTree.handleAltPress = handlers.alt;
		rtTree.handleAltPress = handlers.alt;

		leftTree.handleShiftPress = handlers.shift;
		rtTree.handleShiftPress = handlers.shift;
		
		leftTree.handleClick = handlers.click;
		rtTree.handleClick = handlers.click;

		succeeded = true;
		return mine;
	}

	// hitArray is an array of items, prefixArray and suffixArray are arrays
	// of arrays of items
	/**
	 * set up the visualization from arrays corresponding to the hit, the
	 * prefix, and the suffix of a key word in context result.
	 * <p>
	 * The ith elements should correspond with each other. Each item
	 * consists of fields separated by a field delimiter. For example we
	 * might have word/tag (with / as the delimiter) or word\tlemma\tauthor
	 * (with tab (\t) as the delimiter) Only certain fields are relevant for
	 * deciding whether two items are to be considered the same (e.g. we
	 * might ignore an author field)
	 * 
	 * @param prefixArray
	 *            the array of arrays of the prefixes of the hits
	 * @param hitArray
	 *            the array of the hits
	 * @param suffixArray
	 *            the array of arrays of the suffixes of the hits
	 * @param idArray
	 *            the array of ids of the hits (or null, if there are no ids
	 *            for the hits)
	 * @param caseSensitive
	 *            are the hits case sensitive
	 * @param fieldNames
	 *            the names of the fields
	 * @param fieldDelim
	 *            the field delimiter
	 * @param distinguishingFieldsArray
	 *            the fields that determine identity
	 * @param prefixesOnRight
	 *            display the prefixes on the right, for right-to-left
	 *            writing systems. Default is false
	 */
	mine.setupFromArrays = function(prefixArray, hitArray, suffixArray, idArray, caseSensitive, fieldNames, fieldDelim, distinguishingFieldsArray) {

		if (undefined == caseSensitive && leftTrie) {
			caseSensitive = leftTrie.caseSensitive();
		}
		if (undefined == fieldNames && leftTrie) {
			fieldNames = leftTrie.fieldNames();
		}
		if (undefined == fieldDelim && leftTrie) {
			fieldDelim = leftTrie.fieldDelim();
		}
		if (undefined == distinguishingFieldsArray && leftTrie) {
			distinguishingFieldsArray = leftTrie.distinguishingFieldsArray();
		}

		leftTrie = new doubletree.Trie(caseSensitive, fieldNames, fieldDelim, distinguishingFieldsArray);
		rtTrie = new doubletree.Trie(caseSensitive, fieldNames, fieldDelim, distinguishingFieldsArray);

		var n = hitArray.length;
		for ( var i = 0; i < n; i++) {
			var thisID = idArray ? idArray[i] : i;
			var thisHit = hitArray[i];
			var thesePrefixes = prefixArray[i].slice();
			var theseSuffixes = suffixArray[i].slice();

			thesePrefixes.push(thisHit);
			thesePrefixes.reverse();
			theseSuffixes.unshift(thisHit);

			/*
			 * if (prefixesOnRight) { //e.g. for Arabic, Hebrew, N'Ko, ...
			 * thesePrefixes.push(thisHit); thesePrefixes.reverse();
			 * 
			 * rtTrie.addNgram( thesePrefixes, thisID);
			 * 
			 * theseSuffixes.unshift(thisHit); leftTrie.addNgram(
			 * theseSuffixes, thisID);
			 *  } else { thesePrefixes.push(thisHit);
			 * thesePrefixes.reverse(); leftTrie.addNgram( thesePrefixes,
			 * thisID);
			 * 
			 * theseSuffixes.unshift(thisHit); rtTrie.addNgram(
			 * theseSuffixes, thisID); }
			 */

			if (prefixesOnRight) {
				rtTrie.addNgram(thesePrefixes, thisID);
				leftTrie.addNgram(theseSuffixes, thisID);
			} else {
				leftTrie.addNgram(thesePrefixes, thisID);
				rtTrie.addNgram(theseSuffixes, thisID);
			}
		}

		mine.setupFromTries(leftTrie, rtTrie);
		return mine;
	}

	/**
	 * @returns just the <em>ids</em> of the data that satisfies the
	 *          current filters
	 */
	mine.filteredIDs = function() {
		return visibleIDs;
	}

	// return how many found
	/**
	 * search the nodes of the visualization for a pattern
	 * <p>
	 * The found nodes will get the CSS class foundText
	 * 
	 * @param searchRE
	 *            the regular expression to look for
	 * @returns how many nodes were found
	 */
	mine.search = function(searchRE) {
		leftTree.search(searchRE);
		rtTree.search(searchRE);

		var thisVis = d3.select(containers[0][0]);
		var found = thisVis.selectAll("text.foundText");

		if (found.empty()) {
			return 0;
		}

		var what = found[0].length;

		var foundRt = thisVis.selectAll("text.rtNdText.foundText");

		if (foundRt[0][0] != null) {
			what--; // root node, and we have 2 of those, so subtract one
					// from the count
		}
		return what;
	}

	/**
	 * clear the visualization of the search results
	 * <p>
	 * the CSS class foundText is removed
	 */
	mine.clearSearch = function() {
		leftTree.clearSearch();
		rtTree.clearSearch();
		return mine;
	}

	/**
	 * update the showing/hiding of extra information associated with the
	 * basic item, e.g. part of speech information
	 * <p>
	 * Notes:
	 * <ul>
	 * <li>This <em>DOES</em> redraw the visualization.</li>
	 * <li>Safari does not update the visualization correctly by itself, so
	 * we force it to rebuild the entire visualization, unlike in other
	 * browsers.</li>
	 * </ul>
	 */
	mine.updateTokenExtras = function() {
		leftTree.showTokenExtras(showTokenExtra);
		rtTree.showTokenExtras(showTokenExtra);

		// Safari doesn't update reshowing correctly, so we'll force it to
		// build this again :( (Chrome works correctly, so it's not a webkit
		// issue)
		var thisVis = d3.select(containers[0][0]);
		var tokExtra = thisVis.select('.tokenExtra[display="inline"]');
		if (!tokExtra.empty()) {
			var ht = tokExtra.style("height");
			if (ht == "0px") {
				mine.redraw();
			}
		}

		return mine;
	}

	// ////////// getter/setters
	/**
	 * Getter/setter for the maximum width of the DoubleTree area
	 * 
	 * @param value
	 *            the maximum width
	 */
	mine.visWidth = function(value) {
		if (!arguments.length)
			return visWidth;
		visWidth = value;
		return mine;
	}

	// ADDED
	mine.visHeight = function(value) {
		if (!arguments.length)
			return visHt;
		visHt = value;
		return mine;
	}

	/**
	 * Getter/setter for whether the prefixes are displayed on the right or
	 * the left.
	 * <p>
	 * The default value is false, i.e. the prefixes are displayed on the
	 * left, as in English. <em>prefixesOnRight</em> should be set to true
	 * for right-to-left writing systems such as Arabic, Hebrew, N'Ko, etc.
	 * 
	 * @param value
	 *            true or false
	 */
	mine.prefixesOnRight = function(value) {
		if (!arguments.length)
			return prefixesOnRight;
		prefixesOnRight = value;
		return mine;
	}

	// NB: doesn't redraw
	/**
	 * Getter/setter for the filter functions.
	 * <p>
	 * The filter functions get an information object as their argument, and
	 * return true/false. Each position away from the root has its own
	 * filter, and the left and right sides also have their own filters. The
	 * filters are specified via an object with "left" and "right" keys
	 * whose values are arrays of functions The function at index <em>i</em>
	 * filters position <em>i + 1</em> away from the root. Default is no
	 * filtering (via empty arrays)
	 * <p>
	 * Note: setting the filters does <em>not</em> redraw the
	 * visualization. See {@link #redraw}
	 * 
	 * @param value
	 *            an object containing the filters
	 */
	mine.filters = function(value) {
		if (!arguments.length)
			return filters;
		filters = value;
		return mine;
	}

	/**
	 * Getter/setter for the handlers for alt-click and shift-click on the
	 * nodes.
	 * <p>
	 * The handlers get an information object as their argument. The
	 * handlers are specified via an object with "alt" and "shift" keys
	 * whose values are functions The default is no handlers, i.e.
	 * <em>NO</em> interaction
	 * 
	 * @param value
	 *            an object containing the handlers
	 */
	mine.handlers = function(value) {
		if (!arguments.length)
			return handlers;
		handlers = value;
		return mine;
	}

	// NB: doesn't redraw
	/**
	 * Getter/setter for showing/hiding extra information associated with
	 * the main value, e.g. part of speech information.
	 * <p>
	 * Note: setting this value does <em>not</em> redraw the
	 * visualization. See {@link #redraw} Default is true
	 * 
	 * @param value
	 *            a boolean specifying whether to show the information or
	 *            not
	 */
	mine.showTokenExtra = function(value) {
		if (!arguments.length)
			return showTokenExtra;
		showTokenExtra = value;
		return mine;
	}

	/**
	 * Getter/setter for scaling the node labels by their frequency.
	 * <p>
	 * Default is true
	 * 
	 * @param value
	 *            a boolean specifying whether to scale the labels or not
	 */
	mine.scaleLabels = function(value) {
		if (!arguments.length)
			return scaleLabels;
		scaleLabels = value;
		return mine;
	}

	// succeeded is read only
	/**
	 * Reports whether the DoubleTree was constructed successfully
	 * <p>
	 * 
	 * @returns true if the DoubleTree was constructed successfully and
	 *          false otherwise
	 */
	mine.succeeded = function() {
		return succeeded;
	}

	/**
	 * Getter/setter for the function determining the sort order of sibling
	 * nodes.
	 * <p>
	 * The function gets an information object as its argument, and should
	 * return -1 for precedes, 1 for follows and 0 for don't care The nodes
	 * are displayed in "preceding" (i.e. ascending) order, from top to
	 * bottom. The default is alphabetical by a "token" field if there is
	 * one: doubletree.sortByStrFld("token")
	 * 
	 * @param the
	 *            sort order function
	 */
	mine.sortFun = function(value) {
		if (!arguments.length)
			return sortFun;
		sortFun = value;
		return mine;
	}

	/**
	 * Getter/setter for the function determining the content of the node
	 * labels.
	 * <p>
	 * The function gets an information object as its first argument and a
	 * boolean indicating whether the node is the root or not as its second
	 * argument. The function should return a string. The default is
	 * {@link #tokenText}
	 * 
	 * @param the
	 *            content function
	 */
	mine.nodeText = function(value) {
		if (!arguments.length)
			return nodeText;
		nodeText = value;
		return mine;
	}

	/**
	 * Getter/setter for the function determining the content of the "extra"
	 * information for the labels labels
	 * <p>
	 * The function gets an information object as its first argument and a
	 * boolean indicating whether the node is the root or not as its second
	 * argument. The function should return a string. The default is the POS
	 * field of the information object
	 * 
	 * @param the
	 *            content function
	 */
	mine.tokenExtraText = function(value) {
		if (!arguments.length)
			return tokenExtraText;
		tokenExtraText = value;
		return mine;
	}

	/**
	 * Getter/setter for the function determining the color of the
	 * background rectangles for the nodes.
	 * <p>
	 * The function gets an information object as its argument, and should
	 * return a CSS color in a string, e.g. "rgba(255,128,0,0.5)" The
	 * default is transparent white (i.e., effectively no color);
	 * 
	 * @param value
	 *            the background color function
	 */
	mine.rectColor = function(value) {
		if (!arguments.length)
			return rectColor;
		rectColor = value;
		return mine;
	}

	/**
	 * Getter/setter for the function determining the color of the borders
	 * of the background rectangles for the nodes.
	 * <p>
	 * The function gets an information object as its argument, and should
	 * return a CSS color in a string, e.g. "rgba(255,128,0,0.5)" The
	 * default is transparent white (i.e., effectively no color);
	 * 
	 * @param value
	 *            the border color function
	 */
	mine.rectBorderColor = function(value) {
		if (!arguments.length)
			return rectBorderColor;
		rectBorderColor = value;
		return mine;
	}

	/**
	 * Getter/setter for the function determining the color of the text of
	 * the nodes that are continuations of the clicked node.
	 * <p>
	 * The function gets an information object as its argument, and should
	 * return a CSS color in a string, e.g. "rgba(255,128,0,0.5)" The
	 * default is transparent white (i.e., effectively no color);
	 * 
	 * @param value
	 *            the border color function
	 */
	mine.continuationColor = function(value) {
		if (!arguments.length)
			return continuationColor;
		continuationColor = value;
		return mine;
	}

	/**
	 * Getter/setter for the styles of the nodes and branches. For now these
	 * are constant throughout the tree. Takes an object of the form:
	 * {"node":{"fill":cssColor, "stroke":cssColor,
	 * "stroke-width":cssWidth}, "branch":{"stroke":cssColor,
	 * "stroke-width":cssWidth}} All of the attributes are optional Defaults
	 * are: {"node":{"fill":"white", "stroke":"steelblue",
	 * "stroke-width":"1.5px"}, "branch":{"stroke":"#777",
	 * "stroke-width":"1.5px"}};
	 */
	mine.basicStyles = function(stylesObj) {
		if (!arguments.length)
			return basicStyles;

		Object.keys(basicStyles).forEach(
			function(aspect) {
				if (aspect in stylesObj) {
					Object.keys(basicStyles[aspect]).forEach(
						function(attr) {
							if (attr in stylesObj[aspect]) {
								basicStyles[aspect][attr] = stylesObj[aspect][attr];
							}
						});
				}
			});
		return mine;
	}

	return mine;
}

// ////// tree for doubletree
/** @private */
doubletree.Tree = function(vis, visWidth, visHt, data, toLeft,
		sortFun, dispatch, textScale, showTokenXtra, nodeTextFun,
		tokenExtraTextFun, rectColorFun, rectBorderFun, contColorFun,
		baseStyles) {
	var showTokenExtra = false || showTokenXtra;
	var continuationIDs = {};
	var clickedNode;
	var nodeText = nodeTextFun;
	var tokenExtraText = tokenExtraTextFun;
	var rectColor = rectColorFun;
	var rectBorderColor = rectBorderFun;
	var continuationColor = contColorFun;
	var basicStyles = baseStyles;

	var margin = {
		top : 20,
		right : 20,
		bottom : 20,
		left : 20
	}, width = visWidth - margin.right - margin.left, height = visHt - margin.top - margin.bottom, i = 0, duration = 200, root;
	var dx;

	if (!sortFun) {
		sortFun = doubletree.sortByStrFld("token");
	}

	var tree = d3.layout.tree()
	//.size([height, width])
	.nodeSize([ 40, 40 ])
	.sort(sortFun);

	var diagonal = d3.svg.diagonal()
	// .projection(function(d) { return [d.y, d.x]; }); //CC orig
	.projection(function(d) {
		return [ positionX(d.y), positionY(d.x) ];
	});

	vis = vis.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// //////
	this.readJSONTree = function(json) {
		root = json;
		root.x0 = height / 2;
		root.y0 = width / 2; // CC orig was 0

		root.children.forEach(collapse);
		this.update(root);
	}

	// CC had been inside readJSONTree
	function collapse(d) {
		if (d.children) {
			d._children = d.children;
			d._children.forEach(collapse);
			d.children = null;
		}
	}

	// CC new
	function collapseSiblings(nd) {
		if (nd.parent) {
			nd.parent.children.forEach(function(d) {
				if (d != nd) {
					collapse(d);
				}
			});
		}
	}

	var that = this;

	this.update = function(source) {
		if (!source) {
			source = root;
		}

		// Compute the new tree layout.
		var nodes = tree.nodes(root).reverse(); // CC orig why reverse?
		// var nodes = tree.nodes(root);

		// we don't want the root to change position, so we need to
		// compensate
		dx = root.x - height / 2;

		// Normalize for fixed-depth.
		nodes.forEach(function(d) {
			var textSize = 0;
			var parent = d.parent;
			while (parent != null) {
				textSize += Ext.draw.TextMeasurer.measureText(parent.name, 'arial').width;
				parent = parent.parent;
			}
			
			d.y = d.depth * 25 + textSize;
		});

		// Update the nodes…
		var node = vis.selectAll("g.node_" + toLeft).data(nodes,
				function(d) {
					return d.id || (d.id = ++i);
				});

		// Enter any new nodes at the parent's previous position.
		var nodeEnter = node.enter().append("g").attr("class", "node node_" + toLeft).attr("cursor", "pointer").attr( "transform",
				function(d) {
					return "translate(" + positionX(source.y0) + "," + positionY(source.x0) + ")";
				})
		/*
		 * doesn't work for webkit; svg really wants the title as separate
		 * element, see below .attr("title", function(d) { var what =
		 * doubletree.infoToText(d.info); return what;})
		 */
		.on("click", click);

		nodeEnter.append("title").text(function(d) {
			var what = doubletree.infoToText(d.info);
			return what;
		});

		nodeEnter.append("circle").attr("r", 1e-6).style("fill", function(d) {
			return d._children ? "#fff" : basicStyles.node.fill;
		}).style("stroke", function(d) {
			return basicStyles.node.stroke
		});

		var txtNode = nodeEnter.append("text").attr("class", function(d) {
			if (d.depth == 0) {
				return "rtNdText";
			} else {
				return "";
			}
		}).attr("x", function(d) {
			if (d.children || d._children) {
				return 0;
			} else {
				return toLeft ? 10 : -10;
			}
		}).attr("text-anchor", function(d) {
			if (!d.parent) {
				return "middle";
			}
			if (d.children || d._children) {
				return toLeft ? "end" : "start";
			} else {
				return toLeft ? "start" : "end";
			}
		}).style("font-size", function(d) {
			/*
			 * if (d.depth == 0 && toLeft) { return 0; //suppress left side
			 * root -- do this because of differences in counts when
			 * filtering }
			 */
			return textScale(d.info.count) + "pt";
		});

		txtNode.append("tspan").attr("dy", ".35em").attr("class", "tokenText").text(function(d) {
			return nodeText(d.info, d.depth < 1);
		}).style("fill-opacity", 1e-6);

		txtNode.append("tspan").attr("dx", ".35em").attr("class", "tokenExtra").text(function(d) {
			return tokenExtraText(d.info, d.depth < 1);
		}).style("fill-opacity", 1e-6);

		this.drawRects = function() {
			var which = showTokenExtra ? "inline" : "none";
			vis.selectAll(".tokenExtra").attr("display", which);

			node.selectAll("rect").remove(); // remove previous rects

			var nodeRect = node
					.insert("rect", "text")
					.attr("class", "nodeRect")
					.attr("height", function() {
						return this.parentElement.getBBox().height - 6;
					})
					.attr("y", function(d) {
						if (!d.parent) {
							return -0.5 * this.parentElement.getBBox().height / 2 - 2;
						} else {
							return -0.5 * this.parentElement.getBBox().height / 2;
						}
					})
					.attr("width", function() {
						return this.parentElement.getBBox().width;
					})
					.attr("x", function(d) {
						var parentW = this.parentElement.getBBox().width;
						if (!d.parent) {
							return -0.33333 * parentW;
						}
						if (!toLeft) {
							return 0;
						}
						return -0.5 * parentW;
					})
					// .style("stroke-opacity", 1e-6)
					.style("stroke-opacity", 1).style("stroke-width", 1)
					.style("stroke", function(d) {
						return rectBorderColor(d.info);
					}).style("fill", function(d) {
						return rectColor(d.info);
					}).style("fill-opacity", function(d) {
						return 1;
//						if (!d.parent && !toLeft) {
//							return 1e-6;
//						} else {
//							return 1;
//						}
					});
		}
		try {
			this.drawRects();
		} catch (e) {
			// apparently we're in some version of Opera, which thinks
			// "this" is the window, not the rect wh
		}

		// Transition nodes to their new position.
		var nodeUpdate = node.transition().duration(duration).attr("transform", function(d) {
			return "translate(" + positionX(d.y) + "," + positionY(d.x) + ")";
		});

		nodeUpdate.select("circle")
		// .attr("r", 4.5)
		.attr("r", function(d) {
			return (d.children || d._children) ? 1e-6 : 4.5
		}).style("fill", function(d) {
			return d._children ? "#fff" : basicStyles.node.fill;
		}) // function(d) { return d._children ? "lightsteelblue" : "#fff";
			// })
		.style("stroke-width", basicStyles.node["stroke-width"]);

		nodeUpdate.selectAll("tspan").style("fill-opacity", 1);

		// Transition exiting nodes to the parent's new position.
		var nodeExit = node.exit().transition().duration(duration).attr("transform", function(d) {
			return "translate(" + positionX(source.y) + "," + positionY(source.x) + ")";
		}).remove();

		nodeExit.select("circle").attr("r", 1e-6);

		// nodeExit.select("text")
		nodeExit.selectAll("tspan").style("fill-opacity", 1e-6);

		// Update the links…
		var link = vis.selectAll("path.link_" + toLeft).data(
				tree.links(nodes), function(d) {
					return d.target.id;
				});

		// Enter any new links at the parent's previous position.
		link.enter().insert("path", "g").attr("class", "link link_" + toLeft).attr("d", function(d) {
//			console.log('new link', d);
			var o = {
				x : source.x0,
				y : source.y0
			}; // CC orig
			return diagonal({
				source : o,
				target : o
			});
		}).style("fill", "none").style("stroke", basicStyles.branch.stroke).style("stroke-width", basicStyles.branch["stroke-width"]);

		// Transition links to their new position.
		link.transition().duration(duration).attr("d", diagonal);

		// Transition exiting nodes to the parent's new position.
		link.exit().transition().duration(duration).attr("d", function(d) {
			var o = {
				x : source.x,
				y : source.y
			}; // CC orig
			return diagonal({
				source : o,
				target : o
			}); // CC orig
		}).remove();

		// Stash the old positions for transition.
		nodes.forEach(function(d) {
			d.x0 = d.x;
			d.y0 = d.y;
		});

		this.updateContinuations();
		
	}

	// Toggle children on click.
	function click(d, i) {
		if (d3.event.altKey) {
			that.handleAltPress(d, i);
			// that.showTokenExtras(showTokenExtra);
			return;
		}
		if (d3.event.shiftKey) {
			that.handleShiftPress(d, i);
			// that.showTokenExtras(showTokenExtra);
			return;
		}

		that.handleClick(d, i);
		
		if (!d.parent) {
			return;
		}
		if (that.continuationIDs != d.info.ids) {
			that.setIds(d.info.ids);
			that.clickedNode = d.id;
			dispatch.idsUpdated.apply(that);
		}

		collapseSiblings(d); // CC new
		/*
		 * if (d.children) { d._children = d.children; d.children = null; }
		 * else { d.children = d._children; d._children = null; }
		 * that.update(d);
		 */
		toggleChildren(d, true);
	}

	function toggleChildren(d, update) { // we only update the clicked
											// node, not recursively
		// collapseSiblings(d); //CC we don't do this here, since after the
		// top level there's no point

		if (d.children) {
			if (d.children && d.children.length == 1) {
				toggleChildren(d.children[0], true); // need true to make
														// sure we toggle
														// all the way down
			}
			d._children = d.children;
			d.children = null;

		} else {
			d.children = d._children;
			d._children = null;

			// expand all if there is only one path
			if (d.children && d.children.length == 1) {
				toggleChildren(d.children[0], false);
			}
		}
		if (update) {
			that.update(d);
		}
	}

	this.setIds = function(ids) {
		that.continuationIDs = ids;
	}
	this.updateContinuations = function() {
		vis.selectAll("g.node_" + toLeft + " text")
			.classed("continuation", function(d) {
					var isContinuation = overlap(d.info.ids, that.continuationIDs || {});
					return isContinuation;
			})
			.style("fill", function(d) {
				if (d3.select(this).classed("continuation")) {
					return continuationColor(d.info);
				}
				return "#444"; // default text color
			}); // this is duplicated from above, nodeUpdate
	}

	this.search = function(searchRE) {
		vis.selectAll("g.node text").classed("foundText", function(d) {
			var what = searchRE.test(nodeText(d.info));
			return what;
		})
	}

	this.clearSearch = function() {
		vis.selectAll("g.node text").classed("foundText", false);
	}

	this.showTokenExtras = function(show) {
		if (arguments.length == 0) {
			return showTokenExtra;
		}
		showTokenExtra = show;

		this.drawRects();
		return this;
	}

	this.setRectColor = function(rectColorFun) {
		if (arguments.length == 0) {
			return rectColor;
		}
		rectColor = rectColorFun;
		this.drawRects();
		return this;
	}

	// /////////////
	function positionX(x) {
		return toLeft ? width / 2 - x : width / 2 + x;
	}
	function positionY(y) {
		return y - dx;
	}

	// //default modifier handlers
	this.handleAltPress = function() {
	};
	this.handleShifttPress = function() {
	};
	this.handleClick = function() {
	};

	this.readJSONTree(data);
	return this;
}

// /////////////////////////////// tree sorting functions
/**
 * function to sort the nodes (case insenstive) by a field in the
 * information object
 * 
 * @param fld
 *            the field to sort by
 */
doubletree.sortByStrFld = function(fld) {
	var field = fld;
	return function(a, b) {
		var aUndefined = (undefined == a.info[field]);
		var bUndefined = (undefined == b.info[field]);
		if (aUndefined && bUndefined) {
			return 0;
		} else if (aUndefined) {
			return -1;
		} else if (bUndefined) {
			return 1;
		}
		var aVal = a.info[field].join(" ").toLowerCase();
		var bVal = b.info[field].join(" ").toLowerCase();
		if (aVal < bVal) {
			return -1;
		} else if (aVal > bVal) {
			return 1;
		}
		return 0;
	}
}
/**
 * function to sort the nodes according to the count field in the
 * information object
 */
doubletree.sortByCount = function() {
	return function(a, b) {
		return b.info.count - a.info.count;
	}
}

/**
 * function to sort the nodes according to the continuations field in the
 * information object
 */
doubletree.sortByContinuations = function() {
	return function(a, b) {
		return b.info.continuations - a.info.continuations;
	}
}

// /////////////////////////////// some tree filtering functions
/**
 * function to filter the nodes according to a minimum for the count field
 * 
 * @param n
 *            the minimum count to include
 */
doubletree.filterByMinCount = function(n) {
	return function(inf) {
		return inf.count >= n;
	};
}

/**
 * function to filter the nodes according to a maximum for the count field
 * 
 * @param n
 *            the maximum count to include
 */
doubletree.filterByMaxCount = function(n) {
	return function(inf) {
		return inf.count <= n;
	};
}

/**
 * function to filter the nodes according to the "POS" field (if it exists)
 * 
 * @param n
 *            a string for a regular expression of the POS values to include
 */
doubletree.filterByPOS = function(pos) {
	var re = new RegExp(pos);
	return function(inf) {
		return inf["POS"] && inf["POS"].filter(function(p) {
			return p.search(re) > -1;
		}).length > 0; // end of ng has no POS
	}
}

// /////////////////////////////// formatting functions

// doubletree.nodeText = function(info) {
// return doubletree.tokenText(info); //default
// }

// extracts a field
/**
 * return the value of a field in the provided information object
 * 
 * @param info
 *            the information object
 * @param the
 *            field to get
 * @returns the value of the field in the information object
 */
doubletree.fieldText = function(info, fieldName) {
	return info[fieldName];
}
// extracts the "token" field
/**
 * convenience function to return the value of the "token" field (if it
 * exists). The same as doubletree.fieldText(info, "token")
 * 
 * @param info
 *            the information object
 * @returns the value of the "token" field of the information object
 */
doubletree.tokenText = function(info) {
	var tokenText = '';
	if (info.token !== undefined) {
		tokenText = info.token;//info.token[0]; // don't return all token values, just the first
	}
	return tokenText;
}

/**
 * converts an information object to a string
 * 
 * @param the
 *            information object
 * @returns a string with one key/value pair per line
 */
doubletree.infoToText = function(info) {
	var what = "";
	for ( var infp in info) {
		if (infp == "ids" || infp == "origIDs") {
			what += infp + "\t:\t" + Object.keys(info[infp]).join(",")
					+ "\n";
		} else {
			what += (infp + "\t:\t" + info[infp] + "\n");
		}
	}
	return what;
}
// //////////////// internal utility functions

function old_pruneTree(tree, ids) {

	if (!tree.children) {
		return;
	}

	var n = tree.children.length;
	for ( var i = 0; i < n; i++) {
		var c = tree.children[i];

		if (containedIn(c.info.ids, ids)) {
			tree.children[i] = null;
		} else {
			old_pruneTree(c, ids);
		}
	}
	tree.children = tree.children.filter(function(c) {
		return c != null
	});

	// recalculate maxChildren
	var cMax = d3.max(tree.children.map(function(c) {
		return c.maxChildren;
	}));
	tree.maxChildren = Math.max(tree.children.length, cMax);
}

function new_pruneTree(tree, ids, copyIDs) {

	if (!tree.children) {
		return;
	}

	// copy over original ids
	if (copyIDs) {
		if (!tree.info.origIDs) {
			tree.info.origIDs = {};
			addTo(tree.info.origIDs, tree.info.ids);
			tree.info.origCount = Object.keys(tree.info.origIDs).length;
		} else {
			tree.info.ids = {};
			addTo(tree.info.ids, tree.info.origIDs);
			tree.info.count = Object.keys(tree.info.ids).length;
		}
	}

	// adjust IDs
	var idNums = Object.keys(ids)
	for ( var i = 0, n = idNums.length; i < n; i++) {
		var cid = idNums[i];
		delete tree.info.ids[cid];
	}
	tree.info.count = Object.keys(tree.info.ids).length;

	// recurse and prune
	var n = tree.children.length;
	for ( var i = 0; i < n; i++) {
		var c = tree.children[i];

		if (containedIn(c.info.ids, ids)) {
			tree.children[i] = null;
		} else {
			new_pruneTree(c, ids, false);
		}
	}
	tree.children = tree.children.filter(function(c) {
		return c != null
	});
	tree.info.continuations = tree.children.length;

	// recalculate maxChildren
	var cMax = d3.max(tree.children.map(function(c) {
		return c.maxChildren;
	}));
	tree.maxChildren = Math.max(tree.children.length, cMax);
}

function restoreTree(tree) {

	if (tree.info.origCount) { // otherwise tree was suppressed, so its ids
								// never got switched around
		// restore originals
		tree.info.ids = {};
		addTo(tree.info.ids, tree.info.origIDs);
		// delete tree.info.origIDs;
		tree.info.count = tree.info.origCount;
		// delete tree.info.origCount;

		var n = tree.children.length;
		tree.info.continuations = n;
		for ( var i = 0; i < n; i++) {
			var c = tree.children[i];
			restoreTree(c);
		}
	}

}

// do the keys in o1 and o2 overlap
function overlap(o1, o2) {
	for ( var k in o1) {
		if (k in o2) {
			return true;
		}
	}
	return false;
}
// are all the keys in o1 also in o2
function containedIn(o1, o2) {
	if (!o1 || !o2) {
		return false;
	}
	for ( var k in o1) {
		if (!(k in o2)) {
			return false;
		}
	}
	return true;
}

// add key/vals of o2 to o1 and return o1; (top level key-value only, o2
// values maintained over o1)
// same as in Trie.js
function addTo(o1, o2) {
	for ( var k in o2) {
		o1[k] = o2[k];
	}
}

function noOp() {
}

// ////////////////

})();
/* (This is the new BSD license.)
* Copyright (c) 2012-2014, Chris Culy
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*     * Redistributions of source code must retain the above copyright
*       notice, this list of conditions and the following disclaimer.
*     * Redistributions in binary form must reproduce the above copyright
*       notice, this list of conditions and the following disclaimer in the
*       documentation and/or other materials provided with the distribution.
*     * Neither the name of the Chris Culy nor the 
*		names of its contributors may be used to endorse or promote 
*		products from this software without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY Chris Culy
* ``AS IS'' AND ANY OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, 
* THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE 
* ARE DISCLAIMED. IN NO EVENT SHALL Chris Culy
* BE LIABLE FOR ANY, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR 
* CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE 
* GOODS OR SERVICES; OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
* CAUSED AND ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR 
* TORT INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF 
* THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

"use strict";
var doubletree = doubletree || {};

(function(){
    
    /**
     * @class doubletree.Trie
     * This is the class for the specialized trie that is the data for {@link doubletree.DoubleTree}.
 * The Trie will get pieces of data that contain fields. Some (possibly all) of those fields will be used for distinguishing among items.
 * For example, we might have an "author" field, but not use it when distinguishing among items for the Trie.
 * @param caseSensitive are the elements in the first distinguishing field compared in a case sensitive fashion
 * @param fldNames the names of the fields
 * @param fldDelim the field delimiter
 * @distinguishingFldsArray the distinguishing fields
 * @undistinguishedRoot true if the root should be calculated without using the distinguishing fields
 */
doubletree.Trie = function(caseSensitive, fldNames, fldDelim, distinguishingFldsArray, undistinguishedRoot) {
    var endNG = " ";
    var rootName = "_root_";
    var noCase = (! caseSensitive) && true;
    if (! fldNames) {
        fldNames = ["item"];
    }
    var fieldNames = fldNames;
    if (! fieldDelim) {
        fieldDelim = "\t"; //default
    }
    var fieldDelim = fldDelim;
    if (! distinguishingFieldsArray) {
        distinguishingFieldsArray = [ fieldNames[0] ];
    }
    var distinguishingFieldsArray = distinguishingFldsArray;
    var undistinguishedRt = undistinguishedRoot;
    if (undefined == undistinguishedRt) {
        undistinguishedRt = true; //TBD: check to make sure this doesn't break anything
    }
    
    var trie = new TrieNode(rootName,-1,0);
    
    /** @private */
    function TrieNode(item, id, count) {
        this.id = id;
        this.count = count;        
        this.info = {"count":count, "ids":{}};
        
        if (item == null) {
            this.item = rootName;        
        } else {
            this.item = item;
            this.info.ids = {};
            this.info.ids[id] = true;
            var flds = item.split(fieldDelim);
            for(var i in flds) {
                this.info[ fieldNames[i] ] = [ flds[i] ];
            }
        }
        this.nodes = {};
        
         /** @private */
        this.addNgram = function(itemArray, id, count) {
            if (! count) {
                count = 1;
            }
            var thisItem, thisKey;
            if (itemArray.length > 0) {
                thisItem = itemArray.shift();
                    
                var theseFlds = thisItem.split(fieldDelim);

                if (undistinguishedRt && this.item == rootName) {
                    thisKey = "";
                } else {
                    thisKey = theseFlds.filter(function(f,i) {
                            return distinguishingFieldsArray.indexOf( fieldNames[i] ) > -1;
                        })
                    .map(function(f) {
                            if (noCase) {
                                return f.toLocaleLowerCase();
                            }
                            return f;
                        })
                    .join(fieldDelim);
                }
                
            } else {
                thisItem = endNG;
                thisKey = thisItem;
            }
            
            var subTrie;
            if (thisKey in this.nodes && this.nodes[thisKey] instanceof TrieNode) { //we need the instanceof TrieNode so we can override Object properties -- hope that none are already arrays
                subTrie = this.nodes[thisKey];
                subTrie.info.count += count;
                subTrie.info.ids[id] = true;
                
                for(var f in theseFlds) {
                    var thisFld = theseFlds[f];
                    if (subTrie.info[ fieldNames[f] ].indexOf( thisFld ) == -1 ){
                        subTrie.info[ fieldNames[f] ].push(thisFld);
                    }                
                }
                
                
            } else {
                subTrie = new TrieNode(thisItem, id, count);            
                this.nodes[thisKey] = subTrie;
            }
            if (thisItem != endNG) {
                subTrie.addNgram(itemArray,id, count);
            }
        }
            
         /** @private */
        this.getUniqRoot = function() {
            if (this.item == rootName) {
                var children = Object.keys(this.nodes);
                if (children.length == 1) {
                    return this.nodes[ children[0] ];
                }
            }
        
            return this;
        }
        
        /** @private */
        this.toTree = function(filterFuns) {
            
            function toTreeHelper(filterFuns, descendentLevel, trieData) {
                
                var what = {"children":[]};
                what.name = trieData.item;
                what.info = {};
                for(var k in trieData.info) {
                    if (typeof(trieData.info[k]) === 'Object') {
                        what.info[k] = {};
                        for(var k2 in trieData.info[k]) {
                            what.info[k][k2] = this.info[k][k2];
                        }
                    } else {
                        what.info[k] = trieData.info[k];
                    }
                }
                what.pruned = {};
                
                
                for(var item in trieData.nodes) {
                    var itemNode = trieData.nodes[item];
                    var thisFilter = filterFuns[descendentLevel];            
                    if ( ! thisFilter || (thisFilter && thisFilter(itemNode.info)) ) {
                        what.children.push( toTreeHelper(filterFuns, descendentLevel +1, itemNode) );
                        if (itemNode.pruned != {}) {
                            addTo(what.pruned, itemNode.pruned);
                        }
                    } else {
                        addTo(what.pruned, itemNode.info.ids);
                    }
                }
        
                what.info.continuations = what.children.length;
                //this is to record info we need for sizing the tree, since D3 automatically scales to fit, which is not what we want
                //we also need to keep track of the minimum count (the root always has the max, of course), for scaling
                if (what.children.length == 0) {
                   what.children = null; //the trees expect null if there are no children, not the empty array. Odd, but true.
                   what.maxChildren = 0;
                   
                   if (what.name) {
                    what.maxLen = what.name.length;
                   } else {
                    what.maxLen = 0;
                   }
                   
                   what.minCount = what.info.count;
                   //what.maxChildren = 0; //new
                   
                } else {
                    var cMax = d3.max( what.children.map(function(c) {return c.maxChildren;}) );
                    what.maxChildren = Math.max(what.children.length, cMax);
                    
                    var maxLen = d3.max( what.children.map(function(c) {return c.maxLen;}));
                    what.maxLen = Math.max(maxLen, what.name.length);
                    
                    what.minCount = d3.min( what.children.map(function(c) {return c.minCount;})); //the children are always <= the parent
                }
                return what;
            }
            
            if (! filterFuns ) {
                filterFuns = [];
            }
            
            var trieData = JSON.parse(JSON.stringify(this)); //CuC make a copy of the data, to keep the real trie immutable
        
            return toTreeHelper(filterFuns, 0, trieData);
        }
    }
    
    
    
    
    /**
     * Add an ngram to the Trie
     * @param itemArray an array of delimited items (the ngrams)
     * @param id an id for this ngram 
     * @param count a count for this ngram. Default is 1
     */
    this.addNgram = function(itemArray, id, count) {trie.addNgram(itemArray, id, count);};
    
    /**
     * get the unique root of this Trie. Used only by {@link DoubleTree}
     * @returns a new Trie with a unique item as the root
     */
    this.getUniqRoot = function() {
        var what = new doubletree.Trie((!noCase), fieldNames, fieldDelim, distinguishingFieldsArray);
        what.trie( trie.getUniqRoot() );
        return what;
    };
    
    /**
     * convert the Trie to a tree structure for display. Used only by {@link DoubleTree}
     * @param filterFuns the filtering functions to apply to the tree see {@link DoubleTree.filters}
     * @param descendentLevel the current level we are filtering
     * @returns the tree
     */
    this.toTree = function(filterFuns, descendentLevel) {return trie.toTree(filterFuns, descendentLevel);};
    
    /**
     * serialize the Trie as a JSON string
     * @returns the JSON string representation of the Trie
     */
    this.serialize = function() {
        return JSON.stringify(this);
    }
    
    /**
     * make this Trie have the values of a previously serialized Trie see {@link #serialize}
     */
    this.deserialize = function(serialized) {
        var obj = JSON.parse(serialized);
        
        endNG = obj.endNG();
        rootName = obj.rootName();
        noCase = obj.caseSensitive();
        fieldNames = obj.fieldNames();
        fieldDelim = obj.fieldDelim();
        distinguishingFieldsArray = obj.distinguishingFieldsArray();
        trie = obj.trie();
        
    }
    
    //getters -- the properties are readonly, set in constructor
    
    //private, only used in deserialization
    /** @private */
    this.endNG = function() {
        return endNG;
    }
    //private, only used in deserialization
    /** @private */
    this.rootName = function() {
        return rootName;
    }
    
    //private, also a setter, only used in deserialization and getUniqRoot;
    /** @private */
    this.trie = function(value) {
      if (arguments.length > 0) {
        trie = value;
      }
      return trie;
    }
    
    /**
     * @returns whether this Trie uses case sensitive comparison
     */
    this.caseSensitive = function() {
        return ! noCase;
    }
    
    /**
     * get the field names in the data
     * @returns the field names in the data
     */
    this.fieldNames = function() {
        return fieldNames;
    }
    
    /**
     * get the field delimiter for the data
     * @returns the field delimiter for the data
     */
    this.fieldDelim = function() {
        return fieldDelim;
    }
    
    /**
     * get the distinguishing fields for the data
     * @returns the distinguishing fields for the data
     */
    this.distinguishingFieldsArray = function() {
        return distinguishingFieldsArray;
    }
    
    //add key/vals of o2 to o1 and return o1; (top level key-value only, o2 values maintained over o1)
    /** @private */
    function addTo(o1, o2) {
        for(var k in o2) {
            o1[k] = o2[k];
        }
    }

    
}  

})();

Ext.define('Voyant.util.Api', {
	constructor: function(config) {
		var apis = [];
		if (!this.isApplication) {
			var app = this.getApplication ? this.getApplication() : Voyant.application;
			
			// try to load from first-level mixins
			if (this.mixins) {
				for (key in this.mixins) {
					var clz = Ext.ClassManager.get(key);
					if (clz && clz.api) {
						apis.splice(0, 0, clz.api)
					}
				}
			}
			this.addParentApi(apis, Ext.ClassManager.getClass(app)); // gather class params
			if (app.getApiParams) {
				apis.push(app.getApiParams()); // now add instance params, last
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
			if (clazz.i18n[key]) {
				use = clazz.i18n[key];
			}
			/*
			if (config && config.lang && clazz.i18n[key][config.lang]) {
				use = clazz.i18n[key][config.lang];
			}
			else if (clazz.i18n[key][Voyant.util.Localization.LANGUAGE]) {
				use = clazz.i18n[key][Voyant.util.Localization.LANGUAGE];
			}
			else if (clazz.i18n[key][Voyant.util.Localization.DEFAULT_LANGUAGE]) {
				use = clazz.i18n[key][Voyant.util.Localization.DEFAULT_LANGUAGE];
			}
			*/
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

//		var deferred = jQuery.Deferred();
		var deferred = new Ext.Deferred();
		
		var pomise = deferred
		// transfer methods to the promise
//		var promise = this.getPromiseFromDeferred(deferred);

		if (transferable && transferable.transfer) {
			transferable.transfer(transferable, deferred.promise)
		}
		
		if (!deferred.promise.show && window.show) {deferred.promise.show=show}

		this.deferredStack.push(deferred);
		
		var me = this;
		deferred.promise.always(function() {
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
		})/*.fail(function() {
			dfd.reject.apply(this, arguments)
		})*/;
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
	 * @private
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
			moreTools.push({xtype: 'menuseparator'});
		}
		if (this.getApplication().getMoreTools) {
			moreTools = moreTools || [];
			var app = this.getApplication();
			var tools = app.getMoreTools();
			tools.forEach(function(category) {
				var categories = [];
				category.items.forEach(function(xtype) {
					categories.push(this.getMenuItemFromXtype(xtype))
				}, this)
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
							title: panel.localize("optionsTitle"),
							modal: true,
			            	panel: panel,
							items: {
								xtype: 'form',
								items: panel.getOptions(),
								listeners: {
									afterrender: function(form) {
										var api = panel.getApiParams(form.getForm().getFields().collect('name'));
										form.getForm().setValues(api);
									}
								},
								buttons: [{
					            	text: panel.localize("reset"),
									glyph: 'xf0e2@FontAwesome',
					            	flex: 1,
					            	panel: panel,
						            ui: 'default-toolbar',
					        		handler: function(btn) {
					        			if (this.mixins && this.mixins["Voyant.util.Api"]) {
					        				this.mixins["Voyant.util.Api"].constructor.apply(this);
					        				if (this.getCorpus && this.getCorpus()) {
					        					this.fireEvent("loadedCorpus", this, this.getCorpus())
					        				}
					        			}
					        			btn.up('window').close();
					        		},
					        		scope: panel
								
								},{xtype: 'tbfill'}, {
					            	text: panel.localize("cancelTitle"),
						            ui: 'default-toolbar',
					                glyph: 'xf00d@FontAwesome',
					        		flex: 1,
					        		handler: function(btn) {
					        			btn.up('window').close();
					        		}
								},{
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
					        				if (corpus) {
					        					app.dispatchEvent("loadedCorpus", this, corpus);
					        					
						        				// events aren't sent to owning panels, so fire locally too
					        					this.fireEvent("loadedCorpus", this, corpus);
					        				}
					        				
					        				
					        			}
					        			
					        			// fire this even if we have global stopwords since the app dispatch won't reach this tool
				        				if (corpus) {this.fireEvent("loadedCorpus", this, corpus);}

					        			btn.up('window').close();
					        		},
					        		scope: panel
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
			if (header && Ext.os.deviceType=="Desktop") {
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
		var items = window.location.hostname=='beta.voyant-tools.org' ? [{html: "<p class='keyword' style='text-align: center; font-weight: bold; padding: 4px;'>Please note that this is the beta server and you should not count on corpora persisting (for bookmarks, embedding, etc.)."}] : [];
		items.push({
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
		})
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
		
		var draw = this.down('draw');
		if (draw) {
			return this.exportPngData(draw.getImage().data);
		}
		
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
		var api = this.isXType('voyantheader') ? this.getApplication().getModifiedApiParams() : this.getModifiedApiParams();
		if (!this.isXType('voyantheader')) {api.view=Ext.getClassName(this).split(".").pop()}
		if (!api.corpus) {
			api.corpus = this.getApplication().getCorpus().getAliasOrId();
		}
		return this.getApplication().getBaseUrl()+'?'+Ext.Object.toQueryString(api);
	},
	helpToolClick: function(panel) {
		if (panel.isXType('voyanttabpanel')) {panel = panel.getActiveTab()}
		var help = panel.localize('help', {"default": false}) || panel.localize('helpTip');
		if (help==panel._localizeClass(Ext.ClassManager.get("Voyant.util.Toolable"), "helpTip")) {
			panel.openUrl( panel.getBaseUrl()+"docs/#!/guide/" + panel.getXType());
		}
		else {
			Ext.Msg.alert(panel.localize('title'), help +"<p><a href='"+panel.getBaseUrl()+
					"docs/"+ (panel.isXType('voyantheader') ? '' : "#!/guide/"+panel.getXType()) +"' target='voyantdocs'>"+panel.localize("moreHelp")+"</a></p>")
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
			
			var queryParams = Ext.Object.fromQueryString(document.location.search);
			var url = this.getApplication().getBaseUrl();
			url += '?corpus='+corpus.getAliasOrId();
			url += '&view='+xtype;
			for (var key in queryParams) {
				if (key !== 'corpus' && key !== 'view') {
					url += '&'+key+'='+queryParams[key];
				}
			}
			window.history.pushState({
				corpus: corpus.getAliasOrId(),
				view: xtype
			}, '', url);
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
		this.getApplication().dispatchEvent('panelChange', this)
	}
});

// from http://www.sencha.com/forum/showthread.php?281658-add-dropdown-menu-to-panel-tool&p=1054579&viewfull=1#post1054579
// and http://www.sencha.com/forum/showthread.php?281953-Glyphs-in-panel-tool&p=1068934&viewfull=1#post1068934

Ext.define('Voyant.util.ToolMenu', {
    extend: 'Ext.panel.Tool',
    alias: 'widget.toolmenu',
    renderTpl: ['<div class="x-menu-tool-hover">' + '</div>'+
            '<tpl if="glyph">' + 
            '<span id="{id}-toolEl" class="{baseCls}-glyph {childElCls}" role="presentation" style="font-family: {glyphFontFamily}; '+
            	'<tpl if="Ext.isSafari || (Ext.isWebKit && Ext.os.name==\'iOS\')">'+ // FIXME: this is an awful hack..
            		'margin-right: 15px; '+
            	'</tpl>'+
            '">&#{glyph}</span>' + 
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
Ext.define("Voyant.util.Downloadable", {
	mixins: ['Voyant.util.Localization'],
	statics: {
		i18n: {
		}
	},

	downloadFromCorpusId: function(corpusId) {
		var panel = this;
		Ext.create('Ext.window.Window', {
			title: this.localize('exportTitle'),
			modal: true,
			items: {
				xtype: 'form',
				items: {xtype: 'downloadoptions'},
				listeners: {
					afterrender: function(form) {
						// make sure defaults are set based on panel's API
						form.getForm().setValues(panel.getApiParams(['documentFilename','documentFormat']));
						
					}
				},
				buttons: [{
	            	text: this.localize("cancelButton"),
	                glyph: 'xf00d@FontAwesome',
	        		flex: 1,
		            ui: 'default-toolbar',
	        		handler: function(btn) {
	        			btn.up('window').close();
	        		}
				},{
	            	text: this.localize('downloadButton'),
					glyph: 'xf00c@FontAwesome',
	            	flex: 1,
	        		handler: function(btn) {
	        			var values = btn.up('form').getValues();
	        			panel.setApiParams(values);
	        			panel.openDownloadCorpus(corpusId);
	        			btn.up('window').close();
	        		},
	        		scope: this
	            }]
			},
			bodyPadding: 5
		}).show()
	},
	
    openDownloadCorpus: function(corpusId) {
		var url = this.getTromboneUrl()+"?corpus="+corpusId+"&tool=corpus.CorpusExporter&outputFormat=zip"+
			"&zipFilename=DownloadedVoyantCorpus-"+corpusId+".zip"+
			(this.getApiParam("documentFormat") ? "&documentFormat="+this.getApiParam("documentFormat") : '')+
			(this.getApiParam("documentFilename") ? "&documentFilename="+this.getApiParam("documentFilename") : '')
		this.openUrl(url)
    }
})
Ext.define("Voyant.notebook.util.Show", {
	transferable: ['show'],
	show: function() { // this is for instances
		show.apply(this, arguments);
	},
	statics: {
		show: function(contents) {
			if (this.then) {
				this.then(function(val) {
					show.apply(val, arguments);
				})
			} else {
				contents = contents.getString ? contents.getString() : contents.toString();
				if (Voyant.notebook.util.Show.SINGLE_LINE_MODE==false) {contents="<div class='"+Voyant.notebook.util.Show.MODE+"'>"+contents+"</div>";}
				Voyant.notebook.util.Show.TARGET.insertHtml('beforeEnd',contents);
			}
		},
		showError: function(error, more) {
			debugger
			var mode = Voyant.notebook.util.Show.MODE;
			Voyant.notebook.util.Show.MODE='error';
			
			if (this instanceof Voyant.util.ResponseError) {
				error = this;
			}
			if (error instanceof Voyant.util.ResponseError) {
				if (console) {console.error(error.getResponse())}
				more = error.getResponse().responseText
				error = error.getMsg();
			}
			
			else {

				if (error.stack && !more) {more=error.stack}
				if (more && Ext.isString(more)===false) {more=more.toString()}
				
			}

			if (console) {console.error(error)}
			if (more) {
				if (console) {console.error(more);}
				error="<h3>"+error.toString()+"</h3><pre>"+Ext.String.htmlEncode(more)+'</pre>';
			}
			show(error);
			Voyant.notebook.util.Show.MODE = mode;
		},
		TARGET : null,
		MODE: 'info',
		SINGLE_LINE_MODE : false
	}
});

var show = Voyant.notebook.util.Show.show;
var showError = Voyant.notebook.util.Show.showError;

Ext.define("Voyant.notebook.util.Embed", {
	transferable: ['embed'],
	embed: function() { // this is for instances
		embed.apply(this, arguments);
	},
	statics: {
		i18n: {},
		embed: function(cmp, config) {
			if (this.then) {
				this.then(function(embedded) {
					embed.call(embedded, cmp, config)
				})
			} else if (Ext.isArray(cmp)) {
				Voyant.notebook.util.Show.SINGLE_LINE_MODE=true;
				show("<table><tr>");
				for (var i=0; i<arguments.length; i++) {
					var unit = arguments[i];
					show("<td>")
					unit[0].embed.call(unit[0], unit[1], unit[2]);
					show("</td>")
				}
				show("</tr></table>")
				Voyant.notebook.util.Show.SINGLE_LINE_MODE=false;
				return
			} else {
				// use the default (first) embeddable panel if no panel is specified
				if (this.embeddable && (!cmp || Ext.isObject(cmp))) {
					// if the first argument is an object, use it as config instead
					if (Ext.isObject(cmp)) {config = cmp;}
					cmp = this.embeddable[0];
				}
				if (Ext.isString(cmp)) {
					cmp = Ext.ClassManager.getByAlias('widget.'+cmp) || Ext.ClassManager.get(cmp);
				}
				var isEmbedded = false;
				if (Ext.isFunction(cmp)) {
					var name = cmp.getName();
					if (this.embeddable && Ext.Array.each(this.embeddable, function(item) {
							if (item==name) {
								config = config || {};
								var embeddedParams = {};
								for (key in Ext.ClassManager.get(Ext.getClassName(cmp)).api) {
									if (key in config) {
										embeddedParams[key] = config[key]
									}
								}
								if (!embeddedParams.corpus) {
									if (Ext.getClassName(this)=='Voyant.data.model.Corpus') {
										embeddedParams.corpus = this.getId();
									} else if (this.getCorpus) {
										embeddedParams.corpus = this.getCorpus().getId();
									}
								}
								Ext.applyIf(config, {
									style: 'width: '+(config.width || '90%') + (Ext.isNumber(config.width) ? 'px' : '')+
										'; height: '+(config.height  || '400px') + (Ext.isNumber(config.height) ? 'px' : '')
								});
								delete config.width;
								delete config.height;
								
								if (document.location.search.indexOf("debug=true")>-1) {
									embeddedParams.debug=true
								}
								var embeddedConfigParam = Ext.Object.toQueryString(embeddedParams);
								var tpl = new Ext.XTemplate('<iframe style="'+config.style+'" '+
										'src="'+Voyant.application.getBaseUrl()+"tool/"+name.substring(name.lastIndexOf(".")+1)+'/?{0}"></iframe>');
								if (embeddedConfigParam.length<1950) {
									show(tpl.apply(["minimal=true&"+embeddedConfigParam]));
								} else {
					    	    	Ext.Ajax.request({
					    	    	    url: Voyant.application.getTromboneUrl(),
					    	    	    params: {
					    	        		tool: 'resource.StoredResource',
					    	        		storeResource: embeddedConfigParam
					    	    	    }
					    	    	}).then(function(response) {
				    	    	    	var json = Ext.util.JSON.decode(response.responseText);
										show(tpl.apply(["minimal=true&embeddedConfig="+json.storedResource.id]));
					    	    	}).otherwise(function(response) {
					    	    		showError(response)
					    	    	})
								}
								isEmbedded = true;
								return false;
							}
						}, this)===true) {
						Voyant.notebook.util.Embed.showWidgetNotRecognized.call(this);
					}
				}
				if (!isEmbedded) {
					Voyant.notebook.util.Embed.showWidgetNotRecognized.call(this);
				}
			}
		},
		showWidgetNotRecognized: function() {
			var msg = Voyant.notebook.util.Embed.i18n.widgetNotRecognized;
			if (this.embeddable) {
				msg += Voyant.notebook.util.Embed.i18n.tryWidget+'<ul>'+this.embeddable.map(function(cmp) {
					var widget = cmp.substring(cmp.lastIndexOf(".")+1).toLowerCase()
					return "\"<a href='"+Voyant.application.getBaseUrl()+"/docs/#!/guide/"+widget+"' target='voyantdocs'>"+widget+"</a>\""
				}).join(", ")+"</ul>"
			}
			showError(msg)
		}

	}
})

embed = Voyant.notebook.util.Embed.embed
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
        ],

        getDocIndex: function() {return this.get("docIndex")},
        getLeft: function() {return this.get("left")},
        getMiddle: function() {return this.get("middle")},
        getHighlightedMiddle: function() {return "<span class='keyword'>"+this.getMiddle()+"</span>"},
        getRight: function() {return this.get("right")},
        getHighlightedContext: function() {return this.getLeft()+this.getHighlightedMiddle()+this.getRight();}
	
});
Ext.define('Voyant.data.model.CorpusFacet', {
    extend: 'Ext.data.Model',
    fields: [
             {name: 'facet'},
             {name: 'label'},
             {name: 'inDocumentsCount', type: 'int'}
    ],
    getLabel: function() {
    	return this.get('label')
    },
    getFacet: function() {
    	return this.get('facet')
    },
	getInDocumentsCount: function() {
		return this.get('inDocumentsCount')
	}
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
/**
 * Corpus Term
 */
Ext.define('Voyant.data.model.CorpusTerm', {
    extend: 'Ext.data.Model',
    fields: [
             {name: 'id'},
             {name: 'rawFreq', type: 'int'},
             {name: 'inDocumentsCount', type: 'int'},
             {name: 'relativeFreq', type: 'float'},
             {name: 'relativePeakedness', type: 'float'},
             {name: 'relativeSkewness', type: 'float'},
             {name: 'distributions'},
             {name: 'typeTokenRatio-lexical', type: 'float', calculate:  function(data) {
        	 	return data['typesCount-lexical']/data['tokensCount-lexical'];
             }}
    ],
    
    /**
     * Get the term.
     * @returns {String} Returns the term.
     */
    getTerm: function() {
    	return this.get('term');
    },
    
    /**
     * Get the term's raw frequency.
     * @returns {Number} Returns the term's frequency.
     */
	getRawFreq: function() {
		return parseInt(this.get('rawFreq'));
	},
	
	getInDocumentsCount: function() {
		return parseInt(this.get('inDocumentsCount'));
	},
	
	getDistributions: function() {
		return this.get('distributions');
	},
	
	/**
	 * Show a one line summary of this term.
	 */
	show: function(config) {
		show(this.getString(config))
	},
	
	getString: function() {
		return this.getTerm()+": "+this.getRawFreq();
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
             {name: 'lastTokenStartOffset-lexical', type: 'int'},
             {name: 'title'},
             {name: 'language', convert: function(data) {return Ext.isEmpty(data) ? '' : data;}}
    ],
    
    getLexicalTokensCount: function() {
    	return this.get('tokensCount-lexical')
    },
    
    getLexicalTypeTokenRatio: function() {
    	return this.get('typeTokenRatio-lexical')
    },
    
    loadDocumentTerms: function(config) {
		if (this.then) {
			return Voyant.application.getDeferredNestedPromise(this, arguments);
		} else {
			var dfd = Voyant.application.getDeferred(this);
			config = config || {};
			if (Ext.isNumber(config)) {
				config = {limit: config};
			}
			Ext.applyIf(config, {
				limit: 0
			})
			var documentTerms = this.getDocumentTerms();
			documentTerms.load({
				params: config,
				callback: function(records, operation, success) {
					if (success) {
						dfd.resolve(documentTerms)
					} else {
						dfd.reject(operation)
					}
				}
			})
			return dfd.promise
		}
    	
    },
    
    loadTokens: function(config) {
		if (this.then) {
			return Voyant.application.getDeferredNestedPromise(this, arguments);
		} else {
			var dfd = Voyant.application.getDeferred(this);
			config = config || {};
			if (Ext.isNumber(config)) {
				config = {limit: config};
			}
			Ext.applyIf(config, {
				limit: 0
			})
			var tokens = this.getTokens(config);
			tokens.load({
				params: config,
				callback: function(records, operation, success) {
					if (success) {
						dfd.resolve(tokens)
					} else {
						dfd.reject(operation)
					}
				}
			})
			return dfd.promise
		}
    	
    },
    
    getTokens: function(config) {
		if (this.then) {
			return Voyant.application.getDeferredNestedPromise(this, arguments);
		} else {
	    	config = config || {};
	    	Ext.applyIf(config, {
	    		proxy: {}
	    	});
	    	Ext.applyIf(config.proxy, {
	    		extraParams: {}
	    	})
	    	Ext.applyIf(config.proxy.extraParams, {
	    		docIndex: this.get('index')
	    	})
	    	Ext.apply(config, {
	    		docId: this.get('id')
	    	});
	    	return this.get('corpus').getTokens(config);
//	    	return new Voyant.data.store.Tokens(config);
		}
    },

    getDocumentTerms: function(config) {
		if (this.then) {
			return Voyant.application.getDeferredNestedPromise(this, arguments);
		} else {
	    	config = config || {};
	    	Ext.applyIf(config, {
	    		proxy: {}
	    	});
	    	Ext.applyIf(config.proxy, {
	    		extraParams: {}
	    	})
	    	Ext.applyIf(config.proxy.extraParams, {
	    		docIndex: this.get('index')
	    	})
	    	if (config.corpus) {
	    		return config.corpus.getDocumentTerms(config);
	    	}
	    	return this.get('corpus').getDocumentTerms(config); // FIXME: when does this happen?
		}
    },
    
    getIndex: function() {
    	return this.get('index');
    },
    
    getId: function() {
    	return this.get('id');
    },
    
    getFullLabel: function() {
    	var author = this.getAuthor();
    	return this.getTitle() + (author ? "("+author+")" : ''); // TODO: complete full label
    },
    
    getTitle: function() {
    	var title = this.get('title');
    	if (title === undefined) title = '';
    	title = Ext.isArray(title) ? title.join("; ") : title;
    	title = title.trim().replace(/\s+/g, ' '); // remove excess whitespace
    	return title;
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
  		return string;
    	
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
    
    getAuthor: function() {
    	var author = this.get('author') || "";
    	author = Ext.isArray(author) ? author.join("; ") : author;
    	author = author.trim().replace(/\s+/g, ' ');
    	return author;
    },
    
    getCorpusId: function() {
    	return this.get('corpus');
    },
    
    isPlainText: function() {
    	if (this.get("extra.Content-Type") && new RegExp("plain","i").test(this.get("extra.Content-Type"))) {
    		return true
    	}
    	return false;
    },
    
    show: function() {
    	show(this.getFullLabel())
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
    getDistributions: function() {return this.get("distributions")},
    getDocIds: function() {return this.get("docIds")}
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
    getDocIndex: function() {return this.get('docIndex')},
    getRawFreq: function() {return this.get('rawFreq')},
    getDistributions: function() {return this.get('distributions')}
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
    				docIndex: parseInt(parts[1]),
    				position: parseInt(parts[2])
    			};
    		}
    	}
    },
	isWord: function() {
		return this.getTokenType()=='lexical'; // maybe something else later?
	},
	isStopword: function() {
		return this.get("stopword")=="true";
	},
	getTokenType: function() {
		return this.get("tokenType");
	},
	getId: function() {
		return ["",this.getDocIndex(),this.getPosition()].join("_");
	},
	getDocIndex: function() {
		return this.get("docIndex");
	},
	getDocId: function() {
		return this.get("docId");
	},
	getTerm: function() {
		return this.get("term");
	},
	getTermWithLineSpacing: function(isPlainText) {
		var term = this.getTerm().replace(/<\/?\w+\b.*?>/g, "<br /><br />").replace(/>\s+</g,"><").replace(/<br \/><br \/>(<br \/>)+/g,"<br \/><br \/>");
		if (isPlainText) {term = term.replace(/(\r\n|\r|\n)\s*/g,"<br />");};
		return term;
	},
	getPosition: function() {
		return this.get("position");
	},
	getDocumentRawFreq: function() {
		return this.get("rawFreq");
	}
});
Ext.define('Voyant.data.store.VoyantStore', {
	mixins: ['Voyant.util.Localization'],
	config: {
		corpus: undefined,
		parentPanel: undefined
	},
	constructor: function(config, extras) {
		var me = this;
		config = config || {};
		Ext.applyIf(config, {
			remoteSort: true,
			autoLoad: false,
//			listeners: {
//				beforeload: function(store, operation) {
//					var parent = this.getParentPanel();
//					if (parent !== undefined) {
//						var params = parent.getApiParams();
//						operation = operation ? (operation===1 ? {} : operation) : {};
//						operation.params = operation.params || {};
//						for (var key in params) {
//							operation.params[key] = params[key];
//						}
//					}
//				}
//			},
//			scope: this,
			// define buffered configuration even if ignored when this isn't a buffered store
			pagePurgeCount : 0, // don't purge any data
			pageSize : 100, // each request is more intenstive, so do fewer of them then default
			leadingBufferZone : 200 // stay two pages ahead
		});
		config.proxy = config.proxy || {};
		Ext.applyIf(config.proxy, {
			type: 'ajax',
			url: Voyant.application.getTromboneUrl(),
			actionMethods: {read: 'POST'},
			reader: {
				type: 'json',
				rootProperty: extras['proxy.reader.rootProperty'],
				totalProperty: extras['proxy.reader.totalProperty'],
				metaProperty: extras['proxy.reader.metaProperty'] || 'metaData'
			},
			simpleSortMode: true,
			listeners: {
				exception: function(proxy, request, operation) {
					if (me.parentPanel && me.parentPanel.showError) {
						me.parentPanel.showError(new Voyant.util.ResponseError({response: request}))
					}
				}
			}
		})
		config.proxy.extraParams = config.proxy.extraParams || {};
		Ext.applyIf(config.proxy.extraParams, {
			tool: extras['proxy.extraParams.tool']
		});
		
		if (config.parentPanel !== undefined) {
			Ext.applyIf(config.proxy.extraParams, {
				forTool: config.parentPanel.xtype
			});
			this.setParentPanel(config.parentPanel);
			config.parentPanel.on("loadedCorpus", function(src, corpus) {
				this.setCorpus(corpus);
			}, this);
			config.listeners = config.listeners || {};
			config.listeners.beforeload = {
					fn: function(store, operation) {
						var parent = this.getParentPanel(), proxy = store.getProxy();
						if (parent !== undefined) {
							var params = parent.getApiParams();
							operation = operation ? (operation===1 ? {} : operation) : {};
							operation.params = operation.params || {};
							for (var key in params) {
								if (proxy) { // also set proxy for automatic buffering calls
									proxy.setExtraParam(key, params[key]);
								}
								operation.params[key] = params[key];
							}
						}
					},
					scope: this
					
			}
		}
		
		Ext.apply(this, config);
	},
	setCorpus: function(corpus) {
		if (corpus && this.getProxy && this.getProxy()) {
			this.getProxy().setExtraParam('corpus', Ext.isString(corpus) ? corpus : corpus.getId());
		}
		this.callParent(arguments);
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

Ext.define('Voyant.data.store.ContextsMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: 'Voyant.data.model.Context',
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.DocumentContexts',
			'proxy.reader.rootProperty': 'documentContexts.contexts',
			'proxy.reader.totalProperty': 'documentContexts.total'
		}])
	}
});

Ext.define('Voyant.data.store.Contexts', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.ContextsMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.ContextsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.ContextsBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.ContextsMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.ContextsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});
Ext.define('Voyant.data.store.CorpusCollocatesMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: 'Voyant.data.model.CorpusCollocate',
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.CorpusCollocates',
			'proxy.reader.rootProperty': 'corpusCollocates.collocates',
			'proxy.reader.totalProperty': 'corpusCollocates.total'
		}])
	}
});

Ext.define('Voyant.data.store.CorpusCollocates', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.CorpusCollocatesMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.CorpusCollocatesMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.CorpusCollocatesBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.CorpusCollocatesMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.CorpusCollocatesMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});
Ext.define('Voyant.data.store.CorpusFacetsMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: Voyant.data.model.CorpusFacet,
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.CorpusFacets',
			'proxy.reader.rootProperty': 'corpusFacets.facets',
			'proxy.reader.totalProperty': 'corpusFacets.total'
		}])
	}
});

Ext.define('Voyant.data.store.CorpusFacets', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.CorpusFacetsMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.CorpusFacetsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.CorpusFacetsBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.CorpusFacetsMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.CorpusFacetsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.CorpusTermsMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: Voyant.data.model.CorpusTerm,
//    statics: {
//    	i18n: {
//    		getString: "This store has {0} terms with a total of {1} occurrences."
//    	}
//    },
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.CorpusTerms',
			'proxy.reader.rootProperty': 'corpusTerms.terms',
			'proxy.reader.totalProperty': 'corpusTerms.total'
		}])
	},

	show: function(config) {
		show(this.getString(config))
	}

});

/**
 * Corpus Terms store.
 */
Ext.define('Voyant.data.store.CorpusTerms', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.CorpusTermsMixin'],
	
	/**
	 * @method each
	 * Iterate over each {@link Voyant.data.model.CorpusTerm corpus term} in this store.
	 * 
	 * 	new Corpus("Hello Voyant!").loadCorpusTerms().then(function(corpusTerms) {
	 * 		corpusTerms.each(function(corpusTerm) {
	 * 			corpusTerm.show();
	 * 		});
	 * 	});
	 * 
	 * @param {function} function The function to call for each corpus term.
	 */
	
	/**
	 * @method show
	 * Shows a one line summary of the corpus terms.
	 * 
	 * 	new Corpus("Hello Voyant!").loadCorpusTerms().then(function(corpusTerms) {
	 * 		corpusTerms.show();
	 * 	});
	 */
	
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.CorpusTermsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	},
	
	getString: function(config) {
		return new Ext.XTemplate(this.localize("getString")).apply([this.getCount(), this.sum("rawFreq")])
	}


});

Ext.define('Voyant.data.store.CorpusTermsBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.CorpusTermsMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.CorpusTermsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.DocumentQueryMatchesMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: 'Voyant.data.model.DocumentQueryMatch',
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.DocumentsFinder',
			'proxy.reader.rootProperty': 'documentsFinder.queries',
			'proxy.reader.totalProperty': undefined,
			'proxy.reader.metaProperty': 'documentsFinder.corpus'
		}])
	}
});

Ext.define('Voyant.data.store.DocumentQueryMatches', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.DocumentQueryMatchesMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.DocumentQueryMatchesMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.DocumentQueryMatchesBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.DocumentQueryMatchesMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.DocumentQueryMatchesMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.DocumentTermsMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: 'Voyant.data.model.DocumentTerm',
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.DocumentTerms',
			'proxy.reader.rootProperty': 'documentTerms.terms',
			'proxy.reader.totalProperty': 'documentTerms.total'
		}])
	}
});

Ext.define('Voyant.data.store.DocumentTerms', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.DocumentTermsMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.DocumentTermsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.DocumentTermsBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.DocumentTermsMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.DocumentTermsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.DocumentsMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: 'Voyant.data.model.Document',
    statics: {
    	i18n: {
    	}
    },
	sorters: {
        property: 'index',
        direction: 'ASC'
	},
	remoteSort: true,
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.DocumentsMetadata',
			'proxy.reader.rootProperty': 'documentsMetadata.documents',
			'proxy.reader.totalProperty': 'documentsMetadata.total'
		}])
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
	},
	getDocument: function(config) {
		return Ext.isNumber(config) ? this.getAt(config) : this.getById(config);
	}
	
});

Ext.define('Voyant.data.store.Documents', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.DocumentsMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.DocumentsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.DocumentsBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.DocumentsMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.DocumentsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.PCAAnalysisMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: 'Voyant.data.model.StatisticalAnalysis',
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.PCA',
			'proxy.reader.rootProperty': 'pcaAnalysis',
			'proxy.reader.totalProperty': 'pcaAnalysis.totalTerms'
		}])
		config.proxy.extraParams.withDistributions = true;
	}
});

Ext.define('Voyant.data.store.PCAAnalysis', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.PCAAnalysisMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.PCAAnalysisMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.PCAAnalysisBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.PCAAnalysisMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.PCAAnalysisMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});
Ext.define('Voyant.data.store.DocSimAnalysisMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: 'Voyant.data.model.StatisticalAnalysis',
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.DocumentSimilarity',
			'proxy.reader.rootProperty': 'documentSimilarity',
			'proxy.reader.totalProperty': 'documentSimilarity.total'
		}])
		config.proxy.extraParams.withDistributions = true;
	}
});

Ext.define('Voyant.data.store.DocSimAnalysis', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.DocSimAnalysisMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.DocSimAnalysisMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.DocSimAnalysisBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.DocSimAnalysisMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.DocSimAnalysisMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});
Ext.define('Voyant.data.store.CorpusNgramsMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: 'Voyant.data.model.CorpusNgram',
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.CorpusNgrams',
			'proxy.reader.rootProperty': 'corpusNgrams.ngrams',
			'proxy.reader.totalProperty': 'corpusNgrams.total'
		}])
	}
});

Ext.define('Voyant.data.store.CorpusNgrams', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.CorpusNgramsMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.CorpusNgramsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.CorpusNgramsBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.CorpusNgramsMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.CorpusNgramsMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.TokensMixin', {
	mixins: ['Voyant.data.store.VoyantStore'],
    model: 'Voyant.data.model.Token',
	constructor : function(config) {
		this.mixins['Voyant.data.store.VoyantStore'].constructor.apply(this, [config, {
			'proxy.extraParams.tool': 'corpus.DocumentTokens',
			'proxy.reader.rootProperty': 'documentTokens.tokens',
			'proxy.reader.totalProperty': 'documentTokens.total'
		}])
	}
});

Ext.define('Voyant.data.store.Tokens', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.data.store.TokensMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.TokensMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});

Ext.define('Voyant.data.store.TokensBuffered', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.data.store.TokensMixin'],
	constructor : function(config) {
		config = config || {};
		this.mixins['Voyant.data.store.TokensMixin'].constructor.apply(this, [config])
		this.callParent([config]);
	}
});
/**
 * @class VoyantTable
 * A VoyantTable can facilitate working with tabular data structures, as well as
 * displaying results (especially with {@link #embed} and {@link show}). 
 * Here's a simple example showing the Zipf-Law distribution of the top 20 frequency terms.
 * 
 * 	new Corpus("austen").loadCorpusTerms(20).then(function(corpusTerms) {
 * 		var table = new VoyantTable({rowKey: 0}); // use first column as row key
 * 		corpusTerms.each(function(corpusTerm) {
 *			table.addRow([corpusTerm.getTerm(), corpusTerm.getRawFreq()]);
 * 		});
 * 		table.embed("voyantchart"); // graph table as line chart
 * 	});
 */
Ext.define('Voyant.data.table.Table', {
	alternateClassName: ["VoyantTable"],
	mixins: ['Voyant.notebook.util.Embed'],
	embeddable: ['Voyant.widget.VoyantChart'],
	config: {
		
		/**
		 * @private
		 */
		rows: [],

		/**
		 * @private
		 */
		headers: [],

		/**
		 * Specifies that a specific header should serve as row key.
		 * 
		 */
		rowKey: undefined,
		
		/**
		 * @private
		 */
		model: undefined
	},

	constructor: function(config) {

		config = config || {};
		
		// not sure why config isn't working
		this.rows = Ext.Array.from(Ext.isArray(config) ? config : config.rows);
		this.headers = Ext.Array.from(config.headers);
		this.rowKey = config.rowKey;
		
		if (config.isStore) {
			this.model = config.getModel();
			if (config.getCount()>0) {
				this.headers = Object.keys(config.getAt(0).data);
			}
			config.each(function(item) {
				this.addRow(item.data);
			}, this)
		}
		this.callParent();
	},
	addRow: function(row) {
		if (Ext.isObject(row)) {
			this.rows.push(this.headers.map(function(key) {return row[key]}))
		} else if (Ext.isArray(row)) {
			this.rows.push(row);
		}
	},
	eachRecord: function(fn, scope) {
		var item, i=0, len=this.rows.length;
		for (; i<len; i++) {
            item = this.getRecord(i);
			if (fn.call(scope || item, item, i, len) === false) {
                break;
            }			
		}
	},
	eachRow: function(fn, asMap, scope) {
		var item, i=0, len=this.rows.length;
		for (; i<len; i++) {
            item = this.getRow(i, asMap);
			if (fn.call(scope || item, item, i, len) === false) {
                break;
            }			
		}
	},
	getRow: function(index, asMap) {
		if (asMap) {
			var row = {};
			Ext.Array.from(this.rows[index]).forEach(function(item, i) {
				row[this.headers[i] || i] = item;
			}, this);
			return row;
		} else {
			return this.rows[index];
		}
	},
	getRecord: function(index) {
		if (this.model) {return new this.model(this.getRow(index, true))}
	},
	mapRows: function(fn, asMap, scope) {
		var rows = [];
		this.eachRow(function(row, i) {
//			if (Object.keys(row).length>0) {
				rows.push(fn.call(scope || this, row, i))
//			}
		}, asMap, this)
		return rows;
	},
	
	/**
	 * Update the cell value at the specified row and column.
	 * 
	 * This will create the row and column as needed. If there's an existing value in the cell,
	 * it will be added to the new value, unless the `replace` argument is set to true.
	 * 
	 * @param {Number/String} row The cell's row.
	 * @param {Number/String} column The cell's column.
	 * @param {Mixed} value The cell's value.
	 * @param {boolean} [replace] Replace the current value (if it exists), otherwise
	 * the value is added to any current value (which is the default behaviour).
	 */
	updateCell: function(row, column, value, replace) {
		if (this.rows[row]===undefined) {this.rows[row]=[]}
		if (this.rows[row][column]===undefined || replace) {this.rows[row][column]=value}
		else {this.rows[row][column]+=value}
	},
	embed: function(cmp, config) {
		if (Ext.isObject(cmp) && !config) {
			config = cmp;
			cmp = this.embeddabled[0];
		}
		config = config || {};
		chart = {};

		var data = this.mapRows(function(row, i) {
			return this.rowKey===undefined ? Ext.apply(row, {"row-index": i}) : row;
		}, true, this)
		
		// determine columns/headers/fields
		var fields = Ext.Array.merge(this.rowKey===undefined ? ["row-index"] : [], this.headers);
		if (this.headers.length==0) {
			var max = Ext.Array.max(this.mapRows(function(row) {return row ? row.length : 0}));
			for (var i=0;i<max;i++) {fields.push(fields.length)}
		}

		Ext.apply(chart, {
			store: {
		        fields: fields,
		        data: data
		    }
		})
		
		if (config.axes) {
			Ext.apply(chart, {axes: config.axes});
			var positions = ["left", "bottom"]
			chart.axes.forEach(function(axis, i) {
				Ext.applyIf(axis, {
			        type: 'numeric',
			        position: positions[i]
				})
			})
			delete config.axes;
		} else {
			Ext.apply(chart, {
				axes:  [{
			        type: 'numeric',
			        position: 'left'
			    }, {
			        type: 'category', // row numbers (discrete)
			        position: 'bottom'
			    }]
			})
		}
		
		if (config.series) {
			Ext.apply(chart, {series: config.series});
			chart.series.forEach(function(axis, i) {
				Ext.applyIf(axis, {
					type: 'line',
					xField: this.rowKey===undefined ? 'row-index' : this.rowKey,
					yField: i
				})
			})
			delete config.series;
		} else {
			var series = [];
			for (var i=0, len=fields.length; i<len;i++) {
				
				// skip if this is the row key
				if (i===this.rowKey || (this.rowKey==undefined && i+1==len)) {continue;}
				
				series.push({
			        type: 'line',
			        xField: this.rowKey===undefined ? 'row-index' : this.rowKey,
			        yField: i
				})
			}
			Ext.apply(chart, {
				series: series
			});
		}
		if (config.title) {
			chart.title = config.title;
		}
		console.warn(chart)
		Ext.apply(config, {
			chartJson: JSON.stringify(chart)
		})
		embed(cmp, config);
	}
})
Ext.define('Voyant.data.table.CorpusTerms', {
	extend: 'Voyant.data.table.Table',
	eachCorpusTerm: function() {
		this.eachRecord.apply(this, arguments);
	}
})
/**
 * @class Corpus
 * Corpus is possibly the most important class since in most cases you'll first create/load a corpus and then
 * interact with data derived from the corpus. In the simplest scenario you can create/load a corpus with a
 * corpus ID, a text string, a URL, or an array of text strings or URLs (see the {@link #constructor} and 
 * {@link #input} config for a bit more information).
 * 
 * 	new Corpus("austen"); // load an existing corpus
 * 
 * 	new Corpus("Hello Voyant!"); // load a corpus with the specified text string
 * 
 * 	new Corpus("http://hermeneuti.ca/"); // load a corpus with a URL
 * 
 * It's important to understand that the constructor actually returns a promise for a corpus, since the corpus
 * data is loaded asynchronously. All documented methods below handle the promise properly.
 * 
 * 	new Corpus("Hello Voyant!").show(); // the show method is called when the promise is filled
 * 
 * You can also handle the promise yourself using {@link Ext.promise.Promise#then then}.
 * 
 * 	new Corpus("Hello Voyant!").then(function(corpus) {
 * 		corpus.show(); // essentially the same as above (but more work:)
 * 	});
 */
Ext.define('Voyant.data.model.Corpus', {
	alternateClassName: ["Corpus"],
    mixins: ['Voyant.notebook.util.Embed','Voyant.notebook.util.Show','Voyant.util.Transferable','Voyant.util.Localization'],
    transferable: ['loadCorpusTerms','loadTokens'],
//    transferable: ['getSize','getId','getDocument','getDocuments','getCorpusTerms','getDocumentsCount','getWordTokensCount','getWordTypesCount','getDocumentTerms'],
    embeddable: ['Voyant.panel.Summary','Voyant.panel.Cirrus','Voyant.panel.Documents','Voyant.panel.CorpusTerms'],
	requires: ['Voyant.util.ResponseError','Voyant.data.store.CorpusTerms','Voyant.data.store.Documents'/*,'Voyant.panel.Documents'*/],
    extend: 'Ext.data.Model',
    config: {
    	
    	/**
    	 * @cfg {String} corpus The ID of a previously created corpus.
    	 * 
    	 * A corpus ID can be used to try to retrieve a corpus that has been previously created.
    	 * 
    	 * This is especially useful if the input sources are long strings, local files, or content
    	 * that's otherwise difficult or impossible to recreate.
    	 * 
    	 * Note that it's possible to also specify input sources as a fall-back if the corpus
    	 * is no longer available in Voyant.
    	 * 
    	 * 		new Corpus({
    	 * 			corpus: "some.long.corpus.id.generated.by.voyant",
    	 * 			input: "http://hermeneuti.ca/" // use this as a fallback 
    	 * 		});
    	 */
    	
    	/**
    	 * @cfg {String/String[]} input Input sources for the corpus.
    	 * 
    	 * The input sources can be either normal text or URLs (starting with `http`):
    	 * 
    	 * 		input: "Hello Voyant!" // one document with this string
    	 * 
    	 * 		input: ["Hello Voyant!", "How are you?"] // two documents with these strings
    	 * 
    	 * 		input: "http://hermeneuti.ca/" // one document from URL
    	 * 
    	 * 		input: ["Hello Voyant!", "http://hermeneuti.ca/"] // two documents, one from string and one from URL
    	 */
    	
    	documentsStore: undefined
    },
    statics: {
    	i18n: {}
    },
    fields: [
         {name: 'documentsCount', type: 'int'},
         {name: 'lexicalTokensCount', type: 'int'},
         {name: 'lexicalTypesCount', type: 'int'},
         {name: 'createdTime', type: 'int'},
         {name: 'createdDate', type: 'date', dateFormat: 'c'}
    ],
    
	/**
     * Create a promise for a new Corpus with relevant data loaded.
     * 
     * The typical usage is to chain the returned promise with {@link Ext.promise.Promise#then then} and
     * provide a function that receives the Corpus as an argument.
     * 
     * 	var corpus;
     * 	new Corpus("Hello Voyant!").then(function(data) {
     * 		corpus = data;
     * 	});
     * 
     * The following scenarios are possible for the config argument:
     * 
     * - a string that looks like a corpus ID (not a URL and no spaces): treated as a {@link #corpus} config
     * - a string that doesn't look like a corpus ID: treated as an {@link #input} config
     * - an array of strings: treated as an array of {@link #input} config values
     * - an object: treated a normal config object
     * 
     * As such, these two constructions do the same thing:
     * 
     * 	new Corpus("Hello World!");
     * 	new Corpus({input: "Hello World!"});
     * 
     * @param {String/String[]/Object} config The source document(s) as a text string, a URL, an array of text strings and URLs, or a config object.
	 * @returns {Ext.promise.Promise} *Important*: This doesn't immediately return a Corpus but a promise to return a Corpus when it's finished loading
	 * (you should normally chain the promise with {@link Ext.promise.Promise#then then} and provide a function that receives the
	 * Corpus as an argument, as per the example above).
	 */
	constructor : function(config) {
		
		config = config || {};
				
		this.callParent([]); // only send config, not source
		if (config) {
			
			if (Ext.isString(config) || Ext.isArray(config)) {
				if (Ext.isString(config) && /\s/.test(config)==false && config.indexOf(":")==-1) {
					config = {corpus: config};
				} else {
					config = {input: config};
				}
			}

			Ext.apply(config, {tool: 'corpus.CorpusMetadata'})

			var dfd = Voyant.application.getDeferred(this);
			var me = this;
			
			var promise = Ext.Ajax.request({
				url: Voyant.application.getTromboneUrl(),
				params: config
			}).then(function(response) {
				me.set(Ext.JSON.decode(response.responseText).corpus.metadata);
				return me
			}).otherwise(function(response){
				Voyant.application.showResponseError(me.localize('failedCreateCorpus'), response);
			}).then(function(corpus) {
				if (!('docsLimit' in config) || (config.docsLimit!==false && config.docsLimit>0)) {
					me.getDocuments().load({
						params: {
							limit: ('docsLimit' in config) ? config.docsLimit : me.getDocumentsCount()
						},
						callback: function(records, operation, success) {
							if (success) {
								me.setDocumentsStore(this);
								dfd.resolve(corpus)
							} else {
								dfd.reject(operation)
							}
						}
					})
				} else {
					dfd.resolve(corpus)
				}
			})
			return dfd.promise
		}
	},
	
	getId: function() {
		// overrides the getId() function from the model to handle promises
    	return this.then ? Voyant.application.getDeferredNestedPromise(this, arguments) : this.get('id');		
	},
	
	
	getAliasOrId: function() {
		// overrides the getId() function from the model to handle promises
    	return this.then ? Voyant.application.getDeferredNestedPromise(this, arguments) : (this.get('alias') || this.get('id'));		
	},
	
	/**
     * Create a promise for {@link Voyant.data.store.CorpusTerms Corpus Terms}.
     * 
     * The typical usage is to chain the returned promise with {@link Ext.promise.Promise#then then} and
     * provide a function that receives the {@link Voyant.data.store.CorpusTerms Corpus Terms} as an argument.
     * 
     * 	new Corpus("Hello Voyant!").loadCorpusTerms().then(function(corpusTerms) {
     * 		corpusTerms.show();
     * 	});
     * 
     * @param {Number/Object} config
     * 
     * - when this is a number, it's the maximum number of corpus terms to load (see {@link Voyant.data.store.CorpusTerms#limit})
     * - otherwise this is a regular config object
     * 
	 * @returns {Ext.promise.Promise} *Important*: This doesn't immediately return corpus terms but a promise to return a corpus terms when they're finished loading
	 * (you should normally chain the promise with {@link Ext.promise.Promise#then then} and provide a function that receives the
	 * corpus terms as an argument, as per the example above).
	 */
	loadCorpusTerms: function(config) {
		if (this.then) {
			return Voyant.application.getDeferredNestedPromise(this, arguments);
		} else {
			var dfd = Voyant.application.getDeferred(this);
			config = config || {};
			if (Ext.isNumber(config)) {
				config = {limit: config};
			}
			Ext.applyIf(config, {
				limit: 0
			})
			var corpusTerms = this.getCorpusTerms();
			corpusTerms.load({
				params: config,
				callback: function(records, operation, success) {
					if (success) {
						dfd.resolve(corpusTerms)
					} else {
						dfd.reject(operation)
					}
				}
			})
			return dfd.promise
		}
	},
	
	loadTokens: function(config) {
		if (this.then) {
			return Voyant.application.getDeferredNestedPromise(this, arguments);
		} else {
			var dfd = Voyant.application.getDeferred(this);
			config = config || {};
			if (Ext.isNumber(config)) {
				config = {limit: config};
			}
			Ext.applyIf(config, {
				limit: 0
			})
			var tokens = this.getTokens();
			tokens.load({
				params: config,
				callback: function(records, operation, success) {
					if (success) {
						dfd.resolve(tokens)
					} else {
						dfd.reject(operation)
					}
				}
			})
			return dfd.promise
		}
	},
	
	getCorpusTerms: function(config) {
		return Ext.create("Voyant.data.store.CorpusTerms", Ext.apply(config || {}, {corpus: this}));
	},
	
	getTokens: function(config) {
		return Ext.create("Voyant.data.store.Tokens", Ext.apply(config || {}, {corpus: this}));
	},
	
	each: function(config) {
		debugger
		this.getDocuments().each.call(this, arguments);
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
	
	getContexts: function(config) {
		return Ext.create("Voyant.data.store.Contexts", Ext.apply(config || {}, {corpus: this}));
	},
	
	getDocuments: function(config) {
		return this.getDocumentsStore() ? this.getDocumentsStore() : Ext.create("Voyant.data.store.Documents", Ext.apply(config || {}, {corpus: this}));
		//this.then ? Voyant.application.getDeferredNestedPromise(this, arguments) : this.getDocumentsStore();
	},
	
	getDocument: function(config) {
		if (this.getDocumentsStore()) {
			if (config instanceof Voyant.data.model.Document) {
				return config;
			}
			else if (Ext.isNumeric(config)) {
				return this.getDocumentsStore().getAt(parseInt(config))
			}
			else if (Ext.isString(config)) {
				return this.getDocumentsStore().getById(config)
			}
		}
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
	
	requiresPassword: function() {
		var noPasswordAccess = this.getNoPasswordAccess();
		return noPasswordAccess=='NONE' || noPasswordAccess=='NONCONSUMPTIVE';
	},
	
	getNoPasswordAccess: function() {
		// overrides the getId() function from the model to handle promises
    	return this.then ? Voyant.application.getDeferredNestedPromise(this, arguments) : this.get('noPasswordAccess');		
	},
	
	/**
	 * Shows a one-line summary of this corpus.
	 * 
	 * 	new Corpus("Hello World!").then(function(corpus) {corpus.show(true);});
	 * 
	 * @param {boolean} [withID] Includes the corpus ID in parentheses at the end, if true.
	 */
	show: function(config) {
		if (this.then) {
			return Voyant.application.getDeferredNestedPromise(this, arguments);
		} else {
			show(this.getString(config))
		}
	},
	
	/**
	 * @method embed
	 * Embed the current corpus in the specified tool.
	 * 
	 * Because embed knows about promises, you don't need to handle promises when calling embed on a corpus.
	 * 
	 * 	new Corpus("Hello Voyant!").embed(); // use summary as a default
	 * 	new Corpus("Hello Voyant!").embed("corpusterms"); // specify corpus terms tool
	 * 	new Corpus("Hello Voyant!").embed("cirrus", {width: "300px"}); // with config
	 *  
	 * @param {String} [tool] Specify which tool to use for embedding this corpus.
	 * The following are recognized tool values: {@link Voyant.panel.Summary summary} (default), {@link Voyant.panel.Cirrus cirrus}, {@link Voyant.panel.Documents documents}, {@link Voyant.panel.CorpusTerms corpusterms}.
	 * @param {Object} [config] Additional configuration options to pass to the tool.
	 * In addition to the configuration options available from each tool listed in the tool param (see above), options include:
	 * 
	 * - **width**: a CSS width value for the embedded tool (e.g. "500px", "80em", "50%")
	 * - **height**: a CSS height value for the embedded tool (e.g. "300px", "10em", "30%")
	 */

    getString: function(config) {
		var size = this.getDocumentsCount();
		var message = this.localize('thisCorpus');
		if (size==0) {message += ' '+this.localize('isEmpty')+'.';}
		else {
			message+=' ';
			if (size>1) {
				message+=new Ext.XTemplate(this.localize('hasNdocuments')).apply({count: Ext.util.Format.number(size,"0,000")});
			}
			else {
				message+=this.localize('has1document');
			}
			message+=' '+new Ext.XTemplate(this.localize('widthNwordsAndNTypes')).apply({words: Ext.util.Format.number(this.getWordTokensCount(),"0,000"), types: Ext.util.Format.number(this.getWordTypesCount(),"0,000")})+'.'
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
        				if (count==1) {message+=new Ext.XTemplate(this.localize(time[0]+'Ago')).apply({count: count, date: createdDate})}
        				else {message+=new Ext.XTemplate(this.localize(time[0]+'sAgo')).apply({count: count, date: createdDate})}
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
		if (config===true) {message+=' ('+this.getId()+")";}
		return message;
    }
    
    

});
Ext.define('Voyant.widget.CorpusSelector', {
    extend: 'Ext.form.field.ComboBox',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.corpusselector',
    statics: {
    	i18n: {
    	}
    },
    
    config: {
        labelWidth: 150,
        labelAlign: 'right',
//        fieldLabel:'Choose a corpus:',
        name:'corpus',
        queryMode:'local',
        store:[['shakespeare',"Shakespeare's Plays"],['austen',"Austen's Novels"]]
    },
    initComponent: function(config) {
    	var me = this;
    	Ext.applyIf(this, {
    		fieldLabel: this.localize('chooseCorpus')
    	})
        me.callParent(arguments);
    }
})
Ext.define('Voyant.widget.StopListOption', {
    extend: 'Ext.container.Container',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.stoplistoption',
    layout: 'hbox',
    statics: {
    	i18n: {
    	}
    },
    initComponent: function(config) {
    	var me = this;
    	var value = this.up('window').panel.getApiParam('stopList');
    	
    	var data = [];
    	"ar:stop.ar.arabic-lucene.txt,bg:stop.bu.bulgarian-lucene.txt,br:stop.br.breton-lucene.txt,ca:stop.ca.catalan-lucene.txt,ckb:stop.ckb-turkish-lucene.txt,cn:stop.cn.chinese-lawrence.txt,cz:stop.cz.czech-lucene.txt,de:stop.de.german.txt,el:stop.el.greek-lucene.txt,en:stop.en.taporware.txt,es:stop.es.spanish.txt,eu:stop.eu.basque-lucene.txt,fa:stop.fa.farsi-lucene.txt,fr:stop.fr.veronis.txt,ga:stop.ga-irish-lucene.txt,gl:stop.ga.galician-lucene.txt,hi:stop.hi.hindi-lucene.txt,hu:stop.hu.hungarian.txt,hy:stop.hy.armenian-lucene.txt,id:stop.id.indonesian-lucene.txt,it:stop.it.italian.txt,ja:stop.ja.japanese-lucene.txt,lv:stop.lv.latvian-lucene.txt,lt:stop.lt.lithuanian-lucene.txt,mu:stop.mu.multi.txt,nl:stop.nl.dutch.txt,no:stop.no.norwegian.txt,ro:stop.ro.romanian-lucene.txt,se:stop.se.swedish-long.txt,th:stop.th.thai-lucene.txt,tr:stop.tr.turkish-lucene.txt".split(",").forEach(function(lang) {
    		var parts = lang.split(":")
    		data.push({name: this.localize(parts[0]), value: parts[1]})
    	}, this);
    	data.sort(function(a,b) { // sort by label
    		return a.name < b.name ? -1 : 1;
    	})
    	data.splice(0, 0, {name : this.localize('auto'),   value: 'auto'}, {name : this.localize('none'),   value: ''},  {name : this.localize('new'),   value: 'new'})
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
		            ui: 'default-toolbar',
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
	    	        	    	    	store.add({name: value, value: value});
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
    extend: 'Ext.form.field.Tag',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.querysearchfield',
	statics: {
		i18n: {
		}
	},
	config: {
		corpus: undefined,
		tokenType: 'lexical',
		isDocsMode: false,
		inDocumentsCountOnly: undefined,
		stopList: undefined,
		showAggregateInDocumentsCount: false
	},
    
    constructor: function(config) {
    	config = config || {};
    	var itemTpl = config.itemTpl ? config.itemTpl : '{term} ({'+(config.inDocumentsCountOnly ? 'inDocumentsCount' : 'rawFreq')+'})';
    	Ext.applyIf(config, {
    		minWidth: 100,
    		maxWidth: 200,
    		matchFieldWidth : false,
    		minChars: 2,
    	    displayField: 'term',
    	    valueField: 'term',
    	    filterPickList: true,
    	    createNewOnEnter: true,
    	    createNewOnBlur: false,
    	    autoSelect: false,
    	    tpl: Ext.create('Ext.XTemplate',
    	    	'<ul class="x-list-plain"><tpl for=".">',
    	    	'<li role="option" class="x-boundlist-item" style="white-space: nowrap;">'+itemTpl+'</li>',
    	    	'</tpl></ul>'
    	    ),
    	    triggers: {
    	        help: {
    	            weight: 2,
    	            cls: 'fa-trigger form-fa-help-trigger',
    	            handler: function() {
    	            	Ext.Msg.show({
    	            	    title: this.localize('querySearch'),
    	            	    message: this.getIsDocsMode() ? this.localize('querySearchDocsModeTip') : this.localize('querySearchTip'),
    	            	    buttons: Ext.OK,
    	            	    icon: Ext.Msg.INFO
    	            	});
    	            },
    	            scope: 'this'
    	        }
    	   }
    	})
    	if (config.showAggregateInDocumentsCount) {
    		config.triggers.count = {
	            cls: 'fa-trigger',
	            handler: 'onHelpClick',
	            scope: 'this',
	            hidden: true
    		}
    	}
        this.callParent(arguments);
    },
    initComponent: function(config) {
    	var me = this;
    	me.on("beforequery", function(queryPlan) {
    		if (queryPlan.query) {
    			queryPlan.query = queryPlan.query.trim();
    			if (queryPlan.query.charAt(0)=="^") {
    				queryPlan.query=queryPlan.query.substring(1)
    				queryPlan.cancel = queryPlan.query.length==0; // cancel if it's just that character
    			}
    			if (queryPlan.query.charAt(0)=="*") { // convert leading wildcard to regex
    				queryPlan.query = "."+queryPlan.query;
    			}
    			if (queryPlan.query.charAt(queryPlan.query.length-1)=='*') {
    				queryPlan.query=queryPlan.query.substring(0,queryPlan.query.length-1)
    				queryPlan.cancel = queryPlan.query.length==0; // cancel if it's just that character
    			}
    			if (queryPlan.query.charAt(0)==".") {
    				queryPlan.cancel = queryPlan.query.length< (/\W/.test(queryPlan.query.charAt(1)) ? 5 : 4) // cancel if we only have 3 or fewer after .
    			}
    			try {
                    new RegExp(queryPlan.query);
	            }
	            catch(e) {
	            	queryPlan.cancel = true;
	            }
	            if (queryPlan.query.indexOf('"')>-1) { // deal with unfinished phrases
	            	if (queryPlan.query.indexOf(" ")==-1) {queryPlan.cancel=true} // no space in phrase
	            	if ((queryPlan.query.match(/"/) || []).length!=2) {queryPlan.cancel=true;} // not balanced quotes
	            }
	            if (queryPlan.query.indexOf("*")>-1) {
	            	if (queryPlan.query.indexOf(" ")==-1) {
	            		queryPlan.query += ",^"+queryPlan.query;
	            	}
	            } else {
	            	queryPlan.query = queryPlan.query+"*"+ (queryPlan.query.indexOf(" ")==-1 ? ","+"^"+queryPlan.query+"*" : "")
	            }
    		}
    	}, me);
    	
    	me.on("change", function(tags, queries) {
    		queries = queries.map(function(query) {return query.replace(/^(\^?)\*/, "$1.*")});
    		me.up('panel').fireEvent("query", me, queries);
    		if (me.triggers.count) {
    			me.triggers.count.show();
    			me.triggers.count.getEl().setHtml('0');
    			if (queries.length>0) {
    				me.getCorpus().getCorpusTerms().load({
    					params: {
    						query: queries.map(function(q) {return '('+q+')'}).join("|"),
			    			tokenType: me.getTokenType(),
			    			stopList: me.getStopList(),
			    			inDocumentsCountOnly: true
    					},
    					callback: function(records, operation, success) {
    						if (success && records && records.length==1) {
    							me.triggers.count.getEl().setHtml(records[0].getInDocumentsCount())
    						}
    					}
    				})
    			} else {
    				me.triggers.count.hide();
    			}
    		}
    	})
    	
    	me.up("panel").on("loadedCorpus", function(src, corpus) {
    		me.setCorpus(corpus);
    		var stopList = me.getStopList();
    		if (stopList==undefined) {
        		if (this.getApiParam) {me.setStopList(this.getApiParam("stopList"))}
        		else {
        			var parent = this.up("panel");
        			if (parent && parent.getApiParam) {
        				me.setStopList(parent.getApiParam("stopList"))
        			}
        		}
    		}

			me.setStore(corpus.getCorpusTerms({
				corpus: corpus,
				proxy: {
					extraParams: {
		    			limit: 10,
		    			tokenType: me.tokenType,
		    			stopList: me.getStopList(),
		    			inDocumentsCountOnly: me.getInDocumentsCountOnly()
					}
				}
    		}));
    	})
    	
    	me.on("afterrender", function(c) {
			  if (c.triggers && c.triggers.help) {
		        	Ext.tip.QuickTipManager.register({
		                 target: c.triggers.help.getEl(),
		                 text: c.getIsDocsMode() ? c.localize('querySearchDocsModeTip') : c.localize('querySearchTip')
		             });
			  }
			  if (c.triggers && c.triggers.count) {
		        	Ext.tip.QuickTipManager.register({
		                 target: c.triggers.count.getEl(),
		                 text: c.localize('aggregateInDocumentsCount')
		             });
			  }
    	}, me)
    	me.callParent(arguments);
    }
    
});
Ext.define('Voyant.widget.TotalPropertyStatus', {
    extend: 'Ext.Component',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.totalpropertystatus',
	statics: {
		i18n: {
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

Ext.define('Voyant.widget.DocumentSelector', {
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.documentselector',
	glyph: 'xf10c@FontAwesome',
	statics: {
		i18n: {
		}
	},

	config: {
		docs: undefined,
		corpus: undefined,
		singleSelect: false
	},
	
    initComponent: function() {

		var me = this;
		
		this.setSingleSelect(this.config.singleSelect == undefined ? this.getSingleSelect() : this.config.singleSelect);
		
		Ext.apply(me, {
			text: this.localize('documents'),
			menu: {
				width: 250,
				fbar: [{
					xtype: 'checkbox',
					hidden: this.getSingleSelect(),
					boxLabel: this.localize("all"),
					listeners: {
						change: {
							fn: function(item, checked) {
								this.getMenu().items.each(function(item) {
									item.setChecked(checked);
								});
							},
							scope: this
						}
					}
				},{xtype:'tbfill'},{
		    		xtype: 'button',
		    		text: this.localize('ok'),
					hidden: this.getSingleSelect(),
	    	    	scale: 'small',
		    		handler: function(button, e) {
		    			var docs = [];
		    			this.getMenu().items.each(function(item) {
		    				if (item.checked) {
			    				docs.push(item.docId);
		    				}
		    			}, this);
		    			
		    			// tell parent tool
						var panel = button.findParentBy(function(clz) {
							return clz.mixins["Voyant.panel.Panel"];
						});
						if (panel) {
			    			panel.fireEvent('documentsSelected', button, docs);
						}

		    			// hide the opened menu
		    			button.findParentBy(function(clz) {
		    				if (clz.isXType("button") && clz.hasVisibleMenu()) {
		    					clz.hideMenu();
		    					return true;
		    				}
		    				return false;
		    			});
		    		},
		    		scope: this
		    	},{
		    		xtype: 'button',
		    		text: this.localize('cancel'),
	    	    	scale: 'small',
		    		handler: function(b, e) {
		    			this.findParentBy(function(clz) {
		    				if (clz.isXType("button") && clz.hasVisibleMenu()) {
		    					clz.hideMenu();
		    					return true;
		    				}
		    				return false;
		    			}, this);
		    			this.hideMenu();
		    		},
		    		scope: this
		    	}]
			},
			listeners: {
				afterrender: function(selector) {
					selector.on("loadedCorpus", function(src, corpus) {
						this.setCorpus(corpus);
						if (corpus.getDocumentsCount()==1) {
							this.hide();
						} else {
							selector.populate(corpus.getDocumentsStore().getRange(), true);
						}
					}, selector);
					var panel = selector.findParentBy(function(clz) {
						return clz.mixins["Voyant.panel.Panel"];
					});
					if (panel) {
						panel.on("loadedCorpus", function(src, corpus) {
							selector.fireEvent("loadedCorpus", src, corpus);
						}, selector);
						if (panel.getCorpus && panel.getCorpus()) {selector.fireEvent("loadedCorpus", selector, panel.getCorpus());}
						else if (panel.getStore && panel.getStore() && panel.getStore().getCorpus && panel.getStore().getCorpus()) {
							selector.fireEvent("loadedCorpus", selector, panel.getStore().getCorpus());
						}
					}
				}
			}
		});


    },
    
    populate: function(docs, replace) {
    	this.setDocs(docs);
    	
    	var menu = this.getMenu();
    	if (replace) {
    		menu.removeAll();
    	}
    	
    	var isSingleSelect = this.getSingleSelect();
    	
    	var groupId = 'docGroup'+Ext.id();
    	docs.forEach(function(doc, index) {
    		menu.add({
    			xtype: 'menucheckitem',
    			text: doc.getShortTitle(),
    			docId: doc.get('id'),
    			checked: isSingleSelect && index == 0 || !isSingleSelect,
    			group: isSingleSelect ? groupId : undefined,
    			checkHandler: function(item, checked) {
    				if (this.getSingleSelect() && checked) {
    					var panel = this.findParentBy(function(clz) {
    						return clz.mixins["Voyant.panel.Panel"];
    					});
    					if (panel) {
	    					panel.fireEvent('documentSelected', this, doc);
    					}
    				}
    			},
    			scope: this
    		});
    	}, this);
    	
    }
});

Ext.define('Voyant.widget.DocumentSelectorButton', {
    extend: 'Ext.button.Button',
    alias: 'widget.documentselectorbutton',
    mixins: ['Voyant.widget.DocumentSelector'],
    initComponent: function() {
    	this.mixins["Voyant.widget.DocumentSelector"].initComponent.apply(this, arguments);
		this.callParent();
    }
})
    
Ext.define('Voyant.widget.DocumentSelectorMenuItem', {
    extend: 'Ext.menu.Item',
    alias: 'widget.documentselectormenuitem',
    mixins: ['Voyant.widget.DocumentSelector'],
    initComponent: function() {
    	this.mixins["Voyant.widget.DocumentSelector"].initComponent.apply(this, arguments);
		this.callParent();
    }
})

Ext.define('Voyant.widget.CorpusDocumentSelector', {
    extend: 'Ext.button.Button',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.corpusdocumentselector',
	statics: {
		i18n: {
		}
	},
	config: {
		corpus: undefined,
		singleSelect: false
	},
	
    initComponent: function() {
		var me = this;
		
		this.setSingleSelect(this.config.singleSelect == undefined ? this.getSingleSelect() : this.config.singleSelect);
		
		Ext.apply(me, {
			text: this.localize('scale'),
			glyph: 'xf059@FontAwesome',
			menu: {
				items: [{
					text: this.localize("corpus"),
					glyph: 'xf111@FontAwesome',
					handler: function(button) {
						var panel = this.findParentBy(function(clz) {
							return clz.mixins["Voyant.panel.Panel"];
						});
						if (panel) {
							button.nextSibling().menu.items.each(function(item) {
								item.setChecked(false, true);
							});
							panel.fireEvent("corpusSelected", this, this.getCorpus());
						}
					},
					scope: this
				},{
					xtype: 'documentselectormenuitem',
					singleSelect: this.getSingleSelect()
				}]
			},
			listeners: {
				afterrender: function(selector) {
					selector.on("loadedCorpus", function(src, corpus) {
						this.setCorpus(corpus);
						if (corpus.getDocumentsCount()==1) {
							this.hide();
						}
					}, selector);
					var panel = selector.findParentBy(function(clz) {
						return clz.mixins["Voyant.panel.Panel"];
					});
					if (panel) {
						panel.on("loadedCorpus", function(src, corpus) {
							selector.fireEvent("loadedCorpus", src, corpus);
						}, selector);
						if (panel.getCorpus && panel.getCorpus()) {selector.fireEvent("loadedCorpus", selector, panel.getCorpus())}
						else if (panel.getStore && panel.getStore() && panel.getStore().getCorpus && panel.getStore().getCorpus()) {
							selector.fireEvent("loadedCorpus", selector, panel.getStore().getCorpus());
						}
					}
				}
			}
		});

		me.callParent(arguments);	
    }
});
Ext.define('Voyant.widget.DownloadFilenameBuilder', {
    extend: 'Ext.form.FieldContainer', //'Ext.container.Container',
    mixins: ['Voyant.util.Localization', 'Ext.form.field.Field'],
    alias: 'widget.downloadfilenamebuilder',
	statics: {
		i18n: {
		}
	},
	config: {
	    name: 'documentFilename',
	    itemId: 'documentFilename',
		fields: ['pubDate', 'title', 'author'],
		value: ['pubDate', 'title'],
		width: 400
	},
	

    initComponent: function(config) {
    	config = config || {};
        var me = this;
        
        me.initField();

        me.on('afterrender', function() {
        	this.items.eachKey(function(key) {
        		new Ext.dd.DropZone(this.items.get(key).getTargetEl(), {
        			ddGroup: 'downloadfilename',
        			getTargetFromEvent: function(e) {
        				var target = e.getTarget();
        				// check that we're not dropping on another source
        				return target.className && target.className.indexOf('dragsource')>-1 ? target.parentNode : target;
        	        },
        	        onNodeDrop : function(target, dd, e, data){
        	        	target.appendChild(dd.el.dom);
        	            return true;
        	        }
        		});
        	}, this)
        	
        	this.getFields().map(function(item) {
        		item = Ext.isString(item) ? {
            		tag: 'span',
            		html: this.localize(item+"Label"),
            		value: item
        		} : item;
        		var container = this.queryById(Ext.Array.contains(this.getValue(), item.value) ? 'enabled' : 'available')
				var el = Ext.dom.Helper.append(container.getTargetEl(), Ext.apply(item, {cls: 'dragsource'}));
    			Ext.create('Ext.dd.DragSource', el, {
    				ddGroup: 'downloadfilename'
                });
        	}, this)
        }, me);
        me.callParent(arguments);
    }, 
    defaults: {
    	xtype: 'container',
    	width: '100%'
    },
    items: [{
    	itemId: 'enabled',
    	cls: 'dropzone dropzone-enabled'
    }, {
    	itemId: 'available',
    	cls: 'dropzone dropzone-disabled'
    }],
    
    
    getValue: function() {
    	return this.rendered ? this.getTargetEl().query('.dropzone-enabled .dragsource').map(function(source) {return source.getAttribute('value')}) : this.value;
    },
    
    setValue: function(val) {
    	if (this.rendered) {
        	this.getTargetEl().query(".dragsource", false).forEach(function(source) {
        		var enabled = Ext.Array.contains(this.value, source.getAttribute('value'))
        		if (enabled && source.parent().hasCls('dropzone-disabled')) {
        			this.queryById('enabled').getTargetEl().appendChild(source.dom);
        		} else if (!enabled && source.parent().hasCls('dropzone-enabled')) {
        			this.queryById('available').getTargetEl().appendChild(source.dom);
        		}
        	}, this)
    	} else {
    		this.value = val;
    	}
    }
    
    
});

Ext.define('Voyant.widget.DownloadFileFormat', {
    extend: 'Ext.form.CheckboxGroup', //'Ext.container.Container',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.downloadfileformat',
	statics: {
		i18n: {
		}
	},
    initComponent: function(config) {
    	config = config || {};
        var me = this;
        
        Ext.apply(this, {
        	labelAlign: config.labelAlign ? config.labelAlign : 'right'
        })

        Ext.applyIf(this, {
        	fieldLabel: this.localize('fieldLabel'),
        	items: [
	            {boxLabel: this.localize('original'), name: 'documentFormat', inputValue: 'SOURCE'},
	            {boxLabel: this.localize('voyantXml'), name: 'documentFormat', inputValue: 'VOYANT'},
                {boxLabel: this.localize('plainText'), name: 'documentFormat', inputValue: 'TXT'}
        	],
        	width: 450
        })
        me.on('afterrender', function() {
        	this.query('checkbox').forEach(function(cmp) {
        		var tooltip = this.localize(cmp.inputValue+"Tip");
        		if (tooltip.indexOf(cmp.inputValue+"Tip")==-1) {
		        	Ext.tip.QuickTipManager.register({
		                 target:cmp.getEl(),
		                 text: tooltip
		             });
        		}
        	}, this)
        }, this)
        me.callParent(arguments);
    }
});

Ext.define('Voyant.widget.DownloadOptions', {
    extend: 'Ext.form.FieldSet',
    mixins: ['Voyant.util.Localization'],
    requires: ['Voyant.widget.DownloadFileFormat', 'Voyant.widget.DownloadFilenameBuilder'],
    alias: 'widget.downloadoptions',
	statics: {
		i18n: {
		}
	},
	config: {
		items: [{xtype: 'downloadfileformat'}, {xtype: 'downloadfilenamebuilder'}]
	},
    initComponent: function(config) {
    	config = config || {};
    	var me = this;
        Ext.apply(this, {
        	title: config.title ? config.title : this.localize('title')
        })
        me.callParent(arguments);
    }
});

Ext.define('Voyant.widget.VoyantChart', {
    extend: 'Ext.chart.CartesianChart',
    mixins: ['Voyant.util.Localization','Voyant.util.Api'],
    alias: 'widget.voyantchart',
    statics: {
    	i18n: {
    	},
    	api: {
    		chartJson: undefined
    	}
    },
    constructor: function(config) {
    	config = config || {};
    	var me = this;
    	this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
    	if (this.getApiParam('chartJson')) {
    		var json = JSON.parse(this.getApiParam('chartJson'));
    		Ext.apply(config, json);
    	}
    	this.callParent(arguments)
    },
    initComponent: function(config) {
    	this.callParent(arguments)
    }

})
Ext.define('Voyant.panel.Panel', {
	mixins: ['Voyant.util.Localization','Voyant.util.Api','Voyant.util.Toolable','Voyant.util.DetailedError'],
	requires: ['Voyant.widget.QuerySearchField','Voyant.widget.StopListOption','Voyant.widget.TotalPropertyStatus'],
	alias: 'widget.voyantpanel',
	statics: {
		i18n: {
		},
		config: {
			corpusValidated: false
		},
		api: {
			corpus: undefined,
			input: undefined,
			inputFormat: undefined,
			subtitle: undefined
		}
	},
	constructor: function(config) {
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
//		this.mixins['Voyant.notebook.util.Embeddable'].constructor.apply(this, arguments);
		this.mixins['Voyant.util.Toolable'].constructor.apply(this, arguments);
		if (!this.glyph) {
			this.glyph = Ext.ClassManager.getClass(this).glyph
		}
		
		this.on("afterrender", function() {
			if (this.getApiParam('subtitle') && this.getTitle()) {
				this.setTitle(this.getTitle()+" <i style='font-size: smaller;'>"+this.getApiParam('subtitle')+"</i>")
			}
		}, this)
	},
	
	getApplication: function() {
		return Voyant.application;
	},
	
	getBaseUrl: function() {
		return this.getApplication().getBaseUrl();
	},
	
	openUrl: function(url) {
		this.getApplication().openUrl.apply(this, arguments);
	},
	
	getTromboneUrl: function() {
		return this.getApplication().getTromboneUrl();
	},
	
	dispatchEvent: function() {
		var application = this.getApplication();
		application.dispatchEvent.apply(application, arguments);
	},
	
	showError: function(config) {
		this.getApplication().showError(config)
	},
	
	toastError: function(config) {
		if (Ext.isString(config)) {
			config = {html: config}
		}
		Ext.applyIf(config, {
			glyph: 'xf071@FontAwesome',
			title: this.localize("error")
		})
		this.toast(config);
	},
	
	toastInfo: function(config) {
		if (Ext.isString(config)) {
			config = {html: config}
		}
		Ext.applyIf(config, {
			glyph: 'xf05a@FontAwesome',
			title: this.localize("info")
		})
		this.toast(config);
	},
	
	toast: function(config) {
		if (Ext.isString(config)) {
			config = {html: config}
		}
		Ext.applyIf(config, {
			 slideInDuration: 500,
			 shadow: true,
			 align: 'b',
			 anchor: this.getTargetEl()			
		})
		Ext.toast(config);
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
			this.getApplication().dispatchEvent("panelChange", this)
		},
		afterrender: function(panel) {
			this.fireEvent("tabchange", this, this.getActiveTab())
		}
	},
	showOptionsClick: function(panel) {
		var tab = panel.getActiveTab();
		if (tab.showOptionsClick) {
			tab.showOptionsClick.apply(tab, arguments)
		}
	}
});
Ext.define('Voyant.widget.Facet', {
	extend: 'Ext.grid.Panel',
    mixins: ['Voyant.panel.Panel'],
    alias: 'widget.facet',
	statics: {
		i18n: {
		},
		api: {
			stopList: 'auto',
			query: undefined
		}
	},
	
	config: {
		corpus: undefined
	},
	constructor: function(config) {
        this.callParent(arguments);
        Ext.applyIf(config || {}, {
        	includeTools: [], // don't show tools in header
        	rowLines: false,
        	columnLines: false // ignored?
        })
        this.mixins['Voyant.panel.Panel'].constructor.apply(this, [config]);
	},
	
	rowLines: false,
	
    initComponent: function(){

    	var me = this;
    	if (!this.store) {
    		this.store = new Ext.create("Voyant.data.store.CorpusFacets", {
    			proxy: {
    				extraParams: {
    					facet: this.facet
    				}
    			},
    			parentPanel: this
    		})
    		this.store.getProxy().on("exception", function(proxy, request, operation, eOpts) {
    			me.showError(Ext.create("Voyant.util.ResponseError", {response: request}));
    		})
    	}

        Ext.applyIf(this, {
        	emptyText: this.localize("emptyText"),
        	hideHeaders: true,
        	selType: 'checkboxmodel',
        	columns: [
        	          { renderer: function(value, metaData, record) {return "("+record.getInDocumentsCount()+") "+record.getLabel()}, flex: 1 }
        	]
        });
        this.callParent();
        
        if (this.corpus) {
        	this.setCorpus(this.corpus)
        }
        
        this.on("query", function(src, query) {
        	this.setApiParam("query", query);
        	// not getting set from beforeload, so set params here
        	this.store.load({
        		params: this.getApiParams()
        	})
        	
        })
    },
    
    setCorpus: function(corpus) {
    	this.callParent(arguments)
    	if (this.getStore()) {
        	this.getStore().setCorpus(corpus);
        	this.getStore().load();
    	}
    }
});

// assuming Bubblelines library is loaded by containing page (via voyant.jsp)
Ext.define('Voyant.panel.Bubbles', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.bubbles',
    statics: {
    	i18n: {
    	},
    	api: {
    		/**
    		 * @property stopList The stop list to use to filter results.
    		 * Choose from a pre-defined list, or enter a comma separated list of words, or enter an URL to a list of stop words in plain text (one per line).
    		 * @type String
    		 * @private
    		 */
    		stopList: 'auto',
    		
    		docIndex: 0,
    		
    		limit: 100,
    		
    		audio: false,
    		
    		speed: 30
    			
    			
    	},
    	glyph: 'xf06e@FontAwesome'
	},
	config: {
		corpus: undefined,
    	options: {xtype: 'stoplistoption'},
    	audio: false
	},
	
	
    constructor: function() {

    	this.mixins['Voyant.util.Localization'].constructor.apply(this, arguments);
    	Ext.apply(this, {
    		title: this.localize('title'),
			html: '<canvas style="width: 100%; height: 100%"></canvas>',
    		dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
        		enableOverflow: true,
                items: [{
	            	xtype: 'documentselectorbutton',
	            	singleSelect: true
	            },{
					xtype: 'slider',
					fieldLabel: this.localize('speed'),
					labelAlign: 'right',
					labelWidth: 40,
					width: 100,
					increment: 1,
					minValue: 1,
					maxValue: 60,
					value: 30,
					listeners: {
	                	render: function(cmp) {
	                		cmp.setValue(parseInt(this.getApiParam("speed")));
	                		if (this.bubbles) {this.bubbles.frameRate(cmp.getValue())}
	                		this.setAudio(cmp.getValue());
	    		        	Ext.tip.QuickTipManager.register({
	    		        		target: cmp.getEl(),
	   		                 	text: this.localize('speedTip')
	    		        	});
	                		
	                	},
	                    changecomplete: function(cmp, val) {
	                    	this.setApiParam('speed', val);
	                		if (this.bubbles) {this.bubbles.frameRate(val)}
	                    },
	                    scope: this
					}
				},{
	                xtype: 'checkbox',
	                boxLabel: this.localize('sound'),
	                listeners: {
	                	render: function(cmp) {
	                		cmp.setValue(this.getApiParam("audio")===true ||  this.getApiParam("audio")=="true");
	                		this.setAudio(cmp.getValue());
	    		        	Ext.tip.QuickTipManager.register({
	    		        		target: cmp.getEl(),
	   		                 	text: this.localize('soundTip')
	    		        	});
	                		
	                	},
	                    change: function(cmp, val) {
	                    	this.setApiParam('audio', val);
	                    	this.setAudio(val);
	                    },
	                    scope: this
	                }
	            },{xtype: 'tbfill'}, {
	    			xtype: 'tbtext',
	    			html: this.localize('adaptation') //https://www.m-i-b.com.ar/letters/en/
	    		}]
    		}]
    	});
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
    	this.on('loadedCorpus', function(src, corpus) {
    		this.setCorpus(corpus);
    		var canvas = this.getTargetEl().dom.querySelector("canvas");
    		var me = this;
    		Ext.Ajax.request({
    			url: this.getBaseUrl()+'resources/voyant/current/bubbles/bubbles.pjs'
    		}).then(function(data) {
    			var canvas = me.getTargetEl().dom.querySelector("canvas");
    			me.bubbles = new Processing(canvas, data.responseText);
    			me.bubbles.size(me.getTargetEl().getWidth(),me.getTargetEl().getHeight());
    			me.bubbles.frameRate(me.getApiParam('speed'));
    			me.bubbles.bindJavascript(me);
    			me.bubbles.noLoop();
    			me.loadDocument();
    		})
    	}, this);
    	
    	this.on("resize", function() {
    		if (this.bubbles) {
    			this.bubbles.size(this.body.getWidth(),this.body.getHeight());
    		}
    	});
    	
    	this.on("documentselected", function(src, doc) {
    		this.setApiParam('docIndex', this.getCorpus().getDocument(doc).getIndex());
    		this.loadDocument();
    	})
    },
    
    setAudio: function(val) {
    	if (this.gainNode) {this.gainNode.gain.value=val ? 1 : 0;}
    	this.callParent(arguments)
    },

    handleCurrentTerm: function(term) {
    	if (this.oscillator) {this.oscillator.frequency.value = this.terms[term] ? parseInt((this.terms[term]-this.minFreq) * 2000 / (this.maxFreq-this.minFreq)) : 0;}
    },
    
    handleDocFinished: function() {
    	if (this.gainNode) {this.gainNode.gain.value = 0;}
    	var index = parseInt(this.getApiParam('docIndex'));
    	if (index+1<this.getCorpus().getDocumentsCount()) {
    		this.setApiParam('docIndex', index+1);
    		this.loadDocument();
    	}
    },
    
    loadDocument: function() {
    	var me = this, doc = this.getCorpus().getDocument(parseInt(this.getApiParam('docIndex')));
    	this.setTitle(this.localize('title') + " <span class='subtitle'>"+doc.getFullLabel()+"</span>");
    	doc.loadDocumentTerms(Ext.apply(this.getApiParams(["stopList"]), {
    		limit: 100
    	})).then(function(documentTerms) {
    		me.terms = {};
    		documentTerms.each(function(documentTerm) {
    			me.terms[documentTerm.getTerm()] = documentTerm.getRawFreq();
    		})
    		var values = Object.keys(me.terms).map(function(k){return me.terms[k]});
    		me.minFreq = Ext.Array.min(values);
    		me.maxFreq = Ext.Array.max(values);
    		me.getCorpus().loadTokens({whitelist: Object.keys(me.terms), noOthers: true, limit: 0, docIndex: me.getApiParam('docIndex')}).then(function(tokens) {
    			var words = [];
        		tokens.each(function(token) {
    				words.push(token.getTerm().toLowerCase());
        		})
        		me.bubbles.setLines([doc.getTitle(),words.join(" ")]);
        		me.bubbles.loop();
        		me.oscillator.frequency.value = 150;
        		me.gainNode.gain.value = me.getAudio() ? 1 : 0;
    		})
    	})
    },
    
    initComponent: function() {
    	// make sure to load script
		Ext.Loader.loadScript(this.getBaseUrl()+"resources/processingjs/processing.min.js");
		
		var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		
		this.oscillator = audioCtx.createOscillator();
		this.gainNode = audioCtx.createGain();
		this.oscillator.connect(this.gainNode);
		this.gainNode.connect(audioCtx.destination);
		this.oscillator.frequency.value = 0;
		this.oscillator.start();
		this.gainNode.gain.value = 0;

    	this.callParent(arguments);
    }
});
// assuming Bubblelines library is loaded by containing page (via voyant.jsp)
Ext.define('Voyant.panel.Bubblelines', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.bubblelines',
    statics: {
    	i18n: {
    	},
    	api: {
    		/**
    		 * @property bins How many "bins" to separate a document into.
    		 * @type Integer
    		 * @private
    		 */
    		bins: 50,
        	/**
        	 * @property query A string to search for in a document.
        	 * @type String
    		 * @private
        	 */
    		query: null,
    		/**
    		 * @property stopList The stop list to use to filter results.
    		 * Choose from a pre-defined list, or enter a comma separated list of words, or enter an URL to a list of stop words in plain text (one per line).
    		 * @type String
    		 * @private
    		 */
    		stopList: 'auto',
    		/**
    		 * @property docId The document ID to restrict results to.
    		 * @type String
    		 * @private
    		 */
    		docId: undefined,
    		/**
    		 * @property docIndex The document index to restrict results to.
    		 * @type Integer
    		 * @private
    		 */
    		docIndex: undefined,
    		/**
    		 * @property maxDocs The maximum number of documents to show.
    		 * @type Integer
    		 * @private
    		 */
    		maxDocs: 50
    	},
    	glyph: 'xf06e@FontAwesome'
	},
	config: {
		corpus: undefined,
		docTermStore: undefined,
		docStore: undefined,
    	options: {xtype: 'stoplistoption'}
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
        
        this.on('documentsSelected', function(src, docIds) {
        	this.setApiParam('docId', docIds);
        	this.bubblelines.cache.each(function(d) {
        		d.hidden = docIds.indexOf(d.id) === -1;
        	});
        	this.bubblelines.drawGraph();
        }, this);
    	
    	this.on('termsClicked', function(src, terms) {
    		if (src !== this) {
	    		var queryTerms = [];
	    		terms.forEach(function(term) {
        			if (Ext.isString(term)) {queryTerms.push(term);}
        			else if (term.term) {queryTerms.push(term.term);}
        			else if (term.getTerm) {queryTerms.push(term.getTerm());}
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
			asynchronousLoad: false,
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
   		    		this.bubblelines.doBubblelinesLayout();

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
                enableOverflow: true,
                items: [{
                	xtype: 'querysearchfield'
                },{
	            	text: this.localize('clearTerms'),
					glyph: 'xf014@FontAwesome',
	            	handler: function() {
	            		this.down('#termsView').getSelectionModel().deselectAll(true);
	            		this.termStore.removeAll();
	            		this.setApiParams({query: null});
	            		this.bubblelines.removeAllTerms();
	            		this.bubblelines.drawGraph();
	            	},
	            	scope: this                			
        		},{
	            	xtype: 'documentselectorbutton'
        		},{
	            	xtype: 'slider',
	            	itemId: 'granularity',
	            	fieldLabel: this.localize('granularity'),
	            	labelAlign: 'right',
	            	labelWidth: 70,
	            	width: 150,
	            	increment: 10,
	            	minValue: 10,
	            	maxValue: 300,
	            	listeners: {
	            		changecomplete: function(slider, newvalue) {
	            			this.setApiParams({bins: newvalue});
	            			this.bubblelines.bubbleSpacing = newvalue;
	            			this.reloadTermsData();
	            		},
	            		scope: this
	            	}
	            },{
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
	            	selectionModel: {
	            		mode: 'SIMPLE'
	            	},
//	            	cls: 'selected', // default selected
	            	focusCls: '',
	            	listeners: {
	            		beforeitemclick: function(dv, record, item, index, event, opts) {
	            			event.preventDefault();
	            			event.stopPropagation();
	            			dv.fireEvent('itemcontextmenu', dv, record, item, index, event, opts);
	            			return false;
	            		},
	            		beforecontainerclick: function() {
	            			// cancel deselect all
	            			event.preventDefault();
	            			event.stopPropagation();
	            			return false;
	            		},
	            		selectionchange: function(selModel, selections) {
	            			var dv = this.down('#termsView');
	            			var terms = [];
	            			
	            			dv.getStore().each(function(r) {
	            				if (selections.indexOf(r) !== -1) {
	            					terms.push(r.get('term'));
	            					Ext.fly(dv.getNodeByRecord(r)).removeCls('unselected').addCls('selected');
	            				} else {
	            					Ext.fly(dv.getNodeByRecord(r)).removeCls('selected').addCls('unselected');
	            				}
	            			});
	            			
	            			for (var index in this.bubblelines.lastClickedBubbles) {
	            				var lcTerms = this.bubblelines.lastClickedBubbles[index];
	            				for (var term in lcTerms) {
	            					if (terms.indexOf(term) == -1) {
	            						delete this.bubblelines.lastClickedBubbles[index][term];
	            					}
	            				}
	            				
	            			}
	            			this.bubblelines.termsFilter = terms;
	            			this.bubblelines.setCanvasHeight();
	            			this.bubblelines.drawGraph();
	            		},
	            		itemcontextmenu: function(dv, record, el, index, event) {
	            			event.preventDefault();
	            			event.stopPropagation();
	            			var isSelected = dv.isSelected(el);
	            			var menu = new Ext.menu.Menu({
	            				floating: true,
	            				items: [{
	            					text: isSelected ? this.localize('hideTerm') : this.localize('showTerm'),
	            					handler: function() {
	            						if (isSelected) {
	            							dv.deselect(index);
	            						} else {
	            							dv.select(index, true);
	            						}
	            					},
	            					scope: this
	            				},{
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
	                	this.bubblelines.bubbleSpacing = parseInt(this.getApiParam('bins'));
	            	},
            		afterlayout: function(container) {
            			if (this.bubblelines.initialized === false) {
            				this.bubblelines.initializeCanvas();
            			}
            		},
	        		resize: function(cnt, width, height) {
	        			this.bubblelines.doBubblelinesLayout();
	        		},
            		scope: this
            	}
            }
		});
    	
    	this.callParent(arguments);
    },
    
    loadFromCorpusTerms: function(corpusTerms) {
    	if (this.bubblelines) { // get rid of existing terms
    		this.bubblelines.removeAllTerms();
    		this.termStore.removeAll(true);
    	}
		corpusTerms.load({
		    callback: function(records, operation, success) {
		    	var query = []; //this.getApiParam('query') || [];
				if (typeof query == 'string') query = [query];
		    	records.forEach(function(record, index) {
					query.push(record.get('term'));
				}, this);
		    	this.getDocTermsFromQuery(query);
		    },
		    scope: this,
		    params: {
		    	limit: 5,
		    	stopList: this.getApiParams('stopList')
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
	
	// produce format that bubblelines can use
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
				var index = this.termStore.find('term', term);
				this.down('#termsView').select(index, true); // manually select since the store's load listener isn't triggered
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
Ext.define('Voyant.panel.Catalogue', {
	extend: 'Ext.panel.Panel',
	requires: ['Voyant.widget.Facet'],
	mixins: ['Voyant.panel.Panel'],
	
	alias: 'widget.catalogue',
    statics: {
    	i18n: {
    	},
    	api: {
    		config: undefined,
    		stopList: 'auto',
    		facet: ['facet.title','facet.author','facet.language']
    	},
		glyph: 'xf1ea@FontAwesome'
    },
    config: {
    	corpus: undefined,
    	facets: {},
    	matchingDocIds: [],
    	customResultsHtml: undefined
    },
    
    constructor: function(config) {
    	config = config || {};

    	Ext.apply(this, {
    		title: this.localize('title'),
    		layout: 'hbox',
    		items: [
    		        {
    		        	layout: 'vbox',
    		        	height: '100%',
    		        	align: 'stretch',
    		        	itemId: 'facets',
    		        	defaults: {
    		        		width: 250,
    		        		flex: 1,
    		        		xtype: 'facet',
    		        		margin: 5,
    		        		border: true,
    		        		frame: true,
    		            	includeTools: {
    		            		close: {
    		            			type: 'close',
    		                		tooltip: this.localize('closeFacetTip'),
    		                		callback: function(facetCmp) {
    		                			delete this.facets[facetCmp.facet]; // remove from facets map
    		                			facetCmp.destroy(); // remove this facet
    		                			this.updateResults();
    		                		},
    		                		scope: this
    		            		},
    		            		add: {
    		            			type: 'plus',
    		                		tooltip: this.localize('plusFacetTip'),
    		                		callback: function() {
    		                			this.addFacet();
    		                		},
    		                		scope: this
    		            		}
    		            	}
    		        	},
    		        	items: []
    		        },
    		        {
    		        	xtype: 'panel',
    		        	html: config.customResultsHtml || '',
    		        	flex: 1,
    		        	itemId: 'results',
    		        	height: '100%',
    		        	align: 'stretch',
    		        	scrollable: true,
    		        	margin: 5,
    		        	getCorpus: function() { // for query search field
    		        		return this.findParentByType('panel').getCorpus();
    		        	},
    		        	listeners: {
    		        		query: function(src, query) {
    		        			this.findParentByType('panel').updateResults(Ext.isString(query) ? [query] : query)
    		        		}
    		        	},
    		        	bbar: [{
    		        		itemId: 'export',
    		        		text: this.localize('export'),
    		        		tooltip: this.localize('exportTip'),
    		        		disabled: true,
    		        		handler: function() {
    		        			this.mask(this.localize("exportInProgress"));
    		        			var catalogue = this;
    		            		Ext.Ajax.request({
    		            			url: this.getApplication().getTromboneUrl(),
    		            			params: {
    		            				corpus: this.getCorpus().getId(),
    		            				tool: 'corpus.CorpusManager',
    		            				keepDocuments: true,
    		            				docId: this.getMatchingDocIds()
    		            			},
    		            		    success: function(response, opts) {
    		            		    	catalogue.unmask();
    		            		    	var json = Ext.JSON.decode(response.responseText);
	                    				var url = catalogue.getBaseUrl()+"?corpus="+json.corpus.id;
	                    				var win = window.open(url);
	                    				if (!win) { // popup blocked
	                    					var msg = Ext.create('Ext.window.MessageBox', {
	                    						makeButton: function(btnIdx) {
	                    					        return new Ext.button.Button({
	                    					            handler: this.btnCallback,
//	                    					            itemId: btnId,
	                    					            scope: this,
	                    					            text: catalogue.localize('cancel'),
	                    					            ui: 'default-toolbar',
	                    					            minWidth: 75
	                    					        });
	                    						}
	                    					}).show({
	                    						title: catalogue.localize('export'),
	                    						buttons: Ext.MessageBox.CANCEL,
	                    						icon: Ext.MessageBox.INFO,
	                    						message: new Ext.XTemplate(catalogue.localize('clickToOpenCorpus')).apply([url])
	                    					});
	                    					var link = msg.getTargetEl().dom.querySelector("a");
	                    					link.addEventListener("click", function() {
	                    						msg.close()
	                    					})
	                    					Ext.get(link).frame().frame();
	                    				}
    		            		    },
    		            		    failure: function(response, opts) {
    		            		    	catalogue.unmask();
    		            		    	me.showError(response);
    		            		    }
    		            		})

    		        		},
    		        		scope: this
    		        	},{
    		        		xtype: 'querysearchfield',
    		        		width: 200,
    		        		flex: 1
    		        	},{
    		        		itemId: 'status',
    		        		xtype: 'tbtext'
    		        	}]
    		        }]
    	});

        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		this.setCorpus(corpus);
    		this.queryById('status').update(new Ext.XTemplate(this.localize('noMatches')).apply([corpus.getDocumentsCount()]))
    		this.query("facet").forEach(function(facet) {
    			facet.setCorpus(corpus);
    		});
    		if (!this.getCustomResultsHtml()) {
    			this.setCustomResultsHtml(new Ext.XTemplate(this.localize('noMatches')).apply([corpus.getDocumentsCount()]));
    			this.updateResults();
    	    	Ext.Ajax.request({
    	    	    url: this.getTromboneUrl(),
    	    	    params: {
    	        		tool: 'resource.StoredResource',
    	        		verifyResourceId: 'customhtml-'+corpus.getAliasOrId()
    	    	    },
    	    	    success: function(response, req) {
    	    	    	var json = Ext.util.JSON.decode(response.responseText);
    	    	    	if (json && json.storedResource && json.storedResource.id) {
    	        	    	Ext.Ajax.request({
    	        	    	    url: this.getTromboneUrl(),
    	        	    	    params: {
    	        	        		tool: 'resource.StoredResource',
    	        	        		retrieveResourceId: 'customhtml-'+corpus.getAliasOrId()
    	        	    	    },
    	        	    	    success: function(response, req) {
    	        	    	    	var json = Ext.util.JSON.decode(response.responseText);
    	        	    	    	if (json && json.storedResource && json.storedResource.resource) {
    	        	    	    		this.setCustomResultsHtml(json.storedResource.resource);
    	        	    	    		this.updateResults()
    	        	    	    	}
    	        	    	    },
    	        	    	    scope: this
    	        	    	})
    	    	    	}
    	    	    },
    	    	    scope: this
    	    	})

    		}
    	});
    	
    	this.on('afterrender', function(panel) {
    		
    		var facetsCmp = this.queryById('facets');
			this.addFacet({
				facet: 'lexical',
    			includeTools: {add: {
        			type: 'plus',
            		tooltip: this.localize('plusFacetTip'),
            		callback: function() {
            			this.addFacet();
            		},
            		scope: this
        		}},
				store: new Voyant.data.store.CorpusTerms({
					parentPanel: this,
    				proxy: {
    					extraParams: {
    	    				stopList: this.getApiParam("stopList")
    					}
    				}
				})
			}, facetsCmp)
    		
    		var facets = this.getApiParam('facet');
    		if (Ext.isString(facets)) {facets = facets.split(",")}
    		facets.forEach(function(facet) {
    			this.addFacet({facet: facet}, facetsCmp)
    			/*
    			facetCmp.getSelectionModel().on('selectionchange', function(model, selected) {
    				var labels = [];
    				selected.forEach(function(model) {
    					labels.push({facet: model.getFacet(), label: model.getLabel()})
    				})
    				panel.getFacets()[facet] = labels;
    				panel.updateResults();
    			})
    			facetCmp.on('query', function(model, selected) {
    				panel.getFacets()[facetCmp.facet] = [];
    				panel.updateResults();
    			})*/
    		}, this);
			

			
    		/*
			facetCmp.getSelectionModel().on('selectionchange', function(model, selected) {
				var labels = [];
				selected.forEach(function(model) {
					labels.push({facet: 'lexical', label: model.getTerm()})
				})
				panel.getFacets()['lexical'] = labels;
				panel.updateResults();
			})*/
    	})
    	
    },
    
    addFacet: function(config, facetsCmp) {
    	if (!config) {
    		// select first, then add
    		return this.selectFacet(function(facet) {
    			this.addFacet({facet: facet})
    		})
    	}
		facetsCmp = facetsCmp || this.queryById('facets');
    	var facet = config.facet,
    		itemTpl = '<span style="font-size: smaller;">(<span class="info-tip" data-qtip="'+this.localize('matchingDocuments')+'">{inDocumentsCount}</span>)</span> {term}'+'<span style="font-size: smaller;"> (<span class="info-tip" data-qtip="'+this.localize('rawFreqs')+'">{rawFreq}</span>)</span>'

		var title = this.localize(facet+"Title");
		if (title=="["+facet+"Title]") {
			title = facet.replace(/^facet\./,"").replace(/^extra./,"");
		}
		var matchingDocumentsLabel = this.localize('matchingDocuments');
		
		Ext.applyIf(config, {
			title: title,
			collapsible: true,
			facet: facet,
			columns: [{
				renderer: function(value, metaData, record) {
					return '<span style="font-size: smaller;">(<span class="info-tip" data-qtip="'+this.localize('matchingDocuments')+'">'+record.getInDocumentsCount()+"</span>) </span>"+
						(record.getLabel ? record.getLabel() : record.getTerm()+'<span style="font-size: smaller;"> (<span class="info-tip" data-qtip="'+this.localize('rawFreqs')+'">'+record.getRawFreq()+"</span>)</span>")
				},
				flex: 1
			}],
			bbar: [{
				xtype: 'querysearchfield',
				width: '100%',
				tokenType: facet.replace("facet.", ""),
				itemTpl: itemTpl
			}],
			corpus: this.getCorpus()
		})
		
		var facetCmp = facetsCmp.add(config);
		
		facetCmp.getSelectionModel().on('selectionchange', function(model, selected) {
			var labels = [];
			selected.forEach(function(model) {
				labels.push({facet: facetCmp.facet, label: model.getLabel ? model.getLabel() : model.getTerm()})
			})
			this.getFacets()[facet] = labels;
			this.updateResults();
		}, this)
		facetCmp.on('query', function(model, selected) {
			this.getFacets()[facetCmp.facet] = [];
			this.updateResults();
		}, this)
    	return facetCmp;
    },
    
    updateResults: function(queries) {
    	var facets = this.getFacets();
    	if (!queries) {
	    	var queries = [];
	    	for (facet in facets) {
	    		facets[facet].forEach(function(label) {
	        		queries.push(label.facet+":"+label.label);
	    		})
	    	}
	    	if (queries) {
		    	return this.updateResults(queries)
	    	}
    	}
		var results = this.queryById("results").getTargetEl();
		var catalogue = this;
		results.update(this.getCustomResultsHtml() ? this.getCustomResultsHtml() : new Ext.XTemplate(this.localize('noMatches')).apply([this.getCorpus().getDocumentsCount()]));
		this.queryById('status').update(new Ext.XTemplate(this.localize('noMatches')).apply([this.getCorpus().getDocumentsCount()]))
		this.queryById('export').setDisabled(true);
    	if (queries && queries.length>0) {
    		this.mask(this.localize("loading"));
    		var documentQueryMatches = this.getCorpus().getDocumentQueryMatches();
    		documentQueryMatches.load({
    			params: {query: queries, includeDocIds: true},
    			callback: function(records, operation, success) {
    				this.unmask();
    				if (records && records.length>0) {
    					this.queryById('status').setHtml(records.length)
    					var list = "<ul>";
    					var matchingDocIds = [];
    					records.forEach(function(record) {
    						record.getDocIds().forEach(function(docId) {
    							matchingDocIds.push(docId);
    							var doc = documentQueryMatches.getCorpus().getDocument(docId);
    							var item = "<li id='"+results.getId()+'_'+docId+"' class='cataloguedoc'>";
    							item += "<i>"+doc.getTitle()+"</i>";
    							for (facet in facets) {
    								if (facets[facet].length==0) {continue;}
    								var labelItems = "";
    								if (facet!='facet.title') {
    									var suffix = facet.replace(/^.+?\./,"");
    									var label = doc.get(suffix);
    									if (label) {
    										var isArray = Ext.isArray(label);
    										if (isArray) {
    											labelItems+="<li>"+suffix+"<ul>"
    										} else {
    											label = [label];
    										}
    										label.forEach(function(l) {
    											var isMatch = false;
    											facets[facet].forEach(function(f) {
    												if (f.label==l) {isMatch=true}
    												else if (f.facet.indexOf('facet')==-1) {
    													f.label.split(/\W+/).forEach(function(part) {
    														if (part.trim().length>0 && l.toLowerCase().indexOf(part.toLowerCase())>-1) {
    															isMatch=true;
    														}
    													})
    												}
    											})
    											labelItems+="<li>"+(isArray ? '' : suffix.replace('extra.','')+": ")+(isMatch ? '<span class="keyword">'+l+'</span>' : l)+"</li>"
    										})
    										if (isArray) {
    											labelItems+="</ul></li>";
    										}
    									}
    								}
    								if (labelItems) {
    									item+="<ul>"+labelItems+"</ul>";
    								}
    							}
    							item += "</li>";
    							list += item;
    						})
    					})
    					list += "</ul>";
    					results.update(list);
    					this.queryById('status').update(new Ext.XTemplate(this.localize('queryMatches')).apply([matchingDocIds.length,this.getCorpus().getDocumentsCount()]))
    					this.setMatchingDocIds(Ext.Array.clone(matchingDocIds));
    					if (matchingDocIds.length>0) {
    						this.queryById('export').setDisabled(false);
    					}
    					
    					// now try to load some snippets, if need be
    					if (facets['lexical']) {
    						var firstDocIds = matchingDocIds.splice(0,5);
    						this.loadSnippets(firstDocIds, results.first().first());
    						if (matchingDocIds && matchingDocIds.length>0) {
        						this.loadSnippets(matchingDocIds); // load the rest
    						}
    					}
    				}
    			},
    			scope: this
    		})    		
    	}
    },
    
    loadSnippets: function(docIds, elToMask) {
		var results = this.queryById("results").getTargetEl();
    	var facets = this.getFacets();
    	if (facets['lexical']) {
    		var queries = facets['lexical'].map(function(label) {return label.facet+":"+label.label});
    		var contexts = this.getCorpus().getContexts({buffered: false});
    		if (elToMask) {
    			elToMask.mask(this.localize("loadingSnippets"));
    		}
    		contexts.load({
    			method: 'POST',
    			params: {
                	stripTags: "all",
    				query: queries,
    				docId: docIds,
    				perDocLimit: 3,
    				limit: 100,
    				accurateTotalNotNeeded: true
    			},
    			scope: this,
    			callback: function(records, operation, success) {
    				if (elToMask) {
    					elToMask.unmask();
    				}
    				if (success && Ext.isArray(records) && records.length>0) {
    					var snippets = {};
    					records.forEach(function(record) {
    						if (!snippets[record.getDocIndex()]) {snippets[record.getDocIndex()]=[]}
    						snippets[record.getDocIndex()].push(record);
    					})
    					for (docIndex in snippets) {
    						var id = this.getCorpus().getDocument(docIndex).getId();
    						var html = '<li style="list-style-type: none; font-size: smaller;">'+snippets[docIndex].map(function(snippet) {
    							return snippet.getHighlightedContext();
    						}).join(" … ")+'</li>'
    						var docItem = results.down("#"+results.getId()+"_"+id);
    						if (docItem.query("ul")) {
    							html="<ul>"+html+"</ul>";
    						}
    						docItem.insertHtml('beforeEnd', html)
    					}
    				}
    			}
        	})        		
    	}
	
    },
    
    selectFacet: function(callback) {
    	if (!this.facetsSelectionStore) {
    		var keys = {};
    		this.getCorpus().getDocuments().each(function(doc) {
    			for (var key in doc.getData()) {
    				if (key!="corpus" && key.indexOf("parent")!==0 && key.indexOf("-lexical")=="-1") {
        				keys[key] = true
    				}
    			}
    		});
    		keys = Object.keys(keys);
    		keys.sort();
    		this.facetsSelectionStore = Ext.create('Ext.data.ArrayStore', {
    		    fields: ['text'],
    		    data: keys.map(function(key) {return [key]})
    		});
    	}
    	
    	var existingFacets = {};
    	this.queryById('facets').items.each(function(cmp) {
    		existingFacets[cmp.facet]=true;
    	})

    	this.facetsSelectionStore.filterBy(function(record) {
    		return !("facet."+record.get('text') in existingFacets)
    	})
    	
		var win = Ext.create('Ext.window.Window', {
			title: this.localize("selectFacet"),
			modal: true,
			items: {
				xtype: 'form',
				width: 300,
				items: {
					xtype: 'combo',
					store: this.facetsSelectionStore,
					forceSelection: true,
					width: 300
				},
				buttons: [{
	            	text: this.localize("cancel"),
		            ui: 'default-toolbar',
	                glyph: 'xf00d@FontAwesome',
	        		flex: 1,
	        		handler: function(btn) {
	        			btn.up('window').close();
	        		}
				},{
	            	text: this.localize("select"),
					glyph: 'xf00c@FontAwesome',
	            	flex: 1,
	        		handler: function(btn) {
	        			var facet = btn.up('window').down('combo').getValue();
	        			if (!facet) {
	        				return this.showError(this.localize('selectValidFacet'));
	        			} else {
	        				callback.call(this, "facet."+facet);
		        			btn.up('window').close();
	        			}
	        		},
	        		scope: this
	            }]
			},
			bodyPadding: 5
		}).show()
    }
    
});


// assuming Cirrus library is loaded by containing page (via voyant.jsp)
Ext.define('Voyant.panel.Cirrus', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.cirrus',
    statics: {
    	i18n: {
    	},
    	api: {
    		stopList: 'auto',
    		limit: 500,
    		visible: 50,
    		terms: undefined,
    		docId: undefined,
    		docIndex: undefined,
    		
    		cirrusForceFlash: false,
    		background: '0xffffff',
    		fade: true,
    		smoothness: 2,
    		diagonals: 'none' // all, bigrams, none
    	},
		glyph: 'xf06e@FontAwesome'
    },
    
    config: {
    	mode: undefined,
    	options: [
    		{xtype: 'stoplistoption'},
    		{
    	        xtype: 'numberfield',
    	        name: 'label',
    	        fieldLabel: 'Max words',
    	        labelAlign: 'right',
    	        value: 500,
    	        minValue: 50,
    	        step: 50,
    	        listeners: {
        	        afterrender: function(field) {
        	        	var win = field.up("window");
        	        	if (win && win.panel) {field.setFieldLabel(win.panel.localize("maxTerms"))}
        	        }
    	        }
    	    }
    	],
    	corpus: undefined,
    	records: undefined,
    	terms: undefined,
    	visLayout: undefined, // cloud layout algorithm
    	vis: undefined, // actual vis
    	sizeAdjustment: 100, // amount to multiply a word's relative size by
    	minFontSize: 12,
    	largestWordSize: 0,
    	smallestWordSize: 1000000
    },

    MODE_CORPUS: 'corpus',
    MODE_DOCUMENT: 'mode_document',
    
    layout: 'fit',
    
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function (config) {
    	Ext.apply(this, {
    		title: this.localize('title'),
    		dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
        		enableOverflow: true,
                items: [{
        			xtype: 'corpusdocumentselector',
        			singleSelect: true
        		},{
        			fieldLabel: this.localize('visibleTerms'),
        			labelWidth: 40,
        			width: 120,
        			xtype: 'slider',
	            	increment: 25,
	            	minValue: 25,
	            	maxValue: 500,
	            	listeners: {
	            		afterrender: function(slider) {
	            			slider.maxValue = this.getApiParam("limit")
	            			slider.increment = parseInt(slider.maxValue/50)
	            			slider.setValue(this.getApiParam("visible"))
	            		},
	            		changecomplete: function(slider, newvalue) {
	            			this.setApiParams({visible: newvalue});
	            			this.loadFromTermsRecords();
	            		},
	            		scope: this
	            	}
                }]
    		}]
    	});

    	this.callParent(arguments);
    },
    
    listeners: {
    	resize: function(panel, width, height) {
    		if (this.getVisLayout() && this.getCorpus()) {
    			this.setAdjustedSizes();
    			
    			var el = this.getLayout().getRenderTarget();
    	    	width = el.getWidth();
    			height = el.getHeight();
    			
    			el.down('svg').set({width: width, height: height});
    			if (this.getTerms()) {
        			this.getVisLayout().size([width, height]).stop().words(this.getTerms()).start();
    			}
    		}
    	},
    	
    	loadedCorpus: function(src, corpus) {
    		this.loadFromCorpus(corpus);
    	},
    	
    	corpusSelected: function(src, corpus) {
    		this.loadFromCorpus(corpus);
    		
    	},
    	
    	documentSelected: function(src, document) {
    		if (document) {
        		var corpus = this.getCorpus();
        		var document = corpus.getDocument(document);
        		this.setApiParam('docId', document.getId());
        		var documentTerms = document.getDocumentTerms({autoload: false, corpus: corpus, pageSize: this.getApiParam("maxVisible"), parentPanel: this});
        		this.loadFromDocumentTerms(documentTerms);
    		}
    	},
    	
    	ensureCorpusView: function(src, corpus) {
    		if (this.getMode() != this.MODE_CORPUS) {this.loadFromCorpus(corpus);}
    	},
    	
    	boxready: function() {
			this.initVisLayout();
    	}
    	
    },
    
    loadFromCorpus: function(corpus) {    	
		this.setCorpus(corpus);
		this.setApiParams({docId: undefined, docIndex: undefined});
		this.loadFromCorpusTerms(corpus.getCorpusTerms({autoload: false, pageSize: this.getApiParam("maxVisible"), parentPanel: this}));
    },
    
    loadFromDocumentTerms: function(documentTerms) {
    	documentTerms.load({
		    callback: function(records, operation, success) {
		    	this.setMode(this.MODE_DOCUMENT);
		    	this.setRecords(operation.getRecords()); // not sure why operation.records is different from records
		    	this.loadFromTermsRecords();
		    },
		    scope: this,
		    params: this.getApiParams()
    	});
    },
    
    loadFromCorpusTerms: function(corpusTerms) {
		corpusTerms.load({
		    callback: function(records, operation, success) {
		    	this.setMode(this.MODE_CORPUS);
		    	this.setRecords(operation.getRecords()); // not sure why operation.records is different from records
		    	this.loadFromTermsRecords();
		    },
		    scope: this,
		    params: this.getApiParams()
    	});
    },
    
    loadFromTermsRecords: function() {
    	var records = this.getRecords();
    	var visible = this.getApiParam("visible");
    	if (visible>records.length) {visible=records.length;}
    	var terms = [];
    	for (var i=0; i<visible; i++) {
    		terms.push({text: records[i].get('term'), rawFreq: records[i].get('rawFreq')});
    	}
    	this.setTerms(terms);
    	this.buildFromTerms();
    },
    
    initVisLayout: function() {
    	if (this.getVisLayout() == undefined) {
    		var cirrusForceFlash = this.getApiParam('cirrusForceFlash');
    		if (cirrusForceFlash == 'true') {
    			this.setApiParam('cirrusForceFlash', true);
    			var id = this.id.replace(/-/g,'_')+'_cirrus';
    			var appVars = {
    				id: id
    			};
    			var keys = ['background','fade','smoothness','diagonals'];
    			for (var i = 0; i < keys.length; i++) {
    				appVars[keys[i]] = this.getApiParam(keys[i]);
    			}
    			
    			var swfscript = '<script type="text/javascript" src="'+this.getApplication().getBaseUrl()+'resources/swfobject/swfobject.js'+'"></script>';
    			var cirrusLinks = '<script type="text/javascript">'+
				'function cirrusClickHandler'+id+'(word, value) {'+
				'if (window.console && console.info) console.info(word, value);'+
				'var cirrusTool = Ext.getCmp("'+this.id+'");'+
				'cirrusTool.cirrusClickHandler(word, value);'+
				'}'+
				'function cirrusLoaded'+id+'() {'+
				'if (window.console && console.info) console.info("cirrus flash loaded");'+
				//'Ext.getCmp("'+this.id+'").loadInitialData();'+
				'}'+
				'function cirrusPNGHandler'+id+'(base64String) {'+
				'var cirrusTool = Ext.getCmp("'+this.id+'");'+
				'cirrusTool.cirrusPNGHandler(base64String);'+
				'}'+
				'</script>';
    			this.update(swfscript+cirrusLinks, true, function() {
    				function loadFlash(component) {
    					if (typeof swfobject !== 'undefined') {
    						var el = component.getLayout().getRenderTarget();
    						var width = el.getWidth();
    						var height = el.getHeight();
    		    			
	        				var cirrusFlash = component.getApplication().getBaseUrl()+'resources/cirrus/flash/Cirrus.swf';
	        				component.add({
	        					xtype: 'flash',
	        					id: appVars.id,
	        					url: cirrusFlash,
	        					width: width,
	        					height: height,
	        					flashVars: appVars,
	        					flashParams: {
									menu: 'false',
									scale: 'showall',
									allowScriptAccess: 'always',
									bgcolor: '#222222',
									wmode: 'opaque'
	        		            }
	        				});
	        				
	        				component.cirrusFlashApp = Ext.get(appVars.id).first().dom;
    					} else {
    						setTimeout(loadFlash, 50, component);
    					}
        			}
    				loadFlash(this.component);
    				
    			}, this);
    		} else {
    			var el = this.getLayout().getRenderTarget();
    	    	var width = el.getWidth();
    			var height = el.getHeight();
    			
				this.setVisLayout(
					d3.layout.cloud()
						.size([width, height])
						.padding(1)
						.rotate(function() { return ~~(Math.random() * 2) * 90; })
						.spiral('archimedean')
						.font('Impact')
						.fontSize(function(d) {
							return d.fontSize;
						}.bind(this))
						.text(function(d) {
							return d.text;
						})
						.on('end', this.draw.bind(this))
				);
				
				var svg = d3.select(el.dom).append('svg').attr('id','cirrusGraph').attr('width', width).attr('height', height);
				this.setVis(svg.append('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')'));
				
				var tip = Ext.create('Ext.tip.ToolTip', {
					target: svg.node(),
					delegate: 'text',
					trackMouse: true,
					listeners: {
						beforeshow: function(tip) {
							var el = tip.triggerElement;
							var freq = el.getAttribute('data-freq');
							tip.update(freq);
						}
					}
				});
    		}
    	}
    },
    
    buildFromTerms: function() {
    	var terms = this.getTerms();
    	if (this.rendered && terms) {
    		if (this.getApiParam('cirrusForceFlash') === true) {
    			if (this.cirrusFlashApp !== undefined && this.cirrusFlashApp.clearAll !== undefined) {
	    			var words = [];
	    			for (var i = 0; i < terms.length; i++) {
	    				var t = terms[i];
	    				words.push({word: t.text, size: t.rawFreq, label: t.rawFreq});
	    			}
	    			this.cirrusFlashApp.clearAll();
	    			this.cirrusFlashApp.addWords(words);
	    			this.cirrusFlashApp.arrangeWords();
    			} else {
    				Ext.defer(this.buildFromTerms, 50, this);
    			}
    		} else {
	    		var minSize = 1000;
	    		var maxSize = -1;
	    		for (var i = 0; i < terms.length; i++) {
	    			var size = terms[i].rawFreq;
	    			if (size < minSize) minSize = size;
	    			if (size > maxSize) maxSize = size;
	    		}
	    		this.setSmallestWordSize(minSize);
	    		this.setLargestWordSize(maxSize);
	    		
	    		// set the relative sizes for each word (0.0 to 1.0), then adjust based on available area
	    		this.setRelativeSizes();
	    		this.setAdjustedSizes();
	    		
	//    		var fontSizer = d3.scale.pow().range([10, 100]).domain([minSize, maxSize]);
	    		
	    		this.getVisLayout().words(terms).start();
    		}
    	} else {
    		Ext.defer(this.buildFromTerms, 50, this);
    	}
    },
    
    draw: function(words, bounds) {
    	var panel = this;
    	// no longer used
    	// var fill = d3.scale.category20b();
    	var el = this.getLayout().getRenderTarget();
    	var width = this.getVisLayout().size()[0];
    	var height = this.getVisLayout().size()[1];
    	
    	var scale = bounds ? Math.min(
			width / Math.abs(bounds[1].x - width / 2),
			width / Math.abs(bounds[0].x - width / 2),
			height / Math.abs(bounds[1].y - height / 2),
			height / Math.abs(bounds[0].y - height / 2)
    	) / 2 : 1;
    	
		var wordNodes = this.getVis().selectAll('text').data(words, function(d) {return d.text;});
		
		wordNodes.transition().duration(1000)
			.attr('transform', function(d) {
				return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
			})
			.style('font-size', function(d) { return d.fontSize + 'px'; });
		
		wordNodes.enter().append('text')
			.attr('text-anchor', 'middle')
			.attr('data-freq', function(d) {
				return d.rawFreq;
			})
			.attr('transform', function(d) {
				return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
			})
			.style('font-size', '1px').transition().duration(1000).style('font-size', function(d) { return d.fontSize + 'px'; });
		
		wordNodes
			.style('font-family', function(d) { return d.font; })
			.style('fill', function(d) { return panel.getApplication().getColorForTerm(d.text, true); })
			.text(function(d) { return d.text; })
			.on('click', function(obj) {panel.dispatchEvent('termsClicked', panel, [obj.text]);});
		
		wordNodes.exit().remove();
		
		this.getVis().transition().duration(1000).attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')scale(' + scale + ')');
    },
    
    map: function(value, istart, istop, ostart, ostop) {
		return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
	},
	
	calculateSizeAdjustment: function() {
		var terms = this.getTerms();
        if (terms !== undefined) {
			var el = this.getLayout().getRenderTarget();
			
	        var stageArea = el.getWidth() * el.getHeight();
	        if (stageArea < 100000) this.setMinFontSize(8);
	        else this.setMinFontSize(12);
        
	        var pixelsPerWord = stageArea / terms.length;
	        var totalWordsSize = 0;
	        for (var i = 0; i < terms.length; i++) {
	            var word = terms[i];
	            var wordArea = this.calculateWordArea(word);
	            totalWordsSize += wordArea;
	        }
	        this.setSizeAdjustment(stageArea / totalWordsSize);
        }
    },
    
    calculateWordArea: function(word) {
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
    },
    
    setAdjustedSizes: function() {
    	this.calculateSizeAdjustment();
    	var terms = this.getTerms();
    	if (terms !== undefined) {
			for (var i = 0; i < terms.length; i++) {
				var term = terms[i];
				var adjustedSize = this.findNewRelativeSize(term);
				term.fontSize = adjustedSize > this.getMinFontSize() ? adjustedSize : this.getMinFontSize();
			}
    	}
    },
    
    setRelativeSizes: function() {
    	var terms = this.getTerms();
    	if (terms !== undefined) {
	    	for (var i = 0; i < terms.length; i++) {
	            var word = terms[i];
	            word.relativeSize = this.map(word.rawFreq, this.getSmallestWordSize(), this.getLargestWordSize(), 0.1, 1);
	        }
    	}
    },
    
    findNewRelativeSize: function(word) {
    	var areaMultiplier = this.getSizeAdjustment();
        var area = this.calculateWordArea(word) * areaMultiplier;
        // given the area = (x+6)*(2*x/3*y), solve for x
        var newRelativeSize = (Math.sqrt(6) * Math.sqrt(6 * Math.pow(word.text.length, 2) + area * word.text.length) - 6 * word.text.length) / (2 * word.text.length);
        return newRelativeSize;
    }
});
Ext.define('Voyant.panel.CollocatesGraph', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.collocatesgraph',
    statics: {
    	i18n: {
    	},
    	api: {
    		query: undefined,
    		mode: undefined,
    		limit: 5,
    		stopList: 'auto',
    		terms: undefined,
    		context: 5
    	},
		glyph: 'xf1e0@FontAwesome'
    },
    
    config: {
    	corpus: undefined,
    	node: undefined,
    	link: undefined,
    	
    	nodeDataSet: new vis.DataSet(),
    	edgeDataSet: new vis.DataSet(),
    	network: undefined,
    	contextMenu: undefined,
    	
    	force: undefined,
    	graphHeight: undefined,
    	graphWidth: undefined,
    	corpusColours: d3.scale.category10()
    },

    nodeOptions: {
		shape: 'box',
		color: {
			border: 'rgba(0,0,0,0.1)',
			background: 'rgba(255,255,255,1)'
		},
		scaling: {
			label: {
				min: 10, 
				max: 30
			}
		}
	},
	edgeOptions: {
		color: {
			color: 'rgba(0,0,0,0.1)',
			highlight: 'black',
			hover: 'red'
		},
		labelHighlightBold: false
	},
	highlightOptions: {
		font: {
			color: 'white'
		},
		color: {
			background: 'black',
			hover: {
				border: '#CB157F',
				background: '#EB42A5'
			}
		}
	},
	keywordColor: 'green',
	contextColor: 'maroon',
    
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
        		enableOverflow: true,
                items: [{
                   xtype: 'querysearchfield'
                },{
                	text: me.localize('clearTerms'),
					glyph: 'xf014@FontAwesome',
                	handler: function() {
                		this.getNodeDataSet().clear();
                		this.getEdgeDataSet().clear();
                	},
                	scope: me
                },this.localize('context'),{
                	xtype: 'slider',
                	minValue: 3,
                	value: 5,
                	maxValue: 30,
                	increment: 2,
                	width: 50,
                	listeners: {
                		render: function(slider) {
                			slider.setValue(me.getApiParam('context'));
                		},
                		changecomplete: {
                			fn: function(slider, newValue) {
                    			this.setApiParam("context", slider.getValue());
                    			var terms = this.getNodeDataSet().map(function(node) { return node.label; });
                				if (terms.length > 0) {
                					this.getNodeDataSet().clear();
                					this.loadFromQuery(terms);
                				}
                    		},
                    		scope: me
                		}
                	}
                }]
            }]
        });
        
        this.setContextMenu(Ext.create('Ext.menu.Menu', {
			renderTo: Ext.getBody(),
			items: [{
				text: '',
				itemId: 'label',
				disabled: true
			},{
		        xtype: 'menuseparator'
			},{
				xtype: 'menucheckitem',
				text: 'Fixed',
				itemId: 'fixed',
				listeners: {
					checkchange: function(c, checked, e) {
						var n = this.getNetwork().getSelectedNodes();
						if (n[0] != null) {
							this.getNodeDataSet().update({id: n[0], fixed: checked});
						}
					},
					scope: this
				}
			},{
				xtype: 'button',
				text: 'Remove',
				style: 'margin: 5px;',
				handler: function(b, e) {
					var n = this.getNetwork().getSelectedNodes();
					if (n[0] != null) {
						this.getNodeDataSet().remove(n[0]);
						b.up('menu').hide();
						this.forceUpdate();
					}
				},
				scope: this
			}]
		}));
        
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
        	var el = this.getLayout().getRenderTarget();
        	
        	var docked = this.getDockedItems();
        	var dHeight = 0;
        	for (var i = 0; i < docked.length; i++) {
        		dHeight += docked[i].getHeight();
        	}
        	
        	var elHeight = height - dHeight;
        	
        	el.setHeight(elHeight);
        	el.setWidth(el.getWidth());
        	this.setGraphHeight(el.getHeight());
        	this.setGraphWidth(el.getWidth());
        	
        	if (this.getNetwork() !== undefined) {
        		this.getNetwork().fit();
        	}
		}, this);
        
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
    				limit: 3,
    				stopList: this.getApiParam("stopList")
    			}
        	});
    	}
    },
    
    loadFromQuery: function(query) {
    	this.setApiParams({
    		mode: 'corpus'
    	});
    	var params = this.getApiParams();
    	(Ext.isString(query) ? [query] : query).forEach(function(q) {
        	this.getCorpus().getCorpusCollocates({autoLoad: false}).load({
        		params: Ext.apply(Ext.clone(params), {query: q}),
        		callback: function(records, operations, success) {
        			if (success) {
        				this.loadFromCorpusCollocateRecords(records);
        			}
        		},
        		scope: this
        	});
    	}, this)
    },
    
    loadFromCorpusTermRecords: function(corpusTerms) {
    	if (Ext.isArray(corpusTerms) && corpusTerms.length>0) {
    		var terms = [];
    		corpusTerms.forEach(function(corpusTerm) {
    			terms.push(corpusTerm.getTerm());
    		});
    		this.loadFromQuery(terms);
    	}
    },
    
    loadFromCorpusCollocateRecords: function(records, keywordId) {
    	if (Ext.isArray(records)) {
    		var start = this.getApiParam('limit');
    		var nodeDS = this.getNodeDataSet();
    		var edgeDS = this.getEdgeDataSet();
    		var existingKeys = {};
    		nodeDS.forEach(function(item) {
    			existingKeys[item.id] = true;
    		});
    		var newNodes = [];
    		var newEdges = [];
    		
    		records.forEach(function(corpusCollocate, index) {
    			var term = corpusCollocate.getTerm();
    			var contextTerm = corpusCollocate.getContextTerm();
    			var termFreq = corpusCollocate.getKeywordRawFreq();
    			var contextFreq = corpusCollocate.getContextTermRawFreq();
    			
    			if (index == 0) { // only process keyword once
    				if (keywordId === undefined) keywordId = term;
	    			if (existingKeys[keywordId] !== undefined) {
	    				nodeDS.update({id: keywordId, value: termFreq, title: term+' ('+termFreq+')', type: 'keyword', font: {color: this.keywordColor}});
	    			} else {
	    				existingKeys[keywordId] = true;
	    				newNodes.push({
		    				id: term,
	    					label: term,
	    					title: term+' ('+termFreq+')',
	    					type: 'keyword',
	    					value: termFreq,
	    					start: start,
	    					font: {color: this.keywordColor}
						});
	    			}
				}
    			
    			if (term != contextTerm) {
	    			var contextNodeKey = contextTerm;
	    			if (existingKeys[contextNodeKey] !== undefined) {
	    			} else {
	    				existingKeys[contextNodeKey] = true; 
	    				newNodes.push({
    	    				id: contextTerm,
        					label: contextTerm,
        					title: contextTerm+' ('+contextFreq+')',
        					type: 'context',
        					value: contextFreq,
        					start: 0,
        					font: {color: this.contextColor}
    					});
	    			}
	    			
	    			var existingLink = null;
	    			edgeDS.forEach(function(item) {
	    				if ((item.from == keywordId && item.to == contextNodeKey) || (item.from == contextNodeKey && item.to == keywordId)) {
	    					existingLink = item;
	    				}
	    			});
	    			
	    			var linkValue = corpusCollocate.getContextTermRawFreq();
	    			if (existingLink === null) {
	    				newEdges.push({from: keywordId, to: contextNodeKey, value: linkValue});
	    			} else if (existingLink.value < linkValue) {
    					edgeDS.update({id: existingLink.id, value: linkValue});
	    			}
    			}
    		}, this);
    		
    		nodeDS.add(newNodes);
    		edgeDS.add(newEdges);
    		
    		this.forceUpdate();
    		
    		this.getNetwork().fit();
    	}
    },
    
    initGraph: function() {
    	var el = this.getLayout().getRenderTarget();
    	el.setWidth(el.getWidth());
    	el.setHeight(el.getHeight());
    	this.setGraphHeight(el.getHeight());
    	this.setGraphWidth(el.getWidth());
    	
    	if (this.getNetwork() === undefined) {
	    	var options = {
	    		autoResize: true,
				interaction: {
	    			hover: true,
	    			hoverConnectedEdges: true,
	    			multiselect: false
	    		},
	    		physics: {
					barnesHut: {
						"gravitationalConstant": -1500,
						"centralGravity": 6,
						"damping": 0.5,
						"avoidOverlap": 0.5
					}
	    		},
	    		nodes: this.nodeOptions,
	    		edges: this.edgeOptions
	    	};
	    	
	    	
	    	var network = new vis.Network(el.dom, {
	    		nodes: this.getNodeDataSet(),
	    		edges: this.getEdgeDataSet()
	    	}, options);
	
	    	
	    	this.setNetwork(network);
	    	
	    	this.getNodeDataSet().on('remove', function(e, props, sender) {
	    		var key = props.items[0];
	    		var deadEdges = this.getEdgeDataSet().get({
	    			filter: function(item) {
	    				return item.from == key || item.to == key;
	    			}
	    		});
	    		this.getEdgeDataSet().remove(deadEdges);
	    		var orphans = [];
	    		this.getNodeDataSet().forEach(function(node) {
	    			var match = this.getEdgeDataSet().get({
		    			filter: function(item) {
		    				return item.from == node.id || item.to == node.id;
		    			}
		    		});
	    			if (match.length == 0) {
	    				orphans.push(node.id);
	    			}
	    		}.bind(this));
	    		this.getNodeDataSet().remove(orphans);
	    	}.bind(this));
	    	
	    	network.on('dragStart', function(params) {
	    		var n = params.nodes[0];
	    		if (n != null) {
	    			this.getNodeDataSet().update({id: n, fixed: false});
	    		}
	    	}.bind(this));
	    	
	    	network.on('dragging', function(params) {
	    		var n = params.nodes[0];
	    		if (n != null) {
		    		if (this.isMasked()) {
			    		if (!this.isOffCanvas(params.pointer.DOM)) {
			    			this.unmask();
			    		}
			    	}
			    	else if (this.isOffCanvas(params.pointer.DOM)) {
			    		this.mask(this.localize("releaseToRemove"));
			    	}
	    		}
	    	}.bind(this));
	    	
	    	network.on('dragEnd', function(params) {
	    		var n = params.nodes[0];
	    		if (n != null) {
	    			if (this.isOffCanvas(params.pointer.DOM)) {
	    	    		this.unmask();
	    	    		this.mask("cleaning");
	    	    		this.getNodeDataSet().remove(n);
	    	    		this.forceUpdate();
	    	    		this.unmask();
	    	    	} else {
	    	    		this.getNodeDataSet().update({id: n, fixed: true});
	    	    	}
	    		}
	    	}.bind(this));
	    	
	    	network.on('click', function(params) {
	    		this.getContextMenu().hide();
	    		if (params) {
	    			var nodes = this.getNodeDataSet();
	    			if (params.nodes && params.nodes.length>0) {
		    			this.dispatchEvent("termsClicked", this, [nodes.get(params.nodes[0]).label])
		    		} else if (params.edges && params.edges.length>0) {
		    			var edge = this.getEdgeDataSet().get(params.edges[0]);
		    			this.dispatchEvent("termsClicked", this, ['"'+nodes.get(edge.from).label+' '+nodes.get(edge.to).label+'"~'+this.getApiParam('context')])
		    		}
	    		}
	    	}.bind(this));
	    	
	    	network.on('doubleClick', function(params) {
	    		var n = params.nodes[0];
	    		if (n != null) {
	    			var data = this.getNodeDataSet().get(n);
	    			this.itemdblclick(data);
	    		}
	    	}.bind(this));
	    	
	    	network.on('oncontext', function(params) {
	    		params.event.preventDefault();
	    		var n = this.getNetwork().getNodeAt(params.pointer.DOM);
	    		if (n != null) {
	    			this.getNetwork().selectNodes([n]);
	    			var data = this.getNodeDataSet().get(n);
	    			var menu = this.getContextMenu();
	    			menu.queryById('label').setText(data.label);
	    			menu.queryById('fixed').setChecked(data.fixed);
	    			menu.showAt(params.event.pageX, params.event.pageY);
	    		}
	    	}.bind(this));
    	}
    },
    
    forceUpdate: function() {
    	// force visjs to apply scaling
    	var ids = this.getNodeDataSet().map(function(item) {
			return {id: item.id};
		});
		this.getNodeDataSet().update(ids);
		ids = this.getEdgeDataSet().map(function(edge) {
			return {id: edge.id}
		})
		this.getEdgeDataSet().update(ids);
    },
    
    isOffCanvas: function(d) {
    	return d.x < 0 || d.y < 0 || d.x > this.getGraphWidth() || d.y > this.getGraphHeight();
    },

    itemdblclick: function(d) {
    	var limit = this.getApiParam('limit');
    	var corpusCollocates = this.getCorpus().getCorpusCollocates({autoLoad: false});
    	corpusCollocates.load({
    		params: Ext.apply(this.getApiParams(), {query: d.id, start: d.start, limit: limit}),
    		callback: function(records, operation, success) {
    			if (success) {
    	    		this.getNodeDataSet().update({id: d.id, start: d.start+limit});
    	    		
	    			var keywordNodeKey = d.id;
	    			
    	    		this.loadFromCorpusCollocateRecords(records, keywordNodeKey);
    			}
    		},
    		scope: this
    	});
    }
    
});
Ext.define('Voyant.panel.Contexts', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	requires: ['Voyant.data.store.Contexts'],
	alias: 'widget.contexts',
	isConsumptive: true,
    statics: {
    	i18n: {
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
            store : Ext.create("Voyant.data.store.ContextsBuffered", {
            	parentPanel: this,
            	proxy: {
            		extraParams: {
                    	stripTags: "all"            			
            		}
            	}
//            	sortOnLoad: true,
//            	sorters: {
//                    property: 'position',
//                    direction: 'ASC'
//            	}
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
        		enableOverflow: true,
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
                			slider.setValue(me.getApiParam('context'));
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
                			slider.setValue(me.getApiParam('expand'));
                		},
                		changecomplete: function(slider, newValue) {
                			me.setApiParam('expand', newValue);
                			var view = me.getView();
                			var recordsExpanded = me.plugins[0].recordsExpanded;
                			var store = view.getStore();
                			for (var id in recordsExpanded) {
                				var record = store.getByInternalId(id);
            					var row = view.getRow(record);
            					var expandRow = row.parentNode.childNodes[1];
                				if (recordsExpanded[id]) {
                					view.fireEvent("expandbody", row, record, expandRow, {force: true});
                				} else {
                					Ext.fly(expandRow).down('.x-grid-rowbody').setHtml('');
                				}
                			}
                		}
                	}
                },{
        			xtype: 'corpusdocumentselector'
        		}]
            }],
    		columns: [{
    			text: this.localize("document"),
    			toolTip: this.localize("documentTip"),
                width: 'autoSize',
        		dataIndex: 'docIndex',
                sortable: true,
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
            },{
    			text: this.localize("position"),
    			tooltip: this.localize("positionTip"),
        		dataIndex: 'position',
                sortable: true,
                hidden: true,
                flex: 1
            }],
            listeners: {
            	scope: this,
				corpusSelected: function() {
					if (this.getStore().getCorpus()) {
						this.setApiParams({docId: undefined, docIndex: undefined})
						this.getStore().loadPage(1)
					}
				},
				
				documentsSelected: function(src, docs) {
					var docIds = [];
					var corpus = this.getStore().getCorpus();
					docs.forEach(function(doc) {
						docIds.push(corpus.getDocument(doc).getId())
					}, this);
					this.setApiParams({docId: docIds, docIndex: undefined})
					this.getStore().loadPage(1)
				},

            	documentSegmentTermClicked: {
	           		 fn: function(src, documentSegmentTerm) {
	           			 if (!documentSegmentTerm.term) {return;}
	           			 params = {query: documentSegmentTerm.term};
	           			 if (documentSegmentTerm.docId) {
	           				 params.docId = documentSegmentTerm.docId;
	           			 }
	           			 else {
	           				 // default to first document
	           				 params.docIndex = documentSegmentTerm.docIndex ?  documentSegmentTerm.docIndex : 0;
	           			 }
	           			 this.setApiParams(params);
	       	        	if (this.isVisible()) {
	       		        	this.getStore().loadPage(1);
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
	       	        	if (this.isVisible()) {
	       		        	this.getStore().loadPage(1, {params: this.getApiParams()});
	       	        	}
	           		 },
	           		 scope: this
	           	 },
                 afterrender: function(me) {
                	 me.getView().on('expandbody', function( rowNode, record, expandRow, eOpts ) {
                		 if (expandRow.innerText==="" || (eOpts && eOpts.force)) {
                	            var store = Ext.create("Voyant.data.store.Contexts", {
                	            	stripTags: "all",
                	            	corpus: me.getStore().getCorpus()
                	            });
                	            var data = record.getData();
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
                	            });
                	            
                		 }
                	 });
                 }

            }
        });
        
        me.on("loadedCorpus", function(src, corpus) {
        	if (corpus.getNoPasswordAccess()=='NONCONSUMPTIVE') {
        		this.mask(this.localize('limitedAccess'), 'mask-no-spinner');
        	}
        	else {
        		var corpusTerms = corpus.getCorpusTerms({autoLoad: false});
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
        				query: this.getApiParam("query"),
        				stopList: this.getApiParam("stopList")
        			}
            	});
        	}
        });
        
        me.on("query", function(src, query) {
        	this.setApiParam('query', query);
        	this.getStore().loadPage(1, {params: this.getApiParams()});
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
        	if (Ext.isString(terms)) {terms = [terms];}
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
     
});
Ext.define('Voyant.panel.CorpusCollocates', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.corpuscollocates',
	config: {
		corpus: undefined
	},
    statics: {
    	i18n: {
    	},
    	api: {
    		stopList: 'auto',
    		context: 5,
    		query: undefined,
    		docId: undefined,
    		docIndex: undefined,
    		sort: 'contextTermRawFreq'
    	},
		glyph: 'xf0ce@FontAwesome'
    },
    config: {
    	options: {xtype: 'stoplistoption'}
    },
    constructor: function(config) {
    	
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
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

        var store = Ext.create("Voyant.data.store.CorpusCollocatesBuffered", {parentPanel: this});
        
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
        		enableOverflow: true,
                items: [{
                    xtype: 'querysearchfield'
                }, {
                    xtype: 'totalpropertystatus'
                }, this.localize('context'), {
                	xtype: 'slider',
                	minValue: 1,
                	value: 5,
                	maxValue: 30,
                	increment: 2,
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
                    			if (Ext.isString(term)) {queryTerms.push(term);}
                    			else if (term.term) {queryTerms.push(term.term);}
                    			else if (term.getTerm) {queryTerms.push(term.getTerm());}
                    		});
                    		if (queryTerms.length > 0) {
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
	isConsumptive: true,
    statics: {
    	i18n: {
    	},
    	api: {
    		inputFormat: undefined,
    		xmlDocumentsXpath: undefined,
    		xmlContentXpath: undefined,
    		xmlTitleXpath: undefined,
    		xmlAuthorXpath: undefined,
    		tokenization: undefined,
    		adminPassword: undefined,
    		accessPassword: undefined,
    		accessModeWithoutPassword: undefined,
    		tableDocuments: undefined,
    		tableContent: undefined,
    		tableTitle: undefined,
    		tableAuthor: undefined
    	}
    },
    config: {
    	corpus: undefined
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
        		enableOverflow: true,
                dock: 'bottom',
    	    	buttonAlign: 'right',
//    	    	defaultButtonUI : 'default',
	    		items: [{
	    			text: me.localize('Open'),
                    glyph: 'xf115@FontAwesome', // not visible
	    			tooltip: me.localize('SelectExisting'),
	    			hidden: this.getCorpus()!=undefined,
	    			handler: function() {
	    				Ext.create('Ext.window.Window', {
	    				    title: me.localize('Open'),
	    				    layout: 'fit',
	    				    modal: true,
	    				    items: {  // Let's put an empty grid in just to illustrate fit layout
	    				        xtype: 'form',
	    				        submitEmptyText: false,
	    				        margin: '5,5,5,5',
	    				        items: {
	    				        	xtype: 'corpusselector'
//	    				            xtype:'combo',
//	    				            labelWidth: 150,
//	    				            fieldLabel:'Choose a corpus:',
//	    				            name:'corpus',
//	    				            queryMode:'local',
//	    				            store:[['shakespeare',"Shakespeare's Plays"],['austen',"Austen's Novels"]],				            
//	    				            forceSelection:true
	    				        },
	    				        buttons: [
	    				        	{
	    				        		text: me.localize('Open'),
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
	    				    	        		    title: me.localize('SelectExisting'),
	    				    	        		    message: me.localize('PleaseSelectExisting'),
	    				    	        		    buttons: Ext.Msg.OK,
	    				    	        		    icon: Ext.Msg.ERROR
	    				    	        		});
	    				        			}
	    				        		},
	    				        		flex: 1
	    				            },{
	    				        		text: me.localize('cancel'),
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
    	        	xtype: 'fileuploadfield',
                    glyph: 'xf093@FontAwesome',
    	        	name: 'upload',
        	    	buttonOnly: true,
        	    	hideLabel: true,
		            ui: 'default-toolbar',
        	    	buttonText: me.localize('Upload'),
        	    	listeners: {
        	    		render: function(filefield) {
        	    			filefield.fileInputEl.dom.setAttribute('multiple', true);
        		        	Ext.tip.QuickTipManager.register({
       		                 target: filefield.getEl(),
       		                 text: me.localize('UploadLocal')
       		             	});
        	            },
        	            change: function(filefield, value) {
        	            	if (value) {
            	            	var form = filefield.up('form').getForm();
            	            	if (form.isValid()) {
            	            		var files = filefield.fileInputEl.dom.files;
            	            		var badFilesRe = /\.(png|gif|jpe?g|xls|mp[234a]|mpeg|exe|wmv|avi|ppt|mpg|tif|wav|mov|psd|wma|ai|bmp|pps|aif|pub|dwg|indd|swf|asf|mbd|dmg|flv)$/i;
            	            		var goodFilesRe = /\.(txt|pdf|html?|xml|docx?|rtf|pages|odt|zip|jar|tar|gz|ar|cpio|bzip2|bz2|gzip|xlsx?)$/i;
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
	    		},'->', {
	    	    	xtype: 'button',
	    	    	scale: 'large',
        			glyph: 'xf00d@FontAwesome',
	    	    	text: this.localize('cancel'),
	    	    	hidden: this.getCorpus()==undefined,
	    	    	handler: function(btn) {
	    	        	var win = this.up("window");
	    	        	if (win && win.isFloating()) {
	    	        		win.close();
	    	        	}
	    	    	}
	    	    }, {
	    	    	xtype: 'button',
	    	    	scale: 'large',
                    glyph: 'xf00c@FontAwesome',
	    	    	text: this.localize('reveal'),
	    	    	ui: 'default',
	    	    	width: 200,
	    	    	handler: function(btn) {
	    	        	var input = btn.up('form').down('#input').getValue();
	    	        	if (input !== '') {
	    	        		var api = me.getApiParams();
	    	            	delete api.view;
	    	            	delete api.stopList;
	    	        		if (api.inputFormat && input.trim().indexOf("<")!==0) {
	    	        			Ext.Msg.confirm(me.localize('error'), me.localize('errorNotXmlContinue'), function(buttonId) {
	    	        				if (buttonId=='yes') {
				    	        		me.loadCorpus(Ext.apply(api, {input: input}));
	    	        				}
	    	        			}, me);
	    	        		}
	    	        		else {
		    	        		me.loadCorpus(Ext.apply(api, {input: input}));
	    	        		}
	    	        	}
	    	        	else {
	    	        		Ext.Msg.show({
	    	        		    title: me.localize('noTextProvided'),
	    	        		    message: me.localize('pleaseProvideText'),
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
    	var params = {tool: this.getCorpus() ? 'corpus.CorpusMetadata' : 'corpus.CorpusCreator'};
    	if (this.getCorpus()) {
    		Ext.apply(params, {
    			corpus: this.getCorpus().getId(),
    			addDocuments: true
    		})
    	};
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
					this.setCorpus(undefined)
					this.loadCorpus({corpus: action.result.corpus ? action.result.corpus.metadata.id : action.result.stepEnabledCorpusCreator.storedId});
				}
			},
			scope: this
		});
    },
   
    loadCorpus: function(params) {
    	if (this.getCorpus()) {
    		Ext.apply(params, {
    			corpus: this.getCorpus().getId(),
    			addDocuments: true
    		})
    	};
    	
    	var win = this.up("window");
    	if (win && win.isFloating()) {
    		win.close();
    	}
    	
		this.getApplication().loadCorpusFromParams(params);
    },
    
    showOptionsClick: function(panel) {
    	var me = panel;
    	if (me.optionsWin === undefined) {
    		me.optionsWin = Ext.create('Ext.window.Window', {
    			title: me.localize('gearWinTitle'),
    			closeAction: 'hide',
//    			width: 500,
    			layout: 'fit',
    			bodyPadding: 10,
    			items: [{
    				xtype: 'form',
    				defaultType: 'textfield',
        			maxHeight: panel.up('viewport').getHeight()-300,
        			scrollable: true,
    				fieldDefaults: {
    					labelAlign: 'right',
    					labelWidth: 110,
    					width: 350
    				},
    				items: [
						{
						    xtype:'combo',
						    fieldLabel: me.localize('inputFormat'),
						    labelWidth: 90, // try to align with fieldset
						    name: 'inputFormat',
						    queryMode:'local',
						    store:[['',me.localize('inputFormatAuto')],['dtoc','DToC: Dynamic Table of Contexts'],['TEI',"TEI: Text Encoding Initative"],['TEI',"TEI Corpus"],['RSS',"Really Simple Syndication: RSS"]],
						    value: ''
						},{
							xtype: 'container',
							html: '<p><i>'+new Ext.Template(me.localize('advancedOptionsText')).applyTemplate([me.getBaseUrl()+'docs/#!/guide/corpuscreator-section-xml'])+'</i></p>',
							width: 375
						},{
	        				xtype: 'fieldset',
	                        title: "<a href='"+me.getBaseUrl()+"docs/#!/guide/corpuscreator-section-xml' target='voyantdocs'>"+me.localize('xmlOptions')+"</a>",
	                        collapsible: true,
	                        collapsed: true,
	                        defaultType: 'textfield',
	                        items: [
	                            {
	    							xtype: 'container',
	    							html: '<p><i>'+me.localize("xmlOptionsText")+'</i></p>',
	    							width: 375
	                            },{
									fieldLabel: me.localize('xpathContent'),
									name: 'xmlContentXpath'
								},{
									fieldLabel: me.localize('xpathTitle'),
									name: 'xmlTitleXpath'
								},{
									fieldLabel: me.localize('xpathAuthor'),
									name: 'xmlAuthorXpath'
								},{
									fieldLabel: me.localize('xpathDocuments'),
									name: 'xmlDocumentsXpath'
								},{
									fieldLabel: me.localize('xpathGroupBy'),
									name: 'xmlGroupByXpath'
								}
							]
						},{
	        				xtype: 'fieldset',
	                        title: "<a href='"+me.getBaseUrl()+"docs/#!/guide/corpuscreator-section-tables' target='voyantdocs'>"+me.localize('tableOptions')+"</a>",
	                        collapsible: true,
	                        collapsed: true,
	                        defaultType: 'textfield',
	                        items: [{
	    							xtype: 'container',
	    							html: '<p><i>'+new Ext.Template(me.localize('tableOptionsText')).applyTemplate([me.getBaseUrl()+'docs/#!/guide/corpuscreator-section-tables'])+'</i></p>',
	    							width: 375
	                        	},{
								    xtype:'combo',
									fieldLabel: me.localize('tableDocuments'),
								    name: 'tableDocuments',
								    queryMode:'local',
								    store:[['',me.localize('tableDocumentsTable')],['rows',me.localize('tableDocumentsRows')],['columns',me.localize("tableDocumentsColumns")]],
								    forceSelection:true,
								    value: ''
								},{
	    							xtype: 'container',
	    							html: '<p><i>'+me.localize("tableNoHeadersRowText")+'</i></p>',
	    							width: 375
	                            },{
									fieldLabel: me.localize("tableNoHeadersRow"),
									xtype: 'checkboxfield',
									name: 'tableNoHeadersRow',
									inputValue: "true"
								},{
	    							xtype: 'container',
	    							html: '<p><i>'+me.localize("tableContentText")+'</i></p>',
	    							width: 375
	                            },{
									fieldLabel: me.localize('tableContent'),
									validator: function(val) {return me.validatePositiveNumbersCsv.call(me, val)},
									name: 'tableContent'
								},{
	    							xtype: 'container',
	    							html: '<p><i>'+me.localize("tableMetadataText")+'</i></p>',
	    							width: 375
	                            },{
									fieldLabel: me.localize('tableAuthor'),
									validator: function(val) {return me.validatePositiveNumbersCsv.call(me, val)},
									name: 'tableAuthor'
								},{
									fieldLabel: me.localize('tableTitle'),
									validator: function(val) {return me.validatePositiveNumbersCsv.call(me, val)},
									name: 'tableTitle'
								}
							]
						},{
	        				xtype: 'fieldset',
	                        title: "<a href='"+me.getBaseUrl()+"docs/#!/guide/corpuscreator-section-tokenization' target='voyantdocs'>"+me.localize('tokenizationOptions')+"</a>",
	                        collapsible: true,
	                        collapsed: true,
	                        items: [
								{
								    xtype:'combo',
								    fieldLabel: me.localize('tokenization'),
								    name: 'tokenization',
								    queryMode:'local',
								    store:[['',me.localize('tokenizationAuto')],['wordBoundaries',me.localize("tokenizationWordBoundaries")]],
								    forceSelection:true,
								    value: ''
								}
							]
						},{
	        				xtype: 'fieldset',
	                        title: "<a href='"+me.getBaseUrl()+"docs/#!/guide/corpuscreator-section-access-management' target='voyantdocs'>"+me.localize('accessOptions')+"</a>",
	                        collapsible: true,
	                        collapsed: true,
	                        defaultType: 'textfield',
	                        items: [
	                            {
	    							xtype: 'container',
	    							html: '<p><i>'+me.localize("accessOptionsText")+'</i></p>',
	    							width: 375
	                            },{
									fieldLabel: me.localize('adminPassword'),
									name: 'adminPassword'
								},{
									fieldLabel: me.localize('accessPassword'),
									name: 'accessPassword'
								},{
	    							xtype: 'container',
	    							html: '<p><i>'+me.localize("accessModeWithoutPasswordText")+'</i></p>',
	    							width: 375
	                            },{
								    xtype:'combo',
									fieldLabel: me.localize('accessModeWithoutPassword'),
								    name: 'noPassordAccess',
								    queryMode:'local',
								    store:[['',me.localize('accessModeNonConsumptive')],['none',me.localize("accessModeNone")]],
								    forceSelection:true,
								    value: ''
								}
							]
						}
						
					]
    			}],
    			buttons: [{
    				text: me.localize('ok'),
    				handler: function(button, event) {
    					var win = button.findParentByType('window');
    					var form = win.down('form');
    					if (form.isValid()) {
        					var params = form.getValues();
        					me.setApiParams(params);
        					win.hide();
    					}
    					else {
    						me.showError({
    							message: me.localize("invalidForm")
    						})
    					}
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
    },
    
    validatePositiveNumbersCsv: function(val) {
    	val = val.trim();
    	if (val.length>0) {
        	if (/[^\d,+ ]/.test(val)) {
        		return this.localize("numbersCommasOnly");
        	}
        	if (/\d\s+\d/.test(val)) {
        		return this.localize("numbersNeedCommas");
        	}
        	var numbers = val.split(/\s*[,+]\s*/), number;
        	for (var i=0, len=numbers.length; i<len; i++) {
        		number = numbers[i];
        		if (number.length==0) {
        			return this.localize("numberEmpty")
        		}
        		if (parseInt(number)==0) {
        			return this.localize("numberZero")
        		}
        	}
    	}
    	return true;
	}
    
});
// assuming Knots library is loaded by containing page (via voyant.jsp)
Ext.define('Voyant.panel.Knots', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.knots',
    statics: {
    	i18n: {
    	},
    	api: {
    		/**
        	 * @property query A string to search for in a document.
        	 * @type String
    		 * @private
        	 */
    		query: null,
    		/**
    		 * @property stopList The stop list to use to filter results.
    		 * Choose from a pre-defined list, or enter a comma separated list of words, or enter an URL to a list of stop words in plain text (one per line).
    		 * @type String
    		 * @private
    		 */
    		stopList: 'auto',
    		/**
    		 * @property docId The document ID to restrict results to.
    		 * @type String
    		 * @private
    		 */
    		docId: undefined,
    		
    		audio: false
    	},
    	glyph: 'xf06e@FontAwesome'
	},
	config: {
		corpus: undefined,
		docTermStore: undefined,
		tokensStore: undefined,
    	options: {xtype: 'stoplistoption'},
    	refreshInterval: 100,
    	startAngle: 315,
    	angleIncrement: 15,
    	currentTerm: undefined
	},
	
    knots: null,
	
	termTpl: new Ext.XTemplate(
		'<tpl for=".">',
			'<div class="term" style="color: rgb({color});float: left;padding: 3px;margin: 2px;">{term}</div>',
		'</tpl>'
	),
	termStore: new Ext.data.ArrayStore({
        fields: ['term', 'color']
    }),
	
    constructor: function() {
    	var rurl = this.getBaseUrl()+"resources/knots/";
    	Ext.apply(this, {
    		title: this.localize('title'),
    		html: "<audio src='"+rurl+"bone-crack.m4a' preload='auto'></audio>"
    	});
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
    	this.on('loadedCorpus', function(src, corpus) {
    		this.setCorpus(corpus);
    		
    		var firstDoc = corpus.getDocument(0);
    		var pDoc = this.processDocument(firstDoc);
    		this.knots.setCurrentDoc(pDoc);
    		
    		this.setApiParams({docId: firstDoc.getId()});
    		this.getDocTermStore().getProxy().setExtraParam('corpus', corpus.getId());
    		this.getTokensStore().setCorpus(corpus);
    		this.getDocTermStore().load({params: {
		    	limit: 5,
		    	stopList: this.getApiParams('stopList')
		    }});
    	}, this);
    	
        this.on('activate', function() { // load after tab activate (if we're in a tab panel)
			if (this.getCorpus()) {				
				Ext.Function.defer(function() {
					this.getDocTermStore().load({params: {
				    	limit: 5,
				    	stopList: this.getApiParams('stopList')
				    }});
				}, 100, this);
			}
    	}, this);
        
        this.on('query', function(src, query) {
    		if (query !== undefined && query != '') {
    			this.getDocTermsFromQuery(query);
    		}
    	}, this);
        
        this.on('documentSelected', function(src, doc) {
        	
        	var document = this.getCorpus().getDocument(doc)
        	this.setApiParam('docId', document.getId());
        	
        	var terms = this.knots.currentDoc.terms;
        	var termsToKeep = [];
        	for (var t in terms) {
        		termsToKeep.push(t);
        	}
        	
//        	this.termStore.removeAll();
    		this.setApiParams({query: termsToKeep});
    		
    		var limit = termsToKeep.length;
    		if (limit === 0) {
    			limit = 5;
    		}
        	
        	this.knots.setCurrentDoc(this.processDocument(document));
        	
        	this.getDocTermStore().load({params: {
		    	query: termsToKeep,
		    	limit: limit,
		    	stopList: this.getApiParams('stopList')
		    }});
        }, this);
        
        this.on('termsClicked', function(src, terms) {
    		var queryTerms = [];
    		terms.forEach(function(term) {
    			if (Ext.isString(term)) {queryTerms.push(term);}
    			else if (term.term) {queryTerms.push(term.term);}
    			else if (term.getTerm) {queryTerms.push(term.getTerm());}
    		});
    		if (queryTerms.length > 0) {
    			this.getDocTermsFromQuery(queryTerms);
    		}
		}, this);
        
		this.on('corpusTermsClicked', function(src, terms) {
			var queryTerms = [];
    		terms.forEach(function(term) {
    			if (term.getTerm()) {queryTerms.push(term.getTerm());}
    		});
    		this.getDocTermsFromQuery(queryTerms);
		}, this);
		
		this.on('documentTermsClicked', function(src, terms) {
			var queryTerms = [];
    		terms.forEach(function(term) {
    			if (term.getTerm()) {queryTerms.push(term.getTerm());}
    		});
    		this.getDocTermsFromQuery(queryTerms);
		}, this);
    },
    
    initComponent: function() {
    	this.setDocTermStore(Ext.create("Ext.data.Store", {
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
   		    	 beforeload: function(store) {
   		    		 store.getProxy().setExtraParam('docId', this.getApiParam('docId'));
   		    	 },
   		    	 load: function(store, records, successful, options) {
   		    		var termObj = {};
   		    		if (records && records.length>0) {
   	   		    		records.forEach(function(record) {
   	   		    			var termData = this.processTerms(record);
   	   		    			var docId = record.get('docId');
   	   		    			var term = record.get('term');
   	   		    			termObj[term] = termData;
   	   		    		}, this);
   	   		    		this.knots.addTerms(termObj);
   	   		    		this.knots.buildGraph();
   		    		}
   		    		else {
   		    			this.toastInfo({
   		    				html: this.localize("noTermsFound"),
   		    				align: 'bl'
   		    			})
   		    		}
   				},
   				scope: this
   		     }
    	}));
    	
    	this.setTokensStore(Ext.create("Voyant.data.store.Tokens", {
        	stripTags: "all",
        	listeners: {
        		beforeload: function(store) {
  		    		 store.getProxy().setExtraParam('docId', this.getApiParam('docId'));
  		    	},
        		load: function(store, records, successful, options) {
        			var context = '';
        			var currTerm = this.getCurrentTerm();
        			records.forEach(function(record) {
        				if (record.getPosition() == currTerm.tokenId) {
        					context += '<strong>'+record.getTerm()+'</strong>';
        				} else {
        					context += record.getTerm();
        				}
        			});
        			
        			Ext.Msg.show({
        				title: this.localize('context'),
        				message: context,
        				buttons: Ext.Msg.OK,
        			    icon: Ext.Msg.INFO
        			});
        		},
   				scope: this
        	}
        }));
    	
    	Ext.apply(this, {
    		dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
        		enableOverflow: true,
                items: [{
                	xtype: 'querysearchfield'
                },{
	            	text: this.localize('clearTerms'),
	            	glyph: 'xf00d@FontAwesome',
	            	handler: function() {
	            		this.down('#termsView').getSelectionModel().deselectAll(true);
	            		this.termStore.removeAll();
	            		this.setApiParams({query: null});
	            		this.knots.removeAllTerms();
	            		this.knots.drawGraph();
	            	},
	            	scope: this
	            },{
	            	xtype: 'documentselectorbutton',
	            	singleSelect: true
	            },{
					xtype: 'slider',
					itemId: 'speed',
					fieldLabel: this.localize("speed"),
					labelAlign: 'right',
					labelWidth: 50,
					width: 100,
					increment: 50,
					minValue: 0,
					maxValue: 500,
					value: 500-this.getRefreshInterval(),
					listeners: {
						changecomplete: function(slider, newvalue) {
							this.setRefreshInterval(500-newvalue);
							if (this.knots) {this.knots.buildGraph();}
						},
						scope: this
					}
				},{
					xtype: 'slider',
					itemId: 'startAngle',
					fieldLabel: this.localize('startAngle'),
					labelAlign: 'right',
					labelWidth: 35,
					width: 85,
					increment: 15,
					minValue: 0,
					maxValue: 360,
					value: this.getStartAngle(),
					listeners: {
						changecomplete: function(slider, newvalue) {
							this.setStartAngle(newvalue);
							if (this.knots) {this.knots.buildGraph();}
						},
						scope: this
					}
				},{
					xtype: 'slider',
					itemId: 'tangles',
					fieldLabel: this.localize('tangles'),
					labelAlign: 'right',
					labelWidth: 30,
					width: 80,
					increment: 5,
					minValue: 5,
					maxValue: 90,
					value: this.getAngleIncrement(),
					listeners: {
						changecomplete: function(slider, newvalue) {
							this.setAngleIncrement(newvalue);
							if (this.knots) {this.knots.buildGraph();}
						},
						scope: this
					}
				},{
	                xtype: 'checkbox',
	                boxLabel: this.localize('sound'),
	                listeners: {
	                	render: function(cmp) {
	                		cmp.setValue(this.getApiParam("audio")===true ||  this.getApiParam("audio")=="true")
	    		        	Ext.tip.QuickTipManager.register({
	    		        		target: cmp.getEl(),
	   		                 	text: this.localize('soundTip')
	    		        	});
	                		
	                	},
	                    change: function(cmp, val) {
	                    	if (this.knots) {
		                    	this.knots.setAudio(val);
	                    	}
	                    },
	                    scope: this
	                }
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
	            	selectionModel: {
	            		mode: 'SIMPLE'
	            	},
//	            	cls: 'selected', // default selected
	            	focusCls: '',
	            	listeners: {
	            		beforeitemclick: function(dv, record, item, index, event, opts) {
	            			event.preventDefault();
	            			event.stopPropagation();
	            			dv.fireEvent('itemcontextmenu', dv, record, item, index, event, opts);
	            			return false;
	            		},
	            		beforecontainerclick: function() {
	            			// cancel deselect all
	            			event.preventDefault();
	            			event.stopPropagation();
	            			return false;
	            		},
	            		selectionchange: function(selModel, selections) {
	            			var dv = this.down('#termsView');
	            			var terms = [];
	            			
	            			dv.getStore().each(function(r) {
	            				if (selections.indexOf(r) !== -1) {
	            					terms.push(r.get('term'));
	            					Ext.fly(dv.getNodeByRecord(r)).removeCls('unselected').addCls('selected');
	            				} else {
	            					Ext.fly(dv.getNodeByRecord(r)).removeCls('selected').addCls('unselected');
	            				}
	            			});
	            			
	            			this.knots.termsFilter = terms;
	            			this.knots.drawGraph();
	            		},
	            		itemcontextmenu: function(dv, record, el, index, event) {
	            			event.preventDefault();
	            			event.stopPropagation();
	            			var isSelected = dv.isSelected(el);
	            			var menu = new Ext.menu.Menu({
	            				floating: true,
	            				items: [{
	            					text: isSelected ? this.localize('hideTerm') : this.localize('showTerm'),
	            					handler: function() {
	            						if (isSelected) {
	            							dv.deselect(index);
	            						} else {
	            							dv.select(index, true);
	            						}
	            					},
	            					scope: this
	            				},{
	            					text: this.localize('removeTerm'),
	            					handler: function() {
	            						dv.deselect(index);
	            						var term = this.termStore.getAt(index).get('term');
	            						this.termStore.removeAt(index);
	            						dv.refresh();
	            						
	            						this.knots.removeTerm(term);
	            						this.knots.drawGraph();
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
	                	this.knots = new Knots({
	                		container: canvasParent,
	                		clickHandler: this.knotClickHandler.bind(this),
	                		audio: this.getApiParam("audio")===true ||  this.getApiParam("audio")=="true"
	                	});
	            	},
            		afterlayout: function(container) {
            			if (this.knots.initialized === false) {
            				this.knots.initializeCanvas();
            			}
            		},
	        		resize: function(cnt, width, height) {
	        			this.knots.doLayout();
	        		},
            		scope: this
            	}
            }
		});
    	
    	this.callParent(arguments);
    },
    
    updateRefreshInterval: function(value) {
    	if (this.knots) {
    		if (value < 50) {
    			value = 50;
    			this.knots.progressiveDraw = false;
    		} else {
    			this.knots.progressiveDraw = true;
    		}
    		this.knots.refreshInterval = value;
			this.knots.buildGraph(this.knots.drawStep);
    	}
    },
    
    updateStartAngle: function(value) {
    	if (this.knots) {
			this.knots.startAngle = value;
			this.knots.recache();
			this.knots.buildGraph();
    	}
    },
    
    updateAngleIncrement: function(value) {
    	if (this.knots) {
	    	this.knots.angleIncrement = value;
			this.knots.recache();
			this.knots.buildGraph();
    	}
    },
    
    loadFromCorpusTerms: function(corpusTerms) {
    	if (this.knots) { // get rid of existing terms
    		this.knots.removeAllTerms();
    		this.termStore.removeAll(true);
    	}
		corpusTerms.load({
		    callback: function(records, operation, success) {
		    	var query = []; //this.getApiParam('query') || [];
				if (typeof query == 'string') query = [query];
		    	records.forEach(function(record, index) {
					query.push(record.get('term'));
				}, this);
		    	this.getDocTermsFromQuery(query);
		    },
		    scope: this,
		    params: {
		    	limit: 5,
		    	stopList: this.getApiParams('stopList')
		    }
    	});
    },
    
    /**
     * Get the results for the query(s) for each of the corpus documents.
     * @param query {String|Array}
     * @private
     */
    getDocTermsFromQuery: function(query) {
    	if (query) {this.setApiParam("query", query);} // make sure it's set for subsequent calls
    	var corpus = this.getCorpus();
    	if (corpus && this.isVisible()) {
    		this.setApiParams({query: query}); // assumes docId already set
			this.getDocTermStore().load({params: this.getApiParams()});
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
	
	// produce format that knots can use
	processDocument: function(doc) {
		var title = doc.getShortTitle();
		title = title.replace('&hellip;', '...');
	
		return {
			id: doc.getId(),
			index: doc.get('index'),
			title: title,
			totalTokens: doc.get('tokensCount-lexical'),
			terms: {},
			lineLength: undefined
		};
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
				var index = this.termStore.find('term', term);
				this.down('#termsView').select(index, true); // manually select since the store's load listener isn't triggered
			}
			var distributions = termRecord.get('distributions');
			termObj = {term: term, positions: positions, distributions: distributions, rawFreq: rawFreq, color: color};
		} else {
			termObj = false;
		}
		
		return termObj;
	},
	
	knotClickHandler: function(data) {
		this.setCurrentTerm(data);
		var start = data.tokenId - 10;
		if (start < 0) start = 0;
		this.getTokensStore().load({
			start: start,
			limit: 21
		});
		
		data = [data].map(function(item) {return item.term}); // make an array for the event dispatch
		this.getApplication().dispatchEvent('termsClicked', this, data);
	}
});
Ext.define('Voyant.panel.Phrases', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.phrases',
    statics: {
    	i18n: {
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

        var store = Ext.create("Voyant.data.store.CorpusNgramsBuffered", {
        	parentPanel: me
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
        		enableOverflow: true,
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
                           {
                        	   xtype: 'menucheckitem',
                               text: this.localize("overlapNone"),
                               group: 'overlap',
                               inputValue: 'none',
                               checkHandler: function() {
                            	   this.setApiParam('overlapFilter', 'none')
                            	   this.getStore().load({params: this.getApiParams()})
                               },
                               scope: this
                           }, {
                        	   xtype: 'menucheckitem',
                               text: this.localize("overlapLength"),
                               group: 'overlap',
                               inputValue: 'length',
                               checkHandler: function() {
                            	   this.setApiParam('overlapFilter', 'length')
                            	   this.getStore().load({params: this.getApiParams()})
                               },
                               scope: this
                           }, {
                        	   xtype: 'menucheckitem',
                               text: this.localize("overlapFreq"),
                               group: 'overlap',
                               inputValue: 'rawFreq',
                               checkHandler: function() {
                            	   this.setApiParam('overlapFilter', 'rawfreq')
                            	   this.getStore().load({params: this.getApiParams()})
                               },
                               scope: this
                           }
	                   ],
	                   listeners: {
	                	   afterrender: {
	                		   fn: function(menu) {
	                			   var overlapFilter = this.getApiParam('overlapFilter');
	                			   menu.items.each(function(item) {
	                				   if (item.group) {
	                					   item.setChecked(item.inputValue==overlapFilter);
	                				   }
	                			   }, this)
	                		   },
	                		   scope: this
	                	   }
                
	                   }
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
                    			if (Ext.isString(term)) {queryTerms.push(term);}
                    			else if (term.term) {queryTerms.push(term.term);}
                    			else if (term.getTerm) {queryTerms.push(term.getTerm());}
                    		});
                    		if (queryTerms.length > 0) {
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
    	},
    	api: {
    		stopList: 'auto',
    		query: undefined,
    		maxBins: 100,
    		comparisonCorpus: undefined
    	},
		glyph: 'xf0ce@FontAwesome'
    },
    config: {
    	options: [{
    		xtype: 'stoplistoption'
    	},{
    		xtype: 'corpusselector',
    		name: 'comparisonCorpus',
    		fieldLabel: 'comparison corpus'
    	}]
    },
    constructor: function(config) {
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
        var me = this;

        var store = Ext.create("Voyant.data.store.CorpusTermsBuffered", {
        	parentPanel: this,
        	proxy: {
        		extraParams: {
        			withDistributions: 'relative'
        		}
        	}
        });
        
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
        		enableOverflow: true,
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
            	text: this.localize("corpusComparisonDifference"),
            	tooltip: this.localize("corpusComparisonDifferenceTip"),
            	dataIndex: 'relativeSkewness',
            	renderer: Ext.util.Format.numberRenderer("0,000.0"),
                width: 'autoSize',
                hidden: !this.getApiParam('comparisonCorpus'),
            	sortable: true,
            	listeners: {
            		show: function(ct, column, eopts) {
            			if (!me.getApiParam('comparisonCorpus')) {
            				me.showError(me.localize('noCorpusComparison'))
            			}
            		}
            	}
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
        
    	me.on('loadedCorpus', function(src, corpus) {
//    		this.setApiParam('query', undefined);
    		if (corpus.getDocumentsCount()>100) {
    			this.getStore().getProxy().setExtraParam('bins', this.getApiParam('maxBins'));
    		}
    		this.getStore().load()
    	}, me);
    	
    	me.on("query", function(src, query) {
    		this.setApiParam('query', query);
    		this.getStore().removeAll();
    		this.getStore().load();
    	}, me);


        me.callParent(arguments);
        
    }
})

Ext.define('Voyant.panel.DocumentTerms', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	requires: ['Voyant.data.store.DocumentTerms'],
	alias: 'widget.documentterms',
	config: {
		corpus: undefined,
		options: {
    		xtype: 'stoplistoption'
    	}
	},
    statics: {
    	i18n: {
    	},
    	api: {
    		stopList: 'auto',
    		query: undefined,
    		docId: undefined,
    		docIndex: undefined,
    		bins: 10
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
    		store.load();
    	});
    	
    	if (config.embedded) {
    		if (window.console) {
    			console.warn(config.embedded.then);
    		}
    		var cls = Ext.getClass(config.embedded).getName();
    		if (cls=="Voyant.data.store.DocumentTerms" || cls=="Voyant.data.model.Document") {
    			this.fireEvent('loadedCorpus', this, config.embedded.getCorpus());
    		}
    	}
    	else if (config.corpus) {
    		this.fireEvent('loadedCorpus', this, config.corpus);
    	}
    	
    	this.on("query", function(src, query) {
    		this.fireEvent("corpusTermsClicked", src, query);
    	}, this);
    	
    	this.on("corpusTermsClicked", function(src, terms) {
    		if (this.getStore().getCorpus()) { // make sure we have a corpus
        		var query = [];
        		terms.forEach(function(term) {
        			query.push(Ext.isString(term) ? term : term.get("term"));
        		});
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
    	
    	this.on("documentsClicked", function(src, documents) {
    		var docIds = [];
    		documents.forEach(function(doc) {docIds.push(doc.get('id'));});
    		this.setApiParams({
    			docId: docIds,
    			query: undefined
    		});
    		if (this.isVisible()) {
        		this.getStore().load({params: this.getApiParams()});
    		}
    	});
    	
    	this.on("activate", function() { // load after tab activate (if we're in a tab panel)
    		if (this.getStore().getCorpus()) {
    			this.getStore().load({params: this.getApiParams()});
    		}
    	}, this);
    },
    
    initComponent: function() {
        var me = this;

        var store = Ext.create("Voyant.data.store.DocumentTermsBuffered", {parentPanel: this});
        
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
        		enableOverflow: true,
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
            	text: this.localize("zscore"),
            	tooltip: this.localize("zscoreTip"),
            	dataIndex: 'zscore',
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
                    			if (Ext.isString(term)) {queryTerms.push(term);}
                    			else if (term.term) {queryTerms.push(term.term);}
                    			else if (term.getTerm) {queryTerms.push(term.getTerm());}
                    		});
                    		if (queryTerms.length > 0) {
                    			this.setApiParams({
                    				docIndex: undefined,
                    				docId: undefined,
                    				query: queryTerms
                    			});
                        		if (this.isVisible()) {
                            		if (this.isVisible()) {
                                		this.getStore().load({params: this.getApiParams()});
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
    
});

Ext.define('Voyant.panel.Documents', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'/*,'Voyant.util.Localization'*/],
	alias: 'widget.documents',
	isConsumptive: true,
    statics: {
    	i18n: {
    	},
    	api: {
    		query: undefined,
    		docIndex: undefined,
    		docId: undefined
    	},
		glyph: 'xf0ce@FontAwesome'
    },
    
    MODE_EDITING: 'editing',
    MODE_NORMAL: 'normal',
    config: {
    	mode: this.MODE_NORMAL
    },

    constructor: function(config) {
    	
    	var store = Ext.create("Voyant.data.store.Documents", {
    	    selModel: {pruneRemoved: false}
    	});
    	
    	var dockedItemsItems = [{
            xtype: 'querysearchfield'
        }, {
            xtype: 'totalpropertystatus'
        }]
    	
    	if (!config || config.mode!=this.MODE_EDITING) {
    		dockedItemsItems.push({
            	text: this.localize("modify"),
            	tooltip: this.localize("modifyTip"),
    			glyph: 'xf044@FontAwesome',
    			scope: this,
    			itemId: 'modifyButton',
            	handler: function(btn) {
            		var win = Ext.create('Ext.window.Window', {
            		    title: this.localize("title"),
            		    modal: true,
            		    width: "80%",
            		    minWidth: 300,
            		    minHeight: 200,
            		    height: "80%",
            		    layout: 'fit',
            		    frame: true,
            		    border: true,
            		    items: {
            		    	xtype: 'documents',
            		    	mode: this.MODE_EDITING,
            		    	corpus: this.getStore().getCorpus(),
            		    	header: false,
            		    	viewConfig: {
            		            plugins:{
            		                ptype:'gridviewdragdrop'
            		            },
            		            listeners: {
            		            	beforedrop: function(node, data, overModel, dropPosition, dropHandlers) {
            		            		if (this.getStore().getCount()<this.getStore().getCorpus().getDocumentsCount()) {
            		            			var panel = this.up("panel");
            		        				Ext.Msg.show({
            		        				    title: panel.localize('error'),
            		        				    message: panel.localize('reorderFilteredError'),
            		        				    buttons: Ext.Msg.OK,
            		        				    icon: Ext.Msg.ERROR
            		        				});
            		            			return false;
            		            		}
            		            		return true;
            		            	}
            		            }
            		    	}
            		    },
            		    buttons: [{
                			text: this.localize('add'),
                			tooltip: this.localize("addTip"),
                			glyph: 'xf067@FontAwesome',
                			handler: function(btn) {
                				btn.up("window").close();
                				Ext.create('Ext.window.Window', {
                					header: false,
                        		    modal: true,
                        		    layout: 'fit',
                        		    items: {
                        		    	xtype: 'corpuscreator',
                        		    	corpus: this.getStore().getCorpus()
                        		    }
                        		}).show();
                			},
                			scope: this
                		}, {
                			text: this.localize('remove'),
                			tooltip: this.localize("removeTip"),
                			glyph: 'xf05e@FontAwesome',
                			hidden: this.getStore().getCorpus().getDocumentsCount()==1,
                			handler: this.keepRemoveReorderHandler,
                			itemId: 'remove',
                			scope: this
                		}, {
                			text: this.localize('keep'),
                			tooltip: this.localize("keepTip"),
                			glyph: 'xf00c@FontAwesome',
                			hidden: this.getStore().getCorpus().getDocumentsCount()==1,
                			handler: this.keepRemoveReorderHandler,
                			itemId: 'keep',
                			scope: this
                		}, {
                			text: this.localize('reorder'),
                			tooltip: this.localize("reorderTip"),
                			glyph: 'xf0dc@FontAwesome',
                			hidden: this.getStore().getCorpus().getDocumentsCount()==1,
                			handler: this.keepRemoveReorderHandler,
                			itemId: 'reorder',
                			scope: this
                		},{
            		        text: 'Cancel',
                			glyph: 'xf00d@FontAwesome',
            		        handler: function(btn) {
            		        	btn.up("window").close();
            		        }
            		    }]
            		}).show();

            	}
    		})
    	}
    	
    	Ext.apply(this, {
    		title: this.localize('title'),
    		emptyText: this.localize("emptyText"),
	    	columns:[
	    	   {
	    		   xtype: 'rownumberer',
	    	        renderer: function(value, metaData, record) {return record.getIndex()+1},
	    	        sortable: false
	    	    },{
	    	        text: this.localize('documentTitle'),
	    	        dataIndex: 'title',
	    	        sortable: true,
	    	        renderer: function(val, metadata, record) {return record.getTitle();},
	    	        flex: 3
	    	    },{
	    	        text: this.localize('documentAuthor'),
	    	        dataIndex: 'author',
	    	        sortable: true,
	    	        hidden: true,
	    	        renderer: function(val, metadata, record) {return record.getAuthor();},
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
	    		mode: 'MULTI',
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
        		enableOverflow: true,
                items: dockedItemsItems
            }]
    	});
    	
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
        
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		this.store.setCorpus(corpus);
    		this.store.load({params: this.getApiParams()});
    		if (corpus.getNoPasswordAccess()=='NONCONSUMPTIVE') {
    			this.queryById('modifyButton').hide();
    		}
    		/*
    		var me = this;
    		Ext.Ajax.request({
    			url: this.getApplication().getTromboneUrl(),
    			params: {
    				corpus: corpus.getId(),
    				tool: 'corpus.CorpusManager',
    				getAccess: true
    			},
    		    success: function(response, opts) {
    		        var obj = Ext.decode(response.responseText);
    		        if (obj && obj)
    		        debugger
    		        console.dir(obj);
    		        me
    		    },
    		    failure: function(response, opts) {
    		    	me.showError(response);
    		    }
    		})
    		*/
    	})
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('query', function(src, query) {
    		this.setApiParam('query', query);
    		this.store.load({params: this.getApiParams()});
    	})
    	
    	if (config.embedded) {
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
    },
    
    keepRemoveReorderHandler: function(btn) {
    	// we're not sure which scope we're in, so ensure we're talking about this buttons panel
		var panel = btn.up("window").down("documents");
		var selection = panel.getSelection();
		var docs = panel.getStore().getCorpus().getDocumentsCount();
		var btnMode = btn.getItemId();
		// if reordering, check to make sure that we're not looking at a subset
		if (btnMode=='reorder') {
			if (panel.getStore().getCount()<docs) {
				return Ext.Msg.show({
				    title: this.localize('error'),
				    message: this.localize('reorderFilteredError'),
				    buttons: Ext.Msg.OK,
				    icon: Ext.Msg.ERROR
				});
			}
			else {
				docIndex = [];
				panel.getStore().each(function(doc) {
					docIndex.push(doc.getIndex())
			    }, this);
				for (var i=1; i<docIndex.length; i++) {
					if (docIndex[i-1]>docIndex[i]) {
						return Ext.Msg.confirm(panel.localize('newCorpus'), new Ext.Template(panel.localize(btnMode+'Documents')).applyTemplate([selection.length]), function(confirmBtn){
							if (confirmBtn==='yes') {
								docIndex = [];
								this.getStore().each(function(doc) {
									docIndex.push(doc.getIndex())
							    }, this);
								var params = {docIndex: docIndex};
								params[btnMode+"Documents"] = true;
								this.editCorpus(params)
							}
						}, panel);
					}
				}
				// if we get here it's because nothing's been reordered
				return Ext.Msg.show({
				    title: this.localize('error'),
				    message: this.localize('reorderOriginalError'),
				    buttons: Ext.Msg.OK,
				    icon: Ext.Msg.ERROR
				});
			}
			
		}
		
		if (selection.length>0) {
			if (selection.length==docs) {
				if (docs==1) {
					return Ext.Msg.show({
					    title: this.localize('error'),
					    message: this.localize('onlyOneError'),
					    buttons: Ext.Msg.OK,
					    icon: Ext.Msg.ERROR
					});
				}
				else {
					return Ext.Msg.show({
					    title: this.localize('error'),
					    message: this.localize('allSelectedError'),
					    buttons: Ext.Msg.OK,
					    icon: Ext.Msg.ERROR
					});
				}
			}
			else {
				return Ext.Msg.confirm(this.localize('newCorpus'), new Ext.Template(this.localize(btnMode+'SelectedDocuments')).applyTemplate([selection.length]), function(confirmBtn){
					if (confirmBtn==='yes') {
						docIndex = [];
						selection.forEach(function(doc){
							docIndex.push(doc.getIndex())
						})
						var params = {docIndex: docIndex};
						params[btnMode+"Documents"] = true;
						this.editCorpus(params)
					}
				}, panel);
			}
		}
		else if (panel.getApiParam("query") && panel.getStore().getCount()<docs) {
			return Ext.Msg.confirm(this.localize('newCorpus'), new Ext.Template(this.localize(btnMode+'FilteredDocuments')).applyTemplate([selection.length]), function(confirmBtn){
				if (confirmBtn==='yes') {
					docIndex = [];
					this.getStore().each(function(doc) {
						docIndex.push(doc.getIndex())
				    }, this);
					var params = {docIndex: docIndex};
					params[btnMode+"Documents"] = true;
					this.editCorpus(params)
				}
			}, panel);
		}
		else {
			return Ext.Msg.show({
			    title: this.localize('error'),
			    message: this.localize('selectOrFilterError'),
			    buttons: Ext.Msg.OK,
			    icon: Ext.Msg.ERROR
			});
		}    	
    },
    
    editCorpus: function(params) {
    	
    	Ext.apply(params, {
    		tool: 'corpus.CorpusManager',
    		corpus: this.getStore().getCorpus().getId()
    	})

    	// mask main viewport while we create a new corpus
    	var app = this.getApplication();
    	var view = app.getViewport();
		view.mask(this.localize("Creating new corpus…"));
    	Ext.Ajax.request({
    		url: this.getApplication().getTromboneUrl(),
    		method: 'POST',
    		params: params,
    		success: function(response) {
    			view.unmask();
    			var obj = Ext.decode(response.responseText);
				app.openUrl(app.getBaseUrl()+"?corpus="+obj.corpus.id);
//    			view.mask("Loading new corpus…")
//    			new Voyant.data.model.Corpus({corpus: obj.corpus.id}).then(function(corpus) {
//    				view.unmask();
//    				app.openUrl(app.getBaseUrl()+"/?corpus="+obj.corpus.id)
//    				app.dispatchEvent('loadedCorpus', app, corpus);
//    			}).fail(function(message, response) {
//    				view.unmask();
//    				app.showErrorResponse({message: message}, response);
//    			});
    		}
    	});
    	
    	// close editing window if we're in modal mode, should happen asynchronously while new corpus is created
    	var win = this.up("window");
    	if (win && win.isFloating()) {win.close()}
    }
})
Ext.define('Voyant.panel.DocumentsFinder', {
	extend: 'Ext.grid.Panel',
	require: ['Voyant.data.store.DocumentQueryMatches','Ext.grid.plugin.CellEditing'],
	mixins: ['Voyant.panel.Panel'/*,'Voyant.util.Localization'*/],
	alias: 'widget.documentsfinder',
    statics: {
    	i18n: {
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
        	this.status.update(new Ext.XTemplate(this.localize('noMatches')).apply([this.getCorpus().getDocumentsCount()]))
    	}
    	else {
    		this.status.update(new Ext.XTemplate(this.localize('queryMatches')).apply([count,this.getCorpus().getDocumentsCount()]))
    	}
    	this.exportBtn.setDisabled(count==0);
    	
    }
    
})
Ext.define('Voyant.panel.Dummy', {
    extend: 'Ext.Panel',
    xtype: 'dummy',
	autoScroll: true,
    initComponent: function() {
        var me = this;
        
        var columns = 3;
        
        Ext.apply(this, {
        	layout: {
        		type: 'table',
        		columns: columns,
        		tableAttrs: {
        			style: {
        				width: '100%',
        				height: '100%'
        			}
        		},
        		tdAttrs: {
        			style: {
        				padding: '0px',
        				verticalAlign: 'top'
        			}
        		}
        	},
        	defaults: { // place holder values to ensure that the children are rendered
        		width: 10,
        		height: 10,
        		border: true
        	},
        	items:  [{
        		colspan: 2,
        		xtype: 'summary'
        	},{
        		xtype: 'reader',
        		rowspan: 2
        	},{
        		xtype: 'documentterms'
        	},{
        		xtype: 'corpusterms'
        	}]
        })
        
        this.on("boxready", function() {
        	this.body.setStyle('overflow', 'hidden');
        	
        	var sizeMap = {};
        	
        	var table = this.getTargetEl().down(".x-table-layout");
        	var rows = table.dom.rows;
        	for (var i=0; i<rows.length; i++) {
        		var cells = rows[i].cells;
        		for (var j=0; j<cells.length; j++) {
        			var cell = cells[j];
        			var cellEl = Ext.get(cell);
        			var size = cellEl.getSize(false);
        			var cmpId = cellEl.down('.x-panel').id;
        			sizeMap[cmpId] = size;
        		}
        	}
        	
        	for (var id in sizeMap) {
        		var size = sizeMap[id];
        		Ext.getCmp(id).setSize(size);
        	}

        	this.updateLayout();
        })
        
        this.on('resize', function(panel, newwidth, newheight, oldwidth, oldheight) {
        	if (oldwidth !== undefined && oldheight !== undefined) {
	        	var widthRatio = newwidth/oldwidth;
	        	var heightRatio = newheight/oldheight;

	        	var sizeMap = {};
	        	
	        	var table = this.getTargetEl().down(".x-table-layout");
	        	var rows = table.dom.rows;
	        	for (var i=0; i<rows.length; i++) {
	        		var cells = rows[i].cells;
	        		for (var j=0; j<cells.length; j++) {
	        			var cell = cells[j];
	        			var cellEl = Ext.get(cell);
	        			var panelEl = cellEl.down('.x-panel');
	        			var size = panelEl.getSize(false); // get panel size this time since table cell size will be inaccurate
	        			var w = Math.floor(size.width * widthRatio);
		        		var h = Math.floor(size.height * heightRatio);
	        			var cmpId = panelEl.id;
	        			sizeMap[cmpId] = {width: w, height: h};
	        		}
	        	}
	        	
	        	for (var id in sizeMap) {
	        		var size = sizeMap[id];
	        		Ext.getCmp(id).setSize(size);
	        	}
	
	        	this.updateLayout();
        	}
        	
        })
        
        this.callParent();
    }
});
Ext.define('Voyant.panel.RezoViz', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.rezoviz',
    statics: {
    	i18n: {
    	},
    	api: {
    		query: undefined,
    		limit: 25,
    		stopList: 'auto',
    		type: ['organization','location','person'],
    		minEdgeCount: 2
    	},
		glyph: 'xf1cb@FontAwesome'
    },
    
    config: {
    	corpus: undefined,
    	network: undefined, // the vis network graph
    	nodesStore: undefined, // used by combo
    	nodesDataSet: undefined, // used by vis
    	edgesDataSet: undefined, // used by vis
    	isNetworkBounded: true
    },

    categorizedNodeOptions: {
    	location: {
    		font: {
    			color: 'green'
    		}
    	},
    	person: {
    		font: {
    			color: 'maroon'
    		}
    	},
    	organization: {
    		font: {
    			color: 'purple'
    		}
    	}
    },
    nodeOptions: {
		shape: 'box',
		color: {
			border: 'rgba(0,0,0,0.1)',
			background: 'rgba(255,255,255,1)'
		},
		scaling:{
            label: {
              min: 8,
              max: 20
            }
          }
	},
	edgeOptions: {
		color: {
			color: 'rgba(0,0,0,0.1)',
			highlight: 'black',
			hover: 'red'
		},
		labelHighlightBold: false
	},
	highlightOptions: {
		font: {
			color: 'white'
		},
		color: {
			background: 'black'/*,
			hover: {
				border: '#CB157F',
				background: '#EB42A5'
			}*/
		}
	},
    
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
        var me = this;
        
        this.setNodesStore(Ext.create('Ext.data.Store', {
        	fields: ['id', 'term', 'type', 'rawFreq'],
        	sortOnLoad: true,
        	sorters: 'term'
        }));
        
        Ext.apply(me, {
    		title: this.localize('title'),
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
        		enableOverflow: true,
                items: [{
                    xtype: 'combo',
                    queryMode: 'local',
                    valueField: 'term',
                    displayField: 'term',
                    store: this.getNodesStore(),
                    listeners: {
						select: function(combo, record) {
							this.getNetwork().selectNodes([record.get('id')]);
						},
						scope: this
                    }
                },{
                	xtype: 'button',
	                text: this.localize('categories'),
	                menu: {
	                	items: [{
	                		xtype: 'menucheckitem',
	                		text: this.localize('people'),
	                		itemId: 'person',
	                		checked: true
	                	},{
	                		xtype: 'menucheckitem',
	                		text: this.localize('locations'),
	                		itemId: 'location',
	                		checked: true
	                	},{
	                		xtype: 'menucheckitem',
	                		text: this.localize('organizations'),
	                		itemId: 'organization',
	                		checked: true
	                	},{
	                		xtype: 'button',
	                		text: this.localize('reload'),
	                		style: 'margin: 5px;',
	                		handler: this.categoriesHandler,
	                		scope: this
	                	}]
	                }
                },{
					xtype: 'numberfield',
					itemId: 'minEdgeCount',
					fieldLabel: this.localize('minEdgeCount'),
					labelAlign: 'right',
					labelWidth: 120,
					width: 170,
					maxValue: 10,
					minValue: 1,
					allowDecimals: false,
					allowExponential: false,
					allowOnlyWhitespace: false,
					listeners: {
						render: function(field) {
							field.setRawValue(this.getApiParam('minEdgeCount'));
						},
						change: function(field, newVal) {
							if (field.isValid()) {
								this.setApiParam('minEdgeCount', newVal);
								this.getEntities();
							}
						},
						scope: this
					}
                },{ xtype: 'tbseparator' },{
                	xtype: 'slider',
                	fieldLabel: this.localize('repulsion'),
                	labelAlign: 'right',
                	labelWidth: 70,
                	width: 150,
                	value: 100,
                	increment: 10,
                	minValue: 0,
                	maxValue: 500,
                	listeners: {
                		changecomplete: function(slider, val) {
                			this.getNetwork().physics.options.repulsion.nodeDistance = val;
                			this.getNetwork().startSimulation();
                		},
                		scope: this
                	}
                },{
                	xtype: 'slider',
                	fieldLabel: this.localize('stiffness'),
                	labelAlign: 'right',
                	labelWidth: 70,
                	width: 150,
                	value: 4,
                	increment: 1,
                	minValue: 0,
                	maxValue: 10,
                	listeners: {
                		changecomplete: function(slider, val) {
                			val /= 100;
                			this.getNetwork().physics.options.repulsion.springConstant = val;
                			this.getNetwork().startSimulation();
                		},
                		scope: this
                	}
                },{
                	xtype: 'slider',
                	fieldLabel: this.localize('friction'),
                	labelAlign: 'right',
                	labelWidth: 55,
                	width: 150,
                	value: 9,
                	increment: 10,
                	minValue: 0,
                	maxValue: 100,
                	listeners: {
                		changecomplete: function(slider, val) {
                			val /= 100;
                			this.getNetwork().physics.options.repulsion.damping = val;
                			this.getNetwork().startSimulation();
                		},
                		scope: this
                	}
                }]
            }]
        });
        
        this.on('loadedCorpus', function(src, corpus) {
        	this.setCorpus(corpus);
        	if (corpus.getDocumentsCount()==1) {
        		this.setApiParam("minEdgeCount", 1);
        	}
        	this.getEntities();
        }, this);
        
        this.on('resize', function(panel, width, height) {

		}, this);
        
        me.callParent(arguments);
    },
    
    getEntities: function() {
    	var corpusId = this.getCorpus().getId();
    	var el = this.getLayout().getRenderTarget();
    	el.mask(this.localize('loadingEntities'));
    	Ext.Ajax.request({
    		url: this.getApplication().getTromboneUrl(),
    		method: 'POST',
    		params: {
    			tool: 'corpus.EntityCollocationsGraph',
    			type: this.getApiParam('type'),
    			limit: this.getApiParam('limit'),
    			minEdgeCount: this.getApiParam("minEdgeCount"),
    			corpus: corpusId
    		},
    		success: function(response) {
    			el.unmask();
    			var obj = Ext.decode(response.responseText);
    			if (obj.entityCollocationsGraph.edges.length==0) {
    				this.showError({msg: this.localize('noEntities')});
    				Ext.Msg.confirm(this.localize('error'), this.localize('noEntitiesForEdgeCount'), function(button) {
    					if (button === 'yes') {
    						var newEdgeCount = Math.max(1, this.getApiParam('minEdgeCount')-1);
    						this.queryById('minEdgeCount').setRawValue(newEdgeCount);
    						this.setApiParam('minEdgeCount', newEdgeCount);
    						this.getEntities();
    					}
    				}, this);
    			}
    			else {
        			this.processEntities(obj.entityCollocationsGraph);
        			this.initGraph();
    			}
    		},
    		scope: this
    	});
    },
    
    processEntities: function(entityParent) {
    	var nodes = entityParent.nodes;
    	var edges = entityParent.edges;
    	
    	// we need to calculate the font size because the scaling option doesn't seem to work as advertised
    	var extent = d3.extent(nodes, function(node) {return node.rawFreq;});
    	var min = extent[0];
    	var max = extent[1];    	
    	var scaleFont = d3.scale.linear()
                    .domain([min, max])
                    .range([10, 24]);
    	
    	var visNodes = [];
    	for (var i = 0; i < nodes.length; i++) {
    		var n = nodes[i];
    		n.id = i;
    		visNodes.push({id: i, label: n.term, value: nodes[i].rawFreq, font: {size: scaleFont(n.rawFreq), color: this.categorizedNodeOptions[n.type].font.color}, type: n.type, rawFreq: n.rawFreq, title: n.term + (n.rawFreq ? ' ('+n.rawFreq+')':'')});
    	}
    	
    	this.getNodesStore().loadData(nodes);
    	
    	var visEdges = [];
    	for (var i = 0; i < edges.length; i++) {
    		var link = edges[i].nodes;
    		visEdges.push({from: link[0], to: link[1], title: edges[i].count, value: 200*edges[i].count});
    	}
    	
    	this.setNodesDataSet(new vis.DataSet(visNodes));
    	this.setEdgesDataSet(new vis.DataSet(visEdges));
    },
    
    initGraph: function() {
    	var el = this.getLayout().getRenderTarget();
    	el.update(''); // clear
    	
    	// explicitly set dimensions
    	el.setWidth(el.getWidth());
    	el.setHeight(el.getHeight());

    	var options = {
			interaction: {
    			hover: true,
    			hoverConnectedEdges: true,
    			multiselect: false
    		},
    		physics: {
    			solver: 'repulsion',
    			repulsion: {
    				centralGravity: 0.1
    			}
    		},
    		nodes: this.nodeOptions,
    		edges: this.edgeOptions
    	};
    	
    	
    	var network = new vis.Network(el.dom, {
    		nodes: this.getNodesDataSet(),
    		edges: this.getEdgesDataSet()
    	}, options);

    	if (this.getIsNetworkBounded()) {
	    	network.on('beforeDrawing', function (ctx) {
	    		var el = this.getLayout().getRenderTarget();
	    		var width = el.getWidth();
	    		var height = el.getHeight();
	    		
	    	    var nodePositions = network.getPositions();
	    	    for (var id in nodePositions) {
	    	    	var node = nodePositions[id];
	    	    	var xy = network.canvasToDOM(node);
	    	    	var boundedX = Math.max(0, Math.min(width, xy.x));
	    	    	var boundedY = Math.max(0, Math.min(height, xy.y));
	    	    	var bXY = network.DOMtoCanvas({x: boundedX, y: boundedY});
	    	    	network.body.nodes[id].x = bXY.x;
	    	    	network.body.nodes[id].y = bXY.y;
	    	    }
	    	}.bind(this));
    	}
    	
    	network.on('selectNode', function(params) {
    		var node = params.nodes[0];
    		this.doNodeSelect(node);
    	}.bind(this));
    	network.on('deselectNode', function(params) {
    		network.unselectAll(); // need this due to our custom selecting code
    		
    		var node = params.nodes[0];
    		if (node !== undefined) {
    			// select clicked node after deselection is finished
    			setTimeout(this.doNodeSelect.bind(this), 5, node);
    		}
    	}.bind(this));
    	network.on('selectEdge', function(params) {
    		// prevent edge selection
    		network.unselectAll();
    	});
    	
    	this.setNetwork(network);
    },
    
    doNodeSelect: function(node) {
		var term = this.getNodesDataSet().get(node).label;
		this.dispatchEvent("termsClicked", this, [term]);
    	var network = this.getNetwork();
		var nodes = network.getConnectedNodes(node);
		nodes.push(node);
		var edges = network.getConnectedEdges(node);
		
		// custom selection to avoid selecting edges between the secondary/connected nodes
		network.unselectAll();
		for (var i = 0; i < nodes.length; i++) {
			var n = nodes[i];
			var nodeObj = network.body.nodes[n];
			network.selectionHandler.selectObject(nodeObj, false);
		}
		for (var i = 0; i < edges.length; i++) {
			var e = edges[i];
			var edgeObj = network.body.edges[e];
			network.selectionHandler.selectObject(edgeObj, false);
		}
		
		network.redraw(); // need to force redraw if coming from deselect
    },
    
    categoriesHandler: function(item) {
    	var categories = [];
    	item.up('menu').items.each(function(checkitem) {
    		if (checkitem.checked) {
    			categories.push(checkitem.itemId);
    		}
    	});
    	
    	this.setApiParam('type', categories);
    	this.getEntities();
    },
    
    map: function(value, istart, istop, ostart, ostop) {
		return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
	}
});
Ext.define('Voyant.panel.MicroSearch', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.microsearch',
    statics: {
    	i18n: {
    	},
    	api: {
    		stopList: 'auto',
    		query: undefined
    	},
		glyph: 'xf1ea@FontAwesome'
    },
    config: {
    	corpus: undefined,
    	
    	/**
    	 * @private
    	 */
    	options: {xtype: 'stoplistoption'},
    	
    	/**
    	 * @private
    	 */
    	maxTokens: 0,
    	
    	/**
    	 * @private
    	 */
    	tokensPerSegment: 0,
    	
    	/**
    	 * @private
    	 */
    	maxVerticalLines: 0,
    	
    	/**
    	 * @private
    	 */
    	maxSegments: 0
    },
    constructor: function(config ) {

    	Ext.apply(this, {
    		title: this.localize('title'),
    		dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                enableOverflow: true,
                items: [{
                	xtype: 'querysearchfield'
                }]
    		}]
    	});

        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		
    		this.setCorpus(corpus);
    		
    		if (this.rendered) {
    			this.initialize();
    		}
    		else {
    			this.on("afterrender", function() {
    				this.initialize();
    			}, this)
    		}

    	});
    	
    	this.on('query', function(src, query) {
    		this.setApiParam('query', query);
    		this.updateSearchResults();
    	})
    	
    },
    
    initialize: function() {

    	var el = this.getTargetEl(), corpus = this.getCorpus();
    	
		var lineSize = 5; // pixels, including margins below and above
		this.setMaxVerticalLines(Math.floor((el.getHeight() - 10 /* margin of 5px */) / lineSize));
		
		// max segments
		var gutterSize = 10;
		var corpusSize = corpus.getDocumentsCount();
		var gutter = corpusSize * gutterSize;
		var columnSize = Math.floor((el.getWidth() - gutter - 10 /* margin of 5px */) / corpusSize);
		if (columnSize>200) {columnSize=200;}
		var segmentWidth = 3; // each segment is 3 pixels
		var maxSegmentsPerLine = Math.floor(columnSize / segmentWidth);
		if (maxSegmentsPerLine<1) {maxSegmentsPerLine=1;}
		
		// and the answer is...
		this.setMaxSegments(maxSegmentsPerLine * this.getMaxVerticalLines());
		
		var documentsStore = corpus.getDocuments();
		this.setMaxTokens(documentsStore.max('tokensCount-lexical'));

		this.setTokensPerSegment(this.getMaxTokens() < this.getMaxSegments() ? 1 : Math.ceil(this.getMaxTokens()/this.getMaxSegments()));
		

		var canvas = "<table cellpadding='0' cellspacing='0' style='height: 100%'><tr>";
		this.segments = [];
		documentsStore.each(function(document) {
			docIndex = document.getIndex();
			canvas+='<td style="overflow: hidden; vertical-align: top; width: '+columnSize+'px;">'+
				'<div class="docLabel" style="white-space: nowrap; width: '+columnSize+'px;" data-qtip="'+document.getFullLabel()+'">'+document.getFullLabel()+"</div>"+
				'<canvas style="display: block;" width="'+columnSize+'" height="'+el.getHeight()+'" id="'+this.body.id+'-'+docIndex+'">'+
				'</td>';
			if (docIndex+1<corpusSize) {canvas+='<td style="width: '+gutterSize+'px;">&nbsp;</td>';}
		}, this);
		canvas+='</tr></table>';
		el.update(canvas);
		
		this.updateSearchResults();
		
    	if (!this.getApiParam('query')) {
    		var me = this;
    		return this.getCorpus().loadCorpusTerms({limit: 1, stopList: this.getApiParam('stopList')}).then(function(corpusTerms) {
    			var term = corpusTerms.getAt(0).getTerm();
    			var q = me.down('querysearchfield');
    			q.addValue(new Voyant.data.model.CorpusTerm({term: term}));
    			me.fireEvent("query", me, [term])
    		});
    	}

    },
    
    updateSearchResults: function() {
    	query = this.getApiParam('query');
    	if (Ext.Array.from(query).length==0) { // draw simple lines
        	this.getCorpus().getDocuments().each(function(document) {
        		var distributions = this.redistributeDistributions(document, new Array(this.getMaxSegments()));
        		this.drawDocumentDistributions(document, distributions);
        	}, this)
    	} else {
    		this.mask(this.localize('loading'))
    		this.getCorpus().getDocumentTerms().load({
    			params: {
    				query: Ext.Array.from(query).join('|'), // treat as one query
        			withDistributions: 'relative',
        			bins: this.getMaxSegments()
    			},
    			callback: function(records, operation, success) {
    				this.unmask();
    				var max = 0, min = Number.MAX_VALUE, docs = [], m;
    				records.forEach(function(record) {
    					var doc = this.getCorpus().getDocument(record.getDocIndex());
    					var distributions = this.redistributeDistributions(doc, record.getDistributions())
    					m = Ext.Array.max(distributions);
    					if (m>max) {max=m;}
    					distributions.forEach(function(d) {
    						if (d && d<min) {
    							min = d;
    						}
    					})
    					docs[record.getDocIndex()] = this.redistributeDistributions(doc, record.getDistributions());
    				}, this);
    				docs.forEach(function(distributions, i) {
                    	this.drawDocumentDistributions(this.getCorpus().getDocument(i), distributions, min || Ext.Array.min(distributions), max || Ext.Array.max(distributions));
    				}, this)
    			},
    			scope: this
    		})
    	}
    },
    
    redistributeDistributions: function(doc, distributions) {
		var segments = Math.ceil(doc.getLexicalTokensCount() / this.getTokensPerSegment());

		// redistribute if needed, we'll take the mean of the distribution values to maintain comparison across segments
    	if (distributions.length>segments) {
    		var newdistributions = [];
    		for (var i=0; i<distributions.length; i++) {
    			var a = parseInt(i*segments/distributions.length);
    			if (newdistributions[a]) {newdistributions[a].push(distributions[i])}
    			else {newdistributions[a]=[distributions[i]];}
    		}
			distributions = newdistributions
    		for (var i=0; i<distributions.length; i++) {
    			distributions[i] = Ext.Array.mean(distributions[i]);
    		}
    	}
    	return distributions;
    },
    
    drawDocumentDistributions: function(doc, distributions, min, max) {
    	var canvas = this.getTargetEl().dom.querySelector("#"+this.body.id+"-"+doc.getIndex());
    	var c = canvas.getContext('2d');
    	var x = 0, w = canvas.clientWidth, y = 0;
    	for (var j=0; j<distributions.length;j++) {
    		c.fillStyle = distributions[j] ? "rgba(250,0,0,"+(((distributions[j]-min)*.8/(max-min))+.2)+")" : "rgb(230,230,230)";
    		c.fillRect(x,y,3,3)
    		x+=3;
    		if (x>=w) {x=0; y+=5}
    	}
    	
    }
});
Ext.define('Voyant.panel.Mandala', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.mandala',
    statics: {
    	i18n: {
    	},
    	api: {
    		/**
    		 * @property stopList The stop list to use to filter results.
    		 * Choose from a pre-defined list, or enter a comma separated list of words, or enter an URL to a list of stop words in plain text (one per line).
    		 * @type String
    		 * @private
    		 */
    		stopList: 'auto',
    		
    		query: undefined,
    		
    		labels: true
    		
    	},
    	glyph: 'xf1db@FontAwesome'
	},
	
	gutter: 5,
	
	textFont: '12px sans-serif',
	
	config: {
		corpus: undefined,
    	options: [{xtype: 'stoplistoption'}]
	},
	
    constructor: function() {

    	this.mixins['Voyant.util.Localization'].constructor.apply(this, arguments);
    	Ext.apply(this, {
    		title: this.localize('title'),
			html: '<div style="text-align: center"><canvas width="800" height="600"></canvas></div>',
			dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
        		enableOverflow: true,
                items: [{
                	text: this.localize('add'),
        			glyph: 'xf067@FontAwesome',
                	handler: function() {
                		this.editMagnet();
                	},
                	scope: this
                },{
                	text: this.localize('clear'),
					glyph: 'xf014@FontAwesome',
                	handler: function() {
                		this.setApiParam('query', undefined);
                		this.updateFromQueries(true);
                		this.editMagnet();
                	},
                	scope: this
	            },{
	                xtype: 'checkbox',
	                boxLabel: this.localize('labels'),
	                listeners: {
	                	render: function(cmp) {
	                		cmp.setValue(this.getApiParam("labels")===true);
	    		        	Ext.tip.QuickTipManager.register({
	    		        		target: cmp.getEl(),
	   		                 	text: this.localize('labelsTip')
	    		        	});
	                		
	                	},
	                    change: function(cmp, val) {
	                    	this.setApiParam('labels', val);
	                    	this.draw();
	                    },
	                    scope: this
	                }
	            }]
    		}]			
    	});
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
    	this.on('boxready', function(cmp) {
			var canvas = this.getTargetEl().dom.querySelector("canvas");
			var me = this;
    		canvas.addEventListener('mousemove', function(evt) {
    			var rect = canvas.getBoundingClientRect(), x =  evt.clientX - rect.left, y = evt.clientY - rect.top,
				change = false, docRadius = parseInt(me.textFont)/2;
    			if (me.documents) {
    				me.documents.forEach(function(doc) {
    					var isHovering = x > doc.x-docRadius && x < doc.x+docRadius && y > doc.y-docRadius && y < doc.y+docRadius;    					
    					if (isHovering!=doc.isHovering) {change = true;}
    					doc.isHovering = isHovering;
    				})
    			}
				radius = parseInt(me.textFont)/2;
				for (term in me.magnets) {
					var isHovering = x > me.magnets[term].x-radius && x < me.magnets[term].x+radius && y > me.magnets[term].y-radius && y < me.magnets[term].y+radius;    					
					if (isHovering!=me.magnets[term].isHovering) {change = true;}
					me.magnets[term].isHovering = isHovering;
				}
				if (change) {
					me.draw();
				}
    	    }, false);
    		canvas.addEventListener('click', function(evt) {
    			var rect = canvas.getBoundingClientRect(), x =  evt.clientX - rect.left, y = evt.clientY - rect.top,
					docRadius = parseInt(me.textFont)/2;
				for (term in me.magnets) {
					if (x > me.magnets[term].x-radius && x < me.magnets[term].x+radius && y > me.magnets[term].y-radius && y < me.magnets[term].y+radius) {
						me.editMagnet(term);
					}
				}
    	    }, false);
    	})
    	
    	this.on('loadedCorpus', function(src, corpus) {
    		this.setCorpus(corpus);
    		this.documents = [];
    		var canvas = this.getTargetEl().dom.querySelector("canvas"), ctx = canvas.getContext("2d"), radius = canvas.width/2;
    		ctx.font = this.textFont;
    		corpus.getDocuments().each(function(document) {
    			var label = document.getTinyTitle();
    			this.documents.push({
    				doc: document,
    				label: label,
    				width: ctx.measureText(label).width,
    				x: radius,
    				y: radius,
    				matches: [],
    				isHovering: false
    			});
    		}, this);
    		this.updateDocs(canvas);
    		this.draw();
    		this.updateFromQueries();
    	}, this);
    	
    	this.on("resize", function() {
    		var canvas = this.getTargetEl().dom.querySelector("canvas"),
    			diam = Math.min(this.getTargetEl().getWidth(), this.getTargetEl().getHeight());
    		canvas.width = diam;
    		canvas.height = diam;
	    	this.updateMagnets();
	    	this.updateDocs();
    		this.draw(canvas)
    	})
    },
    
    editMagnet: function(term) {
    	var me = this;
		Ext.create('Ext.window.Window', {
			title: this.localize("EditMagnet"),
			modal: true,
			items: {
				xtype: 'form',
				width: 300,
				items: {
					xtype: 'querysearchfield',
					corpus: this.getCorpus(),
					store: this.getCorpus().getCorpusTerms({
						proxy: {
							extraParams: {
								stopList: this.getApiParam('stopList')
							}
						}
					}),
					stopList: this.getApiParam('stopList')
				},
				buttons: [{
	            	text: this.localize("remove"),
					glyph: 'xf0e2@FontAwesome',
	            	flex: 1,
		            ui: 'default-toolbar',
	        		handler: function(btn) {
	        			var queries = Ext.Array.filter(Ext.Array.from(me.getApiParam('query')), function(query) {
	        				return query!=term
	        			});
	        			me.setApiParam('query', queries);
	        			me.updateFromQueries(queries.length==0);
	        			btn.up('window').close();
	        		},
	        		scope: this
				},{xtype: 'tbfill'}, {
	            	text: this.localize("cancel"),
		            ui: 'default-toolbar',
	                glyph: 'xf00d@FontAwesome',
	        		flex: 1,
	        		handler: function(btn) {
	        			btn.up('window').close();
	        		}
				},{
	            	text: this.localize("update"),
					glyph: 'xf00c@FontAwesome',
	            	flex: 1,
	        		handler: function(btn) {
	        			var queries = Ext.Array.filter(Ext.Array.from(me.getApiParam('query')), function(query) {
	        				return query!=term
	        			});
	        			var val = btn.up('window').down('querysearchfield').getValue();
	        			if (val.length>0) {
	        				queries.push(val.join("|"));
	        			}
	        			me.setApiParam('query', queries);
	        			me.updateFromQueries(queries.length==0);
	        			btn.up('window').close();
	        		},
	        		scope: this
	            }]
			},
			bodyPadding: 5
		}).show()
    },
    
    updateFromQueries: function(allowEmpty) {
		this.magnets = undefined;
		this.documents.forEach(function(doc) {doc.matches=[]})
		this.updateDocs();
		this.draw();
    	if (this.documents) {
    		var params = this.getApiParams();
    		if (!params.query) {params.limit=10;}
        	var queries = Ext.Array.from(this.getApiParam('query'));
        	if (!allowEmpty || queries.length>0) {
        		this.getCorpus().getCorpusTerms().load({
        			params: Ext.apply(params, {withDistributions: true}),
        			callback: function(records) {
        		    	var canvas = this.getTargetEl().dom.querySelector("canvas"), ctx = canvas.getContext("2d");
        		    		diam = canvas.width, rad = diam /2;
        		    	ctx.font = this.textFont;
        		    	this.magnets = {};
        		    	for (var i=0, len=records.length; i<len; i++) {
        		    		var term = records[i].getTerm();
        		    		records[i].getDistributions().forEach(function(val, i) {
        		    			if (val>0) {
        		    				this.documents[i].matches.push(term)
        		    			}
        		    		}, this);
        		    		this.magnets[term] = {
        		    			record: records[i],
        		    			colour: this.getApplication().getColor(i),
        		    			width: ctx.measureText(term).width,
        		    			isHovering: false
        		    		}
        		    	}
        		    	this.setApiParam('query', Object.keys(this.magnets))
        		    	this.updateMagnets();
        		    	this.updateDocs();
        		    	this.draw();
        			},
        			scope: this
        		})
        	}
    	}
    },
    
    updateMagnets: function(canvas) {
    	var canvas = this.getTargetEl().dom.querySelector("canvas"), diam = canvas.width, rad = diam /2;
    	var len = Object.keys(this.magnets || {}).length;
    	var i = 0;
    	for (var term in this.magnets) {
    		Ext.apply(this.magnets[term], {
				x:  rad+((rad-this.gutter-50) * Math.cos(2 * Math.PI * i / len)),
				y:  rad+((rad-this.gutter-50) * Math.sin(2 * Math.PI * i / len))
    		})
    		i++;
    	}
    },
    
    updateDocs: function(canvas) {
    	canvas = canvas ||  this.getTargetEl().dom.querySelector("canvas"), diam = canvas.width, rad = diam /2;
    	var notMatching = [];
    	if (this.documents) {
        	this.documents.forEach(function(doc, i) {
        		if (Ext.Array.from(doc.matches).length==0) {notMatching.push(i);} // will be set around perimeter below
        		else if (Ext.Array.from(doc.matches).length==1) { // try to set it away from magnet
        			var x = (Math.random()*15)+15, y = (Math.random()*15)+15;
        			doc.targetX = this.magnets[doc.matches[0]].x + (Math.round(Math.random())==0 ? x : -x);
        			doc.targetY = this.magnets[doc.matches[0]].y + (Math.round(Math.random())==0 ? y : -y);
        		} else {
        			// determine the weighted position
        			var x = 0, y = 0,
        				vals = doc.matches.map(function(term) {return this.magnets[term].record.getDistributions()[i]}, this),
        				min = Ext.Array.min(vals), max = Ext.Array.max(vals);
        			var weights = 0;
        			doc.matches.forEach(function(term, j) {
        				weight = max==min ? 1 : ((vals[j]-min)+min)/((max-min)+min);
        				weights += weight;
        				x += this.magnets[term].x*weight;
        				y += this.magnets[term].y*weight;
        				
        			}, this)
        			doc.targetX = x/weights
        			doc.targetY = y/weights
        		}
        	}, this);
        	
        	// set around perimeter
        	for (var i=0, len=notMatching.length; i<len; i++) {
        		Ext.apply(this.documents[i], {
    				targetX:  rad+((rad-this.gutter) * Math.cos(2 * Math.PI * i / len)),
    				targetY:  rad+((rad-this.gutter) * Math.sin(2 * Math.PI * i / len))
        		})
        	}
    	}
    },
    
    draw: function(canvas, ctx) {
    	canvas = canvas ||  this.getTargetEl().dom.querySelector("canvas");
    	ctx = ctx || canvas.getContext("2d");
    	ctx.font = this.textFont;
    	var radius = canvas.width/2;
    	ctx.clearRect(0,0,canvas.width,canvas.height);
    	var labels = this.getApiParam('labels');
    	
    	// draw circle
    	ctx.beginPath();
    	ctx.strokeStyle = "rgba(0,0,0,.1)"
        ctx.fillStyle = "rgba(0,0,0,.02)"
    	ctx.arc(radius, radius, radius-this.gutter, 0, 2 * Math.PI, false);
    	ctx.fill();
    	ctx.lineWidth = 2;
    	ctx.stroke();
    	
    	// determine if we're animating a move and need to come back
    	var needRedraw = false;
    	
    	// draw documents
    	
    	if (this.documents && this.documents.length>0) {
    		var needMove = false;
    		
    		var noHovering = Ext.Array.each(this.documents, function(doc) {
    			return !doc.isHovering
    		}, this);
    		
    		if (noHovering===true) {
    			noHovering = Ext.Array.each(Object.keys(this.magnets || {}), function(term) {
        			return !this.magnets[term].isHovering
        		}, this);
    		}
			// go through a first time to draw connecting lines underneath
    		var hoveringTerms = {}; hoveringDocs = [];
    		this.documents.forEach(function(document, j) {
	        	document.matches.forEach(function(term, i) {
	        		ctx.beginPath();
	        		ctx.moveTo(document.x, document.y);
	        		ctx.lineTo(this.magnets[term].x, this.magnets[term].y);
	        		if (noHovering===true) {
		        		ctx.strokeStyle = "rgba("+this.magnets[term].colour.join(",")+",.1)";
	        		} else {
	        			if (document.isHovering || this.magnets[term].isHovering) {
	        				hoveringDocs[j]=true;
	        				hoveringTerms[term]=true;
			        		ctx.strokeStyle = "rgba("+this.magnets[term].colour.join(",")+",.5)";
	        			} else {
		        			ctx.strokeStyle = "rgba(0,0,0,.02)";
	        			}
	        		}
	        		ctx.stroke();
	        	}, this);
    		}, this);
    			
			// now a second time for labels/markers
    		var halfSize = parseInt(this.textFont)/2, height = parseInt(this.textFont)+4;
    		this.documents.forEach(function(document, i) {
    			
    			// draw marker/label
    			if (labels || document.isHovering || hoveringDocs[i]==true) {
	    		    var width = document.width+4;
			        ctx.fillStyle = document.isHovering || hoveringDocs[i]==true || noHovering===true ? "white" : "rgba(255,255,255,.05)"
	    		    ctx.fillRect(document.x-(width/2), document.y-(height/2), width, height);
			        ctx.strokeStyle = document.isHovering || hoveringDocs[i]==true || noHovering===true ? "rgba(0,0,0,.2)" : "rgba(0,0,0,.05)"
	    		    ctx.strokeRect(document.x-(width/2), document.y-(height/2), width, height);
			        ctx.textAlign = "center";
			        ctx.fillStyle = document.isHovering || hoveringDocs[i]==true || noHovering===true ? "rgba(0,0,0,.8)" : "rgba(0,0,0,.05)";
	    		    ctx.fillText(document.label, document.x, document.y);
    			} else {
    		    	ctx.beginPath();
    		        ctx.fillStyle = "rgba(0,0,0,.8)"
    		    	ctx.arc(document.x, document.y, halfSize, 0, 2 * Math.PI);
    	        	ctx.fill();
    		    	ctx.stroke();
    			}
	        	
	        	// determine if we need to move
		    	var dx = Math.abs(document.x - document.targetX), dy = Math.abs(document.y- document.targetY)
		    	if (dx!=0 || dy!=0) {
		    		if (dx<1) {document.x = document.targetX}
		    		else {
		    			dx/=2;
		    			document.x = document.x > document.targetX ? document.x-dx : document.x+dx;
		    		}
		    		if (dy<1) {document.y = document.targetY}
		    		else {
		    			dy/=2;
		    			document.y = document.y > document.targetY ? document.y-dy : document.y+dy;
		    		}
		    		needRedraw = true;
		    	}
    		}, this);
    		
    		// now magnets
    		var i = 0, height = parseInt(this.textFont)+4;
	        ctx.textAlign = "center";
	        ctx.textBaseline="middle";
	        for (var term in this.magnets) {
	        	if (labels || term in hoveringTerms || this.magnets[term].isHovering) {
	    		    var width = this.magnets[term].width+4;
			        ctx.fillStyle = term in hoveringTerms || this.magnets[term].isHovering || noHovering===true ? "white" : "rgba(255,255,255,.05)";
	    		    ctx.fillRect(this.magnets[term].x-(width/2), this.magnets[term].y-(height/2), width, height);
			        ctx.strokeStyle = term in hoveringTerms || this.magnets[term].isHovering || noHovering===true ? "rgb("+this.magnets[term].colour.join(",")+")" : "rgba(0,0,0,.05)";
	    		    ctx.strokeRect(this.magnets[term].x-(width/2), this.magnets[term].y-(height/2), width, height);
			        ctx.textAlign = "center";
			        ctx.fillStyle = term in hoveringTerms || this.magnets[term].isHovering || noHovering===true ?"rgba(0,0,0,.8)" : "rgba(0,0,0,.05)";
	    		    ctx.fillText(term, this.magnets[term].x, this.magnets[term].y);
	        	} else {
			    	ctx.beginPath();
			        ctx.fillStyle = "rgb("+this.magnets[term].colour.join(",")+")"
			        ctx.strokeStyle = "rgb("+this.magnets[term].colour.join(",")+")"
			    	ctx.arc(this.magnets[term].x, this.magnets[term].y, 12, 0, 2 * Math.PI);
		        	ctx.fill();
			    	ctx.stroke();
	        	}
    		}
    	}
    	
		if (needRedraw) {
			var me = this;
			setTimeout(function() {
				me.draw();
			}, 100);
		} else if (this.documents) {
			var minDist = Math.max(radius/this.documents.length, 50), spring = .1
			for (var i=0, len=this.documents.length; i<len; i++) {
				for (var j=0; j<len; j++) {
					if (i<j) {
						
						var dx = this.documents[i].x  - this.documents[j].x,
							dy = this.documents[i].y - this.documents[j].y,
							dist = Math.sqrt(dx * dx + dy * dy);
						if (dist < minDist) {
							var ax = dx * spring, ay = dy * spring;
							this.documents[i].targetX += ax;
							this.documents[j].targetX -= ax;
							this.documents[i].targetY += ay;
							this.documents[j].targetY -= ay;
							needRedraw = true;
						}
					}
				}
			}
			if (needRedraw) {
				var me = this;
				setTimeout(function() {
					me.draw();
				}, 100);
			}
		}
    }
    
});
Ext.define('Voyant.panel.Reader', {
	extend: 'Ext.panel.Panel',
	requires: ['Voyant.data.store.Tokens'],
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.reader',
	isConsumptive: true,
    statics: {
    	i18n: {
    	},
    	api: {
    		start: 0,
    		limit: 1000,
    		skipToDocId: undefined,
    		query: undefined
    	},
    	glyph: 'xf0f6@FontAwesome'
	},
    config: {
    	corpus: undefined,
    	tokensStore: undefined,
    	documentsStore: undefined,
    	documentTermsStore: undefined,
    	exportVisualization: false,
    	lastScrollTop: 0,
    	scrollIntoView: false,
    	insertWhere: 'beforeEnd',
    	locationMarker: undefined,
    	lastLocationUpdate: new Date()
    },
    
    INITIAL_LIMIT: 1000, // need to keep track since limit can be changed when scrolling
    
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
    	tokensStore.on("beforeload", function(store) {
    		return store.getCorpus().getNoPasswordAccess()!='NONCONSUMPTIVE';
    	})
    	tokensStore.on("load", function(s, records, success) {
    		if (success) {
	    		var contents = "";
	    		var documentFrequency = this.localize("documentFrequency");
	    		var isPlainText = false;
	    		var docIndex = -1;
	    		var isLastNewLine = false;
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
	    				var isNewLine = newContents.indexOf("<br />")==0;
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
//	    			this.highlightKeywords(keyword);
	    		}
    		}
    	}, this);
    	this.setTokensStore(tokensStore);
    	
    	this.on("query", function(src, queries) {
    		this.loadQueryTerms(queries);
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
//   		    		 this.down('querysearchfield').setValue(term);
   		    		 
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
    			var readerContainer = this.innerContainer.first();
    			var downwardsScroll = this.getLastScrollTop() < target.scrollTop;
    			
    			// scroll up
    			if (!downwardsScroll && target.scrollTop < 1) {
    				this.fetchPrevious(true);
    			// scroll down
    			} else if (downwardsScroll && target.scrollHeight - target.scrollTop < target.offsetHeight*1.5) {//target.scrollTop+target.offsetHeight>target.scrollHeight/2) { // more than half-way down
    				this.fetchNext(false);
    			} else {
    				var now = new Date();
        			if (now - this.getLastLocationUpdate() > 250) {
        				this.updateLocationMarker(target);
        			}
    			}
    			this.setLastScrollTop(target.scrollTop);
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
    				this.loadQueryTerms([term]);
    				this.getApplication().dispatchEvent('termsClicked', this, data);
    			}
    		}, this);
    		
    		if (this.getCorpus()) {
    			this.load();
	    		var query = this.getApiParam('query');
	    		if (query) {
	    			this.loadQueryTerms(Ext.isString(query) ? [query] : query);
	    		}
    		}
    	}, this);
    	
    	Ext.apply(this, {
    		// TODO clearing search loads default document terms into chart but probably shouldn't
    		dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
        		enableOverflow: true,
                items: [{
                	glyph: 'xf060@FontAwesome',
            		handler: function() {
            			this.fetchPrevious(true);
            		},
            		scope: this
            	},{
            		glyph: 'xf061@FontAwesome',
            		handler: function() {
            			this.fetchNext(true);
            		},
            		scope: this
            	},{xtype: 'tbseparator'},{
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
    	    		
    	    		this.setLocationMarker(Ext.DomHelper.append(container.el, {tag: 'div', style: 'background-color: #157fcc; height: 100%; width: 2px; position: absolute; top: 0; left: 0;'}));
    	    		
    	    		this.generateChart(corpus, container);
    	    		
    	    		if (this.rendered) {
    	    			this.load();
        	    		if (corpus.getNoPasswordAccess()=='NONCONSUMPTIVE') {
        	    			this.mask(this.localize("limitedAccess"), 'mask-no-spinner')
        	    		}
        	    		var query = this.getApiParam('query');
        	    		if (query) {
        	    			this.loadQueryTerms(Ext.isString(query) ? [query] : query);
        	    		}
    	    		}
    	    		
    			},
            	termsClicked: function(src, terms) {
            		var queryTerms = [];
            		terms.forEach(function(term) {
            			if (Ext.isString(term)) {queryTerms.push(term);}
            			else if (term.term) {queryTerms.push(term.term);}
            			else if (term.getTerm) {queryTerms.push(term.getTerm());}
            		});
            		if (queryTerms.length > 0) {
            			this.loadQueryTerms(queryTerms);
            		}
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
        			if (documents.length > 0) {
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
    								el.scrollIntoView();
    							}
    							this.highlightKeywords(term.get('term'), false);
    						},
    						scope: this
    					});
    				};
        		},
        		documentIndexTermsClicked: function(src, terms) {
        			if (terms[0] !== undefined) {
    					var term = terms[0];
    					var termRec = Ext.create('Voyant.data.model.Token', term);
    					this.fireEvent('termLocationClicked', this, [termRec]);
        			}
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
					query: queryTerms/*,
    				docIndex: undefined,
    				docId: undefined,
    				page: undefined,
    				start: undefined,
    				limit: undefined*/
    			}
			});
		}
    },
    
    updateLocationMarker: function(target) {
    	var amount;
		if (target.scrollTop == 0) {
			amount = 0;
		} else if (target.scrollHeight - target.scrollTop == target.clientHeight) {
			amount = 1;
		} else {
			amount = (target.scrollTop + target.clientHeight * 0.5) / target.scrollHeight;
		}
		
		var readerWords = $(target).find('.readerContainer').find('.word'); //.filter(function(index, el) { return $(el).position().top > 0; }); // filter by position too slow
		var firstWord = readerWords.first()[0];
		var lastWord = readerWords.last()[0];
		if (firstWord !== undefined && lastWord !== undefined) {
			var corpus = this.getCorpus();
			var partialFirstDoc = false;
			
			var info1 = Voyant.data.model.Token.getInfoFromElement(Ext.get(firstWord));
			var info2 = Voyant.data.model.Token.getInfoFromElement(Ext.get(lastWord));
			if (info1.position !== 0) {
				partialFirstDoc = true;
			}

			var docTokens = {};
			var totalTokens = 0;
			var currIndex = info1.docIndex;
			while (currIndex <= info2.docIndex) {
				var tokens = corpus.getDocument(currIndex).get('tokensCount-lexical');
				if (currIndex === info2.docIndex) {
					tokens = info2.position; // only count tokens up until last displayed word
				}
				if (currIndex === info1.docIndex) {
					tokens -= info1.position; // subtract missing tokens, if any
				}
				totalTokens += tokens;
				docTokens[currIndex] = tokens;
				currIndex++;
			}
			
			var tokenPos = Math.round(totalTokens * amount);
			var docIndex = 0;
			var currToken = 0;
			for (var i = info1.docIndex; i <= info2.docIndex; i++) {
				docIndex = i;
				currToken += docTokens[i];
				if (currToken >= tokenPos) {
					break;
				}
			}
			var remains = (currToken - tokenPos);
			var tokenPosInDoc = docTokens[docIndex] - remains;
			
			if (partialFirstDoc && docIndex === info1.docIndex) {
				tokenPosInDoc += info1.position;
			}
				
			var fraction = tokenPosInDoc / corpus.getDocument(docIndex).get('tokensCount-lexical');
			var graph = this.query('cartesian')[docIndex];
			var locX = graph.getX() + graph.getWidth()*fraction;
			Ext.get(this.getLocationMarker()).setX(locX);
		}
		this.setLastLocationUpdate(new Date());
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
    			plugins: {
                    ptype: 'chartitemevents'
                },
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
                        renderer: function(toolTip, record, ctx) {
                        	toolTip.setHtml(corpus.getDocument(record.get('docIndex')).getTitle()+"<br>"+record.get('term') + ': ' + record.get('distribution'));
                        }
                    }
        		}],
    	    	store: Ext.create('Ext.data.ArrayStore', {
            		fields: ['docId', 'docIndex', 'bin', 'distribution', 'term'],
            		data: []
            	}),
            	listeners: {
            		itemclick: function(chart, item, event) {
            			var data = item.record.data;
            			var doc = this.getDocumentsStore().getAt(data.docIndex);
            			this.getApplication().dispatchEvent('documentsClicked', this, [doc]);
            		},
            		scope: reader
            	}
    		});
    		
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
				var totalTokens = doc.get('tokensCount-lexical');
				
				var position = Math.floor(totalTokens * fraction);
				var bufferPosition = position - (this.getApiParam('limit')/2);
				
				this.setApiParams({'skipToDocId': doc.getId(), start: bufferPosition < 0 ? 0 : bufferPosition});
				this.load(true);
    		}, reader);
    	}
    	
    	container.removeAll();
    	
    	var docs = corpus.getDocuments();
    	var docsCount = docs.getTotalCount();
    	if (docsCount<50) {
    		
    	
	    	var tokensTotal = corpus.getWordTokensCount();
	    	var docInfos = [];
	    	var docMinSize = Number.MAX_VALUE;
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
				d.relativeHeight = d.count==docMaxSize ? 1 : map(d.count, docMinSize, docMaxSize, 0.25, 1);
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
    
	fetchPrevious: function(scroll) {
		var readerContainer = this.innerContainer.first();
		var first = readerContainer.first('.word');
		if (first != null && first.hasCls("loading")===false) {
			while(first) {
				if (first.hasCls("word")) {
					var info = Voyant.data.model.Token.getInfoFromElement(first);
					var docIndex = info.docIndex;
					var start = info.position;
					var doc = this.getDocumentsStore().getAt(docIndex);    						
					var limit = this.getApiParam('limit');
					var getPrevDoc = false;
					if (docIndex === 0 && start === 0) {
						first.dom.scrollIntoView()
						first.frame("red")
						break;
					}
					if (docIndex > 0 && start === 0) {
						getPrevDoc = true;
						docIndex--;
						doc = this.getDocumentsStore().getAt(docIndex);
						var totalTokens = doc.get('tokensCount-lexical');
						start = totalTokens-limit;
						if (start < 0) {
							start = 0;
							this.setApiParam('limit', totalTokens);
						}
					} else {
						limit--; // subtract one to limit for the word we're removing. need to do this to account for non-lexical tokens before/after first word.
						start -= limit;
					}
					if (start < 0) start = 0;
					
					var mask = first.insertSibling("<div class='loading'>"+this.localize('loading')+"</div>", 'before', false).mask();
					if (!getPrevDoc) {
						first.destroy();
					}
					
					var id = doc.getId();
					this.setApiParams({'skipToDocId': id, start: start});
					this.setInsertWhere('afterBegin')
					this.setScrollIntoView(scroll);
					this.load();
					this.setApiParam('limit', this.INITIAL_LIMIT);
					break;
				}
				first.destroy(); // remove non word
				first = readerContainer.first();
			}
		}
	},
	
	fetchNext: function(scroll) {
		var readerContainer = this.innerContainer.first();
		var last = readerContainer.last();
		if (last.hasCls("loading")===false) {
			// store any text that occurs after last word
			var lastText = $(readerContainer.dom).contents().filter(function() {
				return this.nodeType === 3;
			}).last();
			while(last) {
				if (last.hasCls("word")) {
					var info = Voyant.data.model.Token.getInfoFromElement(last);
					var docIndex = info.docIndex;
					var start = info.position;
					var doc = this.getDocumentsStore().getAt(info.docIndex);
					var id = doc.getId();
					
					var totalTokens = doc.get('tokensCount-lexical');
					if (start + this.getApiParam('limit') >= totalTokens && docIndex == this.getCorpus().getDocumentsCount()-1) {
						var limit = totalTokens - start;
						if (limit <= 1) {
							last.dom.scrollIntoView();
							last.frame("red")
							break;
						} else {
							this.setApiParam('limit', limit);
						}
					}
					
					// remove any text after the last word
					if (last.el.dom.nextSibling === lastText[0]) {
						lastText.remove();
					}
					
					var mask = last.insertSibling("<div class='loading'>"+this.localize('loading')+"</div>", 'after', false).mask();
					last.destroy();
					this.setApiParams({'skipToDocId': id, start: info.position});
					this.setInsertWhere('beforeEnd');
					this.setScrollIntoView(scroll);
					this.load(); // callback not working on buffered store
					this.setApiParam('limit', this.INITIAL_LIMIT);
					break;
				}
				last.destroy(); // remove non word
				last = readerContainer.last();
			}
		}
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
    	}));
    },
    
    updateText: function(contents) {
    	var loadingMask = this.innerContainer.down('.loading');
    	if (loadingMask) loadingMask.destroy();
    	var inserted = this.innerContainer.first().insertHtml(this.getInsertWhere(), contents, true); // return Element, not dom
    	if (inserted && this.getScrollIntoView()) {
    		inserted.dom.scrollIntoView(); // use dom
    		// we can't rely on the returned element because it can be a transient fly element, but the id is right in a deferred call
    		Ext.Function.defer(function() {
    			var el = Ext.get(inserted.id); // re-get el
    			if (el) {el.frame("red")}
    		}, 100);
    	}
    	var target = this.down('panel[region="center"]').body.dom;
    	this.updateLocationMarker(target);
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
    	},
    	api: {
    		docId: undefined,
    		analysis: 'ca',
    		limit: 50,
    		dimensions: 3,
    		bins: 10,
    		clusters: 3,
    		comparisonType: 'relative',
    		stopList: 'auto',
    		target: undefined,
    		term: undefined,
    		query: undefined,
    		label: ['summary', 'docs', 'terms']
    	},
		glyph: 'xf06e@FontAwesome'
    },
    
    tokenFreqTipTemplate: null,
    docFreqTipTemplate: null,
    caStore: null,
    pcaStore: null,
    docSimStore: null,
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
    labelsMode: 0, // 0 all labels, 1 doc labels, 2 word labels, 3 no labels
    
    highlightData: {x: 0, y: 0, r: 0},
    highlightTask: null,
    
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
        Ext.apply(this, {
        	title: this.localize('title'),
        	caStore: Ext.create('Voyant.data.store.CAAnalysis'),
        	pcaStore: Ext.create('Voyant.data.store.PCAAnalysis'),
        	docSimStore: Ext.create('Voyant.data.store.DocSimAnalysis'),
        	termStore: this.termStore,
        	chartMenu: Ext.create('Ext.menu.Menu', {
        		items: [
        			{text: this.localize('remove'), itemId: 'remove', glyph: 'xf068@FontAwesome'},
        			{text: this.localize('nearby'), itemId: 'nearby', glyph: 'xf0b2@FontAwesome'}
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
        		tbar: {
        			enableOverflow: true,
        			items: [{
    	            	xtype: 'documentselectorbutton',
    	            	flex: 1
    	            },{
                		text: this.localize('analysis'),
                		itemId: 'analysis',
                		glyph: 'xf1ec@FontAwesome',
                		enableOverflow: true,
    	            	flex: 1,
            			menu: {
        					items: [
        					    {text: this.localize('pca'), itemId: 'analysis_pca', group:'analysis', xtype: 'menucheckitem'},
        					    {text: this.localize('ca'), itemId: 'analysis_ca', group:'analysis', xtype: 'menucheckitem'},
        					    {text: this.localize('docSim'), itemId: 'analysis_docSim', group:'analysis', xtype: 'menucheckitem'}
        					],
        					listeners: {
        						click: function(menu, item) {
        							if (item !== undefined) {
        								if (item.text === this.localize('pca')) {
        									this.setApiParam('analysis', 'pca');
        								} else if (item.text === this.localize('docSim')) {
        									this.setApiParam('analysis', 'docSim');
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
    	            	text: this.localize('freqsMode'),
    					glyph: 'xf201@FontAwesome',
    				    tooltip: this.localize('freqsModeTip'),
    	            	flex: 1,
    				    menu: {
    				    	items: [{
				               text: this.localize("rawFrequencies"),
				               checked: false,
				               itemId: 'raw',
				               group: 'freqsMode',
				               checkHandler: function(item, checked) {
				            	   if (checked) {
				                	   this.setApiParam('comparisonType', 'raw');
				                	   this.loadFromApis();
				            	   }
				               },
				               scope: this
				           },{
				               text: this.localize("relativeFrequencies"),
				               checked: true,
				               itemId: 'relative',
				               group: 'freqsMode',
				               checkHandler: function(item, checked) {
				            	   if (checked) {
				                	   this.setApiParam('comparisonType', 'relative');
				                	   this.loadFromApis();
				            	   }
				               },
				               scope: this
				           },{
				               text: this.localize("tfidf"),
				               checked: false,
				               itemId: 'tfidf',
				               group: 'freqsMode',
				               checkHandler: function(item, checked) {
				            	   if (checked) {
				                	   this.setApiParam('comparisonType', 'tfidf');
				                	   this.loadFromApis();
				            	   }
				               },
				               scope: this
				           }]
    				    }
                	},{
                		text: this.localize('clusters'),
                		itemId: 'clusters',
                		glyph: 'xf192@FontAwesome',
    	            	flex: 1,
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
    	            	flex: 1,
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
                	},{
                		text: this.localize('labels'),
                		itemId: 'labels',
                		glyph: 'xf02b@FontAwesome',
    	            	flex: 1,
                		menu: {
                			items: [
                			    {text: this.localize("summaryLabel"), itemId: 'summary', xtype: 'menucheckitem'},
                			    {text: this.localize("docsLabel"), itemId: 'docs', xtype: 'menucheckitem'},
                			    {text: this.localize("termsLabel"), itemId: 'terms', xtype: 'menucheckitem'}
                			],
        					listeners: {
        						afterrender: function(menu) {
        							var labels = this.getApiParam('label');
        							menu.items.each(function(item) {
        								item.setChecked(labels.indexOf(item.getItemId())>-1)
        							})
        						},
        						click: function(menu, item) {
        							var labels = this.getApiParam("label");
        							var label = item.getItemId();
        							if (Ext.isString(labels)) {labels = [labels]}
        							if (item.checked && labels.indexOf(label)==-1) {
        								labels.push(label)
        							} else if (!item.checked && labels.indexOf(label)>-1) {
        								labels = labels.filter(function(item) {return item!=label})
        							}
        							this.setApiParam("label", labels);
        							this.doLabels();
        							this.queryById('chart').redraw();
        						},
        						scope: this
        					}
                		}
                	}]
        			
        		}
        	},{
        		itemId: 'terms',
        		xtype: 'grid',
 //       		title: 'Terms',
        		region: 'east',
        		width: 250,
        		split: true,
//        		collapsible: true,
//        		border: true,
        		forceFit: true,
        		bbar: {
            		enableOverflow: true,
        			items: [{
                        xtype: 'button',
                        text: this.localize('nearby'),
                        glyph: 'xf0b2@FontAwesome',
                        flex: 1,
                        handler: function(btn) {
                        	var sel = btn.up('panel').getSelection()[0];
                        	if (sel === undefined) {
                        		this.toastError({
                        			html: this.localize("noTermSelected"),
                        		     anchor: btn.up("panel").getTargetEl()
                        		 });
                        	}
                        	else {
	                        	var term = sel.get('term');
	                        	this.getNearbyForTerm(term);
                        	}
                        },
                        scope: this
                    },{
                        xtype: 'button',
                        text: this.localize('remove'),
                        glyph: 'xf068@FontAwesome',
                        flex: 1,
                        handler: function(btn) {
                        	var sel = btn.up('panel').getSelection()[0];
                        	if (sel === undefined) {
                        		this.toastError({
                        			html: this.localize("noTermSelected"),
                        		     anchor: btn.up("panel").getTargetEl()
                        		 });
                        	}
                        	else {
	                        	var term = sel.get('term');
	                        	this.removeTerm(term);
                        	}
                        },
                        scope: this
                    }]
        			
        		},
        		tbar: {
            		enableOverflow: true,
                    items: [{
                		fieldLabel: this.localize('numTerms'),
                		labelAlign: 'right',
                		labelWidth: 40,
                		itemId: 'limit',
                		xtype: 'combo',
                		width: 100,
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
                	},{
                    	xtype: 'querysearchfield',
//                    	emptyText: this.localize('addTerm'),
                    	flex: 1
                    }]
                },
        		columns: [{
        			text: this.localize('term'),
    				dataIndex: 'term',
    				flex: 1,
                    sortable: true
    			},{
    				text: this.localize('rawFreq'),
    				dataIndex: 'rawFreq',
                    sortable: true
    			},{
    				text: this.localize('relFreq'),
    				dataIndex: 'relativeFreq',
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
    		this.docSimStore.setCorpus(corpus);
    		this.loadFromApis();
    	}, this);
    	
    	this.on('documentsSelected', function(src, docIds) {
    		this.setApiParam('docId', docIds);
    		this.loadFromApis();
    	}, this);
        
        this.caStore.on('load', function(store, records) {
        	this.buildChart(store);
        }, this);
        this.pcaStore.on('load', function(store, records) {
        	this.buildChart(store);
        }, this);
        this.docSimStore.on('load', function(store, records) {
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
    	if (this.getApiParam('analysis') === 'pca') {
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
        
        
        if (this.getApiParam('analysis') !== 'docSim') { // docSim doesn't return terms so keep the current ones
	        this.termStore.removeAll();
        }
	        
        var tokens = rec.getTokens();
        var termData = [];
        var docData = [];
        tokens.forEach(function(token) {
        	var freq = token.get('rawFreq');
        	var category = token.get('category');
        	if (category === undefined) category = 'term'; // PCA doesn't define categories
        	var isTerm = category === 'term';
        	if (isTerm) {
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
        	var tokenData = {
        		x: token.get('vector')[0], y: token.get('vector')[1], z: token.get('vector')[2],
    			term: token.get('term'), rawFreq: freq, relativeFreq: token.get('relativeFreq'), cluster: token.get('cluster'), category: category
        	};
        	if (!isTerm) {
        		if (token.get('category') === 'bin') {
        			tokenData.term = tokenData.title = "Bin "+token.get('docIndex');
        		} else {
	        		tokenData.docIndex = token.get('docIndex');
	        		var doc = this.getCorpus().getDocument(tokenData.docIndex);
	        		if (doc !== null) {
		        		tokenData.term = doc.getShortTitle();
		        		tokenData.title = doc.getTitle();
	        		}
        		}
        		docData.push(tokenData);
        	} else {
        		termData.push(tokenData);
        	}
        }, this);
        
        var newCount = this.termStore.getCount();
        this.queryById('limit').setRawValue(newCount);
        this.setApiParam('limit', newCount);
        
        
    	var termSeriesStore = Ext.create('Ext.data.JsonStore', {
    		fields: ['term', 'x', 'y', 'z', 'rawFreq', 'relativeFreq', 'cluster', 'category', 'docIndex'],
    		data: termData
    	});
    	var docSeriesStore = Ext.create('Ext.data.JsonStore', {
    		fields: ['term', 'x', 'y', 'z', 'rawFreq', 'relativeFreq', 'cluster', 'category', 'docIndex'],
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
        		hidden: this.labelsMode > 0,
        		x: 70,
        		y: 70
        	}],
        	innerPadding: {top: 25, right: 25, bottom: 25, left: 25},
        	series: [{
        		type: 'customScatter',
        		xField: 'x',
        		yField: 'y',
        		store: termSeriesStore,
        		tooltip: {
        			trackMouse: true,
        			style: 'background: #fff',
        			renderer: function (toolTip, record, ctx) {
        				toolTip.setHtml(that.tokenFreqTipTemplate.apply([record.get('term'),record.get('rawFreq'),record.get('relativeFreq')]));
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
	    				var scatterplot = that;
	    				
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
    			},
    			scope: this
        	},{
        		type: 'customScatter',
        		xField: 'x',
        		yField: 'y',
        		store: docSeriesStore,
        		tooltip: {
        			trackMouse: true,
        			style: 'background: #fff',
        			renderer: function (toolTip, record, ctx) {
        				toolTip.setHtml(that.docFreqTipTemplate.apply([record.get('title'),record.get('rawFreq')]));
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
	    				var scatterplot = that;
	    				
	    				if (clusterIndex === -1 || scatterplot.getApiParam('analysis') !== 'docSim') {
	    					// no clusters were specified in initial call
	    					clusterIndex = 6; // default doc color
	    				}
	    				
	    				var a = 0.65;
	    				if (numDims === 3) {
	    					a = scatterplot.interpolate(item.get('z'), minFill, maxFill, 0, 1);
	    				}
	    				var color = scatterplot.getApplication().getColor(clusterIndex);
	    				config.fillStyle = 'rgba('+color.join(',')+','+a+')';
	    				config.strokeStyle = 'rgba('+color.join(',')+',1)';

	    				config.radius = 5;
    				}
    			},
    			scope: this
        		
        		
        	}],
        	listeners: {
        		itemclick: function(chart, item, event) {
        			var data = item.record.data;
        			if (data.category === 'doc') {
        				var record = this.getCorpus().getDocument(data.docIndex);
	            		this.getApplication().dispatchEvent('documentsClicked', this, [record]);
        			} else if (data.category === 'term') {
	        			var record = Ext.create('Voyant.data.model.CorpusTerm', data);
	            		this.getApplication().dispatchEvent('corpusTermsClicked', this, [record]);
        			}
        		},
        		render: function(chart) {
        			chart.body.on('contextmenu', function(event, target) {
	        			event.preventDefault();
	        			
		            	var xy = event.getXY();
		            	var parentXY = Ext.fly(target).getXY();
		            	var x = xy[0] - parentXY[0];
		            	var y = xy[1] - parentXY[1];
		            	var chartItem = this.down('#chart').getItemForPoint(x,y);
		            	if (chartItem != null && chartItem.record.get('category') === 'term') {
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
    	
		config.series[0].label = {
			field: 'term',
			display: 'over'
		};
		config.series[1].label = {
			field: 'term',
			display: 'over'
		};
    	
    	var chart = Ext.create('Ext.chart.CartesianChart', config);
    	this.queryById('chartParent').insert(0, chart);
    	this.doLabels();
    	
    	if (this.newTerm !== null) {
        	this.selectTerm(this.newTerm);
        	this.newTerm = null;
        }
    },
    
    doLabels: function() {
    	var chart = this.queryById('chart');
    	var series = chart.getSeries();
    	var summary = chart.getSurface('chart').getItems()[0];
    	var labels = this.getApiParam("label");
    	if (labels.indexOf("summary")>-1) {summary.show();}
    	else {summary.hide();}
    	if (labels.indexOf("terms")>-1) {series[0].getLabel().show();}
    	else {series[0].getLabel().hide();}
    	if (labels.indexOf("docs")>-1) {series[1].getLabel().show();}
    	else {series[1].getLabel().hide();}
    },
    
    selectTerm: function(term) {
    	var chart = this.down('#chart');
    	var series = chart.getSeries()[0];
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
    		
    		var point = this.getPointFromIndex(series, index);
    		this.highlightData = {x: point[0], y: point[1], r: 50};
    		
    		if (this.highlightTask == null) {
    			this.highlightTask = Ext.TaskManager.newTask({
        			run: this.doHighlight,
        			scope: this,
        			interval: 25,
        			repeat: this.highlightData.r
        		});
    		}
    		this.highlightTask.restart();
    	}
    },
    
    getPointFromIndex: function(series, index) {
		var sprite = series.getSprites()[0];
		var matrix = sprite.attr.matrix.clone().prependMatrix(sprite.surfaceMatrix);
		var dataX = sprite.attr.dataX[index];
		var dataY = sprite.attr.dataY[index];
		return matrix.transformPoint([dataX, dataY]);
    },
    
    doHighlight: function() {
    	var chart = this.down('#chart');
    	if (this.highlightData.r > 0) {
	    	var surf = chart.getSurface();
			var highlight = null;
			var items = surf.getItems();
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				if (item.id == 'customHighlight') {
					highlight = item;
					break;
				}
			}
			if (highlight == null) {
				surf.add({
					id: 'customHighlight',
					type: 'circle',
					strokeStyle: 'red',
					fillStyle: 'none',
					radius: this.highlightData.r,
					x: this.highlightData.x,
					y: this.highlightData.y
				});
			} else {
				highlight.setAttributes({
					x: this.highlightData.x,
					y: this.highlightData.y,
					radius: this.highlightData.r
				});
				this.highlightData.r -= 1.5;
				if (this.highlightData.r <= 0) {
					this.highlightData.r = 0;
					surf.remove(highlight, true);
				}
			}
			chart.redraw();
    	}
    },
    
    getCurrentTerms: function() {
    	var terms = [];
    	this.termStore.each(function(r) {
    		if (r.get('category') === 'term') {
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
//    		params.term = terms;
    	}
    	Ext.apply(params, this.getApiParams());
    	if (params.target != null) {
    		params.term = terms;
    	}

    	if (params.analysis === 'pca') {
    		this.pcaStore.load({
	    		params: params
	    	});
    	} else if (params.analysis === 'docSim'){
    		this.docSimStore.load({
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

/*
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
Ext.define('Voyant.panel.StreamGraph', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.streamgraph',
    statics: {
    	i18n: {
    	},
    	api: {
    		limit: 5,
    		stopList: 'auto',
    		query: undefined,
    		withDistributions: 'relative',
    		bins: 50,
    		docIndex: undefined,
    		docId: undefined
    	},
		glyph: 'xf1fe@FontAwesome'
    },
    
    config: {
    	corpus: undefined,
    	visLayout: undefined,
    	vis: undefined,
    	mode: 'corpus'
    },
    
    graphMargin: {top: 20, right: 60, bottom: 110, left: 80},
    
    MODE_CORPUS: 'corpus',
    MODE_DOCUMENT: 'document',
    
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
        var me = this;
        
        Ext.apply(me, {
    		title: this.localize('title'),
    		tbar: new Ext.Toolbar({
        		enableOverflow: true,
				items: ['->',{
					xtype: 'legend',
					store: new Ext.data.JsonStore({
						fields: ['name', 'mark', 'active']
					}),
					listeners: {
						itemclick: function(view, record, el, index) {
							var isActive = Ext.fly(el.firstElementChild).hasCls('x-legend-inactive');
							record.set('active', isActive);
							var terms = this.getCurrentTerms();
							this.setApiParams({query: terms, limit: terms.length, stopList: undefined});
							this.loadFromCorpus();
						},
						scope: this
					}
				},'->']
			}),
			bbar: {
        		enableOverflow: true,
				items: [{
                	xtype: 'querysearchfield'
                },{
	            	xtype: 'button',
	            	text: this.localize('clearTerms'),
	            	handler: function() {
	            		this.setApiParams({query: undefined});
	            		this.loadFromRecords([])
	            	},
	            	scope: this
	            },{
	            	xtype: 'corpusdocumentselector',
	            	singleSelect: true
	            },{
	            	text: this.localize('freqsMode'),
					glyph: 'xf201@FontAwesome',
				    tooltip: this.localize('freqsModeTip'),
				    menu: {
				    	items: [{
				               text: this.localize('relativeFrequencies'),
				               checked: true,
				               itemId: 'relative',
				               group: 'freqsMode',
				               checkHandler: function(item, checked) {
				            	   if (checked) {
				                	   this.setApiParam('withDistributions', 'relative');
				                	   this.loadFromCorpus();
				            	   }
				               },
				               scope: this
				           }, {
				               text: this.localize('rawFrequencies'),
				               checked: false,
				               itemId: 'raw',
				               group: 'freqsMode',
				               checkHandler: function(item, checked) {
				            	   if (checked) {
				                	   this.setApiParam('withDistributions', 'raw');
				                	   this.loadFromCorpus();
				            	   }
				               },
				               scope: this
			           }]
				    }
	            },{
	            	xtype: 'slider',
	            	itemId: 'segmentsSlider',
	            	fieldLabel: this.localize('segments'),
	            	labelAlign: 'right',
	            	labelWidth: 70,
	            	width: 150,
	            	increment: 10,
	            	minValue: 10,
	            	maxValue: 300,
	            	listeners: {
	            		afterrender: function(slider) {
	            			slider.setValue(this.getApiParam('bins'));
	            		},
	            		changecomplete: function(slider, newvalue) {
	            			this.setApiParams({bins: newvalue});
	            			this.loadFromCorpus();
	            		},
	            		scope: this
	            	}
	            }]
			}
        });
        
        this.on('loadedCorpus', function(src, corpus) {
        	this.setCorpus(corpus);
        	if (this.getCorpus().getDocumentsCount() == 1 && this.getMode() != this.MODE_DOCUMENT) {
				this.setMode(this.MODE_DOCUMENT);
			}
			if (!('bins' in this.getModifiedApiParams())) {
				if (this.getMode() == this.MODE_CORPUS) {
					var count = corpus.getDocumentsCount();
					var binsMax = 100;
					this.setApiParam('bins', count > binsMax ? binsMax : count);
				}
			}
    		if (this.isVisible()) {
    			this.loadFromCorpus();
    		}
        }, this);
        
        this.on('corpusSelected', function(src, corpus) {
    		if (src.isXType('corpusdocumentselector')) {
    			this.setMode(this.MODE_CORPUS);
    			this.setApiParams({docId: undefined, docIndex: undefined});
    			this.setCorpus(corpus);
        		this.loadFromCorpus();
    		}
    	});
        
        this.on('documentSelected', function(src, doc) {
        	var docId = doc.getId();
        	this.setApiParam('docId', docId);
        	this.loadFromDocumentTerms();
        }, this);
        
		this.on('query', function(src, query) {
        	var terms = this.getCurrentTerms();
        	terms.push(query);
        	this.setApiParams({query: terms, limit: terms.length, stopList: undefined});
        	if (this.getMode() === this.MODE_DOCUMENT) {
        		this.loadFromDocumentTerms();
        	} else {
        		this.loadFromCorpusTerms(this.getCorpus().getCorpusTerms());
        	}
        }, this);
		
        this.on('resize', function(panel, width, height) {

		}, this);
        
        this.on('boxready', this.initGraph, this);
        
        me.callParent(arguments);
    },
    
    loadFromCorpus: function() {
    	var corpus = this.getCorpus();
		if (this.getApiParam('docId') || this.getApiParam('docIndex')) {
			this.loadFromDocumentTerms();
		} else if (corpus.getDocumentsCount() == 1) {
			this.loadFromDocument(corpus.getDocument(0));
		} else {
			this.loadFromCorpusTerms(corpus.getCorpusTerms());
		}
	},

    loadFromCorpusTerms: function(corpusTerms) {
    	var params = this.getApiParams(['limit','stopList','query','withDistributions','bins']);
		// ensure that we're not beyond the number of documents
		if (params.bins && params.bins > this.getCorpus().getDocumentsCount()) {
			params.bins = this.getCorpus().getDocumentsCount();
		}
		corpusTerms.load({
		    callback: function(records, operation, success) {
		    	if (success) {
		    		this.setMode(this.MODE_CORPUS);
			    	this.loadFromRecords(records);
		    	} else {
					Voyant.application.showResponseError(this.localize('failedGetCorpusTerms'), operation);
		    	}
		    },
		    scope: this,
		    params: params
    	});
    },
    
    loadFromDocument: function(document) {
    	if (document.then) {
    		var me = this;
    		document.then(function(document) {me.loadFromDocument(document);});
    	} else {
    		var ids = [];
    		if (Ext.getClassName(document)=="Voyant.data.model.Document") {
        		this.setApiParams({
        			docIndex: undefined,
        			query: undefined,
        			docId: document.getId()
        		});
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
    		    		this.setMode(this.MODE_DOCUMENT);
    		    		this.loadFromRecords(records);
    		    	}
    		    	else {
    					Voyant.application.showResponseError(this.localize('failedGetDocumentTerms'), operation);
    		    	}
    		    },
    		    scope: this,
    		    params: this.getApiParams(['docId','docIndex','limit','stopList','query','withDistributions','bins'])
        	});
    	}
    },
    
    loadFromRecords: function(records) {
    	var color = d3.scale.category10();
    	
    	var legendStore = this.down('[xtype=legend]').getStore();
    	var legendData = [];
    	var layers = [];
    	records.forEach(function(record, index) {
    		var termLayer = [];
    		var key = record.getTerm();
    		record.get('distributions').forEach(function(r, i) {
    			termLayer.push({x: i, y: r});
    		}, this);
    		layers.push({name: key, values: termLayer});
    		legendData.push({id: key, name: key, mark: color(index), active: true});
    	}, this);
    	
    	legendStore.loadData(legendData);
    	
    	var processedLayers = this.getVisLayout()(layers);
    	
    	var steps;
    	if (this.getMode() === this.MODE_DOCUMENT) {
    		steps = this.getApiParam('bins');
    	} else {
    		var bins = this.getApiParam('bins');
    		var docsCount = this.getCorpus().getDocumentsCount();
    		steps = bins < docsCount ? bins : docsCount;
    	}
    	steps--;
    	
    	var width = this.body.down('svg').getWidth() - this.graphMargin.left - this.graphMargin.right;
    	var x = d3.scale.linear().domain([0, steps]).range([0, width]);
    	
    	var max = d3.max(processedLayers, function(layer) {
    		return d3.max(layer.values, function(d) { return d.y0 + d.y; });
    	});
    	var height = this.body.down('svg').getHeight() - this.graphMargin.top - this.graphMargin.bottom;
    	var y = d3.scale.linear().domain([0, max]).range([height, 0]);
    	
    	var area = d3.svg.area()
	    	.x(function(d) { return x(d.x); })
			.y0(function(d) { return y(d.y0); })
			.y1(function(d) { return y(d.y0 + d.y); });
    	
    	var xAxis = d3.svg.axis().scale(x).orient('bottom');
    	if (this.getMode() === this.MODE_CORPUS) {
    		var tickvals = [];
    		for (var i = 0; i <= steps; i++) {
    			tickvals.push(i);
    		}
    		xAxis.tickValues(tickvals); // force number of ticks
    		xAxis.tickFormat(''); // hide tick numbers
    	}
    	
    	var yAxis = d3.svg.axis().scale(y).orient('left');
    	
    	// join
    	var paths = this.getVis().selectAll('path').data(processedLayers, function(d) { return d.name; });
    	
    	// update
    	paths.attr('d', function(d) { return area(d.values); }).style('fill', function(d, i) { return color(i); });
    	
    	// enter
    	paths.enter().append('path')
		.attr('d', function(d) { return area(d.values); })
		.style('fill', function(d, i) { return color(i); })
		.append('title').text(function (d) { return d.name; });
    	
    	// exit
    	paths.exit().remove();
    	
    	this.getVis().selectAll('g.axis').remove();
    	
    	this.getVis().append('g')
    		.attr('class', 'axis x')
    		.attr('transform', 'translate(0,'+height+')')
    		.call(xAxis);
    	
    	var xAxisText;
    	if (this.getMode() === this.MODE_CORPUS) {
    		var stepIncrement = width / steps;
    		var currStep = 0;
    		this.getCorpus().getDocuments().each(function(doc) {
    			this.getVis().select('g.x').append("text")
					.attr('text-anchor', 'end')
					.attr('transform', 'translate('+currStep+', 10) rotate(-45)')
					.text(doc.getTinyTitle());
    			
    			currStep += stepIncrement;
    		}, this);
    		
    		xAxisText = this.localize('documents');
    	} else {
    		xAxisText = this.localize('documentSegments');
    	}
    	this.getVis().select('g.x').append("text")
			.attr('text-anchor', 'middle')
			.attr('transform', 'translate('+width/2+', '+(this.graphMargin.bottom-20)+')')
			.text(xAxisText);
    	
    	this.getVis().append('g')
			.attr('class', 'axis y')
			.attr('transform', 'translate(0,0)')
			.call(yAxis);
    	
    	var yAxisText;
    	if (this.getApiParam('withDistributions') === 'raw') {
    		yAxisText = this.localize('rawFrequencies');
    	} else {
    		yAxisText = this.localize('relativeFrequencies');
    	}
    	this.getVis().select('g.y').append("text")
			.attr('text-anchor', 'middle')
			.attr('transform', 'translate(-'+(this.graphMargin.left-20)+', '+height/2+') rotate(-90)')
			.text(yAxisText);
    },
    
	getCurrentTerms: function() {
    	var terms = [];
    	this.down('[xtype=legend]').getStore().each(function(record) {
    		if (record.get('active')) {
    			terms.push(record.get('name'));
    		}
    	}, this);
    	return terms;
    },
	
    initGraph: function() {
    	if (this.getVisLayout() === undefined) {
	    	var el = this.getLayout().getRenderTarget();
	    	var paddingH = this.graphMargin.left + this.graphMargin.right;
	    	var paddingV = this.graphMargin.top + this.graphMargin.bottom;
	    	var width = el.getWidth()-paddingH;
			var height = el.getHeight()-paddingV;
	    	this.setVisLayout(
				d3.layout.stack()
					.offset('silhouette')
					.values(function(d) {
						return d.values;
					})
			);
			
			this.setVis(d3.select(el.dom).append('svg').attr('id','streamGraph')
					.attr('width', width+paddingH).attr('height', height+paddingV).append('g').attr('transform', 'translate('+this.graphMargin.left+','+this.graphMargin.top+')')
			);
    	}
    }
});


/**
 * A Summary of a corpus.
 */
Ext.define('Voyant.panel.Summary', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel', 'Voyant.util.SparkLine'],
	alias: 'widget.summary',
    statics: {
    	i18n: {
    	},
    	api: {
    		stopList: 'auto',
    		start: 0,
    		limit: 5,
    		// The maximum number of documents to show distinctive words for.
    		numberOfDocumentsForDistinctiveWords: 10
    	},
		glyph: 'xf1ea@FontAwesome'
    },
    config: {
    	corpus: undefined,
    	options: {xtype: 'stoplistoption'}
    },
    autoScroll: true,
    cls: 'corpus-summary',
    
    constructor: function(config ) {

    	Ext.apply(this, {
    		title: this.localize('title'),
    		items: {
    			itemId: 'main',
    			cls: 'main',
    			margin: 10
    		},
    		dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
        		enableOverflow: true,
                items: [{
        			fieldLabel: this.localize('items'),
        			labelWidth: 40,
        			width: 120,
        			xtype: 'slider',
	            	increment: 5,
	            	minValue: 5,
	            	maxValue: 59,
	            	listeners: {
	            		afterrender: function(slider) {
	            			slider.setValue(this.getApiParam("visible"))
	            		},
	            		changecomplete: function(slider, newvalue) {
	            			this.setApiParams({limit: newvalue});
	            			this.loadSummary();
	            		},
	            		scope: this
	            	}
                }]
    		}]
    	});

        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
    	this.on("afterrender", function() {
        	this.body.addListener('click', function(e) {
    			var target = e.getTarget(null, null, true);
    			if (target && target.dom.tagName == 'A') {
    				if (target.hasCls('document-id')) {
    					var docId = target.getAttribute('val', 'voyant');
    					var doc = this.getCorpus().getDocuments().getById(docId);
    					this.dispatchEvent('documentsClicked', this, [doc]);
    				} else if (target.hasCls('corpus-type')) {
    					this.dispatchEvent('termsClicked', this, [target.getHtml()]);
    				} else if (target.hasCls('document-type')) {
    					this.dispatchEvent('documentIndexTermsClicked', this, [{
    						term: target.getHtml(),
    						docIndex: target.getAttribute("docIndex", 'voyant')
    					}]);
    				}
    			}
    		}, this);
    	})
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		
    		this.setCorpus(corpus);
    		
    		if (this.rendered) {
    			this.loadSummary();
    		}
    		else {
    			this.on("afterrender", function() {
    				this.loadSummary();
    			}, this)
    		}

    	});
    	
    	// if we have a corpus, load it
    	if (config && config.corpus) {
    		this.fireEvent('loadedCorpus', this, config.corpus);
    	}
    	
    	this.on("resize", function() {
    		var available = this.getWidth()-200;
    		this.query("sparklineline").forEach(function(spark) {
    			if (spark.getWidth()>available) {
    				spark.setWidth(available);
    			}
    		})
    	}, this)
    },
    
    loadSummary: function() {
    	
    	var me = this;
    	
    	var main = this.queryById('main');
    	
    	main.removeAll();
    	main.add({
    		html: this.getCorpus().getString()
    	});
    	
    	var docs = this.getCorpus().getDocuments().getRange();
    	var limit = this.getApiParam('limit');
    	
    	if (docs.length>1) {
    		
    		docs.sort(function(d1, d2) {return d2.getLexicalTokensCount()-d1.getLexicalTokensCount()});
        	var docsLengthTpl = new Ext.XTemplate('<tpl for="." between="; "><a href="#" onclick="return false" class="document-id" voyant:val="{id}" data-qtip="{title}">{shortTitle}</a><span style="font-size: smaller"> (<span class="info-tip" data-qtip="{valTip}">{val}</span>)</span></a></tpl>')

        	
        	var sparkWidth;
        	if (docs.length<25) {sparkWidth=docs.length*4;}
        	else if (docs.length<50) {sparkWidth=docs.length*2;}
        	else if (docs.length>100) {
        		var available  = main.getWidth()-200;
        		sparkWidth = available < docs.length ? docs.length : available;
        	}
        	
        	var numberOfTerms = this.localize('numberOfTerms');
        	main.add({
	    		cls: 'section',
        		items: [{
		    		layout: 'hbox',
		    		align: 'bottom',
		    		items: [{
		    			html: this.localize('docsLength'),
		    			cls: 'header'
		    		}, {
		    			xtype: 'sparklineline',
		    			values: this.getCorpus().getDocuments().getRange().map(function(doc) {return doc.getLexicalTokensCount()}),
		                tipTpl: new Ext.XTemplate('{[this.getDocumentTitle(values.x,values.y)]}', {
		                	getDocumentTitle: function(docIndex, len) {
		                		return '('+len+') '+this.panel.getCorpus().getDocument(docIndex).getTitle()
		                	},
		                	panel: me 
		                }),
		    			height: 16,
		    			width: sparkWidth
		    		}]
		    	},{
	    			html: '<ul><li>'+this.localize('longest')+docsLengthTpl.apply(docs.slice(0, docs.length>limit ? limit : parseInt(docs.length/2)).map(function(doc) {return {
						id: doc.getId(),
						shortTitle: doc.getShortTitle(),
						title: doc.getTitle(),
						val: doc.getLexicalTokensCount(),
						valTip: numberOfTerms
					}}))+'</li>'+
	    				'<li>'+this.localize('shortest')+docsLengthTpl.apply(docs.slice(-(docs.length>limit ? limit : parseInt(docs.length/2))).reverse().map(function(doc) {return {
	    					id: doc.getId(),
	    					shortTitle: doc.getShortTitle(),
	    					title: doc.getTitle(),
	    					val: doc.getLexicalTokensCount(),
	    					valTip: numberOfTerms
	    				}}))+'</li>'
	        	}]
        	})
        	
    		docs.sort(function(d1, d2) {return d2.getLexicalTypeTokenRatio()-d1.getLexicalTypeTokenRatio()});
        	main.add({
        		cls: 'section',
        		items: [{
		    		layout: 'hbox',
		    		align: 'bottom',
		    		cls: 'section',
		    		items: [{
		    			html: this.localize("docsDensity"),
		    			cls: 'header'
		    		}, {
		    			xtype: 'sparklineline',
		    			values: this.getCorpus().getDocuments().getRange().map(function(doc) {return Ext.util.Format.number(doc.getLexicalTypeTokenRatio(),'0.000')}),
		                tipTpl: new Ext.XTemplate('{[this.getDocumentTitle(values.x,values.y)]}', {
		                	getDocumentTitle: function(docIndex, len) {
		                		return '('+len+') '+this.panel.getCorpus().getDocument(docIndex).getTitle()
		                	},
		                	panel: me 
		                }),
		    			height: 16,
		    			width: sparkWidth
		    		}]
		    	},{
	    			html: '<ul><li>'+this.localize('highest')+docsLengthTpl.apply(docs.slice(0, docs.length>limit ? limit : parseInt(docs.length/2)).map(function(doc) {return {
						id: doc.getId(),
						shortTitle: doc.getShortTitle(),
						title: doc.getTitle(),
						val: Ext.util.Format.number(doc.getLexicalTypeTokenRatio(),'0.000'),
						valTip: numberOfTerms
					}}))+'</li>'+
	    				'<li>'+this.localize('lowest')+docsLengthTpl.apply(docs.slice(-(docs.length>limit ? limit : parseInt(docs.length/2))).reverse().map(function(doc) {return {
	    					id: doc.getId(),
	    					shortTitle: doc.getShortTitle(),
	    					title: doc.getTitle(),
	    					val: Ext.util.Format.number(doc.getLexicalTypeTokenRatio(),'0.000'),
	    					valTip: numberOfTerms
	    				}}))+'</li>'
	        	}]
        	})
    	}
    	
    	main.add({
    		html: this.localize("mostFrequentWords"),
    		cls: 'section',
    		listeners: {
    			afterrender: function(container) {
    				container.mask(me.localize("loading"));
    				me.getCorpus().getCorpusTerms().load({
    					params: {
    						limit: me.getApiParam('limit'),
    						stopList: me.getApiParam('stopList'),
    						forTool: this.xtype
    					},
    					callback: function(records, operation, success) {
    						if (success && records && records.length>0) {
    							container.unmask();
    							Ext.dom.Helper.append(container.getTargetEl().first().first(),
			   	        			 new Ext.XTemplate('<tpl for="." between="; "><a href="#" onclick="return false" class="corpus-type keyword" voyant:recordId="{id}">{term}</a><span style="font-size: smaller"> ({val})</span></tpl>')
			   	        		 		.apply(records.map(function(term) {
			   	        		 			return {
				   	        		 			id: term.getId(),
				   	        		 			term: term.getTerm(),
				   	        		 			val: term.getRawFreq()
			   	        		 			}
		   	        		 		}))
		   	        		 	)
    						}
    					}
    				})
    			}
    		},
    		scope: this
    	})
    	
    	if (docs.length>1) {
        	main.add({
        		html: this.localize("mostFrequentWords")+"<ol></ol>",
        		cls: 'section',
        		itemId: 'distinctiveWords',
        		listeners: {
        			afterrender: function(container) {
        				me.showMoreDistinctiveWords();
        			}
        		},
        		scope: this
        	})
    	}
    	
    },
     
    showMoreDistinctiveWords: function() {
    	var distinctiveWordsContainer = this.queryById('distinctiveWords');
    	var list = distinctiveWordsContainer.getTargetEl().selectNode("ol");
    	var count = Ext.dom.Query.select("li:not(.more)", list).length;
    	var numberOfDocumentsForDistinctiveWords = parseInt(this.getApiParam('numberOfDocumentsForDistinctiveWords'));
    	var range = this.getCorpus().getDocuments().getRange(count, count+numberOfDocumentsForDistinctiveWords-1);
    	if (range && Ext.isArray(range)) {
    		var docIndex = [];
    		range.forEach(function(doc) {
    			docIndex.push(doc.getIndex())
    		})
    		if (docIndex.length>0) {
    			this.getCorpus().getDocumentTerms().load({
    				addRecords: true,
    				params: {
    					docIndex: docIndex,
    					perDocLimit: parseInt(this.getApiParam("limit")),
    					limit: numberOfDocumentsForDistinctiveWords*parseInt(this.getApiParam("limit")),
						stopList: this.getApiParam('stopList'),
    					sort: 'TFIDF',
    					dir: 'DESC',
    					forTool: this.xtype
    				},
    				scope: this,
    				callback: function(records, operation, success) {
    					var docs = {};
    					if (success && records && Ext.isArray(records)) { // TODO: why wouldn't we have records here?
    						records.forEach(function(r, index, array) {
    							var i = r.getDocIndex();
    							if (!(i in docs)) {docs[i]=[]};
    							docs[i].push({
    								id: r.getId(),
    								docIndex: r.getDocIndex(),
    								type: r.getTerm(),
    								val: Ext.util.Format.number(r.get('rawFreq'),'0,000'),
    								docId: r.get('docId')
    							});

    						});
    						var len;
    						docIndex.forEach(function(index) {
    							var doc = this.getCorpus().getDocument(index);
    							len = docs[index].length; // declare for template
    		    				Ext.dom.Helper.append(list, {tag: 'li', 'voyant:index': String(index), html: 
    		    					'<a href="#" onclick="return false" class="document-id document-id-distinctive" voyant:val="'+doc.get('id')+'">'+doc.getShortTitle()+'</a>'+
    		    					this.localize('colon')+ new Ext.XTemplate(this.localize('documentType')).apply({types: docs[index]})+'.'
    		    				});
    						}, this);
    						distinctiveWordsContainer.updateLayout()
    						len = numberOfDocumentsForDistinctiveWords;
    						remaining = this.getCorpus().getDocuments().getTotalCount() - count - docIndex.length;
    						if (remaining>0) {
        	    				var tpl = new Ext.Template(this.localize('moreDistinctiveWords'));
        						var more = Ext.dom.Helper.append(list, {tag: 'li', cls: 'more', html: tpl.apply([len>remaining ? remaining : len,remaining])}, true);
        						more.on("click", function() {
        							more.remove();
        							this.showMoreDistinctiveWords();
        						}, this)
    						}
    					}
    				}
    			});
    		}
    	}
    }    
});

Ext.define('Voyant.panel.TextualArc', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.textualarc',
    statics: {
    	i18n: {
    	},
    	api: {
    		/**
    		 * @property stopList The stop list to use to filter results.
    		 * Choose from a pre-defined list, or enter a comma separated list of words, or enter an URL to a list of stop words in plain text (one per line).
    		 * @type String
    		 * @private
    		 */
    		stopList: 'auto',
    		
    		docIndex: 0,
    		
    		speed: 50,
    		
    		minRawFreq: 2
    			
    	},
    	glyph: 'xf06e@FontAwesome'
	},
	config: {
		corpus: undefined,
    	options: [{xtype: 'stoplistoption'},{
    		xtype: 'container',
    		items: {
    			xtype: 'numberfield',
	    		name: 'minRawFreq',
	    		minValue: 1,
	    		maxValue: 10,
	    		value: 2,
	    		labelWidth: 150,
	    		labelAlign: 'right',
	    		initComponent: function() {
	    			var panel = this.up('window').panel;
	    			this.fieldLabel = panel.localize(this.fieldLabel);
	    			this.on("afterrender", function(cmp) {
			        	Ext.tip.QuickTipManager.register({
			                 target: cmp.getEl(),
			                 text: panel.localize('minRawFreqTip')
			             });
	    			})
	    			this.callParent(arguments);
	    		},
	    		fieldLabel: 'minRawFreq'
    		}
    	}]
	},
	
	tokensFetch: 500,
	
    constructor: function() {

    	this.mixins['Voyant.util.Localization'].constructor.apply(this, arguments);
    	this.config.options[1].fieldLabel = this.localize(this.config.options[1].fieldLabel);
    	Ext.apply(this, {
    		title: this.localize('title'),
			html: '<canvas width="800" height="600"></canvas>',
    		dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
        		enableOverflow: true,
                items: [{
                	xtype: 'combo',
                	itemId: 'search',
                	queryMode: 'local',
                	displayField: 'term',
                	valueField: 'term',
                	width: 90,
                	emptyText: this.localize('search'),
                	forceSelection: true,
                	disabled: true
                },{
	            	xtype: 'documentselectorbutton',
	            	singleSelect: true
	            },{
					xtype: 'slider',
					fieldLabel: this.localize('speed'),
					labelAlign: 'right',
					labelWidth: 40,
					width: 100,
					increment: 1,
					minValue: 0,
					maxValue: 100,
					value: 30,
					listeners: {
	                	render: function(cmp) {
	                		cmp.setValue(parseInt(this.getApiParam("speed")));
	    		        	Ext.tip.QuickTipManager.register({
	    		        		target: cmp.getEl(),
	   		                 	text: this.localize('speedTip')
	    		        	});
	                		
	                	},
	                    changecomplete: function(cmp, val) {
	                    	this.setApiParam('speed', val);
                    		this.isReading = val!==0
                    		this.draw();
	                    },
	                    scope: this
					}
				},{xtype: 'tbfill'}, {
	    			xtype: 'tbtext',
	    			html: this.localize('adaptation')
	    		}]
    		}]
    	});
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
    	this.on('boxready', function(cmp) {
    		var gutter = 20,
			availableWidth = this.getTargetEl().getWidth() - gutter - gutter,
			availableHeight = this.getTargetEl().getHeight() - gutter - gutter,
			diam = Math.max(availableWidth, availableHeight), rad = diam /2,
			ratio = Math.min(availableWidth, availableHeight) / diam,
			canvas = this.getTargetEl().dom.querySelector("canvas"), ctx = canvas.getContext("2d");
			canvas.width = this.getTargetEl().getWidth();
			canvas.height = this.getTargetEl().getHeight();
			this.diam = diam;
			this.perim = [];
			var i = parseInt(diam*.75)
			while (this.perim.length<diam) {
	    		this.perim.push({
	    			x:  gutter+(availableWidth/2)+(rad * (availableWidth>availableHeight ? 1 : ratio) * Math.cos(2 * Math.PI * i / diam)),
	    			y:  gutter+(availableHeight/2)+(rad * (availableHeight>availableWidth ? 1 : ratio) * Math.sin(2 * Math.PI * i / diam))
	    		})
	    		if (i++==diam) {i=0;}
			}
	    	this.draw(canvas);

    		canvas.addEventListener('mousemove', function(evt) {
    			if (cmp.documentTerms) {
        			var rect = canvas.getBoundingClientRect(), x =  evt.clientX - rect.left, y = evt.clientY - rect.top;
        			
        			var currentTerms = {};
        			cmp.documentTerms.each(function(documentTerm) {
        				var dx = documentTerm.get('x'), dy = documentTerm.get('y');
        				if (dx>x-15 && dx<x+15 && dy>y-15 && dy<y+15) {
        					currentTerms[documentTerm.getTerm()] = true;
        					return false;
        				}
        			})
        			
        			// no need to do anything if there are no current terms and none found
        			if (Object.keys(cmp.currentTerms || {}).length==0 && Object.keys(currentTerms).length==0) {return;}

        			cmp.currentTerms = currentTerms;
        			cmp.draw(canvas); // otherwise redraw
    			}
    			
    	      }, false);
    	})
    	
    	this.on('loadedCorpus', function(src, corpus) {
    		this.setCorpus(corpus);
			this.loadDocument();
    	}, this);
    	
    	this.on("documentselected", function(src, doc) {
    		this.setApiParam('docIndex', this.getCorpus().getDocument(doc).getIndex());
    		this.loadDocument();
    	});
    	
    	this.on("resize", function() {
    	})
    },
    
    draw: function(canvas, ctx) {
    	canvas = canvas ||  this.getTargetEl().dom.querySelector("canvas");
    	ctx = ctx || canvas.getContext("2d");
    	ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.fillStyle = "rgba(0,0,0,.1)";
    	this.perim.forEach(function(p,i) {
    		if (i%3==0) {
        		ctx.fillRect(p.x-5,p.y,10,1)
    		}
    	})
    	if (this.documentTerms) {
        	this.drawTerms(canvas, ctx);
        	this.drawReading(canvas,ctx);
        	if (this.isReading) {
        		var me = this;
        		setTimeout(function() {
        			me.draw();
        		}, 10)
        	}
    	}
    },
    
    drawReading: function(canvas, ctx) {
    	ctx = ctx || this.getTargetEl().dom.querySelector("canvas").getContext("2d");
    	var delay = 2000-(parseInt(this.getApiParam('speed'))*1999/100);
    	if (this.isReading && this.documentTerms) {
    		var current = parseInt(this.readingIndex * this.perim.length / this.lastToken);
    		ctx.fillStyle = "purple";
    		ctx.fillRect(this.perim[current].x,this.perim[current].y, 5, 5)
			var first = this.readingStartTime == undefined;
			this.readingStartTime = this.readingStartTime || new Date().getTime();
			var delta = this.readingStartTime+delay-new Date().getTime();
    		if (this.sourceTerm && this.targetTerm) {
    			var maxTail = 10;
    			if (first || delta<=0) {
    				this.previousBeziers = this.previousBeziers || []; // this should be reset by tokens reader during first read
        			var sx = this.sourceTerm.get('x'), sy = this.sourceTerm.get('y'), tx = this.targetTerm.get('x'), ty = this.targetTerm.get('y'),
    					px = this.previousTerm ? this.previousTerm.get('x') : sx, py = this.previousTerm ? this.previousTerm.get('y') : sy,
    					round = 100, multiplier = .3;
    				
        			var ix, iy, xd = Math.max(round, Math.abs(sx-tx) * .5), yd = Math.max(round, Math.abs(sy-ty) * .5);
        			ix = sx > tx ? sx - xd : sx + xd;
        			iy = ty > sy ? sy + yd : sy - yd;
    				this.previousBeziers.unshift([sx,sy,ix,iy,tx,ty]);
    				if (this.previousBeziers.length>maxTail) {this.previousBeziers.pop()}
    			}
    			
    			for (var i=0; i<this.previousBeziers.length; i++) {
	        		ctx.strokeStyle="rgba(0,0,255,"+(1-(i*.1))+")";
    				var start = i+1 == this.previousBeziers.length ? 1-(delta/delay) : 0;
    				var end = i==0 ? 1-(delta/delay) : 1;
            		this.drawBezierSplit.apply(this, Ext.Array.merge([ctx], this.previousBeziers[i], [start], [end]));
    			}
    			if (delta<=0) {
        			this.readingStartTime = undefined;
        			this.read();
    			}
    		}
    		var nextReadingIndex = this.readingIndex+1;
    		for (var len=this.tokens.getCount(); nextReadingIndex<len; nextReadingIndex++) {
    			if (this.tokens.getAt(nextReadingIndex).getTerm().toLowerCase()==this.targetTerm.getTerm()) {
    				break;
    			}
    		}
    		var startReadingIndex = nextReadingIndex-parseInt(delta*(nextReadingIndex-this.readingIndex)/delay), count = this.tokens.getCount();
    		for (; startReadingIndex<nextReadingIndex; startReadingIndex++) {
    			if (startReadingIndex < count && this.tokens.getAt(startReadingIndex).isWord()) {
    				break;
    			}
    		}
    		var tokens = this.tokens.getRange(startReadingIndex, len=Math.min(this.readingIndex+50, this.tokens.getCount())).map(function(token) {
    			return token.getTerm();
    		})
	    	ctx.font = "14px sans-serif";
    		ctx.fillStyle = "rgba(0,0,0,.5)";
        	ctx.textAlign = "left";
    		ctx.fillText(tokens.join(""), canvas.width/4, canvas.height-5);
    		ctx.clearRect(canvas.width*.75, canvas.height-20, canvas.width, 30)
    	} else if (this.documentTerms && this.documentTerms.getCount()<this.documentTerms.getTotalCount()) {
    		var x = canvas.width / 4;
    		ctx.strokeStyle="rgba(0,0,0,.5)";
    		ctx.fillStyle = "rgba(0,0,0,.2)";
    		ctx.strokeRect(x,canvas.height-12,x*2,10);
    		ctx.fillRect(x,canvas.height-12,(this.documentTerms.getCount()*x*2)/this.documentTerms.getTotalCount(),10);
    	}
    },
    
    drawTerms: function(canvas, ctx) {
    	canvas = canvas || this.getTargetEl().dom.querySelector("canvas");
    	ctx = ctx || canvas.getContext("2d");
    	ctx.textAlign = "center";
    	if (this.documentTerms && this.perim) {
    		this.documentTerms.each(function(documentTerm) {
    			var me = this, freq = documentTerm.getRawFreq(), term = documentTerm.getTerm(),
    				x = documentTerm.get('x'), y = documentTerm.get('y');
    			isCurrentTerm = me.currentTerms && (term in me.currentTerms);
    			isReadingTerm = this.sourceTerm && this.sourceTerm.getTerm() == term;
    	    	ctx.font = ((Math.log(freq)*(canvas.width*10/800)/Math.log(this.maxRawFreq))+(isCurrentTerm || isReadingTerm ? 10 : 5)) + "px sans-serif";
    	    	if (isCurrentTerm) {
    	    		ctx.fillStyle = "red";
    	    	} else if (isReadingTerm) {
    	    		ctx.fillStyle = "blue";
    	    	} else {
    	    		ctx.fillStyle = "rgba(0,0,0,"+((freq*.9/this.maxRawFreq)+.1)+")";
    	    	}
    	    	if (isCurrentTerm || isReadingTerm) {
    	    		ctx.strokeStyle = isCurrentTerm ? "rgba(255,0,0,.2)" : "rgba(0,255,0,.4)";
    	    		documentTerm.getDistributions().forEach(function(d, i) {
    	    			if (d>0 && this.perim[i]) {
    	    				ctx.beginPath();
    	    				ctx.moveTo(x, y);
    	    				ctx.lineTo(this.perim[i].x,this.perim[i].y);
    	    				ctx.stroke();
    	    			}
    	    		}, this)
    	    	}
    			ctx.fillText(term, x, y);
    			
    		}, this)    		
    	}
    },
    
    read: function(index) {
    	if (Ext.isNumber(index)) {this.readingIndex=index;}
    	else {this.readingIndex++;}
    	if (this.sourceTerm) {this.previousTerm=this.sourceTerm;}
    	for (var i=this.readingIndex, len = this.tokens.getCount(); i<len; i++) {
    		var token = this.tokens.getAt(i), term = token.getTerm().toLowerCase();
    		if (term in this.termsMap) {
    			this.sourceTerm = this.termsMap[term];
    			if (this.sourceTerm.getRawFreq()>=1) {
        			this.readingIndex = i;
        			break
    			}
    		}
    	}
    	for (var i=this.readingIndex+1, len = this.tokens.getCount(); i<len; i++) {
    		var token = this.tokens.getAt(i), term = token.getTerm().toLowerCase();
    		if (term in this.termsMap) {
    			this.targetTerm = this.termsMap[term];
    			if (this.targetTerm.getRawFreq()>=1) {
        			break;
    			}
    		}
    	}
    	if (!this.tokensLoading && this.tokens.getCount()-this.readingIndex<this.tokensFetch) {
    		this.fetchMoreTokens();
    	}
    	this.draw();
    },
    
    
    loadDocument: function() {
    	if (this.documentTerms) {this.documentTerms.destroy();this.documentTerms=undefined;}
    	this.termsMap = {};
    	this.draw();
    	var doc =  this.getCorpus().getDocument(parseInt(this.getApiParam('docIndex')));
    	this.setTitle(this.localize('title') + " <span class='subtitle'>"+doc.getFullLabel()+"</span>");
    	this.lastToken = parseInt(doc.get('lastTokenStartOffset-lexical'));
    	this.documentTerms = doc.getDocumentTerms({
    		proxy: {
    			extraParams: {
    				stopList: this.getApiParam('stopList'),
    				bins: this.diam,
    				withDistributions: 'raw',
    				minRawFreq: parseInt(this.getApiParam('minRawFreq'))
    			}
    		}
    	});
    	var search = this.queryById('search');
    	search.setDisabled(true);
    	search.setStore(this.documentTerms);
    	this.fetchMoreDocumentTerms();
    },
    
    fetchMoreDocumentTerms: function() {
    	if (!this.documentTerms) {this.loadDocument(); return;}
    	this.documentTerms.load({
    		params: {
    			start: this.documentTerms.getCount(),
    			limit: this.documentTerms.getCount() == 0 ? 10 : 250
    		},
    		callback: function(records) {
    			if (records.length>0) {
            		this.maxRawFreq = this.documentTerms.max('rawFreq');
            		records.forEach(function(documentTerm) {
            			var x = y = 0;
            			documentTerm.get('distributions').forEach(function(d, i) {
            				x += (this.perim[i].x*d);
            				y += (this.perim[i].y*d);
            			}, this)
            			documentTerm.set('x', x/documentTerm.getRawFreq());
            			documentTerm.set('y', y/documentTerm.getRawFreq());
            		}, this);
    				Ext.Function.defer(this.fetchMoreDocumentTerms, 0, this);
    				this.draw();
    			} else {
    				this.queryById('search').setDisabled(false);
    				this.termsMap = {};
    				this.documentTerms.each(function(documentTerm) {
    					this.termsMap[documentTerm.getTerm()] = documentTerm;
    				}, this)
    				if (this.tokens) {this.tokens.removeAll(true)}
    				this.fetchMoreTokens();
    			}
    		},
    		addRecords: true,
    		scope: this
    	})
    },
    
    fetchMoreTokens: function() {
		if (!this.tokens) {
			this.tokens = this.getCorpus().getDocument(parseInt(this.getApiParam('docIndex'))).getTokens({
				proxy: {
					extraParams: {
	    				stripTags: 'all'
					}
				}
			});
			this.noMoreTokens = false;
		} else if (this.noMoreTokens) {return;}
		
		var first = this.tokens.getCount() == 0;
		this.tokensLoading = true;
		var speed = parseInt(this.getApiParam('speed'));
    	this.tokens.load({
    		params: {
    			start: this.tokens.getCount(),
    			limit: speed==50 && first ? 200 : Math.pow(110-speed, 2)
    		},
    		callback: function(records) {
    			this.tokensLoading = false;
    			if (records.length>0) {
    				records.forEach(function(token) {
    					if (token.getTokenType()=='other') {
    						token.set('term', token.getTerm().replace(/\s+/g, " "))
    					}
    				})
        			if (first) {
        				this.previousBeziers = [];
        				this.isReading = true;
        				this.read(0);
        			}
    			} else {
    				this.noMoreTokens = true;
    			}
    		},
    		addRecords: true,
    		scope: this

    	});
    },
    
    /* The functions below adapted from http://www.pjgalbraith.com/drawing-animated-curves-javascript/ */
    
    /**
     * Animates bezier-curve
     * 
     * @param ctx       The canvas context to draw to
     * @param x0        The x-coord of the start point
     * @param y0        The y-coord of the start point
     * @param x1        The x-coord of the control point
     * @param y1        The y-coord of the control point
     * @param x2        The x-coord of the end point
     * @param y2        The y-coord of the end point
     * @param duration  The duration in milliseconds
     * @private
     */
    animatePathDrawing: function(ctx, x0, y0, x1, y1, x2, y2, duration) {
        var start = null;
        
        var step = function animatePathDrawingStep(timestamp) {
            if (start === null)
                start = timestamp;
            
            var delta = timestamp - start,
                progress = Math.min(delta / duration, 1);
            
            // Clear canvas
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            // Draw curve
            drawBezierSplit(ctx, x0, y0, x1, y1, x2, y2, 0, progress);
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        
        window.requestAnimationFrame(step);
    },
    
    /**
     * Draws a splitted bezier-curve
     * 
     * @param ctx       The canvas context to draw to
     * @param x0        The x-coord of the start point
     * @param y0        The y-coord of the start point
     * @param x1        The x-coord of the control point
     * @param y1        The y-coord of the control point
     * @param x2        The x-coord of the end point
     * @param y2        The y-coord of the end point
     * @param t0        The start ratio of the splitted bezier from 0.0 to 1.0
     * @param t1        The start ratio of the splitted bezier from 0.0 to 1.0
     * @private
     */
    drawBezierSplit: function(ctx, x0, y0, x1, y1, x2, y2, t0, t1) {
        ctx.beginPath();
        
        if( 0.0 == t0 && t1 == 1.0 ) {
            ctx.moveTo( x0, y0 );
            ctx.quadraticCurveTo( x1, y1, x2, y2 );
        } else if( t0 != t1 ) {
            var t00 = t0 * t0,
                t01 = 1.0 - t0,
                t02 = t01 * t01,
                t03 = 2.0 * t0 * t01;
            
            var nx0 = t02 * x0 + t03 * x1 + t00 * x2,
                ny0 = t02 * y0 + t03 * y1 + t00 * y2;
            
            t00 = t1 * t1;
            t01 = 1.0 - t1;
            t02 = t01 * t01;
            t03 = 2.0 * t1 * t01;
            
            var nx2 = t02 * x0 + t03 * x1 + t00 * x2,
                ny2 = t02 * y0 + t03 * y1 + t00 * y2;
            
            var nx1 = this.lerp ( this.lerp ( x0 , x1 , t0 ) , this.lerp ( x1 , x2 , t0 ) , t1 ),
                ny1 = this.lerp ( this.lerp ( y0 , y1 , t0 ) , this.lerp ( y1 , y2 , t0 ) , t1 );
            
            ctx.moveTo( nx0, ny0 );
            ctx.quadraticCurveTo( nx1, ny1, nx2, ny2 );
        }
        
        ctx.stroke();
        ctx.closePath();
    },
    
    /**
     * Linearly interpolate between two numbers v0, v1 by t
     * @private
     */
    lerp: function(v0, v1, t) {
        return ( 1.0 - t ) * v0 + t * v1;
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
/*
 * @class Voyant.panel.TermsRadio
 * @private
 * @author Mark Turcato
 * @author Andrew MacDonald
 */
Ext.define('Voyant.panel.TermsRadio', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.termsradio',
	config: {
		corpus: undefined,
		options: [{
			xtype: 'stoplistoption'
		}],
		speed: 50
	},
    statics: {
    	i18n: {
    	},
    	api: {
    		withDistributions: true,
    		/**
    		 * @property bins How many segments, i.e. 'bins', to seperate separate a document into.
    		 * @type Integer
    		 * @default 10
    		 * @private
    		 */
    		bins: 5
    	
    		/**
    		 * @property visibleBins How many visible segments to be displayed at once.
    		 * @type Integer
    		 * @default 5
    		 * @private
    		 */
    		,visibleBins: 5
    		
    		/**
    		 * @property docIdType The document type(s) to restrict results to.
    		 * @type String|Array
    		 * @default null
    		 * @private
    		 */
    		,docIdType: null
    		
    		,limit: 50
    	
    		/**
        	 * @property mode What mode to operate at, either document or corpus.
        	 * @choices document, corpus
    		 * @private
        	 */
    		,mode: null
    		
    		/**
        	 * @property position The current shifted position of the visualization.
        	 * @type Integer
        	 * @default 0
    		 * @private
        	 */
    		,position: 0
    		
    		/**
    		 * @property selectedWords The words that have been selected.
    		 * @type String|Array
    		 * @default null
    		 * @private
    		 */
    		,selectedWords: []
    		
    		/**
    		 * @property stopList The stop list to use to filter results.
    		 * Choose from a pre-defined list, or enter a comma separated list of words, or enter an URL to a list of stop words in plain text (one per line).
    		 * @type String
    		 * @default null
    		 * @choices stop.en.taporware.txt, stop.fr.veronis.txt
    		 * @private
    		 */
    		,stopList: 'auto'
    		
    		/**
    		 * @property query The corpus type(s) to restrict results to.
    		 * @type String
    		 * @default null
    		 * @private
    		 */
    		,query: null
    		
    		/**
    		 * @property yAxisScale The scale for the y axis.
    		 * @type String
    		 * @default log
    		 * @private
    		 */
    		,yAxisScale: 'log'
    			
    		,speed: 50
    	},
    	glyph: 'xf201@FontAwesome'
    },

	absMaxFreq: 0
	,absMinFreq: 0
	,allData: []
	,chart: null
	,theme: Ext.create('Ext.chart.theme.Base')
	,colorIndex: []
	,colorMasterList: []
	,continueTransition: true
	,counterSeries: [] 
	,displayData: []
	,dragged: false
//	,intervalIdArray: []
	,isTransitioning: false
	,lastSlippery: null
	,lastSticky: null
	,maxFont: 30
	,minFreq: 0
	,numDataPoints: 0
	,numVisPoints: 5
	,overlayQueue: []
	,records: 0
	,recordsLength: 0
	,reselectTop: false
	,shiftCount: 0
	,sliderDragSum: 0
	,titlesArray: []
	,transitionCall: 'draw' //possible calls 'draw', 'redraw', 'left', and 'right'
	,valFraction: 1
	,win: 0
	
	//window padding dimensions, b - bottom, l - left, r - right, t - top
    ,bPadding: 25
    ,lPadding: 40
    ,rPadding: 20
	,tPadding: 20
	,navigationHeight: 100
	
	//tracks largest dimensions, used in resizing
	,largestW: 0
	,largestH: 0
	
	,constructor: function(config) {
		
		this.colorMasterList = this.theme.getColors();
		for (var i = 0; i < this.colorMasterList.length; i++) {
			this.colorIndex.push(this.colorMasterList[i]);
		}
		
		var onLoadHandler = function(mode, store, records, success, operation) {

			this.setApiParams({mode: mode});
			var query = this.getApiParam('query');
			
			// check for no results
			if (query) {
				if (records.length==0 || (records.length==1 && records[0].getRawFreq()==0)) {
					this.toastInfo({
						html: this.localize("termNotFound"),
						align: 'bl'
					})
					return
				}
				var docId = null;
				if (this.getApiParam("mode") === 'document') {
					docId = this.getCorpus().getDocument(0).getId();
				}
				var info = {wordString : query, docId : docId};
    			var paramsBundle = this.buildParamsBundle(info);
    			this.manageOverlaySticky(paramsBundle);
    			return
			}
			
			

			this.initData(records);
			this.prepareData();
			//for shiftcount > 0 exclusively
			var len = this.shiftCount;
			while(len-- > 0){
			//for(var j = 0; j < this.shiftCount; j++){
				this.displayData.shift();
			}
			if (this.chart != null) {
				this.redraw();
			} else {
				this.initializeChart();
			}
			
			this.redrawSliderOverlay();
		};
		
		this.corpusStore = Ext.create("Voyant.data.store.CorpusTerms", {
			listeners : {
				load: {
					fn : onLoadHandler.bind(this, 'corpus'),
					scope : this
				}
			}
		});
		
		this.documentStore = Ext.create("Voyant.data.store.DocumentTerms", {
			listeners : {
				load: {
					fn : onLoadHandler.bind(this, 'document'),
					scope : this
				}
			}
		});
		
		Ext.apply(config, {
			title: this.localize('title'),
			legendMenu: Ext.create('Ext.menu.Menu', {
				items: [
        			{text: '', itemId: 'remove', glyph: 'xf068@FontAwesome'}
        		]
        	}),
			tbar: new Ext.Toolbar({
        		enableOverflow: true,
				items: {
					xtype: 'legend',
					store: new Ext.data.JsonStore({
						fields : ['name', 'mark']
					}),
					listeners: {
						itemclick: function(view, record, el, index) {
							var term = record.get('name');
							if (this.isTermSelected(term)) {
								this.doTermDeselect(term);
							} else {
								this.doTermSelect(term);
							}
						},
						itemcontextmenu: function(view, record, el, index, event) {
							event.preventDefault();
			            	var xy = event.getXY();
			            	
			            	var term = record.get('name');
			            	var text = (new Ext.Template(this.localize('removeTerm'))).apply([term]);
		            		this.legendMenu.queryById('remove').setText(text);
		            		
		            		this.legendMenu.on('click', function(menu, item) {
		            			if (item !== undefined) {
		            				this.doTermDeselect(term, true);
		            			}
		            		}, this, {single: true});
		            		this.legendMenu.showAt(xy);
						},
						scope: this
					}
				}
			}),
			bbar: {
	            enableOverflow: true,
	            items: [{
	            	xtype: 'querysearchfield'
	            },{
	    			glyph: 'xf04b@FontAwesome', // start with play button, which means we're paused
	    			itemId: 'play',
	    			handler: function(btn) {
	    				var playing = btn.glyph=="xf04c@FontAwesome";
	    				if (playing) {
	    					this.continueTransition = false;
	    					this.mask(this.localize("completingTransition"))
	    					btn.setPlaying(false)
	    				}
	    				else {
	    					this.toggleRightCheck();
	    					btn.setPlaying(true);
	    				}
	    			},
	    			scope: this,
	    			setPlaying: function(bool) {
	    				this.setGlyph(bool ? "xf04c@FontAwesome" : "xf04b@FontAwesome")
	    			}
	    		},{
	    			glyph: 'xf0e2@FontAwesome',
//	    			text: this.localize('reset')
	    			tooltip : this.localize('resetTip'),
	    			listeners : {
	    				click : {fn : function() {
	    					this.queryById("play").setPlaying(false);
	    							this.shiftCount = 0;
	    							this.prepareData();
	    							this.redraw();
	    					}					
	    					,scope : this
	    				}
	    			}
	    		},{
	    			xtype: 'label',
	    			forId: 'terms',
	    			text: this.localize('terms')
	    		},{
	    			xtype: 'slider',
	    			itemId: 'terms',
	    			hideLabel: true,
	    			width : 60,
	    			increment : 5,
	    			minValue : 5,
	    			maxValue : 100,
	            	listeners: {
	            		afterrender: function(slider) {
	            			slider.setValue(parseInt(this.getApiParam("limit")))
	            		},
	            		changecomplete: function(slider, newvalue) {
	            			this.setApiParams({limit: newvalue});
	            			this.loadStore();
	            		},
	            		scope: this
	            	}
	    		},{
	    			xtype: 'label',
	    			forId: 'speed',
	    			text: this.localize('speed')
	    		},{
	    			xtype: 'slider',
	    			itemId: 'speed',
	    			hideLabel: true,
	    			width : 60,
	    			increment : 5,
	    			minValue : 5,
	    			maxValue : 100,
	            	listeners: {
	            		afterrender: function(slider) {
	            			slider.setValue(parseInt(this.getApiParam("speed")))
	            			this.setSpeed(slider.getValue())
	            		},
	            		changecomplete: function(slider, newvalue) {
	            			this.setApiParams({speed: newvalue});
	            			this.setSpeed(newvalue)
	            		},
	            		scope: this
	            	}
	    		},{
	    			xtype: 'label',
	    			itemId: 'visibleSegmentsLabel',
	    			forId: 'visibleBins',
	    			text: this.localize('visibleSegments')
	    		},{
	    			xtype: 'slider',
	    			itemId: 'visibleBins',
	    			hideLabel: true,
	    			width : 60,
	    			increment : 1,
	    			minValue : 1,
	    			maxValue : 100,
	            	listeners: {
	            		afterrender: function(slider) {
	            			slider.setValue(parseInt(this.getApiParam("visibleBins")))
	            		},
	            		changecomplete: function(slider, newvalue) {
	            			this.setApiParams({visibleBins: newvalue});
							this.numVisPoints = newvalue;
							this.loadStore();
	            		},
	            		scope: this
	            	}
	    		},{
	    			xtype: 'label',
	    			itemId: 'segmentsLabel',
	    			forId: 'segments',
	    			text: this.localize('segments')
	    		},{
	    			xtype: 'slider',
	    			itemId: 'segments',
	    			hideLabel: true,
	    			width : 60,
	    			increment : 1,
	    			minValue : 1,
	    			maxValue : 100,
	            	listeners: {
	            		afterrender: function(slider) {
	            			slider.setValue(parseInt(this.getApiParam("bins")))
	            		},
	            		changecomplete: function(slider, newvalue) {
	            			this.setApiParams({bins: newvalue});
							this.numDataPoints = newvalue;
							this.loadStore();
							var visibleBins = this.queryById('visibleBins');
							visibleBins.setMaxValue(newvalue) // only relevant for doc mode
	            		},
	            		scope: this
	            	}
	    		}]
			}
		});
		
		// need to add option here so we have access to localize
		this.config.options.push({
			xtype: 'combo',
			queryMode : 'local',
			triggerAction : 'all',
			forceSelection : true,
			editable : false,
			fieldLabel : this.localize('yScale'),
			labelAlign : 'right',
			name : 'yAxisScale',
			valueField : 'value',
			displayField : 'name',
			store: new Ext.data.JsonStore({
				fields : ['name', 'value'],
				data   : [{
					name : this.localize('linear'),   value: 'linear'
				},{
					name : this.localize('log'),  value: 'log'
				}]
			}),
			listeners: {
				render: function(combo) {
					combo.setValue(this.getApiParam('yAxisScale'));
				},
				scope: this
			}
		});
		
		this.callParent(arguments);
		this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
		
		/**
		 * @event corpusTypesSelected
		 * @type listener
		 * @private
		 */
		this.addListener('corpusTermsClicked', function(src, terms){
			if (this.getCorpus().getDocumentsCount() > 1) {
        		terms.forEach(function(term) {
        			var t = term.getTerm();
        			this.setApiParams({query: t});
        			this.loadStore();
        		});
			}
		});
		
		this.addListener('documentTermsClicked', function(src, terms){
			if(src && src.xtype==this.xtype) {return false;}
			
			terms.forEach(function(term) {
    			var t = term.getTerm();
    			this.setApiParams({query: t});
    			this.loadStore();
    		});
		});
		
		this.on('query', function(src, query){
			if (Ext.isString(query)) {this.fireEvent("termsClicked", src, [query]);}
	    });
		
		this.on("termsClicked", function(src, terms) {
			// TODO load term distribution data
			terms.forEach(function(term) {
				var queryTerm;
    			if (Ext.isString(term)) {queryTerm = term;}
    			else if (term.term) {queryTerm = term.term;}
    			else if (term.getTerm) {queryTerm = term.getTerm();}
    			
    			// TODO handling for multiple terms
    			this.setApiParams({query: queryTerm});
    			this.loadStore();
    		}, this);
    	});
		
		this.on("loadedCorpus", function(src, corpus) {
    		this.setCorpus(corpus);
    		this.documentStore.setCorpus(corpus);
    		this.corpusStore.setCorpus(corpus);
    		
    		var params = this.getApiParams();
			if (params.type) {
				delete params.limit;
			}
			var store;
			
			var docsCount = this.getCorpus().getDocumentsCount();
			var segments = this.queryById("segments");
			var visibleBins = this.queryById("visibleBins");
			if (params.mode=='document' || docsCount == 1) {
				this.setApiParam("mode", "document");
				store = this.documentStore;
				visibleBins.setMaxValue(segments.getValue())
			} else {
				this.setApiParam("mode", "corpus");
				delete params.bins;
				store = this.corpusStore;
				segments.hide();
				this.queryById("segmentsLabel").hide();
				var visibleBins = this.queryById("visibleBins");
				visibleBins.setMaxValue(docsCount);
				if (parseInt(this.getApiParam("visibleBins")>docsCount)) {
					visibleBins.setValue(docsCount);
				}
			}
			
			// select top 3 words
			store.on('load', function(store, records) {
				for (var i = 0; i < 3; i++) {
					var r = records[i];
					var info = {wordString : r.get('term'), docId : r.get('docId')};
	    			var paramsBundle = this.buildParamsBundle(info);
	    			this.manageOverlaySticky(paramsBundle);
				}
			}, this, {single: true});
			store.load({params: params});
    	}, this);
		
		/**
		 * @event resize
		 * @type listener
		 * @private
		 */
		this.addListener('resize', function() {
			//console.log('resize')
			if(this.chart) {
				var h = this.body.getHeight(),
					w = this.body.getWidth();
				
				this.chart.attr('height', h)
					.attr('width', w);
					
				this.setTitleLength();
				
				if(this.largestH < h && this.largestW < w) {
					this.chart.select('rect[class=clipping-rectangle]')
				        .attr("x", 0)
				        .attr("y", this.navigationHeight + (this.tPadding * 2))
				        .attr("width", w)
				        .attr("height", h - this.navigationHeight);
					this.largestH = h;
					this.largestW = w;
				}
			
				this.redraw();	
				this.redrawSliderOverlay();
			}
		}, this);
		
	}
	
    ,loadStore: function () {
    	this.queryById('play').setPlaying(false);
		var params = this.getApiParams();
		if(this.getApiParam('mode') === 'document') { 
			this.documentStore.load({params: params});
		}
		if(this.getApiParam('mode') === 'corpus') {
			delete params.bins;
			this.corpusStore.load({params: params});
		}
	}
    
	//
	//DATA FUNCTIONS
	//	

	,initData: function (records) { 	
		//console.log("fn: initData")
		//console.profile('profilethis')
		this.records = records;
		
		this.recordsLength = this.records.length;
	
		this.numVisPoints = parseInt(this.getApiParam('visibleBins'));
		this.shiftCount = parseInt(this.getApiParam('position'));
		
		if(this.getApiParam('mode') === 'document') {
			this.numDataPoints = this.records[0].get('distributions').length;
			if(this.numDataPoints !== this.getApiParam('bins')){
				this.numDataPoints = parseInt(this.getApiParam('bins'));
				this.loadStore();
			}
		} else {
			this.numDataPoints = this.records[0].get('distributions').length;
		}
		
    	this.counterSeries = [];
    	var transferArray = [];
			
    	//find max frequency value
    	this.absMaxFreq = 0;
		for( var k = 0; k < this.numDataPoints; k++ ) { 
	        for( var p = 0; p < this.recordsLength; p++ ) {
	        	if(this.records[p].get('distributions')[k] > this.absMaxFreq) {
	        		this.absMaxFreq = this.records[p].get('distributions')[k];
	        	}
	        }
		}
			    
		//find the absolute minimum frequency value
		//first start by setting the minimum frequency to the maximum frequency
		this.absMinFreq = this.absMaxFreq;
		for( var k = 0; k < this.numDataPoints; k++ ) { 
	        for( var p = 0; p < this.recordsLength; p++ ) {
	        	if(this.records[p].get('distributions')[k] <= this.absMinFreq && this.records[p].get('distributions')[k] !== 0) { 
	        		this.absMinFreq = this.records[p].get('distributions')[k];
	        	}
	        }
		}
		
		//Calculate the lower value of the y axis, must be > 0 
		if( this.absMinFreq < 0) {
			this.absMinFreq = 0;
		}
		
		this.minFreq = this.absMinFreq * 1.01;
		
	    //transfer all of the relevant data from 'records' to an array 'allData'
		for( var k = 0; k < this.numDataPoints; k++ ) { 
	        for( var p = 0; p < this.recordsLength; p++ ) {
	        	var rec = this.records[p];
	        	var dists = rec.get('distributions')[k];
//	        	if (dists > this.minFreq && dists <= this.absMaxFreq) {
	        	if (dists > 0) {
	        		transferArray.push({
	        			freq: dists,
		                wordString: rec.get('term'),
		                counter: k,
		                posInSeries: 0, 
		                numInSeries: 0,
		                docId: rec.get('docId')
		            });
	        	}
//	        	} else { //do nothing
//	        	}
	        }
	        this.counterSeries.push(transferArray);
	        transferArray = [];
	    }
	}

	,prepareData: function() {
		//console.log("fn: prepareData")
	    var frequencySeries = [],
	    	copy1 = [],
	    	copy2 = [],
	    	copy3 = [],
	    	copy4 = [],
	    	check = 0;
		
		this.allData = [];
		this.displayData = [];
		
		//set the number of points to be displayed at once
		if(this.numDataPoints < this.numVisPoints) {
			this.numVisPoints = this.numDataPoints;
		}
		
		//adjust shiftCount if it for some reason is out of the normal range
		if(this.shiftCount + this.numVisPoints > this.numDataPoints){ 
			this.shiftCount = this.numDataPoints - this.numVisPoints; 
		}
		
	    for( var k = 0; k < this.numDataPoints; k++ ) {
			var check1 = 0; //add a single first data point
	    	for(var p = 0; p < this.counterSeries[k].length; p++ ) {
	    			
    			var check2 = 0; //check will make sure a data point is not added to a series more than once
    			
	    		//add very first point, this is done like this so the for loop can use the .length operator
	    		if(check1 === 0){
			    	copy1.push(this.counterSeries[k][p]);
			    	copy2.push({freq: this.counterSeries[k][p].freq,
		    			frequencyArray: copy1,
		    			numInSeries: 0
		    		});
		    		frequencySeries.push(copy2);
		    		
		    		copy1 = [];
		    		copy2 = [];
		    		check1 = 1;
		    		check2 = 1;
	    		}
	    		
	    		//checks if a given frequency has an existing 'series' that the data point can be grouped into
	    		for( var l = 0; l < frequencySeries[k].length && check2 === 0; l++) {
					if(this.counterSeries[k][p].freq === frequencySeries[k][l].freq) {
						var inSeries = 0; 
						inSeries = frequencySeries[k][l].numInSeries;
						this.counterSeries[k][p].posInSeries = ++inSeries;
						frequencySeries[k][l].numInSeries = inSeries;
						frequencySeries[k][l].frequencyArray.push(this.counterSeries[k][p]);
						check2 = 1;
					}	
	    		}
	    		
	    		//if there is no existing series then create a new one
	    		if(check2 === 0) {
					copy4.push(this.counterSeries[k][p]);
		    		frequencySeries[k].push({freq: this.counterSeries[k][p].freq,
		    			frequencyArray: copy4,
		    			numInSeries: 0
		    		});
		    		copy4 = [];
		    		check2 = 1;
				}
	    	}	
	    	//if counterSeries[k] is empty add or there is no eligible value add an empty array to frequencySeries such that frequencySeries[k] is not undefined
	    	if(this.counterSeries[k].length < 1 || check1 === 0) {  
	    		frequencySeries.push([]);
    		}
	    }
	    
	    for( var k = 0; k < this.numDataPoints; k++ ) {
	    	for( var p = 0; p < frequencySeries[k].length; p++) {
	    		++frequencySeries[k][p].numInSeries;
	    		for( var l = 0; l < frequencySeries[k][p].frequencyArray.length; l++) {
	    			frequencySeries[k][p].frequencyArray[l].numInSeries = frequencySeries[k][p].numInSeries;
	    		}
	    	}
	    }
	    
	    var allDataSetup = [];
	    
	    //add the selected points into the array that will be used to display the data
	    for( var k = 0; k < this.numDataPoints; k++ ) {
	        this.allData.push({allDataInternal: frequencySeries[k],
	            outerCounter: k});
	    }
	    
    	var displaySetup = [],
    		transferArray = [];
		
	    //transfer the first x points (= numVisPoints, the number of points to be visualized)
	    //into an array that will be used to display the data
	    for( var k = 0; k < this.numVisPoints + this.shiftCount; k++ ) { 
	        for( var p = 0; p < this.recordsLength; p++ ) {
	        	if(this.allData[k].allDataInternal[p]) {
		            transferArray.push({freq: this.allData[k].allDataInternal[p].freq,
		                inSeries: this.allData[k].allDataInternal[p].numInSeries,
		                frequencyArray: this.allData[k].allDataInternal[p].frequencyArray,
		                dotObject: [{counter: k, freq: this.allData[k].allDataInternal[p].freq}]
		            });
	        	}
	        }
	        displaySetup.push(transferArray);
	        transferArray = [];
	    }
	    
	    //add the selected points into the array that will be used to display the data
	    for( var k = 0; k < this.numVisPoints + this.shiftCount; k++ ) {
	        this.displayData.push({displayInternal: displaySetup[k],
	            outerCounter: k});
	    }
	    displaySetup = [];
	}
	
	//TRANSITION FUNCTIONS
	
	//disable forward back if moving, disable pause if stopped, disable back if at beginning
	,manageMvtButtons: function () {
		//console.log('fn: manageMvtButtons')
		this.queryById("play").setPlaying(this.isTransitioning);
		/*
		if(this.isTransitioning === true) {
			this.toggleRight.setDisabled(true);
			this.toggleLeft.setDisabled(true);
			this.stop.setDisabled(false);
		}
		if(this.isTransitioning === false) {
			this.toggleRight.setDisabled(false);
			this.toggleLeft.setDisabled(false);
			this.stop.setDisabled(true);
			
			if(this.shiftCount === 0){
				this.toggleLeft.setDisabled(true);
			} else {
				this.toggleLeft.setDisabled(false);
			}
			
			if(this.shiftCount + this.numVisPoints === this.numDataPoints){
				this.toggleRight.setDisabled(true);
			} else {
				this.toggleRight.setDisabled(false);
			}
		}	
		*/
	}
	
    //provides the next value to the left     
    ,nextR: function () {
    	//console.log('fn: nextR')
    	
    	var displaySetup = [];
    	//this.displayData.shift();
		
    	for( var p = 0; p < this.recordsLength; p++ ) {
    		if(this.allData[this.numVisPoints + this.shiftCount].allDataInternal[p]) {
	            displaySetup.push({freq: this.allData[this.numVisPoints + this.shiftCount].allDataInternal[p].freq,
	            	inSeries: this.allData[this.numVisPoints + this.shiftCount].allDataInternal[p].numInSeries,
	            	frequencyArray: this.allData[this.numVisPoints + this.shiftCount].allDataInternal[p].frequencyArray,
	                dotObject: [{counter: this.numVisPoints + this.shiftCount, freq: this.allData[this.numVisPoints + this.shiftCount].allDataInternal[p].freq}]
	            });
    		}
        }
        
	    this.displayData.push({displayInternal: displaySetup, outerCounter: this.numVisPoints + this.shiftCount});
	    displaySetup = [];
    }
    
    //verifies that data CAN be moved to the right
    ,toggleRightCheck: function () {

    	//console.log("fn: toggleRightCheck")
    	var toolObject = this;
    	if(this.numVisPoints + this.shiftCount < this.numDataPoints) {
    		//manage transition movements and controls
    		this.isTransitioning = true;
    		this.continueTransition = true;
    		this.manageMvtButtons();
    		
    		//draw
	        this.nextR();
			this.shiftCount = ++this.shiftCount;
			this.manageXScale();
			this.setApiParams({position: this.shiftCount});
			this.transitionCall = 'right';
			this.animateVis();
			this.displayData.shift();
		} else {
    		//manage transition movements and controls
			this.isTransitioning = false;
			this.continueTransition = false;
			this.manageMvtButtons();
		}
    }
    
    //provide the next value
    ,nextL: function () {
    	//console.log('fn: nextLeft')
    	var displaySetup = [];
        
        for( var p = 0; p < this.recordsLength; p++ ) {
        	if(this.allData[this.shiftCount].allDataInternal[p]) {
        		displaySetup.push({freq: this.allData[this.shiftCount].allDataInternal[p].freq,
	            	inSeries: this.allData[this.shiftCount].allDataInternal[p].numInSeries,
	            	frequencyArray: this.allData[this.shiftCount].allDataInternal[p].frequencyArray,
	                dotObject: [{counter: this.shiftCount, freq: this.allData[this.shiftCount].allDataInternal[p].freq}]
	            });
        	}
        }
	    this.displayData.unshift({displayInternal: displaySetup, outerCounter: this.shiftCount});
        displaySetup = [];
    }
    
    /*
    ,toggleLeftCheck: function () {    	
    	//console.log("fn: toggleLeftCheck")
    	if(this.shiftCount > 0) {
    		//manage transition movement and controls
    		this.isTransitioning = true;
			this.continueTransition = true;
			this.manageMvtButtons();
			
			//draw
			this.shiftCount = --this.shiftCount;
			this.manageXScale();
			this.setApiParams({position: this.shiftCount});
	        this.nextL();
			this.transitionCall = 'left';
	        this.animateVis();
	        this.displayData.pop();
		} else {
			//manage transition movements and controls
			this.isTransitioning = false;
			this.manageMvtButtons();
		}
    }
    */
    
    ,startScroll: function() {
    	//console.log("fn: startScroll")
    	var toolObject = this;
    	
    	if(toolObject.numDataPoints > toolObject.numVisPoints && toolObject.shiftCount === 0){
			//manage transition movements and controls
			toolObject.isTransitioning = true;
			this.manageMvtButtons();
    		
    		//repeat transition
			setTimeout(function(){
				toolObject.toggleRightCheck();
			},3000);
		}
    }
    
    //
    //DISPLAY FUNCTIONS
    //
	
	
	// init and draw everything
	,initializeChart: function() {
		this.initChart();
		
		this.drawXAxis();
		this.drawYAxis();
		this.drawChart();
		this.drawSlider();
		this.drawVerticalSlider();
		this.transitionCall = 'draw';
	}
	
    ,redraw: function() {

//    	console.log("fn: redraw")
    	this.transitionCall = 'redraw';
    	this.updateFullPath();
		this.redrawXAxis();
		this.redrawYAxis();
		this.redrawChart();
		this.redrawSlider();
		this.redrawVerticalSlider();
		this.redrawChartOverlay();
    }
    
	,initChart: function () {
//		console.log('fn: initChart')
		
		var innerCt = this.body.query('div[class$=innerCt]', false)[0];
		
		var h = innerCt.getHeight(),
			w = innerCt.getWidth();
    
		//create main SVG Element
		var chartSVG = innerCt.appendChild(Ext.DomHelper.createDom('<svg class="chart" width="'+w+'" height="'+h+'"></svg>'), true);
	    this.chart = d3.select(chartSVG);
	    
		this.largestW = w;
		this.largestH = h - this.navigationHeight;
	    	    
	    this.chart.append('clipPath')
	        .attr('id', 'clip1')
	      .append('rect')
	      	.attr('class', 'clipping-rectangle')
	        .attr("x", 0)
	        .attr("y", this.navigationHeight + (this.tPadding * 2))
	        .attr("width", w)
	        .attr("height", h - this.navigationHeight);
	    
	    this.chart.append('g')
	    	.attr('class','overlay')
	    	.attr("clip-path", "url(#clip1)");
	    
		//depending on the size of display set the length that labels can be
		this.setTitleLength();
	}
    
    ,xAxis: {}
    ,xAxisScale: d3.svg.axis()
    
    ,drawXAxis: function() {
    	var toolObject = this;
    	//svg element constants
		var h = this.body.getHeight(),
			w = this.body.getWidth();
    	
		//initialize x scales
		this.manageAllXScales();
			
    	//define X axis
		this.xAxisScale.scale(toolObject.xScale)
		    .orient('bottom')
		    .ticks(Math.round(toolObject.numVisPoints))
		    .tickFormat(function(d){
		    	var val;
		    	if(toolObject.getApiParam('mode') === 'document') { 
					val = 'Segment ' + (parseInt(d) + 1);
				}
				if(toolObject.getApiParam('mode') === 'corpus') {
					val = d + 1 + '. ' + toolObject.titlesArray[d];
				}
				return val;
		    });
		
		//draw the x-axis
		this.xAxis = this.chart.append('g')
    		.attr('class', 'axisX')
    		.attr('transform', 'translate(0,' + (h - this.bPadding) + ')')
    		.call(this.xAxisScale);
    	
//    	this.xAxis.selectAll('text')
//			.on('mouseover', function () {
//				d3.select(this)
//					.attr('fill', 'red')
//					.style("font-size", '18px');
//			})
//			.on('mouseout', function () {
//				d3.select(this)
//					.attr('fill', 'black')
//					.style("font-size", '11px');
//			});
		this.styleXAxis();
    }
    
    ,styleXAxis: function() {
    	this.xAxis.selectAll('text')
	        .style('font-family', 'sans-serif')
	        .style('font-size', '11px');

	    this.xAxis.selectAll('line')
	        .style('fill','none')
	        .style('stroke','black')
	        .style('shape-rendering', 'crispEdges');
	        
	    this.xAxis.selectAll('path')
	        .style('fill','none')
	        .style('stroke','black')
	        .style('shape-rendering', 'crispEdges');
    }
    
    ,redrawXAxis: function() {
    	this.chart.selectAll('g[class=axisX]')
			.remove();
		
		this.drawXAxis();
    }
    
    ,yAxis: {}
    ,yAxisScale: d3.svg.axis()
    
    ,drawYAxis: function() {
    	var toolObject = this;
    	
    	//svg element constants
		var h = this.body.getHeight(),
			w = this.body.getWidth();
		
		//initialize Y scales
		this.manageAllYScales();
    	
    	var yTicksScale = d3.scale.linear()
			.domain([200,700])
			.range([5,15]);
			
		var numberFormat = d3.format(".2r");
		function logFormat(d) {
			var x = Math.log(d) / Math.log(10) + 1e-6;
			return Math.abs(x - Math.floor(x)) < 0.7 ? numberFormat(d) : "";
		} 
		
		this.yAxisScale.scale(toolObject.yScale)
	    	.orient('left')
	    	.ticks(yTicksScale(this.body.getHeight()))
	    	.tickFormat(logFormat)
			.tickSize(-w + this.rPadding + this.lPadding);
		
		//draw the y-axis
		this.yAxis = this.chart.append('g')
	    	.attr('class', 'axisY')
	    	.attr('transform', 'translate(' + this.lPadding + ',0)')
	    	.call(this.yAxisScale);
		
	    this.yAxis.selectAll('text')
	        .style('font-family', 'sans-serif')
	        .style('font-size', '11px');
	    
	    //controls horizontal grid line-opacity
	    this.yAxis.selectAll('line')
	        .style('fill','none')
	        .style('stroke','black')
	        .style('shape-rendering', 'crispEdges')
	        .style('stroke-opacity', 0.05);
	        
	    this.yAxis.selectAll('path')
	        .style('fill','none')
	        .style('stroke','black')
	        .style('shape-rendering', 'crispEdges');
    }
    
    ,redrawYAxis: function() {
    	this.chart.selectAll('g[class=axisY]')
			.remove();
		
		this.drawYAxis();
    }
    
    ,drawChart: function() {
    	var toolObject = this;
    	
    	//create graph text
	    //attach the nested data to svg:g elements
		var counterSeriesDiv = this.chart.selectAll('g[class=section]')
	        .data(toolObject.displayData, function(d) { return d.outerCounter; })
	      .enter().append('g')
	        .attr('class', 'section')
	        .attr("clip-path", "url(#clip1)");
		
		var frequencySeriesDiv = counterSeriesDiv.selectAll('g')
			.data(function(d) { return d.displayInternal; })
	      .enter().append('g')
	        .attr('class', 'frequencies')
	        .on('mouseover', function() {
				d3.select(this).style('fill', 'red');
			})
			.on('mouseout', function() {
	            d3.select(this).style('fill', 'black');
			});
	             
        //attach the frequency data to data points 
		var dataPoint = frequencySeriesDiv.selectAll('text')
    		.data(function(d) { return d.frequencyArray; })
		  .enter().append('text')
	        .attr('class', function(d) {
	        	return toolObject.removeFilteredCharacters(d.wordString);
	        })
	    	.attr('x', function (d) {
	    		var startPoint = (0.5 / d.numInSeries) - 0.5
					,valueRange = (d.posInSeries / d.numInSeries * 0.8)
					,x = d.counter + toolObject.callOffset() + startPoint + valueRange; 
				return toolObject.xScale(x);
			})
	    	.attr('y', function (d) { 
				var y = d.freq;
				return toolObject.yScale(y);
	    	})
	    	.attr('text-anchor', 'middle')
	    	.attr('transform', function (d) {
	    		var startPoint = (0.5 / d.numInSeries) - 0.5
					,valueRange = (d.posInSeries / d.numInSeries * 0.8)
					,x = d.counter + toolObject.callOffset() + startPoint + valueRange
					,y = d.freq;
	    		return 'translate(0, 0) rotate(-20 ' + toolObject.xScale(x) + ' '+ toolObject.yScale(y) + ')';
	    	})
	    	.style('font-size', function(d) { return toolObject.fontScale(d.freq) + 'px'; })
	    	.style('fill-opacity', function(d) { return toolObject.opacityScale(d.freq); })
	        .text(function(d) { return d.wordString; })
	        .on('mouseover', function(d) { 
	 	        d3.select(this).style('cursor', 'pointer').style('font-size', function(d) { return (toolObject.fontScale(d.freq) * toolObject.maxFont / toolObject.fontScale(d.freq)) + 'px'; });
	 	        var paramsBundle = toolObject.buildParamsBundle(d);
	 	        toolObject.manageOverlaySlippery(paramsBundle);
	        })
	        .on('mouseout', function(d) { 
	        	d3.select(this).style('cursor', 'auto').style('font-size', function(d) { return toolObject.fontScale(d.freq) + 'px'; });
	        	var paramsBundle = toolObject.buildParamsBundle(d);
	        	toolObject.manageOverlaySlippery(paramsBundle);
	        })
	        .on('click', function(d) {
	        	var paramsBundle = toolObject.buildParamsBundle(d);
	        	toolObject.manageOverlaySticky(paramsBundle);
			})
	  	  .append('title')
	    	.text(function(d) { return d.wordString; });
    }
    
    ,redrawChart: function() {
    	this.chart.selectAll('g[class=section]')
			.remove();
			
		this.drawChart();
    }
    
    ,drawVerticalSlider: function() {
//    	var h = this.body.getHeight(),
//			w = this.body.getWidth();
//    	
//    	var totalTopOffset = (this.tPadding * 2) + this.navigationHeight
//        	,lengthVer = h - (totalTopOffset + this.bPadding);
//        
//	    //create vertical minimap rectangle and slider
//	    var sliderPosScale = d3.scale.linear()
//			.domain([this.absMaxFreq, this.minFreq])
//			.range([totalTopOffset, lengthVer]);
//	    
//	    var rectVer = this.chart.append('rect')
//	  	    .attr('class', 'minimap')
//	  	    .attr('x', w - (this.rPadding * 0.66))
//	  	    .attr('y', totalTopOffset)
//	  	    .attr('rx', 3.33)
//	  	    .attr('width', 6.66)
//	  	    .attr('height', lengthVer)
//	  	    .style('fill','aliceblue')
//	  	    .style('stroke','black')
//	  	    .style('stroke-width','1')
//	  	    .style('fill-opacity','0.75');
//	    	
//	    var sliderVer = this.chart.append('rect')
//			.attr('class', 'minimap')
//	  	    .attr('x', w - (this.rPadding * 0.66))
//	  	    .attr('y', totalTopOffset)
//	  	    .attr('rx', 3.33)
//	  	    .attr('width', 6.66)
//	  	    .attr('height', lengthVer * ((this.absMaxFreq * this.valFraction) - this.minFreq) / this.absMaxFreq)
//	  	    .style('fill','CornflowerBlue')
//	  	    .style('stroke','black')
//	  	    .style('stroke-width','1');
    }
    
    ,redrawVerticalSlider: function() {
    	this.chart.selectAll('rect[class=minimap]')
			.remove();
			
		this.drawVerticalSlider();
    }
    
    ,drawSlider: function() {
    	var h = this.body.getHeight(),
			w = this.body.getWidth();
	    
		//Create navigation bar
		var lengthHor = w - (this.rPadding + this.lPadding)
			,offsetVis = this.lPadding + (lengthHor * ((this.numVisPoints - 1) / 2) * ( 1 / (this.numDataPoints - 1)))
			,offsetVisStart = this.lPadding
			,offsetVisEnd = this.lPadding + (lengthHor * ((this.numVisPoints - 1) / (this.numDataPoints - 1)));
		
		var lineX = this.chart.append('line')
			.attr('class', 'sliderAxis')
			.attr('x1', this.lPadding)
			.attr('x2', this.body.getWidth() - this.rPadding)
			.attr('y1', this.tPadding + this.navigationHeight)
			.attr('y2', this.tPadding + this.navigationHeight)
			.style('shape-rendering', 'crispEdges')
			.style('stroke','black')
	  	    .style('stroke-width','1');
					
		var lineY = this.chart.append('line')
			.attr('class', 'sliderAxis')
			.attr('x1', this.lPadding)
			.attr('x2', this.lPadding)
			.attr('y1', this.tPadding + this.navigationHeight)
			.attr('y2', this.tPadding)
			.style('shape-rendering', 'crispEdges')
			.style('stroke','black')
	  	    .style('stroke-width','1');
		
	    var sliderHorStart = this.chart.append('line')
	  	    .attr('class', 'slider')
	  	    .attr('id', 'before')
	  	    .attr('x1', (lengthHor * (this.shiftCount - this.callOffset()) / (this.numDataPoints - 1)) + offsetVisStart)
	  	    .attr('x2', (lengthHor * (this.shiftCount - this.callOffset()) / (this.numDataPoints - 1)) + offsetVisStart)
	  	    .attr('y1', this.tPadding + this.navigationHeight)
	  	    .attr('y2', this.tPadding)
	  	    .style('stroke', 'black')
	  	    .style('stroke-width', '1');
	    
	    var sliderHorEnd = this.chart.append('line')
	  	    .attr('class', 'slider')
	  	    .attr('id', 'after')
	  	    .attr('x1', (lengthHor * (this.shiftCount - this.callOffset()) / (this.numDataPoints - 1)) + offsetVisEnd)
	  	    .attr('x2', (lengthHor * (this.shiftCount - this.callOffset()) / (this.numDataPoints - 1)) + offsetVisEnd)
	  	    .attr('y1', this.tPadding + this.navigationHeight)
	  	    .attr('y2', this.tPadding)
	  	    .style('stroke', 'black')
	  	    .style('stroke-width', '1');
	  	    	  	    
	   var greyBoxBefore = this.chart.append('rect')
  	    	.attr('class', 'slider')
  	    	.attr('id', 'boxBefore')
  	    	.attr('x', this.lPadding)
  	    	.attr('y', this.tPadding)
  	    	.attr('height', this.navigationHeight)
  	    	.attr('width', lengthHor * (this.shiftCount - this.callOffset()) / (this.numDataPoints - 1))
  	    	.style('fill', 'silver')
  	    	.style('fill-opacity', 0.25)
	    	.style('cursor', 'move');
	    		    
	    var greyBoxAfter = this.chart.append('rect')
	    	.attr('class', 'slider')
	    	.attr('id', 'boxAfter')
	    	.attr('x', (lengthHor * (this.shiftCount - this.callOffset()) / (this.numDataPoints - 1)) + offsetVisEnd)
	    	.attr('y', this.tPadding)
	    	.attr('height', this.navigationHeight)
	    	.attr('width', lengthHor * (this.numDataPoints - this.numVisPoints - this.shiftCount + this.callOffset()) / (this.numDataPoints - 1))
	    	.style('fill', 'silver')
	    	.style('fill-opacity', 0.25)
	    	.style('cursor', 'move');
	    
	    var toolObject = this;
    	var drag = d3.behavior.drag()
        .origin(Object)
        .on('drag', function(d) {
        	if(!toolObject.isTransitioning) {
        		this.drag = true;
        		
	        	var w = toolObject.getWidth()
	        		,displaceX = parseInt(d3.event.dx)
	        		,checkBefore
	        		,checkAfter
	        		,pos = 0;
	        		
	        	//add up the slider movements as they occur	
        		toolObject.sliderDragSum += d3.event.dx;
	        	
	        	toolObject.chart.selectAll('#before')
	        		.attr('x1', function () { 
	        			checkBefore = parseInt(this.getAttribute('x1'));
	        			pos = parseInt(this.getAttribute('x1')) + displaceX;
	        			return parseInt(this.getAttribute('x1'));
	        		});
	        	
	        	toolObject.chart.selectAll('#after')
	        		.attr('x1', function () { 
	        			checkAfter = parseInt(this.getAttribute('x1'));
	        			return parseInt(this.getAttribute('x1'));
	        		});
	        	
	        	if(checkBefore + displaceX < toolObject.lPadding || checkAfter + displaceX > w - toolObject.rPadding) {
	        		displaceX = 0;
	        	}
	        	
	        	toolObject.chart.select('#boxBefore')
	        		.attr('width', function () { return parseInt(this.getAttribute('width')) + displaceX; });
	        	
	        	toolObject.chart.select('#boxAfter')
	        		.attr('x', function () { return parseInt(this.getAttribute('x')) + displaceX; })
        			.attr('width', function () { return parseInt(this.getAttribute('width')) - displaceX; });
	        		
	        	toolObject.chart.selectAll('#before')
	        		.attr('x1', function () { return parseInt(this.getAttribute('x1')) + displaceX; })
	        		.attr('x2', function () { return parseInt(this.getAttribute('x2')) + displaceX; });
	        	
	        	toolObject.chart.selectAll('#after')
        			.attr('x1', function () { return parseInt(this.getAttribute('x1')) + displaceX; })
        			.attr('x2', function () { return parseInt(this.getAttribute('x2')) + displaceX; });
        	}
        })
        .on('dragend', function(d) {
        	if(this.drag){
        		this.drag = false;
        		
        		var inverseSliderScale = d3.scale.linear()
			    	.domain([0, toolObject.body.getWidth() - (toolObject.lPadding + toolObject.rPadding)])
			    	.range([0, toolObject.numDataPoints]);
			    	
				//calculate the position that everything should transition to
	        	var moveByThis = inverseSliderScale(toolObject.sliderDragSum),
	        		moveShiftCount,
	        		oldShiftCount = toolObject.shiftCount;
	        		
	    		if(moveByThis > 0) moveShiftCount = Math.floor(moveByThis);
	    		if(moveByThis < 0) moveShiftCount = Math.ceil(moveByThis);
	    		
	    		//update shiftCount re-animate 
	    		toolObject.shiftCount += moveShiftCount;
	    		if(toolObject.shiftCount < 0) toolObject.shiftCount = 0;
	    		if(toolObject.shiftCount > toolObject.numDataPoints - 1) toolObject.shiftCount = toolObject.numDataPoints - 1;
	    		
	    		if(toolObject.shiftCount !== oldShiftCount) {
	    			toolObject.sliderDragSum = 0;
	    			
	        		toolObject.setApiParams({position: toolObject.shiftCount});
					toolObject.prepareData();
					
					toolObject.redraw();
	        	}
        	}
        });
	    
	    greyBoxBefore.call(drag);
	    greyBoxAfter.call(drag);
    }
    
    ,redrawSlider: function() {
    	this.chart.selectAll('rect[class=slider]')
	    	.remove();
		
		this.chart.selectAll('line[class=slider]')
		    .remove();
		
		this.chart.selectAll('line[class=sliderAxis]')
	    	.remove();
	    	
    	this.drawSlider();
    }
	
	,animateVis: function() {
		var toolObject = this;
		
		//prepare the data for the visualization
		//shiftCount = 0, means the displayData begins with the same value as nestedData
		var mode = this.getApiParam('mode');
		
	    //svg element constants
		var h = this.body.getHeight(),
			w = this.body.getWidth();

		var duration = this.getDuration();
		
		//if transitionCall === 'draw': draw the function for the first time		
		//if not: shift displayData to a different subset of allData
		//then display the newly shifted data	
		if(this.transitionCall === 'left' || this.transitionCall ==='right'){
			this.xAxis.transition()
	            .duration(duration)
	            .ease('linear')
	            .call(this.xAxisScale);
	            
	        this.styleXAxis();
	        
	        this.drawChart();
	    
        	//if call is shift move the dataPoints	
        	this.chart.selectAll('.frequencies').transition()
        		.duration(duration)
	            .ease('linear')
	            .selectAll('text')
	            .attr('x', function (d) {
	            	var startPoint = (0.5 / d.numInSeries) - 0.5,
						valueRange = (d.posInSeries / d.numInSeries * 0.8),
						x = d.counter + startPoint + valueRange; 
					return toolObject.xScale(x);
				})
				.attr('transform', function (d) {
		    		var startPoint = (0.5 / d.numInSeries) - 0.5
						,valueRange = (d.posInSeries / d.numInSeries * 0.8)
						,x = d.counter + startPoint + valueRange
						,y = d.freq;
		    		return 'translate(0, 0) rotate(-20 ' + toolObject.xScale(x) + ' '+ toolObject.yScale(y) + ')';
				});
	    	   
        	//Create navigation bar
			var lengthHor = w - (this.rPadding + this.lPadding)
				,offsetVis = this.lPadding + (lengthHor * ((this.numVisPoints - 1) / 2) * ( 1 / (this.numDataPoints - 1)))
				,offsetVisStart = this.lPadding
				,offsetVisEnd = this.lPadding + (lengthHor * ((this.numVisPoints - 1) / (this.numDataPoints - 1)));
				
        	this.chart.select('#before').transition()
				.duration(duration)
				.ease('linear')
			 	.attr('x1', (lengthHor * this.shiftCount / (this.numDataPoints - 1)) + offsetVisStart)
			 	.attr('x2', (lengthHor * this.shiftCount / (this.numDataPoints - 1)) + offsetVisStart)
		  	    .attr('y1', this.tPadding + this.navigationHeight)
		  	    .attr('y2', this.tPadding)
		  	    .each('end', function () {
		  	    	if (toolObject.isMasked()) {
		  	    		toolObject.unmask();
		  	    	}
		  	    	if(toolObject.continueTransition) { 
		  	    		setTimeout(function () {
		  	    			toolObject.callTransition();
		  	    		},50); 
		  	    	} else { 
		  	    		//manage transition movements and controls
		  	    		toolObject.isTransitioning = false;
		  				toolObject.manageMvtButtons();
		  	    	}
		  	    });
        	
	  	   this.chart.select('#after').transition()
				.duration(duration)
				.ease('linear')
			 	.attr('x1', (lengthHor * this.shiftCount / (this.numDataPoints - 1)) + offsetVisEnd)
			 	.attr('x2', (lengthHor * this.shiftCount / (this.numDataPoints - 1)) + offsetVisEnd)
		  	    .attr('y1', this.tPadding + this.navigationHeight)
		  	    .attr('y2', this.tPadding);
		    
	  	   this.chart.select('#boxBefore').transition()
				.duration(duration)
				.ease('linear')
	  	    	.attr('x', this.lPadding)
	  	    	.attr('y', this.tPadding)
	  	    	.attr('height', this.navigationHeight)
	  	    	.attr('width', lengthHor * (this.shiftCount) / (this.numDataPoints - 1));
	    
	  	    this.chart.select('#boxAfter').transition()
				.duration(duration)
				.ease('linear')
	  	    	.attr('x', (lengthHor * this.shiftCount / (this.numDataPoints - 1)) + offsetVisEnd)
	  	    	.attr('y', this.tPadding)
	  	    	.attr('height', this.navigationHeight)
	  	    	.attr('width', lengthHor * (this.numDataPoints - this.numVisPoints - this.shiftCount) / (this.numDataPoints - 1));
        }
        
        //animates the chart overlay
		this.redrawChartOverlay();
	}
	
	,callTransition: function () {
		if(this.transitionCall === 'left') this.toggleLeftCheck();
        if(this.transitionCall === 'right') this.toggleRightCheck();
	}
		
	//build the params bundle to pass to manageOverlaySticky
	,buildParamsBundle: function (info) { 
		//console.log('fn: builParamsBundle')
		var toolObject = this;
		
		var type = info.wordString,
			params = {},
			paramsBundle = {},
			docId;

		if ( this.getApiParam('mode') === 'document') { // set position
			docId = info.docId;
			var totalTokens = toolObject.getCorpus().getDocument(docId).get('totalTokens') - 1;
			params.tokenIdStart = parseInt(this.category * totalTokens / this.numDataPoints);
			params.docIdType = docId + ':' + type;
		} else {
		}
				
		paramsBundle = { params: params, type: type };
		
		return paramsBundle;
	}
	
	,manageOverlaySlippery: function (paramsBundle) {

		//console.log('fn: manageOverlaySlippery')
		var string = paramsBundle.type
			,selector = this.removeFilteredCharacters(paramsBundle.type) 
			,checkOn = 'on'
			,index;
		
//		this.continueTransition = true;
//
//		this.transitionCall = 'draw';
		
		//check if the word that was selected was already sticky
		//if so checkOn = off and nothing happens
		var len = this.overlayQueue.length;
		while(--len >= 0){
			if(selector === this.overlayQueue[len].selector){ 
		    	checkOn = 'off';
		    	index = len;
			}
		}
		
		//make sure the selected word wasn't just a sticky word that is being deselected
		//thus happens to be scrolled over
		if(selector === this.lastSticky){
			checkOn = 'off';
			this.lastSticky = null;
		}
		
		if(checkOn === 'on') {
			//select a slippery word
			if(selector !== this.lastSlippery) {
				var pathHolder = this.prepareFullPath(string);
				var lineObject = {
					word: string, 
					selector: selector, 
					params: paramsBundle, 
					fullPath: pathHolder.path,
					pathMin: pathHolder.min,
					pathMax: pathHolder.max,
					colour: 'red'
				};	
				if(this.lastSlippery !== null) {
					//exceptional case where lastSlippery was not properly removed
					this.chartOverlayOff(this.lastSlippery);
					this.sliderOverlayOff(this.lastSlippery);
					this.lastSlippery = null;
					
					//select new slippery word
					//change its colour
					this.chartOverlayOn(lineObject);
					this.sliderOverlayOn(lineObject);
					this.lastSlippery = selector;
				}
				else {
					//normal case select slippery word
					//change its colour
					this.chartOverlayOn(lineObject);
					this.sliderOverlayOn(lineObject);
					this.lastSlippery = selector;
				}
			}
			else{
				//normal case deselect a slippery word
				this.chartOverlayOff(selector);
				this.sliderOverlayOff(this.lastSlippery);
				this.lastSlippery = null;
			}
		}
		else {
			//else do nothing 
			//this means, don't select a word that is already sticky
		}
	}

	,manageOverlaySticky: function (paramsBundle) {
//		console.log('fn: manageOverlaySticky')
		var toolObject = this;
		
		var term = paramsBundle.type;
		
		this.transitionCall = 'draw';
		
		if (!this.isTermSelected(term)) {
			this.doTermSelect(term, true);
		} else {
			this.doTermDeselect(term, true);
		}
	},
	
	getTermIndex: function(term) {
		var index = -1;
		var selector = selector = this.removeFilteredCharacters(term);
		var len = this.overlayQueue.length;
		while(--len >= 0){
			if(selector === this.overlayQueue[len].selector){ 
				index = len;
			}
		}
		return index;
	},
	
	isTermSelected: function(term) {
		return this.getTermIndex(term) !== -1;
	},
	
	doTermSelect: function(term, legendAdd) {
		var selector = selector = this.removeFilteredCharacters(term);
		//finish updating API array of selected words
		var apiArray = this.getApiParam('selectedWords');
		apiArray.push(term);
		this.setApiParams({selectedWords: apiArray});
		
		//draw the sticky path
		var stickyColour = this.colorIndex[0];
		this.colorIndex.shift();
		
		if (legendAdd === true) {
			var legend = this.query('[xtype=legend]')[0];
			legend.getStore().add({name: term, mark: stickyColour});
		} else {
			var legend = this.query('[xtype=legend]')[0];
			var record = legend.getStore().findRecord('name', term);
			if (record !== null) {
				record.set('mark', stickyColour);
				legend.refresh();
			}
		}
		
		//repopulate colour index if it is empty
		if(this.colorIndex.length === 0) { 
			for(var i = 0; i < this.colorMasterList.length; i++){
				this.colorIndex.push(this.colorMasterList[i]);
			}
		}
		var pathHolder = this.prepareFullPath(term);
		var lineObject = {
			word: term, 
			selector: selector,
			params: {params: {}, type: term},
			fullPath: pathHolder.path,
			pathMin: pathHolder.min,
			pathMax: pathHolder.max,
			colour: stickyColour
		};
		
		//if this was selected a slippery before click event remove line from navigation bar
		if(selector === this.lastSlippery){
			this.sliderOverlayOff(selector);
			this.lastSlippery = null;
		}
		
		//make sure there is no path already present
		this.chart.select('g[class=frequency-line-' + selector + ']').remove();

		this.overlayQueue.push(lineObject);
		this.chartOverlayOn(lineObject);
		this.sliderOverlayOn(lineObject);
	},
	
	doTermDeselect: function(term, legendRemove) {
		var selector = this.removeFilteredCharacters(term);
		var index = this.getTermIndex(term);
		
		if (legendRemove === true) {
			var legend = this.query('[xtype=legend]')[0];
			var index = legend.getStore().findExact('name', term);
			legend.getStore().removeAt(index);
		}
		
		var updateApi = this.getApiParam('selectedWords');
		for(var i = 0, len = updateApi.length; i < len; i++) {
			if(updateApi[i] === selector) {
				updateApi.splice(i, 1);
				this.setApiParams({selectedWords: updateApi});
			}
		}
		this.chartOverlayOff(selector);
		this.colorIndex.push(this.overlayQueue[index].colour);
    	this.overlayQueue.splice(index, 1);
    	this.sliderOverlayOff(selector);
		this.lastSticky = selector;
	}
	
	,prepareFullPath: function (string) {
		var linePosArray = [],
			pathMin = this.absMaxFreq,
			pathMax = this.absMinFreq;
		
		for(var k = 0, len = this.allData.length; k < len; k++){
			foundB = 0;
			for(var i = 0, lenA = this.allData[k].allDataInternal.length; i < lenA; i++) {
				for(var j = 0, lenB = this.allData[k].allDataInternal[i].frequencyArray.length; j < lenB; j++){
					if(this.allData[k].allDataInternal[i].frequencyArray[j].wordString === string){
						var yVal1 = this.allData[k].allDataInternal[i].frequencyArray[j].freq;
						linePosArray.push({x: k, y: yVal1});
						if(yVal1 < pathMin) pathMin = yVal1;
						if(yVal1 > pathMax) pathMax = yVal1;
						foundB = 1;
					}
				}
			}
			if(foundB === 0){
				var yVal2 = this.minFreq;
				linePosArray.push({x: k, y: yVal2});
				if(yVal2 < pathMin) pathMin = yVal2;
				if(yVal2 > pathMax) pathMax = yVal2;
			}
		}
		return {path: linePosArray, min: pathMin, max: pathMax};
	}
	
	,updateFullPath: function () {
//		console.log("fn: updateFullPath")
		var lenA = this.overlayQueue.length;
		while(lenA-- > 0){
			var pathHolder = this.prepareFullPath(this.overlayQueue[lenA].word);
			this.overlayQueue[lenA].fullPath = pathHolder.path;
			this.overlayQueue[lenA].pathMin = pathHolder.min;
			this.overlayQueue[lenA].pathMax = pathHolder.max;
		}
//		console.log(this.overlayQueue)
	}
	
	,buildSliderPath: function (pathArray) {
		var toolObject = this;
		var line = d3.svg.line()
		    .x(function(d) { return toolObject.xSliderScale(d.x); })
		    .y(function(d) { return toolObject.ySliderScale(d.y); })
		    .interpolate("monotone");
		return line(pathArray);
	}
	
	,sliderOverlayOn: function (objectToSelect) {
		//console.log('fn: sliderOverlayOn')		
		this.transitionSliderOverlay(objectToSelect);
		
		//draw path
		this.chart.append('g')
			.attr('id', 'slider-line-' + objectToSelect.word)
			.append('path')
			.attr("d", this.buildSliderPath(objectToSelect.fullPath))
			.style('stroke', objectToSelect.colour)
			.style('stroke-width', 2)
			.style('fill', 'none');
			
		//redraw slider
		this.redrawSlider();
	}
	
	,sliderOverlayOff: function (selector) {
	    this.chart.selectAll('g[id=slider-line-' + selector + ']')
	    	.remove();
	    
	    //update slider overlay axis
		this.transitionSliderOverlay();
	}
	
	,redrawSliderOverlay: function() {	
		//console.log('redrawSliderOverlay')
		for(var l = 0; l < this.overlayQueue.length; l++){
			this.sliderOverlayOff(this.overlayQueue[l].selector);
			this.sliderOverlayOn(this.overlayQueue[l]);
		}
	}
	
	,transitionSliderOverlay: function(objectToSelect) {
		//console.log('transitionSliderOverlay')
		objectToSelect = objectToSelect || 0;
		
		//update slider overlay axis
		this.updateYSliderScale(objectToSelect);
		
		//transition all other paths
		var lenA = this.overlayQueue.length;
		while(lenA-- > 0){
			this.chart.selectAll('g#slider-line-' + this.overlayQueue[lenA].selector)
				.select('path')
				.transition().duration(300)
				.ease('linear')
				.attr("d", this.buildSliderPath(this.overlayQueue[lenA].fullPath));
		}
	}
	
	,preparePath: function (string) {
		//console.log('fn: prepareData')
		
		var linePosArray = [];
		
		//peek at the next frequency point and the preceding one to end the line on the edge of the graph
		var foundA
			,foundB
			,foundC;
		
		//add two positions offscreen to the left for smooth transitions 
		for(var k = 0; k < 3 && this.shiftCount - k > 0; k++) {
			foundA = 0;
			for(var i = 0; i < this.allData[this.shiftCount - (1 + k)].allDataInternal.length; i++) {
				for(var j = 0; j < this.allData[this.shiftCount - (1 + k)].allDataInternal[i].frequencyArray.length; j++){
					if(this.allData[this.shiftCount - (1 + k)].allDataInternal[i].frequencyArray[j].wordString === string){
						var yVal3 = this.yScale(this.allData[this.shiftCount - (1 + k)].allDataInternal[i].frequencyArray[j].freq);
						linePosArray.unshift({x: this.shiftCount - (1 + k), y: yVal3});
						foundA = 1;
					}
				}
			}
			if(foundA === 0){
				var yVal4 = this.yScale(this.minFreq);
				linePosArray.unshift({x: this.shiftCount - (1 + k), y: yVal4});
			}
		}
		
		//fill in the middle values
		for(var k = this.shiftCount, len = this.numVisPoints + this.shiftCount; k < len; k++){
			foundB = 0;
			for(var i = 0, lenA = this.allData[k].allDataInternal.length; i < lenA; i++) {
				for(var j = 0, lenB = this.allData[k].allDataInternal[i].frequencyArray.length; j < lenB; j++){
					if(this.allData[k].allDataInternal[i].frequencyArray[j].wordString === string){
						var yVal1 = this.yScale(this.allData[k].allDataInternal[i].frequencyArray[j].freq);
						linePosArray.push({x: k, y: yVal1});
						foundB = 1;
					}
				}
			}
			if(foundB === 0){
				var yVal2 = this.yScale(this.minFreq);
				linePosArray.push({x: k, y: yVal2});
			}
		}
		
		//add two positions offscreen to the right for smooth transitions 
		for(var k = 0; k < 3 && this.numVisPoints + this.shiftCount + k < this.numDataPoints; k++){
			foundC = 0;
			for(var i = 0; i < this.allData[this.numVisPoints + this.shiftCount + k].allDataInternal.length; i++) {
				for(var j = 0; j < this.allData[this.numVisPoints + this.shiftCount + k].allDataInternal[i].frequencyArray.length; j++){
					if(this.allData[this.numVisPoints + this.shiftCount + k].allDataInternal[i].frequencyArray[j].wordString === string){
						var yVal1 = this.yScale(this.allData[this.numVisPoints + this.shiftCount + k].allDataInternal[i].frequencyArray[j].freq);
						linePosArray.push({x: this.numVisPoints + this.shiftCount + k, y: yVal1});
						foundC = 1;
					}
				}
			}
			if(foundC === 0){
				var yVal2 = this.yScale(this.minFreq);
				linePosArray.push({x: this.numVisPoints + this.shiftCount + k, y: yVal2});
			}
		}
		return linePosArray;
	}
	
	//draws the line graph overlay of the frequency info
	,chartOverlayOn: function(objectToSelect) {
//		console.log('fn: chartOverlayOn')
		
		var toolObject = this;
					
		//change selected word colour
		this.chart.selectAll('g[class=section]')
			.selectAll('g[class=frequencies]')
			.selectAll('text[class=' + objectToSelect.selector + ']')
			.style('fill', objectToSelect.colour)
			.style('fill-opacity', 1);
	    	
	    //if transitionCall === 'draw': draw the function for the first time		
		//if not: shift displayData to a different subset of allData
		//then display the newly shifted data
		
		var linePosArray = this.preparePath(objectToSelect.word);
		
		var pos;
		
		//draw path
		var line = d3.svg.line()
		    .x(function(d) { 
		    	pos = d.x;
		    	return toolObject.xScale(d.x + toolObject.callOffset()); })
		    .y(function(d) { return d.y; })
		    .interpolate('monotone');
		
		var path = this.chart.select('.overlay')
			.append('g')
			.attr('class', 'frequency-line-' + objectToSelect.selector)
			.append('path')
			.attr("d", line(linePosArray))
			.style('stroke', objectToSelect.colour)
			.style('stroke-width', 2)
			.style('fill', 'none');
					
		var posDif = (this.xScale(pos) - this.xScale(pos + this.callOffset()));
		
		if(this.transitionCall === 'left' || this.transitionCall ==='right') {
			path.transition()
				.duration(toolObject.getDuration())
				.ease("linear")
			    .attr("transform", "translate(" + posDif + ")");
		}
	}
	
	,chartOverlayOff: function(selector){
		var toolObject = this;
		
		this.chart.selectAll('text.' + selector)
	    	.style('fill', 'black')
	    	.style('fill-opacity', function(d) { return toolObject.opacityScale(d.freq); });
	    
	    this.chart.select('g.frequency-line-' + selector)
	    	.remove();
	}
	
	//reselect all the sticky words
	//a screen movement has changed the words positions
	,redrawChartOverlay: function () {
		//console.log('fn: redrawChartOverlay')
		for(var i = 0; i < this.overlayQueue.length; i++){
			this.chartOverlayOff(this.overlayQueue[i].selector);
			this.chartOverlayOn(this.overlayQueue[i]);
		}
	}
	
	//
	//SCALE FUNCTIONS
	//
	
	//all these scales need to be updated if this.absMaxFreq or this.valFraction changes
	,manageAllYScales: function() {
		this.manageFontScale();
		this.manageOpacityScale();
		this.manageYScale();
		this.manageYSliderScale();
	}
	
	,fontScale: d3.scale.linear()
	
	,manageFontScale: function() {
		//console.log('fn: fontScale')
		 this.fontScale.domain([this.minFreq, this.absMaxFreq * this.valFraction])
	    	.range([10, this.maxFont]);
	}
	
	/*,maxFontScale : function (value) {
		var scale = d3.scale.linear()
			.domain([600,2000])
			.range([15,60]);
		return scale(value);
	}*/
	
	,opacityScale: d3.scale.linear()
	
	,manageOpacityScale: function() {
		this.opacityScale.domain([0, this.absMaxFreq * this.valFraction])
    		.range([0.4, 0.8]);
	}
	
	,yScale: null
	
	,manageYScale: function () {
		if(this.getApiParam('yAxisScale') == 'linear') this.yScale = d3.scale.linear();
		if(this.getApiParam('yAxisScale') == 'log') this.yScale = d3.scale.log();
		
		this.yScale.domain([this.minFreq, this.absMaxFreq * this.valFraction * 1.25])
				.rangeRound([this.body.getHeight() - this.bPadding, (this.tPadding * 2) + this.navigationHeight]);
	}
	
	,ySliderScale: null
	
	,manageYSliderScale: function() {
		var top = this.tPadding
			,bottom = this.tPadding + this.navigationHeight;
		
		if(this.getApiParam('yAxisScale') == 'linear') this.ySliderScale = d3.scale.linear();
		if(this.getApiParam('yAxisScale') == 'log') this.ySliderScale = d3.scale.log();
		
		this.ySliderScale.domain([this.minFreq, this.absMaxFreq])
				.rangeRound([bottom, top]);
	}
	
	,updateYSliderScale: function(updateWithObject) {
		updateWithObject = updateWithObject || 0;
		var selectedMin = this.minFreq, //setting this to this.absMinFreq effectively deactivates it, to make it work use this.absMaxFreq
			selectedMax = 0;
	    	
	    //go through overlayQueue check for min / max
		var len = this.overlayQueue.length;
		while(len-- > 0){
			if(this.overlayQueue[len].pathMin < selectedMin) selectedMin = this.overlayQueue[len].pathMin;
			if(this.overlayQueue[len].pathMax > selectedMax) selectedMax = this.overlayQueue[len].pathMax;
		}
		if(updateWithObject != 0 && updateWithObject.pathMin < selectedMin) selectedMin = updateWithObject.pathMin;
		if(updateWithObject != 0 && updateWithObject.pathMax > selectedMax) selectedMax = updateWithObject.pathMax;
		
		this.ySliderScale.domain([selectedMin, selectedMax]);
	}
	
	,manageAllXScales: function() {
		this.manageXScale();
		this.manageXSliderScale();
	}
	
	,xScale: d3.scale.linear()
	
	,manageXScale: function() {
		this.xScale.domain([this.shiftCount - 0.5, this.numVisPoints + this.shiftCount - 0.5])
	    	.range([this.lPadding, this.body.getWidth() - this.rPadding]);
	}
	
	,xSliderScale: d3.scale.linear()
	
	,manageXSliderScale: function() {
		this.xSliderScale.domain([0, this.numDataPoints - 1])
	    	.range([this.lPadding, this.body.getWidth() - this.rPadding]);
	}

	//
	//MISC. FUNCTIONS
	//

	
	,setTitleLength: function () {
		//console.log('fn:setTitleLength')
		var toolObject = this, 
			item;
		this.titlesArray = [];
		
		var scale = d3.scale.linear()
			.domain([350,1250])
			.range([10,40]);
		
		var corpus = this.getCorpus();
		for (var i = 0, len = corpus.getDocumentsCount(); i < len; i++) {
			var item = corpus.getDocument(i);
			var shortTitle = item.getShortTitle();			
			if(shortTitle.length <= scale(toolObject.body.getWidth())) {
				toolObject.titlesArray.push(shortTitle); 
			} else {
				var shorterTitle = shortTitle.substring(0,scale(toolObject.body.getWidth()) - 3);
				toolObject.titlesArray.push(shorterTitle + '...'); 
			}
		}
	}
	
	,callOffset: function () {
//		console.log('fn: callOffset')
		var callOffset;
		if(this.transitionCall === 'draw' || this.transitionCall === 'redraw') { 
			callOffset = 0; 
		}
		if(this.transitionCall === 'left') { 
			callOffset = -1;
		}
		if(this.transitionCall === 'right') { 
			callOffset = 1;
		}
		return callOffset;
	}
	
	,removeFilteredCharacters: function (string) {
		//console.log('fn: removeFilteredCharacters')
		return string || '';
		
		if (string !== undefined) {
			return string.replace("'","apostrophe-")
				.replace("#","pound-")
				.replace("&","ampersand-")
				.replace("@","atsign-")
				.replace("!","exclamation-")
				.replace("0","num-o")
				.replace("1","num-a")
				.replace("2","num-b")
				.replace("3","num-c")
				.replace("4","num-d")
				.replace("5","num-e")		
				.replace("6","num-f")
				.replace("7","num-g")
				.replace("8","num-h")
				.replace("9","num-i")
				.replace(/[^a-zA-Z]+/g,'-'); //then anything else...
		} else {
			return '';
		}
	},
	
	getDuration: function() {
		return this.numDataPoints*(100-this.getSpeed())
	}
	
	
});

 Ext.define('Voyant.panel.Trends', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	requires: ['Ext.chart.CartesianChart','Voyant.data.store.Documents'],

	alias: 'widget.trends',
	config: {
    	options: {xtype: 'stoplistoption'},
		corpus: undefined
	},
    statics: {
    	i18n: {
    	},
    	api: {
    		limit: 5,
    		stopList: 'auto',
    		query: undefined,
    		withDistributions: 'relative',
    		bins: 10,
    		docIndex: undefined,
    		docId: undefined,
    		mode: "corpus"
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
    			this.setMode(this.MODE_DOCUMENT);
    			this.setApiParams({withDistributions: 'raw'});
    			this.down('#raw').setChecked(true);
    		}
    		if (!("bins" in this.getModifiedApiParams())) {
    			if (this.getApiParam('mode')==this.MODE_CORPUS) {
    				var count = corpus.getDocumentsCount();
    				this.setApiParam("bins", count > 100 ? 100 : count);
    			}
    		}
    		if (this.isVisible()) {
    			if (this.getApiParam('query')) {
    				this.loadFromCorpusTerms();
    			} else {
    				this.loadFromCorpus();
    			}
    		}
    	});
    	
    	this.on("corpusSelected", function(src, corpus) {
    		if (src.isXType("corpusdocumentselector")) {
    			this.setMode(this.MODE_CORPUS);
    			this.setApiParams({docId: undefined, docIndex: undefined})
        		this.loadFromCorpus();
    		}
    	});
    	
    	this.on("documentSelected", function(src, document) {
    		if (this.getCorpus()) {
    			this.loadFromDocuments([document])
    		}
    	});
    	
    	this.on("documentsClicked", function(src, documents) {
    		if (this.getCorpus()) {
    			this.loadFromDocuments(documents)
    		}
    	});
    	
    	this.on("query", function(src, query) {
    		if (this.getApiParam('mode')==this.MODE_DOCUMENT) {
    			this.setApiParam('query', query);
    			this.loadFromDocumentTerms();
    		} else {
        		this.fireEvent("termsClicked", src, query);
    		}
    	}, this);

    	this.on("termsClicked", function(src, terms) {
    		if (this.getCorpus()) { // make sure we have a corpus
        		var queryTerms = [];
        		terms.forEach(function(term) {
        			if (Ext.isString(term)) {queryTerms.push(term);}
        			else if (term.term) {queryTerms.push(term.term);}
        			else if (term.getTerm) {queryTerms.push(term.getTerm());}
        		});
        		if (queryTerms) {
        			this.setApiParams({
        				query: queryTerms
        			});
            		if (this.isVisible()) {
            			if (queryTerms.length>0) {
                    		this.loadFromCorpusTerms();
            			} else {
            				this.loadFromCorpus()
            			}
            		}
        		}
    		}
    	});

    	this.on("documentTermsClicked", function(src, terms) {
    		if (this.getCorpus()) { // make sure we have a corpus
    			this.setMode(this.MODE_DOCUMENT);
    			if (terms[0] && terms[0].get('distributions') !== undefined) {
    				this.loadFromRecords(terms); // load anyway, even if not visible - no server request required
    			}
    			else {
    				this.fireEvent("termsClicked", src, terms);
    			}
    		}
    	});
    	this.on("corpusTermsClicked", function(src, terms) {
    		if (this.getCorpus()) { // make sure we have a corpus
    			if (terms[0] && terms[0].get('distributions') !== undefined && this.getCorpus().getDocumentsCount()>1) {
    				this.loadFromRecords(terms); // load anyway, even if not visible - no server request required
    			}
    			else {
    				this.fireEvent("termsClicked", src, terms);
    			}
    		}
    	});
    	
    	this.on("activate", function() { // tab activation
    		if (this.getCorpus()) {
				this.loadFromCorpus();
    		}
    	}, this);
    	
    	this.on("ensureCorpusView", function(src, corpus) {
    		if (this.getApiParam('mode')!=this.MODE_CORPUS && corpus.getDocumentsCount()>1) {
    			this.setApiParam('docId', undefined);
    			this.loadFromCorpus();
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
        		enableOverflow: true,
                items: [{
                    	xtype: 'querysearchfield'
                	},{
						xtype: 'corpusdocumentselector',
						singleSelect: true
					},{
					    text: this.localize('freqsMode'),
    					glyph: 'xf201@FontAwesome',
					    tooltip: this.localize('freqsModeTip'),
					    menu: {
					    	items: [
					           {
					               text: this.localize("relativeFrequencies"),
					               checked: true,
					               itemId: 'relative',
					               group: 'freqsMode',
					               checkHandler: function(item, checked) {
					            	   if (checked) {
					                	   this.setApiParam('withDistributions', 'relative');
					                	   this.reloadFromChart();
					            	   }
					               },
					               scope: this
					           }, {
					               text: this.localize("rawFrequencies"),
					               checked: false,
					               itemId: 'raw',
					               group: 'freqsMode',
					               checkHandler: function(item, checked) {
					            	   if (checked) {
					                	   this.setApiParam('withDistributions', 'raw');
					                	   this.reloadFromChart();
					            	   }
					               },
					               scope: this
					           }
					       ]
					    }
					},{
    			    	itemId: 'segmentsSlider',
    			    	xtype: 'slider',
    			    	fieldLabel: this.localize('segmentsSlider'),
    			    	fieldAlign: 'right',
    			    	labelWidth: 70,
    			    	width: 150,
    			    	minValue: 2,
    			    	maxValue: 100,
    	            	listeners: {
    	            		afterrender: function(slider) {
    	            			slider.setValue(parseInt(this.getApiParam("bins")))
    	            		},
    	            		changecomplete: function(slider, newvalue) {
    	            			this.setApiParams({bins: newvalue});
    	            			if (this.getApiParam("docId") || this.getApiParam('docIndex')) {
    	            				this.loadFromDocumentTerms();
    	            			}
    	            			else {
    	            				this.loadFromCorpusTerms();
    	            			}
    	            		},
    	            		scope: this
    	            	}
		    		}]
            }]
        });
        me.callParent(arguments);
    	 
    },
    
    loadFromDocuments: function(documents) {
    	this.setApiParams({docId: undefined, docIndex: Ext.Array.from(documents).map(function(doc) {return this.getCorpus().getDocument(doc).getIndex()}, this)})
    	if (this.isVisible()) {
    		this.loadFromDocumentTerms(this.getApiParam('query') ? undefined : this.getCorpus().getDocumentTerms({
    			proxy: {
    				extraParams: {
    					limit: this.getApiParam('limit')
    				}
    			}
    		}))
    	}
    },
    
    loadFromDocumentTerms: function(documentTerms) {
    	if (this.getCorpus()) {
        	documentTerms = documentTerms || this.getCorpus().getDocumentTerms({});
    		documentTerms.load({
    		    callback: function(records, operation, success) {
    		    	if (success) {
    	    			this.setMode(this.MODE_DOCUMENT);
    		    		this.loadFromRecords(records);
    		    	}
    		    	else {
    					Voyant.application.showResponseError(this.localize('failedGetDocumentTerms'), operation);
    		    	}
    		    },
    		    scope: this,
    		    params: this.getApiParams(['stopList','query','docIndex','withDistributions','bins'])
        	});
    	}
    },
    
    loadFromCorpus: function(corpus) {
    	corpus = corpus || this.getCorpus();
		this.setCorpus(corpus);
		if (this.getApiParam("docId")) {
			this.loadFromDocumentTerms();
		}
		else if (corpus.getDocumentsCount()==1) {
			this.loadFromDocuments([corpus.getDocument(0)]);
		}
		else {
			this.loadFromCorpusTerms(corpus.getCorpusTerms({
				proxy: {
					extraParams: {
						limit: this.getApiParam('limit')
					}
				}
			}))
		}
	},

    loadFromCorpusTerms: function(corpusTerms) {
    	if (this.getCorpus()) {
    		if (this.getCorpus().getDocumentsCount()==1) {
    			this.loadFromDocumentTerms();
    		} else {
        		corpusTerms = corpusTerms || this.getCorpus().getCorpusTerms({autoLoad: false});
        		var params = this.getApiParams(['stopList','query','withDistributions',"bins"]);
        		// ensure that we're not beyond the number of documents
        		if (params.bins && params.bins > this.getCorpus().getDocumentsCount()) {
        			params.bins = this.getCorpus().getDocumentsCount();
        		}
    			corpusTerms.load({
    			    callback: function(records, operation, success) { // not called in EXT JS 6.0.0
    			    	if (success) {
    		    			this.setMode(this.MODE_CORPUS);
    				    	this.loadFromRecords(records);
    			    	}
    			    	else {
    						Voyant.application.showResponseError(this.localize('failedGetCorpusTerms'), operation);
    			    	}
    			    },
    			    scope: this,
    			    params: params
    	    	});
    		}
    	}
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
    				terms[i] = {"index": i};
    			}
    			terms[i]["_"+index] = r;
    			if (r>max) {max=r;}
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
                smooth: false,
                tooltip: {
                    trackMouse: true,
                    style: 'background: #fff',
                    renderer: function(toolTip, record, item) {
                    	var html = "<i>"+item.series.getTitle()+"</i>: "+record.get(item.series.getYField());
                    	if (mode==toolTip.panel.MODE_CORPUS) {
                    		var corpus = toolTip.panel.getCorpus();
                    		if (corpus && corpus.getDocumentsCount() == record.store.getCount()) {
                    			html += '<br/><i>'+toolTip.panel.getCorpus().getDocument(item.index).getShortTitle()+"</i>";
                    		}
                    	}
                    	toolTip.setHtml(html);
                    },
                    panel: this
                },
                listeners: {
                	itemclick: {
        	        	fn: this.handleClickedItem,
        	        	scope: this
                	}
                }
    		});
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
        			text: this.localize(this.getApiParam('withDistributions') =='raw' ? 'rawFrequencies' : 'relativeFrequencies')
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
        		renderer: function(axis, label) {
        			if (mode==me.MODE_DOCUMENT) {
        				return parseInt(label)+1;
        			} else {
        				var doc = me.getCorpus().getDocument(label);
        				return doc ? doc.getTinyLabel() : '?';
        			}
        		}
        	}]
    	});

    },
    
    reloadFromChart: function() {
    	var chart = this.down('chart');
    	if (chart) {
    		var terms = [];
    		chart.series.forEach(function(serie) {
    			terms.push(serie.getTitle());
    		});
    		this.fireEvent("termsClicked", this, terms);
    	}
    },
    
    buildChart: function(config) {
    	config.axes.forEach(function(axis) {
    		Ext.applyIf(axis, {
        		style: {opacity: .2},
        		label: {opacity: .5}
    		});
    		Ext.applyIf(axis.title, {
    			fontSize: 12
    		});
    	});
    	Ext.applyIf(config, {
    	    plugins: {
    	        ptype: 'chartitemevents',
    	        moveEvents: true
    	    },
    		legend: {docked:'top'},
    		interactions: ['itemhighlight','panzoom'],
    		innerPadding: {top: 5, right: 5, bottom: 5, left: 5},
    		border: false,
    	    bodyBorder: false
    	});
    	
    	// remove existing chart
    	this.query('chart').forEach(function(chart) {this.remove(chart);}, this);

		var chart = Ext.create("Ext.chart.CartesianChart", config);
    	this.add(chart);
    },
    
    clearChart: function() {
    	// we need a way of updating data instead of this brute-force approach
    	this.query('chart').forEach(function(chart) {this.remove(chart);}, this);
    },
    
    handleClickedItem: function(chart, item) {
        	var mode = this.getApiParam("mode");
        	if (mode===this.MODE_DOCUMENT) {
        		var docId = this.getApiParam("docId");
        		if (docId) {
        			var doc = this.getCorpus().getDocument(docId);
        			var tokens = doc.get('tokensCount-lexical');
        			var bins = this.getApiParam('bins');
        			var position = item.index / bins * tokens;
            		this.dispatchEvent("documentIndexTermsClicked", this, [{
            			term: item.series.getTitle(),
            			docId: docId,
            			position: position
            		}]);
        		}
        	}
        	else if (mode==this.MODE_CORPUS) {
        		var doc = this.getCorpus().getDocument(item.index);
        		this.dispatchEvent("documentIndexTermsClicked", this, [{
        			term: item.series.getTitle(),
        			docIndex: item.index,
        			docId: doc.getId()
        		}]);
        	}
    },
    
    isLastClickedItem: function(item) {
    	return this.lastClickedItem && this.lastClickedItem.term==item.term && this.lastClickedItem.index==item.index;
    },
    
    setMode: function(mode) {
    	this.setApiParams({mode: mode});
    	var mode = this.getApiParam("mode");    	
//    	var menu = this.queryById("segmentsSlider");
//    	menu.setHidden(mode==this.MODE_CORPUS)
    }        
});
Ext.define('Voyant.panel.NoTool', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.notool',
    statics: {
    	i18n: {
    	},
    	api: {
    		tool: undefined
    	}
    },
    config: {
    	html: undefined,
    	notYetImplemented: ["Centroid","DocumentInputAdd","DocumentTypeCollocateFrequenciesGrid","EntitiesBrowser","Equalizer","FeatureClusters","Flowerbed","KwicsTagger","Lava","Mandala","MicroSearch","NetVizApplet","PaperDrill","RezoViz","Sunburst","Termometer","Ticker","TokensViz","ToolBrowser","ToolBrowserLarge","VoyeurTagline","WordCloud","VoyeurTagline","WordCountFountain"]
    },
    constructor: function() {
    	Ext.apply(this, {
    		title: this.localize('title')
    	});
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
	listeners: {
		boxready: function(container, width, height) {
			var tool = this.getApiParam("notool");

			if (tool) {
				if (Ext.isArray(tool)) {tool=tool[0]}
				
				var msg = "";
				
				// check to see if this is a tool that's recognized but not implemented
				var oldTools = this.getNotYetImplemented();
				for (var i=0, len=oldTools.length; i<len; i++) {
					if (tool==oldTools[i]) {
						return Ext.Msg.show({
						    title: this.localize('error'),
						    message: new Ext.Template(this.localize('notImplemented')).applyTemplate([tool]),
						    buttons: Ext.Msg.YESNO,
							buttonText: {yes: this.localize("currentButton"), no: this.localize("oldButton")},
						    icon: Ext.Msg.ERROR,
						    scope: this,
						    fn: function(btn) {
						    	var url;
						    	if (btn=='yes') {
						    		url = this.getNewUrl();
						    	}
						    	else {
						    		url = "http://voyant-tools.org/tool/"+tool+"/";
							    	var query = Ext.Object.fromQueryString(document.location.search)
							    	delete query['tool']
							    	queryString = Ext.Object.toQueryString(query);
							    	if (queryString) {
								    	url += "?"+queryString
							    	}
						    	}
						    	window.location.replace(url);
						    }
						});
					}
				}

				Ext.Msg.show({
				    title: this.localize('error'),
				    message: new Ext.Template(this.localize('badToolSpecified')).applyTemplate([tool]),
				    buttons: Ext.Msg.OK,
				    icon: Ext.Msg.ERROR,
				    scope: this,
				    fn: function(btn) {
				    	window.location.replace(this.getNewUrl());
				    }
				});
				
			}
			
			// no tool specified, so just redirect
			else if (!this.config.html) {
				Ext.Msg.show({
				    title: this.localize('error'),
				    message: this.localize('noToolSpecified'),
				    buttons: Ext.Msg.OK,
				    icon: Ext.Msg.ERROR,
				    scope: this,
				    fn: function(btn) {
				    	window.location.replace(this.getNewUrl());
				    }
				});
			}
		}
	},
	getNewUrl: function() {
    	var query = Ext.Object.fromQueryString(document.location.search)
    	delete query['tool']
    	queryString = Ext.Object.toQueryString(query);
    	return this.getApplication().getBaseUrl()+(queryString ? "?"+queryString : "")
	}
});
Ext.define('Voyant.panel.VoyantFooter', {
	extend: 'Ext.container.Container',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.voyantfooter',
    statics: {
    	i18n: {
    	}
    },
	height: 18,
	cls: 'x-tab-bar-default voyant-footer',
	listeners: {
		boxready: function(container, width, height) {
			var parts = [
				"<a href='"+container.getBaseUrl()+"docs/' target='voyantdocs'>"+container.localize('voyantTools')+"</a> ",
				", <a href='http://stefansinclair.name/'>St&eacute;fan Sinclair</a> &amp; <a href='http://geoffreyrockwell.com'>Geoffrey Rockwell</a>",
				" (<a href='http://creativecommons.org/licenses/by/4.0/' target='_blank'><span class='cc'>c</span></a> "+ new Date().getFullYear() +")",
				" <a class='privacy' href='"+this.getBaseUrl()+"docs/#!/guide/about-section-privacy-statement' target='top'>"+container.localize('privacy')+"</a>",
				" v. "+Voyant.application.getVersion() + (Voyant.application.getBuild() ? " ("+Voyant.application.getBuild()+")" : "")
			];
			var footer = '';
			var footerWidth = 0;
			var partWidth;
			var el = container.getEl();
			for (var i=0;i<parts.length;i++) {
				partWidth = el.getTextWidth(parts[i].replace(/data-qtip.+?-->/,">").replace(/<.+?>/g, ""));
				if (footerWidth+partWidth < width) {
					footer += parts[i];
					footerWidth += partWidth;
				}
			}
			container.update(footer);
        	Ext.tip.QuickTipManager.register({
                target: container.getTargetEl().dom.querySelector(".privacy"),
                text: this.localize('privacyMsg')
            });
		}
	}
});
Ext.define('Voyant.panel.VoyantHeader', {
	extend: 'Ext.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.voyantheader',
    statics: {
    	i18n: {
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
    		moreTools: ['corpusset','scatterplot','termsradio'],
			includeTools: {
				save: true,
				plus: true,
				help: true,
				home: {
					type: 'home',
					tooltip: this.localize("homeTip"),
					xtype: 'toolmenu',
	                glyph: 'xf015@FontAwesome',
	        		handler: function(btn) {
	        			var panel = this.up("panel")
	        			Ext.Msg.confirm(panel.localize('home'), panel.localize('homeConfirm'), function(buttonId) {
	        				if (buttonId=='yes') {
	        					document.location.href = panel.getBaseUrl()
	        				}
	        			}, this);
	        		}
				}
			}
    	}));
    },
    
    onCollapse: function(panel) {
    	// the title may be in flux when collapsing, so call defer setting of title
    	Ext.defer(function() {this.setTitle("<img src='"+this.getBaseUrl()+"resources/images/voyant-logo-tiny.png' style='vertical-align: middle' alt='Voyant Tools' /> "+this.localize('title'))}, 10, panel)
    }
});

Ext.define('Voyant.panel.CorpusSet', {
	extend: 'Ext.panel.Panel',
    requires: ['Voyant.panel.VoyantTabPanel','Voyant.panel.Cirrus', 'Voyant.panel.Summary', 'Voyant.panel.CorpusTerms', 'Voyant.panel.Reader', 'Voyant.panel.Documents', 'Voyant.panel.Trends', 'Voyant.panel.Contexts', 'Voyant.panel.Phrases', 'Voyant.panel.DocumentTerms','Voyant.panel.CorpusCollocates','Voyant.panel.CollocatesGraph','Voyant.panel.StreamGraph'],
	mixins: ['Voyant.panel.Panel'],
    alias: 'widget.corpusset',
	isConsumptive: true,
	statics: {
		i18n: {
		},
		api: {
			panels: undefined
		},
		glyph: 'xf17a@FontAwesome'
	},
	constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
	},
	layout: 'border',
	header: false,
	items: [{
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
    	}, {
    		xtype: 'collocatesgraph'
    	}]
    },{
        region: 'center',
        flex: 3,
        layout: 'fit',
        xtype: 'voyanttabpanel',
    	tabBarHeaderPosition: 0,
        items: [{
	        xtype: 'reader' // termsradio added and set to default during loadedCorpus below when in non-consumptive mode
        }]
    }, {
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
	    	xtype: 'documentterms'
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
	    			xtype: 'bubblelines' // is set to default during loadedCorpus below when in non-consumptive mode
    			}]
    	}]
    }],
    listeners: {
    	boxready: function() {
    		var panelsString = this.getApiParam("panels");
    		if (panelsString) {
    			var panels = panelsString.toLowerCase().split(",");
    			var tabpanels = this.query("voyanttabpanel");
    			for (var i=0, len=panels.length; i<len; i++) {
    				var panel = panels[i];
    				if (panel && Ext.ClassManager.getByAlias('widget.'+panel) && tabpanels[i]) {
    					var tabpanel = tabpanels[i];
    					if (tabpanel.getActiveTab().isXType(panel)) {continue;} // already selected
    					tabpanel.items.each(function(item, index) {
    						if (item.isXType(panel)) {
    							this.setActiveTab(index)
    							return false
    						}
    					}, tabpanel)
    					if (tabpanel.getActiveTab().isXType(panel)) {continue;} // already switched
    					tabpanel.getActiveTab().replacePanel(panel); // switch to specified panel
    				}
    			}
    		}
    		// add an easter egg
    		var cirrus = this.down('cirrus');
    		var me = this;
    		if (cirrus) {
    			var toolbar = cirrus.down('toolbar');
    			toolbar.add({xtype: 'tbfill'})
    			var b = toolbar.add({
    				text: ' ',
    				handler: function() {
    					me.add({
    						region: 'north',
    						width: '100%',
							html: '<div align="center"><table><tr><td><img src="http://stefansinclair.name/wordpress/wp-content/uploads/2011/07/Sinclair_Stefan_small.jpg" style="height: 60px"></td><td style="text-align: center; padding-left: 2em; padding-right: 2em;">By Athena, you found us hidden<br>up here between the panels!</td><td><img src="http://geoffreyrockwell.com/images/home_09.jpg" style="height: 60px"></td></tr></table></div>'
    					})
    				}
    			}).getTargetEl().dom.className=''
    		}
    		
    	},
    	loadedCorpus: function(src, corpus) {
    		if (corpus.getNoPasswordAccess()=='NONCONSUMPTIVE' && !this.getApiParam('panels')) {
    			var tabpanels = this.query("voyanttabpanel");
    			tabpanels[1].add({xtype: 'termsradio'}); // reader
    			tabpanels[1].setActiveTab(1); // reader
    			tabpanels[1].getActiveTab().fireEvent("loadedCorpus", src, corpus); // make sure to load corpus
    			tabpanels[4].setActiveTab(1); // contexts
    		}
    		if (corpus.getDocumentsCount()>30) {
    			var bubblelines = this.down('bubblelines');
    			if (bubblelines) {
    				bubblelines.up('voyanttabpanel').remove(bubblelines)
    			}
    		}
    	},
    	panelChange: function(src) {
    		var panels = [];
    		this.query("voyanttabpanel").forEach(function(item) {
    			panels.push(item.getActiveTab().xtype)
    		})
    		this.getApplication().setApiParam('panels', panels.join(','))
    	}
    }
})
Ext.define('Voyant.panel.ScatterSet', {
	extend: 'Ext.panel.Panel',
    requires: ['Voyant.panel.ScatterPlot','Voyant.panel.Documents', 'Voyant.panel.Trends', 'Voyant.panel.Contexts'],
	mixins: ['Voyant.panel.Panel'],
    alias: 'widget.scatterset',
	statics: {
		i18n: {
		},
		glyph: 'xf17a@FontAwesome'
	},
	constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
	},
	layout: 'hbox',
	header: false,
	items: [{
    	flex: 3,
    	height: '100%',
        xtype: 'scatterplot'
    },{
    	split: {width: 5},
        flex: 1,
    	height: '100%',
        layout: 'vbox',
        defaults: {
        	width: '100%',
        	flex: 1
        },
        items: [{
        	xtype: 'documents',
        	collapsible: true
        },{
        	xtype: 'trends',
        	collapsible: true
        },{
        	xtype: 'contexts',
        	collapsible: true
        }]
    }]
})
Ext.define('Voyant.panel.Subset', { 
	
	
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel','Voyant.util.Downloadable'],
	alias: 'widget.subset',
	isConsumptive: true,
    statics: {
    	i18n: {
    	},
    	api: {
    		stopList: 'auto',
    		documentFilename: ['pubDate','title'],
    		documentFormat: 'SOURCE'
    	},
		glyph: 'xf0ce@FontAwesome'
    },
    config: {
    	options: {
    		xtype: 'stoplistoption'
    	},
		inDocumentsCountOnly: false,
		stopList: 'auto',
		store: undefined
    },
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);    	
    },
    
    
    initComponent: function(config) {
        var me = this;

        Ext.applyIf(me, {
        	introHtml: '',
        	fieldItems: [{
	        		xtype: 'querysearchfield',
	        		fieldLabel: this.localize('titleLabel'),
	        		tokenType: 'title'
        		},{
	        		xtype: 'querysearchfield',
	        		fieldLabel: this.localize('authorLabel'),
	        		tokenType: 'author'
        		},{
	        		xtype: 'querysearchfield',
	        		fieldLabel: this.localize('termsLabel')
        	}],
        	fieldColumns: 2
        });
        
        Ext.applyIf(me, {
        	intro: {
        		margin: '5 0 5 0',
        		layout: 'center',
        		items: {
        			itemId: 'intro',
            		html: me.introHtml
        		}
        	},
        	fields: {
				xtype: 'container',
        		layout: 'center',
        		items: {
    				xtype: 'container',
        			maxWidth: 1200,
        			layout: {
        				type: 'table',
        				columns: me.fieldColumns
        			},
        			// wrap in another container otherwise the tip won't work
        			items: me.fieldItems.map(function(item) {return {
        				xtype: 'container',
            			defaults: {
            				margin: '5 10 5 10',
                    		inDocumentsCountOnly: me.getInDocumentsCountOnly(),
                    		stopList: me.getStopList(),
                    		showAggregateInDocumentsCount: true,
                    		isDocsMode: true,
                    		flex: 1,
                    		maxWidth: 800,
                    		labelAlign: 'right'
            			},
        				items: Ext.applyIf(item, {
        					fieldLabel: me.localize((item.tokenType ? item.tokenType : 'lexical')+'Label')
        				})
        			}}, this)
        		}
        	},
        	foot: {
        		layout: 'center',
        		margin: '20 0 0 0',
        		items: {
        			xtype: 'container',
        			layout: {
        				type: 'hbox',
        				align: 'middle'
        			},
        			defaults: {
    	        		margin: '0 5 0 5',
//    	        		scale: 'large',
    	        		width: 200
        			},
        			items:  [{
    	        		xtype: 'button',
    	        		itemId: 'export',
	                    glyph: 'xf08e@FontAwesome',
    	        		text: this.localize('sendToVoyantButton'),
    	        		handler: me.handleSendToVoyant,
    	        		scope: me
            		},{
    	        		xtype: 'button',
				    	glyph: 'xf019@FontAwesome',
    	        		itemId: 'download',
    	        		text: this.localize('downloadButton'),
    	        		handler: me.handleExport,
    	        		scope: me
            		},{
            			xtype: 'container',
            			hidden: true,
            			itemId: 'statuscontainer',
            			layout: 'vbox',
            			items: [{
            				itemId: 'status',
            				bodyStyle: 'text-align: center',
            				width: 200
            			},{
            				xtype: 'container',
            				width: 200,
            				items: {
            	    			xtype: 'sparklineline',
            	    			chartRangeMin: 0,
            	    			itemId: 'sparkline',
            	    			margin: '0 0 0 10',
            	    			values: [1,1],
            	    			height: 20,
            	    			width: 200
            				}
            			}]
            		}]
        		}
        	}
        })

        Ext.applyIf(me, {
        	items: [me.intro, me.fields, me.foot]
        });
        
    	me.on('loadedCorpus', function(src, corpus) {
    		me.getStore().setCorpus(corpus);
    		if (me.getInitialConfig('introHtml')==undefined && me.getInitialConfig('intro')==undefined) {
    			 me.queryById('intro').setHtml(corpus.getString())
    		}
    	}, me);
    	
    	me.on('query', function(src, queries) {
    		this.performAggregateQuery(this.getAggregateQuery());
    	});
    	
    	me.setStore(Ext.create('Voyant.data.store.DocumentQueryMatches'))
        me.callParent([config]);
        
    },
    
    handleSendToVoyant: function() {
    	if (!this.getStore().lastOptions || !this.getStore().lastOptions.params.query) {
    		// there's currently no query, so give the option of opening the current corpus in a new window
    		Ext.Msg.alert(this.localize('sendToVoyantButton'), new Ext.XTemplate(this.localize('sendToVoyantNoQuery')).apply([this.getBaseUrl()+"?corpus="+this.getStore().getCorpus().getId()]))
    	} else {
    		// try spawning a new corpus with the query
    		var me = this;
        	this.mask("Creating corpus…");
        	this.getStore().load({
        		params: {
        			query: this.getStore().lastOptions.params.query,
        			createNewCorpus: true
        		},
        		callback: function(records, operation, success) {
        			me.unmask();
        			if (success && records && records.length==1) {
            			var corpus = operation.getProxy().getReader().metaData;
        				var url = me.getBaseUrl()+"?corpus="+corpus;
        				me.openUrl(url);
        			}
        		}
        	})
    	}
    },
    
    handleExport: function() {
    	if (!this.getStore().lastOptions || !this.getStore().lastOptions.params.query) {
    		this.downloadFromCorpusId(this.getStore().getCorpus().getId());
    	} else {
    		var record = this.getStore().getAt(0);
    		if (this.getStore().lastOptions.params.query && record && record.getCount()==0) {
    			this.showMsg({message: this.localize('noMatches')})
    		} else {
    	    	this.getStore().load({
    	    		params: {
    	    			query: this.getStore().lastOptions.params.query,
    	    			createNewCorpus: true,
    	    			temporaryCorpus: true
    	    		},
    	    		callback: function(records, operation, success) {
    	    			if (success && records && records.length==1) {
    	    	    		this.downloadFromCorpusId(operation.getProxy().getReader().metaData);
    	    			}
    	    		},
    	    		scope: this
    	    	})
    		}
    	}
    },
    
    openDownloadCorpus: function(corpus) {
		var url = this.getTromboneUrl()+"?corpus="+corpus+"&tool=corpus.CorpusExporter&outputFormat=zip"+
			"&zipFilename=DownloadedVoyantCorpus-"+corpus+".zip"+
			(this.getApiParam("documentFormat") ? "&documentFormat="+this.getApiParam("documentFormat") : '')+
			(this.getApiParam("documentFilename") ? "&documentFilename="+this.getApiParam("documentFilename") : '')
		this.openUrl(url)
    },

    performAggregateQuery: function(query) {
    	var me = this, statuscontainer = me.queryById('statuscontainer'), status = me.queryById('status'), spark = me.queryById('sparkline');
		if (statuscontainer) {statuscontainer.show();}
		if (status) {status.setHtml(new Ext.XTemplate('{0:plural("documents")} matching.').apply([0]))}
		if (spark) {spark.setValues([0,0]);}
    	if (query) {
        	var docsCount = this.getStore().getCorpus().getDocumentsCount();
        	this.getStore().load({
        		params: {
        			query: query,
        			withDistributions: true,
        			bins: docsCount > 100 ? 100 : docsCount 
        		},
        		callback: function(records, operation, success) {
        			var exp = me.queryById('export');
        			var spark = me.queryById('sparkline');
        			if (success && records && records.length==1) {
        				if (status) {
        					status.setHtml(new Ext.XTemplate('{0:plural("document")} matching.').apply([records[0].getCount()]))
        				}
        				if (spark) {
            				spark.setValues(records[0].getDistributions())
        				}
        			}
        		}
        	})
    	} else if (this.getStore().lastOptions) { // set query to undefined so that send/export buttons work properly
    		this.getStore().lastOptions.params.query = undefined
    	}
    },
    
    getAggregateQuery: function() {
		var aggregateQueries = [];
		Ext.ComponentQuery.query('field', this).forEach(function(field) {
			if (field.getTokenType && field.getValue) {
				var tokenType = field.getTokenType();
				var vals = Ext.Array.from(field.getValue());
				if (vals.length>0) {
					if (vals.length>0) {
        				aggregateQueries.push("+("+vals.map(function(val) {
        					return tokenType+":"+val
        				}).join("|")+")");
					}
				}
			}
		})
		return aggregateQueries.join(" ");
    }
})

Ext.define('Voyant.panel.CollocatesSet', {
	extend: 'Ext.panel.Panel',
    requires: ['Voyant.panel.ScatterPlot','Voyant.panel.Documents', 'Voyant.panel.Trends', 'Voyant.panel.Contexts'],
	mixins: ['Voyant.panel.Panel'],
    alias: 'widget.collocatesset',
	statics: {
		i18n: {
		},
		glyph: 'xf17a@FontAwesome'
	},
	constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
	},
	layout: 'vbox',
	header: false,
	items: [{
		layout: 'hbox',
		align: 'stretch',
		width: '100%',
		height: '100%',
		flex: 2,
        defaults: {
        	width: '100%',
        	height: '100%',
        	flex: 1,
        	frame: true,
        	border: true
        },
        items: [{
        	xtype: 'corpusterms'
        },{
        	xtype: 'documentterms'
        },{
        	xtype: 'corpuscollocates'
        }]
    },{
    	width: '100%',
    	height: '100%',
    	split: {width: 5},
		layout: 'hbox',
		flex: 3,
        defaults: {
        	width: '100%',
        	height: '100%',
        	flex: 1,
        	frame: true,
        	border: true
        },
        items: [{
        	xtype: 'contexts'
        },{
        	xtype: 'collocatesgraph'
        }]
    }]
})
Ext.define('Voyant.panel.BubblelinesSet', {
	extend: 'Ext.panel.Panel',
    requires: ['Voyant.panel.Bubblelines','Voyant.panel.Contexts', 'Voyant.panel.Reader'],
	mixins: ['Voyant.panel.Panel'],
    alias: 'widget.bubblelinesset',
	statics: {
		i18n: {
		},
		glyph: 'xf17a@FontAwesome'
	},
	constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
	},
	layout: 'vbox',
	header: false,
	items: [{
		width: '100%',
		height: '100%',
    	xtype: 'bubblelines',
    	flex: 5
    },{
    	width: '100%',
    	height: '100%',
    	split: {width: 5},
		layout: 'hbox',
		flex: 4,
        defaults: {
        	width: '100%',
        	height: '100%',
        	flex: 1,
        	frame: true,
        	border: true
        },
        items: [{
        	xtype: 'contexts'
        },{
        	xtype: 'reader'
        }]
    }]
})
Ext.define('Voyant.panel.CustomSet', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
    alias: 'widget.customset',
	statics: {
		i18n: {
		},
		api: {
			layout: undefined,
			tableLayout: undefined
		},
		glyph: 'xf17a@FontAwesome'
	},
	header: false,
	height: '100%',
	width: '100%',
	
    constructor: function() {
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments); // force api load
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
		if (this.getApiParam('layout')) {
			Ext.apply(this,{
				layout: 'border',
				items: []
			})
		} else if (this.getApiParam('tableLayout')) {
			this.initTableLayout();
		}
		this.callParent()
    },
	
	listeners: {
		loadedCorpus: function(src, corpus) {
			if (this.getApiParam('layout')) { // not sure why, but we seem to need to fire event for child panels
				this.query("panel").forEach(function(p) {
					p.fireEvent("loadedCorpus", src, corpus);
				})
			}
		},
		boxready: function(panel) {
			if (this.getApiParam('layout')) {
				this.initBorderLayoutComponents();
			} else if (this.getApiParam('tableLayout')) {
		    	this.doTableSizing();
		    	this.on('resize', function(panel, newwidth, newheight, oldwidth, oldheight) {
					if (oldwidth !== undefined && oldheight !== undefined) {
			        	var widthRatio = newwidth/oldwidth;
			        	var heightRatio = newheight/oldheight;
			        	this.doTableSizing(widthRatio, heightRatio);
					}
				}, this);
			} else {
				this.showError(this.localize('noLayoutSpecified'))
			}
		}
		
	},
	
	initBorderLayoutComponents: function() {
        var layoutString = decodeURI(this.getApiParam('layout'))
        	.replace(/r1/g, 'region')
	        .replace(/i1/g, 'items')
	        .replace(/s1/g, 'split')
	        .replace(/c1/g, 'collapsible')
	        .replace(/c2/g, 'collapsed')
	        .replace(/w1/g, 'width')
	        .replace(/h1/g, 'height')
	        .replace(/p1/g, '%')
	        .replace(/"x1":"/g, '"xtype":"')
	        .replace(/c3/g, 'center')
	        .replace(/n1/g, 'north')
	        .replace(/e1/g, 'east')
	        .replace(/s2/g, 'south')
	        .replace(/w2/g, 'west')
	    	.replace(/"xtype":"(\w+)"/g, function(match, tool) {
            	if (!Ext.ClassManager.getByAlias("widget."+tool.toLowerCase())) {
		            if (tool=="Links") {tool="CollocatesGraph";}
		            else if (tool=="CorpusGrid") {tool="Documents";}
		            else if (tool=="CorpusSummary") {tool="Summary";}
		            else if (tool=="CorpusTypeFrequenciesGrid") {tool="CorpusTerms";}
		            else if (tool=="DocumentInputAdd") {tool="CorpusTerms";}
		            else if (tool=="DocumentTypeCollocateFrequenciesGrid") {tool="CorpusTerms";}
		            else if (tool=="DocumentTypeFrequenciesGrid") {tool="DocumentTerms";}
		            else if (tool=="DocumentTypeKwicsGrid") {tool="Contexts";}
		            else if (tool=="TypeFrequenciesChart") {tool="Trends";}
		            else if (tool=="VisualCollocator") {tool="CollocatesGraph";}
		            else {tool="NoTool"}
            	}
            	return '"xtype":"'+tool.toLowerCase()+'"'+(tool=="NoTool" ? ',"html":"'+new Ext.Template(panel.localize('noSuchTool')).applyTemplate([tool])+'"' : '')
		    })
        
        var items;
        try {
            items = Ext.decode(layoutString);
        } catch (e) {
            items = {region: 'center', html: '<div>Error constructing layout:'+e+'</div>'};
        }
        
        if (items == null) {
        	items = {region: 'center', html: '<div>Error: no layout information found.</div>'}
        }
        
        this.addBorderLayouts(items);

        this.on("add", function(custom, cmp) {
        	cmp.on("boxready", function(cmp) {
//        		cmp.query("panel").forEach(function(p) {
//        			custom;
////        			debugger
//        		})
        	})
        })
        this.add(items);
//        .on("boxready", function() {
//        	debugger
//            if (this.getCorpus()) { // we may have loaded the corpus after the layout, so refire the event
//            	this.getApplication().dispatchEvent("loadedCorpus", this.getApplication(), corpus);
//            }
//        })
        
	},
	
	addBorderLayouts: function(items) {
    	var size = Ext.getBody().getSize();
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (Ext.isString(item.width)) {
            	item.width = Math.round(size.width * parseInt(item.width) / 100);
            } else if (Ext.isString(item.height)) {
            	item.height = Math.round(size.height * parseInt(item.height) / 100);
            }
            if (item.items && item.items.length > 1) {
                item.layout = 'border';
                this.addBorderLayouts(item.items);
            } else {
                item.layout = 'fit';
            }
        }
	},
	
	initTableLayout: function() {
    	Ext.suspendLayouts();
    	
    	var tableLayout = this.getApiParam('tableLayout');
    	if (tableLayout && tableLayout.charAt(0)!="{" && tableLayout.charAt(0)!="[") {
    		var cells = [];
    		tableLayout.split(/,\s*/).forEach(function(cell) {
    			cells.push(/^"'/.test(cell) ? cell : '"'+cell+'"');
    		})
    		tableLayout = "["+cells.join(",")+"]"; // treat as simple comma-separated string
    	}
    	var layout = Ext.decode(tableLayout);
    	if (Ext.isArray(layout)) {
    		layout = {
        		cells: layout
        	}
    	}
    	if (!layout.numCols && layout.cells && Ext.isArray(layout.cells)) {
    		if (layout.cells.length < 3) {
    			layout.numCols = layout.cells.length;
    		} else if (layout.cells.length < 5) {
    			layout.numCols = Math.ceil(layout.cells.length / 2);
    		} else {
    			layout.numCols = Math.ceil(layout.cells.length / 3);
    		}
    	}
        if (layout.numCols != null && layout.cells && Ext.isArray(layout.cells)) {
        	var items = [];
        	for (var i = 0; i < layout.cells.length; i++) {
        		var cell = layout.cells[i];
        		if (Ext.isObject(cell)) {
            		items.push(cell);
        		} else if (Ext.isArray(cell)) {
        			var colspan = 1, rowspan = 1; xtype = undefined;
        			if (cell[0] && Ext.isNumber(cell[0])) {
        				colspan = cell[0];
        				cell.shift();
        			}
        			if (cell[0] && Ext.isString(cell[0])) {
        				xtype = cell[0];
        				cell.shift();
        			}
        			if (cell[0] && Ext.isNumber(cell[0])) {
        				rowspan = cell[0];
        			}
        			if (xtype) {
        				items.push({
        					colspan: colspan,
        					rowspan: rowspan,
        					xtype: xtype
        				})
        			}
        		} else if (Ext.isString(cell)) {
        			items.push({
        				xtype: cell,
        				colspan: 1,
        				rowspan: 1
        			})
        		}
        	}
        	
        	Ext.apply(this, {
        		layout: {
        			type: 'table',
        			width: '100%',
    				height: '100%',
        			columns: layout.numCols,
        			tableAttrs: {
            			style: {
            				width: '100%',
            				height: '100%'
            			}
            		},
            		tdAttrs: {
            			style: {
            				padding: '0px',
            				verticalAlign: 'top'
            			}
            		}
        		},
        		defaults: { // place holder values to ensure that the children are rendered
            		width: 10,
            		height: 10,
            		border: true
            	},
        		items: items
        	});
        } else {
        	this.showError("badTableLayoutDefinition")
        }
    	
    	Ext.resumeLayouts();		
	},
	doTableSizing: function(widthRatio, heightRatio) {
    	var sizeMap = {};
    	
    	var table = this.getTargetEl().down(".x-table-layout");
    	var rows = table.dom.rows;
    	for (var i=0; i<rows.length; i++) {
    		var cells = rows[i].cells;
    		for (var j=0; j<cells.length; j++) {
    			var cell = cells[j];
    			var cellEl = Ext.get(cell);
    			var panelEl = cellEl.down('.x-panel');
    			var cmpId = panelEl.id;
    			
    			var size;
    			if (widthRatio !== undefined && heightRatio !== undefined) {
    				size = panelEl.getSize(false);
    				size.width = size.width * widthRatio;
            		size.height = size.height * heightRatio;
            		// FIXME multiple resize calls gradually reduce size
    			} else {
    				size = cellEl.getSize(false);
    			}
    			
    			sizeMap[cmpId] = size;
    		}
    	}
    	
    	for (var id in sizeMap) {
    		var size = sizeMap[id];
    		Ext.getCmp(id).setSize(size);
    	}

    	this.updateLayout();
	}
})
Ext.define('Voyant.panel.WordTree', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.wordtree',
    statics: {
    	i18n: {
    	},
    	api: {
    		query: undefined,
    		docId: undefined,
    		docIndex: undefined,
    		stopList: 'auto',
    		context: 10,
    		limit: 5
    	},
		glyph: 'xf0e8@FontAwesome'
    },
    
    config: {
    	corpus: undefined,
    	tree: undefined,
    	kwicStore: undefined,
    	options: {xtype: 'stoplistoption'}
    },
    
    doubleClickDelay: 300,
    lastClick: 1,
    
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
        Ext.apply(this, {
    		title: this.localize('title'),
    		dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                enableOverflow: true,
                items: [{
                	xtype: 'querysearchfield'
                }]
    		}]
        });
        
        this.setKwicStore(Ext.create('Voyant.data.store.Contexts', {
        	parentPanel: this,
        	proxy: {
        		extraParams: {
                	stripTags: 'all'            			
        		}
        	},
        	listeners: {
        		load: function(store, records, success, operation) {
        			if (success) {
        				var prefix = [], hit = [], suffix = [], id = [];
        				for (var i = 0; i < records.length; i++) {
        					var r = records[i];
        					//prefix.push([r.getLeft().trim().replace(/\s+/g, ' ')]);
        					prefix.push(r.getLeft().trim().split(/\s+/));
        					hit.push(r.getMiddle());
        					//suffix.push([r.getRight().trim().replace(/\s+/g, ' ')]);
        					suffix.push(r.getRight().trim().split(/\s+/));
        					id.push(i);
        				}
        				var caseSensitive = false;
        				var fieldNames = ["token", "POS"];
        				var fieldDelim = "/";
        				var distinguishingFieldsArray = ["token", "POS"];
        				this.getTree().setupFromArrays(prefix, hit, suffix, id, caseSensitive, fieldNames, fieldDelim, distinguishingFieldsArray);
        				
        				if (!this.getTree().succeeded()) {
        					this.toastInfo({
       		    				html: this.localize("emptyText"),
       		    				align: 'bl'
       		    			});
        				}
        			}
        		},
        		scope: this
        	}
        }));
        
        this.on('loadedCorpus', function(src, corpus) {
        	this.setCorpus(corpus);
        	var corpusTerms = corpus.getCorpusTerms({autoLoad: false});
    		corpusTerms.load({
    		    callback: function(records, operation, success) {
    		    	if (success && records.length>0) {
    		    		var firstTerm = records[0].getTerm();
    		    		this.setRoot(firstTerm);
    		    	}
    		    },
    		    scope: this,
    		    params: {
    				limit: 1,
    				query: this.getApiParam('query'),
    				stopList: this.getApiParam('stopList')
    			}
        	});
        }, this);
        
        this.on('query', function(src, query) {
    		if (query !== undefined && query != '') {
    			this.setRoot(query);
    		}
        }, this);
        
        this.on('termsClicked', function(src, terms) {
        	var queryTerms = [];
    		terms.forEach(function(term) {
    			if (Ext.isString(term)) {queryTerms.push(term);}
    			else if (term.term) {queryTerms.push(term.term);}
    			else if (term.getTerm) {queryTerms.push(term.getTerm());}
    		});
    		this.setRoot(queryTerms);
		}, this);
        
        this.on('documentTermsClicked', function(src, terms) {
    		var queryTerms = [];
    		terms.forEach(function(term) {
    			if (term.getTerm()) {queryTerms.push(term.getTerm());}
    		});
    		this.setRoot(queryTerms);
    	}, this);
        
        this.on('resize', function(panel, width, height) {

		}, this);
        
        this.on('boxready', this.initGraph, this);
        
        this.callParent(arguments);
    },
        
    initGraph: function() {
    	var el = this.getLayout().getRenderTarget();
    	var w = el.getWidth();
    	var h = el.getHeight();
    	
    	var dt = new doubletree.DoubleTree();
    	dt.init('#'+el.getId())
    		.visWidth(w).visHeight(h)
    		.handlers({
    			click: this.clickHandler.bind(this)
    		});
    	
    	this.setTree(dt);
    	
    	// explicitly set dimensions
//    	el.setWidth(el.getWidth());
//    	el.setHeight(el.getHeight());
    },
    
    clickHandler: function(node) {
    	var now = new Date().getTime();
    	if (this.lastClick && now-this.lastClick<this.doubleClickDelay) {
    		this.lastClick=1;
    		var terms = [], parent = node;
        	while (parent != null) {
        		terms.push(parent.name);
        		parent = parent.parent;
        	}
        	this.getApplication().dispatchEvent('termsClicked', this, [terms.reverse().join(" ")]);
    	} else {
    		this.lastClick = now;
    	}
    },
    
//    doubleClickHandler: function(node) {
//// dispatch phrase click instead of recentering (which can be done with search)
////    	this.setRoot(node.name);
//    },
//    
    setRoot: function(query) {
    	this.setApiParam('query', this.stripPunctuation(query));
		this.getKwicStore().load({params: this.getApiParams()});
    },
    
    stripPunctuation: function(value) {
    	if (Ext.isString(value)) return value.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
    	else {
    		var values = [];
    		value.forEach(function(v) {
    			values.push(v.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ''));
    		});
    		return values;
    	}
    	return '';
    }
});


Ext.define('Voyant.VoyantApp', {
	
    extend: 'Ext.app.Application',
	mixins: ['Voyant.util.Deferrable','Voyant.util.Localization','Voyant.util.Api'],
	requires: ['Voyant.util.ResponseError'],
    
    name: 'VoyantApp',
    
    statics: {
    	i18n: {
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
		
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
		
		// call the parent constructor
        this.callParent(arguments);
        
    },
    
    getTools: function() {
    	return [{type: 'maximize'},{type: 'help'}]
    },
    
    launch: function() {
    	Ext.tip.QuickTipManager.init();
    	Ext.apply(Ext.tip.QuickTipManager.getQuickTip(), {
    	    showDelay: 50 // shorten the delay before showing
    	});
		this.callParent(arguments);
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
			// let the application know that we have an unhandledEvent
			var args = ["unhandledEvent", src, eventName];
			for (var i=2; i<arguments.length; i++) {args.push(arguments[i])}
			this.fireEvent.apply(this, args);
		}
    },
    
	showResponseError: function(config, response) {
		this.showError(Ext.create("Voyant.util.ResponseError", {msg: (Ext.isString(config) ? config : config.msg), response: response}))
	},
	
	showError: function(config) {
		if (config.statusText && config.responseText) {
			return this.showResponseError({}, config);
		}
		if (config instanceof Voyant.util.ResponseError) {
			var response = config.getResponse();
			Ext.apply(config, {
				message: config.getMsg()+" "+this.localize('serverResponseError')+
					"<pre class='error'>\n"+response.responseText.substring(0,response.responseText.indexOf("\n\t"))+"… "+
					"<a href='#' onclick=\"window.open('').document.write(unescape('<pre>"+escape(response.responseText)+"</pre>')); return false;\">more</a></pre>"
			})
		}
		if (Ext.isString(config)) {
			config = {message: config}
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
	 * @private
	 */
	colors: [[0, 0, 255], [51, 197, 51], [255, 0, 255], [121, 51, 255], [28, 255, 255], [255, 174, 0], [30, 177, 255], [182, 242, 58], [255, 0, 164], [51, 102, 153], [34, 111, 52], [155, 20, 104], [109, 43, 157], [128, 130, 33], [111, 76, 10], [119, 115, 165], [61, 177, 169], [202, 135, 115], [194, 169, 204], [181, 212, 228], [182, 197, 174], [255, 197, 197], [228, 200, 124], [197, 179, 159]],
	
	rgbToHex: function(a) {
		return "#" + ((1 << 24) + (a[0] << 16) + (a[1] << 8) + a[2]).toString(16).slice(1);
	},
	
	/**
	 * Gets the whole color palette.
	 * @param {Boolean} [returnHex] True to return a hexadecimal representation of each color (optional, defaults to rgb values).
	 * @return {Array} The color palette.
	 * @private
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
	 * @private
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
	 * @private
	 */
	colorTermAssociations: new Ext.util.MixedCollection(),
	
	/**
	 * Gets the color associated with the term.  Creates a new association if none exists.
	 * @param {String} term The term to get the color for.
	 * @param {Boolean} [returnHex] True to return a hexadecimal representation of the color (optional, defaults to rgb values).
	 * @return {Mixed} The requested color, either a hex string or array of rgb values.
	 * @private
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
	},

	/**
	 * Opens a URL in a new window (handling the case when popup windows aren't allowed).
	 * @param {String} url The URL to open.
	 * @private
	 */
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
	}

    
});
Ext.define('Voyant.VoyantCorpusApp', {
	
    extend: 'Voyant.VoyantApp',
    
    name: 'VoyantCorpusApp',

    requires: ['Voyant.panel.CorpusSet','Voyant.data.model.Corpus','Voyant.panel.VoyantHeader', 'Voyant.panel.VoyantFooter', 'Voyant.panel.CorpusCreator', 'Voyant.panel.Cirrus', 'Voyant.panel.Summary', 'Voyant.panel.CorpusTerms', 'Voyant.panel.Reader', 'Voyant.panel.Documents', 'Voyant.panel.Trends', 'Voyant.panel.Contexts', 'Voyant.panel.DocumentTerms','Voyant.panel.CorpusCollocates','Voyant.panel.CollocatesGraph','Voyant.panel.Phrases','Voyant.panel.ScatterPlot','Voyant.panel.TopicContexts','Voyant.panel.TermsRadio'],
    
    statics: {
    	i18n: {
    	}
    },
    
	constructor: function() {
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
        this.callParent(arguments);
	},
	
    config: {
    	corpus: undefined,
    	moreTools: [{
			i18n: 'moreToolsScaleCorpus',
			glyph: 'xf065@FontAwesome',
			items: ['cirrus','corpusterms','bubblelines','corpuscollocates','microsearch','streamgraph','phrases','documents','summary','trends','scatterplot','termsradio','wordtree']
    	},{
			i18n: 'moreToolsScaleDocument',
			glyph: 'xf066@FontAwesome',
			items: ['bubbles','cirrus','contexts','documentterms','reader','textualarc','trends','knots']
    	},{
			i18n: 'moreToolsTypeViz',
			glyph: 'xf06e@FontAwesome',
			items: ['cirrus','bubblelines','bubbles','collocatesgraph','knots','microsearch','streamgraph','scatterplot','textualarc','trends','termsradio','wordtree']
		},{
			i18n: 'moreToolsTypeGrid',
			glyph: 'xf0ce@FontAwesome',
			items: ['corpusterms','corpuscollocates','phrases','contexts','documentterms','documents']
		},{
			i18n: 'moreToolsTypeOther',
			glyph: 'xf035@FontAwesome',
			items: ['reader','summary']
    	}]
    },
    
    launch: function() {
		this.callParent(arguments);

    	if (this.hasQueryToLoad()) {
        	var queryParams = Ext.Object.fromQueryString(document.location.search);
        	if (!queryParams.corpus && this.getCorpusId && this.getCorpusId()) {
        		queryParams.corpus = this.getCorpusId();
        	}
        	this.loadCorpusFromParams(queryParams)
    	}
    },
    
    loadCorpusFromParams: function(params) {
		var me = this;
		var view = me.getViewport()
		view.mask(this.localize("fetchingCorpus"));
		if (params.archive) { // fix a few URLs we know about
			if (Ext.isString(params.archive)) {params.archive=[params.archive]}
			params.archive = params.archive.map(function(archive) {
				return archive.replace('/blogs.sub.uni-hamburg.de/hup/lhn/', '/wikis.sub.uni-hamburg.de/lhn/index.php/')
					.replace('/hup.sub.uni-hamburg.de/', '/wikis.sub.uni-hamburg.de/')
			})
		}
		
		this.validateCorpusLoadParams(params);

		new Voyant.data.model.Corpus(params).then(function(corpus) {
			view.unmask();
			me.setCorpus(corpus);
			if (me.validateCorpusAccess()) {
				me.dispatchEvent('loadedCorpus', this, corpus);
			}
		}).otherwise(function() {
			view.unmask();
		})
    },
    
    validateCorpusLoadParams: function(params) {
    	// leave untouched by default, this can be overridden
    },
    
    validateCorpusAccess: function() {
		var me = this, view = me.getViewport(), corpus = this.getCorpus();
		if (corpus && corpus.requiresPassword() && !me.getViewport().query("panel").every(function(panel) {
			return !panel.isConsumptive
		})) {
			var noPasswordAccess = corpus.getNoPasswordAccess();
			var buttons = [
			       { text: 'Validate' }
			]
			if (noPasswordAccess=='NONCONSUMPTIVE') {
				buttons.push({text: 'Limited'})
			}
			var passWin = Ext.create('Ext.window.Window', {
	            title: me.localize('passwordRequiredTitle'),
			    layout: 'fit',
			    items: {
			    	padding: 10,
	                flex: 1,
	                width: 300,
	                layout: {
	                    type: 'vbox',
	                    align: 'stretch'
	                },
	                items: [
	                    {
	                        html: '<p>'+me.localize('passwordRequiredMessage')+'</p>' + (noPasswordAccess=='NONCONSUMPTIVE' ? '<p>'+me.localize('nonConsumptiveMessage')+"</p>" : "")+'</p>'
	                    },{
	                    	xtype: 'textfield',
	                    	fieldLabel: me.localize('password')
	                    }
	                ],
	                bbar: {
	//                	ui: 'footer',
	                	layout: {pack: 'center'},
	                	items: [{
	                    	text: me.localize('passwordValidateButton'),
	                    	ui: 'default',
	                    	handler: function() {
	                    		var password = passWin.query("textfield")[0].getValue().trim();
	                    		if (password.length==0) {
	                    			me.showError({
	                    				message: me.localize('noPasswordGiven')
	                    			})
	                    			return;
	                    		}
	                    		passWin.mask();
	                    		Ext.Ajax.request({
	                    			  url: me.getTromboneUrl(),
	                    			  params: {
	                    				  corpus: corpus.getId(),
	                    				  passwordForSession: password
	                    			  },
	                    			  method: 'POST',
	                    			  success: function(result, request) {
	                    				  passWin.unmask();
	                    				  var access = result.responseText;
	                    				  if (access=="ADMIN" || access=="ACCESS") {
			                    			    passWin.close();
			                    			    view.unmask();
					            				me.dispatchEvent('loadedCorpus', this, corpus);
	                    				  }
	                    				  else {
	  		                    			me.showError({
			                    				message: me.localize('badPassword')
			                    			})
	                    				  }
	                    			  },
	                    			  failure: function(result, request) {
	                    				  passWin.unmask();
	  		                    			me.showError({
			                    				message: me.localize('passwordValidationError')
			                    			})
	                    			  } 
	                    		});
	                    	}
	                    },{
	                    	text: me.localize('nonConsumptiveButton'),
	                    	handler: function() {
	                    		passWin.mask();
	                    		Ext.Ajax.request({
	                    			  url: me.getTromboneUrl(),
	                    			  params: {
	                    				  corpus: corpus.getId(),
	                    				  passwordForSessionRemove: true
	                    			  },
	                    			  method: 'POST',
	                    			  callback: function(result, request) { // do this even if request fails
	                    				  passWin.unmask();
	                    				  passWin.close();
	                    				  view.unmask();
	                    				  me.dispatchEvent('loadedCorpus', me, corpus);
	                    			  }
	                    		});
	                    	}
	                    }]
	                }
	            }
			}).show();
			return false;
		} else {
			return true
		}
    },
    
    hasQueryToLoad: function(params) {
    	if (!params) {
    		params = Ext.Object.fromQueryString(document.location.search);
    	}
    	return params.corpus || params.input || (this.getCorpusId && this.getCorpusId()); // TODO: should this include "archive" from V1?
    },
    
    listeners: {
    	loadedCorpus: function(src, corpus) {
    		this.setCorpus(corpus);
    		this.on("unhandledEvent", function(src, eventName, data) {
				var url = this.getBaseUrl() + '?corpus='+corpus.getId();
				var api = this.getModifiedApiParams() || {}; // use application, not tool
				delete api.view; // make sure we show default view
				if (eventName=='termsClicked') {
					api.query=data;
				}
				else if (eventName=='documentsClicked') {
					var docIndex = [];
					if (data.forEach) {
						data.forEach(function(doc) {
							docIndex.push(doc.getIndex())
						})
					}
					api.docIndex=docIndex
				}
				else if (eventName=='corpusTermsClicked') {
					if (data.map) {
						api.query = data.map(function(corpusTerm) {return corpusTerm.getTerm()});
					}
				}
				else if (eventName=='documentTermsClicked') {
					if (data.map) {
						api.query = data.map(function(documentTerm) {return documentTerm.getTerm()});
						api.docIndex = data.map(function(documentTerm) {return documentTerm.getDocIndex()});
					}
				}
				else {
					if (console) {console.warn("Unhandled event: "+eventName, data)}
					return;
				}
				url += "&"+Ext.Object.toQueryString(api)
				this.openUrl(url)
			})
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
		},
		api: {
			view: 'corpusset',
			stopList: 'auto',
			panels: undefined,
			rtl: undefined
		}
	},
	
	listeners: {
    	loadedCorpus: function(src, corpus) {
    		this.viewport.down('voyantheader').collapse();
    		this.viewport.down('#toolsContainer').setActiveItem(1);
    		var corpusId = this.getCorpusId && this.getCorpusId() ? this.getCorpusId() : undefined;
    		if (window.history.pushState && !corpusId) {
    			// add the corpusId to the url
    			var corpusId = corpus.getAliasOrId();
        		var queryParams = Ext.Object.fromQueryString(document.location.search);
        		
    			var url = this.getBaseUrl()+'?corpus='+corpusId;
    			for (var key in queryParams) {
    				if (key !== 'corpus') {
    					var vals = Ext.isString(queryParams[key]) ? [queryParams[key]] : queryParams[key];
    					if (Ext.isArray(vals)) {
    						vals.forEach(function(val) {
    	    					url += '&'+key+'='+val;
    						})
    					}
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
		var queryParams = Ext.Object.fromQueryString(document.location.search) || {};
		var view = this.getApiParam('view', 'CorpusSet');
		var xtype = view.toLowerCase();
		if (!Ext.ClassManager.getByAlias("widget."+xtype) || queryParams.noskin) {
			Ext.Msg.show({
			    title: this.localize('noViewErrorTitle'),
			    message: new Ext.Template(this.localize(queryParams.noskin ? 'noViewKnownErrorTpl' : 'noViewErrorTpl')).apply({
			    	view: queryParams.noskin ? queryParams.noskin : view,
			    	additional: queryParams.noskin && queryParams.noskin == 'convert' ? this.localize(queryParams.noskin+'SkinMsg') : ''
			    }),
			    buttons: Ext.Msg.OK,
			    icon: Ext.Msg.ERROR
			});
			xtype = 'corpusset'; // switch to default view
		}
		var SPLIT_SIZE = 5;
		this.viewport = Ext.create('Ext.container.Viewport', {
		    layout: 'border',
		    rtl: this.getApiParam('rtl')!==undefined,
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
						type: 'vbox',
						pack: 'center',
						align: 'center'
					},
					items: [{
						xtype: 'corpuscreator'
					},{
						xtype: 'container',
						width: 800,
						html: "<div style='font-style: italic; text-align: center; margin-top: 10px;'><div>"+this.localize('voyantIs')+"</div>" + (this.localize('translatedBy').indexOf("English") == -1 ? "<div>"+this.localize('translatedBy')+"</div>" : "")
					}]	
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
