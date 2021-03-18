<% request.setAttribute("title", "Voyant Tools MicroOCP"); %>
<%@ include file="../resources/jsp/html_head.jsp" %>
<%@ include file="../resources/jsp/head_body.jsp" %>

<script src="<%= base %>/resources/ace/1.4.12/src-min-noconflict/ace.js"></script>

<script>
	Ext.Loader.setConfig({
		enabled : true,
		paths : {
			'Voyant' : '../app',
			'resources': '../resources',
			'Ext.chart': '../resources/ext/current/chart'
		}
	});
	Ext.application({
		extend : 'Voyant.VoyantApp',
		requires: ['Voyant.panel.VoyantHeader','Voyant.panel.MicroOcp','Voyant.panel.VoyantFooter'],
		name : 'VoyantToolApp',
		config: {
			baseUrl: '<%= org.voyanttools.voyant.Voyant.getBaseUrlString(request) %>',
			version: '<%= application.getInitParameter("version") %>',
			build: '<%= application.getInitParameter("build") %>'
		},
		launch: function() {
			
			this.viewport = Ext.create('Ext.container.Viewport', {
			    layout: 'fit',
				items: {
					xtype: 'microocp'
			    }
			});
			this.callParent(arguments);
		}
	});
	
</script>

</body>
</html>