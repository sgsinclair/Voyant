<%@ include file="../resources/jsp/pre_app.jsp" %>

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
		requires: ['Voyant.widget.QuerySearchField'],
		name: 'VoyantDreamApp',
		config: {
			baseUrl: '<%= new java.net.URL(request.getScheme(), request.getServerName(), request.getServerPort(), request.getContextPath()) %>/',
			version: '<%= application.getInitParameter("version") %>',
			build: '<%= application.getInitParameter("build") %>'			
		},
		statics: {
	    	i18n: {
	    		pubDateTip: {en: "Workset Builder"},
	    		pubDate: {en: "Publication Year"},
	    		pubDateCountTip: {en: "This is the number of documents whose publication year matches the specified range."},
	    		pubDateHelpTip: {en: "Use the slider to determine the start and end year range of publications."}
	    	}
		},
		validateCorpusLoadParams: function(params) {
			params.docsLimit=0
		},
	    launch: function() {

	    	if (!this.hasQueryToLoad()) {
		    	location.replace("?corpus=dream")
	    	}

			// get current markup and then dispose of it
			var introHtml = document.body.querySelector("header").outerHTML + document.body.querySelector("#intro").outerHTML;
			document.body.innerHTML = "";
			$('body').html("");

			var me = this;

			Ext.create('Ext.container.Viewport', {
			    layout: 'fit',
			    cls: 'dream-body',
			    items: [{
				    xtype: 'collection',
            		inDocumentsCountOnly: true,
            		stopList: 'stop.en.taporware.txt',
				    header: false,
				    title: false,
			    	autoScroll: true,
				    margin: '0, 40, 20, 40',
				    introHtml: introHtml,
				    fieldItems: [{
		        		xtype: 'querysearchfield',
		        		tokenType: 'title'
	        		},{
		        		xtype: 'querysearchfield',
		        		tokenType: 'author'
	        		},{
		        		xtype: 'querysearchfield'
	        		},{
		        		xtype: 'querysearchfield',
		        		tokenType: 'publisher'
	        		},{
		        		layout: 'hbox',
		        		tokenType: 'pubDate',
 		        		width: 340,
		        		items: [{
			        		xtype: 'container',
			        		html: this.localize('pubDate'),
			        		cls: 'x-form-item-label x-form-item-label-default x-form-item-label-right x-unselectable x-form-item-label-default',
			        		width: 105
			        	},{
				        	flex: 1,
				        	layout: 'hbox',
				        	cls: "x-form-trigger-wrap x-form-trigger-wrap-default",
			        		bodyStyle: 'background-color: white; padding-left: 5px',
				        	items: [{
				        		xtype: 'multislider',
						        minValue: 1450,
						        maxValue: 1700,
						        values: [ 1450, 1450 ],
//						        width: 200
						        flex: 1
					        	},{
						        	html: '<div class=""><div class="x-form-text-wrap x-form-text-wrap-default">'+
						        		'<div class="x-form-trigger x-form-trigger-default form-fa-count-trigger fa-trigger fa-trigger-default" style="height: 22px"></div>'+
						        		'<div class="x-form-trigger x-form-trigger-default fa-trigger form-fa-help-trigger fa-trigger form-fa-help-trigger-default "></div>'+
						        		'</div></div>',
						        	listeners: {
							        	afterrender: function(cmp) {
								        	var collection = cmp.up('collection');
								        	var count = Ext.get(cmp.getTargetEl().dom.querySelector(".form-fa-count-trigger"));
								             /*
								              Ext.QuickTips.register({
//											        target: count.dom,
											        text: me.localize('pubDateTip'),
											        enabled: true,
											        showDelay: 20,
											        autoShow: true
											      });*/
								        	count.on("click", function() {
						    	            	Ext.Msg.show({
						    	            	    title: me.localize('pubDate'),
						    	            	    message: me.localize('pubDateCountTip'),
						    	            	    buttons: Ext.OK,
						    	            	    icon: Ext.Msg.INFO
						    	            	});
									        });
								        	var help = Ext.get(cmp.getTargetEl().dom.querySelector(".form-fa-help-trigger"));
								        	help.on("click", function() {
						    	            	Ext.Msg.show({
						    	            	    title: me.localize('pubDate'),
						    	            	    message: me.localize('pubDateHelpTip'),
						    	            	    buttons: Ext.OK,
						    	            	    icon: Ext.Msg.INFO
						    	            	});
									        });
								        }
						        	},
						        	scope: this
					        }]
			        	}]
		        	}]
			    }]
			});

			this.callParent(arguments);

		}
	});
</script>
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
	
</style>
</head>
<body>

<header>
	<table style="width: 100%">
		<tr>
			<td align="right" style="width: 50%">
				<table>
					<tr>
						<td style="text-align: center">
							<h1>DREaM</h1>
							<h3>Distant Reading Early Modernity</h3>
						</td>
					</tr>
				</table>
			</td>
			<td style="width: 2em">&nbsp:</td>
			<td>
				<img src="EMC-logo.gif" style="height: 100px; " alt="Early Modern Conversions" />
				<img src="voyant-tools.png" style="height: 100px; margin-right: 1em;" alt="Voyant Tool" />
			</td>			
		</tr>
	</table>
</header>
<table id='intro'>
	<tr>
		<td>The DREaM Database indexes 44,000+ early modern texts, thus making long-neglected material more amenable to marco-scale textual analysis. The corpus comprises approximately one-third of all the titles in the Stationer&rsquo;s Register and all of the texts transcribed thus far by the <a href='http://www.textcreationpartnership.org' target='_blank'>Text Creation Partnership</a>, an initiative that aims to create standardized, accurate XML/SGML encoded full text editions of all documents available from <a href='http://eebo.chadwyck.com/home' target='_blank'>Early English Books Online</a>.</td>
		<td style="width: 2em">&nbsp:</td>
		<td>Unlike similar databases, DREaM enables mass downloading of custom-defined subsets rather than obliging users to download individual texts one-by-one. In other words, it functions at the level of &lsquo;sets of texts,&rsquo; rather than &lsquo;individual texts.&rsquo; Examples of subsets one might potentially generate include &lsquo;all texts by Ben Jonson,&rsquo; &lsquo;all texts published in 1623,&rsquo; or &lsquo;all texts printed by John Wolfe.&rsquo; The subsets are available as either plain text or XML encoded files, and users have the option to automatically name individual files by date, author, title, or combinations thereof. There is also an option to download subsets in the original spelling, or in an automatically normalized version.</td>
	</tr>
</table>

</body>
</html>