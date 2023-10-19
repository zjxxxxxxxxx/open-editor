import type { Plugin as RollupPlugin } from 'rollup';
import { traverse, types as t } from '@babel/core';
import { parse } from '@babel/parser';
import MagicString from 'magic-string';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import minifySelectors from 'postcss-minify-selectors';

const TAG_NAME = 'postcss';
const NEWLINE_RE = /[\n\f\r]+/g;
const BEFORE_SPACES_RE = /\s+([{};:!])/g;
const AFTER_SPACES_RE = /([{};:,])\s+/g;

export interface Options {
  sourcemap?: boolean;
}

export default function postssPlugin(options: Options): RollupPlugin {
  const processor = postcss(autoprefixer(), <postcss.Plugin>minifySelectors());

  return {
    name: 'rollup:postcss',
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
            const css = processor
              .process(raw)
              .css.replace(NEWLINE_RE, '')
              .replace(BEFORE_SPACES_RE, '$1')
              .replace(AFTER_SPACES_RE, '$1');
            s.overwrite(start.index, end.index, `\`${css}\``);
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
