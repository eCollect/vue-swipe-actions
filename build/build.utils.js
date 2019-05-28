/* eslint-disable no-nested-ternary */
const fs = require('fs');
const path = require('path');
const {
	green, blue, red, cyan,
} = require('chalk');

const getSize = code => `${(code.length / 1024).toFixed(2)}kb`;

module.exports.writeFile = function writeFile(dest, code) {
	const banner = dest.indexOf('.json') > -1
		? red('[json]')
		: dest.indexOf('.js') > -1
			? green('[js]  ')
			: dest.indexOf('.ts') > -1
				? cyan('[ts]  ')
				: blue('[css] ');

	return new Promise((resolve, reject) => {
		function report(extra) {
			console.log(`${banner} ${path.relative(process.cwd(), dest).padEnd(41)} ${getSize(code).padStart(8)}${extra || ''}`);
			resolve(code);
		}

		fs.writeFile(dest, code, (err) => {
			if (err) return reject(err);
			return report();
		});
	});
};

module.exports.logError = function logError(err) {
	console.error(`\n${red('[Error]')}`, err);
	console.log();
};

module.exports.createFolder = function createFolder(folder) {
	const dir = path.join(__dirname, '..', folder);
	if (!fs.existsSync(dir))
		fs.mkdirSync(dir);
};

module.exports.readFile = function readFile(file) {
	return fs.readFileSync(file, 'utf-8');
};
