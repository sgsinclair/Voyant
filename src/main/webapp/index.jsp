<% if (request.getServerName().equals("dream.voyant-tools.org")) { 
        String query = request.getQueryString();
        response.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);
		response.setHeader("Location", "dream/"+(query!=null ? "?"+query : "?corpus=dream"));
        return;
   } %><%@ include file="resources/jsp/pre_app.jsp" %>
<script>
	Ext.Loader.setConfig({
		enabled : true,
		paths : {
			'Voyant' : 'app',
			'resources': 'resources'
		}
	});
</script>

<script type="text/javascript" src="resources/voyant/current/voyant.jsp<%= (request.getParameter("debug")!=null ? "?debug=true" : "") %>"></script>

<script>
Ext.onReady(function(){
	Ext.application({
		extend : 'Voyant.VoyantDefaultApp',
		name: 'VoyantDefaultApp',
		config: {
			baseUrl: '<%= new java.net.URL(request.getScheme(), request.getServerName(), request.getServerPort(), request.getContextPath()) %>/',
			version: '<%= application.getInitParameter("version") %>',
			build: '<%= application.getInitParameter("build") %>'			
		}
	});
});
</script>
<title>Voyant Tools</title>
<%@ include file="resources/jsp/post_app.jsp" %>
