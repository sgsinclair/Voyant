Ext.define('Voyant.widget.QuerySearchField', {
    extend: 'Ext.form.field.Text',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.querysearchfield',
	statics: {
		i18n: {
			querySearch: {en: 'Search'},
			querySearchTip: {en: '<div>Search syntax (press enter/return to trigger a search):</div><ul style="margin-top: 3px; margin-bottom: 3px;"><li><b>coat</b>: match exact term <i>coat</i></li><li><b>coat*</b>: match terms that start with <i>coat</i> as one term</li><li><b>^coat*</b>: match terms that start with <i>coat</i> as separate terms (coat, coats, etc.)</li><li><b>coat,jacket</b>: match each term separated by commas as separate terms</li><li><b>coat|jacket</b>: match terms separate by pipe as a single term</li><li><b>&quot;winter coat&quot;</b>: <i>winter coat</i> as a phrase</li><li><b>&quot;coat mittens&quot;~5</b>: <i>coat</i> near <i>mittens</i> (within 5 words)</li><li><b>^coat*,jacket|parka,&quot;coat mittens&quot;~5</b>: combine syntaxes</li></ul>'}
		}
	},
    triggers: {
    	/*
        clear: {
            weight: 0,
            cls: 'fa-trigger form-fa-clear-trigger',
            hidden: true,
            handler: 'onClearClick',
            scope: 'this'
        },
        search: {
            weight: 1,
            cls: 'fa-trigger form-fa-search-trigger',
            handler: 'onSearchClick',
            scope: 'this'
        },*/
        help: {
            weight: 2,
            cls: 'fa-trigger form-fa-help-trigger',
            handler: 'onHelpClick',
            scope: 'this'
        }
    },

    initComponent: function(config) {
        var me = this;

        Ext.apply(me, {
        	enableKeyEvents: true,
        	listeners: {
    		   render: function(c) {
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
    		    },
    		    keyup: function(c, e, eOpts) {
    		    	if (!this.store || Ext.isString(this.store)) {
        		        if (this.findParentByType) {
        		        	var panel = this.findParentByType("panel");
        		        	var corpus;
        		        	if (panel.getCorpus) {
        		        		corpus = panel.getCorpus()
        		        	}
        		        	else if (panel.getStore && panel.getStore().getCorpus) {
        		        		corpus = panel.getStore().getCorpus();
        		        	}
    		        		if (corpus) {
    		                	this.store = corpus.getCorpusTerms();
    		        		}
        		        }

    		    	}
    		    	if (this.store) {
    		    		var value = c.getValue().trim().replace(/^\^/,"")
    		    		if (/[,|^~" ]/.test(value)==false && value.length>0) {
        		    		this.store.load({
        		    			params: {
            		    			query: [value+"*", "^"+value+"*"],
            		    			limit: 5
        		    			},
        		    			scope: this,
        		    			callback: function(records, operation, success) {
        		    				suggest = ""
        		    				records.forEach(function(record) {
        		    					suggest+="<div>"+record.getTerm()+" ("+record.getRawFreq()+")</div>"
        		    				})
        		    				this.suggest.show();
        		    				this.suggest.update(suggest)
        		    		    }
        		    		})
    		    		}
    		    		else {
		    				this.suggest.update("")
		    				this.suggest.hide();
    		    		}
    		    	}
    		    },
    		    scope: me
    		},
//            labelWidth: 50,
//            fieldLabel: me.localize('querySearch'),
            width: 120,
            emptyText: me.localize('querySearch')

        })

        me.callParent(arguments);
        me.on('specialkey', function(f, e){
            if (e.getKey() == e.ENTER) {
                me.doSearch();
            }
        });

    },

    onClearClick : function(){
        this.setValue('');
    	this.findParentByType("panel").fireEvent("query", this, undefined);
        //this.getTrigger('clear').hide();
        this.updateLayout();
    },

    onHelpClick : function(){
    	Ext.Msg.show({
    	    title: this.localize('querySearch'),
    	    message: this.localize('querySearchTip'),
    	    buttons: Ext.Msg.OK,
    	    icon: Ext.Msg.INFO
    	});
    },
    
    doSearch: function() {
        var value = this.getValue();
    	this.findParentByType("panel").fireEvent("query", this, value.length==0 ? undefined : value);
    	/*
    	if (value) {
            this.getTrigger('clear').show();
    	}
    	else {
            this.getTrigger('clear').hide();
    	}
    	*/
        this.updateLayout();
    }
});