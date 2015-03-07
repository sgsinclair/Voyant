Ext.define('Voyant.panel.CorpusSet', {
	extend: 'Ext.panel.Panel',
    requires: ['Voyant.panel.Cirrus', 'Voyant.panel.Summary', 'Voyant.panel.CorpusTerms', 'Voyant.panel.Reader', 'Voyant.panel.Documents', 'Voyant.panel.Trends', 'Voyant.panel.Contexts', 'Voyant.panel.DocumentTerms','Voyant.panel.CorpusCollocates','Voyant.panel.CollocatesGraph'],
	mixins: ['Voyant.panel.Panel'],
    alias: 'widget.corpusset',
	statics: {
		i18n: {
			title: {en: "Corpus View"},
			helpTip: {en: "This is the default, general-purpose corpus view."}
		},
		glyph: 'xf17a@FontAwesome'
	},
	constructor: function(config) {
        this.callParent(arguments);
	},
	layout: 'border',
	items: [{
        region: 'center',
        flex: 3,
        layout: 'fit',
        
        items: {
	        xtype: 'reader'
        }
    }, {
    	region: 'west',
    	flex: 3,
    	layout: 'fit',
        moreTools: ['cirrus','corpusterms'],
    	split: {width: 5},
    	items: {
	    	xtype: 'cirrus'
    	}
    }, {
    	region: 'east',
    	flex: 3,
    	layout: 'fit',
    	split: {width: 5},
    	moreTools: ['trends','collocatesgraph','corpuscollocates'],
        items: {
	    	xtype: 'trends'
        }
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
    	    	split: {width: 5},
    			moreTools: ['summary','documents'],
    			items: {
	    			xtype: 'summary'
    			}
    		},{
				layout: 'fit',
				region: 'west',
    			flex: 1,
    	    	split: {width: 5},
    			moreTools: ['contexts','documentterms'],
    			items: {
	    			xtype: 'contexts'
    			}
    	}]
    }]
})