Ext.define('Voyant.data.model.Document', {
    extend: 'Ext.data.Model',
    //requires: ['Voyant.data.store.DocumentTerms'],
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
             {name: 'language', convert: function(data) {return Ext.isEmpty(data) ? '' : data;}}
    ],
    
    getDocumentTerms: function(config) {
    	config = config || {};
    	Ext.apply(config, {
    		docId: this.get('id')
    	});
    	return this.get('corpus').getDocumentTerms(config);
    },
    
    getIndex: function() {
    	return this.get('index');
    },
    
    getFullLabel: function() {
    	return this.getTitle(); // TODO: complete full label
    },
    
    getTitle: function() {
    	var title = this.get('title');
    	if (title === undefined) title = '';
    	return Ext.isArray(title) ? title.join("; ") : title;
    },
    
    getTruncated: function(string, max) {
  		if (string.length > max) {
				// maybe a file or URL?
				var slash = string.lastIndexOf("/");
				if (slash>-1) {
					string = string.substr(slash+1);
				}
				
				if (string.length>max) {
					var space = string.indexOf(" ", max-5);
					if (space < 0 || space > max) {
						space = max;
					}
					string = string.substring(0, space) + "…";
				}
		}
  		return string
    	
    },
    
    getShortTitle: function() {
     	var title = this.getTitle();
     	title = title.replace(/\.(html?|txt|xml|docx?|pdf|rtf|\/)$/,'');
     	title = title.replace(/^(the|a|le|l'|un|une)\s/,'');
     	return this.getTruncated(title, 25);
    },
    
    getTinyTitle: function() {
    	return this.getTruncated(this.getShortTitle(), 10);
    },
    
    getShortLabel: function() {
    	return (parseInt(this.getIndex())+1) + ') ' + this.getShortTitle();
    },
    
    getTinyLabel: function() {
    	return (parseInt(this.getIndex())+1) + ') ' + this.getTinyTitle();
    },
    
    getAuthor: function() {
    	var author = this.get('author');
    	return Ext.isArray(author) ? author.join("; ") : author;
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