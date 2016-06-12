# StreamGraph
	
StreamGraph is a visualization that depicts the change of the frequency of words in a corpus (or within a single document).

## Overview


StreamGraph is intended to be used with a corpus that contain several documents and where the order of the documents is meaningful (such as chronological order); it can also be used with a single document that gets automatically segmented.

Each horizontal line in the graph is coloured according to the word it represents, at the top of the graph a legend displays which words are associated with which colours. Hovering over any point on the graph provides additional information. The bottom (x) axis shows brief labels for either the documents or the document segment.

You can toggle specific terms by clicking on them in the legend at the top.

<iframe src="../tool/StreamGraph/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 400px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">StreamGraph with the Works of Jane Austen. You can also <a href="../?view=StreamGraph" target="_blank">use StreamGraph with your own corpus</a>.</div>

## Options

You can add keywords by typing a query into the search box and hitting enter (see [Term Searches](#!/guide/search) for more advanced searching capabilities).

You can use the _Clear_ button to clear all keywords in the graph (to start from scratch and add your own).

Clicking on the [Options](#!/guide/options) icon also allows you to define a set of stopwords to exclude – see the [stopwords guide](#!/guide/stopwords) for more information.

## See Also

- [Getting Started](#!/guide/start)
- [Stopwords](#!/guide/stopwords)
- [Term Searches](#!/guide/search)
- [Default Skin](#!/guide/skins-section-default-skin)
- [List of Tools](#!/guide/tools)
