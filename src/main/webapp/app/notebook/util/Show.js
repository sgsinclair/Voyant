Ext.define("Voyant.notebook.util.Show", {
	transferable: ['show'],
	
    /**
	 * Shows a one-line summary of this object. For example, for a corpus:
	 * 
	 * 	new Corpus("Hello World!").show(true);
	 * 
	 * @param {boolean} [withID] Includes the corpus ID in parentheses at the end, if true.
	 */
	show: function(len) { // this is for instances
		if (this.then) {
			return Voyant.application.getDeferredNestedPromise(this, arguments);
		} else {
			show.call(this, this.getString ? this.getString(len) : this.toString(), !this.getString && Ext.isNumber(len) ? len : undefined);
		}
	},
	statics: {
		show: function(contents, len) {
			var arg = contents;
			if (this.then) {
				this.then(function(val) {
					show.call(val, val, arg);
				})
			} else {
				if (Ext.isArray(contents)) {
					var allContents = "";
					contents.forEach(function(content) {
						allContents += content.getString ? content.getString() : content.toString();
					});
					contents = allContents;
				} else if (Ext.isString(this) || this instanceof String) {
					if (Ext.isNumber(contents)) {len = contents;}
					contents = this;
				}
				if (contents.toHtml) {contents=contents.toHtml()}
				else if (contents.getString) {contents=contents.getString()}
				else if (contents.toString) {contents=contents.toString()}
//				contents = contents.getString ? contents.getString() : contents.toString();
				if (contents.then) {
					contents.then(function(text) {show(text, len)})
				} else {
					if (len && Ext.isNumber(len)) {contents = contents.substring(0,len)}
					if (Voyant.notebook.util.Show.SINGLE_LINE_MODE==false) {contents="<div class='"+Voyant.notebook.util.Show.MODE+"'>"+contents+"</div>";}
					Voyant.notebook.util.Show.TARGET.insertHtml('beforeEnd',contents);
				}
			}
		},
		showError: function(error, more) {
			var mode = Voyant.notebook.util.Show.MODE;
			Voyant.notebook.util.Show.MODE='error';
			
			if (this instanceof Voyant.util.ResponseError) {
				error = this;
			}
			if (error instanceof Voyant.util.ResponseError) {
				if (console) {console.error(error.getResponse())}
				more = error.getResponse().responseText
				error = error.getMsg();
			}
			
			else {

				if (error.stack && !more) {more=error.stack}
				if (more && Ext.isString(more)===false) {more=more.toString()}
				
			}

			if (console) {console.error(error)}
			if (more) {
				if (console) {console.error(more);}
				error="<h3>"+error.toString()+"</h3><pre>"+Ext.String.htmlEncode(more)+'</pre>';
			}
			show(error);
			Voyant.notebook.util.Show.MODE = mode;
		},
		TARGET : null,
		MODE: 'info',
		SINGLE_LINE_MODE : false
	}
});

String.prototype.show = Voyant.notebook.util.Show.show;
var show = Voyant.notebook.util.Show.show;
var showError = Voyant.notebook.util.Show.showError;
