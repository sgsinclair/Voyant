Ext.define('Voyant.VoyantDefaultApp', {
	extend : 'Voyant.VoyantCorpusApp',
	requires: ['Voyant.panel.VoyantHeader', 'Voyant.panel.VoyantFooter', 'Voyant.panel.CorpusCreator', 'Voyant.panel.Cirrus', 'Voyant.panel.Summary', 'Voyant.panel.CorpusTerms', 'Voyant.panel.Reader', 'Voyant.panel.Documents', 'Voyant.panel.Trends', 'Voyant.panel.Contexts', 'Voyant.panel.DocumentTerms','Voyant.panel.CorpusCollocates','Voyant.panel.CollocatesGraph'],
	name : 'VoyantDefaultApp',
	listeners: {
    	loadedCorpus: function(src, corpus) {
    		this.viewport.down('voyantheader').collapse();
    		this.viewport.down('#toolsContainer').setActiveItem(1);
    		
    		if (window.history.pushState) {
    			// add the corpusId to the url
    			var corpusId = corpus.getId();
        		var queryParams = Ext.Object.fromQueryString(document.location.search);
        		
    			var url = this.getBaseUrl()+'?corpus='+corpusId;
    			for (var key in queryParams) {
    				if (key !== 'corpus') {
    					url += '&'+key+'='+queryParams[key];
    				}
    			}
    			window.history.pushState({
    				corpus: corpusId,
    			}, 'Corpus: '+corpusId, url);
    		}
    	}
	},
	launch: function() {
		var SPLIT_SIZE = 5;
		this.viewport = Ext.create('Ext.container.Viewport', {
		    layout: 'border',
		    items: [{
		    	xtype: 'voyantheader',
		    	region: 'north'
		    },{
		        region: 'south',
		        xtype: 'voyantfooter'
		    },{
		    	region: 'center',
		    	layout: 'card',
		    	itemId: 'toolsContainer',
				activeItem: 0,
				items: [{
					xtype : 'container',
					layout: {
		                type: 'hbox',
		                pack: 'center'
		            },
					items: {
						xtype: 'corpuscreator'
					}
				},{
					layout: 'border',
					items: [{
				        region: 'center',
				        flex: 1,
				        xtype: 'reader',
				    },{
				    	region: 'west',
				    	flex: 1,
				        layout: 'border',
				        split: {
				        	size: SPLIT_SIZE
				        },
				        items: [{
							xtype : 'tabpanel',
							region : 'center',
							items : [ {
								xtype : 'cirrus',
								collapsible : true
							}, {
								xtype : 'corpusterms',
								collapsible : true
							} ],
							flex : 6
						}, {
							xtype : 'tabpanel',
							region : 'south',
							split : {
					        	size: SPLIT_SIZE
					        },
							items : [ {
								xtype : 'summary',
								collapsible : true
							}, {
								xtype : 'documents',
								collapsible : true
							} ],
							flex : 4
						}]
				    },{
				    	region: 'east',
						split : {
				        	size: SPLIT_SIZE
				        },
						flex : 1,
						layout : 'border',
						items : [ {
							xtype : 'tabpanel',
							region : 'center',
							flex : 5,
							items : [ {
								xtype : 'trends',
								collapsible : true
							}, {
								xtype : 'documentterms',
								collapsible : true
							}, {
								xtype : 'corpuscollocates',
								collapsible : true
							} ]
						}, {
							xtype : 'tabpanel',
							region : 'south',
							split : {
					        	size: SPLIT_SIZE
					        },
							flex : 5,
							items : [ {
								xtype : 'collocatesgraph',
								split : true,
								flex : 5,
								collapsible : true
							}, {
								xtype : 'contexts',
								split : true,
								flex : 5,
								collapsible : true
							}

							]
						} ]
				    }]
				}]
		    }]
		});
		this.callParent(arguments);
	}
});