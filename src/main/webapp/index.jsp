<%@ include file="pre_app.jsp" %>
<script>
	Ext.Loader.setConfig({
		enabled : true,
		paths : {
			'Voyant' : 'app',
			'resources': 'resources'
		}
	});

	Ext.application({
		extend : 'Voyant.VoyantDefaultApp',
		name: 'VoyantDefaultApp',
		config: {
			baseUrl: './',
			version: '<%= application.getInitParameter("version") %>',
			build: '<%= application.getInitParameter("build") %>'			
		}
	});
</script>
<%@ include file="post_app.jsp" %>
