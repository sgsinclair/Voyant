# Phrases

The Phrases tool shows repeating sequences of words organized by frequency of repetition or number of words in each repeated phrase.

## Overview

The table view shows the following columns by default:

- *Term*: the repeating phrase
- *Count*: the number of times this phrase repeats in the corpus
- *Length*: the number of words in this phrase
- *Trends*: this is a sparkline graph that shows the distribution of relative frequencies across documents in the corpus (if the corpus contains more than one document); you can hover over the sparkline to see finer-grained results

By default, phrases are shown in descending order of phrase length (the number of words in each phrase).

<iframe src="../tool/Phrases/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 350px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">Phrases with the Works of Jane Austen. You can also <a href="../?view=Phrases" target="_blank">use Phrases with your own corpus</a>.</div>

## Options

You can filter phrases  by typing a query into the search box and hitting enter (see [Term Searches](#!/guide/search) for more advanced searching capabilities). Matched phrases will start with the search term (we hope to make this more flexible such that searches can find matches anywhere in the phrase).

You can specify the upper and lower bounds of the phrase length (number of words in each phrase) using the slider. By default the slider starts at 2 and ends at 30.

The *Overlap* option is an important aspect of working with phrases because it determines how to prioritize results. Imagine that the phrase "once upon a time" repeats multiple times in a corpus, we could have the following entries (with the phrase length in parentheses):

* once upon a time (4)
* once upon a (3)
* upon a time (3)
* once upon (2)
* upon a (2)
* a time (2)

It may or may not be misleading to keep all of these entries (since there would be duplicates from the exact same location in a text), depending on what we want as information. We can choose from one of the following overlap strategies:

* **none (keep all)**: No filtering happens, all the entries above would be kept.
* **prioritize longest phrases)**: Only the longest phrase is kept (the first: "once upon a time").
* **prioritize the most frequent phrases**: First consider the total count of phrase frequencies (if "a time" occurred elsewhere in the text, even if it's not part of this phrase, it would take precedence) – once a word is included in a phrase it won't be included in other phrases. If two phrases have the same frequency (e.g. "once upon" and "upon a"), the left-most phrase takes precedence (only "once upon" would be kept, not "upon a").

## Additional Information

Note that at the moment stopwords are not used in the Phrases tool (that may change in the future).

Note also that for a phrase to be considered repeating it has to repeat within a document – single occurrences of a phrase won't be included, even if they recur elsewhere in the corpus. This isn't the ideal functionality, but it's the current reality of how phrases are identified by Voyant (for reasons of efficiency).

## See Also

- [Getting Started](#!/guide/start)
- [Grids](#!/guide/grids)
- [Default Skin](#!/guide/skins-section-default-skin)
- [List of Tools](#!/guide/tools)