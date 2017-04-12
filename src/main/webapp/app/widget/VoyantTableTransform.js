Ext.define('Voyant.widget.VoyantTableTransform', {
	extend: 'Ext.panel.Panel',
    mixins: ['Voyant.util.Localization','Voyant.util.Api'],
	alias: 'widget.voyanttabletransform',
    statics: {
    	i18n: {},
		api: {
			tableHtml: undefined,
			tableJson: undefined,
			width: undefined
		}
    },
	constructor: function() {
        this.callParent(arguments);
	},
	initComponent: function(config) {
    	var me = this, config = config || {};
    	this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
		var me = this, tableHtml = this.getApiParam('tableHtml'), tableJson = this.getApiParam('tableJson');
		if (tableHtml) {
			Ext.apply(me, {
				html: tableHtml
			})
		} else if (tableJson) {
			var html = "<table><thead><tr>", json = JSON.parse(tableJson);
			
			if (json.headers) {
				json.headers.forEach(function(header) {
					html+="<th>"+header+"</th>"
				});
			} else {
				json.rows[0].forEach(function(cell, i) {
					html+="<th>"+(i+1)+"</th>";
				})
			}
			html+="</tr></thead><tbody>";
			json.rows.forEach(function(row) {
				html+="<tr>";
				row.forEach(function(cell) {
					html+="<td>"+cell+"</td>"
				})
				html+="</tr>";
			})
			html+="</tbody></table>";
			Ext.apply(me, {
				html: html
			})
		}
		
		me.on('afterrender', function() {
			var table = this.getTargetEl().down('table'), parent = table.parent();
			var grid = new Ext.ux.grid.TransformGrid(table, {
				width: this.getApiParam('width') || parent.getWidth(),
				height: this.getApiParam('height') || 20+(table.query('tr').length*24) // based on grid heights in crisp
			});
			grid.render(parent);
		}, me);
		
    	me.callParent(arguments);
	}

})



/**
 * A Grid which creates itself from an existing HTML table element.
 */
Ext.define('Ext.ux.grid.TransformGrid', {
    extend: 'Ext.grid.Panel',

    /**
     * Creates the grid from HTML table element.
     * @param {String/HTMLElement/Ext.Element} table The table element from which this grid will be created -
     * The table MUST have some type of size defined for the grid to fill. The container will be
     * automatically set to position relative if it isn't already.
     * @param {Object} [config] A config object that sets properties on this grid and has two additional (optional)
     * properties: fields and columns which allow for customizing data fields and columns for this grid.
     */
    constructor: function(table, config) {
        config = Ext.apply({}, config);
        this.table = Ext.get(table);

        var configFields = config.fields || [],
            configColumns = config.columns || [],
            fields = [],
            cols = [],
            headers = table.query("thead th"),
            i = 0,
            len = headers.length,
            data = table.dom,
            width,
            height,
            store,
            col,
            text,
            name;

        for (; i < len; ++i) {
            col = headers[i];

            text = col.innerHTML;
            name = 'tcol-' + i;

            fields.push(Ext.applyIf(configFields[i] || {}, {
                name: name,
                mapping: 'td:nth(' + (i + 1) + ')/@innerHTML'
            }));

            cols.push(Ext.applyIf(configColumns[i] || {}, {
                text: text,
                dataIndex: name,
                //width: col.offsetWidth,
                flex: 1,
                tooltip: col.title,
                sortable: true
            }));
        }

        if (config.width) {
            width = config.width;
        } else {
            width = table.getWidth() + 1;
        }

        if (config.height) {
            height = config.height;
        }

        Ext.applyIf(config, {
            store: {
                data: data,
                fields: fields,
                proxy: {
                    type: 'memory',
                    reader: {
                        record: 'tbody tr',
                        type: 'xml'
                    }
                }
            },
            columns: cols,
            width: width,
            height: height
        });
        this.callParent([config]);
        
        if (config.remove !== false) {
            // Don't use table.remove() as that destroys the row/cell data in the table in
            // IE6-7 so it cannot be read by the data reader.
            data.parentNode.removeChild(data);
        }
    },

    doDestroy: function() {
        this.table.remove();
        this.tabl = null;
        this.callParent();
    }
});
