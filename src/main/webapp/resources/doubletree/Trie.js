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
var doubletree = doubletree || {};

(function(){
    
    /**
     * @class doubletree.Trie
     * This is the class for the specialized trie that is the data for {@link doubletree.DoubleTree}.
 * The Trie will get pieces of data that contain fields. Some (possibly all) of those fields will be used for distinguishing among items.
 * For example, we might have an "author" field, but not use it when distinguishing among items for the Trie.
 * @param caseSensitive are the elements in the first distinguishing field compared in a case sensitive fashion
 * @param fldNames the names of the fields
 * @param fldDelim the field delimiter
 * @distinguishingFldsArray the distinguishing fields
 * @undistinguishedRoot true if the root should be calculated without using the distinguishing fields
 */
doubletree.Trie = function(caseSensitive, fldNames, fldDelim, distinguishingFldsArray, undistinguishedRoot) {
    var endNG = " ";
    var rootName = "_root_";
    var noCase = (! caseSensitive) && true;
    if (! fldNames) {
        fldNames = ["item"];
    }
    var fieldNames = fldNames;
    if (! fieldDelim) {
        fieldDelim = "\t"; //default
    }
    var fieldDelim = fldDelim;
    if (! distinguishingFieldsArray) {
        distinguishingFieldsArray = [ fieldNames[0] ];
    }
    var distinguishingFieldsArray = distinguishingFldsArray;
    var undistinguishedRt = undistinguishedRoot;
    if (undefined == undistinguishedRt) {
        undistinguishedRt = true; //TBD: check to make sure this doesn't break anything
    }
    
    var trie = new TrieNode(rootName,-1,0);
    
    /** @private */
    function TrieNode(item, id, count) {
        this.id = id;
        this.count = count;        
        this.info = {"count":count, "ids":{}};
        
        if (item == null) {
            this.item = rootName;        
        } else {
            this.item = item;
            this.info.ids = {};
            this.info.ids[id] = true;
            var flds = item.split(fieldDelim);
            for(var i in flds) {
                this.info[ fieldNames[i] ] = [ flds[i] ];
            }
        }
        this.nodes = {};
        
         /** @private */
        this.addNgram = function(itemArray, id, count) {
            if (! count) {
                count = 1;
            }
            var thisItem, thisKey;
            if (itemArray.length > 0) {
                thisItem = itemArray.shift();
                    
                var theseFlds = thisItem.split(fieldDelim);

                if (undistinguishedRt && this.item == rootName) {
                    thisKey = "";
                } else {
                    thisKey = theseFlds.filter(function(f,i) {
                            return distinguishingFieldsArray.indexOf( fieldNames[i] ) > -1;
                        })
                    .map(function(f) {
                            if (noCase) {
                                return f.toLocaleLowerCase();
                            }
                            return f;
                        })
                    .join(fieldDelim);
                }
                
            } else {
                thisItem = endNG;
                thisKey = thisItem;
            }
            
            var subTrie;
            if (thisKey in this.nodes && this.nodes[thisKey] instanceof TrieNode) { //we need the instanceof TrieNode so we can override Object properties -- hope that none are already arrays
                subTrie = this.nodes[thisKey];
                subTrie.info.count += count;
                subTrie.info.ids[id] = true;
                
                for(var f in theseFlds) {
                    var thisFld = theseFlds[f];
                    if (subTrie.info[ fieldNames[f] ].indexOf( thisFld ) == -1 ){
                        subTrie.info[ fieldNames[f] ].push(thisFld);
                    }                
                }
                
                
            } else {
                subTrie = new TrieNode(thisItem, id, count);            
                this.nodes[thisKey] = subTrie;
            }
            if (thisItem != endNG) {
                subTrie.addNgram(itemArray,id, count);
            }
        }
            
         /** @private */
        this.getUniqRoot = function() {
            if (this.item == rootName) {
                var children = Object.keys(this.nodes);
                if (children.length == 1) {
                    return this.nodes[ children[0] ];
                }
            }
        
            return this;
        }
        
        /** @private */
        this.toTree = function(filterFuns) {
            
            function toTreeHelper(filterFuns, descendentLevel, trieData) {
                
                var what = {"children":[]};
                what.name = trieData.item;
                what.info = {};
                for(var k in trieData.info) {
                    if (typeof(trieData.info[k]) === 'Object') {
                        what.info[k] = {};
                        for(var k2 in trieData.info[k]) {
                            what.info[k][k2] = this.info[k][k2];
                        }
                    } else {
                        what.info[k] = trieData.info[k];
                    }
                }
                what.pruned = {};
                
                
                for(var item in trieData.nodes) {
                    var itemNode = trieData.nodes[item];
                    var thisFilter = filterFuns[descendentLevel];            
                    if ( ! thisFilter || (thisFilter && thisFilter(itemNode.info)) ) {
                        what.children.push( toTreeHelper(filterFuns, descendentLevel +1, itemNode) );
                        if (itemNode.pruned != {}) {
                            addTo(what.pruned, itemNode.pruned);
                        }
                    } else {
                        addTo(what.pruned, itemNode.info.ids);
                    }
                }
        
                what.info.continuations = what.children.length;
                //this is to record info we need for sizing the tree, since D3 automatically scales to fit, which is not what we want
                //we also need to keep track of the minimum count (the root always has the max, of course), for scaling
                if (what.children.length == 0) {
                   what.children = null; //the trees expect null if there are no children, not the empty array. Odd, but true.
                   what.maxChildren = 0;
                   
                   if (what.name) {
                    what.maxLen = what.name.length;
                   } else {
                    what.maxLen = 0;
                   }
                   
                   what.minCount = what.info.count;
                   //what.maxChildren = 0; //new
                   
                } else {
                    var cMax = d3.max( what.children.map(function(c) {return c.maxChildren;}) );
                    what.maxChildren = Math.max(what.children.length, cMax);
                    
                    var maxLen = d3.max( what.children.map(function(c) {return c.maxLen;}));
                    what.maxLen = Math.max(maxLen, what.name.length);
                    
                    what.minCount = d3.min( what.children.map(function(c) {return c.minCount;})); //the children are always <= the parent
                }
                return what;
            }
            
            if (! filterFuns ) {
                filterFuns = [];
            }
            
            var trieData = JSON.parse(JSON.stringify(this)); //CuC make a copy of the data, to keep the real trie immutable
        
            return toTreeHelper(filterFuns, 0, trieData);
        }
    }
    
    
    
    
    /**
     * Add an ngram to the Trie
     * @param itemArray an array of delimited items (the ngrams)
     * @param id an id for this ngram 
     * @param count a count for this ngram. Default is 1
     */
    this.addNgram = function(itemArray, id, count) {trie.addNgram(itemArray, id, count);};
    
    /**
     * get the unique root of this Trie. Used only by {@link DoubleTree}
     * @returns a new Trie with a unique item as the root
     */
    this.getUniqRoot = function() {
        var what = new doubletree.Trie((!noCase), fieldNames, fieldDelim, distinguishingFieldsArray);
        what.trie( trie.getUniqRoot() );
        return what;
    };
    
    /**
     * convert the Trie to a tree structure for display. Used only by {@link DoubleTree}
     * @param filterFuns the filtering functions to apply to the tree see {@link DoubleTree.filters}
     * @param descendentLevel the current level we are filtering
     * @returns the tree
     */
    this.toTree = function(filterFuns, descendentLevel) {return trie.toTree(filterFuns, descendentLevel);};
    
    /**
     * serialize the Trie as a JSON string
     * @returns the JSON string representation of the Trie
     */
    this.serialize = function() {
        return JSON.stringify(this);
    }
    
    /**
     * make this Trie have the values of a previously serialized Trie see {@link #serialize}
     */
    this.deserialize = function(serialized) {
        var obj = JSON.parse(serialized);
        
        endNG = obj.endNG();
        rootName = obj.rootName();
        noCase = obj.caseSensitive();
        fieldNames = obj.fieldNames();
        fieldDelim = obj.fieldDelim();
        distinguishingFieldsArray = obj.distinguishingFieldsArray();
        trie = obj.trie();
        
    }
    
    //getters -- the properties are readonly, set in constructor
    
    //private, only used in deserialization
    /** @private */
    this.endNG = function() {
        return endNG;
    }
    //private, only used in deserialization
    /** @private */
    this.rootName = function() {
        return rootName;
    }
    
    //private, also a setter, only used in deserialization and getUniqRoot;
    /** @private */
    this.trie = function(value) {
      if (arguments.length > 0) {
        trie = value;
      }
      return trie;
    }
    
    /**
     * @returns whether this Trie uses case sensitive comparison
     */
    this.caseSensitive = function() {
        return ! noCase;
    }
    
    /**
     * get the field names in the data
     * @returns the field names in the data
     */
    this.fieldNames = function() {
        return fieldNames;
    }
    
    /**
     * get the field delimiter for the data
     * @returns the field delimiter for the data
     */
    this.fieldDelim = function() {
        return fieldDelim;
    }
    
    /**
     * get the distinguishing fields for the data
     * @returns the distinguishing fields for the data
     */
    this.distinguishingFieldsArray = function() {
        return distinguishingFieldsArray;
    }
    
    //add key/vals of o2 to o1 and return o1; (top level key-value only, o2 values maintained over o1)
    /** @private */
    function addTo(o1, o2) {
        for(var k in o2) {
            o1[k] = o2[k];
        }
    }

    
}  

})();
