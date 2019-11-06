<%@ page contentType="text/html;charset=UTF-8" %><% 
	StringBuilder url = new StringBuilder();
	url.append(request.getContextPath());
	String base = url.toString();
%>
<html>
	<head>
		<title>Spyral Authorized</title>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<link rel="stylesheet" type="text/css" href="<%= base %>/resources/ext/6.2.0/theme-crisp/resources/theme-crisp-all_1.css" />
	</head>
	<body class="x-body">
		<div style="margin: 15px;">
			<h2>You have now authorized Spyral to use GitHub on your behalf.</h2>
			<h4>You will be returned to Spyral momentarily.</h4>
		</div>
		<script>
			setTimeout(function() {
				window.opener.postMessage("oauth_cookie_set");
			}, 1500)
		</script>
	</body>
</html>