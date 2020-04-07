

// *** Documentation extracted from: ../../../../voyantjs/src/chart.js ***

/**
* Class representing a Chart.
 * @class Spyral.Chart
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
* Class representing a Corpus.
 * @class Spyral.Corpus
 */


/**
* Create a new Corpus using the specified Corpus ID
	 * @constructor
	 * @param {string} id The Corpus ID
	  * @method constructor
 */


/**
* Get the ID
	 * @return {string} The ID
	  * @method id
 */


/**
* Create a Corpus and return the ID
	 * @param {object} config 
	 * @param {object} api 
	 * @static
 * @method id
 */


/**
* Load the metadata
	 * @param {*} config 
	 * @param {*} params 
	  * @method metadata
 */


/**
* Create a Corpus and return the metadata
	 * @param {*} config 
	 * @param {*} api 
	 * @static
 * @method metadata
 */


/**
* Create a Corpus and return the summary
	 * @param {*} config 
	 * @param {*} api 
	 * @static
 * @method summary
 */


/**
* Create a Corpus and return the titles
	 * @param {*} config 
	 * @param {*} api 
	 * @static
 * @method titles
 */


/**
* Get the text
	 * @param {*} config 
	  * @method text
 */


/**
* Create a Corpus and return the text
	 * @param {*} config 
	 * @param {*} api 
	 * @static
 * @method text
 */


/**
* Create a Corpus and return the texts
	 * @param {*} config 
	 * @param {*} api 
	 * @static
 * @method texts
 */


/**
* Create a Corpus and return the terms
	 * @param {*} config 
	 * @param {*} api 
	 * @static
 * @method terms
 */


/**
* Create a Corpus and return the tokens
	 * @param {*} config 
	 * @param {*} api 
	 * @static
 * @method tokens
 */


/**
* Create a Corpus and return an array of lexical forms (words) in document order.
	 * @param {object} config 
	 * @param {object} api 
	 * @static
 * @method words
 */


/**
* Create a Corpus and return the contexts
	 * @param {object} config 
	 * @param {object} api 
	 * @static
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


