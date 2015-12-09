<% String query = request.getQueryString();
	if (request.getServerName().equals("dream.voyant-tools.org") && (query == null || query.indexOf("corpus=")<0)) { 
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
		},
		launch: function() {
		   	var me = this;
			this.callParent(arguments);
			var params = Ext.Object.fromQueryString(document.location.search);
			if (params && params.debug && params.debug=='true') { return}
			var viewport = this.getViewport();
			viewport.mask();
			Ext.create('Ext.window.Window', {
			    title: 'Voyant Tools 2.0 Preview Release',
			    width: 825,
			    layout: 'fit',
			    modal: true,
			    layout: 'vbox',
			    items: [{
			    	width: 800,
			    	margin: '10 5 3 10',
				    html: "<h2 style='text-align: center;'>Welcome to this Preview Release of Voyant Tools 2.0!</h2>"+
				    "<p>We've tried to make things usable in order to give a glimpse of what's to come, "+
				    "but this is an early preview release with lots of missing goodies and a whole bunch of bugs. "+
				    "Please kick the tires and let us know if you have suggestions on <a href='https://github.com/sgsinclair/Voyant/issues'>Github</a> or <a href='http://twitter.com/voyanttools'>Twitter</a>."+
				    "<ul>"+
			    	"<li>some new features and functionality:<ul>"+
			    		"<li>flexible search (wildcards, phrases, proximity) – hover over help icon in search boxes for more details</li>"+
				    	"<li>new <i>Phrases</i> tool for analyzing repeating n-grams</li>"+
			    		"<li>better cross-platform and device support (all tools in HTML5, no Flash or Java Applets)</li>"+
			    		"<li>much better support for larger corpora</li>"+
			    		"<li>vastly improved performance throughout (corpus reader and collocates are notable examples)</li>"+
				    	"<li>adding and reordering documents (new in 2.0)</li>"+
			    	"</ul><li>some things not yet fully implemented:<ul>"+
				    	"<li>full list of tools and skins from 1.0</li>"+
				    	"<li>corpus-level management (permissions for access and modifications)</li>"+
				    	"<!--<li>part-of-speech tagging and lemmatization (new in 2.0)</li>-->"+
			    	"</ul></li></ul>"+
			    	"<p>It's best to assume that this preview release may be incompatible with future releases and that "+
			    	"any stored corpora will no longer be available after your session. Of course, you can keep using "+
			    	"<a href='http://voyant-tools.org'>Voyant Tools 1.0</a> "+
			    	"if you want persistence (normal persistence will be avilable with the full release of Voyant Tools 2.0). Have fun and please give us your <a href='http://twitter.com/voyanttools'>feeback</a>!</p>"
			    }, {
			    	xtype: 'button',
	                glyph: 'xf00c@FontAwesome',
			    	width: '100%',
			    	scale: 'medium',
			    	text: 'Continue',
			    	handler: function(btn) {
			    		btn.up('window').close();
			    	}
			    }],
			    listeners: {
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