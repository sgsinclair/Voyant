Ext.define('Voyant.widget.DownloadFileFormat', {
    extend: 'Ext.form.RadioGroup', //'Ext.container.Container',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.downloadfileformat',
	statics: {
		i18n: {
			fieldLabel: {en: 'File Format'},
			voyantXml: {en: 'Voyant XML'},
			VOYANTTip: {en: "This is a normalized version of the content: when the source documents are in XML, this will be mostly the original content, and for most other source document formats this will be simple HTML content." },
			SOURCETip: {en: "This will attempt to provide the source documents in their original formats. In some cases this means that a single archive (such as a ZIP file) might be provided."},
			TXTTip: {en: "This will produce a plain text version of each document." },
			original: {en: 'original'},
			plainText: {en: 'plain text'}
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
