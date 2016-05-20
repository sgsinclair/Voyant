Ext.define('Voyant.panel.Dummy', {
    extend: 'Ext.Panel',
    xtype: 'dummy',
	autoScroll: true,
    initComponent: function() {
        var me = this;
        
        var columns = 3;
        
        Ext.apply(this, {
        	layout: {
        		type: 'table',
        		columns: columns,
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
        	items:  [{
        		colspan: 2,
        		xtype: 'summary'
        	},{
        		xtype: 'reader',
        		rowspan: 2
        	},{
        		xtype: 'documentterms'
        	},{
        		xtype: 'corpusterms'
        	}]
        })
        
        this.on("boxready", function() {
        	this.body.setStyle('overflow', 'hidden');
        	
        	var sizeMap = {};
        	
        	var table = this.getTargetEl().down(".x-table-layout");
        	var rows = table.dom.rows;
        	for (var i=0; i<rows.length; i++) {
        		var cells = rows[i].cells;
        		for (var j=0; j<cells.length; j++) {
        			var cell = cells[j];
        			var cellEl = Ext.get(cell);
        			var size = cellEl.getSize(false);
        			var cmpId = cellEl.down('.x-panel').id;
        			sizeMap[cmpId] = size;
        		}
        	}
        	
        	for (var id in sizeMap) {
        		var size = sizeMap[id];
        		Ext.getCmp(id).setSize(size);
        	}

        	this.updateLayout();
        })
        
        this.on('resize', function(panel, newwidth, newheight, oldwidth, oldheight) {
        	if (oldwidth !== undefined && oldheight !== undefined) {
	        	var widthRatio = newwidth/oldwidth;
	        	var heightRatio = newheight/oldheight;

	        	var sizeMap = {};
	        	
	        	var table = this.getTargetEl().down(".x-table-layout");
	        	var rows = table.dom.rows;
	        	for (var i=0; i<rows.length; i++) {
	        		var cells = rows[i].cells;
	        		for (var j=0; j<cells.length; j++) {
	        			var cell = cells[j];
	        			var cellEl = Ext.get(cell);
	        			var panelEl = cellEl.down('.x-panel');
	        			var size = panelEl.getSize(false); // get panel size this time since table cell size will be inaccurate
	        			var w = Math.floor(size.width * widthRatio);
		        		var h = Math.floor(size.height * heightRatio);
	        			var cmpId = panelEl.id;
	        			sizeMap[cmpId] = {width: w, height: h};
	        		}
	        	}
	        	
	        	for (var id in sizeMap) {
	        		var size = sizeMap[id];
	        		Ext.getCmp(id).setSize(size);
	        	}
	
	        	this.updateLayout();
        	}
        	
        })
        
        this.callParent();
    }
});