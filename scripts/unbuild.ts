/**
 * Rollup 配置生成器
 * ----------------
 * 根据 package.json 的 exports 字段，生成 ESM、CJS 和 DTS 格式的多个构建配置
 */
import { join, resolve, relative } from 'node:path';
import type { JscTarget } from '@swc/core';
import type { RollupOptions, Plugin, RollupLog } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import swc from 'rollup-plugin-swc3';
import dts from 'rollup-plugin-dts';

import css from './plugins/css';
import code from './plugins/code';
import { clientRoot, readJSON } from './utils';

/**
 * 构建输出路径定义接口
 */
export interface BuildOutput {
  /**
   * CommonJS 模块的输出路径，例如 'lib/index.js'
   */
  require?: string;
  /**
   * ESM 模块的输出路径，例如 'es/index.mjs'
   */
  import?: string;
  /**
   * TypeScript 声明文件的输出路径，例如 'types/index.d.ts'
   */
  types?: string;
}

/**
 * 按模块格式分组的文件集合
 */
export interface OutputGroup {
  /** ESM 模块文件集合 */
  esm: FileSet;
  /** CommonJS 模块文件集合 */
  cjs: FileSet;
  /** DTS 声明文件集合 */
  dts: FileSet;
}

/**
 * 单格式输入输出映射
 */
export interface FileSet {
  /**
   * 入口名称到源文件路径的映射，键为导出名称，值为源码路径
   */
  inputs: Record<string, string>;
  /**
   * 入口名称到构建输出路径的映射，键为导出名称，值为打包后文件路径
   */
  outputs: Record<string, string>;
}

// 是否开发模式
const __DEV__ = '__DEV__' in process.env;
// SWC 转译目标版本
const __TARGET__ = (process.env.__TARGET__ || 'es6') as JscTarget;
// 是否为客户端构建
const isClientBuild = clientRoot === resolve();

/**
 * 生成所有 Rollup 配置
 */
export default function createConfigs(): RollupOptions[] {
  const { exports: pkgExports } = readJSON(resolve('./package.json'));
  // 合并客户端与核心插件
  const sharedPlugins = [...getClientPlugins(), ...getCorePlugins()];

  // 按输出目录和格式分组导出信息
  const grouped = groupExportsByFolder(pkgExports);
  const configs: RollupOptions[] = [];

  // 遍历每个输出目录，生成对应格式的配置
  for (const distDir of Object.keys(grouped)) {
    configs.push(...buildFormatConfigs(distDir, grouped[distDir], sharedPlugins));
  }

  return configs;
}

/**
 * 根据目录和文件集合构建不同格式的 RollupOptions
 */
function buildFormatConfigs(
  outDir: string,
  files: OutputGroup,
  plugins: Plugin[],
): RollupOptions[] {
  const configs: RollupOptions[] = [];
  // 生成 entryFileNames 的函数
  const makeEntryNames =
    (mapName: Record<string, string>) =>
    ({ name }: { name: string }) =>
      relative(outDir, resolve(mapName[name]));

  // ESM 格式
  if (Object.keys(files.esm.inputs).length) {
    configs.push({
      input: files.esm.inputs,
      output: {
        dir: outDir,
        format: 'esm',
        sourcemap: __DEV__,
        entryFileNames: makeEntryNames(files.esm.outputs),
        chunkFileNames: 'chunk-[hash].mjs',
      },
      external: isExternal,
      plugins,
      onwarn: onWarning,
    });
  }

  // CommonJS 格式
  if (Object.keys(files.cjs.inputs).length) {
    configs.push({
      input: files.cjs.inputs,
      output: {
        dir: outDir,
        format: 'cjs',
        sourcemap: __DEV__,
        entryFileNames: makeEntryNames(files.cjs.outputs),
        chunkFileNames: 'chunk-[hash].cjs',
      },
      external: isExternal,
      plugins,
      onwarn: onWarning,
    });
  }

  // DTS 声明文件格式
  if (Object.keys(files.dts.inputs).length) {
    configs.push({
      input: files.dts.inputs,
      output: {
        dir: outDir,
        format: 'esm',
        sourcemap: false,
        entryFileNames: makeEntryNames(files.dts.outputs),
      },
      plugins: [dts()],
    });
  }

  return configs;
}

/**
 * 判断模块 ID 是否应视为外部模块
 */
function isExternal(source: string) {
  // 以字母或 @ 开头的模块，视为外部依赖
  return /^[a-z@]/i.test(source);
}

/**
 * 屏蔽特定警告信息
 */
function onWarning(log: RollupLog, warn: (log: RollupLog) => void) {
  // 忽略与 src/event/index.ts 循环依赖相关的提示
  if (log.code === 'CIRCULAR_DEPENDENCY' && log.message.includes('src/event/index.ts')) return;
  warn(log);
}

/**
 * 读取 package.json exports 并按目录与格式分组
 */
function groupExportsByFolder(exports: Record<string, string | BuildOutput>) {
  const groups: Record<string, OutputGroup> = {};

  for (const specifier in exports) {
    // 忽略通配符导出
    if (specifier === './*') continue;

    const entry = normalizeEntryName(specifier);
    const src = `./src/${entry}.ts`;
    const info: BuildOutput =
      typeof exports[specifier] === 'string'
        ? { import: exports[specifier] as string }
        : (exports[specifier] as BuildOutput);

    addToGroup(info.import, 'esm');
    addToGroup(info.require, 'cjs');
    addToGroup(info.types, 'dts');

    /**
     * 将指定路径添加到对应格式的分组
     */
    function addToGroup(targetPath: string | undefined, format: keyof OutputGroup) {
      if (!targetPath) return;
      const dir = resolve(targetPath, '..');
      const group = (groups[dir] ??= createEmptyGroup());
      group[format].inputs[normalizeEntryName(targetPath)] = src;
      group[format].outputs[normalizeEntryName(targetPath)] = targetPath;
    }
  }

  return groups;
}

/**
 * 标准化导出名称，'./' 或 '.' => 'index'，其他移除 './' 前缀
 */
function normalizeEntryName(spec: string) {
  return spec.replace(/^\.\/?/, '') || 'index';
}

/**
 * 创建一个空的 OutputGroup
 */
function createEmptyGroup() {
  return {
    esm: { inputs: {}, outputs: {} },
    cjs: { inputs: {}, outputs: {} },
    dts: { inputs: {}, outputs: {} },
  } as OutputGroup;
}

/**
 * 构建核心 Rollup 插件集合（TS/JS 转译、CommonJS、替换环境变量等）
 */
function getCorePlugins() {
  return [
    code({ sourceMap: __DEV__ }),
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
  ] as Plugin[];
}

/**
 * 构建客户端专属插件，仅在客户端构建时启用
 */
function getClientPlugins() {
  return (isClientBuild ? [css({ sourceMap: __DEV__ })] : []) as Plugin[];
}
