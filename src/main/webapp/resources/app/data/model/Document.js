Ext.define('Voyant.data.model.Document', {
    extend: 'Ext.data.Model',
    fields: ['id', 'source', 'location', 'author',
             {name: 'tokensCount-lexical', type: 'int'},
             {name: 'typesCount-lexical', type: 'int'},
             {name: 'density-lexical', mapping: 'tokensCount-lexical', convert: function(value, record) {return value ? (record.get('typesCount-lexical')/value) : 0}, type: 'float'},
             {name: 'language', convert: function(value) {
            	switch(value) {
            	case "en":
            		return "English"
            	case "fr":
            		return "French"
            	default:
            		return value;
            	} 
             }},
             {name: 'title', convert: function(value, record) {
            	 if (!value) {
            		 if (record.get('source')=='uri') {return record.get('location')}
				 }
            	return value
             }, type: 'float'},
             {name: 'source-label', mapping: 'source', convert: function(value, record) {
            	 if (value=='uri') {
            		 var uri = record.get('location');
            		 value = "<a href='"+location+"' target='_blank'>"+uri+"</a>"
            	}
            	return value
             }, type: 'float'}
    ],
    belongsTo: 'Voyant.data.model.Corpus'
});