# Search

Several tools include a search box that allows you to specify advanced search query. The results returned will depend on the tool being used, but the syntax is fairly consistent throughout. Here are examples of searches:

* `coat`: match **exact term** coat
* `coat*`: match terms that start with the **prefix** coat and then a **wildcard** as **one term**
* `^coat*`: match terms that start with coat as **separate terms** (coat, coats, etc.)
* `*oat`: match terms that end with the **suffix** _oat_ as **one term**
* `^*oat`: match terms that end with **suffix** _oat_ as **separate terms** (coat, moat, etc.)
* `coat,jacket`: match each term **separated by commas** as **separate terms**
* `coat|jacket`: match terms **separated by pipes** as a **single term**
* `"winter coat"`: winter coat as a **phrase**
* `"coat mittens"~5`: match coat **near** mittens (within 5 words)
* `^coat*,jacket|parka,"coat mittens"~5`: **combine** syntaxes

To complete a search, hit enter. Resetting a search is usually as simple as deleting the contents of the search box and pressing enter.

For a reminder of this syntax, you can hover over the question mark in the search box (or click on the question mark to see the contents appear as a dialog box).

Try the search with [Corpus Terms](#!/guide/corpusterms):

<iframe src="../tool/CorpusTerms/?corpus=austen" style="width: 400px; height: 250px;"></iframe>

In most cases the search box will display suggested terms as you type – these are corpus terms. The suggestions combine two types:

1. the first suggestion is with the current search term as a prefix and then a wildcard (combining all word forms into one search)
1. the remaining suggestions are comprised of the 5 most frequent exact terms (each term displayed separately)

Note that Voyant doesn't currently support regular expressions.

## Next Steps

* [grids](#!/guide/grids)
* [explore the tools](#!/guide/tools)
* read [about Voyant Tools](#!/guide/about)