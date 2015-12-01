Ext.define('Voyant.panel.CorpusCreator', {
	extend: 'Ext.form.Panel',
	requires: ['Ext.form.field.File'],
	requires: ['Voyant.data.model.Corpus'],
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.corpuscreator',
    statics: {
    	i18n: {
    		title: {en: "Add Texts"},
    		helpTip: {en: "This tool allows you to create a corpus in one of three ways:<ol><li>by typing or pasting text into the text box and clicking <i>Reveal</i>; if each line in the text box is a URL, text is fetched from those URLs, otherwise the contents are treated as a single document</li><li>click the <i>Open</i> button to open an existing corpus</li><li>click the <i>Upload</i> button to upload one or more files from you computer (you can select multiple files by using the Ctrl and/or Shift keys)</li></ul>"},
    		gearTip: {en: "Options"},
    		gearWinTitle: {en: "Options"},
    		inputFormat: {en: "Input Format"},
    		inputFormatAuto: {en: "Auto-Detect (recommended)"},
    		advancedOptionsText: {en: "The advanced options below only apply to certain input formats. See the documentation on <a href='{0}' target='voyantdocs'>creating a corpus</a>."},
    		xmlOptions: {en: "XML"},
    		xmlOptionsText: {en: "Define XPath Expressions for any of the following:"},
    		xpathDocuments: {en: "Documents"},
    		xpathGroupBy: {en: "Group by"},
    		xpathContent: {en: "Content"},
    		xpathTitle: {en: "Title"},
    		xpathAuthor: {en: "Author"},
    		tableOptions: {en: "Tabular Data"},
    		tableDocuments: {en: "Documents"},
    		tableContent: {en: "Content"},
    		tableTitle: {en: "Title"},
    		tableAuthor: {en: "Author"},
    		tokenizationOptions: {en: "Tokenization"},
    		tokenization: {en: "Tokenization"},
    		tokenizationAuto: {en: "Automatic (highly recommended)"},
    		tokenizationWordBoundaries: {en: "Simple Word Boundaries"},
    		emptyInput: {en: "Type in one or more URLs on separate lines or paste in a full text."},
    		uploadingCorpus: {en: "Uploading corpus…"},
    		fileTypesWarning: {en: "File Types Warning"},
    		fileTypesMessage: {en: "You have one or more files with incompatible or unrecognized file extensions that may cause problems."},
    		badFiles: {en: "incompatible (likely error): "},
    		unknownFiles: {en: "unrecognized (possible error): "},
    		sureContinue: {en: "Are you sure you wish to continue?"},
    		error: {en: "Error"},
    		errorNotXmlContinue: {en: "You've selected an XML input format but the input doesn't appear to be XML. Are you sure you wish to continue?"},
    		reveal: {en: "Reveal"},
    		ok: {en: "OK"},
    		cancel: {en: "Cancel"}
    	},
    	api: {
    		inputFormat: undefined,
    		xmlDocumentsXpath: undefined,
    		xmlContentXpath: undefined,
    		xmlTitleXpath: undefined,
    		xmlAuthorXpath: undefined,
    		tokenization: undefined
    	}
    },
    config: {
    	corpus: undefined
    },
    
    constructor: function(config) {
        this.callParent(arguments);
        config = config || {};
        
    	this.mixins['Voyant.panel.Panel'].constructor.call(this, Ext.apply(config, {includeTools: {gear: true, help: true}}));
    	
    },
    
    initComponent: function() {
        var me = this;

        Ext.apply(me, {
    		title: this.localize('title'),
    		width: 800,
    		frame: true,
    		padding: 10,
    		style: {
    		    borderColor: '#aaa',
    		    borderStyle: 'solid'
    		},
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
                    glyph: 'xf115@FontAwesome', // not visible
	    			tooltip: 'Select an exsting corpus',
	    			hidden: this.getCorpus()!=undefined,
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
	    				            store:[['shakespeare',"Shakespeare's Plays"],['austen',"Austen's Novels"]],				            
	    				            forceSelection:true
	    				        },
	    				        buttons: [
	    				        	{
	    				        		text: 'Open',
	    			                    glyph: 'xf00c@FontAwesome',
	    				        		handler: function(btn) {
	    				        			var form = btn.up('form').getForm();
	    				        			var corpus = btn.up('form').getForm().getValues().corpus;
	    				        			if (corpus!='') {
	    				        				me.loadCorpus({corpus: corpus});
		    				        			btn.up('window').close();
	    				        			}
	    				        			else {
	    				    	        		Ext.Msg.show({
	    				    	        		    title:'Select a Corpus',
	    				    	        		    message: 'Please be sure to select a corpus.',
	    				    	        		    buttons: Ext.Msg.OK,
	    				    	        		    icon: Ext.Msg.ERROR
	    				    	        		});
	    				        			}
	    				        		},
	    				        		flex: 1
	    				            },{
	    				        		text: 'Cancel',
	    			                    glyph: 'xf00d@FontAwesome',
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
                    glyph: 'xf093@FontAwesome',
    	        	name: 'upload',
        	    	buttonOnly: true,
        	    	hideLabel: true,
        	    	buttonText: 'Upload',
        	    	tooltip: 'test',
        	    	listeners: {
        	    		render: function(filefield) {
        	    			filefield.fileInputEl.dom.setAttribute('multiple', true);
        	    		      Ext.QuickTips.register({
        	      		        target: filefield.getEl(),
        	      		        text: 'Upload one or more documents from your computer',
        	      		        enabled: true,
        	      		        showDelay: 20,
        	      		        trackMouse: true,
        	      		        autoShow: true
        	      		      });
        	            },
        	            change: function(filefield, value) {
        	            	if (value) {
            	            	var form = filefield.up('form').getForm();
            	            	if (form.isValid()) {
            	            		var files = filefield.fileInputEl.dom.files;
            	            		var badFilesRe = /\.(png|gif|jpe?g|xls|mp[234a]|mpeg|exe|wmv|avi|ppt|mpg|tif|wav|mov|psd|wma|ai|bmp|pps|aif|pub|dwg|indd|swf|asf|mbd|dmg|flv)$/i;
            	            		var goodFilesRe = /\.(txt|pdf|html?|xml|docx?|rtf|pages|odt|zip|jar|tar|gz|ar|cpio|bzip2|bz2|gzip)$/i;
            	            		var badFiles = [];
            	            		var unknownFiles = [];
            	            		for (var i = 0, len = files.length; i<len; i++) {
            	            			var filename = files[i].name;
            	            			if (badFilesRe.test(filename)) {
            	            				badFiles.push(filename.split("/").pop());
            	            			}
            	            			else if (!goodFilesRe.test(filename)) {
            	            				unknownFiles.push(filename.split("/").pop());
            	            			}
            	            		}
            	            		if (badFiles.length>0 || unknownFiles.length>0) {
            	            			var file = filefield;
            	            			Ext.Msg.show({
            	            				title: me.localize("fileTypesWarning"),
            	            				icon: Ext.MessageBox.ERROR,
            	            				message: me.localize('fileTypesMessage')+'<ul>' +
            	            					(badFiles.length > 0 ? ('<li>'+me.localize("badFiles") + badFiles.slice(0, 5).join(", ") + (badFiles.length>5 ? '…' : '') + '</li>') : '') +
            	            					(unknownFiles.length>0 ? ('<li>' +me.localize("unknownFiles") + unknownFiles.slice(0, 5).join(", ") + (unknownFiles.length>5 ? '…' : '') +'</li>') : '')+
            	            					'</ul>'+me.localize('sureContinue'),
            	            				buttons: Ext.Msg.YESNO,
            	            				fn: function(btn) {
            	            			        if (btn === 'yes') {
            	            			        	me.loadForm(form);
            	            			        }
            	            			        else {
            	            			        	file.reset(); // make sure we can trigger a change next time
            	            			        	file.fileInputEl.dom.setAttribute('multiple', true);
            	            			        }
            	            			    },
            	            				scope: form
            	            			});
            	            		}
            	            		else {
            	            			me.loadForm(form);
            	            		}
            	            	}
        	            	}
        	            }
        	    	}
	    		},'->', {
	    	    	xtype: 'button',
	    	    	scale: 'large',
        			glyph: 'xf00d@FontAwesome',
	    	    	text: this.localize('cancel'),
	    	    	hidden: this.getCorpus()==undefined,
	    	    	handler: function(btn) {
	    	        	var win = this.up("window");
	    	        	if (win && win.isFloating()) {
	    	        		win.close();
	    	        	}
	    	    	}
	    	    }, {
	    	    	xtype: 'button',
	    	    	scale: 'large',
                    glyph: 'xf00c@FontAwesome',
	    	    	text: this.localize('reveal'),
	    	    	handler: function(btn) {
	    	        	var input = btn.up('form').down('#input').getValue();
	    	        	if (input !== '') {
	    	        		var api = me.getApiParams();
	    	            	delete api.view;
	    	            	delete api.stopList;
	    	        		if (api.inputFormat && input.trim().indexOf("<")!==0) {
	    	        			Ext.Msg.confirm(me.localize('error'), me.localize('errorNotXmlContinue'), function(buttonId) {
	    	        				if (buttonId=='yes') {
				    	        		me.loadCorpus(Ext.apply(api, {input: input}));
	    	        				}
	    	        			}, me);
	    	        		}
	    	        		else {
		    	        		me.loadCorpus(Ext.apply(api, {input: input}));
	    	        		}
	    	        	}
	    	        	else {
	    	        		Ext.Msg.show({
	    	        		    title:'No Text Provided',
	    	        		    message: 'Please provide text in the text box (or choose open or upload).',
	    	        		    buttons: Ext.Msg.OK,
	    	        		    icon: Ext.Msg.ERROR
	    	        		});
	    	        	}
	    	    	}
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
    
    loadForm: function(form) {
    	var params = {tool: this.getCorpus() ? 'corpus.CorpusMetadata' : 'corpus.CorpusCreator'};
    	if (this.getCorpus()) {
    		Ext.apply(params, {
    			corpus: this.getCorpus().getId(),
    			addDocuments: true
    		})
    	};
    	var apiParams = this.getApiParams();
    	delete apiParams.view;
    	delete apiParams.stopList;
    	Ext.apply(params, apiParams);
    	var view = this.getApplication().getViewport();
		view.mask(this.localize('uploadingCorpus'));
		form.submit({
			url: this.getTromboneUrl(),
			params: params,
			failure: function(form, action) { // we always fail because of content-type
            	view.unmask();
				if (action.result) {
					this.setCorpus(undefined)
					this.loadCorpus({corpus: action.result.corpus ? action.result.corpus.metadata.id : action.result.stepEnabledCorpusCreator.storedId});
				}
			},
			scope: this
		});
    },
   
    loadCorpus: function(params) {
    	if (this.getCorpus()) {
    		Ext.apply(params, {
    			corpus: this.getCorpus().getId(),
    			addDocuments: true
    		})
    	};
    	
    	var win = this.up("window");
    	if (win && win.isFloating()) {
    		win.close();
    	}
    	
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
    
    showOptionsClick: function(panel) {
    	var me = panel;
    	if (me.optionsWin === undefined) {
    		me.optionsWin = Ext.create('Ext.window.Window', {
    			title: me.localize('gearWinTitle'),
    			closeAction: 'hide',
//    			width: 500,
    			layout: 'fit',
    			bodyPadding: 10,
    			items: [{
    				xtype: 'form',
    				defaultType: 'textfield',
    				fieldDefaults: {
    					labelAlign: 'right',
    					labelWidth: 80,
    					width: 320
    				},
    				items: [
						{
						    xtype:'combo',
						    fieldLabel: me.localize('inputFormat'),
						    labelWidth: 90, // try to align with fieldset
						    name: 'inputFormat',
						    queryMode:'local',
						    store:[['',me.localize('inputFormatAuto')],['TEI',"TEI"],['RSS',"RSS"],['DToC',"DToC"]],
						    forceSelection:true,
						    value: ''
						},{
							xtype: 'container',
							html: '<p><i>'+new Ext.Template(me.localize('advancedOptionsText')).applyTemplate([me.getBaseUrl()+'docs/#!/guide/corpuscreator'])+'</i></p>',
							width: 375
						},{
	        				xtype: 'fieldset',
	                        title: "<a href='"+me.getBaseUrl()+"docs/#!/guide/corpuscreator-section-xml' target='voyantdocs'>"+me.localize('xmlOptions')+"</a>",
	                        collapsible: true,
	                        collapsed: true,
	                        defaultType: 'textfield',
	                        items: [
	                            {
	    							xtype: 'container',
	    							html: '<p><i>'+me.localize("xmlOptionsText")+'</i></p>',
	    							width: 375
	                            },{
									fieldLabel: me.localize('xpathContent'),
									name: 'xmlContentXpath'
								},{
									fieldLabel: me.localize('xpathTitle'),
									name: 'xmlTitleXpath'
								},{
									fieldLabel: me.localize('xpathAuthor'),
									name: 'xmlAuthorXpath'
								},{
									fieldLabel: me.localize('xpathDocuments'),
									name: 'xmlDocumentsXpath'
								},{
									fieldLabel: me.localize('xpathGroupBy'),
									name: 'xmlGroupByXpath'
								}
							]
						},/*{
	        				xtype: 'fieldset',
	                        title: "<a href='"+me.getBaseUrl()+"docs/#!/guide/corpuscreator-section-table' target='voyantdocs'>"+me.localize('tableOptions')+"</a>",
	                        collapsible: true,
	                        collapsed: true,
	                        defaultType: 'textfield',
	                        items: [
								{
									fieldLabel: me.localize('tableDocuments'),
									name: 'tableDocuments'
								},{
									fieldLabel: me.localize('tableContent'),
									name: 'tableContent'
								},{
									fieldLabel: me.localize('tableAuthor'),
									name: 'tableAuthor'
								},{
									fieldLabel: me.localize('tableTitle'),
									name: 'tableTitle'
								}
							]
						},*/{
	        				xtype: 'fieldset',
	                        title: "<a href='"+me.getBaseUrl()+"docs/#!/guide/corpuscreator-section-tokenization' target='voyantdocs'>"+me.localize('tokenizationOptions')+"</a>",
	                        collapsible: true,
	                        collapsed: true,
	                        items: [
								{
								    xtype:'combo',
								    fieldLabel: me.localize('tokenization'),
								    name: 'tokenization',
								    queryMode:'local',
								    store:[['',me.localize('tokenizationAuto')],['wordBoundaries',me.localize("tokenizationWordBoundaries")]],
								    forceSelection:true,
								    value: ''
								}
							]
						}
						
					]
    			}],
    			buttons: [{
    				text: me.localize('ok'),
    				handler: function(button, event) {
    					var win = button.findParentByType('window');
    					var form = win.down('form');
    					var params = form.getValues();
    					me.setApiParams(params);
    					win.hide();
    				}
    			},{
    				text: me.localize('cancel'),
    				handler: function(button, event) {
    					button.findParentByType('window').hide();
    				}
    			}]
    		});
    	}
    	me.optionsWin.show();
    }
    
});