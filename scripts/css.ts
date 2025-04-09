/* -------------------------- 模块导入 -------------------------- */
// 路径处理
import { join } from 'node:path';
// 文件系统操作
import { existsSync, readFileSync } from 'node:fs';

// Rollup 插件类型
import { type Plugin as RollupPlugin, type TransformPluginContext } from 'rollup';

// Babel 核心工具
import { traverse, types as t, type Node } from '@babel/core';
// AST 解析器
import { parse } from '@babel/parser';

// 源码操作库（支持 sourcemap）
import MagicString from 'magic-string';

// CSS 处理器
import postcss from 'postcss';
// 自动前缀
import autoprefixer from 'autoprefixer';
// 选择器压缩
import minifySelectors from 'postcss-minify-selectors';
// 注释清理
import discardComments from 'postcss-discard-comments';

/* -------------------------- 常量定义 -------------------------- */
const TAG_NAME = 'css'; // CSS 模板标签标识符（用于匹配 css`...` 语法）
const NEWLINE_RE = /[\n\f\r]+/g; // 匹配所有换行符（包括换页符和回车符）
const BEFORE_SPACES_RE = /\s+([{};:!])/g; // 匹配符号前的多余空格（如 {  ; 前的空格）
const AFTER_SPACES_RE = /([{};:,])\s+/g; // 匹配符号后的多余空格（如 }  ; 后的空格）

/* -------------------------- 类型定义 -------------------------- */
export interface Options {
  /**
   * 是否生成 sourcemap（控制是否输出源码映射）
   *
   * @default false
   */
  sourcemap?: boolean;
}

/* -------------------------- 核心插件逻辑 -------------------------- */
/**
 * Rollup 插件入口函数
 *
 * @param options - 插件配置项
 *
 * @returns 符合 Rollup 规范的插件对象
 */
export default function cssPlugin(options: Options): RollupPlugin {
  // 初始化 CSS 处理流水线
  const processor = createProcessor();

  return {
    // 插件标识（显示在警告/错误信息中）
    name: 'rollup:css',

    /**
     * 转换钩子函数
     *
     * @param code - 源代码内容
     * @param id - 文件路径标识
     */
    transform(code, id) {
      // 创建可编辑源码对象
      const magicString = new MagicString(code);
      const ast = parse(code, {
        // 自动判断模块类型
        sourceType: 'unambiguous',
        plugins: id.endsWith('x')
          ? // JSX 文件需要额外插件
            ['jsx', 'typescript']
          : // 普通 TypeScript 文件
            ['typescript'],
      });

      // 遍历 AST 并进行转换操作
      traverse(ast, createAstHandlers(this, magicString, processor, id));

      // 返回处理结果（仅在代码有变更时返回）
      return magicString.hasChanged()
        ? {
            code: magicString.toString(),
            map: options.sourcemap ? magicString.generateMap() : null, // 按需生成 sourcemap
          }
        : null;
    },
  };
}

/* -------------------------- CSS处理器配置 -------------------------- */
/**
 * 创建 PostCSS 处理流水线
 *
 * @returns 配置好的 PostCSS 处理器
 */
function createProcessor() {
  return postcss([
    // 自动添加浏览器前缀
    autoprefixer(),
    // 压缩 CSS 选择器
    minifySelectors() as postcss.Plugin,
    // 清除所有注释（包括 /*! 重要注释 */）
    discardComments({ removeAll: true }),
  ]);
}

/* -------------------------- AST遍历处理器 -------------------------- */

/**
 * 创建 AST 转换处理器
 *
 * @param ctx - Rollup 插件上下文（用于报错/监听文件）
 * @param magicString - 源码操作对象
 * @param processor - PostCSS 处理器
 * @param id - 当前文件路径
 */
function createAstHandlers(
  ctx: TransformPluginContext,
  magicString: MagicString,
  processor: postcss.Processor,
  id: string,
) {
  return {
    /**
     * 处理 css`...` 模板字符串
     *
     * @example css`.class { color: red; }`
     */
    TaggedTemplateExpression({ node }: { node: t.TaggedTemplateExpression }) {
      if (t.isIdentifier(node.tag) && node.tag.name === TAG_NAME) {
        const { raw } = node.quasi.quasis[0].value; // 获取原始 CSS 内容
        const processed = processCssContent(raw, processor); // 处理后的 CSS
        magicString.overwrite(node.start!, node.end!, processed); // 替换源码
      }
    },

    /**
     * 转换 <link> 标签为 <style> 标签
     *
     * @example <link rel="stylesheet" href="style.css" />
     */
    JSXOpeningElement(path: { node: t.JSXOpeningElement }) {
      const { node } = path;
      if (!isJsxElementMatch(node, 'link')) return; // 过滤非 link 标签

      let rel = '';
      let href = '';
      // 遍历属性获取 rel 和 href
      node.attributes.forEach((attr) => {
        if (t.isJSXAttribute(attr) && t.isStringLiteral(attr.value)) {
          if (isJsxElementMatch(attr, 'rel')) rel = attr.value.value;
          if (isJsxElementMatch(attr, 'href')) href = join(id, '../', attr.value.value); // 解析相对路径
        }
      });

      // 处理样式表链接
      if (rel === 'stylesheet' && existsSync(href)) {
        const rawCss = readFileSync(href, 'utf-8'); // 读取 CSS 文件内容
        const processed = `<style type="text/css">{${processCssContent(rawCss, processor)}}</style>`;
        magicString.overwrite(node.start!, node.end!, processed); // 替换为 style 标签
        ctx.addWatchFile(href); // 添加文件监听依赖
      }
    },
  };
}

/* -------------------------- 工具函数 -------------------------- */
/**
 * 判断 JSX 元素是否匹配指定标签名
 *
 * @param node - AST 节点
 * @param name - 目标标签名
 */
function isJsxElementMatch(node: Node & { name: any }, name: string) {
  return t.isJSXIdentifier(node.name) && node.name.name === name;
}

/**
 * CSS 内容处理流水线
 *
 * @param raw - 原始 CSS 内容
 * @param processor - PostCSS 处理器
 *
 * @returns 处理后的 CSS 字符串（已压缩优化）
 */
function processCssContent(raw: string, processor: postcss.Processor) {
  // 转换为模板字符串
  return `\`${processor
    .process(raw)
    // 移除所有换行符
    .css.replace(NEWLINE_RE, '')
    // 清理符号前多余空格
    .replace(BEFORE_SPACES_RE, '$1')
    // 清理符号后多余空格
    .replace(AFTER_SPACES_RE, '$1')
    // 去除首尾空格
    .trim()}\``;
}
