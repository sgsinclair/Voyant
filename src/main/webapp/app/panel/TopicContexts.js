
// for mysterious reasons, Ext.require loads the scripts but produces a blank page, so use loadScript instead
/*
var twicPath = Ext.Loader.getPath("resources")+"/twic/current"
Ext.Loader.loadScript(twicPath+"/css/twic.css")
Ext.Loader.loadScript(twicPath+"/lib/queue.min.js")
Ext.Loader.loadScript(twicPath+"/lib/textFlow.js")
Ext.Loader.loadScript(twicPath+"/lib/svg_helper_functions.js")
Ext.Loader.loadScript(twicPath+"/lib/class_syntax.js")
Ext.Loader.loadScript(twicPath+"/js/twic_level.js")
Ext.Loader.loadScript(twicPath+"/js/twic_panel.js")
Ext.Loader.loadScript(twicPath+"/js/twic_datashape.js")
*/


Ext.define('Voyant.panel.TopicContexts', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.topiccontexts',
    statics: {
    	i18n: {
    	},
    	api: {
    	},
		glyph: 'xf06e@FontAwesome'
    },
    
    constructor: function(config) {

    	Ext.apply(this, {
    		title: this.localize('title'),
    		cls: 'twic_body'
    	});

        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);

    },
    
    listeners: {
    	loadedCorpus: function(src, corpus) {		
    		this.loadFromCorpus(corpus);
    	}
    	
    },
    
    loadFromCorpus: function(corpus) {
    	var url = Ext.Loader.getPath("resources")+"/twic/current/data/input/json"
        var twicLevel = TWiC.Level.prototype.Instance();
        twicLevel.LoadJSON(url+"/twic_corpusinfo.json", url+"/twic_corpusmap.json");
        var panel = this;

        // Once JSON has loaded, create and start the level
        twicLevel.m_queue.await(function(){

            // Create components
            var graphViews = [];
            var infoViews = [];
            var divName = "dickinson"; // NOTE: This needs to be added to twic_corpusinfo.json from serverside

            // Topic bar setup
            var topicBar = new TWiC.TopicBar({x:0, y:635}, // Position
                                             {width:1280, height:165}, // Size
                                             divName, // Name
                                             twicLevel, []); // Level and linked view(s)
            infoViews.push(topicBar);

            // Document info bar setup
            var docBar = new TWiC.DocumentBar({"x":1055, "y":0}, // Position
                                              {"width":225, "height":635}, // Size
                                              divName,  // Name
                                              twicLevel, []); // Level and linked view(s)
            infoViews.push(docBar);

            // Graph setup
            var corpusClusterView = new TWiC.CorpusClusterView({ "x":0, "y":0 }, // Position
                                                               { "width":1055, "height":635}, // Size
                                                               divName, // Name
                                                               twicLevel, [topicBar, docBar]); // Level and linked view(s)
            graphViews.push(corpusClusterView);

            // Link the corpus cluster view to the topic bar as well
            topicBar.m_linkedViews.push(corpusClusterView);

            var body = panel.getLayout().getRenderTarget();

            // Initialize the level
            twicLevel.Initialize([0,0], // Position
                                 {width: body.getWidth(), height: body.getHeight()}, // Size
                                 divName, // Name
                                 graphViews, infoViews, // TWiC graph and information panels
                                 '#'+body.getId()
            );

            // Startup the level
            twicLevel.Start();
        }.bind(twicLevel));

    }
    
})