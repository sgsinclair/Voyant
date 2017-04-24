Ext.define('Voyant.panel.VoyantHeader', {
	extend: 'Ext.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.voyantheader',
    statics: {
    	i18n: {
    		done: 'Done',
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
	        			Ext.create('Ext.window.Window', {
	        				title: this.localize('categoriesBuilder'),
	        				modal: true,
	        				layout: 'fit',
	        				height: this.getApplication().getViewport().getHeight()*0.5,
	        				width: this.getApplication().getViewport().getWidth()*0.75,
	        				panel: this,
	        				items: {
	        					xtype: 'categoriesbuilder',
	        					categoriesManager: this.getApplication().getCategoriesManager()
	        				},
	        				buttons: [{
	        					text: this.localize('done'),
	        					handler: function(btn) {
	        						btn.up('window').close();
	        					}
	        				}],
	        				listeners: {
	        					beforedestroy: function(component) {
	        						// build colorTermAssociations from the categories
	        						var catman = this.getApplication().getCategoriesManager();
	        						for (var category in catman.getCategories()) {
	        							var color = catman.getCategoryAttribute(category, 'color');
	        							if (color !== undefined) {
	        								var rgb = this.getApplication().hexToRgb(color);
	        								var terms = catman.getCategoryTerms(category);
	        								for (var i = 0; i < terms.length; i++) {
	        									this.getApplication().colorTermAssociations.replace(terms[i], rgb);
	        								}
	        							}
	        						}
	        					},
	        					scope: this
	        				}
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
