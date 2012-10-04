Ext.Loader.setConfig({
	enabled: true,
	paths: {
		'Voyant': 'resources/app'
	}
});
Ext.require('Voyant.Application');

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
					defaultType: 'container',
					autoScroll: true,
					items: [],
					tbar: [{
						xtype: 'button',
						text: 'Add Text',
						handler: this.addText,
						scope: this
					},{
						xtype: 'button',
						text: 'Add Code',
						handler: this.addCode,
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
			
//			caja.initialize({
//				cajaServer: 'https://caja.appspot.com/',
//				debug: true
//			});
//			
//			Ext.DomHelper.insertHtml('beforeEnd', document.body, '<div id="cajaFrame"></div>');
		},
		
		runCode: function(button) {
			var concatCode = '';
			var divs = Ext.DomQuery.select('div[class="code_wrapper"]');
			for (var i = 0; i < divs.length; i++) {
				var div = divs[i];
				var editor = this.codeEditors[div.id];
				var code = editor.getValue();
				concatCode += code;
				var result;
				try {
					result = eval(concatCode);
				} catch (e) {
					result = e;
				}
				var codeResult = Ext.get(div).next('div[class="code_result"]');
				codeResult.setHTML(result);
				
				Ext.get(editor.getWrapperElement()).on('keydown', function() {
					codeResult.setHTML('');
				}, this, {single: true});
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
		
		addText: function(button) {
			var panel = button.up('panel');
			var newpanel = panel.add({
				html: '<div class="text_wrapper"></div><div class="text_contents"></div>'
			});
			
			var editorWrapper = newpanel.getEl().down('div[class="text_wrapper"]');
			var contentsWrapper = editorWrapper.next('div[class="text_contents"]');
			
			var editor = CKEDITOR.appendTo(editorWrapper.dom, this.ckConfig);
			editor.on('instanceReady', function() {
				Ext.defer(this.focus, 50, this);
			});

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
		
		addCode: function(button) {
			var panel = button.up('panel');
			var newpanel = panel.add({
				html: '<div class="code_wrapper"></div><div class="code_result"></div>'
			});
			
			var codeWrapper = newpanel.getEl().down('div[class="code_wrapper"]');
			
			var editor = CodeMirror(codeWrapper.dom, {
				value: '',
				mode: 'javascript',
				lineNumbers: true,
				matchBrackets: true 
			});
			var id = Ext.id(codeWrapper);
			this.codeEditors[id] = editor;
		}
	});
});