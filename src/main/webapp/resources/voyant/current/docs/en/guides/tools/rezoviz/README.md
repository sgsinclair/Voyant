# RezoViz

RezoViz represents connections between people, places and organizations that co-occur in multiple documents.

Please note: this tool is one of the least reliable ones in Voyant (especially with larger corpora), in part because the processing of entities requires more time and computation than most other operations. In some cases you can try refreshing the page (i.e. not reloading the corpus, but reloading the page with the same corpus) in case processing of entities has completed in the interim.
	
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

{@img rezoviz-cities.png RezoViz with Cities}

This shows that Montreal is central as it appears in all three documents. The placement of the other cities tries to optimize available space by showing more closely linked items in proximity and with the fewest number of crossing lines (as the data become more complex this becomes more difficult as competing priorities are at work). This type of graph is called a force-directed network graph.

Because RezoViz creates links between pairs of terms in a document, it works best with several documents (all terms in a single document will be linked). Depending on the genre of the documents, it may work better with shorter documents (like news articles, where there tends to be a high density of people, locations and organizations) or longer documents (like novels where there tend to be fewer unique people, locations and organizations).

How does Voyant know what are people, locations and organizations? It performs an automated process called named entity recognition, currently using the [Stanford Natural Language Processing](http://nlp.stanford.edu/ner/index.shtml) library. Most named entity recognizers function with a mix of heuristics (capitalized letters for indicating proper nouns, for instance) and a training set where words have already been tagged (New York and John Smith are both double-worded capitalized sequences, but a training set can tell them apart). It’s important to recognize that named entity recognition is powerful and useful, but also subject to a lot of problems, such as the following:

* many taggers are trained with news feeds and may work less well with other corpora
* often instances of names can vary across a document (Mary, Mary Smith, Ms. Smith, Dr. Smith, etc.)
* names can be ambiguous (Johns Hopkins the person or the university)

## Options

You can add keywords by typing a query into the search box and hitting enter (see [Term Searches](#!/guide/search) for more advanced searching capabilities).

You can determine which categories of entities (people, locations, organizations) to display (keeping in mind that the automatic identification of organizations is at best approximate).

You can determine a minimum number of edges for displayed items. In other words, how many other entities must be connected in order for an item to be shown? The default is two (any item needs to be linked to at least two others).

The following options relate to the physics engine of the force-directed graph, they determine how items are arranged in the available space. The optimal settings will depend on a lot of factors, including the number of items shown, their interconnectedness, etc.

* *repulsion*: how strongly to the labels (nodes) push away from each other (the stronger the repulsion the easier it might be to see the labels, but too much repulsion may not work in smaller spaces with more items)
* *stiffness*: this refers to the strength of the edges during layout, it determines how springy they behave, that is, how resistent they are to resizing in length (while the other forces are being applied)
* *friction*: the force-directed graph continues to move until it has achieved an optimal placement of items, the friction setting determines how much to slow down the movement after each iteration (a high value will allow things to keep moving for longer)

## See Also

- [Getting Started](#!/guide/start)
- [Default Skin](#!/guide/skins-section-default-skin)
- [List of Tools](#!/guide/tools)
