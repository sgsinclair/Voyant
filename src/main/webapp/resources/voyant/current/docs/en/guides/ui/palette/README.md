# Palette

The colour palette editor is available from several tools (like [Bubblelines](#!/guide/bubblelines), [Cirrus](#!/guide/cirrus), [Knots](#!/guide/knots), [Tends](#!/guide/trends)) and allows you to customize the global palette of colours used. The meaning of colours depends on each tool, but generally there's a set of colours that is used in order and if additional colours are needed, Voyant starts over again with the first colour in the set. For example, compare the two Bubblelines below, the first using the default palette (which has more colours available then terms to show) and the second using a palette with only two colours defined (so they are repeated for some terms):

<table style="width: 90%; margin-left: auto; margin-right: auto;"><tr><td style="text-align: center;">Default Palette<br /><iframe src="../tool/Bubblelines/?corpus=austen" style="width: 100%; height: 200px; margin-left: auto; margin-right: auto;"></iframe></td><td style="text-align: center;">Custom Palette<br /><iframe src="../tool/Bubblelines/?corpus=austen&palette=[[0,0,255],[51,197,51]]" style="width: 100%; height: 200px; margin-left: auto; margin-right: auto;"></iframe></td></tr></table>

For tools that support the colour palette (usually by clicking on the tool's options icon), you can click on the edit palette button.

<table width="100%"><tr>
<td align="center"><div style="max-width: 200px">{@img options.png Options}</div></td>
<td align="center"><div style="max-width: 400px">{@img edit.png Edit}</div></td>
</tr></table>

<div style="float: right; margin-left: 1em; margin-bottom: 1em; max-width: 400px;">{@img palette.png Palette}</div> The actual palette editor will open with the currently selected (or default) colour palette. You can perform the following operations:

* select a colour using the gradients on the right or type in a [hexidecimal colour code](https://en.wikipedia.org/wiki/Web_colors#Hex_triplet) and then click the **add** button
* click on one of the existing colours on the left and then click the **remove** button
* click on the **clear** button to remove all colours (you can cancel the editing if you change your mind)

Once you're done editing the palette, click the **Save New Palette** button (and then confirm or cancel the options change).

## Next Steps

* [grids](#!/guide/grids)
* [explore the tools](#!/guide/tools)
* read [about Voyant Tools](#!/guide/about)