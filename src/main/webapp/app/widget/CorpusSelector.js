Ext.define('Voyant.widget.CorpusSelector', {
    extend: 'Ext.form.field.ComboBox',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.corpusselector',
    statics: {
    	i18n: {
    	}
    },
    
    config: {
        labelWidth: 150,
        labelAlign: 'right',
        fieldLabel:'Choose a corpus:',
        name:'corpus',
        queryMode:'local',
        store:[['shakespeare',"Shakespeare's Plays"],['austen',"Austen's Novels"]],				            
        forceSelection:true
    },
    initComponent: function(config) {
    	var me = this;
        me.callParent(arguments);
    }
})