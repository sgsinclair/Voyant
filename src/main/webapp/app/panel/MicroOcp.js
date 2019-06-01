Ext.define('Voyant.panel.MicroOcp', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.microocp',
    statics: {
    	i18n: {
    		title: "MicroOCP"
    	},
    	api: {
    		config: undefined,
    		stopList: 'auto',
    		uri: undefined
    	},
		glyph: 'xf1ea@FontAwesome'
    },
    config: {
    	editor: undefined
    },
    
    constructor: function(config) {
    	config = config || {};
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments); // we need api
		
		
	    var store = Ext.create('Ext.data.Store', {
	        fields: [{
	            name: 'cocoa',
	            type: 'string'
	        }]});
	    
	    var microocp = this;
    	Ext.apply(this, {
    		title: this.localize('title'),
    		layout: 'hbox',
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                groupId: 'tbar',
                items: [{
                	text: "Create New Voyant Corpus",
                	handler: function() {
                		var items = this.down('grid').getSelectionModel().getSelection().map(function(item) {return item.get("cocoa")});
              // items = ["one","one two","two"]
                		if (items.length==0) {
                			return this.showError({title: "Error", msg: "No items are selected in the grid (on the right)."})
                		}
                		// convert to map for faster lookup
                		itemsMap = {};
                		items.forEach(function(item) {itemsMap[item]=true})
                		
                		
						var str = this.getEditor().getValue();
               // str = "<one>this<one two>is<two>a</one>sentence<two> <one>another"
						var tags = /<(\/)?(\w+)(\s(\w+))?>/g;
						var matches;
						var tagsMap = {}
						while ((matches = tags.exec(str)) != null) {
							var isClose = matches[1]=="/", tag = matches[2], attr = matches[4],
								item = (matches[4] ? matches[2]+" "+matches[4] : matches[2]);
							if (isClose || item in itemsMap) {
								if (tag in tagsMap) {
									tagsMap[tag][tagsMap[tag].length-1].end = matches.index
								}
								if (!isClose) {
									if (!(tag in tagsMap)) {tagsMap[tag] = []}
									tagsMap[tag].push({
										start: matches.index+matches[0].length,
										tag: tag,
										attr: attr
									})
								}
							}
							else if (item in itemsMap) {
								if (tag in tagsMap) {
									tagsMap[tag][tagsMap[tag].length-1].end = matches.index
								}
							}
						}
						
                		// this should be more robust
                		isGroupItems = this.getDockedComponent(1).down('checkbox').checked;

                		var documents = [];
                		if (isGroupItems) {
                			var docs = {};
    						for (var tag in tagsMap) {
    							tagsMap[tag].forEach(function(entry,i) {
    								var text = str.substring(entry.start, entry.end).replace(/<\/?\w+(\s+\w)*>/g, "").trim();
    								if (text) {
    									var item = entry.tag+(entry.attr ? " "+entry.attr : "");
    									if (item in docs) {
    										docs[item]+= text;
    									} else {
    										docs[item] = text;
    									}
    								}
    							})
    						}
    						for (var item in docs) {
    							documents.push({
    								title: item,
    								text: docs[item]
    							})
    						}
                		} else {
    						for (var tag in tagsMap) {
    							tagsMap[tag].forEach(function(entry,i) {
    								var text = str.substring(entry.start, entry.end).replace(/<\/?\w+(\s+\w)*>/g, "").trim();
    								if (text) {
    									documents.push({
    										title: entry.tag+(entry.attr ? " "+entry.attr : "")+" "+(i+1),
    										text: text
    									})
    								}
    							})
    						}
                		}

                		if (documents.length==0) {
                			return this.showError({title: "Error", msg: "No documents found."})
						}
						
						this.mask();
						var progress = Ext.Msg.progress("Creating", "Creating new corpus.");
						// create new corpus
						var me = this;
						new Corpus({
							inputFormat: 'json',
							input: Ext.JSON.encode({documents: documents}),
							jsonDocumentsPointer: "/documents",
							jsonTitlePointer: "/title",
							jsonContentPointer: "/text"
						}).then(function (corpus) {
							progress.close();
							me.unmask();
							var app = me.getApplication();
							me.openUrl(app.getBaseUrl()+"?corpus="+corpus.getAliasOrId())
						});

                		
                	},
                	scope: this
                },{
                	xtype: 'checkbox',
                	boxLabel: "Combine documents with the same tag attribute.",
                	checked: true
                }]
            }],
    		items: [{
		        	xtype: 'panel',
    		    	autoScroll: true,
		        	flex: 1,
		        	height: '100%',
		        	align: 'stretch',
		        	header: false,
		        	listeners: {
		        		boxready: function() {
		        			var me = this;
		        			var editor = ace.edit(Ext.getDom(this.getEl()));
		        			microocp.setEditor(editor); // set to the containing panel
//		        			editor.setOptions({enableBasicAutocompletion: false, enableLiveAutocompletion: false});
//		        			editor.setTheme("ace/theme/monokai");
		        			editor.getSession().setMode("ace/mode/xml")
//		        			editor.$blockScrolling = Infinity;
//		        			editor.getSession().setUseWorker(true);
//		        			editor.setTheme(this.getTheme());
//		        			editor.getSession().setMode(this.getMode());
//		        			editor.setOptions({minLines: 6, maxLines: this.getMode().indexOf("javascript")>-1 ? Infinity : 10, autoScrollEditorIntoView: true, scrollPastEnd: true});
//		        			editor.setHighlightActiveLine(false);
		        			editor.renderer.setShowPrintMargin(false);
		        			editor.renderer.setShowGutter(false);
//		        			editor.setValue(this.getContent() ? this.getContent() : this.localize('emptyText'));
//		        			editor.clearSelection();
//		        		    editor.on("focus", function() {
//		        		    	me.getEditor().renderer.setShowGutter(true);
//		        		    }, this);
		        			editor.$blockScrolling = Infinity
		        			editor.setOptions({autoScrollEditorIntoView: true});
		        			editor.setBehavioursEnabled(false); // disable auto-complete
		        			editor.on("change", function(delta) {
		        				reparse = false;
		        				if (delta.action=="insert") {
		        					if (delta.lines[0].indexOf(">")==0) { // close tag
		        						reparse = true
		        					}
		        				} else if (delta.action=="remove") {
		        					for (var i=0; i<delta.lines.length; i++) {
		        						if (delta.lines[i].indexOf(">")>-1) {
		        							reparse = true;
		        							break;
		        						}
		        					}
		        				}
		        				if (reparse) {
		        					Ext.defer(function() {
		        						var str = editor.getValue();
		        						var tags = /<(\w+)(\s(\w+))?>/g;
		        						var matches;
		        						var expressions = {}
		        						while ((matches = tags.exec(str)) != null) {
		        							if (matches[3]) {expressions[matches[1]+" "+matches[3]]=true}
		        							else {expressions[matches[1]]=true}
		        						}
		        						
		        						var store = this.up("panel").down("grid").getStore();
		        						var inStoreItems = {};
		        						store.getRange().forEach(function(item) {inStoreItems[item.get("cocoa")]=true;});
		        						
		        						for (item in expressions) {
		        							if (!(item in inStoreItems)) {
		        								store.add({cocoa: item});
		        							}
		        						}
		        						for (inStoreItem in inStoreItems) {
		        							if (!(inStoreItem in expressions)) {
		        								var rec = store.findRecord("cocoa", inStoreItem)
		        								store.remove(rec);
		        							}
		        						}
		        						
		        						
		        					}, 100, me)
		        				}
		        			})
		        		}

		        	}
		        }, {
		        	xtype: 'grid',
		        	height: '100%',
		        	align: 'stretch',
    		    	autoScroll: true,
    		    	scrollable: true,

		        	width: 150,
		    		selModel: Ext.create('Ext.selection.CheckboxModel', {
		    			mode: 'SIMPLE'
		            }),
		            store: store,
		            columns: [ {
		                text: 'COCOA',
		                width: 100,
		                dataIndex: 'cocoa'
		            }]
		        }]
    	});

        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		if (this.getApiParam('uri')) {return;}
    		var me = this;
    		corpus.getPlainText().then(function(text) {
    			text = text.replace(/(\r\n|\r|\n)(\r\n|\r|\n)(\r\n|\r|\n)+/g,"\n\n")
    			var editor = me.getEditor();
    			editor.setValue(text).trim();
    			editor.scrollToLine(1, true, true, function () {});
    		})
    	}, this);
    	
    	this.on('afterrender', function(panel) {
    		Ext.Msg.alert("MicroOCP", "MicroOCP is an experimental prototype that is intended to give a taste of working with the COCOA markup format (COunt and COncordance on the Atlas). Cocoa tags are like switches, you can place one and that tag remains in effect until the next instance of the tag, which can have an optional attribute (single word). As an enhancement to COCOA, you can also close a tag.<pre>&lt;speaker jack&gt;I'm falling &lt;speaker jill&gt;down the hill.&lt;/speaker&gt;</pre>")
    		if (this.getApiParam("uri")) {
    			var me = this;
    			Notebook.loadDataFromUrl(this.getApiParam("uri")).then(function(data) {
    				me.getEditor().setValue(data);
    			})
    		}
    	});
    	
    	
    }
        
});
