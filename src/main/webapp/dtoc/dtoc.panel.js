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
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
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
        			html: '<div id="headerBookName" class="headerRow"><span>Book Name</span></div><div id="headerAuthor" class="headerRow"><span>Author Name</span></div>'
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
        				tools: [{
        				    type: 'plus',
        				    tooltip: 'Get XML',
        				    handler: function(event, toolEl, panel) {
//        				        var docId = Ext.getCmp('dtcReader').getCurrentDocId();
//        				        var corpusId = this.getCorpus().getId();
//        				        var link = this.getTromboneUrl()+'?tool=DocumentExporter&template=docExport2xml&corpus='+corpusId+'&docId='+docId+'&outputFormat=xml'
//        				        
//        				        var anchor = Ext.get('dtcReaderXmlLink');
//        				        if (anchor === null) {
//        				            anchor = Ext.DomHelper.append(document.body, '<a id="dtcReaderXmlLink" href="'+link+'" target="_blank"></a>', true);
//        				        } else {
//        				            anchor.set({href: link});
//        				        }
//        				        var evt = document.createEvent('MouseEvent');
//        				        evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
//        				        anchor.dom.dispatchEvent(evt);
        				    },
        				    scope: this
        				},{
        					type: 'gear',
        					tooltip: 'Options',
        					handler: function(event, toolEl, panel) {
//        						this.showSettings(toolEl);
        					},
        					scope: this
        				},{
        					type: 'help',
        					tooltip: 'Documentation',
        					handler: function(event, toolEl, panel) {
//        						this.showHelp(toolEl);
        					},
        					scope: this
        				}]
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
    
	listeners: {
		afterrender: function(container) {
				
		},
		loadedCorpus: function(src, corpus) {
			this.setCorpus(corpus);
		}
	}
});
