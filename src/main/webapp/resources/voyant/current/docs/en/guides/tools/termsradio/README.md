# Terms Radio

TermsRadio is a visualization that depicts the change of the frequency of words in a corpus (or within a single document). 

## Overview

TermsRadio is intended to be used with a corpus that contain several documents and where the order of the documents is meaningful (such as chronological order); it can also be used with a single document that gets automatically segmented. It's designed to animate change over time by scrolling through the corpus with a selected window of documents (the number of documents visible at once).

TermsRadio has several features contained in two main components:

* top navigation
	* a legend of terms that are currently selected (or selected by default), you can toggle selection by clicking on the terms in the legend
	* an overview of the entire corpus with lines showing frequency trends for each selected words
	* a white window that shows the currently visible documents in the main graph
* main graph
	* each document is represented in a vertical column with top frequency terms plotted
	* you can select terms by clicking on them (hovering over terms will indicate which one will be selected)
	* the bottom x axis displays the document titles
	* the left y axis displays the relative document frequencies
	* the lines show the trends of the term frequencies for the visible documents

<iframe src="../tool/TermsRadio/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 600px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">TermsRadio with the Works of Jane Austen. You can also <a href="../?view=TermsRadio" target="_blank">use TermsRadio with your own corpus</a>.</div>

## Options

You can control the "play" of TermsRadio with the _Back_, _Pause_, _Forward_ and _Reset_ buttons.

Additional controls:

* **Scroll Duration**: the number of milliseconds to take to scroll across available documents or document segments
* **Word Display**: the total number of possible different words to use (i.e. not per document or per segment but in total)
* **Segements**: when in single document mode, the number of segments to use for the document
* **Visible Segments**: the number of segments to show in the main graph (the "window")
* **Search**: add more terms to the graph

## See Also

- [Getting Started](#!/guide/start)
- [Stopwords](#!/guide/stopwords)
- [Default Skin](#!/guide/skins-section-default-skin)
- [List of Tools](#!/guide/tools)