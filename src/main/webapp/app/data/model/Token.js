Ext.define('Voyant.data.model.Token', {
    extend: 'Ext.data.Model',
    fields: [
             {name: 'id'},
             {name: 'docId'},
             {name: 'docIndex', type: 'int'},
             {name: 'token'},
             {name: 'rawFreq'},
             {name: 'tokenType'},
             {name: 'position', type: 'int'},
             {name: 'startOffset', type: 'int'},
             {name: 'endOffset', type: 'int'}
        ],
    statics: {
    	getInfoFromElement: function(arg) {
    		if (arg && arg.getId) {
    			var parts = arg.getId().split("_");
    			return {
    				docIndex: parseInt(parts[1]),
    				position: parseInt(parts[2])
    			};
    		}
    	}
    },
	isWord: function() {
		return this.getTokenType()=='lexical'; // maybe something else later?
	},
	isStopword: function() {
		return this.get("stopword")=="true";
	},
	getTokenType: function() {
		return this.get("tokenType");
	},
	getId: function() {
		return ["",this.getDocIndex(),this.getPosition()].join("_");
	},
	getDocIndex: function() {
		return this.get("docIndex");
	},
	getDocId: function() {
		return this.get("docId");
	},
	getTerm: function() {
		return this.get("term");
	},
	getTermWithLineSpacing: function(isPlainText) {
		var term = this.getTerm().replace(/<\/?\w+\b.*?>/g, "<br /><br />").replace(/>\s+</g,"><").replace(/<br \/><br \/>(<br \/>)+/g,"<br \/><br \/>");
		if (isPlainText) {term = term.replace(/(\r\n|\r|\n)\s*/g,"<br />");};
		return term;
	},
	getPosition: function() {
		return this.get("position");
	},
	getDocumentRawFreq: function() {
		return this.get("rawFreq");
	}
});