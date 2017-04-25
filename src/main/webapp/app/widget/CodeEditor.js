Ext.define('Voyant.widget.CodeEditor', {
	extend: 'Ext.panel.Panel',
    mixins: ['Voyant.util.Localization','Voyant.util.Api','Voyant.notebook.util.Embed'],
	alias: 'widget.codeeditor',
    statics: {
    	i18n: {},
		api: {
			tableJson: undefined,
			content: '',
			mode: 'ace/mode/text',
			width: undefined
		}
    },
	constructor: function(config) {
    	config = config || {};
		var me = this;
    	me.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
    	me.buildFromParams();
    	Ext.apply(me, {
    		items: {
    			xtype: 'notebookcodeeditor',
    			content: config.content ? config.content : this.getApiParam('content'),
    			mode: config.mode ? config.mode : this.getApiParam("mode")
    		}
    	})
        me.callParent(arguments);
	},
	initComponent: function(config) {
    	var me = this, config = config || {};
    	me.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
    	me.callParent(arguments);
	},
	
	buildFromParams: function() {
		var me = this, tableJson = this.getApiParam('tableJson');
		if (tableJson) {
			var json = Ext.decode(tableJson);
			var text = json.headers.join("\t") + "\n"+
				json.rows.map(function(row) {return row.join("\t")}).join("\n");
			this.setApiParam('content', text);
		}
	}
})