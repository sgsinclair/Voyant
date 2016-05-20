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
        				width: '10',
        				height: '10'
        			}
        		}
        	},
        	defaults: { // place holder values to ensure that the children are rendered
        		width: 10,
        		height: 10,
        		border: true
        	},
        	items:  [{
        		xtype: 'summary',
        		colspan: 2
        	},{
        		xtype: 'documents'
        	},{
        		xtype: 'cirrus'
        	}]
        })
        
        this.on("boxready", function() {
        	var table = this.getTargetEl().dom.querySelector(".x-table-layout"),
        		rows = table.querySelectorAll("tr"),
        		width = this.getTargetEl().getWidth(), height = this.getTargetEl().getHeight();
        	for (var i=0; i<rows.length; i++) {
        		Ext.get(rows[i]).setHeight(height/rows.length);
        		var cells = rows[i].querySelectorAll("td");
        		for (j=0; j<cells.length; j++) {
        			var cmp = Ext.getCmp(cells[j].children[0].id);
        			cmp.setWidth(width/cells.length);
        			cmp.setHeight(height/rows.length);
        			cmp.updateLayout();
        		}
        	}
        })
        
        this.callParent();
    }
});