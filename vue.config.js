const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
	publicPath: isProduction ? '/vue-swipe-actions/' : '/',
	css: {
		extract: isProduction,
	},
};
