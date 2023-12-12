import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { type Plugin as RollupPlugin } from 'rollup';
import { traverse, types as t, type Node } from '@babel/core';
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

  function process(raw: string) {
    const css = processor
      .process(raw)
      .css.replace(NEWLINE_RE, '')
      .replace(BEFORE_SPACES_RE, '$1')
      .replace(AFTER_SPACES_RE, '$1');
    return `\`${css}\``;
  }

  function isEqualName(node: Node & { name: any }, name: string) {
    return t.isJSXIdentifier(node.name) && node.name.name === name;
  }

  return {
    name: 'rollup:postcss',

    transform(code, id) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const ctx = this;

      let s: MagicString;
      const setupS = () => (s ||= new MagicString(code));

      const ast = parse(code, {
        sourceType: 'unambiguous',
        plugins: id.endsWith('x') ? ['jsx', 'typescript'] : ['typescript'],
      });
      traverse(ast, {
        // postcss`...`
        TaggedTemplateExpression({ node }) {
          if (t.isIdentifier(node.tag) && node.tag.name === TAG_NAME) {
            setupS();

            const { raw } = node.quasi.quasis[0].value;
            s.overwrite(node.start!, node.end!, process(raw));
          }
        },

        // <link rel="stylesheet" href="..." />
        JSXOpeningElement(path) {
          const { node } = path;

          if (isEqualName(node, 'link')) {
            let rel = '';
            let href = '';
            node.attributes.forEach((attr) => {
              if (t.isJSXAttribute(attr) && t.isStringLiteral(attr.value)) {
                if (isEqualName(attr, 'rel')) {
                  rel = attr.value.value;
                } else if (isEqualName(attr, 'href')) {
                  href = join(id, '../', attr.value.value);
                }
              }
            });

            if (rel === 'stylesheet' && existsSync(href)) {
              setupS();

              const raw = readFileSync(href, 'utf-8');
              s.overwrite(
                node.start!,
                node.end!,
                `<style type="text/css">{${process(raw)}}</style>`,
              );
              ctx.addWatchFile(href);
            }
          }
        },
      });

      // @ts-ignore
      if (s) {
        return {
          code: s.toString(),
          map: options.sourcemap ? s.generateMap() : null,
        };
      }
    },
  };
}
