import { join, resolve } from 'node:path';
import { type OutputOptions, type RollupOptions } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';

import css from './css';
import { clientRoot, readJSON } from './utils';

/**
 * 开发环境标识，通过 process.env.__DEV__ 注入
 */
const IS_DEV = '__DEV__' in process.env;

/**
 * 构建目标环境，默认使用 es6
 */
const TARGET = process.env.__TARGET__ || 'es6';

/**
 * 判断是否为客户端构建
 */
const isClientBuild = clientRoot === resolve();

/**
 * 构建输出配置类型定义
 */
interface BuildOutput {
  /**
   * CommonJS 格式输出路径
   */
  require?: string;

  /**
   * ESM 格式输出路径
   */
  import?: string;

  /**
   * 类型声明文件输出路径
   */
  types?: string;
}

/**
 * 生成 Rollup 配置入口函数
 */
export default function createRollupConfigs(): RollupOptions[] {
  const packageJsonPath = resolve('./package.json');
  const { exports } = readJSON(packageJsonPath);

  // 转换 exports 配置为配置项数组
  const configEntries = Object.entries(exports).map(([inputPath, outputConfig]) => [
    normalizeInputPath(inputPath),
    outputConfig,
  ]) as [string, BuildOutput][];

  // 生成所有构建配置
  return configEntries.flatMap(([inputPath, outputConfig]) =>
    generateBuildConfig(inputPath, outputConfig),
  );
}

/**
 * 生成单个构建配置（包含代码包和类型声明）
 */
function generateBuildConfig(
  inputPath: string,
  outputConfig: BuildOutput | string,
): RollupOptions[] {
  return [
    generateBundleConfig(inputPath, outputConfig),
    generateTypeDeclarationConfig(inputPath, outputConfig),
  ].filter(Boolean) as RollupOptions[];
}

/**
 * 生成代码包构建配置
 */
function generateBundleConfig(
  inputPath: string,
  outputConfig: BuildOutput | string,
): RollupOptions | undefined {
  const outputFormats: OutputOptions[] = [];

  // 处理字符串类型的输出配置
  if (typeof outputConfig === 'string') {
    outputFormats.push({
      file: outputConfig,
      format: 'esm',
      sourcemap: IS_DEV,
    });
  } else {
    // 处理对象类型的输出配置
    if (outputConfig.require) {
      outputFormats.push({
        file: outputConfig.require,
        format: 'cjs',
        sourcemap: IS_DEV,
      });
    }

    if (outputConfig.import) {
      outputFormats.push({
        file: outputConfig.import,
        format: 'esm',
        sourcemap: IS_DEV,
      });
    }
  }

  if (outputFormats.length === 0) return;

  return {
    input: inputPath,
    output: outputFormats,
    external: (source) => /^@?[a-z]/.test(source), // 排除外部依赖
    plugins: [
      // 客户端构建时添加 CSS 处理
      ...(isClientBuild ? [css({ sourcemap: IS_DEV })] : []),
      nodeResolve(),
      commonjs(),
      esbuild({
        target: TARGET,
        minifySyntax: !IS_DEV,
        minifyWhitespace: !IS_DEV,
        minifyIdentifiers: false,
        jsxImportSource: join(clientRoot, './jsx'), // 自定义 JSX 导入路径
      }),
    ],
  };
}

/**
 * 生成类型声明文件配置
 */
function generateTypeDeclarationConfig(
  inputPath: string,
  outputConfig: BuildOutput | string,
): RollupOptions | undefined {
  if (typeof outputConfig === 'object' && outputConfig.types) {
    return {
      input: inputPath,
      output: {
        file: outputConfig.types,
        format: 'esm',
        sourcemap: false,
      },
      plugins: [dts()],
    };
  }
}

/**
 * 标准化入口路径
 * @example './index' -> './src/index.ts'
 */
function normalizeInputPath(rawPath: string) {
  const filename = rawPath.replace(/^\.\/?/, '') || 'index';
  return `./src/${filename}.ts`;
}
