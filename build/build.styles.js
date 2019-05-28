// const path = require('path');
// const stylus = require('stylus');
// const rtl = require('postcss-rtl');

const postcss = require('postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const buildConf = require('./build.conf');
const buildUtils = require('./build.utils');

function prepareCSS(src) {
	return new Promise(resolve => resolve(src.reduce((c, file) => `${c}${buildUtils.readFile(file)}\n`, buildConf.banner)));
}

function generateUMD(name, code, ext = '') {
	return buildUtils.writeFile(`dist/${buildConf.name}${name}${ext}.css`, code, true)
		.then(fcode => cssnano.process(fcode, { from: undefined }))
		.then(fcode => buildUtils.writeFile(`dist/${buildConf.name}${name}${ext}.min.css`, fcode.css, true));
}

function generateFiles({ sources, name = '' }) {
	return prepareCSS(sources)
		// .then(code => code)
		// .then(code => compileStylus(code))
		.then(code => postcss([autoprefixer]).process(code, { from: undefined }))
		.then((code) => {
			code.warnings().forEach((warn) => {
				console.warn(warn.toString());
			});
			return code.css;
		})
		.then(code => Promise.all([
			generateUMD(name, code),
		]));
}

function generateBase() {
	const src = 'src/styles/vue-swipe-actions.css';
	return generateFiles({ sources: [src] });
}

Promise
	.all([
		generateBase(),
	])
	.catch((e) => {
		console.error(e);
	});
