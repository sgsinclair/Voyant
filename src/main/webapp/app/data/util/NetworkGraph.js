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
	addEdge: function(src, target, value) {
		this.getEdges().push(Ext.isObject(src) ? src : {source: src, target: target, value: value});
	},
	getNode: function(term) {
		return Ext.Array.binarySearch(this.getNodes(), term, undefined, undefined, function(lhs, rhs) {
			return (lhs.term < rhs.term) ? -1 : ((lhs.term > rhs.term) ? 1 : 0);
		})
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
		if (config.limit && json.edges.length>config.limit) {
			json.edges = json.edges.slice(0, config.limit);
			var terms = {};
			json.edges.forEach(function(edge) {
				terms["_"+edge.source] = true;
				terms["_"+edge.target] = true;
			})
			var nodes = [];
			json.nodes.forEach(function(node) {
				if ("_"+node.term in terms) {
					nodes.push(node);
				}
			});
			json.nodes = nodes;
		}
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