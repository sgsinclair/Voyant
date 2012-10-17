[{
	type: 'text',
	content: '<p>Voyant Notebook Table Frequencies #1</p>'
},{
	type: 'code',
	content: 'var sentence = "This is the example.";'
},{
	type: 'code',
	content: 'var words = sentence.toLowerCase().replace(/^\\W+/, "").replace(/\\W+$/, "").split(/\\W+/);\noutput(words);'
},{
	type: 'code',
	content: 'output(Voyant.data.Table.getFrequenciesTable(words).toHtmlTable())'
}]