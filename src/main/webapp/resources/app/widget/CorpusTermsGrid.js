Ext.define('Voyant.widget.CorpusTermsGrid', {
    extend: 'Ext.grid.Panel',
    mixins: ['Voyant.widget.Widget'],
    alias: ['widget.CorpusTermsGrid'],
    statics: {
    	i18n: {
       		term: {en: 'Term'},
	   		raw: {en: 'Raw'},
	   		relative: {en: 'Relative'}
    	}
    },
    initComponent: function() {
    	Ext.applyIf(this, {
    		columns: [
    	    	{text: this.localize('term'), dataIndex: 'term'},
    	    	{text: this.localize('raw'), dataIndex: 'rawFreq'},
    	    	{text: this.localize('relative'), dataIndex: 'relativeFreq'}
    		]
    	});
        this.ui = 'light';
    	this.callParent();
    }
});