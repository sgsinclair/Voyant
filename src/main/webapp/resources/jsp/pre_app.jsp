<%  // not sure it matters, but just in case, don't have any whitespace before doctype declaration (and possible redirects)
	if (org.voyanttools.voyant.Voyant.preProcess(request, response)) {return;}
%><%@ page contentType="text/html;charset=UTF-8" %><% 
	String base = request.getContextPath();

	//default to en
	String lang = "en";
	
	//hard-coded for now
	String[] langs = new String[]{"en","ar","bs","cz","fr","he","hr","it","ja","sr"};
	
	//try first with parameter
	if (request.getParameter("lang")!=null) {
		String p = request.getParameter("lang").toLowerCase();
		for (String l : langs) {
			if (p.equals(l)) {
				lang = p;
				break;
			}
		}
	} else {
		java.util.Enumeration locales = request.getLocales();
		boolean hasLang = false;
	 while (locales.hasMoreElements() && hasLang==false) {
	     java.util.Locale locale = (java.util.Locale) locales.nextElement();
	     for (String l : langs) {
	     	if (locale.getLanguage().equals(new java.util.Locale(l).getLanguage())) {
	     		lang = l;
	     		hasLang = true;
	     		break;
	     	}
	     }
     	 if (hasLang) {break;}
	 }
	}
	
	// default to no rtl
	String rtl = "";
	if (request.getParameter("rtl")!=null) {
		String r = request.getParameter("rtl").toLowerCase();
		if (r.isEmpty()==false && r.equals("false")==false || r.equals("0")==false) {
			rtl = "-rtl";
		}
	} else if (lang.equals("he") || lang.equals("ar")) {
		rtl = "-rtl";
	}
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

<script type="text/javascript" src="<%= base %>/resources/voyant/current/voyant.jsp?v=6<%= (request.getParameter("debug")!=null ? "&debug=true" : "") %>"></script>
<script type="text/javascript" src="<%= base %>/resources/voyant/current/voyant-locale.jsp?v=6&lang=<%= lang %>"></script>
