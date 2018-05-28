# Trends

Trends shows a line graph depicting the distribution of a word’s occurrence across a corpus or document.

Use it with a <a href="../?view=Trends&corpus=austen" target="_blank">Jane Austen corpus</a> or with <a href="../?view=Trends" target="_blank">your own corpus</a>.

## Overview

Trends is a line graph visualization that represents the frequencies of terms across documents in a corpus or across segments in a document, depending on the mode. Note that the line graph is somewhat misleading since the items on the bottom, x axis are categories, not continuous values, they indicate values for separate and independent documents or document segments. We have still chosen to use a line graph because we think it's easier to perceive trends (fluctuations in values in a series of values).

Each line in the graph is coloured according to the word it represents, at the top of the graph a legend displays which words are associated with which colours. You can click on words in the legend to toggle their visibility.

Hovering over any point in the graph causes a callout box to appear with information about the point, including the word, the frequency (raw or relative depending on mode), the document or document segment.

When in corpus mode with multiple documents you can double-click on a word to cause a menu to appear with two choices:

* **Terms** show the selected term distributions within each document
* **Document** show the current term frequencies (same terms as in the legend) for the selected document

<iframe src="../tool/Trends/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 400px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">Trends with the Works of Jane Austen. You can also <a href="../?view=Trends" target="_blank">use Trends with your own corpus</a>.</div>

## Options

You can add more terms by using the search box – simply type in a term and hit enter (see [Term Searches](#!/guide/search) for more advanced searching capabilities).

You can click the "Reset" button to return to the defaults for the tool (this is especially useful if you've drilled-down on a term or document by double-clicking on the graph).

There are two frequency modes:

* **relative frequencies** (default): term frequency in document or document segment per normalized count of 1 million terms
* **raw frequencies**: the absolute count for each document or document segment

When in document mode (a corpus with a single document or after drilling-down on a term or document) a segments slider will appear at the bottom where you can adjust the number of document segments for the distribution data (if the value is 10, each document is split into 10 even segments and frequency information is shown for each segment).

Clicking on the [Options](#!/guide/options) icon allows you to define a set of stopwords to exclude – see the [stopwords guide](#!/guide/stopwords) for more information.  The options also allow you to [edit the colour palette](#!/guide/palette).

## See Also

- [Getting Started](#!/guide/start)
- [Stopwords](#!/guide/stopwords)
- [Palette](#!/guide/palette)
- [Default Skin](#!/guide/skins-section-default-skin)
- [List of Tools](#!/guide/tools)