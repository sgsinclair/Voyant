# Catalogue

The Catalogue tool provides an interface for exploring the contents of a larger, multi-document corpus, as well as for creating a subset (or workset) based on the search criteria. It functions somewhat like a library database or an online store, allowing you to filter documents.

## Overview

By default the following facets are shown:

- *Title*: the document's title (or its filename if no better title was found)
- *Author*: the document's author, if specified
- *Language*: the document's automatically detected language 
- *Terms*: all of the terms in the document

<iframe src="../tool/Catalogue/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 600px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">Catalogue with the Works of Jane Austen. You can also <a href="../?view=Catalogue" target="_blank">use Catalogue with your own corpus</a>.</div>

## Options

You can filter documents  by typing a query into the search box and hitting enter (see [Term Searches](#!/guide/search) for more advanced searching capabilities). Note that by default the query includes the full-text, the title and the author. You can use the author or title prefix to *only* look at one of those metadata fields (e.g. _title:love_).

## Additional Information

We hope to soon offer a better interface for users to select other facets.

The current interface may not work properly with corpora containing more than 1,000 documents.

Please contact us if you're interested in creating a custom Catalogue interface for your text collection, like this:

<blockquote><a href="http://voyant-tools.org/catalogue/docsouth/?facet=facet.keyword,facet.author">http://voyant-tools.org/catalogue/docsouth/?facet=facet.keyword,facet.author</a></blockquote>

## See Also

- [Getting Started](#!/guide/start)
- [Grids](#!/guide/grids)
- [Default Skin](#!/guide/skins-section-default-skin)
- [List of Tools](#!/guide/tools)