<%@ include file="../../resources/jsp/pre_app.jsp" %>

<script src="<%= base %>/resources/ckeditor/ckeditor4.6.2/ckeditor.js"></script>
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
<script src="<%= base %>/resources/ace/2017-04-16/src-noconflict/ace.js"></script>
<style id="voyant-notebooks-styles">
	body.exported-notebook {
		font-family: helvetica, arial, verdana, sans-serif;
		font-size: 13px;
		font-weight: 300;
		line-height: 17px;
		-webkit-font-smoothing: antialiased
	}
	body.exported-notebook .notebook-code-editor {
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
		font-size: 12px;
		font-weight: normal;
		line-height: normal;
		white-space: pre;
	}
	.notebook-text-editor, .notebook-code-editor, .notebook-code-results {
		padding: 6px;
		margin: 6px;
	}
	.notebook-editor-wrapper-hover {
		border: thin dashed rgba(255,255,255,0);
	}
	.notebook-editor-wrapper-hover {
		border: thin dashed rgba(0,0,0,.1) !important;
	}
	.notebook-code-editor, .notebook-code-results {
		margin-left: 2em;
	}
	.notebook-code-editor {
		border-left: thin solid rgb(240, 240, 240);
	}
	.notebook-code-results {
		background-color: rgb(252, 252, 252);
		border: thin solid rgb(240, 240, 240);
	}
	.notebook-code-results .error {
		color: red;
	}
	.notebook-code-results pre {
		font-size: smaller;
	}	
	.notebook-code-results .info {
		overflow: scroll
	}	
	.cke_button__sourcedialog_label {
	    display: none !important;
	}
	.notebookwrappercounter a {
		-webkit-border-radius: 3px;
		-moz-border-radius: 3px;
		border-radius: 3px;
		background-color: #f5f5f5;
	    text-align: right;
	    border: thin solid #d8d8d8;
	    padding: 1px;
	    margin: 1px;
	    font-size: smaller;
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
</script>
<%@ include file="../../resources/jsp/post_app.jsp" %>
