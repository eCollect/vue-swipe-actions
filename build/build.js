/* eslint-disable global-require */
process.env.NODE_ENV = JSON.stringify('production');

const type = process.argv[2];

const parallel = !type && require('os').cpus().length > 1;
const { join } = require('path');
const runJob = parallel ? require('child_process').fork : require;
const { green, blue } = require('chalk');
const { createFolder } = require('./build.utils');
const buildConf = require('./build.conf.js');

/*
  Build:
  * all: npm run build
  * js:  npm run build js
  * css: npm run build css
 */

console.log();

if (!type)
	require('./build.clean.js');


console.log(` 📦 Building ${buildConf.name} ${green(`v${buildConf.version}`)}...${parallel ? blue(' [multi-threaded]') : ''}\n`);

createFolder('dist');

if (!type || type === 'js')
	runJob(join(__dirname, './build.javascript.js'));

if (!type || type === 'css')
	runJob(join(__dirname, './build.styles.js'));

if (type === 'demo')
	runJob(join(__dirname, './build.demo.js'));
