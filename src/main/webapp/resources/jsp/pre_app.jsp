<%  // not sure it matters, but just in case, don't have any whitespace before doctype declaration (and possible redirects)
	if (org.voyanttools.voyant.Voyant.preProcess(this.getServletConfig().getServletContext(), request, response)) {return;}
%><%@ page contentType="text/html;charset=UTF-8" %><% 
	String base = request.getContextPath();
%><!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">

<!-- EXTJS -->
<script type="text/javascript" src="<%= base %>/resources/ext/current/ext-all.js"></script>
<script type="text/javascript" src="<%= base %>/resources/ext/current/sencha-charts.js"></script>
<script type="text/javascript" src="<%= base %>/resources/ext/current/ext-theme-crisp.js"></script>
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/ext/current/ext-theme-crisp-all_01.css" />
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/ext/current/ext-theme-crisp-all_02.css" />
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/ext/current/sencha-charts-all.css" />

<!-- jQuery -->
<script type="text/javascript" src="<%= base %>/resources/jquery/current/jquery.min.js"></script>
<script type="text/javascript" src="<%= base %>/resources/jquery/current/jquery-ui.min.js"></script>
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/jquery/current/jquery-ui.min.css" />
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/jquery/current/jquery-ui.theme.min.css" />

<!-- D3 -->
<script type="text/javascript" src="<%= base %>/resources/d3/current/d3.min.js"></script>


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