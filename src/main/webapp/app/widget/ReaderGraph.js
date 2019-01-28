Ext.define('Voyant.widget.ReaderGraph', {
    extend: 'Ext.container.Container',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.readergraph',
    statics: {
        i18n: {
        }
    },
    config: {
        parentPanel: undefined,
        corpus: undefined,
        documentsStore: undefined,
        documentTermsStore: undefined,
    	locationMarker: undefined,
    	isDetailedGraph: true
    },
    
    locationMarkerColor: '#157fcc',

    DETAILED_GRAPH_DOC_LIMIT: 25, // upper limit on document count for showing detailed graphs
    LOCATION_UPDATE_FREQ: 100,

    SCROLL_UP: -1,
    SCROLL_EQ: 0,
    SCROLL_DOWN: 1,

    constructor: function(config) {
        this.callParent(arguments);
    },

    initComponent: function() {
        Ext.apply(this, {
            layout: {
                type: 'hbox'
            },
            items: []
        });

        this.setDocumentTermsStore(Ext.create("Ext.data.Store", {
			model: "Voyant.data.model.DocumentTerm",
    		autoLoad: false,
    		remoteSort: false,
    		proxy: {
				type: 'ajax',
				url: Voyant.application.getTromboneUrl(),
				extraParams: {
					tool: 'corpus.DocumentTerms',
					withDistributions: true,
					// TODO handle positions
					withPositions: true,
					bins: 25,
					forTool: 'reader'
				},
				reader: {
					type: 'json',
		            rootProperty: 'documentTerms.terms',
		            totalProperty: 'documentTerms.total'
				},
				simpleSortMode: true
   		    },
   		    listeners: {
                load: function(store, records, successful, opts) {
                    store.sort('docIndex', 'ASC');
                    var graphDatas = {};
                    var maxValue = 0;
                    store.each(function(r) {
                        var graphData = [];
                        var dist = r.get('distributions');
                        var docId = r.get('docId');
                        var docIndex = r.get('docIndex');
                        var term = r.get('term');
                        for (var i = 0; i < dist.length; i++) {
                            var bin = i;//docIndex * dist.length + i;
                            var val = dist[i];
                            if (val > maxValue) maxValue = val;
                            graphData.push([docId, docIndex, bin, val, term]);
                        }
                        graphDatas[docIndex] = graphData;
                    }, this);
                    
                    if (this.getIsDetailedGraph()) {
                        var graphs = this.query('cartesian');
                        for (var i = 0; i < graphs.length; i++) {
                            var graph = graphs[i];
                            var data = graphDatas[i];
                            if (data !== undefined) {
                                graph.getAxes()[0].setMaximum(maxValue);
                                graph.getStore().loadData(data);
                            } else {
                                graph.getStore().removeAll();
                            }
                        }
                    }
   		    	},
   		    	scope: this
   		    }
    	}));

        this.callParent(arguments);

        var parentPanel = this.findParentBy(function(clz) {
    		return clz.mixins["Voyant.panel.Panel"];
        });
    	if (parentPanel != null) {
            this.setParentPanel(parentPanel);
    		if (parentPanel.getCorpus && parentPanel.getCorpus()) {
    			this.on("afterrender", function(c) {
    				this.setCorpus(parentPanel.getCorpus());	
    			}, this);
    		} else {
                parentPanel.on("loadedCorpus", function(src, corpus) {
                    this.setCorpus(corpus);
                }, this);
                this.hasCorpusLoadedListener = true;
    		}
        }
        
        this.on('boxready', function() {
            if (this.getLocationMarker() == undefined) {
                this.setLocationMarker(Ext.DomHelper.append(this.getEl(), {tag: 'div', style: 'background-color: '+this.locationMarkerColor+'; height: 100%; width: 2px; position: absolute; top: 0; left: 0;'}));
            }
        });        
    },

    updateCorpus: function(corpus) {
        var docs = corpus.getDocuments();
        this.setDocumentsStore(docs);
        this.getDocumentTermsStore().getProxy().setExtraParam('corpus', corpus.getId());
        this.setIsDetailedGraph(docs.getTotalCount() < this.DETAILED_GRAPH_DOC_LIMIT);

        this.generateChart(corpus, this);
    },

    loadQueryTerms: function(queryTerms) {
    	if (queryTerms && queryTerms.length > 0) {
			this.getDocumentTermsStore().load({
				params: {
					query: queryTerms
    			}
			});
		}
    },

    generateChart: function(corpus, container) {
        function getColor(index, alpha) {
            var c = this.getParentPanel().getApplication().getColor(index);
            return 'rgba('+c[0]+','+c[1]+','+c[2]+','+alpha+')';
        }
        
        function map(value, istart, istop, ostart, ostop) {
            return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
        }
        
        function addChart(docInfo) {
            var index = docInfo.index;
            var fraction = docInfo.fraction;
            var height = docInfo.relativeHeight;
            var bColor = getColor.call(this, index, 0.3);
            var sColor = getColor.call(this, index, 1.0);
            var chart = container.add({
                xtype: 'cartesian',
                plugins: {
                    ptype: 'chartitemevents'
                },
                flex: fraction,
                height: '100%',
                insetPadding: 0,
                background: {
                    type: 'linear',
                    degrees: 90,
                    stops: [{
                        offset: 0,
                        color: bColor
                    },{
                        offset: height,
                        color: bColor
                    },{
                        offset: height,
                        color: 'white'
                    },{
                        offset: 1,
                        color: 'white'
                    }]
                },
                axes: [{
                    type: 'numeric',
                    position: 'left',
                    fields: 'distribution',
                    hidden: true
                },{
                    type: 'category',
                    position: 'bottom',
                    fields: 'bin',
                    hidden: true
                }],
                series: [{
                    type: 'line',
                    xField: 'bin',
                    yField: 'distribution',
                    style: {
                        lineWidth: 2,
                        strokeStyle: sColor
                    },
                    tooltip: {
                        corpus: corpus,
                        trackMouse: true,
                        style: 'background: #fff',
                        showDelay: 0,
                        dismissDelay: 500,
                        hideDelay: 5,
                        renderer: function(toolTip, record, ctx) {
                            toolTip.setHtml(corpus.getDocument(record.get('docIndex')).getTitle()+"<br>"+record.get('term') + ': ' + record.get('distribution'));
                        }
                    }
                }],
                store: Ext.create('Ext.data.ArrayStore', {
                    fields: ['docId', 'docIndex', 'bin', 'distribution', 'term'],
                    data: []
                }),
                listeners: {
                    itemclick: function(chart, item, event) {
                        // var data = item.record.data;
                        // var doc = this.getDocumentsStore().getAt(data.docIndex);
                        // this.getParentPanel().getApplication().dispatchEvent('documentsClicked', this, [doc]);
                    },
                    scope: this
                }
            });
            
            chart.body.on('click', function(event, target) {
                var el = Ext.get(target);
                
                var x = event.getX();
                var box = el.getBox();
                var fraction = (x - box.x) / box.width;

                var chartContainer = el.parent('.x-panel');
                var containerParent = chartContainer.parent();
                var children = Ext.toArray(containerParent.dom.children);
                var docIndex = children.indexOf(chartContainer.dom);

                this.fireEvent('documentRelativePositionSelected', this, {docIndex: docIndex, fraction: fraction});
            }, this);
        }
        
        container.removeAll();
        
        var docs = corpus.getDocuments();
        var tokensTotal = corpus.getWordTokensCount();
        var docInfos = [];
        var docMinSize = Number.MAX_VALUE;
        var docMaxSize = -1;
//      for (var i = 0; i < docs.getTotalCount(); i++) {
        for (var i = 0; i < docs.getCount(); i++) {
            var d = docs.getAt(i);
            var docIndex = d.get('index');
            var count = d.get('tokensCount-lexical');
            if (count < docMinSize) docMinSize = count;
            if (count > docMaxSize) docMaxSize = count;
            var fraction = count / tokensTotal;
            docInfos.push({
                index: docIndex,
                count: count,
                fraction: fraction
            });
        }
        
        if (this.getIsDetailedGraph()) {
            for (var i = 0; i < docInfos.length; i++) {
                var d = docInfos[i];
                d.relativeHeight = d.count==docMaxSize ? 1 : map(d.count, docMinSize, docMaxSize, 0.25, 1);
                addChart.call(this, d);
            }
        } else {
            var chart = container.add({
                xtype: 'cartesian',
                plugins: {
                    ptype: 'chartitemevents'
                },
                flex: 1,
                height: '100%',
                insetPadding: 0,
                axes: [{
                    type: 'numeric',
                    position: 'left',
                    fields: 'count',
                    hidden: true
                },{
                    type: 'category',
                    position: 'bottom',
                    fields: 'index',
                    hidden: true
                }],
                series: [{
                    type: 'bar',
                    xField: 'index',
                    yField: 'count',
                    style: {
                        minGapWidth: 0,
                        minBarWidth: 1,
                        lineWidth: 0,
                        strokeStyle: 'none'
                    },
                    renderer: function (sprite, config, rendererData, index) {
                        return {fillStyle: getColor.call(this, index, 0.3)};
                    }.bind(this)
                }],
                store: Ext.create('Ext.data.JsonStore', {
                    fields: [{name: 'index', type: 'int'}, {name: 'count', type: 'int'}, {name: 'fraction', type: 'float'}],
                    data: docInfos
                }),
                listeners: {
                    itemclick: function(chart, item, event) {
                        var el = Ext.get(event.getTarget());
                        var x = event.getX();
                        var box = el.getBox();
                        var docWidth = box.width / this.getCorpus().getDocuments().getCount();
                        var docX = (x - box.x) % docWidth;
                        var fraction = docX / docWidth;

            			var data = item.record.data;
                        var doc = this.getDocumentsStore().getAt(data.index);
                        var docIndex = doc.getIndex();

                        this.fireEvent('documentRelativePositionSelected', this, {docIndex: docIndex, fraction: fraction});
                    },
                    scope: this
                }
            });
        }

    },

    moveLocationMarker: function(docIndex, fraction, scrollDir) {
        var locMarkEl = Ext.get(this.getLocationMarker());
        var locX = locMarkEl.getX();
        if (this.getIsDetailedGraph()) {
            var graph = this.query('cartesian')[docIndex];
            if (graph) {
                locX = graph.getX() + graph.getWidth()*fraction;
            }
        } else {
            var graph = this.down('cartesian');
            var docWidth = graph.getWidth() / this.getCorpus().getDocuments().getCount();
            locX = graph.getX() + docWidth*docIndex + docWidth*fraction;
        }
        if (scrollDir != null) {
            var currX = locMarkEl.getX();
            // prevent location being set in opposite direction of scroll
            if ((scrollDir == this.SCROLL_DOWN && currX > locX) || (scrollDir == this.SCROLL_UP && currX < locX)) locX = currX;
        }
        locMarkEl.setX(locX);
    }
});