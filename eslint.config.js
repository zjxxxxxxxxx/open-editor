import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  // 忽略文件配置
  {
    ignores: [
      'packages/client/jsx',
      '**/.**/*', // 忽略所有以 '.' 开头的目录及其内容
      '**/dist/**/*', // 忽略所有名为 'dist' 的目录及其内容
      '**/*.d.ts', // 忽略所有 .d.ts 文件
    ],
  },
  // ESLint 推荐配置
  pluginJs.configs.recommended,
  // TypeScript ESLint 推荐配置
  ...tseslint.configs.recommended,
  // 自定义配置和规则
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/ban-types': 'off',
      'no-inner-declarations': 'off',
    },
  },
];
