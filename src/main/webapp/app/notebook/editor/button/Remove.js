Ext.define("Voyant.notebook.editor.button.Remove", {
	extend: "Ext.button.Button",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrapperremove',
	statics: {
		i18n: {
		}
	},
	constructor: function(config) {
    	Ext.apply(this, {
    		tooltip: this.localize('tip')
    	})
        this.callParent(arguments);
	},
	glyph: 'xf014@FontAwesome',
	textAlign: 'left',
	listeners: {
		click: function() {
			Ext.Msg.show({
				buttons: Ext.Msg.OKCANCEL,
				icon: Ext.MessageBox.QUESTION,
				msg: this.localize("confirmRemove"),
				title: this.localize("confirmRemoveTitle"),
				fn: function(buttonId) {
					if (buttonId=='ok') {
			        	this.findParentByType('notebook').fireEvent("notebookWrapperRemove", this.findParentByType("notebookeditorwrapper"));
					}
				},
				scope: this
			})
		}
	}
})