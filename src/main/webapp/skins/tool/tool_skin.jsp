<%@ page contentType="text/html;charset=UTF-8" %>
<%
String[] parts = request.getRequestURI().substring(request.getContextPath().length()+1).split("/");
if (parts.length<2) {throw new Exception("No tool provided.");}
String tool = parts[1];
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
	<head>
		<title>Voyant Tools: Reveal Your Texts</title>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

		<%@ include file="../shared/assets.jsp" %>

		<script type='text/javascript'>
			Ext.onReady(function() {
				initTool('<%= tool %>');
			});
		</script>
		
		<!-- SKIN RESOURCES -->
		<script type='text/javascript' src='../skins/tool/tool_skin.js'></script>

<%@ include file="../shared/post_skin_head.jsp" %>