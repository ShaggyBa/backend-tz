module.exports = {
	root: true,
	env: {
		node: true,
		es2022: true
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2022,
		sourceType: 'module',
		// project: ['./tsconfig.json'],
		// tsconfigRootDir: __dirname,
	},
	plugins: ['@typescript-eslint'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier'
	],
	rules: {
		'no-console': 'warn',
		'@typescript-eslint/no-unused-vars': ['error', { "argsIgnorePattern": "^_" }],
		'@typescript-eslint/explicit-module-boundary-types': 'off'
	},
	ignorePatterns: ['dist/', 'node_modules/', '*.config.*']
};
