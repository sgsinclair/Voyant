<%@ include file="../resources/jsp/pre_app.jsp" %>

<!-- <script src="https://hypothes.is/embed.js" async></script> -->

<script src="wgxpath/wgxpath.install.js"></script>

<script src="dtoc.app.js"></script>
<script src="dtoc.tooltip.js"></script>
<script src="dtoc.markup.loader.js"></script>
<script src="dtoc.markup.js"></script>
<script src="dtoc.markup.curator.js"></script>
<!-- <script src="annotator/dtoc.annotator.js"></script> -->
<script src="dtoc.index.js"></script>
<script src="dtoc.stats.js"></script>
<script src="dtoc.docmodel.js"></script>
<script src="dtoc.toc.js"></script>
<script src="dtoc.reader.iframe.js"></script>

<script>
Ext.Loader.setConfig({
	enabled : true,
	paths : {
		'Voyant' : '../app',
		'resources': '../resources'
	}
});

Ext.onReady(function(){
	Ext.application({
		extend : 'VoyantDTOCApp',
		name: 'VoyantDTOCApp',
		config: {
			baseUrl: '<%= org.voyanttools.voyant.Voyant.getBaseUrlString(request) %>',
			version: '<%= application.getInitParameter("version") %>',
			build: '<%= application.getInitParameter("build") %>',
			allowInput: '<%= System.getProperty("org.voyanttools.server.allowinput")==null ? "" : System.getProperty("org.voyanttools.server.allowinput") %>'
		},
		
		launch: function() {
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
						xtype: 'corpuscreator',
						addTextLabel: "This is a special interface for creating corpora to be used with the Dynamic Table of Contexts and documents are expected by default to have a schema that is compatible (see <a href='https://cwrc.ca/DToC_Documentation/#CreatingXMLDoc.html' target='_blank'>documentation</a>). You can use the <a href='../docs/#!/guide/corpuscreator-section-input-format' target='_blank'>options for corpus creation</a> to override default DToC format values or choose the Auto-detect input format and define the XPath queries that you wish to use.",
						listeners: {
							afterrender: function(cc) {
								cc.setApiParam('inputFormat', 'dtoc'); // make this default
							}
						}
					}]
				}).show();
            }
		}
	});
});
</script>

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