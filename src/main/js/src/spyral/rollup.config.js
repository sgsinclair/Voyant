/* global process */

import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import {terser} from 'rollup-plugin-terser';

let config = {
	input: 'src/spyral/src/index.js',
	output: [{
		file: '../webapp/resources/spyral/spyral.js',
		format: 'iife',
		name: 'Spyral',
		globals: {
			highcharts: 'Highcharts'
		}
	},{
		file: '../webapp/resources/spyral/spyral.min.js',
		format: 'iife',
		name: 'Spyral',
		globals: {
			highcharts: 'Highcharts'
		},
		plugins: [terser()]
	}],
	plugins: [
		resolve(),
		commonjs()
	],
	external: ['highcharts']
};

// https://rollupjs.org/guide/en/#babel
if (process.env.LOCAL_VOYANT === 'true') {
	config.plugins.push(babel({
		presets: [
			['@babel/preset-env', {corejs: 3, useBuiltIns: 'usage'}]
		],
		plugins: [
			'@babel/plugin-proposal-class-properties'
		],
		exclude: 'node_modules/**' // for local dev, when voyantjs is loaded/linked from local install
	}));
} else {
	config.plugins.push(babel({
		presets: [
			['@babel/preset-env', {corejs: 3, useBuiltIns: 'usage'}]
		],
		plugins: [
			'@babel/plugin-proposal-class-properties'
		],
		include: 'node_modules/voyant/**' // for normal build, when voyantjs is loaded from npm
	}));
}

export default config;
