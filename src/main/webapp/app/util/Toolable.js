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
		var moreTools = undefined;
		var parent = this.up('component');
		if (parent && parent.getInitialConfig('moreTools')) {
			moreTools = [];
			 parent.getInitialConfig('moreTools').forEach(function(xtype) {
				 if (xtype && xtype!=this.xtype) {
						moreTools.push(this.getMenuItemFromXtype(xtype));
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

			}, this)
		}
		if (moreTools && this.getApplication().getMoreTools) {
			moreTools.push("-");
		}
		if (this.getApplication().getMoreTools) {
			moreTools = moreTools || [];
			var app = this.getApplication();
			var tools = app.getMoreTools();
			tools.forEach(function(category) {
				var categories = [];
				category.items.forEach(function(subcategory) {
					var subcategories = [];
					subcategory.items.forEach(function(xtype) {
						subcategories.push(this.getMenuItemFromXtype(xtype))
					}, this)
					categories.push({
						text: app.localize(subcategory.i18n),
						glyph: subcategory.glyph,
						menu: {items: subcategories}
					})
				}, this);
				moreTools.push({
					text: app.localize(category.i18n),
					glyph: category.glyph,
					menu: {items: categories}
				})
			}, this);
		}
		
		var saveItems = undefined;
		var toolsMap = {
				maximize: {
					fn: this.maximizeToolClick
				},
				plus: {
					fn: moreTools ? undefined : this.plusToolClick,
					items: moreTools ? moreTools : undefined
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
	getMenuItemFromXtype: function(xtype) {
		var xt = xtype;
		var config = this.getApplication().getToolConfigFromToolXtype(xtype);
		return Ext.apply(Ext.clone(config), {
			xtype: 'menuitem',
			text: config.title,
			textAlign: 'left',
			handler: function() {this.replacePanel(config.xtype)},
			scope: this
		})
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