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
             {name: 'lastTokenStartOffset-lexical', type: 'int'},
             {name: 'title'},
             {name: 'language', convert: function(data) {return Ext.isEmpty(data) ? '' : data;}}
    ],
    
    getLexicalTokensCount: function() {
    	return this.get('tokensCount-lexical')
    },
    
    getLexicalTypeTokenRatio: function() {
    	return this.get('typeTokenRatio-lexical')
    },
    
    getDocumentTerms: function(config) {
    	config = config || {};
    	Ext.apply(config, {
    		docId: this.get('id')
    	});
    	if (config.corpus) {
    		return config.corpus.getDocumentTerms(config);
    	}
    	return this.get('corpus').getDocumentTerms(config); // FIXME: when does this happen?
    },
    
    getIndex: function() {
    	return this.get('index');
    },
    
    getId: function() {
    	return this.get('id');
    },
    
    getFullLabel: function() {
    	return this.getTitle(); // TODO: complete full label
    },
    
    getTitle: function() {
    	var title = this.get('title');
    	if (title === undefined) title = '';
    	title = Ext.isArray(title) ? title.join("; ") : title;
    	title = title.trim().replace(/\s+/g, ' '); // remove excess whitespace
    	return title;
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
  		return string;
    	
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
    	var author = this.get('author') || "";
    	author = Ext.isArray(author) ? author.join("; ") : author;
    	author = author.trim().replace(/\s+/g, ' ');
    	return author;
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