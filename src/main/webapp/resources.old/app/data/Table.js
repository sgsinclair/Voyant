function IsNumeric(val) {

    if (isNaN(parseFloat(val))) {
          return false;
     }

     return true;
}

//app data table
//(not utils for now)
//Voyant/src/main/webapp/data
// Assumption: Input will be (1) in two dimensional array form and 
// (2) with row and column headings in the first column and first row, respectively

var VoyantNotebooks = {};
VoyantNotebooks.Table = function (inputArray) {

    // Variables
    this._table = [];
    this._rows = {};
    this._columns = {};

    // Functions
    this._constructTable = function(tableArray) {
        
        var rowCount = tableArray.length;
        var columnCount = tableArray[0].length; // QUESTION: Is this safe? Should we expect row and column headings/correct input?

        // Build row and column index hashtables
        for (rowIndex = 1; rowIndex < rowCount; rowIndex++){
            this._rows[tableArray[rowIndex][0]] = rowIndex - 1;
        }

        for (columnIndex = 1; columnIndex < columnCount; columnIndex++){
            this._columns[tableArray[0][columnIndex]] = columnIndex - 1;
        }

        // Construct the table from new memory of size rowCount - 1, columnCount - 1
        this._table = new Array(rowCount - 1);
        for (rowIndex = 1; rowIndex < rowCount; rowIndex++){
            
            this._table[rowIndex - 1] = new Array(columnCount - 1);
            
            for (columnIndex = 1; columnIndex < columnCount; columnIndex++){
                this._table[rowIndex - 1][columnIndex - 1] = tableArray[rowIndex][columnIndex];
            }
        }
    
    };

    // Row() and Column() return a copy of the requested data
    // QUESTION: Is this the standard we want to follow? 
    this.Row = function(rowName) {
        return new Array(this._table[this._rows[rowName]]);  
    };
    
    this.Column = function(columnName) {
        var tempColumn = new Array(this._table.length);
        var columnIndex = this._columns[columnName];
        for (index = 0; index < Object.keys(this._columns).length; index++){
            tempColumn[index] = this._table[index][columnIndex];  
        }
        return tempColumn;
    };
    
    this.Index = function(rowName, columnName) {
        var rowIndex = IsNumeric(rowName) ? rowName : this._rows[rowName];
        var columnIndex = IsNumeric(columnName) ? columnName : this._columns[columnName];
        return this._table[rowIndex][columnIndex];    
    };

    // Construction
    this._constructTable(inputArray);


    /*this.getFrequencies = function () {
        for (var key in this.table){
            if (!IsNumeric(key)){
                window.alert(key + ": " + this.table[key].frequency);
            }
        }
    };

    this._buildMetaData = function (table) {

        for (lineIndex = 0; lineIndex < table.length; lineIndex++) {

            // Split each line on spaces and calculate the frequency of each unique word in the table
            lineTokens = table[lineIndex].split(" ");
            for (tokenIndex = 0; tokenIndex < lineTokens.length; tokenIndex++) {
                if (lineTokens[tokenIndex] in table) {
                    table[lineTokens[tokenIndex]].frequency++;
                } else {
                    table[lineTokens[tokenIndex]] = new VoyantNotebooks.TableEntry(lineTokens[tokenIndex]);
                }
            }
        }
    };

    this._cleanupAndTokenize = function (lineArray){
        
    };

    // Variables
    this.lines = lineArray.slice(0);
    this.tokens = this._cleanupAndTokenize(this.lines);
    this.metadata = {}

    this._setFrequencyTable(this.table);
    */

};

VoyantNotebooks.TableEntry = function (token) {

    this._token = token;
    this.frequency = 1;

    this.setFrequency = function (newFrequency) {
        this.frequency = newFrequency;
    };
};

//var docLines = ["What about Bob?", "You mean, What about Bill Murray?"];
//var xTable = new VoyantNotebooks.Table(docLines);

//window.alert(xTable.getFrequencies());

// Table example
/*

Table = function () {
    
    this.data = [[0, 1, 2],
                 [3, 4, 5],
                 [6, 7, 8]];
    this.columns = { 'col1' : 0, 'col2' : 1, 'col3' : 2 };
    this.rows = { 'row1' : 0, 'row2' : 1, 'row3' : 2 };
    
    this.Row = function(rowName) {
        return this.data[this.rows[rowName]];  
    };
    
    this.Column = function(columnName) {
        var tempColumn = new Array(this.data.length);
        var columnIndex = this.columns[columnName];
        for (index = 0; index < Object.keys(this.columns).length; index++){
            tempColumn[index] = this.data[index][columnIndex];  
        }
        return tempColumn;
    };
    
    this.RowColumn = function(rowName, columnName) {
        return this.data[this.rows[rowName]][this.columns[columnName]];    
    };
    
};


var x = new Table();
window.alert(x.RowColumn('row1','col2'));

*/