Ext.define('Voyant.util.Toolable', {
	requires: ['Voyant.util.Localization'],
	statics: {
		i18n: {
			maximizeTip: {en: 'Open this tool in a new window'},
			plusTip: {en: 'Click to choose another tool for this panel location (this will replace the current tool).'},
			saveTip: {en: 'Export a URL, an embeddable tool, data or a bibliographic reference.'},
			gearTip: {en: 'Define options for this tool.'},
			helpTip: {en: 'No tool-specific help is currently available. Click this icon to visit the <a href="http://docs.voyant-tools.org/" target="_blank">Voyant Tools Documentation</a> site.'}
		}
	},
	constructor: function(config) {
		config = config || {};
		var me = this;
		var plusItems = undefined;
		var parent = this.up('component');
		if (parent && parent.getInitialConfig('plusItems')) {
			plusItems = [];
			 parent.getInitialConfig('plusItems').forEach(function(plusItem) {
				 if (plusItem!=this.xtype) {
						if (Ext.isString(plusItem)) {
							plusItem = {xtype: plusItem}
						}
						var xtype = plusItem.xtype;
						if (xtype) {
							cls = Ext.ClassManager.getByAlias("widget."+xtype);
							Ext.apply(plusItem, {
								xtype: 'button',
								textAlign: 'left',
								handler: function() {
									this.replacePanel(xtype)
								},
								scope: this
									
							})
							plusItem.xtype = 'button';
							if (!plusItem.text) {
								plusItem.text = this._localizeClass(cls, "title");
							}
							if (!plusItem.tooltip) {
								plusItem.tooltip = this._localizeClass(cls, "help")
							}
							if (!plusItem.glyph) {
								plusItem.glyph = cls.glyph ? cls.glyph : 'xf12e@FontAwesome'
							}
							plusItems.push(plusItem);
							//  fa-puzzle-piece [&#xf12e;]
							//  fa-text-width [&#xf035;]
							//  fa-list-alt [&#xf022;]
							//  fa-line-chart [&#xf201;]
							//  fa-eye [&#xf06e;]
							//  fa-bar-chart [&#xf080;]
							//  fa-info [&#xf129;]
							//  fa-picture-o [&#xf03e;]
							//  fa-area-chart [&#xf1fe;]
						}					 
				 }

			}, this)
		}
		console.warn(plusItems)
		var saveItems = undefined;
		var toolsMap = {
				maximize: {
					fn: this.maximizeToolClick
				},
				plus: {
					fn: plusItems ? undefined : this.plusToolClick,
					items: plusItems ? plusItems : undefined
				},
				save: {
					fn: undefined,
					items: saveItems
				},
				gear: {
					fn: undefined
				},
				help: {
					fn: this.helpToolClick
				}
		}
		var tools = [];
		for (var tool in toolsMap) {
			if (config.includeTools && !config.includeTools[tool]) {continue}
			tools.push({
				type: tool,
				tooltip: this.localize(tool+"Tip"),
				callback: toolsMap[tool].fn,
				xtype: 'toolmenu',
				items: toolsMap[tool].items
			})
		}
		Ext.apply(this, {
			tools: tools
		})
		this.on("afterrender", function() {
			var header = this.getHeader();
			if (header) {
				var el = header.getEl();
				el.on("mouseover", function() {
					this.getHeader().getTools().forEach(function(tool) {
						tool.show();
					})
				}, this);
				el.on("mouseout", function() {
					this.getHeader().getTools().forEach(function(tool) {
						if (tool.type!='help' && tool.type.indexOf('collapse')==-1) {tool.hide();}
					})
				}, this);
				header.getTools().forEach(function(tool,i) {
					if (tool.type!='help') {tool.hide();}
				});
			}
		}, this)
	},
	plusToolClick: function(panel) {

	},
	maximizeToolClick: function(panel) {
		var name = Ext.getClass(panel).getName();
		var parts = name.split(".");
		url = panel.getBaseUrl()+"tool/"+parts[parts.length-1]+"/";
		params = panel.getApiParams();
		if (!params.corpus && panel.getCorpus && panel.getCorpus()) {
			params.corpus = panel.getCorpus().getId();
		}
		if (params) {url += "?"+Ext.Object.toQueryString(params);}
		panel.openUrl(url);
	},
	helpToolClick: function(panel) {
		panel.openUrl( "http://docs.voyant-tools.org/");
	},
	replacePanel: function(xtype) {
		var corpus = this.getApplication().getCorpus();
		var config = this.getInitialConfig();
		var parent = this.up("component");
		parent.remove(this);
		this.destroy();
		var newTool = parent.add({xtype: xtype});
		if (corpus) {
			newTool.fireEvent("loadedCorpus", newTool, corpus)
		}
	}
});

// from http://www.sencha.com/forum/showthread.php?281658-add-dropdown-menu-to-panel-tool&p=1054579&viewfull=1#post1054579
Ext.define('Voyant.util.ToolMenu', {
    extend: 'Ext.panel.Tool',
    alias: 'widget.toolmenu',
    renderTpl: ['<div class="x-menu-tool-hover">' + '</div><img id="{id}-toolEl" src="{blank}" class="{baseCls}-img {baseCls}-{type}' + '{childElCls}" role="presentation"/>'],
    privates: {
        onClick: function() {
            var me = this,
            returnValue = me.callParent(arguments);


            if (returnValue && me.items) {
                if (!me.toolMenu) {
                    me.toolMenu = new Ext.menu.Menu({
                        items: me.items
                    });
                }
                me.toolMenu.showAt(0, 0);
                me.toolMenu.showAt(me.getX() + me.getWidth() - me.toolMenu.getWidth(), me.getY() + me.getHeight() + 10);
            }


            return returnValue;
        },
        onDestroy: function() {
            Ext.destroyMembers(this, 'toolMenu'); //destructor
            this.callParent();
        }
    }       


});