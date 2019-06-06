
module.exports = {
	env: {
		production: {
			presets: [
				[
					'@babel/preset-env',
					{
						useBuiltIns: 'entry',
					},
				],
			],
			comments: false,
		},
	},
};
