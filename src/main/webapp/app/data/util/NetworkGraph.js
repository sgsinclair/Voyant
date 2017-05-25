/**
 * @class NetworkGraph
 * 
 * A NetworkGraph can facilitate working with network graph data structures, as well as
 * displaying results (especially with {@link #embed} and {@link show}). 
 * Here's a simple example showing the Zipf-Law distribution of the top 20 frequency terms.
 * 
 * 	new Corpus("austen").loadCorpusTerms(20).then(function(corpusTerms) {
 * 		var table = new VoyantTable({rowKey: 0}); // use first column as row key
 * 		corpusTerms.each(function(corpusTerm) {
 *			table.addRow([corpusTerm.getTerm(), corpusTerm.getRawFreq()]);
 * 		});
 * 		table.embed("voyantchart"); // graph table as line chart
 * 	});
 */
Ext.define('Voyant.data.util.NetworkGraph', {
	alternateClassName: ["NetworkGraph"],
	mixins: ['Voyant.notebook.util.Embed','Voyant.notebook.util.Show'],
	embeddable: ["Voyant.widget.VoyantNetworkGraph"],
	config: {
		
		/**
		 * @private
		 */
		edges: [],

		/**
		 * @private
		 */
		nodes: []

	},

	constructor: function(config, opts) {
		config = config || {};
		this.setEdges(Ext.Array.from(config.edges));
		this.setNodes(Ext.Array.from(config.nodes));
		this.callParent([config]);
	},
	addEdge: function(edge) {
		this.getEdges().push(edge);
	},
	embed: function(cmp, config) {
		if (!config && Ext.isObject(cmp)) {
			config = cmp;
			cmp = this.embeddable[0];
		}
		config = config || {};
		var json = {
				edges: this.getEdges(),
				nodes: this.getNodes(),
				config: config
		};
		Ext.apply(config, {
			jsonData: JSON.stringify(json)
		})
		embed.call(this, cmp, config);
	},
	
	getString: function(config) {
		config = config || {};
		return this.getEdges().map(function(edge) {edge.source+"-"+edge.target}).join("; ");
	}
});