Ext.define('Voyant.notebook.Notebook', {
	alternateClassName: ["Notebook"],
	extend: 'Ext.panel.Panel',
	requires: ['Voyant.notebook.editor.CodeEditorWrapper','Voyant.notebook.editor.TextEditorWrapper','Voyant.notebook.util.Show','Voyant.panel.Cirrus','Voyant.panel.Summary'],
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.notebook',
    statics: {
    	i18n: {
    		title: "Spiral Notebook",
    		helpTip: 'Spiral Notebooks are dynamic documents that combine text, code and interactive tools, they are a form of <a href="https://en.wikipedia.org/wiki/Literate_programming" target="_blank">literate programming</a>.',
			eror: "Error",
			cannotMoveHigher: "This block is already at the top and cannot be moved higher.",
			cannotMoveLower: "This block is already at the bottom and cannot be moved lower.",
			failedNotebookLoad: "Failed to load the specified notebook. A new notebook template will be presented instead.",
			failedNotebookParse: "The loaded notebook appears to have a syntax error and will probably not run as is.",
			exportAllLinks: "<ul><li>open notebook in <a href='{0}'>current window</a> or a <a href='{0}' target='_blank'>new window</a></li><li>view <a href='#' onclick='{1}' target='_blank'>raw notebook code</a> in new window</li></ul>",
			originalJson: "Original JSON string",
			exportJson: "Spiral Notebook data format (JSON)",
			exportHtml: "HTML (suitable for saving or printing)",
			editsAndLeaving: "It looks like you've been editing content and you will lose any content if you follow this link. Continue?",
			fetchingNotebook: "Fetching notebook…",
			openTip: "Open a Spiral Notebook (by pasting in JSON code).",
			newTip: "Create a new Spiral Notebook in a new window.",
			runallTip: "Run all code blocks in this notebook"
    	},
    	api: {
    		input: undefined
    	},
    	
    	currentBlock: undefined,
 
    	getDeferred: function() {
    		return Voyant.application.getDeferred();
    	},
    	
    	getDataFromBlock: function(where) {
    		if (Voyant.notebook.Notebook.currentBlock) {
    			var previous = Voyant.notebook.Notebook.currentBlock;
    			while(previous) {
    				previous = previous.previousSibling();
    				if (previous.isXType("notebookcodeeditorwrapper") && previous.editor.getMode()!='ace/mode/javascript') {
    					return previous.getContent().input;
    				}
    			}
    		}
    		showError("Unable to find data to load");
    	},
    	
    	loadDataFromUrl: function(url, config) {
    		var dfd = Voyant.application.getDeferred();
    		var params = {
       		     url: Voyant.application.getTromboneUrl(),
    		     params: {
    		    	 fetchData: url
    		     }
    		}
    		if (config && config.format) {params.format = config.format}
    		Ext.Ajax.request(params).then(function(response, opts) {
    			 if (config && config.format) {
    				 if (config.format.toLowerCase()=='json') {
    					 return dfd.resolve(Ext.decode(response.responseText))
    				 } else if (config.format.toLowerCase()=='xml') {
    					 parser = new DOMParser();
    					 xmlDoc = parser.parseFromString(response.responseText,"text/xml");
    					 return dfd.resolve(xmlDoc)
    				 }
    			 }
    			 dfd.resolve(response.responseText);
    		 },
    		 function(response, opts) {
    			 debugger
    			 dfd.reject(response.responseText);
    		     console.log('server-side failure with status code ' + response.status);
    		 });
    		
    		return dfd.promise;
    	}
    	
    },
    config: {
    	metadata: {},
    	version: 2.0,
    	isEdited: false
    },
    
    docs: {
    	"!name": "Voyant"
    },
    
    constructor: function(config) {
    	config = config || {};
    	var me = this;
    	var libs = ["Corpus"];
    	this.docsLoading = libs.length;
    	libs.forEach(function(lib) {
    		 Ext.Ajax.request({
    			 url: this.getBaseUrl()+"docs/ace/"+lib+".json",
    			 scope: this
    		 }).then(function(response, opts) {
    		     var docs = Ext.decode(response.responseText);
    		     var moreTemplate = new Ext.XTemplate("<a href='../../docs/#!/api/"+lib+"{0}'>more…</a>");
    		     me.docs[lib] = {
	    	        "!type": "fn(config) -> Corpus",
	                "!url": "",
	                "!doc": docs.short_doc + moreTemplate.apply([])
    		     }
    		     docs.members.forEach(function(member) {
    		    	 if (!member['private'] && member.tagname=='method') {
			    		me.docs[lib][member.name] = {
				    	        "!type": "fn()",
				                "!url": "",
				                "!doc": member.short_doc + moreTemplate.apply(["-"+member.id])
			    		}
    		    	 }
    		     })
    		     me.docsLoading--;
    		 },
    		 function(response, opts) {
    		     console.log('server-side failure with status code ' + response.status);
    		 });

    	}, this)
    	
    	
    	Ext.apply(config, {
    		title: this.localize('title'),
    		includeTools: {
    			'help': true,
    			'save': true,
    			'open': {
    				tooltip: this.localize("openTip"),
    				callback: function() {
    					Ext.Msg.prompt(this.localize("openTitle"),this.localize("openMsg"),function(btn, text) {
    						text = text.trim();
    						if (btn=="ok") {
    							this.removeAll();
    							if (text.indexOf("http")==0) {
    								this.loadFromUrl(text);
    							} else {
    								this.loadBlocksFromString(text);
    							}
    						}
    					}, this, true);
    				},
    				xtype: 'toolmenu',
    				glyph: 'xf115@FontAwesome',
    				scope: this
    			},
    			'new': {
    				tooltip: this.localize("newTip"),
    				callback: function() {
    					this.openUrl(this.getBaseUrl()+"spiral/")
    				},
    				xtype: 'toolmenu',
    				glyph: 'xf067@FontAwesome',
    				scope: this
    			},
    			'runall': {
    				tooltip: this.localize("runallTip"),
    				callback: function() {
    					this.runAllCode();
    				},
    				xtype: 'toolmenu',
    				glyph: 'xf04e@FontAwesome',
    				scope: this
    			}
			 }
    	})
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
    },
    autoScroll: true,
    exportToolClick: function() {
    	var panel = this.up('panel');
		Ext.create('Ext.window.Window', {
			title: panel.localize("exportTitle"),
			modal: true,
			items: {
				xtype: 'form',
				items: [{
					xtype: 'radio',
					name: 'export',
					inputValue: 'html',
					checked: true,
					boxLabel: panel.localize('exportHtml')
				},{
					xtype: 'radio',
					name: 'export',
					inputValue: 'json',
					boxLabel: panel.localize('exportJson')
				}],
				buttons: [{
	            	text: panel.localize("cancelTitle"),
	            	ui: 'default-toolbar',
	                glyph: 'xf00d@FontAwesome',
	        		flex: 1,
	        		handler: function(btn) {
	        			btn.up('window').close();
	        		}
				},{
	            	text: panel.localize("exportTitle"),
					glyph: 'xf08e@FontAwesome',
	            	flex: 1,
	        		handler: function(btn) {
	        			var form = btn.up('form'), exportOption = form.getValues()['export'];
	        			if (exportOption=='json') {
	        				panel.exportAll()
	        			} else if (exportOption=='html') {
	        		    	var contents = "", type, content;
	        		    	this.items.each(function(item, i) {
	        		    		type = item.isXType('notebookcodeeditorwrapper') ? 'code' : 'text';
	        		    		content = item.getContent();
	        		    		contents += "<div id='vn-section-"+i+"'><a name='vn-section-"+i+"'></a>";
	        		    		if (type=='code') {
	        		    			contents += "<div class='notebook-code-editor ace-chrome'>"+item.getTargetEl().query('.ace_text-layer')[0].outerHTML+"</div>";
	        		    			if (content.mode=='javascript') {
		        		    			contents += "<div class='notebook-code-results'>"+content.output+"</div>";
	        		    			}
	        		    		} else {
	        		    			contents += "<div class='notebook-text-editor'>"+content+"</div>";
	        		    		}
	        		    		contents += "</div>";
	        		    	}, this)

	                        var myWindow = window.open();
	                        myWindow.document.write('<html><head>');
	                        myWindow.document.write('<title>Spiral Notebooks</title>');
	                        myWindow.document.write(document.getElementById("ace-chrome").outerHTML);
	                        myWindow.document.write(document.getElementById("voyant-notebooks-styles").outerHTML);
//	                        myWindow.document.write('<link rel="Stylesheet" type="text/css" href="http://dev.sencha.com/deploy/ext-4.0.1/resources/css/ext-all.css" />');
//	                        myWindow.document.write('<script type="text/javascript" src="http://dev.sencha.com/deploy/ext-4.0.1/bootstrap.js"></script>');
	                        myWindow.document.write('</head><body class="exported-notebook"><a href="http://voyant-tools.org/docs/#!/guide/spiral"><img src="data:image/png;base64,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"'+
	                        		' alt="Spiral Notebook" title="Spiral Notebook" style="float: right; padding-left: 1em; padding-right: 1em;"></a><article>');
	                        myWindow.document.write(contents);
	                        myWindow.document.write('</article></body></html>');
	                        myWindow.focus();
	        			}
	        			btn.up('window').close();
	        		},
	        		scope: panel
	            }]
			},
			bodyPadding: 5
		}).show()
    },
    
    init: function() {
    	if (this.docsLoading>0) {
    		var me = this;
    		return setTimeout(function() {
    			me.init();
    		}, 100);
    	}
    	var queryParams = Ext.Object.fromQueryString(document.location.search, true);
    	var isRun = Ext.isDefined(queryParams.run);
    	if (queryParams.input) {
    		if (queryParams.input.indexOf("http")===0) {
    			this.loadFromUrl(queryParams.input, isRun);
    		} else {
        		this.loadBlocksFromString(queryParams.input, isRun);
    		}
    	}
    	else {
    		var url = location.href.replace(location.hash,"").replace(location.search,''),
    			url = url.substring(url.indexOf("/spiral/")+8), // grab after notebook
    			urlParts = url.split("/"), notebook = urlParts.shift();
    		if (notebook && urlParts.length>1 && url.charAt(url.length-1)=='/') {url = url.slice(0, -1);} // remove trailing
    		if (!notebook || notebook=="new") {
    			this.loadData(undefined, isRun);
    		} else if (notebook=="gist") {
				return this.loadFromUrl(url, isRun);
    		} else {
    			// special compilation of a notebook series
    			if (url=='alta/' && queryParams && queryParams.all && queryParams.all=='true') {
        			this.loadFromUrl('alta/Start', isRun);
        			this.loadFromUrl('alta/Create', isRun);
        			this.loadFromUrl('alta/SmallerCorpus', isRun);
        			this.loadFromUrl('alta/Tables', isRun);
    			} else {
        			this.loadFromUrl(url, isRun);
    			}
    		}
    	}
    	
    	var me = this;
	    window.addEventListener("beforeunload", function (e) {
	        if (me.getIsEdited()) {
		        var confirmationMessage = me.localize('editsAndLeaving');
		        (e || window.event).returnValue = confirmationMessage; //Gecko + IE
		        return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
	        } else {
	        	return undefined
	        }
	    });
    },
    listeners: {
    	boxready: function() {
    		this.init();
    	},
    	
    	notebookWrapperMoveUp: function(wrapper) {
    		var i = this.items.findIndex('id', wrapper.id);
    		if (i==0) {
    			Ext.Msg.show({
    				title: this.localize('error'),
    				msg: this.localize('cannotMoveHigher'),
    				buttons: Ext.MessageBox.OK,
    				icon: Ext.MessageBox.WARNING
    			});
    		}
    		else {
    			this.move(i, i-1);
        		this.redoOrder();
    		}
    	},
    	
    	notebookWrapperMoveDown: function(wrapper) {
    		var i = this.items.findIndex('id', wrapper.id);
    		if (i==this.items.getCount()-1) {
    			Ext.Msg.show({
    				title: this.localize('error'),
    				msg: this.localize('cannotMoveLower'),
    				buttons: Ext.MessageBox.OK,
    				icon: Ext.MessageBox.WARNING
    			});
    		}
    		else {
    			this.move(i, i+1);
        		this.redoOrder();
    		}
    	},
    	
    	notebookWrapperRemove: function(wrapper) {
    		this.remove(wrapper);
    		this.redoOrder();
    	},
    	
    	notebookWrapperRun: function(wrapper) {
    	},

    	notebookWrapperAdd: function(wrapper, e) {
    		var i = this.items.findIndex('id', wrapper.id);
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
    	}

    },
    
    redoOrder: function() {
    	this.query("notebookwrappercounter").forEach(function(counter, i) {
    		counter.setOrder(i);
    	})
    },
    
    loadFromUrl: function(url, isRun) {
    	var me = this;
		if (url.indexOf("https://gist.github.com/")==0 || url.indexOf("https://gist.githubusercontent.com/")==0) {
			url = "gist"+url.substring(url.indexOf(".com")+4, url.length - (url.charAt(url.length-1) == "/" ? 1 : 0));
		}
		if (url.indexOf("gist/")==0) {
			var gistParts = url.substring(5).split("/");
			if (gistParts.length<2) {
				return this.showError(this.localize("invalidGistUrl"));
			}
			if (gistParts[2] && gistParts[2]=="raw") {
				gistParts.splice(2,1); // remove raw
			}
			
			var gistUrl = "gist/"+gistParts.slice(0,3).join("/");
			window.history.pushState({
				url: url
			}, "Spiral Notebook: "+gistUrl, this.getBaseUrl()+"spiral/"+gistUrl);
			url = "https://gist.githubusercontent.com/"+gistParts.slice(0,2).join("/")+"/raw/"+(gistParts[2] ? gistParts[2] : "");
		} else if (url.indexOf("http")==0) {
			window.history.pushState({
				url: url
			}, "Spiral Notebook: "+url, this.getBaseUrl()+"spiral/?input="+url);
		}
		
    	me.mask(this.localize("fetchingNotebook"))
    	 Ext.Ajax.request({
    	     url: this.getTromboneUrl(),
    	     params: {
    	    	 tool: 'notebook.NotebookManager',
    	    	 notebook: url
    	     },
    	     scope: this
    	 }).then(function(response, opts) {
    		 me.unmask();
    	     var data = Ext.decode(response.responseText);
    		 me.loadBlocksFromString(data.notebook.jsonData, isRun);
    	 },
    	 function(response, opts) {
    		 me.showResponseError("Unable to load specified notebook: "+url, response);
    		 me.unmask();
    		 me.loadData()
    	 });
    },
    
    loadData: function(data, isRun) {
    	if (!data) {
    		data = {
    			blocks: [{
    				type: 'text',
    				input: "<h1 style='text-align: center;'>Spiral Notebook Template (title)</h1><p>This is a Spiral Notebook, a dynamic document that combines writing, code and data in service of reading, analyzing and interpreting digital texts.</p><p>Spiral Notebooks are composed of text blocks (like this one) and code blocks (like the one below). You can <span class='marker'>click on the blocks to edit</span> them and add new blocks by clicking add icon that appears in the left column when hovering over a block.</p>"
    			},{
    				input: 'new Corpus("Hello Spiral!").show();',
    		        output: [
    		                   " <div class=\"info\">This corpus has 1 document with 2 <span class=\"info-tip\" data",
    		                   "-qtip=\"every occurrence of every word (like multiple occurrences of &quot;the&qu",
    		                   "ot;) is counted\">total words</span> and 2 <span class=\"info-tip\" data-qtip=\"mult",
    		                   "iple occurrences of words (like &quot;the&quot;) are counted once\">unique word f",
    		                   "orms</span>. Created <span class=\"info-tip\" data-qtip=\"2016-05-07, 15:51:18\">abo",
    		                   "ut 26 days ago</span>.</div>"
    		        ]
    			}]
    		}
    	}
    	if (Ext.isString(data) || Ext.isArray(data)) {
    		data = {blocks: data}
    	}
    	if (Ext.isObject(data)) {
    		if (!("metadata" in data)) {
    			data.metadata = {
    					created: new Date().getTime() // others will be set later as needed
    			}
    		}
			this.setMetadata(data.metadata);
        	Ext.Array.from(data.blocks).forEach(function(block) {
        		if (block) {
            		if (Ext.isString(block) && block!='') {this.addCode({input: block});}
            		else if (block.input) {
                		if (block.type=='text') {this.addText(block);}
                		else {
                			if (isRun) {block.output="";}
                			this.addCode(block);
                		}
            		}
        		}
        	}, this);
        	if (document.location.hash) { // try to handle anchors in URL
        		setTimeout(function() {
            		var el = document.body.querySelector(location.hash);
            		if (el) {
            			el.scrollIntoView();
            			setTimeout(function() {
                			Ext.get(el.parentElement).frame().frame();
            			}, 200);
            		}
        		}, 200)
        	}
    	} else {
    		this.showError("Unable to load Notebooks data.");
    		console.warn(data);
    	}
    	if (isRun) {
    		this.runAllCode();
    	}
    },
    
    loadBlocksFromString: function(string, isRun) {
    	if (/^\s*[\[\{]/m.test(string)) {
    		var json = undefined;
    		try {
    			json = jQuery.parseJSON(string);
    		}
    		catch (e) {
    			Ext.create("Voyant.util.DetailedError", {
					msg: this.localize("failedNotebookParse"),
					error: e.message,
					details: e.stack+"\n\n"+this.localize("originalJson")+": "+string
				}).showMsg()
    		}
    		this.loadData(json, isRun)
    	}
    	else {
    		this.loadData(string, isRun); // treat as single content block
    	}
    },
    
    addText: function(block, order) {
    	return this._add(block, order, 'notebooktexteditorwrapper');
    },
 
    addCode: function(block, order) {
    	return this._add(block, order, 'notebookcodeeditorwrapper');
    },
    
    _add: function(block, order, xtype) {
    	if (Ext.isString(block)) {
    		block = {input: block}
    	}
    	order = (typeof order === 'undefined') ? this.items.getCount() : order;
    	return this.insert(order, Ext.apply(block, {
    		xtype: xtype,
    		order: order,
    		docs: xtype == 'notebookcodeeditorwrapper' ? this.docs: undefined
    	}))
    },
    
    runAllCode: function(upToCmp) {
    	var containers = [];
    	Ext.Array.each(this.query("notebookcodeeditorwrapper"), function(item) {
			containers.push(item);
			item.clearResults();
    		if (upToCmp && upToCmp==item) {return false;}
    	}, this);
    	this._runCodeContainers(containers);
    },
    
    _runCodeContainers: function(containers) {
    	if (containers.length>0) {
        	if (Voyant.application.getDeferredCount()==0) {
        		var container = containers.shift();
        		container.run(true);
        	}
        	Ext.defer(this._runCodeContainers, 100, this, [containers]);
    	}
    },
    
    exportAll: function() {
    	var blocks = [], maxLen=70, block, type, content, output;
    	this.items.each(function(item) {
    		type = item.isXType('notebookcodeeditorwrapper') ? 'code' : 'text';
    		content = item.getContent();
    		if (type=='code') { 
    			if (/[\r\n]/.test(content.input)) {content.input = content.input.replace(/\r\n?/, "\n").split(/\n/)}
        		block = {
        			type: 'code',
        			input: content.input,
        			mode: content.mode,
        			output: this.wrap(content.output)
        		}
    		} else {
        		block = {
        			type: 'text',
        			input: this.wrap(content)
        		}
    		}
    		blocks.push(block)
    	}, this)
    	
    	// if we have one code block, just show the code
    	if (blocks.length==1 && blocks[0].type=='code') {
    		blocks = blocks[0].input
    	}
    	
    	var metadata = this.getMetadata();
    	Ext.applyIf(metadata, {
    		created: new Date().getTime(),
    		modified: new Date().getTime(),
    		version: this.getVersion()
    	})
    	
    	var data = {
    		metadata: metadata,
    		blocks: blocks
    	}

    	Ext.Msg.prompt("Export Notebook", "Currently only copying and pasting the notebook is available. You can select all the contents of the box below and copy to the clipboard.", undefined, undefined, true, JSON && JSON.stringify ? JSON.stringify(data, undefined, 4) : Ext.encode(data))
    	
//    	var url = "./?input=" + encodeURIComponent(Ext.encode(blocks));
//    	var openurl = "window.open().document.write(unescape('"+escape(Ext.encode(blocks))+"')); return false";
//    	Ext.Msg.alert('', new Ext.Template(this.localize('exportAllLinks')).apply([url,openurl]));
    	
    },
    
    wrap: function(content) {
    	content = content || "";
    	var maxLen = 80;
    	if (content && content.length>maxLen) {
			var contents = [];
			for (var i=0, len=Math.ceil(content.length/maxLen); i<len; i++) {
				contents.push(content.substr(i*maxLen, maxLen))
			}
			content = contents
    	}
    	return content;
    }
    
    
    
})