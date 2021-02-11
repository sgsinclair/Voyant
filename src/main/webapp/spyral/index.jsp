<% // we changed from spiral to spyral, so redirect if needed
if (request.getServletPath().equals("/spiral")) {
    response.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);
    StringBuffer url = request.getRequestURL();
    String query = request.getQueryString();
    if (query!=null) {url.append("?").append(query);}
	response.setHeader("Location", url.toString().replace("/spiral/","/spyral/"));
    return;
} %><%@ include file="../../resources/jsp/pre_app.jsp" %>

<script type="text/javascript" src="<%= base %>/resources/vendor/vendor-spyral.js"></script>


<link rel="stylesheet" type="text/css" href="<%= base %>/resources/highcharts/highcharts.css" />


<script>
// adapted from http://handsomedogstudio.com/ckeditor-set-default-target-blank
CKEDITOR.on('dialogDefinition', function(ev) {
    try {
		var dialogName = ev.data.name;
		var dialogDefinition = ev.data.definition;
		/* Make sure that the dialog opened is the link plugin ... otherwise do nothing */
		if(dialogName == 'link') {
	    /* Getting the contents of the Target tab */
	    	var informationTab = dialogDefinition.getContents('target');
		    /* Getting the contents of the dropdown field "Target" so we can set it */
		    var targetField = informationTab.get('linkTargetType');
		    /* Now that we have the field, we just set the default to _blank
			    A good modification would be to check the value of the URL field
	    		and if the field does not start with "mailto:" or a relative path,
			    then set the value to "_blank" */
    		targetField['default'] = '_blank';
		}
    } catch(exception) {
        alert('Error ' + ev.message);
    }
});
</script>
<style>
.ace-chrome .ace_gutter {
    background-color: rgba(0,0,0,.025)!important;
}
.ace-chrome .ace_gutter-active-line {
    background-color: rgba(0,0,0,.05)!important;
}

</style>
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/spyral/css/spyral.css" />
<style id="voyant-notebooks-styles">
.ace_layer {
	white-space: pre;
	font-family: monospace;
}

.notebook-code-editor-raw {
	display: none;
}
.notebookcodeeditorwrapper {
    margin-left: 1em;
    padding-left: .5em;
    border: thin solid rgba(0,0,0,.1);
}
.notebookcodeeditorwrapper .collapsed {
	overflow: auto;
	max-height: 120px;
}
.notebook-code-results {
	margin-top: .5em;
	padding: .5em;
	background-color: rgba(0,0,0,.01)
}
.notebook-code-results .collapsed {
	overflow: auto;
}
.spyral-header, .spyral-footer {
	text-align: center
}
.notebook-code-results .error {
	color: red !important;
}
</style>
<style id="voyant-notebook-catalogue">
.catalogue-notebook {
	float: left;
	width: 210px;
	margin: 0 10px 10px 0;
	padding: 10px;
	border-radius: 2px;
	border: 1px solid #ccc;
	font-size: 13px;
	line-height: 18px;
	height: 75px;
}
.catalogue-notebook-over {
	background-color: #eee;
	border: 1px solid #bbb;
	cursor: pointer;
}
.catalogue-notebook-selected {
	background-color: #ddd;
	border: 1px solid #aaa;
}
.catalogue-notebook .id {
	float: right;
	color: #666;
	font-size: 9px;
	line-height: 9px;
}
.catalogue-notebook .title {
	font-weight: 600;
}
.catalogue-notebook .author {
	color: #666;
	font-size: 11px;
}
.catalogue-notebook .date {
	color: #666;
	font-size: 11px;
}
.catalogue-notebook .nowrap {
	white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}

</style>

<script>
	Ext.Loader.setConfig({
		enabled : true,
		paths : {
			'Voyant' : '<%= base %>/app',
			'resources': '<%= base %>/resources'
		}
	});

	Ext.application({
		extend : 'Voyant.VoyantNotebookApp',
		name: 'VoyantNotebookApp',
		config: {
			baseUrl: '<%= base %>/',
			version: '<%= application.getInitParameter("version") %>',
			build: '<%= application.getInitParameter("build") %>',
			allowInput: '<%= System.getProperty("org.voyanttools.server.allowinput")==null ? "" : System.getProperty("org.voyanttools.server.allowinput") %>'
		}
	});
	
	<% // there's a very weird thing where reloading a secure page sometimes causes the insecure page to be requested, so let's rely on the browser for scheme %>
	Spyral.Load.setBaseUrl(document.location.protocol+'//<%
	
	StringBuilder fullurl = new StringBuilder();
	fullurl/*.append(request.getScheme()).append("://")*/.append(request.getServerName());
	int serverPort = request.getServerPort();
	if (serverPort != 80 && serverPort != 443) {
		fullurl.append(":").append(serverPort);
	}
	fullurl.append(request.getContextPath());
	
	String fullbase = fullurl.toString();
	%><%= fullbase %>/');
</script>
<title>Spyral</title>
<%@ include file="../../resources/jsp/post_app.jsp" %>
