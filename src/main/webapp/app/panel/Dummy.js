/**
 * Marked splines are multi-series splines displaying smooth curves across multiple
 * categories. Markers are placed at each connected point to clearly depict their position.
 */
Ext.define('Voyant.panel.Dummy', {
    extend: 'Ext.Panel',
    xtype: 'dummy',
	autoScroll: true,


    initComponent: function() {
        var me = this;

        
        var tools = "Voyant.util.Api,Voyant.util.Localization,Voyant.util.Deferrable,Voyant.util.DetailedError,Voyant.util.ResponseError,Voyant.util.SparkLine,Voyant.util.Toolable,Voyant.util.Transferable,Voyant.util.Variants,Voyant.util.Downloadable,Voyant.data.model.AnalysisToken,Voyant.data.model.Context,Voyant.data.model.CorpusFacet,Voyant.data.model.CorpusCollocate,Voyant.data.model.CorpusTerm,Voyant.data.model.CorpusNgram,Voyant.data.model.Dimension,Voyant.data.model.Document,Voyant.data.model.DocumentQueryMatch,Voyant.data.model.DocumentTerm,Voyant.data.model.PrincipalComponent,Voyant.data.model.StatisticalAnalysis,Voyant.data.model.Token,Voyant.data.store.VoyantStore,Voyant.data.store.CAAnalysis,Voyant.data.store.Contexts,Voyant.data.store.CorpusCollocates,Voyant.data.store.CorpusFacets,Voyant.data.store.CorpusTerms,Voyant.data.store.DocumentQueryMatches,Voyant.data.store.DocumentTerms,Voyant.data.store.Documents,Voyant.data.store.PCAAnalysis,Voyant.data.store.DocSimAnalysis,Voyant.data.store.CorpusNgrams,Voyant.data.store.Tokens,Voyant.data.model.Corpus,Voyant.widget.StopListOption,Voyant.widget.QuerySearchField,Voyant.widget.TotalPropertyStatus,Voyant.widget.DocumentSelector,Voyant.widget.CorpusDocumentSelector,Voyant.widget.DownloadFilenameBuilder,Voyant.widget.DownloadFileFormat,Voyant.widget.DownloadOptions,Voyant.panel.Panel,Voyant.panel.VoyantTabPanel,Voyant.widget.Facet,Voyant.panel.Bubblelines,Voyant.panel.Catalogue,Voyant.panel.Cirrus,Voyant.panel.CollocatesGraph,Voyant.panel.Contexts,Voyant.panel.CorpusCollocates,Voyant.panel.CorpusCreator,Voyant.panel.Knots,Voyant.panel.Phrases,Voyant.panel.CorpusTerms,Voyant.panel.DocumentTerms,Voyant.panel.Documents,Voyant.panel.DocumentsFinder,Voyant.panel.Dummy,Voyant.panel.RezoViz,Voyant.panel.Reader,Voyant.panel.ScatterPlot,Voyant.panel.StreamGraph,Voyant.panel.Summary,Voyant.panel.TopicContexts,Voyant.panel.TermsRadio,Voyant.panel.Trends,Voyant.panel.NoTool,Voyant.panel.VoyantFooter,Voyant.panel.VoyantHeader,Voyant.panel.CorpusSet,Voyant.panel.ScatterSet,Voyant.panel.Subset,Voyant.panel.CollocatesSet,Voyant.panel.BubblelinesSet,Voyant.panel.CustomSet,Voyant.panel.WordTree,Voyant.VoyantApp,Voyant.VoyantCorpusApp,Voyant.VoyantDefaultApp".split(",")
        var out = "";
        tools.forEach(function(tool) {
        	var clz = Ext.ClassManager.get(tool);
        	if (clz) {
            	if (clz.i18n) {
            		for (key in clz.i18n) {
            			var val = clz.i18n[key].en;
            			if (val.html) {val = val.html}
            			if (!Ext.isString(val)) {
            				console.warn(val)
            			}
            			out += [tool, key, val].join("\t")+"\n";
            		}
            	}
        	} else {
        		console.warn(tool)
        	}
        });
        this.html = "<pre>"+out+"</pre>";
        this.callParent();
    }
});