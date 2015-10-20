
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
    	api: {
    		stopList: 'auto',
    		limit: 100,
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
    	corpus: undefined,
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
    		if (this.getVisLayout() && this.getCorpus()) {
    			this.setAdjustedSizes();
    			
    			var el = this.getLayout().getRenderTarget();
    	    	width = el.getWidth();
    			height = el.getHeight();
    			
    			el.down('svg').set({width: width, height: height});
    			this.getVisLayout().size([width, height]).stop().words(this.getTerms()).start();
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
    	},
    	
    	boxready: function() {
			this.initVisLayout();
    	}
    	
    },
    
    loadFromCorpus: function(corpus) {    	
		this.setCorpus(corpus);
		this.setApiParams({docId: undefined, docIndex: undefined});
		this.loadFromCorpusTerms(corpus.getCorpusTerms({autoload: false}));
    },
    
    loadFromDocumentTerms: function(documentTerms) {
    	documentTerms.load({
		    callback: function(records, operation, success) {
		    	this.setMode(this.MODE_DOCUMENT);
		    	this.loadFromTermsRecords(records);
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
//		    	var resp = JSON.parse(operation._response.responseText);
//		    	this.buildFromTerms(resp.corpusTerms.terms);
		    	this.loadFromTermsRecords(records);
		    },
		    scope: this,
		    params: this.getApiParams()
    	});
    },
    
    loadFromTermsRecords: function(records) {
    	var terms = [];
    	records.forEach(function(record) {
    		terms.push({text: record.get('term'), rawFreq: record.get('rawFreq')});
    	});
    	this.setTerms(terms);
    	this.buildFromTerms();
    },
    
    initVisLayout: function() {
    	if (this.getVisLayout() == undefined) {
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
    },
    
    buildFromTerms: function() {
    	var terms = this.getTerms();
    	if (this.rendered && terms) {
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
    	} else {
    		Ext.defer(this.buidlFromTerms, 50, this);
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