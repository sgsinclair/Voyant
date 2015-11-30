# Creating a Corpus

## Sources

_To be completed_

### Text Box

_To be completed_

### Upload

_To be completed_

### Open

_To be completed_

## Options

_To be completed_

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

### Table

_To be completed_

### Tokenization

_To be completed_