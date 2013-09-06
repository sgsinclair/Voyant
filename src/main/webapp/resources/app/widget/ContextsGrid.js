Ext.define('Voyant.widget.ContextsGrid', {
    extend: 'Ext.grid.Panel',
    mixins: ['Voyant.widget.Widget'],
    alias: ['widget.CorpusGrid'],
//    plugins: [{
//        ptype: 'rowexpander'
//    }],
    statics: {
    	i18n: {
       		left: {en: 'Left'},
	   		middle: {en: 'Middle'},
	   		right: {en: 'Right'},
	   		contextsTitle: {en: "Contexts"}
    	}
    },
    plugins: [{
        ptype: 'rowexpander',
        rowBodyTpl : new Ext.Template("")
    }],
    listeners: {
    	expandbody: function(rowNode, record, expandRow, eOpts) {
    		debugger
    	}
    },
    initComponent: function() {
    	Ext.applyIf(this, {
            columns: [
    	    	{text: this.localize('left'), dataIndex: 'left', flex: true, align: 'right'},
    	    	{text: this.localize('middle'), dataIndex: 'middle', width: 150, 'align': 'center'},
    	    	{text: this.localize('right'), dataIndex: 'right', flex: true}
    		],
    		title: this.localize("contextsTitle")
    	});
        this.ui = 'light';
    	this.callParent();
    	
    	// listeners don't see to work in the rowexpander plugin definition, so do it here
    	this.view.on('expandbody', function(rowNode, record, expandRow, eOpts) {
    		var node = Ext.get(rowNode).down(".x-grid-rowbody");
    		node.mask('working…');
    		Ext.create("Voyant.data.Contexts", {
				corpus: this.store.corpus,
				query: record.get('query'),
				position: record.get('position'),
				context: 50
    		}).done(function(contexts){
    			var r = contexts.first();
    			node.update(r.get('left')+' <span class="hi">'+r.get('middle')+'</span> '+r.get('right'))
    		}).always(function() {
    			node.unmask();
    		})
        }, this)
    }
});
