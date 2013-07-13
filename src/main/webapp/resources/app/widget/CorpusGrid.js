Ext.define('Voyant.widget.CorpusGrid', {
    extend: 'Ext.grid.Panel',
    mixins: ['Voyant.widget.Widget'],
    alias: ['widget.CorpusGrid'],
    statics: {
    	i18n: {
       		title: {en: 'Title'},
	   		author: {en: 'Author'},
	   		language: {en: 'Language'},
	   		terms: {en: 'Terms'},
	   		types: {en: 'Types'},
	   		density: {en: 'Density'},
	   		source: {en: 'Source'}
    	}
    },
    initComponent: function() {
    	Ext.applyIf(this, {
    		columns: [
    	    	{text: this.localize('title'), dataIndex: 'title', flex: true},
    	    	{text: this.localize('author'), dataIndex: 'author', width: 150},
    	    	{text: this.localize('language'), dataIndex: 'language'},
    	    	{text: this.localize('terms'), dataIndex: 'tokensCount-lexical', width: 75},
    			{text: this.localize('types'), dataIndex: 'typesCount-lexical', widt: 75},
    			{text: this.localize('density'), dataIndex: 'density-lexical', renderer: Ext.util.Format.numberRenderer('0.0'), width: 75},
    			{text: this.localize('source'), dataIndex: 'source-label'}
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