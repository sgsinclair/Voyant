/**
 * A helper for working with the Voyant Notebook app.
 * @memberof Spyral
 * @namespace
 */
class Notebook {
	/**
	 * Returns the previous block.
	 * @static
	 * @returns {string}
	 */
	static getPreviousBlock() {
		return Spyral.Notebook.getBlock(-1);
	}
	/**
	 * Returns the next block.
	 * @static
	 * @returns {string}
	 */
	static getNextBlock() {
		return Spyral.Notebook.getBlock(1);
	}
	/**
	 * Returns the current block.
	 * @static
	 * @params {number} [offset] If specified, returns the block whose position is offset from the current block
	 * @returns {string}
	 */
	static getBlock() {
		if (Voyant && Voyant.notebook) {
			return Voyant.notebook.Notebook.currentNotebook.getBlock.apply(Voyant.notebook.Notebook.currentNotebook, arguments)
		}
	}
	/**
	 * 
	 * @param {*} contents 
	 * @param {*} config 
	 */
	static show(contents, config) {
		var contents = Spyral.Util.toString(contents, config);
		if (contents instanceof Promise) {
			contents.then(c => Voyant.notebook.util.Show.show(c))
		} else {
			Voyant.notebook.util.Show.show(contents);
		}
	}
	/**
	 * @returns {string|element}
	 */
	static getTarget() {
		if (Voyant && Voyant.notebook && Voyant.notebook.Notebook.currentBlock) {
			return Voyant.notebook.Notebook.currentBlock;
		} else {
			const target = document.createElement("div");
			document.body.appendChild(target);
			return target;
		}
	}
}

export { Notebook }
