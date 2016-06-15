Ext.define('Voyant.widget.QuerySearchField', {
    extend: 'Ext.form.field.Tag',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.querysearchfield',
	statics: {
		i18n: {
		}
	},
	config: {
		corpus: undefined,
		tokenType: 'lexical',
		isDocsMode: false,
		inDocumentsCountOnly: undefined,
		stopList: undefined,
		showAggregateInDocumentsCount: false
	},
    
    constructor: function(config) {
    	config = config || {};
    	var itemTpl = config.itemTpl ? config.itemTpl : '{term} ({'+(config.inDocumentsCountOnly ? 'inDocumentsCount' : 'rawFreq')+'})';
    	Ext.applyIf(config, {
    		minWidth: 100,
    		maxWidth: 200,
    		matchFieldWidth : false,
    		minChars: 2,
    	    displayField: 'term',
    	    valueField: 'term',
    	    filterPickList: true,
    	    createNewOnEnter: true,
    	    createNewOnBlur: false,
    	    autoSelect: false,
//    	    emptyText: this.localize('querySearch'),
    	    tpl: Ext.create('Ext.XTemplate',
    	    	'<ul class="x-list-plain"><tpl for=".">',
    	    	'<li role="option" class="x-boundlist-item" style="white-space: nowrap;">'+itemTpl+'</li>',
    	    	'</tpl></ul>'
    	    ),
    	    triggers: {
    	        help: {
    	            weight: 2,
    	            cls: 'fa-trigger form-fa-help-trigger',
    	            handler: function() {
    	            	Ext.Msg.show({
    	            	    title: this.localize('querySearch'),
    	            	    message: this.getIsDocsMode() ? this.localize('querySearchDocsModeTip') : this.localize('querySearchTip'),
    	            	    buttons: Ext.OK,
    	            	    icon: Ext.Msg.INFO
    	            	});
    	            },
    	            scope: 'this'
    	        }
    	   }
    	})
    	if (config.showAggregateInDocumentsCount) {
    		config.triggers.count = {
	            cls: 'fa-trigger',
	            handler: 'onHelpClick',
	            scope: 'this',
	            hidden: true
    		}
    	}
        this.callParent(arguments);
    },
    initComponent: function(config) {
    	var me = this;
    	me.on("beforequery", function(queryPlan) {
    		if (queryPlan.query) {
    			queryPlan.query = queryPlan.query.trim();
    			if (queryPlan.query.charAt(0)=="^") {
    				queryPlan.query=queryPlan.query.substring(1)
    				queryPlan.cancel = queryPlan.query.length==0; // cancel if it's just that character
    			}
    			if (queryPlan.query.charAt(0)=="*") { // convert leading wildcard to regex
    				queryPlan.query = "."+queryPlan.query;
    			}
    			if (queryPlan.query.charAt(queryPlan.query.length-1)=='*') {
    				queryPlan.query=queryPlan.query.substring(0,queryPlan.query.length-1)
    				queryPlan.cancel = queryPlan.query.length==0; // cancel if it's just that character
    			}
    			if (queryPlan.query.charAt(0)==".") {
    				queryPlan.cancel = queryPlan.query.length< (/\W/.test(queryPlan.query.charAt(1)) ? 5 : 4) // cancel if we only have 3 or fewer after .
    			}
    			try {
                    new RegExp(queryPlan.query);
	            }
	            catch(e) {
	            	queryPlan.cancel = true;
	            }
	            if (queryPlan.query.indexOf('"')>-1) { // deal with unfinished phrases
	            	if (queryPlan.query.indexOf(" ")==-1) {queryPlan.cancel=true} // no space in phrase
	            	if ((queryPlan.query.match(/"/) || []).length!=2) {queryPlan.cancel=true;} // not balanced quotes
	            }
	            if (queryPlan.query.indexOf("*")>-1) {
	            	if (queryPlan.query.indexOf(" ")==-1) {
	            		queryPlan.query += ",^"+queryPlan.query;
	            	}
	            } else {
	            	queryPlan.query = queryPlan.query+"*"+ (queryPlan.query.indexOf(" ")==-1 ? ","+"^"+queryPlan.query+"*" : "")
	            }
    		}
    	}, me);
    	
    	me.on("change", function(tags, queries) {
    		queries = queries.map(function(query) {return query.replace(/^(\^?)\*/, "$1.*")});
    		me.up('panel').fireEvent("query", me, queries);
    		if (me.triggers.count) {
    			me.triggers.count.show();
    			me.triggers.count.getEl().setHtml('0');
    			if (queries.length>0) {
    				me.getCorpus().getCorpusTerms().load({
    					params: {
    						query: queries.map(function(q) {return '('+q+')'}).join("|"),
			    			tokenType: me.getTokenType(),
			    			stopList: me.getStopList(),
			    			inDocumentsCountOnly: true
    					},
    					callback: function(records, operation, success) {
    						if (success && records && records.length==1) {
    							me.triggers.count.getEl().setHtml(records[0].getInDocumentsCount())
    						}
    					}
    				})
    			} else {
    				me.triggers.count.hide();
    			}
    		}
    	})
    	
    	me.up("panel").on("loadedCorpus", function(src, corpus) {
    		me.setCorpus(corpus);
    		var stopList = me.getStopList();
    		if (stopList==undefined) {
        		if (this.getApiParam) {me.setStopList(this.getApiParam("stopList"))}
        		else {
        			var parent = this.up("panel");
        			if (parent && parent.getApiParam) {
        				me.setStopList(parent.getApiParam("stopList"))
        			}
        		}
    		}

			me.setStore(corpus.getCorpusTerms({
				corpus: corpus,
				proxy: {
					extraParams: {
		    			limit: 10,
		    			tokenType: me.tokenType,
		    			stopList: me.getStopList(),
		    			inDocumentsCountOnly: me.getInDocumentsCountOnly()
					}
				}
    		}));
    	})
    	
    	me.on("afterrender", function(c) {
			  if (c.triggers && c.triggers.help) {
		        	Ext.tip.QuickTipManager.register({
		                 target: c.triggers.help.getEl(),
		                 text: c.getIsDocsMode() ? c.localize('querySearchDocsModeTip') : c.localize('querySearchTip')
		             });
			  }
			  if (c.triggers && c.triggers.count) {
		        	Ext.tip.QuickTipManager.register({
		                 target: c.triggers.count.getEl(),
		                 text: c.localize('aggregateInDocumentsCount')
		             });
			  }
    	}, me)
    	me.callParent(arguments);
    }
    
});