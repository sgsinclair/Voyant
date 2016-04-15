Ext.define('Voyant.widget.QuerySearchField', {
    extend: 'Ext.form.field.Tag',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.querysearchfield',
	statics: {
		i18n: {
			querySearch: {en: 'Search'},
			querySearchTip: {en: '<div>Search syntax (press enter/return to trigger a search):</div><ul style="margin-top: 3px; margin-bottom: 3px;"><li><b>coat</b>: match exact term <i>coat</i></li><li><b>coat*</b>: match terms that start with <i>coat</i> as one term</li><li><b>^coat*</b>: match terms that start with <i>coat</i> as separate terms (coat, coats, etc.)</li><li><b>coat,jacket</b>: match each term separated by commas as separate terms</li><li><b>coat|jacket</b>: match terms separate by pipe as a single term</li><li><b>&quot;winter coat&quot;</b>: <i>winter coat</i> as a phrase</li><li><b>&quot;coat mittens&quot;~5</b>: <i>coat</i> near <i>mittens</i> (within 5 words)</li><li><b>^coat*,jacket|parka,&quot;coat mittens&quot;~5</b>: combine syntaxes</li></ul>'}
		}
	},
	config: {
		tokenType: 'lexical',
		inDocumentsCountOnly: undefined
	},
    
    constructor: function(config) {
    	config = config || {};
    	var itemTpl = config.itemTpl ? config.itemTpl : '{term} ({rawFreq})';
    	Ext.applyIf(config, {
    		minWidth: 100,
    		matchFieldWidth : false,
    		minChars: 2,
    	    displayField: 'term',
    	    valueField: 'term',
    	    filterPickList: true,
    	    createNewOnEnter: true,
    	    createNewOnBlur: false,
    	    autoSelect: false,
    	    tpl: Ext.create('Ext.XTemplate',
    	    	'<ul class="x-list-plain"><tpl for=".">',
    	    	'<li role="option" class="x-boundlist-item" style="white-space: nowrap;">'+itemTpl+'</li>',
    	    	'</tpl></ul>'
    	    ),
    	    triggers: {
    	        help: {
    	            weight: 2,
    	            cls: 'fa-trigger form-fa-help-trigger',
    	            handler: 'onHelpClick',
    	            scope: 'this'
    	        }
    	   }
    	})
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
    			if (queryPlan.query.charAt(queryPlan.query.length-1)=='*') {
    				queryPlan.query=queryPlan.query.substring(0,queryPlan.query.length-1)
    				queryPlan.cancel = queryPlan.query.length==0; // cancel if it's just that character
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
        		queryPlan.query = queryPlan.query+"*"+ (queryPlan.query.indexOf(" ")==-1 ? ","+"^"+queryPlan.query+"*" : "");
    		}
    	}, me);
    	
    	me.on("change", function(tags, queries) {
    		me.up('panel').fireEvent("query", me, queries)
    	})
    	
    	me.up("panel").on("loadedCorpus", function(src, corpus) {
    		var stopList = undefined;
    		if (this.getApiParam) {stopList = this.getApiParam("stopList")}
    		else {
    			var parent = this.up("panel");
    			if (parent && parent.getApiParam) {
    				stopList = parent.getApiParam("stopList")
    			}
    		}
			me.setStore(corpus.getCorpusTerms({
				corpus: corpus,
				proxy: {
					extraParams: {
		    			limit: 10,
		    			tokenType: me.tokenType,
		    			inDocumentsCountOnly: me.inDocumentsCountOnly,
		    			stopList: stopList
					}
				}
    		}));
    	})
    	
    	me.on("afterrender", function(c) {
			  if (c.triggers && c.triggers.help) {
			      Ext.QuickTips.register({
			        target: c.triggers.help.getEl(),
			        text: c.localize('querySearchTip'),
			        enabled: true,
			        showDelay: 20,
			        trackMouse: true,
			        autoShow: true
			      });
			  }
			  this.suggest = Ext.create('Ext.tip.ToolTip', {
			    target: this.inputEl,
			    autoShow: false,
			    hidden: true,
			    html: ''
			  });
    	})
    	me.callParent(arguments);
    }
    
});