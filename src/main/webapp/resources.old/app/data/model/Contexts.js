Ext.define('Voyant.data.model.Contexts', {
    extend: 'Ext.data.Model',
    fields: [{name: 'docIndex', type: 'int'}, 'query', 'term', {name: 'position', type: 'int'}, 
             {name: 'left', convert: Ext.util.Format.stripTags},
             {name: 'middle', convert: Ext.util.Format.stripTags},
             {name: 'right', convert: Ext.util.Format.stripTags}
          ]
});
