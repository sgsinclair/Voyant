# About

Voyant Tools is a web-based text reading and analysis environment. It is a scholarly project that is designed to facilitate reading and interpretive practices for digital humanities students and scholars as well as for the general public.

What you can do with Voyant:

* Use it to learn how computers-assisted analysis works. Check out our [examples](http://docs.voyant-tools.org/about/examples-gallery/) that show you how to do real academic tasks with Voyant.
* Use it to study texts that you find on the web or texts that you have carefully edited and have on your computer. 
* Use it to add functionality to your online collections, journals, blogs or web sites so others can see through your texts with analytical tools.
* Use it to add interactive evidence to your essays that you publish online. Add interactive panels right into your research essays (if they can be published online) so your readers can recapitulate your results.
* Use it to develop your own tools using our functionality and code.

## License

Voyant Tools is an open-source project and the code is available through [GitHub](http://github.com/sgsinclair/Voyant). The code is under a [GPL3 license](http://www.gnu.org/licenses/gpl-3.0.en.html) and the content of the web application (including this documentation) is under a [Creative Commons By Attribution license](https://creativecommons.org/licenses/by/4.0/). You have our permission to create and use screenshots and videos of Voyant Tools, though we always appreciate you letting us know (among other reasons, so that we can keep our gallery up-to-date)!

## Credits

Voyant Tools is a labour of love. It's ancestry includes HyperPo and Taporware and more distantly TACT.

### Project Leads

* St&eacute;fan Sinclair, McGill University
* Geoffrey Rockwell, University of Alberta

We appreciate you citing Voyant Tools, it helps to demonstrate the value of the tool and our recognizes our efforts. Depending on the citation style you need, you could adapt the following:

Sinclair, St&eacute;fan and Geoffrey Rockwell, 2016. _Voyant Tools_. Web. <http://voyant-tools.org/>.

### Contributors

* Andrew MacDonald (2008-present) a programmer who's worked on several tools including Bubblelines, Cirrus, Knots, ScatterPlot and skins including Dynamic Table of Contents
* Cyril Briquet (2010-2011) a postdoctoral fellow who worked primarily on improving Trombone 2 (the back-end system in Java)
* Lisa Goddard (2011-2012) a research assistant at UAlberta working on tool reviews and bug identification
* Mark Turcato (2012-2013) a research assistant at McGill working on documentation

### Software Libraries

Voyant Tools is made possible by several open source libraries (many of these libraries use additional libraries not listed here):

* Apache PDFBox for reading PDF documents
* Apache POI for reading Microsoft Office documents
* Apache Commons Math, Collections, File Upload, IO, Compress
* CyberNeko HTML Parser for reading (less than valid) HTML
* JAMA: Java Matrix Package for principal component and correspondence analysis in ScatterPlot
* MAchine Learning for LanguagE Toolkit (MALLET), especially for topic clustering
* Oracle Berkeley DB Java Edition for data storage
* Stanford Core Natural Language Processing, especially for named entity recognition in RezoViz
* XStream used to produce XML or JSON results
* Google Closure Compiler to compress Javascript files
* jQuery another Javascript framework used by some tools
* Sencha EXT JS the main Javascript framework used

## Design Principles

Design Principles

Although text analysis tool developers might choose to highlight different aspects for their purposes (such as stand-alone software as opposed to web-based software), here are some of the primary design principles for Voyant, as gleaned from other tools:

* **modularity**: tools should be able to fit together in various configurations
* **generalization**: tools should be designed to address a variety of types of text and uses
* **domain sensitivity**: tools need to be sensitive to the ways in which textual scholars think of and interact with digital texts
* **flexibility**: tools should be able to work with local or network sources in different formats
* **internationalization**: tools should allow users to work in different languages
* **performance**: tools should be reasonably responsive in order to function in a web-based context
* **separation of concerns**: it may be best to separate back-end analytic procedures from front-end interface concerns
* **extensibility**: it should be easy to create new tools and adapt existing ones, especially for the purposes of experimentation
* **interoperability**: tools should provide public APIs so that they can interact with other tools on the web
* **skinnability**: tools should be able to present themselves differently for different user needs and preferences
* **scalability**: tools should provide functionality both for a small corpus (like a book) or a large corpus (like many books)
* **simplicity**: at least one view of the tools should be maximally simple in its interface
* **ubiquity**: tools should lend themselves to being embedded in content elsewhere on the web
* **referenceability**: tools and their results should lend themselves to being referenced and cited as academic resources

Though they have existed before to varying degrees in different tools, Voyant is an attempt to pull together these design principles into a single a package. In some cases the the principles may in fact be contradictory in practice (for instance, supporting large-scale immediate analysis) and compromises must be found. Working through those challenges is one of the aspects that make Voyant a worthy intellectual challenge.

HyperPo and TAPoRware are the tools with the strongest affinities to Voyant. but we have devoted considerable thought and attention to improving existing web-based tools in ways further described below.

**Scalability**. Whereas HyperPo and Taporware can readily handle book-length texts for micro-analysis, both reach their practical limits when corpora grow to beyond a couple of megabytes. In contrast, Voyant is designed to handle much larger corpora (dozens of megabytes and beyond). There is still a practical (though undefined) limit to the size of corpora for Voyant given that it seeks to enable immediate micro-analysis, but the Voyant architecture is desiged with scale in mind. There will always be a tension between indexing speed and retrieval speed: the more time is available for indexing, the faster retrieval tends to be. As such, text analysis tools that require pre-indexing (Philologic, Monk, etc.) will almost always operate faster because pre-processing can be done over the course of hours or even days (building very large relational databases, for instance). In contrast, Voyant seeks to strike a balance between indexing and retrieval speed: ideally both should happen in a timeframe that seems reasonable in a web-based context. The ever-evolving pace of computing power and the promise of high performance computers obviously make the actual capabilities a moving target.

**Ubiquity**. As useful as text analysis tools like HyperPo and Taporware may be, we recognize a need to allow content providers and producers (like bloggers) to quickly and easily integrate functionality into their own space. The previous model was limited to users bringing their own texts to our tools, we now wish to also allow users to also bring our tools to their texts. In some cases users will wish to have static results, in which case we can provide a mechanism for easily copying and pasting results that can be directly embedded in other content. However, much of the most compelling functionality of Voyant is interactive and requires considerable client-side scripting: our current approach is to provide a tiny snippet of HTML that is essentially an IFRAME that contains the necessary HTML elements. This approach allows Voyant code to remain separate from its host while satisfying security limitations of cross-browser scripting. There are of course other challenges inherent to code embedded elsewhere, including version management (supporting legacy syntax) and cacheing of data (both the corpus and results).

**Referenceability**. The status of text analysis tools as academic resources has been a point of debate over the years. Scholars feel compelled to cite ideas and texts that come from other authors, but they are much less likely to recognized tools that have contributed to their work (and we would probably not want every scholar to cite search engines such as Google that have been used during research). We feel strongly that text analysis tools can represent a significant contributor to digital research, whether they were used to help confirm hunches or to lead the researcher into completely unanticipated realms. In any case, we have designed Voyant to be conducive to citation in various ways, including a general citation to Voyant and citations for static or dynamic results. An important component of academic knowledge is reproducibility, and providing scholars with more information on the processes followed during research &mdash; including the use of text analysis tools &mdash; is sure to be useful.

Ultimately, Voyant is an attempt to learn from the strengths and weaknesses of past tools, to recognize current user needs (ex: working with much larger corpora), and to anticipate future practices (ex: referencing text analysis tools and results). We believe that the potential for tools in the interpretive process merits continual rethinking of tool design and functionality, and as such, Voyant is of course a work in progress.

## Privacy Statement

The developers of Voyant Tools gather data from the site about what tools are invoked and with what parameters (IP addresses are also logged in order to be able to identify multiple requests during a same session). In addition, Voyant Tools uses Google Analytics (see [Google's Privacy Policy](http://www.google.ca/intl/en/policies/privacy/) and the Log Information section in particular). Locally logged data and Google Analytics data will be used by the development team in order to debug and improve the tools, as well as to understand how researchers are using them. This data may also be used for research purposes in anonymous and aggregate forms. Please note that texts submitted to Voyant Tools are stored in order to allow persistent access during a work session and between work sessions. If you have questions about the data being collected and how it is being used, or to request that a corpus be removed, please contact [St&eacute;fan Sinclair](http://stefansinclair.name).
