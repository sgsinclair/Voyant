Ext.define('Voyant.VoyantDefaultApp', {
	extend : 'Voyant.VoyantCorpusApp',
	mixins: ['Voyant.util.Api'],
	name : 'VoyantDefaultApp',
	constructor: function() {
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
        this.callParent(arguments);
	},
	statics: {
		i18n: {
			'noViewErrorTitle': {en: "View Error"},
			'noViewErrorTpl': {en: 'No view was found with the name "{view}". You can <a href="{url}">try with the default view</a> instead'}
		},
		api: {
			view: 'corpusset',
			stopList: 'auto'
		}
	},
	
	listeners: {
    	loadedCorpus: function(src, corpus) {
    		this.viewport.down('voyantheader').collapse();
    		this.viewport.down('#toolsContainer').setActiveItem(1);
    		
    		if (window.history.pushState) {
    			// add the corpusId to the url
    			var corpusId = corpus.getId();
        		var queryParams = Ext.Object.fromQueryString(document.location.search);
        		
    			var url = this.getBaseUrl()+'?corpus='+corpusId;
    			for (var key in queryParams) {
    				if (key !== 'corpus') {
    					url += '&'+key+'='+queryParams[key];
    				}
    			}
    			window.history.pushState({
    				corpus: corpusId
    			}, 'Corpus: '+corpusId, url);
    		}
    	}
	},
	getViewComponent: function() {
		return this.viewport.down('#toolsContainer-main')
	},
	launch: function() {
		var view = this.getApiParam('view', 'CorpusSet');
		var xtype = view.toLowerCase();
		if (!Ext.ClassManager.getByAlias("widget."+xtype)) {
			var url = document.location.href.replace(/view=.*?&/,'');
			Ext.Msg.show({
			    title: this.localize('noViewErrorTitle'),
			    message: new Ext.Template(this.localize('noViewErrorTpl')).apply({view: view, url: url}),
			    buttons: Ext.Msg.OK,
			    icon: Ext.Msg.ERROR
			});
			return;
		}
		var SPLIT_SIZE = 5;
		this.viewport = Ext.create('Ext.container.Viewport', {
		    layout: 'border',
		    items: [{
		    	xtype: 'voyantheader',
		    	region: 'north'
		    },{
		        region: 'south',
		        xtype: 'voyantfooter'
		    },{
		    	region: 'center',
		    	layout: 'card',
		    	itemId: 'toolsContainer',
				activeItem: 0,
				items: [{
					xtype : 'container',
					layout: {
		                type: 'hbox',
		                pack: 'center'
		            },
					items: {
						xtype: 'corpuscreator'
					}
				},{
					layout: 'fit',
					itemId: 'toolsContainer-main',
					items: {
						xtype: xtype
					}
				}]
		    }]
		});
		this.callParent(arguments);
	}
});