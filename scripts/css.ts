import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { type Plugin as RollupPlugin } from 'rollup';
import { traverse, types as t, type Node } from '@babel/core';
import { parse } from '@babel/parser';
import MagicString from 'magic-string';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import minifySelectors from 'postcss-minify-selectors';
import discardComments from 'postcss-discard-comments';

/* -------------------------- 常量定义 -------------------------- */
const TAG_NAME = 'css'; // CSS模板标签标识
const NEWLINE_RE = /[\n\f\r]+/g; // 匹配换行符
const BEFORE_SPACES_RE = /\s+([{};:!])/g; // 匹配符号前多余空格
const AFTER_SPACES_RE = /([{};:,])\s+/g; // 匹配符号后多余空格

/* -------------------------- 类型定义 -------------------------- */
export interface Options {
  /**
   * 是否生成sourcemap
   * @default false
   */
  sourcemap?: boolean;
}

/* -------------------------- CSS处理器初始化 -------------------------- */
let processor: postcss.Processor;

/* -------------------------- 核心插件逻辑 -------------------------- */
export default function cssPlugin(options: Options): RollupPlugin {
  // 初始化CSS处理器（自动补全+选择器压缩）
  processor ||= postcss(
    autoprefixer(),
    minifySelectors() as postcss.Plugin,
    discardComments({ removeAll: true }), // 删除所有注释，包括/*!重要注释*/
  );

  /**
   * 转换CSS内容
   * @param raw 原始CSS字符串
   * @returns 处理后的模板字符串表达式
   */
  const transformCssContent = (raw: string) => {
    const processed = processor
      .process(raw)
      .css.replace(NEWLINE_RE, '') // 移除换行
      .replace(BEFORE_SPACES_RE, '$1') // 清理符号前空格
      .replace(AFTER_SPACES_RE, '$1'); // 清理符号后空格
    return `\`${processed.trim()}\``; // 转换为模板字符串
  };

  /**
   * 判断JSX元素名称是否匹配
   * @param node JSX元素节点
   * @param name 预期名称
   */
  const isJsxElementMatch = (node: Node & { name: any }, name: string) =>
    t.isJSXIdentifier(node.name) && node.name.name === name;

  return {
    name: 'rollup:css',

    transform(code, id) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const ctx = this;

      let magicString: MagicString;

      /**
       * 延迟初始化MagicString实例
       */
      const initMagicString = () => (magicString ||= new MagicString(code));

      // 解析AST（支持JSX和TypeScript语法）
      const ast = parse(code, {
        sourceType: 'unambiguous',
        plugins: id.endsWith('x') ? ['jsx', 'typescript'] : ['typescript'],
      });

      // AST遍历逻辑
      traverse(ast, {
        /**
         * 处理css`...`模板字符串
         * @example css`.class { color: red; }`
         */
        TaggedTemplateExpression({ node }) {
          if (t.isIdentifier(node.tag) && node.tag.name === TAG_NAME) {
            initMagicString();
            const { raw } = node.quasi.quasis[0].value;
            magicString.overwrite(node.start!, node.end!, transformCssContent(raw));
          }
        },

        /**
         * 处理<link>标签转换
         * @example <link rel="stylesheet" href="style.css" />
         */
        JSXOpeningElement(path) {
          const { node } = path;
          if (!isJsxElementMatch(node, 'link')) return;

          // 提取link标签属性
          let rel = '';
          let href = '';
          node.attributes.forEach((attr) => {
            if (t.isJSXAttribute(attr) && t.isStringLiteral(attr.value)) {
              if (isJsxElementMatch(attr, 'rel')) {
                rel = attr.value.value;
              } else if (isJsxElementMatch(attr, 'href')) {
                href = join(id, '../', attr.value.value);
              }
            }
          });

          // 转换样式表链接为内联样式
          if (rel === 'stylesheet' && existsSync(href)) {
            initMagicString();
            const rawCss = readFileSync(href, 'utf-8');
            magicString.overwrite(
              node.start!,
              node.end!,
              `<style type="text/css">{${transformCssContent(rawCss)}}</style>`,
            );
            ctx.addWatchFile(href); // 添加文件监听
          }
        },
      });

      // 返回处理结果
      if (magicString!) {
        return {
          code: magicString.toString(),
          map: options.sourcemap ? magicString.generateMap() : null,
        };
      }
    },
  };
}
