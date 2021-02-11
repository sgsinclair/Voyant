Ext.define('Voyant.panel.Builder', {
	extend: 'Ext.panel.Panel',
	requires: [],
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.builder',
    config: {
    	corpus: undefined,
    	tableEditor: null,
    	dropTargets: {},
    	colResizers: {},
    	rowResizers: {},
    	toolsList: ["cirrus", "corpusterms", "bubblelines", "corpuscollocates", "microsearch", "streamgraph", "phrases", "documents", "summary", "trends", "scatterplot", "termsradio", "wordtree", "contexts", "documentterms", "reader", "knots", "collocatesgraph", "embedder"]
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
                            handler: function() { this.getTableEditor().merge(); this.setupDropTargets(); },
                            scope: this
                        },{
                            text: 'Split cells',
                            handler: function() { this.getTableEditor().split(); this.setupDropTargets(); },
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
                            handler: function() { this.getTableEditor().insertRow(true); this.setupDropTargets(); },
                            scope: this
                        },{
                            text: 'Insert row after',
                            handler: function() { this.getTableEditor().insertRow(false); this.setupDropTargets(); },
                            scope: this
                        },{
                            text: 'Delete row(s)',
                            handler: function() { this.getTableEditor().deleteRows(); this.setupDropTargets(); },
                            scope: this
                        }]
                    }
                },{
                    text: 'Column',
                    menu: {
                        items: [{
                            text: 'Insert column before',
                            handler: function() { this.getTableEditor().insertCol(true); this.setupDropTargets(); },
                            scope: this
                        },{
                            text: 'Insert column after',
                            handler: function() { this.getTableEditor().insertCol(false); this.setupDropTargets(); },
                            scope: this
                        },{
                            text: 'Delete column(s)',
                            handler: function() { this.getTableEditor().deleteCols(); this.setupDropTargets(); },
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
//                					if (cell.rowspan == 1) {
//                						if (cell.colspan == 1) {
//                							cells.push(cell.xtype);
//                						} else {
//                							cells.push([cell.colspan, cell.xtype]);
//                						}
//                					} else {
                						var cellData = {
	                						colspan: cell.colspan,
	                						rowspan: cell.rowspan,
	                						xtype: cell.xtype
	                					};
                						var el = Ext.get(cell.elm);
                						var width = el.getStyle('width', true);
                						if (width != '') cellData.width = width.replace('%','');
                						var height = el.parent('tr').getStyle('height', true);
                						if (height != '') cellData.height = height.replace('%','');
	                					cells.push(cellData);
//                					}
                				}
                			}
                		}
                		var layoutString = encodeURI(Ext.JSON.encode({numCols: numCols, cells: cells}));
                		var params = {
                			tableLayout: layoutString,
                			view: 'customset',
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
	    		autoScroll: true,
//            	tbar: [{
//            		text: 'Add tool to cell',
//            		handler: function() {
//            			var selTool = Ext.getCmp('toolsList').getSelectionModel().getSelection()[0];
//            			if (selTool !== undefined) {
//            				this.getTableEditor().addTool(selTool);
//            			}
//            		},
//            		scope: this
//            	}],
            	items: [{
            		id: 'toolsList',
            		xtype: 'dataview',
            		store: new Ext.data.JsonStore({
                		fields: ['xtype', 'title', 'tooltip', 'glyph']
                	}),
            		itemSelector: '.listTool',
            		overItemCls: 'over',
	            	selectedItemCls: '',//'selected',
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
    				    	
    				    	var toolEls = this.body.select('.listTool');
    				    	Ext.each(toolEls.elements, function(el) {
    				    		var dd = Ext.create('Ext.drag.Source', {
    				    			element: el,
    				    			groups: 'toolsDDGroup',
    				    			proxy: {
    				    				type: 'placeholder',
    				    				getElement: function(info) {
    				    					var el = this.element;
    				    					if (!el) {
    				    						this.element = el = Ext.getBody().createChild({
    				    							cls: 'builder x-dd-drag-current',
    				    							html: info.eventTarget.textContent
    				    						});
    				    					}
    				    					el.show();
    				    					return el;
    				    				}
    				    			},
    				    			listeners: {
    				    				beforedragstart: function(src, info, evt) {
    				    					var tl = Ext.getCmp('toolsList');
    				    					var rec = tl.getRecord(src.getElement());
    				    					if (rec == null) return false;
    				    					info.setData('toolRecord', rec);
    				    				}
    				    			}
    				    		});
    				    	});
    				    	
    				    	this.setupDropTargets();
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
    },
    
    setupTableResizers: function() {
    	// remove previous
    	for (var id in this.colResizers) {
    		var dd = this.colResizers[id];
    		dd.destroy();
    		dd.getEl().parentNode.removeChild(dd.getEl());
    		delete this.colResizers[id];
    	}
    	for (var id in this.rowResizers) {
    		var dd = this.rowResizers[id];
    		dd.destroy();
    		dd.getEl().parentNode.removeChild(dd.getEl());
    		delete this.rowResizers[id];
    	}
    	
    	var trEls = Ext.get('tableParent').select('tr');
    	var mostColsRow = trEls.elements[0];
    	// TODO account for rowspan
    	Ext.each(trEls.elements, function(el) {
    		if (el.cells.length > mostColsRow.cells.length) {
    			mostColsRow = el;
    		}
    	}, this);
    	
    	var tableBox = Ext.get('tableParent').select('table').first().getBox();
    	
    	var overrides = {
    		startDrag: function(x, y) {
    			this.constrainTo('tableParent');
    			
    		},
    		endDrag: function(evt) {
    			var tpBox = Ext.get('tableParent').getBox();
    			var el = Ext.get(this.config.targetEl);
    			if (this.config.type == 'col') {
    				var x = evt.pageX - tpBox.x;
    				x = Math.min(tpBox.width, Math.max(0, x));
    				var totalPercent = x / tpBox.width * 100;
    				var remainder = 100 - totalPercent;
    				
    				var prevCols = [el];
    				var prev = el.prev('td');
    				while (prev != null) {
    					prevCols.push(prev);
    					prev = prev.prev('td');
    				}
    				
    				var nextCols = [];
    				var next = el.next('td');
    				while (next != null) {
    					nextCols.push(next);
    					next = next.next('td');
    				}
    				
    				var colPercent = totalPercent / prevCols.length;
    				Ext.each(prevCols, function(el, index) {
    					el.setStyle('width', colPercent+'%');
    				});
    				
    				if (nextCols.length > 0) {
    					colPercent = remainder / nextCols.length;
    					Ext.each(nextCols, function(el, index) {
        					el.setStyle('width', colPercent+'%');
        				});
    				}
    				
    				var resizers = Ext.ComponentQuery.query('builder')[0].colResizers;
    				for (var key in resizers) {
    					var dd = resizers[key];
    					if (dd.config.type == 'col') {
	    					var box = Ext.fly(dd.config.targetEl).getBox();
	    					dd.el.setX(box.x + box.width - 5);
    					}
    				}
    			} else {
    				var y = evt.pageY - tpBox.y;
    				y = Math.min(tpBox.height, Math.max(0, y));
    				var totalPercent = y / tpBox.height * 100;
    				var remainder = 100 - totalPercent;
    				
    				var prevRows = [el];
    				var prev = el.prev('tr');
    				while (prev != null) {
    					prevRows.push(prev);
    					prev = prev.prev('tr');
    				}
    				
    				var nextRows = [];
    				var next = el.next('tr');
    				while (next != null) {
    					nextRows.push(next);
    					next = next.next('tr');
    				}
    				
    				var rowPercent = totalPercent / prevRows.length;
    				Ext.each(prevRows, function(el, index) {
    					el.setStyle('height', rowPercent+'%');
    				});
    				
    				if (nextRows.length > 0) {
    					rowPercent = remainder / nextRows.length;
    					Ext.each(nextRows, function(el, index) {
        					el.setStyle('height', rowPercent+'%');
        				});
    				}
    				
    				var resizers = Ext.ComponentQuery.query('builder')[0].colResizers;
    				for (var key in resizers) {
    					var dd = resizers[key];
    					if (dd.config.type == 'row') {
	    					var box = Ext.fly(dd.config.targetEl).getBox();
	    					dd.el.setY(box.y + box.height - 5);
    					}
    				}
    			}
    		}
    	};
    	
    	Ext.each(mostColsRow.cells, function(el, index) {
    		if (index != mostColsRow.cells.length-1) {
    			var resizer = Ext.DomHelper.append(document.body, '<div class="column resizer"></div>', true);
    			var box = Ext.fly(el).getBox();
    			var rBox = {
    				x: box.x + box.width - 5,
    				y: tableBox.y,
    				width: 10,
    				height: tableBox.height
    			};
    			resizer.setBox(rBox);
    			
    			var dd = Ext.create('Ext.dd.DD', resizer, 'resizerGroup', {
    				isTarget: false,
    				targetEl: el,
    				type: 'col'
    			});
    			Ext.apply(dd, overrides);
    			
    			this.colResizers[el.id] = dd;
    		}
    	}, this);
    	
    	Ext.each(trEls.elements, function(el, index) {
    		if (index != trEls.elements.length-1) {
    			var resizer = Ext.DomHelper.append(document.body, '<div class="row resizer"></div>', true);
    			var box = Ext.fly(el).getBox();
    			var rBox = {
    				x: tableBox.x,
    				y: box.y + box.height - 5,
    				width: tableBox.width,
    				height: 10
    			};
    			resizer.setBox(rBox);
    			
    			var dd = Ext.create('Ext.dd.DD', resizer, 'resizerGroup', {
    				isTarget: false,
    				targetEl: el,
    				type: 'row'
    			});
    			Ext.apply(dd, overrides);
    			
    			this.rowResizers[el.id] = dd;
    		}
    	}, this);
    },
    
    setupDropTargets: function() {
    	var dropTargets = this.getDropTargets();
    	var tdEls = Ext.get('tableParent').select('td');
    	Ext.each(tdEls.elements, function(el) {
    		if (dropTargets[el.id] === undefined) {
	    		var toolsDDTarget = Ext.create('Ext.drag.Target', {
	    			element: el,
	    			groups: 'toolsDDGroup',
	    			listeners: {
	    				dragenter: function(target, info) {
	    					target.getElement().addCls('selected');
	    				},
	    				dragleave: function(target, info) {
	    					target.getElement().removeCls('selected');
	    				},
	    				drop: function(target, info) {
	    					info.getData('toolRecord').then(function(data) {
	    						var tl = Ext.getCmp('toolsList');
	    						tl.findParentByType('builder').getTableEditor().addTool(data);
	    					});
	    				}
	    			}
	    		});
	    		dropTargets[el.id] = toolsDDTarget;
    		}
    	}, this);
    	
    	for (var elId in dropTargets) {
    		if (document.querySelectorAll('#'+elId).length == 0) {
    			dropTargets[elId].destroy();
    			delete dropTargets[elId];
    		}
    	}
    	
    	this.setupTableResizers();
    }
});