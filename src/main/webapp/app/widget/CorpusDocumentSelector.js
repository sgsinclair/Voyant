Ext.define('Voyant.widget.CorpusDocumentSelector', {
    extend: 'Ext.Button',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.corpusdocumentselector',
	statics: {
		i18n: {
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
					handler: function(button) {
						var panel = this.findParentBy(function(clz) {
							return clz.mixins["Voyant.panel.Panel"];
						});
						if (panel) {
							button.nextSibling().menu.items.each(function(item) {
								item.setChecked(false, true);
							});
							panel.fireEvent("corpusSelected", this, this.getCorpus());
						}
					},
					scope: this
				},{
					xtype: 'documentselectormenuitem',
					singleSelect: this.getSingleSelect()
				}]
			},
			listeners: {
				afterrender: function(selector) {
					selector.on("loadedCorpus", function(src, corpus) {
						this.setCorpus(corpus);
						if (corpus.getDocumentsCount()==1) {
							this.hide();
						}
					}, selector);
					var panel = selector.findParentBy(function(clz) {
						return clz.mixins["Voyant.panel.Panel"];
					});
					if (panel) {
						panel.on("loadedCorpus", function(src, corpus) {
							selector.fireEvent("loadedCorpus", src, corpus);
						}, selector);
						if (panel.getCorpus && panel.getCorpus()) {selector.fireEvent("loadedCorpus", selector, panel.getCorpus())}
						else if (panel.getStore && panel.getStore() && panel.getStore().getCorpus && panel.getStore().getCorpus()) {
							selector.fireEvent("loadedCorpus", selector, panel.getStore().getCorpus());
						}
					}
				}
			}
		});

		me.callParent(arguments);	
    }
});