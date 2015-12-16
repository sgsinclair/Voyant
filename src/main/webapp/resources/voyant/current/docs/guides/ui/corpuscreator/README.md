# Creating a Corpus

Voyant offers powerful functionality for creating your own corpus.

## Sources

The following sources are supported:

* **Text Box**: you can type or paste text into the main text box in two different formats:
  * regular text as one document (plain text, HTML and XML are supported)
  * a set of URLs, one per line
* **Open**: you can open an existing corpus that's already been created:
  * [Austen](../?corpus=austen): Project Gutenberg's collection of 8 novels from [Jane Austen](http://www.gutenberg.org/ebooks/author/68): _Love And Freindship_, _Lady Susan_, _Sense and Sensibility_, _Pride and Prejudice_, _Mansfield Park_, _Emma_, _Northanger Abbey_, _Persuasion_
  * [Shakespeare](../?corpus=shakespeare): Project Gutenberg's collection of 37 plays from [William Shakespeare](http://www.gutenberg.org/ebooks/author/65)
* **Upload**: you can upload one or more files from your computer
  * use Shift and Ctrl keys to select multiple files at once
  * you can create a zip archive on your machine and upload it instead of selecting individual files

Unlike in the previous version of Voyant, you can now [add, remove and reorder documents](#!/guide/documents-section-modifying-a-corpus) after a corpus has been created.

<div style="max-width: 600px; margin-left: auto; margin-right: auto">{@img corpuscreator.png Corpus Creator}</div>

## Options

Options should be specified before hitting the upload button or the reveal button.

<div style="max-width: 350px; margin-left: auto; margin-right: auto;">{@img options.png Input Options}</div>

### Input Format

Most document formats are fairly easy to detect automatically, Voyant does a decent job of extracting text from HTML, MS Word, MS Excel, ODT, Pages (Apple), PDF, plain text, RTF, XML, and others. You can also provide archives (.zip, .tar, .tgz, etc.) containing documents in those formats. If you want to specific a format (because auto-detect isn't working), you can select from the following:

* **Atom Syndication Format ([Atom](https://en.wikipedia.org/wiki/Atom_(standard)))**: An XML-based format often used by news media, blogs, etc.
* **Dynamic Table of Contexts (DToC)**: A specialized XML-based format used by the [Dynamic Table of Contexts project](http://cwrc.ca/DToC_Documentation/)
* **Really Simple Syndication ([RSS](https://en.wikipedia.org/wiki/RSS))**: An XML-based format often used by news media, blogs, etc. Note that this is for RSS Version 2.0+, not RSS 1.0.
* **Text Encoding Initiative ([TEI](http://www.tei-c.org/))**: An XML-based format (essentially uses `//text` for content and `//teiHeader//title` and `//teiHeader//author` for metadata)
* **TEI Corpus**: As above, except that produces multiple documents from `//TEI` tags

### XML

Voyant provides powerful functionality for creating a corpus from XML documents, in particular by using [XPath](https://en.m.wikipedia.org/wiki/XPath) expressions to define documents, content, and metadata like title and author.

* **Content**: This allows you to use only a portion of a document as the body content (much like the body tag of an HTML document). Multiple nodes matching this XPath expression will be combined.
* **Title**: This extracts the text only (no tags) from any matching nodes to be used as title metadata.
* **Author**: This extracts the text only (no tags) from any matching nodes to be used as author metadata.
* **Documents**: This allows you to extract multiple documents from an XML document (such as posts in an RSS feed, though usually selecting the RSS *Input Format* will do that automatically). When this is used in combination with the options below, the other XPath expressions will be relative to each sub-document (not to the original document root node).
* **Group by**: When used in conjunction with a *Documents* option, this allows you to group multiple documents together that share the same XPath value. For instance, if you there are multiple &lt;speech&gt; documents, you can group all of the documents together based on the value of the speaker (so there would be one document per speaker with all of the speeches grouped together). This option is ignored if *Documents* isn't specified.

Both *Title* and *Author* XPath expressions can result in multiple values per document (some Voyant tools treat these separately and some combine them, depending on context). You of course have more control as needed:

* **`//title`**: keep the text from every `title` tag as distinct values
* **`(//title)[1]`**: keep only the text from the first `title` tag
* **`//title|//h1`** keep the text from every `title` and `h1` tag as distinct values
* **`//div[@type='chapter']/head`** keep the text from every `head` tag that's a child of a `div` tag whose type attribute is equal to `chapter`
* **`string-join(//author, '; ')`** combine all the text content from `author` tags into one value separated by `; `

This isn't the place to [learn XPath syntax](http://www.w3schools.com/xsl/xpath_syntax.asp), but it's worth mentioning a few things about [namespaces](http://www.w3schools.com/xml/xml_namespaces.asp). In most cases, you should be able to specify an XPath without any namespaces because Voyant will use the same default namespace as the document. You *can* use namespaces if you need to select elements in a given namespace. You can also create an XPath expression that only considers the local name of the element instead of the qualified name.

* **`//creator`**: select the `creator` element using the default namespace
* **`//dc:creator`**: select the `creator` element only when it is in the `dc` namespace
* **`//*[local-name()='creator']`**: select any tag whose local name is `creator` regardless of namespace

### Tokenization

Tokenization (in this context) is the process of identifying words, or sequences of Unicode letter characters that should be considered as a unit. In most cases Voyant will do a decent job of tokenization, even with some languages where there's not always an indication of word boundaries (like Chinese). There are two choices:

* **Automatic (highly recommended)**: this works adequately for most languages
* **Simple Word Boundaries**: use this if you have segmented the text yourself (by adding spaces between words)

## Next Steps

* [embedding a corpus](#!/guide/embedding)
* [explore the tools](#!/guide/tools)
* read [about Voyant Tools](#!/guide/about)