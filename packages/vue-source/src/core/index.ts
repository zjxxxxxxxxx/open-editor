import { extname, relative } from 'node:path';
import { normalizePath } from '@open-editor/shared';
import { isDev } from '@open-editor/shared/node';
import { DS } from '@open-editor/shared/debugSource';
import { type UnpluginFactory, createUnplugin } from 'unplugin';
import { createFilter } from '@rollup/pluginutils';
import MagicString from 'magic-string';
import { parse, type ParserOptions } from '@babel/parser';
import { traverse } from '@babel/core';
import {
  type ElementNode,
  type AttributeNode,
  type RootNode,
  type TextNode,
  type TemplateChildNode,
  parse as vueParse,
  transform as vueTransform,
  NodeTypes,
  ElementTypes,
} from '@vue/compiler-dom';
import { type Options } from '../types';

export interface Query extends Record<string, any> {
  type?: 'script' | 'template' | 'style' | 'custom';
  raw?: string;
  [DS.INJECT_PROP]?: string;
}

export interface TransformJSXOptions {
  /**
   * 这段 `code` 在原始文件中的起始字符偏移（0-based）。
   * 如果传入的 `code` 只是整个 SFC 文件的一部分，需要设置该值才能让 node.start/node.end
   * 对应原始文件中的绝对偏移；否则保持默认 0 即可。
   */
  startIndex?: number;

  /**
   * 这段 `code` 在原始文件中的起始行号（1-based）。
   * 用于让 `node.loc.start.line` 对应到原始文件中的正确行。
   */
  startLine?: number;

  /**
   * 这段 `code` 在原始文件中的起始列号（1-based）。
   * 用于让 `node.loc.start.column` 对应到原始文件中的正确列。
   */
  startColumn?: number;

  /**
   * 如果代码是 TSX，而不仅仅是 JSX，则传 `true`。会同时打开 `typescript` 插件，以便正确解析 TSX 语法。
   */
  isTsx?: boolean;
}

const TAG_TYPES = new Set([ElementTypes.ELEMENT, ElementTypes.COMPONENT]);
const IGNORE_TAGS = new Set(['template', 'script', 'style']);

export const unpluginFactory: UnpluginFactory<Options | undefined> = (options = {}, meta) => {
  if (!isDev()) {
    return {
      name: 'VueSourcePlugin',
    };
  }

  const isVite = meta.framework === 'vite';
  const vueFiles = !isVite
    ? [
        '/runtime-core.esm-bundler.js', // Vue 3+
        '/vue.common.dev.js', // Vue 2+
        '/vue.runtime.esm.js', // Vue 2+
      ]
    : [
        '/runtime-core.esm-bundler.js', // Vue 3+
        '/deps/vue.js', // Vue 3+
      ];

  const { rootDir, sourceMap, include, exclude } = resolveOptions(options);
  const filter = createFilter(include, exclude);
  const filterVueFile = (file: string) => {
    if (file.includes('vue')) {
      console.log(file);
    }
    return file.includes('node_modules') && vueFiles.some((name) => file.includes(name));
  };

  const propCode1 = `
props = Object.assign({}, props);
const ${DS.INJECT_PROP} = props.${DS.INJECT_PROP};
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
  const searchCode1 = 'const vnode = {';
  const injectCode1 = `${propCode1}const vnode = {`;

  const propCode2 = `
const ${DS.INJECT_PROP} = mergedProps.${DS.INJECT_PROP};
if (${DS.INJECT_PROP}) {
  delete mergedProps.${DS.INJECT_PROP};
  Object.defineProperty(mergedProps, ${DS.SHADOW_PROP}, {
    get() {
      return ${DS.INJECT_PROP};
    },
    enumerable: false,
  });
}
`;
  const searchCode2 = 'const cloned = {';
  const injectCode2 = `${propCode2}const cloned = {`;

  const propCode3 = `
const ${DS.INJECT_PROP} = data && data.attrs && data.attrs.${DS.INJECT_PROP};
if (${DS.INJECT_PROP}) {
  delete data.attrs.${DS.INJECT_PROP};
  Object.defineProperty(data.attrs, ${DS.SHADOW_PROP}, {
    get() {
      return ${DS.INJECT_PROP};
    },
    enumerable: false,
  });
}
var $vnode = this;  
var $elm = undefined;
Object.defineProperty($vnode, 'elm', {
  get() {
    return $elm;
  },
  set(v) {
    $elm = v;
    if ($elm) {
      $elm.${DS.VUE_2} = $vnode;
    }
  },
  enumerable: true,
});
`;

  const searchCode3 = 'this.tag = tag;';
  const injectCode3 = `${propCode3}this.tag = tag;`;

  return {
    name: 'VueSourcePlugin',
    enforce: 'pre',

    transformInclude(id) {
      const { file, query } = parseID(id, rootDir);
      return filterVueFile(file) || (query.raw == null && filter(file));
    },
    transform(code, id) {
      const { file, isSfc, ...jsxOpts } = parseID(id, rootDir);

      if (filterVueFile(file)) {
        if (code.includes(searchCode1)) {
          return code.replace(searchCode1, injectCode1).replace(searchCode2, injectCode2);
        }
        if (code.includes(searchCode3)) {
          return code.replace(searchCode3, injectCode3);
        }
      }

      if (code.includes(DS.INJECT_PROP)) return null;

      const s = new MagicString(code);

      function replace(index: number, line: number, column: number, isTpl: boolean) {
        const ds = JSON.stringify({ file, line, column });
        const prop = isTpl ? ` :${DS.INJECT_PROP}='${ds}'` : ` ${DS.INJECT_PROP}={${ds}}`;
        s.prependLeft(index, prop);
      }

      if (isSfc) {
        transformSFC(code, replace);
      } else {
        transformJSX(code, replace, jsxOpts);
      }

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
    include: opts.include ?? /\.(vue|jsx|tsx)$/,
    exclude: opts.exclude ?? /\/node_modules\//,
  };
}

export function parseID(id: string, rootDir: string) {
  const [filename, rawQuery] = normalizePath(id).split('?', 2);
  const file = relative(rootDir, filename);
  const ext = extname(file).slice(1);
  const query = (rawQuery ? Object.fromEntries(new URLSearchParams(rawQuery)) : {}) as Query;

  return {
    file,
    isSfc: ext === 'vue',
    isJSX: ext === 'jsx',
    isTsx: ext === 'tsx',
    query,
  };
}

export function transformSFC(
  code: string,
  cb: (index: number, line: number, column: number, isTpl: boolean) => void,
) {
  const ast = vueParse(code);

  vueTransform(ast, {
    nodeTransforms: [
      (node) => {
        if (shouldTransform(node)) {
          const hasProps = node.props.length > 0;
          const index = hasProps
            ? Math.max(...node.props.map((prop) => prop.loc.end.offset))
            : node.loc.start.offset + node.tag.length + 1;

          const { line, column } = node.loc.start;
          cb(index, line, column, true);
        }
      },
    ],
  });

  const jsxOpts = extractJsxOptions(ast);
  if (jsxOpts) {
    transformJSX(jsxOpts.code, cb, jsxOpts);
  }
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
  options: TransformJSXOptions,
) {
  const { isTsx = false, startIndex = 0, startLine = 1, startColumn = 1 } = options;

  // Babel Parser 配置，包含行列及字符偏移信息
  const parserOpts: ParserOptions = {
    sourceType: 'unambiguous',
    startIndex,
    startLine,
    startColumn: startColumn - 1, // Babel 需要 0-based 的列号
    ranges: true, // 开启后会生成 node.start/node.end，以及 node.range
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

function shouldTransform(node: RootNode | TemplateChildNode): node is ElementNode {
  if (node.type !== NodeTypes.ELEMENT) {
    return false;
  }

  return TAG_TYPES.has(node.tagType) && !IGNORE_TAGS.has(node.tag);
}

function extractJsxOptions(ast: RootNode) {
  const scriptNode = (ast.children as ElementNode[]).find((node) => node.tag === 'script');
  if (!scriptNode) return;
  const codeNode = scriptNode.children[0] as TextNode | undefined;
  if (!codeNode) return;
  const langProp = scriptNode.props.find((prop) => prop.name === 'lang') as AttributeNode;
  if (!langProp) return;
  const lang = langProp.value?.content || '';
  if (!/[jt]sx/.test(lang)) return;

  const { offset, line, column } = codeNode.loc.start;
  return {
    isTsx: lang === 'tsx',
    startIndex: offset,
    startLine: line,
    startColumn: column,
    code: codeNode.content,
  };
}

export default /* #__PURE__ */ createUnplugin(unpluginFactory);
