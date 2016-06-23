Ext.define('Voyant.panel.Subset', { 
	
	
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel','Voyant.util.Downloadable'],
	alias: 'widget.subset',
	isConsumptive: true,
    statics: {
    	i18n: {
    	},
    	api: {
    		stopList: 'auto',
    		documentFilename: ['pubDate','title'],
    		documentFormat: 'SOURCE'
    	},
		glyph: 'xf0ce@FontAwesome'
    },
    config: {
    	options: {
    		xtype: 'stoplistoption'
    	},
		inDocumentsCountOnly: false,
		stopList: 'auto',
		store: undefined
    },
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);    	
    },
    
    
    initComponent: function(config) {
        var me = this;

        Ext.applyIf(me, {
        	introHtml: '',
        	fieldItems: [{
	        		xtype: 'querysearchfield',
	        		fieldLabel: this.localize('titleLabel'),
	        		tokenType: 'title'
        		},{
	        		xtype: 'querysearchfield',
	        		fieldLabel: this.localize('authorLabel'),
	        		tokenType: 'author'
        		},{
	        		xtype: 'querysearchfield',
	        		fieldLabel: this.localize('lexicalLabel')
        	}],
        	fieldColumns: 2
        });
        
        Ext.applyIf(me, {
        	intro: {
        		margin: '5 0 5 0',
        		layout: 'center',
        		items: {
        			itemId: 'intro',
            		html: me.introHtml
        		}
        	},
        	fields: {
				xtype: 'container',
        		layout: 'center',
        		items: {
    				xtype: 'container',
        			maxWidth: 1200,
        			layout: {
        				type: 'table',
        				columns: me.fieldColumns
        			},
        			// wrap in another container otherwise the tip won't work
        			items: me.fieldItems.map(function(item) {return {
        				xtype: 'container',
            			defaults: {
            				margin: '5 10 5 10',
                    		inDocumentsCountOnly: me.getInDocumentsCountOnly(),
                    		stopList: me.getStopList(),
                    		showAggregateInDocumentsCount: true,
                    		isDocsMode: true,
                    		flex: 1,
                    		maxWidth: 800,
                    		labelAlign: 'right'
            			},
        				items: Ext.applyIf(item, {
        					fieldLabel: me.localize((item.tokenType ? item.tokenType : 'lexical')+'Label')
        				})
        			}}, this)
        		}
        	},
        	foot: {
        		layout: 'center',
        		margin: '20 0 0 0',
        		items: {
        			xtype: 'container',
        			layout: {
        				type: 'hbox',
        				align: 'middle'
        			},
        			defaults: {
    	        		margin: '0 5 0 5',
//    	        		scale: 'large',
    	        		width: 200
        			},
        			items:  [{
    	        		xtype: 'button',
    	        		itemId: 'export',
	                    glyph: 'xf08e@FontAwesome',
    	        		text: this.localize('sendToVoyantButton'),
    	        		handler: me.handleSendToVoyant,
    	        		scope: me
            		},{
    	        		xtype: 'button',
				    	glyph: 'xf019@FontAwesome',
    	        		itemId: 'download',
    	        		text: this.localize('downloadButton'),
    	        		handler: me.handleExport,
    	        		scope: me
            		},{
            			xtype: 'container',
            			hidden: true,
            			itemId: 'statuscontainer',
            			layout: 'vbox',
            			items: [{
            				itemId: 'status',
            				bodyStyle: 'text-align: center',
            				width: 200
            			},{
            				xtype: 'container',
            				width: 200,
            				items: {
            	    			xtype: 'sparklineline',
            	    			chartRangeMin: 0,
            	    			itemId: 'sparkline',
            	    			margin: '0 0 0 10',
            	    			values: [1,1],
            	    			height: 20,
            	    			width: 200
            				}
            			}]
            		}]
        		}
        	}
        })

        Ext.applyIf(me, {
        	items: [me.intro, me.fields, me.foot]
        });
        
    	me.on('loadedCorpus', function(src, corpus) {
    		me.getStore().setCorpus(corpus);
    		if (me.getInitialConfig('introHtml')==undefined && me.getInitialConfig('intro')==undefined) {
    			 me.queryById('intro').setHtml(corpus.getString())
    		}
    	}, me);
    	
    	me.on('query', function(src, queries) {
    		this.performAggregateQuery(this.getAggregateQuery());
    	});
    	
    	me.setStore(Ext.create('Voyant.data.store.DocumentQueryMatches'))
        me.callParent([config]);
        
    },
    
    handleSendToVoyant: function() {
    	if (!this.getStore().lastOptions || !this.getStore().lastOptions.params.query) {
    		// there's currently no query, so give the option of opening the current corpus in a new window
    		Ext.Msg.alert(this.localize('sendToVoyantButton'), new Ext.XTemplate(this.localize('sendToVoyantNoQuery')).apply([this.getBaseUrl()+"?corpus="+this.getStore().getCorpus().getId()]))
    	} else {
    		// try spawning a new corpus with the query
    		var me = this;
        	this.mask("Creating corpus…");
        	this.getStore().load({
        		params: {
        			query: this.getStore().lastOptions.params.query,
        			createNewCorpus: true
        		},
        		callback: function(records, operation, success) {
        			me.unmask();
        			if (success && records && records.length==1) {
            			var corpus = operation.getProxy().getReader().metaData;
        				var url = me.getBaseUrl()+"?corpus="+corpus;
        				me.openUrl(url);
        			}
        		}
        	})
    	}
    },
    
    handleExport: function() {
    	if (!this.getStore().lastOptions || !this.getStore().lastOptions.params.query) {
    		this.downloadFromCorpusId(this.getStore().getCorpus().getId());
    	} else {
    		var record = this.getStore().getAt(0);
    		if (this.getStore().lastOptions.params.query && record && record.getCount()==0) {
    			this.showMsg({message: this.localize('noMatches')})
    		} else {
    	    	this.getStore().load({
    	    		params: {
    	    			query: this.getStore().lastOptions.params.query,
    	    			createNewCorpus: true,
    	    			temporaryCorpus: true
    	    		},
    	    		callback: function(records, operation, success) {
    	    			if (success && records && records.length==1) {
    	    	    		this.downloadFromCorpusId(operation.getProxy().getReader().metaData);
    	    			}
    	    		},
    	    		scope: this
    	    	})
    		}
    	}
    },
    
    openDownloadCorpus: function(corpus) {
		var url = this.getTromboneUrl()+"?corpus="+corpus+"&tool=corpus.CorpusExporter&outputFormat=zip"+
			"&zipFilename=DownloadedVoyantCorpus-"+corpus+".zip"+
			(this.getApiParam("documentFormat") ? "&documentFormat="+this.getApiParam("documentFormat") : '')+
			(this.getApiParam("documentFilename") ? "&documentFilename="+this.getApiParam("documentFilename") : '')
		this.openUrl(url)
    },

    performAggregateQuery: function(query) {
    	var me = this, statuscontainer = me.queryById('statuscontainer'), status = me.queryById('status'), spark = me.queryById('sparkline');
		if (statuscontainer) {statuscontainer.show();}
		if (status) {status.setHtml(new Ext.XTemplate('{0:plural("documents")} matching.').apply([0]))}
		if (spark) {spark.setValues([0,0]);}
    	if (query) {
        	var docsCount = this.getStore().getCorpus().getDocumentsCount();
        	this.getStore().load({
        		params: {
        			query: query,
        			withDistributions: true,
        			bins: docsCount > 100 ? 100 : docsCount 
        		},
        		callback: function(records, operation, success) {
        			var exp = me.queryById('export');
        			var spark = me.queryById('sparkline');
        			if (success && records && records.length==1) {
        				if (status) {
        					status.setHtml(new Ext.XTemplate('{0:plural("document")} matching.').apply([records[0].getCount()]))
        				}
        				if (spark) {
            				spark.setValues(records[0].getDistributions())
        				}
        			}
        		}
        	})
    	} else if (this.getStore().lastOptions) { // set query to undefined so that send/export buttons work properly
    		this.getStore().lastOptions.params.query = undefined
    	}
    },
    
    getAggregateQuery: function() {
		var aggregateQueries = [];
		Ext.ComponentQuery.query('field', this).forEach(function(field) {
			if (field.getTokenType && field.getValue) {
				var tokenType = field.getTokenType();
				var vals = Ext.Array.from(field.getValue());
				if (vals.length>0) {
					if (vals.length>0) {
        				aggregateQueries.push("+("+vals.map(function(val) {
        					return tokenType+":"+val
        				}).join("|")+")");
					}
				}
			}
		})
		return aggregateQueries.join(" ");
    }
})
