export class Metadata {
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
	set(config) {
		for (var key in config) {
			if (this.hasOwnProperty(key)) {
				this[key] = config[key];
			}
		}
	}
	setDateNow(field) {
		this[field] = new Date().toISOString();
	}
	shortDate(field) {
		return this[field] ? (new Date(Date.parse(this[field])).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })) : undefined;
	}
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
