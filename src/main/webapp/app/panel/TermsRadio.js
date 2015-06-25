/**
 * @class Voyant.panel.TermsRadio
 * @author Mark Turcato
 * @author Andrew MacDonald
 */


Ext.define('Voyant.panel.TermsRadio', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.termsradio',
	config: {
		corpus: undefined
	},
    statics: {
    	i18n: {
    		title : {en: 'TermsRadio'}
    	    ,type : {en: 'Visualization'}
    		,help: {en: 'This tool can be used to examine word occurence over a corpus spanning a period of time.'}
    		,segments: {en: 'Segments'}	
    		,segmentsTip: {en: 'This option allows you to define how many segments a document should be divided into (note that this option only applies to distribution within a document, not distribution across a corpus).'}
    		,displayPanel: {en: 'Display Panel'}
    		,displayPanelTip: {en: 'Panel to control settings for word display.'}
    		,duration: {en: 'Scroll speed.'}
    		,durationTip: {en: 'Controls the speed of the scrolling text.'}
    		,fraction: {en: 'Word Display'}	
    		,fractionTip: {en: 'This option allows you to define the number of words displayed. Ex. 20 will only keep the words that occur with the lowest 20% of frequency.'}
    		,reset: {en: 'Reset'}
    		,resetTip: {en: 'Reset the visualization to the beginning.'}
    		,stop: {en: 'Pause'}
    		,stopTip: {en: 'Pauses the scrolling movement.'}
    		,toggleLeft: {en: '< Back'}
    		,toggleLeftTip: {en: 'Toggle the values to the left.'}
    		,toggleRight: {en: 'Forward >'}
    		,toggleRightTip: {en: 'Toggle the values to the right.'}
    		,visibleSegments: {en: 'Visible Segments'}	
    		,visibleSegmentsTip: {en: 'This option allows you to define how many segments are visible at once.'}
    		,adaptedFrom: {en: 'TermsRadio is adapted from Type frequencies chart.'}
    		,scrollSpeed: {en: 'Scroll speed'}
    	},
    	api: {
    		withDistributions: true,
    		/**
    		 * @property bins How many segments, i.e. 'bins', to seperate separate a document into.
    		 * @type Integer
    		 * @default 10
    		 */
    		bins: 5
    	
    		/**
    		 * @property visibleBins How many visible segments to be displayed at once.
    		 * @type Integer
    		 * @default 5
    		 */
    		,visibleBins: 5
    	
    		,dispatchers: ['documentTypeSelected']
    		
    		/**
    		 * @property docIdType The document type(s) to restrict results to.
    		 * @type String|Array
    		 * @default null
    		 */
    		,docIdType: null
    		
    		,limit: 10
    		,listeners: ['CorpusSummaryResultLoaded', 'CorpusTypeFrequenciesResultLoaded', 'DocumentTypeFrequenciesResultLoaded', 'corpusTypeSelected', 'corpusTypesSelected', 'documentTypeSelected', 'documentTypesSelected']
    	
    		/**
        	 * @property mode What mode to operate at, either document or corpus.
        	 * @choices document, corpus
        	 */
    		,mode: null
    		
    		/**
        	 * @property position The current shifted position of the visualization.
        	 * @type Integer
        	 * @default 0
        	 */
    		,position: 0
    		
    		/**
    		 * @property selectedWords The words that have been selected.
    		 * @type String|Array
    		 * @default null
    		 */
    		,selectedWords: []
    		
    		/**
    		 * @property stopList The stop list to use to filter results.
    		 * Choose from a pre-defined list, or enter a comma separated list of words, or enter an URL to a list of stop words in plain text (one per line).
    		 * @type String
    		 * @default null
    		 * @choices stop.en.taporware.txt, stop.fr.veronis.txt
    		 */
    		,stopList: 'auto'
    		
    		,toolType: ['Visualization']
    		
    		/**
    		 * @property type The corpus type(s) to restrict results to.
    		 * @type String|Array
    		 * @default null
    		 */
    		,type: null
    		
    		/**
    		 * @property yAxisScale The scale for the y axis.
    		 * @type String
    		 * @default log
    		 */
    		,yAxisScale: 'log'
    	},
    	glyph: 'xf201@FontAwesome'
    },

	absMaxFreq: 0
	,absMinFreq: 0
	,allData: []
	,chart: null
	,colourIndex: ['blue', 'green', 'orange', 'brown', 'magenta']
	,colourMasterList: ['blue', 'green', 'orange', 'brown', 'magenta']
	,continueTransition: true
	,counterSeries: [] 
	,displayData: []
	,dragged: false
//	,intervalIdArray: []
	,isTransitioning: false
	,lastSlippery: null
	,lastSticky: null
	,maxFont: 30
	,minFreq: 0
	,numDataPoints: 0
	,numVisPoints: 5
	,overlayQueue: []
	,records: 0
	,recordsLength: 0
	,reselectTop: false
	,scaleCall: 'log'
	,shiftCount: 0
	,sliderDragSum: 0
	,titlesArray: []
	,transitionCall: 'draw' //possible calls 'draw', 'redraw', 'left', and 'right'
	,valFraction: 1
	,win: 0
	
	//window padding dimensions, b - bottom, l - left, r - right, t - top
    ,bPadding: 25
    ,lPadding: 40
    ,rPadding: 20
	,tPadding: 20
	,navigationHeight: 100
	
	//legend dimensions
	,legendWidth: 60	
	,legendY: 0
	,legendX: 0
	
	//tracks largest dimensions, used in resizing
	,largestW: 0
	,largestH: 0
	
	,constructor: function(config) {
		
		this.corpusStore = Ext.create("Voyant.data.store.CorpusTerms", {
			listeners : {
				'load' : {
					fn : function(store, records, success) {
//						console.log('corpus store: load')
						this.initData(records,'corpus');
						this.prepareData();
						//for shiftcount > 0 exclusively
						var len = this.shiftCount;
						while(len-- > 0){
						//for(var j = 0; j < this.shiftCount; j++){
							this.displayData.shift();
						}
						
						if (this.chart != null) {
							this.redraw();
						} else {
							this.initializeChart();
						}
						
						this.setVisibleSegments();
						this.redrawSliderOverlay();
						
						if(this.reselectTop == true) {
							var len = this.overlayQueue.length;
							while(len-->0){
								this.manageOverlaySticky(this.overlayQueue[len].params);
							}
							this.setApiParams({ selectedWords: [] });
							this.grabTopWords();
						}
					},
					scope : this
				}
			}
		});
		
		this.documentStore = Ext.create("Voyant.data.store.DocumentTerms", {
			listeners : {
				'load' : {
					fn : function(store, records, success) {
//						console.log('document store: load')
						this.initData(records,'document');
						this.prepareData();
						
						//for shiftcount > 0 exclusively
						var len = this.shiftCount;
						while(len-- > 0){
						//for(var j = 0; j < this.shiftCount; j++){
							this.displayData.shift();
						}
						
						if (this.chart != null) {
							this.redraw();
						} else {
							this.initializeChart();
						}
						
						this.setVisibleSegments();
						this.redrawSliderOverlay();
						
						if(this.reselectTop == true) {
							var len = this.overlayQueue.length;
							while(len-->0){
								this.manageOverlaySticky(this.overlayQueue[len].params);
							}
							this.setApiParams({ selectedWords: [] });
							this.grabTopWords();
						}
					}
					,scope : this
				}
			}
		});
		
		//number of segments that the document is divided into
		var segments = 5;
		this.segments = new Ext.Button({
			text: this.localize('segments')
			,tooltip : this.localize('segmentsTip')
			,menu: new Ext.menu.Menu({
				items : [
						new Ext.menu.CheckItem({text:'5',checked:segments==5,group:'segments'})
						,new Ext.menu.CheckItem({text:'10',checked:segments==10,group:'segments'})
						,new Ext.menu.CheckItem({text:'15',checked:segments==15,group:'segments'})
						,new Ext.menu.CheckItem({text:'20',checked:segments==20,group:'segments'})
						,new Ext.menu.CheckItem({text:'25',checked:segments==25,group:'segments'})
						,new Ext.menu.CheckItem({text:'30',checked:segments==30,group:'segments'})
						,new Ext.menu.CheckItem({text:'40',checked:segments==40,group:'segments'})
						,new Ext.menu.CheckItem({text:'50',checked:segments==50,group:'segments'})
						,new Ext.menu.CheckItem({text:'75',checked:segments==75,group:'segments'})
						,new Ext.menu.CheckItem({text:'100',checked:segments==100,group:'segments'})
					]
				,listeners : {
					click : {
						fn : function(menu, item) {
							this.numDataPoints = parseInt(item.text);
							this.setApiParams({bins: parseInt(item.text)});
							this.loadStore();
						}
						,scope : this
					}
				}
			})
		});
		
		//number of bins that are visible
		var visibleSegments = 5;
		this.visibleSegments = new Ext.Button({
			text: this.localize('visibleSegments')
			,tooltip: this.localize('visibleSegmentsTip')
			,menu: new Ext.menu.Menu({
				items: [
						new Ext.menu.CheckItem({text:'5',checked:visibleSegments==5,group:'visibleSegments'})
						,new Ext.menu.CheckItem({text:'10',checked:visibleSegments==10,group:'visibleSegments'})
						,new Ext.menu.CheckItem({text:'15',checked:visibleSegments==15,group:'visibleSegments'})
						,new Ext.menu.CheckItem({text:'20',checked:visibleSegments==20,group:'visibleSegments'})
						,new Ext.menu.CheckItem({text:'25',checked:visibleSegments==25,group:'visibleSegments'})
						,new Ext.menu.CheckItem({text:'30',checked:visibleSegments==30,group:'visibleSegments'})
						,new Ext.menu.CheckItem({text:'40',checked:visibleSegments==40,group:'visibleSegments'})
						,new Ext.menu.CheckItem({text:'50',checked:visibleSegments==50,group:'visibleSegments'})
						,new Ext.menu.CheckItem({text:'75',checked:visibleSegments==75,group:'visibleSegments'})
						,new Ext.menu.CheckItem({text:'100',checked:visibleSegments==100,group:'visibleSegments'})
					]
				,listeners : {
					click : {
						fn: function(menu, item) {
							//console.log('visibleSegments')
							this.numVisPoints = parseInt(item.text);
							this.setApiParams({visibleBins: parseInt(item.text)});
    						this.loadStore();
						}
						,scope : this
					}
				}
			})
		});
		
		//fraction of words that are visible
		var fraction = 100;
		this.fraction = new Ext.Button({
			text: this.localize('fraction')
			,tooltip: this.localize('fractionTip')
			,menu: new Ext.menu.Menu({
				items: [
				         new Ext.menu.CheckItem({text:'200',checked:fraction==100,group:'fraction'})
				         ,new Ext.menu.CheckItem({text:'180',checked:fraction==70,group:'fraction'})
				         ,new Ext.menu.CheckItem({text:'160',checked:fraction==60,group:'fraction'})
				         ,new Ext.menu.CheckItem({text:'140',checked:fraction==50,group:'fraction'})
				         ,new Ext.menu.CheckItem({text:'120',checked:fraction==40,group:'fraction'})
						 ,new Ext.menu.CheckItem({text:'100',checked:fraction==30,group:'fraction'})
						 ,new Ext.menu.CheckItem({text:'80',checked:fraction==20,group:'fraction'})
						 ,new Ext.menu.CheckItem({text:'60',checked:fraction==15,group:'fraction'})
						 ,new Ext.menu.CheckItem({text:'40',checked:fraction==10,group:'fraction'})
						 ,new Ext.menu.CheckItem({text:'20',checked:fraction==5,group:'fraction'})
					]
				,listeners: {
					click: {
						fn: function(menu, item) {
							// TODO fires twice?
							this.setApiParams({limit: parseInt(item.text)});
    						this.loadStore();
						}
						,scope : this
					}
				}
			})
		});
		
		this.typeSearch = Ext.create('Voyant.widget.QuerySearchField', {
			width: 100
        });
		
		this.toggleLeft = new Ext.Button({
			text: this.localize('toggleLeft')
			,tooltip : this.localize('toggleLeftTip')
			,listeners : {
				'click' : {
					fn : function() {
						//if the the graphics are already in the midst of transitioning ignore any other clicks
				    	if(!this.isTransitioning){
				    		this.toggleLeftCheck();
				    	} else {
				    		if(this.transitionCall === 'right'){
								this.continueTransition = false;
								setTimeout(function () {
									if (!toolObject.isTransitioning) {
								    	toolObject.toggleLeftCheck();
								    }
								}, toolObject.duration.getValue() + 50);
				    		}
				    	}
					}							
					,scope : this
				}
			}
		});
		
		this.toggleRight = new Ext.Button({
			text: this.localize('toggleRight')
			,tooltip : this.localize('toggleRightTip')
			,listeners : {
				'click' : {
					fn : function() {
						toolObject = this;
						
						//if the the graphics are already in the midst of transitioning ignore any other clicks
				    	if(!this.isTransitioning) {
				    		this.toggleRightCheck();
				    	} else {
				    		if(this.transitionCall === 'left'){
								this.continueTransition = false;
								setTimeout(function () {
									if (!toolObject.isTransitioning) {
								    	toolObject.toggleRightCheck();
								    }
								}, toolObject.duration.getValue() + 50);
				    		}
				    	}
					}							
					,scope : this
				}
			}
		});
		
		//stop the chained animation
		this.stop = new Ext.Button({
			text: this.localize('stop')
			,tooltip : this.localize('stopTip')
			,listeners : {
				'click' : {fn : function() {
						this.continueTransition = false;
					}					
					,scope : this
				}
			}
		});
		
		//reset to beginning
		this.resetButton = new Ext.Button({
			text: this.localize('reset')
			,tooltip : this.localize('resetTip')
			,listeners : {
				'click' : {fn : function() {
						//reset to beginning
						setTimeout(function(){
							toolObject.shiftCount = 0;
							toolObject.prepareData();
							toolObject.redraw();
						}, 1000);
					}					
					,scope : this
				}
			}
		});
		
		this.duration = new Ext.Slider({
			text : this.localize('duration')
			,tooltip : this.localize('durationTip')
			,width : 80
			,minValue : 5000
			,maxValue : 2000
		});
		
		/*Ext.applyIf(config, {
			iconCls : 'chart-line'
			,bbar: [this.toggleLeft,'-',this.toggleRight,'-',this.duration,'-',this.displayPanel,'-',this.typeSearch]
		});*/
		Ext.apply(config, {
			title: this.localize('title'),
			bbar: new Ext.Toolbar({
	            enableOverflow: true,
	            items: [this.toggleLeft,this.stop,this.toggleRight,'-',this.resetButton,'-',this.localize('scrollSpeed')+':',this.duration,'-',this.fraction,'-',this.segments,this.visibleSegments,'-',this.typeSearch]
			})
		});
		
		this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
		
    	// TODO
		var manageCorpusTypeSelect = function(data) {
			//console.log('fn: manageCorpusTypeSelect')
			var datatype = [];
			if(typeof data.type == 'string'){
				datatype = [data.type];
			}
			else{
				datatype = data.type;
			}
			
			//check against overlayQueue
			//if a word is in first not in second de-select
			//if a word is in both do nothing
			//if a word is not in first but in second select
			var toggleWords = [];
				
			for(var i = 0; i < toolObject.overlayQueue.length; i++){
				var isntInArray = true;
				//toggleWords.push(toolObject.overlayQueue[i]);
				for(var j = 0; j < datatype.length; j++){
					if(toolObject.overlayQueue[i].word == datatype[j]){
						isntInArray = false;
					}
				}
				if(isntInArray) toggleWords.push(toolObject.overlayQueue[i].word);
			}
			
			for(var i = 0; i < datatype.length; i++){
				var isntInArray = true;
				for(var j = 0; j < toolObject.overlayQueue.length; j++){
					if(toolObject.overlayQueue[j].word == datatype[i]){
						isntInArray = false;
					}
				}
				if(isntInArray) toggleWords.push(datatype[i]);
			}
			
			return toggleWords;
		};
		
		var selectWord = function(wordToSelect) {
			//console.log('fn: selectWord')
			var foundWord = false,
				len = toolObject.records.length;
			while(len-- > 0){
	    		if(toolObject.records[len].data.type === wordToSelect){
	    			foundWord = true;
	    			var info = {wordString : toolObject.records[len].data.type
	    				,docId : toolObject.records[len].data.docId};
	    			var paramsBundle = toolObject.buildParamsBundle(info);
	    			toolObject.manageOverlaySticky(paramsBundle);
	    		}
	    	}
	    	if(!foundWord){
    			//remove limit 
    			toolObject.setApiParams({limit: 500});
    			toolObject.grabAbsentWords(wordToSelect);
    		}
		};
		
		/**
		 * @event corpusTypesSelected
		 * @type listener
		 */
		this.addListener('corpusTermsClicked', function(src, terms){
			if (this.getCorpus().getDocumentsCount() > 1) {
        		terms.forEach(function(term) {
        			var t = term.getTerm();
        		});
        		
        		// TODO old code
//				var toggleWords = manageCorpusTypeSelect(data);
//				//if word isn't already added
//				var notAdded = true,
//					lenA = toggleWords.length,
//					lenB = toolObject.overlayQueue.length;
//				while(lenA-- > 0){
//					while(lenB-- > 0){
//						if(data.type[lenA] == toolObject.overlayQueue[lenB]) notAdded = false;
//					}
//					if(notAdded){
//						//select word
//						selectWord(toggleWords[lenA]);	
//					}
//				}
			} else {
				this.loadStore();
			}
		});
		
		this.addListener('documentTermsClicked', function(src, terms){
			//if(this.hasLogger) console.log('fn: documentTypeSelected');
			if(src && src.xtype==this.xtype) {return false;}
			
			terms.forEach(function(term) {
    			var t = term.getTerm();
    		});
			
			// TODO old code
//			if(data.type) {
//				//select word
//				var len = this.records.length;
//				while(len-- > 0){
//    	    		if(this.records[len].data.type === data.type) {
//    	    			var info = {wordString : this.records[len].data.type
//    	    				,docId : this.records[len].data.docId
//    	    			};
//    	    			var paramsBundle = this.buildParamsBundle(info);
//    	    			this.manageOverlaySticky(paramsBundle);
//    	    		}
//    	    	}
//			} else {
//				this.loadStore();
//			}
		});
		
		this.on('query', function(src, query){
			if (Ext.isString(query)) {this.fireEvent("termsClicked", src, [query]);}
	    });
		
		this.on("termsClicked", function(src, terms) {
			// orig code
//	    	var found = false;
//	    	if(this.records.length == this.recordslength) //console.log("this.records.length == this.recordslength");
//	    	var len = this.records.length;
//			while(len-- > 0){
//	    		if(this.records[len].data.type === type) {
//	    			var info = {wordString : this.records[len].data.type
//	    				,docId : this.records[len].data.docId
//	    			};
//	    			var paramsBundle = this.buildParamsBundle(info);
//	    			this.manageOverlaySticky(paramsBundle);
//	    		found = true;
//	    		}
//	    	}
//	    	if(!found){
//	    		window.alert(type + " was not found in the " + this.getApiParam('mode'));
//	    	}
			
			// trends code
//    		if (this.getCorpus()) { // make sure we have a corpus
//        		var queryTerms = [];
//        		terms.forEach(function(term) {
//        			if (Ext.isString(term)) {queryTerms.push(term)}
//        			else if (term.term) {queryTerms.push(term.term);}
//        			else if (term.getTerm) {queryTerms.push(term.getTerm());}
//        		});
//        		if (queryTerms) {
//        			
//            		if (this.getApiParam('mode')!=this.MODE_CORPUS && this.getCorpus().getDocumentsCount()>1) {
//            			this.setApiParams({
//            				'mode': this.MODE_CORPUS,
//            				'docIndex': undefined,
//            				'docId': undefined
//            			});
//            		}
//        			this.setApiParams({
//        				query: queryTerms
//        			});
//            		if (this.isVisible()) {
//                		this.loadFromCorpus(this.getCorpus());
//            		}
//        		}
//    		}
    	});
		
		/**
		 * @event CorpusTypeFrequenciesResultLoaded
		 * @type listener
		 */
		this.addListener('CorpusTypeFrequenciesResultLoaded', function(src, data) {
			if (src==this) {
				this.initData(this.corpusTypeReader.readRecords(data).records, 'corpus');
				this.prepareData();
				
				this.initChart();
				this.drawXAxis();
				this.drawYAxis();
				this.drawChart();
				this.drawSlider();
				this.drawVerticalSlider();
				this.initLegend();
				this.transitionCall = 'draw';
				
				this.setVisibleSegments();
				this.grabTopWords();
				this.startScroll();
			}
		}, this);
			
		/**
		 * @event DocumentTypeFrequenciesResultLoaded
		 * @type listener
		 */
		this.addListener('DocumentTypeFrequenciesResultLoaded', function(src, data) {
			if (src==this) {	
				this.initData(this.documentTypeReader.readRecords(data).records, 'document');
				this.prepareData();
				
				this.initChart();
				
				this.drawXAxis();
				this.drawYAxis();
				this.drawChart();
				this.drawSlider();
				this.drawVerticalSlider();
				this.initLegend();
				this.transitionCall = 'draw';
			    
				this.setVisibleSegments();
				this.grabTopWords();
				this.startScroll();
			}
		}, this);
		
		this.on("loadedCorpus", function(src, corpus) {
    		this.setCorpus(corpus);
    		this.documentStore.setCorpus(corpus);
    		this.corpusStore.setCorpus(corpus);
    		
    		var params = this.getApiParams();
			if (params.type) {
				delete params.limit;
			}
			if (params.mode=='document' || this.getCorpus().getDocumentsCount() == 1) {
				this.documentStore.load({params: params});
			} else {
				this.corpusStore.load({params: params});
			}
    	}, this);
		
		/**
		 * @event resize
		 * @type listener
		 * 
		 */
		this.addListener('resize', function() {
			//console.log('resize')
			if(this.chart) {
				var h = this.body.getHeight(),
					w = this.body.getWidth();
				
				this.chart.attr('height', h)
					.attr('width', w);
					
				this.setTitleLength();
				
				if(this.largestH < h && this.largestW < w) {
					this.chart.select('rect[class=clipping-rectangle]')
				        .attr("x", 0)
				        .attr("y", this.navigationHeight + (this.tPadding * 2))
				        .attr("width", w)
				        .attr("height", h - this.navigationHeight);
					this.largestH = h;
					this.largestW = w;
				}
			
				this.redraw();	
				this.redrawSliderOverlay();
			}
		}, this);
	}
	
	//
	//DATA FUNCTIONS
	//	

	,initData: function (records, mode) { 	
		//console.log("fn: initData")
		//console.profile('profilethis')
		this.records = records;
		this.setApiParams({mode: mode});
		
		this.recordsLength = this.records.length;
	
		this.numVisPoints = parseInt(this.getApiParam('visibleBins'));
		this.shiftCount = parseInt(this.getApiParam('position'));
		
		if(mode === 'document') {
			this.numDataPoints = this.records[0].get('distributions').length;
			if(this.numDataPoints !== this.getApiParam('bins')){
				this.numDataPoints = parseInt(this.getApiParam('bins'));
				this.loadStore();
			}
		} else {
			this.numDataPoints = this.records[0].get('distributions').length;
		}
		
		//prepare parameters for either corpus mode or document mode
		var idStringStart = 'this.records[',
			idStringEnd;
		
		if(this.getApiParam('mode') === 'document') { 
			idStringEnd = '].data.docId';
		}
		
		if(this.getApiParam('mode') === 'corpus') {
			idStringEnd = '].id';
		}
		
    	this.counterSeries = [];
    	var transferArray = [];
			
    	//find max frequency value
    	this.absMaxFreq = 0;
		for( var k = 0; k < this.numDataPoints; k++ ) { 
	        for( var p = 0; p < this.recordsLength; p++ ) {
	        	if(this.records[p].get('distributions')[k] > this.absMaxFreq) {
	        		this.absMaxFreq = this.records[p].get('distributions')[k];
	        	}
	        }
		}
			    
		//find the absolute minimum frequency value
		//first start by setting the minimum frequency to the maximum frequency
		this.absMinFreq = this.absMaxFreq;
		for( var k = 0; k < this.numDataPoints; k++ ) { 
	        for( var p = 0; p < this.recordsLength; p++ ) {
	        	if(this.records[p].get('distributions')[k] <= this.absMinFreq && this.records[p].get('distributions')[k] !== 0) { 
	        		this.absMinFreq = this.records[p].get('distributions')[k];
	        	}
	        }
		}
		
		//Calculate the lower value of the y axis, must be > 0 
		if( this.absMinFreq < 0) {
			this.absMinFreq = 0;
		}
		
		this.minFreq = this.absMinFreq * 1.01;
		
	    //transfer all of the relevant data from 'records' to an array 'allData'
		for( var k = 0; k < this.numDataPoints; k++ ) { 
	        for( var p = 0; p < this.recordsLength; p++ ) {
	        	var rec = this.records[p];
	        	var dists = rec.get('distributions')[k];
	        	if (dists > this.minFreq && dists <= this.absMaxFreq) {
	        		transferArray.push({
	        			freq: dists,
		                wordString: rec.get('term'),
		                counter: k,
		                posInSeries: 0, 
		                numInSeries: 0,
		                docId: rec.get('docId')
		            });
	        	} else { //do nothing
	        	}
	        }
	        this.counterSeries.push(transferArray);
	        transferArray = [];
	    }
	}

	,prepareData: function() {
		//console.log("fn: prepareData")
	    var frequencySeries = [],
	    	copy1 = [],
	    	copy2 = [],
	    	copy3 = [],
	    	copy4 = [],
	    	check = 0;
		
		this.allData = [];
		this.displayData = [];
		
		//set the number of points to be displayed at once
		if(this.numDataPoints < this.numVisPoints) {
			this.numVisPoints = this.numDataPoints;
		}
		
		if(this.numDataPoints <= 5) {
			this.visibleSegments.setDisabled(true);
		} else {
			this.visibleSegments.setDisabled(false);
		}
		
		if(this.numDataPoints <= this.numVisPoints) {
			this.toggleLeft.setDisabled(true);
			this.toggleRight.setDisabled(true);
		} else {
			this.toggleLeft.setDisabled(false);
			this.toggleRight.setDisabled(false);
		}
		
		//adjust shiftCount if it for some reason is out of the normal range
		if(this.shiftCount + this.numVisPoints > this.numDataPoints){ 
			this.shiftCount = this.numDataPoints - this.numVisPoints; 
		}
		
	    for( var k = 0; k < this.numDataPoints; k++ ) {
			check1 = 0; //add a single first data point
	    	for(var p = 0; p < this.counterSeries[k].length; p++ ) {
	    			
    			check2 = 0; //check will make sure a data point is not added to a series more than once
    			
	    		//add very first point, this is done like this so the for loop can use the .length operator
	    		if(check1 === 0){
			    	copy1.push(this.counterSeries[k][p]);
			    	copy2.push({freq: this.counterSeries[k][p].freq,
		    			frequencyArray: copy1,
		    			numInSeries: 0
		    		});
		    		frequencySeries.push(copy2);
		    		
		    		copy1 = [];
		    		copy2 = [];
		    		check1 = 1;
		    		check2 = 1;
	    		}
	    		
	    		//checks if a given frequency has an existing 'series' that the data point can be grouped into
	    		for( var l = 0; l < frequencySeries[k].length && check2 === 0; l++) {
					if(this.counterSeries[k][p].freq === frequencySeries[k][l].freq) {
						var inSeries = 0; 
						inSeries = frequencySeries[k][l].numInSeries;
						this.counterSeries[k][p].posInSeries = ++inSeries;
						frequencySeries[k][l].numInSeries = inSeries;
						frequencySeries[k][l].frequencyArray.push(this.counterSeries[k][p]);
						check2 = 1;
					}	
	    		}
	    		
	    		//if there is no existing series then create a new one
	    		if(check2 === 0) {
					copy4.push(this.counterSeries[k][p]);
		    		frequencySeries[k].push({freq: this.counterSeries[k][p].freq,
		    			frequencyArray: copy4,
		    			numInSeries: 0
		    		});
		    		copy4 = [];
		    		check2 = 1;
				}
	    	}	
	    	//if counterSeries[k] is empty add or there is no eligible value add an empty array to frequencySeries such that frequencySeries[k] is not undefined
	    	if(this.counterSeries[k].length < 1 || check1 === 0) {  
	    		frequencySeries.push([]);
    		}
	    }
	    
	    for( var k = 0; k < this.numDataPoints; k++ ) {
	    	for( var p = 0; p < frequencySeries[k].length; p++) {
	    		++frequencySeries[k][p].numInSeries;
	    		for( var l = 0; l < frequencySeries[k][p].frequencyArray.length; l++) {
	    			frequencySeries[k][p].frequencyArray[l].numInSeries = frequencySeries[k][p].numInSeries;
	    		}
	    	}
	    }
	    
	    var allDataSetup = [];
	    
	    //add the selected points into the array that will be used to display the data
	    for( var k = 0; k < this.numDataPoints; k++ ) {
	        this.allData.push({allDataInternal: frequencySeries[k],
	            outerCounter: k});
	    }
	    
    	var displaySetup = [],
    		transferArray = [];
		
	    //transfer the first x points (= numVisPoints, the number of points to be visualized)
	    //into an array that will be used to display the data
	    for( var k = 0; k < this.numVisPoints + this.shiftCount; k++ ) { 
	        for( var p = 0; p < this.recordsLength; p++ ) {
	        	if(this.allData[k].allDataInternal[p]) {
		            transferArray.push({freq: this.allData[k].allDataInternal[p].freq,
		                inSeries: this.allData[k].allDataInternal[p].numInSeries,
		                frequencyArray: this.allData[k].allDataInternal[p].frequencyArray,
		                dotObject: [{counter: k, freq: this.allData[k].allDataInternal[p].freq}]
		            });
	        	}
	        }
	        displaySetup.push(transferArray);
	        transferArray = [];
	    }
	    
	    //add the selected points into the array that will be used to display the data
	    for( var k = 0; k < this.numVisPoints + this.shiftCount; k++ ) {
	        this.displayData.push({displayInternal: displaySetup[k],
	            outerCounter: k});
	    }
	    displaySetup = [];
	}
	
	//TRANSITION FUNCTIONS
	
	//disable forward back if moving, disable pause if stopped, disable back if at beginning
	,manageMvtButtons: function () {
		//console.log('fn: manageMvtButtons')
		if(this.isTransitioning === true) {
			this.toggleRight.setDisabled(true);
			this.toggleLeft.setDisabled(true);
			this.stop.setDisabled(false);
		}
		if(this.isTransitioning === false) {
			this.toggleRight.setDisabled(false);
			this.toggleLeft.setDisabled(false);
			this.stop.setDisabled(true);
			
			if(this.shiftCount === 0){
				this.toggleLeft.setDisabled(true);
			} else {
				this.toggleLeft.setDisabled(false);
			}
			
			if(this.shiftCount + this.numVisPoints === this.numDataPoints){
				this.toggleRight.setDisabled(true);
			} else {
				this.toggleRight.setDisabled(false);
			}
		}	
	}
	
    //provides the next value to the left     
    ,nextR: function () {
    	//console.log('fn: nextR')
    	
    	var displaySetup = [];
    	//this.displayData.shift();
		
    	for( var p = 0; p < this.recordsLength; p++ ) {
    		if(this.allData[this.numVisPoints + this.shiftCount].allDataInternal[p]) {
	            displaySetup.push({freq: this.allData[this.numVisPoints + this.shiftCount].allDataInternal[p].freq,
	            	inSeries: this.allData[this.numVisPoints + this.shiftCount].allDataInternal[p].numInSeries,
	            	frequencyArray: this.allData[this.numVisPoints + this.shiftCount].allDataInternal[p].frequencyArray,
	                dotObject: [{counter: this.numVisPoints + this.shiftCount, freq: this.allData[this.numVisPoints + this.shiftCount].allDataInternal[p].freq}]
	            });
    		}
        }
        
	    this.displayData.push({displayInternal: displaySetup, outerCounter: this.numVisPoints + this.shiftCount});
	    displaySetup = [];
    }
    
    //verifies that data CAN be moved to the right
    ,toggleRightCheck: function () {
    	//console.log("fn: toggleRightCheck")
    	toolObject = this;
    	if(this.numVisPoints + this.shiftCount < this.numDataPoints) {
    		//manage transition movements and controls
    		this.isTransitioning = true;
    		this.continueTransition = true;
    		this.manageMvtButtons();
    		
    		//draw
	        this.nextR();
			this.shiftCount = ++this.shiftCount;
			this.manageXScale();
			this.setApiParams({position: this.shiftCount});
			this.transitionCall = 'right';
			this.animateVis();
			this.displayData.shift();
		} else {
    		//manage transition movements and controls
			this.isTransitioning = false;
			this.continueTransition = false;
			this.manageMvtButtons();
		}
    }
    
    //provide the next value
    ,nextL: function () {
    	//console.log('fn: nextLeft')
    	var displaySetup = [];
        
        for( var p = 0; p < this.recordsLength; p++ ) {
        	if(this.allData[this.shiftCount].allDataInternal[p]) {
        		displaySetup.push({freq: this.allData[this.shiftCount].allDataInternal[p].freq,
	            	inSeries: this.allData[this.shiftCount].allDataInternal[p].numInSeries,
	            	frequencyArray: this.allData[this.shiftCount].allDataInternal[p].frequencyArray,
	                dotObject: [{counter: this.shiftCount, freq: this.allData[this.shiftCount].allDataInternal[p].freq}]
	            });
        	}
        }
	    this.displayData.unshift({displayInternal: displaySetup, outerCounter: this.shiftCount});
        displaySetup = [];
    }
    
    ,toggleLeftCheck: function () {    	
    	//console.log("fn: toggleLeftCheck")
    	if(this.shiftCount > 0) {
    		//manage transition movement and controls
    		this.isTransitioning = true;
			this.continueTransition = true;
			this.manageMvtButtons();
			
			//draw
			this.shiftCount = --this.shiftCount;
			this.manageXScale();
			this.setApiParams({position: this.shiftCount});
	        this.nextL();
			this.transitionCall = 'left';
	        this.animateVis();
	        this.displayData.pop();
		} else {
			//manage transition movements and controls
			this.isTransitioning = false;
			this.manageMvtButtons();
		}
    }
    
    ,grabTopWords: function () {
    	toolObject = this;
    	
    	var corpusTerms = this.getCorpus().getCorpusTerms();
    	corpusTerms.load({
    		scope: this,
    		params: this.getApiParams(),
    		callback: function(records, operation, success) {
    			if(success) {
					var json = Ext.decode(response.responseText);
					var store = new Ext.data.JsonStore({
						fields: Voyeur.data.CorpusTypes.fields
						,data: json.corpusTypes.types
					});
					//check if there is a list of words stored in the API param values if note display top three most frequent words
					var data = this.getApiParam('selectedWords');
					if(data.length > 0) {
						//continue with current array
						for(var j = 0; j < data.length; j++){
							for(var i = 0; i < toolObject.records.length; i++) {
		        	    		if(toolObject.records[i].data.type === data[j]) {
		        	    			var info = {wordString : toolObject.records[i].data.type
		        	    				,docId : toolObject.records[i].data.docId
		        	    			};
		        	    			var paramsBundle = toolObject.buildParamsBundle(info);
		        	    			toolObject.manageOverlaySticky(paramsBundle);
		        	    		}
		        	    	}
						}
					} else {
						//clear and populate with top three
						data = [];
						store.each(function(item) {
							data.push({type: item.get('type')});
						})
						for(var j = 0; j < 3; j++){
							for(var i = 0; i < toolObject.records.length; i++) {
		        	    		if(toolObject.records[i].data.type === data[j].type) {
		        	    			var info = {wordString : toolObject.records[i].data.type
		        	    				,docId : toolObject.records[i].data.docId
		        	    			};
		        	    			var paramsBundle = toolObject.buildParamsBundle(info);
		        	    			toolObject.manageOverlaySticky(paramsBundle);
		        	    		}
		        	    	}
						}
					}
				}
    		}
    	});
    }
    
    ,startScroll: function() {
    	//console.log("fn: startScroll")
    	if(toolObject.numDataPoints > toolObject.numVisPoints && toolObject.shiftCount === 0){
			//manage transition movements and controls
			toolObject.isTransitioning = true;
			this.manageMvtButtons();
    		
    		//repeat transition
			setTimeout(function(){
				toolObject.toggleRightCheck();
			},3000);
		}
    }
    
    //find words from the records that originally did not make it past the limit
	,grabAbsentWords: function (absentWord) {
    	toolObject = this;
    	var corpusTerms = this.getCorpus().getCorpusTerms();
    	corpusTerms.load({
    		scope: this,
    		params: this.getApiParams(),
    		callback: function(records, operation, success) {
				toolObject.selectedRecords = [];
				var json = Ext.decode(response.responseText);
				var store = new Ext.data.JsonStore({
					fields: Voyeur.data.CorpusTypes.fields
					,data: json.corpusTypes.types
				});
				//check if there is a list of words stored in the API param values if not display top three most frequent words
				var data = this.getApiParam('selectedWords'),
					lenB = store.data.items.length;
				for(var i = 0; i < lenB; i++) {
    	    		if(store.data.items[i].data.type === absentWord) {
						toolObject.records.push(store.data.items[i]);
						
						var info = {wordString : store.data.items[i].data.type
		    				,docId : store.data.items[i].data.docId};
		    			var paramsBundle = toolObject.buildParamsBundle(info);
		    			toolObject.manageOverlaySticky(paramsBundle);
    	    		}
    	    	}
			}
		});
    }
    
    //
    //DISPLAY FUNCTIONS
    //
	
	
	// init and draw everything
	,initializeChart: function() {
		this.initChart();
		
		this.drawXAxis();
		this.drawYAxis();
		this.drawChart();
		this.drawSlider();
		this.drawVerticalSlider();
		this.initLegend();
		this.transitionCall = 'draw';
	}
	
    ,redraw: function() {
//    	console.log("fn: redraw")
    	this.transitionCall = 'redraw';
    	this.updateFullPath();
		this.redrawXAxis();
		this.redrawYAxis();
		this.redrawChart();
		this.redrawSlider();
		this.redrawVerticalSlider();
		this.redrawChartOverlay();
		this.redrawLegend();
    }
    
	,initChart: function () {
//		console.log('fn: initChart')
		
		var innerCt = this.body.query('div[class$=innerCt]', false)[0];
		
		var h = innerCt.getHeight(),
			w = innerCt.getWidth();
    
		//create main SVG Element
		var chartSVG = innerCt.appendChild(Ext.DomHelper.createDom('<svg class="chart" width="'+w+'" height="'+h+'"></svg>'), true);
	    this.chart = d3.select(chartSVG);
	    
		this.largestW = w;
		this.largestH = h - this.navigationHeight;
	    	    
	    this.chart.append('clipPath')
	        .attr('id', 'clip1')
	      .append('rect')
	      	.attr('class', 'clipping-rectangle')
	        .attr("x", 0)
	        .attr("y", this.navigationHeight + (this.tPadding * 2))
	        .attr("width", w)
	        .attr("height", h - this.navigationHeight);
	    
	    this.chart.append('g')
	    	.attr('class','overlay')
	    	.attr("clip-path", "url(#clip1)");
	    
	    //disable changing the number of bins
	    if(this.getApiParam('mode') === 'corpus') {
			this.segments.setDisabled(true);
		}
		
	    this.scaleCall = this.getApiParam('yAxisScale');
	    
		//depending on the size of display set the length that labels can be
		this.setTitleLength();
	}
    
    ,xAxis: {}
    ,xAxisScale: d3.svg.axis()
    
    ,drawXAxis: function() {
    	var toolObject = this;
    	//svg element constants
		var h = this.body.getHeight(),
			w = this.body.getWidth();
    	
		//initialize x scales
		this.manageAllXScales();
			
    	//define X axis
		this.xAxisScale.scale(toolObject.xScale)
		    .orient('bottom')
		    .ticks(Math.round(toolObject.numVisPoints))
		    .tickFormat(function(d){
		    	var val;
		    	if(toolObject.getApiParam('mode') === 'document') { 
					val = 'Segment ' + (parseInt(d) + 1);
				}
				if(toolObject.getApiParam('mode') === 'corpus') {
					val = d + 1 + '. ' + toolObject.titlesArray[d];
				}
				return val;
		    });
		
		//draw the x-axis
		this.xAxis = this.chart.append('g')
    		.attr('class', 'axisX')
    		.attr('transform', 'translate(0,' + (h - this.bPadding) + ')')
    		.call(this.xAxisScale);
    	
    	this.xAxis.selectAll('text')
			.on('mouseover', function () {
				d3.select(this)
					.attr('fill', 'red')
					.style("font-size", '18px');
			})
			.on('mouseout', function () {
				d3.select(this)
					.attr('fill', 'black')
					.style("font-size", '11px');
			});
		this.styleXAxis();
    }
    
    ,styleXAxis: function() {
    	this.xAxis.selectAll('text')
	        .style('font-family', 'sans-serif')
	        .style('font-size', '11px');

	    this.xAxis.selectAll('line')
	        .style('fill','none')
	        .style('stroke','black')
	        .style('shape-rendering', 'crispEdges');
	        
	    this.xAxis.selectAll('path')
	        .style('fill','none')
	        .style('stroke','black')
	        .style('shape-rendering', 'crispEdges');
    }
    
    ,redrawXAxis: function() {
    	this.chart.selectAll('g[class=axisX]')
			.remove();
		
		this.drawXAxis();
    }
    
    ,yAxis: {}
    ,yAxisScale: d3.svg.axis()
    
    ,drawYAxis: function() {
    	var toolObject = this;
    	
    	//svg element constants
		var h = this.body.getHeight(),
			w = this.body.getWidth();
		
		//initialize Y scales
		this.manageAllYScales();
    	
    	var yTicksScale = d3.scale.linear()
			.domain([200,700])
			.range([5,15]);
			
		var numberFormat = d3.format(".2r");
		function logFormat(d) {
			var x = Math.log(d) / Math.log(10) + 1e-6;
			return Math.abs(x - Math.floor(x)) < .7 ? numberFormat(d) : "";
		} 
		
		this.yAxisScale.scale(toolObject.yScale)
	    	.orient('left')
	    	.ticks(yTicksScale(this.body.getHeight()))
	    	.tickFormat(logFormat)
			.tickSize(-w + this.rPadding + this.lPadding);
		
		//draw the y-axis
		this.yAxis = this.chart.append('g')
	    	.attr('class', 'axisY')
	    	.attr('transform', 'translate(' + this.lPadding + ',0)')
	    	.call(this.yAxisScale);
		
	    this.yAxis.selectAll('text')
	        .style('font-family', 'sans-serif')
	        .style('font-size', '11px');
	    
	    //controls horizontal grid line-opacity
	    this.yAxis.selectAll('line')
	        .style('fill','none')
	        .style('stroke','black')
	        .style('shape-rendering', 'crispEdges')
	        .style('stroke-opacity', 0.05);
	        
	    this.yAxis.selectAll('path')
	        .style('fill','none')
	        .style('stroke','black')
	        .style('shape-rendering', 'crispEdges');
    }
    
    ,redrawYAxis: function() {
    	this.chart.selectAll('g[class=axisY]')
			.remove();
		
		this.drawYAxis();
    }
    
    ,drawChart: function() {
    	var toolObject = this;
    	
    	//create graph text
	    //attach the nested data to svg:g elements
		var counterSeriesDiv = this.chart.selectAll('g[class=section]')
	        .data(toolObject.displayData, function(d) { return d.outerCounter; })
	      .enter().append('g')
	        .attr('class', 'section')
	        .attr("clip-path", "url(#clip1)");
		
		var frequencySeriesDiv = counterSeriesDiv.selectAll('g')
			.data(function(d) { return d.displayInternal; })
	      .enter().append('g')
	        .attr('class', 'frequencies')
	        .on('mouseover', function() {
				d3.select(this).style('fill', 'red');
			})
			.on('mouseout', function() {
	            d3.select(this).style('fill', 'black');
			});
	             
        //attach the frequency data to data points 
		var dataPoint = frequencySeriesDiv.selectAll('text')
    		.data(function(d) { return d.frequencyArray; })
		  .enter().append('text')
	        .attr('class', function(d) {
	        	return toolObject.removeFilteredCharacters(d.wordString);
	        })
	    	.attr('x', function (d) {
	    		var startPoint = (0.5 / d.numInSeries) - 0.5
					,valueRange = (d.posInSeries / d.numInSeries * 0.8)
					,x = d.counter + toolObject.callOffset() + startPoint + valueRange; 
				return toolObject.xScale(x);
			})
	    	.attr('y', function (d) { 
				var y = d.freq;
				return toolObject.yScale(y);
	    	})
	    	.attr('text-anchor', 'middle')
	    	.attr('transform', function (d) {
	    		var startPoint = (0.5 / d.numInSeries) - 0.5
					,valueRange = (d.posInSeries / d.numInSeries * 0.8)
					,x = d.counter + toolObject.callOffset() + startPoint + valueRange
					,y = d.freq;
	    		return 'translate(0, 0) rotate(-20 ' + toolObject.xScale(x) + ' '+ toolObject.yScale(y) + ')';
	    	})
	    	.style('font-size', function(d) { return toolObject.fontScale(d.freq) + 'px'; })
	    	.style('fill-opacity', function(d) { return toolObject.opacityScale(d.freq); })
	        .text(function(d) { return d.wordString; })
	        .on('mouseover', function(d) { 
	 	        d3.select(this).style('font-size', function(d) { return (toolObject.fontScale(d.freq) * toolObject.maxFont / toolObject.fontScale(d.freq)) + 'px'; });
	 	        var paramsBundle = toolObject.buildParamsBundle(d);
	 	        toolObject.manageOverlaySlippery(paramsBundle);
	        })
	        .on('mouseout', function(d) { 
	        	d3.select(this).style('font-size', function(d) { return toolObject.fontScale(d.freq) + 'px'; });
	        	var paramsBundle = toolObject.buildParamsBundle(d);
	        	toolObject.manageOverlaySlippery(paramsBundle);
	        })
	        .on('click', function(d) {
	        	var paramsBundle = toolObject.buildParamsBundle(d);
	        	toolObject.manageOverlaySticky(paramsBundle);
			})
	  	  .append('title')
	    	.text(function(d) { return d.wordString; });
    }
    
    ,redrawChart: function() {
    	this.chart.selectAll('g[class=section]')
			.remove();
			
		this.drawChart();
    }
    
    ,drawVerticalSlider: function() {
    	var h = this.body.getHeight(),
			w = this.body.getWidth();
    	
    	var totalTopOffset = (this.tPadding * 2) + this.navigationHeight
        	,lengthVer = h - (totalTopOffset + this.bPadding);
        
	    //create vertical minimap rectangle and slider
	    var sliderPosScale = d3.scale.linear()
			.domain([this.absMaxFreq, this.minFreq])
			.range([totalTopOffset, lengthVer]);
	    
	    var rectVer = this.chart.append('rect')
	  	    .attr('class', 'minimap')
	  	    .attr('x', w - (this.rPadding * 0.66))
	  	    .attr('y', totalTopOffset)
	  	    .attr('rx', 3.33)
	  	    .attr('width', 6.66)
	  	    .attr('height', lengthVer)
	  	    .style('fill','aliceblue')
	  	    .style('stroke','black')
	  	    .style('stroke-width','1')
	  	    .style('fill-opacity','0.75');
	    	
	    var sliderVer = this.chart.append('rect')
			.attr('class', 'minimap')
	  	    .attr('x', w - (this.rPadding * 0.66))
	  	    .attr('y', totalTopOffset)
	  	    .attr('rx', 3.33)
	  	    .attr('width', 6.66)
	  	    .attr('height', lengthVer * ((this.absMaxFreq * this.valFraction) - this.minFreq) / this.absMaxFreq)
	  	    .style('fill','CornflowerBlue')
	  	    .style('stroke','black')
	  	    .style('stroke-width','1');
    }
    
    ,redrawVerticalSlider: function() {
    	this.chart.selectAll('rect[class=minimap]')
			.remove();
			
		this.drawVerticalSlider();
    }
    
    ,drawSlider: function() {
    	var h = this.body.getHeight(),
			w = this.body.getWidth();
	    
		//Create navigation bar
		var lengthHor = w - (this.rPadding + this.lPadding)
			,offsetVis = this.lPadding + (lengthHor * ((this.numVisPoints - 1) / 2) * ( 1 / (this.numDataPoints - 1)))
			,offsetVisStart = this.lPadding
			,offsetVisEnd = this.lPadding + (lengthHor * ((this.numVisPoints - 1) / (this.numDataPoints - 1)));
		
		var lineX = this.chart.append('line')
			.attr('class', 'sliderAxis')
			.attr('x1', this.lPadding)
			.attr('x2', this.body.getWidth() - this.rPadding)
			.attr('y1', this.tPadding + this.navigationHeight)
			.attr('y2', this.tPadding + this.navigationHeight)
			.style('shape-rendering', 'crispEdges')
			.style('stroke','black')
	  	    .style('stroke-width','1');
					
		var lineY = this.chart.append('line')
			.attr('class', 'sliderAxis')
			.attr('x1', this.lPadding)
			.attr('x2', this.lPadding)
			.attr('y1', this.tPadding + this.navigationHeight)
			.attr('y2', this.tPadding)
			.style('shape-rendering', 'crispEdges')
			.style('stroke','black')
	  	    .style('stroke-width','1');
		
	    var sliderHorStart = this.chart.append('line')
	  	    .attr('class', 'slider')
	  	    .attr('id', 'before')
	  	    .attr('x1', (lengthHor * (this.shiftCount - this.callOffset()) / (this.numDataPoints - 1)) + offsetVisStart)
	  	    .attr('x2', (lengthHor * (this.shiftCount - this.callOffset()) / (this.numDataPoints - 1)) + offsetVisStart)
	  	    .attr('y1', this.tPadding + this.navigationHeight)
	  	    .attr('y2', this.tPadding)
	  	    .style('stroke', 'black')
	  	    .style('stroke-width', '1');
	    
	    var sliderHorEnd = this.chart.append('line')
	  	    .attr('class', 'slider')
	  	    .attr('id', 'after')
	  	    .attr('x1', (lengthHor * (this.shiftCount - this.callOffset()) / (this.numDataPoints - 1)) + offsetVisEnd)
	  	    .attr('x2', (lengthHor * (this.shiftCount - this.callOffset()) / (this.numDataPoints - 1)) + offsetVisEnd)
	  	    .attr('y1', this.tPadding + this.navigationHeight)
	  	    .attr('y2', this.tPadding)
	  	    .style('stroke', 'black')
	  	    .style('stroke-width', '1');
	  	    	  	    
	   var greyBoxBefore = this.chart.append('rect')
  	    	.attr('class', 'slider')
  	    	.attr('id', 'boxBefore')
  	    	.attr('x', this.lPadding)
  	    	.attr('y', this.tPadding)
  	    	.attr('height', this.navigationHeight)
  	    	.attr('width', lengthHor * (this.shiftCount - this.callOffset()) / (this.numDataPoints - 1))
  	    	.style('fill', 'silver')
  	    	.style('fill-opacity', 0.25)
	    	.style('cursor', 'move')
	    	.call(this.sliderDrag);
	    		    
	    var greyBoxAfter = this.chart.append('rect')
	    	.attr('class', 'slider')
	    	.attr('id', 'boxAfter')
	    	.attr('x', (lengthHor * (this.shiftCount - this.callOffset()) / (this.numDataPoints - 1)) + offsetVisEnd)
	    	.attr('y', this.tPadding)
	    	.attr('height', this.navigationHeight)
	    	.attr('width', lengthHor * (this.numDataPoints - this.numVisPoints - this.shiftCount + this.callOffset()) / (this.numDataPoints - 1))
	    	.style('fill', 'silver')
	    	.style('fill-opacity', 0.25)
	    	.style('cursor', 'move')
	    	.call(this.sliderDrag);
    }
    
    ,sliderDrag: d3.behavior.drag()
        .origin(Object)
        .on('drag', function(d) {
        	if(!toolObject.isTransitioning) {
        		this.drag = true;
        		
	        	var w = toolObject.getWidth()
	        		,displaceX = parseInt(d3.event.dx)
	        		,checkBefore
	        		,checkAfter
	        		,pos = 0;
	        		
	        	//add up the slider movements as they occur	
        		toolObject.sliderDragSum += d3.event.dx;
	        	
	        	toolObject.chart.selectAll('#before')
	        		.attr('x1', function () { 
	        			checkBefore = parseInt(this.getAttribute('x1'));
	        			pos = parseInt(this.getAttribute('x1')) + displaceX;
	        			return parseInt(this.getAttribute('x1'));
	        		});
	        	
	        	toolObject.chart.selectAll('#after')
	        		.attr('x1', function () { 
	        			checkAfter = parseInt(this.getAttribute('x1'));
	        			return parseInt(this.getAttribute('x1'));
	        		});
	        	
	        	if(checkBefore + displaceX < toolObject.lPadding || checkAfter + displaceX > w - toolObject.rPadding) {
	        		displaceX = 0;
	        	}
	        	
	        	toolObject.chart.select('#boxBefore')
	        		.attr('width', function () { return parseInt(this.getAttribute('width')) + displaceX; });
	        	
	        	toolObject.chart.select('#boxAfter')
	        		.attr('x', function () { return parseInt(this.getAttribute('x')) + displaceX; })
        			.attr('width', function () { return parseInt(this.getAttribute('width')) - displaceX; });
	        		
	        	toolObject.chart.selectAll('#before')
	        		.attr('x1', function () { return parseInt(this.getAttribute('x1')) + displaceX; })
	        		.attr('x2', function () { return parseInt(this.getAttribute('x2')) + displaceX; });
	        	
	        	toolObject.chart.selectAll('#after')
        			.attr('x1', function () { return parseInt(this.getAttribute('x1')) + displaceX; })
        			.attr('x2', function () { return parseInt(this.getAttribute('x2')) + displaceX; });
        	}
        })
        .on('dragend', function(d) {
        	if(this.drag){
        		this.drag = false;
        		
        		var inverseSliderScale = d3.scale.linear()
			    	.domain([0, toolObject.body.getWidth() - (toolObject.lPadding + toolObject.rPadding)])
			    	.range([0, toolObject.numDataPoints]);
			    	
				//calculate the position that everything should transition to
	        	var moveByThis = inverseSliderScale(toolObject.sliderDragSum),
	        		moveShiftCount,
	        		oldShiftCount = toolObject.shiftCount;
	        		
	    		if(moveByThis > 0) moveShiftCount = Math.floor(moveByThis);
	    		if(moveByThis < 0) moveShiftCount = Math.ceil(moveByThis);
	    		
	    		//update shiftCount re-animate 
	    		toolObject.shiftCount += moveShiftCount;
	    		if(toolObject.shiftCount < 0) toolObject.shiftCount = 0;
	    		if(toolObject.shiftCount > toolObject.numDataPoints - 1) toolObject.shiftCount = toolObject.numDataPoints - 1;
	    		
	    		if(toolObject.shiftCount !== oldShiftCount) {
	    			toolObject.sliderDragSum = 0;
	    			
	        		toolObject.setApiParams({position: this.shiftCount});
					toolObject.prepareData();
					
					toolObject.redraw();
	        	}
        	}
        })
    
    ,redrawSlider: function() {
    	this.chart.selectAll('rect[class=slider]')
	    	.remove();
		
		this.chart.selectAll('line[class=slider]')
		    .remove();
		
		this.chart.selectAll('line[class=sliderAxis]')
	    	.remove();
	    	
    	this.drawSlider();
    }
	
	,animateVis: function() {
		//console.log("fn: animateVis")
		var toolObject = this;
		
		//prepare the data for the visualization
		//shiftCount = 0, means the displayData begins with the same value as nestedData
		var mode = this.getApiParam('mode');
		
	    //svg element constants
		var h = this.body.getHeight(),
			w = this.body.getWidth();

		//if transitionCall === 'draw': draw the function for the first time		
		//if not: shift displayData to a different subset of allData
		//then display the newly shifted data	
		if(this.transitionCall === 'left' || this.transitionCall ==='right'){
			this.xAxis.transition()
	            .duration(toolObject.duration.getValue())
	            .ease('linear')
	            .call(this.xAxisScale);
	            
	        this.styleXAxis();
	        
	        this.drawChart();
	    
        	//if call is shift move the dataPoints	
        	this.chart.selectAll('.frequencies').transition()
        		.duration(toolObject.duration.getValue())
	            .ease('linear')
	            .selectAll('text')
	            .attr('x', function (d) {
	            	var startPoint = (0.5 / d.numInSeries) - 0.5,
						valueRange = (d.posInSeries / d.numInSeries * 0.8),
						x = d.counter + startPoint + valueRange; 
					return toolObject.xScale(x);
				})
				.attr('transform', function (d) {
		    		var startPoint = (0.5 / d.numInSeries) - 0.5
						,valueRange = (d.posInSeries / d.numInSeries * 0.8)
						,x = d.counter + startPoint + valueRange
						,y = d.freq;
		    		return 'translate(0, 0) rotate(-20 ' + toolObject.xScale(x) + ' '+ toolObject.yScale(y) + ')';
				});
	    	   
        	//Create navigation bar
			var lengthHor = w - (this.rPadding + this.lPadding)
				,offsetVis = this.lPadding + (lengthHor * ((this.numVisPoints - 1) / 2) * ( 1 / (this.numDataPoints - 1)))
				,offsetVisStart = this.lPadding
				,offsetVisEnd = this.lPadding + (lengthHor * ((this.numVisPoints - 1) / (this.numDataPoints - 1)));
				
        	this.chart.select('#before').transition()
				.duration(toolObject.duration.getValue())
				.ease('linear')
			 	.attr('x1', (lengthHor * this.shiftCount / (this.numDataPoints - 1)) + offsetVisStart)
			 	.attr('x2', (lengthHor * this.shiftCount / (this.numDataPoints - 1)) + offsetVisStart)
		  	    .attr('y1', this.tPadding + this.navigationHeight)
		  	    .attr('y2', this.tPadding)
		  	    .each('end', function () {
		  	    	if(toolObject.continueTransition) { 
		  	    		setTimeout(function () {
		  	    			toolObject.callTransition();
		  	    		},50); 
		  	    	} else { 
		  	    		//manage transition movements and controls
		  	    		toolObject.isTransitioning = false;
		  				toolObject.manageMvtButtons();
		  	    	}
		  	    });
        	
	  	   this.chart.select('#after').transition()
				.duration(toolObject.duration.getValue())
				.ease('linear')
			 	.attr('x1', (lengthHor * this.shiftCount / (this.numDataPoints - 1)) + offsetVisEnd)
			 	.attr('x2', (lengthHor * this.shiftCount / (this.numDataPoints - 1)) + offsetVisEnd)
		  	    .attr('y1', this.tPadding + this.navigationHeight)
		  	    .attr('y2', this.tPadding);
		    
	  	   this.chart.select('#boxBefore').transition()
				.duration(toolObject.duration.getValue())
				.ease('linear')
	  	    	.attr('x', this.lPadding)
	  	    	.attr('y', this.tPadding)
	  	    	.attr('height', this.navigationHeight)
	  	    	.attr('width', lengthHor * (this.shiftCount) / (this.numDataPoints - 1));
	    
	  	    this.chart.select('#boxAfter').transition()
				.duration(toolObject.duration.getValue())
				.ease('linear')
	  	    	.attr('x', (lengthHor * this.shiftCount / (this.numDataPoints - 1)) + offsetVisEnd)
	  	    	.attr('y', this.tPadding)
	  	    	.attr('height', this.navigationHeight)
	  	    	.attr('width', lengthHor * (this.numDataPoints - this.numVisPoints - this.shiftCount) / (this.numDataPoints - 1));
        }
        
        //animates the chart overlay
		this.redrawChartOverlay();
		
		//redraws the legend
		this.redrawLegend();
	}
	
	,callTransition: function () {
		if(this.transitionCall === 'left') this.toggleLeftCheck();
        if(this.transitionCall === 'right') this.toggleRightCheck();
	}
		
	//build the params bundle to pass to manageOverlaySticky
	,buildParamsBundle: function (info) { 
		//console.log('fn: builParamsBundle')
		var type = info.wordString,
			params = {},
			paramsBundle = {},
			docId;

		if ( this.getApiParam('mode') === 'document') { // set position
			docId = info.docId;
			var totalTokens = toolObject.getCorpus().getDocument(docId).get('totalTokens') - 1;
			params.tokenIdStart = parseInt(this.category * totalTokens / this.numDataPoints);
			params.docIdType = docId + ':' + type;
		} else {
		}
				
		paramsBundle = { params: params, type: type };
		
		return paramsBundle;
	}
	
	,manageOverlaySlippery: function (paramsBundle) {
		//console.log('fn: manageOverlaySlippery')
		var string = paramsBundle.type
			,selector = this.removeFilteredCharacters(paramsBundle.type) 
			,checkOn = 'on'
			,index;
		
		this.continueTransition = false;

		this.transitionCall = 'draw';
		
		//check if the word that was selected was already sticky
		//if so checkOn = off and nothing happens
		var len = this.overlayQueue.length;
		while(--len >= 0){
			if(selector === this.overlayQueue[len].selector){ 
		    	checkOn = 'off';
		    	index = len;
			}
		}
		
		//make sure the selected word wasn't just a sticky word that is being deselected
		//thus happens to be scrolled over
		if(selector === this.lastSticky){
			checkOn = 'off';
			this.lastSticky = null;
		}
		
		if(checkOn === 'on') {
			//select a slippery word
			if(selector !== this.lastSlippery) {
				var pathHolder = this.prepareFullPath(string);
				var lineObject = {
					word: string, 
					selector: selector, 
					params: paramsBundle, 
					fullPath: pathHolder.path,
					pathMin: pathHolder.min,
					pathMax: pathHolder.max,
					colour: 'red'
				};	
				if(this.lastSlippery !== null) {
					//exceptional case where lastSlippery was not properly removed
					this.chartOverlayOff(this.lastSlippery);
					this.sliderOverlayOff(this.lastSlippery);
					this.lastSlippery = null;
					
					//select new slippery word
					//change its colour
					this.chartOverlayOn(lineObject);
					this.sliderOverlayOn(lineObject);
					this.lastSlippery = selector;
				}
				else {
					//normal case select slippery word
					//change its colour
					this.chartOverlayOn(lineObject);
					this.sliderOverlayOn(lineObject);
					this.lastSlippery = selector;
				}
			}
			else{
				//normal case deselect a slippery word
				this.chartOverlayOff(selector);
				this.sliderOverlayOff(this.lastSlippery);
				this.lastSlippery = null;
			}
		}
		else {
			//else do nothing 
			//this means, don't select a word that is already sticky
		}
	}

	,manageOverlaySticky: function (paramsBundle) {
//		console.log('fn: manageOverlaySticky')
		var toolObject = this;
		
		var string = paramsBundle.type
			,selector = this.removeFilteredCharacters(paramsBundle.type)
			,checkOn = 'on'
			,lineObject
			,index
			,apiArray = [];
		
		this.transitionCall = 'draw';
		 
		//check if the word that was selected was already sticky
		//if so checkOn = off and nothing happens
		var len = this.overlayQueue.length;
		while(--len >= 0){
			//begin updating API array of finished words
			apiArray.push(this.overlayQueue[len].string);
			//check if the click event was on a selected word or not
			if(selector === this.overlayQueue[len].selector){ 
		    	checkOn = 'off';
		    	lineObject = this.overlayQueue[len];
		    	index = len;
			}
		}
		
		//select a sticky word
		if(checkOn === 'on') {
			//finish updating API array of selected words
			apiArray.push(string);
			this.setApiParams({selectedWords: apiArray});
			
			//draw the sticky path
			var stickyColour = this.colourIndex[0];
			this.colourIndex.shift();
			
			//repopulate colour index if it is empty
			if(this.colourIndex.length === 0) { 
				for(var i = 0; i < this.colourMasterList.length; i++){
					this.colourIndex.push(this.colourMasterList[i]);
				}
			}
			var pathHolder = this.prepareFullPath(string);
			lineObject = {
				word: string, 
				selector: selector, 
				params: paramsBundle,
				fullPath: pathHolder.path,
				pathMin: pathHolder.min,
				pathMax: pathHolder.max,
				colour: stickyColour
			};
			
			//if this was selected a slippery before click event remove line from navigation bar
			if(selector === this.lastSlippery){
				this.sliderOverlayOff(selector);
				this.lastSlippery = null;
			}
			
			//make sure there is no path already present
			this.chart.select('g[class=frequency-line-' + selector + ']')
				.remove();

			this.overlayQueue.push(lineObject);
			this.chartOverlayOn(lineObject);
			this.sliderOverlayOn(lineObject);
		}
		//deselect a sticky word
		else{
			var updateApi = this.getApiParam('selectedWords');
			for(var i = 0, len = updateApi.length; i < len; i++) {
				if(updateApi[i] === selector) {
					updateApi.splice(i, 1);
					this.setApiParams({selectedWords: updateApi});
				}
			}
			this.chartOverlayOff(selector);
			this.colourIndex.push(this.overlayQueue[index].colour);
	    	this.overlayQueue.splice(index, 1);
	    	this.sliderOverlayOff(selector);
			this.updateLegendRemove(selector);
			this.lastSticky = selector;
		}
	}
	
	,prepareFullPath: function (string) {
		var linePosArray = [],
			pathMin = this.absMaxFreq,
			pathMax = this.absMinFreq;
		
		for(var k = 0, len = this.allData.length; k < len; k++){
			foundB = 0;
			for(var i = 0, lenA = this.allData[k].allDataInternal.length; i < lenA; i++) {
				for(var j = 0, lenB = this.allData[k].allDataInternal[i].frequencyArray.length; j < lenB; j++){
					if(this.allData[k].allDataInternal[i].frequencyArray[j].wordString === string){
						var yVal1 = this.allData[k].allDataInternal[i].frequencyArray[j].freq;
						linePosArray.push({x: k, y: yVal1});
						if(yVal1 < pathMin) pathMin = yVal1;
						if(yVal1 > pathMax) pathMax = yVal1;
						foundB = 1;
					}
				}
			}
			if(foundB === 0){
				var yVal2 = this.minFreq;
				linePosArray.push({x: k, y: yVal2});
				if(yVal2 < pathMin) pathMin = yVal2;
				if(yVal2 > pathMax) pathMax = yVal2;
			}
		}
		return {path: linePosArray, min: pathMin, max: pathMax};
	}
	
	,updateFullPath: function () {
//		console.log("fn: updateFullPath")
		var lenA = this.overlayQueue.length;
		while(lenA-- > 0){
			var pathHolder = this.prepareFullPath(this.overlayQueue[lenA].word);
			this.overlayQueue[lenA].fullPath = pathHolder.path;
			this.overlayQueue[lenA].pathMin = pathHolder.min;
			this.overlayQueue[lenA].pathMax = pathHolder.max;
		}
//		console.log(this.overlayQueue)
	}
	
	,buildSliderPath: d3.svg.line()
		    .x(function(d) { return toolObject.xSliderScale(d.x); })
		    .y(function(d) { return toolObject.ySliderScale(d.y); })
		    .interpolate("monotone")
	
	,sliderOverlayOn: function (objectToSelect) {
		//console.log('fn: sliderOverlayOn')		
		this.transitionSliderOverlay(objectToSelect);
		
		//draw path
		this.chart.append('g')
			.attr('id', 'slider-line-' + objectToSelect.word)
			.append('path')
			.attr("d", this.buildSliderPath(objectToSelect.fullPath))
			.style('stroke', objectToSelect.colour)
			.style('stroke-width', 2)
			.style('fill', 'none');
			
		//redraw slider
		this.redrawSlider();
	}
	
	,sliderOverlayOff: function (selector) {
	    this.chart.selectAll('g[id=slider-line-' + selector + ']')
	    	.remove();
	    
	    //update slider overlay axis
		this.transitionSliderOverlay();
	}
	
	,redrawSliderOverlay: function() {	
		//console.log('redrawSliderOverlay')
		for(var l = 0; l < this.overlayQueue.length; l++){
			this.sliderOverlayOff(this.overlayQueue[l].selector);
			this.sliderOverlayOn(this.overlayQueue[l]);
		}
	}
	
	,transitionSliderOverlay: function(objectToSelect) {
		//console.log('transitionSliderOverlay')
		objectToSelect = objectToSelect || 0;
		
		//update slider overlay axis
		this.updateYSliderScale(objectToSelect);
		
		//transition all other paths
		var lenA = this.overlayQueue.length;
		while(lenA-- > 0){
			this.chart.selectAll('g#slider-line-' + this.overlayQueue[lenA].selector)
				.select('path')
				.transition().duration(300)
				.ease('linear')
				.attr("d", this.buildSliderPath(this.overlayQueue[lenA].fullPath));
		}
	}
	
	,preparePath: function (string) {
		//console.log('fn: prepareData')
		
		var linePosArray = [];
		
		//peek at the next frequency point and the preceding one to end the line on the edge of the graph
		var foundA
			,foundB
			,foundC;
		
		//add two positions offscreen to the left for smooth transitions 
		for(var k = 0; k < 3 && this.shiftCount - k > 0; k++) {
			foundA = 0;
			for(var i = 0; i < this.allData[this.shiftCount - (1 + k)].allDataInternal.length; i++) {
				for(var j = 0; j < this.allData[this.shiftCount - (1 + k)].allDataInternal[i].frequencyArray.length; j++){
					if(this.allData[this.shiftCount - (1 + k)].allDataInternal[i].frequencyArray[j].wordString === string){
						var yVal3 = this.yScale(this.allData[this.shiftCount - (1 + k)].allDataInternal[i].frequencyArray[j].freq);
						linePosArray.unshift({x: this.shiftCount - (1 + k), y: yVal3});
						foundA = 1;
					}
				}
			}
			if(foundA === 0){
				var yVal4 = this.yScale(this.minFreq);
				linePosArray.unshift({x: this.shiftCount - (1 + k), y: yVal4});
			}
		}
		
		//fill in the middle values
		for(var k = this.shiftCount, len = this.numVisPoints + this.shiftCount; k < len; k++){
			foundB = 0;
			for(var i = 0, lenA = this.allData[k].allDataInternal.length; i < lenA; i++) {
				for(var j = 0, lenB = this.allData[k].allDataInternal[i].frequencyArray.length; j < lenB; j++){
					if(this.allData[k].allDataInternal[i].frequencyArray[j].wordString === string){
						var yVal1 = this.yScale(this.allData[k].allDataInternal[i].frequencyArray[j].freq);
						linePosArray.push({x: k, y: yVal1});
						foundB = 1;
					}
				}
			}
			if(foundB === 0){
				var yVal2 = this.yScale(this.minFreq);
				linePosArray.push({x: k, y: yVal2});
			}
		}
		
		//add two positions offscreen to the right for smooth transitions 
		for(var k = 0; k < 3 && this.numVisPoints + this.shiftCount + k < this.numDataPoints; k++){
			foundC = 0;
			for(var i = 0; i < this.allData[this.numVisPoints + this.shiftCount + k].allDataInternal.length; i++) {
				for(var j = 0; j < this.allData[this.numVisPoints + this.shiftCount + k].allDataInternal[i].frequencyArray.length; j++){
					if(this.allData[this.numVisPoints + this.shiftCount + k].allDataInternal[i].frequencyArray[j].wordString === string){
						var yVal1 = this.yScale(this.allData[this.numVisPoints + this.shiftCount + k].allDataInternal[i].frequencyArray[j].freq);
						linePosArray.push({x: this.numVisPoints + this.shiftCount + k, y: yVal1});
						foundC = 1;
					}
				}
			}
			if(foundC === 0){
				var yVal2 = this.yScale(this.minFreq);
				linePosArray.push({x: this.numVisPoints + this.shiftCount + k, y: yVal2});
			}
		}
		return linePosArray;
	}
	
	//draws the line graph overlay of the frequency info
	,chartOverlayOn: function(objectToSelect) {
//		console.log('fn: chartOverlayOn')
		
		toolObject = this;
					
		//change selected word colour
		this.chart.selectAll('g[class=section]')
			.selectAll('g[class=frequencies]')
			.selectAll('text[class=' + objectToSelect.selector + ']')
			.style('fill', objectToSelect.colour)
			.style('fill-opacity', 1);
	    	
	    //if transitionCall === 'draw': draw the function for the first time		
		//if not: shift displayData to a different subset of allData
		//then display the newly shifted data
		
		var linePosArray = this.preparePath(objectToSelect.word);
		
		var pos;
		
		//draw path
		var line = d3.svg.line()
		    .x(function(d) { 
		    	pos = d.x;
		    	return toolObject.xScale(d.x + toolObject.callOffset()); })
		    .y(function(d) { return d.y; })
		    .interpolate('monotone');
		
		path = this.chart.select('.overlay')
			.append('g')
			.attr('class', 'frequency-line-' + objectToSelect.selector)
			.append('path')
			.attr("d", line(linePosArray))
			.style('stroke', objectToSelect.colour)
			.style('stroke-width', 2)
			.style('fill', 'none');
					
		var posDif = (this.xScale(pos) - this.xScale(pos + this.callOffset()));
		
		if(this.transitionCall === 'left' || this.transitionCall ==='right') {
			path.transition()
				.duration(toolObject.duration.getValue())
				.ease("linear")
			    .attr("transform", "translate(" + posDif + ")");
		}
		this.redrawLegend();
	}
	
	,chartOverlayOff: function(selector){
		this.chart.selectAll('text.' + selector)
	    	.style('fill', 'black')
	    	.style('fill-opacity', function(d) { return toolObject.opacityScale(d.freq); });
	    
	    this.chart.select('g.frequency-line-' + selector)
	    	.remove();
	}
	
	//reselect all the sticky words
	//a screen movement has changed the words positions
	,redrawChartOverlay: function () {
		//console.log('fn: redrawChartOverlay')
		for(var i = 0; i < this.overlayQueue.length; i++){
			this.chartOverlayOff(this.overlayQueue[i].selector);
			this.chartOverlayOn(this.overlayQueue[i]);
		}
	}
	
	//LEGEND FUNCTIONS
		
	,initLegend: function () {
		//console.log('fn: initLegend')
		toolObject = this;
		
		this.legendX = this.body.getWidth() - (100 + this.rPadding);
		this.legendY = this.navigationHeight + (this.tPadding * 2) + 10;
		
		//allow the legend to be draggable
        var drag = d3.behavior.drag()
	        .origin(Object)
	        .on('drag', function (d) {
	        	//update current position
	        	toolObject.legendX = this.x.baseVal.value + d3.event.dx;
	        	toolObject.legendY = this.y.baseVal.value + d3.event.dy;
	        	
	        	d3.select(this)
	            	.attr('x', this.x.baseVal.value + d3.event.dx)
	            	.attr('y', this.y.baseVal.value + d3.event.dy);
	        	
	        	toolObject.chart.select('rect[id=legendBox]')
	        		.attr('x', function () { return parseInt(this.getAttribute('x')) + parseInt(d3.event.dx); })
	        		.attr('y', function () { return parseInt(this.getAttribute('y')) + parseInt(d3.event.dy); });
	        		
	        	toolObject.chart.selectAll('text[class=legend]')
	        		.attr('x', function () { return parseInt(this.getAttribute('x')) + parseInt(d3.event.dx); })
	        		.attr('y', function () { return parseInt(this.getAttribute('y')) + parseInt(d3.event.dy); });
	        });
        
		var legend = this.chart.append('rect')
			.attr('class', 'legend')
			.attr('id', 'legendBox')
	    	.attr('x', toolObject.legendX)
	    	.attr('y', toolObject.legendY)
	    	.attr('rx', 4)
	    	.attr('width', 100)
	    	.attr('height', 100)
	    	.style('fill', 'white')
	    	.style('stroke', 'black');
	    	
		var legendToolBar = this.chart.append('rect')
			.attr('class', 'legend')
			.attr('id', 'legendToolBar')
	    	.attr('x', toolObject.legendX)
	    	.attr('y', toolObject.legendY)
	    	.attr('rx', 4)
	    	.attr('width', 100)
	    	.attr('height', 10)
	    	.style('fill', 'silver')
	    	.style('fill-opacity', 0.25)
	    	.style('stroke', 'black')
	    	.style('cursor', 'move')
	    	.call(drag)
	      .append('title')
	    	.text('Drag to move legend.');
	    	
		//hide the legend untill the first words are added to it
		$('.legend').hide();
	}
	
	,redrawLegend: function() {
		//console.log('fn: redrawLegend')
		//reset the legend so it stay over-top of the overlay
		if(this.chart.selectAll('rect[class=legend]')) {
			this.chart.selectAll('rect[class=legend]')
				.remove();
			
			this.chart.selectAll('text[class=legend]')
				.remove();
		
			this.initLegend();
		
			//reveal legend if there are any words to display
			//add words to legend
			if(this.overlayQueue.length !== 0){ 
				$('.legend').show(); 
				for(var i = 0; i <= this.overlayQueue.length - 1; i++){
					this.updateLegendAdd(this.overlayQueue[i], i + 1);
				}
			}
		}
	}
	
	,updateLegendAdd: function(objectToSelect, index) {
		//console.log('fn: updateLegendAdd')
		toolObject = this;
		
		//Dynamically find the position of the legend
		//this.chart.select("rect[id=legendBox]") returns a twice nested array
		var yOffset = (index * 15) + 10,
			xOffset = 5,
			yPos = this.chart.select("rect[id=legendBox]")[0][0].y.baseVal.value + yOffset,
			xPos = this.chart.select("rect[id=legendBox]")[0][0].x.baseVal.value + xOffset;
		
		//add text to the legend
	    this.chart.append('text')
	    	.attr('class','legend')
	    	.attr('id', objectToSelect.selector)
	    	.text(objectToSelect.word)
	    	.attr('y', yPos)
	    	.attr('x', xPos)
	    	.attr('fill', objectToSelect.colour)
	    	.attr('font-size', '16px')
	    	.on('mouseover', function() {
				d3.select(this).style('font-size', '18px');
			})
			.on('mouseout', function() {
	            d3.select(this).style('font-size', '16px');
			})	
			.on('click', function() {
	        	toolObject.manageOverlaySticky(objectToSelect.params);
			})
	    	.on('dblclick', function(d) {
	    		debugger;
				toolObject.getApplication().dispatchEvent('documentTermsClicked', toolObject, objectToSelect.params);
	    	});
		
		this.resizeLegend();
	}
	
	,updateLegendRemove: function(selector) {
		//console.log('fn: updateLegendRemove')
		//remove a word from the legend
	    this.chart.selectAll('text[id=' + selector + ']')
    		.remove();
	    
	    //move the words to fill in the hole from removed word
	    var legendYVal = this.chart.select("rect[id=legendBox]")[0][0].y.baseVal.value;
	    
	    this.chart.selectAll('text[class=legend]')
    		.attr('y', function(d,i) {
    			var yOffset = (i + 1) * 15 + 10;
    			return legendYVal + yOffset;
    		});
		
		//hide the legend if the last sticky word is removed
		if(this.overlayQueue.length === 0){
			$('.legend').hide();
		}
		this.resizeLegend();
	}
	
	//resize the ledeng according to the number of words and their length
	,resizeLegend: function () {
		//console.log('fn: resizeLegend')
		var scale = d3.scale.linear()
			.domain([1,12])
			.range([8.3,100]);
		
		this.legendWidth = 60;
		
		for(var i = 0; i < this.overlayQueue.length; i++){
			var scaledLen = scale(this.overlayQueue[i].word.length);
			if(scaledLen >= this.legendWidth) this.legendWidth = scaledLen;
		}
	
		var h = this.overlayQueue.length * 15 + 15;
		
		this.chart.select('rect[id=legendBox]')
			.attr('height', h)
			.attr('width', toolObject.legendWidth);
		
		this.chart.select('rect[id=legendToolBar]')
			.attr('width', toolObject.legendWidth);
	}
	
	//
	//SCALE FUNCTIONS
	//
	
	//all these scales need to be updated if this.absMaxFreq or this.valFraction changes
	,manageAllYScales: function() {
		this.manageFontScale();
		this.manageOpacityScale();
		this.manageYScale();
		this.manageYSliderScale();
	}
	
	,fontScale: d3.scale.linear()
	
	,manageFontScale: function() {
		//console.log('fn: fontScale')
		 this.fontScale.domain([this.minFreq, this.absMaxFreq * this.valFraction])
	    	.range([10, this.maxFont]);
	}
	
	/*,maxFontScale : function (value) {
		var scale = d3.scale.linear()
			.domain([600,2000])
			.range([15,60]);
		return scale(value);
	}*/
	
	,opacityScale: d3.scale.linear()
	
	,manageOpacityScale: function() {
		this.opacityScale.domain([0, this.absMaxFreq * this.valFraction])
    		.range([0.4, 0.8]);
	}
	
	,yScale: null
	
	,manageYScale: function () {
		if(this.scaleCall == 'linear') this.yScale = d3.scale.linear();
		if(this.scaleCall == 'log') this.yScale = d3.scale.log();
		
		this.yScale.domain([this.minFreq, this.absMaxFreq * this.valFraction * 1.25])
				.rangeRound([this.body.getHeight() - this.bPadding, (this.tPadding * 2) + this.navigationHeight]);
	}
	
	,ySliderScale: null
	
	,manageYSliderScale: function() {
		var top = this.tPadding
			,bottom = this.tPadding + this.navigationHeight;
		
		if(this.scaleCall == 'linear') this.ySliderScale = d3.scale.linear();
		if(this.scaleCall == 'log') this.ySliderScale = d3.scale.log();
		
		this.ySliderScale.domain([this.minFreq, this.absMaxFreq])
				.rangeRound([bottom, top]);
	}
	
	,updateYSliderScale: function(updateWithObject) {
		updateWithObject = updateWithObject || 0;
		var selectedMin = this.minFreq, //setting this to this.absMinFreq effectively deactivates it, to make it work use this.absMaxFreq
			selectedMax = 0;
	    	
	    //go through overlayQueue check for min / max
		var len = this.overlayQueue.length;
		while(len-- > 0){
			if(this.overlayQueue[len].pathMin < selectedMin) selectedMin = this.overlayQueue[len].pathMin;
			if(this.overlayQueue[len].pathMax > selectedMax) selectedMax = this.overlayQueue[len].pathMax;
		}
		if(updateWithObject != 0 && updateWithObject.pathMin < selectedMin) selectedMin = updateWithObject.pathMin;
		if(updateWithObject != 0 && updateWithObject.pathMax > selectedMax) selectedMax = updateWithObject.pathMax;
		
		this.ySliderScale.domain([selectedMin, selectedMax]);
	}
	
	,manageAllXScales: function() {
		this.manageXScale();
		this.manageXSliderScale();
	}
	
	,xScale: d3.scale.linear()
	
	,manageXScale: function() {
		this.xScale.domain([this.shiftCount - 0.5, this.numVisPoints + this.shiftCount - 0.5])
	    	.range([this.lPadding, this.body.getWidth() - this.rPadding]);
	}
	
	,xSliderScale: d3.scale.linear()
	
	,manageXSliderScale: function() {
		this.xSliderScale.domain([0, this.numDataPoints - 1])
	    	.range([this.lPadding, this.body.getWidth() - this.rPadding]);
	}

	//
	//MISC. FUNCTIONS
	//
	,setSegments: function () {
		if(this.getApiParam('mode') === 'corpus'){
			var documents = this.getCorpus().getDocumentsCount();
			this.visibleSegments.menu.items.each(function(item, index, len) {
				if(item.text > documents) {
					item.setDisabled(true);
				} 
			})
		}
	}
	
	,setVisibleSegments: function () {
		//console.log('fn: setVisibleSegments')
		if(this.getApiParam('mode') === 'corpus'){
			var documents = this.getCorpus().getDocumentsCount();
			this.visibleSegments.menu.items.each(function(item, index, len) {
				if(item.text > documents) {
					item.setDisabled(true);
				} 
			})
		}
		if(this.getApiParam('mode') === 'document'){
			toolObject = this;
			this.visibleSegments.menu.items.each(function(item, index, len) {
				if(parseInt(item.text) > toolObject.numDataPoints) {
					item.setDisabled(true);
				} else {
					item.setDisabled(false);
				}
			})
		}
	}
	
	,setTitleLength: function () {
		//console.log('fn:setTitleLength')
		var toolObject = this, 
			item;
		this.titlesArray = [];
		
		var scale = d3.scale.linear()
			.domain([350,1250])
			.range([10,40]);
		
		var corpus = this.getCorpus();
		for (var i = 0, len = corpus.getDocumentsCount(); i < len; i++) {
			var item = corpus.getDocument(i);
			var shortTitle = item.getShortTitle();			
			if(shortTitle.length <= scale(toolObject.body.getWidth())) {
				toolObject.titlesArray.push(shortTitle); 
			} else {
				var shorterTitle = shortTitle.substring(0,scale(toolObject.body.getWidth()) - 3);
				toolObject.titlesArray.push(shorterTitle + '...'); 
			}
		}
	}
	
	,callOffset: function () {
		//console.log('fn: callOffset')
		var callOffset;
		if(this.transitionCall === 'draw' || this.transitionCall === 'redraw') { 
			callOffset = 0; 
		}
		if(this.transitionCall === 'left') { 
			callOffset = -1;
		}
		if(this.transitionCall === 'right') { 
			callOffset = 1;
		}
		return callOffset;
	}
	
	,removeFilteredCharacters: function (string) {
		//console.log('fn: removeFilteredCharacters')
		if (string !== undefined) {
			return string.replace("'","apostrophe-")
				.replace("#","pound-")
				.replace("&","ampersand-")
				.replace("@","atsign-")
				.replace("!","exclamation-")
				.replace("0","num-o")
				.replace("1","num-a")
				.replace("2","num-b")
				.replace("3","num-c")
				.replace("4","num-d")
				.replace("5","num-e")		
				.replace("6","num-f")
				.replace("7","num-g")
				.replace("8","num-h")
				.replace("9","num-i")
				.replace(/[^a-zA-Z]+/g,'-'); //then anything else...
		} else {
			return '';
		}
	}
	
	,loadStore: function () {
//		console.log('fn: loadStore')
		var params = this.getApiParams();
		if(this.getApiParam('mode') === 'document') { 
			this.documentStore.load({params: params});
		}
		if(this.getApiParam('mode') === 'corpus') {
			this.corpusStore.load({params: params});
		}
	}
	
//	,corpusTypeReader: new Ext.data.JsonReader({
//		root : 'corpusTypes.types'
//		,totalProperty : 'corpusTypes["@totalTypes"]'
//	}, Ext.data.Record.create(Voyeur.data.CorpusTypes.fields)) 
//	
//	,documentTypeReader: new Ext.data.JsonReader({
//		root: 'documentTypes.types'
//		,totalProperty: 'documentTypes["@totalTypes"]'
//	}, Ext.data.Record.create(Voyeur.data.DocumentTypes.fields))

	,showOptions: function() {
		this.showOptionsWindow({
			items : [{
				xtype : 'form',
				labelWidth : 150,
				labelAlign : 'right',
				border : false,
				items : [{xtype: 'combo'
                    ,mode : 'local'
                    ,value : this.scaleCall
                    ,triggerAction : 'all'
                    ,forceSelection : true
    				,editable : false
    				,fieldLabel : 'Y-axis Scale'
    				,name : 'scale'
    				,hiddenName : 'scale'
                    ,valueField : 'value'
                    ,displayField : 'name'
					,store: new Ext.data.JsonStore({
                        fields : ['name', 'value']
                        ,data   : [
                            {name : 'Linear',   value: 'linear'}
                            ,{name : 'Logarithmic',  value: 'log'}
                        ]
                    })
				}],
				buttons : [{
					text : this.localize('ok', 'tool'),
					iconCls : 'icon-accept',
					listeners : {
						click : {
							fn : function(btn) {
								var formPanel = btn.findParentByType('form');
								var form = formPanel.getForm();
								var stopList = form.findField('stopList');
								var scale = form.findField('scale').value;
								var global = form.findField('globalStopWords').getValue();
								
								//redraw y axis with new scale
								this.setApiParams({yAxisScale: scale});
								this.scaleCall = scale;
								
								// make sure we don't have any queries
								if(stopList.getValue() && !stopList.getRawValue()) stopList.setValue('');
								
								//if a new stop list is in fact set queue a reselection of the top three words
								if(stopList.getValue() != this.getApiParam('stopList')){
									toolObject.reselectTop = true;
								}
								this.setApiParams({stopList: stopList.getValue()});

								//formPanel.findParentByType('window').destroy();
								btn.findParentByType('window').destroy();
								
								if(global) {
									this.getApplication().applyParamsGlobally({
										stopList: this.getApiParam('stopList')
									}, false);
								}
								
								//reload tool
								this.loadStore();						    	
							},
							scope : this
						}
					}
				}, {
					text : this.localize('cancel', 'tool'),
					handler : function(btn) {
						btn.findParentByType('window').destroy();
					}
				}, {
					text : this.localize('restore', 'tool'),
					listeners : {
						click : {
							fn : function(btn) {
								var form = btn.findParentByType('form').getForm();
								form.findField('stopList').setValue(this.getApiParamDefaultValue('stopList'));
							},
							scope : this
						}
					}
	
				}]
			}]
		}, true);
	}
});
