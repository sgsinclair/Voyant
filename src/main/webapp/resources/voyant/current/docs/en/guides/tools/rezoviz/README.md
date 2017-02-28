# RezoViz

RezoViz represents connections between people, places and organizations that co-occur in multiple documents.
	
## Overview

RezoViz is a network graph representation where automatically identified people, places and organizations are the nodes (labels) and edges (lines) indicate where these entities co-occur in one or more documents. Consider the following:

<table>
	<thead>
		<tr>
			<th></th>
			<th>Document 1</th>
			<th>Document 2</th>
			<th>Document 3</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>places mentioned</td>
			<td>Paris, Montreal, Mexico</td>
			<td>Sydney, Montreal, Boston</td>
			<td>Tokyo, Montreal, Mexico</td>
		</tr>
		<tr>
			<td>place pairs (co-occurrences)</td>
			<td>Paris—Montreal<br />Paris—Mexico<br />Montreal—Mexico</td>
			<td>Sydney—Montreal<br />Sydney—Boston<br />Montreal—Boston</td>
			<td>Tokyo — Montreal<br />Tokyo — Mexico<br />Montreal — Mexico</td>
		</tr>
	</tbody>
</table>

Shown as a network graph this might look something like the following:

This shows that Montreal is central as it appears in all three documents. The placement of the other cities tries to optimize available space by showing more closely linked items in proximity and with the fewest number of crossing lines (as the data become more complex this becomes more difficult as competing priorities are at work). This type of graph is called a force-directed network graph.

Because RezoViz creates links between pairs of terms in a document, it works best with several documents (all terms in a single document will be linked). Depending on the genre of the documents, it may work better with shorter documents (like news articles, where there tends to be a high density of people, locations and organizations) or longer documents (like novels where there tend to be fewer unique people, locations and organizations).

How does Voyant know what are people, locations and organizations? It performs an automated process called named entity recognition, currently using the [Stanford Natural Language Processing](http://nlp.stanford.edu/ner/index.shtml) library. Most named entity recognizers function with a mix of heuristics (capitalized letters for indicating proper nouns, for instance) and a training set where words have already been tagged (New York and John Smith are both double-worded capitalized sequences, but a training set can tell them apart). It’s important to recognize that named entity recognition is powerful and useful, but also subject to a lot of problems, such as the following:

* many taggers are trained with news feeds and may work less well with other corpora
* often instances of names can vary across a document (Mary, Mary Smith, Ms. Smith, Dr. Smith, etc.)
* names can be ambiguous (Johns Hopkins the person or the university)

## Options

You can add keywords by typing a query into the search box and hitting enter (see [Term Searches](#!/guide/search) for more advanced searching capabilities).

You can use the _Clear_ button to clear all keywords in the graph (to start from scratch and add your own).

The _Context_ slider determines how many terms to include when looking for collocates. The value specifies the number of words to consider on _each_ side of the keyword (so the total window of words is double). By default the context is set to 5 words per side, and the slider can have a maximum of 30.

Clicking on the [Options](#!/guide/options) icon also allows you to define a set of stopwords to exclude – see the [stopwords guide](#!/guide/stopwords) for more information.


## See Also

- [Getting Started](#!/guide/start)
- [Default Skin](#!/guide/skins-section-default-skin)
- [List of Tools](#!/guide/tools)
