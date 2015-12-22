# Embedding Voyant Tools

Voyant is designed to function as a standalone environment ([voyant-tools.org](http://voyant-tools.org)) or as a set of more independent modules that can be embedded into remote sites (much like a YouTube clip). Technically, this is done using an [iframe](http://www.w3schools.com/tags/tag_iframe.asp) tag that creates a sandbox within your page where Voyant can do its thing (Javascript security limits the interaction that's possible between your page and Voyant).

<div style="max-width: 500px; margin-left: auto; margin-right: auto;"><iframe src="../tool/Cirrus/?useReferer=true" style="width: 100%; height: 250px; margin-left: auto; margin-right: auto;"></iframe></div>

## Exported Corpus

The Voyant export feature allows you to generate an HTML snippet to embed the current corpus and tool (or skin). Click the _Export_ icon, expand the _Export View_ section, select _an HTML snippet_ radio button, click the _Export_ button, and copy the snippet that appears in the text box. 

<div style="max-width: 350px; margin-left: auto; margin-right: auto;">{@img export.png Export}</div>

Here's an example:

	<iframe src='http://voyant-tools.org/tool/Cirrus/?corpus=austen'
		style='width: 400%; height: 400px'></iframe>

The style attribute can be modified as needed for formatting on the containing page. Additional parameters can also be added (for [stopword](#!/guide/stopwords) lists, for instance).

## Current Page

It's also possible to embed Voyant into the current page and to use the contents of the current page as a corpus. For instance, here is the Cirrus Tool for this page:

	<iframe src="http://voyant-tools.org/tool/Cirrus/?useReferer=true"
		style="width: 300px; height: 300px;"></iframe>

If the page has already been visited, Voyant will have a cached version of the corpus that it will use, unless the page has been modified, in which case it will fetch the contents again.

## External Resource

You can also embed a specific page using the input parameter (or a variant format from a given page, such as generated XML or PDF):

	<iframe src="http://voyant-tools.org/tool/Cirrus/?input=http://digitalhumanities.org/dhq/vol/3/3/000067/000067.xml"
		style="width: 300px; height: 300px;"></iframe>
		
Here again, cached contents will be reused if possible, and Voyant will check the URL for modifications if needed. If ever Voyant doesn't updated its contents automatically, you can add a string query like `?v1` or `&v1` to the source URL to force an update. Note that parameters in the source URL should be escaped as needed so as not to interfere with the parameters to Voyant:

	http://voyant-tools.org/tool/Cirrus/?inputFormat=XML&input=http://digitalhumanities.org/dhq/?version%3D1

In this case `inputFormat=XML` is a parameter of Voyant whereas `version%3D1` (escaped form of `version=1`) is a parameter of the source URL.

## Additional Information

It's important to know that for security reasons some content management systems don't allow all authors to use the `<iframe>` tag. For WordPress, installing the [iframe plugin](https://wordpress.org/plugins/iframe/) can help.

We assume that screen real-estate is at a premium in embedded instances of Voyant, so the default embedded URL syntax removes the top header that normally appears:

<table><tr><td><div style="max-width: 350px; text-align: center"><a href="../tool/Cirrus/?corpus=austen" target="_blank">voyant-tools.org/tool/Cirrus/?corpus=austen</a><br/>{@img tool.png Tool}</div></td><td><div style="max-width: 350px; text-align: center;"><a href="../?corpus=austen&view=Cirrus">voyant-tools.org/?corpus=austen&view=Cirrus</a><br/>{@img view.png View}</div></td></tr></table>

## Next Steps

* [skins](#!/guide/skins)
* [explore the tools](#!/guide/tools)
* read [about Voyant Tools](#!/guide/about)