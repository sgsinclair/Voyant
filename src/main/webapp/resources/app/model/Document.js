Ext.define('Voyant.model.Document', {
	extend: 'Ext.data.Model',
	fields: [
        {name: 'id', mapping: '@id'},
        {name: 'index', type: 'int', mapping: '@index'},
        {name: 'title', mapping: '@title'},
        {name: 'shortTitle', mapping: '@title', convert: function(val) {
			title = val.replace(/\.(html?|txt|xml|docx?|pdf|rtf|\/)$/,'');
			if (title.length > 25) {
				
					 // maybe a file or URL?
					var slash = title.lastIndexOf("/");
					if (slash>-1) title = title.substr(slash+1);
					
					if (title.length>25) {
						var space = title.indexOf(" ", 20);
						if (space < 0 || space > 30) {
							space = 25;
						}
						title = title.substring(0, space) + "…;";					
					}
			}
			return title;
	
        }},
        {name: 'author', mapping: '@author'},
        {name: 'timeInMillis', type: 'int', mapping: '@time'},
        {name: 'totalTokens', type: 'int', mapping: '@totalTokens'},
        {name: 'totalWordTokens', type: 'int', mapping: '@totalWordTokens'},
        {name: 'totalWordTypes', type: 'int', mapping: '@totalWordTypes'},
        {name: 'wordDensity', type: 'float', mapping: '@totalWordTokens', convert: function(val, record) {
        	return val < 1 ? 0 : (record['@totalWordTypes']/val)*1000;
        }}
	],
	belongsTo: 'Corpus'
});