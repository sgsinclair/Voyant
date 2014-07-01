Ext.define("Voyant.util.Transferable", {
	transferable: ['transfer'],
	transfer: function(source, destination) {
		if (source.transferable) {
			for (var i=0;i<source.transferable.length;i++) {
				var member = source.transferable[i];
				destination[member] = Ext.bind(source[member], destination);
			}
		}
		if (source.mixins) {
			for (mixin in source.mixins) {
				this.transfer(source.mixins[mixin], destination)
			}
		}
	}
})