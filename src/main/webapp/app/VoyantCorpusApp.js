Ext.define('Voyant.VoyantCorpusApp', {
	
    extend: 'Voyant.VoyantApp',
    
    name: 'VoyantCorpusApp',

    requires: ['Voyant.panel.CorpusSet','Voyant.data.model.Corpus','Voyant.panel.VoyantHeader', 'Voyant.panel.VoyantFooter', 'Voyant.panel.CorpusCreator', 'Voyant.panel.Cirrus', 'Voyant.panel.Summary', 'Voyant.panel.CorpusTerms', 'Voyant.panel.Reader', 'Voyant.panel.Documents', 'Voyant.panel.Trends', 'Voyant.panel.Contexts', 'Voyant.panel.DocumentTerms','Voyant.panel.CorpusCollocates','Voyant.panel.CollocatesGraph','Voyant.panel.Phrases','Voyant.panel.ScatterPlot','Voyant.panel.TopicContexts','Voyant.panel.TermsRadio'],
    
    statics: {
    	i18n: {
    		fetchingCorpus: {en: 'Fetching your corpus'},
    		moreToolsScale: {en: 'Tools by Scale'},
    		moreToolsScaleCorpus: {en: 'Corpus Tools'},
    		moreToolsScaleDocument: {en: 'Document Tools'},
    		moreToolsType: {en: 'Tools by Type'},
    		moreToolsTypeViz: {en: 'Visualization Tools'},
    		moreToolsTypeGrid: {en: 'Grid Tools'},
    		moreToolsTypeOther: {en: 'Other Tools'}
    	}
    },
    
    config: {
    	corpus: undefined,
    	moreTools: [{
    		i18n: 'moreToolsScale',
    		glyph: 'xf07d@FontAwesome',
    		items: [{
    			i18n: 'moreToolsScaleCorpus',
    			glyph: 'xf111@FontAwesome',
    			items: ['cirrus','corpusterms','corpuscollocates','phrases','documents','summary','trends','scatterplot','termsradio']
    		},{
    			i18n: 'moreToolsScaleDocument',
    			glyph: 'xf10c@FontAwesome',
    			items: ['cirrus','contexts','documentterms','reader','trends']
    		}]
    	},{
    		i18n: 'moreToolsType',
    		glyph: 'xf12e@FontAwesome',
    		items: [{
    			i18n: 'moreToolsTypeViz',
    			glyph: 'xf06e@FontAwesome',
    			items: ['cirrus','collocatesgraph','trends','scatterplot','termsradio']
    		},{
    			i18n: 'moreToolsTypeGrid',
    			glyph: 'xf0ce@FontAwesome',
    			items: ['corpusterms','corpuscollocates','phrases','contexts','documentterms','documents']
    		},{
    			i18n: 'moreToolsTypeOther',
    			glyph: 'xf035@FontAwesome',
    			items: ['reader','summary']
    		}]
    	}]
    },
    
    launch: function() {
		this.callParent(arguments);

		// check parameters to see if we can load a corpus 
    	var queryParams = Ext.Object.fromQueryString(document.location.search);

    	if (this.hasQueryToLoad()) {
    		var me = this;
    		var view = me.getViewport()
    		view.mask(this.localize("fetchingCorpus"));
    		new Corpus(queryParams).then(function(corpus) {
    			view.unmask();
    			me.dispatchEvent('loadedCorpus', this, corpus);
    		}).fail(function(message, response) {
    			view.unmask();
    			//me.showErrorResponse({message: message}, response);
    		});
    	}
    },
    
    hasQueryToLoad: function(params) {
    	if (!params) {
    		params = Ext.Object.fromQueryString(document.location.search);
    	}
    	return params.corpus || params.input; // TODO: should this include "archive" from V1?
    },
    
    listeners: {
    	loadedCorpus: function(src, corpus) {
    		this.setCorpus(corpus);
    	}
    }

});