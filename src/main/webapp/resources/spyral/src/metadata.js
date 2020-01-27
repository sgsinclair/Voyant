/**
 * A class for storing Notebook metadata
 * @memberof Spyral
 */
class Metadata {
	/**
	 * The Metadata config object
	 * @typedef {object} MetadataConfig
	 * @property {string} title The title of the Corpus
	 * @property {string} author The author of the Corpus
	 * @property {string} description The description of the Corpus
	 * @property {array} keywords The keywords for the Corpus
	 * @property {string} created When the Corpus was created
	 * @property {string} language The language of the Corpus
	 * @property {string} license The license for the Corpus
	 */

	/** 
	 * The metadata constructor.
	 * @constructor
	 * @param {MetadataConfig} config The metadata config object
	 */
	constructor(config) {
		['title', 'author', 'description', 'keywords', 'modified', 'created', 'language', 'license'].forEach(key => {
			this[key] = undefined;
		})
		this.version = "0.1"; // may be changed by config
		if (config instanceof HTMLDocument) {
			config.querySelectorAll("meta").forEach(function(meta) {
				var name =  meta.getAttribute("name");
				if (name && this.hasOwnProperty(name)) {
					var content = meta.getAttribute("content");
					if (content) {
						this[name] = content;
					}
				}
			}, this);
		} else {
			this.set(config);
		}
		if (!this.created) {this.setDateNow("created")}
	}

	/**
	 * Set metadata properties.
	 * @param {object} config A config object
	 */
	set(config) {
		for (var key in config) {
			if (this.hasOwnProperty(key)) {
				this[key] = config[key];
			}
		}
	}

	/**
	 * Sets the specified field to the current date and time.
	 * @param {string} field 
	 */
	setDateNow(field) {
		this[field] = new Date().toISOString();
	}

	/**
	 * Gets the specified field as a short date.
	 * @param {string} field
	 * @returns {string|undefined}
	 */
	shortDate(field) {
		return this[field] ? (new Date(Date.parse(this[field])).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })) : undefined;
	}

	/**
	 * Gets the fields as a set of HTML meta tags.
	 * @returns {string}
	 */
	getHeaders() {
		var quotes = /"/g, newlines = /(\r\n|\r|\n)/g, tags = /<\/?\w+.*?>/g,
			headers = "<title>"+(this.title || "").replace(tags,"")+"</title>\n"
		for (var key in this) {
			if (this[key]) {
				headers+='<meta name="'+key+'" content="'+this[key].replace(quotes, "&quot;").replace(newlines, " ")+'">';
			}
		}
		return headers;
	}
}

export { Metadata }
