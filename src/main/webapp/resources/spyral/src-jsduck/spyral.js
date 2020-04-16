

// *** Documentation extracted from: ../../../../voyantjs/src/categories.js ***



// *** Documentation extracted from: ../../../../voyantjs/src/chart.js ***

/**
* Class representing a Chart.
 * @class Spyral.Chart
 */


/**
* Construct a new Chart class
	 * @constructor
	 * @param {element} target 
	 * @param {array} data 
	  * @method constructor
 */


/**
* Create a new chart
	 * See {@link https://api.highcharts.com/highcharts/} for full set of config options.
	 * @param {(string|element)} target 
	 * @param {HighchartsConfig} config 
	 * @returns {Highcharts.Chart}
	  * @method create
 */


/**
* Create a new chart
	 * See {@link https://api.highcharts.com/highcharts/} for full set of config options.
	 * @param {(string|element)} target 
	 * @param {HighchartsConfig} config 
	 * @returns {Highcharts.Chart}
	 * @static
 * @method create
 */


/**
* Sets the default chart type
	 * @param {object} config The chart config object
	 * @param {string} type The type of chart
	 * @static
 * @method setDefaultChartType
 */


/**
* Add the provided data to the config as a series
	 * @param {object} config 
	 * @param {array} data 
	 * @static
 * @method setSeriesData
 */


/**
* Create a bar chart
	 * @param {object} [config]
	 * @returns {Highcharts.Chart}
	  * @method bar
 */


/**
* Create a bar chart
	 * @param {element} target 
	 * @param {object} config 
	 * @returns {Highcharts.Chart}
	 * @static
 * @method bar
 */


/**
* Create a line chart
	 * @param {object} [config]
	 * @returns {Highcharts.Chart}
	  * @method line
 */


/**
* Create a line chart
	 * @param {element} target 
	 * @param {object} config 
	 * @returns {Highcharts.Chart}
	 * @static
 * @method line
 */


/**
* Create a scatter plot
	 * @param {object} [config]
	 * @returns {Highcharts.Chart}
	  * @method scatter
 */


/**
* Create a scatter plot
	 * @param {element} target 
	 * @param {object} config 
	 * @returns {Highcharts.Chart}
	 * @static
 * @method scatter
 */


/**
* Create a network graph
	 * @param {object} [config]
	 * @returns {Highcharts.Chart}
	  * @method networkgraph
 */


/**
* Create a network graph
	 * @param {element} target 
	 * @param {object} config 
	 * @returns {Highcharts.Chart}
	 * @static
 * @method networkgraph
 */




// *** Documentation extracted from: ../../../../voyantjs/src/load.js ***

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
	 * @param {object} config 
	 * @param {object} params
	 * @returns {JSON}
	 * @static
 * @method trombone
 */


/**
* Fetch content from a URL, often resolving cross-domain data constraints
	 * @param {string} urlToFetch 
	 * @param {object} config
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




// *** Documentation extracted from: ../../../../voyantjs/src/table.js ***

/**
* Class representing a Table.
 * @class Spyral.Table
 */


/**
* Create a new Table
	 * @constructor
	 * @param {(object|array|string|number)} data
	 * @param {TableConfig} config
	  * @method constructor
 */


/**
* Set the headers for the Table
	 * @param {(object|array)} data
	 * @returns {Table}
	  * @method setHeaders
 */


/**
* Add rows to the Table
	 * @param {array} data
	 * @returns {Table}
	  * @method addRows
 */


/**
* Add a row to the Table
	 * @param {(array|object)} data
	 * @returns {Table}
	  * @method addRow
 */


/**
* Set a row
	 * @param {(number|string)} ind The row index
	 * @param {(object|array)} data
	 * @param {boolean} create
	 * @returns {Table}
	  * @method setRow
 */


/**
* Set a column
	 * @param {(number|string)} ind The column index
	 * @param {(object|array)} data
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
	 * @param {(object|string)} config
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
	 * @param {(boolean|array|number|string)} [inds]
	 * @param {(object|number|string)} [config]
	 * @returns {number|array}
	  * @method rows
 */


/**
* Get the specified row
	 * @param {(number|string)} ind
	 * @param {boolean} [asObj]
	 * @returns {(number|string|object)}
	  * @method row
 */


/**
* This function returns different values depending on the arguments provided.
	 * When there are no arguments, it returns the number of columns in this table.
	 * When the first argument is the boolean value `true` all columns are returned.
	 * When the first argument is a number a slice of the columns is returned and if
	 * the second argument is a number it is treated as the length of the slice to
	 * return (note that it isn't the `end` index like with Array.slice()).
	 * @param {(boolean|array|number|string)} [inds]
	 * @param {(object|number|string)} [config]
	 * @returns {number|array}
	  * @method columns
 */


/**
* Get the specified column
	 * @param {(number|string)} ind
	 * @param {boolean} [asObj]
	 * @returns {(number|string|object)}
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
	 * @param {(boolean|array|number|string)} inds
	 * @returns {(number|array)}
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
	 * @param {function} fn
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
	 * @returns {array}
	  * @method rowRollingMean
 */


/**
* Get the rolling mean for the specified column
	 * @param {(number|string)} ind
	 * @param {number} neighbors
	 * @param {boolean} overwrite
	 * @returns {array}
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
	 * @returns {array}
	  * @method rowZScores
 */


/**
* Get the z scores for the specified column
	 * @param {(number|string)} ind
	 * @returns {array}
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
	 * @param {object} [config]
	 * @returns {string}
	  * @method toCsv
 */


/**
* Get a TSV representation of the Table
	 * @param {object} [config]
	 * @returns {string}
	  * @method toTsv
 */


/**
* Set the target's contents to an HTML representation of the Table
	 * @param {(function|string|object)} target
	 * @param {object} [config]
	 * @returns {Table}
	  * @method html
 */


/**
* Get an HTML representation of the Table
	 * @param {object} [config]
	 * @returns {string}
	  * @method toString
 */


/**
* Show a chart representing the Table
	 * @param {(string|element)} [target]
	 * @param {HighchartsConfig} [config]
	 * @returns {Highcharts.Chart}
	  * @method chart
 */


/**
* Create a new Table
	 * @param {(object|array|string|number)} data
	 * @param {TableConfig} config
	 * @returns {Table}
	 * @static
 * @method create
 */


/**
* Fetch a Table from a source
	 * @param {string|Request} input
	 * @param {object} api
	 * @param {object} config
	 * @returns {Promise}
	 * @static
 * @method fetch
 */


/**
* Get the count of each unique value in the data
	 * @param {array} data
	 * @returns {object}
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
	 * @param {array} data
	 * @returns {number}
	 * @static
 * @method sum
 */


/**
* Get the mean of the provided values
	 * @param {array} data
	 * @returns {number}
	 * @static
 * @method mean
 */


/**
* Get rolling mean for the provided values
	 * @param {array} data
	 * @param {number} neighbors
	 * @returns {array}
	 * @static
 * @method rollingMean
 */


/**
* Get the variance for the provided values
	 * @param {array} data
	 * @returns {number}
	 * @static
 * @method variance
 */


/**
* Get the standard deviation for the provided values
	 * @param {array} data
	 * @returns {number}
	 * @static
 * @method standardDeviation
 */


/**
* Get the z scores for the provided values
	 * @param {array} data
	 * @returns {array}
	 * @static
 * @method zScores
 */


/**
* Perform a zip operation of the provided arrays {@link https://en.wikipedia.org/wiki/Convolution_(computer_science)}
	 * @param {array} data
	 * @returns {array}
	 * @static
 * @method zip
 */




// *** Documentation extracted from: ../../../../voyantjs/src/corpus.js ***

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
 * The `loadCorpus` method is actually an alias, so the full form of this would actually be something like this:
 * 
 * 	Spyral.Corpus.load("Hello World").then(corpus -> corpus.summary());
 * 
 * But we like our short-cuts, so the first form is the preferred form.
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
 * 		loadCorpus("goldbug");
 * 
 * 		loadCorpus("goldbug", {
 *			// if corpus ID "goldbug" isn't found, use the input
 * 			input: "https://gist.githubusercontent.com/sgsinclair/84c9da05e9e142af30779cc91440e8c1/raw/goldbug.txt",
 * 			inputRemoveUntil: 'THE GOLD-BUG',
 * 			inputRemoveFrom: 'FOUR BEASTS IN ONE'
 * 		});
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
	 * @return {Promise/String} a Promise for the string ID of the corpus
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
	 * 		[
     * 			{
     *   			"id": "ddac6b12c3f4261013c63d04e8d21b45",
     *   			"extra.X-Parsed-By": "org.apache.tika.parser.DefaultParser",
     *   			"tokensCount-lexical": "33559",
     *   			"lastTokenStartOffset-lexical": "259750",
     *   			"parent_modified": "1548457455000",
     *   			"typesCount-lexical": "4235",
     *   			"typesCountMean-lexical": "7.924203",
     *   			"lastTokenPositionIndex-lexical": "33558",
     *   			"index": "0",
     *   			"language": "en",
     *   			"sentencesCount": "1302",
     *   			"source": "stream",
     *   			"typesCountStdDev-lexical": "46.626404",
     *   			"title": "1790 Love And Freindship",
     *   			"parent_queryParameters": "VOYANT_BUILD=M16&textarea-1015-inputEl=Type+in+one+or+more+URLs+on+separate+lines+or+paste+in+a+full+text.&VOYANT_REMOTE_ID=199.229.249.196&accessIP=199.229.249.196&VOYANT_VERSION=2.4&palette=default&suppressTools=false",
     *   			"extra.Content-Type": "text/plain; charset=windows-1252",
     *   			"parentType": "expansion",
     *   			"extra.Content-Encoding": "windows-1252",
     *   			"parent_source": "file",
     *   			"parent_id": "ae47e3a72cd3cad51e196e8a41e21aec",
     *   			"modified": "1432861756000",
     *   			"location": "1790 Love And Freindship.txt",
     *   			"parent_title": "Austen",
     *   			"parent_location": "Austen.zip"
     *   		}
     *  	 ]
	 * 
	 * In Corpus mode there's no reason to specify arguments. In documents mode you
	 * can request specific documents in the config object:
	 * 
	 *  * **start**: the zero-based start of the list
	 *  * **limit**: a limit to the number of items to return at a time
	 *  * **docIndex**: a zero-based list of documents (first document is zero, etc.); multiple documents can be separated by a comma
	 *  * **docId**: a set of document IDs; multiple documents can be separated by a comma
	 *  * **query**: one or more term queries for the title, author or full-text
	 *  * **sort**: one of the following sort orders (composed of a feature like `INDEX` and a sort direction `ASC` or `DESC`): `INDEXASC`, `INDEXDESC`, `TITLEASC`, `TITLEDESC`, `AUTHORASC`, `AUTHORDESC`, `TOKENSCOUNTLEXICALASC`, `TOKENSCOUNTLEXICALDESC`, `TYPESCOUNTLEXICALASC`, `TYPESCOUNTLEXICALDESC`, `TYPETOKENRATIOLEXICALASC`, `TYPETOKENRATIOLEXICALDESC`, `PUBDATEASC`, `PUBDATEDESC`
	 * 
	 *  An example:
	 *  
	 *  	// this would show the number 8 (the size of the corpus)
	 *  	loadCorpus("austen").metadata().then(metadata => metadata.documentsCount)
	 *  
	 * @param {Object} config an Object specifying parameters (see list above)
	 * @return {Promise/Object} a Promise for an Object containing metadata
	  * @method metadata
 */


/**
* Get a Promise for a brief summary of the corpus that includes essential metadata (documents count, terms count, etc.) 
	 * 
	 * An example:
	 * 
	 * 		loadCorpus("austen").summary();
	 * 
	 * @return {Promise/String} a Promise for a string containing a brief summary of the corpus metadata
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
	 *  * **sort**: one of the following sort orders (composed of a feature like `INDEX` and a sort direction `ASC` or `DESC`): `INDEXASC`, `INDEXDESC`, `TITLEASC`, `TITLEDESC`, `AUTHORASC`, `AUTHORDESC`, `TOKENSCOUNTLEXICALASC`, `TOKENSCOUNTLEXICALDESC`, `TYPESCOUNTLEXICALASC`, `TYPESCOUNTLEXICALDESC`, `TYPETOKENRATIOLEXICALASC`, `TYPETOKENRATIOLEXICALDESC`, `PUBDATEASC`, `PUBDATEDESC`
	 * 
	 * An example:
	 * 
	 * 		loadCorpus("austen").titles().then(titles => "The last work is: "+titles[titles.length-1])
	 * 
	 * @param {Object} config an Object specifying parameters (see list above) 
	 * @returns {Promise/Array} a Promise for an Array of document titles  
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
	 * 		// fetch 1000 characters from each text in the corpus into a single string
	 * 		loadCorpus("austen").text({limit:1000})
	 * 
	 * @param {Object} config an Object specifying parameters (see list above)
	 * @returns {Promise/String} a Promise for a string of the corpus
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
	 * 		// fetch 1000 characters from each text in the corpus into an Array
	 * 		loadCorpus("austen").texts({limit:1000})
	 * 
	 * @param {Object} config an Object specifying parameters (see list above)
	 * @returns {Promise/String} a Promise for an Array of texts from the corpus
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
	 * 		{
	 * 			"term": "the",
	 * 			"inDocumentsCount": 8,
	 * 			"rawFreq": 28292,
	 * 			"relativeFreq": 0.036189996,
	 * 			"comparisonRelativeFreqDifference": 0
	 * 		}
	 * 
	 * The following is an example of Document Term (documents mode):
	 * 
	 * 		{
	 * 			"term": "the",
	 * 			"rawFreq": 1333,
	 * 			"relativeFreq": 39721.086,
	 * 			"zscore": 28.419,
	 * 			"zscoreRatio": -373.4891,
	 * 			"tfidf": 0.0,
	 * 			"totalTermsCount": 33559,
 	 * 			"docIndex": 0,
	 * 			"docId": "8a61d5d851a69c03c6ba9cc446713574"
	 * 		}
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
	 * 
	 * The following are specific to corpus mode:
	 * 
	 *  * **bins**: by default there are the same number of bins as there are documents (for distribution values), this can be modified
	 *  * **corpusComparison**: you can provide the ID of a corpus for comparison of frequency values
	 *  * **inDocumentsCountOnly**: if you don't need term frequencies but only frequency per document set this to true
	 *  * **sort**: the order of the terms, one of the following (composed of a value and a direction of ASCending or DEScending: `INDOCUMENTSCOUNTASC, INDOCUMENTSCOUNTDESC, RAWFREQASC, RAWFREQDESC, TERMASC, TERMDESC, RELATIVEPEAKEDNESSASC, RELATIVEPEAKEDNESSDESC, RELATIVESKEWNESSASC, RELATIVESKEWNESSDESC, COMPARISONRELATIVEFREQDIFFERENCEASC, COMPARISONRELATIVEFREQDIFFERENCEDESC`
	 *  
	 *  The following are specific to documents mode:
	 * 
	 *  * **bins**: by default the document is divided into 10 equal bins(for distribution values), this can be modified
	 *  * **sort**: the order of the terms, one of the following (composed of a value and a direction of ASCending or DEScending: `RAWFREQASC, RAWFREQDESC, RELATIVEFREQASC, RELATIVEFREQDESC, TERMASC, TERMDESC, TFIDFASC, TFIDFDESC, ZSCOREASC, ZSCOREDESC`
	 *  * **perDocLimit**: the `limit` parameter is for the total number of terms returned, this parameter allows you to specify a limit value per document
	 *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
	 *  * **docId**: the document IDs to include (use commas to separate multiple values)
	 *  
	 * An example:
	 * 
	 * 		// show top 5 terms
   	 * 		loadCorpus("austen").terms({stopList: 'auto', limit: 5}).then(terms => terms.map(term => term.term))
   	 * 
   	 *		// show top term for each document
   	 * 		loadCorpus("austen").terms({stopList: 'auto', perDocLimit: 1, mode: 'documents'}).then(terms => terms.map(term => term.term))
   	 * 
	 * @param {Object} config an Object specifying parameters (see list above)
	 * @returns {Promise/Array} a Promise for a Array of Terms
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
	 * 		// load the first 20 tokens (don't include tags, spaces, etc.)
	 * 		loadCorpus("austen").tokens({limit: 20, noOthers: true})
	 * 
	 * @param {Object} config an Object specifying parameters (see above)
	 * @returns {Promise/Array} a Promise for an Array of document tokens
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
	 * 		// load the first 20 words in the corpus
	 * 		loadCorpus("austen").tokens({limit: 20})
	 * 
	 * @param {Object} config an Object specifying parameters (see above)
	 * @returns {Promise/Array} a Promise for an Array of words
	  * @method words
 */


/**
* Get a Promise for an Array of Objects that contain keywords in contexts (KWICs).
	 * 
	 * An individual KWIC Object looks something like this:
	 * 
	 * 
	  * @method contexts
 */


/**
* Create a Corpus and return the collocates
	 * @param {object} config 
	 * @param {object} api 
	 * @static
 * @method collocates
 */


/**
* Create a Corpus and return the phrases
	 * @param {object} config 
	 * @param {object} api 
	 * @static
 * @method phrases
 */


/**
* Create a Corpus and return the correlations
	 * @param {object} config 
	 * @param {object} api 
	 * @static
 * @method correlations
 */


/**
* Create a Corpus and return the tool
	 * @param {*} tool 
	 * @param {*} config 
	 * @param {*} api 
	 * @static
 * @method tool
 */


/**
* Create a new Corpus using the provided config
	 * @param {object} config 
	 * @static
 * @method create
 */


/**
* Load a Corpus using the provided config
	 * @param {object} config The Corpus config
	 * @static
 * @method load
 */




// *** Documentation extracted from: resources/spyral/src/util.js ***

/**
* A helper for working with the Voyant Notebook app.
 * @namespace
 * @class Spyral.Util
 */


/**
* Generates a random ID of the specified length.
	 * @static
	 * @param {number} len The length of the ID to generate?
	 * @returns {string}
	 * @static
 * @method id
 */


/**
* 
	 * @static
	 * @param {*} contents 
	 * @param {*} config 
	 * @returns {string}
	 * @static
 * @method toString
 */


/**
* 
	 * @static
	 * @param {*} before 
	 * @param {*} more 
	 * @param {*} after 
	 * @static
 * @method more
 */




// *** Documentation extracted from: resources/spyral/src/metadata.js ***

/**
* A class for storing Notebook metadata
 * @class Spyral.Metadata
 */


/**
* The metadata constructor.
	 * @constructor
	 * @param {MetadataConfig} config The metadata config object
	  * @method constructor
 */


/**
* Set metadata properties.
	 * @param {object} config A config object
	  * @method set
 */


/**
* Sets the specified field to the current date and time.
	 * @param {string} field 
	  * @method setDateNow
 */


/**
* Gets the specified field as a short date.
	 * @param {string} field
	 * @returns {string|undefined}
	  * @method shortDate
 */


/**
* Gets the fields as a set of HTML meta tags.
	 * @returns {string}
	  * @method getHeaders
 */




// *** Documentation extracted from: resources/spyral/src/notebook.js ***

/**
* A helper for working with the Voyant Notebook app.
 * @namespace
 * @class Spyral.Notebook
 */


/**
* Returns the previous block.
	 * @static
	 * @returns {string}
	 * @static
 * @method getPreviousBlock
 */


/**
* Returns the next block.
	 * @static
	 * @returns {string}
	 * @static
 * @method getNextBlock
 */


/**
* Returns the current block.
	 * @static
	 * @params {number} [offset] If specified, returns the block whose position is offset from the current block
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


