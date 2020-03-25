# Categories

<div class="keyword">*N.B. Categories are a new experimental feature, expect things to go wrong*.</div>

Categories are a powerful way of handling lists of words that are of interest. For instance, instead of typing several words with positive conotations, you can use the built-in categories label `@positive` (`@positive` and `@negative` are the only two built-in categories but you can edit them, remove them and and more, as we'll see).

A go place to demonstrate this is in the Terms tool.

<iframe src="../tool/CorpusTerms/?corpus=austen" style="width: 400px; height: 250px;"></iframe>

Place the cursor in the search field and try each of the following searches, one at a time (remove the previous search term before entering a new one):

* *`positive`*: this is each occurrence of the word "positive" in the text (31)
* *`@positive`*: this is the aggregate number of occurrences for all words in the `positive` categories group (4,041)
 * *`^@positive`*: this shows the frequencies for each word in the `positive` categories group (there may be other words in the group that don't appear in the text)

<img src="guides/tutorial/cirrus-options.png" style="float: left; max-width: 200px; padding-right: 1em;"> Where are categories defined? They are usually available by clicking on the "Options icon in the header of the current tool. Once you click on the "Options" icon then you should see a "Categories" control, a box in which you can copy and paste values (categories are transferable between corpora), as well as an "edit" button that allows you to edit the specified list. By default the "auto" categories are selected, which as we'll see is composed of a small number of built-in lists. If there is no "Categories" option then it's really not relevant for that tool. Once you hit the "edit" button you should see a box that allows you to add and remove categories. Please remember: when you edit a list the categories name changes (among other things that means that you need to export a new URL if you want to share your current results).

{@img categories.png Categories}

A few common tasks:

* you can add new terms by using the search box on the left and the dragging the word over to the correct column
* you can remove terms by selecting them and hitting the "Remove Selected Terms" button
* you can add a category by clicking on the "Add Category" button
* you can remove a category by clicking on the X in the header of the category

In addition, categories allow you to define certain features that are used by certain tools (so far this isn't widely implemented, except in _Cirrus_ and _TermsBerry_. For instance, you could define all the positive words to be displayed in green and all the negative words to be defined in red.

## Next Steps

- [palette](#!/guide/palette)
* [explore the tools](#!/guide/tools)
* read [about Voyant Tools](#!/guide/about)