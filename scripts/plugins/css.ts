import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { type Plugin, type TransformPluginContext } from 'rollup';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import minifySelectors from 'postcss-minify-selectors';
import discardComments from 'postcss-discard-comments';
import MagicString from 'magic-string';
import { type JSXElement, type TaggedTemplateExpression, parseSync } from '@swc/core';
import Visitor from '@swc/core/Visitor';

export interface CssPluginOptions {
  /**
   * 是否为输出代码生成 sourceMap，用于在调试时将压缩／内联后的 CSS 映射回源文件位置
   * @default false
   */
  sourceMap?: boolean;
}

// 匹配多余的换行符和符号周围的空格
const CSS_COMPACT_RE = /[\n\r\f]+|\s+([{};:,!])|([{};:,!])\s+/g;

// PostCSS 处理器
const processor = postcss([
  autoprefixer(),
  minifySelectors(),
  discardComments({ removeAll: true }),
]);

export default function cssPlugin(opts: CssPluginOptions = {}): Plugin {
  return {
    name: 'rollup:css',

    transform(this: TransformPluginContext, code: string, id: string) {
      // 如果代码不含 CSS 标记或链接，则跳过处理
      if (!code.includes('css`') && !code.includes('<link')) return null;

      // 解析代码为 AST
      const ast = parseSync(code, {
        target: 'esnext',
        syntax: 'typescript',
        tsx: id.endsWith('x'),
      });

      // MagicString 实例，用于代码修改
      const magic = new MagicString(code);
      // 字节到字符索引转换器
      const toIdx = createByteToCharIndex(code, ast.span.start);

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const ctx = this; // 捕获 Rollup 插件上下文

      // SWC AST 访问者，用于遍历和修改 AST 节点
      const visitor = new (class extends Visitor {
        // 跳过 TypeScript 类型节点
        visitTsType(node) {
          return node;
        }

        // 处理 css`...` 标签模板
        visitTaggedTemplateExpression(node: TaggedTemplateExpression) {
          if (node.tag.type === 'Identifier' && node.tag.value === 'css') {
            magic.overwrite(
              toIdx(node.span.start),
              toIdx(node.span.end),
              minifyCss(node.template.quasis[0]?.cooked || ''),
            );
          }
          return node;
        }

        // 处理 <link ...> JSX 元素
        visitJSXElement(node: JSXElement) {
          if (node.opening.name.type === 'Identifier' && node.opening.name.value === 'link') {
            let rel = '';
            let href = '';
            // 提取 rel 和 href 属性
            for (const attr of node.opening.attributes) {
              if (
                attr.type === 'JSXAttribute' &&
                attr.name.type === 'Identifier' &&
                attr.value?.type === 'StringLiteral'
              ) {
                if (attr.name.value === 'rel') rel = attr.value.value;
                if (attr.name.value === 'href') href = attr.value.value;
              }
            }

            if (rel === 'stylesheet' && href) {
              const path = join(dirname(id), href);
              if (existsSync(path)) {
                magic.overwrite(
                  toIdx(node.span.start),
                  toIdx(node.span.end),
                  `<style type="text/css">{${minifyCss(readFileSync(path, 'utf-8'))}}</style>`,
                );

                ctx.addWatchFile(path); // 告知 Rollup 监听此文件
              }
            }
          }
          return node;
        }
      })();

      visitor.visitModule(ast); // 遍历模块 AST

      // 返回转换后的代码和 sourceMap
      return {
        code: magic.toString(),
        map: opts.sourceMap ? magic.generateMap({ source: id, file: id }) : null,
      };
    },
  };
}

/**
 * 处理并压缩 CSS 内容，使用链式调用
 */
function minifyCss(raw: string) {
  if (!raw) return `\`\``;

  // 先通过 PostCSS 处理，然后进行正则压缩，最后移除首尾空格
  return `\`${processor
    .process(raw)
    .css.replace(CSS_COMPACT_RE, (_, p1, p2) => {
      if (p1) return p1; // 匹配到符号前空格，只保留符号
      if (p2) return p2; // 匹配到符号后空格，只保留符号
      return ''; // 匹配到换行符，移除
    })
    .trim()}\``;
}

/**
 * 创建字节偏移量到字符偏移量的转换函数
 * 解决 SWC 的 span 是字节偏移而 MagicString 是字符偏移的问题
 */
function createByteToCharIndex(code: string, baseOffset: number) {
  const byteLens: number[] = [0]; // 累积字节长度数组
  for (let i = 0; i < code.length; i++) {
    byteLens[i + 1] = byteLens[i] + Buffer.from(code[i]).length;
  }

  // 字节偏移 → 字符偏移（二分查找）
  function byteToChar(byteOffset: number): number {
    // 将 SWC 返回的绝对字节偏移转换为相对于源代码开始的字节偏移
    const offset = byteOffset - baseOffset; // 简化命名
    let low = 0;
    let high = byteLens.length - 1;

    while (low < high) {
      const mid = (low + high) >> 1;
      if (byteLens[mid] < offset) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }

  return byteToChar;
}
