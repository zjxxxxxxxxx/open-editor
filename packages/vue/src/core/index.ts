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
  NodeTypes,
  ElementTypes,
  type ElementNode,
  type TextNode,
  type AttributeNode,
  type RootNode,
  type TemplateChildNode,
} from '@vue/compiler-dom';
import { type Options } from '../types';

// 插件名称
const UN_PLUGIN_NAME = 'OpenEditorVueUnPlugin';
// 支持的 Vue 标签类型
const TAG_TYPES = new Set([ElementTypes.ELEMENT, ElementTypes.COMPONENT]);
// 默认查询参数
const DEFAULT_QUERY = Object.freeze({
  type: 'template',
});

// 插件工厂，注入源码位置信息（仅开发模式）
const unpluginFactory: UnpluginFactory<Options | undefined> = (options = {}, meta) => {
  if (!isDev()) return { name: UN_PLUGIN_NAME };

  const isVite = meta.framework === 'vite';
  const { rootDir, sourceMap, include, exclude } = resolveOptions(options);
  const filter = createFilter(include, exclude);

  // 运行时代码文件判断
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
    name: UN_PLUGIN_NAME,
    enforce: 'pre',

    // 判断文件是否参与 transform
    transformInclude(id) {
      const { file, query } = parseID(id, rootDir);
      return (
        isRuntimeFile(file) ||
        (query.raw == null && query.type === DEFAULT_QUERY.type && filter(file))
      );
    },

    // 执行源码插桩
    transform(code, id) {
      const { file, isSfc, ...jsxOpts } = parseID(id, rootDir);

      if (isRuntimeFile(file)) {
        // 处理 Vue 运行时代码，自动扩展 vite 下的 chunk 列表
        if (isVite && file.endsWith('/vue.js')) {
          const chunks = code.match(/\/[\w-]+\.js/g) || [];
          vueRuntimeFiles.push(...chunks);
        }

        // 插入 Vue 3/2 运行时代码
        const replacements = [
          {
            // Vue 3 匹配 function createBaseVNode 函数，并在 vnode 末尾插入代码
            matchRE: /([\s\S]*?function\s+createBaseVNode\b[\s\S]*?\})([\s\S]*)/,
            injectCode: genVue3Inject,
          },
          {
            // Vue 2 匹配 function VNode 并在函数末尾插入代码
            matchRE: /([\s\S]*?function\s+VNode\b[\s\S]*?)(\}[\s\S]*)/,
            injectCode: genVue2Inject,
          },
        ];
        for (const { matchRE, injectCode } of replacements) {
          const result = code.match(matchRE);
          if (result) {
            const [, before, after] = result;
            return `${before}${injectCode()}${after}`;
          }
        }
        return null;
      }

      // 跳过已插桩的文件
      if (code.includes(DS.INJECT_PROP)) return null;

      const magic = new MagicString(code);

      // 插入调试属性
      function insertDebugProp(idx: number, line: number, column: number, isTpl?: boolean) {
        const payload = JSON.stringify({ file, line, column });
        const prop = isTpl ? ` :${DS.INJECT_PROP}='${payload}'` : ` ${DS.INJECT_PROP}={${payload}}`;
        magic.prependLeft(idx, prop);
      }

      // 处理 Vue 文件或 JSX/TSX 文件
      if (isSfc) {
        const ast = vueParse(code);
        transformTemplate(ast, insertDebugProp);
        const jsxOpts = extractScriptJsxOptions(ast);
        if (jsxOpts) transformJSX(jsxOpts.code, insertDebugProp, jsxOpts);
      } else {
        transformJSX(code, insertDebugProp, jsxOpts);
      }

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
 * @param opts - 插件配置项
 * @returns 规范化后的选项
 */
function resolveOptions(opts: Options) {
  return {
    rootDir: normalizePath(opts.rootDir ?? process.cwd()), // 根目录
    sourceMap: opts.sourceMap ?? false, // 是否生成 source map
    include: opts.include ?? /\.(vue|jsx|tsx)$/, // 匹配的文件类型
    exclude: opts.exclude ?? /\/node_modules\//, // 排除的文件类型
  };
}

/**
 * 从文件 ID 中提取路径、类型和查询参数
 * @param id - 文件 ID
 * @param rootDir - 项目根目录
 * @returns 包含文件路径、类型、查询参数的信息
 */
function parseID(id: string, rootDir: string) {
  const [path, qs] = normalizePath(id).split('?', 2);
  const file = relative(rootDir, path);
  const ext = extname(file).slice(1);
  const query = (
    qs
      ? {
          ...DEFAULT_QUERY,
          ...Object.fromEntries(new URLSearchParams(qs)),
        }
      : DEFAULT_QUERY
  ) as AnyObject<string>;
  return {
    file,
    isSfc: ext === 'vue', // 是否为 Vue 文件
    isJSX: ext === 'jsx', // 是否为 JSX 文件
    isTsx: ext === 'tsx', // 是否为 TSX 文件
    query,
  };
}

/**
 * 生成 Vue 3 运行时代码的属性注入片段
 * @returns Vue 3 运行时代码的属性注入
 */
function genVue3Inject() {
  return code`;
const _debug = vnode.props && vnode.props.${DS.INJECT_PROP};
if (_debug) {
  delete vnode.props.${DS.INJECT_PROP};
  vnode.dynamicProps = vnode.dynamicProps && vnode.dynamicProps.filter((prop) => prop !== '${DS.INJECT_PROP}');
  Object.defineProperty(vnode, ${DS.SHADOW_PROP}, { get() { return _debug; }, enumerable: false });
}
if (typeof vnode.type === 'string') {
 let _el = vnode.el;
 Object.defineProperty(vnode, 'el', { get() { return _el; }, set(el) { _el = el; if (el) el.${DS.VUE_V3} = vnode; }, enumerable: true });
}
;`;
}

/**
 * 生成 Vue 2 运行时代码的属性和 elm 双向绑定注入片段
 * @returns Vue 2 运行时代码的属性和 elm 双向绑定注入
 */
function genVue2Inject() {
  return code`;
var _debug = this.data && this.data.attrs && this.data.attrs.${DS.INJECT_PROP};
if (_debug) {
  delete this.data.attrs.${DS.INJECT_PROP};
  Object.defineProperty(this, ${DS.SHADOW_PROP}, { get() { return _debug; }, enumerable: false });
}
if (!this.componentOptions) {
 var _elm = this.elm;
 Object.defineProperty(this, 'elm', { get() { return _elm; }, set(elm) { _elm = elm; if (elm) elm.${DS.VUE_V2} = this; }, enumerable: true });
}
;`;
}

/**
 * 对所有符合条件的元素节点插桩
 * @param ast - Vue 模板 AST
 * @param cb - 插桩回调，接受节点位置信息
 */
function transformTemplate(
  ast: RootNode,
  cb: (idx: number, line: number, column: number, isTpl?: boolean) => void,
) {
  walkNodes(ast.children, (node) => {
    const hasAttrs = node.props.length > 0;
    const pos = hasAttrs
      ? Math.max(...node.props.map((p) => p.loc.end.offset))
      : node.loc.start.offset + node.tag.length + 1;
    cb(pos, node.loc.start.line, node.loc.start.column, true); // 调用插桩回调
  });
}

/**
 * 遍历节点并对符合条件的元素节点执行回调
 * @param nodes - 要遍历的模板子节点
 * @param visitor - 对符合条件的元素节点执行回调
 */
function walkNodes(nodes: TemplateChildNode[], visitor: (node: ElementNode) => void) {
  for (const node of nodes) {
    if (node.type === NodeTypes.ELEMENT && TAG_TYPES.has(node.tagType)) {
      visitor(node); // 执行回调
      if (node.children.length) {
        walkNodes(node.children, visitor); // 递归遍历子节点
      }
    }
  }
}

/**
 * 提取 <script> 中的 JSX/TSX 信息
 * @param ast - Vue 模板 AST
 * @returns JSX/TSX 信息，如代码、语言类型等
 */
function extractScriptJsxOptions(ast: RootNode) {
  const script = ast.children.find((n) => (n as ElementNode).tag === 'script') as ElementNode;
  if (!script) return;
  const text = (script.children[0] as TextNode)?.content;
  const lang = (script.props.find((p) => p.name === 'lang') as AttributeNode)?.value?.content;
  if (!text || !/[jt]sx/.test(lang || '')) return;
  const loc = (script.children[0] as TextNode).loc.start;
  return {
    code: text,
    isTsx: lang === 'tsx', // 是否为 TSX
    startIndex: loc.offset,
    startLine: loc.line,
    startColumn: loc.column,
  };
}

/**
 * 遍历 JSX/TSX 代码，并在每个 JSXOpeningElement 闭合前调用回调
 * @param code - 需要转换的 JSX/TSX 代码
 * @param cb - 回调函数，接收节点位置和行列信息
 * @param options - JSX/TSX 配置，如是否为 TSX 文件
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
      cb(idx, line, column + 1, false); // 调用回调
    },
  });
}

export default /* #__PURE__ */ createUnplugin(unpluginFactory);
