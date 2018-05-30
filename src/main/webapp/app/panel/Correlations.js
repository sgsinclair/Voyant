Ext.define('Voyant.panel.Correlations', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.correlations',
    statics: {
    	i18n: {
    	},
    	api: {
    		query: undefined,
    		docId: undefined,
    		docIndex: undefined,
    		stopList: 'auto',
    		minInDocumentsCountRatio: 100
    	},
		glyph: 'xf0ce@FontAwesome'
    },
    config: {
    	
    },
    constructor: function() {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
        var me = this;

        Ext.apply(me, { 
    		title: this.localize('title'),
    		emptyText: this.localize("emptyText"),
    		store: Ext.create("Voyant.data.store.TermCorrelationsBuffered", {
            	parentPanel: this
	        }),

    		columns: [{
    			text: this.localize("source"),
    			tooltip: this.localize("sourceTip"),
        		dataIndex: 'source-term',
        		sortable: false
    		},{
                xtype: 'widgetcolumn',
                tooltip: this.localize("trendTip"),
                width: 100,
                dataIndex: 'source-distributions',
                widget: {
                    xtype: 'sparklineline'
                },
                text: '←'
            },{
                xtype: 'widgetcolumn',
                tooltip: this.localize("trendTip"),
                width: 100,
                dataIndex: 'target-distributions',
                widget: {
                    xtype: 'sparklineline'
                },
                text: '→',
                align: 'right'
            },{
    			text: this.localize("target"),
    			tooltip: this.localize("targetTip"),
        		dataIndex: 'target-term',
        		sortable: false
    		},{
    			text: this.localize("correlation"),
    			tooltip: this.localize("correlationTip"),
        		dataIndex: 'correlation'
    		},{
    			text: this.localize("significance"),
    			tooltip: this.localize("significanceTip"),
        		dataIndex: 'significance'
    		}],
    		

            listeners: {
            	scope: this,
				corpusSelected: function() {
					this.setApiParams({docIndex: undefined, docId: undefined});
	        		this.getStore().getProxy().setExtraParam('tool', 'corpus.CorpusTermCorrelations');
	        		this.getStore().load();
				},
				
				documentsSelected: function(src, docs) {
					var docIds = [];
					var corpus = this.getStore().getCorpus();
					docs.forEach(function(doc) {
						docIds.push(corpus.getDocument(doc).getId())
					}, this);
					this.setApiParams({docId: docIds, docIndex: undefined})
	        		this.getStore().getProxy().setExtraParam('tool', 'corpus.DocumentTermCorrelations');
	        		this.getStore().load();
				}

            },
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                items: [{
                    xtype: 'querysearchfield'
                },{
                    xtype: 'totalpropertystatus'
                }, {
                	xtype: 'tbspacer'
                }, {
                	xtype: 'tbtext',
                	itemId: 'minInDocumentsCountRatioLabel',
                	text: me.localize('minInDocumentsCountRatioLabel')
                }, {
        			xtype: 'slider',
	            	increment: 5,
	            	minValue: 0,
	            	maxValue: 100,
	            	width: 75,
	            	listeners: {
	            		afterrender: function(slider) {
	            			slider.setValue(this.getApiParam("minInDocumentsCountRatio"))
	            			slider.up('toolbar').getComponent("minInDocumentsCountRatioLabel").setText(new Ext.XTemplate(me.localize("minInDocumentsCountRatioLabel")).apply([this.getApiParam("minInDocumentsCountRatio")]));
	            		},
	            		changecomplete: function(slider, newvalue) {
	            			this.setApiParams({minInDocumentsCountRatio: newvalue});
	            			slider.up('toolbar').getComponent("minInDocumentsCountRatioLabel").setText(new Ext.XTemplate(me.localize("minInDocumentsCountRatioLabel")).apply([newvalue]));
	            			this.getStore().load();
	            		},
	            		scope: this
	            	}
                },{
        			xtype: 'corpusdocumentselector'
        		}]
            }]
        });
        
        me.on("loadedCorpus", function(src, corpus) {
        	if (corpus.getDocumentsCount()==1) { // switch to documents mode
        		this.getStore().getProxy().setExtraParam('tool', 'corpus.DocumentTermCorrelations');
        	}
        	if (this.isVisible()) {
        		this.getStore().load();
        	}
        });
        
    	me.on("activate", function() { // load after tab activate (if we're in a tab panel)
    		if (this.getStore().getCorpus()) {this.getStore().load();}
    	}, this)

    	me.on("query", function(src, query) {
        	this.setApiParam("query", query);
        	this.getStore().load();
        }, me);
        
        me.callParent(arguments);
     }
     
});