<%

String skin = request.getParameter("skin");
if (skin==null) skin = "simple";

%>
<%@ page contentType="text/html;charset=UTF-8" %>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
	<head>
		<title>Voyant Tools: Reveal Your Texts</title>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

		<%@ include file="assets.jsp" %>

		<!-- SKIN RESOURCES -->
		<script type='text/javascript' src='<%= base %>/skins/<%= skin %>/<%= skin %>_skin.js'></script>
