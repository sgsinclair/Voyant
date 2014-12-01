Ext.define('Voyant.util.QuerySearchField', {
    extend: 'Ext.form.field.Text',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.querysearchfield',
	statics: {
		i18n: {
			querySearch: {en: 'Search'},
			querySearchTip: {en: '<ul><li><b>coat</b>: match exact term <i>coat</i></li><li><b>coat*</b>: match terms that start with <i>coat</i> as one term</li><li><b>^coat*</b>: match terms that start with <i>coat</i> as separate terms (coat, coats, etc.)</li><li><b>coat,jacket</b>: match each term separated by commas as separate terms</li><li><b>coat|jacket</b>: match terms separate by pipe as a single term</li><li><b>&quot;winter coat&quot;</b>: <i>winter coat</i> as a phrase</li><li><b>&quot;coat mittens&quot;~5</b>: <i>coat</i> near <i>mittens</i> (within 5 words)</li><li><b>^coat*,jacket|parka,&quot;coat mittens&quot;~5</b>: combine syntaxes</li></ul>'},
		}
	},
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

        Ext.apply(me, {
        	listeners: {
    		   render: function(c) {
    		      Ext.QuickTips.register({
    		        target: c.triggers.search.getEl(),
    		        text: c.localize('querySearchTip'),
    		        enabled: true,
    		        showDelay: 20,
    		        trackMouse: true,
    		        autoShow: true
    		      });
    		    },
    		    scope: me
    		},
            labelWidth: 50,
            fieldLabel: me.localize('querySearch'),
            width: 'autoSize'

        })

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