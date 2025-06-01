import { type UnpluginFactory, createUnplugin } from 'unplugin';
import { createFilter } from '@rollup/pluginutils';
import { normalizePath } from '@open-editor/shared';
import { isDev } from '@open-editor/shared/node';
import { type ResolvedOptions, type Options } from '../types';
import { transformJSX } from './transformJSX';

export const unpluginFactory: UnpluginFactory<Options | undefined> = (options = {}) => {
  if (!isDev()) {
    return {
      name: 'ReactSourcePlugin',
    };
  }

  const opts = resolveOptions(options);
  const filter = createFilter(opts.include, opts.exclude);

  return {
    name: 'ReactSourcePlugin',
    enforce: 'pre',

    transformInclude(id) {
      return filter(normalizePath(id));
    },
    transform(code, id) {
      return transformJSX(code, normalizePath(id), opts);
    },
  };
};

function resolveOptions(opts: Options): ResolvedOptions {
  return {
    rootDir: normalizePath(opts.rootDir ?? process.cwd()),
    sourceMap: opts.sourceMap ?? false,
    include: opts.include ?? /\.(jsx|tsx)$/,
    exclude: opts.exclude ?? /\/node_modules\//,
  };
}

export default /* #__PURE__ */ createUnplugin(unpluginFactory);
