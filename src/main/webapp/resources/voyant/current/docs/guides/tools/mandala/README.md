# Mandala

Mandala is a conceptual visualization that shows the relationships between terms and documents. Each search term (or magnet) pulls documents toward it based on the term's relative frequency in the corpus.

Hover over a magnet to highlight that search term and documents that contain the search term. Likewise, hover over documents to see which search terms can be found in that document.

You can click on a magnet to edit its search term. Full search functionality is available, though multiple terms for one magnet are combined into one boolean (a document must contain at least one of the terms).

<iframe src="../tool/Mandala/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 550px; height: 600px;"></iframe>
<div style="width: 550px; text-align: center; margin-bottom: 1em;">Mandala with the Works of Jane Austen. <span style="white-space: nowrap;">You can also <a href="../?view=Mandala" target="_blank">use Mandala with your own corpus</a>.</span></div>

## Options

You can add additional magnets (or search terms), as well as clear all existing magnets.

You can determine whether or not labels should be shown for magnets (terms) and documents (when not hovering over a magnet or document).

Clicking on the [Options](#!/guide/options) icon allows you to define a set of stopwords to exclude – see the [stopwords guide](#!/guide/stopwords) for more information.

## Additional Information

The Mandala is an adaptation for Voyant Tools of the [Mandala Browser](http://mandala.humviz.org/), a project by Stéfan Sinclair, Stan Ruecker Sandra Gabriele and Teresa Dobson, based on a concept by Oksana Cheypesh.

## See Also

- [Getting Started](#!/guide/start)
- [Stopwords](#!/guide/stopwords)
- [Default Skin](#!/guide/skins-section-default-skin)
- [List of Tools](#!/guide/tools)