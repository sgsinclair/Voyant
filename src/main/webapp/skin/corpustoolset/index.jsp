<%@ include file="../../pre_app.jsp" %>
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
		extend : 'Voyant.VoyantCorpusToolsetApp',
		requires: ['Voyant.panel.VoyantHeader','Voyant.panel.VoyantFooter'],
		name : 'VoyantCorpusToolsetApp',
		config: {
			baseUrl: '../../',
			version: '<%= application.getInitParameter("version") %>',
			build: '<%= application.getInitParameter("build") %>'
		}
	});
	
</script>
<%@ include file="../../post_app.jsp" %>