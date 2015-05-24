<%@ include file="../resources/jsp/pre_app.jsp" %>
<!--
<script type="text/javascript" src="<%= base %>/resources/ext/current/ext-all-debug.js"></script>
-->
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