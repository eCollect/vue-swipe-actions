/* eslint-disable no-undef */
process.env.BABEL_ENV = JSON.stringify('production');

const { resolve } = require('path');

const buildHelpers = require('./build.javascript.helpers.js');

const builds = [
	{
		rollup: {
			input: {
				input: resolve('src/index.esm.js'),
			},
			output: {
				file: resolve('dist/vue-swipe-actions.esm.js'),
				format: 'es',
			},
		},
		build: { minified: true, minExt: false },
	},
	{
		rollup: {
			input: {
				input: resolve('src/index.esm.js'),
			},
			output: {
				file: resolve('dist/vue-swipe-actions.common.js'),
				format: 'cjs',
			},
		},
		build: {
			minified: true,
			minExt: false,
		},
	},
	{
		rollup: {
			input: {
				input: resolve('src/index.umd.js'),
			},
			output: {
				file: resolve('dist/vue-swipe-actions.umd.js'),
				format: 'umd',
			},
		},
		build: {
			requireVue: true,
			unminified: true,
			minified: true,
		},
	},
];


buildHelpers.build(builds);
