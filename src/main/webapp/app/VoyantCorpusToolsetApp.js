Ext.define('Voyant.panel.DocumentClusters', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.documentclusters',
	title: "Document Clusters"
})
//Ext.define('Voyant.panel.RezoViz', {
//	extend: 'Ext.panel.Panel',
//	alias: 'widget.rezoviz',
//	title: "RezoViz"
//})
Ext.define('Voyant.VoyantCorpusToolsetApp', {
	extend : 'Voyant.VoyantCorpusApp',
	requires: ['Voyant.panel.Contexts','Voyant.panel.CollocatesGraph','Voyant.panel.Trends'],
	name : 'VoyantCorpusToolsetApp',
	launch: function() {
		Ext.create('Ext.container.Viewport', {
		    layout: 'border',
		    items: [{
		        region: 'south',
		        xtype: 'voyantfooter'
		    }, {
         	   xtype: 'tabpanel',
        	   region: 'center',
		    	split: true,
        	   items: [{
        		   xtype: 'cirrus',
                   collapsible: true
        	   },{
        		   xtype: 'corpusterms',
                   collapsible: true
        	   },{
        		   xtype: 'documents',
                   collapsible: true
        	   },{
        		   xtype: 'rezoviz',
                   collapsible: true
        	   },{
        		   xtype: 'trends',
                   collapsible: true
        	   },{
        		   xtype: 'documentclusters',
                   collapsible: true
        	   }],
        	   flex: 6
           }]
		});
        this.callParent(arguments);
	}
});