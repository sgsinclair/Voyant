/*
 * @class Notebook
 * A Spyral Notebook. This should never be instantiated directly.
 */
Ext.define('Voyant.notebook.Notebook', {
	alternateClassName: ["Notebook"],
	extend: 'Ext.panel.Panel',
	requires: ['Voyant.notebook.editor.CodeEditorWrapper','Voyant.notebook.editor.TextEditorWrapper','Voyant.notebook.util.Show','Voyant.panel.Cirrus','Voyant.panel.Summary','Voyant.notebook.StorageDialogs','Voyant.notebook.github.GitHubDialogs'],
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.notebook',
    statics: {
    	i18n: {
    		title: "Spyral",
    		metadataEditor: "Edit Metadata",
    		metadataTitle: "Title",
    		metadataTip: "Edit notebook metadata.",
    		metadataAuthor: "Author(s)",
    		metadataKeywords: "Keywords",
    		metadataDescription: "Description",
    		metadataLicense: "Licence",
    		metadataLanguage: "Language",
    		metadataReset: "Reset",
    		metadataSave: "Save",
    		metadataCancel: "Cancel",
    		created: "Created",
    		modified: "Modified",
    		clickToEdit: "Click to edit",
    		cantLoadNotebook: "Unable to load Spyral notebook:",
    		cannotLoadJson: "Unable to parse JSON input.",
    		cannotLoadJsonUnrecognized: "Unable to recognize JSON input.",
    		cannotLoadUnrecognized: "Unable to recognize input.",
    		openTitle: "Open",
    		openMsg: "Paste in Notebook ID, a URL or a Spyral data file (in HTML).",
    		exportHtmlDownload: "HTML (download)"
    	},
    	api: {
    		input: undefined
    	},
		currentNotebook: undefined
    },
    config: {
        /**
         * @private
         */
    	notebookId: undefined,
        /**
         * @private
         */
    	metadata: undefined,
        /**
         * @private
         */
    	isEdited: false,
    	/**
    	 * @private
    	 */
    	version: "3.0",
    	/**
    	 * @private
    	 */
		currentBlock: undefined,
		/**
		 * @private
		 * Which solution to use for storing notebooks, either: 'voyant' or 'github'
		 */
		storageSolution: 'voyant'
	},
	
	voyantStorageDialogs: undefined,
	githubDialogs: undefined,

	spyralTernDocs: undefined, // holds the content of the spyral tern docs, for passing to the code editor
    
    /**
     * @private
     */
    constructor: function(config) {
    	Voyant.notebook.Notebook.currentNotebook = this;
    	Ext.apply(config, {
    		title: this.localize('title'),
    	    autoScroll: true,
    		includeTools: {
				'help': true,
				'gear': true,
    			'save': true,
    			'saveIt': {
    				tooltip: this.localize("saveItTip"),
    				itemId: 'saveItTool',
    				xtype: 'toolmenu',
    				glyph: 'xf0c2@FontAwesome',
					disabled: true,
					scope: this,
					items: [{
						text: 'Save',
						xtype: 'menuitem',
						glyph: 'xf0c2@FontAwesome',
						handler: this.showSaveDialog.bind(this, false),
						scope: this
					},{
						text: 'Save As...',
						xtype: 'menuitem',
						glyph: 'xf0c2@FontAwesome',
						handler: this.showSaveDialog.bind(this, true),
						scope: this
					}]
    			},
    			'new': {
    				tooltip: this.localize("newTip"),
    				callback: function() {
    					this.clear();
    					this.addNew();
    	    			let url = this.getBaseUrl()+"spyral/";
    	    			window.history.pushState({
    						url: url
    					}, "Spyral Notebook", url);
    				},
    				xtype: 'toolmenu',
    				glyph: 'xf067@FontAwesome',
    				scope: this
    			},
    			'open': {
    				tooltip: this.localize("openTip"),
    				xtype: 'toolmenu',
					glyph: 'xf115@FontAwesome',
					callback: function(panel, tool) {
						const storageSolution = this.getStorageSolution();
						if (storageSolution === undefined) {
						} else {
							setTimeout(() => {
								tool.toolMenu.hide()
							})
							if (storageSolution === 'github') {
								this.githubDialogs.showLoad();
							} else {
								Ext.Msg.prompt(this.localize("openTitle"),this.localize("openMsg"),function(btn, text) {
									text = text.trim();
									if (btn=="ok") {
										this.clear();
										this.loadFromString(text);
									}
								}, this, true);
							}
						}
					},
					scope: this,
					items: [{
						text: 'Load',
						xtype: 'menuitem',
						glyph: 'xf115@FontAwesome',
						handler: function() {
							Ext.Msg.prompt(this.localize("openTitle"),this.localize("openMsg"),function(btn, text) {
								text = text.trim();
								if (btn=="ok") {
									this.clear();
									this.loadFromString(text);
								}
							}, this, true);
						},
						scope: this
					},{
						text: 'Load from GitHub',
						xtype: 'menuitem',
						glyph: 'xf115@FontAwesome',
						handler: function() {
							this.githubDialogs.showLoad();
						},
						scope: this
					}]
    			},
    			'runall': {
    				tooltip: this.localize("runallTip"),
    				callback: this.runAll,
    				xtype: 'toolmenu',
    				glyph: 'xf04e@FontAwesome',
    				scope: this
    			},
    			'metadata': {
    				tooltip: this.localize("metadataTip"),
    				callback: this.showMetadataEditor,
					xtype: 'toolmenu',
					glyph: 'xf02c@FontAwesome',
					scope: this
    			}
    		},
    			
    		items: [{
    			itemId: 'spyralHeader',
    			cls: 'spyral-header',
    			listeners: {
    				afterrender: function(header) {
    					Ext.tip.QuickTipManager.register({
    						  target: header.getId(),
    						  text: this.localize("clickToEdit")
    						});
    					var head = header;
    					header.getTargetEl().on("click", function(header) {
    						this.showMetadataEditor();
    						head.removeCls("editable");
    					}, this);
    					header.mon(header.getEl(), "mouseover", function() {header.addCls("editable")});
    					header.mon(header.getEl(), "mouseout", function() {header.removeCls("editable")});
    				},
    				scope: this
    			}
    		},{
    			xtype: 'container',
    			itemId: 'cells'
    		},{
    			itemId: 'spyralFooter',
    			cls: 'spyral-footer',
    			listeners: {
    				afterrender: function(footer) {
    					Ext.tip.QuickTipManager.register({
  						  target: footer.getId(),
  						  text: this.localize("clickToEdit")
  						});
    					var foot = footer;
    					footer.getTargetEl().on("click", function(footer) {
    						this.showMetadataEditor();
    						foot.removeCls("editable");
    					}, this);
    					footer.mon(footer.getEl(), "mouseover", function() {footer.addCls("editable")});
    					footer.mon(footer.getEl(), "mouseout", function() {footer.removeCls("editable")});
    				},
    				scope: this
    			}
    		}],
    		listeners: {
    			afterrender: this.init,
    			notebookWrapperMoveUp: this.notebookWrapperMoveUp,
    			notebookWrapperMoveDown: this.notebookWrapperMoveDown,
    			notebookWrapperRemove: this.notebookWrapperRemove,
    			notebookWrapperAdd: this.notebookWrapperAdd,
    			scope: this
    		}
    	})
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);

		this.voyantStorageDialogs = new Voyant.notebook.StorageDialogs({
			listeners: {
				'fileLoaded': function(src) {

				},
				'fileSaved': function(src, notebookId) {
					this.unmask();
					if (notebookId !== null) {
						var id = this.getNotebookId();
						if (!id || notebookId!=id) {
							this.setNotebookId(notebookId);
						}
						this.toastInfo({
							html: this.localize('saved'),
							anchor: 'tr'
						});
						this.setIsEdited(false);
					} else {
						// save error
					}
				},
				'saveCancelled': function() {
					this.unmask();
				},
				scope: this
			}
		});

		this.githubDialogs = new Voyant.notebook.github.GitHubDialogs({
			listeners: {
				'fileLoaded': function(src, {owner, repo, ref, path, file}) {
					this.githubDialogs.close();
					this.clear();
					this.loadFromString(file);

					const id = encodeURIComponent(owner+'/'+repo+'/'+path);
					if (location.search.indexOf(id) === -1) {
						const url = this.getBaseUrl()+'spyral/?githubId='+id;
						window.history.pushState({
							url: url
						}, 'Spyral Notebook: '+id, url);
					}
				},
				'fileSaved': function(src, {owner, repo, branch, path}) {
					this.githubDialogs.close();
					this.unmask();
					this.toastInfo({
						html: this.localize('saved'),
						anchor: 'tr'
					});
					this.setIsEdited(false);

					const id = encodeURIComponent(owner+'/'+repo+'/'+path);
					if (location.search.indexOf(id) === -1) {
						const url = this.getBaseUrl()+'spyral/?githubId='+id;
						window.history.pushState({
							url: url
						}, 'Spyral Notebook: '+id, url);
					}
				},
				'saveCancelled': function(src) {
					this.unmask();
				},
				scope: this
			}
		});
    },
    
    init: function() {
		// add static / global functions from Spyral
		window.Corpus = Spyral.Corpus;
		window.Table = Spyral.Table;

		window.loadCorpus = function() {
			return Spyral.Corpus.load.apply(Spyral.Corpus.load, arguments)
		}

		window.createTable = function() {
			return Spyral.Table.create(arguments)
		}

		// need to load docs first
		Ext.Ajax.request({
			url: this.getApplication().getBaseUrlFull()+'resources/spyral/docs/spyral.json',
			callback: function(opts, success, response) {
				if (success) {
					this.spyralTernDocs = Ext.JSON.decode(response.responseText);
					
					// add docs for static / global functions
					this.spyralTernDocs.Corpus = this.spyralTernDocs.Spyral.Corpus;
					this.spyralTernDocs.Table = this.spyralTernDocs.Spyral.Table;
					this.spyralTernDocs.loadCorpus = this.spyralTernDocs.Spyral.Corpus.load;
					this.spyralTernDocs.createTable = this.spyralTernDocs.Spyral.Table.create;
				}

				var queryParams = Ext.Object.fromQueryString(document.location.search, true);
				var isRun = Ext.isDefined(queryParams.run);
				var spyralIdMatches = /\/spyral\/([\w-]+)\/?$/.exec(location.pathname);
				var isGithub = Ext.isDefined(queryParams.githubId);
				if (queryParams.input) {
					if (queryParams.input.indexOf("http")===0) {
						this.loadFromUrl(queryParams.input, isRun);
					}
				} else if (spyralIdMatches) {
					this.loadFromId(spyralIdMatches[1]);
					this.setStorageSolution('voyant');
				} else if (isGithub) {
					this.githubDialogs.loadFileFromId(queryParams.githubId);
					this.setStorageSolution('github');
				} else {
					this.addNew();
				}
			},
			scope: this
		})
    },
    
    getBlock: function(offset) {
    	offset = offset || 0;
    	var containers = this.query("notebookcodeeditorwrapper");
    	var id = this.getCurrentBlock().id;
    	var current = containers.findIndex(function(container) {return container.id==id})
    	if (current+offset<0 || current+offset>containers.length-1) {
			Ext.Msg.show({
				title: this.localize('error'),
				msg: this.localize('blockDoesNotExist'),
				buttons: Ext.MessageBox.OK,
				icon: Ext.MessageBox.ERROR
			});
			return undefined;
    	}
    	content = containers[current+offset].getContent();
    	return content.input;
//    	debugger
//    	var mode = containers[current+offset].editor.getMode().split("/").pop();
//    	if (content.mode=="xml") {
//    		return new DOMParser().parseFromString(content.input, 'text/xml')
//    	} else if (content.mode=="json") {
//    		return JSON.parse(content.input);
//    	} else if (content.mode=="html") {
//    		return new DOMParser().parseFromString(content.input, 'text/html')
//    	} else {
//    		return content.input;
//    	}
    },
    
    addNew: function() {
		this.setMetadata(new Spyral.Metadata({
			title: "<h1>Spyral Notebook</h1>"
		}));
		this.addText("<p>This is a Spyral Notebook, a dynamic document that combines writing, code and data in service of reading, analyzing and interpreting digital texts.</p><p>Spyral Notebooks are composed of text blocks (like this one) and code blocks (like the one below). You can <span class='marker'>click on the blocks to edit</span> them and add new blocks by clicking add icon that appears in the left column when hovering over a block.</p>");
		var code = this.addCode('');
		Ext.defer(function() {
			code.run();
		}, 100, this);
    },
    
    clear: function() {
    	this.setMetadata(new Spyral.Metadata());
    	var cells = this.getComponent("cells");
    	cells.removeAll();
	},

	showSaveDialog: function(saveAs) {
		var data = this.generateExportHtml();
		this.mask(this.localize('saving'));
		this.getMetadata().setDateNow("modified");

		const storageSolution = this.getStorageSolution();
		if (storageSolution === 'github') {
			this.githubDialogs.showSave(data);
		} else {
			this.voyantStorageDialogs.showSave(data, saveAs ? undefined : this.getNotebookId());
		}
	},
	
    loadFromString: function(text) {
    	text = text.trim();
		if (text.indexOf("http")==0) {
			this.loadFromUrl(text);
		} else if (text.indexOf("{")==0) { // old format?
			var json;
			try {
				json = JSON.parse(text)
			} catch(e) {
				return Ext.Msg.show({
					title: this.localize('error'),
					msg: this.localize('cannotLoadJson')+"<br><pre style='color: red'>"+e+"</pre>",
					buttons: Ext.MessageBox.OK,
					icon: Ext.MessageBox.ERROR
				});
			}
			if (!json.metadata || !json.blocks) {
				return Ext.Msg.show({
					title: this.localize('error'),
					msg: this.localize('cannotLoadJsonUnrecognized'),
					buttons: Ext.MessageBox.OK,
					icon: Ext.MessageBox.ERROR
				});
			}
			json.blocks.forEach(function(block) {
        		if (Ext.isString(block) && block!='') {this.addCode({input: block});}
        		else if (block.input) {
            		if (block.type=='text') {this.addText(block);}
            		else {
            			this.addCode(block);
            		}
        		}
			}, this);
		} else if (/^[\w-_]+$/.test(text)) {
			this.loadFromId(text)
		}
		else if (text.indexOf("<")!==0 || text.indexOf("spyral")==-1) {
			return Ext.Msg.show({
				title: this.localize('error'),
				msg: this.localize('cannotLoadUnrecognized'),
				buttons: Ext.MessageBox.OK,
				icon: Ext.MessageBox.ERROR
			});
		} else {
			this.loadFromHtmlString(text);
		}
		return true;

    },
    
    loadFromId: function(id) {
    	this.mask(this.localize("loading"));
    	var me = this;
    	Spyral.Load.trombone({
	    	 tool: 'notebook.NotebookManager',
	    	 action: 'load',
	    	 id: id,
	    	 noCache: 1
    	}).then(function(json) {
    		me.unmask();
    		me.loadFromString(json.notebook.data); // could be older JSON format
			if (json.notebook.id && json.notebook.id!=me.getNotebookId()) {
				me.setNotebookId(json.notebook.id);
			}
	    	me.setIsEdited(false);
    	}).catch(function(err) {me.unmask()})
    },
    
    loadFromHtmlString: function(html) {
    	var parser = new DOMParser();
    	var htmlDoc = parser.parseFromString(html, 'text/html');
    	this.loadFromDom(htmlDoc);
    },
    
    loadFromDom: function(dom) {
    	this.setMetadata(new Spyral.Metadata(dom))
    	dom.querySelectorAll("section.notebook-editor-wrapper").forEach(function(section) {
    		var classes = section.classList;
    		if (classes.contains("notebooktexteditorwrapper")) {
    			var editor = section.querySelector(".notebook-text-editor").innerHTML;
    			this.addText(editor, undefined, section.id);
    		} else if (classes.contains("notebookcodeeditorwrapper")) {
    			var inputEl = section.querySelector(".notebook-code-editor-raw");
    			var typeRe = /\beditor-mode-(\w+)\b/.exec(inputEl.className);
    			var editorType = typeRe[1];    			
    			var input = editorType == "javascript" ? inputEl.innerText : inputEl.innerHTML;
    			var output = section.querySelector(".notebook-code-results").innerHTML;
    			var codeEditor = this.addCode({
    				input: input,
    				output: output,
    				mode: editorType
    			}, undefined, section.id)
    		}
    	}, this);
    },
    
    runUntil: function(upToCmp) {
    	var containers = [];
    	Ext.Array.each(this.query("notebookcodeeditorwrapper"), function(item) {
			containers.push(item);
			item.clearResults();
    		if (upToCmp && upToCmp==item) {return false;}
    	}, this);
    	this._run(containers);
    },
    
    runFrom: function(fromCmp) {
    	var containers = [], matched = false;
    	Ext.Array.each(this.query("notebookcodeeditorwrapper"), function(item) {
    		if (fromCmp && fromCmp==item) {matched=true;}
    		if (matched) {
    			containers.push(item);
    			item.clearResults();
    		}
    	}, this);
    	this._run(containers);
    },
    
    runAll: function() {
    	var containers = [];
    	Ext.Array.each(this.query("notebookcodeeditorwrapper"), function(item) {
			containers.push(item);
			item.clearResults();
    	}, this);
    	this._run(containers);
    },
    
    _run: function(containers) {
    	if (containers.length>0) {
    		var container = containers.shift();
    		var result = container.run(true);
			if (result!==undefined && result.then && result.catch && result.finally) {
				var me = this;
				result.then(function() {
		        	Ext.defer(me._run, 100, me, [containers]);
				})
			} else {
	        	Ext.defer(this._run, 100, this, [containers]);
			}
    	}
    },
    
    loadFromUrl: function(url, run) {
    	var me = this;
    	// load as string and not HTML in case it's an older JSON format
    	Spyral.Load.text(url).then(function(text) {me.loadFromString(text)})
    },
    
    addText: function(block, order,  name) {
    	return this._add(block, order, 'notebooktexteditorwrapper', name);
    },
 
    addCode: function(block, order, name) {
    	return this._add(block, order, 'notebookcodeeditorwrapper', name, {docs: this.spyralTernDocs});
    },
    
    _add: function(block, order, xtype, name, config) {
    	if (Ext.isString(block)) {
    		block = {input: block}
    	}
    	var cells = this.getComponent("cells");
    	order = (typeof order === 'undefined') ? cells.items.length : order;
    	return cells.insert(order, Ext.apply(block, {
    		xtype: xtype,
    		order: order,
    		name: Spyral.Util.id()
    	}, config))
    },
    
    updateMetadata: function() {
    	var metadata = this.getMetadata();
    	this.getComponent("spyralHeader").update(metadata.title);
    	this.getComponent("spyralFooter").update(this.getInnerFooterHtml());
    },
    
	notebookWrapperMoveUp: function(wrapper) {
		var cells = this.getComponent("cells");
		var i = cells.items.findIndex('id', wrapper.id);
		if (i==0) {
			Ext.Msg.show({
				title: this.localize('error'),
				msg: this.localize('cannotMoveHigher'),
				buttons: Ext.MessageBox.OK,
				icon: Ext.MessageBox.WARNING
			});
		}
		else {
			cells.move(i, i-1);
    		this.redoOrder();
		}
	},
	
	notebookWrapperMoveDown: function(wrapper) {
		var cells = this.getComponent("cells");
		var i = cells.items.findIndex('id', wrapper.id);
		if (i==cells.items.getCount()-1) {
			Ext.Msg.show({
				title: this.localize('error'),
				msg: this.localize('cannotMoveLower'),
				buttons: Ext.MessageBox.OK,
				icon: Ext.MessageBox.WARNING
			});
		}
		else {
			cells.move(i, i+1);
    		this.redoOrder();
		}
	},
	
	notebookWrapperRemove: function(wrapper) {
		var cells = this.getComponent("cells");
		cells.remove(wrapper);
		if (cells.items.length==0) {
			this.addText("(Click to edit).")
		}
		this.redoOrder();
	},
	
	notebookWrapperAdd: function(wrapper, e) {
		var cells = this.getComponent("cells");
		var i = cells.items.findIndex('id', wrapper.id);
		var xtype = wrapper.getXType(wrapper);
		var cmp;
		if ((xtype=='notebooktexteditorwrapper' && !e.hasModifier()) || (xtype=='notebookcodeeditorwrapper' && e.hasModifier())) {
			cmp = this.addCode('',i+1);
		}
		else {
			cmp = this.addText('',i+1);
		}
		cmp.getTargetEl().scrollIntoView(this.getTargetEl(), null, true, true);
		this.redoOrder();
	},

    redoOrder: function() {
    	this.query("notebookwrappercounter").forEach(function(counter, i) {
    		counter.setOrder(i);
    	})
    },
    
    setIsEdited: function(val) {
    	// TODO: perhaps setup autosave
    	if (this.getHeader()) {
        	this.getHeader().down("#saveItTool").setDisabled(val==false);
        	if (!val) {
        		this.query("notebookcodeeditor").forEach(function(editor) {
        			editor.setIsChangeRegistered(false);
        		})
        		this.query("notebooktexteditor").forEach(function(editor) {
        			editor.setIsEditRegistered(false);
        		})
        	}
    	}
		this.callParent(arguments);
    },
    
    setNotebookId: function (id) {
    	if (id) {
    		// update URL if needed
    		if (location.pathname.indexOf("/spyral/"+id) === -1) {
    			let url = this.getBaseUrl()+"spyral/"+id+"/";
    			window.history.pushState({
					url: url
				}, "Spyral Notebook: "+id, url);
    		}
    	}
		this.callParent(arguments);
    },
    
    generateExportHtml: function() {
    	var metadata = this.getMetadata();
        var out = "<!DOCTYPE HTML>\n<html>\n<head>\n\t<meta charset='UTF-8'>\n"+
        	metadata.getHeaders();
        var aceChromeEl = document.getElementById("ace-chrome");
        if (aceChromeEl) {out+=aceChromeEl.outerHTML+"\n"}
        out += document.getElementById("voyant-notebooks-styles").outerHTML+"\n"+
	        "<script> // this script checks to see if embedded tools seem to be available\n"+
	    	"window.addEventListener('load', function() {\n"+
	    		"var hostnames = {}, warned = false;\n"+
	    		"document.querySelectorAll('iframe').forEach(function(iframeEl) {\n"+
	    			"let url = new URL(iframeEl.src);\n"+
	    			"if (!(url.hostname in hostnames) && !warned) {\n"+
	    				"hostnames[url.hostname] = true; // mark as fetched\n"+
	    				"fetch(url).catch(response => {\n"+
	    					"warned = true;\n"+
	    					"alert('This notebook seems to contain one ore more tools that may not be able to load. Possible reasons include a server no longer being accessible (especially if the notebook was generated from a local server), or because of security restrictions.'+url)\n"+
	    				"})\n"+
	    			"}\n"+
	    		"})\n"+
	    	"})\n"+
	    	"</script>\n"+
        	"</head>\n<body class='exported-notebook'>"+
        	this.getHeaderHtml()+
        	"<article class='spyralArticle'>";
		this.getComponent("cells").items.each(function(item, i) {
    		type = item.isXType('notebookcodeeditorwrapper') ? 'code' : 'text';
    		content = item.getContent();
    		var counter = item.down("notebookwrappercounter");
    		out+="<section id='"+counter.name+"' class='notebook-editor-wrapper "+item.xtype+"'>\n"+
    			"<div class='notebookwrappercounter'>"+counter.getTargetEl().dom.innerHTML+"</div>";
    		if (type=='code') {
    			var mode = item.down("notebookcodeeditor").getMode();
    			mode = mode.substring(mode.lastIndexOf("/")+1);
    			out+="<div class='notebook-code-editor ace-chrome'>\n"+item.getTargetEl().query('.ace_text-layer')[0].outerHTML+"\n</div>\n"+
    				"<pre class='notebook-code-editor-raw editor-mode-"+mode+"'>\n"+content.input+"</pre>\n"+
    				"<div class='notebook-code-results'>\n"+content.output+"\n</div>\n";
    		} else {
    			out+="<div class='notebook-text-editor'>"+content+"</div>\n";
    		}
    		out+="</section>\n"
    	})
        out += "</article>\n<footer class='spyral-footer'>"+this.getInnerFooterHtml()+"</footer></body>\n</html>";
    	return out;
    },
    
    getHeaderHtml: function() {
    	return "<header class='spyral-header'>"+this.getMetadata().title+"</header>\n";
    },
    
    getInnerFooterHtml: function() {
    	var text = "", metadata = this.getMetadata();
    	if (metadata.author || metadata.license) {
        	var text = "&copy;";
        	if (metadata.author) {text+=" "+metadata.author;}
        	if (metadata.license) {text+=" ("+metadata.license+")";}
    		text += ". ";
    	}
    	if (metadata.created || metadata.modified) {
    		var created = metadata.shortDate("created"), modified = metadata.shortDate("modified");
    		if (created) {
        		text += this.localize("created")+" "+created+"."
    		}
    		if (modified && created!=modified) {
        		text += this.localize("modified")+" "+modified+"."
    		}
    		
    	}
    	return text;
    },
    
    getExtraExportItems: function() {
    	return [{
       		inputValue: 'html',
       		boxLabel: this.localize('exportHtml')
       	},{
       		inputValue: 'htmlDownload',
       		boxLabel: '<a href="#">'+this.localize('exportHtmlDownload')+'</a>',
       		listeners: {
       			afterrender: function(cmp) {
       		    	var file, name = (this.getNotebookId() || "spyral")+ ".html",
       	    		data = this.generateExportHtml().split("\n"),
       	    		properties = {type: 'text/html'};
	       	    	try {
	       	    	  file = new File(data, name, properties);
	       	    	} catch (e) {
	       	    	  file = new Blob(data, properties);
	       	    	}
	       	    	
       	    		var url = URL.createObjectURL(file);
       	    		var a = cmp.boxLabelEl.dom.querySelector("a");
       	    		a.setAttribute("download", name);
       	    		a.setAttribute("href", url);
       			},
       			scope: this
       		},
       		handler: function(cmp) {
       			cmp.boxLabelEl.dom.querySelector("a").click();
       			cmp.up("window").close();
       		}
       	}]
    },
    
    exportHtml: function() {
    	var out = this.generateExportHtml();
        var myWindow = window.open();
        myWindow.document.write(out);
        myWindow.document.close();
        myWindow.focus();
    },
    
    exportHtmlDownload: function() {
    	// https://stackoverflow.com/questions/2897619/using-html5-javascript-to-generate-and-save-a-file
    	var file,
    		data = this.generateExportHtml().split("\n"),
    		properties = {type: 'text/plain'}; // Specify the file's mime-type.
    	try {
    	  file = new File(data, "files.txt", properties);
    	} catch (e) {
    	  file = new Blob(data, properties);
    	}
    	var url = URL.createObjectURL(file);
    	this.getApplication().openUrl(url)
    },
    
	getExportUrl: function(asTool) {
		return location.href; // we just provide the current URL
	},

    showMetadataEditor: function() {
    	var me = this;
    	var metadata = this.getMetadata();
		Ext.create('Ext.window.Window', {
    	    title: this.localize('metadataEditor'),
    	    autoScroll: true,
    	    items: [{
    	    	xtype: 'form',
    	    	items: {
    	    	    bodyPadding: 5,
    	    	    width: 600,

    	    	    // Fields will be arranged vertically, stretched to full width
    	    	    layout: 'anchor',
    	    	    defaults: {
    	    	        anchor: '100%',
    	    	        labelAlign: "right"
    	    	    },

    	    	    // The fields
    	    	    defaultType: 'textfield',
    	    	    items: [{
    	    	        fieldLabel: this.localize("metadataTitle"),
    	    	        xtype: 'htmleditor',
    	    	        name: 'title',
    	    	        value: metadata.title,
    	    	        height: 100,
    	    	        enableAlignments : false,
    	    	        enableColors : false,
    	    	        enableFont : false,
    	    	        enableFontSize : false,
    	    	        enableLinks : false,
    	    	        enableLists : false
    	    	    },{
    	    	        fieldLabel: this.localize("metadataAuthor"),
    	    	        name: 'author',
    	    	        value: metadata.author
    	    	    },{
    	    	        fieldLabel: this.localize("metadataKeywords"),
    	    	        name: 'keywords',
    	    	        value: metadata.keywords
    	    	    },{
    	    	    	xtype: 'htmleditor',
    	    	        fieldLabel: this.localize("metadataDescription"),
    	    	        name: 'description',
    	    	        height: 100,
    	    	        value: metadata.description,
    	    	        enableAlignments : false,
    	    	        enableColors : false,
    	    	        enableFont : false
    	    	    },{
    	    	    	xtype: 'combo',
    	    	        fieldLabel: this.localize("metadataLicense"),
    	    	        name: 'license',
    	    	        value: metadata.license || "Creative Commons Attribution (CC BY)",
    	    	        store: {
    	    	        	fields: ['text'],
    	    	        	data: [
    	        	        	{"text": "Apache License 2.0"},
    	        	        	{"text": "BSD 3-Clause \"New\" or \"Revised\" license"},
    	        	        	{"text": "BSD 2-Clause \"Simplified\" or \"FreeBSD\" license"},
    	        	        	{"text": "Creative Commons Attribution (CC BY)"},
    	        	        	{"text": "Creative Commons Attribution-ShareAlike (CC BY-SA)"},
    	        	        	{"text": "Creative Commons Zero (CC0)"},
    	        	        	{"text": "GNU General Public License (GPL)"},
    	        	        	{"text": "GNU Library or \"Lesser\" General Public License (LGPL)"},
    	        	        	{"text": "MIT license"},
    	        	        	{"text": "Mozilla Public License 2.0"},
    	        	        	{"text": "Common Development and Distribution License"},
    	        	        	{"text": "Eclipse Public License"}
    	        	        ]
    	    	        }
    	    	    },{
    	    	    	xtype: 'combo',
    	    	    	name: 'language',
    	    	    	value: metadata.language || "English",
    	    	        fieldLabel: this.localize("metadataLanguage"),
    	    	        store: {
    	    	        	fields: ['text'],
    	    	        	data: [
    	    	        		{"text": "Bengali"},
    	    	        		{"text": "Bhojpuri"},
    	    	        		{"text": "Egyptian Arabic"},
    	    	        		{"text": "English"},
    	    	        		{"text": "French"},
    	    	        		{"text": "German"},
    	    	        		{"text": "Gujarati"},
    	    	        		{"text": "Hausa"},
    	    	        		{"text": "Hindi"},
    	    	        		{"text": "Indonesian"},
    	    	        		{"text": "Italian"},
    	    	        		{"text": "Japanese"},
    	    	        		{"text": "Javanese"},
    	    	        		{"text": "Kannada"},
    	    	        		{"text": "Korean"},
    	    	        		{"text": "Mandarin"},
    	    	        		{"text": "Marathi"},
    	    	        		{"text": "Persian"},
    	    	        		{"text": "Portuguese"},
    	    	        		{"text": "Russian"},
    	    	        		{"text": "Southern Min"},
    	    	        		{"text": "Spanish"},
    	    	        		{"text": "Standard Arabic"},
    	    	        		{"text": "Swahili"},
    	    	        		{"text": "Tamil"},
    	    	        		{"text": "Telugu"},
    	    	        		{"text": "Thai"},
    	    	        		{"text": "Turkish"},
    	    	        		{"text": "Urdu"},
    	    	        		{"text": "Vietnamese"},
    	    	        		{"text": "Western Punjabi"},
    	    	        		{"text": "Wu Chinese"},
    	    	        		{"text": "Yue Chinese"}
    	        	        ]
    	    	        }
    	    	    }]
    	    		
    	    	}
    	    }],

    	    
    	    // Reset and Submit buttons
    	    buttons: [{
    	        text: this.localize('metadataCancel'),
	            ui: 'default-toolbar',
    	        handler: function() {
    	            this.up('window').close();
    	        }
    	    },{
    	        text: this.localize('metadataReset'),
	            ui: 'default-toolbar',
    	        handler: function() {
    	            this.up('window').down('form').getForm().reset();
    	        }
    	    }, " ", {
    	        text: this.localize('metadataSave'),
    	        handler: function() {
    	            var form = this.up('window').down('form').getForm();
    	            metadata.set(form.getValues())
    	            me.updateMetadata();
    	            this.up('window').close();
    	        }
    	    }]
    	    
    	}).show();
	},
	
	showOptionsClick: function(panel) {
		let me = panel;
		if (me.optionsWin === undefined) {
			me.optionsWin = Ext.create('Ext.window.Window', {
				title: me.localize('gearWinTitle'),
    			closeAction: 'hide',
				layout: 'fit',
				width: 400,
				height: 300,
				bodyPadding: 10,
				items: {
					xtype: 'form',
					items: [{
						xtype: 'radiogroup',
						fieldLabel: 'Storage Solution',
						labelAlign: 'left',
						layout: 'vbox',
						items: [{
							boxLabel: 'Voyant',
							name: 'storageSolution',
							inputValue: 'voyant',
							checked: me.getStorageSolution() === 'voyant'
						},{
							boxLabel: 'GitHub',
							name: 'storageSolution',
							inputValue: 'github',
							checked: me.getStorageSolution() === 'github'
						}]
					}]
				},
    			buttons: [{
    				text: me.localize('ok'),
    				handler: function(button, event) {
    					var win = button.findParentByType('window');
    					var form = win.down('form');
    					if (form.isValid()) {
        					var params = form.getValues();
							me.setStorageSolution(params.storageSolution);
        					win.hide();
    					}
    					else {
    						me.showError({
    							message: me.localize("invalidForm")
    						})
    					}
    				}
    			},{
    				text: me.localize('cancel'),
    				handler: function(button, event) {
    					button.findParentByType('window').hide();
    				}
    			}]
			});
		}
		me.optionsWin.show();
	}
});
