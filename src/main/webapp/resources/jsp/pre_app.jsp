<%  // not sure it matters, but just in case, don't have any whitespace before doctype declaration (and possible redirects)
	if (org.voyanttools.voyant.Voyant.preProcess(request, response)) {return;}
%><%@ page contentType="text/html;charset=UTF-8" %><% 
	String base = request.getContextPath();
	String rtl = request.getParameter("rtl")==null || request.getParameter("rtl").isEmpty() ? "" : "-rtl";
%><!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">

<link rel="shortcut icon" type="image/ico" href="<%= base %>/resources/voyant/favicon.ico" />

<script type="text/javascript" src="<%= base %>/resources/ext/6.0.1/ext-all<%= rtl %>.js"></script>
<script type="text/javascript" src="<%= base %>/resources/ext/6.0.1/charts.js"></script>
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/ext/6.0.1/charts-all<%= rtl %>.css" />
<script type="text/javascript" src="<%= base %>/resources/ext/6.0.1/theme-crisp/theme-crisp.js"></script>
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/ext/6.0.1/theme-crisp/resources/theme-crisp-all<%= rtl %>_1.css" />
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/ext/6.0.1/theme-crisp/resources/theme-crisp-all<%= rtl %>_2.css" />

<!-- jQuery -->
<script type="text/javascript" src="<%= base %>/resources/jquery/current/jquery.min.js"></script>
<script type="text/javascript" src="<%= base %>/resources/jquery/current/jquery-ui.min.js"></script>
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/jquery/current/jquery-ui.min.css" />
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/jquery/current/jquery-ui.theme.min.css" />

<!-- D3 -->
<script type="text/javascript" src="<%= base %>/resources/d3/current/d3.min.js"></script>
<script type="text/javascript" src="<%= base %>/resources/cirrus/html5/d3.layout.cloud.js"></script>

<!-- vis.js -->
<script type="text/javascript" src="<%= base %>/resources/visjs/vis.min.js"></script>
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/visjs/vis.min.css" />

<!-- FontAwesome -->
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/fontawesome/current/css/font-awesome.min.css" />


<link rel="stylesheet" type="text/css" href="<%= base %>/resources/css/styles.css" />

<%
	// check to see if there's CSS in the URL
	if (request.getParameter("cssInline")!=null) { 
		for (String cssInline : request.getParameterValues("cssInline")) { %>
			<style type="text/css"><%= cssInline %></style>
	<% } 
	}
	
	// check to see for CSS URL
	if (request.getParameter("cssUri")!=null) { 
		for (String cssUri : request.getParameterValues("cssUri")) { %>
		<link rel="stylesheet" href="<%= cssUri %>" type="text/css" charset="utf-8">
	<% } 
} %>

<script type="text/javascript" src="<%= base %>/resources/voyant/current/voyant.jsp?v3<%= (request.getParameter("debug")!=null ? "&debug=true" : "") %>"></script>
<script type="text/javascript" src="<%= base %>/resources/voyant/current/voyant-locale.jsp?v=3&lang=<%
if (request.getParameter("lang")!=null) { %><%= request.getParameter("lang") %><% } 
else if (request.getAttribute("lang")!=null) {%><%= request.getAttribute("lang") %><% } else { %>en<% } %>"></script>
