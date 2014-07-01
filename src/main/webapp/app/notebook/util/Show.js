Ext.define("Voyant.notebook.util.Show", {
	requires: ['Ext.data.identifier.Uuid','Voyant.util.ResponseError'],
	statics: {
		show: function(contents) {
			if (this.then) {
				var dfd = Voyant.application.getDeferred();
				return this.then(function(val) {
					val.show();
					dfd.resolve();
				}).fail(function(val) {
					if (val) {showError(val)}
					dfd.reject();
				});
			}
			
			// we have at least one argument passed to this function
			if (arguments.length>0) {
				
				// if we have more than one argument, treat them as a single line
				if (arguments.length>1) {
					show("<div class='"+Voyant.notebook.util.Show.MODE+"'>")
					Voyant.notebook.util.Show.SINGLE_LINE_MODE = true;
					for (var i=0;i<arguments.length;i++) {
						arguments[i].show.call(arguments[i]);
					}
					Voyant.notebook.util.Show.SINGLE_LINE_MODE = false;
					show("</div>")
				}
				
				// otherwise, process normally
				else {
					arguments[0].show.call(arguments[0]);
				}
			}
			
			// not a promise, no arguments, so try showing the actual object
			else {
				var contents = contents || (this==window ? '[empty]' : this);
				if (Voyant.notebook.util.Show.TARGET) {
					if (Voyant.notebook.util.Show.SINGLE_LINE_MODE==false) {contents="<div class='"+Voyant.notebook.util.Show.MODE+"'>"+contents+"</div>";}
					if (Voyant.notebook.util.Show.TARGET.insertHtml) {
						Voyant.notebook.util.Show.TARGET.insertHtml('beforeEnd',contents);
					} 
					else if (Voyant.notebook.util.Show.TARGET.innerHTML) {
						Voyant.notebook.util.Show.TARGET.innerHTML=Voyant.notebook.util.Show.TARGET.innerHTML+contents;
					}
				}
				else {
					Ext.Msg.show({
					    msg: contents,
					    buttons: Ext.Msg.OK,
					    icon: Voyant.notebook.util.Show.MODE=='error' ? Ext.window.MessageBox.ERROR : Ext.window.MessageBox.INFO
					})
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
})

// alias show(contents) as global
show = Voyant.notebook.util.Show.show;
showError = Voyant.notebook.util.Show.showError;
Number.prototype.show = show
String.prototype.show = show;
Boolean.prototype.show = show;
Array.prototype.show = show;
Error.prototype.show = showError;