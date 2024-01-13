import type webpack from 'webpack';
import { createClient, isDev } from '@open-editor/shared/node';
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
   * set UI color mode
   *
   * @default 'system'
   */
  colorMode?: 'system' | 'light' | 'dark';
  /**
   * Disable hover effect from CSS when inspector is enabled
   *
   * @default false
   */
  disableHoverCSS?: boolean;
  /**
   * The inspector `overlay` synchronizes the UI every frame in real time, even if the browser is idle at that time.
   *
   * @default false
   */
  realtimeFrame?: boolean;
  /**
   * exit the check after opening the editor or component tree
   *
   * @default true
   */
  once?: boolean;
  /**
   * custom openEditor handler
   *
   * @default 'launch-editor'
   */
  onOpenEditor?(file: string): void;
}

/**
 * development only
 */
export default class OpenEditorPlugin {
  private declare options: Options;
  private declare compiler: webpack.Compiler;

  constructor(options: Options = {}) {
    this.options = {
      ...options,
      rootDir: options.rootDir ?? process.cwd(),
    };
  }

  apply(compiler: webpack.Compiler) {
    if (!isDev()) return;

    this.compiler = compiler;

    if (compiler.webpack?.version.startsWith('5')) {
      this.resolveClient((clientEntry) => {
        new compiler.webpack.EntryPlugin(compiler.context, clientEntry, {
          name: undefined,
        }).apply(compiler);
      });
    } else {
      const entry = compiler.options.entry;
      compiler.options.entry = () =>
        this.resolveClient((clientEntry) => {
          return this.injectClient(entry, clientEntry);
        });
      compiler.options.module.rules.push({
        test: /\.mjs$/,
        type: 'javascript/auto',
        include: /open-editor/,
      });
      compiler.hooks.entryOption.call(
        compiler.options.context!,
        compiler.options.entry,
      );
    }
  }

  async resolveClient<Callback extends (clientEntry: string) => any>(
    callback: Callback,
  ): Promise<ReturnType<Callback>> {
    const client = createClient(import.meta.url);
    getServerPort(this.options).then((port) => {
      client.generate(
        {
          ...this.options,
          port,
        },
        true,
      );
    });
    return callback(client.filename);
  }

  injectClient(entry: webpack.EntryNormalized, clientEntry: string): any {
    if (isFn(entry)) {
      return Promise.resolve(entry()).then((originalEntry) => {
        return this.injectClient(originalEntry, clientEntry);
      });
    }

    if (!entry || !isObj(entry)) {
      entry = [].concat(entry) as unknown as webpack.EntryNormalized;
    }

    if (Array.isArray(entry)) {
      return [...entry, clientEntry];
    }

    return Object.fromEntries(
      Object.entries(entry).map(([key, entry]) => [
        key,
        this.injectClient(entry, clientEntry),
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
