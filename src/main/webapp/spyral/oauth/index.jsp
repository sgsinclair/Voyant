<%@page import="java.util.Properties"%>
<%
ServletConfig sconfig = getServletConfig();
Properties oauthprops = new Properties();
String propfile = sconfig.getInitParameter("oauthprops");
oauthprops.load(getClass().getClassLoader().getResourceAsStream(propfile));

String clientId = (String) oauthprops.get("clientId");
String oauthCallback = (String) oauthprops.get("oauthCallback");
String githubAuthURL = "https://github.com/login/oauth/authorize?client_id="+clientId+"&scope=repo&redirect_uri="+oauthCallback;
response.sendRedirect(githubAuthURL);
%>
