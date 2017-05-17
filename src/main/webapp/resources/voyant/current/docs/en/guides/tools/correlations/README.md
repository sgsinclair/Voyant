# Correlations

The Correlations tool enables an exploration of the extent to which term frequencies vary in sync (terms whose frequencies rise and fall together or inversely).

Use it with a <a href="../?view=Correlations&corpus=austen" target="_blank">Jane Austen corpus</a> or with <a href="../?view=Correlations" target="_blank">your own corpus</a>.

## Overview

The table view shows the following columns by default:

- *Term 1*: the first term of the pair (the order or the terms doesn't matter)
- *Trends*: two sparklines (mini graphs) that show the distribution of relative frequencies (the left one is for Term 1 and the right one is for Term 2)
- *Term 2*: the second term of the pair (the order or the terms doesn't matter)
- *Correlation*: the Pearsons correlation coefficient for this pair of words

By default, correlations are shown for the corpus, unless the corpus contains only one document, in which case correlations are show for terms in that one document.

The correlation coefficient is calculated by comparing the relative frequencies of terms (relative to each document for the corpus or relative to each segment of document). A coefficient that approaches 1 indicates that values correlate positively, they rise and fall together. A coefficient that approaches -1 indicates that values correlate negatively, frequencies rise for one term as it drops for the other. Coefficients that approach 0 indicate little correlation, positive or negative. 

<iframe src="../tool/Correlations/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 350px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">Contexts with the Works of Jane Austen. You can also <a href="../?view=Correlations" target="_blank">use Correlations with your own corpus</a>.</div>

## Options

You can specify which keyword to use by typing a query into the search box and hitting enter (see [Term Searches](#!/guide/search) for more advanced searching capabilities).

You can determine the minimum coverage (as a percentage) for terms using the provided slider. The coverage determines how many of the relative frequency values can be zero before the term is excluded. For instance, if a corpus has 10 documents and the minimum coverage is 20%, at least two of the documents must contain the term or it will be ignored.

If your corpus has more than one document you will see a Scale button that will allow you to toggle between the entire corpus and one or more individual documents. Again, the values change: for a corpus, it's the relative frequency for each document; for a document, it's the relative frequency for each segment.

Clicking on the [Options](#!/guide/options) icon also allows you to define a set of stopwords to exclude – see the [stopwords guide](#!/guide/stopwords) for more information.

## Additional Information

The Correlations tool uses [Pearson's Correlation](https://en.wikipedia.org/wiki/Pearson_correlation_coefficient), which is a robust measure but assumes that values are distributed normally on an interval scale.

## See Also

- [Getting Started](#!/guide/start)
- [Grids](#!/guide/grids)
- [Default Skin](#!/guide/skins-section-default-skin)
- [List of Tools](#!/guide/tools)