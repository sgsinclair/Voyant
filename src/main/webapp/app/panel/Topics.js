// heavy lifting for the LDA from https://github.com/mimno/jsLDA with tweaks to fit into a Voyant object scope

Ext.define('Voyant.panel.Topics', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel','Voyant.widget.LiveSearchGrid'],
	alias: 'widget.topics',
    statics: {
    	i18n: {
    	},
    	api: {
    		stopList: 'auto',
    		numTopics: 25,
    		limit: 10,
    		iterations: 100,
    		perDocLimit: 1000,
    		query: undefined
    	},
		glyph: 'xf1ea@FontAwesome'
    },
    config: {
    	/**
    	 * @private
    	 */
    	options: [{xtype: 'stoplistoption'},{
	        xtype: 'numberfield',
	        name: 'perDocLimit',
	        fieldLabel: 'maximum words per document',
	        labelAlign: 'right',
	        value: 1000,
	        minValue: 1,
	        step: 100,
	        listeners: {
    	        afterrender: function(field) {
    	        	var win = field.up("window");
    	        	if (win && win.panel) {
        	        	field.setValue(parseInt(win.panel.getApiParam('perDocLimit')))
    	        		field.setFieldLabel(win.panel.localize("perDocLimit"))
    	        	}
    	        },
		        change: function(field, val) {
		        	var win = field.up("window");
		        	if (val>5000 && win && win.panel) {
		        		win.panel.toastInfo({
		        			html: win.panel.localize("perDocLimitHigh"),
		        			anchor: win.getTargetEl(),
		        			align: 'tr',
		        			maxWidth: 400
		        		})
		        	}
		        }
	        }
	    },{
	        xtype: 'numberfield',
	        name: 'iterations',
	        fieldLabel: 'iterations per run',
	        labelAlign: 'right',
	        value: 100,
	        minValue: 1,
	        maxValue: 10000,
	        step: 50,
	        listeners: {
    	        afterrender: function(field) {
    	        	var win = field.up("window");
    	        	if (win && win.panel) {
        	        	field.setValue(parseInt(win.panel.getApiParam('iterations')))
    	        		field.setFieldLabel(win.panel.localize("iterations"))
    	        	}
    	        }
	        }
	    }],
    	
    	corpus: undefined,
    	
    	documentTopicSmoothing : 0.1,
    	topicWordSmoothing : 0.01,
    	vocabularySize : 0,
    	 vocabularyCounts : {},
    	 stopwords : {},
    	 docSortSmoothing : 10.0,
    	 sumDocSortSmoothing : 10.0 * 25, // update?
    	 requestedSweeps : 0,
    	 wordTopicCounts : {},
    	 topicWordCounts : [],
    	 tokensPerTopic : [],
    	 topicWeights : Array(25),
    	 documents: [],
    	 progress: undefined,
    	 totalIterations: 0,
    	 exportGridAll: false
    	
    },
    
    zeros: function(count, val) {
    	val = val || 0;
    	var ret = Array(count)
    	for (var i=0; i<count; i++) {ret[i]=val;}
    	return ret;
    },
    
    constructor: function(config ) {
    	var me = this;
    	Ext.apply(this, {
    		title: this.localize('title'),
    		layout: {
    	        type: 'hbox',
    	        pack: 'start',
    	        align: 'stretch'
    	    },
	        store: {
	            fields: ['topic', 'scores'],
	            data: []
	        },
    		columns: [{
    			text: this.localize("topic"),
    			tooltip: this.localize("topicTip"),
    			flex: 3,
        		dataIndex: 'topic',
                sortable: false
            },{
                xtype: 'widgetcolumn',
                text: this.localize("scores"),
                tooltip: this.localize("scoresTip"),
                flex: 1,
                dataIndex: 'scores',
                widget: {
                    xtype: 'sparklineline',
                    tipTpl: new Ext.XTemplate('{[this.getDocumentTitle(values.x,values.y)]}', {
                    	getDocumentTitle: function(docIndex, score) {
                    		return this.panel.getCorpus().getDocument(docIndex).getTitle()+"<br>coverage: "+Ext.util.Format.number(score*100, "0,000.0")+"%"
                    	},
                    	panel: me 
                    })
               }
            }],
            dockedItems: {
                dock: 'bottom',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                items:[
                       '<span class="info-tip" data-qtip="'+this.localize('searchTip')+'">'+this.localize('search')+'</span>'
                    ,{
                    xtype: 'textfield',
                    name: 'searchField',
                    hideLabel: true,
                    width: 80,
                    listeners: {
                        change: {
                            fn: me.onTextFieldChange,
                            scope: me,
                            buffer: 500
                        }
                    }
                },
                	'<span class="info-tip" data-qtip="'+this.localize('limitTermsTip')+'">'+this.localize('limitTerms')+'</span>'
                ,{ 
	    			width: 80,
                    hideLabel: true,
	    			xtype: 'slider',
	            	increment: 1,
	            	minValue: 1,
	            	maxValue: 100,
	            	listeners: {
	            		afterrender: function(slider) {
	            			slider.setValue(parseInt(this.getApiParam("limit")))
	            		},
	            		changecomplete: function(slider, newvalue) {
	            			this.setApiParams({limit: newvalue});
	            			this.postSweep();
	            		},
	            		scope: this
	            	}
                },
                	'<span class="info-tip" data-qtip="'+this.localize('numTopicsTip')+'">'+this.localize('numTopics')+'</span>'
                ,{ 
	    			width: 80,
                    hideLabel: true,
	    			xtype: 'slider',
	            	increment: 1,
	            	minValue: 1,
	            	maxValue: 200,
	            	listeners: {
	            		afterrender: function(slider) {
	            			slider.setValue(parseInt(this.getApiParam("numTopics")))
	            		},
	            		changecomplete: function(slider, newvalue) {
	            			this.setApiParams({numTopics: newvalue});
	            			this.loadFromExistingDocuments();
	            		},
	            		scope: this
	            	}
                },{
            		text: new Ext.Template(this.localize('runIterations')).apply([100]),
            		itemId: 'iterations',
					glyph: 'xf04b@FontAwesome',
            		tooltip: this.localize('runIterationsTip'),
            		handler: this.runIterations,
            		scope: this
            	},{
                	xtype: 'tbtext',
                	itemId: 'done'
                },{xtype: 'tbfill'}, {
	    			xtype: 'tbtext',
	    			html: this.localize('adaptation')
	    		}]
            }
    	});

        this.callParent(arguments);
        

    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
    	this.resetData();
        
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
    
    loadStopwords: function() {
    	this.mask(this.localize("loadingStopWords"));
    	Ext.Ajax.request({
    	    url: this.getTromboneUrl(),
    	    params: {
        		tool: 'resource.KeywordsManager',
    			stopList: this.getApiParam('stopList'),
    			corpus: this.getCorpus() ? this.getCorpus().getAliasOrId() : undefined
    	    },
    	    success: function(response, req) {
    	    	this.unmask();
    	    	var json = Ext.util.JSON.decode(response.responseText);
    	    	var stopwords = {};
    	    	json.keywords.keywords.forEach(function(stop) {
    	    		stopwords[stop]=1;
    	    	})
    	    	this.setStopwords(stopwords);
    	    	this.loadDocuments();
    	    },
    	    scope: this
    	})
    },
    
    loadDocuments: function() {
    	this.mask(this.localize("loadingDocuments"));
    	var corpus = this.getCorpus();
    	if (corpus) {
        	Ext.Ajax.request({
        	    url: this.getTromboneUrl(),
        	    params: {
            		tool: 'corpus.DocumentTokens',
        			corpus: corpus.getAliasOrId(),
        			outputFormat: "text",
        			template: "docTokens2idsAndText",
        			limit: 0,
        			noOthers: true,
        			perDocLimit: corpus.getDocumentsCount()==1 ? undefined : parseInt(this.getApiParam('perDocLimit'))
        		},
        	    success: function(response, req) {
        	    	this.unmask();
        	    	this.mask(this.localize("parsingDocuments"));
        	    	var lines = response.responseText.trim().split(/(\r\n|\r|\n)/);
        	    	if (lines.length==1) { // one document, so segment
        	    		var parts = lines[0].split(': ');
        	    		if (parts.length>1) {
            	    		var doc = corpus.getDocument(parts[0]);
            	    		var allwords = parts[1].split(' ');
            	    		var totalWords = doc.getLexicalTokensCount();
            	    		if (totalWords<10) {
            	    			bins = totalWords
            	    		} else if (totalWords<1000) {
            	    			bins = 10
            	    		} else {
            	    			bins = 100
            	    		}
            	    		var bins = 10;
            	    		var wordsPerBin = Math.floor(allwords.length/bins);
            	    		for (var i=0; i<bins; i++) {
            	    			var text = allwords.slice(i*wordsPerBin,(i*wordsPerBin)+wordsPerBin).join(" ");
                	    		this.parseLine(parts[0]+"-"+i+"\t"+parts[0]+"-"+i+"\t"+text);
            	    		}
        	    		}
        	    	} else {
            	    	lines.forEach(function(line) {
            	    		var parts = line.split(': ');
            	    		if (parts.length>1) {
                	    		var doc = corpus.getDocument(parts[0]);
                	    		this.parseLine(parts[0]+"\t"+doc.getTinyLabel()+"\t"+parts[1]);
            	    		}
            	    	}, this);
        	    	}
        	    	this.unmask();
        	    	this.runIterations();
        	    },
        	    scope: this
        	})
    	}
    },
    
    resetData: function() {
    	var numTopics = parseInt(this.getApiParam('numTopics'));
	 	this.setVocabularyCounts({});
		this.setSumDocSortSmoothing(this.getDocSortSmoothing()*numTopics);
		this.setRequestedSweeps(0);
		this.setWordTopicCounts({});
		this.setTopicWordCounts([]);
		this.setTokensPerTopic(this.zeros(numTopics));
		this.setTopicWeights(this.zeros(numTopics));
		this.setDocuments([]);
		this.setTotalIterations(0);
    },
    
    loadFromExistingDocuments: function() {

    	// not quite efficient, but at least we don't have to reload from server
    	var data = this.getDocuments().map(function(doc) {return doc.id+"\t"+doc.date+"\t"+doc.originalText});
    	
    	this.resetData(); // reset all data before starting over
    	
    	data.forEach(function(doc) {
    		this.parseLine(doc);
    	}, this);
    	
    	this.runIterations();
    },
    
    runIterations: function() {
    	var sweeps = this.getRequestedSweeps();
    	var iterations = parseInt(this.getApiParam('iterations'));
    	sweeps+=parseInt(iterations);
    	this.setTotalIterations(this.getTotalIterations()+iterations);
    	this.setRequestedSweeps(sweeps)
    	if (!this.getProgress()) {
    		var progress = Ext.MessageBox.show({
    			title: this.localize("runningIterations"),
    			message: new Ext.Template(this.localize('runningIterationsCount')).apply([sweeps]),
    			progress: true,
    			progressText: '',
    			target: sweeps,
    			customUpdateProgress: function(val) {
     			   this.updateProgress((this.config.target-val)*this.config.target, " iterations");
     		   	}
    		});
    		this.setProgress(progress);
    		this.updateProgress(sweeps);
    	}
    	this.sweep();
    },
    
    updateProgress: function(sweeps) {
    	var progress = this.getProgress(), sweeps = this.getRequestedSweeps();
    	if (progress) {
    		var target = progress.cfg.target;
        	var val = (target-sweeps)/target;
        	progress.updateProgress(val, (parseInt(val)*100) +"% done");
    	}
    },
    
    sweep: function() {

    	var startTime = Date.now(), numTopics = parseInt(this.getApiParam('numTopics')),
    		vocabularySize = this.getVocabularySize(), topicWordSmoothing = this.getTopicWordSmoothing(),
    		tokensPerTopic = this.getTokensPerTopic(), documents = this.getDocuments(),
    		wordTopicCounts = this.getWordTopicCounts(), topicWeights = this.getTopicWeights(), 
    		documentTopicSmoothing = this.getDocumentTopicSmoothing()
    		
    		
    	var topicNormalizers = this.zeros(numTopics);
    	for (var topic = 0; topic < numTopics; topic++) {
    		topicNormalizers[topic] = 1.0 / (vocabularySize * topicWordSmoothing + tokensPerTopic[topic]);
    	}

    	for (var doc = 0; doc < documents.length; doc++) {
    		var currentDoc = documents[doc];
    		var docTopicCounts = currentDoc.topicCounts;
    		
    		for (var position = 0; position < currentDoc.tokens.length; position++) {
    			var token = currentDoc.tokens[position];
    			if (token.isStopword) { continue; }

    			tokensPerTopic[ token.topic ]--;
    			var currentWordTopicCounts = wordTopicCounts[ token.word ];
    			currentWordTopicCounts[ token.topic ]--;
    			if (currentWordTopicCounts[ token.topic ] == 0) {
    			  //delete(currentWordTopicCounts[ token.topic ]);
    			}
    			docTopicCounts[ token.topic ]--;
    			topicNormalizers[ token.topic ] = 1.0 / (vocabularySize * topicWordSmoothing + tokensPerTopic[ token.topic ]);

    			var sum = 0.0;
    			for (var topic = 0; topic < numTopics; topic++) {
    				if (currentWordTopicCounts[ topic ]) {
    				  topicWeights[topic] =
    				    (documentTopicSmoothing + docTopicCounts[topic]) *
    				    (topicWordSmoothing + currentWordTopicCounts[ topic ]) *
    					topicNormalizers[topic];
    				}
    				else {
    				  topicWeights[topic] =
    				    (documentTopicSmoothing + docTopicCounts[topic]) *
    					topicWordSmoothing *
    					topicNormalizers[topic];
    				}
    				sum += topicWeights[topic];
    			}
    		    
    			// Sample from an unnormalized discrete distribution
    			var sample = sum * Math.random();
    		    var i = 0;
    		    sample -= topicWeights[i];
    		    while (sample > 0.0) {
    		      i++;
    		      sample -= topicWeights[i];
    		 	}
    			token.topic = i;
    			
    			tokensPerTopic[ token.topic ]++;
    			if (! currentWordTopicCounts[ token.topic ]) {
    				currentWordTopicCounts[ token.topic ] = 1;
    			}
    			else {
    				currentWordTopicCounts[ token.topic ] += 1;
    			}
    			docTopicCounts[ token.topic ]++;
    			
    			topicNormalizers[ token.topic ] = 1.0 / (vocabularySize * topicWordSmoothing + tokensPerTopic[ token.topic ]);
    		}
    	}
    	
    	var sweeps = this.getRequestedSweeps()-1;
    	this.setRequestedSweeps(sweeps);
    	var progress = this.getProgress();
    	if (sweeps>0) {
    		this.updateProgress(sweeps);
    		Ext.defer(this.sweep, 0, this);
    	} else {
    		progress.close();
    		this.setProgress(undefined);
    		this.postSweep();
    	}
    	
    },
    
    postSweep: function(){
    	this.sortTopicWords();
    	var store = this.getStore();
    	var done = new Ext.Template(this.localize('totalDone')).apply([Ext.util.Format.number(parseInt(this.getTotalIterations()), "0,000")]);
    	this.down('#done').setHtml(done);
    	
		var numTopics = parseInt(this.getApiParam('numTopics')),
			topicWordCounts = this.getTopicWordCounts(),
			data = [], documents = this.getDocuments(),
			docSortSmoothing = this.getDocSortSmoothing(),
			sumDocSortSmoothing = this.getSumDocSortSmoothing();
			
		var limit = parseInt(this.getApiParam('limit'));
		for (var topic = 0; topic < numTopics; topic++) {
			var scores = documents.map(function (doc, i) {
//				console.warn(doc, doc.topicCounts[topic], docSortSmoothing, doc.tokens.length, sumDocSortSmoothing);
				  return (doc.topicCounts[topic] + docSortSmoothing) / (doc.tokens.length + sumDocSortSmoothing);
			});
			
			data.push({
				topic: this.topNWords(topicWordCounts[topic], limit),
				scores: scores
			})
		}
    	store.loadData(data)
    },
    
    topNWords: function(wordCounts, n) { return wordCounts.slice(0,n).map( function(d) { return d.word; }).join(" "); },
    
    sortTopicWords: function() {
    	var topicWordCounts = this.getTopicWordCounts(), numTopics = parseInt(this.getApiParam('numTopics')),
    		wordTopicCounts = this.getWordTopicCounts();

    	  topicWordCounts = [];
    	  for (var topic = 0; topic < numTopics; topic++) {
    	    topicWordCounts[topic] = [];
    	  }

    	  for (var word in wordTopicCounts) {
    	    for (var topic in wordTopicCounts[word]) {
    	      topicWordCounts[topic].push({"word":word, "count":wordTopicCounts[word][topic]});
    	    }
    	  }

    	  for (var topic = 0; topic < numTopics; topic++) {
    	    topicWordCounts[topic].sort(this.byCountDescending);
    	  }

    	  this.setTopicWordCounts(topicWordCounts);
    },
    
    byCountDescending: function(a,b) {return b.count - a.count; },
    
    initialize: function() {
    	// make sure we have the right number of iterations in our label (especially after an options change)
    	var val = new Ext.Template(this.localize('runIterations')).apply([Ext.util.Format.number(parseInt(this.getApiParam('iterations')), "0,000")]);
    	var iterations = this.down('#iterations').setText(val)
    	this.loadStopwords();
    },
    
    parseLine: function ( line ) {
    	
    	// for simplicity, create locally scoped variables of these
    	var stopwords = this.getStopwords(), vocabularyCounts = this.getVocabularyCounts(),
	    	tokensPerTopic = this.getTokensPerTopic(), vocabularySize=this.getVocabularySize(),
	    	vocabularyCounts = this.getVocabularyCounts(), documents = this.getDocuments(),
	    	numTopics = parseInt(this.getApiParam('numTopics')),
	    	wordTopicCounts = this.getWordTopicCounts();
    	
    	  if (line == "") { return; }
    	  var docID = documents.length;
    	  var docDate = "";
    	  var fields = line.split("\t");
    	  var text = fields[0];  // Assume there's just one field, the text
    	  if (fields.length == 3) {  // If it's in [ID]\t[TAG]\t[TEXT] format...
    	    docID = fields[0];
    	    docDate = fields[1]; // do not interpret date as anything but a string
    	    text = fields[2];
    	  }

    	  var tokens = [];
    	  var rawTokens = text.toLowerCase().split(' '); // xsl should only use space between tokens
    	  if (rawTokens == null) { return; }
    	  var topicCounts = this.zeros(numTopics);

    	  rawTokens.forEach(function (word) {
    	    if (word !== "") {
    	      var topic = Math.floor(Math.random() * numTopics);
    		  
    		  if (word.length <= 2) { stopwords[word] = 1; }
    		  
    		  var isStopword = stopwords[word];
    		  if (isStopword) {
    			  // Record counts for stopwords, but nothing else
    			  if (! vocabularyCounts[word]) {
    				  vocabularyCounts[word] = 1;
    			  }
    			  else {
    			  	vocabularyCounts[word] += 1;
    			  }
    		  }
    		  else {
    		      tokensPerTopic[topic]++;
    		      if (! wordTopicCounts[word]) {
    		        wordTopicCounts[word] = {};
    		        vocabularySize++;
    		        vocabularyCounts[word] = 0;
    		      }
    		      if (! wordTopicCounts[word][topic]) {
    		        wordTopicCounts[word][topic] = 0;
    		      }
    		      wordTopicCounts[word][topic] += 1;
    		      vocabularyCounts[word] += 1;
    		      topicCounts[topic] += 1;
    	      }
    	      tokens.push({"word":word, "topic":topic, "isStopword":isStopword });
    	    }
    	  });
    	  this.setVocabularySize(vocabularySize); // set this scalar
    	  
    	  documents.push({ "originalOrder" : documents.length, "id" : docID, "date" : docDate, "originalText" : text, "tokens" : tokens, "topicCounts" : topicCounts});
    	}
    
});