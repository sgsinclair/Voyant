
function WordController(parentApp) {
    var that = this;
    
    var app = parentApp;
    
    var myFont = 'Impact';
    
    this.CIRCLE = 0; // circle layout
    
    this.ratio = 1; // the width to height ratio
    
    var _layout = this.CIRCLE; // what layout to use
    this.getLayout = function() {
        return _layout;
    }
    this.setLayout = function(value) {
        _layout = value;
    }
    
    this.UPDATE_RATE = 25; // update frequency in milliseconds
    this.COARSENESS = 5; // how many pixels do we skip when creating the mask?
//    if ($.browser.webkit) this.COARSENESS = 3; 
    this.grid = new Array(); // a multidimensional array ([x][y]), holding co-ords for words
    var timer_i = 0;
    var timer; // timer used to incrementally call the arrange method
    this.doingArrange = false;
    this.wordsToArrange = 5; // how many words to arrange for each call to the arrange method
    var overWord = null; // what word is the user mousing over?
    var overX = 0; // position of the mouse when over a word
    var overY = 0;
    
    var _words = new Array(); // the list of word objects
    this.getWords = function() {
        return _words;
    }
    this.setWords = function(value) {
        _words = value;
    }
    
    this.sizeAdjustment = 100; // amount to multiply a word's relative size by
    
    this.minFontSize = 12;
    
    // for tracking sizes in word data
    this.largestWordSize = 0;
    this.smallestWordSize = 10000;
    
    var _uniqueWords = new Object(); // stores words as properties, making sure we don't have duplicates
    
    /**
     * Creates a word object and adds it to the list.
     * If the size value is outside the current max/min value, returns true (meaning we have to resize all the words).
     * @param	word
     * @param	size
     * @param	color
     * @param	label
     * @param	value
     * @return
     */
    function addWord(word, size, color, label, value) {
        var sizeChanged = false;
        if (_uniqueWords[word] == null) {
            _uniqueWords[word] = true;
            
            if (size > that.largestWordSize) {
                that.largestWordSize = size;
                sizeChanged = true;
            }
            if (size < that.smallestWordSize) {
                that.smallestWordSize = size * 0.8; // set the smallest size a bit smaller than the actual smallest size; this will insure all words are legible.
                sizeChanged = true;
            }
            var wordObj = new Word(word, size, color, label, value);
            _words.push(wordObj);
        }
        return sizeChanged;
    }
    
    /**
     * Adds an array of objects with the following properties: word, size, color, label, value.
     * @param	words
     */
    this.addWords = function(newWords) {
        var sizeChanged = false;
        for (var i = 0; i < newWords.length; i++) {
            var wordObj = newWords[i];
            
            var color;
            if (typeof(wordObj.color) == undefined || wordObj.color == null || wordObj.color == '') {
                color = app.colors[Math.floor(Math.random() * (app.colors.length))];
            } else color = wordObj.color;
            
            var size;
            if (typeof(wordObj.size) == undefined || wordObj.size == null || wordObj.size == '') {
                size = Math.floor(Math.random() * 40);
            } else size = parseFloat(wordObj.size);
            
            sizeChanged = addWord(wordObj.word, size, color, wordObj.label, wordObj.value) || sizeChanged;
        }
        sortWords();
        
        this.setRelativeSizes();
        this.calculateSizeAdjustment();
        if (sizeChanged) this.resizeWords();
        else createAllGraphics();
    }
    
    this.resetWordCoordinates = function() {
        app.clear();
        clearTimeout(timer);
        for (var i = 0; i < _words.length; i++) {
            var word = _words[i];
            word.x = 0;
            word.y = 0;
            word.tx = 0;
            word.ty = 0;
        }
    }
    
    this.calculateSizeAdjustment = function() {
    	this.ratio = app.canvas.width / app.canvas.height;
        var stageArea = app.canvas.width * app.canvas.height;
        if (stageArea < 100000) this.minFontSize = 8;
        else this.minFontSize = 12;
        var pixelsPerWord = stageArea / _words.length;
        var totalWordsSize = 0;
        for (var i = 0; i < _words.length; i++) {
            var word = _words[i];
            var wordArea = calculateWordArea(word);
            totalWordsSize += wordArea;
        }
        this.sizeAdjustment = stageArea / totalWordsSize;
    }
    
    function calculateWordArea(word) {
        var baseSize = Math.log(word.relativeSize * 10) * Math.LOG10E; // take the relativeSize (0.1 to 1.0), multiply by 10, then get the base-10 log of it
        var height = (baseSize + word.relativeSize) / 2; // find the average between relativeSize and the log
        var width = 0; //(baseSize / 1.5) * word.text.length;
        for (var i = 0; i < word.text.length; i++ ) {
            var letter = word.text.charAt(i);
            if (letter == 'f' || letter == 'i' || letter == 'j' || letter == 'l' || letter == 'r' || letter == 't') width += baseSize / 3;
            else if (letter == 'm' || letter == 'w') width += baseSize / (4 / 3);
            else width += baseSize / 1.9;
        }
        var wordArea = height * width;
        return wordArea;
    }
    
    // based on post from http://stackoverflow.com/questions/1134586/how-can-you-find-the-height-of-text-on-an-html-canvas
    // not really working yet
    function measureTextHeight(label) {
        app.context.fillStyle = 'rgb(255,255,255)';
        app.context.fillRect(label.x, label.y, label.width, label.height);
        label.draw(app.context);
        var imageData = app.context.getImageData(label.x, label.y, label.width, label.height);
        var first = false;
        var last = false;
        var y = label.height;
        var x = 0;
        while (!last && y) {
            y--;
            for (x = 0; x < label.width; x++) {
                var pixel = getPixel(x, y, imageData);
                if (pixel[0] != 255 || pixel[1] != 255 || pixel[2] != 255) {
                    last = y;
                    break;
                }
            }
        }
        while (y) {
            y--;
            for (x = 0; x < label.width; x++) {
                var pixel = getPixel(x, y, imageData);
                if (pixel[0] != 255 || pixel[1] != 255 || pixel[2] != 255) {
                    first = y;
                    break;
                }
            }
            if (first != y) {
                return last - first;
            }
        }
        return 0;
    }
    
    function measureDimensions(word) {
        app.context.save();
        app.context.textBaseline = 'alphabetic';
        app.context.font = word.fontSize + 'px '+ word.fontFamily;
        word.width = app.context.measureText(word.text).width;
        word.height = Math.ceil(app.context.measureText('m').width * 1.15); // initial estimate (make it bigger for when we actually measure the height)
        app.context.restore();
    }
    
    // returns an array [r, g, b, a]
    function getPixel(x, y, imageData) {
        var index = (x + y * imageData.width) * 4;
        return [imageData.data[index], imageData.data[index+1], imageData.data[index+2], imageData.data[index+3]];
    }
    
    function setPixel(imageData, x, y, r, g, b, a) {
        var index = (x + y * imageData.width) * 4;
        imageData.data[index] = r;
        imageData.data[index+1] = g;
        imageData.data[index+2] = b;
        imageData.data[index+3] = a;
    }
    
    function findNewRelativeSize(word, areaMultiplier) {
        var area = calculateWordArea(word) * areaMultiplier;
        // given the area = (x+6)*(2*x/3*y), solve for x
        var newRelativeSize = (Math.sqrt(6) * Math.sqrt(6 * Math.pow(word.text.length, 2) + area * word.text.length) - 6 * word.text.length) / (2 * word.text.length);
        return newRelativeSize;
    }
    
    /**
     * Determines the relative size for each word.
     * Call after all/new words are added and before createAllGraphics.
     */
    this.setRelativeSizes = function() {
    	for (var i = 0; i < _words.length; i++) {
            var word = _words[i];
            word.relativeSize = mapValue(word.origSize, this.smallestWordSize, this.largestWordSize, 0.1, 1);
        }
    }
    
    /**
     * Re-adds words using new adjusted sizes.
     * Run after the largestWordSize and/or smallestWordSize have changed.
     * Need to run manually, since it's intensive.
     */
    this.resizeWords = function() {
        app.clear();
        createAllGraphics();
        sortWords();
    }
    
    /**
     * Sort the word list by size, largest first.
     */
    function sortWords() {
        _words.sort(function(a, b) {
            if (a.origSize > b.origSize) return -1;
            else if (a.origSize < b.origSize) return 1;
            else return 0;
        });
    }
    
    /**
     * Creates the Label that gets displayed on the stage.
     * Randomly selects an angle from possible values.
     * Calculates the mask of the word (used in hit detection).
     * @param	wordObj
     */

    function createWordGraphics(wordObj) {
        var adjustedSize = findNewRelativeSize(wordObj, that.sizeAdjustment);
        wordObj.fontSize = adjustedSize > that.minFontSize ? adjustedSize : that.minFontSize;
        wordObj.fontFamily = myFont;
        
        measureDimensions(wordObj);
        // these values are needed for accurate x and y co-ordinates after rotating the word
        wordObj.tx = 0;
        wordObj.ty = wordObj.height;
        //~ var trueHeight = measureTextHeight(wordObj);
        //~ console.log(wordObj.height, trueHeight);
        //~ wordObj.height = trueHeight;
        
        var angle = 0;
        if (false) {
//        if (!$.browser.opera) {
            // opera can't render rotated text
//            if (wordObj.text.match(/\s/) == null) {
                if (Math.random() > 0.66) {
                    var tempHeight = wordObj.height;
                    var tempWidth = wordObj.width;
                    wordObj.height = tempWidth;
                    wordObj.width = tempHeight;
                    if (Math.round(Math.random()) == 0) {
                        angle = 90;
                        wordObj.ty = 0;
                    } else {
                        angle = -90;
                        wordObj.ty = wordObj.height;
                        wordObj.tx = wordObj.width;
                    }
                }
//            }
        }
        wordObj.size = Math.max(wordObj.height, wordObj.width);
        wordObj.rotation = degreesToRadians(angle);
        
        // find the pixels that aren't transparent and store them as the mask
        app.context.fillStyle = app.canvas.style.backgroundColor;
        app.context.fillRect(0, 0, app.canvas.width, app.canvas.height);
        wordObj.draw(app.context);
        var imageData = app.context.getImageData(wordObj.x, wordObj.y, wordObj.width, wordObj.height);
        var mask = new Array();
        for (var x = 0; x < wordObj.width; x++) {
            var xm = Math.floor(x / that.COARSENESS) * that.COARSENESS;
            if (mask[xm] == null) mask[xm] = {};
            for (var y = 0; y < wordObj.height; y++) {
                var ym = Math.floor(y / that.COARSENESS) * that.COARSENESS;
                var pixel = getPixel(x, y, imageData);
                var pixelColor = 'rgb('+pixel[0]+', '+pixel[1]+', '+pixel[2]+')';
                if (pixelColor != app.canvas.style.backgroundColor) {
                    mask[xm][ym] = true;
                }
                if (mask[xm][ym]) {
                    y = ym + that.COARSENESS; // there's a match, so skip ahead
                    continue;
                }
            }
        }
        wordObj.mask = mask;
    }
    
    /**
     * Helper method which runs createWordGraphics for all the words.
     */
    function createAllGraphics() {
    	for (var i = 0; i < _words.length; i++) {
            createWordGraphics(_words[i]);
        }
    }
    
    /**
     * Arrange the words on the stage using the chosen layout scheme.
     */
    this.arrangeWords = function() {
//    	console.profile();
        clearTimeout(timer);
        app.clear(); // reset canvas
        
        this.toggleLoadingText();

        if (_words.length > 0) {
            
            this.grid = [];
            timer_i = 0; // used as the increment for the word list
      
            function doArrange() {                
                // common variables between the layout schemes
                var x;
                var y;
                var word;
                var breakOut;
                var fail;
                var wordCount = this.wordsToArrange - 1;
                var appCanvasWidth = app.canvas.width;
                var appCanvasHeight = app.canvas.height;
                var halfWidth = appCanvasWidth * 0.5;
                var halfHeight = appCanvasHeight * 0.5;
                var dd = 0.05;

                do {
                    word = _words[timer_i];
                    var a = Math.random() * Math.PI; // angle?
                    var d = Math.random() * (word.size * 0.25); // diameter?
                    var da = (Math.random() - 0.5) * 0.5;
                    var halfWordWidth = word.width * 0.5;
                    var halfWordHeight = word.height * 0.5;

                    while (true) {
                        x = Math.floor((halfWidth + (Math.cos(a) * d * this.ratio) - halfWordWidth) / this.COARSENESS) * this.COARSENESS;
                        y = Math.floor((halfHeight + (Math.sin(a) * d) - halfWordHeight) / this.COARSENESS) * this.COARSENESS;

                        fail = false;
                        if (x + halfWordWidth >= appCanvasWidth || y + halfWordHeight >= appCanvasHeight) {
                            fail = true;
                        } else {
                        	fail = hitTest(x, y, word.height, word.width, word.mask);
                        }
                        if (!fail) {
                            break;
                        }
                        a += da;
                        d += dd;
                    }

                    finalizeWord(x, y, word);
                    if (app.useFadeEffect) {
                    	word.alpha = 0;
	                    for (var w = 0; w < timer_i; w++) {
	                        var wrd = _words[w];
	                        if (wrd.alpha < 1) fadeWord(wrd);
	                    }
                    } else {
                    	word.alpha = 1;
                    	word.draw(app.context);
                    }
                    timer_i++;
                    if (timer_i == _words.length) {
                        clearTimeout(timer);
//                        console.profileEnd();
                        this.doingArrange = false;
                        
                        this.toggleLoadingText(false);                               
                        
                        drawWords();
                        
                        break;
                    }
                } while (wordCount--);
            }
            
            /**
             * Test the mask of a word against the overall grid to see if they intersect.
             * @param	x
             * @param	y
             * @param	h
             * @param	w
             * @param	mask
             * @return
             */
            function hitTest(x, y, h, w, mask) {
                for (var xt = 0; xt <= w; xt += this.COARSENESS) {
                    for (var yt = 0; yt <= h; yt += this.COARSENESS) {
                        if (mask[xt] && mask[xt][yt] && this.grid[xt + x] != null && this.grid[xt + x][yt + y] != null) {
                            return true;
                        }
                    }
                }
                return false;
            }
            
            /**
             * Set the new position of the word, and make it visible.
             * @param	x
             * @param	y
             * @param	word
             * @param   drawIt
             */
            function finalizeWord(x, y, word, drawIt) {
                set_grid(x, y, word);

                word.x = x;
                word.y = y;

                word.live = true;
                if (drawIt) {
                	/*
                    if ($.browser.webkit) {
                        // cover the canvas with a transparent rectangle
                        // forces webkit to show the words
                        app.context.fillStyle = 'rgba(0,0,0,0)';
                        app.context.fillRect(0, 0, app.canvas.width, app.canvas.height);
                    }
                    */
                    word.draw(app.context);
                }
            }
            
            function fadeWord(word) {
                word.alpha += 0.25;
//                if ($.browser.webkit) {
                    // cover the canvas with a transparent rectangle
                    // forces webkit to show the words
//                    app.context.fillStyle = 'rgba(0,0,0,0)';
//                    app.context.fillRect(0, 0, app.canvas.width, app.canvas.height);
//               }
                word.draw(app.context);
            }

            /**
             * Mark the spots on the grid where the word is located.
             * @param	x
             * @param	y
             * @param	word
             */
            function set_grid(x, y, word) {
                for (var xt = 0; xt < word.width; xt += this.COARSENESS) {
                    for (var yt = 0; yt < word.height; yt += this.COARSENESS) {
                        if (word.mask[xt] && word.mask[xt][yt]) {
                            if (!this.grid[xt + x]) this.grid[xt + x] = [];
                            this.grid[xt + x][yt + y] = word;
                        }
                    }
                }
            }
            
            doArrange = doArrange.createDelegate(this);
            hitTest = hitTest.createDelegate(this);
            finalizeWord = finalizeWord.createDelegate(this);
            fadeWord = fadeWord.createDelegate(this);
            set_grid = set_grid.createDelegate(this);
            this.doingArrange = true;
            
//            if ($.browser.mozilla) {
//                // FF needs more time to perform each layout run
//                timer = setInterval(doArrange, 250);
//            } else {
                timer = setInterval(doArrange, 50);
//            }
            
        } else {
            alert("Error: There are no words to arrange.");
        }
    }
    
    this.toggleLoadingText = function(show) {
        app.context.save();
        
        if (show) app.context.fillStyle = 'black';
        else app.context.fillStyle = app.canvas.style.backgroundColor;
        
        app.context.textBaseline = 'top';
        app.context.font = '10px Arial';
        var offset = app.context.measureText('Loading').width + 10;
        app.context.fillText('Loading', app.canvas.width - offset, 10);
        
        app.context.restore();
    }
    
    this.startUpdates = function() {
    	timer = setInterval(drawWords, that.UPDATE_RATE);
    }
    
    this.stopUpdates = function() {
    	if (overWord != null) {
	    	// remove existing tooltip
	    	overWord = null;
	    	drawWords();
    	}
    	clearTimeout(timer);
    }
    
    function drawWords() {
        app.clear();
        var i = _words.length;
        while(i--) {
        	var word = _words[i];
            word.alpha = 1;
            if (word.live) word.draw(app.context);
        }
        var $canvasEl = $(app.canvas);
        if (overWord != null) {
        	// add pointer cursor
        	$canvasEl.css('cursor', 'pointer');
        	
            // draw the tooltip
            app.context.save();
            app.context.textBaseline = 'alphabetic';
            app.context.font = '12px Arial';
            
            var wordWidth = app.context.measureText(overWord.text).width;
            var valueWidth = app.context.measureText(overWord.value).width;
            var maxWidth = wordWidth > valueWidth ? wordWidth : valueWidth;
            maxWidth += 20;
            
            var x = overX + 15;
            var y = overY + 25;
            var appWidth = $canvasEl.width();
            var appHeight = $canvasEl.height();
            if (x + maxWidth >= appWidth) {
            	x -= maxWidth;
            }
            if (y + 40 >= appHeight) {
            	y -= 40;
            }
            
            app.context.fillStyle = 'rgba(255,255,255,0.9)';
            app.context.strokeStyle = 'rgba(100,100,100,0.9)';
            app.context.translate(x, y);
            app.context.fillRect(0, 0, maxWidth, 40);
            app.context.strokeRect(0, 0, maxWidth, 40);
            app.context.fillStyle = 'rgba(0,0,0,0.9)';
            app.context.fillText(overWord.text+':', 8, 18);
            app.context.fillText(overWord.value, 8, 30);
            app.context.restore();
        } else {
        	$canvasEl.css('cursor', 'default');
        }
    }
    
    /**
     * Checks to see if the mouse is currently over a word.
     * @param	event
     */
    this.handleMouseMove = function(event) {
        if (!this.doingArrange) {
        	var i = _words.length;
            while(i--) {
                _words[i].isOver = false;
            }
            var offset = $(app.canvas).offset();
            var remainder = (event.pageX - offset.left) % this.COARSENESS;
            var x = (event.pageX - offset.left) - remainder;
            remainder = (event.pageY - offset.top) % this.COARSENESS;
            var y = (event.pageY - offset.top) - remainder;
            overWord = this.findWordByCoords(x, y);
            if (overWord != null) {
                overWord.isOver = true;
                overX = x;
                overY = y;
            }
        }
    }
    
    /**
     * Checks to see if a word was clicked on, and then sends out the corresponding event.
     * @param	event
     * @return
     */
    this.handleWordClick = function(event) {
        var offset = $(app.canvas).offset();
        var remainder = (event.pageX - offset.left) % this.COARSENESS;
        var x = (event.pageX - offset.left) - remainder;
        remainder = (event.pageY - offset.top) % this.COARSENESS;
        var y = (event.pageY - offset.top) - remainder;
        var matchingWord = this.findWordByCoords(x, y);
        
        if (matchingWord != null) {
            return {text: matchingWord.text, value: matchingWord.value};
        }
    }
    
    /**
     * Returns the word which occupies the co-ordinates that were passed in.
     * @param	x
     * @param	y
     * @return
     */
    this.findWordByCoords = function(x, y) {
        var matchingWord = null;
        if (this.grid[x] !=  null) {
            if (this.grid[x][y] != null) {
                matchingWord = this.grid[x][y];
            } else if (this.grid[x][y + this.COARSENESS] != null) {
                matchingWord = this.grid[x][y + this.COARSENESS];
            }
        }
        if (matchingWord == null && this.grid[x + this.COARSENESS] != null) {
            if (this.grid[x + this.COARSENESS][y] != null) {
                matchingWord = this.grid[x + this.COARSENESS][y];
            } else if (this.grid [x + this.COARSENESS][y + this.COARSENESS] != null) {
                matchingWord = this.grid[x + this.COARSENESS][y + this.COARSENESS];
            }
        }
        
        return matchingWord;
    }
    
    /**
     * Convert an angle in degrees to radians.
     * @param	degrees
     * @return
     */
    function degreesToRadians(degrees) {
        var radians = degrees * (Math.PI / 180);
        return radians;
    }
    
    /**
     * Convenience function to map a variable from one coordinate space to another (from processing).
     */
    function mapValue(value, istart, istop, ostart, ostop) {
        return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
    }
    
}

// from Ext
Function.prototype.createDelegate = function(obj, args, appendArgs){
    var method = this;
    return function() {
        var callArgs = args || arguments;
        if (appendArgs === true){
            callArgs = Array.prototype.slice.call(arguments, 0);
            callArgs = callArgs.concat(args);
        }else if (typeof appendArgs=="number"){
            callArgs = Array.prototype.slice.call(arguments, 0); // copy arguments first
            var applyArgs = [appendArgs, 0].concat(args); // create method call params
            Array.prototype.splice.apply(callArgs, applyArgs); // splice them in
        }
        return method.apply(obj || window, callArgs);
    };
}