# TextualArc

TextualArc is a visualization of the terms in a document that includes a weighted centroid of terms and an arc that follows the terms in document order.

The current text is represented on the perimeter of the circle, starting at the top and looping around clockwise. Each occurrence of a term pulls the term toward its location on the perimeter and the position of the term label is the mean of these forces (or [wighted centroid](https://en.wikipedia.org/wiki/Centroid)). The text is "read" from start to finish, with repeating, non-stopword terms, visited by the animated arc. The occurrences of the currently read term are shown by lines to the perimeter. You can also hover over any term to see its occurrences on the perimeter.

<iframe src="../tool/TextualArc/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 600px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">TextualArc with the Works of Jane Austen. You can also <a href="../?view=TextualArc" target="_blank">use TextualArc with your own corpus</a>.</div>

## Options

You can filter the terms displayed using the search box. This is especially useful for locating terms of interest (and then removing the filter to see it again in with other terms). Only currently loaded document terms will be shown and used for filtering.

You can switch to a different document by selecting it in the Documents selectors, this will restart the reading from the beginning of the new document.

You can adjust the speed of the visualization using the speed slider. You can stop the reading by sliding the speed to 0. It's not especially recommended to slide the speed to top speed because of performance issues.

Clicking on the [Options](#!/guide/options) icon allows you to define a set of stopwords to exclude – see the [stopwords guide](#!/guide/stopwords) for more information.

You can adjust the minimum raw frequency to use for document terms. By default this is set to 2 (only repeating terms). You can set it to 1 to see all the document terms, but this may slow down the visualization considerably, depending on the size of the document.

## Additional Information

TextualArc is heavily inspired by W. Bradford Paley's [TextArc](https://textarc.org). The concept has been adapted for use in Voyant and for performance considerations in the browser.

## See Also

- [Getting Started](#!/guide/start)
- [Stopwords](#!/guide/stopwords)
- [Default Skin](#!/guide/skins-section-default-skin)
- [List of Tools](#!/guide/tools)