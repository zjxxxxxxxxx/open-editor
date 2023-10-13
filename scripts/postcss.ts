import type { Plugin } from 'rollup';
import { traverse, types as t } from '@babel/core';
import { parse } from '@babel/parser';
import MagicString from 'magic-string';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';

const TAG_NAME = 'postcss';

export default function postssPlugin(): Plugin {
  const processor = postcss([autoprefixer()]);

  return {
    name: 'rollup:postss',
    transform(code) {
      let s: MagicString | undefined;

      const ast = parse(code, {
        sourceType: 'unambiguous',
        plugins: ['typescript'],
      });
      traverse(ast, {
        VariableDeclarator(path) {
          const { init } = path.node;
          if (
            t.isTaggedTemplateExpression(init) &&
            (init.tag as any).name === TAG_NAME
          ) {
            if (!s) {
              s = new MagicString(code);
            }

            const template = init.quasi.quasis[0].value.raw;
            const { start, end } = init.loc!;
            const { css } = processor.process(template);
            const minifyCSS = css.replace(/\n/g, '').replace(/ +/g, ' ');

            s.overwrite(start.index, end.index, `\`${minifyCSS}\``);
          }
        },
      });

      return s?.toString();
    },
  };
}
