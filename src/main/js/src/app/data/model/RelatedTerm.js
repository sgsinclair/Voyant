/*
 * Related Term
 */
Ext.define('Voyant.data.model.RelatedTerm', {
    extend: 'Ext.data.Model',
    fields: [
             {name: 'source'},
             {name: 'target'},
             {name: 'rawFreq', type: 'int'}
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