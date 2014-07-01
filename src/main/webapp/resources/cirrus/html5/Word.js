
/**
 * The word object.  Stores various properties related to diplaying the word.
 * @author Andrew
 */
function Word(_text, _origSize, _color, _rolloverText, _value) {
    this.height = 0;					// the height of the label
    this.width = 0;						// the width of the label
    this.rotation = 0; 					// rotation of the label, in radians
    this.relativeSize = 0;				// the size relative to the largest and smallest word sizes
    this.mask = null;					// a 2 dimensional array containing the local xy co-ordinates of opaque pixels
    this.size = 0;						// the largest of either the height or width, used in the circle layout
    
    /* Init */
    this.text = _text;					// the actual word
    this.color = _color;				// the color of the label
    this.origSize = _origSize;			// the original size (used when re-calculating relative sizes of words)
    this.rolloverText = _rolloverText;	// the text to show on rollover
    this.value = _value || 0;			// a value associated with the word (can be anything)
    this.x = 0;							// the x co-ordinate
    this.y = 0;							// the y co-ordinate
    this.tx = 0;						// the translation value for x
    this.ty = 0;						// the translation value for y
    this.fontFamily = 'Arial';			// the font family
    this.fontSize = 12;					// the font family
    this.alpha = 1;						// alpha of the label
    this.live = false;					// true if the word should be displayed
    this.isOver = false;				// true if the mouse if over the word
    
    this.draw = function(ctx) {
        ctx.save();
        ctx.fillStyle = 'rgba('+this.color[0]+','+this.color[1]+','+this.color[2]+','+this.alpha+')';
        ctx.textBaseline = 'alphabetic';
        ctx.font = this.fontSize + 'px '+ this.fontFamily;
        ctx.translate(this.x + this.tx, this.y + this.ty);
        ctx.rotate(this.rotation);
        ctx.fillText(this.text, 0, 0);
        ctx.restore();
    }
}