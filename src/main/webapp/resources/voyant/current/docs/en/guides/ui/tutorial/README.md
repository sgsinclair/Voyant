# Tutorial/Workshop

This page is intended to provide a possible starting point for tutorials or workshops on Voyant Tools. Please feel free to adapt it as needed. This page is also written to serve as a self-study guide.

There are some core concepts in Voyant that can be covered during a workshop, but there are also many specific issues that arise depending on the background and interests of users and participants. We tend to view workshops on Voyant as serving two purposes:

1. how to use Voyant and get a grasp on what's available (how to use it)
1. how to think differently about texts with tools such as Voyant (why use it)

Pre-prepared materials like this document are perhaps best suited for the first purpose but we also think that a workshop can provide a venue for spontaneous explorations about the strengths and limitations of text analysis in general and Voyant in particular.

There is a hosted version of Voyant Tools (https://voyant-tools.org) but we very strongly encourage anyone following along to download and launch the desktop version. Things can become unpredictable when 30 people hit the same button on the hosted version of Voyant. Besides, running a local version is likely to be faster, more private, and more flexible (you can work "offline"). Running VoyantServer is easy, you just [download](https://github.com/sgsinclair/VoyantServer/wiki/VoyantServer-Desktop), unzip, and click on the application. We usually try to contact workshop participants in advance to ask that they install a local version and sometimes we provide USB keys with download file.

## Topics

The tutorial will cover the following topics:

* basic information about Voyant (essential background about the tool and its design)
* how to create (or use) a Voyant corpus (especially with URLs and file uploads)
* how to begin exploring a corpus in Voyant (the default tools and their interactions)
* digging deeper into Voyant functionality (power searches, working with grids, additional tools)
* beyond Voyant (exporting data, bookmarking, embedding tools elsewhere)
* getting involved (as a user, developer, translator, content provider)
* future directions (such as Spyral Notebooks)

There is a lot of material here and if you are leading a workshop you may want to select parts to skip (or cover some things more quickly than others). Depending on how things are presented and how much time is given for discussion and exploration, this outline might work well for a full-day workshop. Shorter formats are of course possible by being more selective or having a more instructional rather than hands-on tutorial style.

Before getting into the specific topics we often take a moment to ask people to introduce themselves, describe their areas of interests, their expectations of Voyant and the workshop, and to indicate any specific topics or areas that they would like covered in more detail. (This is also an opportunity for the workshop leaders to introduce themselves and describe their own areas of research and interests.) 

## Basics of Voyant

The [About](#!/guide/about) page contains a useful introduction to Voyant: what it is, who has contributed, and some of the core design principles. It's worth reading as time permits.

For the purposes of the workshop, we typically like to emphasize the following:

* Voyant Tools fits in a long tradition of humanities scholars building tools for reading, finding, analyzing and visualizing digital texts.
* Voyant Tools strives to lower the barrier of entry for text analysis and balance user-friendliness with powerful functionality. For instance, no installation or login are required, and you can work with texts in a wide variety of formats (plain text, PDF, XML, MS Word, RTF, etc.).
* Voyant Tools is open-source and is a work in progress, it may not always work as intended and it's best to approach all observations with some circumspection.
* Voyant Tools has the advantage of being able to work with almost any language (represented in Unicode) but has the disadvantage that it has almost no language-specific functionality (needed for things like semantic analysis).
* Voyant Tools is intended as a tool for exploration and to assist with interpretative practices, it is not intended to tell you what questions to ask or to provide irrefutable results, though you may notice some interesting things and you may be led to construct some compelling interpretations while using it.
* Voyant Tools has no ambition to be the only tool that you use, there may come a point where its pre-programmed functionality seems constraining or inappropriate and other tools may be more suitable (we're especially big fans of [Python and Juypter Notebooks](https://github.com/sgsinclair/alta/blob/2eb10ab6787d032e317ce883fb0bc3427406333d/ipynb/Useful%20Resources.ipynb).
* Voyant is designed to integrate into a collaborative research process, including the possibility of sharing corpora and embedding tools into web pages (as you might embed a video); we are interested in how tools and argumentation can be combined in scholarship.

Ok, that's all somewhat abstract and conceptual, let's jump into using Voyant.

## Create a Corpus

There's more detail in the [Creating a Corpus](#!/guide/corpuscreator) page, but there are four main ways of creating and using a corpus in Voyant ("corpus" is another word for a set of documents):

1. open an existing corpus (click on the "Open" button under the text box)
1. type or paste text into the main text box (this creates a corpus with one document)
1. type or paste one or more URLs into the main text box (one URL per line)
1. click the "Upload" button under the text box to use files from your computer

Take a moment to try each kind of corpus source (open, text, URLs, upload) in the box below (or in a <a href="../" target="_blank">new window</a>).

<iframe src="../" style="width: 90%; height: 520px;"></iframe>

Some tips:

* typing or pasting text into the box is ok for shorter documents, but for longer documents it's probably best to upload a file
* when you upload files you can select multiple files at a time
* if you have several local files to upload, consider creating a zip archive first, then upload just that file
* URLs need to be visible to the Voyant server (not behind a firewall) so the contents can be fetched
* some servers (like Gutenberg) may limit the number of requests, which could cause URLs to behave sporadically
* it can take a while to fetch a long list of URLs, it's probably preferable to use another tool to download the files (or download them manually) and then upload them in a zip archive
* uploaded plain text files need to be in UTF-8

If an error occurs during corpus creation you may see an error message appear. Unfortunately, sometimes the system just fails silently (especially if you're creating a big corpus and there's a server timeout). One advantage of using a local instance of VoyantServer is that you may see some helpful errors reported in the VoyantServer window.

Voyant can be used with a corpus of variable size, from one document to many. Some of the functionality depends on multiple documents and some tools work less well when there are hundreds or more documents.

It's good to think of a corpus as a fluid concept, you may be able to change the meaning as you proceed. For instance, if you have thousands of tweets, you could treat each one as a separate document, or combine tweets by time, by author, or by some other criteria. Sometimes you might want to edit a corpus or sometimes you might want to create a new corpus for comparison.

We won't experiment for now with more advanced options for Corpus creation, but there are several [options](#!/guide/corpuscreator-section-options) available to tweak the processing of text, XML, and even spreadsheets. If you have a moment during the workshop you could start experimenting with these.

## Explore a Corpus

Once you create a corpus you will arrive at the default "[skin](#!/guide/skins)" or arrangement of tools. There is a lot happening at once, but we'll start by describing the tools that you see and how they can interact.

### Default Skin

At first you will see three tool panels along the top and two tool panels along the bottom:

* [Cirrus](#!/guide/cirrus): a kind of word cloud showing the most frequent terms
* [Reader](#!/guide/reader): an efficient corpus reader that fetches segments of text as you scroll
* [Trends](#!/guide/trends): a distribution graph showing terms across the corpus (or terms within a document)
* [Summary](#!/guide/summary): a tool that provides a simple, textual overview of the current corpus
* [Contexts](#!/guide/contexts): a concordance that shows each occurrence of a keyword with a bit of surrounding context

<iframe src="../?corpus=austen" style="width: 90%; height: 500px;"></iframe>

### Tool Interactions

An essential part of Voyant is that events in one tool can cause changes in other tools (the exact interactions depend on a number of factors, including which tools are visible). For instance, try the following sequence in the window above:

* click on a word (like "know") in Cirrus, the tool in the upper left
* notice how the Trends tool (upper right) now shows just the word you clicked
* click on one of the discs in the Trends tool
* notice that the Contexts tool (bottom right) has updated with just the clicked word
* click the first row of the Contexts tool (bottom right)
* notice how the Reader tool has jumped to a location where that word appears, highlighted

### Cirrus

<iframe src="../tool/Cirrus/?corpus=austen" style="width: 500px; height: 300px; float: right; padding-left: 1em;"></iframe> Now let's zoom in for a moment on Cirrus. We might ask ourselves several questions about what we're seeing. For instance, what does size represent? What about colour? What about the placement of words? This is a text in English but the most commonly occurring words aren't there (like "the" and "a"), why not? For a tool like Cirrus some of these questions may be obvious, but for **all** tools it's good to continuing asking ourselves what we're seeing, what we're not seeing, and why.

### Options

<img src="guides/tutorial/cirrus-options.png" style="float: left; max-width: 200px; padding-right: 1em;"> Some options in Cirrus (like other tools) are available directly within the tool panel, like the "Scale" button and the "Terms" slider (experiment with both of these to see what they do). Other options are accessible from the options dialog that appears when you click on slider in the grey bar of the tool (like the image to the left). The full list of options are described in the [Cirrus](#!/guide/cirrus-section-options) documentation page, but let's have a quick look at the Stopwords option by clicking the "Edit List" button. This will show a dialog box with a long list of words that are excluded from the top frequency words in Cirrus. These are generally "function" words, or words that carry less meaning, but you may be surprised to see some of the words included (like "must" or "nobody"). Likewise, you may want to add a word that's not currently in the list (like "said"). Either way it's good to know what's there and to confirm that's what you want. You can find [more information on stopwords](#!/guide/stopwords).

### Summary

One last thing to point out from the Summary tool (bottom left): the "Distinctive words" list. Assuming your corpus has multiple documents, this shows the words that are not only high frequency, but high frequency and relatively distinctive to that document (the frequency is weighted by how often it's found i other documents using something called [TF-IDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf)).

<iframe src="../?corpus=austen&view=summary" style="width: 90%; height: 300px;"></iframe>

Now that an initial presentation of the interface has been made, this would be a good time to allow participants an opportunity to further explore. We will see some more functionality and some more tools in the next section, so the emphasis can be on the tools that are visible in the default interface: What information is shown in the five tools? What interactions between tools are possible? What simple tweaks to the settings and options are worth trying? Participants can use the Austen corpus or a simple corpus of their own (ideally that contains multiple documents).

## Digging Deaper

Voyant is an ongoing negotiation between simplicity and power: the design tries to simplify (relatively) the interface while still allowing more advanced operations.

### Search 

A good example of this is [search](#!/guide/search), which is supported in several of the tools (including Reader, Trends and Contexts in the default view). It's possible to search for a single word, but more advanced searches are also supported with a special syntax (hovering over the question mark in the search box shows examples of the syntax). Try the search terms (in bold) in the list below (you can remove a query by hitting x in the box surrounding the query, or hitting backspace to delete it). Also notice that Voyant tries to suggest search terms as you type, you can click on a suggestion to add it to the queries.

<iframe src="../?corpus=austen&view=trends" style="width: 350px; height: 350px; float: right"></iframe>

* **love**: exact word match
* **lov\***: combine all words that start with "lov"
* **^lov\***: separate all words that start with "lov"
* **love|loves**: combine all words separated by a pipe |
* **"he loves"**: exact phrase match
* **"she lov*"**: phrase including a wildcard word
* **"she he love*"~10**: all words within a proximity of 10 words

The notion of boolean operators (AND, OR) isn't relevant for most tools since we're querying for any instance of any of the **words** (unlike when we're wanting to find **documents** that contain any or all queries). Note also that Voyant doesn't support directly notions like singular and plural forms, but that you can determine what forms are present ("**^dog\***") and then decide if you want to combine forms ("**dog|dogs**") or keep them separate ("**dog,dogs**"). That helps for individual queries but of course doesn't help much when you would want to see all singular and plural forms combined in a frequency list.

### Grids

Another example of somewhat hidden power in the Voyant interface can be found in most grid-based tools (that look like spreadsheets, like Contexts in the default view). This is an overview of some of the functionality that may not be obvious:

* hover over the column header to get a short description of the column values
* some columns allow you to sort values by that column by clicking on it (and clicking again to reverse the order)
* most columns can be reordered by dragging and dropping the column headers
* most grids allow for row selection: select a row by clicking on it, select multiple rows by using the Shift or Ctrl/Command key
* some grids have checkboxes (leftmost column) that facilitate selecting multiple items
* selected rows should persist even when querying for additional data
* some grids have a plus icon (leftmost colunm) that allows the user to expand more information about that row
* most grids have "infinite scrolling" which means that more rows will be loaded dynamically as needed and as available
* hovering over most column headers will cause an arrow to appear in the right part of the column header, click on it for further options:
	* another way of sorting
	* a way of selecting additional columns to display

<div style="max-width: 450px;">{@img ../grids/grid.png Grid}</div>

### Additional Tools

Voyant's default view (or skin) shows a collection of 5 tools, but in fact there are many more tools available in Voyant. You may have already discovered one way of accessing some of them: by clicking on a tab (for instance, the Cirrus tool can be replaced by the Terms or Links tools simply by clicking on the tab (and of course you can click on the Cirrus tab to return to the default view).

{@img ../start/more-tools.png More Tools}

The tabs are pre-programmed alternatives, but you can also choose from a much longer list of tools by clicking on the little window icon that appears when hovering over the header (either the blue header at the top that replaces all of the tools in the window or the grey header in each tool panel that replaces just that tool). Additional tools are organized into the following categories (tools can appear in multiple categories):

* the first tools above the line are recommended alternatives
* corpus tools: showing data about the corpus as a whole
* document tools: showing data about individual documents
* visualization tools: presenting data as charts, graphs, and other visual forms
* grid tools: presenting data primarily in tabular form
* other tools: various other forms of data presentation

Another convenient way of browsing tools is to consult the [list of tools](#!/guide/tools), especially as there is a small thumbnail image and short description for each tool.

## Beyond Voyant

Voyant is designed to 

### Boomarking



### Exporting Data

### Embeddding Voyant

## Get Involed

We think of Voyant as a community-driven project, enriched by bug reports and feature requests from users, code contributions from developers, translators of the interface, and content providers who integrate Voyant into their platforms. 

### Users

	

### Developers

### Translators

The interface of Voyant has been partially or fully translated from English into multiple languages, including [Arabic](../?lang=ar), [Bosnian](../?lang=bs), [Czech](../?lang=cz), [Croatian](../?lang=hr), [French](../?lang=fr), [Hebrew](../?lang=he), [Italian](../?lang=it), [Japanese](../?lang=ja), and [Serbian](../?lang=sr). Help would be welcome to complete or update most of these languages, and we would gratefully welcome anyone wanting to start a new language (or coordinate with a team to do so). Voyant is a great way for new users anywhere in the world to start experimenting with text analysis. Please contact us if you're interested in helping!

### Content Providers

## Roadmap

Voyant is an ongoing effort and we're always balanacing multiple priorities, including the following:

* addressing bugs (see our issues tracker)
* improving robustness of the application (especially for multiple concurrent users)
* adding requested features, in particular:
  * progress monitoring for corpus creation (important for larger corpora)
  * a more useful and widely supported word groupings mechanism (creating simple lists of words that can function as a unit)
  * a preliminary geospatial mapping tool
  * some more language-specific functionality (lemmatization and semantic analysis)
  
### Spyral

Finally, we are working on a web-based notebook environment (like [Juypter](***)) that combines text (argumentation or documentation) with code snippets and results. Spyral will have the advantage of requiring no installation (unlike Jupyter) and will leverage much of the functionality in Voyant (both back-end analysis and front-end tools).

There is no end to the new functionality that we could add in Voyant, but Spyral will allow power users to implement some of that functionality themselves.

Voyant is an environment for reading, analysis and visualization, Spyral will include that and also be a writing and coding environment: we envision it as a full scholarly environment for text analysis.

We have a working prototype and anticipate a more official release at some point in 2019. 