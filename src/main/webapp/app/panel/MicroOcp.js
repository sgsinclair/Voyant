Ext.define('Voyant.panel.MicroOcp', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.microocp',
    statics: {
    	i18n: {
    		title: "MicroOCP"
    	},
    	api: {
    		config: undefined,
    		stopList: 'auto'
    	},
		glyph: 'xf1ea@FontAwesome'
    },
    config: {
    },
    
    constructor: function(config) {
    	debugger
    	config = config || {};
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments); // we need api
		
    	Ext.apply(this, {
    		title: this.localize('title'),
    		layout: 'hbox',
    		items: [{
		        	xtype: 'panel',
		        	flex: 1,
		        	height: '100%',
		        	align: 'stretch',
		        	header: false,
		        	listeners: {
		        		boxready: function() {
		        			var me = this;
		        			var editor = ace.edit(Ext.getDom(this.getEl()));
		        			debugger
//		        			editor.$blockScrolling = Infinity;
//		        			editor.getSession().setUseWorker(true);
//		        			editor.setTheme(this.getTheme());
//		        			editor.getSession().setMode(this.getMode());
//		        			editor.setOptions({minLines: 6, maxLines: this.getMode().indexOf("javascript")>-1 ? Infinity : 10, autoScrollEditorIntoView: true, scrollPastEnd: true});
//		        			editor.setHighlightActiveLine(false);
//		        			editor.renderer.setShowPrintMargin(false);
//		        			editor.renderer.setShowGutter(false);
//		        			editor.setValue(this.getContent() ? this.getContent() : this.localize('emptyText'));
//		        			editor.clearSelection();
//		        		    editor.on("focus", function() {
//		        		    	me.getEditor().renderer.setShowGutter(true);
//		        		    }, this);
		        		}

		        	}
		        }]
    	});

        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    	});
    	
    	this.on('afterrender', function(panel) {
    		
    	});
    	
    	
    }
    
});
