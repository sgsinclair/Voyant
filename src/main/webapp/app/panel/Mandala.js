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
                overflowHandler: 'scroller',
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
	                	beforedestroy: function(cmp) {
	                		Ext.tip.QuickTipManager.unregister(cmp.getEl());
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
    	var me = this, currentTerms = Ext.Array.from(me.getApiParam('query'));
		Ext.create('Ext.window.Window', {
			title: this.localize("EditMagnet"),
			modal: true,
			items: {
				xtype: 'form',
				width: 300,
				items: [{
					xtype: 'querysearchfield',
					corpus: this.getCorpus(),
					store: this.getCorpus().getCorpusTerms({
						proxy: {
							extraParams: {
								stopList: this.getApiParam('stopList')
							}
						}
					}),
					stopList: this.getApiParam('stopList'),
					listeners: {
						afterrender: function(field) {
							if (term) {
								var termObj = new Ext.create("Voyant.data.model.CorpusTerm", {
									term: term
								});
								field.getStore().loadData(termObj, true)
								field.setValue(termObj);
							}
						}
					}
				},{
					xtype: "numberfield",
				    fieldLabel: 'rotate clockwise',
				    minValue: 0,
				    maxValue: currentTerms.length-1,
				    value: 0,
				    stepValue: 1,
				    width: 200,
				    name: "rotate"
				}],
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
	        			var val = btn.up('window').down('querysearchfield').getValue().join("|")
	        			if (val) {

	        				// start by updating the term in place
		        			var position = -1;
		        			for (var i=0; i<currentTerms.length; i++) {
		        				if (term==currentTerms[i]) {
		        					position=i;
		        					currentTerms[i]=val;
		        					
				        			// see if we need to shift
				        			var rotate = btn.up('window').down('numberfield').getValue();
				        			if (rotate) {
				        				currentTerms.splice(i, 1);
				        				var newpos = i+rotate;
				        				if (newpos>currentTerms.length) {newpos-=currentTerms.length+1;}
				        				currentTerms.splice(newpos, 0, val);
				        			}
				        			break
				        			
		        				}
		        			}
		        			if (position==-1) { // not sure why it couldn't be found
		        				currentTerms.push(val);
		        			}		        			
	        			}
	        			
	        			me.setApiParam('query', currentTerms);
	        			me.updateFromQueries(currentTerms.length==0);
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
        		    	var magnets = {};
        		    	for (var i=0, len=records.length; i<len; i++) {
        		    		var term = records[i].getTerm();
        		    		records[i].getDistributions().forEach(function(val, i) {
        		    			if (val>0) {
        		    				this.documents[i].matches.push(term)
        		    			}
        		    		}, this);
        		    		magnets[term] = {
        		    			record: records[i],
        		    			colour: this.getApplication().getColor(i),
        		    			width: ctx.measureText(term).width,
        		    			isHovering: false
        		    		}
        		    	}

        		    	this.magnets = {};
        		    	
        		    	// try ordering by queries
        		    	queries.forEach(function(query) {
        		    		if (magnets[query]) {
            		    		this.magnets[query] = magnets[query]
            		    		delete magnets[query]
        		    		}
        		    	}, this);
        		    	
        		    	// now for any leftovers
        		    	for (term in magnets) {
        		    		this.magnets[term] = magnets[term]
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