Ext.define('Voyant.panel.MoreLikeThis', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.morelikethis',
	title: "More Like this"
})
Ext.define('Voyant.VoyantDocumentToolsetApp', {
	extend : 'Voyant.VoyantCorpusApp',
	requires: ['Voyant.panel.Contexts','Voyant.panel.CollocatesGraph','Voyant.panel.Trends'],
	name : 'VoyantDocumentToolsetApp',
	launch: function() {
		Ext.Viewport.add({
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
        		   xtype: 'documentterms',
                   collapsible: true
        	   },{
        		   xtype: 'contexts',
                   collapsible: true
        	   },{
        		   xtype: 'collocatesgraph',
                   collapsible: true
        	   },{
        		   xtype: 'trends',
                   collapsible: true
        	   },{
        		   xtype: 'morelikethis',
                   collapsible: true
        	   }],
        	   flex: 6
           }]
		});
        this.callParent(arguments);
	}
});