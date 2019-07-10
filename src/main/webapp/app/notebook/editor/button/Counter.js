Ext.define("Voyant.notebook.editor.button.Counter", {
	extend: "Ext.toolbar.TextItem",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrappercounter',
	statics: {
		i18n: {
		}
	},
	config: {
		order: 0,
		name: undefined
	},
	cls: 'notebookwrappercounter',
	constructor: function(config) {
    	Ext.apply(this, {
    		toolTip: this.localize('tip')
    	})
        this.callParent(arguments);
	},
	setOrder: function(pos) {
		this.callParent(arguments);
		this.updateHtml();
	},
	updateHtml: function() {
		var pos = this.getOrder()+1;
		var lnk = 'spyralcounter_'+pos;
		var name = this.getName();
		this.setHtml('<a name="'+name+'" href="#'+name+'">'+pos+'</a>');
	}
})