import type { Plugin as RollupPlugin } from 'rollup';
import { traverse, types as t } from '@babel/core';
import { parse } from '@babel/parser';
import MagicString from 'magic-string';

const TAG_NAME = 'html';
const NEWLINE_RE = /[\n\f\r]+/g;
const MULTIPLE_SPACES_RE = /\s{2,}/g;

export interface Options {
  sourcemap?: boolean;
}

export default function htmlPlugin(options: Options): RollupPlugin {
  return {
    name: 'rollup:html',
    transform(code) {
      let s: MagicString | undefined;

      const ast = parse(code, {
        sourceType: 'unambiguous',
        plugins: ['typescript'],
      });
      traverse(ast, {
        TaggedTemplateExpression({ node }) {
          if (t.isIdentifier(node.tag) && node.tag.name === TAG_NAME) {
            s ||= new MagicString(code);

            const { start, end } = node.loc!;
            const { raw } = node.quasi.quasis[0].value;
            const html = raw
              .replace(NEWLINE_RE, '')
              .replace(MULTIPLE_SPACES_RE, ' ');
            s.overwrite(start.index, end.index, `\`${html}\``);
          }
        },
      });

      return {
        code: s?.toString(),
        map: options.sourcemap ? s?.generateMap() : null,
      };
    },
  };
}
