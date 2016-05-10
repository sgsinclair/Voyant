Ext.define("Voyant.notebook.util.Show", {
	transferable: ['show'],
	show: function() { // this is for instances
		show.apply(this, arguments);
	},
	statics: {
		show: function(contents) {
			if (this.then) {
				this.then(function(val) {
					show.apply(val, arguments);
				})
			} else {
				contents = contents.getString ? contents.getString() : contents.toString();
				if (Voyant.notebook.util.Show.SINGLE_LINE_MODE==false) {contents="<div class='"+Voyant.notebook.util.Show.MODE+"'>"+contents+"</div>";}
				Voyant.notebook.util.Show.TARGET.insertHtml('beforeEnd',contents);
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

var show = Voyant.notebook.util.Show.show;
var showError = Voyant.notebook.util.Show.showError;