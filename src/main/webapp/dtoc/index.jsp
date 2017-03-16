<%@ include file="../resources/jsp/pre_app.jsp" %>

<script src="wgxpath/wgxpath.install.js"></script>

<script>
	Ext.Loader.setConfig({
		enabled : true,
		paths : {
			'Voyant' : '../app',
			'resources': '../resources'
		}
	});
	
	Ext.application({
		extend : 'Voyant.VoyantCorpusApp',
		mixins: ['Voyant.util.Storage'],
		name: 'VoyantDTOCApp',
		config: {
			baseUrl: '<%= org.voyanttools.voyant.Voyant.getBaseUrlString(request) %>',
			version: '<%= application.getInitParameter("version") %>',
			build: '<%= application.getInitParameter("build") %>',
			allowInput: '<%= System.getProperty("org.voyanttools.server.allowinput")==null ? "" : System.getProperty("org.voyanttools.server.allowinput") %>'
		},
		
		useIndex: false, // whether display the index
		
		colors: {
			index: {
				dark: '#F47922',
				light: '#FBD7B2'
			},
			tag: {
				dark: '#249EF5',
				light: '#B1D6FB'
			},
			kwic: {
				dark: '#E324F5',
				light: '#FBB1FB'
			}
		},
		
		launch: function() {
			Ext.create('Ext.container.Viewport', {
                layout: 'border',
                cls: 'dtoc-body',
                layout: 'fit',
                items: []
            });
            this.callParent(arguments);
            
            if (!this.hasQueryToLoad()) {
				Ext.create('Ext.window.Window', {
					modal: true,
					header: false,
					
					items: [{
						xtype: 'voyantheader',
						width: '100%',
						title: "Dynamic Table of Contexts",
						moreTools: [],
						includeTools: [],
						collapsed: true
					}, {
						xtype: 'corpuscreator'}
					]
				}).show()
            }
            
            this.on('loadedCorpus', function(src, corpus) {
            	// check for existence of index
            	Ext.Ajax.request({
                    url: Voyant.application.getTromboneUrl(),
                    params: {
                        tool: 'corpus.DtocIndex',
                        corpus: corpus.getId()
                    },
                    callback: function(options, success, response) {
                        if (success) {
                        	var json = JSON.parse(response.responseText);
                            var indexText = json['org.voyanttools.trombone.tool.corpus.DtocIndex'].index;
                            
                            // FIXME server returns some xml even if there's no index
                            if (indexText.length > 0 && /target/.test(indexText)) {
	                            this.useIndex = true;
	                        }
                        }
                        
                        this.getViewport().on('afterlayout', function() {
                            this.dispatchEvent('loadedCorpus', this, corpus);
                        }, this, {single: true});
                        this.getViewport().add({xtype: 'dtoc'});
                    },
                    scope: this
                });
            }, this, {single: true});
		}
	});
</script>
<script src="dtoc.tooltip.js"></script>
<script src="dtoc.panel.js"></script>
<script src="dtoc.markup.js"></script>
<script src="dtoc.markup.curator.js"></script>
<script src="dtoc.index.js"></script>
<script src="dtoc.stats.js"></script>
<script src="dtoc.docmodel.js"></script>
<script src="dtoc.toc.js"></script>
<script src="dtoc.reader.js"></script>

<link href='http://fonts.googleapis.com/css?family=Nunito:300,400' rel='stylesheet' type='text/css' />

<!-- 
<link href="annotator/annotator.min.css" rel="stylesheet" type="text/css" />
<link href="annotator/dtoc.annotator.css" rel="stylesheet" type="text/css" />
<script src="annotator/annotator-full.min.js"></script>
<script src="annotator/dtoc.annotator.auth.js"></script>
<script src="annotator/dtoc.annotator.js"></script>
 -->

<link href="css/dtc.css" rel="stylesheet" type="text/css" />
<title>Dynamic Table of Contexts</title>
</head>
<body>
</body>
</html>