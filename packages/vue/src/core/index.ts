import { extname, relative } from 'node:path';
import { normalizePath } from '@open-editor/shared';
import { isDev } from '@open-editor/shared/node';
import { DS } from '@open-editor/shared/debugSource';
import { createUnplugin, type UnpluginFactory } from 'unplugin';
import { createFilter } from '@rollup/pluginutils';
import MagicString from 'magic-string';
import { parse as babelParse, type ParserOptions } from '@babel/parser';
import { traverse } from '@babel/core';
import {
  parse as vueParse,
  transform as vueTransform,
  NodeTypes,
  ElementTypes,
  type ElementNode,
  type TextNode,
  type AttributeNode,
  type RootNode,
} from '@vue/compiler-dom';
import { type Options } from '../types';

// 支持的 Vue 标签类型集合
const TAG_TYPES = new Set([ElementTypes.ELEMENT, ElementTypes.COMPONENT]);
// 忽略插桩的原生块级标签
const IGNORE_TAGS = new Set(['template', 'script', 'style']);

// 仅在开发模式注入源码位置信息
const unpluginFactory: UnpluginFactory<Options | undefined> = (options = {}, meta) => {
  if (!isDev()) return { name: 'OpenEditorVuePlugin' };

  const isVite = meta.framework === 'vite';
  const { rootDir, sourceMap, include, exclude } = resolveOptions(options);
  const filter = createFilter(include, exclude);

  // 需要拦截的 Vue 运行时代码路径后缀
  const vueRuntimeFiles = isVite
    ? ['/runtime-core.esm-bundler.js', '/deps/vue.js']
    : [
        '/runtime-core.cjs.js',
        '/runtime-core.esm-bundler.js',
        '/vue.runtime.esm.js',
        '/vue.runtime.js',
      ];
  const isRuntimeFile = (file: string) => vueRuntimeFiles.some((p) => file.endsWith(p));

  return {
    name: 'OpenEditorVuePlugin',
    enforce: 'pre',

    // 决定哪些文件参与 transform
    transformInclude(id) {
      const { file, query } = parseID(id, rootDir);
      return isRuntimeFile(file) || (query.raw == null && filter(file));
    },

    // 对文件执行插桩
    transform(code, id) {
      const { file, isSfc, ...jsxOpts } = parseID(id, rootDir);

      // 针对 vnode/cloned/this.tag 等核心逻辑
      if (isRuntimeFile(file)) {
        const replacements = [
          {
            search: 'const vnode = {',
            inject: genVue3Inject(),
          },
          {
            search: 'this.tag = tag;',
            inject: genVue2Inject(),
          },
        ];
        for (const { search, inject } of replacements) {
          if (code.includes(search)) {
            return code.replace(search, inject);
          }
        }
        return null;
      }

      // 跳过已插桩文件
      if (code.includes(DS.INJECT_PROP)) return null;
      const magic = new MagicString(code);

      // 在标签闭合尖括号前插入属性
      const insertAttr = (idx, line, col, isTpl) => {
        const payload = JSON.stringify({ file, line, column: col });
        const attr = isTpl ? ` :${DS.INJECT_PROP}='${payload}'` : ` ${DS.INJECT_PROP}={${payload}}`;
        magic.prependLeft(idx, attr);
      };

      // 先处理模板，再提取并处理 <script> 中的 JSX/TSX
      if (isSfc) {
        const ast = vueParse(code);
        transformTemplate(ast, insertAttr);
        const jsxOpts = extractScriptJsxOptions(ast);
        if (jsxOpts) transformJSX(jsxOpts.code, insertAttr, jsxOpts);
      } else {
        // 普通 JSX/TSX 文件
        transformJSX(code, insertAttr, jsxOpts);
      }

      if (!magic.hasChanged()) return null;
      return {
        code: magic.toString(),
        map: sourceMap ? magic.generateMap({ source: file, file }) : null,
      };
    },
  };
};

// 解析并规范化插件选项
function resolveOptions(opts: Options) {
  return {
    rootDir: normalizePath(opts.rootDir ?? process.cwd()),
    sourceMap: opts.sourceMap ?? false,
    include: opts.include ?? /\.(vue|jsx|tsx)$/,
    exclude: opts.exclude ?? /\/node_modules\//,
  };
}

// 从 id 提取路径、类型、查询参数
function parseID(id: string, rootDir: string) {
  const [path, qs] = normalizePath(id).split('?', 2);
  const file = relative(rootDir, path);
  const ext = extname(file).slice(1);
  const query = qs ? Object.fromEntries(new URLSearchParams(qs)) : {};
  return {
    file,
    isSfc: ext === 'vue',
    isJSX: ext === 'jsx',
    isTsx: ext === 'tsx',
    query,
  };
}

// 生成 Vue 3 运行时代码的属性注入片段
function genVue3Inject() {
  return code`
props = Object.assign({}, props);
var __debug = props.${DS.INJECT_PROP};
if (__debug) {
  delete props.${DS.INJECT_PROP};
  Object.defineProperty(props, ${DS.SHADOW_PROP}, { get() { return __debug; }, enumerable: false });
}
const vnode = {
`;
}

// 生成 Vue 2 运行时代码的属性+elm双向绑定片段
function genVue2Inject() {
  return code`
var __debug = data && data.attrs && data.attrs.${DS.INJECT_PROP};
if (__debug) {
  delete data.attrs.${DS.INJECT_PROP};
  Object.defineProperty(this, ${DS.SHADOW_PROP}, { get() { return __debug; }, enumerable: false });
}
var __elm;
Object.defineProperty(this, 'elm', { get() { return __elm; }, set(v) { __elm = v; if (v) v.${DS.VUE_2} = this; }, enumerable: true });
this.tag = tag;
`;
}

// 对所有符合条件的元素节点插桩
function transformTemplate(
  ast: RootNode,
  cb: (idx: number, line: number, column: number, isTpl?: boolean) => void,
) {
  vueTransform(ast, {
    nodeTransforms: [
      (node) => {
        if (
          node.type === NodeTypes.ELEMENT &&
          TAG_TYPES.has(node.tagType) &&
          !IGNORE_TAGS.has(node.tag)
        ) {
          const hasAttrs = node.props.length > 0;
          const pos = hasAttrs
            ? Math.max(...node.props.map((p) => p.loc.end.offset))
            : node.loc.start.offset + node.tag.length + 1;
          cb(pos, node.loc.start.line, node.loc.start.column, true);
        }
      },
    ],
  });
}

// 提取 <script> 中的 JSX/TSX 信息
function extractScriptJsxOptions(ast: RootNode) {
  const script = ast.children.find((n) => (n as ElementNode).tag === 'script') as ElementNode;
  if (!script) return;
  const text = (script.children[0] as TextNode)?.content;
  const lang = (script.props.find((p) => p.name === 'lang') as AttributeNode)?.value?.content;
  if (!text || !/[jt]sx/.test(lang || '')) return;
  const loc = (script.children[0] as TextNode).loc.start;
  return {
    code: text,
    isTsx: lang === 'tsx',
    startIndex: loc.offset,
    startLine: loc.line,
    startColumn: loc.column,
  };
}

/**
 * 解析并遍历 JSX/TSX 代码，将每个 JSXOpeningElement 闭合符号前调用 cb
 */
function transformJSX(
  code: string,
  cb: (idx: number, line: number, column: number, isTpl?: boolean) => void,
  options: Partial<NonNullable<ReturnType<typeof extractScriptJsxOptions>>>,
) {
  const { isTsx = false, startIndex = 0, startLine = 1, startColumn = 1 } = options;
  const parserOpts: ParserOptions = {
    sourceType: 'unambiguous',
    startIndex,
    startLine,
    startColumn: startColumn - 1,
    ranges: true,
    plugins: isTsx ? ['jsx', 'typescript'] : ['jsx'],
  };
  const ast = babelParse(code, parserOpts);
  traverse(ast, {
    JSXOpeningElement({ node }) {
      const idx = node.selfClosing ? node.end! - 2 : node.end! - 1;
      const { line, column } = node.loc!.start;
      cb(idx, line, column + 1, false);
    },
  });
}

export default /* #__PURE__ */ createUnplugin(unpluginFactory);
