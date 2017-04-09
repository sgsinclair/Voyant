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
        this.table = table.innerHTML ? table : Ext.get(table);

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
                width: col.offsetWidth,
                tooltip: col.title,
                sortable: true
            }));
        }
debugger
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

Ext.define('Voyant.widget.VoyantTableTransform', {
	extend: 'Ext.ux.grid.TransformGrid',
    mixins: ['Voyant.util.Localization','Voyant.util.Api'],
    statics: {
		api: {
			tableHtml: undefined,
			width: '100%'
		}
    },
	constructor: function(config) {
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
		config = config || {};
		Ext.applyIf(config, this.getApiParams());
		if (config.tableHtml) {
			
		} else {
	        this.callParent([tableId, config]);
		}
		var tableEl = Ext.DomHelper.createContextualFragment(table);
		
		
		debugger
		var tableId = config.tableId ? config.tableId : this.getApiParam("tableId");
		config = config || {};
		Ext.applyIf(config, this.getApiParams());
		debugger
        this.callParent([tableId, config]);
	},
	alias: 'widget.voyanttabletransform',

})