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
* digging deeper into Voyant functionality (tool options, power searches, working with grids)
* getting to know additional Voyant tools (from visualization toys to advanced charting)
* beyond Voyant (exporting data, bookmarking, embedding tools elsewhere)
* getting involved (as a user, developer, translator, content provider)
* future directions (such as Spyral Notebooks)

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

At first you will see three tool panels along the top and two tool panels along the bottom:

* [Cirrus](#!/guide/cirrus): a kind of word cloud showing the most frequent terms
* [Reader](#!/guide/reader): an efficient corpus reader that fetches segments of text as you scroll
* [Trends](#!/guide/trends): a distribution graph showing terms across the corpus (or terms within a document)
* [Summary](#!/guide/summary): a tool that provides a simple, textual overview of the current corpus
* [Contexts](#!/guide/contexts): a concordance that shows each occurrence of a keyword with a bit of surrounding context

<iframe src="../?corpus=austen" style="width: 90%; height: 500px;"></iframe>

An essential part of Voyant is that events in one tool can cause changes in other tools (the exact interactions depend on a number of factors, including which tools are visible). For instance, try the following sequence in the window above:

* click on a word (like "know") in Cirrus, the tool in the upper left
* notice how the Trends tool (upper right) now shows just the word you clicked
* click on one of the discs in the Trends tool
* notice that the Contexts tool (bottom right) has updated with just the clicked word
* click the first row of the Contexts tool (bottom right)
* notice how the Reader tool has jumped to a location where that word appears, highlighted

<iframe src="../tool/Cirrus/?corpus=austen" style="width: 500px; height: 300px; float: right; padding-left: 1em;"></iframe> Now let's zoom in for a moment on Cirrus. We might ask ourselves several questions about what we're seeing. For instance, what does size represent? What about colour? What about the placement of words? This is a text in English but the most commonly occurring words aren't there (like "the" and "a"), why not? For a tool like Cirrus some of these questions may be obvious, but for **all** tools it's good to continuing asking ourselves what we're seeing, what we're not seeing, and why.

<img src="guides/tutorial/cirrus-options.png" style="float: left; max-width: 200px; padding-right: 1em;"> Some options in Cirrus (like other tools) are available directly within the tool panel, like the "Scale" button and the "Terms" slider (experiment with both of these to see what they do). Other options are accessible from the options dialog that appears when you click on slider in the grey bar of the tool (like the image to the left). The full list of options are described in the [Cirrus](#!/guide/cirrus-section-options) documentation page, but let's have a quick look at the Stopwords option by clicking the "Edit List" button. This will show a dialog box with a long list of words that are excluded from the top frequency words in Cirrus. These are generally "function" words, or words that carry less meaning, but you may be surprised to see some of the words included (like "must" or "nobody"). Likewise, you may want to add a word that's not currently in the list (like "said"). Either way it's good to know what's there and to confirm that's what you want. You can find [more information on stopwords](#!/guide/stopwords).

One last thing to point out from the Summary tool (bottom left): the "Distinctive words" list. Assuming your corpus has multiple documents, this shows the words that are not only high frequency, but high frequency and relatively distinctive to that document (the frequency is weighted by how often it's found i other documents using something called [TF-IDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf)).

<iframe src="../?corpus=austen&view=summary" style="width: 90%; height: 300px;"></iframe>

## Digging Deaper