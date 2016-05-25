# Corpus Terms

Corpus Terms is a table view of term frequencies in the entire corpus.

## Overview

The table view shows the following three data columns by default:

- *Term*: this is the term in the corpus
- *Count*: this is the frequency of the term in the corpus
- *Trends*: this is a sparkline graph that shows the distribution of relative frequencies across documents in the corpus (if the corpus contains more than one document); you can hover over the sparkline to see finer-grained results

Additional columns are available by clicking on the down arrow that appears in the right side of a column header:

- *Relative*: this is the relative frequency of the term in the corpus, per one million words (sorting by count and relative should produce the same results, the relative frequencies might be useful when comparing to another corpus)
- *Comparison*: this is the relative frequency of the term in the corpus compared to the relative frequency of the same term in a comparison corpus; to specify the comparison corpus, click the [Options](#!/guide/options) icon and specify the comparison corpus to use
- *Peakedness*: this is a [statistical measure](https://en.wikipedia.org/wiki/Kurtosis) of how much the relative frequencies of a term in a corpus are bunched up into peaks (regions with higher values where the rest are lower)
- *Skew*: this is a [statistical measure](https://en.wikipedia.org/wiki/Skewness) of the symmetry of the relative frequencies of a term across the corpus

By default, the most frequent terms in the corpus are shown.

<iframe src="../tool/CorpusTerms/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 350px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">Corpus Terms with the Works of Jane Austen. You can also <a href="../?view=CorpusTerms" target="_blank">use Corpus Terms with your own corpus</a>.</div>

## Options

You can specify terms by typing a query into the search box and hitting enter (see [Term Searches](#!/guide/search) for more advanced searching capabilities).

Clicking on the [Options](#!/guide/options) icon allows you to define a set of stopwords to exclude – see the [stopwords guide](#!/guide/stopwords) for more information.

You can also specify a comparison corpus by copying and pasting a comparison corpus ID (or selecting one of the pre-defined ones). The comparison is used for relative frequencies. You also need to show the "Comparison" column in the grid.

## See Also

- [Getting Started](#!/guide/start)
- [Grids](#!/guide/grids)
- [Stopwords](#!/guide/stopwords)
- [Default Skin](#!/guide/skins-section-default-skin)
- [List of Tools](#!/guide/tools)