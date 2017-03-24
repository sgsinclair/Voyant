/**
 * A GridPanel class with live search support.
 */
Ext.define('Voyant.widget.LiveSearchGrid', {
    extend: 'Ext.grid.Panel',
    
    /**
     * @private
     * search value initialization
     */
    searchValue: null,
    
    /**
     * @private
     * The matched positions from the most recent search
     */
    matches: [],
    
    /**
     * @private
     * The current index matched.
     */
    currentIndex: null,
    
    /**
     * @private
     * The generated regular expression used for searching.
     */
    searchRegExp: null,
    
    /**
     * @private
     * Case sensitive mode.
     */
    caseSensitive: false,
    
    /**
     * @private
     * Regular expression mode.
     */
    regExpMode: false,
    
    /**
     * @cfg {String} matchCls
     * The matched string css classe.
     */
    matchCls: 'keyword',
    
    // Component initialization override: adds the top and bottom toolbars and setup headers renderer.
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    },
    
    // detects html tag
    tagsRe: /<[^>]*>/gm,
    
    // DEL ASCII code
    tagsProtect: '\x0f',
    
    /**
     * Finds all strings that matches the searched value in each grid cells.
     * @private
     */
     onTextFieldChange: function(field, val) {
         var me = this,
             count = 0,
             view = me.view,
             cellSelector = view.cellSelector,
             innerSelector = view.innerSelector,
             columns = me.visibleColumnManager.getColumns();

         view.refresh();

         me.searchValue = val;
         me.matches = [];
         me.currentIndex = null;

         if (me.searchValue !== null) {
             me.searchRegExp = new RegExp(val, 'g' + (me.caseSensitive ? '' : 'i'));

             me.store.each(function(record, idx) {
                var node = view.getNode(record);

                if (node) {
                    Ext.Array.forEach(columns, function(column) {
                    	
                        var cell = Ext.fly(node).down(column.getCellInnerSelector(), true),
                            matches, cellHTML,
                            seen;

                        if (cell && column.isXType('widgetcolumn')==false) {
                            matches = cell.innerHTML.match(me.tagsRe);
                            cellHTML = cell.innerHTML.replace(me.tagsRe, me.tagsProtect);

                            // populate indexes array, set currentIndex, and replace wrap matched string in a span
                            cellHTML = cellHTML.replace(me.searchRegExp, function(m) {
                                ++count;
                                if (!seen) {
                                    me.matches.push({
                                        record: record,
                                        column: column
                                    });
                                    seen = true;
                                }
                                return '<span class="' + me.matchCls + '">' + m + '</span>';
                            }, me);
                            // restore protected tags
                            Ext.each(matches, function(match) {
                                cellHTML = cellHTML.replace(me.tagsProtect, match);
                            });
                            // update cell html
                            cell.innerHTML = cellHTML;
                        }
                    });
                }
             }, me);

             // results found
             if (count) {
                me.currentIndex = 0;
                me.gotoCurrent();
             }
         }

         // no results found
         if (me.currentIndex === null) {
             me.getSelectionModel().deselectAll();
         }
         field.focus();
     },

    privates: {
        gotoCurrent: function() {
            var pos = this.matches[this.currentIndex];
            this.getNavigationModel().setPosition(pos.record, pos.column);
            this.getSelectionModel().select(pos.record);
        }
    }
});
