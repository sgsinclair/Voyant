Ext.define('Voyant.panel.MicroOcp', {
	extend: 'Ext.panel.Panel',
	requires: ['Voyant.widget.Facet'],
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.microocp',
    statics: {
    	i18n: {
    	},
    	api: {
    		config: undefined,
    		stopList: 'auto'
    	},
		glyph: 'xf1ea@FontAwesome'
    },
    config: {
    },
    
    constructor: function(config) {
    	config = config || {};
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments); // we need api
		
    	Ext.apply(this, {
    		title: this.localize('title'),
    		layout: 'hbox',
    		items: [
    		        {
    		        	layout: 'hbox',
    		        	height: '100%',
    		        	align: 'stretch',
    		        	itemId: 'facets',
    		        	defaults: {
    		        		width: 250,
    		        		flex: 1,
    		        		xtype: 'facet',
    		        		margin: 5,
    		        		border: true,
    		        		frame: true,
    		            	includeTools: {
    		            		close: {
    		            			type: 'close',
    		                		tooltip: this.localize('closeFacetTip'),
    		                		callback: function(facetCmp) {
    		                			delete this.facets[facetCmp.facet]; // remove from facets map
    		                			facetCmp.destroy(); // remove this facet
    		                			this.updateResults();
    		                		},
    		                		scope: this
    		            		},
    		            		add: {
    		            			type: 'plus',
    		                		tooltip: this.localize('plusFacetTip'),
    		                		callback: function() {
    		                			this.addFacet();
    		                		},
    		                		scope: this
    		            		}
    		            	}
    		        	},
    		        	items: []
    		        },
    		        {
    		        	xtype: 'panel',
    		        	html: config.customResultsHtml || '',
    		        	flex: 1,
    		        	itemId: 'results',
    		        	height: '100%',
    		        	align: 'stretch',
    		        	scrollable: true,
    		        	margin: 5,
    		        	getCorpus: function() { // for query search field
    		        		return this.findParentByType('panel').getCorpus();
    		        	},
    		        	listeners: {
    		        		query: function(src, query) {
    		        			this.findParentByType('panel').updateResults(Ext.isString(query) ? [query] : query)
    		        		}
    		        	},
    		    		dockedItems: [{
    		                dock: 'bottom',
    		                xtype: 'toolbar',
    		                overflowHandler: 'scroller',
    		                items: [{
	    		        		itemId: 'sendToVoyant',
	    		        		text: this.localize('sendToVoyantButton'),
	    		        		disabled: true,
	    		        		handler: function() {
	    		        			this.mask(this.localize("exportInProgress"));
	    		        			var catalogue = this;
	    		            		Ext.Ajax.request({
	    		            			url: this.getApplication().getTromboneUrl(),
	    		            			params: {
	    		            				corpus: this.getCorpus().getId(),
	    		            				tool: 'corpus.CorpusManager',
	    		            				keepDocuments: true,
	    		            				docId: this.getMatchingDocIds()
	    		            			},
	    		            		    success: function(response, opts) {
	    		            		    	catalogue.unmask();
	    		            		    	var json = Ext.JSON.decode(response.responseText);
		                    				var url = catalogue.getBaseUrl()+"?corpus="+json.corpus.id;
		                    				catalogue.openUrl(url);
	    		            		    },
	    		            		    failure: function(response, opts) {
	    		            		    	catalogue.unmask();
	    		            		    	me.showResponseError("Unable to export corpus: "+catalogue.getCorpus().getId(), response);
	    		            		    }
	    		            		})
	
	    		        		},
	    		        		scope: this
	    		        	},{
	    		        		itemId: 'export',
	    		        		text: this.localize('downloadButton'),
	    		        		disabled: true,
	    		        		handler: function() {
	    		        			this.mask(this.localize("exportInProgress"));
	    		        			var catalogue = this;
	    		            		Ext.Ajax.request({
	    		            			url: this.getApplication().getTromboneUrl(),
	    		            			params: {
	    		            				corpus: this.getCorpus().getId(),
	    		            				tool: 'corpus.CorpusManager',
	    		            				keepDocuments: true,
	    		            				docId: this.getMatchingDocIds()
	    		            			},
	    		            		    success: function(response, opts) {
	    		            		    	catalogue.unmask();
	    		            		    	var json = Ext.JSON.decode(response.responseText);
	    		            		    	catalogue.downloadFromCorpusId(json.corpus.id);
	    		            		    },
	    		            		    failure: function(response, opts) {
	    		            		    	catalogue.unmask();
	    		            		    	me.showResponseError("Unable to export corpus: "+catalogue.getCorpus().getId(), response);
	    		            		    }
	    		            		})
	
	    		        		},
	    		        		scope: this
	    		        	},{
	    		        		xtype: 'querysearchfield',
	    		        		width: 200,
	    		        		flex: 1
	    		        	},{
	    		        		itemId: 'status',
	    		        		xtype: 'tbtext'
	    		        	}]
    		    		}]
    		        }, {
    		        	xtype: this.getApiParam("reader"),
    		        	flex: 1,
    		        	height: '100%',
    		        	align: 'stretch',
    		        	header: false
    		        }]
    	});

        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    	});
    	
    	this.on('afterrender', function(panel) {
    		
    	});
    	
    	
    }
    
});
