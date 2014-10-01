Ext.define('Voyant.VoyantDefaultApp', {
	extend : 'Voyant.VoyantCorpusApp',
	requires: ['Voyant.panel.VoyantHeader', 'Voyant.panel.VoyantFooter', 'Voyant.panel.Cirrus', 'Voyant.panel.Summary', 'Voyant.panel.CorpusTerms', 'Voyant.panel.Reader', 'Voyant.panel.Documents', 'Voyant.panel.Trends', 'Voyant.panel.Contexts', 'Voyant.panel.DocumentTerms','Voyant.panel.CollocatesGraph'],
	name : 'VoyantDefaultApp',
	launch: function() {
		Ext.create('Ext.container.Viewport', {
		    layout: 'border',
		    items: [{
		    	xtype: 'voyantheader',
		    	region: 'north'
		    },{
		        region: 'south',
		        xtype: 'voyantfooter'
		    }, {
		        region: 'center',
		        flex: .4,
//		        layout: 'border',
		        xtype: 'reader',
		        /*items: [
		               {
		            	   xtype: 'reader',
		            	   region: 'center',
		                   collapsible: true,
		                   flex: 6
		               },
		               {
		            	   xtype: 'documents',
		            	   region: 'south',
		                   collapsible: true,
		                   split: true,
		                   flex: 4
		               }
		        ]*/
		    },{
		    	region: 'west',
		    	flex: .3,
		        layout: 'border',
		        split: true,
		        items: [
		               {
		            	   xtype: 'tabpanel',
		            	   region: 'center',
		   		    	split: true,
		            	   items: [{
		            		   xtype: 'cirrus',
			                   collapsible: true
		            	   },{
		            		   xtype: 'corpusterms',
			                   collapsible: true
		            	   }],
		            	   flex: 6
		               },{
		            	   xtype: 'tabpanel',
		            	   region: 'south',
		   		    	   split: true,
		            	   items: [{
		            		   xtype: 'summary',
			                   collapsible: true
		            	   },{
		            		   xtype: 'documents',
			                   collapsible: true
		            	   }],
		            	   flex: 4
		               }
		        ]
		    },{
		    	region: 'east',
		    	split: true,
		    	flex: .3,
		        layout: 'border',
		        items: [
		               {
		            	   xtype: 'tabpanel',
		            	   region: 'center',
		            	   items: [{
		            		   xtype: 'trends',
			                   collapsible: true
		            	   },{
		            		   xtype: 'documentterms',
			                   collapsible: true
		            	   }],
		            	   flex: 5
		               },
		               {
		            	   xtype: 'tabpanel',
		            	   region: 'south',
		            	   flex: 5,
		            	   items: [
									{
										   xtype: 'collocatesgraph',
										   split: true,
										   flex: 5,
									    collapsible: true
									},{
					            	   xtype: 'contexts',
					            	   split: true,
					            	   flex: 5,
					                   collapsible: true
					               }
					               
		            	   ],
		            	   tools: this.getTools()
		               }
		        ]
		    }]
		});
		this.callParent(arguments);
	}
});