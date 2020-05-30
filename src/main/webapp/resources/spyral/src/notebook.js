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
	static getPreviousBlock(config) {
		return Spyral.Notebook.getBlock(-1, config);
	}
	/**
	 * Returns the next block.
	 * @static
	 * @returns {string}
	 */
	static getNextBlock(config) {
		return Spyral.Notebook.getBlock(1, config);
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
	
	static setNextBlockFromFiles(files, mode, config) {
		if (!mode) {
			if (files[0].filename.endsWith("html")) {mode="html"}
			else if (files[0].filename.endsWith("xml")) {mode="xml"}
			else if (files[0].filename.endsWith("json")) {mode="json"}
			else {mode="text"}
		}
		return Spyral.Notebook.setBlock(files[0].data, 1, mode, config);
	}

	static setNextBlock(data, mode, config) {
		// see if there's a block after this one and if not, create it
		const contents = Spyral.Notebook.getNextBlock({failQuietly: true}); // don't show error if it doesn't exist
		if (contents==undefined && Voyant && Voyant.notebook && Voyant.notebook.Notebook.currentNotebook) {
			const notebook = Voyant.notebook.Notebook.currentNotebook;
			//notebook.addCode('');
		}
		return Spyral.Notebook.setBlock(data, 1, mode, config);
	}
	
	static setBlock(data, offset, mode, config) {
		if (Voyant && Voyant.notebook) {
			return Voyant.notebook.Notebook.currentNotebook.setBlock.apply(Voyant.notebook.Notebook.currentNotebook, arguments)
		}
	}
	
	/**
	 * 
	 * @param {*} contents 
	 * @param {*} config 
	 */
	static show(contents, config) {
		var contents = Spyral.Util.toString(contents);
		if (contents instanceof Promise) {
			contents.then(c => Voyant.notebook.util.Show.show(c))
		} else {
			Voyant.notebook.util.Show.show(contents);
		}
	}
	/**
	 * Returns the target element
	 * @returns {element}
	 */
	static getTarget() {
		if (Voyant && Voyant.notebook && Voyant.notebook.Notebook.currentBlock) {
			return Voyant.notebook.Notebook.currentBlock.results.getEl().dom
		} else {
			const target = document.createElement("div");
			document.body.appendChild(target);
			return target;
		}
	}

	/**
	 * Fetch and return the content of a notebook or a particular cell in a notebook
	 * @param {string} url
	 */
	static async import(url) {
		const isFullNotebook = url.indexOf('#') === -1;
		const isAbsoluteUrl = url.indexOf('http') === 0;

		let notebookId = '';
		let cellId = undefined;
		if (isAbsoluteUrl) {
			const urlParts = url.match(/\/[\w-]+/g);
			if (urlParts !== null) {
				notebookId = urlParts[urlParts.length-1].replace('/', '');
			} else {
				return;
			}
			if (!isFullNotebook) {
				cellId = url.split('#')[1];
			}
		} else {
			if (isFullNotebook) {
				notebookId = url;
			} else {
				[notebookId, cellId] = url.split('#');
			}
		}

		const json = await Spyral.Load.trombone({
			tool: 'notebook.NotebookManager',
			action: 'load',
			id: notebookId,
			noCache: 1
		})

		const notebook = json.notebook.data;
		const parser = new DOMParser();
		const htmlDoc = parser.parseFromString(notebook, 'text/html');
		
		let code = ''
		let error = undefined
		if (cellId !== undefined) {
			const cell = htmlDoc.querySelector('#'+cellId);
			if (cell !== null && cell.classList.contains('notebookcodeeditorwrapper')) {
				code = cell.querySelector('pre').textContent
			} else {
				error = 'No code found for cell: '+cellId
			}
		} else {
			htmlDoc.querySelectorAll('section.notebook-editor-wrapper').forEach((cell, i) => {
				if (cell.classList.contains('notebookcodeeditorwrapper')) {
					code += cell.querySelector('pre').textContent + "\n"
				}
			})
		}
		
		if (Ext) {
			if (error === undefined) {
				Ext.toast({ // quick tip that auto-destructs
				     html: 'Imported code from: '+url,
				     width: 200,
				     align: 'b'
				});
			} else {
				Ext.Msg.show({
					title: 'Error importing code from: '+url,
					message: error,
					icon: Ext.Msg.ERROR,
					buttons: Ext.Msg.OK
				})
			}
		}

		let result = undefined
		try {
			result = eval.call(window, code);
		} catch(e) {
			return e
		}
		if (result !== undefined) {
			console.log(result)
		}
		return result; // could be a promise?
	}
}

export { Notebook }
