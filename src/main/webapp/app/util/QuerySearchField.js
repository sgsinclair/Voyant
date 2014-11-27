Ext.define('Voyant.util.QuerySearchField', {
    extend: 'Ext.form.field.Text',

    alias: 'widget.querysearchfield',

    triggers: {
        clear: {
            weight: 0,
            cls: Ext.baseCSSPrefix + 'form-clear-trigger',
            hidden: true,
            handler: 'onClearClick',
            scope: 'this'
        },
        search: {
            weight: 1,
            cls: Ext.baseCSSPrefix + 'form-search-trigger',
            handler: 'onSearchClick',
            scope: 'this'
        }
    },

    initComponent: function() {
        var me = this;

        me.callParent(arguments);
        me.on('specialkey', function(f, e){
            if (e.getKey() == e.ENTER) {
                me.onSearchClick();
            }
        });

    },

    onClearClick : function(){
        this.setValue('');
    	this.findParentByType("panel").fireEvent("query", this, undefined);
        this.getTrigger('clear').hide();
        this.updateLayout();
    },

    onSearchClick : function(){
    	
        var value = this.getValue();
    	this.findParentByType("panel").fireEvent("query", this, value);
        if (value.length > 0) {
            this.getTrigger('clear').show();
            this.updateLayout();
        }
    }
});