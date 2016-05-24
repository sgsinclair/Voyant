Ext.define('Voyant.panel.Builder', {
	extend: 'Ext.panel.Panel',
	requires: [],
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.builder',
    config: {
    	corpus: undefined,
    	tableEditor: null,
    	toolsList: ["cirrus", "corpusterms", "bubblelines", "corpuscollocates", "microsearch", "streamgraph", "phrases", "documents", "summary", "trends", "scatterplot", "termsradio", "wordtree", "contexts", "documentterms", "reader", "knots", "collocatesgraph"]
    },
    statics: {
    	i18n: {
    	},
        api: {
        }
    },
    
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
    	Ext.apply(this, {
        	layout: 'border',
        	header: false,
            items: [{
            	region: 'center',
            	title: 'Layout',
            	tbar: [{
                    text: 'Cell',
                    menu: {
                        items: [{
                            text: 'Merge cells',
                            handler: function() { this.getTableEditor().merge(); },
                            scope: this
                        },{
                            text: 'Split cells',
                            handler: function() { this.getTableEditor().split(); },
                            scope: this
                        },{
							text: 'Remove tool',
							handler: function() { this.getTableEditor().removeTools(); },
							scope: this
                        }]
                    }
                },{
                    text: 'Row',
                    menu: {
                        items: [{
                            text: 'Insert row before',
                            handler: function() { this.getTableEditor().insertRow(true); },
                            scope: this
                        },{
                            text: 'Insert row after',
                            handler: function() { this.getTableEditor().insertRow(false); },
                            scope: this
                        },{
                            text: 'Delete row(s)',
                            handler: function() { this.getTableEditor().deleteRows(); },
                            scope: this
                        }]
                    }
                },{
                    text: 'Column',
                    menu: {
                        items: [{
                            text: 'Insert column before',
                            handler: function() { this.getTableEditor().insertCol(true); },
                            scope: this
                        },{
                            text: 'Insert column after',
                            handler: function() { this.getTableEditor().insertCol(false); },
                            scope: this
                        },{
                            text: 'Delete column(s)',
                            handler: function() { this.getTableEditor().deleteCols(); },
                            scope: this
                        }]
                    }
                },{
                	text: 'Export',
                	handler: function() {
                		var grid = this.getTableEditor().getGrid();
                		var numCols = grid[0].length;
                		var cells = [];
                		for (var y = 0; y < grid.length; y++) {
                			var row = grid[y];
                			for (var x = 0; x < row.length; x++) {
                				var cell = row[x];
                				if (cell.real) {
                					cells.push({
                						colspan: cell.colspan,
                						rowspan: cell.rowspan,
                						xtype: cell.xtype
                					});
                				}
                			}
                		}
                		var layoutString = encodeURI(Ext.JSON.encode({numCols: numCols, cells: cells}));
                		var params = {
                			layout: layoutString,
                			view: 'tableset',
                			debug: true
                		};
                		if (this.getCorpus()) {
                			params.corpus = this.getCorpus().getId();
                		}
                		var exportString = this.getBaseUrl()+'?'+Ext.Object.toQueryString(params);
                		
                		
                		var panel = this;
                		Ext.create('Ext.window.Window', {
                			title: panel.localize("exportTitle"),
                			modal: true,
                			items: {
                				xtype: 'form',
                				items: [{
                					html: '<span><a href="'+exportString+'" target="_blank">Click to open in new window</a></span>'
                				}],
                				buttons: [{
                	            	text: 'Ok',
                	        		flex: 1,
                	        		handler: function(btn) {
                	        			btn.up('window').close();
                	        		}
                				}]
                			},
                			bodyPadding: 5
                		}).show();
                		
                	},
                	scope: this
                }],
            	layout: 'fit',
            	items: [{
            		id: 'tableParent',
            		margin: 10,
            		html: '<table class="builder"><tbody>'+
            		'<tr><td><br/></td><td><br/></td></tr>'+
            		'<tr><td><br/></td><td><br/></td></tr>'+
            		'</tbody></table>'
            	}]
            },{
            	region: 'west',
            	title: 'Tools',
            	width: 300,
            	split: true,
            	tbar: [{
            		text: 'Add tool to cell',
            		handler: function() {
            			var selTool = Ext.getCmp('toolsList').getSelectionModel().getSelection()[0];
            			if (selTool !== undefined) {
            				this.getTableEditor().addTool(selTool);
            			}
            		},
            		scope: this
            	}],
            	items: [{
            		id: 'toolsList',
            		xtype: 'dataview',
            		store: new Ext.data.JsonStore({
                		fields: ['xtype', 'title', 'tooltip', 'glyph']
                	}),
            		itemSelector: '.listTool',
            		overItemCls: 'over',
	            	selectedItemCls: 'selected',
            		emptyText: 'No tools',
            		tpl: ['<tpl for=".">',
        					'<div class="listTool">',
        						'<span>{title}</span>',
        					'</div>',
    				'</tpl>'],
    				listeners: {
    					boxready: function(toolsList) {
    						var toolConfigs = [];
    				    	this.getToolsList().forEach(function(tool, index) {
    				    		var config = this.getApplication().getToolConfigFromToolXtype(tool);
    				    		toolConfigs.push(config);
    				    	}, this);
    				    	toolsList.getStore().loadData(toolConfigs);
    				    	toolsList.getStore().sort('title', 'ASC');
    				    	
    				    	// DD
    				    	var overrides = {
				    			b4StartDrag: function(x, y) {
				    		        this.showFrame(x, y);
				    		        var lel = this.getEl(),
				    	            	del = this.getDragEl();
				    		        del.textContent = lel.textContent;
				    		    },
				    	        onInvalidDrop: function() {
				    	            this.invalidDrop = true;
				    	        },
				    	        endDrag: function() {
				    	        	var lel = this.getEl(),
					    	            del = this.getDragEl();
	
					    	        del.style.visibility = "";
	
					    	        this.beforeMove();
					    	        lel.style.visibility = "hidden";
					    	        if (this.invalidDrop) {
					    	        	
					    	        } else {
					    	        	
					    	        }
					    	        del.style.visibility = "hidden";
					    	        lel.style.visibility = "";
	
					    	        this.afterDrag();
					    	        
					    	        delete this.invalidDrop;
				    	        }
    				    			
    				    	};
    				    	
    				    	var toolEls = this.body.select('.listTool');
    				    	Ext.each(toolEls.elements, function(el) {
    				    		var dd = Ext.create('Ext.dd.DDProxy', el, 'toolsDDGroup', {
    				    			isTarget: false
    				    		});
    				    		Ext.apply(dd, overrides);
    				    	});
    				    	
    				    	var tdEls = Ext.get('tableParent').select('td');
    				    	Ext.each(tdEls.elements, function(el) {
    				    		var toolsDDTarget = Ext.create('Ext.dd.DDTarget', el, 'toolsDDGroup');
    				    	});
    					},
    					scope: this
    				}
            	}]
            }]
    	});
    	
    	this.on('loadedCorpus', function(src, corpus) {
    		this.setCorpus(corpus);
    	}, this);
    	
    	this.on('boxready', function() {
    		var tableEl = Ext.get('tableParent').selectNode('table');
            this.setTableEditor(new TableGrid(tableEl));
    	}, this);
    	
    	this.callParent(arguments);
    }
});