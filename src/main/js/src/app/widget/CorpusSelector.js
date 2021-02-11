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
    
    constructor: function(config) {
        config = config || {};
        
        // need to call here to get openMenu
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);

	    	var data = [['shakespeare',"Shakespeare's Plays"],['austen',"Austen's Novels"]];	
	    	// check API and server option for open menu values
	    	if (this.getApiParam("openMenu")) {
				data = this.getStoreItemsFromDefinition(this.getApiParam("openMenu"));
		} else if (Voyant.application && Voyant.application.getOpenMenu && Voyant.application.getOpenMenu()) {
			var arg = Voyant.application.getOpenMenu();
			arg = decodeURIComponent(arg);
			arg = arg.replace(/\+/g,' ');
			if (arg.charAt(0)=='"' && arg.charAt(arg.length-1)=='"') {
				arg = arg.substring(1, arg.length-1);
			}
			data = this.getStoreItemsFromDefinition(arg);
	    	}
	
	    	Ext.applyIf(config, {
	    		fieldLabel: this.localize('chooseCorpus'),
	            labelWidth: 125,
	            labelAlign: 'right',
	            name:'corpus',
	            queryMode:'local',
	            store: data
	    	});
        this.callParent([config]);
    },

    	initComponent: function(config) {
    		config = config || {};
        this.callParent([config]);
    },
    
    getStoreItemsFromDefinition: function(definition) {
	    	var data = [], items = definition.split(";");
	    	for (var i=0; i<items.length; i++) {
	    		var nameValue = items[i].split(":");
	    		if (nameValue[0]) {
	        		data.push([nameValue[0],nameValue[1] ? nameValue[1] : nameValue[0]]);
	    		}
	    	}
	    	return data;
    }
})