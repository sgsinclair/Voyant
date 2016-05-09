<%@ include file="../../resources/jsp/pre_app.jsp" %>
<script src="../../resources/ckeditor/current/ckeditor.js"></script>
<script src="../../resources/ace/current/ace.js"></script>
<style>
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
			'Voyant' : '../../app',
			'resources': '../../resources'
		}
	});

	Ext.application({
		extend : 'Voyant.VoyantNotebookApp',
		name: 'VoyantNotebookApp',
		config: {
			baseUrl: '../../',
			version: '<%= application.getInitParameter("version") %>',
			build: '<%= application.getInitParameter("build") %>'			
		}
	});
</script>
<%@ include file="../../resources/jsp/post_app.jsp" %>
