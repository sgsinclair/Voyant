Ext.define('Voyant.panel.Veliza', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
    xtype: 'veliza',
	autoScroll: true,
    statics: {
    	i18n: {
    		title: "Veliza",
    		typeAndEnter: "Type text and hit enter.",
    		send: "send",
    		fromCorpus: "from text"
    	},
    	api: {
    	},
		glyph: 'xf0e6@FontAwesome'
    },
    config: {
    	previous: []
    },
    
    initComponent: function(config) {
        var me = this;
        
        Ext.apply(this, {
    		title: this.localize('title'),
    		glyph: 'xf0e6@FontAwesome',
    		html: "<form class='chat'></form>",
    		dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                items: [{
        			xtype: 'textfield',
        			emptyText: this.localize("typeAndEnter"),
        			flex: 1,
        			listeners: {
                        specialkey: function(field, e){
                            if (e.getKey() == e.ENTER) {
                            	me.handleUserSentence(field.getValue())
                            }
                        }
                    }
                },{
        			xtype: 'button',
        			text: this.localize('send'),
        			handler: function() {
        				me.handleUserSentence(this.up("toolbar").down('textfield').getValue(), false)
        			}
        		},{
        			xtype: 'button',
        			text: this.localize('fromCorpus'),
        			handler: function() {
        				me.handleUserSentence("", true)
        			}
        		}]
    		}]
        })
             
        this.callParent();
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
        
    	this.on('boxready', function(cmp) {
    		cmp.addSentence("fromThem", "Hello, I'm Veliza, and I'm here to talk to you about your texts (you may know my sister <a href='https://en.wikipedia.org/wiki/ELIZA' target='_blank'>Eliza</a> she's a famous psychotherapist). I'm just learning to talk about text documents, but please, let me know about any anxieties you're feeling about your texts. Type a message in the box below and hit enter. Or, if you're feeling playful, hit the <i>from text</i> bottom in the lower right-hand corner to fetch a sentence from the corpus.")
    	})

    }, 
    
    listeners: {
    },
    
    handleUserSentence: function(sentence, fromCorpus) {
    	sentence = sentence.trim();
    	if (sentence || fromCorpus) {
    		if (sentence) {
    	    	this.addSentence("myMessage", sentence);
    		}
	    	this.down('textfield').setValue("");
	    	this.mask();
    		var me = this;
    		Ext.Ajax.request({
    			url: this.getApplication().getTromboneUrl(),
    			params: {
    				corpus: me.getCorpus().getId(),
    				tool: 'corpus.Veliza',
    				sentence: sentence,
    				previous: this.getPrevious(),
    				fromCorpus: fromCorpus ? true : false,
    				noCache: Ext.id()
    			},
    		    success: function(response, opts) {
    		    	me.unmask();
    		    	var response = Ext.decode(response.responseText);
    		    	var veliza = response.veliza.response;
    		    	var sentence = response.veliza.sentence;
    		    	me.setPrevious(response.veliza.previous);
    		    	if (fromCorpus) {
    		    		meta = response.veliza.docIndex > -1 ? me.getCorpus().getDocument(response.veliza.docIndex).getShortLabel() : undefined;
    		    		me.addSentence("myMessage", sentence, meta);
    			    	Ext.Function.defer(function() {
            		    	this.addSentence("fromThem", veliza);
            		    	this.body.scroll('b', Infinity)
    			    	}, 500, me);
    		    	} else {
        		    	me.addSentence("fromThem", veliza);
        		    	me.body.scroll('b', Infinity)
    		    	}
    		    },
    		    failure: function(response, opts) {
    		    	me.showError(response);
    		    }
    		})
    	}
    },

    addSentence: function(speaker, sentence, meta) {
    	var el = this.body.down("form").insertHtml('beforeEnd', '<div class="message"><div class="'+speaker+'"><p>'+sentence+'</p>'+(meta ? "<date>"+meta+"</date>" : "")+'</div></div>', true);
    	this.body.scroll('b', Infinity);
    }
});