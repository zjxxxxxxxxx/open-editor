import { join, resolve } from 'node:path';
import { type JscTarget } from '@swc/core';
import { type OutputOptions, type RollupOptions } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import swc from 'rollup-plugin-swc3';
import dts from 'rollup-plugin-dts';

import css from './plugins/css';
import glsl from './plugins/glsl';
import { clientRoot, readJSON } from './utils';

/**
 * 构建输出配置接口定义
 */
export interface BuildOutput {
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
 * 开发环境标识
 *
 * @default false
 *
 * 通过启动脚本注入，如：
 * ```json
 * { "dev": "pnpm rollup -c --environment __DEV__" }
 * ```
 */
const __DEV__ = '__DEV__' in process.env;

/**
 * 构建目标环境配置
 *
 * @default 'es6'
 *
 * @example `'es2015' | 'esnext'`
 *
 * 通过启动脚本注入，如：
 * ```json
 * { "build": "pnpm rollup -c --environment __TARGET__:es2020" }
 * ```
 */
const __TARGET__ = (process.env.__TARGET__ || 'es6') as JscTarget;

/**
 * 判断当前是否为客户端构建模式
 *
 * @description 通过比较 clientRoot 与当前解析路径是否一致来判断
 */
const isClientBuild = clientRoot === resolve();

/**
 * 主入口函数：生成 Rollup 配置数组
 *
 * @returns Rollup 配置数组
 *
 * @description
 * 1. 读取 package.json 的 exports 配置
 * 2. 将 exports 转换为标准化的配置项数组
 * 3. 生成所有构建配置（包含代码包和类型声明）
 */
export default function createRollupConfigs(): RollupOptions[] {
  // 解析 package.json 文件路径
  const packageJsonPath = resolve('./package.json');
  // 读取 package.json 中的 exports 配置
  const { exports } = readJSON(packageJsonPath);

  // 转换 exports 配置为标准化格式
  const configEntries = Object.entries(exports).map(([inputPath, outputConfig]) => [
    normalizeInputPath(inputPath),
    outputConfig,
  ]) as [string, BuildOutput][];

  // 生成所有构建配置并扁平化数组
  return configEntries.flatMap(([inputPath, outputConfig]) =>
    generateBuildConfig(inputPath, outputConfig),
  );
}

/**
 * 生成单个构建配置（包含代码包和类型声明）
 *
 * @param inputPath - 入口文件路径
 * @param outputConfig - 输出配置
 *
 * @returns 包含代码包和类型声明的配置数组
 */
function generateBuildConfig(
  inputPath: string,
  outputConfig: BuildOutput | string,
): RollupOptions[] {
  return [
    // 代码包构建配置
    generateBundleConfig(inputPath, outputConfig),
    // 类型声明配置
    generateTypeDeclarationConfig(inputPath, outputConfig),
  ].filter(Boolean) as RollupOptions[];
}

/**
 * 生成代码包构建配置
 *
 * @param inputPath - 入口文件路径
 * @param outputConfig - 输出配置
 *
 * @returns Rollup 配置对象
 *
 * @description
 * 支持两种输出配置格式：
 * 1. 字符串形式：直接指定 ESM 输出路径
 * 2. 对象形式：可指定多种输出格式（cjs/esm）
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
      // ESM 格式
      format: 'esm',
      sourcemap: __DEV__,
    });
  } else {
    // 处理对象类型的输出配置
    if (outputConfig.require) {
      outputFormats.push({
        file: outputConfig.require,
        // CommonJS 格式
        format: 'cjs',
        sourcemap: __DEV__,
      });
    }

    if (outputConfig.import) {
      outputFormats.push({
        file: outputConfig.import,
        // ESM 格式
        format: 'esm',
        sourcemap: __DEV__,
      });
    }
  }

  if (outputFormats.length === 0) return;

  return {
    input: inputPath,
    output: outputFormats,
    external: (source) => /^@?[a-z]/.test(source),
    plugins: [
      ...(isClientBuild ? [css({ sourcemap: __DEV__ }), glsl({ sourcemap: __DEV__ })] : []),
      nodeResolve(),
      commonjs(),
      replace({
        __DEV__,
        preventAssignment: true,
      }),
      swc({
        sourceMaps: __DEV__,
        jsc: {
          target: __TARGET__,
          transform: {
            react: {
              runtime: 'automatic',
              importSource: join(clientRoot, './jsx'),
            },
          },
          minify: {
            compress: !__DEV__,
            keep_fnames: true,
          },
        },
      }),
    ],
    onwarn(warning, warn) {
      // 忽略特定的循环依赖警告
      if (
        warning.code === 'CIRCULAR_DEPENDENCY' &&
        warning.message.includes('src/event/index.ts')
      ) {
        return; // 不打印此警告
      }

      warn(warning);
    },
  };
}

/**
 * 生成类型声明文件配置
 *
 * @param inputPath - 入口文件路径
 * @param outputConfig - 输出配置
 *
 * @returns Rollup 配置对象
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
        // 类型声明文件使用 ESM 格式
        format: 'esm',
        // 类型声明不生成 sourcemap
        sourcemap: false,
      },
      plugins: [
        // 使用 dts 插件生成类型声明
        dts(),
      ],
    };
  }
}

/**
 * 标准化入口路径转换器
 *
 * @param path - 原始路径
 *
 * @returns 标准化后的路径
 *
 * @example
 * './index'    => './src/index.ts'
 * 'utils'      => './src/utils.ts'
 * './lib/main' => './src/lib/main.ts'
 */
function normalizeInputPath(path: string) {
  // 移除开头的 ./ 或 /，默认使用 index 作为文件名
  const filename = path.replace(/^\.\/?/, '') || 'index';
  // 转换为 src 目录下的 TypeScript 文件路径
  return `./src/${filename}.ts`;
}
