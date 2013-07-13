[{
	type: 'text',
	content: '<h1 style="text-align: center">"First Words"</h1>'+
		'<p>We can start by loading the Wikipedia page and assigning it to the variable <code>corpus</code> (lowercase here). '+
		'We create a new corpus using the <a href="./?skin=notebook&example=corpus">new Corpus()<a> syntax and providing a URL as an argument. '+
		'Since this is a Wikipedia page that contains other content, we want to focus on the main article – we\'ll very simple pattern matchers (that makes some assumptions about the actual content). '+
		'Finally, we\'ll use the  <a href="./?skin=notebook&example=corpus">show()<a> function of the corpus to display a simple and short summary.</p>'		
},
{
	type: 'code',
	content: "var corpus = new Corpus(\"http://en.wikipedia.org/wiki/Thomas_A._Watson\", {\n\tinputRemoveUntilAfter: \"From Wikipedia, the free encyclopedia\",\n\tinputRemoveFrom: \"Footnotes\"\n});\ncorpus.show()"
},
{
	type: 'text',
	content: 'Cool, so now we have a (tiny) corpus. '+
		'But we know there\'s only one document of interest and we can use <code>getDocument(0)</code> on the <code>corpus</code> variable to retrieve focus on it in particular.  '
},
{
	type: 'code',
	content: "var document = corpus.getSize().show()"
}]