Ext.define("Voyant.util.Variants", {
	extend: 'Ext.Base',
	constructor: function(variants) {
		this.variants = variants;
		this.map = {};
		this.variants.forEach(function(variant, index) {
			variant.forEach(function(v) {
				this.map[v]=index;
			}, this)
		}, this)
	},
	getVariants: function(terms) {
		var variants = [];
		if (Ext.isString(terms)) {terms = [terms]}
		if (Ext.isArray(terms)) {
			terms.forEach(function(term) {
				if (this.map[term]!=undefined) {
					variants.push.apply(variants, this.variants[this.map[term]]);
				}
			}, this)
		}
		return variants
	}
})