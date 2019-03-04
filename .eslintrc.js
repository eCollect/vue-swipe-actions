module.exports = {
	root: true,
	extends: ["ecollect-vue"],
	rules: {
		'import/prefer-default-export': 'off',
		'import/no-extraneous-dependencies': 'off',
		'import/no-unresolved': 'off',
		'vue/no-unused-vars': 'off',
		'vue/no-unused-components': 'off',
		'vue/no-template-shadow': 'off',
		// allow console.log during development only
		'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		// allow debugger during development only
		'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
	}
};
