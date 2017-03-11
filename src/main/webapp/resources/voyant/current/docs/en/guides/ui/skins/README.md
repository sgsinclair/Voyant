# Skins

## Default Skin

The default skin includes the following tools:

1. [Cirrus](#!/guide/cirrus)
1. [Reader](#!/guide/reader)
1. [Trends](#!/guide/trends)
1. [Summary](#!/guide/summary)
1. [Contexts](#!/guide/contexts)


<iframe src="../?corpus=austen" style="width: 90%; height: 600px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">Voyant with the Works of Jane Austen. You can also <a href="../" target="_blank">use Voyant with your own corpus</a>.</div>

The various tools in the interface are designed to interact with one another. For instance, if you click on a word in [Cirrus](#!/guide/cirrus), you’ll see the [Trends](#!/guide/trends) tool update with information about the selected work. Similarly, if you click on a node in the [Trends](#!/guide/trends) tool the [Contexts](#!/guide/contexts) tool should update as well. Interactivity and navigation between the different scales of a corpus (from the macroscopic [Cirrus](#!/guide/cirrus) overview to the microscopic individual word occurrences) are a key part of the design of Voyant Tools.

Additional tools are readily accessible by clicking the tabs in each tool pane. For instance, beside the [Cirrus](#!/guide/cirrus) header label is the [Corpus Terms](#!/guide/corpusterms) label, clicking on the tab will switch the tool. Tools readily available through the tabs are [Corpus Terms](#!/guide/corpusterms), [Links](#!/guide/collocatesgraph), [Collocates](#!/guide/corpuscollocates), [Documents](#!/guide/documents), [Phrases](#!/guide/phrases), and [Bubblelines](#!/guide/bubblelines).

Beyond the tools visible in the tabs, it's possible to access most of the other tools available by clicking on the window icon that appears when the mouse is in the header of a tool (grey) or of the skin (blue). The menu that appears shows recommended tools for that location above the line and a hierarchy of other tools below the line.

{@img more-tools.png More Tools}

For more information about the available tools, consult the [List of Tools](#!/guide/toolslist)

## Special Skins

In addition to the default skin (that can be used with [Austen](../?corpus=austen) or [your own corpus](../)) there are several pre-defined skins that combine a subset of tools, including:

* *Bubblelines Skin*: the [bubblelines](#!/guide/bubblelines) tool combined with the [contexts](#!/guide/contexts) and [reader](#!/guide/reader) tools (use with [Austen](../?corpus=austen&view=bubblelinesset) or [your own corpus](../?view=bubblelinesset))
* *Collocates Skin*: [corpus terms](#!/guide/corpusterms), [document terms](#!/guide/documentterms), [corpus collocates](#!/guide/corpuscollocates), [contexts](#!/guide/contexts), and [collocates graph](#!/guide/collocatesgraph) (use with [Austen](../?corpus=austen&view=collocatesset) or [your own corpus](../?view=collocatesset))
* *Scatter Skin*: [scatterplot (PCA and CA)](#!/guide/scatterplot) with [documents](#!/guide/documents), [trends](#!/guide/trends) and [contexts](#!/guide/contexts) (use with [Austen](../?corpus=austen&view=scatterset) or [your own corpus](../?view=scatterset))
* *Subset Skin*: a specialized interface to select a subset of documents from your corpus (for download or for use in Voyant), based on full-text and metadata search (use with [Austen](../?corpus=austen&view=subset) or [your own corpus](../?view=subset))


## Dynamic Table of Contexts Skin

The Dynamic Table of Contexts Browser is an online reading environment for digitally encoded texts that allows for complex searches combining the table of contents with semantic tagging, index items, and free-text searching.

The Dynamic Table of Contexts developed from the question of how best to leverage the kind of tagging or semantic markup used in the digital humanities to publish born digital scholarship involving long-form argumentation of the kind found in scholarly books. The browser, which resembles an e-book interface of the kind encountered at websites such as archive.org, combines tagging of the structure of the text with the tagging of named entities (people, places, organizations, titles) and with search functionality. Together, these provide users with a unique environment for browsing and navigating through the digital book, one that combines the Table of Contents with the Index. The result is a dynamic browsing environment in which the user can see where the materials that interest her are located within the structure of the volume.

More information is available at the [CWRC website](http://www.cwrc.ca/cwrc_news/dtoc/).

## Next Steps

* [languages](#!/guide/languages)
* [explore the tools](#!/guide/tools)
* read [about Voyant Tools](#!/guide/about)