Ext.define('Voyant.panel.CorpusSet', {
	extend: 'Ext.panel.Panel',
    requires: ['Voyant.panel.VoyantTabPanel','Voyant.panel.Cirrus', 'Voyant.panel.Summary', 'Voyant.panel.CorpusTerms', 'Voyant.panel.Reader', 'Voyant.panel.Documents', 'Voyant.panel.Trends', 'Voyant.panel.Contexts', 'Voyant.panel.Phrases', 'Voyant.panel.DocumentTerms','Voyant.panel.CorpusCollocates','Voyant.panel.CollocatesGraph'],
	mixins: ['Voyant.panel.Panel'],
    alias: 'widget.corpusset',
	statics: {
		i18n: {
			title: {en: "Corpus View"},
			helpTip: {en: "This is the default, general-purpose corpus view."}
		},
		api: {
			panels: undefined
		},
		glyph: 'xf17a@FontAwesome'
	},
	constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
	},
	layout: 'border',
	items: [{
    	region: 'west',
    	flex: 3,
    	layout: 'fit',
        moreTools: ['cirrus','corpusterms'],
        xtype: 'voyanttabpanel',
    	split: {width: 5},
    	tabBarHeaderPosition: 0,
    	items: [{
	    	xtype: 'cirrus'
    		
    	},{
	    	xtype: 'corpusterms'
    	}]
    },{
        region: 'center',
        flex: 3,
        layout: 'fit',
        xtype: 'voyanttabpanel',
    	tabBarHeaderPosition: 0,
        items: [{
	        xtype: 'reader'
        }]
    }, {
    	region: 'east',
    	flex: 3,
    	layout: 'fit',
        xtype: 'voyanttabpanel',
    	split: {width: 5},
    	tabBarHeaderPosition: 0,
    	moreTools: ['trends','collocatesgraph','corpuscollocates'],
        items: [{
	    	xtype: 'trends'
        },{
	    	xtype: 'collocatesgraph'
        },{
	    	xtype: 'corpuscollocates'
        }]
    }, {
    	region: 'south',
    	flex: 2,
    	split: {width: 5},
    	layout: 'border',
//    	layout: {
//    		type: 'hbox',
//    		align: 'stretch'
//    	},
    	items: [{
				layout: 'fit',
				region: 'center',
    			flex: 1,
    	        xtype: 'voyanttabpanel',
    	    	split: {width: 5},
    	    	tabBarHeaderPosition: 0,
    			moreTools: ['summary','documents','phrases'],
    			items: [{
	    			xtype: 'summary'
    			},{
	    			xtype: 'documents'
    			},{
	    			xtype: 'phrases'
    			}]
    		},{
				layout: 'fit',
				region: 'east',
    			flex: 1,
    	        xtype: 'voyanttabpanel',
    	    	split: {width: 5},
    	    	tabBarHeaderPosition: 0,
    			moreTools: ['contexts','documentterms'],
    			items: [{
	    			xtype: 'contexts'
    			},{
	    			xtype: 'bubblelines'
    			}]
    	}]
    }],
    listeners: {
    	boxready: function() {
    		var panelsString = this.getApiParam("panels");
    		if (panelsString) {
    			var panels = panelsString.toLowerCase().split(",");
    			var tabpanels = this.query("voyanttabpanel");
    			for (var i=0, len=panels.length; i<len; i++) {
    				var panel = panels[i];
    				if (panel && Ext.ClassManager.getByAlias('widget.'+panel) && tabpanels[i]) {
    					var tabpanel = tabpanels[i];
    					if (tabpanel.getActiveTab().isXType(panel)) {continue;} // already selected
    					tabpanel.items.each(function(item, index) {
    						if (item.isXType(panel)) {
    							this.setActiveTab(index)
    							return false
    						}
    					}, tabpanel)
    					if (tabpanel.getActiveTab().isXType(panel)) {continue;} // already switched
    					tabpanel.getActiveTab().replacePanel(panel); // switch to specified panel
    				}
    			}
    		}
    	},
    	loadedCorpus: function(src, corpus) {
    		if (corpus.getDocumentsCount()>30) {
    			var bubblelines = this.down('bubblelines');
    			if (bubblelines) {
    				bubblelines.up('voyanttabpanel').remove(bubblelines)
    			}
    		}
    	},
    	panelChange: function(src) {
    		var panels = [];
    		this.query("voyanttabpanel").forEach(function(item) {
    			panels.push(item.getActiveTab().xtype)
    		})
    		this.getApplication().setApiParam('panels', panels.join(','))
    	}
    }
})