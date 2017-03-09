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
	    			});
	    			this.on('beforedestroy', function(cmp) {
                		Ext.tip.QuickTipManager.unregister(cmp.getEl());
                	});
	    			this.callParent(arguments);
	    		},
	    		fieldLabel: 'minRawFreq'
    		}
    	}],
    	perim: [],
    	diam: undefined
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
	                	beforedestroy: function(cmp) {
	                		Ext.tip.QuickTipManager.unregister(cmp.getEl());
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
			var canvas = this.getTargetEl().dom.querySelector("canvas");
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
			this.loadDocument();
    	}, this);
    	
    	this.on("documentselected", function(src, doc) {
    		this.setApiParam('docIndex', this.getCorpus().getDocument(doc).getIndex());
    		this.loadDocument();
    	});
    	
    	this.on("resize", function() {
    		var gutter = 20,
			availableWidth = this.getTargetEl().getWidth() - gutter - gutter,
			availableHeight = this.getTargetEl().getHeight() - gutter - gutter,
			diam = Math.max(availableWidth, availableHeight), rad = diam /2,
			ratio = Math.min(availableWidth, availableHeight) / diam,
			canvas = this.getTargetEl().dom.querySelector("canvas");
    		
			canvas.width = this.getTargetEl().getWidth();
			canvas.height = this.getTargetEl().getHeight();
			this.setDiam(diam);
			this.setPerim([]);
			var i = parseInt(diam*.75)
			while (this.getPerim().length<diam) {
	    		this.getPerim().push({
	    			x:  gutter+(availableWidth/2)+(rad * (availableWidth>availableHeight ? 1 : ratio) * Math.cos(2 * Math.PI * i / diam)),
	    			y:  gutter+(availableHeight/2)+(rad * (availableHeight>availableWidth ? 1 : ratio) * Math.sin(2 * Math.PI * i / diam))
	    		})
	    		if (i++==diam) {i=0;}
			}
			
			// TODO clear previous/current drawing
    	})
    },
    
    draw: function(canvas, ctx) {
    	canvas = canvas ||  this.getTargetEl().dom.querySelector("canvas");
    	ctx = ctx || canvas.getContext("2d");
    	ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.fillStyle = "rgba(0,0,0,.1)";
    	this.getPerim().forEach(function(p,i) {
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
    		var current = parseInt(this.readingIndex * this.getPerim().length / this.lastToken);
    		ctx.fillStyle = "purple";
    		ctx.fillRect(this.getPerim()[current].x,this.getPerim()[current].y, 5, 5)
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
    	if (this.documentTerms && this.getPerim().length > 0) {
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
    	    			if (d>0 && this.getPerim()[i]) {
    	    				ctx.beginPath();
    	    				ctx.moveTo(x, y);
    	    				ctx.lineTo(this.getPerim()[i].x,this.getPerim()[i].y);
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
    				bins: this.getDiam(),
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
            				x += (this.getPerim()[i].x*d);
            				y += (this.getPerim()[i].y*d);
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
        				// TODO
//        				if (this.getApiParam('speed') > 0) {
	        				this.isReading = true;
	        				this.read(0);
//        				}
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