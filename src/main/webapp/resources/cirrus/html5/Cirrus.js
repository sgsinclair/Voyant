/*
 * Author: Andrew MacDonald
 * Licensed for use under the GNU General Public License
 * http://creativecommons.org/licenses/GPL/2.0/
 */

function Cirrus(config) {
    var that = this;
    this.config = config;
    var canvasId = Ext.id(null, 'cirrusCanvas');
    if (this.config.containerId == null) {
        alert('You must provide a valid container ID!');
        return;
    }
    var containerId = '#'+this.config.containerId;
    var wordController = null;
    var resizeTimer = null;
    
    this.clear = function() {
        this.canvas.width = this.canvas.width;
    };
    
    this.addWords = function(words) {
        wordController.addWords(words);
    };
    
    this.arrangeWords = function() {
        wordController.arrangeWords();
    };

    this.clearAll = function() {
        wordController.setWords([]);
        wordController.grid = [];
        this.clear();
    };

    this.resizeWords = function() {
        that.setCanvasDimensions();
        wordController.resetWordCoordinates();
        wordController.calculateSizeAdjustment();
        wordController.resizeWords();
        wordController.arrangeWords();
        resizeTimer = null;
    };

    this.setCanvasDimensions = function() {
        var container = $(containerId)[0];
        var width = Math.max(container.offsetWidth, container.clientWidth);
        var height = Math.max(container.offsetHeight, container.clientHeight);
        this.canvas.width = width;
        this.canvas.height = height;
    };

    function hex2RGB(hex) {
        hex = hex.charAt(0) == '#' ? hex.substring(1,7) : hex;
        var rgb = [];
        rgb.push(parseInt(hex.substring(0, 2), 16));
        rgb.push(parseInt(hex.substring(2, 4), 16));
        rgb.push(parseInt(hex.substring(4, 6), 16));
        return rgb;
    }
    
    function init() {
        
        if ($('#'+that.config.containerId).length == 0) {
            alert('You must provide a valid container ID!');
            return;
        }
        
        // create the canvas
        that.canvas = document.createElement('canvas');
        that.canvas.setAttribute('id', canvasId);
        that.canvas.setAttribute('tabIndex', 1);
        that.setCanvasDimensions();
        $(containerId).append(that.canvas);
        canvasId = '#'+canvasId;
        
        that.context = that.canvas.getContext('2d');
        var isLocal = false; // should we call the server for words or use local ones?
        that.wordData = new Array(); // the word data to input into the app
        that.useFadeEffect = true; // should we use a fade effect for displaying words?
        that.colors = [[116,116,181], [139,163,83], [189,157,60], [171,75,75], [174,61,155]];
        wordController = new WordController(that);
        
        for (var key in that.config) {
            if (key == 'words') that.wordData = that.config[key];
            if (key == 'layout') {
                if (that.config[key] == 'circle') wordController.layout = wordController.CIRCLE;
                else if (that.config[key] == 'square') wordController.layout = wordController.SQUARE;
            }
            if (key == 'colors') {
                // expects an array of hex colors
                if ($.isArray(that.config[key]) && that.config[key].length > 0) {
                    that.colors = [];
                    for (var c in that.config[key]) {
                        that.colors.push(hex2RGB(that.config[key][c]));
                    }
                }
            }
            if (key == 'background') {
                $(canvasId).css("background-color", that.config[key]);
            }
            if (key == 'fade') {
                if (that.config[key] == 'true') that.useFadeEffect = true;
                else if (that.config[key] == 'false') that.useFadeEffect = false;
            }
            if (key == 'smoothness') {
                wordController.wordsToArrange = Math.max(1, Math.min(20, parseInt(that.config[key]))); // set to value between 1-20
            }
        }
        
        if (isLocal && testData) {
            var cnt = 0;
            for (var key in testData) {
                that.wordData.push({word: key, size: testData[key] / 13, label: key});
                cnt++;
                if (cnt == 100) break;
            }
        }
        
        if (that.wordData.length > 0) {
            that.clear();
            wordController.addWords(that.wordData);
            wordController.arrangeWords();
        }
        
        $(window).resize(function() {
            if (resizeTimer != null) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(that.resizeWords, 1000);
        });

        $(canvasId).keypress(function(event) {
            if (event.which == 114) wordController.arrangeWords(); // r was pressed
        });
        
        $(canvasId).click(function(event) {
            var matchingWord = wordController.handleWordClick(event);
            if (matchingWord !== undefined) {
	            if (that.config.clickHandler) {
	            	that.config.clickHandler({term: matchingWord.text, value: matchingWord.value});
	            }
            }
        });
        
        $(canvasId).mouseover(function(event) {
        	wordController.startUpdates();
        });
        $(canvasId).mouseout(function(event) {
        	wordController.stopUpdates();
        });
        
        $(canvasId).mousemove(function(event) {
            wordController.handleMouseMove(event);
        });
    }
    
    $(document).ready(init);
}