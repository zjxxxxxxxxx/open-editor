import type webpack from 'webpack';
import qs from 'querystring';
import { getServerAddress } from './getServerAddress';

export interface OpenEditorWebpackPluginOptions {
  /**
   * render the pointer into the browser
   *
   * @default false
   */
  enablePointer?: boolean;

  /**
   * source rootDir path
   *
   * @default process.cwd()
   */
  rootDir?: string;
}

export class OpenEditorWebpackPlugin {
  opts: OpenEditorWebpackPluginOptions;

  constructor(options: OpenEditorWebpackPluginOptions = {}) {
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
      resolveClientRuntime(this.opts, (clientRuntimeEntry) => {
        new EntryPlugin(compiler.context, clientRuntimeEntry, {
          name: undefined,
        }).apply(compiler);
      });
    } else {
      const originalEntry = compiler.options.entry;

      compiler.options.entry = () =>
        resolveClientRuntime(this.opts, (clientRuntimeEntry) => {
          return injectClientRuntime(originalEntry, clientRuntimeEntry);
        });
      compiler.hooks.entryOption.call(
        compiler.options.context!,
        compiler.options.entry,
      );
    }
  }
}

async function resolveClientRuntime<
  Callback extends (clientRuntimeEntry: string) => any,
>(
  options: OpenEditorWebpackPluginOptions,
  callback: Callback,
): Promise<ReturnType<Callback>> {
  const { enablePointer } = options;

  const entry = require.resolve('../client-runtime');
  const serverAddress = await getServerAddress(options);
  const query = qs.stringify({
    enablePointer,
    serverAddress,
  });

  return callback(`${entry}?${query}`);
}

function injectClientRuntime(
  originalEntry: webpack.EntryNormalized,
  clientRuntimeEntry: string,
): any {
  if (typeof originalEntry === 'function') {
    return Promise.resolve(originalEntry()).then((originalEntry) => {
      return injectClientRuntime(originalEntry, clientRuntimeEntry);
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
      injectClientRuntime(entry, clientRuntimeEntry),
    ]),
  );
}
