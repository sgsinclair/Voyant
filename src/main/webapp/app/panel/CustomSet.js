Ext.define('Voyant.panel.CustomSet', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
    alias: 'widget.customset',
	statics: {
		i18n: {
		},
		api: {
			layout: undefined,
			tableLayout: undefined
		},
		glyph: 'xf17a@FontAwesome'
	},
	header: false,
	height: '100%',
	width: '100%',
	
    constructor: function() {
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments); // force api load
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
		if (this.getApiParam('layout')) {
			Ext.apply(this,{
				layout: 'border',
				items: []
			})
		} else if (this.getApiParam('tableLayout')) {
			this.initTableLayout();
		}
		this.callParent()
    },
	
	listeners: {
		loadedCorpus: function(src, corpus) {
			if (this.getApiParam('layout')) { // not sure why, but we seem to need to fire event for child panels
				this.query("panel").forEach(function(p) {
					p.fireEvent("loadedCorpus", src, corpus);
				})
			}
		},
		boxready: function(panel) {
			if (this.getApiParam('layout')) {
				this.initBorderLayoutComponents();
			} else if (this.getApiParam('tableLayout')) {
		    	this.doTableSizing();
		    	this.on('resize', function(panel, newwidth, newheight, oldwidth, oldheight) {
					if (oldwidth !== undefined && oldheight !== undefined) {
			        	var widthRatio = newwidth/oldwidth;
			        	var heightRatio = newheight/oldheight;
			        	this.doTableSizing(widthRatio, heightRatio);
					}
				}, this);
			} else {
				this.showError(this.localize('noLayoutSpecified'))
			}
		}
		
	},
	
	initBorderLayoutComponents: function() {
        var layoutString = decodeURI(this.getApiParam('layout'))
        	.replace(/r1/g, 'region')
	        .replace(/i1/g, 'items')
	        .replace(/s1/g, 'split')
	        .replace(/c1/g, 'collapsible')
	        .replace(/c2/g, 'collapsed')
	        .replace(/w1/g, 'width')
	        .replace(/h1/g, 'height')
	        .replace(/p1/g, '%')
	        .replace(/"x1":"/g, '"xtype":"')
	        .replace(/c3/g, 'center')
	        .replace(/n1/g, 'north')
	        .replace(/e1/g, 'east')
	        .replace(/s2/g, 'south')
	        .replace(/w2/g, 'west')
	    	.replace(/"xtype":"(\w+)"/g, function(match, tool) {
            	if (!Ext.ClassManager.getByAlias("widget."+tool.toLowerCase())) {
		            if (tool=="Links") {tool="CollocatesGraph";}
		            else if (tool=="CorpusGrid") {tool="Documents";}
		            else if (tool=="CorpusSummary") {tool="Summary";}
		            else if (tool=="CorpusTypeFrequenciesGrid") {tool="CorpusTerms";}
		            else if (tool=="DocumentInputAdd") {tool="CorpusTerms";}
		            else if (tool=="DocumentTypeCollocateFrequenciesGrid") {tool="CorpusTerms";}
		            else if (tool=="DocumentTypeFrequenciesGrid") {tool="DocumentTerms";}
		            else if (tool=="DocumentTypeKwicsGrid") {tool="Contexts";}
		            else if (tool=="TypeFrequenciesChart") {tool="Trends";}
		            else if (tool=="VisualCollocator") {tool="CollocatesGraph";}
		            else {tool="NoTool"}
            	}
            	return '"xtype":"'+tool.toLowerCase()+'"'+(tool=="NoTool" ? ',"html":"'+new Ext.Template(panel.localize('noSuchTool')).applyTemplate([tool])+'"' : '')
		    })
        
        var items;
        try {
            items = Ext.decode(layoutString);
        } catch (e) {
            items = {region: 'center', html: '<div>Error constructing layout:'+e+'</div>'};
        }
        
        if (items == null) {
        	items = {region: 'center', html: '<div>Error: no layout information found.</div>'}
        }
        
        this.addBorderLayouts(items);

        this.on("add", function(custom, cmp) {
        	cmp.on("boxready", function(cmp) {
//        		cmp.query("panel").forEach(function(p) {
//        			custom;
////        			debugger
//        		})
        	})
        })
        this.add(items);
//        .on("boxready", function() {
//        	debugger
//            if (this.getCorpus()) { // we may have loaded the corpus after the layout, so refire the event
//            	this.getApplication().dispatchEvent("loadedCorpus", this.getApplication(), corpus);
//            }
//        })
        
	},
	
	addBorderLayouts: function(items) {
    	var size = Ext.getBody().getSize();
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (Ext.isString(item.width)) {
            	item.width = Math.round(size.width * parseInt(item.width) / 100);
            } else if (Ext.isString(item.height)) {
            	item.height = Math.round(size.height * parseInt(item.height) / 100);
            }
            if (item.items && item.items.length > 1) {
                item.layout = 'border';
                this.addBorderLayouts(item.items);
            } else {
                item.layout = 'fit';
            }
        }
	},
	
	initTableLayout: function() {
    	Ext.suspendLayouts();
    	
    	var tableLayout = decodeURI(this.getApiParam('tableLayout'));
    	if (tableLayout && tableLayout.charAt(0)!="{" && tableLayout.charAt(0)!="[") {
    		var cells = [];
    		tableLayout.split(/,\s*/).forEach(function(cell) {
    			cells.push(/^"'/.test(cell) ? cell : '"'+cell+'"');
    		});
    		tableLayout = "["+cells.join(",")+"]"; // treat as simple comma-separated string
    	}
    	var layout = Ext.decode(tableLayout);
    	if (Ext.isArray(layout)) {
    		layout = {
        		cells: layout
        	};
    	}
    	if (!layout.numCols && layout.cells && Ext.isArray(layout.cells)) {
    		if (layout.cells.length < 3) {
    			layout.numCols = layout.cells.length;
    		} else if (layout.cells.length < 5) {
    			layout.numCols = Math.ceil(layout.cells.length / 2);
    		} else {
    			layout.numCols = Math.ceil(layout.cells.length / 3);
    		}
    	}
        if (layout.numCols != null && layout.cells && Ext.isArray(layout.cells)) {
        	var items = [];
        	for (var i = 0; i < layout.cells.length; i++) {
        		var cell = layout.cells[i];
        		if (Ext.isObject(cell)) {
        			// TODO handle width & height
        			delete cell.width;
        			delete cell.height;
            		items.push(cell);
        		} else if (Ext.isArray(cell)) {
        			var colspan = 1, rowspan = 1; xtype = undefined;
        			if (cell[0] && Ext.isNumber(cell[0])) {
        				colspan = cell[0];
        				cell.shift();
        			}
        			if (cell[0] && Ext.isString(cell[0])) {
        				xtype = cell[0];
        				cell.shift();
        			}
        			if (cell[0] && Ext.isNumber(cell[0])) {
        				rowspan = cell[0];
        			}
        			if (xtype) {
        				items.push({
        					colspan: colspan,
        					rowspan: rowspan,
        					xtype: xtype
        				})
        			}
        		} else if (Ext.isString(cell)) {
        			items.push({
        				xtype: cell,
        				colspan: 1,
        				rowspan: 1
        			})
        		}
        	}
        	
        	Ext.apply(this, {
        		layout: {
        			type: 'table',
        			width: '100%',
    				height: '100%',
        			columns: layout.numCols,
        			tableAttrs: {
            			style: {
            				width: '100%',
            				height: '100%'
            			}
            		},
            		tdAttrs: {
            			style: {
            				padding: '0px',
            				verticalAlign: 'top'
            			}
            		}
        		},
        		defaults: { // place holder values to ensure that the children are rendered
            		width: 10,
            		height: 10,
            		border: true
            	},
        		items: items
        	});
        } else {
        	this.showError("badTableLayoutDefinition")
        }
    	
    	Ext.resumeLayouts();		
	},
	doTableSizing: function(widthRatio, heightRatio) {
    	var sizeMap = {};
    	
    	var table = this.getTargetEl().down(".x-table-layout");
    	var rows = table.dom.rows;
    	for (var i=0; i<rows.length; i++) {
    		var cells = rows[i].cells;
    		for (var j=0; j<cells.length; j++) {
    			var cell = cells[j];
    			var cellEl = Ext.get(cell);
    			var panelEl = cellEl.down('.x-panel');
    			var cmpId = panelEl.id;
    			
    			var size;
    			if (widthRatio !== undefined && heightRatio !== undefined) {
    				size = panelEl.getSize(false);
    				size.width = size.width * widthRatio;
            		size.height = size.height * heightRatio;
            		// FIXME multiple resize calls gradually reduce size
    			} else {
    				size = cellEl.getSize(false);
    			}
    			
    			sizeMap[cmpId] = size;
    		}
    	}
    	
    	for (var id in sizeMap) {
    		var size = sizeMap[id];
    		Ext.getCmp(id).setSize(size);
    	}

    	this.updateLayout();
	}
})