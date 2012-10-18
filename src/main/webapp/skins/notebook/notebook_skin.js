Ext.Loader.setConfig({
//	disableCaching: false,
	enabled: true,
	paths: {
		'Voyant': 'resources/app'
	}
});
Ext.require('Voyant.Application');
Ext.require('Voyant.data.Table');

Ext.onReady(function() {
	Voyant.application = Ext.create('Voyant.Application', {
		// ext specific properties
		name: 'Voyant',
		appFolder: 'resources/app',
		
		// notebook specific properties
		ckConfig: {
			toolbar: 'Basic',
			height: 150,
			resize_enabled: false,
			toolbarCanCollapse: false
		},
		emptyText: 'Click here to edit',
		codeEditors: {},
		
		launch: function() {
			Ext.create('Ext.container.Viewport', {
				layout: 'border',
				items: [{
					region: 'center',
					xtype: 'panel',
					defaultType: 'notebookContainer',
					autoScroll: true,
					items: [],
					tbar: [{
						xtype: 'button',
						text: 'Add Text',
						handler: function() {
							this.addText();
						},
						scope: this
					},{
						xtype: 'button',
						text: 'Add Code',
						handler: function() {
							this.addCode();
						},
						scope: this
					},'->',{
						xtype: 'button',
						text: 'Run Code',
						handler: this.runCode,
						scope: this
					}]
				}]
			});
			
			CKEDITOR.on('currentInstance', Ext.bind(this.removeInactiveEditors, this));
			
			this.loadIframe();
			
			var params = Ext.Object.fromQueryString(window.location.search);
			if (params.example) {
				Ext.Ajax.request({
					url: this.getBaseUrl()+'skins/notebook/examples/'+params.example+'.js',
					success: Ext.bind(function(response) {
						var contents = Ext.decode(response.responseText);
						for (var i = 0; i < contents.length; i++) {
							var text = contents[i];
							if (text.type == 'text') {
								this.addText(text.content, false);
							} else if (text.type == 'code') {
								this.addCode(text.content);
							}
						}
					}, this),
					failure: function(response) {
						alert('Error loading example.');
					}
				});
			}
		},
		
		loadIframe: function() {
			var oldFrame = Ext.get('scriptRunner');
			if (oldFrame) oldFrame.remove();
			
			var iframe = Ext.DomHelper.insertHtml('beforeEnd', document.body, '<iframe id="scriptRunner"></iframe>');
			Ext.defer(function() {
				var script = iframe.contentDocument.createElement('script');
				script.setAttribute('type', 'text/javascript');
				script.setAttribute('src', 'resources/lib/extjs-4.1.1/ext-all.js');
				script.onload = function() {
					var script = iframe.contentDocument.createElement('script');
					script.setAttribute('type', 'text/javascript');
					script.setAttribute('src', 'skins/notebook/utils.js');
					iframe.contentDocument.head.appendChild(script);
				};
				iframe.contentDocument.head.appendChild(script);
			}, 150);
		},
		
		runCode: function(button) {
			var r = Ext.query('div[class="code_result"]');
			for (var i = 0; i < r.length; i++) {
				Ext.get(r).setHTML(' ');
			}
			
			var concatCode = '';
			var divs = Ext.DomQuery.select('div[class="code_wrapper"]');
			
//			var evalScope = {};
			
			var iframeDoc = Ext.get('scriptRunner').dom.contentDocument;
			var scripts = Ext.query('script', iframeDoc.body);
			for (var i = 0; i < scripts.length; i++) {
				Ext.removeNode(scripts[i]);
			}
			
			for (var i = 0; i < divs.length; i++) {
				var div = divs[i];
				var editor = this.codeEditors[div.id];
				var code = editor.getValue();
				concatCode += code;
				try {
//					result = eval.call(evalScope, code);
//					result = (new Function("with(this) {" + code + "}")).call(evalScope);
//					result = (new Function(code))();
					
					var script = iframeDoc.createElement('script');
					script.setAttribute('type', 'text/javascript');
					script.setAttribute('onerror', 'handleError');
					script.textContent = code;
					
					iframeDoc.body.appendChild(script);
				} catch (e) {
					alert(e);
				}
				var codeResult = Ext.get(div).next('div[class="code_result"]');
//				codeResult.setHTML(result);
				
				Ext.get(editor.getWrapperElement()).on('keydown', function() {
					this.setHTML(' ');
				}, codeResult, {single: true});
			}
			
			this.loadIframe();
		},
		
		removeInactiveEditors: function() {
			for (var key in CKEDITOR.instances) {
				var editor = CKEDITOR.instances[key];
				console.log(editor.element.$);
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
		
		addText: function(content, initEditor) {
			content = content || '';
			var panel = Ext.ComponentQuery.query('panel[region=center]')[0];
			var newpanel = panel.add({
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
				var html = contentsWrapper.dom.innerHTML;
				if (html == this.emptyText) html = '';
				editor.setData(html);
			}, this); 
		},
		
		addCode: function(content) {
			content = content || '';
			var panel = Ext.ComponentQuery.query('panel[region=center]')[0];
			var newpanel = panel.add({
				html: '<div class="code_wrapper"></div><div class="code_result"> </div>'
			});
			
			var codeWrapper = newpanel.getEl().down('div[class="code_wrapper"]');
			
			var editor = CodeMirror(codeWrapper.dom, {
				value: content,
				mode: 'javascript',
				lineNumbers: true,
				matchBrackets: true 
			});
			var id = Ext.id(codeWrapper);
			this.codeEditors[id] = editor;
		}
	});
});

Ext.define('Voyant.NotebookContainer', {
	extend: 'Ext.container.Container',
	alias: 'widget.notebookContainer',
	renderTpl: ['<div class="container-wrapper"><div class="container-icons">',
	            '<span class="x-tool"><img class="x-tool-up" src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="/></span>',
	            '<span class="x-tool"><img class="x-tool-down" src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="/></span>',
	            '<span class="x-tool"><img class="x-tool-close" src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="/></span>',
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
    		var icons = c.el.down('div[class="container-icons"]');
    		icons.on('click', function(evt, el, opt) {
    			var e = Ext.get(el);
    			if (e.is('img')) {
    				var cls = e.getAttribute('class');
    				switch (cls) {
    					case 'x-tool-up':
    						c.moveUp();
    						break;
    					case 'x-tool-down':
    						c.moveDown();
    						break;
    					case 'x-tool-close':
    						c.remove();
    				}
    			}
    		}, this);
    	},
    	scope: this
    }
});
