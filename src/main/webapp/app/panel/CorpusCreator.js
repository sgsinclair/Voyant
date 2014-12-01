Ext.define('Voyant.panel.CorpusCreator', {
	extend: 'Ext.form.Panel',
	requires: ['Ext.form.field.File'],
	requires: ['Voyant.data.model.Corpus'],
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.corpuscreator',
    statics: {
    	i18n: {
    		title: {en: "Add Texts"},
    		emptyInput: {en: "Type in one or more URLs on separate lines or paste in a full text."},
    		reveal: {en: "Reveal"}
    	}
    },
    config: {
    	
    },
    
    constructor: function(config ) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
        var me = this;

        Ext.apply(me, {
    		title: this.localize('title'),
    		width: 800,
    		frame: true,
    		border: true,
    		frameHeader: true,
    		layout: {
    			type: 'vbox',
    			align: 'middle'
    		},
	    	dockedItems: [{
	    		xtype: 'toolbar',
                dock: 'bottom',
    	    	buttonAlign: 'right',
    	    	defaultButtonUI : 'default',
	    		items: [{
	    			text: 'Open',
	    			tooltip: 'Select an exsting corpus',
	    			handler: function() {
	    				Ext.create('Ext.window.Window', {
	    				    title: 'Open an Existing Corpus',
	    				    layout: 'fit',
	    				    modal: true,
	    				    items: {  // Let's put an empty grid in just to illustrate fit layout
	    				        xtype: 'form',
	    				        margin: '5,5,5,5',
	    				        items: {
	    				            xtype:'combo',
	    				            labelWidth: 150,
	    				            fieldLabel:'Choose a corpus:',
	    				            name:'corpus',
	    				            queryMode:'local',
	    				            store:[['shakespeare',"Shakespeare's Plays"]],
	    				            
	    				            forceSelection:true
	    				        },
	    				        buttons: [
	    				        	{
	    				        		text: 'Open',
	    				        		handler: function(btn) {
	    				        			var form = btn.up('form').getForm();
	    				        			var corpus = btn.up('form').getForm().getValues().corpus
	    				        			if (corpus!='') {
	    				        				me.loadCorpus({corpus: corpus})
		    				        			btn.up('window').close();
	    				        			}
	    				        			else {
	    				        				Ext.Msg.alert('Select a Corpus', 'Please be sure to select a corpus.');
	    				        			}
	    				        		},
	    				        		flex: 1
	    				            },{
	    				        		text: 'Cancel',
	    				        		flex: 1,
	    				        		handler: function(btn) {
	    				        			btn.up('window').close();
	    				        		}
	    				        	}
	    				        ]
	    				    }
	    				}).show();
	    			}
	    		},{
    	        	xtype: 'filefield',
    	        	name: 'upload',
        	    	buttonOnly: true,
        	    	hideLabel: true,
        	    	buttonText: 'Upload',
        	    	listeners: {
        	    		render: function(filefield) {
        	    			filefield.fileInputEl.dom.setAttribute('multiple', true);
        	            },
        	            change: function(filefield, value) {
        	            	if (value) {
            	            	var form = filefield.up('form').getForm();
            	            	if (form.isValid()) {
            	            		form.submit({
            	            			url: me.getTromboneUrl(),
            	            			params: {tool: 'corpus.CorpusCreator'},
            	            			failure: function(form, action) { // we always fail because of content-type
            	            				if (action.result) {
            	            					me.loadCorpus({corpus: action.result.stepEnabledCorpusCreator.storedId})
            	            				}
            	            			}
            	            		})
            	            	}
        	            	}
        	            }
        	    	}
	    		},'->',{
	    	    	xtype: 'button',
	    	    	scale: 'large',
	    	    	text: this.localize('reveal'),
	    	    	handler: this.onReveal
	    	    }]
	    	}],
	    	items: {
    	    	xtype: 'textareafield',
    	    	width: 800,
    	    	height: 100,
    	    	itemId: 'input',
    	    	emptyText: this.localize('emptyInput')
	    	}    
        });
        
        me.callParent(arguments);
    },
    
    loadCorpus: function(params) {
		var app = this.getApplication();
    	var view = app.getViewport();
		view.mask();
		new Corpus(params).then(function(corpus) {
			view.unmask();
			app.dispatchEvent('loadedCorpus', app, corpus);
		}).fail(function(message, response) {
			view.unmask();
			app.showErrorResponse({message: message}, response);
		});
    },
    
    onReveal: function() {
    	var panel = this.findParentByType('panel');
    	var input = panel.down('#input').getValue();
    	if (input !== '') {
    		this.loadCorpus({input: input});
    	}
    }
});