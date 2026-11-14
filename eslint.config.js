import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser,
				extraFileExtensions: ['.svelte']
			}
		}
	},
	{
		// src/lib/core is portable and prohibited from importing $app/paths,
		// receiving resolved URLs from callers, so the app-level resolve() rule does not apply.
		files: ['src/lib/core/**'],
		rules: {
			'svelte/no-navigation-without-resolve': 'off'
		}
	},
	{
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_'
				}
			],
			'@typescript-eslint/no-explicit-any': 'off',
			'no-undef': 'off'
		}
	},
	{
		ignores: [
			'.svelte-kit/**',
			'build/**',
			'node_modules/**',
			'playwright-report/**',
			'test-results/**'
		]
	}
];
