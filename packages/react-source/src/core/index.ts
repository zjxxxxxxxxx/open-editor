import { extname, relative } from 'node:path';
import { normalizePath } from '@open-editor/shared';
import { DS } from '@open-editor/shared/debugSource';
import { isDev } from '@open-editor/shared/node';
import { type UnpluginFactory, createUnplugin } from 'unplugin';
import { createFilter } from '@rollup/pluginutils';
import MagicString from 'magic-string';
import { parse, type ParserOptions } from '@babel/parser';
import { traverse } from '@babel/core';
import { type Options } from '../types';

export const unpluginFactory: UnpluginFactory<Options | undefined> = (options = {}, meta) => {
  if (!isDev()) {
    return { name: 'ReactSourcePlugin' };
  }

  const isVite = meta.framework === 'vite';

  // 这些是要在 node_modules 中拦截的 React 源码文件
  const reactFiles = !isVite
    ? [
        '/react-jsx-dev-runtime.react-server.development.js', // React 19+ 自动 JSX 运行时 (Server 开发版)
        '/react-jsx-runtime.react-server.development.js', // React 19+ 自动 JSX 运行时 (Server 生产版，在开发配置下也可能出现)
        '/react.react-server.development.js', // React 19+ 核心 (Server 开发版)
        '/react-jsx-dev-runtime.development.js', // React 17+ 自动 JSX 运行时 (CommonJS 开发版)
        '/react-jsx-runtime.development.js', // React 17+ 自动 JSX 运行时 (CommonJS 生产版，在开发配置下也可能出现)
        '/react.development.js', // React 核心 (CommonJS 开发版)
        '/ReactElement.js', // React 核心元素创建 (CommonJS，React 15+)
      ]
    : [
        '/deps/react_jsx-dev-runtime.js', // React 17+ 自动 JSX 运行时 (CommonJS 开发版)
        '/deps/react_jsx-runtime.js', // React 17+ 自动 JSX 运行时 (CommonJS 生产版，在开发配置下也可能出现)
        '/deps/react.js', // React 核心元素创建 (CommonJS，React 15+)
      ];

  const propCode = `
props = Object.assign({}, props);
var ${DS.INJECT_PROP} = props.${DS.INJECT_PROP};
if (${DS.INJECT_PROP}) {
  delete props.${DS.INJECT_PROP};
  Object.defineProperty(props, ${DS.SHADOW_PROP}, {
    get() {
      return ${DS.INJECT_PROP};
    },
    enumerable: false,
  });
}
`;
  const searchCode = 'var element = {';
  const injectCode = `${propCode}var element = {`;
  const searchCode2 = 'type = {';
  const injectCode2 = `${propCode}type = {`;

  const { rootDir, sourceMap, include, exclude } = resolveOptions(options);
  const filter = createFilter(include, exclude);
  const filterReactFile = (file: string) => {
    return file.includes('node_modules') && reactFiles.some((name) => file.endsWith(name));
  };

  return {
    name: 'ReactSourcePlugin',
    enforce: 'pre',

    transformInclude(id) {
      const { file } = parseID(id, rootDir);
      return filterReactFile(file) || filter(file);
    },
    transform(code, id) {
      const { file, isTsx } = parseID(id, rootDir);

      if (filterReactFile(file)) {
        if (isVite && file.endsWith('/react.js')) {
          const reactChunks = code.match(/\/[\w-]+\.js/g) ?? [];
          reactFiles.push(...reactChunks);
          return null;
        }
        if (code.includes(searchCode)) {
          return code.replace(searchCode, injectCode);
        }
        if (code.includes(searchCode2)) {
          return code.replace(searchCode2, injectCode2);
        }
      }

      // 确保文件通过了过滤器，并且没有被重复插桩
      if (code.includes(DS.INJECT_PROP)) return null; // 不符合条件或已处理过，则不处理

      const s = new MagicString(code);

      function replace(index: number, line: number, column: number) {
        const prop = ` ${DS.INJECT_PROP}={${JSON.stringify({ file, line, column })}}`;
        s.prependLeft(index, prop);
      }

      transformJSX(code, replace, isTsx);

      // 如果代码没有变化，则返回 null，告诉 Vite/Rollup 不需要进一步处理
      if (!s.hasChanged()) return null;

      return {
        code: s.toString(),
        map: sourceMap ? s.generateMap({ source: file, file }) : null,
      };
    },
  };
};

function resolveOptions(opts: Options) {
  return {
    rootDir: normalizePath(opts.rootDir ?? process.cwd()),
    sourceMap: opts.sourceMap ?? false,
    include: opts.include ?? /\.(jsx|tsx)$/,
    exclude: opts.exclude ?? /\/node_modules\//,
  };
}

function parseID(id: string, rootDir: string) {
  const [filename] = normalizePath(id).split('?', 2);
  const file = relative(rootDir, filename);
  const ext = extname(file).slice(1);

  return {
    file,
    isJSX: ext === 'jsx',
    isTsx: ext === 'tsx',
  };
}

/**
 * 将传入的 JSX/TSX 代码解析成 AST，然后对所有的 JSX 开始标签插桩：
 * 在每个 `<Foo>` 或 `<Foo />` 标签的闭合尖括号之前调用回调，
 * 回调参数包含在原始文件中的绝对偏移、行号和列号。
 *
 * @param code - 需要解析的 JSX/TSX 代码片段
 * @param cb - 回调
 * @param options - 配置项
 */
export function transformJSX(
  code: string,
  cb: (index: number, line: number, column: number, isTpl: boolean) => void,
  isTsx: boolean,
) {
  // Babel Parser 配置，包含行列及字符偏移信息
  const parserOpts: ParserOptions = {
    sourceType: 'unambiguous',
    ranges: true,
    plugins: isTsx ? ['jsx', 'typescript'] : ['jsx'],
  };

  // 解析 code 为 AST，File 节点包含所有子节点及位置信息
  const ast = parse(code, parserOpts);

  // 遍历 AST，针对每个 JSXOpeningElement 计算插桩位置并回调
  traverse(ast, {
    JSXOpeningElement({ node }) {
      // 计算标签闭合符号前的偏移位置
      // 自闭合标签 `<Foo />`：node.end 指向 `/>` 之后，需要减 2 定位到 `/` 之前
      // 普通标签 `<Foo>`：node.end 指向 `>` 之后，需要减 1 定位到 `>` 之前
      const index = node.selfClosing ? node.end! - 2 : node.end! - 1;

      const { line, column } = node.loc!.start;
      cb(index, line, column + 1, false);
    },
  });
}

export default /* #__PURE__ */ createUnplugin(unpluginFactory);
