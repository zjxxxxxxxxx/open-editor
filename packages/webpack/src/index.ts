import type webpack from 'webpack';
import type { SetupClientOptions } from '@open-editor/client';
import type { SetupServerOptions } from '@open-editor/server';
import qs from 'querystring';
import { getServerAddress } from './getServerAddress';

export type OpenEditorPluginOptions = Partial<
  SetupClientOptions & SetupServerOptions
>;

export class OpenEditorPlugin {
  opts: OpenEditorPluginOptions;

  constructor(options: OpenEditorPluginOptions = {}) {
    this.opts = options;
  }

  apply(compiler: webpack.Compiler) {
    if (
      compiler.options.mode !== 'development' ||
      (process.env.NODE_ENV && process.env.NODE_ENV !== 'development')
    ) {
      return;
    }

    const { EntryPlugin } = compiler.webpack ?? {};

    if (EntryPlugin) {
      resolveClientRuntimeEntry(this.opts, (clientRuntimeEntry) => {
        new EntryPlugin(compiler.context, clientRuntimeEntry, {
          name: undefined,
        }).apply(compiler);
      });
    } else {
      const originalEntry = compiler.options.entry;

      compiler.options.entry = () =>
        resolveClientRuntimeEntry(this.opts, (clientRuntimeEntry) => {
          return injectClientRuntimeEntry(originalEntry, clientRuntimeEntry);
        });
      compiler.hooks.entryOption.call(
        compiler.options.context,
        compiler.options.entry,
      );
    }
  }
}

function injectClientRuntimeEntry(
  originalEntry: webpack.EntryNormalized,
  clientRuntimeEntry: string,
) {
  if (typeof originalEntry === 'function') {
    return Promise.resolve(originalEntry()).then((originalEntry) => {
      return injectClientRuntimeEntry(originalEntry, clientRuntimeEntry);
    });
  }

  if (!originalEntry || typeof originalEntry !== 'object') {
    // @ts-ignore
    originalEntry = [].concat(originalEntry);
  }

  if (Array.isArray(originalEntry)) {
    return [...originalEntry, clientRuntimeEntry];
  }

  return Object.fromEntries(
    Object.entries(originalEntry).map(([key, entry]) => [
      key,
      injectClientRuntimeEntry(entry, clientRuntimeEntry),
    ]),
  );
}

async function resolveClientRuntimeEntry(
  options: OpenEditorPluginOptions,
  callback: (serverAddress: string) => any,
) {
  const { enablePointer } = options;

  return getServerAddress(options).then((serverAddress) => {
    const entry = require.resolve('../client-runtime');
    const query = qs.stringify({
      enablePointer,
      serverAddress,
    });

    return callback(`${entry}?${query}`);
  });
}
