# Cirrus

Cirrus is a word cloud that visualizes the top frequency words of a corpus or document.

## Overview

The word cloud positions the words such that the terms that occur the most frequently are positioned centrally and are sized the largest. As the algorithm goes through the list and continues to attempt to draw words as close as possible to the center of the visualization it will also include small words within spaces left by larger words that do not fit together snugly. It's important to understand that the colour of words and their absolute position are not significant (if you resize the window or reload the page, words may appear in a different location).

Clicking on words in Cirrus will usually cause one or more other tools to react (if you're in a multi-tool [skin](#!/guide/skins). Hovering over a word will cause a box to appear that displays the frequency count for that term.

<iframe src="../tool/Cirrus/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 300px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">Cirrus with the Works of Jane Austen. You can also <a href="../?view=Cirrus" target="_blank">use Cirrus with your own corpus</a>.</div>

## Options

Cirrus has a slider near the bottom (with the label "Show") that allows you to adjust the number of words displayed. By default the minimum value is 25 and the maximum value is 500, and the slider adjusts by increments of 25. The maximum value can be adjusted by clicking one the [Options](#!/guide/options) icon and adjusting the "Max terms" value.

Clicking on the [Options](#!/guide/options) icon also allows you to define a set of stopwords to exclude – see the [stopwords guide](#!/guide/stopwords) for more information.

{@img options.png Options}

## Flexible Scale

By default Cirrus shows the top frequency terms for the entire corpus. It's also possible to show top frequency terms for a single document. In the default skin, click on the [Documents](#!/guide/documents) tab in the lower left side and click on one of the documents – this should cause Cirrus to refresh with words from only the selected document. If you wish to return to the corpus view, click the reset button that appears in the lower right of the Cirrus pane.

{@img document-mode.png Document Mode}

## Additional Information

The current implementation of Cirrus uses [Jason Davies' D3-based Word Cloud library](https://github.com/jasondavies/d3-cloud), which in turn is inspired by [Wordle](http://www.wordle.net/).

Word clouds can be effective at very quickly drawing attention to high frequency terms. They have also been harshly criticized as being highly reductive and even misleading, as [argued persuasively by Jacob Harris](http://www.niemanlab.org/2011/10/word-clouds-considered-harmful/) and others. However, the reduction of information can also be powerful (as in the example of [comparing stereotyped vocabulary from advertizing for toys](http://www.achilleseffect.com/2011/03/word-cloud-how-toy-ad-vocabulary-reinforces-gender-stereotypes/)), and Cirrus is perhaps best used in conjunction with other more exploratory and nuanced tools.

## See Also

- [Getting Started](#!/guide/start)
- [Stopwords](#!/guide/stopwords)
- [Default Skin](#!/guide/skins-section-default-skin)
- [List of Tools](#!/guide/tools)
