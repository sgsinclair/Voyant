/**
 * Related Term
 */
Ext.define('Voyant.data.model.TermCorrelation', {
    extend: 'Ext.data.Model',
    fields: [
             {name: 'source'},
             {name: 'target'},
             {name: 'correlation', type: 'float'},
             {name: 'source-term', calculate: function(data) {return data.source.term}},
             {name: 'target-term', calculate: function(data) {return data.target.term}},
             {name: 'source-distributions', calculate: function(data) {return data.source.distributions}},
             {name: 'target-distributions', calculate: function(data) {return data.target.distributions}}
    ],
    
    /**
     * Get the source term.
     * @returns {String} Returns the term.
     */
    getSource: function() {
    	return this.get('source');
    },
    
    /**
     * Get the source term.
     * @returns {String} Returns the term.
     */
    getTarget: function() {
    	return this.get('target');
    },
    
	/**
	 * Show a one line summary of this term.
	 */
	show: function(config) {
		show(this.getString(config))
	},
	
	getString: function() {
		return this.getSource()+"-"+this.getTarget();
	}
});