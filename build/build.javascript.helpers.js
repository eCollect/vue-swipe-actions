const nodeResolve = require('rollup-plugin-node-resolve');
const buble = require('rollup-plugin-buble');
const json = require('rollup-plugin-json');
// const vue = require('rollup-plugin-vue');
// const commonjs = require('rollup-plugin-commonjs');
const rollup = require('rollup');
const uglify = require('uglify-es');

const buildConf = require('./build.conf');
const buildUtils = require('./build.utils.js');

const bubleConfig = {
	objectAssign: 'Object.assign',
};

function addExtension(filename, ext = 'min') {
	const insertionPoint = filename.lastIndexOf('.');
	return `${filename.slice(0, insertionPoint)}.${ext}${filename.slice(insertionPoint)}`;
}

function injectVueRequirement(code) {
	const index = code.indexOf('Vue = Vue && Vue.hasOwnProperty(\'default\') ? Vue[\'default\'] : Vue');

	if (index === -1) {
		console.error('UMD code could not find Vue initial declaration. Aborting...');
		process.exit(1);
	}

	const checkMe = ` if (Vue === void 0) {
	  console.error('[ Quasar ] Vue is required to run. Please add a script tag for it before loading Quasar.')
	  return
	}
	`;

	return code.substring(0, index - 1) + checkMe + code.substring(index);
}

function buildEntry(config) {
	return rollup
		.rollup(config.rollup.input)
		.then(bundle => bundle.generate(config.rollup.output))
		.then(({ output }) => {
			const code = config.build.requireVue === true
				? injectVueRequirement(output[0].code)
				: output[0].code;

			return config.build.unminified
				? buildUtils.writeFile(config.rollup.output.file, code)
				: code;
		})
		.then((code) => {
			if (!config.build.minified)
				return code;


			const minified = uglify.minify(code, {
				compress: {
					pure_funcs: ['makeMap'],
				},
			});

			if (minified.error)
				return new Promise((resolve, reject) => reject(minified.error));

			return buildUtils.writeFile(
				config.build.minExt !== false
					? addExtension(config.rollup.output.file)
					: config.rollup.output.file,
				buildConf.banner + minified.code,
				true,
			);
		})
		.catch((err) => {
			console.error(err);
			process.exit(1);
		});
}

function genConfig(opts) {
	// const vueOpts = opts.vue || { compileTemplate: true };
	const prePlugins = opts.prePlugins || [];
	const plugins = [
		...prePlugins,
		nodeResolve({
			extensions: ['.js'],
			preferBuiltins: false,
		}),
		json(),
		// commonjs(),
		// vue({ compileTemplate: true }),
		buble(bubleConfig),
		...(opts.afterPLugins || []),
		/*
		buble(bubleConfig),
		nodeResolve({
			// extensions: ['.js'],
			preferBuiltins: false,
		}),
		/*
		json(),
		*/
	];

	opts.rollup.input.plugins = plugins;
	opts.rollup.output.banner = buildConf.banner;
	opts.rollup.output.name = opts.rollup.output.name || 'vue-swipe-actions';

	opts.rollup.input.external = opts.rollup.input.external || [];
	opts.rollup.input.external.push('vue');

	opts.rollup.output.globals = opts.rollup.output.globals || {};
	opts.rollup.output.globals.vue = 'Vue';

	return opts;
}

function build(builds) {
	return Promise
		.all(builds.map(genConfig).map(buildEntry))
		.catch(buildUtils.logError);
}

module.exports = {
	build,
};
