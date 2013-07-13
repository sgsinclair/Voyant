Ext.define('Voyant.widget.CorpusGrid', {
    extend: 'Ext.grid.Panel',
    mixins: ['Voyant.utils.Embeddable'],
    alias: ['widget.CorpusGrid'],
    initComponent: function() {
    	Ext.applyIf(this, {
    		columns: [
    	    	{text: 'Title', dataIndex: 'title', flex: true},
    	    	{text: 'Author', dataIndex: 'author', width: 150},
    	    	{text: 'Language', dataIndex: 'language'},
    	    	{text: 'Words', dataIndex: 'tokensCount-lexical', width: 75},
    			{text: 'Types', dataIndex: 'typesCount-lexical', widt: 75},
    			{text: 'Density', dataIndex: 'density-lexical', renderer: Ext.util.Format.numberRenderer('0.0'), width: 75},
    			{text: 'Source', dataIndex: 'source-label'}
    		]
    	});
    	if (this.store) {
    		
    		// hide the author column if we don't have any values to display
    		var hasAuthor = false;
    		this.store.each(function(record) {
    			if (record.get('author')) {
    				hasAuthor = true;
    				return false
    			}
    		})    		
    		if (!hasAuthor) {
    			this.on('afterrender', function(panel) {
    				Ext.Array.each(panel.columns, function(column) {
    					if (column.dataIndex=='author') {
    						column.setVisible(false);
    						return false;
    					}
    				});
    			})
    		}
    		
    	}
    	this.callParent();
    }
});