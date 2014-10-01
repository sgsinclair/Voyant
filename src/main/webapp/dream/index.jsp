<%@ include file="../resources/jsp/pre_app.jsp" %>
<script>
	Ext.Loader.setConfig({
		enabled : true,
		paths : {
			'Voyant' : '../app',
			'resources': '../resources'
		}
	});

	Ext.define("Voyant.panel.Dream", {
		extend: "Ext.panel.Panel",
		mixins: ['Voyant.panel.Panel'],
		alias: 'widget.dream',
	    config: {
	    	corpus: undefined,
	    	stores: []
	    },
    	listeners: {
    		afterrender: function(container) {
    			if (!container.getCorpus()) {
    				container.body.mask();
    			}
    			var names = ['lexical','title','author','publisher'];
    			var stores = [];
    			names.forEach(function(name) {
	    			var dom = container.getEl().dom.querySelector("input[name='"+name+"']");
	    			var store = Ext.create("Voyant.data.store.CorpusTerms", {
	                    	autoLoad: false,
	                    	extraParams: {
	                    		tokenType: name
	                    	}
	                    });
	    			stores.push(store);
	    			Ext.create("Ext.form.field.ComboBox", {
	                    width: 150,
	                    store: store,
	                    renderTo: dom,
                        minChars: 0,
			            queryMode: 'remote',
			            displayField: 'term'/*,
			            listeners: {
//			                select: 'onStateSelected',
			                delay: 1
			            }*/
	                }).getEl().replace(dom)
    			});
    			container.setStores(stores);
    		},
    		loadedCorpus: function(src, corpus) {
    			this.body.unmask();
    			this.setCorpus(corpus);
    			this.getStores().forEach(function(store) {
    				store.setCorpus(corpus);
    			})
    		}
    	}
	})
	Ext.application({
		extend : 'Voyant.VoyantCorpusApp',
		name: 'VoyantDreamApp',
		requires: ['Ext.ux.form.SearchField'],
		config: {
			baseUrl: '../',
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
			    	xtype: 'dream'
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
		<td>The DREaM Database indexes 44,000+ early modern texts, thus making long-neglected material more amenable to marco-scale textual analysis. The corpus comprises approximately one-third of all the titles in the Stationer’s Register and all of the texts transcribed thus far by the <a href='http://www.textcreationpartnership.org' target='_blank'>Text Creation Partnership</a>, an initiative that aims to create standardized, accurate XML/SGML encoded full text editions of all documents available from <a href='http://eebo.chadwyck.com/home' target='_blank'>Early English Books Online</a>.</td>
		<td>Unlike similar databases, DREaM enables mass downloading of custom-defined subsets rather than obliging users to download individual texts one-by-one. In other words, it functions at the level of ‘sets of texts,’ rather than ‘individual texts.’ Examples of subsets one might potentially generate include ‘all texts by Ben Jonson,’ ‘all texts published in 1623,’ or ‘all texts printed by John Wolfe.’ The subsets are available as either plain text or XML encoded files, and users have the option to automatically name individual files by date, author, title, or combinations thereof. There is also an option to download subsets in the original spelling, or in an automatically normalized version.</td>
	</tr>
</table>

<div align="center">
	<table>
		<tr>
			<td>
				<table>
					<tr>
						<td>Select by keywords in the full-text</td>
						<td><input name="lexical" /></td>
					</tr>
					<tr>
						<td>Select by keywords in the title</td>
						<td><input name="title" /></td>
					</tr>
				</table>
			</td>
			<td style="width: 5em;">&nbsp;</td>
			<td>
				<table>
					<tr>
						<td>Select by author name</td>
						<td><input name="author" /></td>
					</tr>
					<tr>
						<td>Select by publisher name</td>
						<td><input name="publisher" /></td>
					</tr>
				</table>
			</td>
		</tr>
		<tr>
			<td colspan="3" style="text-align: center">
				<input type="button" value="view corpus in Voyant Tools" /> <i>or</i>
				<input type="button" value="Download" /> an archive of <span id='dreamTotalCount'></span> 
				<select>
					<option value="XML" selected="selected">XML</option>
					<option value="text">text</option>
				</select> files
			</td>
		</tr>
	</table>
</div>

</body>
</html>