<%

String query = request.getQueryString();
String[] parts = request.getRequestURI().substring(request.getContextPath().length()+1).split("/");
if (parts.length<2) {
	response.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);
	response.setHeader("Location", request.getContextPath()+"/"+(query!=null ? "?"+query : ""));
	return;
}
String corpus = parts[1];

%><%@ include file="../resources/jsp/pre_app.jsp" %>
	
<script type="text/javascript" src="../../resources/voyant/current/voyant.jsp<%= (request.getParameter("debug")!=null ? "?debug=true" : "") %>"></script>
	
<script>
	Ext.Loader.setConfig({
		enabled : true,
		paths : {
			'Voyant' : '../../app',
			'resources': '../../resources',
			'Ext.chart': '../../resources/ext/current/chart'
		}
	});
	Ext.application({
		extend : 'Voyant.VoyantDefaultApp',
		requires: ['Voyant.panel.VoyantHeader','Voyant.panel.Catalogue','Voyant.panel.VoyantFooter'],
		name : 'VoyantToolApp',
		config: {
			baseUrl: '<%= new java.net.URL(request.getScheme(), request.getServerName(), request.getServerPort(), request.getContextPath()) %>/',
			version: '<%= application.getInitParameter("version") %>',
			build: '<%= application.getInitParameter("build") %>',
			corpusId: '<%= corpus %>'
		},
		launch: function() {
			this.setApiParam('corpus', this.getCorpusId())
			this.setApiParam('view', 'catalogue');
			this.callParent(arguments);
		}
	});
	
</script>
<title>Voyant Tools - <%= corpus %></title>
<%@ include file="../resources/jsp/post_app.jsp" %>