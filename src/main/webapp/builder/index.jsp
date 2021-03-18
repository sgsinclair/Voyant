<% request.setAttribute("title", "Voyant Tools - Skin Builder"); %>
<%@ include file="../resources/jsp/html_head.jsp" %>

<link href="css/builder.css" rel="stylesheet" type="text/css" />

<%@ include file="../resources/jsp/head_body.jsp" %>

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

</body>
</html>