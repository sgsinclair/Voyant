<style>
#pageloading {position:absolute;top:50%;width:100%;margin-top:-70px}
#pageloading .title{font-family:helvetica,arial,verdana,sans-serif;font-size:2em;color:gray;text-align:center;white-space:nowrap;display:block}
#pageloading .logo{height:110px;text-align:center}
#pageloading .logo img {
    width: 90px;
    height: 90px;
	margin-top: 20px;
    -webkit-animation: spin 2.5s linear infinite;
    -moz-animation: spin 2.5s linear infinite;
    animation: spin 2.5s linear infinite;
}
@-moz-keyframes spin { 100% { -moz-transform: rotate(-360deg); } }
@-webkit-keyframes spin { 100% { -webkit-transform: rotate(-360deg); } }
@keyframes spin { 100% { -webkit-transform: rotate(-360deg); transform:rotate(-360deg); } }
</style>
</head>
<body>
<div id="pageloading"><span class="title">Voyant Tools</span><div class="logo"><img src="<%= (String) request.getAttribute("base") %>/resources/images/voyant-logo-90.png" alt="Voyant Tools logo" width="90" height="90"/></div></div>

<%@ include file="load_js.jsp" %>

<script>
if (Ext) {
	Ext.onReady(function () {
		Ext.get("pageloading").hide();
	});
}
</script>