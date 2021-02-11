/* global process */

import closureCompiler from 'google-closure-compiler';

const filename = 'vendor-spyral.js';
const outputDir = '../webapp/resources/vendor/';

const files = [
	'node_modules/ace-builds/src-min-noconflict/ace.js',
	'node_modules/ckeditor4/ckeditor.js',
	'node_modules/highcharts/highcharts.js',
	'node_modules/highcharts/modules/data.js',
	'node_modules/highcharts/modules/networkgraph.js',
	'../webapp/resources/octokitrest/octokit-rest-17.10.0.js'
];

const {compiler} = closureCompiler;
const Compiler = new compiler({
	compilation_level: 'BUNDLE',
	js: files,
	js_output_file: `${outputDir}${filename}`
});

Compiler.run((exitCode, stdout, stderr) => {
	if (stderr.trim() === '') {
		process.exitCode = 0;
	} else {
		console.log(stderr);
		process.exitCode = 1;
	}
});