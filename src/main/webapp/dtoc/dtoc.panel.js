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
    	i18n: {
    		'clickUrl' : 'Open this <a href="{0}" target="_blank">URL</a> in a new window.'
    	},
        api: {
        }
    },
    
    queryParameters: null,
    
	isCurator: false,
    
    showFreqInReader: false,
    
    loadInkeTags: false,
    
    settingsWin: null,
    helpWin: null,
    
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
    	if (Ext.isIE) {
	        wgxpath.install(); // document.evaluate / xpath support
	    }
    	
    	if (this.showFreqInReader) {
			Ext.QuickTips.enable();
		} else {
			Ext.QuickTips.disable();
		}
    	
    	this.queryParameters = Ext.urlDecode(window.location.search.substring(1));
    	if (this.queryParameters.inkeTags !== undefined) {
    		this.loadInkeTags = this.queryParameters.inkeTags == 'true';
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
		}
//		,{
//			title: 'Annotations',
//			id: 'dtcAnnotator',
//			xtype: 'dtocAnnotator'
//		}
		];
        
        if (this.getApplication().useIndex != true) {
        	dtcToolsConfig.splice(0,1); // remove index
        }
        
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
        			html: '<div id="headerBookName" class="headerRow"></div><div id="headerAuthor" class="headerRow"></div>'
        		},{
        			width: 285,
        			style: {
        				textAlign: 'right'
        			},
        			html: '<div class="headerRow">'+
        			// TODO if we're using an index, assume it's Regenerations (for now)
        			(this.getApplication().useIndex ?
        			'<a href="http://inke.ca/" target="_blank"><img src="images/inke_logo_small.png" title="INKE Logo" /></a>'+
        			'<a href="http://cwrc.ca/" target="_blank"><img src="images/cwrc_logo_small.png" title="CWRC Logo" style="margin-left: 8px;" /></a>'+
        			'<a href="http://www.uap.ualberta.ca/" target="_blank"><img src="images/uap_logo_small.png" title="UAP Logo" style="margin-left: 8px;" /></a>':'')+
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
        			title: 'Index & Tags',
        			header: {
        				hidden: true
        			},
        			id: 'dtcTools',
        			width: 300,
        			minWidth: 24, // needed for hboxfitsplit layout
        			xtype: 'tabpanel',
//        			plugins: new Ext.ux.plugins.PanelCollapseHorizontal({
//        				headerText: 'Index & Tags',
//                        showCollapseTool: false
//                    }),
        			cls: 'dtc-panel',
        			deferredRender: false,
        			activeTab: 0,
        			items: dtcToolsConfig,
        			animCollapse: false,
        			collapseDirection: 'left',
        			listeners: {
        				collapse: function(p) {
        					p.el.down('.x-panel-header').addCls('borderRadiusTop borderRadiusBottom');
        				}
        			}
        		},{
        			xtype: 'splitter',
        			width: 10,
        			listeners: {
        				afterrender: function(splitter) {
        					splitter.getEl().on('click', this.onSplitterClick.bind(this, splitter));
        				},
        				scope: this
        			}
        		},{
        			title: 'Table of Contents',
        			id: 'dtcToc',
        			xtype: 'dtocToc',
//        			bodyCls: 'borderRadiusBottom',
//        			plugins: new Ext.ux.plugins.PanelCollapseHorizontal({
//                        showCollapseTool: false
//                    }),
        			width: 250,
        			minWidth: 24, // needed for hboxfitsplit layout
        			animCollapse: false,
        			collapseDirection: 'left',
        			listeners: {
        				collapse: function(p) {
        					p.el.down('.x-panel-header').addCls('borderRadiusTop borderRadiusBottom');
        				}
        			}
        		},{
        			xtype: 'splitter',
        			width: 10,
        			listeners: {
        				afterrender: function(splitter) {
        					splitter.getEl().on('click', this.onSplitterClick.bind(this, splitter));
        				},
        				scope: this
        			}
        		},{
        			flex: 1,
        			minWidth: 350,
        			layout: 'hbox',
        			layoutConfig: {
        				pack: 'start',
        				align: 'stretch'
        			},
        			collapsible: false,
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
        					code: {
        		    			type: 'help', // hack to show all tools by default
        		    			tooltip: 'Get XML for Current Chapter',
        		    			callback: this.showXML.bind(this),
        		    			xtype: 'toolmenu',
        		    			margin: '0 10 0 0',
        		    			glyph: 'xf121@FontAwesome'
        		    		},
        					settings: {
        						type: 'help',
        						tooltip: 'Settings',
        						xtype: 'toolmenu',
        						callback: this.showSettings.bind(this),
        						margin: '0 10 0 0',
        						glyph: 'xf205@FontAwesome'
        					},
        					dtcHelp: {
        						type: 'help',
        						tooltip: 'Help',
        						xtype: 'toolmenu',
        						callback: this.showHelp.bind(this),
        						glyph: 'xf128@FontAwesome'
        					}
        				}
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
    
    getDataFromString: function(dataString) {    	
    	var data = null;
    	if (dataString == null && this.getApplication().useIndex && this.loadInkeTags == true) {
    		data = {markup:[{"tagName":"bibl","label":"bibliography","type":"t"},{"tagName":"date","label":"date","type":"t"},{"tagName":"event","label":"event","type":"t"},{"tagName":"note","label":"note","type":"t"},{"tagName":"orgName","label":"organization name","type":"t"},{"tagName":"persName","label":"person name","type":"t"},{"tagName":"placeName","label":"place name","type":"t"},{"tagName":"q","label":"quote","type":"t"},{"tagName":"ref[@target*='class_issue']","label":"class issue","type":"x"},{"tagName":"ref[@target*='nationality_issue']","label":"nationality issue","type":"x"},{"tagName":"ref[@target*='race_and_ethnicity']","label":"race and ethnicity","type":"x"},{"tagName":"ref[@target*='sexuality']","label":"sexuality","type":"x"},{"tagName":"ref[@target*='education']","label":"education","type":"x"},{"tagName":"ref[@target*='health_issue']","label":"health issue","type":"x"},{"tagName":"ref[@target*='history']","label":"history","type":"x"},{"tagName":"ref[@target*='politics']","label":"politics","type":"x"},{"tagName":"ref[@target*='violence']","label":"violence","type":"x"},{"tagName":"ref[@target*='gender_issue']","label":"gender issue","type":"x"},{"tagName":"ref[@target*='religion']","label":"religion","type":"x"},{"tagName":"ref[@target*='authorship']","label":"authorship","type":"x"},{"tagName":"ref[@target*='literary_schools']","label":"literary schools","type":"x"},{"tagName":"ref[@target*='writing_climate']","label":"writing climate","type":"x"},{"tagName":"ref[@target*='attitudes_to_women_writing']","label":"attitudes to women writing","type":"x"},{"tagName":"ref[@target*='place_of_publication']","label":"place of publication","type":"x"},{"tagName":"ref[@target*='editions']","label":"editions","type":"x"},{"tagName":"ref[@target*='anthologization']","label":"anthologization","type":"x"},{"tagName":"ref[@target*='manuscript_history']","label":"manuscript history","type":"x"},{"tagName":"ref[@target*='non-survival_of_text']","label":"non-survival of text","type":"x"},{"tagName":"ref[@target*='archive']","label":"archive","type":"x"},{"tagName":"ref[@target*='archival_location']","label":"archival location","type":"x"},{"tagName":"ref[@target*='non-book_media']","label":"non-book media","type":"x"},{"tagName":"ref[@target*='genre_drama']","label":"genre drama","type":"x"},{"tagName":"ref[@target*='genre_fiction']","label":"genre fiction","type":"x"},{"tagName":"ref[@target*='genre_journalism']","label":"genre journalism","type":"x"},{"tagName":"ref[@target*='genre_lifeWriting']","label":"genre life writing","type":"x"},{"tagName":"ref[@target*='genre_music']","label":"genre music","type":"x"},{"tagName":"ref[@target*='genre_novel']","label":"genre novel","type":"x"},{"tagName":"ref[@target*='genre_non-fiction']","label":"genre non-fiction","type":"x"},{"tagName":"ref[@target*='genre_poetry']","label":"genre poetry","type":"x"},{"tagName":"ref[@target*='genre_performance']","label":"genre performance","type":"x"},{"tagName":"ref[@target*='genre_short_story']","label":"genre short story","type":"x"},{"tagName":"ref[@target*='genre_scholarlyWriting']","label":"genre scholarly writing","type":"x"},{"tagName":"ref[@target*='genre_issue']","label":"genre issue","type":"x"},{"tagName":"ref[@target*='voice_or_narration']","label":"voice or narration","type":"x"},{"tagName":"ref[@target*='textual_strategies']","label":"textual strategies","type":"x"},{"tagName":"ref[@target*='characterization']","label":"characterization","type":"x"},{"tagName":"ref[@target*='intertextuality']","label":"intertextuality","type":"x"},{"tagName":"ref[@target*='theme_or_topic']","label":"theme or thopic","type":"x"},{"tagName":"ref[@target*='motif']","label":"motif","type":"x"},{"tagName":"ref[@target*='response_recent']","label":"response recent","type":"x"},{"tagName":"ref[@target*='response_re-evaluation']","label":"response re-evaluation","type":"x"},{"tagName":"ref[@target*='response_formal']","label":"response formal","type":"x"},{"tagName":"ref[@target*='response_informal']","label":"response informal","type":"x"},{"tagName":"ref[@target*='response_gendered']","label":"response gendered","type":"x"},{"tagName":"ref[@target*='recognitions']","label":"recognitions","type":"x"},{"tagName":"ref[@target*='censorship']","label":"censorship","type":"x"},{"tagName":"ref[@target*='authority']","label":"authority","type":"x"},{"tagName":"ref[@target*='economics']","label":"economics","type":"x"},{"tagName":"ref[@target*='men_writing']","label":"men writing","type":"x"},{"tagName":"ref[@target*='women_writing']","label":"women writing","type":"x"},{"tagName":"ref[@target*='textual_agency']","label":"textual agency","type":"x"},{"tagName":"ref[@target*='canon_formation']","label":"canon formation","type":"x"},{"tagName":"ref[@target*='critique_of_canon']","label":"critique of canon","type":"x"},{"tagName":"ref[@target*='intellectual_history']","label":"intellectual history","type":"x"},{"tagName":"ref[@target*='social_movement']","label":"social movement","type":"x"},{"tagName":"ref[@target*='close_reading']","label":"close reading","type":"x"},{"tagName":"ref[@target*='methodology']","label":"methodology","type":"x"},{"tagName":"ref[@target*='representation_of_women']","label":"representation of women","type":"x"},{"tagName":"ref[@target*='representation_of_men']","label":"representation of men","type":"x"},{"tagName":"ref[@target*='historical_oppression']","label":"historical oppression","type":"x"},{"tagName":"ref[@target*='technology']","label":"technology","type":"x"},{"tagName":"ref[@target*='collaboration']","label":"collaboration","type":"x"},{"tagName":"ref[@target*='theory']","label":"theory","type":"x"}],
    			        toc:[]};
    	} else if (dataString != null) {
	    	try {
				data = Ext.decode(dataString);
			} catch (e) {
				if (window.console) console.log(e);
			}
    	}
		
		if (data != null) {
			var dtcMarkup = Ext.getCmp('dtcMarkup');
			dtcMarkup.curatedTags = {};
			dtcMarkup.tagTotals = {};
			dtcMarkup.savedTags = {};
			for (var i = 0; i < data.markup.length; i++) {
				var tag = data.markup[i];
				dtcMarkup.curatedTags[tag.tagName] = tag;
			}
//			dtcMarkup.store.loadData(data.markup, false);
//			dtcMarkup.loadAllTags();
			
			if (data.toc && data.toc.length > 0) {
				var treeNodes = [];
				for (var i = 0; i < data.toc.length; i++) {
					var node = data.toc[i];
					var doc = this.getCorpus().getDocument(node.d);
					var docId = doc.getId();
					
					// check if docIndex matches doc order
					// if it doesn't, set the appropriate fields
					if (node.d != i) {
						
						if (doc.get('origIndex') === undefined) {
							// hack to add a new field
							Voyant.data.model.Document.prototype.fields.push(new Ext.data.Field({
								name: 'origIndex', type: 'int'
							}));
							doc.set('origIndex', node.d);
						}
						doc.set('title', node.t);
						doc.set('index', i);
					}
					
					treeNodes.push({
						text: node.t,
						docId: docId
					});
				}
				
				// TODO sorting messes things up
//				this.getCorpus().getDocuments().sort('index', 'ASC');
				
	//			console.debug(treeNodes);
				Ext.getCmp('dtcToc').initToc(treeNodes, true);
			}
		}
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
		this.getApplication().getViewport().updateLayout();
		
		if (isCurator) {
			Ext.getCmp('dtcTools').setActiveTab('dtcMarkup');
		}
    },
    
    setHeader: function() {
		Ext.get('headerBookName').setHtml(this.getCorpus().getTitle());
		Ext.get('headerAuthor').setHtml(this.getCorpus().getSubTitle());
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
					}
//					,{
//						xtype: 'container',
//						html: '<hr style="border: none; border-top: 1px solid #ccc; width: 90%;" />'
//					},{
//						xtype: 'container',
//						layout: {
//							type: 'hbox',
//							pack: 'center'
//						},
//						items: [{
//							xtype: 'button',
//							id: 'annotatorLoginButton',
//							text: 'Annotator Login',
//							tooltip: 'This will take you to the login page. You must reload DToC after logging in.',
//							tooltipType: 'title',
//							hidden: true,
//							margins: '0 10 0 0',
//							handler: function() {
//								window.open('http://annotateit.org/user/login');
//							},
//							scope: this
//						},{
//							xtype: 'button',
//							text: 'Export',
//							handler: function() {
//								this.doExport();
//							},
//							scope: this
//						}]
//					}
					],
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
    	
//    	if (!Ext.getCmp('dtcAnnotator').annotator.isAuthenticated()) {
//    		form.down('#annotatorLoginButton').show();
//    	} else {
//    		form.down('#annotatorLoginButton').hide();
//    	}

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
//    	if (this.helpWin == null) {
	    this.helpWin = this.openUrl("http://cwrc.ca/DToC_Documentation/")
//	    	Ext.create('Ext.window.Window', {
//				title: 'Documentation',
//				modal: true,
//				closeAction: 'hide',
//				width: 500,
//				height: 400,
//				layout: 'fit',
//				items: {
//					xtype: 'panel',
//					border: false,
//					html: '<div id="dtcDocumentationContainer"><div></div></div>'
//				},
//				listeners: {
//					show: {
//						fn: function() {
//							Ext.get('dtcDocumentationContainer').first().load({
//					    		url: Voyant.application.getBaseUrl()+'dtoc/dtc_documentation.htm'
//					    	});
//						},
//						single: true
//					}
//				}
//	    	});
//    	}
//	    this.helpWin.show(el);
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
			var origDocIndex = doc.get('origIndex');
			if (origDocIndex != null) {
				docIndex = origDocIndex; 
			}
			
			var obj = {
				t: node.text,
				d: docIndex
			};
			
			exportObj.toc.push(obj);
		}

		var curatorId = new Date().getTime() + '.' + (Math.floor(Math.random() * (9999 - 1001)) + 1000);
		
		var me = this;
		this.getApplication().storeResource(curatorId, exportObj).then(function() {
			// TODO add original query params if necessary
			var params = {
				corpus: me.getCorpus().getId(),
				curatorId: curatorId
			};

			var url = me.getBaseUrl()+'dtoc/?'+Ext.urlEncode(params);
			var msg = '<p>'+ new Ext.Template(me.localize('clickUrl')).apply([url])+'</p>';
			
			Ext.Msg.show({
				title: 'Export',
				message: msg,
				buttons: Ext.MessageBox.OK,
				value: url,
				multiline: true,
				width: Ext.getBody().getWidth()-50,
				icon: Ext.MessageBox.INFO
			});
		}, function() {
			Ext.Msg.show({
				title: 'Error',
				message: 'There was an error generating the export link.',
				buttons: Ext.MessageBox.OK,
				icon: Ext.MessageBox.ERROR
			});
		});
	},
    
	onSplitterClick: function(splitter, event, el) {
		var panel = splitter.prev();
		panel.toggleCollapse();
	},
	
	listeners: {
		afterrender: function(container) {
			
		},
		loadedCorpus: function(src, corpus) {
			this.setCorpus(corpus);
			this.setHeader();
			
			if (this.queryParameters.curatorId) {
				var me = this;
				this.getApplication().getStoredResource(this.queryParameters.curatorId).then(function(curatorString) {
					me.getDataFromString(curatorString);
				});
			} else {
				this.getDataFromString();
			}
		}
	}
});
