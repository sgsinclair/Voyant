Ext.define('Voyant.VoyantDefaultApp', {
	extend : 'Voyant.VoyantCorpusApp',
	requires: ['Voyant.panel.VoyantHeader', 'Voyant.panel.VoyantFooter', 'Voyant.panel.CorpusCreator', 'Voyant.panel.Cirrus', 'Voyant.panel.Summary', 'Voyant.panel.CorpusTerms', 'Voyant.panel.Reader', 'Voyant.panel.Documents', 'Voyant.panel.Trends', 'Voyant.panel.Contexts', 'Voyant.panel.DocumentTerms','Voyant.panel.CorpusCollocates','Voyant.panel.CollocatesGraph'],
	name : 'VoyantDefaultApp',
	config: {
		toolsContainerMainEastSouthTabpanelInitialCollapsed: true
	},
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
    				corpus: corpusId
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
					itemId: 'toolsContainer-main',
					frame: true,
					border: true,
					items: [{
				        region: 'center',
				        flex: 3,
				        layout: 'fit',
				        items: {
					        xtype: 'reader',
							frame: true,
							border: true
				        }
				       
				    }, {
				    	region: 'west',
				    	flex: 3,
				    	layout: 'fit',
				        moreTools: ['cirrus','corpusterms'],
				    	items: {
					    	xtype: 'cirrus',
							frame: true,
							border: true
				    	}
				    }, {
				    	region: 'east',
				    	flex: 3,
				    	layout: 'fit',
				    	moreTools: ['trends','collocatesgraph','corpuscollocates'],
				        items: {
					    	xtype: 'trends'
				        }
				    }, {
				    	region: 'south',
				    	flex: 2,
				    	layout: {
				    		type: 'hbox',
				    		align: 'stretch'
				    	},
				    	
				    	items: [{
								frame: true,
								border: true,
								layout: 'fit',
				    			flex: 1,
				    			moreTools: ['summary','documents'],
				    			items: {
					    			xtype: 'summary'
				    			}
				    		},{
								frame: true,
								border: true,
								layout: 'fit',
				    			flex: 1,
				    			moreTools: ['contexts','documentterms'],
				    			items: {
					    			xtype: 'contexts'
				    			}
				    	}]
				    }]
				}]
		    }]
		});
		this.callParent(arguments);
	}
});