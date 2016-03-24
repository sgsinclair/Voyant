Ext.define('Voyant.data.model.Context', {
    extend: 'Ext.data.Model',
    fields: [
             {name: 'id'},
             {name: 'docIndex', 'type': 'int'},
             {name: 'docId'},
             {name: 'left'},
             {name: 'keyword'},
             {name: 'term'},
             {name: 'right'}
        ],

        getDocIndex: function() {return this.get("docIndex")},
        getLeft: function() {return this.get("left")},
        getMiddle: function() {return this.get("middle")},
        getHighlightedMiddle: function() {return "<span class='keyword'>"+this.getMiddle()+"</span>"},
        getRight: function() {return this.get("right")},
        getHighlightedContext: function() {return this.getLeft()+this.getHighlightedMiddle()+this.getRight();}
	
});