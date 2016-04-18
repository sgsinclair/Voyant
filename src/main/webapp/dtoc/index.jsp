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
		name: 'VoyantDTOCApp',
		config: {
			baseUrl: '<%= new java.net.URL(request.getScheme(), request.getServerName(), request.getServerPort(), request.getContextPath()) %>/',
			version: '<%= application.getInitParameter("version") %>',
			build: '<%= application.getInitParameter("build") %>'
		},
		
		useIndex: true, // whether to check for and display the index
		
		launch: function() {
			if (this.useIndex) {
				// remove the index from the count
				Voyant.data.model.Corpus.override({
					getDocumentsCount: function() {
						var count = this.callParent(arguments)-1;
			        	return count;
			        }
			    });
				
				Voyant.data.store.Documents.override({
					getDocument: function(config) {
						if (this.getCorpus().getDocumentsCount()!=this.getTotalCount()-1) {
				            var dfd = Voyant.application.getDeferred();
				            var me = this;
				            this.load({
				                scope: this,
				                callback: function(records, operation, success) {
				                    if (success) {dfd.resolve(this.getDocument(config));}
				                    else {
				                        Voyant.application.showResponseError(this.localize('failedGetDocuments'), response);
				                        dfd.reject(); // don't send error since we've already shown it
				                    }
				                }
				            });
				            return dfd.promise();
				        }
				        return Ext.isNumber(config) ? this.getAt(config) : this.getById(config);
					}
				});
			}
			
			Ext.create('Ext.container.Viewport', {
			    layout: 'border',
			    cls: 'dtoc-body',
			    layout: 'fit',
			    items: [{
			    	xtype: 'dtoc'
			    }]
			});
			this.callParent(arguments);
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

<link href="annotator/annotator.min.css" rel="stylesheet" type="text/css" />
<link href="annotator/dtoc.annotator.css" rel="stylesheet" type="text/css" />
<script src="annotator/annotator-full.min.js"></script>
<script src="annotator/dtoc.annotator.auth.js"></script>
<script src="annotator/dtoc.annotator.js"></script>

<link href="css/dtc.css" rel="stylesheet" type="text/css" />
<title>Dynamic Table of Contexts</title>
</head>
<body>
</body>
</html>