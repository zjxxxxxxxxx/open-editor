// 导入 Node.js 核心模块
import { join, resolve } from 'node:path';
// 导入 Rollup 类型定义
import { type OutputOptions, type RollupOptions } from 'rollup';
// 导入 Rollup 插件
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';

// 导入自定义模块
import css from './css';
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
const IS_DEV = '__DEV__' in process.env;

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
const TARGET = process.env.__TARGET__ || 'es6';

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
      sourcemap: IS_DEV,
    });
  } else {
    // 处理对象类型的输出配置
    if (outputConfig.require) {
      outputFormats.push({
        file: outputConfig.require,
        // CommonJS 格式
        format: 'cjs',
        sourcemap: IS_DEV,
      });
    }

    if (outputConfig.import) {
      outputFormats.push({
        file: outputConfig.import,
        // ESM 格式
        format: 'esm',
        sourcemap: IS_DEV,
      });
    }
  }

  if (outputFormats.length === 0) return;

  return {
    // 入口文件路径
    input: inputPath,
    // 输出格式配置
    output: outputFormats,
    // 外部依赖排除规则（匹配所有以字母开头或 @ 开头的依赖）
    external: (source) => /^@?[a-z]/.test(source),
    plugins: [
      // 客户端构建时添加 CSS 处理插件
      ...(isClientBuild ? [css({ sourcemap: IS_DEV })] : []),
      // 模块解析插件（处理 node_modules 依赖）
      nodeResolve(),
      // CommonJS 转换插件
      commonjs(),
      // ESBuild 插件配置
      esbuild({
        // 编译目标
        target: TARGET,
        // 生产环境启用语法简化
        minifySyntax: !IS_DEV,
        // 生产环境启用空格压缩
        minifyWhitespace: !IS_DEV,
        // 保持标识符不变
        minifyIdentifiers: false,
        // 自定义 JSX 导入路径
        jsxImportSource: join(clientRoot, './jsx'),
      }),
    ],
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
 * @param rawPath - 原始路径
 *
 * @returns 标准化后的路径
 *
 * @example
 * './index'    => './src/index.ts'
 * 'utils'      => './src/utils.ts'
 * './lib/main' => './src/lib/main.ts'
 */
function normalizeInputPath(rawPath: string) {
  // 移除开头的 ./ 或 /，默认使用 index 作为文件名
  const filename = rawPath.replace(/^\.\/?/, '') || 'index';
  // 转换为 src 目录下的 TypeScript 文件路径
  return `./src/${filename}.ts`;
}
