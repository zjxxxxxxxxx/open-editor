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

// 插件名称
const UNPLUGIN_NAME = 'OpenEditorReactUnplugin';

/**
 * React 源码调试信息注入插件工厂
 * 仅在开发模式下启用，对 React 运行时代码和用户 JSX/TSX 代码插入调试元数据
 */
const unpluginFactory: UnpluginFactory<Options | undefined> = (options = {}, meta) => {
  // 非开发环境直接返回空插件
  if (!isDev()) return { name: UNPLUGIN_NAME };

  const isVite = meta.framework === 'vite';
  const { rootDir, sourceMap, include, exclude } = resolveOptions(options);
  const filter = createFilter(include, exclude);

  // 定义需要拦截的 React 运行时代码路径后缀列表
  const runtimeFiles = isVite
    ? ['/deps/react.js', '/deps/react_jsx-runtime.js', '/deps/react_jsx-dev-runtime.js']
    : [
        '/react.development.js',
        '/react-jsx-runtime.development.js',
        '/react-jsx-dev-runtime.development.js',
        '/lib/ReactElement.js',
      ];
  const isRuntimeFile = (file: string) => runtimeFiles.some((p) => file.endsWith(p));

  return {
    name: UNPLUGIN_NAME,
    enforce: 'pre',

    /**
     * 决定哪些文件参与 transform
     * @param id - 文件 ID
     * @returns 是否需要对文件进行转换
     */
    transformInclude(id) {
      const { file } = parseID(id, rootDir);
      return isRuntimeFile(file) || filter(file);
    },

    /**
     * 对符合条件的文件执行插桩
     * @param code - 代码内容
     * @param id - 文件 ID
     * @returns 转换后的代码
     */
    transform(code, id) {
      const { file, isTsx } = parseID(id, rootDir);

      // 处理 React 运行时代码，自动扩展 vite 下的 chunk 列表
      if (isRuntimeFile(file)) {
        if (isVite && file.endsWith('/react.js')) {
          const chunks = code.match(/\/[\w-]+\.js/g) || [];
          runtimeFiles.push(...chunks);
        }

        // 插入 React 15/19 运行时代码
        const replacements = [
          {
            // React 15 匹配 var ReactElement = function 函数，并在 element 末尾插入代码
            matchRE: /([\s\S]*?var\s+ReactElement\s*=\s*function[\s\S]*?\})([\s\S]*)/,
            nodeVar: 'element',
          },
          {
            // React 19 匹配 function ReactElement 函数，并在 type 末尾插入代码
            matchRE: /([\s\S]*?function\s+ReactElement\b[\s\S]*?\})([\s\S]*)/,
            nodeVar: 'type',
          },
        ];
        for (const { matchRE, nodeVar } of replacements) {
          const result = code.match(matchRE);
          if (result) {
            const [, before, after] = result;
            return `${before}${genInjectCode(nodeVar)}${after}`;
          }
        }
        return null;
      }

      // 跳过已插桩文件
      if (code.includes(DS.INJECT_PROP)) return null;

      const magic = new MagicString(code);

      // 在 JSX 标签闭合符号前插入调试属性
      function insertDebugProp(idx: number, line: number, column: number) {
        const payload = JSON.stringify({ file, line, column });
        magic.prependLeft(idx, ` ${DS.INJECT_PROP}={${payload}}`);
      }
      transformJSX(code, insertDebugProp, isTsx);

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
 * @param opts - 插件选项
 * @returns 规范化后的选项
 */
function resolveOptions(opts: Options) {
  return {
    rootDir: normalizePath(opts.rootDir || process.cwd()), // 根目录路径
    sourceMap: opts.sourceMap ?? false, // 是否生成 source map
    include: opts.include ?? /\.(jsx|tsx)$/, // 支持的文件类型
    exclude: opts.exclude ?? /\/node_modules\//, // 排除的文件类型
  };
}

/**
 * 从文件 ID 中提取相对路径和类型信息
 * @param id - 文件 ID
 * @param rootDir - 根目录路径
 * @returns 文件路径及类型信息（JSX 或 TSX）
 */
function parseID(id: string, rootDir: string) {
  const [normalized] = normalizePath(id).split('?', 2);
  const rel = relative(rootDir, normalized);
  const ext = extname(rel).slice(1);
  return { file: rel, isJsx: ext === 'jsx', isTsx: ext === 'tsx' };
}

/**
 * 生成注入到 React 运行时代码的属性注入片段
 * @param nodeVar - 节点变量名
 * @returns 带有调试属性注入逻辑的完整替换文本
 */
function genInjectCode(nodeVar: string) {
  return code`;
var _debug = ${nodeVar}.props && ${nodeVar}.props.${DS.INJECT_PROP};
if (_debug) {
  function _def(_obj) {
    Object.defineProperty(_obj, ${DS.SHADOW_PROP}, {
      get() { return _debug; },
      enumerable: false,
    });
  }
  delete ${nodeVar}.props.${DS.INJECT_PROP};
  _def(${nodeVar}.props);
  _def(${nodeVar});
}
;`;
}

/**
 * 遍历 JSX/TSX 代码 AST，在每个 JSXOpeningElement 闭合前调用回调
 * @param code - 代码内容
 * @param cb - 回调函数，接收插入位置、行、列号
 * @param isTsx - 是否为 TSX
 */
function transformJSX(
  code: string,
  cb: (idx: number, line: number, column: number) => void,
  isTsx: boolean = false,
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
      cb(idx, line, column + 1); // 执行回调插入调试属性
    },
  });
}

export default /* #__PURE__ */ createUnplugin(unpluginFactory);
