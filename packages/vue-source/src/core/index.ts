import { normalizePath } from '@open-editor/shared';
import { isDev } from '@open-editor/shared/node';
import { DS } from '@open-editor/shared/debugSource';
import { type UnpluginFactory, createUnplugin } from 'unplugin';
import { createFilter } from '@rollup/pluginutils';
import MagicString from 'magic-string';
import { type Options } from '../types';
import { parseID } from './parseID';
import { transformSFC } from './transformSFC';
import { transformJSX } from './transformJSX';

export const unpluginFactory: UnpluginFactory<Options | undefined> = (options = {}, meta) => {
  if (!isDev()) {
    return {
      name: 'VueSourcePlugin',
    };
  }

  const { rootDir, sourceMap, include, exclude } = resolveOptions(options);
  const filter = createFilter(include, exclude);
  const isWebpack = meta.framework === 'webpack';

  return {
    name: 'VueSourcePlugin',
    enforce: 'pre',

    transformInclude(id) {
      const { file, query } = parseID(id, rootDir);
      return query.raw == null && filter(file);
    },
    transform(code, id) {
      const { file, query, isSfc, ...jsxOpts } = parseID(id, rootDir);
      if (!isWebpack && query[DS.ID]) {
        return;
      }

      const s = new MagicString(code);

      function replace(index: number, line: number, column: number) {
        s.prependLeft(index, ` ${DS.ID}="${DS.stringify({ file, line, column })}"`);
      }

      if (isSfc) {
        transformSFC(code, replace);
      } else {
        transformJSX(code, replace, jsxOpts);
      }

      if (!s.hasChanged()) return null;

      // 返回转换后的代码和可选的 Source Map
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

export default /* #__PURE__ */ createUnplugin(unpluginFactory);
