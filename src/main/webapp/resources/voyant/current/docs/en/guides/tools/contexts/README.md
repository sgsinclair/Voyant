# Contexts

The Contexts (or Keywords in Context) tool shows each occurrence of a keyword with a bit of surrounding text (the context). It can be useful for studying more closely how terms are used in different contexts.

## Overview

The table view shows the following three columns by default:

- *Document*: this is document in which keyword and contexts occur
- *Left*: contextual words to the left of the keyword
- *Term*: the keyword matching the default or user-provided term query
- *Right*: contextual words to the right of the keyword

An additional column can be shown to display the term *Position* (token index) in the document.

By default, contexts are shown for the most frequent in the term corpus.

Some context is shown for each occurrence, you can also click on the plus icon to expand any given row to show more context.

<iframe src="../tool/Contexts/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 350px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">Contexts with the Works of Jane Austen. You can also <a href="../?view=Contexts" target="_blank">use Contexts with your own corpus</a>.</div>

## Options

You can specify which keyword to use by typing a query into the search box and hitting enter (see [Term Searches](#!/guide/search) for more advanced searching capabilities).

There is also a slider that determines how much context to consider when looking for collocates. The value specifies the number of words to consider on _each_ side of the keyword (so the total window of words is double). By default the context is set to 5 words per side, and the slider can have a maximum of 50. Similarly, there's an "expand" slider which determines how many words to show when you expand any given row (by clicking the plus icon in the left-most column). The default is 50, the minimum is 5 and the maximum is 500.

Clicking on the [Options](#!/guide/options) icon also allows you to define a set of stopwords to exclude – see the [stopwords guide](#!/guide/stopwords) for more information.

## Additional Information

For a graphical view of corpus collocates, try the [Collocates Graph](#!/guide/collocatesgraph) tool.

## See Also

- [Getting Started](#!/guide/start)
- [Grids](#!/guide/grids)
- [Default Skin](#!/guide/skins-section-default-skin)
- [List of Tools](#!/guide/tools)