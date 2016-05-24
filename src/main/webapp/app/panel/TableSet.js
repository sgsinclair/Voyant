Ext.define('Voyant.panel.TableSet', {
	extend: 'Ext.panel.Panel',
    requires: ['Voyant.panel.VoyantTabPanel','Voyant.panel.Cirrus', 'Voyant.panel.Summary', 'Voyant.panel.CorpusTerms', 'Voyant.panel.Reader', 'Voyant.panel.Documents', 'Voyant.panel.Trends', 'Voyant.panel.Contexts', 'Voyant.panel.Phrases', 'Voyant.panel.DocumentTerms','Voyant.panel.CorpusCollocates','Voyant.panel.CollocatesGraph','Voyant.panel.StreamGraph'],
	mixins: ['Voyant.panel.Panel'],
    alias: 'widget.tableset',
	statics: {
		i18n: {
		},
		api: {
			panels: undefined
		},
		glyph: 'xf17a@FontAwesome'
	},
	
	header: false,
	
    constructor: function() {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
    	this.on('boxready', function(panel) {
	    	this.doTableSizing();
    	}, this);
    	
    	this.on('resize', function(panel, newwidth, newheight, oldwidth, oldheight) {
			if (oldwidth !== undefined && oldheight !== undefined) {
	        	var widthRatio = newwidth/oldwidth;
	        	var heightRatio = newheight/oldheight;
	        	this.doTableSizing(widthRatio, heightRatio);
			}
		}, this);
    },
	
    initComponent: function() {
    	Ext.suspendLayouts();
    	
    	var params = Ext.urlDecode(window.location.search.substring(1));
    	var layoutString = decodeURI(params.layout);
    	var layout = Ext.decode(layoutString);
        if (layout.numCols != null) {
        	var items = [];
        	for (var i = 0; i < layout.cells.length; i++) {
        		var cell = layout.cells[i];
        		items.push(cell);
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
        }
    	
    	Ext.resumeLayouts();
    	
    	this.callParent();
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