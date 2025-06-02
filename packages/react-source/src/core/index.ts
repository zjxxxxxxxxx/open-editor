import { normalizePath } from '@open-editor/shared';
import { DS } from '@open-editor/shared/debugSource';
import { isDev } from '@open-editor/shared/node';
import { type UnpluginFactory, createUnplugin } from 'unplugin';
import { createFilter } from '@rollup/pluginutils';
import MagicString from 'magic-string';
import { type Options } from '../types';
import { transformJSX } from './transformJSX';
import { parseID } from './parseID';

export const unpluginFactory: UnpluginFactory<Options | undefined> = (options = {}) => {
  if (!isDev()) {
    return {
      name: 'ReactSourcePlugin',
    };
  }

  const { rootDir, sourceMap, include, exclude } = resolveOptions(options);
  const filter = createFilter(include, exclude);

  return {
    name: 'ReactSourcePlugin',
    enforce: 'pre',

    transformInclude(id) {
      const { file } = parseID(id, rootDir);
      return filter(file);
    },
    transform(code, id) {
      const { file, ...jsxOpts } = parseID(id, rootDir);

      const s = new MagicString(code);

      function replace(index: number, line: number, column: number) {
        s.prependLeft(index, ` ${DS.ID}="${DS.stringify({ file, line, column })}"`);
      }

      transformJSX(code, replace, jsxOpts);

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
    include: opts.include ?? /\.(jsx|tsx)$/,
    exclude: opts.exclude ?? /\/node_modules\//,
  };
}

export default /* #__PURE__ */ createUnplugin(unpluginFactory);
