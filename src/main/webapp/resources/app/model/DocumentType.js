Ext.define('Voyant.model.DocumentType', {
	extend: 'Ext.data.Model',
	fields: [
		{name:'type',mapping:'@type'},
		{name:'docId',mapping:'@docId'},
		{name:'docIndex',mapping:'@docIndex',type:'int'},
		{name:'rawFreq',mapping:'@rawFreq',type:'int'},
		{name:'rawZscore',mapping:'@rawZscore',type:'float'},
		{name:'rawZscoreCorpusDelta',mapping:'@rawZscoreCorpusDelta',type:'float'},
		{name:'relativeFreqCorpusDelta',mapping:'@relativeFreqCorpusDelta',type:'float'},
		{name:'relativeFreq',mapping:'@relativeFreq',type:'float'},
		{name:'rawDistributionMin',mapping:'@rawDistributionMin',type:'int'},
		{name:'rawDistributionMax',mapping:'@rawDistributionMax',type:'int'},
		{name:'rawDistributionMean',mapping:'@rawDistributionMean',type:'float'},
		{name:'rawDistributionStdDev',mapping:'@rawDistributionStdDev',type:'float'},
		{name:'rawDistributionKurtosis',mapping:'@rawDistributionKurtosis',type:'float'},
		{name:'rawDistributionSkewness',mapping:'@rawDistributionSkewness',type:'float'},
		{name:'distributionFreqs',mapping:'int-array'},
		{name : 'relativeFreqs', 	mapping : 'relativeFreqs', convert: function(val){
			return val['float-array'];
		}},
		{name : 'rawFreqs', 	mapping : 'rawFreqs', convert: function(val){
			return val['int-array'];
		}}
	],
	belongsTo: 'Document'
});