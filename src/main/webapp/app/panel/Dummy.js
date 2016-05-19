Ext.define('Voyant.panel.Dummy', {
    extend: 'Ext.Panel',
    xtype: 'dummy',
	autoScroll: true,
    initComponent: function() {
        var me = this;
        
        var columns = 2;
        
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
        				verticalAlign: 'top',
        				width: '100%',
        				height: '100%'
        			}
        		}
        	},
        	defaults: { // place holder values to ensure that the children are rendered
        		width: 500,
        		height: 500
        	},
        	items:  [{
        		xtype: 'summary'
        	},{
        		xtype: 'documents'
        	},{
        		xtype: 'cirrus'
        	},{
        		xtype: 'reader'
        	}]
        })
        
        this.on("boxready", function() {
        	var table = this.getTargetEl().dom.querySelector(".x-table-layout");
        		rows = table.querySelectorAll("tr"), rowHeight = this.getTargetEl().getHeight() / rows.length;
        	for (var i=0; i<rows.length; i++) {
        		Ext.get(rows[i]).setHeight(rowHeight);
        		var cells = rows[i].querySelectorAll("td"), height = rowHeight;
        			width = rows[i].clientWidth, cellWidth = width / cells.length;
        		for (j=0; j<cells.length; j++) {
        			var cmp = Ext.getCmp(cells[j].children[0].id);
        			cmp.setWidth(cellWidth * parseInt(cells[0].getAttribute('colspan')));
        			cmp.setHeight(height);
        			cmp.updateLayout();
        		}
        	}
        })
        
        this.callParent();
    }
});