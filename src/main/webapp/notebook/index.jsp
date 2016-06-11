<%@ include file="../../resources/jsp/pre_app.jsp" %>

<script src="<%= base %>/resources/ckeditor/current/ckeditor.js"></script>
<script src="<%= base %>/resources/ace/tern-src-noconflict/ace.js"></script>
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
		border: thin dashed #ccc !important;
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
			build: '<%= application.getInitParameter("build") %>'			
		}
	});
</script>
<%@ include file="../../resources/jsp/post_app.jsp" %>
