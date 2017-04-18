# Topics

The Topics tool provides a rudimentary way of generating term clusters from a document or corpus and then seeing how each topic (term cluster) is distributed across the document or corpus.

## Overview

The Topics tool is designed to help you understand what topics (term clusters) exist and how they are distributed. If you have a single document in your corpus then the document will be divided into segments of equal length for the topic modelling (how many text segments depends on the size of the document). If you have multiple documents then the topic modelling is performed on each document. It's worth noting that topic modelling probably works best with shorter documents (article length rather than book length). By default *Topics* only uses the first 1,000 words in a document (see the options for how to modify that).

The topic modelling uses a technique called [latent Dirichlet allocation](https://en.wikipedia.org/wiki/Latent_Dirichlet_allocation) and this tool uses an implementation called [jsLDA by David Mimno](https://github.com/mimno/jsLDA). To simplify, words in each document are randomly assigned to a specified number of topics (you can determine the number of topics). The algorithm then goes through a number of iterations (50) and tries to refine the model of which terms are best suited to which topics (based on co-occurrence in the documents).

It's important to understand that this algorithm starts by randomly assigning words to topics and so every time topic modelling is run you are likely to get different results. This can be frustrating and disconcerting, but at the same time, chances are good that every time it's run the topics have some internal coherence.

Each topic technically contains every word in the corpus, but only the top 10 words are displayed. The order of the words is important and the first words likely contribute much more to the topic than the latter words.

The table view shows the following two columns:

- *Topic*: this is the topic, or cluster of terms (each row displays 10 words, the number of rows corresponds to the number of topics the user has specified, 25 by default)
- *Scores*: this shows how prevalent the topic is for each document in the corpus (or segment in the document) – upward spikes show that this topic is more present (you can hover over the line to see which document is represented)

<iframe src="../tool/Topics/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 350px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">Topics with the Works of Jane Austen. You can also <a href="../?view=Topics" target="_blank">use Topics with your own corpus</a>.</div>

## Options

You can search for words (or part words) displayed in the topics using the search box. Matches will be highlighted.

You can use the *Topics* slider to determine how many topics to generate, from 1 to 200 (default is 25). Changing this value will remove current topics.

You can run another 50 iterations of the topic modelling with the current topics (and repeat as often as you wish). The current topics are kept but the displayed terms may change with further iterations.

Clicking on the [Options](#!/guide/options) icon also allows you to define a set of stopwords to exclude – see the [stopwords guide](#!/guide/stopwords) for more information.

The options icon also allows you to modify the maximum number of terms per document to use for the topic modelling. By default this is set to 1,000 (words, including stopwords), which can be increased somewhat, but depending on the size of your corpus, you may not want to go too high since it can cause problems with the server and with your browser.

## See Also

- [Getting Started](#!/guide/start)
- [Grids](#!/guide/grids)
- [Default Skin](#!/guide/skins-section-default-skin)
- [List of Tools](#!/guide/tools)