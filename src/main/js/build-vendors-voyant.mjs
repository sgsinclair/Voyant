/* global process */

import closureCompiler from 'google-closure-compiler';

const filename = 'vendor-voyant.js';
const outputDir = '../webapp/resources/vendor/';

const files = [
	'node_modules/jquery/dist/jquery.min.js',
	'node_modules/d3/build/d3.min.js',
	'node_modules/spectrum-colorpicker/spectrum.js'
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