<%

String[] parts = request.getRequestURI().substring(request.getContextPath().length()+1).split("/");
if (parts.length<2) {throw new Exception("No tool provided.");}
String tool = parts[1];

%><%@ include file="../pre_app.jsp" %>
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
			baseUrl: '../../',
			version: '<%= application.getInitParameter("version") %>',
			build: '<%= application.getInitParameter("build") %>',
			tool: '<%= tool.toLowerCase() %>'
		}
	});
	
</script>
<%@ include file="../post_app.jsp" %>