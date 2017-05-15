# Via

Via is an experimental tool for exploring semantically related terms in English.

Use it with a <a href="../?view=Via&corpus=austen" target="_blank">Jane Austen corpus</a> or with <a href="../?view=Via" target="_blank">your own corpus</a>.

## Overview

Via tries to suggest some semantic relationships between terms in your text. It does this by first lemmatizing the text (making singular all nouns, for instance) and then measuring the semantic distance between every word and every other word. The semantic distance is a measure provided by [WordNet](https://wordnet.princeton.edu/), which can specify how many "jumps" are required from any one word to another – the shorter the distance, the more terms are likely to be related. A link is drawn between related words, sometimes words are in a bilateral pairing, sometimes they form larger clusters. The size of the word indicates the number of times the word participates in a relationship.

If your corpus is relatively small (under 100,000 words), Via will show results for the entire corpus, otherwise it will start with the first document only (but that can be changed with the scale option in the bottom toolbar).

Please note that for now Via is stubbornly monolingual because of the resources needed for lemmatizing and semantic relationships.

<iframe src="../tool/Via/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 500px"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">Via with the Works of Jane Austen. You can also <a href="../?view=Via" target="_blank">use Via with your own corpus</a>.</div>

## Options

You can define the scale for Via, that is, if it's viewing one document or an entire corpus. Be aware that processing a larger corpus can take a while and the system may time out.

Via has a slider near the bottom that allows you to adjust the number of relationships (edges) displayed. By default the value is 100, the minimum value is 10 and the maximum value is 1,000, and the slider adjusts by increments of 10.

Clicking on the [Options](#!/guide/options) icon also allows produces a dialog box with additional settings that can be modified.

- **Stopwords**: you can define a set of stopwords to exclude – see the [stopwords guide](#!/guide/stopwords) for more information
- **White List**: you can define a set of allowed words (the opposite of a stopwords list), only terms in this list will be shown in Cirrus (note that the stopwords list is still active, so you may want to choose "None" from the stopwords menu to deactivate it)

## More information

Via is inspired by the work of Sally Sedelow on her own Via system during the late 1960s and early 1970s. Sedelow's Via was a pipeline for taking a text (encoded on punch cards), tokenizing, normalizing and building a semantic tree structure based on semantic relationships from words in the text. Whereas Sedelow used primarily Roget's 1962 thesaurus (which isn't freely available), our Via uses [WordNet](https://wordnet.princeton.edu/).

## See Also

- [Getting Started](#!/guide/start)
- [List of Tools](#!/guide/tools)
