/* (This is the new BSD license.)
* Copyright (c) 2012, Chris Culy
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

/*
 * This is a substitute for the classlist attribute, since only Firefox currently supports it for both HTML and SVG elements.
 * Shims do not seem to support SVG elements.
 */

function classListContains(elt, cls) {
    if (elt.classList) {
        return elt.classList.contains(cls);
    }
    if (! elt.class) {
    	return false;
    }
    var cList = elt.class.split(/ +/);
    return (cList.indexOf(cls) > -1)
}

function classListAdd(elt, cls) {
    if (elt.classList) {
        elt.classList.add(cls);
        return;
    }
    
    if (! classListContains(elt, cls) ) {
	if (! elt.class) {
	    elt.class = cls;
	} else {
	    elt.class += " " + cls;
	}
    }
}

function classListRemove(elt, cls) {
    if (elt.classList) {
        elt.classList.remove(cls);
        return;
    }
    if (classListContains(elt, cls) ) {
    	var classList = " " + elt.class + " ";
    	classList = classList.replace(" " + cls + " ", " ");
        elt.class = classList.trim();	
    }
}

function classListToggle(elt, cls) {
    if (elt.classList) {
        elt.classList.toggle(cls);
        return;
    }
    
    if (classListContains(elt,cls)) {
    	classListRemove(elt, cls);
    } else {
    	classListAdd(elt, cls);
    }
}

function classListToString(elt) {
	if (elt.classList) {
		var blorp = elt.classList.toString();
		return elt.classList.toString();
	}
	return elt.class;
}