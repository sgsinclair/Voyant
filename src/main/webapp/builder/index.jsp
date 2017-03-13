<%@ include file="../resources/jsp/pre_app.jsp" %>

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
        name: 'VoyantSkinBuilderApp',
        config: {
			baseUrl: '<%= org.voyanttools.voyant.Voyant.getBaseUrlString(request) %>',
            version: '<%= application.getInitParameter("version") %>',
            build: '<%= application.getInitParameter("build") %>',
			allowInput: '<%= System.getProperty("org.voyanttools.server.allowinput")==null ? "" : System.getProperty("org.voyanttools.server.allowinput") %>'
        },
        
        launch: function() {
            Ext.create('Ext.container.Viewport', {
                layout: 'fit',
                items: [{xtype: 'builder'}]
            });
            this.callParent(arguments);
        }
    });
</script>

<script src="Builder.js"></script>
<script src="TableGrid.js"></script>

<link href="css/builder.css" rel="stylesheet" type="text/css" />

<body>
</body>
</html>