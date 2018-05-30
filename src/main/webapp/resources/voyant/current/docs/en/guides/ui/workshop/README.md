# Workshop

This page is intended to provide a possible starting point for workshops on Voyant Tools. Please feel free to adapt it as needed. Even though the page is entitled "Workshop" it's also written to be a self-study guide.

There are some core concepts in Voyant that can be covered during a workshop, but there are also many specific issues that arise depending on the background and interests of participants. We tend to view workshops on Voyant as serving two purposes:

1. how to use Voyant and get a grasp on what's available (conveying the mechanics and techniques)
1. how to think differently about texts with tools such as Voyant (a discussion on conceptual approaches)

Pre-prepared materials like this are perhaps best suited for the first purpose but we also think that a workshop can provide a venue for spontaneous explorations about the strengths and limitations of text analysis in general and Voyant in particular.

There is a hosted version of Voyant Tools (https://voyant-tools.org) but we very strongly encourage workshop participants to download and launch the desktop version. Things can become unpredictable when 30 people hit the same button on the hosted version of Voyant. Besides, running a local version is likely to be faster, more private, and more flexible (you can work "offline"). Running VoyantServer is easy, you just [download](https://github.com/sgsinclair/VoyantServer/wiki/VoyantServer-Desktop), unzip, and click on the application. We usually try to contact workshop participants in advance to ask that they install a local version and sometimes we provide USB keys with download file.

## Topics:

The workshop outline will cover the following topics:

* basic information about Voyant (essential background about the tool and its design)
* how to create (or use) a Voyant corpus (especially with URLs and file uploads)
* how to begin exploring a corpus in Voyant (the default tools and their interactions)
* making better use of Voyant functionality (tool options, power searches, working with grids)
* getting to know additional Voyant tools (from visualization toys to advanced charting)
* beyond Voyant (exporting data, bookmarking, embedding tools elsewhere)
* getting involved (as a user, developer, translator, content provider)
* future directions (such as Spyral Notebooks)

Before getting into the specific topics of the workshop we often take a moment to ask people to introduce themselves, describe their areas of interests, their expectations of Voyant and the workshop, and to indicate any specific topics or areas that they would like covered in more detail. (This is also an opportunity for the workshop leaders to introduce themselves and decribe their own areas of research and interests.) 

## Basics of Voyant

The [About](#!/guide/about) page contains a useful introduction to Voyant, what it is, who has contributed, and some of the core design principles; it's worth reading as time permits.

For the purposes of the workshop, we typically like to emphasize the following:

* Voyant Tools fits in a long tradition of humanities scholars building tools for reading, finding, analyzing and visualizing digital texts.
* Voyant Tools strives to lower the barrier of entry for text analysis and balance user-friendliness with powerful functionality. For instance, no installation or login are required, and you can work with texts in a wide variety of formats (plain text, PDF, XML, MS Word, RTF, etc.).
* Voyant Tools is open-source and is a work in progress, it may not always work as intended and it's best to approach observations with some circumspection.
* Voyant Tools is intended as a tool for exploration and to assist with interpretative practices, it is not intended to tell you what questions to ask or to provide irrefutable results, though you may notice some interesting things and you may be led to construct some compelling interpretations while using it.
* Voyant Tools has no ambition to be the only tool that you use, there may come a point where its pre-programmed functionality seems constraining or inappropriate and other tools may be more suitable (we're especially big fans of [Python and Juypter Notebooks](https://github.com/sgsinclair/alta/blob/2eb10ab6787d032e317ce883fb0bc3427406333d/ipynb/Useful%20Resources.ipynb).
* Voyant is designed to integrate into a collaborative research process, including the possibility of sharing corpora and embedding tools into web pages (as you might embed a video); we are interested in how tools and argumentation can be combined in scholarship.

Ok, that's all somewhat abstract and conceptual, let's jump into using Voyant.

## Creating a Corpus

There's more detail in the [Creating a Corpus](#!/guide/corpuscreator) page, but there are four main ways of creating and using a corpus in Voyant (a corpus is another word for a set of documents):

1. open an existing corpus (click on the "Open" button under the text box)
1. type or paste text into the main text box (this creates a corpus with one document)
1. type or paste one or more URLs into the main text box (one URL per line)
1. click the "Upload" button under the text box to use files from your computer

Take a moment to try each kind of corpus source (open, text, URLs, upload) in the box below (or in a <a href="../" target="_blank">new window</a>).

<iframe src="../" style="width: 90%; height: 520px;"></iframe>

Some tips:

* typing or pasting text into the box is ok for shorter document, but for longer document it's probably best to upload a file
* when you upload files you can select multiple files at a time
* if you have several local files to upload, consider creating a zip archive first, then upload just that file
* URLs need to be visible to the Voyant server (not behind a firewall) so the contents can be fetched
* it can take a while to fetch a long list of URLs, it's probably preferable to use another tool to download the files (or download them manually) and then upload them in a zip archive
* uploaded plain text files need to be in UTF-8

If an error occurs during corpus creation you may see an error message appear. Unfortunately, sometimes the system just fails silently (especially if you're creating a big corpus). One advantage of using a local instance of VoyantServer is that you may see some helpful errors reported in the VoyantServer window.

We won't experiment for now with more advanced options for Corpus creation, but there are several [options](#!/guide/corpuscreator-section-options) available to tweak the processing of text, XML, and even spreadsheets. If you have a moment now during the workshop you could start experimenting with these.

## Explore a Corpus

