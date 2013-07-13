var Voyant = {};
Voyant.TROMBONE_URL = "http://localhost:8080/voyant/trombone"

Ext.Loader.setConfig({
//	disableCaching: false,
	enabled: true,
	paths: {
		'Voyant': '../resources/app'
	}
});
Ext.require('Voyant.Application');
Ext.require('Voyant.utils.Show');
Ext.require('Voyant.utils.DeferredManager');
//Ext.require('Voyant.utils.Localization');

//Ext.require('Voyant.data.Table');

Ext.onReady(function() {
	Voyant.application = Ext.create('Voyant.Application', {
		// ext specific properties
		name: 'Voyant',
		appFolder: 'resources/app',
		session: Ext.data.IdGenerator.get('uuid').generate(),
		
		// notebook specific properties
		ckConfig: {
			toolbar:  [
			    	{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', '-', 'RemoveFormat' ] },
			    	{ name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align' ], items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', 'Blockquote' ] },
			    	{ name: 'styles', items: [ 'Styles', 'Format' ] },
			    	{ name: 'links', items: [ 'Link', 'Unlink'] },
			    	{ name: 'insert', items: [ 'Image', 'Table' ] },
//			    	{ name: 'tools', items: [ 'Maximize' ] },
			    	{ name: 'document', groups: [ 'mode', 'document', 'doctools' ], items: [ 'Source' ] },
			    ], //'Basic',
			    allowedContent: true,
			height: 150,
			resize_enabled: false,
			toolbarCanCollapse: false
		},
		emptyText: 'Click here to edit',
		codeEditors: {},

		launch: function(profile) {
//			var me = this;
			var viewport = Ext.create('Ext.container.Viewport', {
				layout: 'border',
				app: this,
				items: [{
					region: 'center',
					header: {
						title: 'Voyant Notebooks'
					},
					xtype: 'panel',
					id: 'main-notebook-body',
					defaultType: 'notebookContainer',
					autoScroll: true,
					border: false,
					tools: [{
						type: 'save',
						callback: function(panel) {
							var app = panel.ownerCt.app;
							var mypanel = panel; // create a reference
							var blocks = [];
							panel.el.query('.container-content').forEach(function(container){
								var code_wrapper = Ext.get(container).down('.code_wrapper');
								if (code_wrapper) {
									var editor = app.codeEditors[code_wrapper.id];
									blocks.push({type: 'code', content: editor.getValue()});
								}
								else {
									var text_wrapper = Ext.get(container).down('.text_contents');
									if (text_wrapper) {
										blocks.push({type: 'code', content: text_wrapper.getHTML()});
									}
								}
							})
							Ext.Msg.show({
							     title:'Save Notebook',
							     msg: '<p>You may be able to use <a href="./?inline='+encodeURIComponent(Ext.encode(blocks))+'">this link</a> – otherwise, copy and paste the content in the box below.</p>'
							     	+'<p>If you would like to import a new notebook, paste the contents into the box and press "Yes", otherwise, press "No"</p>',
							     multiline: true,
							     width: 800,
							     value : Ext.encode(blocks),
							     buttons: Ext.Msg.YESNO,
							     icon: Ext.Msg.QUESTION,
							     fn: function(button, text) {
							    	 if (button=='yes') {
							    		 mypanel.removeAll();
							    		 app.codeEditors = {};
							    		 var json = false;
							    		 try {
								    		 json = Ext.decode(text);
							    		 }
							    		 catch(e) {
							    			 showError("Unable to create notebook from the provided text (JSON).")
							    		 }
							    		 if (json) {app.createFromJson(json);}
							    	 }
							     }
							})
						},
						toolTip: 'Save',
						qtip: 'Save'
					},{
						type: 'help'
					}],
					items: [],
				}, {
					region: 'south',
					xtype: 'container',
					id: 'notebook-footer',
					html: 'Voyant Notebooks, Stéfan Sinclair & Geoffrey Rockwell (©2013)'
				}]
			});
			
//			viewport.app = this;
			
			CKEDITOR.on('currentInstance', Ext.bind(this.removeInactiveEditors, this));
			
//			this.loadIframe();
			
			var params = Ext.Object.fromQueryString(window.location.search);
			if (params.example) {
				Ext.Ajax.request({
					url: this.getBaseUrl()+'../skins/notebook/examples/'+params.example+'.js',
					success: Ext.bind(function(response) {
						var contents = Ext.decode(response.responseText);
						for (var i = 0; i < contents.length; i++) {
							var text = contents[i];
							if (text.type == 'text') {
								this.addText(i, text.content, false);
							} else if (text.type == 'code') {
								this.addCode(i, text.content);
							}
						}
					}, this),
					failure: function(response) {
						alert('Error loading example.');
					}
				});
			}
			else {
				if (params.inline) {
					if (params.inline.indexOf("[")==0) {
						var json = ""
						try {
							json = Ext.decode(params.inline);
						}
						catch(e) {
							showError("Unable to laod JSON from URL", e);
						}
						if (json) {this.createFromJson(json);}
					}
					else {
						this.addCode(0, params.inline)
					}					
				}
				else {
					this.addText(0, "<h1 style='text-align: center; font-size: larger;'>My Voyant Notebook Title (click to edit)</h1>", false)
					this.addText(1, "<h2>Introduction</h2><p>(click to edit)</p>", false)
					this.addCode(2, 'new String("Hello World!").show(); // click to edit and press > to run');
				}
			}
			Ext.defer(this.runAllCode, 200, this);
		},
		
		createFromJson: function(json) {
			for (var i = 0; i < json.length; i++) {
				var text = json[i];
				if (text.type == 'text') {
					this.addText(i, text.content, false);
				} else if (text.type == 'code') {
					this.addCode(i, text.content);
				}
			}
		},

		runCode: function(container) {
			// clear contents
			var results = container.el.down("div[class~=code_result]");
			results.show();
			results.setHTML(' ');
			results.mask();
			
			var editorContainer = container.el.down("div[class~=code_wrapper]");
			var editor = this.codeEditors[editorContainer.id];
			var code = editor.getValue();
			try {
				window.Voyant.utils.Show.TARGET = results;
				eval.call(window, code);
			}
			catch (e) {
				showError(e)
			}
			results.unmask();

		},
		runAllCode: function() {
			Ext.query('div[class~=code_result]').forEach(function(container) {
				Ext.get(container).show().mask('working');
			})
			var containers = Ext.query('div[class~=notebook-code-container]');
			this.tryRunningNextContainer(containers)
		},
		
		tryRunningNextContainer: function(containers) {
			if (containers.length>0) {
				if (Voyant.utils.deferredManager.getCount()>0) {
					Ext.defer(this.tryRunningNextContainer, 100, this, [containers])
				}
				else {
					var container = containers.shift();
					this.runCode(Ext.get(container));
					this.tryRunningNextContainer(containers);
				}
			}
			
		},
		
		removeInactiveEditors: function() {
			for (var key in CKEDITOR.instances) {
				var editor = CKEDITOR.instances[key];
				if (!editor.focusManager.hasFocus) {
					var html = editor.getData();
					if (html == '') html = this.emptyText;
					var content = editor.element.getNext();
					content.setHtml(html);
					editor.element.setStyle('display', 'none');
					editor.destroy();
					content.setStyle('display', 'block');
				}
			}
		},
		
		addText: function(position, content, initEditor) {
			content = content || '';
			var panel = Ext.ComponentQuery.query('panel[region=center]')[0];
			var newpanel = panel.insert(position, {
				app: this,
				cls: 'notebook-text-container',
				html: '<div class="text_wrapper"></div><div class="text_contents">'+content+'</div>'
			});
			
			var editorWrapper = newpanel.getEl().down('div[class="text_wrapper"]');
			var contentsWrapper = editorWrapper.next('div[class="text_contents"]');
			
			if (initEditor !== false) {
				var editor = CKEDITOR.appendTo(editorWrapper.dom, this.ckConfig);
				editor.on('instanceReady', function() {
					if (content != null) {
						editor.setData(content);
					}
					Ext.defer(this.focus, 50, this);
				});
			}

			contentsWrapper.on('click', function(evt, e, obj) {
				evt.stopPropagation();
				contentsWrapper.setStyle('display', 'none');
				editorWrapper.setStyle('display', 'block');
				var editor = CKEDITOR.appendTo(editorWrapper.dom, this.ckConfig);
				editor.on('instanceReady', function() {
					Ext.defer(this.focus, 50, this);
				});
				editor.on('focus', function(e){
					contentsWrapper.up('div[class~=container-wrapper]').down('div[class~=container-icons]').addCls('active')
				})
				editor.on('blur', function(e){
					contentsWrapper.up('div[class~=container-wrapper]').down('div[class~=container-icons]').removeCls('active')
				})
				var html = contentsWrapper.dom.innerHTML;
				if (html == this.emptyText) html = '';
				editor.setData(html);
			}, this); 
		},
		
		addCode: function(position, content) {
			content = content || '';
			var panel = Ext.ComponentQuery.query('panel[region=center]')[0];
			var newpanel = panel.insert(position, {
				cls: 'notebook-code-container',
				app: this,
				html: '<div class="code_wrapper"></div><div class="code_result"> </div>'
			});
			
			var codeWrapper = newpanel.getEl().down('div[class~="code_wrapper"]');
			
			var editor = ace.edit(codeWrapper.dom);
			editor.on('blur', function() {
				Ext.get(editor.container).up('div[class~=container-wrapper]').down('div[class~=container-icons]').removeCls('active')
//				editor.renderer.setShowGutter(false);
//				editor.setHighlightActiveLine(false);
			})
			editor.on('focus', function() {
				Ext.get(editor.container).up('div[class~=container-wrapper]').down('div[class~=container-icons]').addCls('active')
//				editor.renderer.setShowGutter(true);
//				editor.setHighlightActiveLine(true);
			})
		    editor.setTheme("ace/theme/chrome");
		    editor.getSession().setMode("ace/mode/javascript");
			editor.setHighlightActiveLine(false);
		    editor.renderer.setShowPrintMargin(false);
		    editor.setValue(content);
		    editor.clearSelection()
			var id = Ext.id(codeWrapper);
			this.codeEditors[id] = editor;
		}
	});
});

Ext.define('Voyant.NotebookContainer', {
	extend: 'Ext.container.Container',
	alias: 'widget.notebookContainer',
	renderTpl: ['<div class="container-wrapper" style="clear: both"><div class="container-icons inactive">',
	            '<div><img class="x-tool-img x-tool-next" data-qtip="Press to run this code block" src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="/></div>',
	            '<div><img class="x-tool-img x-tool-close" data-qtip="Click to remove this notebook section." src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="/></div>',
	            '<div><img class="x-tool-img x-tool-plus" data-qtip="Click to add a notebook section.<br />If this is a text block, the added section will be a code block, and vice-versa." src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="/></div>',
	            '</div>',
	            '<div class="container-content">{%this.renderContainer(out,values)%}</div></div>'],
	moveUp: function() {
		var sib = this.prev('notebookContainer');
		if (sib) {
			var parent = this.up('panel');
			var parentItems = parent.items;
			var toMove = parentItems.removeAtKey(this.id);
			var newIndex = parentItems.indexOfKey(sib.id);
			parentItems.insert(newIndex, toMove);
			parent.doLayout();
		}
	},
	moveDown: function() {
		var sib = this.next('notebookContainer');
		if (sib) {
			var parent = this.up('panel');
			var parentItems = parent.items;
			var toMove = parentItems.removeAtKey(this.id);
			var newIndex = parentItems.indexOfKey(sib.id)+1;
			parentItems.insert(newIndex, toMove);
			parent.doLayout();
		}
	},
	remove: function() {
		this.up('panel').remove(this, true);
	},
    listeners: {
    	boxready: function(c) {
    		var icons = c.el.down('div[class~="container-icons"]');
    		icons.on('click', function(evt, el, opt) {
    			var e = Ext.get(el);
    			if (e.is('img')) {
    				var cls = e.getAttribute('class');
    				if (cls.indexOf("close")>-1) {
    					c.remove();
    				}
    				else if (cls.indexOf("plus")>-1) {
    					var pos = c.up('panel').items.indexOf(c)+1;
    					// if we are a text container, add code, and vice-versa
    					if (c.hasCls('notebook-text-container')) {
    						c.app.addCode(pos);
    					}
    					else if (c.hasCls('notebook-code-container')) {
    						c.app.addText(pos);
    					}
    				}
    				else if (cls.indexOf("next")>-1) {
    					c.app.runCode(c);
    				}
    			}
    		}, this);
    	},
    	scope: this
    }
});
