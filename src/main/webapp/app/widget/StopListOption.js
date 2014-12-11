Ext.define('Voyant.widget.StopListOption', {
    extend: 'Ext.container.Container',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.stoplistoption',
    layout: 'hbox',
    statics: {
    	i18n: {
    		label: {en: "Stopwords:"},
    		editList: {en: "Edit List"},
    		auto: {en: "Auto-detect"},
    		en: {en: "English"},
    		de: {en: "German"},
    		es: {en: "Spanish"},
    		fr: {en: "French"},
    		hu: {en: "Hungarian"},
    		it: {en: "Italian"},
    		no: {en: "Norwegian"},
    		se: {en: "Swedish"},
    		mu: {en: "Multilingual"}
    	}
    },
    initComponent: function(config) {
    	var me = this;
    	var value = this.up('window').panel.getApiParam('stopList');
        var data = [{name : this.localize('auto'),   value: 'auto'},
               {name : this.localize('en'),   value: 'stop.en.taporware.txt'},
               {name : this.localize('de'),   value: 'stop.de.german.txt'},
               {name : this.localize('es'),   value: 'stop.es.spanish.txt'},
               {name : this.localize('fr'),   value: 'stop.fr.veronis.txt'},
               {name : this.localize('hu'),   value: 'stop.hu.hungarian.txt'},
               {name : this.localize('it'),   value: 'stop.it.italian.txt'},
               {name : this.localize('no'),   value: 'stop.no.norwegian.txt'},
               {name : this.localize('se'),   value: 'stop.se.swedish-long.txt'},
               {name : this.localize('mu'),   value: 'stop.mu-multi.txt'}]
    	data.sort(function(a,b) { // sort by label
    		return a.name < b.name ? -1 : 1;
    	})
    	
    	Ext.apply(me, {
	    		items: [{
	    	        xtype: 'combo',
	    	        queryMode: 'local',
	    	        value: value,
	    	        triggerAction: 'all',
	    	        editable: true,
	    	        fieldLabel: this.localize('label'),
	    	        labelAlign: 'right',
	    	        name: 'stopList',
	    	        displayField: 'name',
	    	        valueField: 'value',
	    	        store: {
	    	            fields: ['name', 'value'],
	    	            data: data
	    	        }
	    		}/*,{
	    			xtype: 'button',
	    			text: this.localize('editList')
	    		}*/]
    	})
        me.callParent(arguments);
    }
})