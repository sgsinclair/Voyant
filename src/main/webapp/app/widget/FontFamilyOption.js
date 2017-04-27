Ext.define('Voyant.widget.FontFamilyOption', {
    extend: 'Ext.container.Container',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.fontfamilyoption',
    statics: {
    	i18n: {
    	},
    	fonts: [{name: "Georgia", value: 'Georgia, serif'},
	            {name: "Palatino", value: '"Palatino Linotype", "Book Antiqua", Palatino, serif'},
	            {name: "Times New Roman", value: '"Times New Roman", Times, serif'},
	            {name: "Arial", value: 'Arial, Helvetica, sans-serif'},
	            {name: "Arial Black", value: '"Arial Black", Gadget, sans-serif'},
	            {name: "Comic Sans MS", value: '"Comic Sans MS", cursive, sans-serif'},
	            {name: "Impact", value: 'Impact, Charcoal, sans-serif'},
	            {name: "Lato", value: 'LatoWeb'},
	            {name: "Lucida", value: '"Lucida Sans Unicode", "Lucida Grande", sans-serif'},
	            {name: "Tahoma/Geneva", value: 'Tahoma, Geneva, sans-serif'},
	            {name: "Trebuchet MS/Helvetica", value: '"Trebuchet MS", Helvetica, sans-serif'},
	            {name: "Verdana/Geneva", value: 'Verdana, Geneva, sans-serif'},
	            {name: "Courrier New", value: '"Courier New", Courier, monospace'},
	            {name: "Lucida/Monaco", value: '"Lucida Console", Monaco, monospace'}]
    },
    name: 'fontFamily',
    initComponent: function(config) {
    	config = config || {};
    	var me = this;
    	var value = this.up('window').panel.getApiParam('fontFamily');
    	var data = Ext.ClassManager.getClass(this).fonts;

    	if (!Ext.Array.contains(data.map(function(item) {return item.value}), value)) {
        	data.splice(0, 0, {name : value, value: value});//
    	}
    	
    	Ext.apply(me, {
    		items: {
    			xtype: 'combo',
    	        queryMode: 'local',
    	        name: 'fontFamily',
    	        value: value,
    	        triggerAction: 'all',
    	        editable: true,
    	        fieldLabel: this.localize('label'),
    	        labelAlign: 'right',
    	        displayField: 'name',
    	        valueField: 'value',
    	        store: {
    	            fields: ['name', 'value'],
    	            data: data
    	        },
    	        width: 400
    		}
    	})
        me.callParent(arguments);
    }
})