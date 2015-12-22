# Stopwords

A [stopword list](https://en.wikipedia.org/wiki/Stop_words) is a set of words that should be excluded from the results of a tool. Typically stopword lists contain so-called function words that don't carry as much meaning, such as determiners and prepositions (the, a, in, to, from, etc.).

Compare the following two displays:

<table style="width: 90%; margin-left: auto; margin-right: auto;"><tr><td style="text-align: center;">With Stopwords<br /><iframe src="../tool/Cirrus/?useReferer=true" style="width: 100%; height: 200px; margin-left: auto; margin-right: auto;"></iframe></td><td style="text-align: center;">Without Stopwords<br /><iframe src="../tool/Cirrus/?useReferer=true&stopList=none" style="width: 100%; height: 200px; margin-left: auto; margin-right: auto;"></iframe></td></tr></table>

The one on the left uses the _Auto-detect_ setting (so the English stopword list in this case) and the one on the right uses the _None_ setting.

<div style="float: right; width: 200px;">{@img options.png Options}</div> In Voyant Tools you can select from pre-existing stopword lists in various languages or create your own. For tools that support stopword lists, you can begin by clicking on the options icon (the may not appear if it's a tool that doesn't support stopwords).

This will produce a dialog box where you can select from one of the existing stopword lists. In many cases, you don't need to select a list or a language, Voyant will _Auto-detect_ the language of the text and automatically select a stopword list. If you don't want a stopword list at all, you can select _None_. The _New User-Defined List_ can be used if you want to start your own list from scratch, not based on one of the existing lists.

All lists are customizable. You can select a language and then click on the _Edit List_ button to modify words (this is also a good way of seeing what's in any given list, even if you don't intend to edit it). Stopword lists are composed of one word per line (though remember that what Voyant considers a word might be different from what's in the list). One you're done, you can save the list and then proceed to apply the options.

<table style="width: 90%; margin-left: auto; margin-right: auto;"><tr><td><div style="max-width: 400px;">{@img dialog.png Stopwords Dialog}</div></td><td><div style="max-width: 250px; text-align: center;">{@img edit.png Edit Dialog}</div></td></tr></table>

Rather than select an existing stopword list from the pull-down menu, it's also possible to type into the pull-down menu the URL of an existing stopword list. The list should be plain text Unicode, with one word per line. Any line that starts with a hash symbol (#) will be ignored.

Stopword lists are reusable between corpora. If you edit a list and save it, you can copy and paste the name that appears in the pull-down list and then paste that same name into another pull-down list.

You can choose to apply the stopword list to the current tool or to all tools at once (_apply globally_, the default).

By default the current version of Voyant uses the _Auto-detect_ option; this is different from the previous version of Voyant where the stopword list had to be manually selected.

## Next Steps

* [search](#!/guide/search)
* [explore the tools](#!/guide/tools)
* read [about Voyant Tools](#!/guide/about)