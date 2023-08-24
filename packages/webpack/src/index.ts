import type webpack from 'webpack';
import { createRuntime } from '@open-editor/shared/node';
import { setupServer } from '@open-editor/server';

export interface Options {
  /**
   * source rootDir path
   *
   * @default process.cwd()
   */
  rootDir?: string;

  /**
   * render the toggle into the browser
   *
   * @default false
   */
  displayToggle?: boolean;

  /**
   * custom openEditor handler
   */
  onOpenEditor?(file: string): void;
}

/**
 * development only
 */
export default class OpenEditorPlugin {
  options: Required<Pick<Options, 'displayToggle' | 'rootDir'>> & Options;
  compiler!: webpack.Compiler;

  constructor(options: Options = {}) {
    this.options = {
      rootDir: options.rootDir ?? process.cwd(),
      displayToggle: options.displayToggle ?? false,
      onOpenEditor: options.onOpenEditor,
    };
  }

  apply(compiler: webpack.Compiler) {
    if (
      compiler.options.mode !== 'development' ||
      (process.env.NODE_ENV && process.env.NODE_ENV !== 'development')
    ) {
      return;
    }

    this.compiler = compiler;

    if (compiler.webpack?.version.startsWith('5')) {
      this.resolveClientRuntime((clientRuntimeEntry) => {
        new compiler.webpack.EntryPlugin(compiler.context, clientRuntimeEntry, {
          name: undefined,
        }).apply(compiler);
      });
    } else {
      const entry = compiler.options.entry;
      compiler.options.entry = () =>
        this.resolveClientRuntime((clientRuntimeEntry) => {
          return this.injectClientRuntime(entry, clientRuntimeEntry);
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
    const runtime = createRuntime(import.meta.url);
    runtime.generate({
      port: await getServerPort(this.options),
      rootDir: this.options.rootDir,
      displayToggle: this.options.displayToggle,
    });
    return callback(runtime.filename);
  }

  injectClientRuntime(
    entry: webpack.EntryNormalized,
    clientRuntimeEntry: string,
  ): any {
    if (typeof entry === 'function') {
      return Promise.resolve(entry()).then((originalEntry) => {
        return this.injectClientRuntime(originalEntry, clientRuntimeEntry);
      });
    }

    if (!entry || typeof entry !== 'object') {
      // @ts-ignore
      entry = [].concat(entry);
    }

    if (Array.isArray(entry)) {
      return [...entry, clientRuntimeEntry];
    }

    return Object.fromEntries(
      Object.entries(entry).map(([key, entry]) => [
        key,
        this.injectClientRuntime(entry, clientRuntimeEntry),
      ]),
    );
  }
}

// because many scaffolding tools rewrite the devServer part, it is impossible to add
// middleware, so it has to start another server to handle the client side request.
let port: Promise<number>;
export function getServerPort(options: {
  rootDir?: string;
  onOpenEditor?(file: string): void;
}) {
  if (!port) {
    port = setupServer(options);
  }
  return port;
}
