import { extname, relative } from 'node:path';
import { normalizePath } from '@open-editor/shared';
import { DS } from '@open-editor/shared/debugSource';
import { isDev } from '@open-editor/shared/node';
import { createUnplugin, type UnpluginFactory } from 'unplugin';
import { createFilter } from '@rollup/pluginutils';
import MagicString from 'magic-string';
import { parse } from '@babel/parser';
import { traverse } from '@babel/core';
import { type Options } from '../types';

/**
 * React 源码调试信息注入插件工厂
 * 仅在开发模式下启用，对 React 运行时代码和用户 JSX/TSX 代码插入调试元数据
 */
export const unpluginFactory: UnpluginFactory<Options | undefined> = (options = {}, meta) => {
  // 非开发环境直接返回空插件
  if (!isDev()) return { name: 'OpenEditorReactPlugin' };

  const isVite = meta.framework === 'vite';
  const { rootDir, sourceMap, include, exclude } = resolveOptions(options);
  const filter = createFilter(include, exclude);

  // 定义需要拦截的 React 运行时代码路径后缀列表
  const reactRuntimeFiles = isVite
    ? ['/deps/react.js', '/deps/react_jsx-runtime.js', '/deps/react_jsx-dev-runtime.js']
    : [
        '/react.development.js',
        '/react-jsx-runtime.development.js',
        '/react-jsx-dev-runtime.development.js',
        '/lib/ReactElement.js',
      ];
  const isRuntimeFile = (file: string) => reactRuntimeFiles.some((p) => file.endsWith(p));

  // 通用属性注入逻辑
  const propInjection = `
props = Object.assign({}, props);
const __debug = props.${DS.INJECT_PROP};
if (__debug) {
  delete props.${DS.INJECT_PROP};
  Object.defineProperty(props, ${DS.SHADOW_PROP}, { get() { return __debug; }, enumerable: false });
}
`;

  return {
    name: 'OpenEditorReactPlugin',
    enforce: 'pre',

    /**
     * 决定哪些文件参与 transform
     */
    transformInclude(id) {
      const { file } = parseID(id, rootDir);
      return isRuntimeFile(file) || filter(file);
    },

    /**
     * 对符合条件的文件执行插桩
     */
    transform(code, id) {
      const { file, isTsx } = parseID(id, rootDir);

      // 处理 React 运行时代码，自动扩展 vite 下的 chunk 列表
      if (isRuntimeFile(file)) {
        if (isVite && file.endsWith('/react.js')) {
          const chunks = code.match(/\/[\w-]+\.js/g) || [];
          reactRuntimeFiles.push(...chunks);
          return null;
        }
        // 对运行时代码中的 element/type 对象注入属性
        const replacements = [
          { search: 'var element = {', inject: `${propInjection}var element = {` },
          { search: 'type = {', inject: `${propInjection}type = {` },
        ];
        for (const { search, inject } of replacements) {
          if (code.includes(search)) {
            return code.replace(search, inject);
          }
        }
      }

      // 对用户 JSX/TSX 文件插入调试属性
      if (code.includes(DS.INJECT_PROP)) return null; // 已处理过
      const magic = new MagicString(code);

      // 回调函数：在 JSX 标签闭合符号前插入调试属性
      const insertDebugAttr = (idx, line, col) => {
        const payload = JSON.stringify({ file, line, column: col });
        magic.prependLeft(idx, ` ${DS.INJECT_PROP}={${payload}}`);
      };
      transformJSX(code, insertDebugAttr, isTsx);

      if (!magic.hasChanged()) return null;
      return {
        code: magic.toString(),
        map: sourceMap ? magic.generateMap({ source: file, file }) : null,
      };
    },
  };
};

/**
 * 解析并规范化插件选项
 */
function resolveOptions(opts) {
  return {
    rootDir: normalizePath(opts.rootDir || process.cwd()),
    sourceMap: opts.sourceMap ?? false,
    include: opts.include ?? /\.(jsx|tsx)$/, // 匹配 JSX/TSX 文件
    exclude: opts.exclude ?? /\/node_modules\//,
  };
}

/**
 * 从 id 中提取相对路径和文件类型信息
 */
function parseID(id, rootDir) {
  const [normalized] = normalizePath(id).split('?', 2);
  const rel = relative(rootDir, normalized);
  const ext = extname(rel).slice(1);
  return { file: rel, isJsx: ext === 'jsx', isTsx: ext === 'tsx' };
}

/**
 * 对传入的 JSX/TSX 代码进行 AST 解析并遍历，
 * 在每个 JSXOpeningElement 闭合尖括号前调用回调
 * @param code 代码内容
 * @param cb 回调函数(idx: 插入位置, line, column)
 * @param isTsx 是否为 TSX
 */
export function transformJSX(
  code: string,
  cb: (idx: number, line: number, column: number) => void,
  isTsx = false,
) {
  const ast = parse(code, {
    sourceType: 'unambiguous',
    ranges: true,
    plugins: isTsx ? ['jsx', 'typescript'] : ['jsx'],
  });
  traverse(ast, {
    JSXOpeningElement({ node }) {
      const idx = node.selfClosing ? node.end! - 2 : node.end! - 1;
      const { line, column } = node.loc!.start;
      cb(idx, line, column + 1);
    },
  });
}

export default /* #__PURE__ */ createUnplugin(unpluginFactory);
