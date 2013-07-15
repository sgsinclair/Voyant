[
		{
			"type" : "code",
			"content" : "var corpus = new Corpus(\"http://dh2013.unl.edu/abstracts/files/downloads/DH2013_xml.zip\", {\n    inputFormat: \"TEI\", // specify format\n});\ncorpus.show(); // show essential information"
		},
		{
			"type" : "code",
			"content" : "corpus.embed(); // embed a more detailed widget (the default CorpusGrid)"
		},
		{
			"type" : "code",
			"content" : "var terms = corpus.getTerms();\nterms.show(); // show essential information"
		},
		{
			"type" : "code",
			"content" : "terms.embed(); // embed a more detailed widget (the default Cirrus)"
		} ]