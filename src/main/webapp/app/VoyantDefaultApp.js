Ext.define('Voyant.VoyantDefaultApp', {
	extend : 'Voyant.VoyantCorpusApp',
	requires: ['Voyant.panel.VoyantHeader', 'Voyant.panel.VoyantFooter', 'Voyant.panel.CorpusCreator', 'Voyant.panel.Cirrus', 'Voyant.panel.Summary', 'Voyant.panel.CorpusTerms', 'Voyant.panel.Reader', 'Voyant.panel.Documents', 'Voyant.panel.Trends', 'Voyant.panel.Contexts', 'Voyant.panel.DocumentTerms','Voyant.panel.CollocatesGraph'],
	name : 'VoyantDefaultApp',
	listeners: {
    	loadedCorpus: function(src, corpus) {
    		this.viewport.down('voyantheader').collapse();
    		this.viewport.down('#toolsContainer').setActiveItem(1);
    	}
	},
	launch: function() {
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
					xtype: 'corpuscreator',
					margin: '25 50 0 50'
				},{
					layout: 'border',
					items: [{
				        region: 'center',
				        flex: .4,
				        xtype: 'reader',
				    },{
				    	region: 'west',
				    	flex: .3,
				        layout: 'border',
				        split: true,
				        items: [{
							xtype : 'tabpanel',
							region : 'center',
							split : true,
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
							split : true,
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
						split : true,
						flex : .3,
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
							} ]
						}, {
							xtype : 'tabpanel',
							region : 'south',
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