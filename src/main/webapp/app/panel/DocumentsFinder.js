Ext.define('Voyant.panel.DocumentsFinder', {
	extend: 'Ext.grid.Panel',
	require: ['Voyant.data.store.DocumentQueryMatches','Ext.grid.plugin.CellEditing'],
	mixins: ['Voyant.panel.Panel'/*,'Voyant.util.Localization'*/],
	alias: 'widget.documentsfinder',
    statics: {
    	i18n: {
    	}
    },

    constructor: function(config) {
    	
        this.cellEditing = Ext.create("Ext.grid.plugin.CellEditing", {
            clicksToEdit: 1
        });

        this.cellEditing.on('edit', this.onEditComplete, this);
    	
    	var me = this;
    	
    	Ext.apply(this, {
    		title: this.localize('title'),
    		emptyText: this.localize("emptyText"),
    		plugins: [this.cellEditing],
    		bbar: [
    		       {
                       text: this.localize('addRow'),
                       glyph: 'xf055@FontAwesome',
                       handler: this.addRow,
                       scope: this
    		       },{
                       text: this.localize('exportNewCorpus'),
                       disabled: true,
                       glyph: 'xf08e@FontAwesome',
                       tooltip: this.localize('exportNewCorpusTip'),
                       handler: function() {
                    	   var query = this.getQueryFromStore();
                    	   if (query) {
                    		   this.setLoading(true);
	   	               			var documentQueryMatches = this.getCorpus().getDocumentQueryMatches();
		            			documentQueryMatches.load({
		            				params: {query: query, createNewCorpus: true},
		            				callback: function(records, operation, success) {
		                     		   this.setLoading(false);
		            					if (success) {
		            						var corpus = operation.getProxy().getReader().rawData.documentsFinder.corpus;
		            						var url = this.getBaseUrl()+'?corpus='+corpus;
		                         		   Ext.Msg.alert({
		                        			   title: this.localize('title'),
		                        			   message: "<a href='"+url+"' target='_blank'>New Corpus</a>"
		                        		   })
		            					}
		            					else {
		            						Ext.create("Voyant.util.ResponseError", {
		            							msg: this.localize("unsuccessfulQuery"),
		            							response: operation.getError().response
		            						}).show();
		            					}
		            				},
		            				scope: this
		            			})
                    		   
                    	   }
                    	   else {
                    		   Ext.Msg.alert({
                    			   title: this.localize('title'),
                    			   message: this.localize('noMatches')
                    		   })
                    	   }
                       },
                       scope: this,
                       cls: 'exportBtn'
    		       },{
    		    	   xtype: 'tbtext',
    		    	   name: 'status',
    		    	   cls: 'status'
    		       }
    		],
	    	columns:[
 	    	    {
	    	        text: this.localize('query'),
	    	        dataIndex: 'query',
	    	        renderer: function(value) {
	    	        	return Ext.isEmpty(value) ? '<span class="placeholder">'+me.localize('emptyQuery') + '</span>' : value;
	    	        },
	    	        editor: true,
	    	        minWidth: 150,
	    	        maxWidth: 300
	    	    },{
	    	        text: this.localize('field'),
	    	        dataIndex: 'field',
	    	        editor: {
	    	        	xtype: 'combo',
	                    typeAhead: true,
	                    triggerAction: 'all',
	                    forceSelection: true,
	                    value: '',
	                    valueField: 'value',
	                    listeners: {
	                    	change:function() {
	                    	  if (Ext.isEmpty(this.getValue())) {
		                    	    this.reset();
		                    	  }
		                    	}
	                    },
	                    store: new Ext.data.Store({
	                        fields: ['text','value'],
	                		data: [[this.localize('textField'),'text'],[this.localize('advancedField'),'advanced']]
	                    })
	    	        },
	    	        width: 150,
                    renderer: function(v) {return Ext.isEmpty(v) ? '' : me.localize(v+"Field")}
	    	    },{
	    	        text: this.localize('operator'),
	    	        dataIndex: 'operator',
	    	        editor: {
	    	        	xtype: 'combo',
	                    forceSelection: true,
	                    store: new Ext.data.Store({
	                        autoDestroy: true,
	                        fields: ['text','value'],
	                        displayField:  'text',
	                        valueField: 'value',
	                		data: [{text:'AND',value:'+'},{text:'OR',value:''}]
	                    })
	    	        },
	    	        minWidth: 75,
	    	        maxWidth: 75
	    	    },{
	    	        text: this.localize('count'),
	    	        dataIndex: 'count',
	    	        renderer: function(value, metadata, record) {
	    	        	return Ext.isEmpty(record.get('query')) ? '' : Ext.util.Format.number(value, '0,000')
	    	        },
	    	        minWidth: 100,
	    	        maxWidth: 100
	    	    },{
	    	    	xtype: 'actioncolumn',
	                width: 25,
	                sortable: false,
	                menuDisabled: true,
	                width: 25,
	                getGlyph: 'xf014@FontAwesome',
	                tooltip: this.localize('deleteQueryTip'),
	                menuDisabled: true,
	                sortable: false,
	                handler: this.removeRow,
	                scope: this
	    	    }
	    	],
	    	
	    	store: new Ext.data.Store({
                // destroy the store if the grid is destroyed
                autoDestroy: true,
                fields: ['id','operator','field','query','count'],
	    		data: [['','','','',0]]
            })
      	});
    			
        this.callParent(arguments);
        
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
        
  
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		var docs = corpus.getDocuments();
    		if (docs && docs.getCount()>0) {
    			var doc = docs.getDocument(0);
    			var records = [];
    			["title","author","pubDate","publisher","pubPlace"].forEach(function(field) {
    				if (!Ext.isEmpty(doc.get(field))) {
    					records.push([this.localize(field+'Field'),field])
    				}
    			}, this);
    			if (records) {
    				var editor = this.getColumnManager().getHeaderByDataIndex("field").getEditor();
    				var store = editor.getStore();
    				store.each(function(record) {
    					records.push([record.get('text'), record.get('value')]);
    				}, this);
    				editor.setStore(Ext.create("Ext.data.Store",{
    					fields: ['text','value'],
    					data: records
    				}))
    			}
    			this.updateStatus(0);
    			this.setLoading(false);
    		}
    	})
    	
    },
    
    removeRow:function(grid, rowIndex) {
    	this.getStore().removeAt(rowIndex);
    	if (this.getStore().getCount()==0) {this.addRow();}
    	this.updateAggregate();
    },
    
    addRow: function() {
    	this.store.loadData([['','','','',0]], true);
    },
    
    onEditComplete: function(editor, context) {
    	
    	
    	var query = this.getQueryFromRecord(context.record);
		if (Ext.isEmpty(query)) {
			context.record.set('count','');
			this.updateAggregate();
		}
		else {
			var cell = context.view.getCell(context.record, this.getColumnManager().getHeaderByDataIndex("count"));
			cell.mask("loading");
			var documentQueryMatches = this.getCorpus().getDocumentQueryMatches();
			documentQueryMatches.load({
				params: {
					query: query
				},
				callback: function(records, operation, success) {
					cell.unmask();
					if (success) {
						context.record.set('count', records.length==0 ? 0 : records[0].get('count'))
					}
					else {
						Ext.create("Voyant.util.ResponseError", {
							msg: this.localize("unsuccessfulQuery"),
							response: operation.getError().response
						}).show();
						context.record.set('count',0);
					}
					this.updateAggregate();
				},
				scope: this
			})
		}

    },
    
    getQueryFromRecord: function(record) {
		if (Ext.isEmpty(record) || Ext.isEmpty(record.get('query'))) {return ""}
		var query = record.get('query').trim();
		if (Ext.isEmpty(query)) {return ""}
		var field = record.get('field');
		return Ext.isEmpty(field ? field.trim() : field) ? query : field+":"+query
    },
    
    getQueryFromStore: function() {
    	var query = "";
 		this.getStore().each(function(record) {
 			var q = this.getQueryFromRecord(record);
 			if (!Ext.isEmpty(q)) {
 				if (!Ext.isEmpty(query)) {
 					var op = record.get('operator');
 					query += op== 'AND' ? ' + ' : ' | '
 				}
 				query+=q
 			}
 		}, this)
 		console.warn(query)
 		return query;
    },
    
    updateAggregate: function() {
    	var count = this.getStore().sum('count');
    	if (!count || typeof count == 'string') {
    		this.updateStatus(0);
    	}
    	else if (count==1) {
    		var count = this.getStore().getAt(0).get('count');
    		this.updateStatus(this.getStore().getAt(0).get('count'))
    	}
    	else {
    		
    		var query = this.getQueryFromStore();
    		if (!Ext.isEmpty(query)) {
            	if (!this.status) {this.status=this.down("[cls~=status]")} // make sure we have status for masking
    			this.status.mask(this.localize("loading"));
    			var documentQueryMatches = this.getCorpus().getDocumentQueryMatches();
    			documentQueryMatches.load({
    				params: {query: query},
    				callback: function(records, operation, success) {
    					
    					this.status.unmask();
    					if (success) {
    						this.updateStatus(records[0].get('count'));
    					}
    					else {
    						Ext.create("Voyant.util.ResponseError", {
    							msg: this.localize("unsuccessfulQuery"),
    							response: operation.getError().response
    						}).show();
    						this.updateStatus(0);
    					}
    				},
    				scope: this
    			})
    		}
    	}
    },
    
    updateStatus: function(count) {
    	if (!this.status) {this.status=this.down("[cls~=status]")}
    	if (!this.exportBtn) {this.exportBtn=this.down("[cls~=exportBtn]")}
    	if (count==0) {
        	this.status.update(new Ext.XTemplate(this.localize('noMatches')).apply([this.getCorpus().getDocumentsCount()]))
    	}
    	else {
    		this.status.update(new Ext.XTemplate(this.localize('queryMatches')).apply([count,this.getCorpus().getDocumentsCount()]))
    	}
    	this.exportBtn.setDisabled(count==0);
    	
    }
    
})