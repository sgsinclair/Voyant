 Ext.define('Voyant.panel.Trends', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	requires: ['Ext.chart.CartesianChart','Voyant.data.store.Documents'],

	alias: 'widget.trends',
	config: {
    	options: [{xtype: 'stoplistoption'},{xtype: 'colorpaletteoption'}],
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
    			colors: [this.getApplication().getColorForTerm(term, true)],
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
        		increment: 1,
        		fields: ['index'],
        		title: {
            		text: this.localize(mode==this.MODE_DOCUMENT ? 'segments' : 'documents')
        		},
                label: {
                    rotate:{degrees:-30}
//                    textAlign: 'end'
//                    textBaseline: 'middle'

               },
        		renderer: function(axis, label) {
        			if (mode==me.MODE_DOCUMENT) {
        				return parseInt(label)+1;
        			} else {
        				var doc = me.getCorpus().getDocument(label);
        				if (doc) {
        					var height = me.getTargetEl().getHeight();
        					if (height<250) {return parseInt(label)+1;}
        					else if (height<500) {return doc.getTinyTitle();}
        					else {return doc.getShortTitle();}
        				} else {
        					return "?";
        				}
//        				return doc ? (me.getTargetEl().getHeight() < 400 ? doc.getTinyTitle() : doc.getTitle()) : '?';
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
 
/* We override this entirely beastly function to allow for all x axis labels to be shown (this may impact other charts in other tools) */
 Ext.override(Ext.chart.axis.sprite.Axis, {
	 renderLabels: function (surface, ctx, layoutContext, clipRect) {
	        var me = this,
	            attr = me.attr,
	            halfLineWidth = 0.5 * attr.lineWidth,
	            docked = attr.position,
	            matrix = attr.matrix,
	            textPadding = attr.textPadding,
	            xx = matrix.getXX(),
	            dx = matrix.getDX(),
	            yy = matrix.getYY(),
	            dy = matrix.getDY(),
	            thickness = 0,
	            majorTicks = layoutContext.majorTicks,
	            tickPadding = Math.max(attr.majorTickSize, attr.minorTickSize) + attr.lineWidth,
	            isBBoxIntersect = Ext.draw.Draw.isBBoxIntersect,
	            label = me.getLabel(), font, labelOffset,
	            lastLabelText = null,
	            textSize = 0, textCount = 0,
	            segmenter = layoutContext.segmenter,
	            renderer = me.getRenderer(),
	            axis = me.getAxis(),
	            title = axis.getTitle(),
	            titleBBox = title && title.attr.text !== '' && title.getBBox(),
	            labelInverseMatrix, lastBBox = null, bbox, fly, text, titlePadding,
	            translation;

	        if (majorTicks && label && !label.attr.hidden) {
	            font = label.attr.font;
	            if (ctx.font !== font) {
	                ctx.font = font;
	            } // This can profoundly improve performance. 
	            label.setAttributes({translationX: 0, translationY: 0}, true);
	            label.applyTransformations();
	            labelInverseMatrix = label.attr.inverseMatrix.elements.slice(0);
	            switch (docked) {
	                case 'left':
	                    titlePadding = titleBBox ? titleBBox.x + titleBBox.width : 0;
	                    switch (label.attr.textAlign) {
	                        case 'start':
	                            translation = surface.roundPixel(titlePadding + dx) - halfLineWidth;
	                            break;
	                        case 'end':
	                            translation = surface.roundPixel(clipRect[2] - tickPadding + dx) - halfLineWidth;
	                            break;
	                        default: // 'center' 
	                            translation = surface.roundPixel(titlePadding + (clipRect[2] - titlePadding - tickPadding) / 2 + dx) - halfLineWidth;
	                    }
	                    label.setAttributes({
	                        translationX: translation
	                    }, true);
	                    break;
	                case 'right':
	                    titlePadding = titleBBox ? clipRect[2] - titleBBox.x : 0;
	                    switch (label.attr.textAlign) {
	                        case 'start':
	                            translation = surface.roundPixel(tickPadding + dx) + halfLineWidth;
	                            break;
	                        case 'end':
	                            translation = surface.roundPixel(clipRect[2] - titlePadding + dx) + halfLineWidth;
	                            break;
	                        default: // 'center' 
	                            translation = surface.roundPixel(tickPadding + (clipRect[2] - tickPadding - titlePadding) / 2 + dx) + halfLineWidth;
	                    }
	                    label.setAttributes({
	                        translationX: translation
	                    }, true);
	                    break;
	                case 'top':
	                    titlePadding = titleBBox ? titleBBox.y + titleBBox.height: 0;
	                    label.setAttributes({
	                        translationY: surface.roundPixel(titlePadding + (clipRect[3] - titlePadding - tickPadding) / 2) - halfLineWidth
	                    }, true);
	                    break;
	                case 'bottom':
	                    titlePadding = titleBBox ? clipRect[3] - titleBBox.y : 0;
	                    label.setAttributes({
	                        translationY: surface.roundPixel(tickPadding + (clipRect[3] - tickPadding - titlePadding) / 2) + halfLineWidth
	                    }, true);
	                    break;
	                case 'radial' :
	                    label.setAttributes({
	                        translationX: attr.centerX
	                    }, true);
	                    break;
	                case 'angular':
	                    label.setAttributes({
	                        translationY: attr.centerY
	                    }, true);
	                    break;
	                case 'gauge':
	                    label.setAttributes({
	                        translationY: attr.centerY
	                    }, true);
	                    break;
	            }
	 
	            // TODO: there are better ways to detect collision. 
	            if (docked === 'left' || docked === 'right') {
	                me.iterate(majorTicks, function (position, labelText, i) {
	                    if (labelText === undefined) {
	                        return;
	                    }
	                    if (renderer) {
	                        text = Ext.callback(renderer, null,
	                            [axis, labelText, layoutContext, lastLabelText], 0, axis);
	                    } else {
	                        text = segmenter.renderer(labelText, layoutContext, lastLabelText);
	                    }
	                    lastLabelText = labelText;
	                    label.setAttributes({
	                        text: String(text),
	                        translationY: surface.roundPixel(position * yy + dy)
	                    }, true);
	                    label.applyTransformations();
	                    thickness = Math.max(thickness, label.getBBox().width + tickPadding);
	                    if (thickness <= me.thickness) {
	                        fly = Ext.draw.Matrix.fly(label.attr.matrix.elements.slice(0));
	                        bbox = fly.prepend.apply(fly, labelInverseMatrix).transformBBox(
	                            label.getBBox(true)
	                        );
	                        if (lastBBox && !isBBoxIntersect(bbox, lastBBox, textPadding)) {
	                            return;
	                        }
	                        surface.renderSprite(label);
	                        lastBBox = bbox;
	                        textSize += bbox.height;
	                        textCount++;
	                    }
	                });
	            } else if (docked === 'top' || docked === 'bottom') {
	                me.iterate(majorTicks, function (position, labelText, i) {
	                    if (labelText === undefined) {
	                        return;
	                    }
	                    if (renderer) {
	                        text = Ext.callback(renderer, null,
	                            [axis, labelText, layoutContext, lastLabelText], 0, axis);
	                    } else {
	                        text = segmenter.renderer(labelText, layoutContext, lastLabelText);
	                    }
	                    lastLabelText = labelText;
	                    label.setAttributes({
	                        text: String(text),
	                        translationX: surface.roundPixel(position * xx + dx)
	                    }, true);
	                    label.applyTransformations();
	                    thickness = Math.max(thickness, label.getBBox().height + tickPadding);
	                    if (thickness <= me.thickness) {
	                        fly = Ext.draw.Matrix.fly(label.attr.matrix.elements.slice(0));
	                        bbox = fly.prepend.apply(fly, labelInverseMatrix).transformBBox(label.getBBox(true));
	                        if (lastBBox && !isBBoxIntersect(bbox, lastBBox, textPadding)) {
/* THIS SHOULD BE AN OPTION OF SOME KIND, BUT FOR NOW, AVOID SKIPPING (missing labels are no less useful than dense labels) */
//	                            return;
	                        }
	                        surface.renderSprite(label);
	                        lastBBox = bbox;
	                        textSize += bbox.width;
	                        textCount++;
	                    }
	                });
	            } else if (docked === 'radial') {
	                me.iterate(majorTicks, function (position, labelText, i) {
	                    if (labelText === undefined) {
	                        return;
	                    }
	                    if (renderer) {
	                        text = Ext.callback(renderer, null,
	                            [axis, labelText, layoutContext, lastLabelText], 0, axis);
	                    } else {
	                        text = segmenter.renderer(labelText, layoutContext, lastLabelText);
	                    }
	                    lastLabelText = labelText;
	                    if (typeof text !== 'undefined') {
	                        label.setAttributes({
	                            text: String(text),
	                            translationX: attr.centerX - surface.roundPixel(position) /
	                            attr.max * attr.length * Math.cos(attr.baseRotation + Math.PI / 2),
	                            translationY: attr.centerY - surface.roundPixel(position) /
	                            attr.max * attr.length * Math.sin(attr.baseRotation + Math.PI / 2)
	                        }, true);
	                        label.applyTransformations();
	                        bbox = label.attr.matrix.transformBBox(label.getBBox(true));
	                        if (lastBBox && !isBBoxIntersect(bbox, lastBBox)) {
	                            return;
	                        }
	                        surface.renderSprite(label);
	                        lastBBox = bbox;
	                        textSize += bbox.width;
	                        textCount++;
	                    }
	                });
	            } else if (docked === 'angular') {
	                labelOffset = attr.majorTickSize + attr.lineWidth * 0.5 + (parseInt(label.attr.fontSize, 10) || 10) / 2;
	                me.iterate(majorTicks, function (position, labelText, i) {
	                    if (labelText === undefined) {
	                        return;
	                    }
	                    if (renderer) {
	                        text = Ext.callback(renderer, null,
	                            [axis, labelText, layoutContext, lastLabelText], 0, axis);
	                    } else {
	                        text = segmenter.renderer(labelText, layoutContext, lastLabelText);
	                    }
	                    lastLabelText = labelText;
	                    thickness = Math.max(thickness,
	                        Math.max(attr.majorTickSize, attr.minorTickSize) +
	                        (attr.lineCap !== 'butt' ? attr.lineWidth * 0.5 : 0)
	                    );
	                    if (typeof text !== 'undefined') {
	                        var angle = position / (attr.max + 1) * Math.PI * 2 + attr.baseRotation;
	                        label.setAttributes({
	                            text: String(text),
	                            translationX: attr.centerX + (attr.length + labelOffset) * Math.cos(angle),
	                            translationY: attr.centerY + (attr.length + labelOffset) * Math.sin(angle)
	                        }, true);
	                        label.applyTransformations();
	                        bbox = label.attr.matrix.transformBBox(label.getBBox(true));
	                        if (lastBBox && !isBBoxIntersect(bbox, lastBBox)) {
	                            return;
	                        }
	                        surface.renderSprite(label);
	                        lastBBox = bbox;
	                        textSize += bbox.width;
	                        textCount++;
	                    }
	                });
	            } else if (docked === 'gauge') {
	                var gaugeAngles = me.getGaugeAngles();
	                me.iterate(majorTicks, function (position, labelText, i) {
	                    if (labelText === undefined) {
	                        return;
	                    }
	                    if (renderer) {
	                        text = Ext.callback(renderer, null,
	                            [axis, labelText, layoutContext, lastLabelText], 0, axis);
	                    } else {
	                        text = segmenter.renderer(labelText, layoutContext, lastLabelText);
	                    }
	                    lastLabelText = labelText;
	 
	                    if (typeof text !== 'undefined') {
	                        var angle = (position - attr.min) / (attr.max - attr.min + 1) * attr.totalAngle -
	                            attr.totalAngle + gaugeAngles.start;
	                        label.setAttributes({
	                            text: String(text),
	                            translationX: attr.centerX + (attr.length + 10) * Math.cos(angle),
	                            translationY: attr.centerY + (attr.length + 10) * Math.sin(angle)
	                        }, true);
	                        label.applyTransformations();
	                        bbox = label.attr.matrix.transformBBox(label.getBBox(true));
	                        if (lastBBox && !isBBoxIntersect(bbox, lastBBox)) {
	                            return;
	                        }
	                        surface.renderSprite(label);
	                        lastBBox = bbox;
	                        textSize += bbox.width;
	                        textCount++;
	                    }
	                });
	            }
	 
	            if (attr.enlargeEstStepSizeByText && textCount) {
	                textSize /= textCount;
	                textSize += tickPadding;
	                textSize *= 2;
	                if (attr.estStepSize < textSize) {
	                    attr.estStepSize = textSize;
	                }
	            }
	 
	            if (Math.abs(me.thickness - (thickness)) > 1) {
	                me.thickness = thickness;
	                attr.bbox.plain.dirty = true;
	                attr.bbox.transform.dirty = true;
	                me.doThicknessChanged();
	                return false;
	            }
	        }
	    }
 });