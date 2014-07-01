<%@ include file="../../pre_app.jsp" %>
<script src="../../resources/ckeditor/current/ckeditor.js"></script>
<script src="../../resources/ace/current/ace.js"></script>
<style>
	.notebook-code-wrapper, .notebook-text-wrapper {
		margin-right: 1em;
	}
	.notebook-code-editor {
		position: relative;
		width: 100%;
		height: 100px;
	}
	.notebook-editor-wrapper {
		margin: 1em;
	}
	.notebook-editor-wrapper-hover {
		border: thin dashed #ccc !important;
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
<%@ include file="../../post_app.jsp" %>
