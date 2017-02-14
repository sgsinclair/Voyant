Ext.define('Voyant.data.model.StatisticalAnalysis', {
    extend: 'Ext.data.Model',
    requires: ['Voyant.data.model.PrincipalComponent', 'Voyant.data.model.Dimension', 'Voyant.data.model.AnalysisToken'],
    fields: [
         {name: 'id'}
//         ,{name: 'dimensions', reference: 'Voyant.data.model.Dimension'}
//         ,{name: 'tokens', reference: 'Voyant.data.model.AnalysisToken'}
    ]
    
	// alternative access methods to "reference" or "hasMany"
	,getPrincipalComponents: function() {
		var pcs = [];
		this.data.principalComponents.forEach(function(pc) {
			pcs.push(Ext.create('Voyant.data.model.PrincipalComponent', pc));
		});
		return pcs;
	}
	,getDimensions: function() {
		var dimensions = [];
		this.data.dimensions.forEach(function(dim) {
			dimensions.push(Ext.create('Voyant.data.model.Dimension', {percentage: dim}));
		});
		return dimensions;
	}
	,getTokens: function() {
		var tokens = [];
		this.data.tokens.forEach(function(tok) {
			tokens.push(Ext.create('Voyant.data.model.AnalysisToken', tok));
		});
		return tokens;
	}


//    ,hasMany: [{
//    	name: 'dimensions', model: 'Voyant.data.model.Dimension'
//    },{
//    	name: 'tokens', model: 'Voyant.data.model.AnalysisToken'
//    }]
});