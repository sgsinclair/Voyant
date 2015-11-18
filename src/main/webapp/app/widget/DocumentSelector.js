Ext.define('Voyant.widget.DocumentSelector', {
    extend: 'Ext.button.Button',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.documentselector',
	statics: {
		i18n: {
			documents: {en: 'Documents'},
			selectAll: {en: 'Select All'},
			selectNone: {en: 'Select None'},
			ok: {en: 'Ok'}
		}
	},

	config: {
		docs: undefined
	},
	
    initComponent: function() {
		var me = this;

		Ext.apply(me, {
			text: this.localize('documents'),
			menu: [],
			listeners: {
				
			}
		});

		me.callParent(arguments);
    },
    
    populate: function(docs, replace) {
    	this.setDocs(docs);
    	
    	var menu = this.getMenu();
    	if (replace) {
    		menu.removeAll();
    	}
    	
    	menu.add([{
    		xtype: 'button',
    		style: 'margin: 5px;',
    		itemId: 'selectAll',
    		text: this.localize('selectAll'),
    		handler: function(b, e) {
    			menu.query('menucheckitem').forEach(function(item) {
    				item.setChecked(true);
    			});
    		},
    		scope: this
    	},{
    		xtype: 'button',
    		style: 'margin: 5px;',
    		itemId: 'selectNone',
    		text: this.localize('selectNone'),
    		handler: function(b, e) {
    			menu.query('menucheckitem').forEach(function(item) {
    				item.setChecked(false);
    			});
    		},
    		scope: this
    	},{xtype: 'menuseparator'}]);
    	
    	docs.forEach(function(doc) {
    		menu.add({
    			xtype: 'menucheckitem',
    			text: doc.getShortTitle(),
    			docId: doc.get('id'),
    			checked: true
    		});
    	}, this);
    	
    	menu.add([{xtype: 'menuseparator'},{
    		xtype: 'button',
    		style: 'margin: 5px;',
    		text: this.localize('ok'),
    		handler: function(b, e) {
    			var docs = [];
    			menu.query('menucheckitem').forEach(function(item) {
    				if (item.checked) {
	    				docs.push(item.docId);
    				}
    			}, this);
    			
    			this.hideMenu();
    			
    			this.findParentByType('panel').fireEvent('documentsSelected', this, docs);
    		},
    		scope: this
    	}]);
    }
});