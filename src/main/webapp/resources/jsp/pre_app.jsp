<%  // not sure it matters, but just in case, don't have any whitespace before doctype declaration (and possible redirects)
	if (org.voyanttools.voyant.Voyant.preProcess(request, response)) {return;}
%><%@ page contentType="text/html;charset=UTF-8" %><% 
	StringBuilder url = new StringBuilder();
/*
	url.append(request.getScheme()).append("://").append(request.getServerName());
	int serverPort = request.getServerPort();
	if (serverPort != 80 && serverPort != 443) {
		url.append(":").append(serverPort);
	}
*/
	url.append(request.getContextPath());
	
	String base = url.toString();

	//default to en
	String lang = "en";
	
	//hard-coded for now
	String[] langs = new String[]{"en","es","ar","bs","cz","fr","he","hr","it","ja","sr","pt"};
	
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

<!-- jQuery -->
<script type="text/javascript" src="<%= base %>/resources/jquery/current/jquery.min.js"></script>
<script type="text/javascript" src="<%= base %>/resources/jquery/current/jquery-ui.min.js"></script>
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/jquery/current/jquery-ui.min.css" />
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/jquery/current/jquery-ui.theme.min.css" />

<!-- D3 -->
<script type="text/javascript" src="<%= base %>/resources/d3/current/d3.min.js"></script>
<script type="text/javascript" src="<%= base %>/resources/d3/fisheye.js"></script>
<script type="text/javascript" src="<%= base %>/resources/cirrus/html5/d3.layout.cloud.js"></script>

<!-- vis.js -->
<script type="text/javascript" src="<%= base %>/resources/visjs/vis.min.js"></script>
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/visjs/vis.min.css" />

<!-- ACE Editor (used by Spyral and the widget.codeeditor -->
<script src="<%= base %>/resources/ace/1.4.7/src-noconflict/ace.js"></script>

<!-- spectrum -->
<script type="text/javascript" src="<%=base %>/resources/spectrum/spectrum.js"></script>
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/spectrum/spectrum.css" />

<link rel="stylesheet" type="text/css" href="<%= base %>/resources/css/styles.css" />

<link rel="stylesheet" type="text/css" href="<%= base %>/resources/extjs7/build/production/Voyant/desktop/resources/Voyant-all.css" />
 
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

<script type="text/javascript" src="<%= base %>/resources/extjs7/build/production/Voyant/generatedFiles/desktop/app.js"></script>

<% // ridiculous hack for Safari 11 that seems to hide fieldsets, tested with desktop and iPad
	// https://www.sencha.com/forum/showthread.php?423768&p=1282921&viewfull=1#post1282921
String userAgent = request.getHeader("user-agent");
if (userAgent.indexOf("Safari") > -1 && (userAgent.indexOf("Version/13.") > -1 || userAgent.indexOf("Version/11.") > -1 || userAgent.indexOf("Version/12.") > -1 || (userAgent.indexOf("Version/11.") > -1 && userAgent.indexOf("Mobile")>-1))) { %>	<style>
	/* ridiculous hack for Safari 11 that seems to hide fieldsets */
	.x-fieldset {overflow: visible;}
	</style>
<% } %>

<%@ page import = "org.voyanttools.voyant.Trombone" %>
<% if (Trombone.hasVoyantServerResource("header-include.html")) { %>
	<%= Trombone.getVoyantServerResource("header-include.html") %>
<% } %>
