Ext.define('Voyant.widget.CorpusDocumentSelector', {
    extend: 'Ext.menu.Item',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.corpusdocumentselector',
	statics: {
		i18n: {
			corpus: {en: "Corpus"},
			scale: {en: "Scale"}
		}
	},
	config: {
		corpus: undefined,
		singleSelect: false
	},
	
    initComponent: function() {
		var me = this;
		
		this.setSingleSelect(this.config.singleSelect == undefined ? this.getSingleSelect() : this.config.singleSelect);
		
		Ext.apply(me, {
			text: this.localize('scale'),
			glyph: 'xf059@FontAwesome',
			menu: {
				items: [{
					text: this.localize("corpus"),
					glyph: 'xf111@FontAwesome',
					handler: function() {
						var panel = this.findParentBy(function(clz) {
							return clz.mixins["Voyant.panel.Panel"];
						})
						if (panel) {panel.fireEvent("corpusSelected", this, this.getCorpus())}
					},
					scope: this
				},{
					xtype: 'documentselector',
					singleSelect: this.getSingleSelect()
				}]
			},
			listeners: {
				afterrender: function(selector) {
					var panel = selector.findParentBy(function(clz) {
						return clz.mixins["Voyant.panel.Panel"];
					})
					if (panel.getCorpus) {this.setCorpus(panel.getCorpus());}
					selector.on("loadedCorpus", function(src, corpus) {this.setCorpus(corpus)}, selector);
				}
			}
		});

		me.callParent(arguments);	
    }
});