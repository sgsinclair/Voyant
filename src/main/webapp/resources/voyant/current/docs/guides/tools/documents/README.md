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

<div style="max-width: 700px; margin-left: auto; margin-right: auto;">{@img documents.png Documents}</div>

## Options

You can filter documents  by typing a query into the search box and hitting enter (see [Term Searches](#!/guide/search) for more advanced searching capabilities). Note that by default the query includes the full-text, the title and the author. You can use the author or title prefix to *only* look at one of those metadata fields (e.g. _title:love_).

### Modifying a Corpus

You can modify a corpus by clicking on the _Modify_ button. Note that any modifications actually create a new corpus (so the URL will change). The following modifications are available:

- *Add* more documents by clicking the _Add_ button (this will cause the [corpus creation](#!/guide/corpuscreator) window to appear, but any new documents will be added to the corpus)
- *Remove* documents by selecting one ore more documents at once (using the shift or ctrl/command keys) and then clicking the _Remove_ button (this keeps all of the unselected documents)
- *Keep* documents by selecting one ore more documents at once (using the shift or ctrl/command keys) and then clicking the _Keep_ button (this removes all of the unselected documents)
- *Reorder* documents by dragging and dropping them within the grid and then hitting the _Reorder_ button

Note that only one of these operations can be done at a time, so, for instance, you can first remove some documents and then in the new corpus you can reorder the remaining documents.

## Additional Information

The type/token _Ratio_ value can be a useful way of expressing vocabulary richness, but the value is somewhat sensitve to document length and should be considered with circumspection. A more reliable way of measuring vocabulary richness is to average the type/token ratios from equally long segments in a text (e.g. the mean of type/token ratios for each 1,000 word segment in the text).

We hope to soon offer functionality for users to edit or customize the metadata for documents, allowing you to edit the author or title, for instance. In the meantime, these metadata are defined during [corpus creation](#!/guide/corpuscreator).

## See Also

- [Getting Started](#!/guide/start)
- [Grids](#!/guide/grids)
- [Default Skin](#!/guide/defaultskin)
- [List of Tools](#!/guide/tools)