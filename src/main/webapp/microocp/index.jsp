<%@ include file="../resources/jsp/pre_app.jsp" %>
<!--  Note that <String> base is defined in pre_app.jsp -->
<script src="<%= base %>/resources/ace/2017-04-16/src-noconflict/ace.js"></script>

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
<title>Voyant Tools MicroOCP</title>
<%@ include file="../resources/jsp/post_app.jsp" %>