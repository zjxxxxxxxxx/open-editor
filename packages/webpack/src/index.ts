import { resolve } from 'node:path';
import type webpack from 'webpack';
import { isDev, resolvePath } from '@open-editor/shared/node';
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
   * @default true
   */
  disableHoverCSS?: boolean;
  /**
   * The inspector remains rendered when the browser is idle
   *
   * @default true
   */
  retainFrame?: boolean;
  /**
   * Ignoring components in some directories, using glob pattern syntax for matching
   *
   * @see https://en.wikipedia.org/wiki/Glob_(programming)
   *
   * @default '\/node_modules\/**\/*'
   */
  ignoreComponents?: string | string[];
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

const PLUGIN_NAME = 'OpenEditorPlugin';
const LOADER_PATH = resolvePath('./transform', import.meta.url);

const portPromiseCache: AnyObject<Promise<number>> = {};

/**
 * development only
 */
export default class OpenEditorPlugin {
  private declare options: Options & {
    port?: number;
  };

  constructor(options: Options = {}) {
    const { rootDir = options.rootDir ?? process.cwd(), onOpenEditor } =
      options;
    this.options = {
      ...options,
      rootDir: resolve(rootDir),
      onOpenEditor,
    };
  }

  apply(compiler: webpack.Compiler) {
    if (!isDev()) return;

    compiler.hooks.afterEnvironment.tap(PLUGIN_NAME, () => {
      let resource: string;

      compiler.options.module.rules.push({
        test: /\.[cm]?[tj]sx?$/,
        exclude: /\/(node_modules|.next|.nuxt)\//,
        use: (opts: AnyObject) => {
          if (resource ? resource === opts.resource : opts.resource) {
            resource = opts.resource;

            return {
              options: this.options,
              loader: LOADER_PATH,
            };
          }

          return [];
        },
      });

      compiler.options.module.rules.push({
        test: /\/node_modules\/@open-editor\//,
        type: 'javascript/auto',
      });
    });

    compiler.hooks.make.tapPromise(PLUGIN_NAME, async () => {
      const cacheKey = `${this.options.rootDir}${this.options.onOpenEditor}`;
      this.options.port = await (portPromiseCache[cacheKey] ||= setupServer(
        this.options,
      ));
    });
  }
}
