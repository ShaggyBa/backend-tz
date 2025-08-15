import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['**/src/tests/**/*.test.ts', '**/src/tests/**/*.spec.ts', '**/tests/**/*.test.ts'],
	moduleFileExtensions: ['ts', 'js', 'json'],
	transform: {
		'^.+\\.tsx?$': ['ts-jest', { tsconfig: 'jest.tsconfig.json' }]
	},
	globals: {
		'ts-jest': {
			tsconfig: 'jest.tsconfig.json',
			// diagnostics: true
		},
	},
};

export default config;
