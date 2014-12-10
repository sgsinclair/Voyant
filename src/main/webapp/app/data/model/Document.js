Ext.define('Voyant.data.model.Document', {
    extend: 'Ext.data.Model',
    requires: ['Voyant.data.store.DocumentTerms'],
    fields: [
             {name: 'corpus'},
             {name: 'id'},
             {name: 'index', type: 'int'},
             {name: 'tokensCount-lexical', type: 'int'},
             {name: 'typesCount-lexical', type: 'int'},
             {name: 'typeTokenRatio-lexical', type: 'float', calculate:  function(data) {
        	 	return data['typesCount-lexical']/data['tokensCount-lexical'];
             }},
             {name: 'title'},
             {name: 'shortTitle', mapping: function(data) {
            	var title = data.title || '';
            	title = title.replace(/\.(html?|txt|xml|docx?|pdf|rtf|\/)$/,'');
         		if (title.length > 25) {
         				// maybe a file or URL?
         				var slash = title.lastIndexOf("/");
         				if (slash>-1) {
         					title = title.substr(slash+1);
         				}
         				
         				if (title.length>25) {
         					var space = title.indexOf(" ", 20);
         					if (space < 0 || space > 30) {
         						space = 25;
         					}
         					title = title.substring(0, space) + "&hellip;;";
         				}
         		}
         		return title; 
             }},
             {name: 'language', convert: function(data) {return Ext.isEmpty(data) ? '' : data;}}
    ],
    
    getDocumentTerms: function(config) {
    	config = config || {};
    	Ext.apply(config, {
    		docId: this.get('id')
    	});
    	return this.get('corpus').getDocumentTerms(config);
    },
    
    getFullLabel: function() {
    	return this.getTitle(); // TODO: complete full label
    },
    
    getTitle: function() {
    	return this.get('title');
    },
    
    getShortTitle: function() {
    	return this.get('shortTitle');
    },
    
    getCorpusId: function() {
    	return this.get('corpus');
    },
    
    isPlainText: function() {
    	if (this.get("extra.Content-Type") && new RegExp("plain","i").test(this.get("extra.Content-Type"))) {
    		return true
    	}
    	return false;
    }
    
});