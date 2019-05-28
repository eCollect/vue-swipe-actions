
const { version, name } = require('../package.json');

module.exports = {
	version,
	name,
	banner:
    `${'/*!\n'
    + ' * vue-swipe-actions v'}${version}\n`
    + ' * (c) 2016-present eCollect\n'
    + ' * Released under the MIT License.\n'
    + ' */\n',
};
