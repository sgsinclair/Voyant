Ext.define('Voyant.panel.CorpusCreator', {
	extend: 'Ext.panel.Panel',
	//requires: ['Ext.layout.container.Form'],
	requires: ['Voyant.data.model.Corpus'],
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.corpuscreator',
    statics: {
    	i18n: {
    		title: {en: "Add Texts"},
    		emptyInput: {en: "Type in one or more URLs on separate lines or paste in a full text."},
    		reveal: {en: "Reveal"}
    	}
    },
    config: {
    	
    },
    
    constructor: function(config ) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
        var me = this;

        Ext.apply(me, {
    		title: this.localize('title'),
    		layout: {
    			type: 'vbox',
    			align: 'middle'
    		},
    	    items: [{
    	    	xtype: 'textareafield',
    	    	itemId: 'input',
    	    	width: '100%',
    	    	padding: 10,
    	    	emptyText: this.localize('emptyInput')
    	    },{
    	    	xtype: 'button',
    	    	text: this.localize('reveal'),
    	    	handler: this.onReveal
    	    }]
        });
        
        me.callParent(arguments);
    },
    
    onReveal: function() {
    	var panel = this.findParentByType('panel');
    	var input = panel.down('#input').getValue();
    	if (input !== '') {
    		var app = panel.getApplication();
	    	var view = app.getViewport();
			view.mask();
			new Corpus({
				input: input
			}).then(function(corpus) {
				view.unmask();
				app.dispatchEvent('loadedCorpus', app, corpus);
			}).fail(function(message, response) {
				view.unmask();
				app.showErrorResponse({message: message}, response);
			});
    	}
    }
});