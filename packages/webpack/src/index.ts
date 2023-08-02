import type webpack from 'webpack';
import { getServerAddress } from './getServerAddress';
import {
  clientRuntimeFilename,
  generateClientRuntime,
} from './generateClientRuntime';

export interface Options {
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

export default class OpenEditorPlugin {
  options: Required<Options>;
  compiler!: webpack.Compiler;

  constructor(options: Options = {}) {
    this.options = {
      enablePointer: options.enablePointer ?? false,
      rootDir: options.rootDir ?? process.cwd(),
    };
  }

  apply(compiler: webpack.Compiler) {
    this.compiler = compiler;

    if (
      compiler.options.mode !== 'development' ||
      (process.env.NODE_ENV && process.env.NODE_ENV !== 'development')
    ) {
      return;
    }

    const { EntryPlugin } = compiler.webpack ?? {};

    if (EntryPlugin) {
      this.resolveClientRuntime((clientRuntimeEntry) => {
        new EntryPlugin(compiler.context, clientRuntimeEntry, {
          name: undefined,
        }).apply(compiler);
      });
    } else {
      const originalEntry = compiler.options.entry;

      compiler.options.entry = () =>
        this.resolveClientRuntime((clientRuntimeEntry) => {
          return this.injectClientRuntime(originalEntry, clientRuntimeEntry);
        });
      compiler.hooks.entryOption.call(
        compiler.options.context!,
        compiler.options.entry,
      );
    }
  }

  async resolveClientRuntime<
    Callback extends (clientRuntimeEntry: string) => any,
  >(callback: Callback): Promise<ReturnType<Callback>> {
    const serverAddress = await getServerAddress(this.options);
    generateClientRuntime({
      serverAddress,
      ...this.options,
    });

    return callback(clientRuntimeFilename);
  }

  injectClientRuntime(
    originalEntry: webpack.EntryNormalized,
    clientRuntimeEntry: string,
  ): any {
    if (typeof originalEntry === 'function') {
      return Promise.resolve(originalEntry()).then((originalEntry) => {
        return this.injectClientRuntime(originalEntry, clientRuntimeEntry);
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
        this.injectClientRuntime(entry, clientRuntimeEntry),
      ]),
    );
  }
}
