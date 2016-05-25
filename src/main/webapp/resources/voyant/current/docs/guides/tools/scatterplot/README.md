# Scatterplot

ScatterPlot is a graph visualization of how words cluster in a corpus document similarity, correspondence analysis or principal component analysis.

## Overview

Principal Component Analysis (PCA) is a technique which takes data in a multidimensional space and optimizes it, reducing the dimensions to a manageable subset. It is a way of transforming the data with respect to its own structure, so that associations between data points become more readily apparent. For example, consider a table of word frequencies for a corpus of ten documents. Each document can be thought of as a dimension, and each word frequency as a data point. Since we cannot visualize a ten dimensional space, we can apply PCA to reduce the number of dimensions to something feasible, like two or three. This is accomplished by transforming the data into a new space wherein the first few dimensions (or components) represent the largest amount of variability in the data. By discarding all but the first two or three dimensions, we will be left with a new data set which ideally contains most of the information in the original, but which is easy to visualize. In the resulting visualization, words that are grouped together are associated, i.e. they follow a similar usage in the corpus.

Correspondence Analysis is also conceptually similar to PCA, but handles the data in such a way that both the rows and columns are analyzed. This means that given a table of word frequencies, both the words themselves and the document segments will be plotted in the resulting visualization.

Document Similarity is essentially the same as Correspondence Analysis, but terms aren't shown in the graph.

The scatterplot is presented in the main display in the tool with a legend in the top left hand corner. Hovering over a word in the graph will display more information about the frequency of occurrence of that word.

Above the main display is the primary toolbar and to the right of the display is sub-panel providing a list of words that appear in the corpus as well as their frequencies.

<iframe src="../tool/ScatterPlot/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 400px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">ScatterPlot with the Works of Jane Austen. You can also <a href="../?view=ScatterPlot" target="_blank">use ScatterPlot with your own corpus</a>.</div>

## Options

The toolbar mainly comprises options for tweaking and exploring the plotting of the graph.

* **Analysis** allows the user to switch between plotting Document Similarity, Principal Component Analysis and Correspondence Analysis
* **Clusters** allows the user to control the number of groups to cluster the words into. These clusters are determined automatically by the criteria of the analysis and words in a cluster would indicate a measure of similarity between words. Clusters of terms will appear as a single colour.
* **Dimensions** allows the user to switch between two or three dimensions.
* **Labels** allows the user to cycle through the label settings for the graph.

## Terms

The Terms panel shows you which terms are displayed in the Scatterplot and it also allows you to control which terms are shown.

The terms grid functions like other [grids](#!/guide/grids) and you can sort terms alphabetically or by frequency. The Terms panel also provides the following functionality:

* **Terms Count**: determine how many terms to display at once in the graph (the terms present will influence the layout of the terms, so it's well worth experimenting with this option)
* **Nearby**: you can select a term of interest from the grid and ask to zoom in on "nearby" terms (terms that cluster in proximity)
* **Remove**: you can remove one term at a time by selecting it in the grid and hitting the _Remove_ button
* **Add Term**: you can search for and add new terms


## See Also

- [Getting Started](#!/guide/start)
- [Grids](#!/guide/grids)
- [Stopwords](#!/guide/stopwords)
- [Default Skin](#!/guide/skins-section-default-skin)
- [List of Tools](#!/guide/tools)