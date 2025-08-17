import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default [
	{
		ignores: ['dist/', 'node_modules/', '*.config.*', 'src/tests/**'],
	},
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	prettier,
	{
		rules: {
			'no-console': 'warn',
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/explicit-module-boundary-types': 'off',
		},
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
		},
	},
];