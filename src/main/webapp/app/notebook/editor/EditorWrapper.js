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
				tb.getEl().setVisibilityMode(Ext.dom.Element.VISIBILITY).setVisible(false);
			});
			this.body.on("click", function() {
				this.removeCls("notebook-editor-wrapper-hover");
			});
			this.mon(this.getEl(), "mouseover", function() {
				this.getDockedItems().forEach(function(tb) {
					tb.getEl().setVisibility(true);
				});
				if (!this.getIsEditing()) {
					this.body.addCls("notebook-editor-wrapper-hover");
				}
			}, this);
			this.mon(this.getEl(), "mouseout", function() {
				this.getDockedItems().forEach(function(tb) {
					tb.getEl().setVisibility(false);
				});
				if (!this.getIsEditing()) {
					this.body.removeCls("notebook-editor-wrapper-hover");
				}
			}, this);
			
			// resize as needed (this adds considerable overhead, but it's probably worth it)
			this.getTargetEl().on("resize", function(el) {
				var height = 20;
				me.items.each(function(item) {height+=item.getHeight();})
				me.setSize({height: height});
			})
			
		}, this);
		this.callParent(arguments);
	}
})