Ext.define('Voyant.panel.DToC.DocModel', {
	extend: 'Ext.panel.Panel',
	requires: [],
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.dtocDocModel',
    config: {
    	corpus: undefined
    },
    statics: {
        api: {
        }
    },
    
    
	LINE_HEIGHT: 3,
	ARROW_HALF_HEIGHT: 6,
	CHAPTER_BUTTONS_DELAY: 250,
	
	segmentContainer: null,
	outlineTop: null,
	outlineLeft: null,
	outlineRight: null,
	outlineBottom: null,
	chapterButton: null,
	chapterButtonContainer: null,
	
	documents: new Ext.util.MixedCollection(),
	model: new Ext.util.MixedCollection(), // model for tracking all selections
	
	currentPosition: [0, 0], // [docIndex, amount]
	arrowDragSource: null,
	isArrowDragging: false,
	dragStartTime: null,
    
    
    constructor: function(config) {
    	Ext.apply(config, {includeTools: {}});
    	
        this.callParent(arguments);
        this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);

    	Ext.DomHelper.append(document.body, '<div id="docModelCurrentSegment" class="black_arrow" style="display: none;"></div>'+
				'<div id="docModelOutlineTop"></div><div id="docModelOutlineLeft"></div><div id="docModelOutlineRight"></div><div id="docModelOutlineBottom"></div>'+
				'<div id="docModelChapterButton"></div>'
		);
    	
    	this.addListener('corpusDocumentSelected', function(src, data) {
			if (src != this) {
				var docIndex = data.docIndex == null ? this.getCorpus().getDocument(data.docId).getIndex() : data.docIndex;
				this.setCurrentPosition(docIndex, 0, false);
			}
		}, this);
		
		this.addListener('tokenSelected', function(src, data) {
			var docIndex = data.docIndex == null ? this.getCorpus().getDocument(data.docId).getIndex() : data.docIndex;
			this.highlightProspect(docIndex, data.tokenId, false);
		});
		
		this.addListener('tagSelected', function(src, data) {
			if (src != this && data.tokenId) {
				var docIndex = data.docIndex == null ? this.getCorpus().getDocument(data.docId).getIndex() : data.docIndex;
				this.highlightProspect(docIndex, data.tokenId, false);
			}
		}, this);
		
		this.addListener('dtcReaderScroll', function(src, data) {
			if (!this.isArrowDragging) {
				this.chapterButtonContainer.hide();
				var amount;
				if (data.el.scrollTop == 0) {
					amount = 0;
				} else if (data.el.scrollHeight - data.el.scrollTop == data.el.clientHeight) {
					amount = 1;
				} else {
					amount = (data.el.scrollTop + data.el.clientHeight * 0.5) / data.el.scrollHeight;
				}
				var docIndex = this.getCorpus().getDocument(data.docId).getIndex();
				this.setCurrentPosition(docIndex, amount, false);
			}
		}, this);
		
		this.addListener('tagsSelected', function(src, tags) {
			this.clearHits('tag');
			
			for (var i = 0; i < tags.length; i++) {
				var docTags = tags[i];
				for (var j = 0; j < docTags.length; j++) {
					var tag = docTags[j];
					this.showTokenHit(tag.docId, tag.tokenId, 'tag');
					this.model.get(tag.docId).tag[tag.tokenId] = true;
				}
			}
		}, this);
		
		this.addListener('indexesSelected', function(src, indexes) {
			this.clearHits('index');
			
			for (var i = 0; i < indexes.length; i++) {
				var index = indexes[i];
				this.showTokenHit(index.docId, index.tokenId, 'index');
				this.model.get(index.docId).index[index.tokenId] = true;
			}
		}, this);
		
		this.addListener('corpusTermsClicked', function(src, terms) {
			if (terms.length === 0) {
				this.clearHits('kwic');
			}
		}, this);
		
		this.addListener('documentTermsClicked', function(src, terms) {
			if (terms.length === 0) {
				this.clearHits('kwic');
			}
		}, this);
		
		this.addListener('tocUpdated', function(src, data) {
			this.clearHits('kwic');
			
			if (!Ext.isArray(data)) {
				data = [data];
			}
			for (var i = 0; i < data.length; i++) {
				var d = data[i];
				this.showTokenHit(d.docId, d.tokenId, d.type);
				this.model.get(d.docId).kwic[d.tokenId] = true;
			}
		}, this);
    },
    initComponent: function() {
        var me = this;
        
        Ext.apply(me, {
			tools: null,
			cls: 'dtc-panel',
			height: '100%',
			layout: {
				type: 'vbox',
				align: 'center'
			},
			defaults: {
				layout: 'fit'
			},
			items: [{
				xtype: 'button',
				cls: 'dtc-button',
				padding: '0',
				text: 'Clear',
				handler: function() {
					Ext.getCmp('dtcMarkup').clearSelections();
					if (this.getApplication().useIndex) {
						Ext.getCmp('dtcIndex').clearSelections();
					}
					Ext.getCmp('dtcReader').clearHighlights();
					Ext.getCmp('dtcStats').clearSelections();
					var tree = Ext.getCmp('dtcToc');
					tree.clearTree();
		    		tree.updateDocModelOutline();
		    		this.clearHits();
				},
				scope: this
			},{
				html: '<div id="docModelSegmentContainer" style="height: 100%; width: '+(me.width-10)+'px;"></div>',
				margin: '10 0 0 0',
				flex: 1
			}]
		});
        
        me.callParent(arguments);
    },
    
	listeners: {
		loadedCorpus: function(src, corpus) {
			this.setCorpus(corpus);
			
			if (this.rendered) {
				this.buildProspect();
			}
				
			var corpus = this.getCorpus();
			var docs = corpus.getDocuments();
			for (var i = 0, len = corpus.getDocumentsCount(); i < len; i++) {
				var doc = docs.getAt(i);
				// check to see if this doc was specified as the index (via the cwrc interface)
				if (doc.get('extra.isDtocIndex') === 'true') {
					continue;
				}
				this.model.add(doc.getId(), {
					index: {},
					tag: {},
					kwic: {}
				});
			}
		},
		boxready: function() {
			this.setOutlineDimensions();
		},
		resize: function() {
			this.buildProspect();
		},
		afterlayout: function() {
			this.setOutlineDimensions();
			this.setCurrentPosition();
		},
		afterrender: function(panel) {
			this.segmentContainer = Ext.get('docModelSegmentContainer');
			this.segmentContainer.unselectable();
			
			this.outlineTop = Ext.get('docModelOutlineTop');
			this.outlineLeft = Ext.get('docModelOutlineLeft');
			this.outlineRight = Ext.get('docModelOutlineRight');
			this.outlineBottom = Ext.get('docModelOutlineBottom');
			
			this.chapterButtonContainer = Ext.get('docModelChapterButton');
			this.chapterButton = new Ext.Button({
				text: 'Chapter',
				cls: 'dtc-button',
				renderTo: this.chapterButtonContainer,
				handler: function(b, e) {
					if (b.getText().indexOf('Next') != -1) {
						var index = this.currentPosition[0];
						var docId = this.getCorpus().getDocument(index+1).getId();
						this.getApplication().dispatchEvent('corpusDocumentSelected', this, {docId:docId});
						this.chapterButtonContainer.hide();
					} else {
						var index = this.currentPosition[0];
						var docId = this.getCorpus().getDocument(index-1).getId();
						this.getApplication().dispatchEvent('corpusDocumentSelected', this, {docId:docId});
//						this.getApplication().dispatchEvent('dtcDocModelClick', this, {
//							docIndex: index-1,
//							docId: docId,
//							amount: 1
//						});
						this.chapterButtonContainer.hide();
					}
				},
				scope: this
			});
			
			Ext.get('docModelCurrentSegment').unselectable();
			
			this.arrowDragSource = new Ext.drag.Source({
				element: 'docModelCurrentSegment',
				constrain: {
					vertical: true
				},
				listeners: {
					dragmove: function(d, info, event) {
						var docIndex = this.currentPosition[0];
						var arrowY = info.element.current.y + this.ARROW_HALF_HEIGHT;
						var docDiv = this.segmentContainer.down('div:nth-child('+(docIndex+1)+')');
						var amount = (arrowY - docDiv.getY()) / docDiv.getHeight();
						var docId = this.documents.get(docIndex).document.getId();
						
						this.getApplication().dispatchEvent('dtcDocModelScroll', this, {
							docIndex: docIndex,
							docId: docId,
							amount: amount
						});
						
						var container = d.getConstrain().getRegion();
						if ((event.pageY >= container.bottom && docIndex < this.getCorpus().getDocumentsCount()-1) ||
							(event.pageY <= container.top && docIndex > 0)) {
							if (this.dragStartTime == null) {
								this.dragStartTime = new Date();
							} else {
								var now = new Date();
								if (now.getTime() >= this.dragStartTime.getTime() + this.CHAPTER_BUTTONS_DELAY) {
									this.chapterButtonContainer.setY(arrowY - this.chapterButtonContainer.getHeight()/2);
									if (event.pageY >= container.bottom) {
										this.chapterButton.setText('Next Chapter');
										Ext.getCmp('dtcReader').setReaderScroll('bottom');
									} else {
										this.chapterButton.setText('Previous Chapter');
										Ext.getCmp('dtcReader').setReaderScroll('top');
									}
									this.chapterButtonContainer.show();
									// TODO add dismiss timer for chapter button
								}
							}
						} else {
							this.chapterButtonContainer.hide();
						}
					},
					dragstart: function() {
						this.isArrowDragging = true;
						this.dragStartTime = null;
						this.chapterButtonContainer.hide();
					},
					dragend: function() {
						this.isArrowDragging = false;
						this.dragStartTime = null;
					},
					scope: this
				}
			});
			
			panel.body.addListener('click', function(e) {
				var target = e.getTarget(null,null,true);
				if (target && target.dom.tagName=='IMG') {
					var parts = target.dom.id.split('_');
					var docIndex = parseInt(parts[1]);
					var docLine = parseInt(parts[2]);
					
					var docId = this.documents.get(docIndex).document.getId();
					
					var tokenId = target.getAttribute('tokenId');
					if (tokenId) {
						var type = target.dom.className.replace('docModelLine', '').trim();
//						console.log(type);
						this.getApplication().dispatchEvent('tagSelected', this, {
							tokenId: tokenId,
							docId: docId,
							type: type
						});
					} else {
						var clickY = e.getY();
						var docDiv = target.parent('div');
						var docY = docDiv.getY();
						var amount = (clickY - docY) / docDiv.getHeight();
						
						this.getApplication().dispatchEvent('dtcDocModelClick', this, {
							docIndex: docIndex,
							docId: docId,
							amount: amount
						});
					}
				}
				this.chapterButtonContainer.hide();
			}, this);
		}
	},
	
	buildProspect: function() {
		if (this.getCorpus()) {
			var docs = this.getCorpus().getDocuments();
			var docsCount = this.getCorpus().getDocumentsCount();
			
			var indexInDocsMod = 0;
			var totalTokens = 0;
			for (var i = 0; i < docsCount; i++) {
				var doc = docs.getAt(i);
				// check to see if this doc was specified as the index (via the cwrc interface)
				if (doc.get('extra.isDtocIndex') === 'true') {
					indexInDocsMod = 1;
					continue;
				}
				totalTokens += doc.get('tokensCount-lexical');
			};
			
			var containerHeight = this.segmentContainer.getHeight();
			var separationHeight = (docsCount-1-indexInDocsMod) * this.LINE_HEIGHT;
			containerHeight -= separationHeight;
			var availableLines = parseInt(containerHeight / this.LINE_HEIGHT);
			if (this.LINE_HEIGHT * availableLines > containerHeight) {
				availableLines--; // make sure there's no scrollbar for prospect
			}
			
			
			var tokensPerLine = Math.floor(totalTokens / availableLines);
			if (tokensPerLine < this.MINIMUM_LIMIT) {tokensPerLine = this.MINIMUM_LIMIT;}
			this.setApiParams({limit: tokensPerLine});
			
			var docTotalTokens, linesPerDocument;
			var imagesSnippet = "";
			var tiplabel, docIndex;
			this.documents = new Ext.util.MixedCollection();
			
			for (var i = 0; i < docsCount; i++) {
				var doc = docs.getAt(i);
				if (doc.get('extra.isDtocIndex') === 'true') {
					continue;
				}
	    		tiplabel = doc.getShortTitle();
				docIndex = doc.getIndex();
				imagesSnippet += "<div>";
				docTotalTokens = doc.get('tokensCount-lexical');
				
				var percentageOfWhole = docTotalTokens / totalTokens;
				//linesPerDocument = Math.floor(docTotalTokens / tokensPerLine);
				linesPerDocument = Math.floor(availableLines * percentageOfWhole);
	//			console.log('linesPerDocument',linesPerDocument,'percentageOfWhole',percentageOfWhole);
				if (linesPerDocument < 1) {linesPerDocument = 1;}
				
				// TODO change ID system to reflect new token IDs
				for (var j = 0; j < linesPerDocument; j++) {
					imagesSnippet += "<img src='"+Ext.BLANK_IMAGE_URL+"' class='docModelLine' "+
	//						"'ext:qtip='"+tiplabel+"' "+
							"id='prospect_"+docIndex+'_'+j+"' />";
				}
				this.documents.add(doc.getIndex(), {
					document: doc, lines: linesPerDocument
				});
				imagesSnippet += '</div>';
			}
			this.segmentContainer.setHtml(imagesSnippet);
		}
	},
	
	showTokenHit: function(docId, tokenId, type) {
		var doc = this.getCorpus().getDocument(docId);
		var index = doc.getIndex();
		var tokenPercent = this.getTokenPercent(doc, tokenId);
		var i = Math.floor(this.documents.get(index).lines * tokenPercent);
		try {
			var el = Ext.get('prospect_' + index + '_' + i);
			if (el !== null) {
				el.dom.className = 'docModelLine '+type;
				el.set({tokenId: tokenId});
			}
		} catch (e) {
		}
	},
	
	getTokenPercent: function(doc, tokenId) {
		var tokenPosition = parseInt(tokenId.split('.')[1]);
		var tokenPercent;
		if (tokenId.match('tag') != null) {
			tokenPercent = tokenPosition / doc.get('lastTokenStartOffset-lexical');
		} else {
			tokenPercent = tokenPosition / doc.get('tokensCount-lexical');
		}
		return tokenPercent;
	},
	
	clearHits: function(type) {
		this.model.each(function(doc, index) {
			if (type != null) {
				doc[type] = {};
			} else {
				doc.index = {};
				doc.tag = {};
				doc.kwic = {};
			}
		});
		
		var selector = 'img';
		if (type != null) {
			selector = 'img[class*='+type+']';
		}
		var imgs = Ext.DomQuery.select(selector, this.segmentContainer.dom);
		for (var i = 0; i < imgs.length; i++) {
			var hit = Ext.get(imgs[i]);
			hit.dom.className = 'docModelLine';
			hit.dom.removeAttribute('tokenId');
		}
	},
	
	setCurrentPosition: function(docIndex, amount, animate) {
		docIndex = docIndex == null ? this.currentPosition[0] : docIndex;
		amount = amount == null ? this.currentPosition[1] : amount;
		animate = animate == null ? false : animate;
		
		var docContainer = this.segmentContainer.down('div:nth-child('+(docIndex+1)+')');
		if (docContainer) {
			var height = docContainer.getHeight();
			var y = docContainer.getY() + Math.round(height * amount) - this.ARROW_HALF_HEIGHT;
			
			var currSeg = Ext.get('docModelCurrentSegment');
			if (!currSeg.isVisible()) currSeg.show();
			if (animate) {
				currSeg.setY(y, animate);
			} else {
				currSeg.setStyle({top: y+'px'});
			}
			
			var box = docContainer.getBox();
			this.arrowDragSource.setConstrain({
				vertical: true,
				region: new Ext.util.Region(box.y-this.ARROW_HALF_HEIGHT, box.x, box.y+box.height+this.ARROW_HALF_HEIGHT, box.x)
			});
			
			this.currentPosition = [docIndex, amount];
		}
	},
	
	highlightProspect: function(docIndex, tokenId, animate) {
		var doc = this.documents.get(docIndex);
		var tokenPercent = this.getTokenPercent(doc.document, tokenId);
		this.setCurrentPosition(docIndex, tokenPercent, animate);
	},
	
	getSelectionsForDoc: function(docId) {
		return this.model.get(docId);
	},

	setOutlineDimensions: function(minMaxObj) {
		var outlineThickness = 1;
		var min = 0;
		var max = 1;
		if (minMaxObj) {
			var min = minMaxObj.min;
			var max = minMaxObj.max;
		}
		
		var box = this.segmentContainer.getBox();
		
		// adjust for padding
		box.x -= 5;
		box.width += 10;
		box.y -= 5;
		box.height += 10;
		
		// apply token ranges
		box.y += min * box.height;
		box.height = max * box.height - (min * box.height);
		
		if (box.height < 18) {
			var outlineHeight = Math.round(box.height*0.5);
			
			this.outlineTop.setBox({x: box.x, y: box.y, width: box.width, height: outlineHeight});
			this.outlineLeft.setBox({x: box.x, y: box.y+outlineHeight, width: 0, height: 0});
			this.outlineRight.setBox({x: box.x+box.width-outlineThickness, y: box.y+outlineHeight, width: 0, height: 0});
			this.outlineBottom.setBox({x: box.x, y: box.y+outlineHeight, width: box.width, height: outlineHeight});
			
			this.outlineTop.setStyle('border-radius', outlineHeight+'px '+outlineHeight+'px 0 0');
			this.outlineBottom.setStyle('border-radius', '0 0 '+outlineHeight+'px '+outlineHeight+'px');
		} else {
			this.outlineTop.setBox({x: box.x, y: box.y, width: box.width, height: 9});
			this.outlineLeft.setBox({x: box.x, y: box.y+9, width: outlineThickness, height: box.height-18});
			this.outlineRight.setBox({x: box.x+box.width-outlineThickness, y: box.y+9, width: outlineThickness, height: box.height-18});
			this.outlineBottom.setBox({x: box.x, y: box.y+box.height-12, width: box.width, height: 9});
			
			this.outlineTop.setStyle('border-radius', null);
			this.outlineBottom.setStyle('border-radius', null);
		}
		
		var currSeg = Ext.get('docModelCurrentSegment');
		var viz = currSeg.isVisible();
		if (!viz) currSeg.show();
		currSeg.setX(box.x+box.width-5);
		if (!viz) currSeg.hide();
		
		this.chapterButtonContainer.hide();
		this.chapterButtonContainer.setX(box.x+box.width+7);
	}
});