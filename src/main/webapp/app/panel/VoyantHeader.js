Ext.define('Voyant.panel.VoyantHeader', {
	extend: 'Ext.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.voyantheader',
    statics: {
    	i18n: {
    		categoriesBuilder: 'Categories Builder'
    	}
    },
    constructor: function(config) {
    	Ext.apply(this, {
    		id: 'voyantheader',
    		title: '',
    		layout : 'fit',
    		html: '<div id="logo-container"></div>',
    		collapseMode : undefined,
			collapsible: true,
			animCollapse: false,
			titleCollapse: false,
			floatable: false,
			header: true,
			hideCollapseTool: true,
			listeners: {
				collapse: this.onCollapse
			},
			titleAlign: 'center'
    	});
        this.callParent(arguments);
        
        Ext.applyIf(config, {
    		moreTools: ['corpusset','scatterplot','termsradio'],
			includeTools: {
				save: true,
				plus: true,
				help: true,
				language: this.getLanguageToolMenu(),
				home: {
					type: 'home',
					tooltip: this.localize("homeTip"),
					xtype: 'toolmenu',
	                glyph: 'xf015@FontAwesome',
	        		handler: function(btn) {
	        			var panel = this.up("panel")
	        			Ext.Msg.confirm(panel.localize('home'), panel.localize('homeConfirm'), function(buttonId) {
	        				if (buttonId=='yes') {
	        					document.location.href = panel.getBaseUrl()
	        				}
	        			}, this);
	        		}
				},
				categories: {
					type: 'categories',
					tooltip: this.localize('categoriesBuilder'),
					xtype: 'toolmenu',
					glyph: 'xf02c@FontAwesome',
					handler: function(btn) {
	        			Ext.create('Voyant.widget.CategoriesBuilder', {
	        				panel: this,
	        				categoriesManager: this.getApplication().getCategoriesManager(),
	        				height: this.getApplication().getViewport().getHeight()*0.5,
	        				width: this.getApplication().getViewport().getWidth()*0.75
	        			}).show();
	        		},
	        		scope: this
				}
			}
        })
        
    	this.mixins['Voyant.panel.Panel'].constructor.call(this, config);
    },
    
    onCollapse: function(panel) {
    	// the title may be in flux when collapsing, so call defer setting of title
    	Ext.defer(function() {this.setTitle("<img src='"+this.getBaseUrl()+"resources/images/voyant-logo-tiny.png' style='vertical-align: middle' alt='Voyant Tools' /> "+this.localize('title'))}, 10, panel)
    }
});
