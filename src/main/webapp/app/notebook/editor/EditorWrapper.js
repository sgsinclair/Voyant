Ext.define("Voyant.notebook.editor.EditorWrapper", {
	extend: "Ext.panel.Panel",
	mixins: ["Voyant.util.Localization"],
	requires: ["Voyant.notebook.editor.button.Movement","Voyant.notebook.editor.button.Add"],
	alias: "widget.notebookeditorwrapper",
	cls: "notebook-editor-wrapper",
	config: {
		content: '',
		isEditing: false
	},
	border: false,
	bodyBorder: false,
	initComponent: function() {
		var me = this;
		this.on("afterrender", function(){
			this.getDockedItems().forEach(function(tb) {
				tb.getTargetEl().setVisibilityMode(Ext.dom.Element.VISIBILITY);
			});
			this.setActiveMode(false);
			this.body.on("click", function() {
				this.removeCls("notebook-editor-wrapper-hover");
				this.setActiveMode(true); // added for touch devices
			}, this);
			this.mon(this.getEl(), "mouseover", function() {
				this.setActiveMode(true);
			}, this);
			this.mon(this.getEl(), "mouseout", function() {
				this.setActiveMode(false);
			}, this);			
		}, this);
		this.callParent(arguments);
	},
	setActiveMode: function(mode) {
		this.getDockedItems().forEach(function(tb) {
			if (tb.dock=='right') {
				tb.items.each(function(item) {
					if (item.hasCls("notebookwrappercounter")==false) {
						item.getTargetEl().setVisibility(mode);
					}
				})
			} else {
				tb.getTargetEl().setVisibility(mode);
			}
		}, this);
		if (!this.getIsEditing()) {
			if (mode) {
				this.body.addCls("notebook-editor-wrapper-hover");
			} else {
				this.body.removeCls("notebook-editor-wrapper-hover");
			}
		}
	}
})