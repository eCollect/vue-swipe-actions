const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  baseUrl: isProduction ? '/vue-swipe-actions/' : '/',
  css: {
    extract: isProduction
  }
};
