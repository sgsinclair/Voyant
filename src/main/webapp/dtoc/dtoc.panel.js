Ext.define('Voyant.panel.DToC', {
	extend: 'Ext.panel.Panel',
	requires: [],
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.dtoc',
    config: {
    	corpus: undefined,
    	annotator: undefined
    },
    statics: {
        api: {
        }
    },
    
	isCurator: false,
    
    showFreqInReader: false,
    
    settingsWin: null,
    helpWin: null,
    
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
    	if (this.showFreqInReader) {
			Ext.QuickTips.enable();
		} else {
			Ext.QuickTips.disable();
		}
    },
    
    initComponent: function() {
        var me = this;
        
        var headerMargins = '10 10 0 10';
        
        var dtcToolsConfig = [{
			title: 'Index',
			id: 'dtcIndex',
			xtype: 'dtocIndex'
		},{
			title: 'Tags',
			id: 'dtcMarkup',
			xtype: 'dtocMarkup'
		},{
			title: 'Stats',
			id: 'dtcStats',
			xtype: 'dtocStats'
		},{
			title: 'Annotations',
			id: 'dtcAnnotator',
			xtype: 'dtocAnnotator'
		}];
        
        Ext.apply(me, {
        	layout: 'border',
        	header: false,
        	defaults: {
        		unstyled: true
        	},
            items: [{
        		region : 'north',
        		id: 'header',
        		height: 60,
        		defaults: {
        			height: 60
        		},
        		margin: headerMargins,
        		layout: 'column',
        		items: [{
        			html: '<h1>Dynamic Table of Contexts</h1>',
        			width: 185
        		},{
        			columnWidth: 1,
        			padding: '0 0 0 5px',
        			html: '<div id="headerBookName" class="headerRow">Regenerations: Canadian Women&rsquo;s Writing/&Eacute;criture des femmes au Canada.</div><div id="headerAuthor" class="headerRow">Ed. Marie Carri&egrave;re and Patricia Demers.</div>'
        		},{
        			width: 285,
        			style: {
        				textAlign: 'right'
        			},
        			html: '<div class="headerRow">'+
        			'<a href="http://inke.ca/" target="_blank"><img src="images/inke_logo_small.png" title="INKE Logo" /></a>'+
        			'<a href="http://cwrc.ca/" target="_blank"><img src="images/cwrc_logo_small.png" title="CWRC Logo" style="margin-left: 8px;" /></a>'+
        			'<a href="http://www.uap.ualberta.ca/" target="_blank"><img src="images/uap_logo_small.png" title="UAP Logo" style="margin-left: 8px;" /></a>'+
        			'<a href="http://voyant-tools.org/" target="_blank"><img src="images/voyant_small.png" title="Voyant Logo" style="margin-left: 8px;" /></a>'+
        			'</div>'
        		}]
        	},{
        		id: 'dtcContainer',
        		region: 'center',
        		margin: '10 0 10 10',
        		layout: {
        			type: 'hbox',
        			align: 'stretch'
        		},
        		items: [{
        			id: 'dtcTools',
        			width: 300,
        			minWidth: 24, // needed for hboxfitsplit layout
        			xtype: 'tabpanel',
//        			plugins: new Ext.ux.plugins.PanelCollapseHorizontal({
//        				headerText: 'Index & Tags',
//                        showCollapseTool: false
//                    }),
        			baseCls: 'x-plain dtc-panel',
        			deferredRender: false,
        			activeTab: 0,
        			items: dtcToolsConfig
        		},{xtype: 'splitter', width: 10},{
        			title: 'Table of Contents',
        			id: 'dtcToc',
        			xtype: 'dtocToc',
//        			plugins: new Ext.ux.plugins.PanelCollapseHorizontal({
//                        showCollapseTool: false
//                    }),
        			width: 250,
        			minWidth: 24 // needed for hboxfitsplit layout
        		},{xtype: 'splitter', width: 10},{
        			flex: 1,
        			minWidth: 350,
        			layout: 'hbox',
        			layoutConfig: {
        				pack: 'start',
        				align: 'stretch'
        			},
        			collapsible: false,
        			defaults: {
//        				baseCls: 'x-plain dtc-panel'
        			},
        			items: [{
        				id: 'dtcDocModel',
        				xtype: 'dtocDocModel',
        				title: '',
        				width: 48,
        				margin: '0 10 0 0',
        				padding: '5 3'
        			},{
        				id: 'dtcReader',
        				xtype: 'dtocReader',
        				title: 'Chapter Title',
        				flex: 1,
        				includeTools: {
        					gear: true,
        					help: true,
        					code: {
        		    			type: 'code',
        		    			tooltip: 'Get XML for current chapter',
        		    			callback: this.showXML.bind(this),
        		    			xtype: 'toolmenu',
        		    			glyph: 'xf121@FontAwesome'
        		    		}
        				},
        				helpToolClick: this.showHelp.bind(this),
        				showOptionsClick: this.showSettings.bind(this)
        			}]
        		},{xtype: 'splitter', width: 10},{
        			xtype: 'container',
        			html: '<div></div>',
        			width: 1,
        			minWidth: 1
        		}]
        	}]
        });
        
        me.callParent(arguments);
    },
    
    setDTCMode: function(isCurator) {
    	this.isCurator = isCurator;
    	
    	var treeData = Ext.getCmp('dtcToc').exportDocNodes();
    	var tagData = Ext.getCmp('dtcMarkup').exportTagData();
    	var savedTags = Ext.getCmp('dtcMarkup').savedTags; // TODO remove this
		
		var dtcTools = Ext.getCmp('dtcTools');
		dtcTools.remove(Ext.getCmp('dtcMarkup'), true);

		var dtcContainer = Ext.getCmp('dtcContainer');
		
		//dtcContainer.getLayout().removeSplits();
		
		dtcContainer.remove(Ext.getCmp('dtcToc'), true);    		
		dtcContainer.insert(2, {
			title: 'Table of Contents',
			id: 'dtcToc',
			xtype: 'dtocToc',
			isCurator: isCurator,
			doInit: true,
			initData: treeData,
//			plugins: new Ext.ux.plugins.PanelCollapseHorizontal({
//                showCollapseTool: false
//            }),
			width: 250,
			minWidth: 24 
		});
		
		Ext.getCmp('dtcDocModel').buildProspect();
		
		var xtype = 'dtocMarkup';
		if (isCurator) {
			xtype += 'Curator';
		}
		dtcTools.insert(1, {
			title: 'Tags',
			id: 'dtcMarkup',
			xtype: xtype
		});
		
		var dtcMarkup = Ext.getCmp('dtcMarkup');
		dtcMarkup.setCorpus(this.getApplication().getCorpus());
		if (isCurator) {
			dtcMarkup.savedTags = savedTags;
			dtcMarkup.store.loadData(tagData, false);
		} else {
			dtcMarkup.curatedTags = {};
			dtcMarkup.tagTotals = {};
			dtcMarkup.savedTags = {};
			for (var i = 0; i < tagData.length; i++) {
				var tag = tagData[i];
				dtcMarkup.curatedTags[tag.tagName] = tag;
			}
			dtcMarkup.store.loadData(tagData, false);
			dtcMarkup.loadAllTags();
		}
		
		if (isCurator) {
			dtcTools.setWidth(500);
		} else {
			dtcTools.setWidth(250);
		}
		this.getApplication().getViewport().doLayout();
		
		if (isCurator) {
			Ext.getCmp('dtcTools').setActiveTab('dtcMarkup');
		}
    },
    
    showSettings: function(panel) {
    	if (this.settingsWin == null) {
	    	this.settingsWin = Ext.create('Ext.window.Window', {
				title: 'Settings',
				modal: true,
				closeAction: 'hide',
				width: 400,
				bodyPadding: 5,
				items: {
					xtype: 'form',
					items: [{
						fieldLabel: 'Chapter Titles',
						itemId: 'titles',
						xtype: 'combo',
						width: 335,
						labelAlign: 'right',
						labelWidth: 135,
						store: new Ext.data.ArrayStore({
				    		fields: ['mode', 'title'],
				    		data: [[0, 'Full Titles'],
				    		       [1, 'Condensed Titles with Pop-up']]
						}),
						selectOnFocus : true,
				        displayField: 'title',
				        valueField: 'mode',
				        queryMode: 'local',
				        editable: false,
				        forceSelection: true,
				        triggerAction: 'all',
				        listeners: {
				        	change: function(field, newval, oldval) {
				        		// only full titles allowed for curator
				        		if (newval === 1) {
				        			var mode = field.up('form').down('#mode');
					        		if (mode.getValue() == 'curator') {
					        			field.setValue(0);
					        		}
				        		}
				        	},
				        	scope: this
				        }
					},{
						fieldLabel: 'Freq. Info in Reader',
						itemId: 'frequency',
						xtype: 'checkbox',
						labelAlign: 'right',
						labelWidth: 135,
						checked: this.showFreqInReader
					},{
						fieldLabel: 'Mode',
						itemId: 'mode',
						xtype: 'combo',
						width: 255,
						labelAlign: 'right',
						labelWidth: 135,
						store: new Ext.data.ArrayStore({
				    		fields: ['mode', 'title'],
				    		data: [['default', 'Default'],
				    		       ['curator', 'Curator']]
						}),
						selectOnFocus : true,
				        displayField: 'title',
				        valueField: 'mode',
				        queryMode: 'local',
				        editable: false,
				        forceSelection: true,
				        triggerAction: 'all',
				        listeners: {
				        	change: function(field, newval, oldval) {
				        		// only full titles allowed for curator
				        		if (newval === 'curator') {
					        		var form = field.up('form').down('#titles').setValue(0);
				        		}
				        	},
				        	scope: this
				        }
					},{
						xtype: 'container',
						html: '<hr style="border: none; border-top: 1px solid #ccc; width: 90%;" />'
					},{
						xtype: 'container',
						layout: {
							type: 'hbox',
							pack: 'center'
						},
						items: [{
							xtype: 'button',
							id: 'annotatorLoginButton',
							text: 'Annotator Login',
							tooltip: 'This will take you to the login page. You must reload DToC after logging in.',
							tooltipType: 'title',
							hidden: true,
							margins: '0 10 0 0',
							handler: function() {
								window.open('http://annotateit.org/user/login');
							},
							scope: this
						},{
							xtype: 'button',
							text: 'Export',
							handler: function() {
								this.doExport();
							},
							scope: this
						}]
					}],
					buttons: [{
		            	text: 'Ok',
						glyph: 'xf00c@FontAwesome',
		            	flex: 1,
		        		handler: function(btn) {
		        			var form = btn.up('form');
		        			var titles = form.getComponent('titles').getValue();
							
							this.showFreqInReader = form.getComponent('frequency').getValue();
							if (this.showFreqInReader) {
								Ext.QuickTips.enable();
							} else {
								Ext.QuickTips.disable();
							}
							
							var mode = form.getComponent('mode').getValue();
							if (mode == 'curator' && !this.isCurator) {
								titles = 0;
								this.setDTCMode(true);
							} else if (mode == 'default' && this.isCurator) {
								this.setDTCMode(false);
							}
							
							var dtcToc = Ext.getCmp('dtcToc').setTitlesMode(titles);
							
							btn.up('window').close();
		        		},
		        		scope: this
		            },{
		            	text: 'Cancel',
		                glyph: 'xf00d@FontAwesome',
		        		flex: 1,
		        		handler: function(btn) {
		        			btn.up('window').close();
		        		}
					}]
				}
			});
    	}
    	this.settingsWin.show();
    	var form = this.settingsWin.down('form');
    	
    	if (!Ext.getCmp('dtcAnnotator').annotator.isAuthenticated()) {
    		form.down('#annotatorLoginButton').show();
    	} else {
    		form.down('#annotatorLoginButton').hide();
    	}

    	var titlesMode = Ext.getCmp('dtcToc').getTitlesMode();
    	form.getComponent('titles').setValue(titlesMode);
    	
    	form.getComponent('mode').setValue(this.isCurator ? 'curator' : 'default');
	},
	
	showXML: function(panel) {
		var docId = Ext.getCmp('dtcReader').getCurrentDocId();
        var corpusId = panel.getCorpus().getId();
        var link = panel.getTromboneUrl()+'?tool=corpus.RawDocumentExporter&corpus='+corpusId+'&docId='+docId+'&outputFormat=xml';
        
        var anchor = Ext.get('dtcReaderXmlLink');
        if (anchor === null) {
            anchor = Ext.DomHelper.append(document.body, '<a id="dtcReaderXmlLink" href="'+link+'" target="_blank"></a>', true);
        } else {
            anchor.set({href: link});
        }
        var evt = document.createEvent('MouseEvent');
        evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        anchor.dom.dispatchEvent(evt);
	},
	
	showHelp: function(el) {
    	if (this.helpWin == null) {
	    	this.helpWin = Ext.create('Ext.window.Window', {
				title: 'Documentation',
				modal: true,
				closeAction: 'hide',
				width: 500,
				height: 400,
				layout: 'fit',
				items: {
					xtype: 'panel',
					border: false,
					html: '<div id="dtcDocumentationContainer"><div></div></div>'
				},
				listeners: {
					show: {
						fn: function() {
							Ext.get('dtcDocumentationContainer').first().load({
					    		url: Voyant.application.getBaseUrl()+'dtoc/dtc_documentation.htm'
					    	});
						},
						single: true
					}
				}
	    	});
    	}
	    this.helpWin.show(el);
    },
	
	doExport: function() {
    	var exportObj = {markup: [], toc: []};
    	
    	var tagData = Ext.getCmp('dtcMarkup').exportTagData();
    	exportObj.markup = tagData;
		
		var treeData = Ext.getCmp('dtcToc').exportDocNodes();
		for (var i = 0; i < treeData.length; i++) {
			var node = treeData[i];
			var doc = this.getCorpus().getDocument(node.docId);
			
			var docIndex = doc.getIndex();
			var origDocIndex = doc.record.get('origIndex');
			if (origDocIndex != null) {
				docIndex = origDocIndex; 
			}
			
			var obj = {
				t: node.text,
				d: docIndex
			};
			
			exportObj.toc.push(obj);
		}

		var exportString = Ext.encode(exportObj);
		
		var curatorId = new Date().getTime() + '.' + (Math.floor(Math.random() * (9999 - 1001)) + 1000);
		
		Ext.Ajax.request({
           url: this.getTromboneUrl(),
           params: {
        	   corpus: this.getCorpus().getId(),
        	   tool: 'ParamsData',
        	   store: true,
        	   data: curatorId,
        	   curatorData: exportString
           },
           success: function(response, options) {
				// TODO add original query params if necessary
				var params = {
					corpus: this.getCorpus().getId(),
					curatorId: curatorId
				};
				if (this.query.annotator != null) {
					params.annotator = this.query.annotator;
				}
				var url = this.getBaseUrl()+'?skin=dtc&'+Ext.urlEncode(params);
				
				var textarea = Ext.DomQuery.selectNode('textarea', Ext.Msg.getDialog().body.dom);
				textarea.originalFontFamily = textarea.style.fontFamily;
				textarea.originalWrap = textarea.originalWrap;
				textarea.style.fontFamily = 'monospace';
				textarea.setAttribute('wrap','off');
				
				var msg = '<p>'+ new Ext.Template(this.localize('tool.clickUrl')).apply([url])+'</p>';
				
				var msgBox = Ext.Msg.show({
					title: this.localize('tool.export'),
					msg: msg,
					value: url,
					width: Ext.getBody().getWidth()-50,
					buttons: Ext.MessageBox.OK,
					multiline: true,
					icon: Ext.MessageBox.INFO,
					fn: function() {
						textarea.style.fontFamily = textarea.originalFontFamily;
						textarea.setAttribute('wrap',textarea.originalWrap ? textarea.originalWrap : '');
					}
				});
			},
			failure: function() {
				Ext.Msg.show({
					title: 'Error',
					msg: 'There was an error generating the export link.',
					buttons: Ext.MessageBox.OK,
					icon: Ext.MessageBox.ERROR
				});
			},
			scope: this
	  });
	},
    
	listeners: {
		afterrender: function(container) {
				
		},
		loadedCorpus: function(src, corpus) {
			this.setCorpus(corpus);
		}
	}
});
