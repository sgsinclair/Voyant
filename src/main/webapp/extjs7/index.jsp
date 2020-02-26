<% String query = request.getQueryString();
	if (request.getServerName().equals("dream.voyant-tools.org") && (query == null || query.indexOf("corpus=")<0)) { 
        response.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);
		response.setHeader("Location", "dream/"+(query!=null ? "?"+query : "?corpus=dream"));
        return;
   } 
   String skin = request.getParameter("skin");
   if (skin!=null && skin.isEmpty()==false && query.isEmpty()==false) {
	   skin = skin.toLowerCase();
	   String view = "corpusset";
	   if (skin.equals("scatter")) {view="scatterset";}
	   else if (skin.equals("collocates")) {view="collocatesset";}
	   else if (skin.equals("bubblelines")) {view="bubblelinesset";}
	   else if (skin.equals("custom")) {view="customset";}
	   else if (skin.equals("table")) {view="tableset";}
	   else if (skin.equals("simple")==false && skin.equals("dtoc")==false) {view="noskin";}
       query = query.replaceAll("skin="+skin, "");
       if (query.length()>0 && query.endsWith("&")==false) {query+="&";}
       if (view.equals("noskin")) {
    	   query+="noskin="+skin;
       }
       else if (view.equals("corpusset")==false && skin.equals("dtoc")==false) {
    	   query+="view="+view;
       }
       response.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);
	   response.setHeader("Location", "./" + (skin.equals("dtoc") ? "dtoc/" : "") + (query.length()>0 ? "?"+query+"" : ""));
       return;
   }
   
   %><%@ include file="resources/jsp/pre_app.jsp" %>
<!-- <script>
	Ext.Loader.setConfig({
		enabled : true,
		paths : {
			'Voyant' : 'app',
			'resources': 'resources'
		}
	});
</script>
 -->
<script>
Ext.onReady(function(){
	Ext.application({
		extend : 'Voyant.VoyantDefaultApp',
		name: 'VoyantDefaultApp',
		config: {
			baseUrl: '<%= org.voyanttools.voyant.Voyant.getBaseUrlString(request) %>',
			version: '<%= application.getInitParameter("version") %>',
			build: '<%= application.getInitParameter("build") %>',
			openMenu: '<%= System.getProperty("org.voyanttools.voyant.openmenu")==null ? "" : System.getProperty("org.voyanttools.voyant.openmenu") %>',
			hasCorpusCreatorText: '<%= org.voyanttools.voyant.Trombone.hasVoyantServerResource("corpus-creator-text") ? "true" : "false" %>',
			hasNoAllowInputText: '<%= org.voyanttools.voyant.Trombone.hasVoyantServerResource("no-allow-input-text") ? "true" : "false" %>',
			allowInput: '<%= System.getProperty("org.voyanttools.server.allowinput")==null ? "" : System.getProperty("org.voyanttools.server.allowinput") %>'
		},
		launch: function() {
		   	var me = this;
			this.callParent(arguments);

			if (window.location.hostname==='beta.voyant-tools.org') {
				var viewport = this.getViewport();
				viewport.mask();
				Ext.create('Ext.window.Window', {
				    title: 'Voyant Tools 2.0',
			    	margin: '20 200 10 10',
				    modal: true,
				    maxWidth: 420,
				    layout: 'fit',
				    items: [{
				    	margin: '10 5 3 10',
					    layout: 'fit',
					    scrollable: true,
					    html: "<p style='color: red; font-weight: bold;'>Please note that this is the beta server and you should not count on corpora persisting (for bookmarks, embedding, etc.)."
				    }],
				    bbar: [{
				    	xtype: 'button',
		                glyph: 'xf00c@FontAwesome',
		                ui: 'default',
				    	width: '100%',
				    	scale: 'medium',
				    	text: 'Continue',
				    	handler: function(btn) {
				    		btn.up('window').close();
				    	}
				    }],
				    listeners: {
					    beforerender: function(panel) {
					    	panel.items.get(0).setMaxHeight(me.getApplication().getViewport().getHeight()-150);
						},
				    	close: function(panel) {
				    		viewport.unmask();
				    	}
				    }
				}).show();
			}
		}
	});
});
</script>
<title>Voyant Tools</title>

<%@ include file="resources/jsp/post_app.jsp" %>