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
}


Knots.prototype = {
	constructor: Knots,
	
	initializeCanvas: function() {
		var container = this.container;
		var height = container.getHeight();
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
	
	buildGraph: function(drawStep) {
		if (this.intervalId != null) {
			this.progDrawDone = false;
			clearInterval(this.intervalId);
		}

		this.originOpacity = 1;
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
		
		if (!this.progressiveDraw) {
			this.doDraw(false, includeLegend);
		} else {
			this.intervalId = setInterval(this.doDraw.createDelegate(this, [includeLegend]), 50);
		}
	},
	
	doDraw: function(includeLegend) {
		var time = new Date().getTime();
		if (time - this.lastDrawTime >= this.refreshInterval) {
			this.clearCanvas();
			
			this.ctx.save();
			this.ctx.translate(this.offset.x, this.offset.y);
			
			this.drawDocument(this.currentDoc);
			
			// origin
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
				} else {
					this.drawStep++;
				}
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
					} else {
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
		delete this.currentDoc.terms[term];
		this.recache();
	},
	
	removeAllTerms: function() {
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
		
		for (var term in this.currentDoc.terms) {
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