Ext.define('Voyant.panel.CorpusSet', {
	extend: 'Ext.panel.Panel',
    requires: ['Voyant.panel.Cirrus', 'Voyant.panel.Summary', 'Voyant.panel.CorpusTerms', 'Voyant.panel.Reader', 'Voyant.panel.Documents', 'Voyant.panel.Trends', 'Voyant.panel.Contexts', 'Voyant.panel.DocumentTerms','Voyant.panel.CorpusCollocates','Voyant.panel.CollocatesGraph'],
	mixins: ['Voyant.panel.Panel'],
    alias: 'widget.corpusset',
	statics: {
		i18n: {
			title: {en: "Corpus Skin"},
			helpTip: {en: "Corpus Skin"}
		},
		glyph: 'xf17a@FontAwesome'
	},
	constructor: function(config) {
        this.callParent(arguments);
	},
	layout: 'border',
	header: false,
	items: [{
        region: 'center',
        flex: 3,
        layout: 'fit',
        items: {
	        xtype: 'reader',
			frame: true,
			border: true
        }
       
    }, {
    	region: 'west',
    	flex: 3,
    	layout: 'fit',
        moreTools: ['cirrus','corpusterms'],
    	items: {
	    	xtype: 'cirrus',
			frame: true,
			border: true
    	}
    }, {
    	region: 'east',
    	flex: 3,
    	layout: 'fit',
    	moreTools: ['trends','collocatesgraph','corpuscollocates'],
        items: {
	    	xtype: 'trends'
        }
    }, {
    	region: 'south',
    	flex: 2,
    	layout: {
    		type: 'hbox',
    		align: 'stretch'
    	},
    	
    	items: [{
				frame: true,
				border: true,
				layout: 'fit',
    			flex: 1,
    			moreTools: ['summary','documents'],
    			items: {
	    			xtype: 'summary'
    			}
    		},{
				frame: true,
				border: true,
				layout: 'fit',
    			flex: 1,
    			moreTools: ['contexts','documentterms'],
    			items: {
	    			xtype: 'contexts'
    			}
    	}]
    }]
})
Ext.define('Voyant.panel.CorpusSet', {
	extend: 'Ext.panel.Panel',
    requires: ['Voyant.panel.Cirrus', 'Voyant.panel.Summary', 'Voyant.panel.CorpusTerms', 'Voyant.panel.Reader', 'Voyant.panel.Documents', 'Voyant.panel.Trends', 'Voyant.panel.Contexts', 'Voyant.panel.DocumentTerms','Voyant.panel.CorpusCollocates','Voyant.panel.CollocatesGraph'],
	mixins: ['Voyant.panel.Panel'],
    alias: 'widget.corpusset',
	statics: {
		i18n: {
			title: {en: "Corpus Skin"},
			helpTip: {en: "Corpus Skin"}
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
	        xtype: 'reader',
			frame: true,
			border: true
        }
       
    }, {
    	region: 'west',
    	flex: 3,
    	layout: 'fit',
        moreTools: ['cirrus','corpusterms'],
    	items: {
	    	xtype: 'cirrus',
			frame: true,
			border: true
    	}
    }, {
    	region: 'east',
    	flex: 3,
    	layout: 'fit',
    	moreTools: ['trends','collocatesgraph','corpuscollocates'],
        items: {
	    	xtype: 'trends'
        }
    }, {
    	region: 'south',
    	flex: 2,
    	layout: {
    		type: 'hbox',
    		align: 'stretch'
    	},
    	
    	items: [{
				frame: true,
				border: true,
				layout: 'fit',
    			flex: 1,
    			moreTools: ['summary','documents'],
    			items: {
	    			xtype: 'summary'
    			}
    		},{
				frame: true,
				border: true,
				layout: 'fit',
    			flex: 1,
    			moreTools: ['contexts','documentterms'],
    			items: {
	    			xtype: 'contexts'
    			}
    	}]
    }]
})
