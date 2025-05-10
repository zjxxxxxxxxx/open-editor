import { type Plugin as RollupPlugin } from 'rollup';
import { traverse, types as t } from '@babel/core';
import { parse } from '@babel/parser';
import MagicString from 'magic-string';

export interface GlslPluginOptions {
  /**
   * 是否生成 sourcemap（控制是否输出源码映射）
   *
   * @default false
   */
  sourcemap?: boolean;
}

const TAG_NAME = 'glsl'; // GLSL 模板标签标识符（用于匹配 glsl`...` 语法）
const NEWLINE_RE = /[\n\f\r]+/g; // 匹配所有换行符（包括换页符和回车符）
const BEFORE_SPACES_RE = /\s+([{}[\](),;=+\-*/])/g; // 匹配符号前的多余空格
const AFTER_SPACES_RE = /([{}[\](),;=+\-*/])\s+/g; // 匹配符号后的多余空格

export default function glslPlugin(options: GlslPluginOptions = {}): RollupPlugin {
  return {
    // 插件标识（显示在警告/错误信息中）
    name: 'rollup:glsl',

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
      traverse(ast, {
        /**
         * 处理 glsl`...` 模板字符串
         *
         * @example glsl`attribute vec2 a_position;`
         */
        TaggedTemplateExpression({ node }: { node: t.TaggedTemplateExpression }) {
          if (t.isIdentifier(node.tag) && node.tag.name === TAG_NAME) {
            // 获取原始 CSS 内容
            const { raw } = node.quasi.quasis[0].value;
            // 处理后的 CSS
            const processed = `'${raw
              // 移除所有换行符
              .replace(NEWLINE_RE, '')
              // 清理符号前多余空格
              .replace(BEFORE_SPACES_RE, '$1')
              // 清理符号后多余空格
              .replace(AFTER_SPACES_RE, '$1')
              // 去除首尾空格
              .trim()}'`;
            // 替换源码
            magicString.overwrite(node.start!, node.end!, processed);
          }
        },
      });

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
