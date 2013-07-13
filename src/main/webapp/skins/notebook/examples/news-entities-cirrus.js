[{
	type: 'text',
	content: '<h1 style="text-align: center; margin-top: 0;">Cirrus Visualization of Named Entities in the News</h1>'+
		'<p>Named entities are elements of text such as people, locations, and organizations. '+
		'We would like to visualize those named entities from a current online news media source like the CBC News (cbc.ca/news). '+
		'We can begin by loading the text from the CBC\'s RSS feed (we use the RSS view to help us strip out extraneous content from the regular web page). '+
		'We create a new corpus with the URL and specify the input format – we can then show a very brief summary of the corpus.</p>'
		//+"<p>We can see that CBC newsfeed contains 15 entries but that given the total number of words, each one must be fairly short.</p>"
},{
	type: 'code',
	content: 'var news = new Corpus("http://rss.cbc.ca/lineup/topstories.xml", {'+"\n\t"
		+'inputFormat: "RSS2", // specify format'+"\n\t"+'splitDocuments: true // treat each feed as separate document'+"\n});\nnews.show(); // display essentials"
		//+'show("Each feed contains about ", news.getTotalWordsCount()/news.getDocumentsCount(), " words.");'
},{
	type: 'code',
	content: ''
}
/*,{
	type: 'text',
	content: 'We can now extract the named entities from the entire corpus (which in this case consists of a single document). '
		+'This function returns a data structure that is compatible with the Cirrus word cloud visualization, so we can just embed a new object with the result.'
},{
	type: 'code',
	content: "var entities = corpus.getEntities();\nembed(\"Cirrus\", entities);"
}*/]