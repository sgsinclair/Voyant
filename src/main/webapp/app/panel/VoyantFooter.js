Ext.define('Voyant.panel.VoyantFooter', {
	extend: 'Ext.container.Container',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.voyantfooter',
    statics: {
    	i18n: {
    	}
    },
	height: 18,
	cls: 'x-tab-bar-default voyant-footer',
	listeners: {
		boxready: function(container, width, height) {
			var parts = [
				"<a href='"+container.getBaseUrl()+"docs/' target='voyantdocs'>"+container.localize('voyantTools')+"</a> ",
				", <a href='http://stefansinclair.name/'>St&eacute;fan Sinclair</a> &amp; <a href='http://geoffreyrockwell.com'>Geoffrey Rockwell</a>",
				" (<a href='http://creativecommons.org/licenses/by/4.0/' target='_blank'><span class='cc'>c</span></a> "+ new Date().getFullYear() +")",
				" <a class='privacy' href='"+this.getBaseUrl()+"docs/#!/guide/about-section-privacy-statement' target='top'>"+container.localize('privacy')+"</a>",
				" v. "+Voyant.application.getVersion() + (Voyant.application.getBuild() ? " ("+Voyant.application.getBuild()+")" : "")
			];
			var footer = '';
			var footerWidth = 0;
			var partWidth;
			var el = container.getEl();
			for (var i=0;i<parts.length;i++) {
				partWidth = el.getTextWidth(parts[i].replace(/data-qtip.+?-->/,">").replace(/<.+?>/g, ""));
				if (footerWidth+partWidth < width) {
					footer += parts[i];
					footerWidth += partWidth;
				}
			}
			container.update(footer);
        	Ext.tip.QuickTipManager.register({
                target: container.getTargetEl().dom.querySelector(".privacy"),
                text: this.localize('privacyMsg')
            });
		}
	}
});