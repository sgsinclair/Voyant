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
	embeddable: [],
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
		this.edges.push(edge);
	},
	embed: function(cmp, config) {
		if (!config && Ext.isObject(cmp)) {
			config = cmp;
			cmp = this.embeddable[0];
		}
		config = config || {};
		
		Ext.apply(config, {
			tableJson: JSON.stringify({
				rowkey: this.getRowKey(),
				headers: this.getHeaders(),
				rows: this.getRows(),
				config: config
			})
		});
		delete config.axes;
		delete config.series;
		
		embed.call(this, cmp, config);
		
	},
	
	getString: function(config) {
		config = config || {};
		var table = "<table class='voyant-table' style='"+(config.width ? ' width: '+config.width : '')+"' id='"+(config.id ? config.id : Ext.id())+"'>";
		var headers = this.getHeaders();
		if (headers.length) {
			table+="<thead><tr>";
			for (var i=0, len = headers.length; i<len; i++) {
				table+="<th>"+headers[i]+"</th>";
			}
			table+="</tr></thead>";
		}
		table+="<tbody>";
		for (var i=0, len = Ext.isNumber(config) ? config : this.getRows().length; i<len; i++) {
			table+="<tr>";
			var row = this.getRow(i);
			row.forEach(function(cell) {
				table+="<td>"+cell+"</td>";
			})
			table+="</tr>";
		}
		table+="</tbody></table>";
		return table;
	}
});