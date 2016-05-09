Ext.define('Voyant.data.table.CorpusTerms', {
	extend: 'Voyant.data.table.Table',
	eachCorpusTerm: function() {
		this.eachRecord.apply(this, arguments);
	}
})