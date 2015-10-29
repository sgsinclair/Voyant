<%@ include file="../resources/jsp/pre_app.jsp" %>
	
<script type="text/javascript" src="../resources/voyant/current/voyant.jsp<%= (request.getParameter("debug")!=null ? "?debug=true" : "") %>"></script>
	
<script>
	Ext.Loader.setConfig({
		enabled : true,
		paths : {
			'Voyant' : '../app',
			'resources': '../resources'
		}
	});
	Ext.application({
		extend : 'Voyant.VoyantToolApp',
		requires: ['Voyant.panel.VoyantHeader','Voyant.panel.Catalogue','Voyant.panel.VoyantFooter'],
		name : 'VoyantToolApp',
		config: {
			baseUrl: '<%= new java.net.URL(request.getScheme(), request.getServerName(), request.getServerPort(), request.getContextPath()) %>/',
			version: '<%= application.getInitParameter("version") %>',
			build: '<%= application.getInitParameter("build") %>',
			tool: 'catalogue'
		},
		launch: function() {
			if (this.hasQueryToLoad()) {
				this.callParent(arguments);
			}
		}
	});
	
</script>
<title>Voyant Tools</title>
<%@ include file="../resources/jsp/post_app.jsp" %>