# Reader

The Reader tool provides a way of reading documents in the corpus, text is fetched as needed.

## Overview

The Reader tool is composed of two visual components: the Text Reader and the Prospect Viewer.

### Text Reader

This is where text is displayed for reading. The formatting will be minimal, limited especially to line breaks (depending on the format of the source document). With the text reader you can:

* scroll down within the text reader to fetch more content
* hover over a word to show its frequency in the document
* click on a word to search for it in the Reader (and other tools if applicable)

### Prospect Viewer

This shows an overview of the entire corpus, especially useful when there are multiple documents in a corpus. The bars represent each document in the order they appear in the corpus. The relative length of the document is represented both vertically and horizontally (in other words, the taller and wider a document is shown, the longer it is).

When there's a search term, an inner sparkline is shown overtop of the bars – this shows the relative frequency of terms (by default each document is broken into segments of 25 equal parts for the sparkline).

There's also a thin vertical blue bar that indicates the current position of the Text Reader in the corpus. You can click anywhere along the Prospect Viewer to jump to another location.

<iframe src="../tool/Reader/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 400px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">Reader with the Works of Jane Austen. You can also <a href="../?view=Reader" target="_blank">use Reader with your own corpus</a>.</div>

## Options

You can use the arrows to go forward or backward in the text. By default jumps are made in increments of about 1,000 words.

You can specify terms by typing a query into the search box and hitting enter (see [Term Searches](#!/guide/search) for more advanced searching capabilities).

## Additional Information

The Prospect Viewer is inspired by the work of Stan Ruecker (see [this book](http://www.ashgate.com/default.aspx?page=637&calcTitle=1&isbn=9781409404224) or [this video](https://youtu.be/Nd2h9U_H0n8?t=2m27s)).

## See Also

- [Getting Started](#!/guide/start)
- [Default Skin](#!/guide/skins-section-default-skin)
- [List of Tools](#!/guide/tools)