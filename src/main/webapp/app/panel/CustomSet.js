Ext.define('Voyant.panel.CustomSet', {
	extend: 'Ext.panel.Panel',
    requires: ['Voyant.panel.VoyantTabPanel','Voyant.panel.Cirrus', 'Voyant.panel.Summary', 'Voyant.panel.CorpusTerms', 'Voyant.panel.Reader', 'Voyant.panel.Documents', 'Voyant.panel.Trends', 'Voyant.panel.Contexts', 'Voyant.panel.Phrases', 'Voyant.panel.DocumentTerms','Voyant.panel.CorpusCollocates','Voyant.panel.CollocatesGraph','Voyant.panel.StreamGraph'],
	mixins: ['Voyant.panel.Panel'],
    alias: 'widget.customset',
	statics: {
		i18n: {
			title: {en: "Custom View"},
			helpTip: {en: "This is a custom view."},
			noSuchTool: {en: "The specified tool ({0}) does not exist."}
		},
		api: {
			panels: undefined
		},
		glyph: 'xf17a@FontAwesome'
	},
	layout: 'border',
	header: false,
	height: '100%',
	width: '100%',
	
    constructor: function() {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
	
	listeners: {
		afterrender: function(panel) {
	    	var params = Ext.urlDecode(window.location.search.substring(1));
	        var layoutString = decodeURI(params.layout)
	        	.replace(/r1/g, 'region')
		        .replace(/i1/g, 'items')
		        .replace(/s1/g, 'split')
		        .replace(/c1/g, 'collapsible')
		        .replace(/c2/g, 'collapsed')
		        .replace(/w1/g, 'width')
		        .replace(/h1/g, 'height')
		        .replace(/p1/g, '%')
		        .replace(/"x1":"/g, '"xtype":"')
		        .replace(/c3/g, 'center')
		        .replace(/n1/g, 'north')
		        .replace(/e1/g, 'east')
		        .replace(/s2/g, 'south')
		        .replace(/w2/g, 'west')
		    	.replace(/"xtype":"(\w+)"/g, function(match, tool) {
	            	if (!Ext.ClassManager.getByAlias("widget."+tool.toLowerCase())) {
			            if (tool=="Links") {tool="CollocatesGraph";}
			            else if (tool=="CorpusGrid") {tool="Documents";}
			            else if (tool=="CorpusSummary") {tool="Summary";}
			            else if (tool=="CorpusTypeFrequenciesGrid") {tool="CorpusTerms";}
			            else if (tool=="DocumentInputAdd") {tool="CorpusTerms";}
			            else if (tool=="DocumentTypeCollocateFrequenciesGrid") {tool="CorpusTerms";}
			            else if (tool=="DocumentTypeFrequenciesGrid") {tool="DocumentTerms";}
			            else if (tool=="DocumentTypeKwicsGrid") {tool="Contexts";}
			            else if (tool=="TypeFrequenciesChart") {tool="Trends";}
			            else if (tool=="VisualCollocator") {tool="CollocatesGraph";}
			            else {tool="NoTool"}
	            	}
	            	return '"xtype":"'+tool.toLowerCase()+'"'+(tool=="NoTool" ? ',"html":"'+new Ext.Template(panel.localize('noSuchTool')).applyTemplate([tool])+'"' : '')
			    })
	        
	        var items;
	        try {
	            items = Ext.decode(layoutString);
	        } catch (e) {
	            items = {region: 'center', html: '<div>Error constructing layout:'+e+'</div>'};
	        }
	        
	        if (items == null) {
	        	items = {region: 'center', html: '<div>Error: no layout information found.</div>'}
	        }
	        
	        this.addLayouts(items);

	        this.add(items)
		}

	},
	
	addLayouts: function(items) {
    	var size = Ext.getBody().getSize();
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (Ext.isString(item.width)) {
            	item.width = Math.round(size.width * parseInt(item.width) / 100);
            } else if (Ext.isString(item.height)) {
            	item.height = Math.round(size.height * parseInt(item.height) / 100);
            }
            if (item.items && item.items.length > 1) {
                item.layout = 'border';
                this.addLayouts(item.items);
            } else {
                item.layout = 'fit';
            }
        }
	}
})