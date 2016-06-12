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
		},
		api: {
			view: 'corpusset',
			stopList: 'auto',
			panels: undefined,
			rtl: undefined
		}
	},
	
	listeners: {
    	loadedCorpus: function(src, corpus) {
    		this.viewport.down('voyantheader').collapse();
    		this.viewport.down('#toolsContainer').setActiveItem(1);
    		var corpusId = this.getCorpusId && this.getCorpusId() ? this.getCorpusId() : undefined;
    		if (window.history.pushState && !corpusId) {
    			// add the corpusId to the url
    			var corpusId = corpus.getAliasOrId();
        		var queryParams = Ext.Object.fromQueryString(document.location.search);
        		
    			var url = this.getBaseUrl()+'?corpus='+corpusId;
    			for (var key in queryParams) {
    				if (key !== 'corpus') {
    					var vals = Ext.isString(queryParams[key]) ? [queryParams[key]] : queryParams[key];
    					if (Ext.isArray(vals)) {
    						vals.forEach(function(val) {
    	    					url += '&'+key+'='+val;
    						})
    					}
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
		var queryParams = Ext.Object.fromQueryString(document.location.search) || {};
		var view = this.getApiParam('view', 'CorpusSet');
		var xtype = view.toLowerCase();
		if (!Ext.ClassManager.getByAlias("widget."+xtype) || queryParams.noskin) {
			Ext.Msg.show({
			    title: this.localize('noViewErrorTitle'),
			    message: new Ext.Template(this.localize(queryParams.noskin ? 'noViewKnownErrorTpl' : 'noViewErrorTpl')).apply({
			    	view: queryParams.noskin ? queryParams.noskin : view,
			    	additional: queryParams.noskin && queryParams.noskin == 'convert' ? this.localize(queryParams.noskin+'SkinMsg') : ''
			    }),
			    buttons: Ext.Msg.OK,
			    icon: Ext.Msg.ERROR
			});
			xtype = 'corpusset'; // switch to default view
		}
		var SPLIT_SIZE = 5;
		this.viewport = Ext.create('Ext.container.Viewport', {
		    layout: 'border',
		    rtl: this.getApiParam('rtl')!==undefined,
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
						type: 'vbox',
						pack: 'center',
						align: 'center'
					},
					items: [{
						xtype: 'corpuscreator'
					},{
						xtype: 'container',
						width: 800,
						html: "<div style='font-style: italic; text-align: center; margin-top: 10px;'><div>"+this.localize('voyantIs')+"</div>" + (this.localize('translatedBy').indexOf("English") == -1 ? "<div>"+this.localize('translatedBy')+"</div>" : "")
					}]	
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