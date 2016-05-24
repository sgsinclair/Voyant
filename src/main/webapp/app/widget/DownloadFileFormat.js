Ext.define('Voyant.widget.DownloadFileFormat', {
    extend: 'Ext.form.CheckboxGroup', //'Ext.container.Container',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.downloadfileformat',
	statics: {
		i18n: {
		}
	},
    initComponent: function(config) {
    	config = config || {};
        var me = this;
        
        Ext.apply(this, {
        	labelAlign: config.labelAlign ? config.labelAlign : 'right'
        })

        Ext.applyIf(this, {
        	fieldLabel: this.localize('fieldLabel'),
        	items: [
	            {boxLabel: this.localize('original'), name: 'documentFormat', inputValue: 'SOURCE'},
	            {boxLabel: this.localize('voyantXml'), name: 'documentFormat', inputValue: 'VOYANT'},
                {boxLabel: this.localize('plainText'), name: 'documentFormat', inputValue: 'TXT'}
        	],
        	width: 450
        })
        me.on('afterrender', function() {
        	this.query('checkbox').forEach(function(cmp) {
        		var tooltip = this.localize(cmp.inputValue+"Tip");
        		if (tooltip.indexOf(cmp.inputValue+"Tip")==-1) {
		        	Ext.tip.QuickTipManager.register({
		                 target:cmp.getEl(),
		                 text: tooltip
		             });
        		}
        	}, this)
        }, this)
        me.callParent(arguments);
    }
});
