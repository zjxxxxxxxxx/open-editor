import { resolve } from 'node:path';
import { type Plugin } from 'rollup';
import { isDev, resolvePath } from '@open-editor/shared/node';
import {
  CLIENT_MODULE_ID,
  ENTRY_MATCH_RE,
  injectClient,
  normalizePath,
} from '@open-editor/shared';
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
   * Disable hover effect from CSS when inspector is enabled
   *
   * @default true
   */
  disableHoverCSS?: boolean;
  /**
   * Ignoring components in some directories, using glob pattern syntax for matching
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
   * Enable interaction between multiple iframes to be promoted to the top-level window
   *
   * @default false
   */
  crossIframe?: boolean;
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

// because many scaffolding tools rewrite the devServer part, it is impossible to add
// middleware, so it has to start another server to handle the client side request.
const portPromiseCache: AnyObject<Promise<number>> = {};

/**
 * development only
 */
export default function OpenEditorPlugin(
  options: Options = {},
): Plugin | undefined {
  if (!isDev()) {
    return {
      name: 'OpenEditorPlugin',
    };
  }

  const { onOpenEditor } = options;
  const rootDir = normalizePath(
    options.rootDir ? resolve(options.rootDir) : process.cwd(),
  );

  let port: number;

  return {
    name: 'OpenEditorPlugin',
    async buildStart() {
      const cacheKey = `${rootDir}${onOpenEditor}`;
      port = await (portPromiseCache[cacheKey] ||= setupServer({
        ...(options.server ?? {}),
        rootDir,
        onOpenEditor,
      }));
    },
    resolveId(id: string) {
      if (id === CLIENT_MODULE_ID) {
        return resolvePath(CLIENT_MODULE_ID, import.meta.url).replace(
          /\.js$/,
          '.mjs',
        );
      }
    },
    transform(code: string, id: string) {
      if (ENTRY_MATCH_RE.test(id)) {
        return injectClient(code, {
          ...options,
          rootDir,
          port,
        });
      }
    },
  };
}
