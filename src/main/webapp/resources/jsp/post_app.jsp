<script>
if (Ext) {
	Ext.onReady(function () {
		Ext.get("pageloading").hide();
	});
}
</script>
</head>
<body>
<div id="pageloading"><span class="title">Voyant Tools</span><span class="logo"></span></div>
<script type="text/javascript">
var isLocalHost = window.location.hostname=='localhost' || window.location.hostname=='127.0.0.1';
if (!isLocalHost) { // only do google analytics if we're apparently not running locally
	var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
	document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
}
</script>
<script type="text/javascript">
if (!isLocalHost) {
	try {
	var pageTracker = _gat._getTracker("UA-957935-3");
	pageTracker._trackPageview();
	} catch(err) {}
}</script>
</body>
</html>