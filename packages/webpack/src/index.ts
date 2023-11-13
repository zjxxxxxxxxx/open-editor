import type webpack from 'webpack';
import { createRuntime, isDev } from '@open-editor/shared/node';
import { isFn, isObj } from '@open-editor/shared';
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
   * @default true
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
      displayToggle: options.displayToggle ?? true,
      onOpenEditor: options.onOpenEditor,
    };
  }

  apply(compiler: webpack.Compiler) {
    if (!isDev()) return;

    this.compiler = compiler;

    if (compiler.webpack?.version.startsWith('5')) {
      this.resolveClientRuntime((clientRuntimeEntry) => {
        new compiler.webpack.EntryPlugin(compiler.context, clientRuntimeEntry, {
          name: undefined,
        }).apply(compiler);
      });
    } else {
      compiler.options.module.rules.push({
        test: /\.mjs$/,
        type: 'javascript/auto',
        include: /open-editor/,
      });

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

    getServerPort(this.options).then((port) => {
      runtime.generate({
        port,
        rootDir: this.options.rootDir,
        displayToggle: this.options.displayToggle,
      });
    });

    return callback(runtime.filename);
  }

  injectClientRuntime(
    entry: webpack.EntryNormalized,
    clientRuntimeEntry: string,
  ): any {
    if (isFn(entry)) {
      return Promise.resolve(entry()).then((originalEntry) => {
        return this.injectClientRuntime(originalEntry, clientRuntimeEntry);
      });
    }

    if (!entry || !isObj(entry)) {
      entry = [].concat(entry) as unknown as webpack.EntryNormalized;
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
function getServerPort(options: {
  rootDir?: string;
  onOpenEditor?(file: string): void;
}) {
  return (port ||= setupServer(options));
}
