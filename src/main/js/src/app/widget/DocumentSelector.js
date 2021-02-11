Ext.define('Voyant.widget.DocumentSelector', {
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.documentselector',
	glyph: 'xf10c@FontAwesome',
	statics: {
		i18n: {
		}
	},

	config: {
		docs: undefined,
		corpus: undefined,
		singleSelect: false
	},
	
    initComponent: function() {

		var me = this;
		
		this.setSingleSelect(this.config.singleSelect == undefined ? this.getSingleSelect() : this.config.singleSelect);
		
		Ext.apply(me, {
			text: this.localize('documents'),
			menu: {
				width: 250,
				fbar: [{
					xtype: 'checkbox',
					hidden: this.getSingleSelect(),
					boxLabel: this.localize("all"),
					listeners: {
						change: {
							fn: function(item, checked) {
								this.getMenu().items.each(function(item) {
									item.setChecked(checked);
								});
							},
							scope: this
						}
					}
				},{xtype:'tbfill'},{
		    		xtype: 'button',
		    		text: this.localize('ok'),
					hidden: this.getSingleSelect(),
	    	    	scale: 'small',
		    		handler: function(button, e) {
		    			var docs = [];
		    			this.getMenu().items.each(function(item) {
		    				if (item.checked) {
			    				docs.push(item.docId);
		    				}
		    			}, this);
		    			
		    			// tell parent tool
						var panel = button.findParentBy(function(clz) {
							return clz.mixins["Voyant.panel.Panel"];
						});
						if (panel) {
			    			panel.fireEvent('documentsSelected', button, docs);
						}

		    			// hide the opened menu
		    			button.findParentBy(function(clz) {
		    				if (clz.isXType("button") && clz.hasVisibleMenu()) {
		    					clz.hideMenu();
		    					return true;
		    				}
		    				return false;
		    			});
		    		},
		    		scope: this
		    	},{
		    		xtype: 'button',
		    		text: this.localize('cancel'),
	    	    	scale: 'small',
		    		handler: function(b, e) {
		    			this.findParentBy(function(clz) {
		    				if (clz.isXType("button") && clz.hasVisibleMenu()) {
		    					clz.hideMenu();
		    					return true;
		    				}
		    				return false;
		    			}, this);
		    			this.hideMenu();
		    		},
		    		scope: this
		    	}]
			},
			listeners: {
				afterrender: function(selector) {
					selector.on("loadedCorpus", function(src, corpus) {
						this.setCorpus(corpus);
						if (corpus.getDocumentsCount()==1) {
							this.hide();
						} else {
							selector.populate(corpus.getDocumentsStore().getRange(), true);
						}
					}, selector);
					var panel = selector.findParentBy(function(clz) {
						return clz.mixins["Voyant.panel.Panel"];
					});
					if (panel) {
						panel.on("loadedCorpus", function(src, corpus) {
							selector.fireEvent("loadedCorpus", src, corpus);
						}, selector);
						if (panel.getCorpus && panel.getCorpus()) {selector.fireEvent("loadedCorpus", selector, panel.getCorpus());}
						else if (panel.getStore && panel.getStore() && panel.getStore().getCorpus && panel.getStore().getCorpus()) {
							selector.fireEvent("loadedCorpus", selector, panel.getStore().getCorpus());
						}
					}
				}
			}
		});


    },
    
    populate: function(docs, replace) {
    	this.setDocs(docs);
    	
    	var menu = this.getMenu();
    	if (replace) {
    		menu.removeAll();
    	}
    	
    	var isSingleSelect = this.getSingleSelect();
    	
    	var groupId = 'docGroup'+Ext.id();
    	docs.forEach(function(doc, index) {
    		menu.add({
    			xtype: 'menucheckitem',
    			text: doc.getShortTitle(),
    			docId: doc.get('id'),
    			checked: isSingleSelect && index == 0 || !isSingleSelect,
    			group: isSingleSelect ? groupId : undefined,
    			checkHandler: function(item, checked) {
    				if (this.getSingleSelect() && checked) {
    					var panel = this.findParentBy(function(clz) {
    						return clz.mixins["Voyant.panel.Panel"];
    					});
    					if (panel) {
	    					panel.fireEvent('documentSelected', this, doc);
    					}
    				}
    			},
    			scope: this
    		});
    	}, this);
    	
    }
});

Ext.define('Voyant.widget.DocumentSelectorButton', {
    extend: 'Ext.button.Button',
    alias: 'widget.documentselectorbutton',
    mixins: ['Voyant.widget.DocumentSelector'],
    initComponent: function() {
    	this.mixins["Voyant.widget.DocumentSelector"].initComponent.apply(this, arguments);
		this.callParent();
    }
})
    
Ext.define('Voyant.widget.DocumentSelectorMenuItem', {
    extend: 'Ext.menu.Item',
    alias: 'widget.documentselectormenuitem',
    mixins: ['Voyant.widget.DocumentSelector'],
    initComponent: function() {
    	this.mixins["Voyant.widget.DocumentSelector"].initComponent.apply(this, arguments);
		this.callParent();
    }
})
