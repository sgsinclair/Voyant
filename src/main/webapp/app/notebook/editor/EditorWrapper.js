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
			this.child("toolbar").getEl().setVisibilityMode(Ext.dom.Element.VISIBILITY).setVisible(false);
			this.body.on("click", function() {
				this.removeCls("notebook-editor-wrapper-hover");
			});
			this.mon(this.getEl(), "mouseover", function() {
				this.child("toolbar").getEl().setVisibility(true);
				if (!this.getIsEditing()) {
					this.body.addCls("notebook-editor-wrapper-hover");
				}
			}, this);
			this.mon(this.getEl(), "mouseout", function() {
				this.child("toolbar").getEl().setVisibility(false);
				if (!this.getIsEditing()) {
					this.body.removeCls("notebook-editor-wrapper-hover");
				}
			}, this);
			
			var initialHeight = this.getHeight();
			this.on("editorresize", function(editor) {
				
				// calculate the total height of the components
				var height = 20;
				this.items.each(function(item) {height+=item.getHeight();})

				// the calculated height is more than the current space of the wrapper
				if (height>this.getHeight()) {
					this.setSize({height: height})
				}
				
				// the calculated space is less than the current space of the wrapper
				else if (this.getHeight()<height && height>initialHeight) {
					this.setSize({height: height})
				}
				this.updateLayout();
			})
		}, this);
		this.callParent(arguments);
	}
})