# Collocates Graph
	
Collocates Graph represents keywords and terms that occur in close proximity as a force directed network graph.

## Overview

This represents a network graph where keywords in green are shown linked to collocates in maroon. You can hover over a term to see its frequency (for keywords it's the corpus frequency, for collocates it's the frequeny in the context of the linked keywords). 

You can drag and drop terms to move them. You can drag terms off the canvas to remove them.

<iframe src="../tool/CollocatesGraph/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 400px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">Collocates Graph with the Works of Jane Austen. You can also <a href="../?view=CollocatesGraph" target="_blank">use Collocates Graph with your own corpus</a>.</div>


## Options

You can add keywords by typing a query into the search box and hitting enter (see [Term Searches](#!/guide/search) for more advanced searching capabilities).

You can use the _Clear_ button to clear all keywords in the graph (to start from scratch and add your own).

The _Context_ slider determines how many terms to include when looking for collocates. The value specifies the number of words to consider on _each_ side of the keyword (so the total window of words is double). By default the context is set to 5 words per side, and the slider can have a maximum of 30.

Clicking on the [Options](#!/guide/options) icon also allows you to define a set of stopwords to exclude – see the [stopwords guide](#!/guide/stopwords) for more information.


## See Also

- [Getting Started](#!/guide/start)
- [Stopwords](#!/guide/stopwords)
- [Term Searches](#!/guide/search)
- [Default Skin](#!/guide/skins-section-default-skin)
- [List of Tools](#!/guide/tools)
