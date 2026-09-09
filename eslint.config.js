import tseslint from 'typescript-eslint';

export default tseslint.config(
  tseslint.configs.recommended,
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'build-temp/**',
      '.blocks-sandbox/**',
      'cdk.out/**',
      '.hosting/**',
      '.bb-data/**',
      'aws-blocks/client.js',
    ],
  },
  {
    files: ['**/*.ts', '**/*.js'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': 'off',
    },
  }
);
