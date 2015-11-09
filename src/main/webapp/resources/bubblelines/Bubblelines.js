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
			container.updateLayout();
			this.initialized = true;
		}
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