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
	   else if (skin.equals("simple")==false){view="noskin";}
       query = query.replaceAll("skin="+skin, "");
       if (query.length()>0 && query.endsWith("&")==false) {query+="&";}
       if (view.equals("noskin")) {
    	   query+="noskin="+skin;
       }
       else if (view.equals("corpusset")==false) {
    	   query+="view="+view;
       }
       response.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);
	   response.setHeader("Location", "./?"+query);
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
			baseUrl: '<%= new java.net.URL(request.getScheme(), request.getServerName(), request.getServerPort(), request.getContextPath()) %>/',
			version: '<%= application.getInitParameter("version") %>',
			build: '<%= application.getInitParameter("build") %>'			
		},
		launch: function() {
		   	var me = this;
			this.callParent(arguments);
			var params = Ext.Object.fromQueryString(document.location.search);
			if (params && ((params.debug && params.debug=='true') || this.hasQueryToLoad())) {return}
			var viewport = this.getViewport();
			viewport.mask();
			Ext.create('Ext.window.Window', {
			    title: 'Voyant Tools 2.0',
		    	margin: '20 200 10 10',
			    modal: true,
			    maxWidth: 800,
			    layout: 'fit',
			    items: [{
			    	margin: '10 5 3 10',
				    layout: 'fit',
				    scrollable: true,
				    html: "<h2 style='text-align: center;'>Welcome to Voyant Tools 2.0!</h2>"+
				    "<p>We've completely reworked Voyant to make it even more powerful and flexible than before. "+
				    "Some highlights of <a href='docs/#!/guide/new' target='_blank'>what's new</a> include more options for <a href='docs/#!/guide/corpuscreator' target='_blank'>creating</a>, "+
				    "<a href='docs/#!/guide/modifyingcorpus' target='_blank'>modifying</a> and <a href='docs/#!/guide/corpuscreator-section-access-management' target='_blank'>accessing</a> corpora, "+
				    "more powerful <a href='docs/#!/guide/search' target='_blank'>search</a> capabilities, "+
				    "new tools (like <a href='docs/#!/guide/phrases' target='_blank'>Phrases</a>) and tools rewritten in HTML5 (like <a href='docs/#!/guide/cirrus' target='_blank'>Cirrus</a> - no more Flash!), "+
				    "as well as significant speed and scale improvements all around.</p>"+
				    "<p>If you're new to Voyant, you may want to consult our guide to <a href='docs/#!/guide/start' target='_blank'>Getting Started</a>, as well as our companion book <a href='https://mitpress.mit.edu/books/hermeneutica' target='_blank'>Hermeneutica: Computer-Assisted Interpretation in the Humanities</a> and site <a href='http://hermeneuti.ca' target='_blank'>Hermeneuti.ca</a>. "+
				    "You might be interested in "+
				    "using our downloadable standalone version of <a href='https://github.com/sgsinclair/VoyantServer/#voyant-server' target='_blank'>VoyantServer</a> or in accessing the previous <a href='http://v1.voyant-tools.org' target='_blank'>Version 1</a> of Voyant Tool.</p>"+
				    "<p>We're always grateful for any feedback, bug reports and feature requests, you can find us on <a href='http://twitter.com/voyanttools' target='_blank'>Twitter</a> and <a href='http://github.com/sgsinclair/Voyant' target='_blank'>GitHub</a>.</p>"+
				    (window.location.hostname=='beta.voyant-tools.org' ? "<p class='keyword' style='text-align: center; font-weight: bold;'>Please note that this is the beta server and you should not count on corpora persisting (for bookmarks, embedding, etc.)." : '')+
				    "<p style='text-align: center'>Enjoy! - <a href='http://stefansinclair.name' target='_blank'>St&eacute;fan Sinclair</a> &amp; <a href='http://geoffreyrockwell.com' target='_blank'>Geoffrey Rockwell</a></p>"
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
	});
});
</script>
<title>Voyant Tools</title>
<%@ include file="resources/jsp/post_app.jsp" %>