# Dreamscape

Dreamscape is an experimental tool for exploring geospatial aspects of texts.

Use it with a <a href="../?view=Dreamscape&corpus=austen" target="_blank">Jane Austen corpus</a> or with <a href="../?view=Dreamscape" target="_blank">your own corpus</a>.

## Overview

Dreamscape is a preliminary attempt to explore how texts might be represented geo-spatially. The tool tries to identify locations (especially city names) mentioned in texts, and suggests patterns of recurring connections between locations, patterns that might help identify travel of people, ideas, goods, or anything else. The notion of travel here is to be interpreted loosely and critically: a sequence of locations may or may not signify anything at all, but Dreamscape seeks to help study them.

A primary weakness of Dreamscape is that current tools for automatically identifying locations in texts usually produce a significant number of errors, tagging locations that aren't a location (false positive) and not tagging locations that are a location (false negative). Language is messy and the computer doesn't understand its meaning. Here's an example:

> Paris Hilton travelled to London to see the Jack London and the Bishop of Canterbury.

Paris, London, Canterbury, all of these can have multiple meanings as people, and locations. Is `London` the city in England or one of the several other cities named London? Does `Canterbury` matter as a place name if it's part of a person's name? What about cities whose name has changed over the centuries or imaginary cities? The challenges are endless.

So, most importantly **DON'T TRUST THE DATA**

That doesn't mean the data and the tool can't be of some use. Let's say that the tool correctly recognizes 75% of locations, perhaps with enough data that's sufficient to lead to some observations worth examining in more depth? Dreamscape also allows some correction of data, so with a bit of effort it's possible to make it even more accurate. More information about the location identification is in a section below.

<iframe src="../tool/Dreamscape/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 300px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">Dreamscape with the Works of Jane Austen. You can also <a href="../?view=Dreamscape" target="_blank">use Dreamscape with your own corpus</a>.</div>

By default Dreamscape is designed to help observe the following:

1. The names of cities mentioned in the text as represented by the circles, the larger the city the more often it's mentioned (hovering over a city shows its name and frequency in the corpus).
1. The frequency of connections between two locations in a document as represented by the arcs, in other words when two locations are mentioned together (Paris to Montreal to London would create two connections: Paris->Montreal and Montreal->London).
1. The individual occurrences of connections as represented by the animated arc and the ticker text at the top (each connection is "read" in sequence in the text)

## Options

There are a lot of options tucked beneath the controls in the bottom toolbar

### Display

* **Base Layer**: you can choose from multiple base layers, each of which is represented by a thumbnail (the default is [Stamen Watercolor](http://maps.stamen.com/watercolor/) for its aesthetic and load speed)
* **Projection**: the earth is a globe but maps are represented flat, so [map projection](https://en.wikipedia.org/wiki/Map_projection) (warping) is required (often with socio-political implications; the default is the commonly use [Mercator Projection](https://en.wikipedia.org/wiki/Mercator_projection))
* **Cities**: displayed as circles (you can toggle their display using the checkbox)
  * **maximum count**: determines the maximum number of cities to load and display
  * **minimum population**: determines the minimum population that cities must have to be displayed
  * **minimum occurrences**: determines the minimum number of times a city must be referenced in the text to be displayed
* **Connections**: displayed as arcs (you can toggle their display using the checkbox)
  * **maximum count**: determines the maximum number of connections to load and display
  * **minimum occurrences**: determines the minimum number of times a connection must occur in the text to be displayed
* **Animations**: connection occurrences displayed as animated arcs (you can toggle their display using the checkbox)
  * **milliseconds per animation**: determines how quickly the animations happen (slide left to go faster and right to go slower)

### Filters

Dreamscape supports multiple filters or views of the corpus, this can include the whole corpus (the default filter) or a filter defined by metadata (author, title, year if available) or text (all documents containing a specified [query]((#!/guide/search)).

Click the "Add Filter" button to add a filter.

The filters are represented by funnels and have the following options:

* **authors**: documents containing matches for the author query (some documents may not have authors defined)
* **titles**: documents containing matches for the title query 
* **full text**: documents containing matches for the full text query
* **dates**: documents whose "date" (year) fall between the values in the range (some documents may not have dates defined (using pubDate metadata), an attempt is also made to use the first word of the title if it happens to be a number, like for the year in the Austen corpus)
* animation controls:
  * step back
  * pause
  * step forward
  * restart animation
  * keep animation in frame: ensures that the map changes scale to show the animated arc, if needed
* **remove**: remove this filter

## Manipulating Features

You can manipulate and examine locations and connections more closely.

Clicking on a location (the circles) will produce this menu:

* View Occurrences: view up to 25 occurrences of this location
* Open in Voyant: send this location name to Voyant in a new window
* Select Alternative Location: select an alternative location from a menu
* Remove Location: remove all occurrences of this location

Click on an occurence (the arcs) will produce this menu:

* View Connection Occurrences: view up to 25 occurrences of this connection

## Annotations

In the upper left-hand corner of the map, below the zoom controls, there's a comment icon that allows the user to annotate parts of the map. To begin, click on the comment, and then draw a shape on the map; you should then see a dialog box appear where you can enter a comment (click "OK" to save it).

Annotated regions should appear on the map as shaded shapes, with the comment text when hovering above them.

Annotations are stored on the server, if you want to share an annotated map you need to [export a URL](#!/guide/start-section-bookmarking-your-corpus) (the link icon in the right side of the Dreamscape title bar).

To remove an annotation, click on the shaded area, remove the text and click "OK".

## Location Recognition

N.B.: this aspect of Dreamscape is likely to change in the coming months.

## Additional Information

Dreamscape is a collaboration between Voyant Tools, the [Early Modern Conversions Project](http://earlymodernconversions.com/) and the Centre de recherche informatique de Montréal ([CRIM](https://www.crim.ca)).

<img src="guides/dreamscape/crim.png" style="float: right; max-width: 150px;">We wish to recognize in particular the contributions of researchers at CRIM:

* Jérôme Labonté: client-side development
* Lise Rebout: back-end geolocation development 
* Frederic Osterrath: back-end integration
* Pierre-Andre Ménard: NER annotations evaluation
* Caroline Barrière: back-end geolocation development 
* Gabriel Bernier-Colborne: back-end geolocation development 
* Hans Bherer: project coordination


## See Also

- [Getting Started](#!/guide/start)
- [List of Tools](#!/guide/tools)
