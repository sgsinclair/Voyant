# Documents

The Documents tool shows a table of the documents in the corpus and includes functionality for modifying the corpus.

## Overview

The table view shows the following columns by default:

- *Title*: the document's title (or its filename if no better title was found)
- *Words*: the number of individual words (tokens) found in the document (e.g. each occurrence of "the" is counted)
- *Types*: the number of word forms found in the document (e.g. all occurrences of "the" are counted as one word form)
- *Ratio*: the ratio of types to tokens (types/tokens), expressed as a percentage – higher numbers generally mean greater vocabulary diversity

Additional columns can be shown:

- *Author*: the document's author (if it can be determined)
- *Language*: the document's language (if it can be guessed)

By default, documents are shown in the order they exist in the corpus.

<iframe src="../tool/Documents/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 350px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">Documents with the Works of Jane Austen. You can also <a href="../?view=Documents" target="_blank">use Documents with your own corpus</a>.</div>


## Options

You can filter documents  by typing a query into the search box and hitting enter (see [Term Searches](#!/guide/search) for more advanced searching capabilities). Note that by default the query includes the full-text, the title and the author. You can use the author or title prefix to *only* look at one of those metadata fields (e.g. _title:love_).

You can modify a corpus by clicking on the _Modify_ button – see more information about [modifying a corpus](#!/guide/modifyingcorpus).

## Additional Information

The type/token _Ratio_ value can be a useful way of expressing vocabulary richness, but the value is somewhat sensitve to document length and should be considered with circumspection. A more reliable way of measuring vocabulary richness is to average the type/token ratios from equally long segments in a text (e.g. the mean of type/token ratios for each 1,000 word segment in the text).

We hope to soon offer functionality for users to edit or customize the metadata for documents, allowing you to edit the author or title, for instance. In the meantime, these metadata are defined during [corpus creation](#!/guide/corpuscreator).

## See Also

- [Getting Started](#!/guide/start)
- [Grids](#!/guide/grids)
- [Default Skin](#!/guide/skins-section-default-skin)
- [List of Tools](#!/guide/tools)