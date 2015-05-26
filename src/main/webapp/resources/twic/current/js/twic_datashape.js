var TWiC = (function(namespace){

    // From http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
    namespace.ShadeBlend = function(p,c0,c1) {

        var n=p<0?p*-1:p,u=Math.round,w=parseInt;

        if ( c0.length > 7 ) {
            var f=c0.split(","),t=(c1?c1:p<0?"rgb(0,0,0)":"rgb(255,255,255)").split(","),R=w(f[0].slice(4)),G=w(f[1]),B=w(f[2]);
            return "rgb("+(u((w(t[0].slice(4))-R)*n)+R)+","+(u((w(t[1])-G)*n)+G)+","+(u((w(t[2])-B)*n)+B)+")"
        }
        else {
            var f=w(c0.slice(1),16),t=w((c1?c1:p<0?"#000000":"#FFFFFF").slice(1),16),R1=f>>16,G1=f>>8&0x00FF,B1=f&0x0000FF;
            return "#"+(0x1000000+(u(((t>>16)-R1)*n)+R1)*0x10000+(u(((t>>8&0x00FF)-G1)*n)+G1)*0x100+(u(((t&0x0000FF)-B1)*n)+B1)).toString(16).slice(1)
        }
    };

    // TWiC Base data shape
    namespace.DataShape = function (p_coordinates, p_size, p_name, p_level, p_panel){

        this.m_coordinates = p_coordinates;
        this.m_size = p_size;
        this.m_name = p_name;
        this.m_level = p_level;
        this.m_panel = p_panel;
    };
    namespace.DataShape.method("BindDataToNode", function(p_node){ });
    namespace.DataShape.method("AppendSVGandBindData", function(p_node){ });


    // ClusterCircle (inherits from DataShape)
    namespace.ClusterCircle = function(p_coordinates, p_size, p_nodeIndex, p_level, p_panel, p_linkedViews, p_numberCircles, p_topics, p_ideal_text){

        // namespace.DataShape.apply(this, arguments.slice(0,5));
        namespace.DataShape.apply(this, arguments);

        this.m_numberCircles = p_numberCircles;
        this.m_ideal_text = p_ideal_text;
        this.m_topTopics = [];
        for ( var index = 0; index < this.m_numberCircles; index++ )
            this.m_topTopics.push([p_topics[index][0], p_topics[index][1]]);
        this.m_clusterGroup = null;
        this.m_linkedViews = p_linkedViews;

    };
    namespace.ClusterCircle.inherits(namespace.DataShape);

    namespace.ClusterCircle.prototype.s_colorHighlight = 0.50;
    namespace.ClusterCircle.prototype.s_colorLolight = -0.50;
    namespace.ClusterCircle.prototype.s_unhighlightedOpacity = 0.3;


    namespace.ClusterCircle.method("Load", function(){ });

    namespace.ClusterCircle.method("BindDataToNode", function(p_node){

        p_node.center = [this.m_coordinates.x, this.m_coordinates.y];
        p_node.radius = this.m_size;
        p_node.parentDims = [parseInt(this.m_panel.m_svg.attr("width")), parseInt(this.m_panel.m_svg.attr("height"))];
    });

    namespace.ClusterCircle.method("AppendSVGandBindData", function(p_node){

        var currentRadius = this.m_size;
        var radiusReduction = this.m_size / this.m_numberCircles;

        // Modify the given node to be a twic cluster group (extra parent group for smooth zoom-behavior)
        this.m_clusterGroup = p_node.append("g")
                                    .attr("class", "group_twic_datashape_smoothzooming")
                                    .attr("id", "twic_clustercircle_" + this.m_level.m_objectCount)
                                    //.on("mouseenter", function(d) { ClusterCircle.prototype.DarkenCluster(d); })
                                    .on("mouseout", function(){
                                        //this.m_panel.Update(null);
                                    }.bind(this));
                                    //.on("click", this.ClickToZoom(this));
        this.m_level.m_objectCount += 1;

        // Add each topic circle, binding data to it
        for ( var index = 0; index < this.m_numberCircles; index++ ){

            var data = null;
            if ( 1 == this.m_numberCircles ){
                 data = {
                    // Color
                    "color" : this.m_level.m_topicColors[this.m_topTopics[index][0]],
                    // Highlight color
                    "hicolor" : this.m_level.m_topicColors[this.m_topTopics[index][0]],

                    // Lolight color
                    "locolor" : this.m_level.m_topicColors[this.m_topTopics[index][0]],

                    // Topic ID
                    "topicID" : this.m_topTopics[index][0],

                    // Topic proportion
                    "prop" : this.m_topTopics[index][1]
                };
            }
            else {
                data = {
                    // Color
                    "color" : this.m_level.m_topicColors[this.m_topTopics[index][0]],
                    // Highlight color
                    "hicolor" : namespace.ShadeBlend(TWiC.ClusterCircle.prototype.s_colorHighlight,
                                                     this.m_level.m_topicColors[this.m_topTopics[index][0]]),
                    //"hicolor" : "white",
                    // Lolight color
                    "locolor" : namespace.ShadeBlend(TWiC.ClusterCircle.prototype.s_colorLolight,
                                                     this.m_level.m_topicColors[this.m_topTopics[index][0]]),
                    //"locolor" : "black",
                    // Topic ID
                    "topicID" : this.m_topTopics[index][0],
                    // Topic proportion
                    "prop" : this.m_topTopics[index][1]
                };
            }

            this.m_clusterGroup.append("circle")
                               .datum(data)
                               .attr("class","topic_circle")
                               .attr("id", function(d){ return "topic-" + d.topicID; })
                               .attr("cx", this.m_coordinates.x)
                               .attr("cy", this.m_coordinates.y)
                               .attr("r", currentRadius)
                               //.style("fill", topicColors[this.topTopics[index][0]])
                               .style("fill", function(d){ return d.locolor; })
                               .style("opacity", TWiC.ClusterCircle.prototype.s_unhighlightedOpacity)
                               .on("mouseover", function(d){
                                   this.m_panel.Update(d);
                                   for ( var index = 0; index < this.m_panel.m_linkedViews.length; index++ ){
                                       this.m_panel.m_linkedViews[index].Update(d);
                                   }
                               }.bind(this))
                               .on("mouseout", function(d){
                                   this.m_panel.Update(null);
                                   for ( var index = 0; index < this.m_panel.m_linkedViews.length; index++ ){
                                       this.m_panel.m_linkedViews[index].Update(null);
                                   }
                               }.bind(this))
                               .on("click", function(d){
                                   this.m_panel.Update(d);
                                   for ( var index = 0; index < this.m_panel.m_linkedViews.length; index++ ){
                                       this.m_panel.m_linkedViews[index].Update(d);
                                   }
                               }.bind(this));
                               //.on("mouseout",  function(d){ ClusterCircle.prototype.HighlightTopicShapes(d, false); });


            currentRadius -= radiusReduction;
        }
    });

    namespace.ClusterCircle.method("HighlightCluster", function(p_topicID){

        this.m_clusterGroup.selectAll(".topic_circle")
                           .filter(function(d){ return p_topicID == d.topicID; })
                           .style("fill", function(d){ return d.color; })
                           .style("opacity", 1.0);
        this.m_clusterGroup.selectAll(".topic_circle")
                           .filter(function(d){ return p_topicID != d.topicID; })
                           .style("fill", function(d){ return d.locolor; })
                           .style("opacity", TWiC.ClusterCircle.prototype.s_unhighlightedOpacity);
    });

    namespace.ClusterCircle.method("DarkenCluster", function(){

        this.m_clusterGroup.selectAll(".topic_circle")
                           .style("fill", function(d){ return d.locolor; })
                           .style("opacity", TWiC.ClusterCircle.prototype.s_unhighlightedOpacity);
    });

    namespace.ClusterCircle.method("HighlightTopicShapes", function (data, highlight){

        // selectAll() + filter() yields multi-cluster coloring!!!
        var filteredCircles = this.m_panel.m_svg.selectAll(".topic_circle")
                                                .filter(function(d){ return d.topicID == data.topicID; })
                                                .style("fill", data.color);
        this.m_panel.m_svg.selectAll(".topic_circle")
                          .filter(function(d){ return d.topicID != data.topicID; })
                          .style("fill", function(d){ return d.locolor; })
                          .style("opacity", TWiC.ClusterCircle.prototype.s_unhighlightedOpacity);
        filteredCircles.each(function(d){ d3.select(this.parentNode).selectAll(".topic_circle").style("opacity", 1); });
    });


    // TextRectangle constructor
    namespace.TextRectangle = function(){

    };
    namespace.TextRectangle.inherits(namespace.DataShape);

    return namespace;

}(TWiC || {}));