Ext.define('Voyant.widget.CorpusSelector', {
    extend: 'Ext.form.field.ComboBox',
    mixins: ['Voyant.util.Localization', 'Voyant.util.Api'],
    alias: 'widget.corpusselector',
    statics: {
    	i18n: {
    	},
    	api: {
    		openMenu: undefined
    	}
    },
    
    config: {
        labelWidth: 150,
        labelAlign: 'right',
//        fieldLabel:'Choose a corpus:',
        name:'corpus',
        queryMode:'local',
        store:[['shakespeare',"Shakespeare's Plays"],['austen',"Austen's Novels"]]
    },
    initComponent: function(config) {
    	var me = this;
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
    	Ext.applyIf(this, {
    		fieldLabel: this.localize('chooseCorpus')
    	});
    	
    	// check API and server option for open menu values
    	if (this.getApiParam("openMenu")) {
			this.replaceStoreItemsFromDefinition(this.getApiParam("openMenu"));
		} else if (Voyant.application && Voyant.application.getOpenMenu && Voyant.application.getOpenMenu()) {
			this.replaceStoreItemsFromDefinition(Voyant.application.getOpenMenu());
    	}

        me.callParent(arguments);
    },
    
    replaceStoreItemsFromDefinition: function(definition) {
    	var data = [], items = definition.split(";");
    	for (var i=0; i<items.length; i++) {
    		var nameValue = items[i].split(":");
    		if (nameValue[0]) {
        		data.push([nameValue[0],nameValue[1] ? nameValue[1] : nameValue[0]]);
    		}
    	}
    	this.setStore(data);
    }
})