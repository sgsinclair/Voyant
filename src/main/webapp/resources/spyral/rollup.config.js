import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default {
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
		resolve(),
		babel({
			include: 'node_modules/voyant/**'
		})
	],
	external: ['highcharts']
};
