Ext.define('Voyant.panel.DToC.MarkupCurator', {
	extend: 'Ext.grid.Panel',
	requires: [],
	mixins: ['Voyant.panel.DToC.MarkupBase', 'Voyant.panel.Panel'],
	alias: 'widget.dtocMarkupCurator',
    config: {
    	corpus: undefined
    },
    statics: {
    	i18n: {
    		title: "Tags"
    	},
        api: {
        }
    },
    
	allTagsHashMap: {},
	
	disabledTags: {},
	
    
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	this.mixins['Voyant.panel.DToC.MarkupBase'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
    	var tagStore = Ext.create('Ext.data.JsonStore', {
			fields: [
				{name: 'tagName', allowBlank: false},
				{name: 'label', allowBlank: false},
				{name: 'type'},
				{name: 'usage'}
			],
			sortInfo: {field: 'label', direction: 'ASC'},
			data: [],
			listeners: {
				datachanged: function(store) {
					for (var i = 0, len = store.getCount(); i < len; i++) {
						var r = store.getAt(i);
						if (r.get('type') === 't') {
							this.disabledTags[r.get('tagName')] = true;
						}
					}
				},
				scope: this
			}
		});
		
    	this.tagCombo = Ext.create('Ext.form.field.ComboBox', {
			xtype: 'combo',
			triggerAction: 'all',
			queryMode: 'local',
			editable: true,
			allowBlank: false,
			autoSelect: false,
			store: new Ext.data.ArrayStore({
			    idIndex: 0,
				fields: ['tag', 'disabled']
			}),
			tpl: '<tpl for=".">'+
					'<tpl if="disabled == false">'+
						'<li role="option" unselectable="on" class="x-boundlist-item">{tag}</li>'+
					'</tpl>'+
					'<tpl if="disabled == true">'+
					'<li role="option" unselectable="on" class="x-boundlist-item disabled">{tag}</li>'+
					'</tpl>'+
				'</tpl>',
			valueField: 'tag',
			displayField: 'tag',
			listeners: {
				beforeselect: function(combo, record, index) {
					return !record.get('disabled');
				},
				scope: this
			}
		});
		
		this.usageCombo = Ext.create('Ext.form.field.ComboBox', {
			xtype: 'combo',
			triggerAction: 'all',
			queryMode: 'local',
			editable: true,
			allowBlank: true,
			autoSelect: false,
			forceSelection: true,
			store: new Ext.data.ArrayStore({
			    idIndex: 0,
				fields: ['type', 'label'],
				data: [['image', 'Image'], ['note', 'Note'], ['link', 'Link']]
			}),
			valueField: 'type',
			displayField: 'label'
		})
    	
		Ext.apply(this, {
			plugins: {
				ptype: 'cellediting',
				pluginId: 'cellEditor'
			},
			store: tagStore,
			forceFit: true,
			dockedItems: [{
			    xtype: 'toolbar',
			    dock: 'bottom',
			    enableOverflow: true,
			    items: [{
    				xtype: 'button',
    				text: 'Add',
    				glyph: 'xf067@FontAwesome',
    				handler: function(b) {
    					this.store.loadData([{
    						tagName: '',
    						label: '',
    						freq: 0,
    						type: 't'
    					}], true);
    					var numRecords = this.store.getCount();
    					this.getPlugin('cellEditor').startEditByPosition({row: numRecords-1, column: 0});
    				},
    				scope: this
    			},' ',{
    				xtype: 'button',
    				text: 'Remove',
    				glyph: 'xf068@FontAwesome',
    				handler: this.doRemoveSelections,
    				scope: this
    			},' ',{
    				xtype: 'button',
    				text: 'Show',
    				glyph: 'xf002@FontAwesome',
    				handler: this.doShowSelections,
    				scope: this
    			},' ',{
    			    xtype: 'button',
    			    text: 'Import/Export',
    			    menu: {
    			        plain: true,
    			        items: [{
                            xtype: 'button',
                            text: 'Import',
                            handler: this.showImportWindow,
                            scope: this
                        },'-',{
                            xtype: 'button',
                            text: 'Export',
                            handler: function(b) {
                                var data = this.exportTagData();
                                var output = '';
                                for (var i = 0; i < data.length; i++) {
                                    var e = data[i];
                                    output += e.tagName+'\t'+e.label+'\n';
                                }
                                
                                Ext.Msg.show({
                                    title: 'Export',
                                    message: 'Curated tags in TSV format, for export:',
                                    buttons: Ext.MessageBox.OK,
                                    value: output,
                                    multiline: true,
                                    width: Ext.getBody().getWidth()-50,
                                    icon: Ext.MessageBox.INFO
                                });
                            },
                            scope: this
                        }]
    			    }
    			}]
			}],
			viewConfig: {
				stripeRows: true
			},
			selModel: Ext.create('Ext.selection.RowModel', {
				mode: 'MULTI'
			}),
			columns:[{
				header: 'Tag/Path', dataIndex: 'tagName',
				editor: this.tagCombo
			},{
				header: 'Label', dataIndex: 'label',
				editor: {
					xtype: 'textfield',
				    allowBlank: false
				}
			},{
				header: 'Usage', dataIndex: 'usage',
				editor: this.usageCombo
			}],
			listeners: {
				edit: function(editor, e) {
					if (e.field == 'tagName') {
						// determine whether tag or xpath
						var type = e.value.match(/^\w+$/) == null ? 'x' : 't';
						e.record.set('type', type);

						var comboStore = this.tagCombo.getStore();
						var r = comboStore.findRecord('tag', e.value);
						if (r !== null) r.set('disabled', true);
						r = comboStore.findRecord('tag', e.originalValue);
						if (r !== null) r.set('disabled', false);
					}
				},
				scope: this
			}
		});
		
		this.getAllTags();
		
		this.callParent(arguments);
    },
    
    getAllTags: function() {
    	if (this.getCorpus() === undefined) {
    		this.setCorpus(this.getApplication().getCorpus());
    	}
    	
		var me = this;
		var currDocIndex = 0;
		
		function getDocument(index) {
			if (index < me.getCorpus().getDocumentsCount()) {
				currDocIndex++;
				var docId = me.getCorpus().getDocument(index).getId();
				var params = {
					tool: 'corpus.RawDocumentExporter',
					corpus: me.getCorpus().getId(),
					outputFormat: 'xml',
					docId: docId
				};
				Ext.Ajax.request({
		           url: me.getTromboneUrl(),
		           params: params,
		           success: function(response, options) {
		        	   if (response.responseXML == null) {
		        		   // xml parse error
		        	   } else {
			        	   var docBody = Ext.dom.Query.selectNode('div', response.responseXML);
			        	   var tags = Ext.dom.Query.select('*', docBody);
			        	   for (var i = 0; i < tags.length; i++) {
			        		   var tag = tags[i];
			        		   var nodeName = tag.nodeName;
			        		   this.allTagsHashMap[nodeName] = true;
			        	   }
		        	   }
		        	   getDocument(currDocIndex);
		           },
		           scope: me
		        });
			} else {
				var data = [];
				for (var tag in me.allTagsHashMap) {
					data.push([tag, me.disabledTags[tag] != null]);
				}
				data.sort();
				me.tagCombo.getStore().loadData(data, false);
			}
			
		}
		
		getDocument(currDocIndex);
		
	},
	
	doRemoveSelections: function() {
	    var selections = this.getSelection();
	    if (selections.length > 0) {
	        Ext.Msg.confirm('Remove Selections', 'Do you really want to remove the selected entries?',
	            function(button) {
	                if (button === 'yes') {
	                    var comboStore = this.tagCombo.getStore();
	                    for (var i = 0; i < selections.length; i++) {
	                        var tagName = selections[i].get('tagName');
	                        delete this.disabledTags[tagName];
	                        var r = comboStore.findRecord('tag', tagName);
	                        if (r !== null) {
	                            r.set('disabled', false);
	                        }
	                    }
	                    this.store.remove(selections);
	                }
	            }.bind(this)
	        );
        } else {
            Ext.Msg.show({
                title: 'No Selections',
                message: 'You must select at least one entry to remove.',
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.INFO
            });
        }
	},
	
	doShowSelections: function(selections) {
	    var selections = this.getSelection();
	    
	    if (selections.length > 0) {
    		var waitForHits = false;
    		var waitTracker = 0;
    		var newTags = {};
    		var tags = [];
    		
    		function doDispatch(data) {
    			for (var tagName in data) {
    				var a = data[tagName];
    				if (a != null) {
    					tags = tags.concat([a]);
    				}
    			}
    			waitTracker--;
    			if (waitTracker == 0) {
    			    this.body.unmask();
    			    this._maskEl = null;
    				this.getApplication().dispatchEvent('tagsSelected', this, tags);
    			}
    		}
    		
    		for (var i = 0; i < selections.length; i++) {
    			var sel = selections[i].data;
    			for (var docId in this.savedTags) {
    				var tagData = this.savedTags[docId][sel.tagName];
    				if (tagData === undefined) {
    					waitForHits = true;
    					if (newTags[docId] == null) {
    						newTags[docId] = [];
    					}
    					newTags[docId].push(sel);
    				} else if (tagData !== null) {  // if it's null, then we've already checked this tag/xpath
    					if (tagData[0] && tagData[0].label != sel.label) {
    						// update label
    						for (var j = 0; j < tagData.length; j++) {
    							tagData[j].label = sel.label;
    						}
    					}
    					tags.push(tagData);
    				}
    			}
    		}
    		if (!waitForHits) {
    			this.getApplication().dispatchEvent('tagsSelected', this, tags);
    		} else {
    		    this._maskEl = this.body.mask('Fetching Selections', 'loadMask');
    			for (var docId in newTags) {
    				waitTracker++;
    				this.getHitsForTags(newTags[docId], docId, doDispatch);
    			}
    		}
	    } else {
	        Ext.Msg.show({
                title: 'No Selections',
                message: 'You must select at least one entry to show.',
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.INFO
            });
	    }
	},
	
	getHitsForTags: function(tagArray, docId, callback) {
		var customTagSet = {};
		for (var i = 0; i < tagArray.length; i++) {
			var t = tagArray[i];
			customTagSet[t.tagName] = t;
		}
		this._getDocumentXml(docId, function(html) {
			var tagData = this._parseTags(html, docId, customTagSet);
//			console.debug(tagData);
			for (var tagName in tagData) {
				var t = tagData[tagName];
				this.savedTags[docId][tagName] = t;
			}
			if (callback) callback.call(this, tagData);
		}.createDelegate(this));
	},
	
	_getDocumentXml: function(docId, callback) {
		var params = {
			tool: 'corpus.DocumentTokens',
			corpus: this.getCorpus().getId(),
			docId: docId,
			template: 'docTokens2textPlusTokenIds',
			outputFormat: 'xml',
			limit: 0
		};
		Ext.Ajax.request({
           url: this.getTromboneUrl(),
           params: params,
           success: function(response, options) {
				if (callback) callback(response.responseXML);
           },
           scope: this
        });
	},
	
	showImportWindow: function() {
	    Ext.Msg.show({
            title: 'Import Curation',
            message: 'Paste your curation.<br/>The expected format is TSV and each entry should contain the tag/path followed by the label.',
            buttons: Ext.Msg.OKCANCEL,
            buttonText: {
                ok: 'Import',
                cancel: 'Cancel'
            },
            icon: Ext.Msg.INFO,
            multiline: true,
            fn: function(btn, value, win) {
                if (btn == 'ok' && value != '') {
                    this.getApplication().setApiParam('curatorId', undefined);
                    
                    this.curatedTags = {};
                    this.tagTotals = {};
                    for (var docId in this.savedTags) {
                        this.savedTags[docId] = {};
                    }
                    
                    var tagData = [];
                    var entries = value.split('\n');
                    for (var i = 0; i < entries.length; i++) {
                        var entry = entries[i];
                        var values = entry.split('\t');
                        if (values.length == 2) {
                            var tag = values[0];
                            var label = values[1];
                            if (tag != '' && label != '') {
                                var type = tag.match(/^\w+$/) == null ? 'x' : 't';
                                var data = {
                                    tagName: tag,
                                    label: label,
                                    type: type
                                };
                                this.curatedTags[tag] = data;
                                tagData.push(data);
                            }
                        }
                    }
                    
                    this.store.loadData(tagData, false);
                    
                    // TODO fix tagCombo
//                    var comboStore = this.tagCombo.getStore();
//                    var r = comboStore.findRecord('tag', e.value);
//                    if (r !== null) r.set('disabled', true);
//                    r = comboStore.findRecord('tag', e.originalValue);
//                    if (r !== null) r.set('disabled', false);
                }
            },
            scope: this
        });
	}

});