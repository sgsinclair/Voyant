Ext.define('Voyant.widget.DownloadOptions', {
    extend: 'Ext.form.FieldSet',
    mixins: ['Voyant.util.Localization'],
    requires: ['Voyant.widget.DownloadFileFormat', 'Voyant.widget.DownloadFilenameBuilder'],
    alias: 'widget.downloadoptions',
	statics: {
		i18n: {
		}
	},
	config: {
		items: [{xtype: 'downloadfileformat'}, {xtype: 'downloadfilenamebuilder'}]
	},
    initComponent: function(config) {
    	config = config || {};
    	var me = this;
        Ext.apply(this, {
        	title: config.title ? config.title : this.localize('title')
        })
        me.callParent(arguments);
    }
});
