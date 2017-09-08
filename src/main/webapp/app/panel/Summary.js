/**
 * The Summary panel provides an overview of a corpus, and the content will
 * depend on whether the corpus includes one document or many.
 */
Ext.define('Voyant.panel.Summary', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel', 'Voyant.util.SparkLine'],
	alias: 'widget.summary',
    statics: {
    	i18n: {
    	},
    	api: {
    		
    		/**
    		 * @cfg {String} stopList A list of words to exclude.
    		 * 
    		 * Stopword lists can take one of several forms and they can be combined with commas:
    		 * 
    		 * * *auto*: automatically detect the language (this is recommended and the default so it doesn't need to be specified)
    		 * * specially named stopword lists including stop.ar.arabic-lucene.txt, stop.bg.bulgarian-lucene.txt, stop.br.breton-lucene.txt, stop.ca.catalan-lucene.txt, stop.ckb.kurdish-lucene.txt, stop.cn.chinese-lawrence.txt, stop.cz.czech-lucene.txt, stop.de.citelab.txt, stop.de.german.txt, stop.el.greek-lucene.txt, stop.en.glasgow.txt, stop.en.smart.txt, stop.en.taporware.txt, stop.es.spanish.txt, stop.eu.basque-luence.txt, stop.fa.farsi-lucene.txt, stop.fr.steffens.txt, stop.fr.veronis.txt, stop.ga.ga-irish.txt, stop.gl.galician-lucene.txt, stop.hi.hindi-lucene.txt, stop.hu.hungarian.txt, stop.hy.armenian-lucene.txt, stop.id.indonesian-lucene.txt, stop.it.italian.txt, stop.ja.japanese.txt, stop.lt.lithuanian-lucene.txt, stop.lv.latvian-lucene.txt, stop.mu.multi.txt, stop.nl.dutch.txt, stop.no.norwegian.txt, stop.ro.romanian-lucene.txt, stop.se.swedish-long.txt, stop.se.swedish-short.txt, stop.th.thai-lucene.txt, stop.tr.turkish-lucene.txt
    		 * * individual words to be excluded
    		 * * URLs that point to plain text UTF-8 files with one stopword per line (lines with leading hash symbols (#) are skipped)
    		 */
    		stopList: 'auto',
    		
    		
    		start: 0,
    		
    		
    		/**
    		 * @cfg {Number} limit The number of items to include in most lists (document length, vocabulary density, most frequent terms).
    		 */
    		limit: 5,
    		
    		/**
    		 * @cfg {Number} numberOfDocumentsForDistinctiveWords The number of items to include in the list of distinctive words (similar to the limit parameter but specific to distinctive words).
    		 */
    		numberOfDocumentsForDistinctiveWords: 10
    	},
		glyph: 'xf1ea@FontAwesome'
    },
    config: {
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
                overflowHandler: 'scroller',
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
	    			html: '<ul><li>'+this.localize('longest')+" "+docsLengthTpl.apply(docs.slice(0, docs.length>limit ? limit : parseInt(docs.length/2)).map(function(doc) {return {
						id: doc.getId(),
						shortTitle: doc.getShortTitle(),
						title: doc.getTitle(),
						val: doc.getLexicalTokensCount(),
						valTip: numberOfTerms
					}}))+'</li>'+
	    				'<li>'+this.localize('shortest')+" "+docsLengthTpl.apply(docs.slice(-(docs.length>limit ? limit : parseInt(docs.length/2))).reverse().map(function(doc) {return {
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
 
        	// words per sentence
    		docs.sort(function(d1, d2) {return d2.getAverageWordsPerSentence()-d1.getAverageWordsPerSentence()});
        	main.add({
        		cls: 'section',
        		items: [{
		    		layout: 'hbox',
		    		align: 'bottom',
		    		cls: 'section',
		    		items: [{
		    			html: this.localize("averageWordsPerSentence"),
		    			cls: 'header'
		    		}, {
		    			xtype: 'sparklineline',
		    			values: this.getCorpus().getDocuments().getRange().map(function(doc) {return Ext.util.Format.number(doc.getAverageWordsPerSentence(),'0.0')}),
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
						val: Ext.util.Format.number(doc.getAverageWordsPerSentence(),'0.0'),
						valTip: numberOfTerms
					}}))+'</li>'+
	    				'<li>'+this.localize('lowest')+docsLengthTpl.apply(docs.slice(-(docs.length>limit ? limit : parseInt(docs.length/2))).reverse().map(function(doc) {return {
	    					id: doc.getId(),
	    					shortTitle: doc.getShortTitle(),
	    					title: doc.getTitle(),
	    					val: Ext.util.Format.number(doc.getAverageWordsPerSentence(),'0.0'),
	    					valTip: numberOfTerms
	    				}}))+'</li>'
	        	}]
        	})        	
    	} else { // single document, we can still show word density and average words per sentence
    		var doc = docs[0];
    		if (doc) {
            	main.add({
            		cls: 'section',
            		html:"<b>"+this.localize("docsDensity")+"</b> "+Ext.util.Format.number(doc.getLexicalTypeTokenRatio(),'0.000')
            	});    		
            	main.add({
            		cls: 'section',
            		html: "<b>"+this.localize("averageWordsPerSentence")+"</b> "+Ext.util.Format.number(doc.getAverageWordsPerSentence(),'0.0')
            	});    		
    		}
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
    						forTool: 'summary'
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
        		html: this.localize("distinctiveWords")+"<ol></ol>",
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
    					forTool: 'summary'
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
    							if (docs[index]) {
        							var doc = this.getCorpus().getDocument(index);
        							len = docs[index].length; // declare for template
        		    				Ext.dom.Helper.append(list, {tag: 'li', 'voyant:index': String(index), html: 
        		    					'<a href="#" onclick="return false" class="document-id document-id-distinctive" voyant:val="'+doc.get('id')+'">'+doc.getShortTitle()+'</a>'+
        		    					this.localize('colon')+ " "+new Ext.XTemplate(this.localize('documentType')).apply({types: docs[index]})+'.'
        		    				});
    							}
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
