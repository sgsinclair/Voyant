// assumes Spyral has already been declared (by spyral.js)

{
	class Notebook {
		static getPreviousBlock() {
			return Spyral.Notebook.getBlock(-1);
		}
		static getNextBlock() {
			return Spyral.Notebook.getBlock(1);
		}
		static getBlock() {
			if (Voyant && Voyant.notebook) {
				return Voyant.notebook.Notebook.currentNotebook.getBlock.apply(Voyant.notebook.Notebook.currentNotebook, arguments)
			}
		}
		static show(contents, config) {
			var contents = Spyral.Util.toString(contents, config);
			if (contents instanceof Promise) {
				contents.then(c => Voyant.notebook.util.Show.show(c))
			} else {
				Voyant.notebook.util.Show.show(contents);
			}
		}
		static getTarget() {
			if (Voyant && Voyant.notebook && Voyant.notebook.Notebook.currentBlock) {
				return Voyant.notebook.Notebook.currentBlock;
			} else {
				target = document.createElement("div");
				document.body.appendChild(target);
				return target;
			}
		}
	}
	Object.assign(Spyral, {Notebook})
}