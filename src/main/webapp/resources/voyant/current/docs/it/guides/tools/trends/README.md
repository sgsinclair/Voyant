# Trends

Trends shows a line graph depicting the distribution of a word’s occurrence across a corpus or document.

## Overview

Trends is a line graph visualization that represents the frequencies of terms across documents in a corpus or across segments in a document, depending on the mode.

Each line in the graph is coloured according to the word it represents, at the top of the graph a legend displays which words are associated with which colours. Hovering over any point on the graph provides an info box, this box provides the title of the segment that is being hovered over, and the frequency of the word in that segment. The bottom (x) axis shows brief labels for either the documents or the document segment.

You can toggle specific terms by clicking on them in the legend at the top.

<iframe src="../tool/Trends/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 400px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">Trends with the Works of Jane Austen. You can also <a href="../?view=Trends" target="_blank">use Trends with your own corpus</a>.</div>

## Options

You can add more terms by using the search box – simply type in a term and hit enter (see [Term Searches](#!/guide/search) for more advanced searching capabilities).

You can choose to display either raw or relative frequencies.

* **relative frequencies** (default): term frequency in document or document segment per normalized count of 1 million terms
* **raw frequencies**: the absolute count for each document or document segment

Clicking on the [Options](#!/guide/options) icon allows you to define a set of stopwords to exclude – see the [stopwords guide](#!/guide/stopwords) for more information.

## See Also

- [Getting Started](#!/guide/start)
- [Stopwords](#!/guide/stopwords)
- [Default Skin](#!/guide/skins-section-default-skin)
- [List of Tools](#!/guide/tools)