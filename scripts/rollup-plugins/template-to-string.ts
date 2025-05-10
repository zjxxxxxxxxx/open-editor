import type { Plugin } from 'rollup';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import MagicString from 'magic-string';

export interface TemplateToStringPluginOptions {
  /**
   * 是否生成 sourcemap（控制是否输出源码映射）
   *
   * @default false
   */
  sourcemap?: boolean;
}

export default function templateToStringPlugin(
  options: TemplateToStringPluginOptions = {},
): Plugin {
  return {
    name: 'rollup:template-to-string',

    renderChunk(code) {
      const magicString = new MagicString(code);
      const ast = parse(code, {
        sourceType: 'unambiguous',
      });

      traverse(ast, {
        TemplateLiteral(path) {
          const { node } = path;
          const parts: string[] = [];

          // 静态零散字符串片段
          node.quasis.forEach((q, i) => {
            // JSON.stringify 生成带双引号的普通字符串，并自动转义内部换行等
            parts.push(JSON.stringify(q.value.cooked));

            // 对应的插值表达式
            if (i < node.expressions.length) {
              const expr = node.expressions[i];
              const exprCode = code.slice(expr.start!, expr.end!);
              parts.push(exprCode);
            }
          });

          magicString.overwrite(node.start!, node.end!, parts.join(' + '));
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
