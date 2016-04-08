/* (This is the new BSD license.)
* Copyright (c) 2012-2014, Chris Culy
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*     * Redistributions of source code must retain the above copyright
*       notice, this list of conditions and the following disclaimer.
*     * Redistributions in binary form must reproduce the above copyright
*       notice, this list of conditions and the following disclaimer in the
*       documentation and/or other materials provided with the distribution.
*     * Neither the name of the Chris Culy nor the 
*		names of its contributors may be used to endorse or promote 
*		products from this software without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY Chris Culy
* ``AS IS'' AND ANY OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, 
* THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE 
* ARE DISCLAIMED. IN NO EVENT SHALL Chris Culy
* BE LIABLE FOR ANY, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR 
* CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE 
* GOODS OR SERVICES; OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
* CAUSED AND ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR 
* TORT INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF 
* THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
"use strict";
/**
 @namespace doubletree
 All of the functionality is in the doubletree namespace
*/
var doubletree = {};

(function(){
  
  //TBD what about visWidth? to be fixed visWidth is really width and width is really just the width of one side of the doubletree
  
  /**
    @class doubletree.DoubleTree
    This is the class for the DoubleTree visualization
  */
  doubletree.DoubleTree = function() {
    var containers = []; //nominally for allowing the same tree in multiple places, but not tested and probably doesn't work right (e.g. for search)
    //defaults. see below for getter/setters
    var visWidth = 600;
    var visHt; //calculated, not settable
    var prefixesOnRight = false; //true for right to left writing systems
    var filters = {"left":[], "right":[]};
    var handlers = {"alt":noOp, "shift":noOp};
    var showTokenExtra = true;
    var scaleLabels = true;
    var sortFun = doubletree.sortByStrFld("token");
    var nodeText = doubletree.tokenText; //default
    var tokenExtraText = function(info) {
      return doubletree.fieldText(info, "POS");
    };
    var rectColor = function(info) {
      return "rgba(255,255,255,0)"; //transparent white
    };
    var rectBorderColor = function(info) {
      return "rgba(255,255,255,0)"; //transparent white
    };
    var continuationColor = function(info) {
	 return "red";
    }
    var basicStyles = {"node":{"fill":"white", "stroke":"steelblue", "stroke-width":"1.5px"}, "branch":{"stroke":"#aaa", "stroke-width":"1.5px"}};
    
    
    
    var succeeded = false; //did we succeed in building a DoubleTree? we need this flag, since we no longer return true/false from setupFromX (since we do chaining)
    
    var dispatch = d3.dispatch("idsUpdated");
    dispatch.on("idsUpdated", function() {
	if (this == leftTree) {
	  rtTree.setIds( leftTree.continuationIDs );
	  rtTree.updateContinuations();
	} else if (this == rtTree) {
	  leftTree.setIds( rtTree.continuationIDs );
	  leftTree.updateContinuations();
	}	 
    });
  
    var leftTrie, rtTrie, leftTree, rtTree;
    var visibleIDs; //the ids of the results that are showing
    
    //tmp, until we can do sizing right. the font sizes are specified in doubletree.css and manually copied here
    var kFontSize = 14; //normal
    var kBigFontSize = 1.15*kFontSize; //for found text and continuations (was 18) NB: this is 0.05 bigger than in doubletree.css
    var kMinFontSize = 8; //smallest that we'll scale to
    var textScale;
    
    /** @exports mine as doubletree.DoubleTree */
    /** @ignore */
    function mine(selection) {
      // generate container and data independent part of chart here, using `width` and `height` etc
      
      selection.each(function(d, i) {
	//generate chart here; `d` is the data and `this` is the element
	//really, storing containers. Use updateData and redraw to really do the generation
	containers.push(this[i]);
      });
    
    }
    
    /**
     * initialize the visualization in one or more html containers
     * <p>
     * @param containerPattern CSS selector for the containers
     */
    mine.init = function(containerPattern) {
      d3.select(d3.selectAll(containerPattern)).call(this);
      return mine;
    }
    
    /**
     * redraw the visualization
     */
    mine.redraw = function() {
      mine.setupFromTries(leftTrie, rtTrie);
      
      return mine;
    }
    

    /**
     * set up the visualization using 2 {@link doubletree.Trie}s
     * @param leftOne the left {@link doubletree.Trie}
     * @param rtOne the right {@link doubletree.Trie}
     */
    mine.setupFromTries = function(leftOne, rtOne) {
      leftTrie = leftOne.getUniqRoot();
      rtTrie = rtOne.getUniqRoot();
      
      
      
      var leftTrieTree =  leftTrie.toTree(filters.left);
      var rtTrieTree =  rtTrie.toTree(filters.right);
     
      var copyIDs = true;
      if (Object.keys(rtTrieTree.pruned).length > 0) {
        new_pruneTree(rtTrieTree, rtTrieTree.pruned, copyIDs);
        new_pruneTree(leftTrieTree, rtTrieTree.pruned, copyIDs);
        copyIDs = false;
      }
      
      if (Object.keys(leftTrieTree.pruned).length > 0 ) {
        new_pruneTree(leftTrieTree, leftTrieTree.pruned, copyIDs);
        new_pruneTree(rtTrieTree, leftTrieTree.pruned, copyIDs);
      }
      
      
      //combine the info's from the two trees
      var newInfo = {}; //rtTrieTree.info;
      
      for(var k in rtTrieTree.info) {
        if (k != "continuations" && k != "ids" && k != "count") {
          newInfo[k] = rtTrieTree.info[k];
        }
      }
     
      newInfo["right continuations"] = rtTrieTree.info.continuations;
      newInfo["left continuations"] = leftTrieTree.info.continuations;
      
     
      newInfo.ids = {};
      addTo(newInfo.ids, rtTrieTree.info.ids);
      addTo(newInfo.ids, leftTrieTree.info.ids);
      newInfo.count = Object.keys(newInfo.ids).length;
      visibleIDs = Object.keys(newInfo.ids);
     
      if (rtTrieTree.info.origIDs || leftTrieTree.info.origIDs) {
        newInfo.origIDs = {};
        addTo(newInfo.origIDs, rtTrieTree.info.origIDs);
        addTo(newInfo.origIDs, leftTrieTree.info.origIDs);
        newInfo.origCount = Object.keys(newInfo.origIDs).length;
      }
     
     
      rtTrieTree.info = newInfo;
      leftTrieTree.info = newInfo;
      
      
      
      var maxChildren = Math.max(leftTrieTree.maxChildren, rtTrieTree.maxChildren);
      if (isNaN(maxChildren) || maxChildren == 0 ) {
        succeeded = false;
        return mine;
      }
      
      if (scaleLabels) {
        textScale = d3.scale.log().range([kMinFontSize, kFontSize]);
      } else {
        textScale = function() {return kFontSize;}
        textScale.domain = function(){};
      }
      
      visHt = Math.max(200, maxChildren * (kBigFontSize-2));//TBD ?? fix was 16; 18 is the continuation font size
      
      var maxLen = Math.max(leftTrieTree.maxLen, rtTrieTree.maxLen);
      var brLen = Math.max(80, maxLen*0.6*kBigFontSize); //TBD ?? fix was 10.5; 18 is the continuation font size
      if (brLen > 200) {
	brLen = 200;
      }
      
      var minCount = Math.min(leftTrieTree.minCount, rtTrieTree.minCount);
      textScale.domain([minCount, leftTrieTree.info.count]);
      
      //TBD ?? margin, width, height, duplicated in Tree
      var margin = {top: 20, right: 20, bottom: 20, left: 20},
      width = visWidth - margin.right - margin.left,
      height = visHt - margin.top - margin.bottom;
      
      containers[0].forEach(function(d,i) {
	var thisContainer = d;
	var thisVis;
     
     function zoomF() {
      if (d3.event.sourceEvent.type !== 'mousemove') {
          return;
        }
        d3.select(thisContainer).select("svg > g").attr("transform", "translate(" + d3.event.translate + ")"); //scale(" + d3.event.scale + ") //don't zoom
     }
       
	var tmp = d3.select(thisContainer).select("svg");
	if (tmp[0][0] == null) {
	  thisVis = d3.select(thisContainer).append("svg")
	    .attr("width", width + margin.right + margin.left)
	    .attr("height", height + margin.top + margin.bottom)
         .attr("cursor", "move")
          //should use drag, but didn't work right -- keeps bouncing back
          /*
          .call(d3.behavior.drag()
            .origin(function() {return {'x':width/2, 'y':height/2}})
            .on("drag", function() {
                 var delta = [d3.event.dx, d3.event.dy];
                 thisVis.attr("transform", "translate(" + delta + ")");
              }));
          */
          .call(d3.behavior.zoom()
            .on("zoom", function() {
              if (d3.event.sourceEvent.type !== 'mousemove') {
                return;
              }
              d3.select(thisContainer).select("svg > g").attr("transform", "translate(" + d3.event.translate + ")"); //scale(" + d3.event.scale + ") //don't zoom
            }));
         
	  thisVis.append("g"); //container for both trees
       
         
	} else {
	  thisVis = tmp;
	  thisVis.attr("width", width + margin.right + margin.left)
	    .attr("height", height + margin.top + margin.bottom);
	  thisVis.selectAll("g *").remove(); //clear previous 
	}
	
	leftTree = new doubletree.Tree(thisVis.select("g"), visWidth, visHt, brLen, leftTrieTree, true, sortFun, dispatch, textScale, showTokenExtra, nodeText, tokenExtraText, rectColor, rectBorderColor, continuationColor, basicStyles);
	rtTree = new doubletree.Tree(thisVis.select("g"), visWidth, visHt, brLen, rtTrieTree, false, sortFun, dispatch, textScale, showTokenExtra, nodeText, tokenExtraText, rectColor, rectBorderColor, continuationColor, basicStyles);
      });
      
      leftTree.handleAltPress = handlers.alt;
      rtTree.handleAltPress = handlers.alt;
    
      leftTree.handleShiftPress = handlers.shift;
      rtTree.handleShiftPress = handlers.shift;
	
      succeeded = true;
      return mine;
    }
    
    //hitArray is an array of items, prefixArray and suffixArray are arrays of arrays of items
    /**
     * set up the visualization from arrays corresponding to the hit, the prefix, and the suffix of a key word in context result.
     * <p>
     * The ith elements should correspond with each other.
     * Each item consists of fields separated by a field delimiter.
     * For example we might have word/tag (with / as the delimiter) or word\tlemma\tauthor (with tab (\t) as the delimiter)
     * Only certain fields are relevant for deciding whether two items are to be considered the same (e.g. we might ignore an author field)
     * @param prefixArray the array of arrays of the prefixes of the hits
     * @param hitArray the array of the hits
     * @param suffixArray the array of arrays of the suffixes of the hits
     * @param idArray the array of ids of the hits (or null, if there are no ids for the hits)
     * @param caseSensitive are the hits case sensitive
     * @param fieldNames the names of the fields
     * @param fieldDelim the field delimiter
     * @param distinguishingFieldsArray the fields that determine identity
     * @param prefixesOnRight display the prefixes on the right, for right-to-left writing systems. Default is false
     */
    mine.setupFromArrays = function(prefixArray, hitArray, suffixArray, idArray, caseSensitive, fieldNames, fieldDelim, distinguishingFieldsArray) {
      
      if (undefined == caseSensitive && leftTrie) {
	caseSensitive = leftTrie.caseSensitive();
      }
      if (undefined == fieldNames  && leftTrie) {
	fieldNames = leftTrie.fieldNames();
      }
      if (undefined == fieldDelim  && leftTrie) {
	fieldDelim = leftTrie.fieldDelim();
      }
      if (undefined == distinguishingFieldsArray  && leftTrie) {
	distinguishingFieldsArray = leftTrie.distinguishingFieldsArray();
      }
      
      leftTrie = new doubletree.Trie(caseSensitive, fieldNames, fieldDelim, distinguishingFieldsArray);
      rtTrie = new doubletree.Trie(caseSensitive, fieldNames, fieldDelim, distinguishingFieldsArray);
      
      var n = hitArray.length;
      for(var i=0;i<n;i++) {
        var thisID = idArray ? idArray[i] : i;
        var thisHit = hitArray[i];
        var thesePrefixes = prefixArray[i].slice();
        var theseSuffixes = suffixArray[i].slice();
        
        thesePrefixes.push(thisHit);
        thesePrefixes.reverse();
        theseSuffixes.unshift(thisHit);
        
        /*
        if (prefixesOnRight) { //e.g. for Arabic, Hebrew, N'Ko, ...
          thesePrefixes.push(thisHit);
          thesePrefixes.reverse();
          
          rtTrie.addNgram( thesePrefixes, thisID);
          
          theseSuffixes.unshift(thisHit);
          leftTrie.addNgram( theseSuffixes, thisID);
          
        } else {
          thesePrefixes.push(thisHit);
          thesePrefixes.reverse();
          leftTrie.addNgram( thesePrefixes, thisID);
          
          theseSuffixes.unshift(thisHit);
          rtTrie.addNgram( theseSuffixes, thisID);
        }
        */
        
        if (prefixesOnRight) {
          rtTrie.addNgram( thesePrefixes, thisID);
          leftTrie.addNgram( theseSuffixes, thisID);
        } else {
          leftTrie.addNgram( thesePrefixes, thisID);
          rtTrie.addNgram( theseSuffixes, thisID);
        }
      }
      
      
      mine.setupFromTries(leftTrie, rtTrie);
      return mine;
    }
    
    /**
     * @returns just the <em>ids</em> of the data that satisfies the current filters
     */
    mine.filteredIDs = function() {
      return visibleIDs;
    }
    
    //return how many found
    /**
     * search the nodes of the visualization for a pattern
     * <p>
     * The found nodes will get the CSS class foundText
     * @param searchRE the regular expression to look for
     * @returns how many nodes were found
     */
    mine.search = function(searchRE) {
      leftTree.search(searchRE);
      rtTree.search(searchRE);
      
      var thisVis = d3.select(containers[0][0]);
      var found = thisVis.selectAll("text.foundText");
      
      if (found.empty()) { return 0;}
      
      var what = found[0].length;
     
      var foundRt = thisVis.selectAll("text.rtNdText.foundText");
      
      if (foundRt[0][0] != null) {
	what--; //root node, and we have 2 of those, so subtract one from the count
      }
      return what;
    }

    /**
     * clear the visualization of the search results
     * <p>
     * the CSS class foundText is removed
     */
    mine.clearSearch = function() {
	leftTree.clearSearch();
	rtTree.clearSearch();
	return mine;
    }
    
    /**
     * update the showing/hiding of extra information associated with the basic item, e.g. part of speech information
     * <p>
     * Notes:
     * 	<ul>
     * 		<li>This <em>DOES</em> redraw the visualization.</li>
     * 		<li>Safari does not update the visualization correctly by itself, so we force it to rebuild the entire visualization, unlike in other browsers.</li>
     * 	</ul>
     */
    mine.updateTokenExtras = function() {
      leftTree.showTokenExtras(showTokenExtra);
      rtTree.showTokenExtras(showTokenExtra);
      
      //Safari doesn't update reshowing correctly, so we'll force it to build this again :(    (Chrome works correctly, so it's not a webkit issue)
      var thisVis = d3.select(containers[0][0]);
      var tokExtra = thisVis.select('.tokenExtra[display="inline"]');
      if (! tokExtra.empty()) {
	var ht = tokExtra.style("height");
	if (ht == "0px") {
	  mine.redraw();
	}
      }

      return mine;
    }
  
    //////////// getter/setters
    /**
     * Getter/setter for the maximum width of the DoubleTree area
     * @param value the maximum width
     */
    mine.visWidth = function(value) {
      if (!arguments.length) return visWidth;
      visWidth = value;
      return mine;
    }
    
    /**
     * Getter/setter for whether the prefixes are displayed on the right or the left.
     * <p>
     * The default value is false, i.e. the prefixes are displayed on the left, as in English.
     * <em>prefixesOnRight</em> should be set to true for right-to-left writing systems
     * such as Arabic, Hebrew, N'Ko, etc.
     * @param value true or false
     */
    mine.prefixesOnRight = function(value) {
      if (!arguments.length) return prefixesOnRight;
      prefixesOnRight = value;
      return mine;
    }
    
    //NB: doesn't redraw
    /**
     * Getter/setter for the filter functions.
     *<p>
     * The filter functions get an information object as their argument, and return true/false.
     * Each position away from the root has its own filter, and the left and right sides also have their own filters.
     * The filters are specified via an object with "left" and "right" keys whose values are arrays of functions
     * The function at index <em>i</em> filters position <em>i + 1</em> away from the root.
     * Default is no filtering (via empty arrays)
     * <p>
     * Note: setting the filters does <em>not</em> redraw the visualization. See {@link #redraw}
     * @param value an object containing the filters
     */ 
    mine.filters = function(value) {
      if (!arguments.length) return filters;
      filters = value;
      return mine;
    }
    
    /**
     * Getter/setter for the handlers for alt-click and shift-click on the nodes.
     * <p>
     * The handlers get an information object as their argument.
     * The handlers are specified via an object with "alt" and "shift" keys whose values are functions
     * The default is no handlers, i.e. <em>NO</em> interaction
     * @param value an object containing the handlers
     */
    mine.handlers = function(value) {
      if (!arguments.length) return handlers;
      handlers = value;
      return mine;
    }
    
    //NB: doesn't redraw
    /**
     * Getter/setter for showing/hiding extra information associated with the main value, e.g. part of speech information.
     * <p>
     * Note: setting this value does <em>not</em> redraw the visualization. See {@link #redraw}
     * Default is true
     * @param value a boolean specifying whether to show the information or not
     */
    mine.showTokenExtra = function(value) {
      if (!arguments.length) return showTokenExtra;
      showTokenExtra = value;
      return mine;
    }
    
    /**
     * Getter/setter for scaling the node labels by their frequency.
     * <p>
     * Default is true
     * @param value a boolean specifying whether to scale the labels or not
     */
    mine.scaleLabels = function(value) {
      if (!arguments.length) return scaleLabels;
      scaleLabels = value;
      return mine;
    }
    
    //succeeded is read only
    /**
     * Reports whether the DoubleTree was constructed successfully
     * <p>
     * @returns true if the DoubleTree was constructed successfully and false otherwise
     */
    mine.succeeded = function() {
      return succeeded;
    }
    
    /**
     * Getter/setter for the function determining the sort order of sibling nodes.
     * <p>
     * The function gets an information object as its argument, and should return -1 for precedes, 1 for follows and 0 for don't care
     * The nodes are displayed in "preceding" (i.e. ascending) order, from top to bottom.
     * The default is alphabetical by a "token" field if there is one: doubletree.sortByStrFld("token")
     * @param the sort order function
     */
    mine.sortFun = function(value) {
      if (!arguments.length) return sortFun;
      sortFun = value;
      return mine;
    }
    
    /**
     * Getter/setter for the function determining the content of the node labels.
     * <p>
     * The function gets an information object as its first argument and a boolean indicating whether the node is the root or not as its second argument. The function should return a string.
     * The default is {@link #tokenText}
     * @param the content function
     */
    mine.nodeText = function(value) {
      if (!arguments.length) return nodeText;
      nodeText = value;
      return mine;
    }
    
    /**
     * Getter/setter for the function determining the content of the "extra" information for the labels labels
     * <p>
     * The function gets an information object as its first argument and a boolean indicating whether the node is the root or not as its second argument. The function should return a string.
     * The default is the POS field of the information object
     * @param the content function
     */
    mine.tokenExtraText = function(value) {
      if (!arguments.length) return tokenExtraText;
      tokenExtraText = value;
      return mine;
    }
    
    /**
     * Getter/setter for the function determining the color of the background rectangles for the nodes.
     * <p>
     * The function gets an information object as its argument, and should return a CSS color in a string, e.g. "rgba(255,128,0,0.5)"
     * The default is transparent white (i.e., effectively no color);
     * @param value the background color function
     */
    mine.rectColor = function(value) {
      if (!arguments.length) return rectColor;
      rectColor = value;
      return mine;
    }
    
     /**
     * Getter/setter for the function determining the color of the borders of the background rectangles for the nodes.
     * <p>
     * The function gets an information object as its argument, and should return a CSS color in a string, e.g. "rgba(255,128,0,0.5)"
     * The default is transparent white (i.e., effectively no color);
     * @param value the border color function
     */
    mine.rectBorderColor = function(value) {
      if (!arguments.length) return rectBorderColor;
      rectBorderColor = value;
      return mine;
    }
    
    /**
     * Getter/setter for the function determining the color of the text of the nodes that are continuations of the clicked node.
     * <p>
     * The function gets an information object as its argument, and should return a CSS color in a string, e.g. "rgba(255,128,0,0.5)"
     * The default is transparent white (i.e., effectively no color);
     * @param value the border color function
     */
    mine.continuationColor = function(value) {
      if (!arguments.length) return continuationColor;
      continuationColor = value;
      return mine;
    }
    
    /**
     * Getter/setter for the styles of the nodes and branches. For now these are constant throughout the tree.
     * Takes an object of the form: {"node":{"fill":cssColor, "stroke":cssColor, "stroke-width":cssWidth}, "branch":{"stroke":cssColor, "stroke-width":cssWidth}}
     * All of the attributes are optional
     * Defaults are: {"node":{"fill":"white", "stroke":"steelblue", "stroke-width":"1.5px"}, "branch":{"stroke":"#777", "stroke-width":"1.5px"}};
     */
    mine.basicStyles = function(stylesObj) {
      if (!arguments.length) return basicStyles;
      
      Object.keys(basicStyles).forEach(function(aspect){
        if (aspect in stylesObj) {
          Object.keys(basicStyles[aspect]).forEach(function(attr){
            if (attr in stylesObj[aspect]) {
              basicStyles[aspect][attr] = stylesObj[aspect][attr];
            }
          });
        }
      });
      return mine;
    }
    
    return mine;
  }
  
  //////// tree for doubletree
  /** @private */
  doubletree.Tree = function(vis, visWidth, visHt, branchW, data, toLeft, sortFun, dispatch, textScale, showTokenXtra, nodeTextFun, tokenExtraTextFun, rectColorFun, rectBorderFun, contColorFun, baseStyles) {
    var branchWidth = branchW;
    var showTokenExtra = false || showTokenXtra;
    var continuationIDs = {};
    var clickedNode;
    var nodeText = nodeTextFun;
    var tokenExtraText = tokenExtraTextFun;
    var rectColor = rectColorFun;
    var rectBorderColor = rectBorderFun;
    var continuationColor = contColorFun;
    var basicStyles = baseStyles;
    
    var margin = {top: 20, right: 20, bottom: 20, left: 20},
      width = visWidth - margin.right - margin.left,
      height = visHt - margin.top - margin.bottom,
      i = 0,
      duration = 200,
      root;
    var dx;
  
    if (! sortFun ) {
      sortFun = doubletree.sortByStrFld("token");
    }
    
    var tree = d3.layout.tree()
	.size([height, width])
	.sort( sortFun )
	;
    
    var diagonal = d3.svg.diagonal()
	//.projection(function(d) { return [d.y, d.x]; }); //CC orig
	.projection(function(d) { return [positionX(d.y), positionY(d.x)]; });
    
    vis = vis.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    
    ////////
    this.readJSONTree = function(json) {
      root = json;
      root.x0 = height / 2;  
      root.y0 = width / 2; //CC orig was 0
    
      root.children.forEach(collapse);
      this.update(root);
    }
    
    //CC had been inside readJSONTree
    function collapse(d) {
      if (d.children) {
	d._children = d.children;
	d._children.forEach(collapse);
	d.children = null;
      }
    }
    
    //CC new
    function collapseSiblings(nd) {
      if (nd.parent) {
	nd.parent.children.forEach(function(d) {
	    if (d != nd) {
	      collapse(d);
	    }
	});
      }  
    }
    
    var that = this;

    this.update = function(source) {      
      if (! source ) {
	source = root;
      }
  
      // Compute the new tree layout.
      var nodes = tree.nodes(root).reverse(); //CC orig why reverse?
      //var nodes = tree.nodes(root);
      
      //we don't want the root to change position, so we need to compensate
      dx = root.x - height/2;     
    
    
      // Normalize for fixed-depth.
      nodes.forEach(function(d) { d.y = d.depth * branchWidth; }); //TBD paramaterize -- this is the length of the branch ??
    
      // Update the nodes…
      var node = vis.selectAll("g.node_" + toLeft)
	  .data(nodes, function(d) { return d.id || (d.id = ++i); });
    
      // Enter any new nodes at the parent's previous position.
      var nodeEnter = node.enter().append("g")
	  .attr("class", "node node_" + toLeft)	
	  .attr("transform", function(d) { return "translate(" + positionX(source.y0) + "," + positionY(source.x0) + ")"; })
	  /* doesn't work for webkit; svg really wants the title as separate element, see below
	   .attr("title", function(d) {
	    var what = doubletree.infoToText(d.info);
	    return what;})
	  */
	  .on("click", click);
    
      nodeEnter.append("title")
	.text(function(d) {
	    var what = doubletree.infoToText(d.info);
	    return what;}
      );
    
      nodeEnter.append("circle")
	  .attr("r", 1e-6)	  
	  .style("fill", function(d) { return d._children ? "#fff" : basicStyles.node.fill; })
	  .style("stroke", function(d) { return basicStyles.node.stroke});
    
      var txtNode = nodeEnter.append("text")
	  .attr("class", function(d){
	      if (d.depth == 0) {
		return "rtNdText";
	      } else {
		return "";
	      }
	    })	
	  .attr("x", function(d) {
	    if (d.children || d._children) {	      	      
	      return 0;
	    } else {
	      return toLeft ? 10 : -10;
	    }	    
	  })
	  .attr("text-anchor", function(d) {
	    if (! d.parent) {
	      return "middle";
	    }
	    if (d.children || d._children) {
	      return toLeft ? "end" : "start";	      
	    } else {
	      return toLeft ? "start" : "end";
	    }	    
	  })
	  .style("font-size", function(d) {
            /*
            if (d.depth == 0 && toLeft) {
              return 0; //suppress left side root -- do this because of differences in counts when filtering
            }
            */
	      return textScale(d.info.count) + "pt";
	    });
	  
      txtNode.append("tspan")
	  .attr("dy", ".35em")
	  .attr("class", "tokenText")
	  .text(function(d) {
		return nodeText(d.info, d.depth < 1); })
	  .style("fill-opacity", 1e-6);
      
	txtNode.append("tspan")
	  .attr("dx", ".35em")
	  .attr("class", "tokenExtra")
	  .text(function(d) {return tokenExtraText(d.info, d.depth < 1); })
	  .style("fill-opacity", 1e-6);
      
      this.drawRects = function() {
	var which = showTokenExtra ? "inline" : "none";
	vis.selectAll(".tokenExtra").attr("display",which);
	
	node.selectAll("rect").remove(); //remove previous rects

	var nodeRect = node.append("rect")
	    .attr("class", "nodeRect")
	   .attr("height", function(){
	      return this.parentElement.getBBox().height -6;
	   })
	   .attr("y", function(d){
	      if (! d.parent) {
		return -0.5* this.parentElement.getBBox().height/2 -2;
	      } else {
		return -0.5* this.parentElement.getBBox().height/2 ;
	      }
	    })
	   .attr("width", function(){
	      return this.parentElement.getBBox().width;
	   })
	   .attr("x", function(d){
	      var parentW = this.parentElement.getBBox().width;
	      if (! d.parent) {
		return -0.33333 * parentW;
	      }
	      if (!toLeft) {
		return 0;
	      }
	      return -0.5 * parentW;
	   })	 
	   //.style("stroke-opacity", 1e-6)
	   .style("stroke-opacity", 1)
	   .style("stroke-width", 1)
	   .style("stroke", function(d){
	      return rectBorderColor(d.info);
	    })
	   .style("fill", function(d) {
	      return rectColor(d.info);
	   })
	   .style("fill-opacity", function(d){
	      if (! d.parent && ! toLeft) {
		return 1e-6;
	      } else {
		return 1;
	      }
	    });
      }
      try {
	this.drawRects();
      } catch (e) {
	//apparently we're in some version of Opera, which thinks "this" is the window, not the rect wh
      }
    
      // Transition nodes to their new position.
      var nodeUpdate = node.transition()	  
	  .duration(duration)
	  .attr("transform", function(d) { return "translate(" + positionX(d.y) + "," + positionY(d.x) + ")"; });
    
      nodeUpdate.select("circle")
	  //.attr("r", 4.5)
	  .attr("r", function(d) { return (d.children || d._children) ? 1e-6 : 4.5})
	  .style("fill", function(d) { return d._children ? "#fff" : basicStyles.node.fill; }) //function(d) { return d._children ? "lightsteelblue" : "#fff"; })
	  .style("stroke-width", basicStyles.node["stroke-width"]);
    
      nodeUpdate.select("text")
	    .attr("class", function(d) {
	    	var isContinuation = containedIn(that.continuationIDs, d.info.ids);
	    	//var classes = this.classList.toString(); //TBD ?? WARNING, classList is Firefox only

			if (isContinuation || !d.parent) {
				//this.classList.add("continuation");
				classListAdd(this,"continuation");
			} else {
				//this.classList.remove("continuation");
				classListRemove(this,"continuation");
			}
			//return this.classList.toString();
			return classListToString(this);
	    })
	  .style("fill-opacity", 1)
	  .style("fill", function(d){
		if (classListContains(this,"continuation")) {
		  return continuationColor(d.info);
		}
		return "#444"; //default text color
	   }); //this is duplicate in updateContinuations

      nodeUpdate.selectAll("tspan")
	.style("fill-opacity", 1);

    
      // Transition exiting nodes to the parent's new position.
      var nodeExit = node.exit().transition()
	  .duration(duration)
	  .attr("transform", function(d) { return "translate(" + positionX(source.y) + "," + positionY(source.x) + ")"; })
	  .remove();
    
      nodeExit.select("circle")
	  .attr("r", 1e-6);
    
      //nodeExit.select("text")
      nodeExit.selectAll("tspan")
	  .style("fill-opacity", 1e-6);
    
      // Update the links…
      var link = vis.selectAll("path.link_" + toLeft)
	  .data(tree.links(nodes), function(d) { return d.target.id; });
    
      // Enter any new links at the parent's previous position.
      link.enter().insert("path", "g")
	  .attr("class", "link link_" + toLeft)
	  .attr("d", function(d) {
	    var o = {x: source.x0, y: source.y0}; //CC orig	
	    return diagonal({source: o, target: o});
	  })
	  .style("fill", "none")
	  .style("stroke", basicStyles.branch.stroke)
	  .style("stroke-width",basicStyles.branch["stroke-width"]);
    
      // Transition links to their new position.
      link.transition()
	  .duration(duration)
	  .attr("d", diagonal);
    
      // Transition exiting nodes to the parent's new position.
      link.exit().transition()
	  .duration(duration)
	  .attr("d", function(d) {
	    var o = {x: source.x, y: source.y}; //CC orig	    
	    return diagonal({source: o, target: o}); //CC orig	  
	  })
	  .remove();
    
      // Stash the old positions for transition.
      nodes.forEach(function(d) {
	d.x0 = d.x;
	d.y0 = d.y;
      });
      
    }
  
    // Toggle children on click.
    function click(d, i) {
      if (d3.event.altKey) {
	that.handleAltPress(d,i);
	//that.showTokenExtras(showTokenExtra);
	return;
      }
      if (d3.event.shiftKey) {
	that.handleShiftPress(d,i);
	//that.showTokenExtras(showTokenExtra);
	return;
      }
      
      if (! d.parent ) {
	return;
      }
      if (that.continuationIDs != d.info.ids) {
	that.setIds(d.info.ids);
	that.clickedNode = d.id;
	dispatch.idsUpdated.apply(that);
      }
      
      collapseSiblings(d); //CC new    
      /*
      if (d.children) {
	d._children = d.children;
	d.children = null;
      } else {
	d.children = d._children;
	d._children = null;
      }
      that.update(d);
      */
      toggleChildren(d, true);
    }
    
    function toggleChildren(d, update) { //we only update the clicked node, not recursively
      //collapseSiblings(d); //CC we don't do this here, since after the top level there's no point
      
      if (d.children) {
        if (d.children && d.children.length == 1) {
          toggleChildren(d.children[0], true); //need true to make sure we toggle all the way down
        }
        d._children = d.children;
        d.children = null;
        
        
      } else {
        d.children = d._children;
        d._children = null;
       
        //expand all if there is only one path
        if (d.children && d.children.length == 1) {
          toggleChildren(d.children[0], false);
        }
      }
      if (update) {
         that.update(d);
      }
    }
    
    this.setIds = function(ids) {
      that.continuationIDs = ids;
    }    
    this.updateContinuations = function() {
      vis.selectAll("g.node_" + toLeft + " text")
	.classed("continuation", function(d) {
        var isContinuation = overlap(d.info.ids, that.continuationIDs);
        if (isContinuation) {
          classListAdd(this,"continuation");  //some day we can get rid of this ...
        } else {
          classListRemove(this, "continuation");
        }
	   return isContinuation;
	})
	.style("fill", function(d){
		if (classListContains(this,"continuation")) {
		  return continuationColor(d.info);
		}
		return "#444"; //default text color
	 }); //this is duplicated from above, nodeUpdate
    }
    
    this.search = function(searchRE) {
      vis.selectAll("g.node text")
	.attr("class", function(d) {
	    var what = searchRE.test(nodeText(d.info));
	    if (what) {
		    //this.classList.add("continuation");
		    classListAdd(this,"foundText");
	    } else {
		    //this.classList.remove("continuation");
		    classListRemove(this,"foundText");
	    }
	    //return this.classList.toString();
	    return classListToString(this);	    
	})
    }
    
    this.clearSearch = function() {
      vis.selectAll("g.node text")
	.attr("class", function(d) {
	    classListRemove(this,"foundText");
	    return classListToString(this);	    
	});
    }
    
    this.showTokenExtras = function(show) {
      if (arguments.length == 0) {
	return showTokenExtra;
      }
      showTokenExtra = show;
      
      this.drawRects();
      return this;
    }
    
    this.setRectColor = function(rectColorFun) {
      if (arguments.length == 0) {
	return rectColor;
      }
      rectColor = rectColorFun;
      this.drawRects();
      return this;
    }
    
    ///////////////
    function positionX(x) {
      return toLeft ? width/2-x : width/2+ x;
    }
    function positionY(y) {
      return y -dx;
    }
    
    
    
    ////default modifier handlers
    this.handleAltPress = function() {};
    this.handleShifttPress = function() {};
    
    this.readJSONTree(data);
    return this;
  }
  


  ///////////////////////////////// tree sorting functions
  /**
   * function to sort the nodes (case insenstive) by a field in the information object
   * @param fld the field to sort by
   */
  doubletree.sortByStrFld = function(fld) {
    var field = fld;
    return function(a,b) {
	var aUndefined = (undefined == a.info[field]);
	var bUndefined = (undefined == b.info[field]);
	if (aUndefined && bUndefined) {
	  return 0;
	} else if (aUndefined) {
	  return -1;
	} else if (bUndefined) {
	  return 1;
	}
	var aVal = a.info[field].join(" ").toLowerCase();
	var bVal = b.info[field].join(" ").toLowerCase();
	  if (aVal < bVal) {
	    return -1;
	  } else if (aVal > bVal) {
	    return 1;
	  }
	  return 0;
      }
  }
  /**
   * function to sort the nodes according to the count field in the information object
   */
  doubletree.sortByCount = function() {
    return function(a,b) {
	return b.info.count - a.info.count;
    }
  }
  
  /**
   * function to sort the nodes according to the continuations field in the information object
   */
  doubletree.sortByContinuations = function() {
    return function(a,b) {
	return b.info.continuations - a.info.continuations;
    }
  }
  
  
  ///////////////////////////////// some tree filtering functions
  /**
   * function to filter the nodes according to a minimum for the count field
   * @param n the minimum count to include
   */
  doubletree.filterByMinCount = function(n) {
      return function(inf) { return inf.count >= n;};
  }
  
  /**
   * function to filter the nodes according to a maximum for the count field
   * @param n the maximum count to include
   */
  doubletree.filterByMaxCount = function(n) {
      return function(inf) { return inf.count <= n;};
  }
  
  /**
   * function to filter the nodes according to the "POS" field (if it exists)
   * @param n a string for a regular expression of the POS values to include
   */
  doubletree.filterByPOS = function(pos) {
    var re = new RegExp(pos);
    return function(inf) {
      return inf["POS"] && inf["POS"].filter(function(p) {
	  return p.search(re) > -1;
	}).length > 0; //end of ng has no POS
      }
  }
  
  ///////////////////////////////// formatting functions

  //doubletree.nodeText = function(info) {
  //  return doubletree.tokenText(info); //default
  //}
  
  //extracts a field
  /**
   * return the value of a field in the provided information object
   * @param info the information object
   * @param the field to get
   * @returns the value of the field in the information object
   */
  doubletree.fieldText = function(info, fieldName) {
    return info[fieldName];
  }
  //extracts the "token" field
  /**
   * convenience function to return the value of the "token" field (if it exists). The same as doubletree.fieldText(info, "token")
   * @param info the information object
   * @returns the value of the "token" field of the information object
   */
  doubletree.tokenText = function(info) {
    return doubletree.fieldText(info, "token");
  }
  
  /**
   * converts an information object to a string
   * @param the information object
   * @returns a string with one key/value pair per line
   */
  doubletree.infoToText = function(info) {
      var what = "";
      for(var infp in info) {
	if (infp == "ids" || infp == "origIDs") {
	  what += infp + "\t:\t" + Object.keys( info[infp] ).join(",") + "\n";
	} else {
	  what += (infp + "\t:\t" + info[infp] + "\n");
	}
      }
      return what;
  }
  ////////////////// internal utility functions

  function old_pruneTree(tree, ids) {
    
    if (! tree.children) {
        return;
    }
    
    var n = tree.children.length;
    for(var i=0;i<n;i++) {
        var c = tree.children[i];
        
        if (containedIn(c.info.ids, ids)) {
            tree.children[i] = null;
        } else {
            old_pruneTree(c, ids);
        }
    }
    tree.children = tree.children.filter(function(c) { return c != null});
    
    //recalculate maxChildren
    var cMax = d3.max( tree.children.map(function(c) {return c.maxChildren;}) );
    tree.maxChildren = Math.max(tree.children.length, cMax);
  }
  
  
  function new_pruneTree(tree, ids, copyIDs) {
    
    if (! tree.children) {
        return;
    }
    
    //copy over original ids
    if (copyIDs) {
      if (! tree.info.origIDs) {
        tree.info.origIDs = {};
        addTo(tree.info.origIDs, tree.info.ids);
        tree.info.origCount = Object.keys(tree.info.origIDs).length;
      } else {
        tree.info.ids = {};
        addTo(tree.info.ids, tree.info.origIDs);
        tree.info.count = Object.keys(tree.info.ids).length;
      }
    }
   
    
    //adjust IDs
    var idNums = Object.keys(ids)
    for(var i=0, n=idNums.length;i<n;i++) {
      var cid = idNums[i];
      delete tree.info.ids[cid];
    }
    tree.info.count = Object.keys(tree.info.ids).length;
    
    //recurse and prune
    var n = tree.children.length;
    for(var i=0;i<n;i++) {
        var c = tree.children[i];
        
        if (containedIn(c.info.ids, ids)) {
            tree.children[i] = null;
        } else {
            new_pruneTree(c, ids, false);
        }
    }
    tree.children = tree.children.filter(function(c) { return c != null});
    tree.info.continuations = tree.children.length;
    
    //recalculate maxChildren
    var cMax = d3.max( tree.children.map(function(c) {return c.maxChildren;}) );
    tree.maxChildren = Math.max(tree.children.length, cMax);
  }
  
  function restoreTree(tree) {
    
      if (tree.info.origCount) {  //otherwise tree was suppressed, so its ids never got switched around
        //restore originals
        tree.info.ids = {};
        addTo(tree.info.ids, tree.info.origIDs);
        //delete tree.info.origIDs;
        tree.info.count = tree.info.origCount;
        //delete tree.info.origCount;
        
        var n = tree.children.length;
        tree.info.continuations = n;
        for(var i=0;i<n;i++) {
            var c = tree.children[i];
            restoreTree(c);
        }
      }
  
  }
  
  //do the keys in o1 and o2 overlap
  function overlap(o1, o2) {
      for(var k in o1) {
	  if (k in o2) {
	      return true;
	  }
      }
      return false;
  }
  //are all the keys in o1 also in o2
  function containedIn(o1, o2) {
      if (! o1 || ! o2) {
	  return false;
      }
      for(var k in o1) {
	  if (! (k in o2)) {
	      return false;
	  }
      }
      return true; 
  }
  
  //add key/vals of o2 to o1 and return o1; (top level key-value only, o2 values maintained over o1)
  //same as in Trie.js
  function addTo(o1, o2) {
      for(var k in o2) {
          o1[k] = o2[k];
      }
  }

  function noOp() {}

  
  //////////////////


})();