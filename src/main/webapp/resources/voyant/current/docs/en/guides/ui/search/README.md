# Search

Several tools include a search box that allows you to specify advanced search query. The results returned will depend on the tool being used, but the syntax is fairly consistent throughout. Here are examples of searches:

* [`love`](https://voyant-tools.org/?corpus=austen&query=love&view=CorpusTerms): match **exact term** love
* [`love*`](https://voyant-tools.org/?corpus=austen&query=love*&view=CorpusTerms): match terms that start with the **prefix** love and then a **wildcard** as **one term**
* [`^love*`](https://voyant-tools.org/?corpus=austen&query=^love*&view=CorpusTerms): match terms that start with love as **separate terms** (love, lovely, etc.)
* [`*ove`](https://voyant-tools.org/?corpus=austen&query=ove*&view=CorpusTerms): match terms that end with the **suffix** _ove_ as **one term**
* [`^*ove`](https://voyant-tools.org/?corpus=austen&query=^love*&view=CorpusTerms): match terms that end with **suffix** _ove_ as **separate terms** (love, above, etc.)
* [`love,hate`](https://voyant-tools.org/?corpus=austen&query=love,hate&view=CorpusTerms): match each term **separated by commas** as **separate terms**
* [`love\|hate`](https://voyant-tools.org/?corpus=austen&query=love\|hate&view=CorpusTerms): match terms **separated by pipes** as a **single term**
* [`"love him"`](https://voyant-tools.org/?corpus=austen&query="love him"&view=CorpusTerms): _love him_ as an exact **phrase** (word order matters)
* [`"love him"~0`](https://voyant-tools.org/?corpus=austen&query="love+him"~0&view=CorpusTerms): _love him_ or _him love_ **phrase** (word order doesn't matter but 0 words in between)
* [`"love her"~5`](https://voyant-tools.org/?corpus=austen&query="love+her"~5&view=CorpusTerms): match _love_ **near** _her_ (within 5 words)
* [`^love*,love\|hate,"love her"~5`](https://voyant-tools.org/?corpus=austen&query=^love*,hate\|love,"love+her"~5&view=CorpusTerms): **combine** syntaxes

To complete a search, hit enter. Resetting a search is usually as simple as deleting the contents of the search box and pressing enter.

For a reminder of this syntax, you can hover over the question mark in the search box (or click on the question mark to see the contents appear as a dialog box).

Try the search with [Corpus Terms](#!/guide/corpusterms):

<iframe src="../tool/CorpusTerms/?corpus=austen" style="width: 400px; height: 250px;"></iframe>

In most cases the search box will display suggested terms as you type – these are corpus terms. The suggestions combine two types:

1. the first suggestion is with the current search term as a prefix and then a wildcard (combining all word forms into one search)
1. the remaining suggestions are comprised of the 5 most frequent exact terms (each term displayed separately)

Note that Voyant doesn't currently support regular expressions.

## Next Steps

- [palette](#!/guide/palette)
* [explore the tools](#!/guide/tools)
* read [about Voyant Tools](#!/guide/about)