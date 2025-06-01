import { type UnpluginFactory, createUnplugin } from 'unplugin';
import { createFilter } from '@rollup/pluginutils';
import MagicString from 'magic-string';
import { isDev } from '@open-editor/shared/node';
import { DEBUG_SOURCE, normalizePath } from '@open-editor/shared';
import { type ResolvedOptions, type Options } from '../types';
import { parseID } from './parseID';
import { transformSFC } from './transformSFC';
import { transformJSX } from './transformJSX';

export const unpluginFactory: UnpluginFactory<Options | undefined> = (options = {}, meta) => {
  if (!isDev()) {
    return {
      name: 'VueSourcePlugin',
    };
  }

  const opts = resolveOptions(options);
  const filter = createFilter(opts.include, opts.exclude);
  const isWebpack = meta.framework === 'webpack';

  return {
    name: 'VueSourcePlugin',
    enforce: 'pre',

    transformInclude(id) {
      const { file, query } = parseID(normalizePath(id));
      return query.raw == null && filter(file);
    },
    transform(code, id) {
      const s = new MagicString(code);

      const parsed = parseID(id, opts.rootDir);
      if (!isWebpack && parsed.query[DEBUG_SOURCE]) {
        return;
      }

      if (parsed.isSfc) {
        transformSFC(code, replace);
      } else {
        transformJSX(code, replace, parsed);
      }

      function replace(index: number, line: number, column: number) {
        s.prependLeft(index, ` ${DEBUG_SOURCE}="${parsed.file}:${line}:${column}"`);
      }

      if (!s.hasChanged()) return null;

      // 返回转换后的代码和可选的 Source Map
      return {
        code: s.toString(),
        map: opts.sourceMap ? s.generateMap({ source: id, file: id }) : null,
      };
    },
  };
};

function resolveOptions(opts: Options): ResolvedOptions {
  return {
    rootDir: normalizePath(opts.rootDir ?? process.cwd()),
    sourceMap: opts.sourceMap ?? false,
    include: opts.include ?? /\.(vue|jsx|tsx)$/,
    exclude: opts.exclude ?? /\/node_modules\//,
  };
}

export default /* #__PURE__ */ createUnplugin(unpluginFactory);
