var TWiC = (function(namespace){

    // Base for TWiC panels
    namespace.Panel = function(p_coordinates, p_size, p_name, p_level, p_linkedViews){

        this.m_coordinates = p_coordinates;
        this.m_size = p_size;
        this.m_name = p_name;
        this.m_level = p_level;
        this.m_div = null;
        this.m_svg = null;
        this.m_groupOverlay = null;
        this.m_linkedViews = p_linkedViews;
    };

    namespace.Panel.method("Initialize", function(){});
    namespace.Panel.method("Start", function(){});
    namespace.Panel.method("Update", function(data){});


    // Base for TWiC graph view
    namespace.GraphView = function(p_coordinates, p_size, p_name, p_level, p_linkedViews){

        namespace.Panel.apply(this, arguments);
    };
    namespace.GraphView.inherits(namespace.Panel);

    namespace.GraphView.prototype.Collide = function(node) {

        var radiusExtension = 16;
        var r = node.radius + radiusExtension,
            nx1 = node.x - r,
            nx2 = node.x + r,
            ny1 = node.y - r,
            ny2 = node.y + r;

        return function(quad, x1, y1, x2, y2) {

            if (quad.point && (quad.point !== node)) {

                var x = node.x - quad.point.x,
                    y = node.y - quad.point.y,
                    l = Math.sqrt(x * x + y * y),
                    r = node.radius + quad.point.radius;

                if (l < r) {

                    l = (l - r) / l * .5;
                    node.x -= x *= l;
                    node.y -= y *= l;
                    quad.point.x += x;
                    quad.point.y += y;
                }
            }

            return x1 > nx2
                || x2 < nx1
                || y1 > ny2
                || y2 < ny1;
        };
    };


    // High level corpus view (TWiC.CorpusCluster)
    namespace.CorpusView = function(p_coordinates, p_size, p_name, p_level, p_linkedViews){

        namespace.GraphView.apply(this, arguments);
    };
    namespace.CorpusView.inherits(namespace.GraphView);


    // Higher midlevel corpus bullseye cluster view (TWiC.CorpusCluster)
    namespace.CorpusClusterView = function(p_coordinates, p_size, p_name, p_level, p_linkedViews){

        namespace.GraphView.apply(this, arguments);

        this.m_twicObjects = [];
        this.m_objectsJSON = [];
        this.m_nodes = [];
        this.m_links = [];
        this.m_graph = null;
        this.m_idealText = this.m_level.m_corpusMap["ideal_text"];
        this.b_positionsCalculated = false;
        this.m_rootIndex = -1;
        this.m_zoomBehavior = d3.behavior.zoom();
    };
    namespace.CorpusClusterView.inherits(namespace.GraphView);

    namespace.CorpusClusterView.method("Initialize", function(p_levelDiv){

        this.m_div = p_levelDiv.append("div")
                               .attr("class", "div_twic_graph_corpusclusterview div_twic_graph twic_panel")
                               .attr("id", "div_twic_graph_corpusclusterview_" + this.m_name)
                               //.style("float", "left")
                               .style("left", this.m_coordinates.x)
                               .style("top", this.m_coordinates.y)
                               .style("max-width", this.m_size.width)
                               .style("max-height", this.m_size.height);

        this.m_svg = this.m_div.append("svg")
                               .attr("class", "svg_twic_graph")
                               .attr("id", "svg_twic_graph_corpusclusterview_" + this.m_name)
                               .attr("x", this.m_coordinates.x)
                               .attr("y", this.m_coordinates.y)
                               .attr("width", this.m_size.width)
                               .attr("height", this.m_size.height);

        // Add group and rectangle for trapping mouse events in the graph
        this.m_groupOverlay = this.m_svg.append("g")
                                        .attr("class","group_twic_graph_overlay")
                                        .attr("id", "group_twic_graph_overlay_" + this.m_name)
                                        .call(this.m_zoomBehavior.scaleExtent(TWiC.CorpusClusterView.prototype.s_scaleExtentLimits).on("zoom", this.ScrollToZoom(this)))
                                        .append("rect")
                                        .attr("class","rect_twic_graph")
                                        .attr("id","rect_twic_graph_" + this.m_name)
                                        .attr("x", this.m_coordinates.x)
                                        .attr("y", this.m_coordinates.y)
                                        .attr("rx", this.m_div.attr("border-radius"))
                                        .attr("ry", this.m_div.attr("border-radius"))
                                        .attr("width", this.m_size.width)
                                        .attr("height", this.m_size.height);

        var twic_objects = [];
        var twic_cluster_json_list = [];

        // Distance to ideal normalization via corpus map JSON data
        var avg = 0.0;
        for ( var index = 0; index < this.m_level.m_corpusMap["children"].length; index++ )
            avg += this.m_level.m_corpusMap["children"][index]["distance2ideal"];
        avg /= this.m_level.m_corpusMap["children"].length;

        // Build all clusters
        var linkDilation = 80;
        for ( var index = 0; index < this.m_level.m_corpusMap["children"].length; index ++ ){

            var cluster_location = [0,0];
            var twic_cluster = new TWiC.ClusterCircle([0,0], 20, index, this.m_level, this, this.m_linkedViews, 10,
                                                      this.m_level.m_corpusMap["children"][index]["topics"],
                                                      this.m_level.m_corpusMap["children"][index]["ideal_text"]);
            this.m_objectsJSON.push({
                "name":this.m_level.m_corpusMap["children"][index]["name"],
                "ideal_text":this.m_level.m_corpusMap["children"][index]["ideal_text"],
                //"distance2ideal":this.m_level.m_corpusMap["children"][index]["distance2ideal"],
                "distance2ideal":2 + Math.abs((this.m_level.m_corpusMap["children"][index]["distance2ideal"] - avg) * linkDilation),
                "topics":this.m_level.m_corpusMap["children"][index]["topics"],
                "children":[]
            });
            this.m_twicObjects.push(twic_cluster);
        }

        // Node zero for the force-directed graph will be the "ideal_text" of this level
        var rootIndex = 0;
        for ( var index = 0; index < this.m_objectsJSON.length; index++ ){

            if ( this.m_idealText == this.m_objectsJSON[index]["ideal_text"] ){

                //this.m_nodes.push({"node_index":index});
                this.m_nodes.push({"index":index});
                rootIndex = index;
                this.m_rootIndex = rootIndex;
            }
        }

        // In case the ideal text for the corpus is not among the ideal texts represented by a cluster
        var b_fakeRoot = false;
        if ( 0 == this.m_nodes.length ){

            // Add a fake node which will represent this ideal text as the central node amongst the clusters
            b_fakeRoot = true;
            rootIndex = this.m_twicObjects.length;
            this.m_rootIndex = rootIndex;
            //this.m_nodes.push({"node_index":rootIndex});
            this.m_nodes.push({"index":rootIndex});

            // Top X topics of the fake node
            var topTopics = [];
            var topTopicCount = 10;
            for ( var index = 0; index < topTopicCount; index++ ) { topTopics.push([]) };
            var topTopicID = "";
            for ( var topic in this.m_level.m_corpusMap["topics"] ){
                if ( this.m_level.m_corpusMap["topics"][topic][0] < topTopicCount + 1){
                    topTopics[this.m_level.m_corpusMap["topics"][topic][0] - 1] = this.m_level.m_corpusMap["topics"][topic];
                }
            }

            // Add a twic cluster object to the graph to represent this single document (may enable clickability later)
            /*var topTopicID = "";
            for ( var topic in CorpusClusterView.prototype.s_corpusMap["topics"] ){
                if ( 1 == CorpusClusterView.prototype.s_corpusMap["topics"][topic][0] ){
                    topTopicID = topic;
                    break;
                }
            }
            var topTopic = [CorpusClusterView.prototype.s_corpusMap["topics"][topTopicID]];*/
            this.m_twicObjects.push(new TWiC.ClusterCircle([0,0], 20, rootIndex, this.m_level, this, this.m_linkedViews,
                                                           topTopicCount, topTopics, this.m_level.m_corpusMap["ideal_text"]));
        }

        // Establish the rest of the nodes and edges for the force-directed graph
        for ( var index = 0; index < this.m_objectsJSON.length; index++ ){

            //if ( this.m_idealText == this.m_objectsJSON[index]["ideal_text"] )
            if ( rootIndex == index )
                continue;

            //this.m_nodes.push({"node_index":index});
            this.m_nodes.push({"index":index});
            this.m_links.push({
                "source":index,
                "target":rootIndex,
                "value":this.m_objectsJSON[index]["distance2ideal"]
            });
        }

        // Set up the force-directed graph
        this.m_graph = d3.layout.force()
                                .nodes(this.m_nodes)
                                .links(this.m_links)
                                .size([this.m_size.width, this.m_size.height])
                                .charge(0.2)
                                .gravity(0)
                                //.chargeDistance(10)
                                .linkDistance(function(d){ return d.value * TWiC.CorpusClusterView.prototype.s_linkDistanceMod; });
    });

    namespace.CorpusClusterView.method("Start", function(){

        // Start the force-directed graph
        //this.m_graph.start();

        // Add lines for the links and bind the link data to them
        var link = this.m_svg.selectAll(".link")
                       .data(this.m_links)
                       .enter()
                       .append("line")
                       .attr("class", "link")
                       .style("stroke-width", function(d) { return Math.sqrt(d.value); })
                       .style("stroke","black");
                       //.style("stroke-width", 5);

        // Bind TWiC object data to the node data
        for ( index = 0; index < this.m_twicObjects.length; index++ ) {
            for ( var index2 = 0; index2 < this.m_nodes.length; index2++ ){
                //if ( this.m_twicObjects[index].nodeIndex == this.m_nodes[index2]["node_index"] ){
                if ( this.m_twicObjects[index].m_name == this.m_nodes[index2]["index"] ){
                    this.m_twicObjects[index].BindDataToNode(this.m_nodes[index2]);
                    break;
                }
                /*graph.nodes[index].width = twic_rectangles[index].dimensions[0];
                graph.nodes[index].height = twic_rectangles[index].dimensions[1];
                graph.nodes[index].cornerRadius = twic_rectangles[index].cornerRadius;
                graph.nodes[index].fillColor = twic_rectangles[index].fillColor;*/
            }
        }

        // NOTE: force.drag call should be on svg parent,
        // like it is here on the top group for this TWIC rectangle
        var node = this.m_svg.selectAll(".node")
                             .data(this.m_nodes)
                             .enter()
                             .append("g")
                             .attr("class", "node")
                             //.attr("id", function(d){return "node_" + d.node_index;})
                             .attr("id", function(d){return "node_" + d.index;});
                             //.call(this.m_graph.drag);

        // Neat transition in effect for circles from:
        // http://bl.ocks.org/mbostock/7881887
        /*node.transition()
            .duration(750)
            .delay(function(d, i) { return i * 5; })
            .attrTween("r", function(d) {
              var i = d3.interpolate(0, d.radius);
              return function(t) { return d.radius = i(t); };
            });
        */

        // Append TWiC object svg elements to the nodes with corresponding bound data
        for ( index = 0; index < this.m_twicObjects.length; index++ ) {
            for ( var index2 = 0; index2 < this.m_nodes.length; index2++ ){
                //if ( this.m_twicObjects[index].nodeIndex == this.m_nodes[index2]["node_index"] ){
                if ( this.m_twicObjects[index].m_name == this.m_nodes[index2]["index"] ){
                    this.m_twicObjects[index].AppendSVGandBindData(this.m_svg.select(".node#node_" + index2));
                }
            }
        }
        /*node.append("svg:rect")
               .attr("class", "node_rects")
               .attr("width", function(d){ return d.width; })
               .attr("height", function(d){ return d.height; })
               .attr("rx", function(d){ return d.cornerRadius; })
               .attr("ry", function(d){ return d.cornerRadius; })
               .style("stroke", function(d) { return fascicleColors[d.fascicle]; })
               .style("fill", function(d) { return d.fillColor})
               .style("position", "absolute");
        */

        // Add tick function for graph corresponding to object type
        setTimeout(function(){

            this.m_graph.start();

            for (var i = 1000; i > 0; --i)
                this.Tick();

            this.m_graph.stop();

            this.b_positionsCalculated = true;
        }.bind(this), 10);

        //twicLevel.m_graph.start();
        //this.m_graph.on("tick", function() { twicLevel.Tick(twicLevel); });
    });

    namespace.CorpusClusterView.method("ScrollToZoom", function(p_twicLevel){

      var cb = function(error, data){

          // Scale the level group attached to the svg container
          d3.select("#twic_level_" + p_twicLevel.m_name).attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      }

      return cb;
    });

    namespace.CorpusClusterView.method("Tick", function(){

        var links = this.m_svg.selectAll(".link"); // Perform visible/active test later
        var nodes = this.m_svg.selectAll(".node"); // Perform visible/active test later
        var svgWidth = parseInt(this.m_svg.attr("width"));
        var svgHeight = parseInt(this.m_svg.attr("height"));

        this.m_nodes[this.m_rootIndex].x = svgWidth >> 1;
        this.m_nodes[this.m_rootIndex].y = svgHeight >> 1;

        if ( !this.b_positionsCalculated ){

            nodes.attr("cx", function(d) { return d.x = Math.max(d.radius, Math.min(svgWidth - d.radius, d.x)); })
                 .attr("cy", function(d) { return d.y = Math.max(d.radius, Math.min(svgHeight - d.radius, d.y)); });

            var q = d3.geom.quadtree(this.m_nodes);
            var i = 0;
            var n = this.m_nodes.length;

            while (++i < n) { q.visit(namespace.GraphView.prototype.Collide(this.m_nodes[i])); }

            links.attr("x1", function(d) { d.source.firstX = d.source.x; return d.source.x; })
                 .attr("y1", function(d) { d.source.firstY = d.source.y; return d.source.y; })
                 .attr("x2", function(d) { d.target.firstX = d.target.x; return d.target.x; })
                 .attr("y2", function(d) { d.target.firstY = d.target.y; return d.target.y; });

            nodes.attr("transform", function(d) {
                d.firstX = d.x;
                d.firstY = d.y;
                return "translate(" + d.x + "," + d.y + ")";
            });
        }
        else{
             links.attr("x1", function(d) { return d.source.firstX; })
                  .attr("y1", function(d) { return d.source.firstY; })
                  .attr("x2", function(d) { return d.target.firstX; })
                  .attr("y2", function(d) { return d.target.firstY; });

              nodes.attr("transform", function(d) { return "translate(" + d.firstX + "," + d.firstY + ")"; });
        }
    });

    namespace.CorpusClusterView.method("Update", function(data){

        /*for ( var index = 0; index < this.m_twicObjects.length; index++ ){

            if ( this.m_twicObjects[index].m_clusterGroup
                   .selectAll(".topic_circle")
                   .filter(function(d){ return d.topicID == data.topicID; }.bind(data.topicID))
                   .empty() ){
                this.m_twicObjects[index].DarkenCluster();
            }
            else {
                this.m_twicObjects[index].HighlightCluster(data.topicID);
            }
        }*/

        if ( null != data ){
            this.HighlightAllClustersWithTopic(data);
        } else {
            this.DarkenAllClusters();
        }
    });

    namespace.CorpusClusterView.method("DarkenAllClusters", function(){

        // Darken all clusters
        this.m_svg.selectAll(".topic_circle")
                  .style("fill", function(d){ return d.locolor; })
                  .style("opacity", TWiC.ClusterCircle.prototype.s_unhighlightedOpacity);

        // Set the
    });

    namespace.CorpusClusterView.method("HighlightAllClustersWithTopic", function(data){

        // Color all circles that represent the given topic
        var filteredCircles = this.m_svg.selectAll(".topic_circle")
                                        .filter(function(d){ return d.topicID == data.topicID; })
                                        .style("fill", data.color);

        // Darken all circles that don't represent the given topic
        this.m_svg.selectAll(".topic_circle")
                  .filter(function(d){ return d.topicID != data.topicID; })
                  .style("fill", function(d){ return d.locolor; })
                  .style("opacity", TWiC.ClusterCircle.prototype.s_unhighlightedOpacity);

        // Raise the opacity of all circles in the highlighted cluster
        filteredCircles.each(function(d){
            d3.select(this.parentNode)
              .selectAll(".topic_circle")
              .style("opacity", 1.0);
          });
    });


    namespace.CorpusClusterView.prototype.s_linkDistanceMod = 100;
    namespace.CorpusClusterView.prototype.s_scaleExtentLimits = [1, 16];


    // Lower midlevel document rectangle cluster view (TWiC.TextRectangle)
    namespace.TextClusterView = function(p_coordinates, p_size, p_name, p_level, p_linkedViews){

        namespace.GraphView.apply(this, arguments);
    };
    namespace.TextClusterView.inherits(namespace.GraphView);


    // Low level individual text view (TWiC.TopicTextHTML)
    namespace.TextView = function(p_coordinates, p_size, p_name, p_level, p_linkedViews){

        namespace.GraphView.apply(this, arguments);
    };
    namespace.TextView.inherits(namespace.GraphView);


    // Base for informational views
    namespace.InformationView = function(p_coordinates, p_size, p_name, p_level, p_linkedViews){

        namespace.Panel.apply(this, arguments);
    };
    namespace.InformationView.inherits(namespace.Panel);


    // Shows corpus, cluster(?), and text topic word lists (TWiC.TextLine)
    namespace.TopicBar = function(p_coordinates, p_size, p_name, p_level, p_linkedViews){

        namespace.InformationView.apply(this, arguments);
    };
    namespace.TopicBar.inherits(namespace.InformationView);

    namespace.TopicBar.method("Initialize", function(p_levelDiv){

        // No initial selected text
        this.m_currentSelection = -1;

        this.m_div = p_levelDiv.append("div")
                               .attr("class", "div_twic_info_topicbar div_twic_info twic_panel")
                               .attr("id", "div_twic_info_topicbar_" + this.m_name)
                               //.style("float", "left")
                               .style("left", this.m_coordinates.x)
                               .style("top", this.m_coordinates.y)
                               .style("max-width", this.m_size.width)
                               .style("max-height", this.m_size.height);

        // Topic bar svg viewport (NOTE: viewBox needed?)
        this.m_svg = this.m_div.append("svg")
                               .attr("class", "svg_twic_info")
                               .attr("id","svg_twic_info_topicbar_" + this.m_name)
                               .attr("x", this.m_coordinates.x)
                               .attr("y", this.m_coordinates.y)
                               .attr("width", this.m_size.width)
                               .attr("height", this.m_size.height)
                               //.attr("width", namespace.TopicBar.prototype.s_svgSize.width)
                               //.attr("height", namespace.TopicBar.prototype.s_svgSize.height);
                               .attr("viewBox", "0 " + namespace.TopicBar.prototype.s_textInfo.yIncrement + " " +
                                     namespace.TopicBar.prototype.s_svgSize.width + " " +
                                     namespace.TopicBar.prototype.s_svgSize.height);

        // Topic bar topic group
        var topicBarGroup = this.m_svg.append("g")
                                      .attr("class","group_twic_topicbar");

        // Create topic array for svg text printing
        var topicStrArray = [];
        var topicStr;
        for ( var topic_index = 0; topic_index < this.m_level.m_topicWordLists.length; topic_index++ ) {

            topicStr = "Topic " + topic_index.toString() + ": ";
            for ( var word_index = 0; word_index < this.m_level.m_topicWordLists[topic_index].length; word_index++ ){

                topicStr += this.m_level.m_topicWordLists[topic_index][word_index] + " ";
            }
            topicStrArray.push(topicStr.trim());
        }

        // Print svg text/tspans for each topic using the 'textFlow' library
        var rectGrowth = 0;
        //for ( var index = 0, yPosition = TWiC_TopicBar.prototype.s_textInfo.yStart;
        for ( var index = 0, yPosition = namespace.TopicBar.prototype.s_textInfo.yStart + namespace.TopicBar.prototype.s_textInfo.fontSize;
              index < topicStrArray.length; index++ ){

            // Append opaque rectangle that will be used as highlight for each topic word list
            var highlightRect = topicBarGroup.append("rect")
                                             .attr("class", "topic_highlightrect")
                                             .attr("id", "topic_" + index)
                                             .attr("fill", this.m_level.m_topicColors[index]);

            // Add the topic text element
            var topicText = topicBarGroup.append("text")
                                         .attr("class", "topic_wordlist")
                                         .attr("id", "topic_" + index)
                                         .datum({"id":index.toString()})
                                         .attr("x", "0")
                                         .attr("y", yPosition)
                                         .attr("dx", "0")
                                         .attr("dy", "0")
                                         .attr("fill", this.m_level.m_topicColors[index])
                                         .on("click", function(d){
                                                update_data = {topicID:d.id, color:this.m_level.m_topicColors[d.id]};
                                                this.HighlightText(update_data);
                                                for ( var view_index = 0; view_index < this.m_linkedViews.length;
                                                      view_index++ ){
                                                    this.m_linkedViews[view_index].Update(update_data);
                                                }
                                             }.bind(this));

            var dy = textFlow(topicStrArray[index],
                              topicText[0][0],
                              namespace.TopicBar.prototype.s_svgSize.width,
                              //namespace.TopicBar.prototype.s_textInfo.fontSize,
                              topicText.style("font-size"),
                              namespace.TopicBar.prototype.s_textInfo.yIncrement, false);

            // More attributes added after svg text is added to the DOM
            // (done this way for drawing order/later highlighting)
            highlightRect.datum({"dy":rectGrowth + dy})
                         .attr("x", topicText.attr("x"))
                         .attr("y", parseInt(topicText.attr("y")) - parseInt(topicText.style("font-size")))
                         .attr("width", namespace.TopicBar.prototype.s_svgSize.width)
                         .attr("height", dy)
                         .attr("opacity", 0);

            yPosition += dy;
            rectGrowth += dy;
        }

        // Alter the height of the svg and rect to match the printed topics
        this.m_svg.attr("height", rectGrowth);
    });


    namespace.TopicBar.method("HighlightText", function(data){

        // De-highlight current highlighted text if any selection
        if ( -1 != this.m_currentSelection ) {
            d3.select(".topic_wordlist#topic_" + this.m_currentSelection)
              .attr("fill", function(d){ return this.m_level.m_topicColors[this.m_currentSelection]; }.bind(this));
            d3.select(".topic_highlightrect#topic_" + this.m_currentSelection)
              .attr("fill", this.m_div.style("background-color"))
              .attr("opacity", "0");
        }

        // Highlight the newly selected topic
        d3.select(".topic_wordlist#topic_" + data.topicID).attr("fill", this.m_div.style("background-color"));
        d3.select(".topic_highlightrect#topic_" + data.topicID).attr("fill", data.color).attr("opacity", "1");
        this.m_currentSelection = data.topicID;
    });

    //namespace.TopicBar.method("HighlightTopicinPanel", function(data, highlight){
    namespace.TopicBar.method("Update", function(data){

        // Highlight the topic word list and scroll to it
        if ( null != data ) {

            d3.select(".topic_wordlist#topic_" + data.topicID).attr("fill", this.m_div.style("background-color"));
            d3.select(".topic_highlightrect#topic_" + data.topicID).attr("fill", data.color).attr("opacity", "1");
            dy = d3.select(".topic_highlightrect#topic_" + data.topicID).datum()["dy"]
            d3.select(".svg_twic_info").attr("viewBox","0 " + dy + " " +
                                             //(parseInt(data.topicID) * namespace.TopicBar.prototype.s_textInfo.yIncrement) + " " +
                                             namespace.TopicBar.prototype.s_svgSize.width + " " +
                                             namespace.TopicBar.prototype.s_svgSize.height);
            //d3.select("#twic_topicbar_svg").attr("scrollTop",parseInt(data.topicID) * 50);

            // Save the current highlighted topic ID
            this.m_currentSelection = data.topicID;
        }
        // De-highlight all topic words lists and scroll back to the top of the topic bar
        else {

            d3.selectAll(".topic_wordlist").attr("fill", function(d){ return this.m_level.m_topicColors[d.id]; }.bind(this));
            d3.selectAll(".topic_highlightrect").attr("fill", this.m_div.style("background-color")).attr("opacity", "0");
            d3.select(".svg_twic_info").attr("viewBox","0 " + namespace.TopicBar.prototype.s_textInfo.yIncrement +
                                             " " + namespace.TopicBar.prototype.s_svgSize.width +
                                             " " + namespace.TopicBar.prototype.s_svgSize.height);
            //d3.select("#twic_topicbar_svg").attr("scrollTop","0");
            // Reset the current selected topic to none
            this.m_currentSelection = -1;
        }
    });

    namespace.TopicBar.prototype.s_svgSize = { "width":1280, "height":165 };
    namespace.TopicBar.prototype.s_textInfo = { "yStart":-1405, "yIncrement":30, "fontSize":20 };


    // Shows individual cluster and text information tiles (TWiC.DocumentTiles)
    namespace.DocumentBar = function(p_coordinates, p_size, p_name, p_level, p_linkedViews){

        namespace.InformationView.apply(this, arguments);
    };
    namespace.DocumentBar.inherits(namespace.InformationView);

    namespace.DocumentBar.method("Initialize", function(p_levelDiv){

        this.m_div = p_levelDiv.append("div")
                               .attr("class", "div_twic_info_docbar div_twic_info twic_panel")
                               .attr("id", "div_twic_info_docbar" + this.m_name)
                               //.style("float", "left")
                               .style("left", this.m_coordinates.x)
                               .style("top", this.m_coordinates.y)
                               .style("max-width", this.m_size.width)
                               .style("max-height", this.m_size.height);

        // Document bar svg viewport (NOTE: viewBox needed?)
        this.m_svg = this.m_div.append("svg")
                               .attr("class", "svg_twic_info")
                               .attr("id","svg_twic_info_docbar_" + this.m_name)
                               .attr("x", this.m_coordinates.x)
                               .attr("y", this.m_coordinates.y)
                               .attr("width", this.m_size.width)
                               .attr("height", this.m_size.height);
                               //.attr("width", namespace.DocumentBar.prototype.s_svgSize.width)
                               //.attr("height", namespace.DocumentBar.prototype.s_svgSize.height);
                               //.attr("viewBox", "0 0 " +
                               //      (TWiC_DocumentBar.prototype.s_svgSize.width) + " " +
                               //      (TWiC_DocumentBar.prototype.s_svgSize.height));
    });

    namespace.DocumentBar.prototype.s_svgSize = { "width":600, "height":600 };


    return namespace;

}(TWiC || {}));