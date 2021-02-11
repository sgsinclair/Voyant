

// *** Documentation extracted from: ..\..\..\..\voyantjs\src\categories.js ***

/**
* Class for working with categories and features.
 * Categories are groupings of terms.
 * A term can be present in multiple categories. Category ranking is used to determine which feature value to prioritize.
 * Features are arbitrary properties (font, color) that are associated with each category.
 * @class Spyral.Categories
 */


/**
* Construct a new Categories class
	  * @method constructor
 */


/**
* Get the categories
	 * @returns {Object}
	  * @method getCategories
 */


/**
* Get category names as an array.
	 * 
	 * @returns {Array} of category names
	  * @method getCategoryNames
 */


/**
* Get the terms for a category
	 * @param {string} name 
	 * @returns {Array}
	  * @method getCategoryTerms
 */


/**
* Add a new category
	 * @param {string} name 
	  * @method addCategory
 */


/**
* Rename a category
	 * @param {string} oldName 
	 * @param {string} newName 
	  * @method renameCategory
 */


/**
* Remove a category
	 * @param {string} name 
	  * @method removeCategory
 */


/**
* Gets the ranking for a category
	 * @param {string} name 
	 * @returns {number}
	  * @method getCategoryRanking
 */


/**
* Sets the ranking for a category
	 * @param {string} name 
	 * @param {number} ranking 
	  * @method setCategoryRanking
 */


/**
* Add a term to a category
	 * @param {string} category 
	 * @param {string} term 
	  * @method addTerm
 */


/**
* Add multiple terms to a category
	 * @param {string} category 
	 * @param {Array} terms 
	  * @method addTerms
 */


/**
* Remove a term from a category
	 * @param {string} category 
	 * @param {string} term 
	  * @method removeTerm
 */


/**
* Remove multiple terms from a category
	 * @param {string} category 
	 * @param {Array} terms 
	  * @method removeTerms
 */


/**
* Get the category that a term belongs to, taking ranking into account
	 * @param {string} term 
	 * @returns {string}
	  * @method getCategoryForTerm
 */


/**
* Get all the categories a term belongs to
	 * @param {string} term 
	 * @returns {Array}
	  * @method getCategoriesForTerm
 */


/**
* Get the feature for a term
	 * @param {string} feature 
	 * @param {string} term 
	 * @returns {*}
	  * @method getFeatureForTerm
 */


/**
* Get the features
	 * @returns {Object}
	  * @method getFeatures
 */


/**
* Add a feature
	 * @param {string} name 
	 * @param {*} defaultValue 
	  * @method addFeature
 */


/**
* Remove a feature
	 * @param {string} name 
	  * @method removeFeature
 */


/**
* Set the feature for a category
	 * @param {string} categoryName 
	 * @param {string} featureName 
	 * @param {*} featureValue 
	  * @method setCategoryFeature
 */


/**
* Get the feature for a category
	 * @param {string} categoryName 
	 * @param {string} featureName 
	 * @returns {*}
	  * @method getCategoryFeature
 */


/**
* Get a copy of the category and feature data
	 * @returns {Object}
	  * @method getCategoryExportData
 */


/**
* Save the categories (if we're in a recognized environment).
	 * @param {Object} config for the network call (specifying if needed the location of Trombone, etc., see {@link Spyral.Load#trombone}
	 * @returns {Promise} this returns a promise which eventually resolves to a string that is the ID reference for the stored categories
	  * @method save
 */


/**
* Load the categories (if we're in a recognized environment).
	 * 
	 * In its simplest form this can be used with a single string ID to load:
	 * 	new Spyral.Categories().load("categories.en.txt")
	 * 
	 * Which is equivalent to:
	 * 	new Spyral.Categories().load({retrieveResourceId: "categories.en.txt"});
	 * 
	 * @param {Object|String} config an object specifying the parameters (see above)
	 * @param {Object} api an object specifying any parameters for the trombone call
	 * @returns {Promise} this first returns a promise and when the promise is resolved it returns this categories object (with the loaded data included)
	  * @method load
 */




// *** Documentation extracted from: ..\..\..\..\voyantjs\src\chart.js ***

/**
* Class representing a Chart.
 * @class Spyral.Chart
 */


/**
* Construct a new Chart class
	 * @constructor
	 * @param {HTMLElement} target 
	 * @param {Array} data 
	  * @method constructor
 */


/**
* Create a new chart.
	 * See [Highcharts API](https://api.highcharts.com/highcharts/) for full set of config options.
	 * @param {(String|HTMLElement)} target 
	 * @param {Object} config 
	 * @returns {Highcharts.Chart}
	 
	 * @param {(string|object)} config.title
	 * @param {(string|object)} config.subtitle
	 * @param {Object} config.credits
	 * @param {Object} config.xAxis
	 * @param {Object} config.yAxis
	 * @param {Object} config.chart
	 * @param {Array} config.series
	 * @param {Object} config.plotOptions
	  * @method create
 */


/**
* Create a new chart.
	 * See [Highcharts API](https://api.highcharts.com/highcharts/) for full set of config options.
	 * @param {(String|HTMLElement)} target 
	 * @param {Object} config 
	 * @returns {Highcharts.Chart}
	 
	 * @param {(string|object)} config.title
	 * @param {(string|object)} config.subtitle
	 * @param {Object} config.credits
	 * @param {Object} config.xAxis
	 * @param {Object} config.yAxis
	 * @param {Object} config.chart
	 * @param {Array} config.series
	 * @param {Object} config.plotOptions
	 * @static
 * @method create
 */


/**
* Sets the default chart type
	 * @param {Object} config The chart config object
	 * @param {string} type The type of chart
	 * @static
 * @method setDefaultChartType
 */


/**
* Add the provided data to the config as a series
	 * @param {Object} config 
	 * @param {Array} data 
	 * @static
 * @method setSeriesData
 */


/**
* Create a bar chart
	 * @param {Object} [config]
	 * @returns {Highcharts.Chart}
	  * @method bar
 */


/**
* Create a bar chart
	 * @param {HTMLElement} target 
	 * @param {Object} config 
	 * @returns {Highcharts.Chart}
	 * @static
 * @method bar
 */


/**
* Create a line chart
	 * @param {Object} [config]
	 * @returns {Highcharts.Chart}
	  * @method line
 */


/**
* Create a line chart
	 * @param {HTMLElement} target 
	 * @param {Object} config 
	 * @returns {Highcharts.Chart}
	 * @static
 * @method line
 */


/**
* Create a scatter plot
	 * @param {Object} [config]
	 * @returns {Highcharts.Chart}
	  * @method scatter
 */


/**
* Create a scatter plot
	 * @param {HTMLElement} target 
	 * @param {Object} config 
	 * @returns {Highcharts.Chart}
	 * @static
 * @method scatter
 */


/**
* Create a network graph
	 * @param {Object} [config]
	 * @returns {Highcharts.Chart}
	  * @method networkgraph
 */


/**
* Create a network graph
	 * @param {HTMLElement} target 
	 * @param {Object} config 
	 * @returns {Highcharts.Chart}
	 * @static
 * @method networkgraph
 */




// *** Documentation extracted from: ..\..\..\..\voyantjs\src\corpus.js ***

/**
* The Corpus class in Spyral. Here's a simple example:
 * 
 * 	loadCorpus("Hello World!").summary();
 * 
 * This loads a corpus and returns an asynchronous `Promise`, but all of the methods
 * of Corpus are appended to the Promise, so {@link #summary} will be called
 * once the Corpus promise is fulfilled. It's equivalent to the following:
 *
 * 	loadCorpus("Hello World!").then(corpus -> corpus.summary());
 *
 * Have a look at the {@link #input} configuration for more examples.
 * 
 * There is a lot of flexibility in how corpora are created, here's a summary of the parameters:
 * 
 * - **sources**: {@link #corpus}, {@link #input}
 * - **formats**:
 * 	- **Text**: {@link #inputRemoveFrom}, {@link #inputRemoveFromAfter}, {@link #inputRemoveUntil}, {@link #inputRemoveUntilAfter}
 * 	- **XML**: {@link #xmlAuthorXpath}, {@link #xmlCollectionXpath}, {@link #xmlContentXpath}, {@link #xmlExtraMetadataXpath}, {@link #xmlKeywordXpath}, {@link #xmlPubPlaceXpath}, {@link #xmlPublisherXpath}, {@link #xmlTitleXpath}
 * 	- **Tables**: {@link #tableAuthor}, {@link #tableContent}, {@link #tableDocuments}, {@link #tableNoHeadersRow}, {@link #tableTitle}
 * - **other**: {@link #inputFormat}, {@link #subTitle}, {@link #title}, {@link #tokenization}
 * @class Spyral.Corpus
 */


/**
* @cfg {String} corpus The ID of a previously created corpus.
 * 
 * A corpus ID can be used to try to retrieve a corpus that has been previously created.
 * Typically the corpus ID is used as a first string argument, with an optional second
 * argument for other parameters (especially those to recreate the corpus if needed).
 * 
 * 	loadCorpus("goldbug");
 *
 * 	loadCorpus("goldbug", {
 * 		// if corpus ID "goldbug" isn't found, use the input
 * 		input: "https://gist.githubusercontent.com/sgsinclair/84c9da05e9e142af30779cc91440e8c1/raw/goldbug.txt",
 * 		inputRemoveUntil: 'THE GOLD-BUG',
 * 		inputRemoveFrom: 'FOUR BEASTS IN ONE'
 * 	});
 */


/**
* @cfg {String/String[]} input Input sources for the corpus.
 * 
 * The input sources can be either normal text or URLs (starting with `http`).
 * 
 * Typically input sources are specified as a string or an array in the first argument, with an optional second argument for other parameters.
 * 
 * 		loadCorpus("Hello Voyant!"); // one document with this string
 * 
 * 		loadCorpus(["Hello Voyant!", "How are you?"]); // two documents with these strings
 * 
 * 		loadCorpus("http://hermeneuti.ca/"); // one document from URL
 * 
 * 		loadCorpus(["http://hermeneuti.ca/", "https://en.wikipedia.org/wiki/Voyant_Tools"]); // two documents from URLs
 * 
 * 		loadCorpus("Hello Voyant!", "http://hermeneuti.ca/"]); // two documents, one from string and one from URL
 * 
 * 		loadCorpus("https://gist.githubusercontent.com/sgsinclair/84c9da05e9e142af30779cc91440e8c1/raw/goldbug.txt", {
 * 			inputRemoveUntil: 'THE GOLD-BUG',
 * 			inputRemoveFrom: 'FOUR BEASTS IN ONE'
 * 		});
 * 
 * 		// use a corpus ID but also specify an input source if the corpus can't be found
 * 		loadCorpus("goldbug", {
 * 			input: "https://gist.githubusercontent.com/sgsinclair/84c9da05e9e142af30779cc91440e8c1/raw/goldbug.txt",
 * 			inputRemoveUntil: 'THE GOLD-BUG',
 * 			inputRemoveFrom: 'FOUR BEASTS IN ONE'
 * 		});
 */


/**
* @cfg {String} inputFormat The input format of the corpus (the default is to auto-detect).
 * 
 * The auto-detect format is usually reliable and inputFormat should only be used if the default
 * behaviour isn't desired. Most of the relevant values are used for XML documents:
 * 
 * - **DTOC**: Dynamic Table of Contexts XML format
 * - **HTML**: Hypertext Markup Language
 * - **RSS**: Really Simple Syndication XML format
 * - **TEI**: Text Encoding Initiative XML format
 * - **TEICORPUS**: Text Encoding Initiative Corpus XML format
 * - **TEXT**: plain text
 * - **XML**: treat the document as XML (sometimes overridding auto-detect of XML vocabularies like RSS and TEI)
 * 
 * Other formats include **PDF**, **MSWORD**, **XLSX**, **RTF**, **ODT**, and **ZIP** (but again, these rarely need to be specified).
 */


/**
* @cfg {String} tableDocuments Determine what is a document in a table (the entire table, by row, by column); only used for table-based documents.
 * 
 * Possible values are:
 * 
 * - **undefined or blank** (default): the entire table is one document
 * - **rows**: each row of the table is a separate document
 * - **columns**: each column of the table is a separate document
 * 
 * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tables).
 */


/**
* @cfg {String} tableContent Determine how to extract body content from the table; only used for table-based documents.
 * 
 * Columns are referred to by numbers, the first is column 1 (not 0).
 * You can specify separate columns by using a comma or you can combined the contents of columns/cells by using a plus sign.
 * 
 * Some examples:
 * 
 * - **1**: use column 1
 * - **1,2**: use columns 1 and 2 separately
 * - **1+2,3**: combine columns 1 and two and use column 3 separately
 * 
 * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tables).
 */


/**
* @cfg {String} tableAuthor Determine how to extract the author from each document; only used for table-based documents.
 * 
 * Columns are referred to by numbers, the first is column 1 (not 0).
 * You can specify separate columns by using a comma or you can combined the contents of columns/cells by using a plus sign.
 * 
 * Some examples:
 * 
 * - **1**: use column 1
 * - **1,2**: use columns 1 and 2 separately
 * - **1+2,3**: combine columns 1 and two and use column 3 separately
 * 
 * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tables).
 */


/**
* @cfg {String} tableTitle Determine how to extract the title from each document; only used for table-based documents.
 * 
 * Columns are referred to by numbers, the first is column 1 (not 0).
 * You can specify separate columns by using a comma or you can combined the contents of columns/cells by using a plus sign.
 * 
 * Some examples:
 * 
 * - **1**: use column 1
 * - **1,2**: use columns 1 and 2 separately
 * - **1+2,3**: combine columns 1 and two and use column 3 separately
 * 
 * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tables).
 */


/**
* @cfg {String} tableNoHeadersRow Determine if the table has a first row of headers; only used for table-based documents.
 * 
 * Provide a value of "true" if there is no header row, otherwise leave it blank or undefined (default).
 * 
 * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tables).
 */


/**
* @cfg {String} tokenization The tokenization strategy to use
 * 
 * This should usually be undefined, unless specific behaviour is required. These are the valid values:
 * 
 * - **undefined or blank**: use the default tokenization (which uses Unicode rules for word segmentation)
 * - **wordBoundaries**: use any Unicode character word boundaries for tokenization
 * - **whitespace**: tokenize by whitespace only (punctuation and other characters will be kept with words)
 * 
 * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tokenization).
 */


/**
* @cfg {String} xmlContentXpath The XPath expression that defines the location of document content (the body); only used for XML-based documents.
 * 
 * 		loadCorpus("<doc><head>Hello world!</head><body>This is Voyant!</body></doc>", {
 * 			 xmlContentXpath: "//body"
 * 		}); // document would be: "This is Voyant!"
 * 
 * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
 */


/**
* @cfg {String} xmlTitleXpath The XPath expression that defines the location of each document's title; only used for XML-based documents.
 * 
 * 		loadCorpus("<doc><title>Hello world!</title><body>This is Voyant!</body></doc>", {
 * 			 xmlTitleXpath: "//title"
 * 		}); // title would be: "Hello world!"
 * 
 * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
 */


/**
* @cfg {String} xmlAuthorXpath The XPath expression that defines the location of each document's author; only used for XML-based documents.
 * 
 * 		loadCorpus("<doc><author>Stéfan Sinclair</author><body>This is Voyant!</body></doc>", {
 * 			 xmlAuthorXpath: "//author"
 * 		}); // author would be: "Stéfan Sinclair"
 * 
 * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
 */


/**
* @cfg {String} xmlPubPlaceXpath The XPath expression that defines the location of each document's publication place; only used for XML-based documents.
 * 
 * 		loadCorpus("<doc><pubPlace>Montreal</pubPlace><body>This is Voyant!</body></doc>", {
 * 			 xmlPubPlaceXpath: "//pubPlace"
 * 		}); // publication place would be: "Montreal"
 * 
 * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
 */


/**
* @cfg {String} xmlPublisherXpath The XPath expression that defines the location of each document's publisher; only used for XML-based documents.
 * 
 * 		loadCorpus("<doc><publisher>The Owl</publisher><body>This is Voyant!</body></doc>", {
 * 			 xmlPublisherXpath: "//publisher"
 * 		}); // publisher would be: "The Owl"
 * 
 * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
 */


/**
* @cfg {String} xmlKeywordXpath The XPath expression that defines the location of each document's keywords; only used for XML-based documents.
 * 
 * 		loadCorpus("<doc><keyword>text analysis</keyword><body>This is Voyant!</body></doc>", {
 * 			 xmlKeywordXpath: "//keyword"
 * 		}); // publisher would be: "text analysis"
 * 
 * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
 */


/**
* @cfg {String} xmlCollectionXpath The XPath expression that defines the location of each document's collection name; only used for XML-based documents.
 * 
 * 		loadCorpus("<doc><collection>documentation</collection><body>This is Voyant!</body></doc>", {
 * 			 xmlCollectionXpath: "//collection"
 * 		}); // publisher would be: "documentation"
 * 
 * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
 */


/**
* @cfg {String} xmlGroupByXpath The XPath expression that defines the location of each document's collection name; only used for XML-based documents.
 * 
 * 		loadCorpus("<doc><sp s='Juliet'>Hello!</sp><sp s='Romeo'>Hi!</sp><sp s='Juliet'>Bye!</sp></doc>", {
 * 			 xmlDocumentsXPath: '//sp',
 *           xmlGroupByXpath: "//@s"
 * 		}); // two docs: "Hello! Bye!" (Juliet) and "Hi!" (Romeo)
 * 
 * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
 */


/**
* @cfg {String} xmlExtraMetadataXpath A value that defines the location of other metadata; only used for XML-based documents.
 * 
 * 		loadCorpus("<doc><tool>Voyant</tool><phase>1</phase><body>This is Voyant!</body></doc>", {
 * 			 xmlExtraMetadataXpath: "tool=//tool\nphase=//phase"
 * 		}); // tool would be "Voyant" and phase would be "1"
 * 
 * Note that `xmlExtraMetadataXpath` is a bit different from the other XPath expressions in that it's
 * possible to define multiple values (each on its own line) in the form of name=xpath.
 * 
 * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
 */


/**
* @cfg {String} xmlExtractorTemplate Pass the XML document through the XSL template located at the specified URL before extraction (this is ignored in XML-based documents).
 * 
 * This is an advanced parameter that allows you to define a URL of an XSL template that can
 * be called *before* text extraction (in other words, the other XML-based parameters apply
 * after this template has been processed).
 */


/**
* @cfg {String} inputRemoveUntil Omit text up until the start of the matching regular expression (this is ignored in XML-based documents).
 * 
 * 		loadCorpus("Hello world! This is Voyant!", {
 * 			 inputRemoveUntil: "This"
 * 		}); // document would be: "This is Voyant!"
 * 
 * See also [Creating a Corpus with Text](#!/guide/corpuscreator-section-text).
 */


/**
* @cfg {String} inputRemoveUntilAfter Omit text up until the end of the matching regular expression (this is ignored in XML-based documents).
 * 
 * 		loadCorpus("Hello world! This is Voyant!", {
 * 			 inputRemoveUntilAfter: "world!"
 * 		}); // document would be: "This is Voyant!"
 * 
 * See also [Creating a Corpus with Text](#!/guide/corpuscreator-section-text).
 */


/**
* @cfg {String} inputRemoveFrom Omit text from the start of the matching regular expression (this is ignored in XML-based documents).
 * 
 * 		loadCorpus("Hello world! This is Voyant!", {
 * 			 inputRemoveFrom: "This"
 * 		}); // document would be: "Hello World!"
 * 
 * See also [Creating a Corpus with Text](#!/guide/corpuscreator-section-text).
 */


/**
* @cfg {String} inputRemoveFromAfter Omit text from the end of the matching regular expression (this is ignored in XML-based documents).
 * 
 * 		loadCorpus("Hello world! This is Voyant!", {
 * 			 inputRemoveFromAfter: "This"
 * 		}); // document would be: "Hello World! This"
 * 
 * See also [Creating a Corpus with Text](#!/guide/corpuscreator-section-text).
 */


/**
* @cfg {String} subTitle A sub-title for the corpus.
 * 
 * This is currently not used, except in the Dynamic Table of Contexts skin. Still, it may be worth specifying a subtitle for later use.
 */


/**
* @cfg {String} title A title for the corpus.
 * 
 * This is currently not used, except in the Dynamic Table of Contexts skin. Still, it may be worth specifying a title for later use.
 */


/**
* @cfg {String} curatorTsv a simple TSV of paths and labels for the DToC interface (this isn't typically used outside of the specialized DToC context).
 *
 * The DToC skin allows curation of XML tags and attributes in order to constrain the entries shown in the interface or to provide friendlier labels. This assumes plain text unicode input with one definition per line where the simple XPath expression is separated by a tab from a label.
 *
 *   	 p    	 paragraph
 *   	 ref[@target*="religion"]    	 religion
 *
  * For more information see the DToC documentation on [Curating Tags](http://cwrc.ca/Documentation/public/index.html#DITA_Files-Various_Applications/DToC/CuratingTags.html)
 */


/**
* Get a Promise for the ID of the corpus.
	 * 
	 * @return {Promise|String} a Promise for the string ID of the corpus
	  * @method id
 */


/**
* Get a Promise for the metadata object (of the corpus or document, depending on which mode is used).
	 * 
	 * The following is an example of the object return for the metadata of the Jane Austen corpus:
	 * 
	 * 	{
	 * 		"id": "b50407fd1cbbecec4315a8fc411bad3c",
	 * 		"alias": "austen",
 	 * 		"title": "",
	 * 		"subTitle": "",
	 * 		"documentsCount": 8,
	 * 		"createdTime": 1582429585984,
	 * 		"createdDate": "2020-02-22T22:46:25.984-0500",
	 * 		"lexicalTokensCount": 781763,
	 * 		"lexicalTypesCount": 15368,
	 * 		"noPasswordAccess": "NORMAL",
	 * 		"languageCodes": [
	 * 			"en"
	 * 		]
	 * 	}
	 * 
	 * The following is an example of what is returned as metadata for the first document:
	 *
	 * 	[
     * 		{
     *   		"id": "ddac6b12c3f4261013c63d04e8d21b45",
     *   		"extra.X-Parsed-By": "org.apache.tika.parser.DefaultParser",
     *   		"tokensCount-lexical": "33559",
     *   		"lastTokenStartOffset-lexical": "259750",
     *   		"parent_modified": "1548457455000",
     *   		"typesCount-lexical": "4235",
     *   		"typesCountMean-lexical": "7.924203",
     *   		"lastTokenPositionIndex-lexical": "33558",
     *   		"index": "0",
     *   		"language": "en",
     *   		"sentencesCount": "1302",
     *   		"source": "stream",
     *   		"typesCountStdDev-lexical": "46.626404",
     *   		"title": "1790 Love And Freindship",
     *   		"parent_queryParameters": "VOYANT_BUILD=M16&textarea-1015-inputEl=Type+in+one+or+more+URLs+on+separate+lines+or+paste+in+a+full+text.&VOYANT_REMOTE_ID=199.229.249.196&accessIP=199.229.249.196&VOYANT_VERSION=2.4&palette=default&suppressTools=false",
     *   		"extra.Content-Type": "text/plain; charset=windows-1252",
     *   		"parentType": "expansion",
     *   		"extra.Content-Encoding": "windows-1252",
     *   		"parent_source": "file",
     *   		"parent_id": "ae47e3a72cd3cad51e196e8a41e21aec",
     *   		"modified": "1432861756000",
     *   		"location": "1790 Love And Freindship.txt",
     *   		"parent_title": "Austen",
     *   		"parent_location": "Austen.zip"
     * 		}
     * 	]
	 * 
	 * In Corpus mode there's no reason to specify arguments. In documents mode you
	 * can request specific documents in the config object:
	 * 
	 *  * **start**: the zero-based start of the list
	 *  * **limit**: a limit to the number of items to return at a time
	 *  * **docIndex**: a zero-based list of documents (first document is zero, etc.); multiple documents can be separated by a comma
	 *  * **docId**: a set of document IDs; multiple documents can be separated by a comma
	 *  * **query**: one or more term queries for the title, author or full-text
	 *  * **sort**: one of the following sort orders: `INDEX`, `TITLE`, `AUTHOR`, `TOKENSCOUNTLEXICAL`, `TYPESCOUNTLEXICAL`, `TYPETOKENRATIOLEXICAL`, `PUBDATE`
	 *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
	 * 
	 *  An example:
	 *  
	 *  	// this would show the number 8 (the size of the corpus)
	 *  	loadCorpus("austen").metadata().then(metadata => metadata.documentsCount)
	 *  
	 * @param {Object} config an Object specifying parameters (see list above)
	 * @return {Promise|Object} a Promise for an Object containing metadata
	  * @method metadata
 */


/**
* Get a Promise for a brief summary of the corpus that includes essential metadata (documents count, terms count, etc.) 
	 * 
	 * An example:
	 * 
	 * 	loadCorpus("austen").summary();
	 * 
	 * @return {Promise|String} a Promise for a string containing a brief summary of the corpus metadata
	  * @method summary
 */


/**
* Get a Promise for an Array of the document titles.
	 * 
	 * The following are valid in the config parameter:
	 * 
	 *  * **start**: the zero-based start of the list
	 *  * **limit**: a limit to the number of items to return at a time
	 *  * **docIndex**: a zero-based list of documents (first document is zero, etc.); multiple documents can be separated by a comma
	 *  * **docId**: a set of document IDs; multiple documents can be separated by a comma
	 *  * **query**: one or more term queries for the title, author or full-text
	 *  * **sort**: one of the following sort orders: `INDEX`, `TITLE`, `AUTHOR`, `TOKENSCOUNTLEXICAL`, `TYPESCOUNTLEXICAL`, `TYPETOKENRATIOLEXICAL`, `PUBDATE`
	 *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
	 * 
	 * An example:
	 *
	 * 	loadCorpus("austen").titles().then(titles => "The last work is: "+titles[titles.length-1])
	 *
	 * @param {Object} config an Object specifying parameters (see list above) 
	 * @returns {Promise|Array} a Promise for an Array of document titles  
	  * @method titles
 */


/**
* Get a Promise for the text of the entire corpus.
	 * 
	 * Texts are concatenated together with two new lines and three dashes (\\n\\n---\\n\\n)
	 * 
	 * The following are valid in the config parameter:
	 * 
	 * * **noMarkup**: strips away the markup
	 * * **compactSpace**: strips away superfluous spaces and multiple new lines
	 * * **limit**: a limit to the number of characters (per text)
	 * * **format**: `text` for plain text, any other value for the simplified Voyant markup
	 * 
	 * An example:
	 *
	 * 	// fetch 1000 characters from each text in the corpus into a single string
	 * 	loadCorpus("austen").text({limit:1000})
	 * 
	 * @param {Object} config an Object specifying parameters (see list above)
	 * @returns {Promise|String} a Promise for a string of the corpus
	  * @method text
 */


/**
* Get a Promise for an Array of texts from the entire corpus.
	 * 
	 * The following are valid in the config parameter:
	 * 
	 * * **noMarkup**: strips away the markup
	 * * **compactSpace**: strips away superfluous spaces and multiple new lines
	 * * **limit**: a limit to the number of characters (per text)
	 * * **format**: `text` for plain text, any other value for the simplified Voyant markup
	 * 
	 * An example:
	 *
	 * 	// fetch 1000 characters from each text in the corpus into an Array
	 * 	loadCorpus("austen").texts({limit:1000})
	 * 
	 * @param {Object} config an Object specifying parameters (see list above)
	 * @returns {Promise|String} a Promise for an Array of texts from the corpus
	  * @method texts
 */


/**
* Get a Promise for an Array of terms (either CorpusTerms or DocumentTerms, depending on the specified mode).
	 * These terms are actually types, so information about each type is collected (as opposed to the {#link tokens}
	 * method which is for every occurrence in document order).
	 * 
	 * The mode is set to "documents" when any of the following is true
	 * 
	 * * the `mode` parameter is set to "documents"
	 * * a `docIndex` parameter being set
	 * * a `docId` parameter being set
	 * 
	 * The following is an example a Corpus Term (corpus mode):
	 * 
	 * 	{
	 * 		"term": "the",
	 * 		"inDocumentsCount": 8,
	 * 		"rawFreq": 28292,
	 * 		"relativeFreq": 0.036189996,
	 * 		"comparisonRelativeFreqDifference": 0
	 * 	}
	 * 
	 * The following is an example of Document Term (documents mode):
	 * 
	 * 	{
	 * 		"term": "the",
	 * 		"rawFreq": 1333,
	 * 		"relativeFreq": 39721.086,
	 * 		"zscore": 28.419,
	 * 		"zscoreRatio": -373.4891,
	 * 		"tfidf": 0.0,
	 * 		"totalTermsCount": 33559,
 	 * 		"docIndex": 0,
	 * 		"docId": "8a61d5d851a69c03c6ba9cc446713574"
	 * 	}
	 * 
	 * The following config parameters are valid in both modes:
	 * 
	 *  * **start**: the zero-based start index of the list (for paging)
	 *  * **limit**: the maximum number of terms to provide per request
	 *  * **minRawFreq**: the minimum raw frequency of terms
	 *  * **query**: a term query (see https://voyant-tools.org/docs/#!/guide/search)
	 *  * **stopList** a list of stopwords to include (see https://voyant-tools.org/docs/#!/guide/stopwords)
	 *  * **withDistributions**: a true value shows distribution across the corpus (corpus mode) or across the document (documents mode)
	 *  * **whiteList**: a keyword list – terms will be limited to this list
	 *  * **tokenType**: the token type to use, by default `lexical` (other possible values might be `title` and `author`)
	 *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
	 * 
	 * The following are specific to corpus mode:
	 * 
	 *  * **bins**: by default there are the same number of bins as there are documents (for distribution values), this can be modified
	 *  * **corpusComparison**: you can provide the ID of a corpus for comparison of frequency values
	 *  * **inDocumentsCountOnly**: if you don't need term frequencies but only frequency per document set this to true
	 *  * **sort**: the order of the terms, one of the following: `INDOCUMENTSCOUNT, RAWFREQ, TERM, RELATIVEPEAKEDNESS, RELATIVESKEWNESS, COMPARISONRELATIVEFREQDIFFERENCE`
	 *  
	 *  The following are specific to documents mode:
	 * 
	 *  * **bins**: by default the document is divided into 10 equal bins(for distribution values), this can be modified
	 *  * **sort**: the order of the terms, one of the following: `RAWFREQ, RELATIVEFREQ, TERM, TFIDF, ZSCORE`
	 *  * **perDocLimit**: the `limit` parameter is for the total number of terms returned, this parameter allows you to specify a limit value per document
	 *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
	 *  * **docId**: the document IDs to include (use commas to separate multiple values)
	 *  
	 * An example:
	 * 
	 * 	// show top 5 terms
   	 * 	loadCorpus("austen").terms({stopList: 'auto', limit: 5}).then(terms => terms.map(term => term.term))
   	 *
   	 * 	// show top term for each document
   	 * 	loadCorpus("austen").terms({stopList: 'auto', perDocLimit: 1, mode: 'documents'}).then(terms => terms.map(term => term.term))
   	 * 
	 * @param {Object} config an Object specifying parameters (see list above)
	 * @returns {Promise|Array} a Promise for a Array of Terms
	  * @method terms
 */


/**
* Get a Promise for an Array of document tokens.
	 * 
	 * The promise returns an array of document token objects. A document token object can look something like this:
	 * 
	 *		{
	 *			"docId": "8a61d5d851a69c03c6ba9cc446713574",
	 *			"docIndex": 0,
	 *			"term": "LOVE",
	 *			"tokenType": "lexical",
	 *			"rawFreq": 54,
	 *			"position": 0,
	 *			"startOffset": 3,
	 *			"endOffset": 7
	 *		}
	 *
	 * The following are valid in the config parameter:
	 * 
	 *  * **start**: the zero-based start index of the list (for paging)
	 *  * **limit**: the maximum number of terms to provide per request
	 *  * **stopList** a list of stopwords to include (see https://voyant-tools.org/docs/#!/guide/stopwords)
	 *  * **whiteList**: a keyword list – terms will be limited to this list
	 *  * **perDocLimit**: the `limit` parameter is for the total number of terms returned, this parameter allows you to specify a limit value per document
	 *  * **noOthers**: only include lexical forms, no other tokens
	 *  * **stripTags**: one of the following: `ALL`, `BLOCKSONLY`, `NONE` (`BLOCKSONLY` tries to maintain blocks for line formatting)
	 *  * **withPosLemmas**: include part-of-speech and lemma information when available (reliability of this may vary by instance)
	 *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
	 *  * **docId**: the document IDs to include (use commas to separate multiple values)
	 * 
	 * An example:
	 *
	 * 	// load the first 20 tokens (don't include tags, spaces, etc.)
	 * 	loadCorpus("austen").tokens({limit: 20, noOthers: true})
	 *
	 * @param {Object} config an Object specifying parameters (see above)
	 * @returns {Promise|Array} a Promise for an Array of document tokens
	  * @method tokens
 */


/**
* Get a Promise for an Array of words from the corpus.
	 * 
	 * The array of words are in document order, much like tokens.
	 * 
	 * The following are valid in the config parameter:
	 * 
	 *  * **start**: the zero-based start index of the list (for paging)
	 *  * **limit**: the maximum number of terms to provide per request
	 *  * **stopList** a list of stopwords to include (see https://voyant-tools.org/docs/#!/guide/stopwords)
	 *  * **whiteList**: a keyword list – terms will be limited to this list
	 *  * **perDocLimit**: the `limit` parameter is for the total number of terms returned, this parameter allows you to specify a limit value per document
	 *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
	 *  * **docId**: the document IDs to include (use commas to separate multiple values)
	 * 
	 * An example:
	 *
	 * 	// load the first 20 words in the corpus
	 * 	loadCorpus("austen").tokens({limit: 20})
	 *
	 * @param {Object} config an Object specifying parameters (see above)
	 * @returns {Promise|Array} a Promise for an Array of words
	  * @method words
 */


/**
* Get a Promise for an Array of Objects that contain keywords in contexts (KWICs).
	 * 
	 * An individual KWIC Object looks something like this:
	 * 
     * 	{
     *			"docIndex": 0,
     *			"query": "love",
     *			"term": "love",
     *			"position": 0,
     *			"left": "FREINDSHIP AND OTHER EARLY WORKS",
     *			"middle": "Love",
     *			"right": " And Friendship And Other Early"
     * 	}
     *  
     * The following are valid in the config parameter:
     * 
     *  * **start**: the zero-based start index of the list (for paging)
     *  * **limit**: the maximum number of terms to provide per request
     *  * **query**: a term query (see https://voyant-tools.org/docs/#!/guide/search)
     *  * **sort**: the order of the contexts: `TERM,, DOCINDEX, POSITION, LEFT, RIGHT`
	 *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
     *  * **perDocLimit**: the `limit` parameter is for the total number of terms returned, this parameter allows you to specify a limit value per document
     *  * **stripTags**: for the `left`, `middle` and `right` values, one of the following: `ALL`, `BLOCKSONLY` (tries to maintain blocks for line formatting), `NONE` (default)
     *  * **context**: the size of the context (the number of words on each size of the keyword)
     *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
     *  * **docId**: the document IDs to include (use commas to separate multiple values)
     *  * **overlapStrategy**: determines how to handle cases where there's overlap between KWICs, such as "to be or not to be" when the keyword is "be"; here are the options:
     *      * **none**: nevermind the overlap, keep all words
     *      	* {left: "to", middle: "be", right: "or not to be"} 
     *      	* {left: "to be or not to", middle: "be", right: ""} 
     *      * **first**: priority goes to the first occurrence (some may be dropped)
     *      	* {left: "to", middle: "be", right: "or not to be"} 
     *      * **merge**: balance the words between overlapping occurrences
     *      	* {left: "to", middle: "be", right: "or"} 
     *      	* {left: "not to", middle: "be", right: ""} 
     * 
     * An example:
     * 
     * 	// load the first 20 words in the corpus
     * 	loadCorpus("austen").contexts({query: "love", limit: 10})
     * 
     * @param {Object} config an Object specifying parameters (see above)
     * @returns {Promise|Array} a Promise for an Array of KWIC Objects
      * @method contexts
 */


/**
* Get a Promise for an Array of collocates (either document or corpus collocates, depending on the specified mode).
	 * 
	 * The mode is set to "documents" when any of the following is true
	 * 
	 * * the `mode` parameter is set to "documents"
	 * * a `docIndex` parameter being set
	 * * a `docId` parameter being set
	 * 
	 * The following is an example a Corpus Collocate (corpus mode):
	 * 
	 * 	{
     *   		"term": "love",
     *   		"rawFreq": 568,
     *   		"contextTerm": "mr",
     *   		"contextTermRawFreq": 24
     * 	}
	 * 
	 * The following is an example of Document Collocate (documents mode):
	 * 
	 * 	{
     * 			"docIndex": 4,
     * 			"keyword": "love",
     * 			"keywordContextRawFrequency": 124,
     * 			"term": "fanny",
     * 			"termContextRawFrequency": 8,
     * 			"termContextRelativeFrequency": 0.021680217,
     * 			"termDocumentRawFrequency": 816,
     * 			"termDocumentRelativeFrequency": 0.0050853477,
     * 			"termContextDocumentRelativeFrequencyDifference": 0.01659487
     * 	}
	 * 
	 * The following config parameters are valid in both modes:
	 * 
	 *  * **start**: the zero-based start index of the list (for paging)
	 *  * **limit**: the maximum number of terms to provide per request
	 *  * **query**: a term query (see https://voyant-tools.org/docs/#!/guide/search)
	 *  * **stopList** a list of stopwords to include (see https://voyant-tools.org/docs/#!/guide/stopwords)
	 *  * **collocatesWhitelist**: collocates will be limited to this list
     *  * **context**: the size of the context (the number of words on each size of the keyword)
	 *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
	 * 
	 * The following are specific to corpus mode:
	 * 
	 *  * **sort**: the order of the terms, one of the following: `RAWFREQ, TERM, CONTEXTTERM, CONTEXTTERMRAWFREQ`
	 *  
	 *  The following are specific to documents mode:
	 * 
	 *  * **sort**: the order of the terms, one of the following: `TERM, REL, REL, RAW, DOCREL, DOCRAW, CONTEXTDOCRELDIFF`
	 *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
	 *  * **docId**: the document IDs to include (use commas to separate multiple values)
	 *  
	 * An example:
	 * 
	 * 	// show top 5 collocate terms
   	 * 	loadCorpus("austen").collocates({stopList: 'auto', limit: 5}).then(terms => terms.map(term => term.term))
   	 * 
	 * @param {Object} config an Object specifying parameters (see list above)
	 * @returns {Promise|Array} a Promise for a Array of Terms
	  * @method collocates
 */


/**
* Get a Promise for an Array of phrases or n-grams (either document or corpus phrases, depending on the specified mode).
	 * 
	 * The mode is set to "documents" when any of the following is true
	 * 
	 * * the `mode` parameter is set to "documents"
	 * * a `docIndex` parameter being set
	 * * a `docId` parameter being set
	 * 
	 * The following is an example a Corpus phrase (corpus mode), without distributions requested:
	 * 
	 * 	{
     *  		"term": "love with",
     *  		"rawFreq": 103,
     *  		"length": 2
     * 	}
	 * 
	 * The following is an example of Document phrase (documents mode), without positions requested:
	 * 
	 * 	{
     *   		"term": "love with",
     *   		"rawFreq": 31,
     *   		"length": 2,
     *   		"docIndex": 5
     * 	}
	 * 
	 * The following config parameters are valid in both modes:
	 * 
	 *  * **start**: the zero-based start index of the list (for paging)
	 *  * **limit**: the maximum number of terms to provide per request
	 *  * **minLength**: the minimum length of the phrase
	 *  * **maxLength**: the maximum length of the phrase
	 *  * **minRawFreq**: the minimum raw frequency of the phrase
     * 	* **sort**: the order of the terms, one of the following: `RAWFREQ, TERM, LENGTH`
	 *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
	 *  * **overlapFilter**: it happens that phrases contain other phrases and we need a strategy for handling overlap:
     *      * **NONE**: nevermind the overlap, keep all phrases
     *      * **LENGTHFIRST**: priority goes to the longest phrases
     *      * **RAWFREQFIRST**: priority goes to the highest frequency phrases
     *      * **POSITIONFIRST**: priority goes to the first phrases
     * 
     * The following are specific to documents mode:
     * 
	 *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
	 *  * **docId**: the document IDs to include (use commas to separate multiple values)
     *  
     * An example:
     * 
     * 	// load the first 20 phrases in the corpus
     * 	loadCorpus("austen").phrases({query: "love", limit: 10})
     * 
     * @param {Object} config an Object specifying parameters (see above)
     * @returns {Promise|Array} a Promise for an Array of phrase Objects
      * @method phrases
 */


/**
* Get a Promise for an Array of correlations (either document or corpus correlations, depending on the specified mode).
	 * 
	 * The mode is set to "documents" when any of the following is true
	 * 
	 * * the `mode` parameter is set to "documents"
	 * * a `docIndex` parameter being set
	 * * a `docId` parameter being set
	 * 
	 * The following is an example a Corpus correlation (corpus mode):
	 * 
	 * 	{
     * 		"source": {
     * 			"term": "mrs",
     * 			"inDocumentsCount": 8,
     * 			"rawFreq": 2531,
     * 			"relativePeakedness": 0.46444246,
     * 			"relativeSkewness": -0.44197384
     * 		},
     * 		"target": {
     * 			"term": "love",
     * 			"inDocumentsCount": 8,
     * 			"rawFreq": 568,
     * 			"relativePeakedness": 5.763066,
     * 			"relativeSkewness": 2.2536576
     * 		},
     * 		"correlation": -0.44287738,
     * 		"significance": 0.08580014
     * 	}
	 * 
	 * The following is an example of Document correlation (documents mode), without positions requested:
	 * 
	 * 	{
     * 		"source": {
     * 			"term": "confide",
     * 			"rawFreq": 3,
     * 			"relativeFreq": 89.3948,
     * 			"zscore": -0.10560975,
     * 			"zscoreRatio": -0.7541012,
     * 			"tfidf": 1.1168874E-5,
     * 			"totalTermsCount": 33559,
     * 			"docIndex": 0,
     * 			"docId": "8a61d5d851a69c03c6ba9cc446713574"
     * 		},
     * 		"target": {
     * 			"term": "love",
     * 			"rawFreq": 54,
     * 			"relativeFreq": 1609.1063,
     * 			"zscore": 53.830048,
     * 			"zscoreRatio": -707.44696,
     * 			"tfidf": 0.0,
     * 			"totalTermsCount": 33559,
     * 			"docIndex": 0,
     * 			"docId": "8a61d5d851a69c03c6ba9cc446713574"
     * 		},
     * 		"correlation": 0.93527687,
     * 		"significance": 7.0970666E-5
     * 	}
	 * 
	 * The following config parameters are valid in both modes:
	 * 
	 *  * **start**: the zero-based start index of the list (for paging)
	 *  * **limit**: the maximum number of terms to provide per request
	 *  * **minRawFreq**: the minimum raw frequency of the collocate terms
	 *  * **termsOnly**: a very compact data view of the correlations
     *  * **sort**: the order of the terms, one of the following: `CORRELATION`, `CORRELATIONABS`
	 *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
     * 
     * The following are specific to documents mode:
     * 
	 *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
	 *  * **docId**: the document IDs to include (use commas to separate multiple values)
     *  
     * An example:
     * 
     * 	// load the first 10 phrases in the corpus
     * 	loadCorpus("austen").correlations({query: "love", limit: 10})
     * 
     * @param {Object} config an Object specifying parameters (see above)
     * @returns {Promise|Array} a Promise for an Array of phrase Objects
      * @method correlations
 */


/**
* Get lemmas. This is the equivalent calling: this.tokens({ withPosLemmas: true, noOthers: true })
	 * @param {Object} config an Object specifying parameters (see above)
     * @returns {Promise|Array} a Promise for an Array of lemma Objects
	  * @method lemmas
 */


/**
* Get a promise for an LDA object that has two primary methods of use:
	 * 
	 * 	* **getTopicWords**: get a list of topics (words organized into bunches of a specified size
	 * 	* **getDocuments**: get a list of documents and the signican words
	 *
	 * The config object as parameter can contain the following:
	 *  * **numberTopics**: the number of topics to get (default is 10)
	 *  * **sweeps**: the number of sweeps to do, more sweeps = more accurate (default is 100)
	 *  * **language**: stopwords language to use, default is corpus language
	 * @param {Object} config (see above)
	 * @return {Promise} a promise for an LDA object
	  * @method lda
 */


/**
* Get a promise for a list of LDA topics from the corpus.
	 * 
	 * The config object as parameter can contain the following:
	 *  * **numberTopics**: the number of topics to get (default is 10)
	 *  * **sweeps**: the number of sweeps to do, more sweeps = more accurate (default is 100)
	 *  * **language**: stopwords language to use, default is corpus language
	 * @param {Object} config (see above)
	 * @return {Promise} a promise for an array of topics
	  * @method ldaTopics
 */


/**
* Get a promise for a list of documents and associated words
	 * 
	 * The config object as parameter can contain the following:
	 *  * **numberTopics**: the number of topics to get (default is 10)
	 *  * **sweeps**: the number of sweeps to do, more sweeps = more accurate (default is 100)
	 *  * **language**: stopwords language to use, default is corpus language
	 * @param {Object} config (see above)
	 * @return {Promise} a promise for an array of documents
	  * @method ldaDocuments
 */


/**
* Get a promise for the HTML snippet that will produce the specified Voyant tools to appear.
	 * 
	 * In its simplest form we can simply call the named tool:
	 * 
	 * 	loadCorpus("austen").tool("Cirrus");
	 * 
	 * Each tool supports some options (that are summarized below), and those can be specified as options:
	 * 
	 * 	loadCorpus("austen").tool("Trends", {query: "love"});
	 * 
	 * There are also parameters (width, height, style, float) that apply to the actual tool window:
	 * 
	 *  loadCorpus("austen").tool("Trends", {query: "love", style: "width: 500px; height: 500px"});
	 * 
	 * It's also possible to have several tools appear at once, though they won't be connected by events (clicking in a window won't modify the other windows):
	 * 
	 * 	loadCorpus("austen").tool("Cirrus", "Trends");
	 * 
	 * One easy way to get connected tools is to use the `CustomSet` tool and experiment with the layout:
	 * 
	 * 	loadCorpus("austen").tool("CustomSet", {tableLayout: "Cirrus,Trends", style: "width:800px; height: 500px"});
	 * 
	 * Here's a partial list of the tools available as well as their significant parameters:
	 * 
	 *  * <a href="./#!/guide/bubblelines" target="_blank">Bubblelines</a> visualizes the frequency and distribution of terms in a corpus.
	 *  	* **bins**: number of bins to separate a document into
	 *  	* **docIndex**: document index to restrict to (can be comma-separated list)
	 *  	* **maxDocs**: maximum number of documents to show
	 *  	* **query**: a query to search for in the corpus
	 *  	* **stopList**: a named stopword list or comma-separated list of words
	 *  * <a href="./#!/guide/bubbles" target="_blank">Bubbles</a> is a playful visualization of term frequencies by document.
	 *  	* **audio**: whether or not to include audio
	 *  	* **docIndex**: document index to restrict to (can be comma-separated list)
	 *  	* **speed**: speed of the animation (0 to 60 lower is slower)
	 *  	* **stopList**: a named stopword list or comma-separated list of words
	 *  * <a href="./#!/guide/cirrus" target="_blank">Cirrus</a> is a word cloud that visualizes the top frequency words of a corpus or document.
	 *  	* **background**: set the background colour of the word cloud
	 *  	* **categories**: set the categories for the word cloud (usually an ID of an existing categories definition)
	 *  	* **docIndex**: document index to restrict to (can be comma-separated list)
	 *  	* **fontFamily**: the default font to use for the words (default: "Palatino Linotype", "Book Antiqua", Palatino, serif),
	 *  	* **inlineData**: user-defined data, most easily expressed like this: love:20,like:15,dear:10
	 *  	* **limit**: the number of terms to load (that are available, see also `visible` which determines how many are displayed),
	 *  	* **stopList**: a named stopword list or comma-separated list of words
	 *  	* **visible**: the number of terms to display in the word cloud (default is 50)
	 *  	* **whiteList**: a keyword list – terms will be limited to this list
	 *  * <a href="./#!/guide/collocatesgraph" target="_blank">CollocateGraphs</a> represents keywords and terms that occur in close proximity as a force directed network graph.
 	 *  	* **centralize**: the term to use for centralize mode (where things are focused on a single word)
     *  	* **context**: the size of the context (the number of words on each size of the keyword)
	 *  	* **limit**: the number of collocates to load for each keyword
	 *  	* **query**: a query for the keywords (can be comma-separated list)
	 *  	* **stopList**: a named stopword list or comma-separated list of words
	 *  * <a href="./#!/guide/corpuscollocates" target="_blank">CorpusCollocates</a> is a table view of which terms appear more frequently in proximity to keywords across the entire corpus.
     *  	* **context**: the size of the context (the number of words on each size of the keyword)
	 *  	* **query**: a query for the keywords (can be comma-separated list)
	 *  	* **sort**: sort order of collocates, one of `contextTermRawFreq`, `contextTermRawFreq`, `rawFreq`, `term`
	 *  	* **stopList**: a named stopword list or comma-separated list of words
	 *  * <a href="./#!/guide/contexts" target="_blank">Contexts</a> (or Keywords in Context) tool shows each occurrence of a keyword with a bit of surrounding text (the context).
     *  	* **context**: the size of the context (the number of words on each size of the keyword)
	 *  	* **expand**: the size of the extended context (when you expand a context occurrence), the number of words on each size of the keyword 
	 *  	* **query**: a query for the keywords (can be comma-separated list)
	 *  	* **stopList**: a named stopword list or comma-separated list of words
	 *  * <a href="./#!/guide/correlations" target="_blank">Correlations</a> tool enables an exploration of the extent to which term frequencies vary in sync (terms whose frequencies rise and fall together or inversely).
	 *  	* **minInDocumentsCountRatio**: the minimum percentage of documents in which the correlation must appear
	 *  	* **query**: a query for the keywords (can be comma-separated list)
	 *  	* **stopList**: a named stopword list or comma-separated list of words
	 *  * <a href="./#!/guide/documentterms" target="_blank">DocumentTerms</a> is a table view of document term frequencies.
     *  	* **bins**: for the purposes of analyzing distribution the documents are split into a specified number of segments or bins
	 *  	* **docIndex**: document index to restrict to (can be comma-separated list)
	 *  	* **expand**: the size of the extended context (when you expand a context occurrence), the number of words on each size of the keyword 
	 *  	* **query**: a query for the keywords (can be comma-separated list)
	 *  	* **stopList**: a named stopword list or comma-separated list of words
	 *  * <a href="./#!/guide/corpusterms" target="_blank">CorpusTerms</a> is a table view of term frequencies in the entire corpus.
     *  	* **bins**: for the purposes of analyzing distribution the documents are split into a specified number of segments or bins
	 *  	* **docIndex**: document index to restrict to (can be comma-separated list)
	 *  	* **expand**: the size of the extended context (when you expand a context occurrence), the number of words on each size of the keyword 
	 *  	* **query**: a query for the keywords (can be comma-separated list)
	 *  	* **stopList**: a named stopword list or comma-separated list of words
	 *  * <a href="./#!/guide/documents" target="_blank">The</a> Documents tool shows a table of the documents in the corpus and includes functionality for modifying the corpus.
	 *  * <a href="./#!/guide/knots" target="_blank">Knots</a> is a creative visualization that represents terms in a single document as a series of twisted lines.
	 *  * <a href="./#!/guide/mandala" target="_blank">Mandala</a> is a conceptual visualization that shows the relationships between terms and documents.
	 *  * <a href="./#!/guide/microsearch" target="_blank">Microsearch</a> visualizes the frequency and distribution of terms in a corpus.
	 *  * <a href="./#!/guide/phrases" target="_blank">Phrases</a> shows repeating sequences of words organized by frequency of repetition or number of words in each repeated phrase.
	 *  * <a href="./#!/guide/reader" target="_blank">Reader</a> provides a way of reading documents in the corpus, text is fetched on-demand as needed.
	 *  * <a href="./#!/guide/scatterplot" target="_blank">ScatterPlot</a> is a graph visualization of how words cluster in a corpus using document similarity, correspondence analysis or principal component analysis.
	 *  * <a href="./#!/guide/streamgraph" target="_blank">StreamGraph</a> is a visualization that depicts the change of the frequency of words in a corpus (or within a single document).
	 *  * <a href="./#!/guide/summary" target="_blank">Summary</a> provides a simple, textual overview of the current corpus, including including information about words and documents.
	 *  * <a href="./#!/guide/termsradio" target="_blank">TermsRadio</a> is a visualization that depicts the change of the frequency of words in a corpus (or within a single document).
	 *  * <a href="./#!/guide/textualarc" target="_blank">TextualArc</a> is a visualization of the terms in a document that includes a weighted centroid of terms and an arc that follows the terms in document order.
	 *  * <a href="./#!/guide/topics" target="_blank">Topics</a> provides a rudimentary way of generating term clusters from a document or corpus and then seeing how each topic (term cluster) is distributed across the document or corpus.
	 *  * <a href="./#!/guide/trends" target="_blank">Trends</a> shows a line graph depicting the distribution of a word’s occurrence across a corpus or document.
	 *  * <a href="./#!/guide/veliza" target="_blank">Veliza</a> is an experimental tool for having a (limited) natural language exchange (in English) based on your corpus.
	 *  * <a href="./#!/guide/wordtree" target="_blank">WordTree</a> is a tool that allows you to explore how words are used in phrases.
	  * @method tool
 */


/**
* An alias for {@link #summary}.
	  * @method toString
 */


/**
* Load a Corpus using the provided config and api
	 * @param {Object} config the Corpus config
	 * @param {Object} api any additional API values
	 * @static
 * @method load
 */




// *** Documentation extracted from: ..\..\..\..\voyantjs\src\fileinput.js ***

/**
* A multiple file input that features drag n drop as well as temporary file storage in session storage.
 * @class FileInput
 */


/**
* The FileInput constructor
	 * @param {HTMLElement} target The element to place the file input into
	 * @param {Function} resolve A function to call with the file(s)
	 * @param {Function} reject A function to call if the input is cancelled
	  * @method constructor
 */




// *** Documentation extracted from: ..\..\..\..\voyantjs\src\load.js ***

/**
* Class embodying Load functionality.
 * @class Spyral.Load
 */


/**
* Set the base URL for use with the Load class
	 * @param {string} baseUrl 
	 * @static
 * @method setBaseUrl
 */


/**
* Make a call to trombone
	 * @param {Object} config 
	 * @param {Object} params
	 * @returns {JSON}
	 * @static
 * @method trombone
 */


/**
* Fetch content from a URL, often resolving cross-domain data constraints
	 * @param {string} urlToFetch 
	 * @param {Object} config
	 * @returns {Response}
	 * @static
 * @method load
 */


/**
* Fetch HTML content from a URL
	 * @param {string} url 
	 * @returns {Document}
	 * @static
 * @method html
 */


/**
* Fetch XML content from a URL
	 * @param {string} url 
	 * @returns {XMLDocument}
	 * @static
 * @method xml
 */


/**
* Fetch JSON content from a URL
	 * @param {string} url 
	 * @returns {JSON}
	 * @static
 * @method json
 */


/**
* Fetch text content from a URL
	 * @param {string} url 
	 * @returns {string}
	 * @static
 * @method text
 */


/**
* Create a file input in the target element and returns a Promise that's resolved with the file(s) that is added to the input.
	 * The file is also temporarily stored in the session storage for successive retrieval.
	 * @param {HTMLElement} target The target element to append the input to
	 * @returns {Promise}
	 * @static
 * @method files
 */




// *** Documentation extracted from: ..\..\..\..\voyantjs\src\table.js ***

/**
* The Spyral.Table class in Spyral provides convenience functions for working with tabular
 * data.
 * 
 * There are several ways of initializing a Table, here are some of them:
 * 
 * Provide an array of data with 3 rows:
 * 
 *  	let table = createTable([1,2,3]);
 *
 *
 * Provide a nested array of data with multiple rows:
 * 
 *		let table = createTable([[1,2],[3,4]]);
 * 
 * Same nested array, but with a second argument specifying headers
 * 
 *		let table = createTable([[1,2],[3,4]], {headers: ["one","two"]});
 * 
 * Create table with comma-separated values:
 * 
 *  	let table = createTable("one,two\\n1,2\\n3,4");
 * 
 * Create table with tab-separated values
 * 
 *		let table = createTable("one\\ttwo\\n1\\t2\\n3\\t4");
 * 
 * Create table with array of objects
 * 
 *  	let table = createTable([{one:1,two:2},{one:3,two:4}]);
 * 
 * It's also possible simple to create a sorted frequency table from an array of values:
 * 
 *		let table = createTable(["one","two","one"], {count: "vertical", headers: ["Term","Count"]})
 * 
 * Working with a Corpus is easy. For instance, we can create a table from the top terms:
 * 
 *		loadCorpus("austen").terms({limit:500, stopList: 'auto'}).then(terms => {
 *			return createTable(terms);
 *		})
 * 
 * Similarly, we could create a frequency table from the first 1,000 words of the corpus:
 * 
 *		loadCorpus("austen").words({limit:1000, docIndex: 0, stopList: 'auto'}).then(words => {
 *			return createTable(words, {count: "vertical"});
 *		});
 *
 * Some of the configuration options are as follows:
 * 
 * * **format**: especially for forcing csv or tsv when the data is a string
 * * **hasHeaders**: determines if data has a header row (usually determined automatically)
 * * **headers**: a Array of Strings that serve as headers for the table
 * * **count**: forces Spyral to create a sorted frequency table from an Array of data, this can be set to "vertical" if the counts are shown vertically or set to true if the counts are shown horizontally
 * 
 * Tables are convenient in Spyral because you can simply show them to preview a version in HTML.
 * 
 * @param {Array|String} data an array of data or a string with CSV or TSV.
 * @param {Object} config an Object for configuring the table initialization, see above
 * @class Spyral.Table
 */


/**
* Create a new Table
	 * @constructor
	 * @param {(Object|Array|String|Number)} data
	 * @param {Object} config
	 
	 * @param {string} config.format The format of the provided data, either "tsv" or "csv"
	 * @param {(Object|Array)} config.headers The table headers
	 * @param {boolean} config.hasHeaders True if the headers are the first item in the data
	 * @param {string} config.count Specify "vertical" or "horizontal" to create a table of unique item counts in the provided data
	  * @method constructor
 */


/**
* Set the headers for the Table
	 * @param {(Object|Array)} data
	 * @returns {Table}
	  * @method setHeaders
 */


/**
* Add rows to the Table
	 * @param {Array} data
	 * @returns {Table}
	  * @method addRows
 */


/**
* Add a row to the Table
	 * @param {(Array|Object)} data
	 * @returns {Table}
	  * @method addRow
 */


/**
* Set a row
	 * @param {(number|string)} ind The row index
	 * @param {(Object|Array)} data
	 * @param {boolean} create
	 * @returns {Table}
	  * @method setRow
 */


/**
* Set a column
	 * @param {(number|string)} ind The column index
	 * @param {(Object|Array)} data
	 * @param {boolean} create
	 * @returns {Table}
	  * @method setColumn
 */


/**
* Add to or set a cell value
	 * @param {(number|string)} row The row index
	 * @param {(number|string)} column The column index
	 * @param {number} value The value to set/add
	 * @param {boolean} overwrite True to set, false to add to current value
	  * @method updateCell
 */


/**
* Get the value of a cell
	 * @param {(number|string)} rowInd The row index
	 * @param {(number|string)} colInd The column index
	 * @returns {number}
	  * @method cell
 */


/**
* Set the value of a cell
	 * @param {(number|string)} row The row index
	 * @param {(number|string)} column The column index
	 * @param {number} value The value to set
	 * @returns {Table}
	  * @method setCell
 */


/**
* Get (and create) the row index
	 * @param {(number|string)} ind The index
	 * @param {boolean} create
	 * @returns {number}
	  * @method getRowIndex
 */


/**
* Get (and create) the column index
	 * @param {(number|string)} ind The index
	 * @param {boolean} create
	 * @returns {number}
	  * @method getColumnIndex
 */


/**
* Add a column (at the specified index)
	 * @param {(Object|String)} config
	 * @param {(number|string)} ind
	  * @method addColumn
 */


/**
* This function returns different values depending on the arguments provided.
	 * When there are no arguments, it returns the number of rows in this table.
	 * When the first argument is the boolean value `true` all rows are returned.
	 * When the first argument is a an array then the rows corresponding to the row
	 * indices or names are returned. When all arguments except are numbers or strings
	 * then each of those is returned.
	 * @param {(Boolean|Array|Number|String)} [inds]
	 * @param {(Object|Number|String)} [config]
	 * @returns {(Number|Array)}
	  * @method rows
 */


/**
* Get the specified row
	 * @param {(number|string)} ind
	 * @param {boolean} [asObj]
	 * @returns {(Object|Number|String)}
	  * @method row
 */


/**
* This function returns different values depending on the arguments provided.
	 * When there are no arguments, it returns the number of columns in this table.
	 * When the first argument is the boolean value `true` all columns are returned.
	 * When the first argument is a number a slice of the columns is returned and if
	 * the second argument is a number it is treated as the length of the slice to
	 * return (note that it isn't the `end` index like with Array.slice()).
	 * @param {(Boolean|Array|Number|String)} [inds]
	 * @param {(Object|Number|String)} [config]
	 * @returns {(Number|Array)}
	  * @method columns
 */


/**
* Get the specified column
	 * @param {(number|string)} ind
	 * @param {boolean} [asObj]
	 * @returns {(Object|Number|String)}
	  * @method column
 */


/**
* Get the specified header
	 * @param {(number|string)} ind
	 * @returns {(number|string)}
	  * @method header
 */


/**
* This function returns different values depending on the arguments provided.
	 * When there are no arguments, it returns the number of headers in this table.
	 * When the first argument is the boolean value `true` all headers are returned.
	 * When the first argument is a number a slice of the headers is returned.
	 * When the first argument is an array the slices specified in the array are returned.
	 * @param {(Boolean|Array|Number|String)} inds
	 * @returns {(Number|Array)}
	  * @method headers
 */


/**
* Does the specified column exist
	 * @param {(number|string)} ind
	 * @returns {(number|string)}
	  * @method hasColumn
 */


/**
* Runs the specified function on each row.
	 * The function is passed the row and the row index.
	 * @param {Function} fn
	  * @method forEach
 */


/**
* Get the minimum value in the specified row
	 * @param {(number|string)} ind
	 * @returns {number}
	  * @method rowMin
 */


/**
* Get the maximum value in the specified row
	 * @param {(number|string)} ind
	 * @returns {number}
	  * @method rowMax
 */


/**
* Get the minimum value in the specified column
	 * @param {(number|string)} ind
	 * @returns {number}
	  * @method columnMin
 */


/**
* Get the maximum value in the specified column
	 * @param {(number|string)} ind
	 * @returns {number}
	  * @method columnMax
 */


/**
* Get the sum of the values in the specified row
	 * @param {(number|string)} ind
	 * @returns {number}
	  * @method rowSum
 */


/**
* Get the sum of the values in the specified column
	 * @param {(number|string)} ind
	 * @returns {number}
	  * @method columnSum
 */


/**
* Get the mean of the values in the specified row
	 * @param {(number|string)} ind
	 * @returns {number}
	  * @method rowMean
 */


/**
* Get the mean of the values in the specified column
	 * @param {(number|string)} ind
	 * @returns {number}
	  * @method columnMean
 */


/**
* Get the count of each unique value in the specified row
	 * @param {(number|string)} ind
	 * @returns {number}
	  * @method rowCounts
 */


/**
* Get the count of each unique value in the specified column
	 * @param {(number|string)} ind
	 * @returns {number}
	  * @method columnCounts
 */


/**
* Get the rolling mean for the specified row
	 * @param {(number|string)} ind
	 * @param {number} neighbors
	 * @param {boolean} overwrite
	 * @returns {Array}
	  * @method rowRollingMean
 */


/**
* Get the rolling mean for the specified column
	 * @param {(number|string)} ind
	 * @param {number} neighbors
	 * @param {boolean} overwrite
	 * @returns {Array}
	  * @method columnRollingMean
 */


/**
* Get the variance for the specified row
	 * @param {(number|string)} ind
	 * @returns {number}
	  * @method rowVariance
 */


/**
* Get the variance for the specified column
	 * @param {(number|string)} ind
	 * @returns {number}
	  * @method columnVariance
 */


/**
* Get the standard deviation for the specified row
	 * @param {(number|string)} ind
	 * @returns {number}
	  * @method rowStandardDeviation
 */


/**
* Get the standard deviation for the specified column
	 * @param {(number|string)} ind
	 * @returns {number}
	  * @method columnStandardDeviation
 */


/**
* Get the z scores for the specified row
	 * @param {(number|string)} ind
	 * @returns {Array}
	  * @method rowZScores
 */


/**
* Get the z scores for the specified column
	 * @param {(number|string)} ind
	 * @returns {Array}
	  * @method columnZScores
 */


/**
* TODO
	 * Sort the specified rows
	 * @returns {Table}
	  * @method rowSort
 */


/**
* TODO
	 * Sort the specified columns
	 * @returns {Table}
	  * @method columnSort
 */


/**
* Get a CSV representation of the Table
	 * @param {Object} [config]
	 * @returns {string}
	  * @method toCsv
 */


/**
* Get a TSV representation of the Table
	 * @param {Object} [config]
	 * @returns {string}
	  * @method toTsv
 */


/**
* Set the target's contents to an HTML representation of the Table
	 * @param {(Function|String|Object)} target
	 * @param {Object} [config]
	 * @returns {Table}
	  * @method html
 */


/**
* Same as {@link toString}.
	  * @method toHtml
 */


/**
* Get an HTML representation of the Table
	 * @param {Object} [config]
	 * @returns {string}
	  * @method toString
 */


/**
* Show a chart representing the Table
	 * @param {(String|HTMLElement)} [target]
	 * @param {HighchartsConfig} [config]
	 * @returns {Highcharts.Chart}
	  * @method chart
 */


/**
* Show an interactive grid representing the table
	 * @param {Object} [config]
	  * @method grid
 */


/**
* Create a new Table
	 * @param {(Object|Array|String|Number)} data
	 * @param {Object} config
	 * @returns {Table}
	 
	 * @param {string} config.format The format of the provided data, either "tsv" or "csv"
	 * @param {(Object|Array)} config.headers The table headers
	 * @param {boolean} config.hasHeaders True if the headers are the first item in the data
	 * @param {string} config.count Specify "vertical" or "horizontal" to create a table of unique item counts in the provided data
	 * @static
 * @method create
 */


/**
* Fetch a Table from a source
	 * @param {(String|Request)} input
	 * @param {Object} api
	 * @param {Object} config
	 * @returns {Promise}
	 * @static
 * @method fetch
 */


/**
* Get the count of each unique value in the data
	 * @param {Array} data
	 * @returns {Object}
	 * @static
 * @method counts
 */


/**
* Compare two values
	 * @param {(number|string)} a
	 * @param {(number|string)} b
	 * @returns {number}
	 * @static
 * @method cmp
 */


/**
* Get the sum of the provided values
	 * @param {Array} data
	 * @returns {number}
	 * @static
 * @method sum
 */


/**
* Get the mean of the provided values
	 * @param {Array} data
	 * @returns {number}
	 * @static
 * @method mean
 */


/**
* Get rolling mean for the provided values
	 * @param {Array} data
	 * @param {number} neighbors
	 * @returns {Array}
	 * @static
 * @method rollingMean
 */


/**
* Get the variance for the provided values
	 * @param {Array} data
	 * @returns {number}
	 * @static
 * @method variance
 */


/**
* Get the standard deviation for the provided values
	 * @param {Array} data
	 * @returns {number}
	 * @static
 * @method standardDeviation
 */


/**
* Get the z scores for the provided values
	 * @param {Array} data
	 * @returns {Array}
	 * @static
 * @method zScores
 */


/**
* Perform a zip operation of the provided arrays {@link https://en.wikipedia.org/wiki/Convolution_(computer_science)}
	 * @param {Array} data
	 * @returns {Array}
	 * @static
 * @method zip
 */




// *** Documentation extracted from: ..\..\..\..\voyantjs\src\util.js ***

/**
* A helper for working with the Voyant Notebook app.
 * @class Spyral.Util
 */


/**
* Generates a random ID of the specified length.
	 * @param {Number} len The length of the ID to generate?
	 * @returns {String}
	 * @static
 * @method id
 */


/**
* 
	 * @param {Array|Object|String} contents 
	 * @returns {String}
	 * @static
 * @method toString
 */


/**
* 
	 * @param {String} before 
	 * @param {String} more 
	 * @param {String} after 
	 * @static
 * @method more
 */




// *** Documentation extracted from: resources\spyral\src\metadata.js ***

/**
* A class for storing Notebook metadata
 * @class Spyral.Metadata
 */


/**
* The metadata constructor.
	 * @constructor
	 * @param {Object} config The metadata config object
	 
	 * @param {String} config.title The title of the Corpus
	 * @param {String} config.author The author of the Corpus
	 * @param {String} config.description The description of the Corpus
	 * @param {Array} config.keywords The keywords for the Corpus
	 * @param {String} config.created When the Corpus was created
	 * @param {String} config.language The language of the Corpus
	 * @param {String} config.license The license for the Corpus
	  * @method constructor
 */


/**
* Set metadata properties.
	 * @param {Object} config A config object
	  * @method set
 */


/**
* Sets the specified field to the current date and time.
	 * @param {String} field 
	  * @method setDateNow
 */


/**
* Gets the specified field as a short date.
	 * @param {String} field
	 * @returns {(String|undefined)}
	  * @method shortDate
 */


/**
* Gets the fields as a set of HTML meta tags.
	 * @returns {String}
	  * @method getHeaders
 */


/**
* Returns a clone of this Metadata
	 * @returns {Spyral.Metadata}
	  * @method clone
 */




// *** Documentation extracted from: resources\spyral\src\notebook.js ***

/**
* A helper for working with the Voyant Notebook app.
 * @class Spyral.Notebook
 */


/**
* Returns the previous block.
	 * @returns {string}
	 * @static
 * @method getPreviousBlock
 */


/**
* Returns the next block.
	 * @returns {string}
	 * @static
 * @method getNextBlock
 */


/**
* Returns the current block.
	 * @param {number} [offset] If specified, returns the block whose position is offset from the current block
	 * @returns {string}
	 * @static
 * @method getBlock
 */


/**
* 
	 * @param {*} contents 
	 * @param {*} config 
	 * @static
 * @method show
 */


/**
* Returns the target element
	 * @returns {element}
	 * @static
 * @method getTarget
 */


/**
* Fetch and return the content of a notebook or a particular cell in a notebook
	 * @param {string} url
	 * @static
 * @method import
 */


