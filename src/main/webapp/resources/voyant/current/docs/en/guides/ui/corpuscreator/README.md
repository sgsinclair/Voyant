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

## Input Format

Most document formats are fairly easy to detect automatically, Voyant does a decent job of extracting text from HTML, MS Word, MS Excel, ODT, Pages (Apple), PDF, plain text, RTF, XML, and others. You can also provide archives (.zip, .tar, .tgz, etc.) containing documents in those formats. If you want to specific a format (because auto-detect isn't working), you can select from the following:

* **Atom Syndication Format ([Atom](https://en.wikipedia.org/wiki/Atom_(standard)))**: An XML-based format often used by news media, blogs, etc.
* **Dynamic Table of Contexts (DToC)**: A specialized XML-based format used by the [Dynamic Table of Contexts project](http://cwrc.ca/DToC_Documentation/)
* **Really Simple Syndication ([RSS](https://en.wikipedia.org/wiki/RSS))**: An XML-based format often used by news media, blogs, etc. Note that this is for RSS Version 2.0+, not RSS 1.0.
* **Text Encoding Initiative ([TEI](http://www.tei-c.org/))**: An XML-based format (essentially uses `//text` for content and `//teiHeader//title` and `//teiHeader//author` for metadata)
* **TEI Corpus**: As above, except that produces multiple documents from `//TEI` tags

## Titles

It's possible to provide a title and subtitle for your corpus. These values aren't typically used in the
[default skin](#!/guide/skins-section-default-skin) but are useful elsewhere, such as in the [Dynamic Table of Contexts skin](#!/guide/skins-section-dynamic-table-of-contexts-skin).

## Documents Order

You can select an initial sort order for the documents. The default behaviour depends somewhat on the input format and other factors but is typically related to the alphabetic order of files or titles. You can also force the use of titles for sorting, or author or publication date metadata (when available).

## Text

Voyant provides functionality for ignoring parts of documents, for instance to exclude a license statement from the text to be analyzed. The values specified are regular expressions (so care should be taken when using characters other than letters, since they may have special meaning).

- omit until: ignore everything until the start of this regular expression
- omit until after: ignore everything until the end of this regular expression
- omit from: ignore everything from the start of this regular expression onwards
- omit from after: ignore everything from the end of this regular expression onwards

Here's a simple example of a document:

	This is the license preceding the actual document.
	The Document Title
	The very interesting document text.
	The license following the actual document.

In this simple case we can either use one of two combinations of values:

- omit until: `The Document Title`
- omit from: `The license`

Or:

- omit until after: `the actual document.`
- omit from after: `document text.`

## XML

Voyant provides powerful functionality for creating a corpus from XML documents, in particular by using [XPath](https://en.m.wikipedia.org/wiki/XPath) expressions to define documents, content, and metadata like title and author.

* **Content**: This allows you to use only a portion of a document as the body content (much like the body tag of an HTML document). Multiple nodes matching this XPath expression will be combined.
* **Title**: This extracts the text only (no tags) from any matching nodes to be used as title metadata.
* **Author**: This extracts the text only (no tags) from any matching nodes to be used as author metadata.
* **Documents**: This allows you to extract multiple documents from an XML document (such as posts in an RSS feed, though usually selecting the RSS *Input Format* will do that automatically). When this is used in combination with the options below, the other XPath expressions will be relative to each sub-document (not to the original document root node).
* **Group by**: When used in conjunction with a *Documents* option, this allows you to group multiple documents together that share the same XPath value. For instance, if you there are multiple &lt;speech&gt; documents, you can group all of the documents together based on the value of the speaker (so there would be one document per speaker with all of the speeches grouped together). This option is ignored if *Documents* isn't specified.

Additional Metadata:

* **Publication Date**: An indication of the publication date (there's no pre-defined format for this but often it's useful to have alphabetically sortable values such as a year number).
* **Publisher**: The publisher of the document.
* **Location**: The publication location of the document.
* **Keywords**: Any keywords associated with the document.
* **Collection**: An indication of the collection to which this document belongs.

Finally, there's a box where you can provide user-defined metadata. This is currently used for advanced features in Voyant and won't be generally useful. The format is to have one entry per line where the metadata name points to an XPath expression:

	xmlGenreXpath=//genre
	xmlVolumeXpath=//div/@volume

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

## HTML

New and <span style="color: red">experimental</a>!

You might want to work with only part of an HTML document, such as the main article without the rest of the navigation and other components on the page. You can now define CSS and jQuery type selectors that allow you to point to parts of an HTML document for the following:

* **Content**: This defines the text content (by default it uses the HTML body tag). Multiple elements matching this query will be combined.
* **Title**: This extracts the text only (no tags) from any matching elements to be used as title metadata.
* **Author**: This extracts the text only (no tags) from any matching elements to be used as author metadata.
* **Documents**: This allows you to extract multiple documents from an HTML document (such as individual posts in a blog). When this is used in combination with the options above, the other queries expressions will be relative to each sub-document (not to the original document root node).
* **Group by**: When used in conjunction with a *Documents* option, this allows you to group multiple documents together that share the same value. For instance, if a page has multiple article tags, you can group all of the articles together based on the value of the author (so there would be one document per author with all of the articles from each grouped together). This option is ignored if *Documents* isn't specified.

Additional Metadata:

* **Publication Date**: An indication of the publication date (there's no pre-defined format for this but often it's useful to have alphabetically sortable values such as a year number).
* **Publisher**: The publisher of the document.
* **Location**: The publication location of the document.
* **Keywords**: Any keywords associated with the document.
* **Collection**: An indication of the collection to which this document belongs.

Finally, there's a box where you can provide user-defined metadata. This is currently used for advanced features in Voyant and won't be generally useful. The format is to have one entry per line where the metadata name points to a selector:

	htmlGenreQuery=.genre
	htmlVolumeQuery=div@volume

These options currently use the [Jsoup library](https://jsoup.org/) and support its [full syntax](https://jsoup.org/cookbook/extracting-data/selector-syntax) as described below. Rather than using trial and error in creating Voyant corpora, you can first <a href="https://try.jsoup.org" target="_blank">try Jsoup</a> with your HTML document.

### Selectors:

* **tagname**: find elements by tag, e.g. `a`
* **#id**: find elements by ID, e.g. `#main`
* **.class**: find elements by class name, e.g. `.chapter`
* **[attribute]**: elements with attribute, e.g. `[role]`
* **[^attr]**: elements with an attribute name prefix, e.g. `[^data-]` finds elements with HTML5 dataset attributes
* **[attr=value]**: elements with attribute value, e.g. `[role=main]` (also quotable, like `[role='main']`)
* **[attr^=value]**: elements with attributes that start with the value, e.g. `[href^=http]`
* **[attr^=value]**: elements with attributes that start with the value, e.g. `[href*=voyant-tools]`
* **[attr^=value]**: elements with attributes that start with the value, e.g. `[href$=html]`
* **[attr~=regex]**: elements with attribute values that match the regular expression; e.g. `[href~=https?.+?(png|jpe?g)]

### Selector combinations

* **el#id**: elements with ID, e.g. `div#main`
* **el.class**: elements with class, e.g. `div.chapter`
* **el[attr]**: elements with attribute, e.g. `div[role]`
* **ancestor child**: child elements that descend from ancestor, e.g. `body p` finds p elements anywhere under a body element
* **parent > child**: child elements that descend directly from parent, e.g. `article > header > h1` finds h1 elements whose immedidiate parents are header and immediate grand-parents are article
* **siblingA + siblingB**: finds sibling B element immediately preceded by sibling A, e.g. `article > header > h1 + p` finds paragraphs that are siblings of the previous selector example
* **siblingA ~ siblingX**: finds sibling X element preceded by sibling A, e.g. `h1 ~ p` finds h1 elements that are followed by p elements
* **el, el, el**: group multiple selectors, find unique elements that match any of the selectors; e.g. `body > h1, article header h1` find h1 elements that are immediate children of the body or that are descendences of article and header elements

### Pseudo selectors
* **:lt(n)**: find elements whose zero-based sibling index (i.e. its position in the DOM tree relative to its parent) is less than n; e.g. `td:lt(3)`
* **:gt(n)**: find elements whose zero-based sibling index is greater than n; e.g. `div p:gt(2)`
* **:eq(n)**: find elements whose zero-based sibling index is equal to n; e.g. form input:eq(0)
* **:has(selector)**: find elements that contain elements matching the selector; e.g. `div:has(p)`
* **:not(selector)**: find elements that do not match the selector; e.g. `div:not(.navigation)`
* **:contains(text)**: find elements that contain the given text (in any descendant). The search is case-insensitive; e.g. `p:contains(text analysis)`
* **:containsOwn(text)**: find elements that directly contain the given text `p:contains(text analysis)`
* **:matches(regex)**: find elements whose text (in any descendant) matches the specified regular expression; e.g. `div:matches(19\d\d)`
* **:matchesOwn(regex)**: find elements whose own text matches the specified regular expression e.g. `div:matches(19\d\d)`

### Attribute Values

Selectors (as defined by the W3C and as implemented by Jsoup) are designed to select DOM elements or nodes. In many cases this is fine because simply want to use the text value of the element:

	// for the "Title" field we could simply put "title" to select the title tag
	<title>Title</title>

The problem is that in some cases we want the value of an attribute instead of the text content of an element. This isn't possible with selectors, but Voyant adds additional functionality by searching for an @ symbol and attribute name at the end of a selector, and if it's there, selecting the value

	// for "Author" we could put "meta[name='author']@content"
	<meta name="author" content="Jane Austen">
	
Note that in the case of grouped selectors, the same attribute applies to each group:

	// only the value of author attribute is used: ".comment[author], header p[author] @author: 
	<div class="comment" author="Jane Austen"></div><header><p author="Jane Austen"></p></header>
	
The <a href="https://try.jsoup.org" target="_blank">try Jsoup</a> tool does NOT support this attribute functionality, but you can use it to ensure that you have the right elements and then add the @attributename as desired in Voyant.

## Tables

Voyant allows you to work flexibly with tabular data such as spreadsheets. At the moment the options described here only work with MS Excel files (.xsl or .xslx). Voyant can currently extract text from other tabular file formats such as OpenOffice, Pages, and comma-separated values (CSV), but in that case each file is considered as a separate document. The options below allow you to extract multiple documents from a single MS Excel file (or from several files).

The options for tables are a bit complex, but there are a lot of possibilities when working with tabular data, so it's worth it, right?

The first option is for defining how Voyant should extract text from the table (file). There are three choices:

<b>1: _from entire table_</b>: each table/file is considered one document, this is the default behaviour; only the _No Headers Row_ option below is considered

<b>2: _from cells in each row_</b>: this option assumes that each row has one or more documents, either the entire row or specific cells

<div style="max-width: 476px; margin-left: auto; margin-right: auto;">{@img fromcellsineachrow.png From Cells in Each Row}</div>

<b>3: _from entire columns_</b>: this option assumes that documents should be extracted from one or more columns

<div style="max-width: 371px; margin-left: auto; margin-right: auto;">{@img fromentirecolumns.png From Entire Columns}</div>

Whether you use _from cells in each row_ or _from entire columns_ you can also choose one or more columns for content. Columns are specified by number (even when there's a header row), and the left-most column is column 1. Content from multiple columns can be combined using the plus sign and columns can be specified separately by using commas. Here are some examples:

* 1: use column one
* 1,2: use columns one and two separately
* 1+2,3 combine columns one and two and use column three separately

When no _Content_ value is specified the behaviour depends on the _Documents_ option:

1. *from cells in each row*: each row is treated as a separate document (cells in a row are combined)
1. *from entire columns*: each column is treated as a separate document

#### Title and Author Metadata

The syntax is the same for the _Title_ and _Author_ options: column numbers separated by commas and/or combined with a plus sign (starting with the left-most column 1). These metadata options are only used when documents are extracted _from cells in each row_ and when there's only one document per row (no _Content_ value or no commas in the value of the _Content_ option). When there's more than one document per row, a title label is automatically generated (no authors are defined).

When documents are extracted _from entire columns_, the title metadata is extracted from the first row if there's a header row, otherwise a label is automatically generated (no authors are defined).

## Tokenization

Tokenization (in this context) is the process of identifying words, or sequences of Unicode letter characters that should be considered as a unit. In most cases Voyant will do a decent job of tokenization, even with some languages where there's not always an indication of word boundaries (like Chinese). There are three choices:

* **Automatic (highly recommended)**: this works adequately for most languages
* **Simple Word Boundaries**: use this if you have segmented the text yourself (by adding spaces between words), all non-letter characters (like punctuation) will be discarded from word tokens
* **Whitespace Only**: use this if you want tokens to be created based solely on separation of whitespace (note that this may help for things like Twitter where you want @users and #hashes and urls.com, but it also means that all punctuation will remain attached to tokens)

The following table summarizes tokenization for the string <span class="keyword">What's voyant-tools.org?</span>:

<table class="grid rows">
<thead>
<tr>
<th> Tokenization </th>
<th> Count </th>
<th> Tokens </th>
<th> Notes </th>
</tr>
</thead>
<tbody>
<tr>
<td> Automatic </td>
<td style="text-align: center"> 3 </td>
<td> <span class="keyword">what's</span>, <span class="keyword">voyant</span>, <span class="keyword">tools.org</span> </td>
<td> the hyphen is split but the tools.org is considered a URL token; tokens are lowercase </td>
</tr>
<tr>
<td> Word Boundaries </td>
<td style="text-align: center"> 5 </td>
<td> <span class="keyword">what</span>, <span class="keyword">s</span>, <span class="keyword">voyant</span>, <span class="keyword">tools</span>, <span class="keyword">org</span> </td>
<td> any non-word character is a delimiter, tokens are lowercase </td>
</tr>
<tr>
<td> Whitespace Only </td>
<td style="text-align: center"> 2 </td>
<td> <span class="keyword">What's</span>, <span class="keyword">voyant-tools.org?</span> </td>
<td> punctuation is kept in tokens and case is unchanged </td>
</tr>
</tbody>
</table>

## Access Management

<div style="max-width: 400px; float: right; padding: 1em;">{@img access-management.png Access Management}</div>


Voyant provides some basic access management functions that are intended to help control who can access a given corpus. It's worth mentioning that each corpus is given a unique 32-character code when it's created, which amounts to 2<sup>128</sup> or 340,282,366,920,938,463,463,374,607,431,768,211,456 possibilities. In other words, it's extremely unlikely that anyone would stumble upon your corpus by accident or by luck. That doesn't mean that your corpus is entirely safe from prying eyes, it's possible for a URL or for parameters to be detected during usual web communication, for instance.

The access codes that can be specified in Voyant are an additional level of protection. These shouldn't be considered as passwords, not least because Voyant is not normally hosted on a secure server (with https traffic), so any access codes are transmitted in the clear. Still, under normal circumstances, the access codes can help further restrict access, if needed.

If privacy and security are significant concerns for whatever reason (confidentiality of data, copyright, etc.), it's *strongly* recommended that you use a local, [standalone version of Voyant](https://github.com/sgsinclair/VoyantServer#voyant-server) – it can even be used while offline (while not connected to the internet).

Access management must be specified during corpus creation, it can't be specified once a corpus is already created (that's because it would be much more difficult to determine who created the corpus and therefore who can manage it).

### Admin Codes

The first option allows you to specify one or more admin(istration) codes. Admin codes give you access to the corpus as well as to the access management options (if ever you want to later modify any of the access management options). If you don't specify admin codes, the access codes (if provided) will still be in effect, but you won't be able to change them. You can specify one or more different admin codes separated by commas (any one of the codes will work).

### Access Codes

The second option allows you to specify one or more full access codes (without a valid code, access is either restricted or completely blocked – see the next option for more details). You can specify multiple codes separated by commas, which allows you to  assign and modify access independently for multiple groups and users. If no access codes are provided, access will be limited either to admin codes (if any are provided) or the corpus will be open.

### Other Access

This option determines what happens when an admin or access code is required but no valid code is provided by the user:

* **limited (non-consumptive)**: users can access analytic tools and views of the corpus but not any tool that allows text to be read or reconstituted
* **none**: no access is provided to this corpus

Although it might be tempting to select "none" for simplicity or by force of habit, the non-consumptive option is more nuanced solution and recognizes that much analytic work can be done with derivative data while protecting principles of copyright (since the text in its original form can't be recovered with non-consumptive access). These issues have been explored by [digital humanities scholars](http://papers.ssrn.com/sol3/papers.cfm?abstract_id=2102542), as well as by the courts in cases like [Authors Guild v. HathiTrust](https://en.wikipedia.org/wiki/Authors_Guild,_Inc._v._HathiTrust).

We believe that the non-consumptive option is on firm ethical and legal footing, even for copyright text, but responsibilty lies with the creator of the corpus. It's also worth reiterating that any access management provided by Voyant is only one line of defense, so unintended access may occur and the hosted version should not be used when confidentiality is important.

## Next Steps

* [modifying a corpus](#!/guide/modifyingcorpus)
* [explore the tools](#!/guide/tools)
* read [about Voyant Tools](#!/guide/about)