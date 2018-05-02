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
    		categories: undefined,
    		whiteList: undefined, // specify a list of words to use
    		limit: 500,
    		visible: 50,
    		terms: undefined,
    		docId: undefined,
    		docIndex: undefined,
    		
    		inlineData: undefined, // format should match CorpusTerm model, only term and rawFreq required

    		fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif',
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
	    		xtype: 'listeditor',
	    		name: 'whiteList'
    	    },
    	    {xtype: 'categoriesoption'},
//    	    {
//    	    	// TODO this field does nothing
//    	        xtype: 'numberfield',
//    	        name: 'label',
//    	        fieldLabel: 'Max words',
//    	        labelAlign: 'right',
//    	        value: 500,
//    	        minValue: 50,
//    	        step: 50,
//    	        listeners: {
//        	        afterrender: function(field) {
//        	        	var win = field.up("window");
//        	        	if (win && win.panel) {field.setFieldLabel(win.panel.localize("maxTerms"))}
//        	        }
//    	        }
//    	    },
    	    {xtype: 'fontfamilyoption'},
    	    {xtype: 'colorpaletteoption'}

    	],
    	records: undefined,
    	terms: undefined,
    	cirrusId: undefined,
    	visLayout: undefined, // cloud layout algorithm
    	vis: undefined, // actual vis
    	tip: undefined,
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
    	
    	this.getApplication().addFeature('orientation', function() { return ~~(Math.random() * 2) * 90; });
    	
    	this.setCirrusId(Ext.id(null, 'cirrus_'));
    },
    
    initComponent: function (config) {
    	Ext.apply(this, {
    		title: this.localize('title'),
    		dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
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
    	boxready: function() {
			this.initVisLayout(); // force in case we've changed fontFamily from options

			var dataString = this.getApiParam('inlineData');
        	if (dataString !== undefined) {
        		if (dataString.charAt(0)=="[") {
            		var jsonData = Ext.decode(dataString, true);
        		} else {
        			if (dataString.indexOf(":")>-1) {
        				jsonData = [];
        				dataString.split(",").forEach(function(term) {
        					parts = term.split(":");
        					jsonData.push({
        						text: parts[0],
        						rawFreq: parseInt(parts[1])
        					})
        				})
        			} else {
        				var terms = {}
        				jsonData = [];
        				dataString.split(",").forEach(function(term) {
        					if (term in terms) {
        						terms[term]++;
        					} else {
        						terms[term] = 1;
        					}
        				});
        				for (term in terms) {
        					jsonData.push({
        						text: term,
        						rawFreq: terms[term]
        					})
        				}
        			}
        		}
        		if (jsonData !== null && jsonData.length>0) {
        			this.setApiParam('inlineData', jsonData);
	        	    this.setTerms(jsonData);
	        	    this.buildFromTerms();
        		}
        	}
    	},
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
    		this.initVisLayout(); // force in case we've changed fontFamily from options
    		if (this.getApiParam("docIndex")) {
    			this.fireEvent("documentSelected", this, corpus.getDocument(this.getApiParam("docIndex")));
    		} else if (this.getApiParam("docId")) {
    			this.fireEvent("documentSelected", this, corpus.getDocument(this.getApiParam("docId")));
    		} else {
        		this.loadFromCorpus(corpus);
    		}
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
    	}
    },
    
    loadFromCorpus: function(corpus) {
    	var jsonData = this.getApiParam('inlineData');
    	if (jsonData === undefined) {
			this.setApiParams({docId: undefined, docIndex: undefined});
			this.loadFromCorpusTerms(corpus.getCorpusTerms({autoload: false, pageSize: this.getApiParam("maxVisible"), parentPanel: this}));
    	} else {
    		// if (jsonData !== undefined) {
    		// 	var records = [];
    		// 	for (var i = 0; i < jsonData.length; i++) {
			// 		var wordData = jsonData[i];
			// 		wordData.term = wordData.text; // inlineData/CorpusTerm format mismatch
    		// 		var record = Ext.create('Voyant.data.model.CorpusTerm', wordData);
    		// 		records.push(record);
    		// 	}
    		// 	this.setRecords(records);
    		// 	this.setMode(this.MODE_CORPUS);
    		// 	this.loadFromTermsRecords();
    		// }
    	}
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
    		terms.push({text: records[i].get('term').replace(/"/g,''), rawFreq: records[i].get('rawFreq')});
    	}
    	this.setTerms(terms);
    	this.buildFromTerms();
    },
    
    initVisLayout: function(forceLayout) {
    	if (forceLayout || this.getVisLayout() == undefined) {
    		var cirrusForceFlash = this.getApiParam('cirrusForceFlash');
    		if (cirrusForceFlash == 'true' || cirrusForceFlash === true) {
    			this.setApiParam('cirrusForceFlash', true);
    			var id = this.getCirrusId();
    			var appVars = {
    				id: id
    			};
    			var keys = ['background','fade','smoothness','diagonals'];
    			for (var i = 0; i < keys.length; i++) {
    				appVars[keys[i]] = this.getApiParam(keys[i]);
    			}
    			
    			var swfscript = '<script type="text/javascript" src="'+this.getApplication().getBaseUrl()+'resources/swfobject/swfobject.js'+'"></script>';
    			var cirrusLinks = '<script type="text/javascript">'+
				'cirrusClickHandler'+id+' = function(word, value) {\n'+
				'\tif (window.console && console.info) console.info(word, value);\n'+
				'\tvar cirrusTool = Ext.getCmp("'+this.id+'");\n'+
				'\tcirrusTool.dispatchEvent("termsClicked", cirrusTool, [word]);\n'+
				'}\n'+
				'cirrusLoaded'+id+' = function() {\n'+
				'\tif (window.console && console.info) console.info("cirrus flash loaded");\n'+
				'}\n'+
				'cirrusPNGHandler'+id+' = function(base64String) {\n'+
				'\tvar cirrusTool = Ext.getCmp("'+this.id+'");\n'+
				'\tcirrusTool.cirrusPNGHandler(base64String);\n'+
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
    				loadFlash(this);
    				
    			}, this);
    		} else {
    			var el = this.getLayout().getRenderTarget();
    			el.update(""); // make sure to clear existing contents (especially for re-layout)
    	    	var width = el.getWidth();
				var height = el.getHeight();
				this.setVisLayout(
					d3.layoutCloud()
						.size([width, height])
						.overflow(true)
						.padding(1)
						.rotate(function(d) { return this.getApplication().getFeatureForTerm('orientation', d.text); }.bind(this))
						.spiral('archimedean')
						.font(function(d) { return this.getApplication().getFeatureForTerm('font', d.text); }.bind(this))
						.fontSize(function(d) {return d.fontSize; }.bind(this))
						.text(function(d) { return d.text; })
						.on('end', this.draw.bind(this))
				);
				
				var svg = d3.select(el.dom).append('svg').attr('id',this.getCirrusId()).attr('class', 'cirrusGraph').attr('width', width).attr('height', height);
				this.setVis(svg.append('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')'));
				
				if (this.getTip() === undefined) {
					this.setTip(Ext.create('Ext.tip.Tip', {}));
				}
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
	    				if (!t.text && t.term) {t.text=t.term;}
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

	//    		var fontSizer = d3.scalePow().range([10, 100]).domain([minSize, maxSize]);

	    		this.getVisLayout().words(terms).start();
    		}
    	} else {
    		Ext.defer(this.buildFromTerms, 50, this);
    	}
    },
    
    draw: function(words, bounds) {
    	var panel = this;
    	var el = this.getLayout().getRenderTarget();
    	var width = this.getVisLayout().size()[0];
    	var height = this.getVisLayout().size()[1];
    	
    	var scale = bounds ? Math.min(
			width / Math.abs(bounds[1].x - width / 2),
			width / Math.abs(bounds[0].x - width / 2),
			height / Math.abs(bounds[1].y - height / 2),
			height / Math.abs(bounds[0].y - height / 2)
    	) / 2 : 1;
    	
		var t = d3.transition().duration(1000);
			
		var nodes = this.getVis().selectAll('text').data(words, function(d) {return d.text;});
		
		nodes.exit().transition(t)
			.style('font-size', '1px')
			.remove();

		var nodesEnter = nodes.enter().append('text')
			.text(function(d) { return d.text; })
			.attr('text-anchor', 'middle')
			.attr('data-freq', function(d) { return d.rawFreq; })
			.attr('transform', function(d) { return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')'; })
			.style('font-family', function(d) { return panel.getApplication().getFeatureForTerm('font', d.text); })
			.style('fill', function(d) { return panel.getApplication().getColorForTerm(d.text, true); })
			.style('font-size', '1px')
			.on('click', function(obj) {panel.dispatchEvent('termsClicked', panel, [obj.text]);})
			.on('mouseover', function(obj) {
				this.getTip().show();
			}.bind(this))
			.on('mousemove', function(obj) {
				var tip = this.getTip();
				tip.update(obj.text+': '+obj.rawFreq);
				var container = Ext.get(this.getCirrusId()).dom;
				var coords = d3.mouse(container);
				coords[1] += 30;
				tip.setPosition(coords);
			}.bind(this))
			.on('mouseout', function(obj) {
				this.getTip().hide();
			}.bind(this));
		
		var nodesUpdate = nodes.merge(nodesEnter);
		
		nodesUpdate.transition(t)
			.style('font-family', function(d) { return panel.getApplication().getFeatureForTerm('font', d.text); })
			.style('fill', function(d) { return panel.getApplication().getColorForTerm(d.text, true); })
			.attr('transform', function(d) { return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')'; })
			.style('font-size', function(d) { return d.fontSize + 'px'; });
		
		this.getVis().transition(t).attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')scale(' + scale + ')');
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