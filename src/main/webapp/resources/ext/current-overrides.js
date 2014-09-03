Ext.define('AppOverrides.grid.column.Action', {
  override: 'Ext.grid.column.Action',
  
  iconTpl: '<tpl for=".">' +
          '<tpl if="glyph">' +
          '<div class="{cls}" style="font-family:{glyphFamily};  font-size:15px; line-height: 15px;"<tpl if="tooltip"> data-qtip="{tooltip}"</tpl>>&#{glyph};</div>' +
          '<tpl else>' +
          '<img role="button" alt="{alt}" class="{cls}"<tpl if="tooltip"> data-qtip="{tooltip}"</tpl> />' +
          '</tpl>' +
          '</tpl>',
  defaultRenderer: function(v, meta, record, rowIdx, colIdx, store, view) {
    var me = this,
            prefix = Ext.baseCSSPrefix,
            scope = me.origScope || me,
            items = me.items,
            altText = me.altText,
            disableAction = me.disableAction,
            enableAction = me.enableAction,
            iconCls = me.iconCls,
            len = items.length,
            i = 0,
            iconTpl = new Ext.XTemplate(me.iconTpl),
            datas = [],
            item, itemScope, ret, disabled, tooltip, glyph, cls, data;
    // Allow a configured renderer to create initial value (And set the other values in the "metadata" argument!)
    // Assign a new variable here, since if we modify "v" it will also modify the arguments collection, meaning
    // we will pass an incorrect value to getClass/getTip
    ret = Ext.isFunction(me.origRenderer) ? me.origRenderer.apply(scope, arguments) || '' : '';
    meta.tdCls += ' ' + Ext.baseCSSPrefix + 'action-col-cell';
    for (; i < len; i++) {
      item = items[i];
      itemScope = item.scope || scope;
      disabled = item.disabled || (item.isDisabled ? item.isDisabled.call(itemScope, view, rowIdx, colIdx, item, record) : false);
      tooltip = disabled ? null : (item.tooltip || (item.getTip ? item.getTip.apply(itemScope, arguments) : null));
      glyph = item.glyph || item.getGlyph;
      cls = Ext.String.trim(prefix + 'action-col-icon ' + prefix + 'action-col-' + String(i) + ' ' + (disabled ? prefix + 'item-disabled' : ' ') + ' ' + (Ext.isFunction(item.getClass) ? item.getClass.apply(itemScope, arguments) : (item.iconCls || iconCls || '')));
      data = {
        cls: cls,
        tooltip: tooltip
      };
      // Only process the item action setup once.
      if (!item.hasActionConfiguration) {
        // Apply our documented default to all items
        item.stopSelection = me.stopSelection;
        item.disable = Ext.Function.bind(disableAction, me, [i], 0);
        item.enable = Ext.Function.bind(enableAction, me, [i], 0);
        item.hasActionConfiguration = true;
      }


      if (glyph) {
        if (Ext.isFunction(glyph)) {
          glyph = glyph.call(itemScope, view, rowIdx, colIdx, item, record);
        }


        if (glyph) {
          glyph = glyph.split('@');
          data.glyph = glyph[0];
          data.glyphFamily = glyph[1];
        } else {
          data = false;
        }
      } else {
        data.alt = item.altText || altText;
        data.src = item.icon || Ext.BLANK_IMAGE_URL;
      }


      data && datas.push(data);
    }


    len && (ret += iconTpl.apply(datas));
    return ret;
  }
});
