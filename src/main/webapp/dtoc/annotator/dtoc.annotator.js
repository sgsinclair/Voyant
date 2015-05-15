Ext.define('Voyant.panel.DToC.AnnotatorPanel', {
	extend: 'Ext.panel.Panel',
	requires: [],
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.dtocAnnotator',
    config: {
    	corpus: undefined
    },
    statics: {
    },
    
    annotator: null,
    
	store: null,
	tpl: null,
	
	_doingExport: false,
	_docsToExport: [],
	_annotationsForExport: [],
	_progressBar: null,
	_progressWin: null,
	
	constructor: function(config) {
		this.annotator = Ext.create('Voyant.tool.DToC.AnnotatorBridge');
		
		this.store = Ext.create('Ext.data.JsonStore', {
			fields: [
				{name: 'created'},
				{name: 'updated'},
				{name: 'id'},
				{name: 'links'},
				{name: 'permissions'},
				{name: 'quote'},
				{name: 'shortQuote'},
				{name: 'ranges'},
				{name: 'tags'},
				{name: 'text'},
				{name: 'shortText'},
				{name: 'uri'},
				{name: 'user'},
				{name: 'consumer'}
			]
		});
		
		this.tpl = new Ext.XTemplate(
			'<tpl for=".">',
			'<div class="row">',
				'<div class="annoInfo">',
					'<span class="quote">&ldquo;{shortQuote}&rdquo;</span><br/>',
					'By <span class="user">{user}</span> on <span class="date">{created:date("Y-m-d, g:ia")}</span>',
				'</div>',
				'<div class="annoTags">',
					'<tpl for="tags">',
					'<span class="tag">{.}</span> ',
					'</tpl>',
				'</div>',
				'<div class="annoText shortText">{shortText}</div>',
				'<div class="annoText longText hide">{text}</div>',
			'</div>',
			'</tpl>'
		);
		
		Ext.apply(config, {
			layout: 'fit',
			tools: null,
			tbar: new Ext.Toolbar({
		    	cls: 'dtc-toolbar',
		    	hideBorders: true,
		    	items: [{
		    		xtype: 'tbtext',
		    		text: 'Filter',
		    		style: 'color: #231F20;'
		    	},' ',{
			    	xtype: 'textfield',
			    	itemId: 'filter',
			    	width: 120,
			    	enableKeyEvents: true,
			    	listeners: {
			    		keyup: function(field, event) {
		    				var value = this.getDockedItems('toolbar #filter')[0].getValue();
		    				if (value == '') {
		    					this.store.clearFilter();
		    				} else {
		    					this.store.filter('text', new RegExp('.*'+value+'.*', 'i'));
		    				}
			    		},
			    		scope: this
			    	}
			    }, '->', {
			    	itemId: 'export',
			    	xtype: 'button',
			    	text: 'Export',
			    	handler: function() {
			    		this.export();
			    	},
			    	scope: this
			    }]
		    }),
			items: [{
				itemId: 'viewer',
				xtype: 'dataview',
				tpl: this.tpl,
				store: this.store,
				border: false,
				autoScroll: true,
				itemSelector: 'div.row',
				overItemCls: 'over',
				selectedItemCls: 'selected',
				emptyText: '<div class="row">No annotations to display.</div>',
				listeners: {
					itemclick: function(view, record, el, index, e) {
						if (index !== -1) {
							el = Ext.get(el);
							el.child('.longText').toggleCls('hide');
							el.child('.shortText').toggleCls('hide');
							
							var range = record.get('ranges')[0];
							var parent = Ext.get('dtcReaderContainer');
							var result = document.evaluate('/'+range.start, parent.dom.firstChild, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
							if (result !== null) {
								Ext.get(result).scrollIntoView(parent).frame('#F47922', 1, { duration: 1000 });
							}
						}
					},
					scope: this
				}
			},{
				itemId: 'annotatorLoginButton',
				xtype: 'button',
				text: 'Annotator Login',
				tooltip: 'This will take you to the login page. You must reload DToC after logging in.',
				tooltipType: 'title',
				style: 'margin: 10px auto;',
				handler: function() {
					window.open('http://annotateit.org/user/login');
				}
			}]
		});
		
		this.callParent(arguments);
		this.mixins['Voyant.panel.Panel'].constructor.apply(this, [Ext.apply(config, {includeTools: {}})]);
	},
	initComponent: function() {
        var me = this;
        
        me.callParent(arguments);
    },
    
	listeners: {
		dtcAnnotationsLoaded: function (src, data) {
			if (this._doingExport) {
				this._annotationsForExport.push(data.annotations);
				this._doExport();
			} else {
				this.toggleView.call(this);
				
				for (var i = 0; i < data.annotations.length; i++) {
					var a = data.annotations[i];
					a.shortText = a.text;
					if (a.shortText.length > 50) {
						a.shortText = a.shortText.substring(0, a.shortText.indexOf(' ', 40)) + '&hellip;';
					}
					a.shortQuote = a.quote;
					if (a.shortQuote.length > 50) {
						a.shortQuote = a.shortQuote.substring(0, a.shortQuote.indexOf(' ', 40)) + '&hellip;';
					} 
				}
				this.store.loadData(data.annotations);
			}
		},
		dtcDocumentLoaded: function(src, data) {
			var app = this.getApplication();
			var base = app.getBaseUrl();
			var uri = 'http://voyant-tools.org/'+'?skin=dtc&corpus='+app.getCorpus().getId()+'&docId='+data.docId;
			
			this.annotator.loadAnnotationsForDocId(uri);
		},
		activate: function () {
			this.toggleView();
		}
	},
	
	export: function() {
		this._doingExport = true;
		this._docsToExport = this.getApplication().getCorpus().getDocuments().keys.slice(0);
		this._annotationsForExport = [];
		
		if (this._progressWin === null) {
			this._progressBar = new Ext.ProgressBar({
				width: 300
			});
			this._progressWin = new Ext.Window({
	            title: 'Exporting Annotations',
	            layout: 'fit',
	            width: 300,
	            autoHeight: true,
	            closeAction: 'close',
	            modal: true,
	            plain: true,
	            items: [this._progressBar]
	    	});
		}
		this._progressBar.updateProgress(0);
		this._progressWin.show();
		
		this._doExport();
	},
	_doExport: function() {
		var docId = this._docsToExport.shift();
		if (docId !== undefined) {
			var totalDocs = this.getApplication().getCorpus().getDocuments().length;
			var percentage = Math.abs(this._docsToExport.length - totalDocs) / totalDocs;
			this._progressBar.updateProgress(percentage);
			this.annotator.loadAnnotationsForDocId(docId);
		} else {
			this._progressBar.updateProgress(1);
			this._progressWin.hide();
			this._doingExport = false;
			var xml = this._processAnnotationsForExport(this._annotationsForExport);
			window.open('data:text/xml;charset=utf-8,'+encodeURIComponent(xml));
		}
	},
	_processAnnotationsForExport: function(annos) {
		var xml = '<?xml version="1.0" encoding="UTF-8"?>\n<annotations>\n';
		
		function convertEntities(value) {
			return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#039;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		}
		
		for (var i = 0; i < annos.length; i++) {
			var doc = annos[i];
			for (var j = 0; j < doc.length; j++) {
				var a = doc[j];
				var range = a.ranges[0];
				var containerId = this.annotator.containerId;
				
				xml += '  <annotation>\n';
				xml += '    <quote>'+convertEntities(a.quote)+'</quote>\n';
				xml += '    <text>'+convertEntities(a.text)+'</text>\n';
				xml += '    <created>'+convertEntities(a.created)+'</created>\n';
				xml += '    <updated>'+convertEntities(a.updated)+'</updated>\n';
				xml += '    <user>'+convertEntities(a.user)+'</user>\n';
				xml += '    <consumer url="'+convertEntities(a.links[0].href)+'">annotateit</consumer>\n';
				xml += '    <uri content="'+convertEntities(a.uri)+'" />\n';
				if (range) {
					xml += '    <range>\n';
					xml += '      <rangeParent>//*[@id="'+containerId+'"]/div</rangeParent>\n';
					xml += '      <start>'+range.start+'</start>\n';
					xml += '      <startOffset>'+range.startOffset+'</startOffset>\n';
					xml += '      <end>'+range.end+'</end>\n';
					xml += '      <endOffset>'+range.endOffset+'</endOffset>\n';
					xml += '    </range>\n';
				}
				xml += '  </annotation>\n';
			}
		}
		
		xml += '</annotations>';
		return xml;
	},
	toggleView: function() {
		if (this.annotator.isAuthenticated()) {
			this.getComponent('annotatorLoginButton').hide();
			this.getComponent('viewer').show();
			this.getDockedItems('toolbar #export')[0].show();
		} else {
			this.getComponent('viewer').hide();
			this.getDockedItems('toolbar #export')[0].hide();
			this.getComponent('annotatorLoginButton').show();
		}
	}
});

Ext.define('Voyant.tool.DToC.AnnotatorBridge', {
	alias: 'widget.dtocAnnotatorBridge',	
	id: 'dtcAnnotatorBridge',
	containerId: 'dtcReaderContainer',
	annotator: null,
	firstInit: true,
	showLoginWindow: true,
	adjustForToolbar: true, // should we adjust height values for the Annotator toolbar? (should only do once)
	
	isAuthenticated : function() {
		return this.annotator.plugins.Auth.haveValidToken();
	},
	
	getApplication : function() {
		return Ext.getCmp('dtcAnnotator').getApplication();
	},
	
	constructor : function(config) {
		config = config || {};
		
		this.loginWin = new Ext.Window({
            title: 'Annotator Authentication',
            modal: true,
            closeAction: 'hide',
            width: 300,
            autoHeight: true,
            items: {
                xtype: 'form',
                labelAlign: 'right',
                labelWidth: 200,
                border: false,
                bodyStyle: 'padding:5px;',
                items: [{
                    xtype: 'container',
                    html: '<p>You need to log in to see annotations. Click the button below to be taken to the Annotator login page.</p>'
                },{
                    xtype: 'button',
                    text: 'Annotator Login',
                    handler: function() {
                        window.open('http://annotateit.org/user/login');
                    },
                    scope: this
                },{
                    xtype: 'container',
                    html: '<p>After logging in you must then reload the Dynamic Table of Contexts.</p>'
                },{
                    xtype: 'container',
                    html: '<hr style="border: none; border-top: 1px solid #ccc; width: 90%;" />'
                },{
                    xtype: 'checkbox',
                    itemId: 'showMsg',
                    fieldLabel: 'Stop showing this message',
                    checked: !this.showLoginWindow
                }],
            },
            buttons: [{
                text: 'Ok',
                handler: function() {
                    var form = this.loginWin.findByType('form')[0];
                    this.showLoginWindow = !form.getComponent('showMsg').getValue();
                    this.loginWin.hide();
                },
                scope: this
            }]
        });
		
		function onEditorShown(event, editor) {
			
		}
		
		function onViewerShown(viewer, anno) {
			var $viewer = $('.annotator-viewer li', '#dtcReaderContainer');
			var $parent = $('#dtcReaderContainer');
			if ($viewer.offset().top < $parent.offset().top) {
				$viewer.parents('.annotator-viewer').addClass('annotator-invert-y');
			}
			if ($viewer.offset().left + $viewer.outerWidth() > $parent.offset().left + $parent.outerWidth()) {
				$viewer.parents('.annotator-viewer').addClass('annotator-invert-x');
			}
		}
		
		function onAnnotationsLoaded(annos) {
			this.getApplication().dispatchEvent('dtcAnnotationsLoaded', this, {annotations: annos});
		}
		
		function onAnnotationCreated(anno) {
			// TODO trigger reload in annotations panel
			Ext.toast('The annotation was successfully created.', 'Annotation Created');
		}
		
		function onAnnotationUpdated(anno) {
			Ext.toast('The annotation was successfully updated.', 'Annotation Updated');
		}
		
		function onAnnotationDeleted(anno) {
			if (anno.id !== undefined) {
				Ext.toast('The annotation was successfully deleted.', 'Annotation Deleted');
			}
		}
		
		function onAuthenticationFailed() {
		    if (this.showLoginWindow) {
		        this.loginWin.show();
		    }
		}
		
		function initAnnotator(uri) {
			if (this.annotator !== null) {
				// TODO none of this is working
				this.annotator.removeEvents();
				this.annotator.destroy();
				this.annotator = null;
			}
			
			this.annotator = new Annotator($('#'+this.containerId));
			
			this.annotator.addPlugin('Auth', {
				//tokenUrl: Voyeur.application.getBaseUrl() + 'token'
				tokenUrl: 'http://annotateit.org/api/token'
			});
			this.annotator.addPlugin('Store', {
				prefix: 'http://annotateit.org/api',
				annotationData: {
					uri: uri
				},
				loadFromSearch: {
					uri: uri
				}
			});
			this.annotator.addPlugin('Tags');
//			this.annotator.addPlugin('Filter', {
//				addAnnotationFilter: true,
//				filters: [{
//					label: 'Tag',
//					property: 'tags',
//					isFiltered: function(input, tags) {
//						if (input && tags && tags.length) {
//							console.log(this, input, tags);
//							var keywords = input.split(/\s+/g);
//							for (var i = 0; i < keywords.length; i += 1) {
//								for (var j = 0; j < tags.length; j += 1) {
//									if (tags[j].indexOf(keywords[i]) !== -1) {
//										return true;
//									}
//								}
//							}
//						}
//						return false;
//					}
//				}]
//			});
			this.annotator.addPlugin('Permissions');
			
			if (this.firstInit) {
				// TODO events are persisting
				this.annotator.on('annotationEditorShown', onEditorShown.createDelegate(this))
				this.annotator.on('annotationViewerShown', onViewerShown.createDelegate(this))
				this.annotator.on('annotationsLoaded', onAnnotationsLoaded.createDelegate(this));
				this.annotator.on('annotationCreated', onAnnotationCreated.createDelegate(this));
				this.annotator.on('annotationUpdated', onAnnotationUpdated.createDelegate(this));
				this.annotator.on('annotationDeleted', onAnnotationDeleted.createDelegate(this));
				this.annotator.on('authenticationFailed', onAuthenticationFailed.createDelegate(this));
				
				this.firstInit = false;
			}
			
			if (this.adjustForToolbar) {
				var paddingTop = parseInt($('html').css('paddingTop'));
				var header = Ext.getCmp('header');
				header.setHeight(header.getHeight() + paddingTop);
				header.body.first().setStyle('marginTop', paddingTop+'px');
				this.getApplication().getViewport().doLayout(false, true);
				
				this.adjustForToolbar = false;
			}
			$('html').removeAttr('style'); // inserted by Annotator for toolbar
		}

		this.loadAnnotationsForDocId = function(uri) {
			// need to destroy and recreate annotator each time in order to load annos from new uri
			initAnnotator.createDelegate(this, [uri])();
			
//			this.annotator.plugins.Store.options.annotationData.uri = uri;
//			this.annotator.plugins.Store.loadAnnotationsFromSearch();
			
//			this.annotator.load({
//				uri: uri
//			});
		};
		
		// override mousePosition function so we always use the containerId container as the offsetEl
		// see https://github.com/okfn/annotator/issues/243
		Annotator.Util.mousePosition = function(e, offsetEl) {
			var container = $('#dtcReaderContainer');
			var offset = container.offset();
			var scrollTop = container.scrollTop();
			// substract padding as well
			var paddingTop = parseInt(container.css('padding-top'));
			var paddingLeft = parseInt(container.css('padding-left'));
			return {
				top : e.pageY - offset.top - paddingTop - 20 + scrollTop,
				left : e.pageX - offset.left - paddingLeft
			};
		};
	}
});