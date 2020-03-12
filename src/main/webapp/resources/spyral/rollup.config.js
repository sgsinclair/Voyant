import resolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';

let config = {
	input: 'src/index.js',
	output: {
		file: 'build/spyral.js',
		format: 'iife',
		name: 'Spyral',
		globals: {
			highcharts: 'Highcharts'
		}
	},
	plugins: [
		resolve()
	],
	external: ['highcharts']
};

// https://rollupjs.org/guide/en/#babel
if (process.env.LOCAL_VOYANT === 'true') {
	config.plugins.push(babel({
		exclude: 'node_modules/**' // for local dev, when voyantjs is loaded/linked from local install
	}))
} else {
	config.plugins.push(babel({
		include: 'node_modules/voyant/**' // for normal build, when voyantjs is loaded from npm
	}))
}

export default config;
