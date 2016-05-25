# Knots

Knots is a creative visualization that represents terms in a single document as a series of twisted lines. Each occurrence of a term is represented by a bend in the line, so the more twisted a line, the more a term repeats and straight stretches represent no occurrences.

By default Knots represents the most common terms in the first document of a corpus.

<iframe src="../tool/Knots/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 400px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">Knots with the Works of Jane Austen. You can also <a href="../?view=Knots" target="_blank">use Knots with your own corpus</a>.</div>

## Adding Terms

Terms can be added though the [Search](#!/guide/search) box (type a term and hit enter). If a term doesn't appear in the document.

## Removing & Hiding Terms

You can click on the terms at the top (the legend) to select terms to hide or remove.

## Selecting a Document

Currently Knots can only represent terms in a single document. You can select a document from the _Documents_ button in the bottom toolbar.

## Options

There are three sliders that help fine-tune the visualization. The sliders remain visible so that you can play with the settings (click elsewhere to dismiss the options).

* **speed**: how fast the knots are composed, from a half-second delay per step (lowest value) to no delay per step (highest value)
* **start angle**: each line will originate from this angle (0&deg; is to the right, 90&deg; toward the bottom, etc. up to 360&deg;)
* **turn angle**: the angle to turn for each occurrence encountered, from 0&deg; to 90&deg;

You can also select the [stopwords](#!/guide/stopwords) (words to ignore) from the top options menu.

## See Also

- [Getting Started](#!/guide/start)
- [Stopwords](#!/guide/stopwords)
- [Default Skin](#!/guide/skins-section-default-skin)
- [List of Tools](#!/guide/tools)