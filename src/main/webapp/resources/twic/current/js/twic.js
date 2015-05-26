(function(){

    var twicLevel = TWiC.Level.prototype.Instance();
    twicLevel.LoadJSON("data/input/json/twic_corpusinfo.json",
                       "data/input/json/twic_corpusmap.json");

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



        // Initialize the level
        twicLevel.Initialize([0,0], // Position
                             TWiC.GetViewport(), // Size
                             divName, // Name
                             graphViews, infoViews); // TWiC graph and information panels

        // Startup the level
        twicLevel.Start();
    }.bind(twicLevel));
})();
