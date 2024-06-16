import type webpack from 'webpack';
import {
  CLIENT_MODULE_ID,
  ENTRY_ESM_MATCH_RE,
  ENTRY_MATCH_RE,
} from '@open-editor/shared';
import { isDev, resolvePath as _resolvePath } from '@open-editor/shared/node';
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
   * Ignoring components in some directories, using glob pattern syntax for match
   *
   * @see https://en.wikipedia.org/wiki/Glob_(programming)
   *
   * @default '\/**\/node_modules\/**\/*'
   */
  ignoreComponents?: string | string[];
  /**
   * exit the check after opening the editor or component tree
   *
   * @default true
   */
  once?: boolean;
  /**
   * Internal server configuration
   */
  server?: {
    /**
     * enable https
     *
     * @see https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options
     */
    https?: {
      key: string;
      cert: string;
    };
  };
  /**
   * custom openEditor handler
   *
   * @default 'launch-editor'
   */
  onOpenEditor?(file: string): void;
}

const resolvePath = (path: string) => _resolvePath(path, import.meta.url);

const PLUGIN_NAME = 'OpenEditorPlugin';
const LOADER_PATH = resolvePath('./transform');

const portPromiseCache: AnyObject<Promise<number>> = {};

/**
 * development only
 */
export default class OpenEditorPlugin {
  private declare options: Options & { port?: number };

  constructor(options: Options = {}) {
    const { rootDir = options.rootDir ?? process.cwd(), onOpenEditor } =
      options;
    this.options = {
      ...options,
      rootDir,
      onOpenEditor,
    };
  }

  apply(compiler: webpack.Compiler) {
    if (!isDev()) return;

    compiler.hooks.afterEnvironment.tap(PLUGIN_NAME, () => {
      compiler.options.module.rules.push({
        test: /\/node_modules\//,
        include: ENTRY_MATCH_RE,
        use: (data: AnyObject) => {
          const { resource, compiler } = data;
          if (!compiler || compiler === 'client') {
            return {
              options: {
                ...this.options,
                isCommonjs: !ENTRY_ESM_MATCH_RE.test(resource),
              },
              loader: LOADER_PATH,
            };
          }

          return [];
        },
      });

      compiler.options.resolve.alias ||= {};
      compiler.options.resolve.alias[CLIENT_MODULE_ID] =
        resolvePath(CLIENT_MODULE_ID);
    });

    compiler.hooks.make.tapPromise(PLUGIN_NAME, async () => {
      const cacheKey = `${this.options.rootDir}${this.options.onOpenEditor}`;
      this.options.port = await (portPromiseCache[cacheKey] ||= setupServer({
        ...this.options,
        ...(this.options.server ?? {}),
      }));
    });
  }
}
