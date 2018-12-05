# WordTree

The Word Tree tool allows you to explore how keywords are used in different phrases in the corpus.

Use it with a <a href="../?view=WordTree&corpus=austen" target="_blank">Jane Austen corpus</a> or with <a href="../?view=WordTree" target="_blank">your own corpus</a>.

## Overview

By default, the most common term is used as the first word tree root.

You can click on terms to expand or collapse further branches, when they're available. Double-clicking on a term should trigger a phrase search in other Voyant panels (if applicable).

<iframe src="../tool/WordTree/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 400px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">WordTree with the Works of Jane Austen. You can also <a href="../?view=WordTree" target="_blank">use WordTree with your own corpus</a>.</div>

At the moment the tree is constructed based on a limited number of concordances for the keyword (instances of the keyword with context on each side), the branches shown are not necessarily based on frequency.

## Options

You can set the root term in the tree by typing a query into the search box and hitting enter (see [Term Searches](#!/guide/search) for more advanced searching capabilities).

Other options:

* *limit*: limit the number of concordance entries that are fetched (which determines in part how many repeating phrase forms can be found)
* *branches*: limit the number of branches that are shown on each side of the keyword
* *context*: limit the length of the context retrieved for branches

Clicking on the [Options](#!/guide/options) icon allows you to define a set of stopwords to exclude – see the [stopwords guide](#!/guide/stopwords) for more information.


## Additional Information

Word Tree is an adaptation of Chris Culy's [DoubleTreeJS](http://linguistics.chrisculy.net/lx/software/DoubleTreeJS/).

## See Also

- [Getting Started](#!/guide/start)
- [Stopwords](#!/guide/stopwords)
- [Term Searches](#!/guide/search)
- [Default Skin](#!/guide/skins-section-default-skin)
- [List of Tools](#!/guide/tools)