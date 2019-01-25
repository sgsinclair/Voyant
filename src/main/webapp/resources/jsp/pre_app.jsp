<%  // not sure it matters, but just in case, don't have any whitespace before doctype declaration (and possible redirects)
	if (org.voyanttools.voyant.Voyant.preProcess(request, response)) {return;}
%><%@ page contentType="text/html;charset=UTF-8" %><% 
	String base = request.getContextPath();

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

<!-- EXTJS CLASSIC -->
<script type="text/javascript" src="<%= base %>/resources/ext/6.2.0/ext-all<%= rtl %>.js"></script>
<script type="text/javascript" src="<%= base %>/resources/ext/6.2.0/charts.js"></script>
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/ext/6.2.0/charts-all<%= rtl %>.css" />
<script type="text/javascript" src="<%= base %>/resources/ext/6.2.0/theme-crisp/theme-crisp.js"></script>
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/ext/6.2.0/theme-crisp/resources/theme-crisp-all<%= rtl %>_1.css" />
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/ext/6.2.0/theme-crisp/resources/theme-crisp-all<%= rtl %>_2.css" />
<script type="text/javascript" src="<%= base %>/resources/ext/6.2.0/ux.js"></script>
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/ext/6.2.0/theme-crisp/resources/ux-all<%= rtl %>-debug.css" />
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/ext/6.2.0/examples/style.css" />

<!-- EXTJS MODERN -->
<!--
<script type="text/javascript" src="<%= base %>/resources/ext/6.2.0-modern/ext-modern-all.js"></script>
<script type="text/javascript" src="<%= base %>/resources/ext/6.2.0-modern/charts.js"></script>
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/ext/6.2.0-modern/charts-all<%= rtl %>.css" />
<script type="text/javascript" src="<%= base %>/resources/ext/6.2.0-modern/theme-material/theme-material.js"></script>
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/ext/6.2.0-modern/theme-material/resources/theme-material-all<%= rtl %>.css" />
<script type="text/javascript" src="<%= base %>/resources/ext/6.2.0-modern/ux.js"></script>
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/ext/6.2.0-modern/ux-all<%= rtl %>-debug.css" />
-->

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
<script src="<%= base %>/resources/ace/2017-04-16/src-noconflict/ace.js"></script>

<!-- FontAwesome -->
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/fontawesome/4.4.0/font-awesome-all<%= rtl %>.css" />

<!-- spectrum -->
<script type="text/javascript" src="<%=base %>/resources/spectrum/spectrum.js"></script>
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/spectrum/spectrum.css" />

<link rel="stylesheet" type="text/css" href="<%= base %>/resources/css/styles.css" />

<!-- highcharts -->
<!-- 
<script type="text/javascript" src="<%=base %>/resources/highcharts/Highcharts-6.1.0/code/highcharts.js"></script>
<script type="text/javascript" src="<%=base %>/resources/highcharts/Highcharts-6.1.0/code/modules/drilldown.js"></script>
<script type="text/javascript" src="<%=base %>/resources/highcharts/custom-events/customEvents.min.js"></script>
 -->
 
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

<script type="text/javascript" src="<%= base %>/resources/voyant/current/voyant.jsp?v=2.4-M16<%= (request.getParameter("debug")!=null ? "&debug=true" : "") %>"></script>
<script type="text/javascript" src="<%= base %>/resources/voyant/current/voyant-locale.jsp?v=2.4-M16&lang=<%= lang %>"></script>

<% // ridiculous hack for Safari 11 that seems to hide fieldsets, tested with desktop and iPad
	// https://www.sencha.com/forum/showthread.php?423768&p=1282921&viewfull=1#post1282921
String userAgent = request.getHeader("user-agent");
if (userAgent.indexOf("Safari") > -1 && (userAgent.indexOf("Version/11.") > -1 || userAgent.indexOf("Version/12.") > -1 || (userAgent.indexOf("Version/11.") > -1 && userAgent.indexOf("Mobile")>-1))) { %>	<style>
	/* ridiculous hack for Safari 11 that seems to hide fieldsets */
	.x-fieldset {overflow: visible;}
	</style>
<% } %>

<%@ page import = "org.voyanttools.voyant.Trombone" %>
<% if (Trombone.hasVoyantServerResource("header-include.html")) { %>
	<%= Trombone.getVoyantServerResource("header-include.html") %>
<% } %>
