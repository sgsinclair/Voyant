<%

String query = request.getQueryString();
String[] parts = request.getRequestURI().substring(request.getContextPath().length()+1).split("/");
if (parts.length<2) {
	response.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);
	response.setHeader("Location", request.getContextPath()+"/"+(query!=null ? "?"+query : ""));
	return;
}
String tool = parts[1];

// tools that need to be redirected
String redirectTool = null;
if (tool.equals("Links")) {redirectTool="CollocatesGraph";}
else if (tool.equals("CorpusGrid")) {redirectTool="Documents";}
else if (tool.equals("CorpusSummary")) {redirectTool="Summary";}
else if (tool.equals("CorpusTypeFrequenciesGrid")) {redirectTool="CorpusTerms";}
else if (tool.equals("DocumentInputAdd")) {redirectTool="CorpusTerms";}
else if (tool.equals("DocumentTypeCollocateFrequenciesGrid")) {redirectTool="CorpusTerms";}
else if (tool.equals("DocumentTypeFrequenciesGrid")) {redirectTool="DocumentTerms";}
else if (tool.equals("DocumentTypeKwicsGrid")) {redirectTool="Contexts";}
else if (tool.equals("TypeFrequenciesChart")) {redirectTool="Trends";}
else if (tool.equals("VisualCollocator")) {redirectTool="CollocatesGraph";}
if (redirectTool!=null) {
	response.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);
	response.setHeader("Location", "../"+redirectTool+"/"+(query!=null ? "?"+query : ""));
	return;
}

boolean isNotRealTool = false;
String[] notRealTools = new String[]{"Panel","VoyantFooter","VoyantHeader","VoyantTabPanel"};
for (String notRealTool : notRealTools) {
	if (notRealTool.equals(tool)) {
		isNotRealTool = true;
		break;
	}
}

// check to make sure that the indicated tool exists, otherwise redirect
if (isNotRealTool || new java.io.File(new java.io.File(request.getServletContext().getRealPath("app"), "panel"), tool + ".js").exists()==false) {
	response.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);
	response.setHeader("Location", "../NoTool/?notool="+tool+(query!=null ? "&"+query : ""));
	return;
}

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
		extend : 'Voyant.VoyantToolApp',
		requires: ['Voyant.panel.VoyantHeader','Voyant.panel.<%= tool %>','Voyant.panel.VoyantFooter'],
		name : 'VoyantToolApp',
		config: {
			baseUrl: '<%= new java.net.URL(request.getScheme(), request.getServerName(), request.getServerPort(), request.getContextPath()) %>/',
			version: '<%= application.getInitParameter("version") %>',
			build: '<%= application.getInitParameter("build") %>',
			tool: '<%= tool.toLowerCase() %>'
		},
		launch: function() {
			if (this.hasQueryToLoad()) {
				this.callParent(arguments);
			}
			else {
				var url = "../../?view=<%= tool %>";
				if (document.location.search) {
					url+="&"+document.location.search.substring(1)
				}
				window.location.replace(url)
			}
			this.on("unhandledEvent", function(eventName, src, data) {
				if (src && src.getModifiedApiParams && this.getCorpus && this.getCorpus()) {
					var url = this.getBaseUrl() + '?corpus='+this.getCorpus().getId();
					var api = this.getModifiedApiParams() || {}; // use application, not tool
					if (eventName=='termsClicked') {
						api.query=data;
					}
					else {return;}
					url += "&"+Ext.Object.toQueryString(api)
					this.openUrl(url)
				}
			})
		}
	});
	
</script>
<title>Voyant Tools - <%= tool %></title>
<%@ include file="../resources/jsp/post_app.jsp" %>