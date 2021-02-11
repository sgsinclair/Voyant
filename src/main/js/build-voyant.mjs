/* global process */

import { readFileSync, existsSync } from 'fs';
import closureCompiler from 'google-closure-compiler';

const filename = 'voyant.js';
const filename_min = 'voyant.min.js';
const filename_min_map = 'voyant.min.map.js';
const outputDir = '../webapp/resources/voyant/current/';

console.log('fetching list of files');
const buffer = readFileSync(new URL('./voyant-js.txt', import.meta.url));
const lines = buffer.toString().split('\n');
const files = lines.filter(v => {
	if (v.startsWith('#') || v.trim() === '') {
		return false;
	}
	if (existsSync(v)) {
		return true;
	} else {
		throw new Error(`File ${v} doesn't exist!`);
	}
});

const now = new Date().toUTCString();

const {compiler} = closureCompiler;
const Compiler1 = new compiler({
	compilation_level: 'BUNDLE',
	js: files,
	js_output_file: `${outputDir}${filename}`,
	language_in: 'ECMASCRIPT_2019',
	language_out: 'ECMASCRIPT5'
});
const Compiler2 = new compiler({
	compilation_level: 'SIMPLE',
	strict_mode_input: false,
	jscomp_off: ['misplacedTypeAnnotation', 'uselessCode', 'suspiciousCode'],
	js: files,
	js_output_file: `${outputDir}${filename_min}`,
	create_source_map: `${outputDir}${filename_min_map}`,
	source_map_include_content: true,
	output_wrapper: `/* generated: ${now} */\n%output%\n//# sourceMappingURL=${filename_min_map}`,
	language_in: 'ECMASCRIPT_2019',
	language_out: 'ECMASCRIPT5'
});

console.log('creating bundle');
Compiler1.run((exitCode, stdout, stderr) => {
	if (stderr.trim() !== '') {
		console.log(stderr);
		process.exitCode = 1;
	} else {
		console.log('creating minified bundle');
		Compiler2.run((exitCode, stdout, stderr) => {
			if (stderr.trim() === '') {
				process.exitCode = 0;
			} else {
				console.log(stderr);
				process.exitCode = 1;
			}
		});
	}
});