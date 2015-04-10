<%@ include file="../resources/jsp/pre_app.jsp" %>
<!--
<script type="text/javascript" src="<%= base %>/resources/ext/current/ext-all-debug.js"></script>
-->
<script>
	Ext.Loader.setConfig({
		enabled : true,
		paths : {
			'Voyant' : '../app',
			'resources': '../resources'
		}
	});

	Ext.application({
		extend : 'Voyant.VoyantCorpusApp',
		requires: ['Voyant.util.QuerySearchField'],
		name: 'VoyantDreamApp',
		config: {
			baseUrl: '<%= new java.net.URL(request.getScheme(), request.getServerName(), request.getServerPort(), request.getContextPath()) %>/',
			version: '<%= application.getInitParameter("version") %>',
			build: '<%= application.getInitParameter("build") %>'			
		},
		launch: function() {

			// get current markup and then dispose of it
			var html = $('body').html();
			$('body').html("");
			


			Ext.create('Ext.container.Viewport', {
			    layout: 'border',
			    cls: 'dream-body',
			    layout: 'fit',
			    items: [{
			    	html: html,
			    	xtype: 'dream',
			    	header: false,
			    	autoScroll: true,
			    	listeners: {
			    		afterrender: function() {
			    		      Ext.create('Ext.tip.ToolTip', {
							        target: this.getEl().dom.querySelector(".search-tips"),
        							html: Voyant.util.QuerySearchField.i18n.querySearchTip.en
      							});
			    		}
			    	}
			    }]
			});
			this.callParent(arguments);
			
		}
	});
</script>
<script src="dream.panel.js"></script>
<link href='http://fonts.googleapis.com/css?family=Cinzel+Decorative:400,900' rel='stylesheet' type='text/css'>
<style>
	.dream-body {
		background-image: url(dream-tp-transparent.png);
		background-size: cover;
	}
	.dream-body .x-panel-body-default {
		background: none;
	}
	.dream-body header {
		text-align: center;
		font-family: 'Cinzel Decorative', cursive;
	}
	.dream-body h1 {
		font-size: 600%;
		margin-bottom: 35px;
	}
	table.intro {
		margin-left: auto;
		margin-right: auto;
		max-width: 125em;
	}
	table.intro td {
		padding: 1em;
		vertical-align: top;
	}
	.badge { /* http://cssdeck.com/labs/menu-with-notification-badges */
	  position: relative;
	  top: -10px;
	  right: 12px;
	  line-height: 16px;
	  height: 16px;
	  padding: 0 5px;
	  font-family: Arial, sans-serif;
	  color: black;
	  /*text-shadow: 0 1px rgba(0, 0, 0, 0.25);*/
	  border: 1px solid;
	  border-radius: 10px;
	  -webkit-box-shadow: inset 0 1px rgba(255, 255, 255, 0.3), 0 1px 1px rgba(0, 0, 0, 0.08);
	  box-shadow: inset 0 1px rgba(255, 255, 255, 0.3), 0 1px 1px rgba(0, 0, 0, 0.08);
	  /*background: #fa623f;
	  border-color: #fa5a35;
	  background-image: -webkit-linear-gradient(top, #fc9f8a, #fa623f);
	  background-image: -moz-linear-gradient(top, #fc9f8a, #fa623f);
	  background-image: -o-linear-gradient(top, #fc9f8a, #fa623f);
	  background-image: linear-gradient(to bottom, #fc9f8a, #fa623f);*/
	  background: white;
	  border-color: #aaa;
	  background-image: -webkit-linear-gradient(top, white, #eee);
	  background-image: -moz-linear-gradient(top, white, #eee);
	  background-image: -o-linear-gradient(top, white, #eee);
	  background-image: linear-gradient(to bottom, white, #eee);
 	  display: none;
	}
	.ui-autocomplete-loading {
    	background: white url("../resources/jquery/current/images/ui-anim_basic_16x16.gif") right center no-repeat;
  	}
  	
  	.btn {
  		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}
	.btn-default {
		text-shadow: 0 1px 0 #fff;
	}	
	.btn-default {
		color: #333333;
		background-color: #ffffff;
		border-color: #333;
	}
	.btn {
		display: inline-block;
		margin-bottom: 0;
		font-weight: normal;
		text-align: center;
		vertical-align: middle;
		cursor: pointer;
		background-image: none;
		border: 1px solid #999;
		white-space: nowrap;
		padding: 6px 12px;
		font-size: 14px;
		line-height: 1.42857143;
		border-radius: 4px;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
	input.dream-terms-search {
		width: 200px;
	}
	#slider-pubDate-range {
		width: 150px;
	}
	#pubDate-badge {
		right: 9px;
	}
	.filename ul.filenamegroup {
		margin: 0px;
		padding: 0px;
	}
	.filename td:first-child {
		text-align: right;
	}
	.filename .filenamegroup li {
		display: inline;
		padding: 2px;
		border: thin solid #ccc;
		background-color: #eee;
		margin-right: 2px;
	}
	fieldset.filename {
		border: thin dotted #ccc;
	}
	.export-dlg {
		background-color: white;
		z-index: 3;
	}
	.search-tips {caption-side: top; text-align: right; font-size: smaller; color: #157fcc}
	
</style>
</head>
<body>

<header>
	<table style="width: 100%">
		<tr>
			<td>
				<h1>DREaM</h1>
				<h3>Distant Reading Early Modernity</h3>
			</td>
			<td style="width: 500px">
				<img src="EMC-logo.gif" style="height: 100px; " alt="Early Modern Conversions" />
				<img src="voyant-tools.png" style="height: 100px; margin-right: 1em;" alt="Voyant Tool" />
			</td>			
		</tr>
	</table>
</header>

<table class='intro'>
	<tr>
		<td>The DREaM Database indexes 44,000+ early modern texts, thus making long-neglected material more amenable to marco-scale textual analysis. The corpus comprises approximately one-third of all the titles in the Stationer&rsquo;s Register and all of the texts transcribed thus far by the <a href='http://www.textcreationpartnership.org' target='_blank'>Text Creation Partnership</a>, an initiative that aims to create standardized, accurate XML/SGML encoded full text editions of all documents available from <a href='http://eebo.chadwyck.com/home' target='_blank'>Early English Books Online</a>.</td>
		<td>Unlike similar databases, DREaM enables mass downloading of custom-defined subsets rather than obliging users to download individual texts one-by-one. In other words, it functions at the level of &lsquo;sets of texts,&rsquo; rather than &lsquo;individual texts.&rsquo; Examples of subsets one might potentially generate include &lsquo;all texts by Ben Jonson,&rsquo; &lsquo;all texts published in 1623,&rsquo; or &lsquo;all texts printed by John Wolfe.&rsquo; The subsets are available as either plain text or XML encoded files, and users have the option to automatically name individual files by date, author, title, or combinations thereof. There is also an option to download subsets in the original spelling, or in an automatically normalized version.</td>
	</tr>
</table>

<div align="center">
	<table>
		<caption class='search-tips'>search tips</caption>
		<tr>
			<td valign="top">
				<table>
					<tr>
						<td>Select by keywords in the full-text</td>
						<td>
							<div><input class="dream-terms-search" name="lexical" /><span class="badge" id="lexical-badge"></span></div>
						</td>
					</tr>
					<tr>
						<td>Select by keywords in the title</td>
						<td><div><input class="dream-terms-search" name="title" /><span class="badge" id="title-badge"></span></div></td>
					</tr>
					<tr>
						<td>Select by year (<span id="pubDate-label">test</span>)</td>
						<td>
							<table width="100%">
								<tr>
									<td>
										<div id="slider-pubDate"></div>
									</td>
									<td width="10"><span class="badge" id="pubDate-badge"></span></td>
								</tr>
							</table>
						</td>
					</tr>
				</table>
			</td>
			<td style="width: 5em;">&nbsp;</td>
			<td valign="top">
				<table>
					<tr>
						<td>Select by keywords in author</td>
						<td><div><input class="dream-terms-search" name="author" /><span class="badge" id="author-badge"></span></div></td>
					</tr>
					<tr>
						<td>Select by keywords in publisher</td>
						<td><div><input class="dream-terms-search" name="publisher" /><span class="badge" id="publisher-badge"></span></div></td>
					</tr>
					<tr>
						<td colspan="2"><input type="checkbox" id="variants" checked=""> use spelling variants for keywords</td>
				</table>
			</td>
		</tr>
		<tr>
			<td colspan="3" style="text-align: center" id="export">
			<br />
			<span>
				<a class="btn btn-default btn-lg" href="#"> <i class="fa fa-external-link"></i> Export</a>
				<span class="badge" id="total-badge" title="total number of matching documents">0</span>
			</td>
		</tr>
	</table>
</div>

</body>
</html>