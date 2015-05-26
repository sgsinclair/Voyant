var TWiC = (function(namespace){

    // Basic constructor (property initialization occurs later)
    namespace.Level = function(){

        this.m_queue = new queue();
        this.m_corpusMap = {};
        this.m_corpusInfo = {};
        this.m_topicWordLists = {};
        this.m_topicColors = {};
        this.m_objectCount = 0;
        this.m_graphViews = null;
        this.m_infoViews = null;
        this.m_levelDiv = null;
    };
    namespace.Level.prototype.s_twicLevels = [];

    // Creating a Level instance also adds it to the TWiC level list
    namespace.Level.prototype.Instance = function(){
        var new_level = new namespace.Level();
        namespace.Level.prototype.s_twicLevels.push(new_level);
        return new_level;
    };

    // Loads all JSON required for TWiC
    namespace.Level.method("LoadJSON", function(p_corpusInfoPath, p_corpusMapPath){

        // Load the corpus information JSON
        var corpusInfo = null;
        var level = this;
        this.m_queue.defer(function(callback) {
            d3.json(p_corpusInfoPath, function(error, data) {
                corpusInfo = data;
                this.m_corpusInfo = corpusInfo;
                this.m_topicWordLists = corpusInfo.topic_info[0];
                this.m_topicColors = corpusInfo.topic_info[1];
                callback(null, corpusInfo);
            }.bind(this));
        }.bind(this));

        // Load the corpus distance map JSON
        var corpusDistanceMap = null;
        this.m_queue.defer(function(callback) {
            d3.json(p_corpusMapPath, function(error, data) {
                corpusDistanceMap = data;
                this.m_corpusMap = corpusDistanceMap;
                callback(null, corpusDistanceMap);
            }.bind(this));
        }.bind(this));
    });

    namespace.Level.method("Initialize", function(p_coordinates, p_size, p_name, p_graphViews, p_infoViews, p_d3bodySelector){

        this.m_coordinates = p_coordinates;
        this.m_size = p_size;
        this.m_name = p_name;
        this.m_graphViews = p_graphViews;
        this.m_infoViews = p_infoViews;

        // Create the level container div and svg
        this.m_levelDiv = d3.select(p_d3bodySelector || "body")
                            .append("div")
                            .attr("class", "div_twic_level")
                            .attr("id", "twic_level_" + this.m_name)
                            .style("position", "relative")
                            .style("left", this.m_coordinates.x)
                            .style("top", this.m_coordinates.y)
                            .style("max-width", this.m_size.width)
                            .style("max-height", this.m_size.height);

        // Add and setup the graph div and svg elements
        for ( var index = 0; index < this.m_graphViews.length; index++ ){

            this.m_graphViews[index].Initialize(this.m_levelDiv);
        }

        // Add and setup the informational div and svg elements
        for ( var index = 0; index < this.m_infoViews.length; index++ ){

            this.m_infoViews[index].Initialize(this.m_levelDiv);
        }
    });

    namespace.Level.method("Start", function(){

      for ( var index = 0; index < this.m_graphViews.length; index++ ){
          this.m_graphViews[index].Start();
      }
      for ( var index = 0; index < this.m_infoViews.length; index++ ){
          this.m_infoViews[index].Start();
      }

    });

    namespace.GetViewport = function(){

        var e = window, a = 'inner';

        if ( !('innerWidth' in window) ){

            a = 'client';
            e = document.documentElement || document.body;
        }

        return { width : e[ a+'Width' ] , height : e[ a+'Height' ] }
    }

    return namespace;
}(TWiC || {}));
